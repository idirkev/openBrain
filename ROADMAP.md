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
- [x] Deployed: `supabase functions deploy ingest-thought`

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
- [x] Deployed: `supabase functions deploy meeting-notes`
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
- [ ] Gemini Gem: "Morning Brief" pulls today's calendar + unread priority emails + recent Drive activity
- [ ] Gemini output feeds into briefing page (replaces raw Google Calendar API calls)
- [ ] OpenWeather API: Dublin weather
- [ ] Positive news feed (Good News Network RSS or similar)
- [ ] Renewable energy tickers (Yahoo Finance API: ICLN, TAN)
- [ ] Render all on one page, optimised for mobile
- [ ] Scheduled Edge Function: 8am Slack DM with briefing summary
- [ ] Review and deploy

**Stack:** Next.js on Vercel, Supabase client, Gemini Gem (Calendar + Gmail + Drive), OpenWeather, Yahoo Finance

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

- [ ] Create Gemini Gem: "Email Triage" with access to Gmail
- [ ] Gem extracts: emails needing replies, deadlines, deliverables, action items, correspondence
- [ ] Gem classifies each item against Open Brain templates (Sent, Stakeholder, Decision, Compliance, Contract)
- [ ] Apps Script triggers Gem every 15 min, sends structured output to email-ingest Edge Function
- [ ] Edge Function stores pre-classified items (lighter work since Gemini already triaged)
- [ ] Create `email_items` table in Supabase (from, to, subject, action, due date, status, template)
- [ ] Mark processed emails with Gmail label "OB-processed" to prevent duplicates
- [ ] Morning briefing includes: emails needing reply, overdue responses, upcoming deadlines
- [ ] Review and deploy

**Architecture:**
```
Gmail (kev@idirnet.com)
    |
    v (Gemini Gem: Email Triage -- classifies, extracts, structures)
    |
    v (Google Apps Script, every 15 min)
Supabase Edge Function: email-ingest
    |
    v (embed, store -- classification already done by Gemini)
Supabase: thoughts table + email_items table
    |
    v
Morning briefing shows email status
```

**Source files:** Gemini Gem at gemini.google.com, Google Apps Script at script.google.com, ~/supabase/functions/email-ingest/index.ts

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
```
✅ ingest-thought - deployed
✅ meeting-notes - deployed
```

### After each phase build
```bash
# Deploy the new function
supabase functions deploy [function-name]

# Review during development (Kimi -- cheap, frequent)
./scripts/kimi-agent.sh review

# Commit
git add -A && git commit -m "Phase N: description"
```

### Before deployment
```bash
# Security audit (Kimi)
./scripts/kimi-agent.sh security

# Final quality gate (Codex -- runs after build)
codex exec --sandbox read-only \
  --full-auto \
  --skip-git-repo-check \
  "Review for bugs and logic errors" 2>/dev/null

# Full project report card (Kimi)
./scripts/kimi-agent.sh report
```

### AI team setup

| Step | Model | Cost | Setup |
|------|-------|------|-------|
| 1a. Code research | Kimi 2.5 | Low | `./scripts/kimi-agent.sh review` or swarm mode |
| 1b. Google research | Gemini CLI + Kev | Free | `./scripts/gemini-agent.sh briefing\|email\|drive` |
| 2. Decision | Claude Opus 4.6 | High | `/model opus`. Roadmap, architecture, master prompts. |
| 3. Implementation | Claude Sonnet 4.6 | Medium | `/model sonnet`. Code, docs, config. |
| 4. Correction | Claude Opus 4.6 | High | `/model opus`. Reviews and corrects Sonnet output. |
| 5. Validation | Kimi 2.5 | Low | `./scripts/kimi-agent.sh review`. Checks against original research. |
| 6. Integration | Gemini CLI + Kev | Free | `./scripts/gemini-agent.sh`. Google Workspace fit check. |
| 7. Build gate | Codex (OpenAI) | High | Codex CLI. Stress tests. Runs once before deploy. |

**Pipeline B:** Kimi + Gemini research in parallel > Opus decides > Sonnet builds > Opus corrects > Kimi validates > Gemini checks integration > Codex stress tests.

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
| Kimi launcher | ~/OPENBRAIN/openBrain/scripts/kimi-agent.sh |
| Gemini launcher | ~/OPENBRAIN/openBrain/scripts/gemini-agent.sh |
| This roadmap | ~/OPENBRAIN/openBrain/ROADMAP.md |
