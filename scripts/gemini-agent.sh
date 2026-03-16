#!/bin/bash
# Gemini Agent Launcher for Open Brain
# Usage: ./scripts/gemini-agent.sh [context] [--mode standard|think|research]
# Contexts: briefing, email, drive
# Modes: standard (default), think (Deep Think), research (Interactions API note)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source shared theme library
source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/models.sh"

PROJECT_ROOT="/Users/kevfreeney/OPENBRAIN/openBrain"
FUNCTIONS_DIR="/Users/kevfreeney/supabase/functions"
GEMINI_BIN="${GEMINI_CLI}"

cd "$PROJECT_ROOT"

# Parse arguments: first positional arg is context, --mode flag can appear anywhere
CONTEXT=""
MODE="standard"

for arg in "$@"; do
    case "$arg" in
        --mode=*)
            MODE="${arg#--mode=}"
            ;;
        --mode)
            # handled by shift below — use positional parsing instead
            ;;
        *)
            if [[ -z "$CONTEXT" && "$arg" != --* ]]; then
                CONTEXT="$arg"
            fi
            ;;
    esac
done

# Second pass: handle --mode <value> (space-separated)
args=("$@")
for (( i=0; i<${#args[@]}; i++ )); do
    if [[ "${args[$i]}" == "--mode" && $(( i+1 )) -lt ${#args[@]} ]]; then
        MODE="${args[$((i+1))]}"
    fi
done

CONTEXT="${CONTEXT:-briefing}"

# Elapsed time tracking
START_SECONDS=$SECONDS

CODEX_FORMAT="Output your findings in the Open Brain Codex format. Structure as: SUMMARY (for humans), CODEX (yaml metadata), DETAILED FINDINGS (with source, severity, raw_evidence, classification, impact, recommendation per finding), RAW REFERENCES (table of files read)."

case "$CONTEXT" in
    briefing)
        ob_info "Context: Morning Briefing"
        ob_info "Pulls calendar, priority emails, recent Drive activity."
        PROMPT="You are the Open Brain morning briefing agent. Summarise today's Google Calendar events, flag any unread priority emails from the last 12 hours, and list recent Google Drive file activity from shared team folders. Output as structured markdown with sections: Schedule, Priority Emails, Drive Activity. Keep it concise. No fluff. ${CODEX_FORMAT}"
        ;;
    email)
        ob_info "Context: Email Triage"
        ob_info "Scans Gmail for action items, deadlines, correspondence."
        PROMPT="You are the Open Brain email triage agent. Scan the Gmail inbox for the last 24 hours. For each email that needs action, extract: sender, subject, action required, deadline (if any), and classify against these templates: Sent, Stakeholder, Decision, Compliance, Contract. Output as a structured JSON array with fields: from, subject, action, deadline, template. Skip newsletters and automated notifications. ${CODEX_FORMAT}"
        ;;
    drive)
        ob_info "Context: Drive Search"
        ob_info "Searches across team Google Drive for relevant documents."
        PROMPT="You are the Open Brain document search agent. Search Google Drive for recent documents, meeting notes, and shared files relevant to the idirnet team. List files modified in the last 7 days with: filename, last modified date, folder, and a one-line summary of content. Output as structured markdown table. ${CODEX_FORMAT}"
        ;;
    *)
        printf "%b  Unknown context: %s%b\n" "${UI_FAIL}" "$CONTEXT" "${NC}"
        ob_info "Available contexts: briefing, email, drive"
        exit 1
        ;;
esac

ob_section "Gemini Agent — Open Brain" "${GEMINI_EMOJI}" "${GEMINI_COLOR}"

echo ""
ob_model_tag "Gemini"

# Handle --mode logic
case "$MODE" in
    standard)
        printf " launching in standard mode...\n\n"
        ;;
    think)
        printf " launching in Deep Think mode (${GEMINI_THINK_MODEL})...\n\n"
        ;;
    research)
        printf " Deep Research mode selected.\n\n"
        printf "%b  ◦  Deep Research requires the Gemini Interactions API.%b\n" "${UI_INFO}" "${NC}"
        printf "%b  ◦  Use the following Python snippet to invoke it:%b\n\n" "${UI_INFO}" "${NC}"
        printf "%b" "${UI_DIM}"
        cat << 'PYSNIPPET'
import google.generativeai as genai

genai.configure(api_key="YOUR_GEMINI_API_KEY")

model = genai.GenerativeModel("gemini-3.1-pro")
response = model.generate_content(
    YOUR_PROMPT,
    generation_config=genai.GenerationConfig(
        response_mime_type="text/plain",
    ),
    tools=[genai.protos.Tool(google_search_retrieval=genai.protos.GoogleSearchRetrieval())]
)
print(response.text)
PYSNIPPET
        printf "%b\n" "${NC}"
        ELAPSED=$(( SECONDS - START_SECONDS ))
        ELAPSED_FMT=$(ob_format_time "$ELAPSED")
        ob_info "Deep Research note displayed. Elapsed: ${ELAPSED_FMT}"
        exit 0
        ;;
    *)
        printf "%b  Unknown mode: %s. Valid modes: standard, think, research.%b\n" "${UI_FAIL}" "$MODE" "${NC}"
        exit 1
        ;;
esac

echo ""

# Launch Gemini with optional model flag for think mode
if [[ "$MODE" == "think" ]]; then
    "$GEMINI_BIN" \
        -m "${GEMINI_THINK_MODEL}" \
        --include-directories "$FUNCTIONS_DIR" \
        --prompt "$PROMPT"
else
    "$GEMINI_BIN" \
        --include-directories "$FUNCTIONS_DIR" \
        --prompt "$PROMPT"
fi

ELAPSED=$(( SECONDS - START_SECONDS ))
ELAPSED_FMT=$(ob_format_time "$ELAPSED")
echo ""
ob_success "Gemini session complete. Elapsed: ${ELAPSED_FMT}"
