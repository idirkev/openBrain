# Open Brain: Data Intake Architecture

How information enters the system.

---

## Principle

Every piece of knowledge enters Open Brain through one of five intake channels. Each channel feeds the same `thoughts` table in Supabase. Classification happens at ingestion via keyword detection and LLM classification.

---

## Intake Channels

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTAKE CHANNELS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SLACK #log          Human types a keyword-prefixed message  │
│     ──────────────      in Slack. Webhook fires.                │
│     │                                                           │
│     ▼                                                           │
│     ingest-thought Edge Function                                │
│     → Classifies against 19 templates                           │
│     → Generates embedding (text-embedding-3-small)              │
│     → Extracts metadata (people, topics, action items)          │
│     → Stores in thoughts table                                  │
│     → Replies in Slack thread with confirmation                 │
│                                                                 │
│  2. GOOGLE MEET         Gemini auto-generates transcript.       │
│     ──────────────      Apps Script runs every 15 min.          │
│     │                                                           │
│     ▼                                                           │
│     meeting-notes Edge Function                                 │
│     → Parses transcript into chunks per template                │
│     → Each chunk gets its own embedding                         │
│     → Creates summary doc in shared Google Drive folder         │
│     → Marks source file "ob-processed"                          │
│                                                                 │
│  3. CLAUDE CODE (MCP)   Agent captures during conversation.     │
│     ──────────────      Uses capture_thought() MCP tool.        │
│     │                                                           │
│     ▼                                                           │
│     Direct to thoughts table                                    │
│     → Same classification and embedding pipeline                │
│     → Captures decisions, risks, specs in real time             │
│                                                                 │
│  4. GEMINI FLASH        Workspace agent scans Gmail, Calendar,  │
│     ──────────────      Drive. Classifies against templates.    │
│     │                   (Phase 7 - not yet active)              │
│     ▼                                                           │
│     email-ingest Edge Function (planned)                        │
│     → Pre-classified by Gemini (lighter processing)             │
│     → Stores in thoughts + email_items tables                   │
│                                                                 │
│  5. MANUAL / API        Any keyword-prefixed text sent to       │
│     ──────────────      any ingest endpoint.                    │
│     │                                                           │
│     ▼                                                           │
│     ingest-thought Edge Function                                │
│     → Same pipeline as Slack                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Classification Layer

Every intake channel passes through the same classification logic:

### Step 1: Template Detection (19 templates, 3 layers)

The leading keyword in the content determines the template:

| Layer | Templates | Trigger |
|-------|-----------|---------|
| Team Core (8) | Decision, Risk, Milestone, Spec, Meeting, Person, Stakeholder, Sent | `Decision:`, `Risk:`, etc. |
| Role (6) | Budget, Invoice, Funding, Legal, Compliance, Contract | `Budget:`, `Invoice:`, etc. |
| Personal (5) | Insight, AI Save, Nutrition, Health, Home | `Insight:`, `Ate:`, etc. |

### Step 2: Metadata Extraction

LLM (gpt-4o-mini via OpenRouter) extracts:
- **People** mentioned by name
- **Topics** and project references
- **Action items** with owners and due dates
- **Sentiment** (for stakeholder updates)

### Step 3: Embedding Generation

text-embedding-3-small (via OpenRouter) creates a 1536-dimension vector for semantic search.

### Step 4: Storage

All data lands in the `thoughts` table:

```
thoughts
  id          uuid
  content     text        (the raw capture)
  embedding   vector(1536) (for semantic search)
  metadata    jsonb       (template, type, people, topics, action_items, source)
  created_at  timestamptz
```

---

## Current Volume

- 340 thoughts captured
- 173 tasks, 121 observations, 22 ideas, 21 references, 3 person notes
- Primary contributors: Kev (47 mentions), Brendan (24), Jochem (21), Colm (30), Kris (27)

---

## What's Active vs Planned

| Channel | Status | Notes |
|---------|--------|-------|
| Slack #log | Active | Primary intake channel |
| Google Meet | Active | Apps Script trigger every 15 min |
| Claude Code MCP | Active | 4 tools connected |
| Gemini Flash | Planned (Phase 7) | Prompt written, not deployed |
| Manual/API | Active | Same endpoint as Slack |

---

*This is how data gets in. See TSM-ORGANIZATIONAL-FRAMEWORK.md for how it gets organized and presented.*
