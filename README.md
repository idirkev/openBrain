# OPEN·BRAIN

```
═══════════════════════════════════════════════════════════════
  KNOWLEDGE CAPTURE · CLASSIFICATION · ORCHESTRATION
  v2.0 · CAPTURE PIPELINE ACTIVE · 19 TEMPLATES
═══════════════════════════════════════════════════════════════
```

> The best agent is a markdown file. The best database is a folder. The best interface is the one you already know.

Open Brain is a **personal and team knowledge capture system** that turns Slack messages, voice notes, and Raycast commands into classified, embedded, searchable knowledge — then rewards quality contributions with tokens.

---

## [01] SYSTEM·ARCHITECTURE

```mermaid
graph TB
    subgraph INPUT["[INPUT]"]
        SL["SLACK<br/>#log channel"]
        VC["VOICE<br/>sox → Whisper"]
        RC["RAYCAST<br/>6 commands"]
        MC["MCP<br/>Claude Code"]
    end

    subgraph PROCESS["[PROCESS] ingest-thought"]
        CL["CLASSIFY<br/>gpt-4o-mini<br/>19 templates"]
        EM["EMBED<br/>text-embedding-3-small<br/>1536 dims"]
    end

    subgraph STORE["[STORE]"]
        DB[("SUPABASE<br/>PostgreSQL<br/>+ pgvector")]
    end

    subgraph OUTPUT["[OUTPUT]"]
        SR["SLACK REPLY<br/>template + emoji"]
        INC["INCENTED<br/>conviction voting"]
        MCP["MCP TOOLS<br/>search · list<br/>capture · stats"]
    end

    SL --> PROCESS
    VC -->|transcript| SL
    RC --> PROCESS
    MC --> PROCESS
    CL --> DB
    EM --> DB
    DB --> SR
    DB -->|"!incented / 💰"| INC
    DB --> MCP

    style SL fill:#4a154b,color:#fff
    style DB fill:#3ecf8e,color:#fff
    style INC fill:#f59e0b,color:#fff
    style CL fill:#1e3a5f,color:#fff
    style EM fill:#1e3a5f,color:#fff
```

---

## [02] TEMPLATE·SYSTEM

```
┌─────────────────────────────────────────────────────────┐
│  3 LAYERS · 19 TEMPLATES · KEYWORD-TRIGGERED            │
└─────────────────────────────────────────────────────────┘
```

| # | LAYER | TEMPLATES | TRIGGER |
|---|-------|-----------|---------|
| L1 | **TEAM CORE** (8) | Decision · Risk · Milestone · Spec · Meeting Debrief · Person Note · Stakeholder · Sent | `Decision:` `Risk:` `Milestone:` ... |
| L2 | **ROLE** (6) | Budget · Invoice · Funding · Legal · Compliance · Contract | `Budget:` `Invoice:` `Funding:` ... |
| L3 | **PERSONAL** (5) | Insight · AI Save · Nutrition · Health · Home | `Insight:` `Ate:` `Health:` ... |

```
EXAMPLE INPUT:  "Risk: Database backup not automated 💰"
         ↓
TEMPLATE:       Risk
DOMAIN:         Team Core
INCENTED:       auto-submitted for conviction voting
SLACK REPLY:    ⚠️ Risk template captured
```

---

## [03] EDGE·FUNCTIONS

Four Supabase Edge Functions — all `ACTIVE`.

```mermaid
graph LR
    subgraph FUNCTIONS["[DEPLOYED]"]
        F1["ingest-thought<br/>v6 · ACTIVE"]
        F2["meeting-notes<br/>v7 · ACTIVE"]
        F3["open-brain-mcp<br/>v2 · ACTIVE"]
        F4["schedule-actions<br/>v1 · ACTIVE"]
    end

    subgraph TRIGGERS
        T1["Slack webhook"] --> F1
        T2["Apps Script<br/>every 15 min"] --> F2
        T3["Claude Code<br/>MCP protocol"] --> F3
        T4["Dashboard<br/>Reclaim.ai"] --> F4
    end

    style F1 fill:#3ecf8e,color:#000
    style F2 fill:#3ecf8e,color:#000
    style F3 fill:#3ecf8e,color:#000
    style F4 fill:#3ecf8e,color:#000
```

| FUNCTION | PURPOSE | TRIGGER |
|----------|---------|---------|
| `ingest-thought` | Classify, embed, store, Incented auto-submit | Slack message in #log |
| `meeting-notes` | Parse Google Meet transcripts into template chunks | Apps Script (15 min interval) |
| `open-brain-mcp` | MCP server: search, list, capture, stats | Claude Code / any MCP client |
| `schedule-actions` | Fetch unscheduled actions for Reclaim.ai scheduling | Dashboard API call |

---

## [04] CAPTURE·METHODS

```
┌─────────────────────────────────────────────────────────┐
│  CAPTURE FROM ANYWHERE · CLASSIFY AUTOMATICALLY          │
└─────────────────────────────────────────────────────────┘
```

### SLACK
```
#log channel → "Decision: Launch strategy !incented"
                         ↓
              ingest-thought webhook
                         ↓
              ✅ Decision template captured
```

### VOICE
```bash
cd integrations/raycast && ./voice-capture-cli.sh
# sox records → Whisper transcribes → sent directly to Open Brain via MCP
```

### RAYCAST

| COMMAND | KEY | PURPOSE |
|---------|-----|---------|
| Capture Thought | `obc` | Form-based with paste options |
| Search Thoughts | `obs` | Semantic search with scores |
| List Recent | `obl` | Browse with type filters |
| Statistics | `obst` | Totals, topics, people |
| Quick Capture | `obq` | Command-line instant |
| Voice Capture | `obv` | Record → transcribe → capture |

### MCP (CLAUDE CODE)
```
search_thoughts("database migration")
capture_thought("Insight: Vector search is faster than keyword")
thought_stats()
list_thoughts({ type: "decision", limit: 10 })
```

---

## [05] MORNING·BRIEF

> **Status:** Dashboard scaffold built. Gemini brief returns AI-generated summaries. Google Workspace integration (Calendar, Gmail, Drive) is planned — currently uses Gemini's general knowledge. Weather, finance, and news widgets have API routes but need frontend wiring fixes.

```mermaid
graph TB
    subgraph PLANNED["[PLANNED — Google Workspace]"]
        GC["Google Calendar"]
        GM["Gmail"]
        GD["Google Drive"]
    end

    subgraph BUILT["[BUILT]"]
        OB["Open Brain<br/>Supabase"]
        WX["OpenWeather API"]
        FN["Yahoo Finance"]
        NS["Good News RSS"]
    end

    subgraph GEMINI["[GEMINI 2.5 FLASH]"]
        AI["AI Morning Brief<br/>text prompt"]
    end

    subgraph DASH["[DASHBOARD] Next.js"]
        D["Page scaffold<br/>widgets in progress"]
    end

    GC -.->|planned| AI
    GM -.->|planned| AI
    GD -.->|planned| AI
    OB --> AI
    WX --> D
    FN --> D
    NS --> D
    AI --> D

    style AI fill:#4285f4,color:#fff
    style D fill:#000,color:#fff
    style GC fill:#666,color:#fff
    style GM fill:#666,color:#fff
    style GD fill:#666,color:#fff
```

---

## [06] INCENTED·REWARDS

Token-based conviction voting for knowledge contributions. API routes and auto-submit pipeline built. Dashboard UI components exist but are not yet wired into the main page.

```mermaid
graph LR
    A["CAPTURE<br/>!incented / 💰"] --> B["AUTO-SUBMIT<br/>ingest-thought"]
    B --> C["COMMUNITY<br/>VOTES<br/>conviction voting"]
    C --> D["WEBHOOK<br/>results → metadata"]
    D --> E["REWARD<br/>tokens"]

    style A fill:#1e3a5f,color:#fff
    style B fill:#3ecf8e,color:#000
    style C fill:#f59e0b,color:#000
    style D fill:#1e3a5f,color:#fff
    style E fill:#666,color:#fff
```

> **Status:** Auto-submit via `!incented` flag works in ingest-thought. Submit/webhook API routes built. Manual submit UI component exists (`IncentedStatus.tsx`) but not rendered in main dashboard page. Webhook signature verification pending.

---

## [07] ROADMAP

```
┌──────────────────────────────────────────────────┐
│  PHASE    STATUS       DESCRIPTION               │
├──────────────────────────────────────────────────┤
│  0        ✅ COMPLETE   Foundation + capture       │
│  1        ✅ COMPLETE   19 templates (3 layers)    │
│  2        ✅ COMPLETE   Meeting notes automation   │
│  3        ◐ PROGRESS   Team onboarding            │
│  4        ◐ PROGRESS   Morning brief dashboard    │
│  4.5      ✅ COMPLETE   Raycast extension (built)  │
│  4.6      ◐ PROGRESS   Smart scheduler (API done) │
│  4.7      ◐ PROGRESS   Incented (API + auto-sub)  │
│  5        ○ PLANNED    To-do integration           │
│  6        ○ PLANNED    Nutrition tracking           │
│  7        ○ PLANNED    Gmail parsing               │
│  8        ○ PLANNED    Weekly review automation    │
│  9-15     ○ PLANNED    Doc types · Schema · ACL    │
│  16       ○ PLANNED    Knowledge bounty system     │
└──────────────────────────────────────────────────┘
```

See [ROADMAP.md](ROADMAP.md) for full details.

---

## [08] PROJECT·STRUCTURE

```
openBrain/
├── ROADMAP.md                      # 16-phase development plan
├── CLAUDE.md                       # Agent routing instructions
├── PROJECT_STATUS.md               # Current system status
├── HANDOVER.md                     # v2.0 handover document
│
├── apps/my-app/                    # Morning Brief dashboard
│   ├── app/
│   │   ├── api/
│   │   │   ├── gemini-brief/       # AI morning summary
│   │   │   ├── incented/           # Submit + webhook
│   │   │   ├── reclaim/            # Smart scheduler
│   │   │   ├── weather/            # OpenWeather
│   │   │   ├── finance/            # Renewable tickers
│   │   │   └── news/               # Good News RSS
│   │   └── components/
│   │       ├── GeminiBrief.tsx      # AI brief display
│   │       ├── SmartScheduleButton  # Reclaim integration
│   │       ├── IncentedStatus.tsx   # Token rewards UI
│   │       └── ...                  # Weather, Finance, News
│   └── lib/supabase.ts             # DB client
│
├── integrations/
│   └── raycast/                    # macOS quick capture
│       ├── src/api.ts              # MCP client
│       ├── voice-capture-cli.sh    # Voice → Whisper → Slack
│       └── ...                     # 5 command components
│
├── prompts/                        # Agent system prompts
├── scripts/                        # CLI tools
├── docs/                           # Architecture docs
│   ├── INCENTED-INTEGRATION.md
│   ├── DATA-INTAKE-ARCHITECTURE.md
│   └── TSM-ORGANIZATIONAL-FRAMEWORK.md
│
└── stubs/                          # Future integrations
```

Supabase Edge Functions live in `~/supabase/functions/` (separate deployment).

---

## [09] QUICK·START

```bash
git clone https://github.com/idirkev/openBrain.git
cd openBrain

# Dashboard
cd apps/my-app
cp .env.local.example .env.local    # Add Supabase + API keys
npm install && npm run dev          # http://localhost:3000

# Voice capture
cd integrations/raycast
./voice-capture-cli.sh

# Raycast extension
cd integrations/raycast
npm install && npm run build
# Import via Raycast preferences
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY       # Supabase service role
MCP_ACCESS_KEY                  # Open Brain MCP access
GEMINI_API_KEY                  # Gemini 2.5 Flash
RECLAIM_API_KEY                 # Reclaim.ai scheduling
OPENWEATHER_API_KEY             # Weather widget
```

---

## [10] AGENT·MODEL

```
┌─────────────────────────────────────────────────────────┐
│  ROLE              MODEL              COST    PURPOSE   │
├─────────────────────────────────────────────────────────┤
│  ARCHITECT         Claude Opus 4.6    High    Decide    │
│  BUILDER           Claude Sonnet 4.6  Medium  Ship      │
│  QUALITY GATE      Codex CLI          High    Verify    │
│  CLASSIFIER        gpt-4o-mini        Low     Classify  │
│  EMBEDDER          text-emb-3-small   Low     Embed     │
│  MORNING BRIEF     Gemini 2.5 Flash   Free    Summarise │
└─────────────────────────────────────────────────────────┘
```

---

## [11] COSTS

| SERVICE | COST |
|---------|------|
| Whisper API | ~$0.006/min |
| OpenRouter (classify + embed) | ~$0.001/capture |
| Gemini API | Free tier |
| Supabase | Free tier |
| Vercel | Free tier |
| Incented | Gas fees only |

**Alternative:** Local whisper.cpp = $0 (2GB model download)

---

```
═══════════════════════════════════════════════════════════════
  OPEN·BRAIN · v2.0 · CAPTURE ACTIVE · DASHBOARD IN PROGRESS
  Built by idirnet · Routed through markdown
═══════════════════════════════════════════════════════════════
```
