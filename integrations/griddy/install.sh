#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_SRC="$SCRIPT_DIR/hooks"
CLAUDE_HOOKS="$HOME/.claude/hooks"

echo "==> Installing griddy-on-capture.py to $CLAUDE_HOOKS/"
mkdir -p "$CLAUDE_HOOKS"
cp "$HOOKS_SRC/griddy-on-capture.py" "$CLAUDE_HOOKS/griddy-on-capture.py"
chmod +x "$CLAUDE_HOOKS/griddy-on-capture.py"
echo "    Done."

echo ""
echo "==> Next: add the zsh preexec hook to your .zshrc"
echo "    Append the following line to ~/.zshrc:"
echo ""
echo "        source $SCRIPT_DIR/hooks/griddy-capture.zsh"
echo ""
echo "    Then reload your shell:"
echo ""
echo "        source ~/.zshrc"

echo ""
echo "==> Next: merge settings-snippet.json into ~/.claude/settings.json"
echo "    Open both files and add the two hook entries from:"
echo ""
echo "        $SCRIPT_DIR/settings-snippet.json"
echo ""
echo "    Into the matching 'PostToolUse' and 'UserPromptSubmit' arrays"
echo "    in ~/.claude/settings.json."
echo ""
echo "    See the architecture doc for details:"
echo "        docs/architecture/GRIDDY-CAPTURE-HOOKS.md"
