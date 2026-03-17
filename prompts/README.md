# Open Brain Agent Prompts

Prompts for AI agents working on the Open Brain system.

## Pipeline B Agent Prompts (idirnet v2)

Run these in order. Each feeds the next.

| Step | File | Agent | Purpose |
|------|------|-------|---------|
| 1a | `kimi-research-open-brain-state.md` | Kimi 2.5 | Ground truth audit: what works vs what's just docs |
| 1b | `kimi-review-documentation-debt.md` | Kimi 2.5 | Documentation overlap analysis and consolidation plan |
| 2 | `opus-decision-idirnet-v2-readiness.md` | Opus 4.6 | Architecture decisions for idirnet v2 transition |

## Agent Protocol Prompts

| File | Purpose | Use When |
|------|---------|----------|
| `claude-code-open-brain.md` | **Agent Protocol** — How Claude uses MCP tools, captures thoughts, uses templates | Starting any Claude session |
| `claude-code-task-prompts.md` | **Task Prompts** — Specific copy-paste prompts for current work phase (PDF conversion, etc.) | Starting a task from handover |
| `gemini-workspace-agent.md` | **Gemini Protocol** — How Gemini Flash operates in Google Workspace | Gemini agent configuration |

## Architecture Docs (in ../docs/)

| File | Purpose |
|------|---------|
| `../docs/DATA-INTAKE-ARCHITECTURE.md` | How information enters Open Brain (5 channels) |
| `../docs/TSM-ORGANIZATIONAL-FRAMEWORK.md` | How data is organized through the TSM lens (21 nodes) |

## Quick Start

### Before idirnet v2
Run Pipeline B prompts in order: Kimi research, Kimi review, Opus decision.

### New Claude Session (General)
Read: `claude-code-open-brain.md`

### New Claude Session (Current Task)
Copy-paste from: `claude-code-task-prompts.md`

---

**Created by:** Kimi Agent 2 (protocol), Kimi Agent 3 (task prompts), Opus 4.6 (Pipeline B prompts + architecture docs)
