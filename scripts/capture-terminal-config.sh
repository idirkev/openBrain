#!/bin/zsh
# capture-terminal-config.sh
# Snapshots terminal configuration into OPENBRAIN captures for embedding

CAPTURE_DIR="$HOME/OPENBRAIN/openBrain/captures/terminal-$(date +%Y-%m-%d)"
mkdir -p "$CAPTURE_DIR"

# Generate capture with metadata
cat > "$CAPTURE_DIR/zsh-config-$(date +%H%M).md" << 'FRONTMATTER'
---
type: artifact
template: Configuration
topics: [zsh, shell-config, terminal, dotfiles]
people: [Kev]
dates: [AUTO]
status: captured
weight: medium
source: "~/.zshrc"
format: "zsh"
---

# ZSH Configuration Snapshot

**Captured**: AUTO
**Source**: ~/.zshrc
**Purpose**: Terminal toolchain configuration backup

## Aliases Section

```bash
FRONTMATTER

# Extract aliases from .zshrc
grep -A 20 "SIMPLE ALIASES" ~/.zshrc >> "$CAPTURE_DIR/zsh-config-$(date +%H%M).md" 2>/dev/null || echo "# Aliases not found in expected format" >> "$CAPTURE_DIR/zsh-config-$(date +%H%M).md"

# Close code block
echo '```' >> "$CAPTURE_DIR/zsh-config-$(date +%H%M).md"

# Capture installed tools
cat > "$CAPTURE_DIR/installed-tools-$(date +%H%M).md" << EOF
---
type: reference
template: Toolchain
topics: [brew, cli-tools, versions]
people: [Kev]
dates: [$(date +%Y-%m-%d)]
status: captured
weight: low
---

# Installed CLI Tools - $(date)

| Tool | Version |
|------|---------|
| eza | $(eza --version 2>/dev/null | head -1 || echo "not installed") |
| bat | $(bat --version 2>/dev/null | head -1 || echo "not installed") |
| zoxide | $(zoxide --version 2>/dev/null | head -1 || echo "not installed") |
| fzf | $(fzf --version 2>/dev/null | head -1 || echo "not installed") |
| ripgrep | $(rg --version 2>/dev/null | head -1 || echo "not installed") |
| fd | $(fd --version 2>/dev/null | head -1 || echo "not installed") |
| btop | $(btop --version 2>/dev/null | head -1 || echo "not installed") |
| yazi | $(yazi --version 2>/dev/null | head -1 || echo "not installed") |
EOF

echo "✅ Terminal config captured to: $CAPTURE_DIR"
echo "📁 Files:"
ls -la "$CAPTURE_DIR"
