# Open Brain — Agent Instructions

Last Updated: March 16, 2026

## What This Is

Open Brain is a personal and team knowledge capture system. It now runs within the **Kimi Code** architecture layer — Claude Code-inspired enhancements on top of Kimi CLI.

This file is the agent routing instructions.

---

## Architecture Context

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KIMI CODE SYSTEM                                │
│                    (Claude Code + Kimi Integration)                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Session     │  │  Cost        │  │  Plan/Act/   │  │  AI Team   │ │
│  │  Management  │  │  Tracking    │  │  Review Modes│  │  Pipelines │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                  │                │        │
│         └─────────────────┴──────────────────┴────────────────┘        │
│                                    │                                   │
│                                    ▼                                   │
│                         ┌─────────────────┐                            │
│                         │  Kimi CLI       │                            │
│                         │  (base layer)   │                            │
│                         └────────┬────────┘                            │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      OPEN BRAIN PROJECT                                │
│                   (One project within Kimi Code)                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Knowledge   │  │  Database    │  │  Morning     │  │  Reclaim   │ │
│  │  Capture     │  │  Schema      │  │  Briefing    │  │  Scheduler │ │
│  │  (19 tmpl)   │  │  (6 tables)  │  │  Dashboard   │  │            │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Before Doing Anything

1. **Read `ROADMAP.md`** — know what phase we're in, what's done, what's next
2. **Read project memory** at `~/.claude/projects/-Users-kevfreeney-OPENBRAIN-openBrain/memory/MEMORY.md`
3. **Check Kimi Code context** — `~/.kimi-code/sessions/` for active sessions
4. **Check the folder structure** below to understand where things live

---

## Folder Structure

```
openBrain/                          <- You are here
  CLAUDE.md                         <- This file. Agent routing.
  ROADMAP.md                        <- Living roadmap. 8+ phases.
  HANDOVER.md                       <- Complete architecture reference.
  RECLAIM_INTEGRATION.md            <- Reclaim.ai integration guide.
  apps/my-app/                      <- Morning Briefing Dashboard
  
~/supabase/functions/               <- Edge Functions
  ingest-thought/                   <- Slack capture pipeline
  meeting-notes/                    <- Transcript extraction
  schedule-actions/                 <- Reclaim/GCal/Todoist integration
  
~/supabase/migrations/              <- Database migrations
  001_core_schema.sql               <- Document types, access control
  002_vector_search.sql             <- pgvector, similarity search
  003_data_integrity.sql            <- Triggers, audit, validation
  004_scheduled_jobs.sql            <- pg_cron, briefings, reviews
  005_api_functions.sql             <- API functions for Edge Functions
  006_claude_code_integration.sql   <- Sessions, cost tracking, plans
  
~/.kimi-code/                       <- Kimi Code system (NEW)
  bin/kc                            <- Main CLI command
  config/system.toml                <- Configuration, model pricing
  lib/pipelines/                    <- AI Team pipelines
  skills/                           <- Reusable skill prompts
  sessions/                         <- Session storage
```

---

## System Architecture

### Core Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Database** | Supabase (PostgreSQL) | Primary data store with RLS |
| **Edge Functions** | Deno/TypeScript | API endpoints, webhooks |
| **Embeddings** | OpenRouter + text-embedding-3-small | Vector search |
| **Classification** | OpenRouter + gpt-4o-mini | Template detection |
| **Auth** | Supabase + MCP keys | Row-level security |

### Integration Points

| Service | Integration | Status |
|---------|-------------|--------|
| **Slack** | #log channel webhook → ingest-thought | ✅ Active |
| **Google Meet** | Gemini transcripts → Apps Script → meeting-notes | ✅ Active |
| **Reclaim.ai** | 3 approaches (GCal/API/Todoist) | ✅ Active |
| **OpenWeather** | Dublin weather API | ✅ Active |
| **Yahoo Finance** | Clean energy ETF prices | ✅ Active |
| **Good News** | RSS feed | ✅ Active |

---

## Kimi Code Integration (Claude Code Features)

### What's New

Kimi Code wraps Kimi CLI with Claude Code-inspired features. Open Brain is one project within this system.

### Available Commands

```bash
# Session Management (NEW)
kc                              # Start new session
kc sessions                     # List recent sessions
kc resume <id>                  # Resume session
kc cost                         # Show cost & usage stats
kc digest                       # Weekly summary

# Plan Mode (equivalent to Claude Code /plan)
kc plan "Feature description"   # Create implementation plan
kc approve                      # Approve plan, switch to act
kc act                          # Switch to act mode

# Review Mode
code review                     # Analyze without modifying

# AI Team Pipelines (NEW)
kc pipeline research-decide-build-correct   # Full 7-step pipeline
kc pipeline quick-fix                        # Fast 2-step fix
kc pipeline security-audit                   # Security review

# Skills (NEW)
kc skill brainstorm             # Generate ideas
kc skill refactor <file>        # Safe refactoring guide

# Open Brain Integration
kc remember "Insight"           # Save to Open Brain
kc search "query"               # Search Open Brain
```

### Cost Tracking

Automatic cost tracking across all models:

| Model | Input/1K | Output/1K | Used In |
|-------|----------|-----------|---------|
| Kimi 2.5 | Free | Free | Research, validation |
| Claude Opus 4 | $0.015 | $0.075 | Decisions, correction |
| Claude Sonnet 4 | $0.003 | $0.015 | Implementation |
| Gemini 2.5 Pro | $0.00125 | $0.01 | Google context |

**Check costs:** `kc cost` or `kc digest`

### AI Team Pipeline B

The full 7-step pipeline:

```
Step 1a: Kimi 2.5 ─────────┐
           Deep research    ├── Parallel
Step 1b: Gemini 2.5 Pro ───┤   Google context
                            │
Step 2: Claude Opus 4 ◄────┘   Architecture decisions
              │
Step 3: Claude Sonnet 4        Implementation
              │
Step 4: Claude Opus 4          Review & correction
              │
Step 5: Kimi 2.5               Validation
              │
Step 6: Gemini 2.5 Pro         Integration check
              │
Step 7: Codex (OpenAI)         Stress test (final gate)
```

**Run it:**
```bash
kc pipeline research-decide-build-correct
```

---

## Template System (19 Templates, 3 Layers)

Leading keyword triggers classification. Both Edge Functions know all 19.

### Layer 1: Team Core (8)

| Template | Keyword | Type | Emoji |
|----------|---------|------|-------|
| Decision | `Decision:` | task | 🎯 |
| Risk | `Risk:` | task | ⚠️ |
| Milestone | `Milestone:` | observation | 🏁 |
| Spec | `Spec:` | reference | 🔧 |
| Meeting Debrief | `Meeting with` | observation | 📋 |
| Person Note | `[Name] —` | person_note | 👤 |
| Stakeholder | `Stakeholder:` | person_note | 🤝 |
| Sent | `Sent:` | task | 📤 |

### Layer 2: Role (6)

| Template | Keyword | Type | Primary User |
|----------|---------|------|-------------|
| Budget | `Budget:` | observation | Laura |
| Invoice | `Invoice:` | task | Laura / Kev |
| Funding | `Funding:` | observation | Laura / Kev |
| Legal | `Legal:` | observation | Laura / Kev |
| Compliance | `Compliance:` | task | Anyone |
| Contract | `Contract:` | reference | Laura |

### Layer 3: Personal (5)

| Template | Keyword | Type | Notes |
|----------|---------|------|-------|
| Insight | `Insight:` | idea | Kev uses heavily |
| AI Save | `Saving from` | reference | AI outputs |
| Nutrition | `Ate:` | observation | Health tracking |
| Health | `Health:` | observation | Wellbeing |
| Home | `Home:` | observation | Personal tasks |

---

## Deploy

### Edge Functions

```bash
supabase functions deploy ingest-thought
supabase functions deploy meeting-notes
supabase functions deploy schedule-actions
```

### Database Migrations

Apply in order:

```bash
# If you have psql access
psql $SUPABASE_DB_URL -f ~/supabase/migrations/001_core_schema.sql
psql $SUPABASE_DB_URL -f ~/supabase/migrations/002_vector_search.sql
psql $SUPABASE_DB_URL -f ~/supabase/migrations/003_data_integrity.sql
psql $SUPABASE_DB_URL -f ~/supabase/migrations/004_scheduled_jobs.sql
psql $SUPABASE_DB_URL -f ~/supabase/migrations/005_api_functions.sql
psql $SUPABASE_DB_URL -f ~/supabase/migrations/006_claude_code_integration.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

---

## Working with Kimi Code

### Starting a Session

```bash
# Start fresh session
kc

# Or with context
kc start

# Check current session
kc cost
```

### Plan Mode Workflow

```bash
# Create a plan
kc plan "Build Phase 5 To-Do integration"

# Edit the generated plan
vim ~/.kimi-code/sessions/$(kc sessions | head -2 | tail -1 | awk '{print $1}')/plan.md

# Approve and execute
kc approve
# Now in act mode - implement the plan
```

### Using AI Team Pipeline

```bash
# Full pipeline for major features
kc pipeline research-decide-build-correct

# Quick fix for small issues
kc pipeline quick-fix

# Security review
kc pipeline security-audit
```

### Capturing to Open Brain

While working in any session:

```bash
# Save an insight
kc remember "Key insight: Use materialized views for search performance"

# Search previous insights
kc search "materialized views"
```

---

## Legacy Commands (still work)

```bash
# Original pipeline launcher
ob pipeline                    # Full Pipeline B
ob kimi research               # Kimi deep research
ob gemini briefing             # Gemini context gathering
ob codex                       # Codex stress test

# Direct scripts
./scripts/kimi-agent.sh research
./scripts/gemini-agent.sh briefing
```

---

## Rules

1. **Update ROADMAP.md** checkboxes as work completes
2. **Update project memory** when decisions or phase changes happen
3. **Use Kimi Code sessions** for all work (`kc` not just `kimi`)
4. **Track costs** — run `kc cost` before long operations
5. **Use plan mode** for multi-step features
6. **Every Edge Function change** gets deployed, reviewed, and tested
7. **Do not invent. Do not over-extract.** Short sentences. No em dashes.

---

## Quick Reference

| Task | Command |
|------|---------|
| Start working | `kc` |
| Check costs | `kc cost` |
| Create plan | `kc plan "title"` |
| Approve plan | `kc approve` |
| Run pipeline | `kc pipeline research-decide-build-correct` |
| Save thought | `kc remember "text"` |
| Search thoughts | `kc search "query"` |
| Weekly summary | `kc digest` |
| Deploy function | `supabase functions deploy <name>` |
| Apply migration | `psql $DB -f migrations/00X_*.sql` |

---

## Help

- **Kimi Code help:** `kc help`
- **This project:** See `HANDOVER.md` for complete architecture
- **Reclaim integration:** See `RECLAIM_INTEGRATION.md`
- **Database schema:** See migration files in `~/supabase/migrations/`
