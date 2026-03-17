# Open Brain — Agent Instructions

Last Updated: March 17, 2026

## What This Is

Open Brain is a personal and team knowledge capture system built on Supabase, Edge Functions, and MCP tools. 344 thoughts captured across 19 templates.

## Before Doing Anything

1. Read `ROADMAP.md` — phases, checkpoints, what's next
2. Read project memory at `~/.claude/projects/-Users-kevfreeney-OPENBRAIN-openBrain/memory/MEMORY.md`
3. Read `docs/DATA-INTAKE-ARCHITECTURE.md` — how data enters
4. Read `docs/TSM-ORGANIZATIONAL-FRAMEWORK.md` — how data is organized

## Folder Structure

```
openBrain/
  CLAUDE.md              <- This file. Agent routing.
  ROADMAP.md             <- Living roadmap. 15 phases.
  docs/                  <- Architecture docs
  prompts/               <- Agent prompts for pipeline steps
  apps/my-app/           <- Morning Briefing Dashboard (Next.js)
  scripts/               <- CLI tools, pipeline launcher
  archive/               <- Historical docs (pre-v2 consolidation)

~/supabase/functions/    <- Edge Functions
  ingest-thought/        <- Slack capture pipeline
  meeting-notes/         <- Transcript extraction
  open-brain-mcp/        <- MCP server (4 tools)
  schedule-actions/      <- Reclaim/GCal/Todoist

~/supabase/migrations/   <- 7 SQL migrations (001-007)
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
| Slack #log → ingest-thought | Active |
| Google Meet → Apps Script → meeting-notes | Active |
| Reclaim.ai → schedule-actions | Active |
| OpenWeather, Yahoo Finance, Good News RSS | Active |
| Claude Code MCP (4 tools) | Active |

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

## Deploy

```bash
supabase functions deploy ingest-thought
supabase functions deploy meeting-notes
supabase functions deploy schedule-actions
supabase functions deploy open-brain-mcp
```

## Rules

1. Update ROADMAP.md checkboxes as work completes
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
| Archived docs | `archive/` directory |
