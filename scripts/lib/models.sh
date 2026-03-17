# Open Brain Model Registry
# Source this file for model configuration
# Update these values when models change

# Kimi 2.5 (Moonshot AI)
KIMI_CLI="$HOME/.local/bin/kimi"
KIMI_VERSION_CMD="$KIMI_CLI --version"
KIMI_MODEL="k2.5"
KIMI_RESEARCH_MODE="swarm"      # Agent Swarm for deep research (100 sub-agents)
KIMI_REVIEW_MODE="thinking"     # Thinking mode for code review
KIMI_SECURITY_MODE="thinking"   # Thinking mode for security audit
KIMI_REPORT_MODE="agent"        # Agent mode for report cards

# Gemini (Google)
GEMINI_CLI="/opt/homebrew/bin/gemini"
GEMINI_VERSION_CMD="$GEMINI_CLI --version"
GEMINI_MODEL="gemini-2.5-flash"          # Free tier default (verify with: gemini --list-models)
GEMINI_THINK_MODEL="gemini-2.5-flash"    # Deep Think mode (swap to gemini-2.5-pro when billing enabled)
GEMINI_RESEARCH_MODEL="gemini-2.5-flash" # Deep Research (swap to gemini-2.5-pro when billing enabled)

# Claude (Anthropic)
CLAUDE_CLI="claude"
CLAUDE_VERSION_CMD="$CLAUDE_CLI --version"
CLAUDE_ARCHITECT="opus"         # Claude Opus 4.6 - decisions, corrections
CLAUDE_BUILDER="sonnet"         # Claude Sonnet 4.6 - implementation

# Codex (OpenAI)
CODEX_CLI="codex"
CODEX_VERSION_CMD="$CODEX_CLI --version"
CODEX_MODEL="codex-mini-latest" # Fine-tuned o4-mini (default)
CODEX_ALT_MODEL="o3"            # Alternative: deeper analysis

# Pipeline run directory
PIPELINE_RUN_DIR="/tmp/ob-pipeline"

# Helper: get current versions
ob_get_versions() {
    local kimi_v gemini_v claude_v codex_v
    kimi_v=$($KIMI_VERSION_CMD 2>&1 | head -1)
    gemini_v=$($GEMINI_VERSION_CMD 2>&1 | head -1)
    claude_v=$($CLAUDE_VERSION_CMD 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    codex_v=$($CODEX_VERSION_CMD 2>&1 | head -1)
    printf "%s|%s|%s|%s" "$kimi_v" "$gemini_v" "$claude_v" "$codex_v"
}

# Helper: check for updates
ob_check_updates() {
    echo "Checking for CLI updates..."
    echo ""
    echo "Gemini CLI:"
    npm outdated -g @google/gemini-cli 2>/dev/null || echo "  Up to date"
    echo ""
    echo "Codex CLI:"
    npm outdated -g @openai/codex 2>/dev/null || echo "  Up to date"
    echo ""
    echo "Kimi CLI:"
    pip list --outdated 2>/dev/null | grep -i kimi || echo "  Up to date (check manually: pip install --upgrade kimi-cli)"
    echo ""
    echo "Claude Code:"
    npm outdated -g @anthropic-ai/claude-code 2>/dev/null || echo "  Up to date"
}
