# Agent #2 Handover

**From:** Claude Code Agent #1  
**Date:** March 16, 2026  
**Session Focus:** Migration Assessment & Documentation  

---

## TL;DR — Start Here

You've inherited a **knowledge management system** (Open Brain) that's transitioning from a database-centric model to a document-based system. The previous agent completed Phase 1 (Assessment). Your job is to **execute the migration** or **continue building features**.

**First 5 minutes:**
1. Read this file
2. Read `ROADMAP.md` — check current phase
3. Read `HANDOVER.md` — understand system architecture
4. Decide: Migration work or Feature work?

---

## Current State Snapshot

### What Exists (Working Today)

| Component | Status | Location |
|-----------|--------|----------|
| Slack capture pipeline | ✅ Working | `ingest-thought` Edge Function |
| Meeting transcript processing | ✅ Working | `meeting-notes` Edge Function |
| Template classification (19 templates) | ✅ Working | Both Edge Functions |
| Morning Briefing Dashboard | ✅ Built | `apps/my-app/` |
| Database (thoughts table) | ✅ Live | Supabase |
| Embeddings + vector search | ✅ Working | OpenRouter + pgvector |

### What's New (From This Session)

| Component | Status | Location |
|-----------|--------|----------|
| Document system architecture | ✅ Designed | `PLAYBOOK.md` (41 KB) |
| Migration plan (6 phases) | ✅ Documented | `MIGRATION_GUIDE.md` (27 KB) |
| Phase 1 Assessment | ✅ Complete | `MIGRATION_ASSESSMENT.md` (14.6 KB) |
| Migration scripts | ✅ Ready | `scripts/migration/` |
| TSM Framework integration | ✅ Documented | `KNOWLEDGE_ARCHITECTURE.md` |
| Updated Handover | ✅ Complete | `HANDOVER.md` (28 KB) |

### What's Missing / In Progress

| Component | Status | Blocker |
|-----------|--------|---------|
| Git document repository | ⏳ Not created | Need decision on location |
| Document sync pipeline | ⏳ Not built | Need Phase 2 |
| New database schema (documents table) | ⏳ Not created | Need migration |
| Document viewer UI | ⏳ Not built | Need Phase 5 |
| Knowledge graph (links) | ⏳ Not built | Need Phase 4 |
| Dashboard deployed to Vercel | ⏳ Not deployed | Need env vars |

---

## Your Decision Matrix

You have **three paths** to choose from. Pick one:

### Path A: Execute Migration (Recommended if stability is priority)

**Goal:** Move from database-only to hybrid Git+Database system

**Week 1-2: Infrastructure (Phase 2)**
- [ ] Create Git document repository
- [ ] Create `documents` and `document_links` tables
- [ ] Build sync pipeline (Git ↔ Database)
- [ ] Set up folder structure per PLAYBOOK.md

**Week 3-4: Content Migration (Phase 3)**
- [ ] Export Tier 1 data (Decisions, Meetings, Specs, Risks)
- [ ] Transform to Markdown with frontmatter
- [ ] Validate links
- [ ] Review with Kev before committing

**Week 5: Knowledge Graph (Phase 4)**
- [ ] Extract wikilinks from all documents
- [ ] Build backlink index
- [ ] Create link validation scripts

**Week 6-7: App Updates (Phase 5)**
- [ ] Build document viewer component
- [ ] Update search to use new schema
- [ ] Add backlink panel to UI

**Why this path:** Foundation for everything else. Unlocks document-based workflows.

---

### Path B: Deploy & Enhance Dashboard (Recommended if user-facing value is priority)

**Goal:** Get Morning Briefing live and add features

**Day 1-2: Deploy**
- [ ] Get Vercel account set up
- [ ] Add environment variables (Supabase, OpenWeather, Reclaim)
- [ ] Deploy `apps/my-app/`
- [ ] Test all API routes

**Day 3-5: Quick Wins**
- [ ] Add authentication (currently public)
- [ ] Add document creation UI (not just viewing)
- [ ] Add search interface

**Week 2: Integration**
- [ ] Connect Reclaim scheduling buttons
- [ ] Add Slack notification for daily briefing
- [ ] Mobile responsiveness pass

**Why this path:** Users can start using it immediately. Validates value before migration.

---

### Path C: Team Onboarding (Recommended if team growth is priority)

**Goal:** Get Kris, Laura, Jochem, Colm using Open Brain

**Day 1: Kris Setup**
- [ ] Get Kris's Gemini folder ID
- [ ] Create his Google Apps Script instance
- [ ] Test end-to-end meeting flow

**Day 2-3: Laura Setup**
- [ ] Onboard to Slack #log channel
- [ ] Train on 19 templates
- [ ] Set up her Reclaim integration

**Week 2: Jochem & Colm**
- [ ] Same process
- [ ] Gather feedback on templates
- [ ] Adjust based on usage

**Why this path:** More users = more data = better system. But current system works fine for this.

---

## Critical Context You Need

### 1. The Architecture Tension

**Current:** Everything in PostgreSQL (`thoughts` table). Search works. Embeddings work. But no "documents" — just rows.

**Target:** Markdown files in Git + synced to database. Search still works. But now users have "original documents" they can edit, link, version control.

**Why:** Tim's feedback — users want the **source document**, not just search results.

### 2. The 19 Templates

Templates classify by **topic domain** (what it's about):
- Layer 1 (Team Core): Decision, Risk, Milestone, Spec, Meeting, Person, Stakeholder, Sent
- Layer 2 (Role): Budget, Invoice, Funding, Legal, Compliance, Contract
- Layer 3 (Personal): Insight, AI Save, Nutrition, Health, Home

Document types classify by **knowledge stage** (how processed):
- fleeting → literature → permanent → project → structure → request

Both dimensions matter. A "Decision" template can be a `fleeting` note (just captured) or a `permanent` note (fully processed).

### 3. TSM Framework

Don't panic about this. It's a **21-node ontological structure** for positioning ideas:
- Global Stack (infrastructure)
- Internal Stack (embodied experience)
- External Stack (mediation/tools)

Each has 7 planes (Ground → Root → Space → Bridge → Horizons → Crown → Feedback Loop)

Used for: Connecting personal knowledge (Open Brain) to collective knowledge (idirnet).

### 4. Privacy/Cost Constraints

- **Privacy:** Prefer local embeddings (all-MiniLM-L6-v2) over OpenAI
- **Cost:** Target $0 — use GitHub Actions for compute, Supabase free tier for DB
- **Embeddings:** Currently using OpenRouter (paid). Plan to migrate to local.

### 5. The idirnet Connection

idirnet is Kev's **collective knowledge system** (file-based, markdown, git). Open Brain is **personal knowledge** (database-based). They're converging:
- Same templates
- Same TSM framework
- Same folder structure (eventually)

Philosophy: "Shared Open Brain" — personal and collective knowledge should feel seamless.

---

## Files You Must Read

Read these **in order** before doing anything:

| Order | File | Why |
|-------|------|-----|
| 1 | `AGENT_2_HANDOVER.md` | This file — you're here |
| 2 | `PROGRESS_LOG.md` | **Day-by-day tracker** — see what happened yesterday |
| 3 | `ROADMAP.md` | Current phase, what's done, what's next |
| 4 | `HANDOVER.md` | System architecture, commands, current state |
| 5 | `PLAYBOOK.md` | Document types, templates, workflows |
| 6 | `MIGRATION_GUIDE.md` | If doing migration work |

**Optional but helpful:**
- `MIGRATION_ASSESSMENT.md` — Detailed Phase 1 findings
- `KNOWLEDGE_ARCHITECTURE.md` — TSM Framework deep dive
- `CLAUDE.md` — AI team pipeline instructions

---

## Ready-to-Work Tasks

These are **specific, actionable tasks** you can start immediately:

### Task 1: Create Document Repository (2 hours)

```bash
mkdir -p ~/openbrain-documents
cd ~/openbrain-documents
git init

# Create folder structure
mkdir -p 00-fleeting/01-daily
mkdir -p 00-fleeting/02-meetings
mkdir -p 10-literature/01-articles
mkdir -p 10-literature/02-books
mkdir -p 20-permanent/01-concepts
mkdir -p 20-permanent/02-patterns
mkdir -p 30-projects/{active,planning,complete}
mkdir -p 40-structure
mkdir -p 50-requests/{open,in-progress,blocked,closed}
mkdir -p 60-archive
mkdir -p 99-meta/templates

# Add README
cat > README.md << 'EOF'
# Open Brain Documents

Personal knowledge management following Zettelkasten principles.

See PLAYBOOK.md for guidelines.
EOF

git add .
git commit -m "Initial document structure"
```

### Task 2: Export Sample Data (30 min)

```bash
cd ~/OPENBRAIN/openBrain/scripts/migration
npm install

# Export 10 decisions for testing
npx tsx export-data.ts --template Decision --limit 10 --output sample-decisions.json

# Review output
cat sample-decisions.json | jq '.records[0]'
```

### Task 3: Create Documents Table Schema (1 hour)

```sql
-- Run in Supabase SQL Editor
create table documents (
  id uuid primary key default gen_random_uuid(),
  path text unique not null,
  type text not null,
  title text not null,
  content text not null,
  frontmatter jsonb not null default '{}',
  access_level text not null default 'team',
  tsm_stack text,
  tsm_node text,
  status text,
  checksum text not null,
  last_synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table documents enable row level security;

-- Create policy (404-not-403 pattern)
create policy document_access on documents
  for select
  using (
    case auth.jwt()->>'role'
      when 'leadership' then true
      when 'team' then access_level in ('public', 'network', 'team')
      when 'network' then access_level in ('public', 'network')
      else access_level = 'public'
    end
  );

-- Links table for knowledge graph
create table document_links (
  id uuid primary key default gen_random_uuid(),
  source_path text references documents(path) on delete cascade,
  target_path text references documents(path) on delete cascade,
  link_type text default 'reference',
  context text,
  created_at timestamptz default now(),
  unique(source_path, target_path, link_type)
);
```

### Task 4: Build Sync Pipeline (4 hours)

```typescript
// lib/document-sync.ts
// See MIGRATION_GUIDE.md for full implementation
// Key functions:
// - syncDocumentsToDatabase(repoPath)
// - syncToGit(document)
// - computeChecksum(content)
```

### Task 5: Deploy Dashboard to Vercel (2 hours)

```bash
cd ~/OPENBRAIN/openBrain/apps/my-app

# Create production env
cp .env.local.example .env.production
# Fill in real values

# Deploy
npm i -g vercel
vercel --prod

# Test
curl https://your-app.vercel.app/api/briefing
```

---

## Decisions Waiting for You

These need **human decision** (probably Kev). Don't guess:

| Decision | Options | My Recommendation |
|----------|---------|-------------------|
| **Git repo location** | `~/openbrain-documents/` vs `~/OPENBRAIN/documents/` vs `~/idirnet/openbrain/` | `~/OPENBRAIN/openBrain/documents/` (keep together) |
| **Meeting chunking** | Keep chunks separate vs merge into one doc | Keep separate (more granular) |
| **Embedding strategy** | Stay on OpenRouter vs migrate to local | Migrate to all-MiniLM-L6-v2 (privacy) |
| **Sync frequency** | Real-time vs hourly vs daily | Hourly batch (simpler) |
| **Rollback window** | 7 days vs 30 days vs 90 days | 30 days (safe middle ground) |

---

## Known Technical Debt

| Issue | Severity | Notes |
|-------|----------|-------|
| No authentication on dashboard | High | Anyone can access if they find URL |
| Meeting-notes Edge Function doesn't use full template extraction | Medium | Has extraction prompt but not using it in code |
| Reclaim integration untested | Medium | Code exists, not verified working |
| No tests for Edge Functions | Medium | Manual testing only |
| Hardcoded Dublin weather | Low | Should use user location |

---

## Common Pitfalls

### Don't Do These

1. **Don't migrate all data at once** — Start with 10 records, validate, then scale
2. **Don't break existing Slack integration** — Keep `thoughts` table working during migration
3. **Don't over-engineer sync** — Hourly batch is fine, don't need real-time
4. **Don't ignore TSM Framework** — Even if it seems complex, Kev cares about this
5. **Don't forget the 4-tier access** — RLS policies must be correct

### Do These Instead

1. **Parallel systems** — Keep old + new running simultaneously
2. **Validate at each step** — Checksums, link validation, data integrity
3. **Small commits** — Git commit after each template migration
4. **Document decisions** — Update ROADMAP.md when phases complete
5. **Ask Kev** — When in doubt, ask. Better than guessing wrong.

---

## Emergency Contacts / Resources

| Resource | How to Access |
|----------|---------------|
| Supabase Dashboard | https://supabase.com/dashboard/project/jeuxslbhjubxmhtzpvqf |
| Slack #log channel | Check CLAUDE.md for webhook details |
| Google Apps Script | script.google.com (search "Open Brain Meeting Notes") |
| Reclaim Dashboard | reclaim.ai (API key in env vars) |
| Previous Agent Notes | This file + ROADMAP.md + HANDOVER.md |

---

## Success Metrics for Your Session

**If doing migration:**
- [ ] Git repo created with folder structure
- [ ] `documents` table created in Supabase
- [ ] 10+ sample documents migrated and validated

**If doing dashboard:**
- [ ] Dashboard deployed to Vercel
- [ ] All API routes responding
- [ ] At least one new feature added

**If doing onboarding:**
- [ ] One team member fully set up (Kris)
- [ ] Documentation updated with their feedback
- [ ] Template usage validated

---

## Final Notes

**This is a knowledge system, not just code.** The goal is to help Kev and the team think better, remember more, and connect ideas. Technical excellence matters, but usability matters more.

**The migration is the foundation.** Everything else (dashboard, AI features, integrations) builds on having a solid document system. Don't skip it.

**When stuck:** Read PLAYBOOK.md. It has examples, anti-patterns, and real workflows.

**When done:** 
1. Update `PROGRESS_LOG.md` with Day 2 entry
2. Update `ROADMAP.md` "Current Checkpoint" section
3. Create `AGENT_3_HANDOVER.md` if there's more work

---

## Checkpoint System (Maintain This)

To ensure sequential progression, **every agent** must:

### At Start of Session
1. Read `PROGRESS_LOG.md` — understand what happened yesterday
2. Check `ROADMAP.md` — confirm current phase checkpoint
3. Add new Day N entry to `PROGRESS_LOG.md`
4. Update ROADMAP.md "Current Checkpoint" section

### During Session
- Update checkboxes in real-time
- Record blockers immediately
- Note decisions made

### At End of Session
1. Complete Day N entry in `PROGRESS_LOG.md`
2. Update Phase Progress Summary
3. Add Day N+1 entry with "Pending" status
4. Create/update `AGENT_N_HANDOVER.md` if handing off
5. Update `ROADMAP.md` "Current Checkpoint"

### Sequential Advancement Rules
- **Daily Entry Required** — Every day of work gets a PROGRESS_LOG entry
- **Checkpoint Before Next** — Mark phase complete before starting next
- **Blockers Escalate** — If blocked > 4 hours, document and escalate

Good luck. You've got this.

---

**Questions?** Everything is documented. Start with ROADMAP.md.
