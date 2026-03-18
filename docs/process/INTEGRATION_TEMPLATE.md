# Integration Template

Use this before writing any code for a new integration, service, or feature.
Fill it out, get alignment, then add it to ROADMAP.md as a numbered phase.

---

## Template

```
# Integration: [Name]

Date proposed: YYYY-MM-DD
Proposed by:
Status: proposed | approved | in-progress | live | parked

---

## 1. What Is It?
One sentence. What does this thing do?


## 2. Which Layer?
Mark all that apply:

[ ] openBrain  — captures data, adds templates, extends the knowledge store
[ ] idirnet    — surfaces on the platform, affects shared/collective layer
[ ] LINK       — adds a pipeline step, affects orchestration or agent routing

If it spans layers, describe the seam:


## 3. What Flows In and Out?

IN:
- Source: (Slack / webhook / API / manual / scheduled / file upload)
- Trigger: (what causes data to arrive?)
- Format: (JSON / markdown / text / binary)

OUT:
- Destination: (openBrain thoughts table / idirnet / LINK pipeline / dashboard)
- Template keyword(s): (what prefix triggers classification?)
- New template layer or addition? (yes/no — if yes, name the templates)


## 4. Connection Points

Edge Function needed:
  Name:
  Purpose:
  Trigger: (HTTP / webhook / scheduled)

MCP tool needed:
  Name:
  What it exposes:

LINK pipeline step:
  Position: (research / decision / build / review / validate / stress-test / export)
  What it does in the pipeline:

Dashboard component:
  Location: (Morning Brief / LINK UI / both / neither)
  What it shows:

New Supabase table or column:


New gitignore / secrets:


## 5. Done Means

Three acceptance criteria. All three must be true before this is considered live:

1.
2.
3.

## 6. Rollout Sequence

[ ] Step 1: Documentation (this file + ROADMAP entry)
[ ] Step 2: Schema (migration if needed, template keywords added)
[ ] Step 3: Edge Function built and deployed
[ ] Step 4: MCP tool added (if needed)
[ ] Step 5: Dashboard component (if needed)
[ ] Step 6: LINK integration (if needed)
[ ] Step 7: Kimi review
[ ] Step 8: Codex stress test
[ ] Step 9: Deploy + verify acceptance criteria
[ ] Step 10: Update ROADMAP.md checkbox

## 7. What This Is NOT

Explicitly scope out what this integration does not do.
Prevents scope creep during build.


## 8. Parking Lot

Ideas that came up during planning but are out of scope for this phase.
Don't lose them — move to ROADMAP.md as a future phase if they have merit.

```

---

## Completed Integrations (for reference)

| Integration | Layer | Phase | Status |
|---|---|---|---|
| Slack #log → ingest-thought | openBrain | 0 | ✅ Live |
| Google Meet → meeting-notes | openBrain | 2 | ✅ Live |
| Reclaim smart scheduler | openBrain + idirnet | 4.6 | ✅ Live |
| Raycast extension (5 commands) | openBrain | 4.5 | ⏳ Built, install pending |
| Incented conviction voting | openBrain + idirnet | 4.7 / 16 | 🔵 Documented, not built |
| Gmail parsing (every 15 min) | openBrain | 7 | 📋 Planned |
| open-brain-mcp → LINK | openBrain ↔ LINK | — | ⏳ Deploy pending |

---

## Rules

1. No code before this template is filled out.
2. "Done means" criteria must be written before build starts — not after.
3. Parking lot items go to ROADMAP.md, not into the current build.
4. After go-live, move this file to `archive/integrations/[name].md`.
