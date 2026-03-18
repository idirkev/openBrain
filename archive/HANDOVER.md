# Open Brain System Handover

Last Updated: March 16, 2026

---

## Quick Reference

| Resource | Location |
|----------|----------|
| **This File** | System overview, architecture, commands |
| `docs/status/ROADMAP.md` | All 15 phases, **current checkpoint**, next steps |
| `docs/status/PROGRESS_LOG.md` | **Day-by-day advancement tracker** — sequential progress |
| `CLAUDE_CODE_PROMPT.md` | **Copy-paste prompts for Claude Code sessions** |
| `PLAYBOOK.md` | 16KB field guide: templates, document types, workflows |
| `MIGRATION_GUIDE.md` | Complete migration: database → document system |
| `MIGRATION_ASSESSMENT.md` | Phase 1 assessment report |
| `AGENT_2_HANDOVER.md` | Next agent startup guide (read this if you're Agent #2) |
| `CLAUDE.md` | Agent routing, AI team pipeline |
| `RECLAIM_INTEGRATION.md` | Scheduling integration details |
| `KNOWLEDGE_ARCHITECTURE.md` | TSM Framework, design decisions |
| `IDIRNET_EXTRACTION_SUMMARY.md` | Knowledge transfer from idirnet |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INPUT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Slack #log    │  Google Meet    │  Email Forward    │  Manual/API        │
│       │        │       │         │       │           │       │            │
│       ▼        │       ▼         │       ▼           │       ▼            │
│  ingest-       │  meeting-       │  (Phase 7)        │  capture_thought() │
│  thought       │  notes          │                   │  (DB Function)     │
└───────┬─────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROCESSING LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  OpenRouter: gpt-4o-mini (classification)                                   │
│  OpenRouter: text-embedding-3-small (vectors)                              │
│  Template detection → Document type assignment → Access level tagging      │
└───────┬─────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT SYSTEM (NEW)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Git Repository                    Supabase (Synced)                       │
│   ─────────────                     ─────────────────                       │
│   00-fleeting/                      documents table                         │
│   10-literature/                    document_links table                    │
│   20-permanent/                     4-tier access control                   │
│   30-projects/                      Full-text + vector search               │
│   40-structure/                                                             │
│   50-requests/                                                              │
│   60-archive/                                                               │
│                                                                             │
│   Zettelkasten-inspired + TSM Framework                                     │
│                                                                             │
└───────┬─────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OUTPUT/ACTION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │  Morning Brief  │  │  Reclaim.ai     │  │  Weekly Review              │ │
│  │  Dashboard      │  │  Scheduler      │  │  (Sunday 6 PM)              │ │
│  │  (Next.js)      │  │  (3 approaches) │  │                             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │  Slack #log     │  │  Google Drive   │  │  Notification Queue         │ │
│  │  (confirmations)│  │  (summaries)    │  │  (8 AM daily briefing)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Current Status:** Hybrid transition — database is source of truth, document system being built alongside.

---

## Document System (New Architecture)

### Folder Structure (Zettelkasten + TSM)

```
documents/
├── 00-fleeting/              # Raw captures
│   ├── 01-daily/            # Daily notes
│   └── 02-meetings/         # Meeting notes
├── 10-literature/           # Source notes
│   ├── 01-articles/
│   ├── 02-books/
│   ├── 03-podcasts/
│   └── 04-videos/
├── 20-permanent/            # Evergreen notes
│   ├── 01-concepts/
│   ├── 02-patterns/
│   └── 03-methods/
├── 30-projects/             # Active work
│   ├── active/
│   ├── planning/
│   └── complete/
├── 40-structure/            # MOCs, indexes
├── 50-requests/             # Formal asks
│   ├── open/
│   ├── in-progress/
│   ├── blocked/
│   └── closed/
├── 60-archive/              # Completed/deprecated
└── 99-meta/                 # Templates, config
    └── templates/
```

### Document Types

| Type | Stage | Purpose | Example |
|------|-------|---------|---------|
| `fleeting` | Capture | Quick notes, raw thoughts | Meeting notes, daily logs |
| `literature` | Source | Notes on external content | Book highlights, article summaries |
| `permanent` | Atomic | Evergreen knowledge | Concepts, patterns, methods |
| `project` | Work | Active initiatives | Project plans, goals, deliverables |
| `structure` | Navigation | Maps of content | MOCs, indexes, hub pages |
| `request` | Action | Formal asks | Tasks with acceptance criteria |

### 4-Tier Access Control

| Level | Visibility | Use For |
|-------|------------|---------|
| `public` | Anyone | Project descriptions, philosophy |
| `network` | Extended network | Meeting notes, member profiles |
| `team` | Core idirnet | Contracts, budgets, internal decisions |
| `leadership` | Kev + Laura | Strategy, personnel, negotiations |

**Security:** 404-not-403 principle — unauthorized requests return "not found" not "forbidden".

### TSM Framework Integration

Triple Stack Model from Kev's MPhil thesis:

```
┌─────────────────────────────────────────────────────────┐
│                    GLOBAL STACK                         │
│           (Infrastructure, Collective)                  │
├─────────────────────────────────────────────────────────┤
│  Ground → Root → Space → Bridge → Horizons → Crown    │
│     ↓       ↓      ↓       ↓        ↓         ↓       │
│  Econ   Instit   Environ  Bridge   Culture   Power    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   INTERNAL STACK                        │
│         (Embodied Experience, Individual)               │
├─────────────────────────────────────────────────────────┤
│  Ground → Root → Space → Bridge → Horizons → Crown    │
│     ↓       ↓      ↓       ↓        ↓         ↓       │
│  Body   Emotion  Percept  Discourse  Spirit   Will    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   EXTERNAL STACK                        │
│         (Mediation, Tools, Interfaces)                  │
├─────────────────────────────────────────────────────────┤
│  Ground → Root → Space → Bridge → Horizons → Crown    │
│     ↓       ↓      ↓       ↓        ↓         ↓       │
│  Artefact Material  Platform  Governance  Symbol  Meta│
└─────────────────────────────────────────────────────────┘
```

Each document can be tagged with `tsm_stack` and `tsm_node` for ontological positioning.

---

## Template System (19 Templates)

**Classification trigger:** Leading keyword in content

### Layer 1: Team Core

| # | Template | Keyword | Document Type | TSM Mapping |
|---|----------|---------|---------------|-------------|
| 1 | Decision | `Decision:` | `decision` | global/horizon-2 |
| 2 | Risk | `Risk:` | `risk` | global/horizon-1 |
| 3 | Milestone | `Milestone:` | `milestone` | global/bridge |
| 4 | Spec | `Spec:` | `spec` | external/platform |
| 5 | Meeting | `Meeting with` | `meeting` | internal/discourse |
| 6 | Person | `[Name] —` | `person` | internal/emotion |
| 7 | Stakeholder | `Stakeholder:` | `stakeholder` | external/engagement |
| 8 | Sent | `Sent:` | `sent` | internal/discourse |

### Layer 2: Role Templates

| # | Template | Keyword | Document Type | Primary User |
|---|----------|---------|---------------|--------------|
| 9 | Budget | `Budget:` | `budget` | Laura |
| 10 | Invoice | `Invoice:` | `invoice` | Laura / Kev |
| 11 | Funding | `Funding:` | `funding` | Laura / Kev |
| 12 | Legal | `Legal:` | `legal` | Laura / Kev |
| 13 | Compliance | `Compliance:` | `compliance` | Anyone |
| 14 | Contract | `Contract:` | `contract` | Laura |

### Layer 3: Personal

| # | Template | Keyword | Document Type | Notes |
|---|----------|---------|---------------|-------|
| 15 | Insight | `Insight:` | `insight` | Atomic ideas |
| 16 | AI Save | `Saving from` | `ai_save` | AI outputs as sources |
| 17 | Nutrition | `Ate:` | `nutrition` | Health tracking |
| 18 | Health | `Health:` | `health` | Personal wellbeing |
| 19 | Home | `Home:` | `home` | Personal tasks |

---

## Migration Status

### Current System (Database-Centric)

```sql
-- Core table
create table thoughts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  metadata jsonb,  -- template, type, people, action_items, topics, source
  created_at timestamptz default now()
);
```

### Migration Plan (6 Phases)

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| 1. Assessment | 1 week | Inventory, mapping, planning | ✅ Complete |
| 2. Infrastructure | 1 week | Git repo, DB schema, sync | ⏳ Ready to start |
| 3. Content Migration | 2 weeks | Tier 1-3 data migration | ⏳ Pending |
| 4. Knowledge Graph | 3 days | Wikilink extraction, backlinks | ⏳ Pending |
| 5. App Updates | 1 week | Document viewer, search UI | ⏳ Pending |
| 6. Validation | 3 days | Testing, rollback plan | ⏳ Pending |

### Migration Scripts

Location: `~/OPENBRAIN/openBrain/scripts/migration/`

| Script | Purpose |
|--------|---------|
| `export-data.ts` | Export thoughts from Supabase to JSON |
| `transform-to-markdown.ts` | Convert JSON to Markdown + frontmatter |
| `validate-links.ts` | Check for broken wikilinks |
| `MIGRATION_WORKSHEET.md` | Track migration progress |

**Usage:**
```bash
cd scripts/migration
npm install

# Export decisions
npm run export:decisions

# Transform to Markdown
npm run transform:decisions

# Validate links
npm run validate
```

### Priority Tiers

**🔴 Tier 1 (Critical)** — ~200 records
- Decisions, Meeting Debriefs, Specs, Risks

**🟡 Tier 2 (High)** — ~230 records  
- Person Notes, Insights, AI Saves, Sent

**🟢 Tier 3 (Medium/Low)** — ~130 records
- Remaining 11 templates

---

## Database Schema (Current)

### Core Tables

```sql
thoughts
  - id, content, embedding (vector 1536)
  - doc_type, access, status
  - metadata (JSONB: template, action_items, people, etc.)
  - tags[], aliases[], title, description
  - source_author, source_url
  - created_at, updated_at

requests
  - thought_id (FK), title, description
  - status (open|in_progress|review|completed|blocked)
  - priority, assigned_to, requested_by, due_date
  - acceptance_criteria (JSONB), dependencies[], blocks[]

relationships
  - source_id, target_id (FKs to thoughts)
  - rel_type (derives_from|relates_to|contradicts|supports|references)
  - strength (0.0-1.0), metadata

scheduled_actions
  - thought_id, action_text
  - scheduled_method (google-calendar|reclaim|todoist)
  - scheduled_at, external_id, status
```

### Migrations

Located in `~/supabase/migrations/`:

| Migration | What It Does |
|-----------|--------------|
| `001_core_schema.sql` | Enums, tables, RLS, basic functions |
| `002_vector_search.sql` | pgvector, similarity search, hybrid search |
| `003_data_integrity.sql` | Validation, triggers, audit logs |
| `004_scheduled_jobs.sql` | pg_cron jobs, daily briefing, weekly review |
| `005_api_functions.sql` | API functions for Edge Functions to call |

**Apply:**
```bash
psql $SUPABASE_DB_URL -f supabase/migrations/001_core_schema.sql
```

---

## Edge Functions

### Deployed

```bash
supabase functions deploy ingest-thought      # Slack capture
supabase functions deploy meeting-notes       # Transcript processing
supabase functions deploy schedule-actions    # Reclaim/GCal/Todoist integration
```

### File Locations

```
~/services/supabase/functions/
├── ingest-thought/
│   ├── index.ts       # Slack webhook handler
│   └── deno.json
├── meeting-notes/
│   ├── index.ts       # Transcript parser
│   └── deno.json
└── schedule-actions/
    ├── index.ts       # Action item scheduling
    └── deno.json
```

---

## API Functions (Database)

### Ingest
```sql
capture_thought(content, embedding, metadata, doc_type, access, tags, ...)
batch_capture_thoughts(thoughts[])
```

### Retrieval
```sql
get_thought_full(thought_id, user_email)
list_thoughts(filters..., user_email)
search_similar_thoughts(query_embedding, threshold, limit, user_email)
hybrid_search(query, query_embedding, text_weight, vector_weight, ...)
find_related_thoughts(thought_id, depth)
suggest_related_thoughts(thought_id, threshold, limit)
```

### Updates
```sql
update_thought(thought_id, updates, user_email)
update_thought_embedding_api(thought_id, embedding, model)
delete_thought(thought_id, user_email, force)
```

### Work Management
```sql
create_request(thought_id, title, description, priority, assigned_to, ...)
update_request_status(request_id, new_status, user_email)
create_relationship(source_id, target_id, rel_type, strength, ...)
```

### Stats
```sql
get_dashboard_stats(user_email)
generate_daily_briefing()
generate_weekly_review()
```

---

## Scheduled Jobs (pg_cron)

| Job | Schedule | What It Does |
|-----|----------|--------------|
| `refresh-search-index` | Every 15 min | Refreshes materialized view |
| `auto-promote-fleeting` | 6 AM daily | Promotes old fleeting notes with backlinks |
| `auto-suggest-relationships` | 4 AM daily | Creates relationships for unlinked thoughts |
| `daily-briefing` | 8 AM weekdays | Generates + queues morning briefing |
| `weekly-review` | 6 PM Sunday | Generates weekly summary |
| `process-notifications` | Every 5 min | Sends queued Slack/email notifications |
| `health-metrics` | Every hour | Records system health stats |
| `cleanup-audit-logs` | 2 AM Sunday | Deletes logs older than 90 days |
| `cleanup-search-logs` | 3 AM daily | Deletes query logs older than 30 days |

**View jobs:**
```sql
SELECT * FROM list_scheduled_jobs();
```

---

## Morning Briefing Dashboard

**Location:** `~/OPENBRAIN/openBrain/apps/dashboard/`

### Stack
- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase client
- date-fns

### Features
- Stats overview (thoughts, requests, schedules)
- Yesterday's captures by template
- Open action items with checkboxes
- People context (recent mentions)
- Weather (Dublin)
- Clean Energy ETFs (ICLN, TAN, PBW, QCLN)
- Good News Network feed
- **Reclaim integration** (today's schedule + unscheduled actions)

### API Routes
```
/api/briefing      # Combined Open Brain data
/api/weather       # OpenWeather
/api/news          # Good News Network RSS
/api/finance       # Yahoo Finance
/api/reclaim       # Reclaim tasks + unscheduled actions
/api/reclaim/schedule  # POST to schedule actions
```

### Run Locally
```bash
cd apps/dashboard
cp .env.local.example .env.local
# Add your Supabase, OpenWeather, Reclaim keys
npm run dev
```

---

## Reclaim.ai Integration

Three approaches implemented:

### Option 1: Google Calendar Bridge (Recommended)
- Creates events with `[Open Brain]` prefix
- Reclaim auto-detects and schedules
- Uses GCal transparency for flexibility

### Option 2: Reclaim API Direct
- Direct API calls to `api.reclaim.ai`
- Creates tasks with `autoSchedule: true`
- Requires `RECLAIM_API_KEY`

### Option 3: Todoist Bridge
- Creates tasks with `open-brain` label
- Reclaim syncs Todoist automatically

### Template → Category Mapping

| Template | Category | Duration | Priority |
|----------|----------|----------|----------|
| Decision | Strategic | 30min | High |
| Risk | Urgent | 45min | High |
| Spec | Deep Work | 2hr | Medium |
| Budget, Funding, Legal, Compliance | Finance/Urgent | 1hr | High |
| Milestone | Planning | 30min | Medium |
| Stakeholder | Communication | 30min | Medium |
| Meeting Debrief, Sent | Admin | 15min | Low |

---

## Google Workspace Integration

### Google Drive Folders

| Purpose | Folder ID | Location |
|---------|-----------|----------|
| Source (Gemini transcripts) | `1DUDxC91yfTxseMSBHlk_EpIhyxpdVeC1` | My Drive > Meet Recordings |
| Output (summaries) | `1vMbn6SLMLxe7YYUNabhXtz5aqFsEu2BC` | Team Drive > 00_meetingNotes > Open Brain Meeting Notes |

### Google Apps Script

**Location:** script.google.com (search "Open Brain Meeting Notes")

**Function:** `processGeminiNotes()`
- Runs every 15 minutes (time-driven trigger)
- Reads Meet Recordings folder
- Sends to `meeting-notes` Edge Function
- Creates summary doc in shared folder
- Marks processed: `ob-processed` in file description

---

## AI Team Pipeline (Pipeline B)

```
Kimi deep research ──────┐
                         ├──> Opus decides ──> Sonnet builds ──> Opus corrects
Gemini gathers Google ───┘
                         ──> Kimi validates
                         ──> Gemini checks Google integration
                         ──> Codex stress tests at build
```

| Step | Model | Job |
|------|-------|-----|
| 1a. Code research | Kimi 2.5 | Deep research, codebase analysis |
| 1b. Google research | Gemini CLI | Calendar, Gmail, Drive context |
| 2. Decision | Claude Opus 4.6 | Architecture, roadmap, prompts |
| 3. Implementation | Claude Sonnet 4.6 | Code, docs, config |
| 4. Correction | Claude Opus 4.6 | Review, fix logic |
| 5. Validation | Kimi 2.5 | Validate against research |
| 6. Integration | Gemini CLI | Google Workspace fit |
| 7. Build gate | Codex (OpenAI) | Stress tests, error analysis |

**Quick commands (`ob` is on PATH):**
```bash
ob pipeline                    # Full Pipeline B
ob pipeline --dry-run          # Preview steps
ob kimi research               # Deep research
ob gemini briefing             # Morning briefing data
ob codex                       # Stress test
```

---

## Environment Variables

### Edge Functions (.env or Supabase Secrets)

```bash
SUPABASE_URL=https://jeuxslbhjubxmhtzpvqf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
OPENROUTER_API_KEY=...
MCP_ACCESS_KEY=...
SLACK_BOT_TOKEN=...
SLACK_CAPTURE_CHANNEL=#log

# Reclaim integration (optional)
RECLAIM_API_KEY=...
GOOGLE_CALENDAR_API_KEY=...
TODOIST_API_KEY=...
```

### Dashboard (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENWEATHER_API_KEY=...
RECLAIM_API_KEY=...
```

---

## Current State

### Completed (Original Phases 0-4)

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Foundation | ✅ | Core database, Edge Functions |
| Phase 1: Templates v2 | ✅ | 19 templates, 3 layers |
| Phase 2: Meeting Notes | ✅ | Automated transcript processing |
| Phase 3: Team Onboarding | ⏳ | Kris pending Gemini folder ID |
| Phase 4: Morning Briefing | ✅ | Dashboard built, needs deploy |

### New Phases from idirnet (9-15)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 9: Document Type System | ⏳ | Zettelkasten folder structure |
| Phase 10: Frontmatter Schema | ⏳ | Standardized YAML schema |
| Phase 11: 4-Tier Access Control | ⏳ | RLS with 404-not-403 |
| Phase 12: Request Tracking | ⏳ | Formal asks with acceptance criteria |
| Phase 13: Knowledge Graph | ⏳ | Wikilinks, backlinks, relationships |
| Phase 14: TSM Framework | ⏳ | 21-node ontological structure |
| Phase 15: Remote-Native Protocols | ⏳ | Async handoffs, ADR template |

### Completed in This Session

| Deliverable | Location | Size |
|-------------|----------|------|
| PLAYBOOK.md | `~/OPENBRAIN/openBrain/PLAYBOOK.md` | 41 KB |
| MIGRATION_GUIDE.md | `~/OPENBRAIN/openBrain/MIGRATION_GUIDE.md` | 27 KB |
| MIGRATION_ASSESSMENT.md | `~/OPENBRAIN/openBrain/MIGRATION_ASSESSMENT.md` | 14.6 KB |
| Migration Scripts | `~/OPENBRAIN/openBrain/scripts/migration/` | 4 files |
| Updated ROADMAP.md | `~/OPENBRAIN/openBrain/docs/status/ROADMAP.md` | 20 KB |
| KNOWLEDGE_ARCHITECTURE.md | `~/OPENBRAIN/openBrain/KNOWLEDGE_ARCHITECTURE.md` | 6 KB |
| IDIRNET_EXTRACTION_SUMMARY.md | `~/OPENBRAIN/openBrain/IDIRNET_EXTRACTION_SUMMARY.md` | 11 KB |

---

## Key Commands

```bash
# Deploy Edge Functions
supabase functions deploy ingest-thought
supabase functions deploy meeting-notes
supabase functions deploy schedule-actions

# Set secrets
supabase secrets set KEY=value

# Database
psql $SUPABASE_DB_URL -f supabase/migrations/001_core_schema.sql

# Dashboard
cd apps/dashboard && npm run dev

# Migration Scripts
cd scripts/migration
npm run export:decisions
npm run transform:decisions
npm run validate

# AI Review
./scripts/kimi-agent.sh review
./scripts/kimi-agent.sh security
ob codex
```

---

## Key Decisions

1. **Document Types + Templates:** Templates classify *topic domain* (what it's about). Document types classify *knowledge stage* (how processed it is). Both dimensions required.

2. **Hybrid Architecture:** Document system (Git + Markdown) for authorship + portability. Database for search + relationships. Sync layer keeps them aligned.

3. **4-Tier Access Control:** Without access control, users self-censor. With clear tiers, people capture freely knowing the right audience will see it.

4. **Row Level Security:** Access enforced at database level, not application layer. Prevents data leakage even if API is compromised.

5. **Knowledge Graph:** Relationships enable discovery, not just search. `[[wikilinks]]` and `related` fields create emergent structure.

6. **TSM Framework:** 21-node ontological structure provides shared vocabulary for positioning ideas across personal/collective and abstract/concrete dimensions.

7. **Migration Strategy:** Parallel systems during transition. Database remains source of truth until validation complete. Git becomes source of truth after.

---

## Files Reference

| File | Purpose |
|------|---------|
| `docs/process/HANDOVER.md` | This file — system overview |
| `CLAUDE.md` | Agent routing, AI pipeline |
| `docs/status/ROADMAP.md` | All 15 phases, checkboxes, deploy commands |
| `PLAYBOOK.md` | 16KB field guide: templates, workflows, examples |
| `MIGRATION_GUIDE.md` | Complete migration plan (6 phases) |
| `MIGRATION_ASSESSMENT.md` | Phase 1 assessment report |
| `KNOWLEDGE_ARCHITECTURE.md` | TSM Framework, design decisions |
| `IDIRNET_EXTRACTION_SUMMARY.md` | Knowledge transfer from idirnet |
| `RECLAIM_INTEGRATION.md` | Scheduling integration details |

---

## Next Steps

1. **Review HANDOVER.md** — Ensure accuracy
2. **Start Phase 2** — Infrastructure setup (Git repo, DB schema, sync)
3. **Or begin Tier 1 Migration** — Export decisions, transform, validate
4. **Or deploy Dashboard** — Get Morning Briefing live on Vercel

See `docs/status/ROADMAP.md` for full phase details and priorities.
