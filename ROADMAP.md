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
- [x] Git repo initialised at ~/OPENBRAIN/openBrain/
- [x] CLAUDE.md agent routing file in project root

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

**Google Apps Script setup:** Standalone script with time-driven trigger (every 15 min). No deployment type needed. Just add trigger at script.google.com.

**Google Drive:**
- Source: 1DUDxC91yfTxseMSBHlk_EpIhyxpdVeC1 (My Drive > Meet Recordings)
- Output: 1vMbn6SLMLxe7YYUNabhXtz5aqFsEu2BC (Team Drive > 00_meetingNotes > Open Brain Meeting Notes)

**Source files:** ~/supabase/functions/meeting-notes/index.ts, Google Apps Script at script.google.com

---

## Phase 3: Team Onboarding (IN PROGRESS)

Rolling out Open Brain to idirnet core team.

- [x] Kris email sent with full 19-template guide + Apps Script + setup instructions
- [ ] Kris provides his Gemini folder ID
- [ ] Kris sets up his own Apps Script instance (standalone, time-driven trigger, every 15 min)
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
- [ ] Codex review against dashboard code
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
- [ ] Codex review against sync logic

---

## Phase 6: Nutrition Tracking

Capture pattern for health goals.

- [ ] Ingest recognises `Ate:` and `Health:` templates (already in prompt)
- [ ] Rolling 7-day summary: sugar days vs clean days, meal consistency, gaps
- [ ] Morning briefing includes nutrition section
- [ ] Weekly trend in Sunday review

---

## Phase 7: Gmail Parsing (every 15 min)

Automated inbox scanning for action items, deadlines, and correspondence.

- [ ] Create gmail-ingest Google Apps Script (reads inbox every 15 min)
- [ ] Scan for: emails needing replies, deadlines, deliverables, dates, action items
- [ ] Track: inbound (received), outbound (sent), awaiting reply
- [ ] Send extracted items to new email-ingest Edge Function
- [ ] Edge Function classifies using templates: Sent, Stakeholder, Decision, Compliance, Contract
- [ ] Create `email_items` table in Supabase (from, to, subject, action, due date, status)
- [ ] Mark processed emails with Gmail label "OB-processed" to prevent duplicates
- [ ] Morning briefing includes: emails needing reply, overdue responses, upcoming deadlines
- [ ] Codex review against email parsing logic

**Architecture:**
```
Gmail (kev@idirnet.com)
    |
    v (Google Apps Script, every 15 min)
Supabase Edge Function: email-ingest
    |
    v (classify, extract, embed)
Supabase: thoughts table + email_items table
    |
    v
Morning briefing shows email status
```

**Source files:** Google Apps Script at script.google.com, ~/supabase/functions/email-ingest/index.ts

---

## Phase 8: Weekly Review Automation

Scheduled summary of the week's captures.

- [ ] Scheduled Edge Function: runs Sunday evening
- [ ] Queries week's thoughts by domain and template
- [ ] Generates structured weekly review
- [ ] Posts to Slack or sends via email
- [ ] Highlights: open action items, unresolved risks, upcoming deadlines
- [ ] Codex review against review generation logic

---

## Deploy Checklist

### Pending now
```bash
supabase functions deploy ingest-thought
supabase functions deploy meeting-notes
```

### After each phase build
```bash
# Deploy the new function
supabase functions deploy [function-name]

# Codex review (requires OpenAI API key or ChatGPT Plus/Pro)
codex exec --sandbox read-only \
  --full-auto \
  --skip-git-repo-check \
  "Review for bugs and logic errors" 2>/dev/null

# Commit
git add -A && git commit -m "Phase N: description"
```

### Codex CLI setup
Current state: authenticated via ChatGPT free plan (kev@idirnet.com). Free plan blocks all exec models.

Fix option A (API key):
```bash
export OPENAI_API_KEY="sk-..."
```

Fix option B (upgrade ChatGPT, then re-auth):
```bash
codex auth logout
codex auth login
```

---

## Reference

| Item | Location |
|------|----------|
| Supabase dashboard | https://supabase.com/dashboard/project/jeuxslbhjubxmhtzpvqf/functions |
| Local Edge Functions | ~/supabase/functions/ |
| Google Apps Script (meetings) | script.google.com ("Open Brain Meeting Notes") |
| Google Apps Script (Gmail) | script.google.com ("Open Brain Gmail Ingest") — Phase 7 |
| Project memory | ~/.claude/projects/-Users-kevfreeney-OPENBRAIN-openBrain/memory/ |
| Agent routing | ~/OPENBRAIN/openBrain/CLAUDE.md |
| This roadmap | ~/OPENBRAIN/openBrain/ROADMAP.md |
