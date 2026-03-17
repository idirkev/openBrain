#!/bin/bash
# Standalone Voice Capture CLI
# Works without Raycast installed - uses environment variables

set -e

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "                    OPEN BRAIN - VOICE CAPTURE"
echo "                         (Standalone CLI)"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RECORD_DURATION=${1:-5}
AUDIO_FILE="/tmp/ob-voice-$(date +%s).wav"

# Check dependencies
check_deps() {
    if ! command -v sox &> /dev/null; then
        echo -e "${RED}❌ sox not found${NC}"
        echo "   Install: brew install sox"
        exit 1
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${RED}❌ OPENAI_API_KEY not set${NC}"
        echo "   export OPENAI_API_KEY='sk-...'"
        exit 1
    fi
}

# Waveform animation
waveform_animation() {
    local bars=("▁" "▂" "▃" "▄" "▅" "▆" "▇" "█")
    local pid=$1
    local elapsed=0
    
    while kill -0 $pid 2>/dev/null; do
        local line=""
        for i in {1..3}; do
            local idx=$((RANDOM % 8))
            line="${line}${bars[$idx]}"
        done
        
        printf "\r   ${BLUE}%s${NC} Recording... %02d/%02d seconds" "$line" "$elapsed" "$RECORD_DURATION"
        sleep 0.1
        
        # Update elapsed every 10 iterations (1 second)
        ((elapsed++)) || true
    done
    echo ""
}

# Recording with visual feedback
record_audio() {
    echo ""
    echo "🎤 ${YELLOW}Recording${NC} (speak now!)"
    echo ""
    
    # Start recording in background
    sox -d "$AUDIO_FILE" trim 0 $RECORD_DURATION 2>/dev/null &
    local sox_pid=$!
    
    # Show waveform animation
    local elapsed=0
    local bars=("▁" "▂" "▃" "▄" "▅" "▆" "▇" "█")
    
    while kill -0 $sox_pid 2>/dev/null; do
        local line=""
        for i in {1..20}; do
            local idx=$((RANDOM % 8))
            line="${line}${bars[$idx]}"
        done
        printf "\r   ${BLUE}%s${NC} %02d/%02ds" "$line" "$elapsed" "$RECORD_DURATION"
        sleep 1
        ((elapsed++)) || true
    done
    
    echo ""
    echo ""
    
    if [ -f "$AUDIO_FILE" ]; then
        local size=$(du -k "$AUDIO_FILE" | cut -f1)
        echo -e "${GREEN}✅${NC} Recorded: ${size}KB"
    else
        echo -e "${RED}❌${NC} Recording failed"
        exit 1
    fi
}

# Processing animation
processing_animation() {
    local stages=("🧠 Transcribing..." "🏷️  Classifying..." "🔍 Embedding..." "💾 Saving...")
    
    echo ""
    for stage in "${stages[@]}"; do
        printf "\r   ${YELLOW}%s${NC}" "$stage"
        sleep 0.8
    done
    echo ""
    echo ""
}

# Transcribe with Whisper
transcribe() {
    echo "📤 Sending to Whisper API..."
    
    local response
    response=$(curl -s -X POST https://api.openai.com/v1/audio/transcriptions \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -F file="@$AUDIO_FILE" \
      -F model="whisper-1" \
      -F language="en")
    
    # Cleanup
    rm -f "$AUDIO_FILE"
    
    # Check for errors
    if echo "$response" | grep -q '"error"'; then
        local error_msg=$(echo "$response" | grep -o '"message": "[^"]*"' | cut -d'"' -f4)
        echo -e "${RED}❌ API Error:${NC} $error_msg"
        exit 1
    fi
    
    # Extract text
    local text=$(echo "$response" | grep -o '"text"[^}]*' | cut -d'"' -f4)
    
    if [ -z "$text" ]; then
        echo -e "${RED}❌${NC} No transcription received"
        echo "   Response: $response"
        exit 1
    fi
    
    echo "$text"
}

# Detect template from keywords
detect_template() {
    local text="$1"
    local template="observation"
    local icon="👁️"
    
    # Check for keywords
    if [[ $text =~ ^Decision: ]]; then template="Decision"; icon="🎯"
    elif [[ $text =~ ^Risk: ]]; then template="Risk"; icon="⚠️"
    elif [[ $text =~ ^Insight: ]]; then template="Insight"; icon="💡"
    elif [[ $text =~ ^Milestone: ]]; then template="Milestone"; icon="🏔️"
    elif [[ $text =~ ^Spec: ]]; then template="Spec"; icon="📋"
    elif [[ $text =~ ^Meeting ]]; then template="Meeting Debrief"; icon="🤝"
    elif [[ $text =~ ^Stakeholder: ]]; then template="Stakeholder"; icon="👥"
    elif [[ $text =~ ^Budget: ]]; then template="Budget"; icon="💰"
    elif [[ $text =~ ^Invoice: ]]; then template="Invoice"; icon="🧾"
    elif [[ $text =~ ^Funding: ]]; then template="Funding"; icon="🏦"
    elif [[ $text =~ ^Legal: ]]; then template="Legal"; icon="⚖️"
    elif [[ $text =~ ^Compliance: ]]; then template="Compliance"; icon="🛡️"
    elif [[ $text =~ ^Contract: ]]; then template="Contract"; icon="📄"
    elif [[ $text =~ ^Ate: ]]; then template="Nutrition"; icon="🥗"
    elif [[ $text =~ ^Health: ]]; then template="Health"; icon="❤️"
    elif [[ $text =~ ^Home: ]]; then template="Home"; icon="🏠"
    elif [[ $text =~ ^\[.*\][[:space:]]— ]]; then template="Person Note"; icon="👤"
    elif [[ $text =~ "Saving from" ]]; then template="AI Save"; icon="🤖"
    fi
    
    echo "$template|$icon"
}

# Capture to Open Brain (if configured)
capture_to_openbrain() {
    local text="$1"
    
    if [ -z "$MCP_ENDPOINT" ] || [ -z "$MCP_ACCESS_KEY" ]; then
        echo -e "${YELLOW}⏳${NC} MCP_ENDPOINT or MCP_ACCESS_KEY not set"
        echo "   Skipping Open Brain capture"
        return 0
    fi
    
    echo "📤 Sending to Open Brain..."
    
    local response
    response=$(curl -s -X POST "$MCP_ENDPOINT?key=$MCP_ACCESS_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"jsonrpc\": \"2.0\",
        \"id\": 1,
        \"method\": \"tools/call\",
        \"params\": {
          \"name\": \"capture_thought\",
          \"arguments\": { \"content\": \"$text\" }
        }
      }" 2>/dev/null)
    
    if echo "$response" | grep -q '"status": "captured"'; then
        local id=$(echo "$response" | grep -o '"id"[^,]*' | head -1 | cut -d'"' -f4)
        echo -e "${GREEN}✅${NC} Saved to Open Brain (ID: ${id:0:8}...)"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC} Open Brain capture failed (but transcription worked)"
        return 1
    fi
}

# Success display
show_success() {
    local text="$1"
    local template_info=$(detect_template "$text")
    local template=$(echo "$template_info" | cut -d'|' -f1)
    local icon=$(echo "$template_info" | cut -d'|' -f2)
    
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo ""
    echo -e "${GREEN}✅ CAPTURED!${NC}"
    echo ""
    echo -e "   ${icon} ${YELLOW}$template${NC}"
    echo ""
    echo "   \"$text\""
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
}

# Main
main() {
    check_deps
    record_audio
    processing_animation
    
    echo ""
    local transcription=$(transcribe)
    
    show_success "$transcription"
    capture_to_openbrain "$transcription"
    
    echo ""
}

# Handle Ctrl+C
trap 'echo -e "\n\n❌ Cancelled"; rm -f /tmp/ob-voice-*.wav; exit 0' INT

main
