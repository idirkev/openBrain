# Open Brain Playbook

**A field guide for knowledge capture, organization, and action.**

Last updated: 2026-03-16

---

## Table of Contents

1. [Quick Start](#quick-start) — Start here if you're new
2. [Principles](#principles) — Core philosophy
3. [Document Types in Detail](#document-types-in-detail) — When to use what
4. [Real Examples](#real-examples) — Filled-in templates
5. [Frontmatter Schema](#frontmatter-schema) — The metadata system
6. [Template System](#template-system) — 19 capture patterns
7. [Access Control](#access-control) — Privacy by design
8. [Requests & Projects](#requests--projects) — From capture to delivery
9. [Knowledge Graph](#knowledge-graph) — Linking and discovery
10. [TSM Framework](#tsm-framework) — Complex project organization
11. [Remote-Native Protocols](#remote-native-protocols) — Async-first work
12. [Anti-Patterns](#anti-patterns) — What NOT to do
13. [Troubleshooting](#troubleshooting) — Common problems
14. [Quick Reference](#quick-reference) — Cheat sheet

---

## Quick Start

### The 30-Second Version

1. **Capture thoughts in Slack** using keywords like `Insight:`, `Decision:`, `Risk:`
2. **Let Open Brain classify** them automatically using the 19 templates
3. **Review your dashboard** each morning for context
4. **Process fleeting notes** within 48 hours — convert to permanent or archive

### Your First Week

**Day 1:** Capture 5 thoughts via Slack
```
Insight: We should use edge functions for the new API
```

**Day 2-3:** Notice the classification patterns

**Day 4:** Review your captured thoughts in the dashboard

**Day 5:** Process one fleeting note into a permanent note

**Weekend:** Review the knowledge graph — explore connections

### The Capture → Process → Action Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   CAPTURE   │────▶│   PROCESS    │────▶│   ACTION    │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ Slack       │     │ Convert      │     │ Request     │
│ Meeting     │     │ fleeting →   │     │ assigned    │
│ Reading     │     │ permanent    │     │ with due    │
│ Thought     │     │ Link related │     │ date        │
└─────────────┘     └──────────────┘     └─────────────┘
     │                    │                   │
     ▼                    ▼                   ▼
  19 Templates       Knowledge Graph     Project Dashboard
```

---

## Principles

### 1. Capture Everything, Organize Later

Don't let the perfect be the enemy of the captured. Get thoughts out of your head and into the system. Use fleeting notes for raw capture, then process into permanent notes when you have time.

> **Rule of thumb:** If you thought it twice, capture it.

### 2. Documentation-First, Meetings-Second

Write it down before you talk about it. Async communication is default; sync is escalation. Meeting notes are mandatory — if it wasn't captured, it didn't happen.

> **Exception:** Escalate to sync for ambiguity resolution, conflict, or relationship building only.

### 3. Single Source of Truth

Git-based markdown is the canonical source. Everything else (Slack, email, meetings) feeds into this. The git history is the audit trail.

### 4. Graduated Access

Not everything needs to be public. The 4-tier model (public/network/team/leadership) lets you capture sensitive information confidently.

> **Default:** `team` access for new captures. Downgrade to `network` or `public` intentionally.

### 5. Knowledge is a Graph

Ideas connect to other ideas. Build links (`[[like this]]`), not just lists. The graph structure enables discovery — finding what you didn't know you were looking for.

> **Target:** Every permanent note should have at least 3 links (in or out).

### 6. Actionable by Default

Captures should lead to action. Use the request type for formal asks with acceptance criteria. Thoughts are captured; requests are delivered.

---

## Document Types in Detail

### When to Use What

| Situation | Use This | Why |
|-----------|----------|-----|
| Raw thought, quick capture | **Fleeting** | Fast, no pressure to organize |
| Finished a book/article | **Literature** | Preserve source + your take |
| Developed an insight | **Permanent** | Atomic, linkable, reusable |
| Running a project | **Project** | Track status, log progress |
| Curating a topic area | **Structure** | Navigation for related notes |
| Need something done | **Request** | Clear criteria, assignment |

### The Processing Pipeline

```
Fleeting Note (raw)
       │
       │ (within 48h)
       ▼
   ┌───────┐
   │Process│
   └───┬───┘
       │
   ┌───┴───┐
   ▼       ▼
Literature  Permanent
(from       (own idea)
source)
   │           │
   └─────┬─────┘
         │
         ▼
   ┌─────────┐
   │ Request │ (if actionable)
   │ Project │ (if multi-step)
   └─────────┘
```

### Fleeting Notes — The Inbox

**Purpose:** Zero-friction capture. Get it out of your head.

**Characteristics:**
- Quick to create (no required fields)
- Not published by default
- Must be processed within 48 hours

**Good fleeting notes:**
```
Insight: Could use ChromaDB for vector search
Question: What's the SLA for Supabase free tier?
Idea: Morning briefing should include weather
```

**Bad fleeting notes:**
```
Think about the project (too vague)
Meeting notes (use Meeting Debrief template instead)
TODO: Fix bug (use Request type instead)
```

### Literature Notes — The Library

**Purpose:** External knowledge, captured with attribution.

**Key fields:**
- `source` — Title of book/article
- `source_author` — Who wrote it
- `source_url` — Where to find it

**Structure:**
1. **Summary** — In your own words, what is this about?
2. **Key Ideas** — Bullet points of main concepts
3. **Quotes** — Exact quotes for reference
4. **My Thoughts** — Your reactions, connections

**Golden rule:** Never copy-paste. Always write in your own words.

### Permanent Notes — The Knowledge Base

**Purpose:** Your original thinking, in atomic form.

**Atomic means:**
- One idea per note
- Self-contained (understandable without context)
- Written for your future self

**The permanent note test:**
> Could someone understand this note without reading anything else?

**Example of atomic vs not atomic:**

❌ Not atomic:
```
Open Brain uses Supabase for the database because it's serverless
and has vector search and is cheap and easy to deploy.
```

✅ Atomic:
```
Open Brain chose Supabase for three reasons:
1. Serverless — no infrastructure to manage
2. pgvector — native vector search
3. Generous free tier — $0 to start

This decision trades some flexibility for operational simplicity.
```

### Structure Notes (MOCs) — The Map

**Purpose:** Navigation and curation. Not a folder — a guide.

**Anatomy of a good MOC:**
```markdown
# MOC: AI Integration

## Overview
How AI fits into Open Brain architecture

## Key Notes
- [[202603161200]] — Vector search decision
- [[202603161300]] — Embedding strategy
- [[202603161400]] — Privacy considerations

## Open Questions
- [ ] Which model for classification?
- [ ] Cost projections at scale?

## Related MOCs
- [[MOC-Architecture]]
- [[MOC-Privacy]]
```

**When to create a MOC:**
- You have 5+ notes on a topic
- You're starting a new project area
- You keep searching for the same notes

### Requests — The Action Engine

**Purpose:** Formalize work that needs to be done.

**Required for every request:**
1. **Clear ask** — What needs to happen?
2. **Acceptance criteria** — How will we know it's done?
3. **Assignee** — Who's responsible?
4. **Due date** — When is it needed?

**Acceptance criteria formula:**
```
Given [context], when [action], then [expected result]
```

**Example:**
```
Given the ingest-thought function, when a Slack message
is received, then it should be classified within 2 seconds
with 95%+ accuracy.
```

---

## Real Examples

### Example 1: Fleeting → Permanent

**Original Fleeting Note:**
```yaml
---
type: fleeting
created: "2026-03-16"
author: "kev"
publish: false
---

# Idea about embeddings

Maybe use local model instead of OpenAI for privacy?
All-MiniLM-L6-v2 is good enough for search.
```

**Processed into Permanent Note:**
```yaml
---
type: permanent
id: "202603161430"
title: "Local Embeddings Strategy"
description: "Trade-off analysis between cloud and local embedding models"
created: "2026-03-16"
updated: "2026-03-16"
author: "kev"
aliases: ["embedding-model-choice", "privacy-embeddings"]
related: ["202603161200", "202603161300"]
publish: true
access_level: team
---

# Local Embeddings Strategy

The choice between cloud (OpenAI) and local (all-MiniLM-L6-v2)
embedding models involves trade-offs across four dimensions:

## Quality
- OpenAI text-embedding-3-small: 1536 dims, state-of-the-art
- all-MiniLM-L6-v2: 384 dims, "good enough" for most search

## Privacy
- OpenAI: Data leaves the system (concern for sensitive content)
- Local: 100% on-device, no API calls

## Cost
- OpenAI: ~$0.10 per 1M tokens
- Local: $0 (compute only)

## Complexity
- OpenAI: Simple API call
- Local: Requires embedding service deployment

## Decision

For Open Brain v1, use **OpenAI** for speed of development.
Plan migration path to **local models** for v2 when privacy
becomes critical.

---

## Links
- Derived from: [[202603161200]] (original fleeting)
- Related: [[202603161300]] (privacy architecture)
- Contradicts: (none)
```

### Example 2: Literature Note

```yaml
---
type: literature
id: "202603161500"
title: "Remote-Native Development - Muller et al."
description: "Research on distributed software development practices"
created: "2026-03-16"
author: "kev"
source: "Challenges of Remote Work in Software Development"
source_author: "Muller et al."
source_url: "https://doi.org/..."
tags: [remote-work, open-source, research]
publish: true
---

# Remote-Native Development — Muller et al.

## Summary

Research distinguishes "emergency remote" (pandemic-forced) from
"remote-native" (intentionally designed). Remote-native teams
operate like open source projects: documentation-first,
async-by-default, transparent by design.

## Key Ideas

- Remote-native teams have 2-4 hour synchronous overlap windows
- Documentation serves as primary knowledge carrier
- Core-periphery structures naturally emerge (3-15 person core)
- Self-selection task allocation builds trust incrementally

## Quotes

> "Documentation serves as the primary knowledge carrier.
> Persistent records enable asynchronous participation."

## My Thoughts

This validates Open Brain's documentation-first approach.
The "core-periphery" model maps well to our structure:
- Core: Kev, Laura, Jochem, Kris, Colm
- Periphery: Extended network for specific projects

Should adopt explicit "availability norms" — document working
hours to reduce "always on" pressure.

## Links
- Related: [[202603161600]] (idirnet operating model)
```

### Example 3: Request

```yaml
---
type: request
id: "REQ-2026-001"
title: "Deploy ingest-thought Edge Function"
description: "Deploy updated classification prompt to production"
status: completed
priority: high
created: "2026-03-16"
due_date: "2026-03-17"
author: "kev"
assigned: "kev"
acceptance_criteria:
  - [x] Function deployed to Supabase
  - [x] Slack webhook responding
  - [x] Classification accuracy >95% (verified on 20 test messages)
  - [x] Rollback plan documented
domain: Team Core
tags: [deploy, edge-function, classification]
publish: true
access_level: team
---

# REQ-2026-001: Deploy ingest-thought Edge Function

## Context

Updated classification prompt includes all 19 templates.
Need to deploy to production for team onboarding.

## Request

Deploy the updated `ingest-thought` Edge Function by March 17.

## Acceptance Criteria

- [x] Function deployed to Supabase using `supabase functions deploy`
- [x] Slack #log channel webhook responding correctly
- [x] Classification accuracy >95% on test messages
- [x] Rollback plan documented in case of issues

## Dependencies

- [[REQ-2026-000]] — Prompt testing (completed)

## Downstream Impact

Required for:
- Phase 3: Team Onboarding
- Kris's Slack capture testing

## Execution Log

### 2026-03-16
- Deployed function
- Tested 20 messages: 98% accuracy
- Documented rollback: `supabase functions deploy ingest-thought --ref previous`

### 2026-03-17
- Monitored first day: 150 messages processed, 0 errors
- Marking complete
```

---

## Frontmatter Schema

### The Complete Schema

```yaml
---
# ─────────────────────────────────────────────────────────────
# IDENTITY — Who and what this document is
# ─────────────────────────────────────────────────────────────
id: "202603161200"              # Unique sortable timestamp
title: "Document Title"          # Human-readable name
description: "One-line summary"  # For previews and search

# ─────────────────────────────────────────────────────────────
# CLASSIFICATION — What type of knowledge is this?
# ─────────────────────────────────────────────────────────────
type: permanent                  # fleeting|literature|permanent|project|structure|request
status: published                # draft|in-progress|review|published|archived
domain: Team Core                # Team Core|Role|Personal (template layer)

# ─────────────────────────────────────────────────────────────
# METADATA — When and by whom
# ─────────────────────────────────────────────────────────────
author: "kev"
created: "2026-03-16"
updated: "2026-03-16"
tags: [topic, subtopic]

# ─────────────────────────────────────────────────────────────
# VISIBILITY — Who can see this?
# ─────────────────────────────────────────────────────────────
publish: true                    # true|false (searchable/indexed)
access_level: team               # public|network|team|leadership

# ─────────────────────────────────────────────────────────────
# RELATIONSHIPS — How this connects to other knowledge
# ─────────────────────────────────────────────────────────────
aliases: ["Alt Name", "Abbreviation"]
related: ["202603161100", "202603161300"]

# ─────────────────────────────────────────────────────────────
# SOURCE — For literature notes (optional)
# ─────────────────────────────────────────────────────────────
source: "Book Title"
source_author: "Author Name"
source_url: "https://..."

# ─────────────────────────────────────────────────────────────
# WORK — For projects and requests (optional)
# ─────────────────────────────────────────────────────────────
assigned: "name"
due_date: "2026-03-23"
acceptance_criteria:
  - [ ] Criterion 1
  - [ ] Criterion 2

# ─────────────────────────────────────────────────────────────
# TSM — For complex project organization (optional)
# ─────────────────────────────────────────────────────────────
tsm_stack: global                # global|internal|external
tsm_plane: Ground                # See TSM section
tsm_node: global-ground
---
```

### Required Fields by Type

| Type | Required | Optional but Recommended |
|------|----------|-------------------------|
| **Fleeting** | `type`, `created`, `author` | `tags` |
| **Literature** | `type`, `created`, `author`, `source`, `source_author` | `source_url`, `tags`, `related` |
| **Permanent** | `type`, `created`, `author`, `title` | `aliases`, `related`, `tags`, `description` |
| **Project** | `type`, `created`, `author`, `title`, `status` | `due_date`, `tags`, `related` |
| **Structure** | `type`, `created`, `author`, `title` | `tags`, `related` |
| **Request** | `type`, `created`, `author`, `title`, `assigned`, `due_date`, `acceptance_criteria` | `priority`, `dependencies`, `tags` |

---

## Template System

### 19 Templates Across 3 Layers

#### Team Core (8 templates) — Everyone uses these

| Template | Keyword | Emoji | Use When | Example |
|----------|---------|-------|----------|---------|
| **Decision** | `Decision:` | 🎯 | Making a choice | `Decision: Use Supabase for database` |
| **Risk** | `Risk:` | ⚠️ | Spotting a problem | `Risk: API rate limits may hit` |
| **Milestone** | `Milestone:` | 🏁 | Achieving a goal | `Milestone: 1000 thoughts captured` |
| **Spec** | `Spec:` | 🔧 | Defining requirements | `Spec: Auth system must...` |
| **Meeting** | `Meeting with` | 📋 | Capturing discussion | `Meeting with Laura about...` |
| **Person Note** | `[Name] —` | 👤 | Noting someone | `[Tim Redfern] — Suggested...` |
| **Stakeholder** | `Stakeholder:` | 🤝 | Tracking relationships | `Stakeholder: Brendan Dillon...` |
| **Sent** | `Sent:` | 📤 | Following up | `Sent: Proposal to client` |

#### Role (6 templates) — Domain-specific

| Template | Keyword | Emoji | Primary User | Use When |
|----------|---------|-------|--------------|----------|
| **Budget** | `Budget:` | 💰 | Laura | Tracking money |
| **Invoice** | `Invoice:` | 🧾 | Laura/Kev | Billing |
| **Funding** | `Funding:` | 💵 | Laura/Kev | Grants/investment |
| **Legal** | `Legal:` | ⚖️ | Laura/Kev | Contracts, IP |
| **Compliance** | `Compliance:` | 📋 | Anyone | GDPR, regulations |
| **Contract** | `Contract:` | 📄 | Laura | Agreements |

#### Personal (5 templates) — Individual tracking

| Template | Keyword | Emoji | Use When |
|----------|---------|-------|----------|
| **Insight** | `Insight:` | 💡 | Having an idea |
| **AI Save** | `Saving from` | 🤖 | Keeping AI output |
| **Nutrition** | `Ate:` | 🍽️ | Tracking food |
| **Health** | `Health:` | ❤️ | Noting wellness |
| **Home** | `Home:` | 🏠 | Personal tasks |

### Using Templates in Slack

Prefix your message:
```
Decision: We'll use Next.js for the frontend.
```

Open Brain will:
1. Classify as "Decision" template
2. Apply Team Core domain
3. Reply with 🎯 emoji confirmation
4. Store with appropriate metadata

### Multi-Template Messages

If a message matches multiple templates, the first keyword wins:
```
Decision: Risk: Using new library (classified as Decision)
Risk: Decision to use new library (classified as Risk)
```

---

## Access Control

### The 4-Tier Model

```
┌────────────────────────────────────────────────────────────────┐
│                         PUBLIC                                  │
│  Anyone can see — website, portfolio, general philosophy       │
│  Examples: Project descriptions, blog posts                     │
├────────────────────────────────────────────────────────────────┤
│                        NETWORK                                  │
│  Extended network (40+) — collaborators, partners              │
│  Examples: Meeting notes, process docs, member profiles        │
├────────────────────────────────────────────────────────────────┤
│                         TEAM                                    │
│  Core team (5) — day-to-day operations                         │
│  Examples: Budgets, contracts, internal decisions              │
├────────────────────────────────────────────────────────────────┤
│                      LEADERSHIP                                 │
│  Kev + Laura only — strategic matters                          │
│  Examples: Personnel, negotiations, M&A                        │
└────────────────────────────────────────────────────────────────┘
```

### Setting Access Level

**In Slack (inline):**
```
[Public] Insight: Open Brain architecture is now documented
[Team] Decision: We're delaying launch by one week
[Leadership] Risk: Key team member considering leaving
```

**In frontmatter:**
```yaml
access_level: network  # For collaborator-facing content
```

### Security Principle: 404 Not 403

Unauthorized access returns **404** (not found), not **403** (forbidden).

**Why:** Prevents enumeration attacks. If you can't see it, you don't know it exists.

---

## Requests & Projects

### Request Lifecycle

```
┌─────────┐    ┌──────────┐    ┌─────────────┐    ┌─────────┐    ┌──────────┐
│  OPEN   │───▶│ ASSIGNED │───▶│ IN-PROGRESS │───▶│ REVIEW  │───▶│ COMPLETE │
└─────────┘    └──────────┘    └─────────────┘    └─────────┘    └──────────┘
    │               │                │                │               │
    ▼               ▼                ▼                ▼               ▼
 New request    Acknowledged    Work happening   Quality check   Documented
 in backlog     by assignee                      Sign-off        Closed
```

### Critical Path & Dependencies

**Linear dependency:**
```yaml
dependencies: [REQ-001]
# Cannot start until REQ-001 completes
```

**Multiple dependencies:**
```yaml
dependencies: [REQ-001, REQ-002, REQ-003]
# Cannot start until ALL complete
```

**Blocking others:**
```yaml
blocks: [REQ-004, REQ-005]
# This request is on critical path
```

### Acceptance Criteria Quality

❌ **Bad criteria:**
- "Install projectors" (too vague)
- "Make it work" (not testable)
- "Review the code" (no endpoint)

✅ **Good criteria:**
- "All 14 projectors physically installed and powered"
- "API responds within 200ms for 95% of requests"
- "Code reviewed and approved by 2 team members"

---

## Knowledge Graph

### Linking Patterns

**Basic link:**
```markdown
See [[202603161200]] for the original decision.
```

**Link with context:**
```markdown
We chose Supabase ([[202603161200|see decision]]) for the database.
```

**Cluster link:**
```markdown
Related decisions:
- [[202603161200]] — Database choice
- [[202603161300]] — Hosting platform
- [[202603161400]] — CDN selection
```

### Relationship Types Explained

| Type | When to Use | Example |
|------|-------------|---------|
| `derives_from` | Your idea built on another | Insight derives from Literature |
| `relates_to` | Similar/contrasting concept | Two approaches to same problem |
| `contradicts` | Opposing viewpoint | Alternative architecture decision |
| `supports` | Evidence for a claim | Data note supports Theory note |
| `references` | Mentions without depth | Casual mention in overview |

### Backlink Discovery

Every note shows "What links here?" — notes that reference this one.

**Use case:** You read a note about "Vector Search" and discover:
- 3 architecture decisions reference it
- 2 meeting notes discussed it
- 1 project depends on it

**Result:** You find relevant context you didn't know existed.

### Graph Navigation Depth

```
Depth 0: Current note
    │
    ▼
Depth 1: Direct links (explicit [[references]])
    │
    ▼
Depth 2: Friends of friends (links from linked notes)
    │
    ▼
Depth 3+: Network neighborhood
```

**Recommendation:** Most discovery happens at Depth 1-2.

---

## TSM Framework

### The Triple Stack Model

For complex projects, organize work across 3 stacks × 7 planes = 21 nodes.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GLOBAL STACK                                      │
│                      (Infrastructure & Systems)                              │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬───────────┤
│ Ground   │ Runtime  │ Circula- │ Channels │  Frames  │  Roles   │ Horizons  │
│          │          │  tion    │          │          │          │           │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────────┤
│ Power    │ Servers  │ Visitor  │ Consent  │ Sight-   │ Staff    │ Govern-   │
│ HVAC     │ Sync     │ Flow     │ GDPR     │ lines    │ Training │ ance      │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴─────┬────┘
     │          │          │          │          │          │           │
     ▼          ▼          ▼          ▼          ▼          ▼           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTERNAL STACK                                     │
│                       (Embodied Perception)                                  │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬───────────┤
│  Root    │ Sacral   │  Solar   │  Heart   │ Throat   │Third Eye │  Crown    │
│          │          │  Plexus  │          │          │          │           │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────────┤
│ Physical │Creativity│ Agency   │ Connec-  │Articula- │Percep-   │ Integra-  │
│ Ground   │ Pacing   │ Choice   │  tion    │  tion    │  tion    │  tion     │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴───────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL STACK                                     │
│                        (Mediation & Ritual)                                  │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬───────────┤
│  Space   │  Portal  │ Gesture  │ Mirror   │ Narrative│Atmosphere│ Feedback  │
│          │          │          │          │          │          │  Loop     │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────────┤
│ Spatial  │ Thresh-  │ Movement │ Feedback │  Story   │ Ambient  │ Learning  │
│  Data    │  old     │ Consent  │ Reflect  │ Journey  │ Condi-   │  Adapt    │
│          │          │          │          │          │  tions   │           │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴───────────┘
```

### Cross-Stack Dependencies

**Global → Internal:**
- Ground (infrastructure) must complete before Root (physical grounding)
- Runtime (media systems) before Sacral (creativity/pacing)
- Circulation (visitor flow) before Solar Plexus (agency/choice)

**External → Global:**
- Space (spatial data) enables Circulation planning
- Portal (threshold) informs Frames (legibility)
- Feedback Loop (learning) feeds Horizons (governance)

### Using TSM in Open Brain

Tag content with TSM metadata:
```yaml
tsm_stack: global
tsm_plane: Ground
tsm_node: global-ground
```

View TSM dashboard:
- See all 21 nodes with status
- Identify blocked nodes (dependencies not met)
- Track progress by stack

---

## Remote-Native Protocols

### The Decision Record (ADR) Process

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ 1. WRITE ADR │───▶│ 2. ASYNC     │───▶│ 3. DISCUSS   │───▶│ 4. RECORD    │
│              │    │    REVIEW    │    │   IF NEEDED  │    │  DECISION    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
     │                    │                    │                    │
     ▼                    ▼                    ▼                    ▼
 Capture context      48h minimum         Escalation to       Update ADR
 Options considered   Team feedback       sync only for       Communicate
 Pros/cons listed     Written responses   ambiguity/          outcome
                      No meetings         conflict            async
```

### Async Handoff Protocol

When passing work to someone else, always include:

```markdown
## Status Snapshot
- **Completed:** X, Y, Z (100%)
- **In Progress:** A (50%), B (just started)
- **Blocked:** C (waiting on decision from...)

## Context
Key decisions made, important constraints, relevant history.

## Next Steps
- [ ] Next owner should do X (link to guide/docs)
- [ ] Then do Y
- [ ] Finally Z

## Blockers
- Need decision on Z before proceeding
- Waiting for access to system W

## References
- [[202603161200]] — Original decision
- [Design doc](https://...)
```

### Availability Norms Template

Document in `team-availability.md`:
```yaml
kev:
  timezone: "IST (UTC+0)"
  core_hours: "09:00-18:00"
  async_response: "Within 4 hours during core hours"
  best_for_sync: "10:00-12:00"
  notes: "Unavailable for deep work 14:00-16:00"

laura:
  timezone: "IST (UTC+0)"
  core_hours: "09:00-17:00"
  async_response: "Within 24 hours"
  best_for_sync: "09:00-11:00"
  notes: "Mondays are meeting-heavy"
```

---

## Anti-Patterns

### What NOT to Do

#### 1. The "Everything is a Fleeting Note" Trap

❌ **Wrong:**
```yaml
type: fleeting
title: "Project Plan"
```

✅ **Right:** Use `project` or `request` type for multi-step work

**Why:** Fleeting notes are for raw capture only. They're not searchable by default and don't have status tracking.

---

#### 2. The "Perfect Note" Paralysis

❌ **Wrong:**
> "I can't capture this until I figure out the right links and tags"

✅ **Right:** Capture now, organize later. A messy note is better than a lost thought.

**Why:** The system is designed for progressive refinement. Capture → Process → Polish.

---

#### 3. The "Meeting Without Notes" Anti-Pattern

❌ **Wrong:**
> "We discussed it in the meeting, everyone knows what to do"

✅ **Right:** Every meeting produces a Meeting Debrief note within 24 hours

**Why:** If it's not captured, it didn't happen. Memory is fallible. The note is the record.

---

#### 4. The "Orphan Note" Problem

❌ **Wrong:**
```yaml
type: permanent
related: []  # No links
```

✅ **Right:** Every permanent note should link to at least 3 related notes

**Why:** Unlinked notes are lost notes. The value is in the network, not the nodes.

---

#### 5. The "Vague Acceptance Criteria" Failure

❌ **Wrong:**
```yaml
acceptance_criteria:
  - [ ] Make it work
  - [ ] Test it
```

✅ **Right:**
```yaml
acceptance_criteria:
  - [ ] API responds in <200ms for 95% of requests
  - [ ] Unit tests cover 80%+ of code
  - [ ] Deployed to production without errors
```

**Why:** Criteria must be testable. "Make it work" means different things to different people.

---

#### 6. The "Wrong Access Level" Leak

❌ **Wrong:**
```yaml
access_level: public
content: "Brendan's equity offer is 15%..."
```

✅ **Right:**
```yaml
access_level: leadership
content: "Brendan's equity offer is 15%..."
```

**Why:** When in doubt, use a more restrictive tier. You can always open it up later.

---

## Troubleshooting

### Common Problems

#### "My thought didn't get classified"

**Check:**
1. Did you use a template keyword? (`Decision:`, `Risk:`, etc.)
2. Is the keyword at the start of the message?
3. Did the Slack webhook fire? (Check #bot-log)

**Fix:**
```
Decision: We should use edge functions
^^^^^^^^  Must be at start, with colon
```

---

#### "I can't find my note"

**Try:**
1. Check if `publish: false` (fleeting notes aren't searchable by default)
2. Search by date: `created:2026-03-16`
3. Search by author: `author:kev`
4. Use `list_thoughts` MCP tool with filters

---

#### "The graph shows no connections"

**Check:**
1. Are you using `[[wikilink]]` syntax?
2. Do your notes have `related` fields in frontmatter?
3. Are the linked note IDs correct?

**Fix:**
```yaml
# Add to frontmatter
related: ["202603161200", "202603161300"]
```

---

#### "My request isn't showing in the dashboard"

**Check:**
1. Is `type: request` set correctly?
2. Is `status` not "completed" or "archived"?
3. Is `assigned` set to your name?

---

#### "TSM dashboard shows all nodes as 'planned'"

**Fix:**
Add TSM metadata to your notes:
```yaml
tsm_stack: global
tsm_plane: Ground
tsm_node: global-ground
```

Then update status:
```yaml
tsm_node_status: active  # planned | active | complete | blocked
```

---

## Quick Reference

### Capture Cheat Sheet

| What happened? | Type this in Slack | Becomes |
|----------------|-------------------|---------|
| Had an idea | `Insight: ...` | Fleeting → Permanent |
| Finished a book | `Reading: [Book] by [Author]` | Literature |
| Made a decision | `Decision: ...` | Decision (Team Core) |
| Spotted a problem | `Risk: ...` | Risk (Team Core) |
| Had a meeting | `Meeting with [Name]: ...` | Meeting Debrief |
| Need something done | `Request: [Person] to [Action] by [Date]` | Request |
| Met someone | `[Name] — [Context]` | Person Note |
| Sent something | `Sent: [What] to [Who]` | Sent |
| Budget concern | `Budget: ...` | Budget (Role) |
| Compliance issue | `Compliance: ...` | Compliance (Role) |

### Frontmatter Quick Reference

```yaml
---
# Minimum viable
id: "202603161200"
type: permanent
created: "2026-03-16"
author: "kev"

# Standard
id: "202603161200"
title: "Note Title"
description: "One-line summary"
type: permanent
created: "2026-03-16"
author: "kev"
publish: true
access_level: team

# Full
id: "202603161200"
title: "Note Title"
description: "One-line summary"
type: request
status: open
priority: high
domain: Team Core
created: "2026-03-16"
updated: "2026-03-16"
author: "kev"
assigned: "name"
due_date: "2026-03-23"
tags: [tag1, tag2]
publish: true
access_level: team
aliases: ["Alt Name"]
related: ["202603161100"]
acceptance_criteria:
  - [ ] Criterion 1
---
```

### MCP Tool Quick Reference

```typescript
// Capture a thought
await capture_thought({
  content: "Insight: Edge functions are the right choice",
  template: "insight",
  access_level: "team"
})

// Search thoughts
await search_thoughts({
  query: "edge functions",
  filters: { type: "permanent", access_level: "team" }
})

// List with filters
await list_thoughts({
  type: "request",
  status: "open",
  assigned: "kev"
})

// Create a request
await create_request({
  title: "Deploy feature",
  criteria: ["Tests pass", "Deployed", "Monitored"],
  assignee: "kev",
  due: "2026-03-23"
})

// Find related notes
await find_related({
  id: "202603161200",
  depth: 2
})

// Get stats
await thought_stats({
  period: "7d"
})
```

### File Organization Quick Reference

```
content/
  00-fleeting/      # Raw captures → Process within 48h
  10-literature/    # Book/article notes
  20-permanent/     # Atomic ideas → The knowledge base
  30-structure/     # MOCs, indexes → Navigation
  40-projects/      # Active work
  50-requests/      # Formal asks → Action items
  60-archive/       # Completed/cold → Keep for history

docs/
  adr/              # Architecture decisions
  playbooks/        # How-to guides
```

### Daily Workflow Checklist

**Morning (5 min):**
- [ ] Check briefing dashboard
- [ ] Review open requests assigned to you
- [ ] Note any blockers

**Throughout day:**
- [ ] Capture thoughts via Slack (don't wait)
- [ ] Link related notes as you think of them

**End of day (10 min):**
- [ ] Process 1-2 fleeting notes
- [ ] Convert to permanent or archive
- [ ] Update request statuses

**Weekly (30 min):**
- [ ] Review knowledge graph for orphaned notes
- [ ] Add missing links
- [ ] Archive completed requests
- [ ] Update MOCs

---

## Glossary

| Term | Definition |
|------|------------|
| **ADR** | Architecture Decision Record — captures why a decision was made |
| **Atomic** | Self-contained, single-idea note that stands alone |
| **Fleeting Note** | Raw capture, temporary, to be processed within 48h |
| **Frontmatter** | YAML metadata at top of markdown files |
| **Knowledge Graph** | Network of linked notes enabling discovery |
| **Literature Note** | Notes on external sources (books, articles) |
| **MOC** | Map of Content — index/curated list of related notes |
| **Permanent Note** | Atomic idea, written in your own words |
| **Request** | Formal ask with acceptance criteria and assignment |
| **Template** | 19 capture patterns for different thought types |
| **TSM** | Triple Stack Model — 3-stack framework for complex projects |
| **Wikilink** | `[[Note Title]]` syntax for linking notes |
| **Zettelkasten** | Note-taking system emphasizing atomicity and linking |

---

*This playbook is a living document. Update as Open Brain evolves.*

*Patterns derived from idirnet research and remote-native open source development.*
