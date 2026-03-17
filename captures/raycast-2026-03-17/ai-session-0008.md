---
type: reference
template: Spec
topics: [raycast, integration, mcp, open-brain, cli, macos]
people: []
dates: [2026-03-16]
status: captured
---

# Raycast Extension for Open Brain

Built complete Raycast extension integrating Open Brain MCP tools with macOS quick actions.

## Commands Created

| Command | Keyword | Purpose |
|---------|---------|---------|
| Capture Thought | `obc` | Form-based capture with clipboard/selection paste |
| Search Thoughts | `obs` | Semantic vector search with similarity scores |
| List Recent | `obl` | Browse recent thoughts with type filters |
| Statistics | `obst` | Dashboard: totals, by type, top topics, people |
| Quick Capture | `obq` | Command-line instant capture |

## Technical Implementation

- **Protocol**: JSON-RPC over HTTP to MCP edge function
- **Auth**: MCP_ACCESS_KEY header and query param
- **Endpoint**: `/functions/v1/open-brain-mcp`
- **Language**: TypeScript/React for Raycast API
- **Features**: Auto-classification via keywords, semantic search, filtered browsing

## File Structure

```
OPENBRAIN/openBrain/integrations/raycast/
├── src/
│   ├── api.ts              # MCP client wrapper
│   ├── capture-thought.tsx # Form UI with paste actions
│   ├── search-thoughts.tsx # Semantic search list
│   ├── list-thoughts.tsx   # Recent with type filters
│   ├── thought-stats.tsx   # Statistics dashboard
│   └── quick-capture.ts    # No-view command
├── package.json            # 5 commands declared
├── tsconfig.json
└── README.md               # Setup documentation
```

## Action Items

- [ ] Add 512x512 icon to assets/command-icon.png
- [ ] Run npm install && npm run build
- [ ] Configure MCP endpoint in Raycast preferences
- [ ] ray install to load extension
- [ ] Test all 5 commands

## Template Keywords Supported

Same as ingest-thought edge function:
- `Decision:` → task/Decision
- `Risk:` → task/Risk  
- `Insight:` → idea/Insight
- `Spec:` → reference/Spec
- `[Name] —` → person_note/Person Note
- `Meeting with` → observation/Meeting Debrief
- `Budget:` → observation/Budget

---

**Session**: 2026-03-16 23:40 UTC
**Agent**: Claude (Opus 4.6)
