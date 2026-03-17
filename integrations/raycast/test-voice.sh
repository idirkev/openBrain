#!/bin/bash
# Test voice capture without Raycast (direct script)
# Usage: ./test-voice.sh

set -e

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                    VOICE CAPTURE TEST"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Check sox
if ! command -v sox &> /dev/null; then
    echo "❌ sox not found. Install with: brew install sox"
    exit 1
fi

echo "✅ sox found: $(sox --version | head -1)"
echo ""

# Check OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set"
    echo "   export OPENAI_API_KEY='sk-...'"
    exit 1
fi

echo "✅ OpenAI API key configured"
echo ""

# Create temp file
AUDIO_FILE="/tmp/test-voice-$$.wav"

echo "🎤 Recording 5 seconds of audio..."
echo "   (Speak now!)"
echo ""

# Record for 5 seconds
sox -d "$AUDIO_FILE" trim 0 5

echo ""
echo "🧠 Sending to Whisper API..."
echo ""

# Transcribe
RESPONSE=$(curl -s -X POST https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F file="@$AUDIO_FILE" \
  -F model="whisper-1" \
  -F language="en")

# Cleanup
rm -f "$AUDIO_FILE"

# Check for errors
if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ API Error:"
    echo "$RESPONSE" | jq -r '.error.message' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

# Extract text
TRANSCRIPTION=$(echo "$RESPONSE" | jq -r '.text')

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                    TRANSCRIPTION RESULT"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📝 Text: $TRANSCRIPTION"
echo ""

# Optionally send to Open Brain
if [ -n "$MCP_ENDPOINT" ] && [ -n "$MCP_ACCESS_KEY" ]; then
    echo "📤 Sending to Open Brain..."
    
    curl -s -X POST "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"jsonrpc\": \"2.0\",
        \"id\": 1,
        \"method\": \"tools/call\",
        \"params\": {
          \"name\": \"capture_thought\",
          \"arguments\": {
            \"content\": \"$TRANSCRIPTION\"
          }
        }
      }" | jq -r '.result.content[0].text' | jq .
    
    echo ""
    echo "✅ Captured to Open Brain!"
else
    echo "⏳ MCP_ENDPOINT or MCP_ACCESS_KEY not set"
    echo "   Skipping Open Brain capture (would work in Raycast)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
