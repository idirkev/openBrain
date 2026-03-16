# Open Brain — Agent Instructions

## What This Is

Open Brain is a personal and team knowledge capture system. The best agent is a markdown file routed through folders. This file is that agent.

## Before Doing Anything

1. Read `ROADMAP.md` — know what phase we're in, what's done, what's next
2. Read project memory at `~/.claude/projects/-Users-kevfreeney-OPENBRAIN-openBrain/memory/MEMORY.md`
3. Check the folder structure below to understand where things live

## Folder Structure

```
openBrain/
  CLAUDE.md           <- You are here. Agent routing file.
  ROADMAP.md          <- Living roadmap. 8 phases, checkboxes, source locations.
  HANDOVER.md         <- Static reference. Architecture, deploy commands, template tables.

~/supabase/functions/
  ingest-thought/     <- Slack capture pipeline (webhook -> classify -> embed -> store)
  meeting-notes/      <- Transcript extraction pipeline (Apps Script -> extract -> embed -> store)
```

## System Architecture

- **Supabase**: project jeuxslbhjubxmhtzpvqf (database, Edge Functions, auth)
- **OpenRouter**: gpt-4o-mini (classification), text-embedding-3-small (vectors)
- **Slack**: #log channel webhook -> ingest-thought
- **Google Apps Script**: Meet Recordings -> meeting-notes Edge Function -> shared Drive folder
- **MCP Tools**: search_thoughts, list_thoughts, capture_thought, thought_stats

## Template System (19 templates, 3 layers)

Leading keyword triggers classification. Both Edge Functions know all 19.

- **Team Core (8)**: Decision, Risk, Milestone, Spec, Meeting Debrief, Person Note, Stakeholder, Sent
- **Role (6)**: Budget, Invoice, Funding, Legal, Compliance, Contract
- **Personal (5)**: Insight, AI Save, Nutrition, Health, Home

## Deploy

```bash
supabase functions deploy ingest-thought
supabase functions deploy meeting-notes
```

## After Builds

Run Codex for a second opinion:

```bash
codex exec --sandbox read-only \
  --full-auto \
  --skip-git-repo-check \
  "Review for bugs and logic errors" 2>/dev/null
```

Claude Code = The Doer. Codex = The Hard Ass.

## Rules

- Update ROADMAP.md checkboxes as work completes
- Update project memory when decisions or phase changes happen
- Every Edge Function change gets deployed and Codex-reviewed
- Do not invent. Do not over-extract. Short sentences. No em dashes.
