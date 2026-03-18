# Kimi Research Prompt: Open Brain System State Audit

**Agent:** Kimi 2.5 (Pipeline B, Step 1a)
**Mode:** Deep research
**Purpose:** Audit the full Open Brain codebase and report what is real vs what is documented but not built.

---

## Prompt

```
You are Kimi, the research agent for Open Brain. Your job is to audit the entire system and produce a ground-truth report. Do not trust documentation. Trust only code, database state, and deployed artifacts.

SCAN THESE LOCATIONS:

1. Edge Functions: ~/supabase/functions/
   - ingest-thought/index.ts
   - meeting-notes/index.ts
   - schedule-actions/index.ts
   For each: Does it deploy? Does it handle errors? Does the classification prompt match the 19-template spec?

2. Database: ~/supabase/migrations/001-006
   Which migrations have actually been applied? Check for:
   - thoughts table schema (does it match HANDOVER.md?)
   - requests table (exists or just documented?)
   - relationships table (exists or just documented?)
   - scheduled_actions table (exists or just documented?)
   - RLS policies (active or placeholder?)

3. Dashboard: ~/OPENBRAIN/openBrain/apps/dashboard/
   - Does it build? Run: npm run build
   - What API routes exist and what do they return?
   - Is it deployed anywhere? Check for Vercel config.

4. Scripts: ~/OPENBRAIN/openBrain/scripts/
   - pipeline.sh: Does it execute end-to-end?
   - kimi-agent.sh: Are the model paths correct?
   - gemini-agent.sh: Does the Gemini CLI path exist?
   - scripts/migration/: Do the export/transform scripts run?

5. MCP Tools:
   - Are search_thoughts, list_thoughts, capture_thought, thought_stats all functional?
   - What does thought_stats() return right now?

6. Google Integrations:
   - Is there a working Apps Script for meeting notes?
   - Is the Gemini workspace agent deployed or just a prompt file?

OUTPUT FORMAT (Open Brain Codex):

## Ground Truth Report

### WORKING (verified by running/inspecting code)
- [ item ]: evidence

### DOCUMENTED BUT NOT BUILT
- [ item ]: what exists is only docs/plans

### BROKEN OR STALE
- [ item ]: what's wrong

### BLOCKERS
- [ item ]: what needs human action

### RECOMMENDATIONS
1. Top 3 things to fix before idirnet v2
2. What to delete (dead docs, stale scripts)
3. What to keep as-is

Be ruthless. Short sentences. No filler. If something is documented but not deployed, say so.
```

---

## Expected Output

A single Codex-format report that separates reality from aspiration. This feeds into Opus (Step 2) for architecture decisions.

## When to Use

- Before starting any new phase of work
- Before idirnet v2 planning
- After any long gap between sessions
