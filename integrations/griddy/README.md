# griddy-on-capture

Automatically tiles your macOS windows with [griddy](https://github.com/nickmomrik/griddy) whenever an OpenBrain capture is triggered — whether from Claude Code, a terminal command, or a prompt keyword.

## What it does

Three trigger paths all converge on the same outcome: `griddy` runs and snaps your windows into a tidy grid layout.

| Trigger | Mechanism |
|---|---|
| `mcp__open-brain__capture_thought` tool call | Claude Code `PostToolUse` hook |
| Claude Code prompt containing "capture" | Claude Code `UserPromptSubmit` hook via `griddy-on-capture.py` |
| Terminal command containing "capture" | zsh `preexec` hook in `.zshrc` |

## Files

```
integrations/griddy/
├── README.md                  # this file
├── install.sh                 # one-shot install script
├── settings-snippet.json      # hook entries to merge into ~/.claude/settings.json
└── hooks/
    ├── griddy-on-capture.py   # UserPromptSubmit hook (Claude Code)
    └── griddy-capture.zsh     # zsh preexec snippet (source in .zshrc)
```

## Prerequisites

- `griddy` installed at `~/.local/bin/griddy`
- Python 3 (ships with macOS)
- Claude Code

## Install

```bash
bash integrations/griddy/install.sh
```

Then follow the printed instructions to wire up the zsh snippet and the settings.json entries.
