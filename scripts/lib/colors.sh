# =============================================================================
# colors.sh — Open Brain Terminal Visual Theming Library
# =============================================================================
# Source this file in any Open Brain pipeline script:
#
#   source "$(dirname "${BASH_SOURCE[0]}")/lib/colors.sh"
#
# This file defines ALL colours, icons, and visual functions for the pipeline.
# Do not run directly. It is a library only.
# =============================================================================

# Guard against double-sourcing
[[ -n "${_OB_COLORS_LOADED:-}" ]] && return 0
_OB_COLORS_LOADED=1

# Reset terminal colour on exit
trap 'printf "\033[0m"' EXIT


# =============================================================================
# TERMINAL WIDTH
# =============================================================================

_ob_cols() {
    local cols
    cols=$(tput cols 2>/dev/null) || cols=80
    printf "%d" "$cols"
}


# =============================================================================
# MODEL COLOURS
# =============================================================================

# Kimi 2.5: Hot pink, bold
KIMI_COLOR="\033[1;38;5;213m"
KIMI_EMOJI="🔍"

# Gemini: Cyan/Google blue, dim
GEMINI_COLOR="\033[2;38;5;39m"
GEMINI_EMOJI="🌐"

# Opus 4.6: Orange/amber, bold + underline
OPUS_COLOR="\033[1;4;38;5;208m"
OPUS_EMOJI="🧠"

# Sonnet 4.6: Matrix lime green, bold
SONNET_COLOR="\033[1;38;5;46m"
SONNET_EMOJI="🔨"

# Codex: Red, bold + reverse (white on red)
CODEX_COLOR="\033[1;7;38;5;196m"
CODEX_EMOJI="🧪"


# =============================================================================
# UI COLOURS
# =============================================================================

UI_SUCCESS="\033[38;5;82m"
UI_FAIL="\033[38;5;196m"
UI_INFO="\033[38;5;244m"
UI_DIM="\033[38;5;240m"
UI_BOX="\033[38;5;240m"
NC="\033[0m"

# Gradient colours for banner (orange → lime green)
_GRAD_1="\033[1;38;5;208m"
_GRAD_2="\033[1;38;5;214m"
_GRAD_3="\033[1;38;5;220m"
_GRAD_4="\033[1;38;5;190m"
_GRAD_5="\033[1;38;5;154m"
_GRAD_6="\033[1;38;5;118m"
_GRAD_7="\033[1;38;5;82m"
_GRAD_8="\033[1;38;5;46m"


# =============================================================================
# 1. ob_banner
# =============================================================================
# Block-letter "OPEN BRAIN" in a gradient from orange to lime green,
# inside a heavy box. Shows subtitle below block text.

ob_banner() {
    local cols
    cols=$(_ob_cols)
    local box_width=$((cols - 2))

    # Heavy box characters
    local TL="┏" TR="┓" BL="┗" BR="┛" H="━" V="┃"

    # Build top border
    local top_border="${_GRAD_1}${TL}"
    local i
    for (( i=0; i<box_width; i++ )); do
        top_border+="${H}"
    done
    top_border+="${TR}${NC}"

    local bot_border="${_GRAD_8}${BL}"
    for (( i=0; i<box_width; i++ )); do
        bot_border+="${H}"
    done
    bot_border+="${BR}${NC}"

    printf "\n%b\n" "$top_border"

    # Block letters for "OPEN BRAIN"
    # Each letter is 5 rows tall, built as parallel arrays

    local L1 L2 L3 L4 L5

    # O
    L1+="  ██  "
    L2+=" █  █ "
    L3+=" █  █ "
    L4+=" █  █ "
    L5+="  ██  "

    # P
    L1+=" ███  "
    L2+=" █  █ "
    L3+=" ███  "
    L4+=" █    "
    L5+=" █    "

    # E
    L1+=" ████ "
    L2+=" █    "
    L3+=" ███  "
    L4+=" █    "
    L5+=" ████ "

    # N
    L1+=" █  █ "
    L2+=" ██ █ "
    L3+=" █ ██ "
    L4+=" █  █ "
    L5+=" █  █ "

    # space
    L1+="  "
    L2+="  "
    L3+="  "
    L4+="  "
    L5+="  "

    # B
    L1+=" ███  "
    L2+=" █  █ "
    L3+=" ███  "
    L4+=" █  █ "
    L5+=" ███  "

    # R
    L1+=" ███  "
    L2+=" █  █ "
    L3+=" ███  "
    L4+=" █ █  "
    L5+=" █  █ "

    # A
    L1+="  ██  "
    L2+=" █  █ "
    L3+=" ████ "
    L4+=" █  █ "
    L5+=" █  █ "

    # I
    L1+=" ███ "
    L2+="  █  "
    L3+="  █  "
    L4+="  █  "
    L5+=" ███ "

    # N
    L1+=" █  █ "
    L2+=" ██ █ "
    L3+=" █ ██ "
    L4+=" █  █ "
    L5+=" █  █ "

    local text_len=${#L1}
    local pad=$(( (box_width - text_len) / 2 ))
    local padding
    printf -v padding "%${pad}s" ""

    local grads=("$_GRAD_1" "$_GRAD_2" "$_GRAD_4" "$_GRAD_5" "$_GRAD_7")
    local lines=("$L1" "$L2" "$L3" "$L4" "$L5")
    local row
    local right_pad=$(( box_width - text_len - pad ))
    for row in 0 1 2 3 4; do
        local g="${grads[$row]}"
        printf "%b%s%b" "${UI_BOX}" "${V}" "${NC}"
        printf "%s"    "${padding}"
        printf "%b%s%b" "${g}" "${lines[$row]}" "${NC}"
        printf "%*s"   "$right_pad" ""
        printf "%b%s%b\n" "${UI_BOX}" "${V}" "${NC}"
    done

    # Blank line inside box
    printf "%b%s%$(( box_width ))s%s%b\n" "${UI_BOX}" "${V}" "" "${V}" "${NC}"

    # Subtitle: "Pipeline B: Parallel Scout" centered
    local subtitle="Pipeline B: Parallel Scout"
    local sub_len=${#subtitle}
    local sub_pad=$(( (box_width - sub_len) / 2 ))
    local sub_right=$(( box_width - sub_len - sub_pad ))
    printf "%b%s%b%*s%b%s%b%*s%b%s%b\n" \
        "${UI_BOX}" "${V}" "${NC}" \
        "$sub_pad" "" \
        "${_GRAD_5}" "$subtitle" "${NC}" \
        "$sub_right" "" \
        "${UI_BOX}" "${V}" "${NC}"

    printf "%b\n\n" "$bot_border"
}


# =============================================================================
# 2. ob_section title emoji
# =============================================================================
# Double-border section header coloured per model.

ob_section() {
    local title="${1:-Section}"
    local emoji="${2:-}"
    local color="${3:-${UI_INFO}}"

    local cols
    cols=$(_ob_cols)
    local inner=$(( cols - 2 ))

    local label=" ${emoji} ${title} "
    local label_len=$(( ${#emoji} + ${#title} + 4 ))
    local right_pad=$(( inner - label_len ))
    [[ $right_pad -lt 0 ]] && right_pad=0

    printf "\n%b╔" "$color"
    printf "═%.0s" $(seq 1 "$inner")
    printf "╗%b\n" "$NC"

    printf "%b║%b%s%b%*s%b║%b\n" \
        "$color" "$NC" \
        "$label" \
        "$NC" \
        "$right_pad" "" \
        "$color" "$NC"

    printf "%b╚" "$color"
    printf "═%.0s" $(seq 1 "$inner")
    printf "╝%b\n\n" "$NC"
}


# =============================================================================
# 3. ob_step_card step_num total_steps label color emoji
# =============================================================================

ob_step_card() {
    local step_num="${1:-1}"
    local total_steps="${2:-1}"
    local label="${3:-Step}"
    local color="${4:-${UI_INFO}}"
    local emoji="${5:-}"

    local cols
    cols=$(_ob_cols)
    local card_width=40
    [[ $card_width -gt $(( cols - 4 )) ]] && card_width=$(( cols - 4 ))
    local inner=$(( card_width - 2 ))

    local header=" ${emoji} Step ${step_num}/${total_steps} "
    local header_len=$(( ${#emoji} + ${#step_num} + ${#total_steps} + 9 ))
    local label_pad=$(( (inner - ${#label}) / 2 ))
    [[ $label_pad -lt 0 ]] && label_pad=0

    printf "%b┌" "$color"
    printf "─%.0s" $(seq 1 "$inner")
    printf "┐%b\n" "$NC"

    local h_right=$(( inner - header_len ))
    [[ $h_right -lt 0 ]] && h_right=0
    printf "%b│%b%s%*s%b│%b\n" \
        "$color" "$NC" \
        "$header" \
        "$h_right" "" \
        "$color" "$NC"

    printf "%b│%b%*s%b%s%b%*s%b│%b\n" \
        "$color" "$NC" \
        "$label_pad" "" \
        "$color" "$label" "$NC" \
        "$(( inner - ${#label} - label_pad ))" "" \
        "$color" "$NC"

    printf "%b└" "$color"
    printf "─%.0s" $(seq 1 "$inner")
    printf "┘%b\n" "$NC"
}


# =============================================================================
# 4. ob_progress current total
# =============================================================================

ob_progress() {
    local current="${1:-0}"
    local total="${2:-10}"
    local cols
    cols=$(_ob_cols)

    # "[████████░░░░░░] 4/7"
    local suffix=" ${current}/${total}"
    local bar_outer=4   # "[ ]" + space
    local bar_width=$(( cols - ${#suffix} - bar_outer - 2 ))
    [[ $bar_width -lt 10 ]] && bar_width=10

    local filled=$(( bar_width * current / total ))
    [[ $filled -gt $bar_width ]] && filled=$bar_width
    local empty=$(( bar_width - filled ))

    printf "%b[%b" "${UI_BOX}" "${SONNET_COLOR}"
    printf "█%.0s" $(seq 1 "$filled")
    printf "%b" "${UI_DIM}"
    printf "░%.0s" $(seq 1 "$empty")
    printf "%b]%b%s%b\n" "${UI_BOX}" "${UI_INFO}" "$suffix" "${NC}"
}


# =============================================================================
# 5. ob_pipeline_diagram completed_steps
# =============================================================================
# completed_steps: integer 0-7, lights up segments in model colour.
# Pipeline shape:
#
#   🔍 ━━━━━┓
#            ┣━━ 🧠 ━━━ 🔨 ━━━ 🧠 ━━━┓
#   🌐 ━━━━━┛                          ┣━━ 🧪 ━━ ✔
#                            🔍 ━━━━━━━┫
#                            🌐 ━━━━━━━┛
#
# Steps: 0=none, 1=Kimi lit, 2=+Gemini, 3=+Opus merge, 4=+Sonnet,
#        5=+Opus2, 6=+Kimi2/Gem2, 7=+Codex

ob_pipeline_diagram() {
    local done="${1:-0}"
    local D="${UI_DIM}"
    local N="${NC}"

    # Helper: colour a segment if step <= done
    _seg() {
        local step="$1"
        local color="$2"
        local text="$3"
        if [[ $done -ge $step ]]; then
            printf "%b%s%b" "$color" "$text" "$N"
        else
            printf "%b%s%b" "$D" "$text" "$N"
        fi
    }

    printf "\n"

    # Row 1:  🔍 ━━━━━┓
    printf "  "
    _seg 1 "${KIMI_COLOR}" "${KIMI_EMOJI}"
    _seg 1 "${KIMI_COLOR}" " ━━━━━┓"
    printf "\n"

    # Row 2:           ┣━━ 🧠 ━━━ 🔨 ━━━ 🧠 ━━━┓
    printf "  "
    _seg 2 "${GEMINI_COLOR}" "       "
    _seg 3 "${OPUS_COLOR}" "┣━━ "
    _seg 3 "${OPUS_COLOR}" "${OPUS_EMOJI}"
    _seg 4 "${SONNET_COLOR}" " ━━━ "
    _seg 4 "${SONNET_COLOR}" "${SONNET_EMOJI}"
    _seg 5 "${OPUS_COLOR}" " ━━━ "
    _seg 5 "${OPUS_COLOR}" "${OPUS_EMOJI}"
    _seg 5 "${OPUS_COLOR}" " ━━━┓"
    printf "\n"

    # Row 3:  🌐 ━━━━━┛                          ┣━━ 🧪 ━━ ✔
    printf "  "
    _seg 2 "${GEMINI_COLOR}" "${GEMINI_EMOJI}"
    _seg 2 "${GEMINI_COLOR}" " ━━━━━┛"
    printf "                          "
    _seg 7 "${CODEX_COLOR}" "┣━━ "
    _seg 7 "${CODEX_COLOR}" "${CODEX_EMOJI}"
    _seg 7 "${UI_SUCCESS}" " ━━ ✔"
    printf "\n"

    # Row 4:                            🔍 ━━━━━━━┫
    printf "                             "
    _seg 6 "${KIMI_COLOR}" "${KIMI_EMOJI}"
    _seg 6 "${KIMI_COLOR}" " ━━━━━━━┫"
    printf "\n"

    # Row 5:                            🌐 ━━━━━━━┛
    printf "                             "
    _seg 6 "${GEMINI_COLOR}" "${GEMINI_EMOJI}"
    _seg 6 "${GEMINI_COLOR}" " ━━━━━━━┛"
    printf "\n\n"
}


# =============================================================================
# 6. ob_matrix_rain
# =============================================================================
# Brief Matrix-style rain in lime green (~1.5 seconds).

ob_matrix_rain() {
    local cols
    cols=$(_ob_cols)
    local duration=15  # iterations (~0.1s each = 1.5s total)
    local rows=8

    printf "%b" "${SONNET_COLOR}"
    # Hide cursor
    printf "\033[?25l"

    local iter row col char
    for (( iter=0; iter<duration; iter++ )); do
        for (( row=0; row<rows; row++ )); do
            printf "\r"
            for (( col=0; col<cols; col++ )); do
                # Random brightness variation
                local rnd=$(( RANDOM % 3 ))
                if [[ $rnd -eq 0 ]]; then
                    printf "\033[1;38;5;46m"   # bright
                elif [[ $rnd -eq 1 ]]; then
                    printf "\033[38;5;34m"     # mid
                else
                    printf "\033[2;38;5;22m"   # dark
                fi
                printf "%d" $(( RANDOM % 2 ))
            done
            printf "\n"
        done
        # Move cursor back up
        printf "\033[%dA" "$rows"
        # Small sleep — use read with timeout for portability
        read -r -t 0.1 _ 2>/dev/null || true
    done

    # Clear the rain rows
    for (( row=0; row<rows; row++ )); do
        printf "\033[2K\n"
    done
    printf "\033[%dA" "$rows"
    for (( row=0; row<rows; row++ )); do
        printf "\033[2K\n"
    done

    # Restore cursor
    printf "\033[?25h"
    printf "%b" "${NC}"
}


# =============================================================================
# 7. ob_spinner msg
# =============================================================================

_OB_SPINNER_FRAMES=("⠋" "⠙" "⠹" "⠸" "⠼" "⠴" "⠦" "⠧" "⠇" "⠏")
SPINNER_PID=""

ob_spinner() {
    local msg="${1:-Working...}"
    # Run spinner in background subshell
    (
        local i=0
        while true; do
            local frame="${_OB_SPINNER_FRAMES[$i]}"
            printf "\r%b%s%b %s " "${SONNET_COLOR}" "$frame" "${NC}" "$msg"
            i=$(( (i + 1) % 10 ))
            read -r -t 0.08 _ 2>/dev/null || true
        done
    ) &
    SPINNER_PID=$!
}


# =============================================================================
# 8. ob_spinner_stop
# =============================================================================

ob_spinner_stop() {
    if [[ -n "${SPINNER_PID:-}" ]]; then
        kill "$SPINNER_PID" 2>/dev/null || true
        wait "$SPINNER_PID" 2>/dev/null || true
        SPINNER_PID=""
    fi
    printf "\r\033[2K"
}


# =============================================================================
# 9. ob_success msg
# =============================================================================

ob_success() {
    printf "%b  ✔  %b%s%b\n" "${UI_SUCCESS}" "${UI_SUCCESS}" "${1:-Done}" "${NC}"
}


# =============================================================================
# 10. ob_fail msg
# =============================================================================

ob_fail() {
    printf "%b  ✘  %b%s%b\n" "${UI_FAIL}" "${UI_FAIL}" "${1:-Failed}" "${NC}"
}


# =============================================================================
# 11. ob_info msg
# =============================================================================

ob_info() {
    printf "%b  ◦  %s%b\n" "${UI_INFO}" "${1:-}" "${NC}"
}


# =============================================================================
# 12. ob_divider
# =============================================================================

ob_divider() {
    local cols
    cols=$(_ob_cols)
    printf "%b" "${UI_BOX}"
    printf "─%.0s" $(seq 1 "$cols")
    printf "%b\n" "${NC}"
}


# =============================================================================
# 13. ob_section_break
# =============================================================================

ob_section_break() {
    local cols
    cols=$(_ob_cols)
    printf "%b" "${UI_DIM}"
    printf "╌%.0s" $(seq 1 "$cols")
    printf "%b\n" "${NC}"
}


# =============================================================================
# 14. ob_model_tag model_name
# =============================================================================
# Returns a coloured badge: [Kimi], [Gemini], [Opus], [Sonnet], [Codex]

ob_model_tag() {
    local model="${1:-}"
    local lower
    lower=$(printf "%s" "$model" | tr '[:upper:]' '[:lower:]')

    case "$lower" in
        kimi*)   printf "%b[Kimi]%b"   "${KIMI_COLOR}"   "${NC}" ;;
        gemini*) printf "%b[Gemini]%b" "${GEMINI_COLOR}" "${NC}" ;;
        opus*)   printf "%b[Opus]%b"   "${OPUS_COLOR}"   "${NC}" ;;
        sonnet*) printf "%b[Sonnet]%b" "${SONNET_COLOR}" "${NC}" ;;
        codex*)  printf "%b[Codex]%b"  "${CODEX_COLOR}"  "${NC}" ;;
        *)       printf "%b[%s]%b"     "${UI_INFO}" "$model" "${NC}" ;;
    esac
}


# =============================================================================
# 15. ob_summary_table
# =============================================================================
# Usage:
#   OB_STEP_NAMES=("Research" "Decide" "Build" ...)
#   OB_STEP_MODELS=("Kimi" "Opus" "Sonnet" ...)
#   OB_STEP_TIMES=(12 5 47 ...)
#   OB_STEP_STATUSES=("ok" "ok" "fail" ...)
#   ob_summary_table

ob_summary_table() {
    local cols
    cols=$(_ob_cols)

    # Column widths
    local w_step=6
    local w_name=20
    local w_model=10
    local w_time=10
    local w_status=10
    local total_inner=$(( w_step + w_name + w_model + w_time + w_status + 4 ))  # 4 separators

    # Header
    printf "%b┏" "${UI_BOX}"
    printf "━%.0s" $(seq 1 "$total_inner")
    printf "┓%b\n" "${NC}"

    # Column headers
    printf "%b┃%b" "${UI_BOX}" "${NC}"
    printf " %b%-${w_step}s%b " "${UI_INFO}" "STEP" "${NC}"
    printf "%b┃%b" "${UI_BOX}" "${NC}"
    printf " %b%-${w_name}s%b " "${UI_INFO}" "NAME" "${NC}"
    printf "%b┃%b" "${UI_BOX}" "${NC}"
    printf " %b%-${w_model}s%b " "${UI_INFO}" "MODEL" "${NC}"
    printf "%b┃%b" "${UI_BOX}" "${NC}"
    printf " %b%-${w_time}s%b " "${UI_INFO}" "TIME" "${NC}"
    printf "%b┃%b" "${UI_BOX}" "${NC}"
    printf " %b%-${w_status}s%b " "${UI_INFO}" "STATUS" "${NC}"
    printf "%b┃%b\n" "${UI_BOX}" "${NC}"

    # Separator
    printf "%b┣" "${UI_BOX}"
    printf "━%.0s" $(seq 1 "$total_inner")
    printf "┫%b\n" "${NC}"

    # Rows
    local count="${#OB_STEP_NAMES[@]}"
    local i
    for (( i=0; i<count; i++ )); do
        local name="${OB_STEP_NAMES[$i]:-}"
        local model="${OB_STEP_MODELS[$i]:-}"
        local time_val="${OB_STEP_TIMES[$i]:-0}"
        local status="${OB_STEP_STATUSES[$i]:-}"

        local status_str
        if [[ "$status" == "ok" || "$status" == "success" ]]; then
            status_str="${UI_SUCCESS}✔ ok${NC}"
        else
            status_str="${UI_FAIL}✘ fail${NC}"
        fi

        local time_fmt
        time_fmt=$(ob_format_time "$time_val")

        printf "%b┃%b" "${UI_BOX}" "${NC}"
        printf " %-${w_step}d " "$(( i + 1 ))"
        printf "%b┃%b" "${UI_BOX}" "${NC}"
        printf " %-${w_name}s " "$name"
        printf "%b┃%b" "${UI_BOX}" "${NC}"
        printf " %-${w_model}s " "$model"
        printf "%b┃%b" "${UI_BOX}" "${NC}"
        printf " %-${w_time}s " "$time_fmt"
        printf "%b┃%b" "${UI_BOX}" "${NC}"
        printf " %b  " ""
        printf "%b" "${status_str}"
        printf "%*s" "$(( w_status - 4 ))" ""
        printf " %b┃%b\n" "${UI_BOX}" "${NC}"
    done

    # Footer
    printf "%b┗" "${UI_BOX}"
    printf "━%.0s" $(seq 1 "$total_inner")
    printf "┛%b\n" "${NC}"
}


# =============================================================================
# 16. ob_quote
# =============================================================================

ob_quote() {
    local quotes=(
        "Five models. One brain."
        "The pipeline never sleeps."
        "Research. Decide. Build. Correct. Validate."
        "Let the models cook."
        "Parallel scouts deployed."
        "Trust the process."
        "Every model has a lane."
    )
    local idx=$(( RANDOM % ${#quotes[@]} ))
    printf "%b  \"%s\"%b\n" "${UI_DIM}" "${quotes[$idx]}" "${NC}"
}


# =============================================================================
# 17. ob_boot_sound
# =============================================================================
# Plays the Open Brain boot chime (non-blocking, background).
# Custom sound at scripts/lib/boot.wav, falls back to system Hero.aiff.

ob_boot_sound() {
    local script_dir
    script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local custom="${script_dir}/boot.wav"
    local fallback="/System/Library/Sounds/Hero.aiff"

    local sound_file="${fallback}"
    [[ -f "$custom" ]] && sound_file="$custom"

    # Play in background, discard output
    afplay "$sound_file" &>/dev/null &
}


# =============================================================================
# 18. ob_format_time seconds
# =============================================================================

ob_format_time() {
    local secs="${1:-0}"
    # Strip decimals
    secs="${secs%%.*}"
    if [[ $secs -ge 60 ]]; then
        local m=$(( secs / 60 ))
        local s=$(( secs % 60 ))
        printf "%dm %ds" "$m" "$s"
    else
        printf "%ds" "$secs"
    fi
}
