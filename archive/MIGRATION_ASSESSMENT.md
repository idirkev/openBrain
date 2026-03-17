# Open Brain Migration Assessment

**Phase 1: Current State Inventory & Document Type Mapping**

*Generated: March 16, 2026*

---

## 1. Executive Summary

### Current Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Database** | Supabase PostgreSQL + pgvector | Stores all thoughts with embeddings |
| **Primary Table** | `thoughts` | Single table for all captures |
| **Ingestion** | Edge Functions (Deno) | Slack webhook + meeting transcripts |
| **AI** | OpenRouter (gpt-4o-mini + text-embedding-3-small) | Classification + embeddings |
| **Frontend** | Next.js 15 + shadcn/ui | Morning Briefing Dashboard |
| **Integrations** | Slack, Google Drive, Reclaim.ai | Capture + scheduling |

### Migration Target

Hybrid Git + Database system with:
- **Git**: Markdown documents with YAML frontmatter
- **Database**: Synced copy for search + backlink graph
- **19 Templates**: Map to 19 document types
- **Knowledge Graph**: Wikilink extraction + backlinks

---

## 2. Current Data Inventory

### 2.1 Database Schema

```sql
-- Current thoughts table structure
CREATE TABLE thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,              -- Raw capture text
  embedding vector(1536),             -- OpenAI text-embedding-3-small
  metadata JSONB,                     -- Flexible metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Metadata structure (JSONB)
{
  "template": "Decision",           -- One of 19 templates (nullable)
  "type": "task",                   -- observation|task|idea|reference|person_note
  "emoji": "🎯",                    -- Template/type emoji
  "people": ["Alice", "Bob"],       -- Names mentioned
  "action_items": ["Email team"],   -- Extracted tasks
  "topics": ["api", "design"],      -- 1-3 keywords
  "source": "slack"                 -- Origin: slack|meeting|email
}
```

### 2.2 Data Volume Estimates

| Metric | Estimate | Source |
|--------|----------|--------|
| Total thoughts | ~500-1000 | Based on daily usage pattern |
| Templates used | ~12 of 19 | Some templates not yet triggered |
| Meeting transcripts | 13+ pending | Google Drive source folder |
| Action items | ~50 open | From metadata extraction |
| People mentioned | ~30 unique | From person_note templates |

### 2.3 Template Usage Distribution

Based on `metadata->template` field analysis:

| Layer | Template | Frequency | Priority |
|-------|----------|-----------|----------|
| **Team Core** | | | |
| | Decision | High | 🔴 Critical |
| | Risk | Medium | 🔴 Critical |
| | Milestone | Medium | 🟡 High |
| | Spec | High | 🔴 Critical |
| | Meeting Debrief | Very High | 🔴 Critical |
| | Person Note | High | 🟡 High |
| | Stakeholder | Low | 🟢 Medium |
| | Sent | Medium | 🟡 High |
| **Role** | | | |
| | Budget | Low | 🟢 Medium |
| | Invoice | Low | 🟢 Medium |
| | Funding | Low | 🟢 Medium |
| | Legal | Very Low | 🟢 Medium |
| | Compliance | Low | 🟢 Medium |
| | Contract | Very Low | 🟢 Medium |
| **Personal** | | | |
| | Insight | Very High | 🔴 Critical |
| | AI Save | High | 🟡 High |
| | Nutrition | Medium | 🟢 Low |
| | Health | Low | 🟢 Low |
| | Home | Low | 🟢 Low |

---

## 3. Document Type Mapping

### 3.1 Mapping Matrix: Current → New System

| Current | Template | New Document Type | Folder | Notes |
|---------|----------|-------------------|--------|-------|
| `thoughts.metadata->template = 'Decision'` | Decision | `decision` | `20-permanent/` | Requires ADR format |
| `thoughts.metadata->template = 'Risk'` | Risk | `risk` | `20-permanent/` | Link to related decisions |
| `thoughts.metadata->template = 'Milestone'` | Milestone | `milestone` | `20-permanent/` | Link to project MOC |
| `thoughts.metadata->template = 'Spec'` | Spec | `spec` | `20-permanent/` | Technical specifications |
| `thoughts.metadata->template = 'Meeting Debrief'` | Meeting Debrief | `meeting` | `00-fleeting/02-meetings/` | Date-based naming |
| `thoughts.metadata->template = 'Person Note'` | Person Note | `person` | `20-permanent/` | Person directory |
| `thoughts.metadata->template = 'Stakeholder'` | Stakeholder | `stakeholder` | `20-permanent/` | External relationships |
| `thoughts.metadata->template = 'Sent'` | Sent | `sent` | `00-fleeting/` | Tracking outbound |
| `thoughts.metadata->template = 'Budget'` | Budget | `budget` | `30-projects/` | Link to project |
| `thoughts.metadata->template = 'Invoice'` | Invoice | `invoice` | `30-projects/` | Finance tracking |
| `thoughts.metadata->template = 'Funding'` | Funding | `funding` | `30-projects/` | Grant applications |
| `thoughts.metadata->template = 'Legal'` | Legal | `legal` | `30-projects/` | Legal matters |
| `thoughts.metadata->template = 'Compliance'` | Compliance | `compliance` | `30-projects/` | Certifications |
| `thoughts.metadata->template = 'Contract'` | Contract | `contract` | `30-projects/` | Contract docs |
| `thoughts.metadata->template = 'Insight'` | Insight | `insight` | `20-permanent/` | Atomic ideas |
| `thoughts.metadata->template = 'AI Save'` | AI Save | `ai_save` | `10-literature/` | AI outputs as sources |
| `thoughts.metadata->template = 'Nutrition'` | Nutrition | `nutrition` | `20-permanent/` | Health tracking |
| `thoughts.metadata->template = 'Health'` | Health | `health` | `20-permanent/` | Personal wellness |
| `thoughts.metadata->template = 'Home'` | Home | `home` | `20-permanent/` | Personal tasks |
| `thoughts.metadata->template IS NULL` | Uncategorized | `fleeting` | `00-fleeting/` | Process into permanent |

### 3.2 Special Handling Required

| Case | Handling Strategy |
|------|-------------------|
| **Meeting transcripts** | Already parsed into chunks; keep chunks separate or merge? |
| **Action items embedded in metadata** | Extract to `50-requests/` with acceptance criteria |
| **People mentions** | Create `person` documents, link via `[[person:Name]]` |
| **Embeddings** | Re-generate using all-MiniLM-L6-v2 locally (privacy) |
| **Timestamps** | Preserve original `created_at` as `captured_date` |

---

## 4. Custom Field Analysis

### 4.1 Current Metadata → Frontmatter Mapping

```yaml
# Current JSONB metadata
{
  "template": "Decision",
  "type": "task", 
  "people": ["Alice", "Bob"],
  "action_items": ["Email team about API"],
  "topics": ["api", "architecture"],
  "source": "slack"
}

# Maps to frontmatter:
---
type: decision
title: "[Extracted from content first line]"
template: Decision
captured_date: "2024-01-15T10:30:00Z"
source: slack
access_level: team
people:
  - "[[person:Alice]]"
  - "[[person:Bob]]"
topics:
  - api
  - architecture
related_requests:
  - "[[request:email-team-api]]"  # Extracted from action_items
---
```

### 4.2 Derived Fields to Generate

| Field | Source | Generation Logic |
|-------|--------|------------------|
| `title` | `content` | First sentence or first 50 chars |
| `path` | `type` + `created_at` | `20-permanent/decision-YYYY-MM-DD-slug.md` |
| `slug` | `title` | Lowercase, replace spaces with hyphens |
| `tsm_stack` | `template` | Map to TSM (see below) |
| `tsm_node` | `template` | Infer from content analysis |
| `related` | `people` + `topics` | Build wikilinks from metadata |

### 4.3 TSM Framework Mapping

| Template | Stack | Node | Rationale |
|----------|-------|------|-----------|
| Decision | global | horizon-2 | Strategic choices |
| Risk | global | horizon-1 | Threats to plan |
| Milestone | global | bridge | Progress markers |
| Spec | external | platform | Technical interfaces |
| Meeting Debrief | internal | discourse | Communication |
| Person Note | internal | emotion | Relationships |
| Stakeholder | external | engagement | External relations |
| Budget | global | economy | Resources |
| Funding | global | economy | Capital |
| Contract | external | governance | Agreements |
| Insight | internal | intuition | Knowledge |
| AI Save | external | platform | Tools |

---

## 5. Migration Priority Matrix

### 5.1 Priority Tiers

#### 🔴 Tier 1: Critical (Week 3)

| # | Data | Records | Effort | Impact |
|---|------|---------|--------|--------|
| 1 | **Decisions** | ~50 | Low | High - Audit trail |
| 2 | **Meeting Debriefs** | ~100 | Medium | High - Knowledge base |
| 3 | **Specs** | ~30 | Low | High - Technical debt |
| 4 | **Risks** | ~20 | Low | High - Risk management |

#### 🟡 Tier 2: High (Week 4)

| # | Data | Records | Effort | Impact |
|---|------|---------|--------|--------|
| 5 | **Person Notes** | ~60 | Medium | Medium - CRM |
| 6 | **Insights** | ~100 | Low | Medium - Knowledge |
| 7 | **AI Saves** | ~40 | Low | Low - Reference |
| 8 | **Sent** | ~30 | Low | Low - Tracking |

#### 🟢 Tier 3: Medium/Low (Weeks 5-6)

| # | Data | Records | Effort | Impact |
|---|------|---------|--------|--------|
| 9 | **Milestones** | ~25 | Low | Low |
| 10 | **Budget/Funding** | ~15 | Low | Medium |
| 11 | **Stakeholders** | ~10 | Low | Low |
| 12 | **Legal/Compliance** | ~10 | Low | Medium |
| 13 | **Personal (Nutrition/Health/Home)**** | ~50 | Low | Low |

### 5.2 Dependency Graph

```
Person Notes
     ↓
Meeting Debriefs → Decisions
     ↓              ↓
   Risks ←───────→ Specs
     ↓
Milestones
```

**Migration Order**: Person Notes → Meeting Debriefs → Decisions/Risks/Specs (parallel) → Milestones

---

## 6. Risk Assessment

### 6.1 Migration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Data loss** | Low | Critical | Full backup before migration |
| **Broken links** | High | Medium | Validation script + manual review |
| **Performance degradation** | Medium | Medium | Keep DB as cache layer |
| **Team disruption** | Medium | High | Parallel systems during transition |
| **Embedding quality loss** | Medium | Medium | A/B test old vs new embeddings |

### 6.2 Technical Challenges

| Challenge | Severity | Solution |
|-----------|----------|----------|
| **Embedding model change** | Medium | OpenAI → all-MiniLM-L6-v2 requires similarity threshold tuning |
| **Meeting chunking** | Medium | Keep chunks separate or merge? Decision needed. |
| **Action item extraction** | Low | Already in metadata, just needs formatting |
| **Date parsing** | Low | ISO 8601 throughout |
| **Wikilink resolution** | High | Build resolver for `[[type:slug]]` format |

---

## 7. Resource Requirements

### 7.1 Time Estimates

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 2: Infrastructure | 1 week | Git repo, sync pipeline, DB schema |
| Phase 3: Tier 1 Migration | 1 week | Decisions, meetings, specs, risks |
| Phase 4: Tier 2 Migration | 1 week | People, insights, remaining templates |
| Phase 5: Knowledge Graph | 3 days | Link extraction, backlink index |
| Phase 6: App Updates | 1 week | New UI, document viewer, search |
| Phase 7: Validation | 3 days | Testing, monitoring, fixes |
| **Total** | **~4 weeks** | |

### 7.2 Tools & Access Needed

| Resource | Purpose | Status |
|----------|---------|--------|
| Supabase service role key | Data export | ✅ Available |
| GitHub repo access | Document storage | ⬜ Need to create |
| OpenRouter API key | Re-embedding (if needed) | ✅ Available |
| Local dev environment | Testing | ✅ Available |

---

## 8. Recommendations

### 8.1 Immediate Actions (This Week)

1. **Backup current data**
   ```bash
   supabase db dump --data-only > openbrain-backup-$(date +%Y%m%d).sql
   ```

2. **Create document repository**
   ```bash
   mkdir openbrain-documents && cd openbrain-documents
   git init
   # Set up folder structure per PLAYBOOK.md
   ```

3. **Export sample data for testing**
   ```sql
   COPY (
     SELECT * FROM thoughts 
     WHERE created_at > '2024-01-01'
     LIMIT 100
   ) TO '/tmp/sample_thoughts.csv' WITH CSV HEADER;
   ```

### 8.2 Strategic Decisions Needed

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Meeting chunks** | Keep separate vs merge | Keep separate - more granular |
| **Embedding strategy** | Cloud vs local | Local (all-MiniLM-L6-v2) for privacy |
| **Sync direction** | Git→DB vs bidirectional | Git source of truth, DB cache |
| **Access control** | Who sees what | Start with team-level, refine later |
| **Rollback window** | How long to keep old tables | 30 days post-migration |

### 8.3 Success Criteria

- [ ] 100% of Tier 1 data migrated with no loss
- [ ] <1% broken link rate
- [ ] <5 second search response time
- [ ] All 19 templates map to working document types
- [ ] Team can create new documents without support
- [ ] Morning Briefing shows migrated data correctly

---

## 9. Appendices

### Appendix A: Sample Data Export

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Decision: Use Supabase for document storage. Context: PostgreSQL + pgvector gives us search + graph in one. Owner: Kev. Due: End of week.",
  "embedding": [0.023, -0.015, ...],
  "metadata": {
    "template": "Decision",
    "type": "task",
    "people": ["Kev"],
    "action_items": ["Implement Supabase schema"],
    "topics": ["database", "architecture"],
    "source": "slack"
  },
  "created_at": "2024-03-15T14:30:00Z"
}
```

### Appendix B: Migration Script Skeleton

```typescript
// scripts/migrate-tier1.ts
import { createClient } from '@supabase/supabase-js'

async function migrateDecisions() {
  const { data: decisions } = await supabase
    .from('thoughts')
    .select('*')
    .eq('metadata->>template', 'Decision')
  
  for (const decision of decisions || []) {
    const doc = {
      type: 'decision',
      title: extractTitle(decision.content),
      content: formatContent(decision.content),
      frontmatter: {
        captured_date: decision.created_at,
        people: decision.metadata.people?.map(p => `[[person:${p}]]`),
        topics: decision.metadata.topics,
        tsm_stack: 'global',
        tsm_node: 'horizon-2'
      }
    }
    
    await writeDocument(doc)
  }
}
```

### Appendix C: Validation Queries

```sql
-- Count by template
SELECT metadata->>'template' as template, COUNT(*)
FROM thoughts
GROUP BY metadata->>'template'
ORDER BY COUNT(*) DESC;

-- Find thoughts with action items
SELECT COUNT(*) 
FROM thoughts
WHERE metadata->'action_items' IS NOT NULL
  AND jsonb_array_length(metadata->'action_items') > 0;

-- People mentioned frequency
SELECT jsonb_array_elements_text(metadata->'people') as person, COUNT(*)
FROM thoughts
WHERE metadata->'people' IS NOT NULL
GROUP BY person
ORDER BY COUNT(*) DESC
LIMIT 20;
```

---

**Next Step**: Proceed to Phase 2 (Infrastructure Setup) or refine this assessment based on feedback.
