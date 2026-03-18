# Open Brain — Agent Instructions

Last Updated: March 17, 2026

## System Position

openBrain is the knowledge layer of a three-layer system:

```
openBrain  →  idirnet (platform)  →  LINK (orchestration)
```

- openBrain stores everything: thoughts, captures, decisions, meeting notes, templates
- idirnet is the network. Shared governance, policies, community knowledge live here
- LINK is the orchestration dashboard inside idirnet. It uses openBrain as its knowledge source via MCP
- The loop: LINK consumes openBrain AND produces back into it. Pipeline outputs become captures.

**You are working on the knowledge layer.** The MCP bridge (`open-brain-mcp` Edge Function) is the seam connecting it to LINK. Protect that interface.

Long-term: each person gets their own openBrain node. They connect to idirnet's shared layer by choice. Do not build the federated model yet — solve one node first.

When a new integration is proposed: fill out `docs/process/INTEGRATION_TEMPLATE.md` before writing code.

---

## What This Is

Open Brain is Kev Freeney's personal knowledge capture system built on Supabase, Edge Functions, and MCP tools. 344 thoughts captured across 19 templates.

## Before Doing Anything

1. Read `docs/status/ROADMAP.md` — phases, checkpoints, what's next
2. Read project memory at `~/.claude/projects/-Users-kevfreeney-OPENBRAIN-openBrain/memory/MEMORY.md`
3. Read `docs/architecture/DATA-INTAKE-ARCHITECTURE.md` — how data enters
4. Read `docs/architecture/TSM-ORGANIZATIONAL-FRAMEWORK.md` — how data is organized
5. Read `docs/architecture/INCENTED-INTEGRATION.md` — token-based conviction voting concepts

## Folder Structure

```
openBrain/
  CLAUDE.md                 <- This file. Agent routing.
  README.md                 <- Project overview
  apps/dashboard/           <- Morning Briefing Dashboard (Next.js)
  services/supabase/        <- Repo copy of Supabase functions
  integrations/             <- Raycast + Google capture entrypoints
  docs/
    architecture/           <- System design and integration plans
    guides/                 <- Operator setup and deployment guides
    process/                <- Handoffs, commands, agent process docs
    status/                 <- Roadmap, status, progress, deployment state
  prompts/                  <- Agent prompts for pipeline steps
  scripts/                  <- CLI tools and launchers
  captures/                 <- AI session logs and captured artifacts
  archive/                  <- Historical docs

services/supabase/functions/   <- Repo-local Edge Functions
  _shared/google-auth.ts    <- Shared Google OAuth module
  calendar-sync/            <- Google Calendar sync
  drive-sync/               <- Google Drive sync
  email-ingest/             <- Gmail parsing pipeline
  google-auth/              <- OAuth flow handler
  google-webhook/           <- Google webhook receiver
  tasks-sync/               <- Google Tasks sync

~/supabase/functions/         <- External deploy source on disk
~/supabase/migrations/        <- Schema managed outside this repo
```

## System Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | Supabase (PostgreSQL) | Primary data store with RLS |
| Edge Functions | Deno/TypeScript | API endpoints, webhooks |
| Embeddings | OpenRouter + text-embedding-3-small | Vector search |
| Classification | OpenRouter + gpt-4o-mini | Template detection |
| MCP Tools | open-brain-mcp | search, list, capture, stats |
| Dashboard | Next.js on Vercel | Morning briefing |

### Active Integrations

| Service | Status |
|---------|--------|
| Slack #log → ingest-thought | ✅ Active |
| Google Meet → Apps Script → meeting-notes | ✅ Active |
| Reclaim.ai → schedule-actions | ✅ Active |
| OpenWeather, Yahoo Finance, Good News RSS | ✅ Active |
| Claude Code MCP (4 tools) | ✅ Active |
| Raycast Extension (obc, obs, obl, obst, obq) | ⏳ Built, install pending |

## Template System (19 Templates, 3 Layers)

Leading keyword triggers classification.

| Layer | Templates | Keywords |
|-------|-----------|----------|
| Team Core (8) | Decision, Risk, Milestone, Spec, Meeting, Person, Stakeholder, Sent | `Decision:`, `Risk:`, `Milestone:`, `Spec:`, `Meeting with`, `[Name] —`, `Stakeholder:`, `Sent:` |
| Role (6) | Budget, Invoice, Funding, Legal, Compliance, Contract | `Budget:`, `Invoice:`, `Funding:`, `Legal:`, `Compliance:`, `Contract:` |
| Personal (5) | Insight, AI Save, Nutrition, Health, Home | `Insight:`, `Saving from`, `Ate:`, `Health:`, `Home:` |

## Agent Model (D4 — Simplified)

| Role | Model | When |
|------|-------|------|
| Architect/Reviewer | Claude Opus 4.6 | Architecture decisions, code review |
| Builder | Claude Sonnet 4.6 | All implementation |
| Quality gate | Codex CLI | Post-build review |

### Opus → Sonnet Handoff

When Opus makes architecture decisions that Sonnet implements:

**Opus MUST provide:**
1. **The Decision** — What to build, why, priority
2. **Constraints** — Stack, location, interface, non-goals
3. **Success Criteria** — How to verify it's correct
4. **Rationale** — Why this decision (prevents re-deciding)
5. **References** — MUST READ vs DO NOT READ

**See:** `docs/process/OPUS-TO-SONNET-HANDOFF.md` for complete protocol

## Deploy

```bash
supabase functions deploy ingest-thought
supabase functions deploy meeting-notes
supabase functions deploy schedule-actions
supabase functions deploy open-brain-mcp
```

## Rules

1. Update `docs/status/ROADMAP.md` checkboxes as work completes
2. Update project memory when decisions or phase changes happen
3. Every Edge Function change gets deployed, reviewed, and tested
4. Do not invent. Do not over-extract. Short sentences. No em dashes.

## Quick Reference

| Task | Command |
|------|---------|
| Deploy function | `supabase functions deploy <name>` |
| Apply migration | `supabase db push` |
| Database schema | `~/supabase/migrations/` |
| Architecture docs | `docs/` directory |
| Agent prompts | `prompts/` directory |
| Progress tracking | `docs/status/PROGRESS_LOG.md` |
| Raycast extension | `integrations/raycast/` |
| Install Raycast | `cd integrations/raycast && ray install` |
| Run pipeline | `./scripts/pipeline.sh --task "description"` |

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `docs/architecture/DATA-INTAKE-ARCHITECTURE.md` | How information enters the system |
| `docs/architecture/TSM-ORGANIZATIONAL-FRAMEWORK.md` | TSM organizational framework |
| `docs/architecture/INCENTED-INTEGRATION.md` | Core Incented concepts |
| `docs/architecture/INCENTED-IDIRNET-INTEGRATION.md` | Incented + idirnet knowledge capture |
| `docs/process/CLAUDE-CODE-FEEDBACK-PLAN.md` | Handling feedback from Claude Code |
| `docs/process/OPUS-TO-SONNET-HANDOFF.md` | What Opus must provide to Sonnet |
| `docs/status/ROADMAP.md` | 16-phase development roadmap |
| `docs/status/PROJECT_STATUS.md` | Current system status |
