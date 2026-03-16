# Open Brain System Handover

Last Updated: March 16, 2026

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
│                            DATABASE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  thoughts   │◄──►│  requests   │    │relationships│    │scheduled_   │ │
│  │  (core)     │    │  (work)     │    │(knowledge  │    │actions      │ │
│  └──────┬──────┘    └─────────────┘    │   graph)    │    │             │ │
│         │                               └─────────────┘    └─────────────┘ │
│         │         ┌─────────────┐    ┌─────────────┐                       │
│         └────────►│  user_access│    │ audit_log   │                       │
│                   │  (4 tiers)  │    │             │                       │
│                   └─────────────┘    └─────────────┘                       │
│                                                                             │
│  Row Level Security (RLS) enabled on all tables                            │
│  Document Types: fleeting → literature → permanent → project → structure   │
│  Access Levels: public < network < team < leadership                       │
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

---

## Database Schema

### Document Type System (Zettelkasten-inspired)

Knowledge evolves through stages:

| Type | Description | Auto-promote? |
|------|-------------|---------------|
| `fleeting` | Raw capture, unprocessed | → permanent if 7+ days old + 2 backlinks |
| `literature` | Notes on external sources (books, articles) | No |
| `permanent` | Atomic ideas, written in own words | No |
| `project` | Active work with tasks, logs | No |
| `structure` | Maps of content, indexes (MOCs) | No |
| `request` | Formal ask with acceptance criteria | No |

### Access Control (4-Tier)

| Level | Who | Use For |
|-------|-----|---------|
| `public` | Anyone | Project descriptions, philosophy |
| `network` | Extended network | Meeting notes, member profiles |
| `team` | Core idirnet team | Contracts, budgets, internal decisions |
| `leadership` | Kev + Laura only | Strategic planning, personnel, negotiations |

**Security:** RLS policies enforce access at database level. Users cannot escalate beyond their tier.

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

---

## Migrations (Apply in Order)

Located in `~/supabase/migrations/`:

```bash
# Apply to Supabase
psql $SUPABASE_DB_URL -f supabase/migrations/001_core_schema.sql
psql $SUPABASE_DB_URL -f supabase/migrations/002_vector_search.sql
psql $SUPABASE_DB_URL -f supabase/migrations/003_data_integrity.sql
psql $SUPABASE_DB_URL -f supabase/migrations/004_scheduled_jobs.sql
psql $SUPABASE_DB_URL -f supabase/migrations/005_api_functions.sql
```

| Migration | What It Does |
|-----------|--------------|
| `001_core_schema.sql` | Enums, tables, RLS, basic functions |
| `002_vector_search.sql` | pgvector, similarity search, hybrid search, clustering |
| `003_data_integrity.sql` | Validation, triggers, audit logs, cascade behavior |
| `004_scheduled_jobs.sql` | pg_cron jobs, daily briefing, weekly review |
| `005_api_functions.sql` | API functions for Edge Functions to call |

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
~/supabase/functions/
├── ingest-thought/
│   ├── index.ts       # Slack webhook handler
│   └── deno.json
├── meeting-notes/
│   ├── index.ts       # Transcript parser
│   └── deno.json
├── schedule-actions/
│   ├── index.ts       # Action item scheduling (3 approaches)
│   └── deno.json
└── migrations/        # Database migrations
    ├── 001_core_schema.sql
    ├── 002_vector_search.sql
    ├── 003_data_integrity.sql
    ├── 004_scheduled_jobs.sql
    └── 005_api_functions.sql
```

---

## API Functions (Database)

These are SQL functions that Edge Functions call:

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

**Location:** `~/OPENBRAIN/openBrain/apps/my-app/`

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
cd apps/my-app
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

## Template System (19 Templates, 3 Layers)

**Classification trigger:** Leading keyword in content

### Layer 1: Team Core

| # | Template | Keyword | Type | Emoji |
|---|----------|---------|------|-------|
| 1 | Decision | `Decision:` | task | 🎯 |
| 2 | Risk | `Risk:` | task | ⚠️ |
| 3 | Milestone | `Milestone:` | observation | 🏁 |
| 4 | Spec | `Spec:` | reference | 🔧 |
| 5 | Meeting Debrief | `Meeting with` | observation | 📋 |
| 6 | Person Note | `[Name] —` | person_note | 👤 |
| 7 | Stakeholder | `Stakeholder:` | person_note | 🤝 |
| 8 | Sent | `Sent:` | task | 📤 |

### Layer 2: Role Templates

| # | Template | Keyword | Type | Primary User |
|---|----------|---------|------|-------------|
| 9 | Budget | `Budget:` | observation | Laura |
| 10 | Invoice | `Invoice:` | task | Laura / Kev |
| 11 | Funding | `Funding:` | observation | Laura / Kev |
| 12 | Legal | `Legal:` | observation | Laura / Kev |
| 13 | Compliance | `Compliance:` | task | Anyone |
| 14 | Contract | `Contract:` | reference | Laura |

### Layer 3: Personal

| # | Template | Keyword | Type | Notes |
|---|----------|---------|------|-------|
| 15 | Insight | `Insight:` | idea | Kev uses heavily |
| 16 | AI Save | `Saving from` | reference | AI outputs |
| 17 | Nutrition | `Ate:` | observation | Health tracking |
| 18 | Health | `Health:` | observation | Wellbeing |
| 19 | Home | `Home:` | observation | Personal tasks |

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

### Completed

| Phase | Status |
|-------|--------|
| Phase 0: Foundation | ✅ Complete |
| Phase 1: Template System v2 | ✅ Complete |
| Phase 2: Automated Meeting Notes | ✅ Complete |
| Phase 4: Morning Briefing Dashboard | ✅ Core built |
| Backend Architecture (5-step migration) | ✅ Complete |

### In Progress

| Phase | Status |
|-------|--------|
| Phase 3: Team Onboarding | ⏳ Kris pending Gemini folder ID |
| Phase 4: Dashboard Deploy | ⏳ Needs Vercel deploy |

### Pending

| Phase | Description |
|-------|-------------|
| Phase 5 | To-Do tables + Calendar bidirectional sync |
| Phase 6 | Nutrition tracking dashboard |
| Phase 7 | Gmail parsing (Gemini Gem) |
| Phase 8 | Weekly Review automation |

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
cd apps/my-app && npm run dev

# AI Review (run before major changes)
./scripts/kimi-agent.sh review
./scripts/kimi-agent.sh security
```

---

## Key Decisions

1. **Document Types + Templates:** Templates classify *topic domain* (what it's about). Document types classify *knowledge stage* (how processed it is). Both dimensions required.

2. **4-Tier Access Control:** Without access control, users self-censor. With clear tiers, people capture freely knowing the right audience will see it.

3. **Row Level Security:** Access enforced at database level, not application layer. Prevents data leakage even if API is compromised.

4. **Knowledge Graph:** Relationships enable discovery, not just search. `[[wikilinks]]` and `related` fields create emergent structure.

5. **Database Functions as API:** Edge Functions are thin wrappers. Core logic lives in SQL functions for performance and consistency.

---

## Reference

| Resource | Location |
|----------|----------|
| Supabase Dashboard | https://supabase.com/dashboard/project/jeuxslbhjubxmhtzpvqf |
| Project Root | `~/OPENBRAIN/openBrain/` |
| Edge Functions | `~/supabase/functions/` |
| Migrations | `~/supabase/migrations/` |
| Dashboard | `~/OPENBRAIN/openBrain/apps/my-app/` |
| Agent Routing | `~/OPENBRAIN/openBrain/CLAUDE.md` |
| Roadmap | `~/OPENBRAIN/openBrain/ROADMAP.md` |
| Reclaim Integration | `~/OPENBRAIN/openBrain/RECLAIM_INTEGRATION.md` |
