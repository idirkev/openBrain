# Open Brain Migration Guide

**Current → Document-Based System**

This guide helps you migrate from Open Brain's current database-centric approach to the new document-based system defined in `PLAYBOOK.md`, integrating patterns from idirnet while preserving your existing data.

---

## Executive Summary

| Aspect | Current | New System |
|--------|---------|------------|
| **Primary Storage** | Supabase PostgreSQL | Git + Supabase (hybrid) |
| **Content Format** | JSON records | Markdown + YAML frontmatter |
| **Organization** | Tables/columns | Folder structure + links |
| **Search** | Database queries | Hybrid: DB + file search |
| **Access Control** | Row-level security | 4-tier system + 404-not-403 |
| **Knowledge Links** | References via IDs | Wikilinks `[[...]]` + graph |

**Migration Complexity**: Medium (2-3 sprints)  
**Risk Level**: Low (parallel systems during transition)  
**Rollback Plan**: Keep database as source of truth until Phase 3

---

## Phase 1: Assessment (Week 1)

### 1.1 Inventory Current Data

```bash
# List all tables in your Supabase project
supabase db dump --schema-only > current_schema.sql

# Identify content types
# - team_members
# - meeting_notes  
# - decisions
# - projects
# - tasks
# - stakeholders
# etc.
```

**Migration Worksheet**: Map each table to document types

| Current Table | Document Type | Migration Priority | Notes |
|---------------|---------------|-------------------|-------|
| `team_members` | `person` | High | Core entity |
| `meeting_notes` | `meeting` | High | High volume |
| `decisions` | `decision` | High | Need audit trail |
| `projects` | `project` | Medium | Link to MOC |
| `stakeholders` | `stakeholder` | Medium | Cross-reference |
| `tasks` | `request` | Low | Keep in DB for now |

### 1.2 Identify Custom Fields

For each table, list non-standard fields that need frontmatter mapping:

```yaml
# Example: Current meeting_notes table has:
# - meeting_type (standup, review, decision)
# - attendees (array of UUIDs)
# - agenda_items (JSONB)
# - decisions_made (array)
# - action_items (JSONB)

# Maps to frontmatter:
type: meeting
meeting_type: standup
attendees:
  - "[[person:alice]]"
  - "[[person:bob]]"
decisions:
  - "[[decision:2024-01-15-api-choice]]"
```

### 1.3 Check File Storage

```sql
-- List existing storage buckets
SELECT name FROM storage.buckets;

-- Check for existing documents
SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'documents';
```

---

## Phase 2: Infrastructure Setup (Week 2)

### 2.1 Create Git Repository Structure

```bash
# Initialize document repository
cd /path/to/openbrain
git init documents/
cd documents

# Create folder structure per PLAYBOOK.md
mkdir -p 00-fleeting/01-daily
mkdir -p 00-fleeting/02-meetings
mkdir -p 10-literature/01-articles
mkdir -p 10-literature/02-books
mkdir -p 10-literature/03-podcasts
mkdir -p 10-literature/04-videos
mkdir -p 20-permanent/01-concepts
mkdir -p 20-permanent/02-patterns
mkdir -p 20-permanent/03-methods
mkdir -p 30-projects/{active,planning,complete}
mkdir -p 40-structure
mkdir -p 50-requests/{open,in-progress,blocked,closed}
mkdir -p 60-archive
mkdir -p 99-meta/templates

# Create .gitignore
cat > .gitignore << 'EOF'
# Private files
**/private/
**/local/
.env

# Temporary
*.tmp
*.draft
.DS_Store

# Keep structure
!.gitkeep
EOF

# Add README
cat > README.md << 'EOF'
# Open Brain Documents

Personal knowledge management following Zettelkasten principles.

## Quick Links

- [Today's Capture](00-fleeting/01-daily/$(date +%Y-%m-%d).md)
- [Active Projects](30-projects/active/)
- [Open Requests](50-requests/open/)
- [Templates](99-meta/templates/)

## Document Types

- `00-fleeting/` - Quick captures, daily notes, meeting notes
- `10-literature/` - Source notes, references, highlights
- `20-permanent/` - Evergreen notes, concepts, patterns
- `30-projects/` - Active work, goals, deliverables
- `40-structure/` - Maps of content, indexes, navigation
- `50-requests/` - Formal asks with acceptance criteria
- `60-archive/` - Completed/deprecated content

See [PLAYBOOK.md](../PLAYBOOK.md) for full guidelines.
EOF

git add .
git commit -m "Initial document structure"
```

### 2.2 Set Up Supabase Storage Sync

```typescript
// lib/document-sync.ts
// Sync between Git repo and Supabase storage

import { createClient } from '@supabase/supabase-js'
import { readFile, readdir } from 'fs/promises'
import { join, relative } from 'path'
import matter from 'gray-matter'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface DocumentRecord {
  path: string
  type: string
  title: string
  content: string
  frontmatter: Record<string, any>
  updated_at: string
  checksum: string
}

export async function syncDocumentsToDatabase(repoPath: string) {
  const documents: DocumentRecord[] = []
  
  async function scanDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      const relativePath = relative(repoPath, fullPath)
      
      if (entry.isDirectory()) {
        await scanDir(fullPath)
      } else if (entry.name.endsWith('.md')) {
        const content = await readFile(fullPath, 'utf-8')
        const parsed = matter(content)
        
        documents.push({
          path: relativePath,
          type: parsed.data.type || 'unknown',
          title: parsed.data.title || entry.name.replace('.md', ''),
          content: parsed.content,
          frontmatter: parsed.data,
          updated_at: parsed.data.updated || new Date().toISOString(),
          checksum: await computeChecksum(content)
        })
      }
    }
  }
  
  await scanDir(repoPath)
  
  // Batch upsert to database
  const { error } = await supabase
    .from('documents')
    .upsert(documents, { onConflict: 'path' })
    
  if (error) throw error
  
  return documents.length
}

async function computeChecksum(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
```

### 2.3 Database Schema Updates

```sql
-- Add documents table (parallel to existing tables)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT UNIQUE NOT NULL,  -- Git path: 20-permanent/01-concepts/api-design.md
  type TEXT NOT NULL CHECK (type IN (
    'fleeting', 'literature', 'permanent', 
    'project', 'structure', 'request',
    'decision', 'risk', 'milestone', 'spec',
    'meeting', 'person', 'stakeholder',
    'sent', 'budget', 'invoice', 'funding',
    'legal', 'compliance', 'contract',
    'insight', 'ai_save', 'nutrition', 'health', 'home'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  frontmatter JSONB NOT NULL DEFAULT '{}',
  access_level TEXT NOT NULL DEFAULT 'team' 
    CHECK (access_level IN ('public', 'network', 'team', 'leadership')),
  
  -- TSM Framework
  tsm_stack TEXT CHECK (tsm_stack IN ('global', 'internal', 'external')),
  tsm_node TEXT,
  
  -- Tracking
  status TEXT,
  assigned_to UUID REFERENCES team_members(id),
  due_date DATE,
  
  -- Sync metadata
  checksum TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS with 404-not-403 pattern
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users only see documents at their access level or below
CREATE POLICY document_access ON documents
  FOR SELECT
  USING (
    CASE auth.jwt()->>'role'
      WHEN 'leadership' THEN true
      WHEN 'team' THEN access_level IN ('public', 'network', 'team')
      WHEN 'network' THEN access_level IN ('public', 'network')
      ELSE access_level = 'public'
    END
  );

-- Index for performance
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_access ON documents(access_level);
CREATE INDEX idx_documents_tsm ON documents(tsm_stack, tsm_node);
CREATE INDEX idx_documents_frontmatter ON documents USING GIN(frontmatter);

-- Links table for knowledge graph
CREATE TABLE document_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path TEXT REFERENCES documents(path) ON DELETE CASCADE,
  target_path TEXT REFERENCES documents(path) ON DELETE CASCADE,
  link_type TEXT DEFAULT 'reference' 
    CHECK (link_type IN ('reference', 'supports', 'contradicts', 'extends', 'implements')),
  context TEXT,  -- Surrounding text for preview
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_path, target_path, link_type)
);

CREATE INDEX idx_links_source ON document_links(source_path);
CREATE INDEX idx_links_target ON document_links(target_path);
```

---

## Phase 3: Content Migration (Weeks 3-4)

### 3.1 Migrate Team Members → Person Documents

```typescript
// scripts/migrate-team-members.ts
import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SERVICE_ROLE_KEY!)

export async function migrateTeamMembers() {
  const { data: members, error } = await supabase
    .from('team_members')
    .select('*')
  
  if (error) throw error
  
  for (const member of members) {
    // Generate slug
    const slug = member.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    const content = `---
type: person
title: "${member.name}"
role: "${member.role || 'Team Member'}"
access_level: team
joined_date: "${member.created_at}"
email: "${member.email || ''}"
${member.department ? `department: "${member.department}"` : ''}
${member.location ? `location: "${member.location}"` : ''}
${member.timezone ? `timezone: "${member.timezone}"` : ''}
created: "${member.created_at}"
updated: "${new Date().toISOString()}"
---

# ${member.name}

## Role
${member.role || 'Team Member'}${member.department ? ` in ${member.department}` : ''}

## Contact
- Email: ${member.email || 'N/A'}
${member.slack_id ? `- Slack: <@${member.slack_id}>` : ''}

## Working Preferences
${member.working_hours ? `- Hours: ${member.working_hours}` : ''}
${member.communication_preference ? `- Communication: ${member.communication_preference}` : ''}

## Notes
<!-- Add personal context, collaboration notes, etc. -->

## Related
- [[structure:team-roster]]
${member.manager_id ? `- Manager: [[person:${member.manager_id}]]` : ''}
`
    
    // Write to 20-permanent (or 99-meta for internal docs)
    const filePath = join(
      process.env.DOCS_PATH!, 
      '20-permanent/01-concepts', 
      `person-${slug}.md`
    )
    
    await writeFile(filePath, content, 'utf-8')
    console.log(`Migrated: ${member.name} → ${filePath}`)
  }
  
  return members.length
}
```

### 3.2 Migrate Meeting Notes

```typescript
// scripts/migrate-meetings.ts
export async function migrateMeetings() {
  const { data: meetings, error } = await supabase
    .from('meeting_notes')
    .select('*, team_members!attendees(name)')
  
  if (error) throw error
  
  for (const meeting of meetings) {
    const date = new Date(meeting.meeting_date).toISOString().split('T')[0]
    const slug = meeting.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 50)
    
    const content = `---
type: meeting
title: "${meeting.title}"
meeting_type: ${meeting.meeting_type || 'general'}
date: "${date}"
access_level: ${meeting.is_private ? 'leadership' : 'team'}
${meeting.project_id ? `project: "[[project:${meeting.project_id}]]"` : ''}
attendees:
${meeting.team_members?.map((m: any) => `  - "[[person:${m.name}]]"`).join('\n') || '  - TBD'}
decisions:
${meeting.decisions?.map((d: any) => `  - "${d}"`).join('\n') || '  - None recorded'}
action_items:
${meeting.action_items?.map((a: any) => `  - "${a.task}" assigned to [[person:${a.assignee}]] due ${a.due_date}`).join('\n') || '  - None recorded'}
created: "${meeting.created_at}"
updated: "${new Date().toISOString()}"
---

# ${meeting.title}

## Agenda
${meeting.agenda || 'No agenda recorded'}

## Notes
${meeting.notes || 'No notes recorded'}

## Decisions
${meeting.decisions?.map((d: any) => `- ${d}`).join('\n') || '- None recorded'}

## Action Items
${meeting.action_items?.map((a: any) => `- [ ] ${a.task} — @${a.assignee} by ${a.due_date}`).join('\n') || '- None recorded'}

## References
${meeting.related_docs?.map((r: any) => `- [[${r}]]`).join('\n') || '- None'}
`
    
    const filePath = join(
      process.env.DOCS_PATH!,
      '00-fleeting/02-meetings',
      `${date}-${slug}.md`
    )
    
    await writeFile(filePath, content, 'utf-8')
  }
}
```

### 3.3 Migration Progress Tracker

Create `MIGRATION_STATUS.md` in your repo:

```markdown
# Migration Status

Last updated: 2024-01-XX

## Tables Migrated

| Table | Records | Status | File Count | Notes |
|-------|---------|--------|------------|-------|
| team_members | 12 | ✅ Complete | 12 | Created person docs |
| meeting_notes | 156 | 🔄 In Progress | 89 | Need to handle attachments |
| decisions | 23 | ⏳ Pending | - | Awaiting decision template |
| projects | 8 | ⏳ Pending | - | Need MOC structure |
| stakeholders | 45 | ⏳ Pending | - | Low priority |

## Known Issues

- [ ] Meeting attachments need storage migration
- [ ] Decision references need backlink creation
- [ ] Project MOC needs manual review

## Next Steps

1. Complete meeting migration (est. 2 hours)
2. Create project MOCs (est. 4 hours)
3. Validate all links (est. 1 hour)
```

---

## Phase 4: Link Extraction & Knowledge Graph (Week 5)

### 4.1 Extract Wikilinks

```typescript
// lib/extract-links.ts
export function extractWikilinks(content: string): Array<{
  target: string
  alias?: string
  context: string
}> {
  const links = []
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g
  
  let match
  while ((match = regex.exec(content)) !== null) {
    const target = match[1].trim()
    const alias = match[2]?.trim()
    
    // Extract surrounding context (100 chars each side)
    const start = Math.max(0, match.index - 100)
    const end = Math.min(content.length, match.index + match[0].length + 100)
    const context = content.slice(start, end).replace(/\n/g, ' ')
    
    links.push({ target, alias, context })
  }
  
  return links
}

export async function buildKnowledgeGraph() {
  const { data: documents } = await supabase
    .from('documents')
    .select('path, content')
  
  const links = []
  
  for (const doc of documents || []) {
    const docLinks = extractWikilinks(doc.content)
    
    for (const link of docLinks) {
      // Resolve target path
      const targetPath = await resolveLink(link.target)
      
      if (targetPath) {
        links.push({
          source_path: doc.path,
          target_path: targetPath,
          context: link.context
        })
      }
    }
  }
  
  // Batch insert
  await supabase.from('document_links').upsert(links)
  
  return links.length
}

async function resolveLink(target: string): Promise<string | null> {
  // Try exact match
  const { data: exact } = await supabase
    .from('documents')
    .select('path')
    .eq('path', target)
    .single()
  
  if (exact) return exact.path
  
  // Try title match
  const { data: byTitle } = await supabase
    .from('documents')
    .select('path')
    .eq('title', target)
    .single()
  
  if (byTitle) return byTitle.path
  
  // Try slug match (person:alice → person-alice.md)
  if (target.includes(':')) {
    const [type, slug] = target.split(':')
    const { data: bySlug } = await supabase
      .from('documents')
      .select('path')
      .ilike('path', `%${type}-${slug}.md`)
      .single()
    
    if (bySlug) return bySlug.path
  }
  
  return null
}
```

### 4.2 Backlink Index

```sql
-- Create view for backlink discovery
CREATE VIEW backlink_index AS
SELECT 
  target_path AS document,
  json_agg(json_build_object(
    'source', source_path,
    'context', context,
    'link_type', link_type
  )) AS backlinks
FROM document_links
GROUP BY target_path;

-- Function to get document with backlinks
CREATE OR REPLACE FUNCTION get_document_with_backlinks(doc_path TEXT)
RETURNS TABLE (
  document JSONB,
  backlinks JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(d.*) AS document,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'path', dl.source_path,
          'context', dl.context,
          'type', dl.link_type
        )
      ) FILTER (WHERE dl.source_path IS NOT NULL),
      '[]'::jsonb
    ) AS backlinks
  FROM documents d
  LEFT JOIN document_links dl ON dl.target_path = d.path
  WHERE d.path = doc_path
  GROUP BY d.id;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 5: Application Updates (Weeks 6-7)

### 5.1 Update API Routes

```typescript
// app/api/documents/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const type = searchParams.get('type')
  const access = searchParams.get('access')
  const search = searchParams.get('q')
  
  let query = supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (type) query = query.eq('type', type)
  if (access) query = query.eq('access_level', access)
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }
  
  const { data, error } = await query
  
  if (error) return Response.json({ error: error.message }, { status: 500 })
  
  return Response.json({ documents: data, count: data?.length })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  
  // Validate frontmatter
  const required = ['type', 'title', 'content']
  for (const field of required) {
    if (!body[field]) {
      return Response.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      )
    }
  }
  
  // Generate path if not provided
  if (!body.path) {
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 50)
    body.path = `00-fleeting/01-daily/${slug}.md`
  }
  
  const { data, error } = await supabase
    .from('documents')
    .upsert(body)
    .select()
    .single()
  
  if (error) return Response.json({ error: error.message }, { status: 500 })
  
  // Also write to Git (async, don't wait)
  syncToGit(data).catch(console.error)
  
  return Response.json(data, { status: 201 })
}
```

### 5.2 Document Viewer Component

```tsx
// components/DocumentViewer.tsx
'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { BacklinkPanel } from './BacklinkPanel'
import { FrontmatterEditor } from './FrontmatterEditor'

interface Document {
  path: string
  type: string
  title: string
  content: string
  frontmatter: Record<string, any>
  backlinks?: Array<{
    path: string
    context: string
    type: string
  }>
}

export function DocumentViewer({ path }: { path: string }) {
  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  
  useEffect(() => {
    fetch(`/api/documents/${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(data => {
        setDoc(data)
        setLoading(false)
      })
  }, [path])
  
  if (loading) return <div>Loading...</div>
  if (!doc) return <div>Document not found</div>
  
  return (
    <div className="document-viewer grid grid-cols-3 gap-6">
      <main className="col-span-2 space-y-6">
        <header className="border-b pb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">{doc.type}</span>
            <span>{doc.path}</span>
          </div>
          <h1 className="text-3xl font-bold mt-2">{doc.title}</h1>
          
          {doc.frontmatter.status && (
            <span className={`status-badge status-${doc.frontmatter.status}`}>
              {doc.frontmatter.status}
            </span>
          )}
        </header>
        
        {editMode ? (
          <FrontmatterEditor 
            frontmatter={doc.frontmatter}
            onSave={handleSave}
          />
        ) : (
          <article className="prose max-w-none">
            <ReactMarkdown>{doc.content}</ReactMarkdown>
          </article>
        )}
      </main>
      
      <aside className="space-y-6">
        <BacklinkPanel backlinks={doc.backlinks || []} />
        
        <div className="metadata-panel">
          <h3>Properties</h3>
          <dl>
            {Object.entries(doc.frontmatter).map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  )
}
```

---

## Phase 6: Validation & Rollout (Week 8)

### 6.1 Data Validation Checklist

```bash
# Run validation scripts
npm run migrate:validate

# Checklist:
# [ ] All team members have person documents
# [ ] All meeting notes migrated with correct attendees
# [ ] All wikilinks resolve to existing documents
# [ ] No orphaned documents (no backlinks, no links out)
# [ ] Access levels correctly assigned
# [ ] Database sync matches Git repo (checksums match)
```

### 6.2 Validation Script

```typescript
// scripts/validate-migration.ts
export async function validateMigration() {
  const issues = []
  
  // Check for broken links
  const { data: links } = await supabase
    .from('document_links')
    .select('source_path, target_path')
  
  for (const link of links || []) {
    const { data: target } = await supabase
      .from('documents')
      .select('path')
      .eq('path', link.target_path)
      .single()
    
    if (!target) {
      issues.push({
        type: 'broken_link',
        source: link.source_path,
        target: link.target_path
      })
    }
  }
  
  // Check for orphaned documents
  const { data: docs } = await supabase
    .from('documents')
    .select('path')
  
  for (const doc of docs || []) {
    const { data: hasLinks } = await supabase
      .from('document_links')
      .select('id')
      .or(`source_path.eq.${doc.path},target_path.eq.${doc.path}`)
      .limit(1)
    
    if (!hasLinks?.length && !doc.path.startsWith('00-fleeting/')) {
      issues.push({
        type: 'orphaned',
        path: doc.path
      })
    }
  }
  
  // Report
  console.table(issues)
  
  if (issues.length === 0) {
    console.log('✅ All validations passed!')
  } else {
    console.log(`❌ Found ${issues.length} issues`)
    process.exit(1)
  }
}
```

### 6.3 Rollback Plan

If issues arise:

1. **Immediate**: Revert to database-only mode
   ```sql
   -- Disable document table RLS temporarily
   ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
   ```

2. **Short-term**: Keep old tables, sync changes back
   ```typescript
   // Bidirectional sync: documents → old tables
   export async function syncToLegacyTables(doc: Document) {
     if (doc.type === 'meeting') {
       await supabase.from('meeting_notes').upsert({
         id: doc.frontmatter.legacy_id,
         title: doc.title,
         notes: doc.content,
         // ... map other fields
       })
     }
   }
   ```

3. **Full rollback**: Restore from pre-migration backup
   ```bash
   # Restore database
   psql $DATABASE_URL < backup-pre-migration.sql
   
   # Archive documents repo
   mv documents documents-archive-$(date +%Y%m%d)
   ```

---

## Migration Commands Reference

```bash
# Initialize migration
npm run migrate:init

# Run full migration
npm run migrate:all

# Migrate specific table
npm run migrate:table team_members

# Validate migration
npm run migrate:validate

# Sync Git → Database
npm run sync:git-to-db

# Sync Database → Git (for repairs)
npm run sync:db-to-git

# Build knowledge graph
npm run migrate:links

# Generate migration report
npm run migrate:report > MIGRATION_REPORT.md
```

---

## Post-Migration

### Daily Workflow

```bash
# Morning: Sync documents
git pull && npm run sync:git-to-db

# Work: Create/edit documents via app or directly in repo

# Evening: Commit and push
git add . && git commit -m "Daily notes $(date +%Y-%m-%d)" && git push
```

### Monitoring

```sql
-- Daily document count
SELECT type, COUNT(*) FROM documents GROUP BY type;

-- Orphaned documents
SELECT path FROM documents d
WHERE NOT EXISTS (
  SELECT 1 FROM document_links 
  WHERE source_path = d.path OR target_path = d.path
);

-- Broken links
SELECT source_path, target_path FROM document_links l
WHERE NOT EXISTS (
  SELECT 1 FROM documents WHERE path = l.target_path
);
```

---

## Troubleshooting

### Issue: Documents not syncing

**Symptoms**: Changes in Git not appearing in database

**Solution**:
```bash
# Check sync logs
tail -f logs/sync.log

# Force full resync
npm run sync:git-to-db -- --force

# Verify checksums
npm run migrate:validate -- --check-checksums
```

### Issue: Broken wikilinks after migration

**Symptoms**: `[[person:alice]]` doesn't resolve

**Solution**:
```typescript
// Run link repair
npm run migrate:repair-links

# Or manually fix:
# 1. Find broken: SELECT * FROM broken_links_view
# 2. Update content with correct paths
```

### Issue: Access control too restrictive

**Symptoms**: Users can't see documents they should access

**Solution**:
```sql
-- Check user's role
SELECT auth.jwt()->>'role';

-- Review document access levels
SELECT path, access_level FROM documents WHERE path = 'example.md';

-- Temporarily relax for debugging (don't use in production!)
CREATE POLICY debug_access ON documents FOR SELECT USING (true);
```

---

## Timeline Summary

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Assessment | Migration worksheet, inventory complete |
| 2 | Infrastructure | Git repo, DB schema, sync working |
| 3-4 | Content Migration | Team, meetings, decisions migrated |
| 5 | Knowledge Graph | Links extracted, backlinks working |
| 6-7 | App Updates | New UI, document viewer, search |
| 8 | Validation | All tests pass, team trained |

---

## Success Metrics

- [ ] 100% of team members have person documents
- [ ] 95% of historical meetings migrated
- [ ] <1% broken link rate
- [ ] <5 second search response time
- [ ] Zero data loss (validated by checksums)
- [ ] Team creating new documents without support

---

**Questions?** Refer to [PLAYBOOK.md](./PLAYBOOK.md) for document type guidelines or [ROADMAP.md](./ROADMAP.md) for implementation priorities.
