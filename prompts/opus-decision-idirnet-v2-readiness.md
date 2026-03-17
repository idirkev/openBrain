# Opus Decision Prompt: idirnet v2 Readiness Assessment

**Agent:** Claude Opus 4.6 (Pipeline B, Step 2)
**Mode:** Architecture decision
**Purpose:** Synthesize Kimi's research and review findings into a go/no-go decision for idirnet v2, with concrete next actions.

---

## Prompt

```
You are Claude Opus 4.6, the architect for Open Brain. You have received two reports from Kimi:

1. GROUND TRUTH REPORT — What actually works vs what's just documented
2. DOCUMENTATION CONSOLIDATION — Overlap analysis and proposed structure

Your job: Make the architecture decisions that unblock idirnet v2.

READ THESE INPUTS:
- Kimi's ground truth report (from research step)
- Kimi's documentation overlap analysis (from review step)
- ~/OPENBRAIN/openBrain/docs/DATA-INTAKE-ARCHITECTURE.md
- ~/OPENBRAIN/openBrain/docs/TSM-ORGANIZATIONAL-FRAMEWORK.md
- ~/OPENBRAIN/openBrain/ROADMAP.md (phases 9-15 especially)

DECISIONS REQUIRED:

### D1: Documentation Consolidation
Accept, modify, or reject Kimi's consolidation proposal. If accepted, define the exact structure of CODEX.md and what gets archived.

### D2: Migration Status
The 6-phase database-to-Git migration was planned but never started. Options:
a) Execute it now (delays idirnet v2 by weeks)
b) Archive it (current database-centric model is sufficient)
c) Incorporate it into idirnet v2 (merge the migration with the rebuild)
Decide. State your reasoning in two sentences.

### D3: What Open Brain Contributes to idirnet v2
Define exactly what idirnet v2 inherits from Open Brain:
- Which intake channels carry forward?
- Does the 19-template system survive, evolve, or get replaced?
- Does the TSM framework become the organizing principle for idirnet v2?
- What happens to the 340 existing thoughts?

### D4: Agent Architecture for idirnet v2
Pipeline B (7-step) was designed but the model landscape has shifted. Define:
- Which models do what in idirnet v2?
- Does Kimi still handle research, or has Claude's context window made that redundant?
- Does Gemini still handle Google Workspace, or is there a better path?
- What role does Codex play now?

### D5: The 137 Unpushed Files
The idirnet portal has 137 staged files from Kimi's work. Decision:
a) Push them as-is
b) Review and selectively push
c) They're irrelevant to v2, archive them
Decide.

### D6: Immediate Actions (Before v2 Starts)
List exactly 3-5 things that must happen before idirnet v2 development begins. No more. Each must be completable in under 2 hours.

OUTPUT FORMAT:

## Architecture Decisions

### D1: [title]
**Decision:** [one sentence]
**Reasoning:** [two sentences max]
**Action:** [what Claude Sonnet should do]

### D2: [title]
...

## Immediate Action Plan
1. [action] — [owner] — [time estimate]
2. ...

## What idirnet v2 Inherits from Open Brain
- [item]: [keep/evolve/replace] — [why]

## What Gets Archived
- [item]: [reason]

Be decisive. No hedging. If you need more information, state exactly what's missing and from whom.
```

---

## Expected Output

A set of binding architecture decisions that Sonnet (Step 3) can execute without further deliberation.

## When to Use

- After Kimi has completed both research and review steps
- At the start of any major project pivot
- When multiple paths are open and a decision is blocking progress

## Pipeline Context

This prompt is Step 2 of Pipeline B:

```
Step 1a: Kimi research (ground truth) ──┐
Step 1b: Kimi review (doc consolidation) ├─► Step 2: Opus decides (THIS PROMPT)
                                         │
                                         ▼
                                    Step 3: Sonnet builds
                                    Step 4: Opus corrects
                                    Step 5: Kimi validates
```
