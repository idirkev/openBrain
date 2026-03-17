# Claude Code Execution Prompt

**Use this prompt when starting a new Claude Code session to continue Open Brain work.**

---

## Copy-Paste This Into Claude Code

```
You are Claude Code continuing work on the Open Brain project. 

START BY READING:
1. ~/OPENBRAIN/openBrain/KIMI_TO_CLAUDE_HANDOVER.md — Full handover with checkpoints
2. ~/OPENBRAIN/openBrain/PLAYBOOK_UNIFIED.md — Unified documentation
3. ~/OPENBRAIN/openBrain/PDF_AUDIT.md — PDF inventory

CURRENT STATE:
- Phase 0-2: COMPLETE (Kimi built idirnet portal)
- Phase 3: IN PROGRESS (Team onboarding, PDF conversion)
- 48 PDFs audited, 9 converted, 12 queued
- 137 git files staged in idirnet (need push)
- 5 meeting transcripts need processing

YOUR TASK:
Work through Phase A: PDF Conversion (4 critical PDFs)

Start with A1: DELIVERABLE_2_OPTIONS.pdf
Location: idirnet/idirnet/idirnet_ROOT/content/knowledge/research/pdfs/
Output: content/knowledge/notes/deliverable-2-options.md

WORKFLOW:
1. Read the PDF
2. Extract: business model options, pricing, scope, recommendation
3. Convert to markdown with proper frontmatter
4. Add to PLAYBOOK_UNIFIED.md Section 3.4
5. git add . && git commit -m "Convert DELIVERABLE_2_OPTIONS.pdf"
6. Run chime: ~/OPENBRAIN/openBrain/scripts/chime.sh
7. Report: "Checkpoint A1 complete"

CHECKPOINTS:
- Stop after each sub-task and confirm completion
- If blocked, report immediately with error details
- Use chime after every commit
- Update this prompt's status section

WHAT NOT TO DO:
- Don't start Phase B until Phase A complete
- Don't modify Kimi's code in idirnet without explicit permission
- Don't skip checkpoint confirmations

STATUS CHECK:
Before proceeding, confirm:
- [ ] You read KIMI_TO_CLAUDE_HANDOVER.md
- [ ] You understand Phase A1 task
- [ ] You know where the PDF is located
- [ ] You're ready to start

Begin by confirming you've read the handover and are starting A1.
```

---

## Shorter Version (for quick starts)

```
Continue Open Brain work per KIMI_TO_CLAUDE_HANDOVER.md. 

Current: Phase A1 — Convert DELIVERABLE_2_OPTIONS.pdf to markdown.

Location: idirnet/idirnet/idirnet_ROOT/content/knowledge/research/pdfs/
Output: content/knowledge/notes/deliverable-2-options.md

Workflow: Read → Extract → Convert → Integrate → Commit → Chime → Confirm checkpoint.

Start by reading the PDF and confirming you understand the business model options described.
```

---

## Even Shorter (for resuming)

```
Resume Phase A from KIMI_TO_CLAUDE_HANDOVER.md. 

Status: A{current} in progress. 
Next step: {specific action}.

Confirm checkpoint when complete, then chime.
```

---

## Context-Setting Prefix (add to any prompt)

```
Context: Working on Open Brain knowledge system. 
Philosophy: "Best agent is a markdown file."
Git workflow: Colm's 3-command (add, commit, push).
Chime on completion: ~/OPENBRAIN/openBrain/scripts/chime.sh

Current mission: {task}
```

---

## Example Full Session Prompt

```
Context: Open Brain Phase 3 — PDF conversion per KIMI_TO_CLAUDE_HANDOVER.md

Mission: Complete Phase A1 (DELIVERABLE_2_OPTIONS.pdf)

Read handover first, then:
1. Locate PDF in idirnet content
2. Extract business model options (day rate vs retainer vs hybrid)
3. Create markdown with frontmatter (type: literature, tags: [deliverable, strategy])
4. Add summary to PLAYBOOK_UNIFIED.md Section 3.4
5. Commit with descriptive message
6. Run chime script
7. Confirm Checkpoint A1

Blockers: Escalate immediately. 
Questions: Reference PLAYBOOK_UNIFIED.md Section 6 (Reference) first.

Ready to begin. Confirm when you've read the handover and located the PDF.
```

---

## Checkpoint Prompts (use these to verify)

**After A1:**
```
Checkpoint A1 status:
- [ ] deliverable-2-options.md created
- [ ] Frontmatter includes type, source, tags, tsm_stack
- [ ] Business model options extracted
- [ ] Added to PLAYBOOK_UNIFIED.md Section 3.4
- [ ] Committed to git
- [ ] Chime played

If all checked, proceed to A2. If any unchecked, complete before continuing.
```

**After A4 (Phase A complete):**
```
Phase A complete. 4 PDFs converted.

Summary:
- A1: DELIVERABLE_2_OPTIONS.pdf → deliverable-2-options.md ✓
- A2: DELIVERABLE_3_RETAINER.pdf → deliverable-3-retainer.md ✓
- A3: DELIVERABLE_5_CONFLICTS.pdf → deliverable-5-conflicts.md ✓
- A4: MASTER_SOURCE_MAP.pdf → master-source-map-v2.md ✓

Ready for Phase B (Git consolidation)?
Confirm before proceeding to B1.
```

---

## Recovery Prompt (if lost)

```
Lost context. Recovering...

1. Read ~/OPENBRAIN/openBrain/KIMI_TO_CLAUDE_HANDOVER.md
2. Check git status in both directories:
   - ~/OPENBRAIN/openBrain/
   - ~/idirnet/idirnet/idirnet_ROOT/
3. Review what was last committed
4. Identify current checkpoint from handover
5. Resume from last incomplete checkpoint

Report: Current location in handover, last completed checkpoint, next action.
```

---

## Multi-Session Prompt (for long tasks)

```
This is a multi-session task. Progress tracking:

Phase: {A/B/C/D/E}
Checkpoint: {A1/A2/A3/A4/B1/B2/etc}
Status: {in progress/complete/blocked}

Completed this session:
- [ ] Item 1
- [ ] Item 2

Remaining:
- [ ] Item 3
- [ ] Item 4

Next session should:
1. Review this progress
2. Resume from checkpoint {X}
3. Complete items 3-4
4. Confirm checkpoint {X} complete
5. Either proceed to next checkpoint OR save state

Commit all work, update handover status, chime.
```

---

## Template Variables

Replace these in prompts:

| Variable | Value |
|----------|-------|
| `{current}` | A1, A2, A3, A4, B1, B2, B3, C1, C2, C3, C4, C5, D1, D2, D3, E1, E2, E3, E4 |
| `{specific action}` | e.g., "Read PDF", "Extract business model options", "Commit changes" |
| `{task}` | e.g., "Convert PDF to markdown", "Process meeting transcript", "Onboard Laura" |

---

## Prompt Best Practices

1. **Always reference the handover** — Don't rely on Claude's memory across sessions
2. **Specify checkpoint** — Make clear what completion looks like
3. **Include chime instruction** — Consistent completion signal
4. **Define blockers** — What should stop progress
5. **Confirm understanding** — Make Claude confirm before starting

---

## Example: Full A1 Prompt Chain

**Session Start:**
```
Context: Open Brain, Phase A1 per handover
Mission: Convert DELIVERABLE_2_OPTIONS.pdf to markdown

Read handover, locate PDF, confirm you're ready to start.
```

**Mid-Session (after PDF read):**
```
Checkpoint: PDF read. Extract business model options now.

Create file: content/knowledge/notes/deliverable-2-options.md

Required frontmatter:
---
type: literature
source: "PDF: DELIVERABLE_2_OPTIONS.pdf"
author: "idirnet"
created: "2026-03-16"
tags: [deliverable, strategy, business-model]
tsm_stack: external
tsm_plane: Governance
tsm_node: external-governance
---

Include: Summary, Key Points (bullet list), Full Content.
```

**End-Session:**
```
Checkpoint A1:
- [ ] File created at correct path
- [ ] Frontmatter complete
- [ ] Content extracted
- [ ] Added to PLAYBOOK_UNIFIED.md
- [ ] Committed
- [ ] Chime played

Confirm all, then proceed to A2 or end session.
```

---

*Save this file. Copy-paste relevant prompts into Claude Code sessions.*
