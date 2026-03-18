# Terminal Configuration Embedding Architecture

**How terminal toolchain knowledge flows into OPENBRAIN's token codec system**

---

## Overview

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Terminal Config │────▶│   Capture    │────▶│   Markdown +    │
│   ~/.zshrc       │     │   Script     │     │   YAML Frontmatter│
└─────────────────┘     └──────────────┘     └─────────────────┘
                                                        │
┌─────────────────┐     ┌──────────────┐               │
│   AI Agents     │◀────│  MCP Tools   │◀──────────────┘
│   Context       │     │  search      │
└─────────────────┘     └──────────────┘
                               ▲
                               │
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Supabase      │◀────│   Embed      │◀────│  Classification │
│   pgvector      │     │  text-embed  │     │   19 Templates  │
│   1536 dims     │     │  -3-small    │     │                 │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

---

## 1. Knowledge Capture Layer

### Source Files

| Source | Path | Capture Method | Frequency |
|--------|------|----------------|-----------|
| ZSH Config | `~/.zshrc` | `capture-terminal-config.sh` | On change |
| Tool Versions | `brew list` | Automatic | Daily |

### Capture Format

All captures follow the **standard frontmatter schema**:

```yaml
---
type: artifact | reference | observation
template: Configuration | Toolchain | Command
topics: [zsh, cli, productivity, ...]
people: [Kev]
dates: [2026-03-17]
status: captured | processed | embedded
weight: low | medium | high
source: "~/.zshrc"
format: "zsh"
---
```

---

## 2. Token Codec (Embedding Layer)

### Embedding Model

- **Model**: `text-embedding-3-small`
- **Dimensions**: 1536
- **Max Tokens**: 8192
- **Encoding**: cl100k_base
- **Cost**: $0.02 per 1M tokens

### Content Processing Pipeline

1. **Extract** frontmatter metadata
2. **Chunk** content (semantic chunks, 2000 tokens max)
3. **Enrich** with metadata context
4. **Embed** using text-embedding-3-small
5. **Store** in Supabase with metadata

### Example Enriched Text

```
Type: artifact
Template: Configuration
Topics: zsh, terminal, eza, productivity

Content:
alias ll='eza -la --icons --git'
alias cat='bat --paging=never'
eval "$(zoxide init zsh)"
```

This becomes a **1536-dimensional vector** stored in pgvector.

---

## 3. Storage Schema

### Supabase Table

```sql
create table thoughts (
    id uuid default gen_random_uuid(),
    content text,
    embedding vector(1536),
    metadata jsonb,
    created_at timestamp default now()
);

-- Index for similarity search
create index on thoughts 
using ivfflat (embedding vector_cosine_ops);
```

### Metadata Structure

```json
{
  "source": "~/.zshrc",
  "type": "artifact",
  "template": "Configuration",
  "topics": ["zsh", "terminal", "eza", "bat", "zoxide"],
  "people": ["Kev"],
  "shell_commands": ["ll", "z", "cat", "y"],
  "brew_packages": ["eza", "bat", "zoxide", "fzf"]
}
```

---

## 4. Retrieval Layer

### MCP Tool Integration

```bash
# Search your terminal config via MCP
search_thoughts --query "ll alias" --topics terminal

# Returns your actual config:
# alias ll='eza -la --icons --git'
```

### Context Injection

When you ask about terminal tools, the AI retrieves YOUR config:

```
User: "What's my ll alias?"

Retrieved from OPENBRAIN:
alias ll='eza -la --icons --git'

AI: "Your ll alias shows a detailed listing with icons and git status."
```

---

## 5. Capture Script

Run this to snapshot your terminal config:

```bash
~/OPENBRAIN/openBrain/scripts/capture-terminal-config.sh
```

This creates:
- Timestamped capture in `captures/terminal-YYYY-MM-DD/`
- Tool version manifest
- ZSH config excerpt
- Ready for embedding pipeline

---

## Summary

Your terminal config is now **structured knowledge** that:

1. ✅ Gets captured with metadata
2. ✅ Embedded into 1536-dim vectors
3. ✅ Stored in Supabase pgvector
4. ✅ Searchable via MCP tools
5. ✅ Retrieved by AI agents

**The token codec transforms your shell config into searchable, retrievable knowledge.**
