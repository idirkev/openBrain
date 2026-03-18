#!/bin/bash
# Kimi Agent Launcher for Open Brain
# Usage: ./scripts/kimi-agent.sh [context]
# Contexts: research, review, security, report

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source shared theme library
source "${SCRIPT_DIR}/lib/colors.sh"
source "${SCRIPT_DIR}/lib/models.sh"

PROJECT_ROOT="/Users/kevfreeney/OPENBRAIN/openBrain"
FUNCTIONS_DIR="/Users/kevfreeney/supabase/functions"
KIMI="${KIMI_CLI}"

cd "$PROJECT_ROOT"

CONTEXT="${1:-research}"

# Elapsed time tracking
START_SECONDS=$SECONDS

CODEX_FORMAT="Output your findings in the Open Brain Codex format. Structure as: SUMMARY (for humans), CODEX (yaml metadata), DETAILED FINDINGS (with source, severity, raw_evidence, classification, impact, recommendation per finding), RAW REFERENCES (table of files read)."

show_context_info() {
    case "$CONTEXT" in
        research)
            ob_info "Context: Deep Research (Pipeline Step 1a)"
            ob_info "Analyse the full codebase, roadmap, and architecture."
            ob_info "Output feeds into Opus for decision-making."
            echo ""
            ob_info "Scope:"
            ob_info "  - All Edge Functions, docs/status/ROADMAP.md, docs/process/HANDOVER.md, CLAUDE.md"
            ob_info "  - Current phase status and blockers"
            ob_info "  - Codebase patterns, dependencies, tech debt"
            PROMPT="You are a deep research agent. Your output will be used by Claude Opus to make architecture and planning decisions. Be thorough. Read every file in scope. Produce a structured research brief with: 1) Current System State (what exists, what works, what is deployed), 2) Codebase Patterns (how code is structured, shared patterns, conventions), 3) Open Issues and Tech Debt (bugs, missing validation, security gaps, incomplete features), 4) Dependencies and External Services (what APIs, what versions, what limits), 5) Blockers and Risks (what could go wrong, what is fragile), 6) Opportunities (what could be improved, what is ready for next phase). Be factual. Include file paths and line numbers. No opinions on architecture. Just data for the decision-maker. ${CODEX_FORMAT}"
            ;;
        review)
            ob_info "Context: Code Review"
            ob_info "Review Edge Functions for bugs, logic errors, and improvements."
            echo ""
            ob_info "Targets:"
            ob_info "  - ${FUNCTIONS_DIR}/ingest-thought/index.ts"
            ob_info "  - ${FUNCTIONS_DIR}/meeting-notes/index.ts"
            PROMPT="You are a relentless code reviewer. Read every file in scope. For each file, report: critical bugs, logic errors, security issues, performance problems, and missed edge cases. Be specific. Line numbers. No praise. Structure your output as a report card with severity levels (CRITICAL / HIGH / MEDIUM / LOW). End with a prioritised fix list. ${CODEX_FORMAT}"
            ;;
        security)
            ob_info "Context: Security Audit"
            ob_info "Deep security review of all Edge Functions and credentials."
            echo ""
            ob_info "Focus areas:"
            ob_info "  - Authentication and authorization"
            ob_info "  - Input validation and sanitization"
            ob_info "  - Secret handling and exposure"
            ob_info "  - API key management"
            PROMPT="You are a security auditor. Perform a thorough security review of all Edge Function code. Check for: missing authentication (Slack signature verification, API key validation), input injection risks, secret exposure in logs or error messages, unvalidated external input, missing rate limiting, OWASP top 10 vulnerabilities. Report every finding with severity, file, line number, and recommended fix. No praise. Be brutal. ${CODEX_FORMAT}"
            ;;
        report)
            ob_info "Context: Report Card"
            ob_info "Generate a full project status report card."
            echo ""
            ob_info "Covers:"
            ob_info "  - Code quality across all functions"
            ob_info "  - Open issues and tech debt"
            ob_info "  - Recommended next actions"
            PROMPT="You are a senior technical lead reviewing the Open Brain project. Read docs/status/ROADMAP.md, docs/process/HANDOVER.md, and all Edge Function code. Produce a structured report card with: Executive Summary, Project Structure, Critical Issues, High Priority Tasks, Medium Priority Tasks, Decision Register (pending decisions), and Suggested Next Session Flow (3 options). Be specific and actionable. Use the same format as a Kimi Code Next Tasks review. ${CODEX_FORMAT}"
            ;;
        *)
            printf "%b  Unknown context: %s%b\n" "${UI_FAIL}" "$CONTEXT" "${NC}"
            ob_info "Available contexts: research, review, security, report"
            exit 1
            ;;
    esac
}

# Main
ob_section "Kimi Agent — Open Brain" "${KIMI_EMOJI}" "${KIMI_COLOR}"
show_context_info

echo ""
ob_model_tag "Kimi"
printf " launching...\n\n"

# Create a temporary agent file for this session
AGENT_FILE=$(mktemp /tmp/ob-kimi-XXXXXX.md)
cat > "$AGENT_FILE" << EOF
# Open Brain -- Kimi Session [$CONTEXT]

## Instructions

$PROMPT

## Project Files

- Edge Functions: $FUNCTIONS_DIR/ingest-thought/index.ts, $FUNCTIONS_DIR/meeting-notes/index.ts
- Roadmap: $PROJECT_ROOT/docs/status/ROADMAP.md
- Handover: $PROJECT_ROOT/docs/process/HANDOVER.md
- Agent routing: $PROJECT_ROOT/CLAUDE.md

## Architecture

Slack #log channel -> webhook -> ingest-thought Edge Function (Supabase/Deno)
Google Meet -> Gemini transcript -> Apps Script -> meeting-notes Edge Function
Both functions: OpenRouter gpt-4o-mini for classification, text-embedding-3-small for vectors
Storage: Supabase thoughts table with vector search

## Template System (19 templates, 3 layers)

Team Core (8): Decision, Risk, Milestone, Spec, Meeting Debrief, Person Note, Stakeholder, Sent
Role (6): Budget, Invoice, Funding, Legal, Compliance, Contract
Personal (5): Insight, AI Save, Nutrition, Health, Home
EOF

ob_info "Agent file ready. Starting Kimi..."
echo ""

# Launch Kimi with Open Brain scope
cd "$PROJECT_ROOT"
"$KIMI" \
    --work-dir "$PROJECT_ROOT" \
    --add-dir "$FUNCTIONS_DIR" \
    --agent-file "$AGENT_FILE"

# Cleanup
rm -f "$AGENT_FILE"

ELAPSED=$(( SECONDS - START_SECONDS ))
ELAPSED_FMT=$(ob_format_time "$ELAPSED")
echo ""
ob_success "Kimi session complete. Elapsed: ${ELAPSED_FMT}"
