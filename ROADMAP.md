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

## Phase 4: Morning Briefing Dashboard (IN PROGRESS)

Single web page, daily summary, phone-friendly.

- [x] Scaffold Next.js app on Vercel
- [x] Supabase query: yesterday's captures, open action items, people context
- [ ] Gemini Gem: "Morning Brief" pulls today's calendar + unread priority emails + recent Drive activity
- [ ] Gemini output feeds into briefing page (replaces raw Google Calendar API calls)
- [x] OpenWeather API: Dublin weather
- [x] Positive news feed (Good News Network RSS or similar)
- [x] Renewable energy tickers (Yahoo Finance API: ICLN, TAN, PBW, QCLN)
- [x] Render all on one page, optimised for mobile
- [ ] Scheduled Edge Function: 8am Slack DM with briefing summary
- [ ] Review and deploy

**Progress:** Core dashboard built. Remaining: Gemini integration, scheduled Slack DM.

**Location:** `~/OPENBRAIN/openBrain/apps/my-app/`

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

## Phase 9: Document Type System (NEW - from idirnet)

Zettelkasten-inspired document taxonomy for knowledge management.

**Pivotal insight from idirnet:** Different thought types need different schemas and workflows. Not everything is a "thought" — some are fleeting captures, others are literature notes, permanent atomic ideas, projects, or structure notes.

- [ ] Extend `thoughts` table with `doc_type` field
- [ ] Create document type taxonomy:
  - `fleeting` — Quick capture, raw thought, to be processed (publish: false by default)
  - `literature` — Notes on books, articles, external sources (with source_author, source_url)
  - `permanent` — Atomic ideas, written in own words, stand alone (aliases field for linking)
  - `project` — Active work with status, tasks, logs (status: active|completed|on-hold)
  - `structure` — Maps of content, indexes, navigation (MOCs)
  - `request` — Formal ask with acceptance criteria, assignee, due_date
- [ ] Update ingest-thought to detect document type from content/keywords
- [ ] Create validation rules per type (e.g., literature notes require source)
- [ ] Add document type emoji to Slack replies
- [ ] Build type-specific views in dashboard

**Why this matters:** The 19 templates classify *topic domain* (what it's about). Document types classify *knowledge stage* (how processed it is). Both dimensions needed for complete knowledge management.

**Source pattern:** `idirnet/content/50-Templates/`

---

## Phase 10: Frontmatter Schema Standardization (NEW - from idirnet)

Standardized YAML metadata for all captures, enabling structured querying and cross-referencing.

**Pivotal insight from idirnet:** Every document has consistent frontmatter enabling programmatic access, filtering, and relationship mapping. This is the "API" of the knowledge base.

- [ ] Design canonical frontmatter schema:
```yaml
---
id: "202603161200"  # Sortable timestamp
title: "Document Title"
description: "One-line summary"
type: fleeting | literature | permanent | project | structure | request
status: draft | in-progress | review | published | archived
author: "name"
created: "2026-03-16"
updated: "2026-03-16"
tags: [topic, subtopic]
publish: true | false
access_level: public | network | team | leadership  # 4-tier from idirnet
domain: Team Core | Role | Personal  # Template layer
aliases: ["Alternative Name", "Abbreviation"]
related: [id1, id2, id3]  # Forward links
source_author: "Author Name"  # For literature
source_url: "https://..."  # For literature
due_date: "2026-03-20"  # For requests/projects
assigned: "name"  # For requests/projects
---
```
- [ ] Migrate existing thoughts to new schema (backfill)
- [ ] Update ingest-thought to generate full frontmatter
- [ ] Create MCP tool: `update_frontmatter(id, fields)`
- [ ] Create MCP tool: `query_by_frontmatter(filter)`
- [ ] Build relationship graph from `related` field

**Why this matters:** Frontmatter is the structured layer that makes the unstructured content queryable. Without it, we have a bag of text. With it, we have a knowledge graph.

**Source pattern:** `idirnet/content/**/*.md` frontmatter

---

## Phase 11: 4-Tier Access Control (NEW - from idirnet)

Privacy-first content governance with graduated access levels.

**Pivotal insight from idirnet:** Not all knowledge should be equally visible. A 4-tier model (public/network/team/leadership) matches organizational reality and enables confident capture of sensitive information.

- [ ] Create `access_policies` table in Supabase
- [ ] Define 4 tiers with clear boundaries:
  - `public` — Anyone can see (project descriptions, general philosophy)
  - `network` — Extended network (member profiles, meeting notes, process docs)
  - `team` — Core team only (contracts, budgets, internal decisions)
  - `leadership` — Kev + Laura only (strategic planning, personnel, negotiations)
- [ ] Update ingest-thought with `access_level` field (default: team)
- [ ] Build middleware/auth layer for MCP tools (respect access levels)
- [ ] Create `user_tiers` table mapping users to access levels
- [ ] Update search_thoughts MCP tool to filter by caller's access level
- [ ] Update list_thoughts MCP tool to respect access boundaries
- [ ] Add access level indicator to Slack replies (🔒 for non-public)

**Security principle:** Return 404 (not 403) for unauthorized access to prevent enumeration.

**Why this matters:** Without access control, users self-censor. With clear tiers, people capture freely knowing the right audience will see it.

**Source pattern:** `idirnet/docs/adr/adr-005-access-control.md`

---

## Phase 12: Request/Project Tracking (NEW - from idirnet)

Structured work requests with acceptance criteria, assignment, and lifecycle.

**Pivotal insight from idirnet:** Tasks need formal structure to be actionable. A "request" type with owner, due date, acceptance criteria, and dependencies transforms ideas into deliverables.

- [ ] Create `requests` table in Supabase (extends thoughts)
- [ ] Define request schema:
```yaml
type: request
status: open | in-progress | review | completed | blocked
priority: critical | high | medium | low
assigned: "person-name"
due_date: "YYYY-MM-DD"
acceptance_criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2
dependencies: [request-id-1, request-id-2]
blocks: [request-id-3]
critical_path_position: "#3 of 12"
```
- [ ] Create `projects` table for grouping requests
- [ ] Build request lifecycle workflow:
  - Creation → Assignment → In Progress → Review → Complete
- [ ] Add request template detection to ingest-thought (keywords: "Request:", "CRITICAL:", "Need:")
- [ ] Build critical path calculator (dependency graph traversal)
- [ ] Create MCP tool: `create_request(title, criteria, assignee, due)`
- [ ] Create MCP tool: `list_requests(filter)`
- [ ] Create MCP tool: `update_request_status(id, status)`
- [ ] Build request dashboard (Kanban view by status)

**Why this matters:** Thoughts are captured. Requests are delivered. Without structured requests, action items get lost in the stream of captures.

**Source pattern:** `idirnet/content/requests/*.md`

---

## Phase 13: Knowledge Graph & Network (NEW - from idirnet)

Bidirectional linking, relationship mapping, and emergent structure discovery.

**Pivotal insight from idirnet:** Knowledge is a graph, not a list. `[[wikilinks]]`, `related` fields, and automated relationship detection create emergent structure that reflects mental models.

- [ ] Parse `[[wikilinks]]` from thought content
- [ ] Extract `related` IDs from frontmatter
- [ ] Create `relationships` table (source_id, target_id, type, strength)
- [ ] Relationship types:
  - `derives_from` — Built upon another thought
  - `relates_to` — Connected concept
  - `contradicts` — Opposing view
  - `supports` — Evidence for
  - `references` — Cites/mentions
- [ ] Build backlink index (what links here?)
- [ ] Create MCP tool: `find_related(id, depth=1)`
- [ ] Build graph visualization (force-directed network)
- [ ] Implement "knowledge paths" (shortest path between two thoughts)
- [ ] Add "surprise me" feature (random traversal through graph)
- [ ] Create automated clustering (topics that emerge from graph structure)

**Why this matters:** Lists are for search. Graphs are for discovery. The knowledge graph enables serendipity — finding what you didn't know you were looking for.

**Source pattern:** `idirnet/content/30-Structure/MOC-*.md`, link syntax in notes

---

## Phase 14: TSM Framework Integration (NEW - from idirnet)

Triple Stack Model for organizing complex work across infrastructure, experience, and mediation.

**Pivotal insight from idirnet:** Complex projects need multi-dimensional organization. The TSM provides a 21-node framework (3 stacks × 7 planes) that ensures nothing falls through cracks.

- [ ] Create `tsm_nodes` table:
```yaml
node_id: "global-ground"
stack: global | internal | external
plane: Ground | Runtime | Circulation | ...
name: "Infrastructure"
description: "Power, HVAC, safety systems"
status: planned | active | complete | blocked
deliverables: [id1, id2, id3]
dependencies: [node-id-1]  # What must complete first
unlocks: [node-id-2]  # What this enables
```
- [ ] Map Open Brain features to TSM nodes (meta-work)
- [ ] Add `tsm_node` field to thoughts/requests
- [ ] Build TSM dashboard (visual grid of 21 nodes with status)
- [ ] Implement dependency tracking (blocked until X completes)
- [ ] Create critical path calculator across TSM nodes
- [ ] Add TSM context to weekly reviews (what stack is active?)

**TSM Stacks:**
- **Global** — Infrastructure & systems (Ground, Runtime, Circulation, Channels, Frames, Roles, Horizons)
- **Internal** — Embodied perception (Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown)
- **External** — Mediation & ritual (Space, Portal, Gesture, Mirror, Narrative, Atmosphere, Feedback Loop)

**Why this matters:** For complex projects, "todo lists" are insufficient. The TSM ensures coverage across all dimensions and makes dependencies explicit.

**Source pattern:** `idirnet/docs/tsm-framework.md`, `idirnet/content/docs/adr/adr-004-tsm.md`

---

## Phase 15: Remote-Native Documentation Protocol (NEW - from idirnet)

Documentation-first, async-by-default communication patterns for distributed teams.

**Pivotal insight from idirnet:** Remote-native teams (like open source projects) operate differently than office teams forced remote. Documentation is primary; meetings are secondary. Decisions are recorded; rationale is preserved.

- [ ] Establish documentation-first principles:
  - Decisions happen in writing (ADRs)
  - Async is default; sync is escalation
  - Single source of truth in git (markdown)
  - Meeting notes are mandatory (captured via Phase 2)
- [ ] Create ADR template (Architecture Decision Record):
```yaml
title: "ADR-XXX: Decision Title"
status: proposed | accepted | deprecated | superseded
date: "YYYY-MM-DD"
deciders: [name1, name2]
context: "Why this decision was needed"
options:
  - option: "Option A"
    pros: []
    cons: []
  - option: "Option B"
decision: "We chose Option X"
consequences:
  positive: []
  negative: []
```
- [ ] Build CODEX protocol (single source of truth document)
- [ ] Create decision register (D1-D99 numbering)
- [ ] Implement "meeting notes mandatory" workflow
- [ ] Build async handoff protocol (status + blockers in writing)
- [ ] Add availability norms (explicit working hours per person)
- [ ] Create contribution recognition system (who did what, when)

**Why this matters:** Synchronous communication doesn't scale across timezones and doesn't create organizational memory. Documentation-first enables distributed work and preserves knowledge.

**Source pattern:** `idirnet/content/knowledge/notes/remote-native-open-source-development.md`

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
| idirnet source patterns | ~/idirnet/idirnet/idirnet_ROOT/content/ |
| idirnet ADRs | ~/idirnet/idirnet/idirnet_ROOT/content/docs/adr/ |
| idirnet TSM framework | ~/idirnet/idirnet/idirnet_ROOT/content/docs/tsm-framework.md |
