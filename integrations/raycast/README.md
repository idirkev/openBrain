# Open Brain Raycast Extension

Quick capture and search for your Open Brain knowledge system.

## Features

- **Capture Thought** — Quick capture with auto-classification
- **Search Thoughts** — Semantic search by meaning
- **List Recent** — Browse with type filters
- **Statistics** — Overview of your knowledge base
- **Quick Capture** — Instant capture from command line
- **Voice Capture** 🎤 — Voice-to-text with Whisper (visual waveform + live transcription)

## Setup

1. **Install dependencies:**
   ```bash
   cd OPENBRAIN/openBrain/integrations/raycast
   npm install
   ```

2. **Configure preferences** in Raycast:
   - **MCP Endpoint**: Your Supabase edge function URL
     - Example: `https://your-project.supabase.co/functions/v1/open-brain-mcp`
   - **Access Key**: Your `MCP_ACCESS_KEY` secret
   - **Default Days**: How far back to look for recent thoughts (default: 7)
   - **OpenAI API Key** (optional): For Voice Capture feature (`sk-...`)

3. **For Voice Capture (optional):**
   ```bash
   # Install sox for audio recording
   brew install sox
   
   # Get OpenAI API key from https://platform.openai.com/api-keys
   # Add to Raycast preferences
   ```

3. **Build and install:**
   ```bash
   npm run build
   ray install
   ```

## Commands

| Command | Trigger | Description |
|---------|---------|-------------|
| Capture Thought | `obc` | Form-based capture with paste options |
| Search Thoughts | `obs` | Semantic search across all thoughts |
| List Recent | `obl` | Browse recent with type filters |
| Statistics | `obst` | View counts, topics, people |
| Quick Capture | `obq` | Instant capture: `obq "Your thought"` |
| **Voice Capture** | `obv` | 🎤 Voice-to-text with live waveform and transcription |

## Template Keywords

Use these prefixes for auto-classification:

| Keyword | Type | Template |
|---------|------|----------|
| `Decision:` | task | Decision |
| `Risk:` | task | Risk |
| `Insight:` | idea | Insight |
| `Spec:` | reference | Spec |
| `[Name] —` | person_note | Person Note |
| `Meeting with` | observation | Meeting Debrief |
| `Budget:` | observation | Budget |

## Keyboard Shortcuts

- **Cmd + Shift + V** — Paste from selection (in Capture Thought)
- **Cmd + R** — Refresh list/stats
- **Cmd + C** — Copy thought content

## Voice Capture 🎤

Voice capture uses OpenAI's Whisper for high-quality transcription with visual feedback.

### How it works

1. Trigger `obv` (Voice Capture)
2. See live waveform animation while recording
3. Speak your thought (up to 30 seconds)
4. Watch processing stages in real-time
5. See success screen with template classification

### Visual States

| State | Visual |
|-------|--------|
| **Recording** | `▁▂▃▅▆▇█▇▆▅▃▂▁` Live waveform + timer |
| **Processing** | Staged progress: 🧠 → 🏷️ → 🔍 → 💾 |
| **Success** | Template-colored card with content preview |
| **Error** | Recovery options with saved transcription |

### Cost

~$0.006 per minute of audio (Whisper API). Typical use:
- Light (10 captures/day): ~$0.30/month
- Heavy (100 captures/day): ~$3/month

### Alternative: Local Whisper

For zero cost and privacy, use local whisper.cpp:
```bash
# Install whisper.cpp
brew install whisper.cpp

# Download model (2GB)
whisper-download-ggml-model base.en

# Modify voice-capture.tsx to use local binary
```

See `VISUAL_DESIGN.md` for full visual specification.

## Troubleshooting

**"Unauthorized" error:**
- Check your MCP_ACCESS_KEY in preferences
- Verify the edge function URL is correct

**"Failed to connect" error:**
- Ensure your Supabase project is running
- Check that `open-brain-mcp` edge function is deployed

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Publish to Raycast Store
npm run publish
```

## Integration Architecture

### Standard Flow
```
Raycast Extension → MCP Edge Function → Supabase Database
                          ↓
                    OpenRouter (embeddings + extraction)
```

### Voice Capture Flow
```
Raycast Extension → sox (record) → Whisper API → Text
                                              ↓
                                    MCP Edge Function → Supabase
```

The extension communicates via JSON-RPC to your deployed MCP edge function, which handles authentication, vector embeddings, and database operations.

Voice capture adds a preprocessing step: audio recording → Whisper transcription → standard capture flow.
