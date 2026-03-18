# Open Brain — Complete Command Reference

**Generated:** 2026-03-17  
**Version:** v1.0-pre + Raycast Voice

---

## 🚀 Quick Start (Copy & Paste)

### Setup Environment
```bash
# Navigate to project
cd OPENBRAIN/openBrain

# Set API keys (add to ~/.zshrc for persistence)
export OPENAI_API_KEY='sk-...'
export MCP_ENDPOINT='https://your-project.supabase.co/functions/v1/open-brain-mcp'
export MCP_ACCESS_KEY='your-access-key'

# Install dependencies
brew install sox
```

---

## 📊 System Status Commands

```bash
# Full system audit
./scripts/pipeline.sh --dry-run

# Check edge functions
ls -la services/supabase/functions/

# Check migrations
ls supabase/migrations/*.sql

# Database connection test
supabase db dump --data-only | head -20

# Test MCP endpoint
curl -s "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"thought_stats","arguments":{}}}'
```

---

## 🎤 Voice Capture

### CLI Version (Works Now)
```bash
cd OPENBRAIN/openBrain/integrations/raycast

# 5 second recording (default)
./voice-capture-cli.sh

# 10 second recording
./voice-capture-cli.sh 10

# Test pipeline only
./test-voice.sh
```

### Manual Voice Pipeline
```bash
# Record
sox -d /tmp/voice.wav trim 0 5

# Transcribe
curl -X POST https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file="@/tmp/voice.wav" \
  -F model="whisper-1" \
  -F language="en"

# Cleanup
rm /tmp/voice.wav
```

### Raycast Extension
```bash
# Build
cd OPENBRAIN/openBrain/integrations/raycast
npm install
npm run build

# Install (requires Raycast app)
ray install

# Commands after install:
# obv - Voice capture with GUI
# obc - Form capture
# obq - Quick capture
# obs - Search
# obl - List
# obst - Stats
```

---

## 🗄️ Database Operations

```bash
# Deploy edge functions
supabase functions deploy ingest-thought
supabase functions deploy meeting-notes
supabase functions deploy open-brain-mcp
supabase functions deploy schedule-actions

# Apply migrations
supabase db push

# Reset database (CAUTION)
supabase db reset

# Export data
supabase db dump --data-only > backup.sql

# List thoughts via MCP
curl -s "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_thoughts",
      "arguments": {"limit": 10}
    }
  }' | jq '.result.content[0].text' | jq

# Search thoughts
curl -s "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_thoughts",
      "arguments": {"query": "knowledge graphs", "limit": 5}
    }
  }' | jq '.result.content[0].text' | jq

# Capture thought
curl -s "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "capture_thought",
      "arguments": {"content": "Insight: Voice makes capture frictionless"}
    }
  }' | jq '.result.content[0].text' | jq
```

---

## 🏗️ Development Commands

```bash
# Run pipeline
./scripts/pipeline.sh --task "Your task description"

# Run agent scripts
./scripts/kimi-agent.sh review
./scripts/gemini-agent.sh briefing

# Build dashboard
cd apps/dashboard
npm install
npm run build

# Test Raycast extension
cd integrations/raycast
npm run dev
```

---

## 📋 Template Keywords (19 Templates)

```text
Team Core (8):
  Decision:     → type: task, template: Decision
  Risk:         → type: task, template: Risk
  Milestone:    → type: observation, template: Milestone
  Spec:         → type: reference, template: Spec
  Meeting with  → type: observation, template: Meeting Debrief
  [Name] —      → type: person_note, template: Person Note
  Stakeholder:  → type: person_note, template: Stakeholder
  Sent:         → type: task, template: Sent

Role (6):
  Budget:       → type: observation, template: Budget
  Invoice:      → type: task, template: Invoice
  Funding:      → type: observation, template: Funding
  Legal:        → type: observation, template: Legal
  Compliance:   → type: task, template: Compliance
  Contract:     → type: reference, template: Contract

Personal (5):
  Insight:      → type: idea, template: Insight
  Saving from   → type: reference, template: AI Save
  Ate:          → type: observation, template: Nutrition
  Health:       → type: observation, template: Health
  Home:         → type: observation, template: Home
```

---

## 🔧 Debugging Commands

```bash
# Check sox
which sox && sox --version

# Test microphone
sox -d /tmp/test.wav trim 0 2 && ls -lh /tmp/test.wav && rm /tmp/test.wav

# Test OpenAI API
curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | head -1

# Check environment
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."
echo "MCP_ENDPOINT: $MCP_ENDPOINT"
echo "MCP_ACCESS_KEY: ${MCP_ACCESS_KEY:0:5}..."

# View logs
supabase functions logs ingest-thought --tail
supabase functions logs open-brain-mcp --tail

# Extension diagnostics
cd integrations/raycast
npm run lint
npm run build 2>&1 | grep -i error
```

---

## 📁 Key File Locations

```bash
# Project root
OPENBRAIN/openBrain/

# Core files
ROADMAP.md              # Project roadmap (15 phases)
PROGRESS_LOG.md         # Session logs
HANDOVER.md             # System state
CLAUDE.md               # Agent instructions

# Code
services/supabase/functions/ingest-thought/index.ts
services/supabase/functions/open-brain-mcp/index.ts
supabase/migrations/001-007_*.sql

# Integrations
integrations/raycast/           # 6 commands
apps/dashboard/                    # Next.js dashboard
scripts/pipeline.sh             # AI pipeline

# Documentation
docs/
prompts/
captures/                       # AI session logs
```

---

## 🎯 One-Liners

```bash
# Quick capture via curl
curl -s "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"capture_thought","arguments":{"content":"Quick thought"}}}' | jq -r '.result.content[0].text' | jq

# Voice capture (CLI)
cd OPENBRAIN/openBrain/integrations/raycast && ./voice-capture-cli.sh

# Pipeline dry-run
cd OPENBRAIN/openBrain && ./scripts/pipeline.sh --dry-run

# Stats
curl -s "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"thought_stats","arguments":{}}}' | jq '.result.content[0].text' | jq

# Recent thoughts
curl -s "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_thoughts","arguments":{"limit":5}}}' | jq '.result.content[0].text' | jq
```

---

## 💰 Cost Estimation

```
Whisper API:        $0.006/minute
├─ Light (10/day):  $0.30/month
├─ Medium (50/day): $1.50/month
└─ Heavy (200/day): $6.00/month

OpenRouter (embeddings):
├─ text-embedding-3-small: ~$0.0001/capture
└─ gpt-4o-mini (classification): ~$0.001/capture

Supabase:           Free tier (500MB, 2GB egress)
Vercel:             Free tier (hobby)
```

---

## 🆘 Emergency Commands

```bash
# Fix dashboard build
cd apps/dashboard
cp .env.local.example .env.local
# Edit: Add NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY

# Reset edge function
supabase functions deploy ingest-thought --force

# Clear node_modules and reinstall
cd integrations/raycast
rm -rf node_modules package-lock.json
npm install

# Test from scratch
rm -rf /tmp/ob-voice-*.wav
./voice-capture-cli.sh
```

---

## 📝 Aliases (Add to ~/.zshrc)

```bash
# Open Brain shortcuts
alias ob='cd OPENBRAIN/openBrain'
alias ob-voice='cd OPENBRAIN/openBrain/integrations/raycast && ./voice-capture-cli.sh'
alias ob-pipeline='cd OPENBRAIN/openBrain && ./scripts/pipeline.sh'
alias ob-stats='curl -s "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" -H "Content-Type: application/json" -d '"'"'{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"thought_stats","arguments":{}}}'"'"' | jq'
alias ob-search='function _ob_search() { curl -s "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" -H "Content-Type: application/json" -d '"'"'{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_thoughts","arguments":{"query":"'$1'","limit":5}}}'"'"' | jq; }; _ob_search'

# Set env vars
export OPENAI_API_KEY='your-key-here'
export MCP_ENDPOINT='https://your-project.supabase.co/functions/v1/open-brain-mcp'
export MCP_ACCESS_KEY='your-key-here'
```

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/project/jeuxslbhjubxmhtzpvqf |
| OpenAI API Keys | https://platform.openai.com/api-keys |
| Raycast Extensions | https://www.raycast.com/store |
| whisper.cpp | https://github.com/ggerganov/whisper.cpp |

---

**Copy any command above and paste into terminal.**
