# Open Brain System Handover

## Architecture

```
Slack #log channel
    |
    v (webhook)
Supabase Edge Function: ingest-thought
    |
    v (OpenRouter: gpt-4o-mini for classification, text-embedding-3-small for vectors)
Supabase `thoughts` table (content, embedding, metadata)

Google Meet > Gemini transcript > Google Drive (Meet Recordings folder)
    |
    v (Google Apps Script, every 15 min)
Supabase Edge Function: meeting-notes
    |
    v (OpenRouter: gpt-4o-mini for extraction, text-embedding-3-small for vectors)
Supabase `thoughts` table (one row per extracted chunk)
    |
    v (Apps Script creates summary doc)
Google Drive: shared folder "Open Brain Meeting Notes"
```

Everything runs in the cloud. Nothing local.

- **Supabase project**: jeuxslbhjubxmhtzpvqf
- **Dashboard**: https://supabase.com/dashboard/project/jeuxslbhjubxmhtzpvqf/functions
- **Auth key env var**: MCP_ACCESS_KEY (meeting-notes), SLACK_BOT_TOKEN + SLACK_CAPTURE_CHANNEL (ingest)

## Local File Locations (for editing and deploying)

```
~/supabase/functions/ingest-thought/index.ts   <- Slack capture pipeline
~/supabase/functions/ingest-thought/deno.json
~/supabase/functions/meeting-notes/index.ts     <- Meeting transcript pipeline
~/supabase/functions/meeting-notes/deno.json
```

## Deploy Commands (run from any directory in terminal)

```bash
supabase functions deploy ingest-thought
supabase functions deploy meeting-notes
```

Supabase CLI v2.75.0 installed via Homebrew. Update available: v2.78.1.

## Google Drive Folder IDs

- **Source (Gemini transcripts)**: 1DUDxC91yfTxseMSBHlk_EpIhyxpdVeC1 (My Drive > Meet Recordings)
- **Output (shared summaries)**: 1vMbn6SLMLxe7YYUNabhXtz5aqFsEu2BC (Team Drive > 00_meetingNotes > Open Brain Meeting Notes)

## Google Apps Script

- Lives at script.google.com (search for "Open Brain Meeting Notes")
- Runs `processGeminiNotes()` every 15 minutes via time-driven trigger
- Marks processed files with description "ob-processed" to prevent duplicates
- Output docs prefixed "OB: " and moved to shared output folder

## Template System (19 templates, 3 layers)

### Layer 1: Team Core (all idirnet members)

| # | Template | Keyword | Type | Emoji |
|---|----------|---------|------|-------|
| 1 | Decision | `Decision:` | task | Target |
| 2 | Risk | `Risk:` | task | Warning |
| 3 | Milestone | `Milestone:` | observation | Finish |
| 4 | Spec | `Spec:` | reference | Wrench |
| 5 | Meeting Debrief | `Meeting with` | observation | Clipboard |
| 6 | Person Note | `[Name] —` | person_note | Person |
| 7 | Stakeholder | `Stakeholder:` | person_note | Handshake |
| 8 | Sent | `Sent:` | task | Outbox |

### Layer 2: Role Templates

| # | Template | Keyword | Type | Primary User |
|---|----------|---------|------|-------------|
| 9 | Budget | `Budget:` | observation | Laura |
| 10 | Invoice | `Invoice:` | task | Laura / Kev |
| 11 | Funding | `Funding:` | observation | Laura / Kev |
| 12 | Legal | `Legal:` | observation | Laura / Kev |
| 13 | Compliance | `Compliance:` | task | Anyone flagging |
| 14 | Contract | `Contract:` | reference | Laura |

### Layer 3: Personal (per individual)

| # | Template | Keyword | Type | Notes |
|---|----------|---------|------|-------|
| 15 | Insight | `Insight:` | idea | Kev uses this heavily |
| 16 | AI Save | `Saving from` | reference | For keeping AI outputs |
| 17 | Nutrition | `Ate:` | observation | Personal health tracking |
| 18 | Health | `Health:` | observation | Personal wellbeing |
| 19 | Home | `Home:` | observation | Personal tasks |

## Current State (March 16, 2026)

### Done
- ingest-thought Edge Function updated with 19-template classification prompt
- ingest-thought Slack reply now shows template name + domain-specific emoji
- meeting-notes Edge Function updated with full template extraction prompt
- Google Apps Script created and tested
- 13 existing Gemini transcripts in source folder (pending first automated run)
- Kris email drafted with full setup instructions + Google Apps Script

### Deployed (March 16, 2026)
- ✅ `supabase functions deploy ingest-thought` (updated Slack reply)
- ✅ `supabase functions deploy meeting-notes` (updated extraction prompt)

### Next Phase
- Kris to provide his Gemini folder ID for his own Apps Script instance
- Laura, Jochem, Colm onboarding (they don't have Open Brain yet)
- Team agreement on which Layer 1 templates to adopt as standard
- Morning briefing dashboard (Phase 1 from earlier session)
- Weekly review automation
- Email forwarding pipeline (ingest from forwarded emails)

## Key Decisions Made

- Template system uses 3 layers: Team Core, Role, Personal
- Leading keyword is the classification trigger (no forms, no UI)
- Meeting-notes uses same `captureThought` pattern as Slack ingest (embedding per chunk)
- Output docs go to shared Drive folder, not individual folders
- Kris is first team member to onboard (has Open Brain already)
