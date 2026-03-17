# Voice Capture Troubleshooting Guide

## Common Issues & Fixes

### Issue 1: "OpenAI API key not configured"

**Cause:** Raycast extension not yet installed, or preferences not set.

**Fix:**
```bash
# Option A: Set env var (temporary)
export OPENAI_API_KEY='sk-...'

# Option B: Install extension and configure in Raycast preferences
# 1. Open Raycast
# 2. Import Extension
# 3. Select this folder
# 4. Add OpenAI API Key in preferences
```

---

### Issue 2: "sox command failed"

**Cause:** Microphone permission denied or sox not installed.

**Fix:**
```bash
# Check sox
which sox || brew install sox

# Check microphone permissions
# System Preferences > Security & Privacy > Microphone > Raycast (enable)
```

---

### Issue 3: Recording works but transcription is empty

**Cause:** Audio levels too low or curl response parsing failed.

**Fix:**
```bash
# Test audio levels
sox -d -t wav /tmp/test.wav trim 0 3
# Check file has content
ls -lh /tmp/test.wav

# Test API directly
curl -X POST https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file="@/tmp/test.wav" \
  -F model="whisper-1"
```

---

### Issue 4: "Cannot find module './api'"

**Cause:** Import path issue or api.ts not found.

**Fix:** Check that `src/api.ts` exists in same directory.

---

## Quick Test Script

Run this to verify the full pipeline:

```bash
cd OPENBRAIN/openBrain/integrations/raycast
./test-voice.sh
```

---

## Fallback: Manual Voice Capture

If Raycast extension fails, use this direct method:

```bash
# 1. Record
sox -d /tmp/voice.wav trim 0 5

# 2. Transcribe
curl -X POST https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file="@/tmp/voice.wav" \
  -F model="whisper-1" | jq -r '.text'

# 3. Capture to Open Brain (if endpoint configured)
curl -X POST "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"capture_thought\",
      \"arguments\": { \"content\": \"YOUR_TRANSCRIPTION_HERE\" }
    }
  }"
```

---

## Status Checklist

| Component | Test | Status |
|-----------|------|--------|
| sox installed | `which sox` | ? |
| Microphone access | `sox -d test.wav trim 0 1` | ? |
| OpenAI API key | `echo $OPENAI_API_KEY` | ? |
| API connectivity | curl test above | ? |
| Raycast installed | Raycast app open | ? |
| Extension imported | Extension shows in Raycast | ? |
| Preferences set | MCP + OpenAI keys in Raycast | ? |

---

## Where It Can Fail

1. **sox installation** → `brew install sox`
2. **Microphone permissions** → System Preferences
3. **OpenAI key** → Export env var or set in Raycast prefs
4. **Extension not imported** → Manual Raycast import
5. **MCP endpoint not set** → Can't save to Open Brain
6. **Network issues** → Check internet connection

---

## Debug Mode

Enable verbose logging in voice-capture.tsx:

```typescript
// Add this to startRecording()
console.log("Starting recording...");
console.log("Audio path:", audioPath);

// Add this to transcribeAudio()
console.log("API Response:", stdout);
console.log("Parsed text:", response.text);
```

View logs in Raycast:
- Raycast → Preferences → Advanced → Console
