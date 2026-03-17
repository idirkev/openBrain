#!/bin/bash
# =============================================================================
# Open Brain Pipeline B: Parallel Scout with Correction Loop
# =============================================================================
# Usage:
#   ./scripts/pipeline.sh              # Full pipeline (interactive mode)
#   ./scripts/pipeline.sh --from 3     # Resume from step 3
#   ./scripts/pipeline.sh --dry-run    # Preview pipeline, no execution
#   ./scripts/pipeline.sh --headless   # Fully automated using claude -p
# =============================================================================

set -euo pipefail

# =============================================================================
# RESOLVE SCRIPT DIRECTORY
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# =============================================================================
# SOURCE LIBRARIES
# =============================================================================

# shellcheck source=lib/colors.sh
source "${SCRIPT_DIR}/lib/colors.sh"
# shellcheck source=lib/models.sh
source "${SCRIPT_DIR}/lib/models.sh"

# =============================================================================
# ARGUMENT PARSING
# =============================================================================

ARG_FROM=1
ARG_DRY_RUN=0
ARG_HEADLESS=0
ARG_TASK=""
ARG_INTENSITY="full"

_usage() {
    printf "%b" "${UI_INFO}"
    printf "Usage: %s [OPTIONS]\n\n" "$(basename "$0")"
    printf "  %-30s %s\n" "--task \"description\""  "Task for all models to work on"
    printf "  %-30s %s\n" "--intensity light|standard|full" "Pipeline intensity level"
    printf "  %-30s %s\n" "--from N"               "Resume pipeline from step N (1-7)"
    printf "  %-30s %s\n" "--dry-run"              "Preview all steps, no execution"
    printf "  %-30s %s\n" "--headless"             "Fully automated (claude -p, no prompts)"
    printf "  %-30s %s\n" "-h, --help"             "Show this help message"
    printf "%b\n" "${NC}"
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --from)
            shift
            if [[ -z "${1:-}" || ! "$1" =~ ^[0-9]+$ ]]; then
                printf "%b  ✘  --from requires a numeric step number%b\n" "${UI_FAIL}" "${NC}" >&2
                exit 1
            fi
            ARG_FROM="$1"
            shift
            ;;
        --dry-run)
            ARG_DRY_RUN=1
            shift
            ;;
        --headless)
            ARG_HEADLESS=1
            shift
            ;;
        --task)
            shift
            ARG_TASK="${1:-}"
            if [[ -z "$ARG_TASK" ]]; then
                printf "%b  ✘  --task requires a description%b\n" "${UI_FAIL}" "${NC}" >&2
                exit 1
            fi
            shift
            ;;
        --task=*)
            ARG_TASK="${1#--task=}"
            shift
            ;;
        --intensity)
            shift
            ARG_INTENSITY="${1:-}"
            case "$ARG_INTENSITY" in
                light|standard|full) ;;
                *)
                    printf "%b  ✘  --intensity must be light, standard, or full%b\n" "${UI_FAIL}" "${NC}" >&2
                    exit 1
                    ;;
            esac
            shift
            ;;
        --intensity=*)
            ARG_INTENSITY="${1#--intensity=}"
            case "$ARG_INTENSITY" in
                light|standard|full) ;;
                *)
                    printf "%b  ✘  --intensity must be light, standard, or full%b\n" "${UI_FAIL}" "${NC}" >&2
                    exit 1
                    ;;
            esac
            shift
            ;;
        -h|--help)
            _usage
            ;;
        *)
            printf "%b  ✘  Unknown option: %s%b\n" "${UI_FAIL}" "$1" "${NC}" >&2
            exit 1
            ;;
    esac
done

# =============================================================================
# INTENSITY-BASED STEP CONTROL
# =============================================================================
# light:    steps 3 + 4 + 7 (build + correct + gate)
# standard: steps 2 + 3 + 4 + 7 (plan + build + correct + gate)
# full:     all steps 1-7

_intensity_skip() {
    local step_num="$1"
    case "$ARG_INTENSITY" in
        light)
            # Only run 3, 4, 7
            case "$step_num" in
                3|4|7) return 1 ;;  # don't skip
                *)     return 0 ;;  # skip
            esac
            ;;
        standard)
            # Only run 2, 3, 4, 7
            case "$step_num" in
                2|3|4|7) return 1 ;;
                *)       return 0 ;;
            esac
            ;;
        full)
            return 1 ;;  # never skip
    esac
}

# =============================================================================
# RUN DIRECTORY
# =============================================================================

RUN_DIR="/tmp/ob-pipeline-$(date +%Y%m%d-%H%M%S)"
if [[ $ARG_DRY_RUN -eq 0 ]]; then
    mkdir -p "${RUN_DIR}"
fi

# =============================================================================
# TIMING ARRAYS  (populated during execution)
# =============================================================================

# Indices: 0=1a-kimi, 1=1b-gemini, 2=2-opus, 3=3-sonnet, 4=4-opus,
#          5=5a-kimi, 6=5b-gemini, 7=7-codex
OB_STEP_NAMES=()
OB_STEP_MODELS=()
OB_STEP_TIMES=()
OB_STEP_STATUSES=()

# Pipeline diagram completion counter (0-7)
_DIAGRAM_DONE=0

# Pipeline start time
_PIPELINE_START=$(date +%s)

# =============================================================================
# HELPER: seconds elapsed since a given epoch second
# =============================================================================

_elapsed() {
    local start="$1"
    local now
    now=$(date +%s)
    printf "%d" "$(( now - start ))"
}

# =============================================================================
# HELPER: record a step result into the summary arrays
# =============================================================================

_record_step() {
    local name="$1"
    local model="$2"
    local time_secs="$3"
    local status="$4"      # "ok" | "fail"
    OB_STEP_NAMES+=("$name")
    OB_STEP_MODELS+=("$model")
    OB_STEP_TIMES+=("$time_secs")
    OB_STEP_STATUSES+=("$status")
}

# =============================================================================
# HELPER: should we skip this step? (--from N)
# Internal step numbers: 1a=1, 1b=1, 2=2, 3=3, 4=4, 5a=5, 5b=5, 7=7
# =============================================================================

_skip_step() {
    local step_num="$1"
    # Skip if before --from resumption point
    [[ $step_num -lt $ARG_FROM ]] && return 0
    # Skip if intensity level excludes this step
    _intensity_skip "$step_num" && return 0
    return 1
}

# =============================================================================
# HELPER: run a single background sub-step, capture output, return PID
# =============================================================================

_run_background() {
    # Usage: _run_background <outfile> <cmd> [args...]
    local outfile="$1"
    shift
    "$@" >"${outfile}" 2>&1 &
    printf "%d" "$!"
}

# =============================================================================
# HELPER: wait for two background PIDs, return combined success
# =============================================================================

_wait_pair() {
    local pid_a="$1"
    local pid_b="$2"
    local exit_a=0 exit_b=0
    wait "$pid_a" || exit_a=$?
    wait "$pid_b" || exit_b=$?
    if [[ $exit_a -eq 0 && $exit_b -eq 0 ]]; then
        return 0
    fi
    return 1
}

# =============================================================================
# DRY-RUN DISPLAY
# =============================================================================

_dry_run_step() {
    local label="$1"
    local model="$2"
    local note="${3:-}"
    printf "  %b%-6s%b  " "${UI_INFO}" "[DRY]" "${NC}"
    ob_model_tag "$model"
    printf "  %b%s%b" "${UI_INFO}" "$label" "${NC}"
    [[ -n "$note" ]] && printf "  %b%s%b" "${UI_DIM}" "($note)" "${NC}"
    printf "\n"
}

# =============================================================================
# INTERACTIVE PAUSE
# =============================================================================

_interactive_pause() {
    local msg="${1:-Press Enter when done...}"
    printf "\n%b  ▶  %s%b" "${OPUS_COLOR}" "$msg" "${NC}"
    read -r _
    printf "\n"
}

# =============================================================================
# HEADLESS CLAUDE INVOCATION
# =============================================================================

_headless_claude() {
    local model_flag="$1"
    local prompt="$2"
    local outfile="$3"
    "${CLAUDE_CLI}" -p --model "${model_flag}" "${prompt}" >"${outfile}" 2>&1
}

# =============================================================================
# MAIN BANNER + INTRO
# =============================================================================

ob_banner
ob_quote
printf "\n"

# Show task and intensity
if [[ -n "$ARG_TASK" ]]; then
    printf "%b  TASK:%b %s\n" "${UI_INFO}" "${NC}" "$ARG_TASK"
fi

_intensity_color=""
_intensity_label=""
case "$ARG_INTENSITY" in
    light)    _intensity_color="${SONNET_COLOR}"; _intensity_label="LIGHT (build + correct + gate)" ;;
    standard) _intensity_color="${OPUS_COLOR}";   _intensity_label="STANDARD (plan + build + correct + gate)" ;;
    full)     _intensity_color="${KIMI_COLOR}";    _intensity_label="FULL (research + build + validate + gate)" ;;
esac
printf "%b  INTENSITY:%b %b%s%b\n" "${UI_INFO}" "${NC}" "$_intensity_color" "$_intensity_label" "${NC}"

if [[ $ARG_DRY_RUN -eq 1 ]]; then
    printf "%b  MODE: DRY-RUN (no commands will be executed)%b\n" "${UI_DIM}" "${NC}"
elif [[ $ARG_HEADLESS -eq 1 ]]; then
    printf "%b  MODE: HEADLESS (Claude steps run automatically)%b\n" "${UI_DIM}" "${NC}"
fi

if [[ $ARG_FROM -gt 1 ]]; then
    printf "%b  Resuming from step %d%b\n" "${UI_INFO}" "$ARG_FROM" "${NC}"
fi

printf "\n"

if [[ $ARG_DRY_RUN -eq 0 ]]; then
    printf "%b  Run directory: %s%b\n\n" "${UI_DIM}" "${RUN_DIR}" "${NC}"
fi

ob_pipeline_diagram 0

# =============================================================================
# DRY-RUN: compact single-pass display
# =============================================================================

if [[ $ARG_DRY_RUN -eq 1 ]]; then
    _dry_step_count=0
    _dry_total=0

    # Count total steps for this intensity
    case "$ARG_INTENSITY" in
        light)    _dry_total=3 ;;
        standard) _dry_total=4 ;;
        full)     _dry_total=7 ;;
    esac

    # RESEARCH (full only)
    if ! _skip_step 1; then
        ob_section "RESEARCH PHASE" "🔭" "${KIMI_COLOR}"
        _dry_run_step "Kimi Deep Research" "Kimi" "swarm, parallel"
        _dry_run_step "Gemini Google Context" "Gemini" "parallel"
        _dry_step_count=2
        ob_progress $_dry_step_count $_dry_total
    fi

    # BUILD (standard + full)
    if ! _skip_step 2 || ! _skip_step 3; then
        ob_section "BUILD PHASE" "🏗" "${OPUS_COLOR}"
    fi
    if ! _skip_step 2; then
        _dry_run_step "Opus: Architect plan" "Opus" "reads research briefs"
        (( _dry_step_count++ )) || true
    fi
    if ! _skip_step 3; then
        _dry_run_step "Sonnet: Implement plan" "Sonnet" "matrix rain intro"
        (( _dry_step_count++ )) || true
    fi
    if ! _skip_step 4; then
        _dry_run_step "Opus: Correction pass" "Opus" "compares against research"
        (( _dry_step_count++ )) || true
    fi
    if ! _skip_step 2 || ! _skip_step 3 || ! _skip_step 4; then
        ob_progress $_dry_step_count $_dry_total
    fi

    # VALIDATE (full only)
    if ! _skip_step 5; then
        ob_section "VALIDATION PHASE" "🔬" "${KIMI_COLOR}"
        _dry_run_step "Kimi: Code review + security" "Kimi" "thinking mode, parallel"
        _dry_run_step "Gemini Deep Think: Verify" "Gemini" "thinking: high, parallel"
        (( _dry_step_count += 2 )) || true
        ob_progress $_dry_step_count $_dry_total
    fi

    # GATE (all intensities)
    if ! _skip_step 7; then
        ob_section "GATE PHASE" "🚦" "${CODEX_COLOR}"
        _dry_run_step "Codex: Stress test" "Codex" "sandbox read-only"
        (( _dry_step_count++ )) || true
        ob_progress $_dry_step_count $_dry_total
    fi

    # Final diagram
    ob_pipeline_diagram $_dry_total

    total_elapsed=$(( $(date +%s) - _PIPELINE_START ))
    printf "%b  Total elapsed: %b%s%b\n\n" \
        "${UI_INFO}" "${SONNET_COLOR}" "$(ob_format_time "$total_elapsed")" "${NC}"
    ob_quote
    printf "\n"
    exit 0
fi

# =============================================================================
# STEP 1: RESEARCH PHASE — Kimi (1a) + Gemini (1b) in parallel
# =============================================================================

if ! _skip_step 1; then
    ob_section "RESEARCH PHASE" "🔭" "${KIMI_COLOR}"

    ob_step_card "1a" "7" "Kimi Deep Research" "${KIMI_COLOR}" "${KIMI_EMOJI}"
    ob_step_card "1b" "7" "Gemini Google Context" "${GEMINI_COLOR}" "${GEMINI_EMOJI}"
    ob_info "Launching parallel scouts..."

    local_step_start=$(date +%s)

    _task_prefix=""
    [[ -n "$ARG_TASK" ]] && _task_prefix="TASK: ${ARG_TASK}. "

    pid_1a=$(_run_background \
        "${RUN_DIR}/step-1a-kimi-research.md" \
        "${KIMI_CLI}" --model "${KIMI_MODEL}" \
            "${_task_prefix}Perform a deep research sweep on the current Open Brain pipeline phase. " \
            "Output in Open Brain Codex format. " \
            "Return: SUMMARY (3 bullets), DETAILED FINDINGS (full), CODEX metadata.")

    pid_1b=$(_run_background \
        "${RUN_DIR}/step-1b-gemini-context.md" \
        "${GEMINI_CLI}" --model "${GEMINI_RESEARCH_MODEL}" \
            "${_task_prefix}Gather current Google context relevant to the Open Brain pipeline. " \
            "Output in Open Brain Codex format. " \
            "Return: SUMMARY (3 bullets), DETAILED FINDINGS (full).")

    ob_spinner "Parallel scouts running (Kimi + Gemini)..."

    pair_ok=0
    _wait_pair "$pid_1a" "$pid_1b" || pair_ok=$?

    ob_spinner_stop

    time_1=$(( $(date +%s) - local_step_start ))

    if [[ $pair_ok -eq 0 ]]; then
        ob_success "Kimi research complete  ($(ob_format_time "$time_1"))"
        ob_success "Gemini context complete ($(ob_format_time "$time_1"))"
        _record_step "Kimi Research"   "Kimi"   "$time_1" "ok"
        _record_step "Gemini Context"  "Gemini" "$time_1" "ok"
        _DIAGRAM_DONE=2
    else
        ob_fail "One or more scouts failed after $(ob_format_time "$time_1")"
        ob_info "Check: ${RUN_DIR}/step-1a-kimi-research.md"
        ob_info "Check: ${RUN_DIR}/step-1b-gemini-context.md"
        _record_step "Kimi Research"   "Kimi"   "$time_1" "fail"
        _record_step "Gemini Context"  "Gemini" "$time_1" "fail"
        _DIAGRAM_DONE=1
    fi

    ob_progress 2 7
    ob_pipeline_diagram "$_DIAGRAM_DONE"
fi

# =============================================================================
# STEP 2: BUILD PHASE — Opus decides
# =============================================================================

if ! _skip_step 2; then
    ob_section "BUILD PHASE" "🏗" "${OPUS_COLOR}"
    ob_step_card "2" "7" "Opus Decides" "${OPUS_COLOR}" "${OPUS_EMOJI}"

    step_start=$(date +%s)
    out_file="${RUN_DIR}/step-2-opus-plan.md"

    _task_prefix=""
    [[ -n "$ARG_TASK" ]] && _task_prefix="TASK: ${ARG_TASK}. "

    # Build prompt based on whether research briefs exist
    _research_ref=""
    if [[ -f "${RUN_DIR}/step-1a-kimi-research.md" || -f "${RUN_DIR}/step-1b-gemini-context.md" ]]; then
        _research_ref="Read the research briefs at ${RUN_DIR}/step-1a-kimi-research.md and ${RUN_DIR}/step-1b-gemini-context.md. \
Skip the SUMMARY sections. Read DETAILED FINDINGS in full. "
    fi

    prompt_2="${_task_prefix}You are the architect for Open Brain. \
${_research_ref}\
Create an implementation plan. Output in Open Brain Codex format."

    if [[ $ARG_HEADLESS -eq 1 ]]; then
        ob_info "Running Opus (headless)..."
        ob_spinner "Opus is deciding..."

        claude_ok=0
        _headless_claude "${CLAUDE_ARCHITECT}" "${prompt_2}" "${out_file}" || claude_ok=$?

        ob_spinner_stop

        time_2=$(_elapsed "$step_start")
        if [[ $claude_ok -eq 0 ]]; then
            ob_success "Opus plan complete ($(ob_format_time "$time_2"))"
            _record_step "Opus Plan" "Opus" "$time_2" "ok"
            _DIAGRAM_DONE=3
        else
            ob_fail "Opus step failed ($(ob_format_time "$time_2"))"
            ob_info "Check: ${out_file}"
            _record_step "Opus Plan" "Opus" "$time_2" "fail"
        fi
    else
        printf "\n%b  Instructions for this step:%b\n" "${OPUS_COLOR}" "${NC}"
        ob_info "Open Claude (Opus) and provide this prompt:"
        printf "\n%b%s%b\n\n" "${UI_DIM}" "$prompt_2" "${NC}"
        ob_info "Save the output to: ${out_file}"
        _interactive_pause "Press Enter when Opus plan is saved to ${out_file}..."

        time_2=$(_elapsed "$step_start")
        if [[ -f "${out_file}" && -s "${out_file}" ]]; then
            ob_success "Opus plan recorded ($(ob_format_time "$time_2"))"
            _record_step "Opus Plan" "Opus" "$time_2" "ok"
            _DIAGRAM_DONE=3
        else
            ob_fail "Output file missing or empty: ${out_file}"
            _record_step "Opus Plan" "Opus" "$time_2" "fail"
        fi
    fi

    ob_progress 3 7
fi

# =============================================================================
# STEP 3: BUILD PHASE — Sonnet builds (with matrix rain intro)
# =============================================================================

if ! _skip_step 3; then
    ob_matrix_rain
    ob_step_card "3" "7" "Sonnet Builds" "${SONNET_COLOR}" "${SONNET_EMOJI}"

    step_start=$(date +%s)
    out_file="${RUN_DIR}/step-3-sonnet-build.md"

    _task_prefix=""
    [[ -n "$ARG_TASK" ]] && _task_prefix="TASK: ${ARG_TASK}. "

    # Build prompt based on whether Opus plan exists
    _plan_ref=""
    if [[ -f "${RUN_DIR}/step-2-opus-plan.md" ]]; then
        _plan_ref="Read the plan at ${RUN_DIR}/step-2-opus-plan.md. Reference the CODEX metadata for file paths and domains. "
    fi

    prompt_3="${_task_prefix}${_plan_ref}Implement it."

    if [[ $ARG_HEADLESS -eq 1 ]]; then
        ob_info "Running Sonnet (headless)..."
        ob_spinner "Sonnet is building..."

        claude_ok=0
        _headless_claude "${CLAUDE_BUILDER}" "${prompt_3}" "${out_file}" || claude_ok=$?

        ob_spinner_stop

        time_3=$(_elapsed "$step_start")
        if [[ $claude_ok -eq 0 ]]; then
            ob_success "Sonnet build complete ($(ob_format_time "$time_3"))"
            _record_step "Sonnet Build" "Sonnet" "$time_3" "ok"
            _DIAGRAM_DONE=4
        else
            ob_fail "Sonnet build failed ($(ob_format_time "$time_3"))"
            ob_info "Check: ${out_file}"
            _record_step "Sonnet Build" "Sonnet" "$time_3" "fail"
        fi
    else
        printf "\n%b  Instructions for this step:%b\n" "${SONNET_COLOR}" "${NC}"
        ob_info "Open Claude (Sonnet) and provide this prompt:"
        printf "\n%b%s%b\n\n" "${UI_DIM}" "$prompt_3" "${NC}"
        ob_info "Save the output to: ${out_file}"
        _interactive_pause "Press Enter when Sonnet build is saved to ${out_file}..."

        time_3=$(_elapsed "$step_start")
        if [[ -f "${out_file}" && -s "${out_file}" ]]; then
            ob_success "Sonnet build recorded ($(ob_format_time "$time_3"))"
            _record_step "Sonnet Build" "Sonnet" "$time_3" "ok"
            _DIAGRAM_DONE=4
        else
            ob_fail "Output file missing or empty: ${out_file}"
            _record_step "Sonnet Build" "Sonnet" "$time_3" "fail"
        fi
    fi

    ob_progress 4 7
fi

# =============================================================================
# STEP 4: BUILD PHASE — Opus corrects
# =============================================================================

if ! _skip_step 4; then
    ob_step_card "4" "7" "Opus Corrects" "${OPUS_COLOR}" "${OPUS_EMOJI}"

    step_start=$(date +%s)
    out_file="${RUN_DIR}/step-4-opus-correction.md"

    _task_prefix=""
    [[ -n "$ARG_TASK" ]] && _task_prefix="TASK: ${ARG_TASK}. "

    # Build prompt: always reads Sonnet output, conditionally references research
    _research_compare=""
    if [[ -f "${RUN_DIR}/step-1a-kimi-research.md" ]]; then
        _research_compare="Compare against the DETAILED FINDINGS in ${RUN_DIR}/step-1a-kimi-research.md \
and ${RUN_DIR}/step-1b-gemini-context.md. "
    fi

    prompt_4="${_task_prefix}Read the implementation from ${RUN_DIR}/step-3-sonnet-build.md. \
${_research_compare}Fix any logic errors or missed requirements."

    if [[ $ARG_HEADLESS -eq 1 ]]; then
        ob_info "Running Opus correction (headless)..."
        ob_spinner "Opus is correcting..."

        claude_ok=0
        _headless_claude "${CLAUDE_ARCHITECT}" "${prompt_4}" "${out_file}" || claude_ok=$?

        ob_spinner_stop

        time_4=$(_elapsed "$step_start")
        if [[ $claude_ok -eq 0 ]]; then
            ob_success "Opus correction complete ($(ob_format_time "$time_4"))"
            _record_step "Opus Correction" "Opus" "$time_4" "ok"
            _DIAGRAM_DONE=5
        else
            ob_fail "Opus correction failed ($(ob_format_time "$time_4"))"
            ob_info "Check: ${out_file}"
            _record_step "Opus Correction" "Opus" "$time_4" "fail"
        fi
    else
        printf "\n%b  Instructions for this step:%b\n" "${OPUS_COLOR}" "${NC}"
        ob_info "Open Claude (Opus) and provide this prompt:"
        printf "\n%b%s%b\n\n" "${UI_DIM}" "$prompt_4" "${NC}"
        ob_info "Save the output to: ${out_file}"
        _interactive_pause "Press Enter when Opus correction is saved to ${out_file}..."

        time_4=$(_elapsed "$step_start")
        if [[ -f "${out_file}" && -s "${out_file}" ]]; then
            ob_success "Opus correction recorded ($(ob_format_time "$time_4"))"
            _record_step "Opus Correction" "Opus" "$time_4" "ok"
            _DIAGRAM_DONE=5
        else
            ob_fail "Output file missing or empty: ${out_file}"
            _record_step "Opus Correction" "Opus" "$time_4" "fail"
        fi
    fi

    ob_progress 5 7
fi

# =============================================================================
# STEP 5: VALIDATION PHASE — Kimi (5a) + Gemini Deep Think (5b) in parallel
# =============================================================================

if ! _skip_step 5; then
    ob_section "VALIDATION PHASE" "🔬" "${KIMI_COLOR}"

    ob_step_card "5a" "7" "Kimi Validates" "${KIMI_COLOR}" "${KIMI_EMOJI}"
    ob_step_card "5b" "7" "Gemini Deep Think Verifies" "${GEMINI_COLOR}" "${GEMINI_EMOJI}"

    ob_info "Launching parallel validators..."

    step_start=$(date +%s)

    _task_prefix=""
    [[ -n "$ARG_TASK" ]] && _task_prefix="TASK: ${ARG_TASK}. "

    pid_5a=$(_run_background \
        "${RUN_DIR}/step-5a-kimi-validation.md" \
        "${KIMI_CLI}" --model "${KIMI_MODEL}" \
            "${_task_prefix}Review the implementation at ${RUN_DIR}/step-4-opus-correction.md. " \
            "Check for bugs, logic errors, and security issues. " \
            "Output in Open Brain Codex format. " \
            "Return: VERDICT (pass/fail), ISSUES LIST, RECOMMENDATIONS.")

    pid_5b=$(_run_background \
        "${RUN_DIR}/step-5b-gemini-deepthink.md" \
        "${GEMINI_CLI}" --model "${GEMINI_THINK_MODEL}" \
            "${_task_prefix}Verify the implementation at ${RUN_DIR}/step-4-opus-correction.md " \
            "against the original research in ${RUN_DIR}/step-1a-kimi-research.md. " \
            "Use deep thinking. Output in Open Brain Codex format. " \
            "Return: VERDICT (pass/fail), MISSED REQUIREMENTS, RISK ASSESSMENT.")

    ob_spinner "Parallel validators running (Kimi + Gemini Deep Think)..."

    pair_ok=0
    _wait_pair "$pid_5a" "$pid_5b" || pair_ok=$?

    ob_spinner_stop

    time_5=$(( $(date +%s) - step_start ))

    if [[ $pair_ok -eq 0 ]]; then
        ob_success "Kimi validation complete      ($(ob_format_time "$time_5"))"
        ob_success "Gemini Deep Think complete    ($(ob_format_time "$time_5"))"
        _record_step "Kimi Validation"     "Kimi"   "$time_5" "ok"
        _record_step "Gemini Deep Think"   "Gemini" "$time_5" "ok"
        _DIAGRAM_DONE=6
    else
        ob_fail "One or more validators failed after $(ob_format_time "$time_5")"
        ob_info "Check: ${RUN_DIR}/step-5a-kimi-validation.md"
        ob_info "Check: ${RUN_DIR}/step-5b-gemini-deepthink.md"
        _record_step "Kimi Validation"     "Kimi"   "$time_5" "fail"
        _record_step "Gemini Deep Think"   "Gemini" "$time_5" "fail"
        _DIAGRAM_DONE=5
    fi

    ob_progress 6 7
fi

# =============================================================================
# STEP 7: GATE PHASE — Codex stress tests
# =============================================================================

if ! _skip_step 7; then
    ob_section "GATE PHASE" "🚦" "${CODEX_COLOR}"
    ob_step_card "7" "7" "Codex Stress Tests" "${CODEX_COLOR}" "${CODEX_EMOJI}"

    step_start=$(date +%s)
    out_file="${RUN_DIR}/step-7-codex-stress.md"

    ob_info "Running Codex stress test (sandbox: read-only, full-auto)..."
    ob_spinner "Codex stress testing..."

    codex_ok=0
    "${CODEX_CLI}" exec \
        --sandbox read-only \
        --full-auto \
        --skip-git-repo-check \
        "Review for bugs and logic errors. Focus on: ${RUN_DIR}/step-4-opus-correction.md" \
        >"${out_file}" 2>&1 || codex_ok=$?

    ob_spinner_stop

    time_7=$(_elapsed "$step_start")

    if [[ $codex_ok -eq 0 ]]; then
        ob_success "Codex stress test passed ($(ob_format_time "$time_7"))"
        _record_step "Codex Stress Test" "Codex" "$time_7" "ok"
        _DIAGRAM_DONE=7
    else
        ob_fail "Codex found issues ($(ob_format_time "$time_7"))"
        ob_info "Review: ${out_file}"
        _record_step "Codex Stress Test" "Codex" "$time_7" "fail"
    fi

    ob_progress 7 7
fi

# =============================================================================
# FINAL SUMMARY
# =============================================================================

ob_pipeline_diagram "$_DIAGRAM_DONE"
ob_section "PIPELINE COMPLETE" "✔" "${UI_SUCCESS}"

if [[ ${#OB_STEP_NAMES[@]} -gt 0 ]]; then
    ob_summary_table
fi

total_elapsed=$(( $(date +%s) - _PIPELINE_START ))
printf "\n%b  Total elapsed: %b%s%b\n" \
    "${UI_INFO}" "${SONNET_COLOR}" "$(ob_format_time "$total_elapsed")" "${NC}"

printf "%b  Run directory: %b%s%b\n" \
    "${UI_DIM}" "${UI_INFO}" "${RUN_DIR}" "${NC}"

printf "\n"
ob_quote
printf "\n"
