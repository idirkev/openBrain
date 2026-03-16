# Open Brain Roadmap

Last updated: 2026-03-16

---

## Phase 0: Foundation (COMPLETE)

Core capture and classification pipeline.

- [x] Supabase project live (jeuxslbhjubxmhtzpvqf)
- [x] Slack #log channel webhook connected
- [x] ingest-thought Edge Function: captures text, generates embedding, extracts metadata
- [x] OpenRouter integration (gpt-4o-mini classification, text-embedding-3-small embeddings)
- [x] thoughts table in Supabase with vector search
- [x] Slack thread reply confirming capture
- [x] MCP tools connected (search_thoughts, list_thoughts, capture_thought, thought_stats)
- [x] 120+ thoughts captured across all types
- [x] Claude Code integration via MCP

**Source files:** ~/supabase/functions/ingest-thought/index.ts

---

## Phase 1: Template System v2 (COMPLETE)

Expanded from 8 personal templates to 19 across 3 layers.

- [x] Analysed 120 captured thoughts to identify missing domains
- [x] Designed 3-layer structure: Team Core (8), Role (6), Personal (5)
- [x] Updated ingest-thought classification prompt with 19 keyword rules
- [x] Updated ingest-thought Slack reply: shows template name + domain emoji
- [x] Needs deploy: `supabase functions deploy ingest-thought`

**Templates:**

| Layer | Templates |
|-------|-----------|
| Team Core | Decision, Risk, Milestone, Spec, Meeting Debrief, Person Note, Stakeholder, Sent |
| Role | Budget, Invoice, Funding, Legal, Compliance, Contract |
| Personal | Insight, AI Save, Nutrition, Health, Home |

**Source files:** ~/supabase/functions/ingest-thought/index.ts

---

## Phase 2: Automated Meeting Notes (COMPLETE)

Gemini transcripts auto-processed into structured chunks.

- [x] meeting-notes Edge Function: parses transcripts, extracts chunks per template, saves with embeddings
- [x] Updated extraction prompt to cover all Team Core, Finance, and Compliance templates
- [x] Google Apps Script: reads Meet Recordings folder, sends to Edge Function, creates summary doc
- [x] Output docs go to shared team folder (1vMbn6SLMLxe7YYUNabhXtz5aqFsEu2BC)
- [x] Processed files marked "ob-processed" to prevent duplicates
- [x] Needs deploy: `supabase functions deploy meeting-notes`
- [x] 13 existing transcripts in source folder ready for first automated run

**Google Drive:**
- Source: 1DUDxC91yfTxseMSBHlk_EpIhyxpdVeC1 (My Drive > Meet Recordings)
- Output: 1vMbn6SLMLxe7YYUNabhXtz5aqFsEu2BC (Team Drive > 00_meetingNotes > Open Brain Meeting Notes)

**Source files:** ~/supabase/functions/meeting-notes/index.ts, Google Apps Script at script.google.com

---

## Phase 3: Team Onboarding (IN PROGRESS)

Rolling out Open Brain to idirnet core team.

- [x] Kris email sent with full 19-template guide + Apps Script + setup instructions
- [ ] Kris provides his Gemini folder ID
- [ ] Kris sets up his own Apps Script instance
- [ ] Kris tests Slack capture with template keywords
- [ ] Laura onboarding (focus: Finance + Compliance templates)
- [ ] Jochem onboarding (focus: Stakeholder + Sent templates)
- [ ] Colm onboarding (focus: Spec + Milestone templates)
- [ ] Team agreement on Layer 1 (Team Core) as standard

---

## Phase 4: Morning Briefing Dashboard (NEXT)

Single web page, daily summary, phone-friendly.

- [ ] Scaffold Next.js app on Vercel
- [ ] Supabase query: yesterday's captures, open action items, people context
- [ ] Google Calendar API: today's schedule
- [ ] OpenWeather API: Dublin weather
- [ ] Positive news feed (Good News Network RSS or similar)
- [ ] Renewable energy tickers (Yahoo Finance API: ICLN, TAN)
- [ ] Render all on one page, optimised for mobile
- [ ] Scheduled Edge Function: 8am Slack DM with briefing summary
- [ ] Test and deploy

**Stack:** Next.js on Vercel, Supabase client, Google Calendar API, OpenWeather, Yahoo Finance

---

## Phase 5: To-Do Integration

Action items from captures auto-populate structured lists.

- [ ] Create `work_todos` table in Supabase (idirnet tasks, Brendan items, CCC items)
- [ ] Create `personal_todos` table in Supabase (home, shopping, health, BLG expenses)
- [ ] Auto-populate from thoughts with action_items in metadata
- [ ] Morning briefing displays both lists
- [ ] Google Calendar bidirectional sync via scheduled Edge Function

---

## Phase 6: Nutrition Tracking

Capture pattern for health goals.

- [ ] Ingest recognises `Ate:` and `Health:` templates (already in prompt)
- [ ] Rolling 7-day summary: sugar days vs clean days, meal consistency, gaps
- [ ] Morning briefing includes nutrition section
- [ ] Weekly trend in Sunday review

---

## Phase 7: Email Parsing

Forward emails to Open Brain for automatic extraction.

- [ ] Create email-ingest Edge Function endpoint
- [ ] Forward key emails to dedicated address (notetaker@idirnet.com)
- [ ] Extract action items, deadlines, people
- [ ] Auto-populate to-do lists
- [ ] Integration with meeting-notes pipeline for emailed transcripts

---

## Phase 8: Weekly Review Automation

Scheduled summary of the week's captures.

- [ ] Scheduled Edge Function: runs Sunday evening
- [ ] Queries week's thoughts by domain and template
- [ ] Generates structured weekly review
- [ ] Posts to Slack or sends via email
- [ ] Highlights: open action items, unresolved risks, upcoming deadlines

---

## Deploy Checklist (pending)

Run these in terminal to push current updates live:

```bash
supabase functions deploy ingest-thought
supabase functions deploy meeting-notes
```

---

## Reference

| Item | Location |
|------|----------|
| Supabase dashboard | https://supabase.com/dashboard/project/jeuxslbhjubxmhtzpvqf/functions |
| Local Edge Functions | ~/supabase/functions/ |
| Google Apps Script | script.google.com ("Open Brain Meeting Notes") |
| Project memory | ~/.claude/projects/-Users-kevfreeney-OPENBRAIN-openBrain/memory/ |
| This roadmap | ~/OPENBRAIN/openBrain/ROADMAP.md |
