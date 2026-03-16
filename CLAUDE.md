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

## AI Team

Five models. Pipeline B: Parallel Scout with correction loop.

```
Kimi deep research ──────┐
                         ├──> Opus decides ──> Sonnet builds ──> Opus corrects
Gemini gathers Google ───┘
                         ──> Kimi validates (against original research)
                         ──> Gemini checks Google integration
                         ──> Codex stress tests at build
```

| Step | Model | Job | Cost |
|------|-------|-----|------|
| 1a. Code research | Kimi 2.5 | Deep research, codebase analysis, swarm mode | Low |
| 1b. Google research | Gemini CLI + Kev | Gather Calendar, Gmail, Drive context | Free |
| 2. Decision | Claude Opus 4.6 | Architecture, roadmap, master prompts (with full context from 1a+1b) | High |
| 3. Implementation | Claude Sonnet 4.6 | Fills in code, docs, config from Opus plan | Medium |
| 4. Correction | Claude Opus 4.6 | Reviews Sonnet output, fixes logic, ensures quality | High |
| 5. Validation | Kimi 2.5 | Validates against its original research. Did we miss anything? | Low |
| 6. Integration check | Gemini CLI + Kev | How does the output fit into Google Workspace? | Free |
| 7. Build gate | Codex (OpenAI) | Stress tests, error analysis, catches mistakes | High |

**How to use in Claude Code:**
- Steps 1a + 1b run in parallel (Kimi terminal + Gemini terminal)
- Opus (`/model opus`) for steps 2 and 4. Decides, then corrects.
- Sonnet (`/model sonnet`) for step 3. Does all the heavy lifting.
- Subagents default to Sonnet via `model: "sonnet"` parameter.
- Steps 5 + 6 can also run in parallel (Kimi terminal + Gemini terminal).

**Quick commands (`ob` is on PATH):**
```bash
ob pipeline                    # Full Pipeline B (all 7 steps)
ob pipeline --dry-run          # Preview steps, no execution
ob pipeline --headless         # Fully automated via claude -p
ob pipeline --from 3           # Resume from step N

ob kimi research               # Deep research (swarm mode)
ob kimi review                 # Code review
ob kimi security               # Security audit
ob kimi report                 # Project report card

ob gemini briefing             # Morning briefing data
ob gemini email                # Email triage
ob gemini drive                # Drive search
ob gemini briefing --mode think   # Use Gemini Deep Think

ob codex                       # Codex stress test (final gate)

ob versions                    # Show model registry + CLI versions
ob update-check                # Check for CLI updates
ob benchmark --task "..."      # Multivariate test across models
ob help                        # Colour-coded help screen
```

**Manual mode (without `ob`):**
```bash
# Step 1a + 1b: Research (run in parallel, two terminal tabs)
./scripts/kimi-agent.sh research          # Kimi: deep codebase analysis
./scripts/gemini-agent.sh briefing        # Gemini: Google Workspace context

# Step 2: Opus decides (switch to /model opus in Claude Code)
# Step 3: Sonnet builds (switch to /model sonnet in Claude Code)
# Step 4: Opus corrects (switch to /model opus in Claude Code)

# Step 5 + 6: Validation (parallel)
./scripts/kimi-agent.sh review            # Kimi validates against research
./scripts/gemini-agent.sh drive           # Gemini checks Google integration

# Step 7: Codex stress tests at build
ob codex
```

## Rules

- Update ROADMAP.md checkboxes as work completes
- Update project memory when decisions or phase changes happen
- Every Edge Function change gets deployed, Codex-reviewed, and Kimi-reviewed before phase close
- Do not invent. Do not over-extract. Short sentences. No em dashes.
