# Raycast + Whisper Visual Design Specification

## Design Philosophy: "Cinematic Minimalism"

Every interaction should feel like a moment from a sci-fi interface — smooth, purposeful, intelligent.

---

## Command: `obv` (Open Brain Voice)

### Trigger
```
Hotkey: ⌥ + Space (Raycast) → type "obv" → Enter
Alternative: Global hotkey ⌥ + V (configured in Raycast preferences)
```

---

## Visual States

### State 1: Recording HUD

```
┌─────────────────────────────────────┐
│  ◉ Recording...          00:03 🔴  │
│                                     │
│     ▁▂▃▅▆▇█▇▆▅▃▂▁                 │  ← Live waveform
│        ▁▂▃▅▆▇█▇▆▅▃▂▁              │
│     ▁▂▃▅▆▇█▇▆▅▃▂▁                 │
│                                     │
│  🎤 Speak your thought...           │
│                                     │
│  [Hold Space] Record  [Esc] Cancel  │
└─────────────────────────────────────┘
```

**Visual Elements:**
- **Waveform**: 3-bar visualization, updates 30fps from audio levels
- **Timer**: MM:SS in monospace font
- **Pulse**: Red recording dot with 1s blink animation
- **Background**: Semi-transparent dark (90% opacity)

---

### State 2: Processing

```
┌─────────────────────────────────────┐
│  🧠 Processing...                   │
│                                     │
│         ⣾  Whisper                  │  ← Spinner stages
│         ⣽  → Transcribing...        │
│         ⣻  → Classifying...         │
│         ⢿  → Embedding...           │
│                                     │
│  "Insight about knowledge graphs"   │  ← Live preview
│                                     │
└─────────────────────────────────────┘
```

**Animation:**
- Staged progress (4 steps, ~2 seconds each)
- Text fades in as each step completes
- Final transcription preview before commit

---

### State 3: Success with Classification

```
┌─────────────────────────────────────┐
│  ✅ Captured!                       │
│                                     │
│  💡 Insight                         │  ← Template icon + name
│  ─────────────────────────────────  │
│  "Knowledge graphs enable           │
│   emergent structure discovery"     │
│                                     │
│  Topics: #knowledge-management      │
│          #graphs                    │
│                                     │
│  [View]  [Copy]  [Capture Another]  │
└─────────────────────────────────────┘
```

**Visual Elements:**
- **Template Icon**: Emoji based on classification (💡 for Insight, ⚠️ for Risk, etc.)
- **Gradient Background**: Subtle template color (Insight = amber, Risk = red, etc.)
- **Success Pulse**: Green flash on completion
- **Topics**: Hashtag-style pills

---

### State 4: Error Recovery

```
┌─────────────────────────────────────┐
│  ⚠️  Couldn't capture               │
│                                     │
│  "Network connection failed"        │
│                                     │
│  [Retry]  [Edit as Text]  [Copy]    │
│                                     │
│  Your transcription is saved:       │
│  "The thought that failed..."       │
└─────────────────────────────────────┘
```

**Recovery:** Never lose the transcription — always save locally for retry.

---

## Visual Effects Specifications

### Waveform Animation
```typescript
// Real-time audio visualization
// Uses Raycast's built-in List with custom accessories

interface WaveformBar {
  height: number;  // 0-100%
  color: string;   // Gradient from #ff6b6b to #4ecdc4
  speed: number;   // Update frequency (30fps target)
}

// Implementation: 3 bars, center is delayed by 1 frame
// Creates "wave" effect without complex graphics
```

### Success Pulse
```typescript
// Green flash animation on capture success

const successAnimation = {
  frames: [
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1.0 },   // Flash at 100ms
    { opacity: 0.5, scale: 1.02 },
    { opacity: 0, scale: 1.0 }    // Fade out at 500ms
  ],
  color: "#4caf50",  // Success green
  haptic: "success"  // MacBook haptic feedback
};
```

### Template Color Coding
```typescript
const templateColors = {
  Decision:   { bg: "#fff3e0", icon: "🎯", accent: "#ff9800" },
  Risk:       { bg: "#ffebee", icon: "⚠️", accent: "#f44336" },
  Insight:    { bg: "#fff8e1", icon: "💡", accent: "#ffc107" },
  Milestone:  { bg: "#e8f5e9", icon: "🏔️", accent: "#4caf50" },
  Meeting:    { bg: "#e3f2fd", icon: "🤝", accent: "#2196f3" },
  Spec:       { bg: "#f3e5f5", icon: "📋", accent: "#9c27b0" },
  Person:     { bg: "#fce4ec", icon: "👤", accent: "#e91e63" },
  Budget:     { bg: "#e0f2f1", icon: "💰", accent: "#009688" },
  // ... etc for all 19 templates
};
```

---

## Alternative: Floating HUD Mode

For even more minimal interaction:

```
     ╭──────────────────╮
     │  🎤  Recording   │  ← Appears near cursor
     │  ▁▂▃▅▆▇█▇▆▅▃▂▁  │
     ╰──────────────────╯
              ↓ (on release)
     ╭──────────────────╮
     │  ✅  Captured    │  ← Brief confirmation
     │  💡 Insight      │
     ╰──────────────────╯
              ↓ (2s)
            [fades]
```

**Implementation:** Use Raycast's `HUD` API for toast-like notifications.

---

## Audio Feedback

```typescript
// Subtle sound design for each state

const audioFeedback = {
  startRecording:   "subtle-click.wav",      // 100ms, 440Hz
  stopRecording:    "soft-chime.wav",        // 200ms, ascending
  processingStart:  "gentle-hum.wav",        // Loop during processing
  success:          "success-ding.wav",      // 300ms, C major chord
  error:            "gentle-buzz.wav",       // 150ms, low frequency
};

// Volume: 20% of system (subtle, not jarring)
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Start recording | `⌥ + V` (global) or `obv` + Enter |
| Stop recording | Release key OR `Space` |
| Cancel | `Esc` |
| Retry on error | `⌘ + R` |
| Edit transcription | `⌘ + E` |

---

## Implementation Priority

### Phase 1: Basic Voice (MVP)
- [ ] Record audio (5s chunks)
- [ ] Send to Whisper API
- [ ] Basic success/error feedback
- [ ] Static UI (no waveform)

### Phase 2: Visual Polish
- [ ] Live waveform visualization
- [ ] Processing animation stages
- [ ] Template-specific success screens
- [ ] Haptic feedback

### Phase 3: Advanced Features
- [ ] Continuous recording mode (until silence)
- [ ] Voice command detection ("stop", "cancel")
- [ ] Local whisper.cpp option
- [ ] Custom wake word ("Hey Brain")

---

## Technical Requirements

### Raycast APIs Needed
- `Audio` — Recording (if available)
- `Form` — Custom UI with live updates
- `Toast` — Success/error feedback
- `Action` — Retry/edit actions
- `environment` — Haptic feedback

### Workarounds for Recording
Raycast extensions can't directly access microphone. Options:

1. **Use `osascript`** to trigger QuickTime/Soundflower
2. **Shell out** to `sox` or `ffmpeg` for CLI recording
3. **Companion app** — Small Swift app that handles audio, Raycast triggers it
4. **Raycast's upcoming audio API** — Wait for native support

### Recommended Approach (Now)
```bash
# Use sox for CLI recording
sox -d -t wav - trim 0 5 | \
  curl -X POST https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file="@-" \
  -F model="whisper-1"
```

---

## Cost Estimation (Whisper API)

| Usage | Duration | Cost |
|-------|----------|------|
| Light (10/day) | 50 min/month | $0.30/month |
| Medium (50/day) | 250 min/month | $1.50/month |
| Heavy (200/day) | 1000 min/month | $6.00/month |

**Alternative:** Local whisper.cpp = $0, but ~2GB model download.
