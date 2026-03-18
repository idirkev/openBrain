# Opus → Sonnet Handoff Protocol

**Purpose:** What Claude Opus (Architect) must provide to Claude Sonnet (Builder) for effective implementation  
**Applies to:** Architecture decisions, complex features, multi-step implementations  
**Model:** D4 Simplified — Opus decides, Sonnet builds  
**Created:** March 17, 2026

---

## Overview

The D4 agent model defines:
- **Opus (Architect/Reviewer):** Makes architecture decisions, reviews code
- **Sonnet (Builder):** Executes all implementation

This document defines the **minimum information** Opus must provide when handing off to Sonnet. Without this context, Sonnet lacks the constraints and rationale needed for correct implementation.

---

## Required Handoff Components

### 1. The Decision (REQUIRED)

**What:** A clear, binding decision on what to build

**Format:**
```
## Decision

Build: [specific feature/component]
Purpose: [one-sentence why]
Priority: [P0 blocking / P1 important / P2 nice-to-have]
```

**Example (Good):**
```
Build: Settlement calculation endpoint for Incented integration
Purpose: Calculate winners, awards, and voter rewards when voting ends
Priority: P1 (blocks Phase 16 completion)
```

**Example (Bad):**
```
❌ "Build the Incented stuff"
❌ "We need settlement logic"
```

---

### 2. Architecture Constraints (REQUIRED)

**What:** Hard boundaries Sonnet must stay within

**Format:**
```
## Constraints

- Stack: [technologies to use]
- Location: [where files go]
- Interface: [API signatures, data shapes]
- Dependencies: [what this connects to]
- Non-goals: [what NOT to build]
```

**Example (Good):**
```
## Constraints

- Stack: Supabase Edge Function (Deno), TypeScript
- Location: ~/supabase/functions/process-incented/index.ts
- Interface: 
  - Input: { cycle_id: string, program_id: string }
  - Output: { winners: Winner[], awards: Award[], status: "calculated" | "error" }
- Dependencies: 
  - Connects to existing thoughts table
  - Uses existing MCP_ACCESS_KEY auth
- Non-goals:
  - No UI components (separate task)
  - No token distribution (multisig handles that)
  - No email notifications (out of scope)
```

**Critical:** Explicit non-goals prevent scope creep.

---

### 3. Success Criteria (REQUIRED)

**What:** How we know it's done correctly

**Format:**
```
## Success Criteria

- [ ] Criterion 1 (measurable)
- [ ] Criterion 2 (measurable)
- [ ] Criterion 3 (measurable)

Test with: [specific test case or data]
```

**Example (Good):**
```
## Success Criteria

- [ ] Settlement correctly identifies Top X winners by net votes
- [ ] Award amounts sum to exactly award_pool total
- [ ] Voter rewards include slash pool distribution
- [ ] Incorrect voters lose exactly slash_pct of stake
- [ ] Results stored in settlement table with all metadata

Test with: 
  - Cycle with 4 submissions, 5 voters
  - Expected winners: 3 (Top X = 3)
  - Expected slashing: 2 voters incorrect
```

**Critical:** Without success criteria, Sonnet can't verify completion.

---

### 4. Context & Rationale (REQUIRED)

**What:** Why this decision was made (prevents Sonnet from re-deciding)

**Format:**
```
## Rationale

Decision: [What we chose]
Alternatives considered: [What we rejected and why]
Key factors: [What mattered most]
Trade-offs: [What we gave up]
```

**Example (Good):**
```
## Rationale

Decision: Calculate settlement in Edge Function, not client-side

Alternatives considered:
  - Client-side calculation: Rejected (security, trust)
  - Database triggers: Rejected (too complex, hard to debug)
  - Scheduled job: Rejected (overkill for daily runs)

Key factors:
  - Must be tamper-proof (hence server-side)
  - Needs access to full vote data (hence Edge Function)
  - Daily timing acceptable (hence not real-time)

Trade-offs:
  - Slight latency (vs client-side)
  - Requires deployment (vs database)
```

**Critical:** Rationale prevents Sonnet from questioning the decision mid-implementation.

---

### 5. Reference Materials (REQUIRED)

**What:** Files Sonnet must read before starting

**Format:**
```
## References

MUST READ:
- [path/to/file] — [why this matters]
- [path/to/file] — [why this matters]

SKIM FOR CONTEXT:
- [path/to/file] — [what to look for]

DO NOT READ:
- [path/to/file] — [why it's irrelevant]
```

**Example (Good):**
```
## References

MUST READ:
- ~/OPENBRAIN/openBrain/docs/architecture/INCENTED-INTEGRATION.md — Settlement process section
- ~/supabase/functions/ingest-thought/index.ts — See how we calculate embeddings (similar pattern)
- ~/supabase/migrations/007_settlement.sql — Database schema

SKIM FOR CONTEXT:
- ~/OPENBRAIN/openBrain/docs/status/ROADMAP.md — Phase 16 for overall context

DO NOT READ:
- ~/idirnet/idirnet/idirnet_ROOT/content/* — Out of scope for this task
```

**Critical:** Without explicit "DO NOT READ," Sonnet may waste time on irrelevant docs.

---

### 6. Known Issues & Risks (OPTIONAL but Recommended)

**What:** Problems Sonnet should watch for

**Format:**
```
## Known Issues

| Issue | Likelihood | Mitigation |
|-------|------------|------------|
| [Risk 1] | High/Medium/Low | [How to avoid] |
| [Risk 2] | High/Medium/Low | [How to avoid] |
```

**Example:**
```
## Known Issues

| Issue | Likelihood | Mitigation |
|-------|------------|------------|
| Floating point precision in award calculation | High | Use integer math (cents), not decimals |
| Ties in vote counts | Medium | Break ties by unique voter count, then timestamp |
| Large cycle performance | Medium | Paginate vote queries, don't load all at once |
```

---

### 7. Integration Points (REQUIRED for multi-component work)

**What:** How this connects to existing code

**Format:**
```
## Integration Points

Calls:
- [Function] in [file] — [purpose]

Called by:
- [Function] in [file] — [purpose]

Data flow:
[Component A] → [data] → [Component B]
```

**Example:**
```
## Integration Points

Calls:
- match_thoughts() in Supabase — Fetches votes by cycle
- calculate_net_votes() — Internal helper (you'll build)
- update_settlement_record() — Writes results

Called by:
- Scheduled Edge Function (cron job) — Daily at midnight UTC
- Manual trigger from MCP tool — Admin override

Data flow:
Votes (thoughts table) → process-incented → Settlement (settlement table)
                      ↓
              Slashing records (slash table)
```

---

## Handoff Format Template

```markdown
# Opus → Sonnet Handoff

**Date:** YYYY-MM-DD  
**From:** Opus (Architecture)  
**To:** Sonnet (Implementation)  
**Task:** [Brief description]

---

## Decision

Build: [what]
Purpose: [why]
Priority: [P0/P1/P2]

---

## Constraints

- Stack: [technologies]
- Location: [file paths]
- Interface: [signatures]
- Dependencies: [connections]
- Non-goals: [exclusions]

---

## Success Criteria

- [ ] [criterion 1]
- [ ] [criterion 2]
- [ ] [criterion 3]

Test with: [test case]

---

## Rationale

Decision: [what we chose]
Alternatives: [rejected options + why]
Key factors: [decision drivers]
Trade-offs: [what we gave up]

---

## References

MUST READ:
- [path] — [reason]

SKIM:
- [path] — [reason]

DO NOT READ:
- [path] — [reason]

---

## Known Issues

| Issue | Likelihood | Mitigation |
|-------|------------|------------|
| [risk] | [H/M/L] | [avoidance] |

---

## Integration Points

[diagram or description]

---

## Questions?

If anything is unclear, ask before implementing.
Do not make assumptions that contradict constraints.
Do not expand scope beyond non-goals.
```

---

## Example: Complete Handoff

```markdown
# Opus → Sonnet Handoff

**Date:** 2026-03-17  
**From:** Opus (Architecture)  
**To:** Sonnet (Implementation)  
**Task:** Build Incented settlement calculation Edge Function

---

## Decision

Build: Settlement calculation endpoint for Incented integration
Purpose: Calculate winners, awards, and voter rewards when voting ends
Priority: P1 (blocks Phase 16 completion)

---

## Constraints

- Stack: Supabase Edge Function (Deno/TypeScript), no external deps
- Location: ~/supabase/functions/process-incented/index.ts
- Interface:
  ```typescript
  // Input
  { cycle_id: string, program_id: string }
  
  // Output
  { 
    status: "calculated" | "error",
    winners: { submission_id, rank, award_amount }[],
    voters: { address, reward, slash_amount }[],
    totals: { awarded, slashed, distributed }
  }
  ```
- Dependencies:
  - Reads from: thoughts, cycles, programs tables
  - Writes to: settlements, voter_rewards tables
  - Uses: existing MCP_ACCESS_KEY for auth
- Non-goals:
  - No UI components
  - No email/Slack notifications
  - No token distribution (multisig does that)
  - No automatic triggering (scheduled separately)

---

## Success Criteria

- [ ] Correctly identifies Top X winners by net votes (FOR - AGAINST)
- [ ] Calculates awards: Split Equal (pool / winner_count)
- [ ] Identifies correct votes (FOR winner OR AGAINST loser)
- [ ] Applies 10% slash to incorrect voters
- [ ] Distributes voting pool + slash pool to correct voters proportionally
- [ ] All math uses integers (cents), no floating point
- [ ] Results stored with full audit trail

Test with:
  - Program: 10,000 award pool, 1,000 voting pool, 10% slash, Top 3
  - Submissions: 4 (A: +800, B: +500, C: +250, D: -100)
  - Expected winners: A, B, C
  - Expected awards: 3,333 each
  - Voters: 5 (2 incorrect)
  - Expected slash: 40 + 20 = 60
  - Expected rewards: 1,060 distributed to 3 correct voters

---

## Rationale

Decision: Server-side calculation in Edge Function
Alternatives:
  - Client-side: Rejected (tampering risk)
  - Database triggers: Rejected (complexity, debuggability)
  - External service: Rejected (unnecessary dependency)
Key factors: Security, auditability, integration with existing stack
Trade-offs: Slight latency vs client-side (acceptable)

---

## References

MUST READ:
- ~/OPENBRAIN/openBrain/docs/architecture/INCENTED-INTEGRATION.md — Settlement Process Deep Dive section
- ~/supabase/functions/ingest-thought/index.ts — See patterns for DB queries
- ~/supabase/migrations/007_settlement.sql — Schema (you'll extend)

SKIM:
- ~/OPENBRAIN/openBrain/docs/status/ROADMAP.md — Phase 16 for context

DO NOT READ:
- ~/idirnet/* — Out of scope
- ~/OPENBRAIN/openBrain/apps/* — UI is separate task

---

## Known Issues

| Issue | Likelihood | Mitigation |
|-------|------------|------------|
| Floating point errors | High | Use integer math (multiply by 100) |
| Vote count ties | Medium | Break by unique voter count, then timestamp |
| Large cycle performance | Medium | Stream votes, don't load all into memory |
| Concurrent settlement | Low | Use DB transaction with row locking |

---

## Integration Points

Triggered by:
- Scheduled Edge Function (cron) — daily at midnight UTC
- MCP tool: calculate_settlement() — admin override

Data flow:
```
thoughts (votes)
    ↓
process-incented Edge Function
    ↓
settlement record → stored result
voter_rewards → individual payouts
```

No direct UI integration (UI reads from settlement table).

---

## Questions?

If unclear, ask. Don't assume.
```

---

## Anti-Patterns to Avoid

### ❌ Bad Handoff 1: No Constraints
```
"Build the settlement thing. Make it work."
```
**Problem:** Sonnet must guess tech stack, location, interface.

### ❌ Bad Handoff 2: No Success Criteria
```
"Build settlement calculation."
```
**Problem:** Sonnet can't verify if it's correct.

### ❌ Bad Handoff 3: Implicit Decisions
```
"We should probably use an Edge Function. Or maybe a trigger?"
```
**Problem:** Sonnet must re-decide what Opus already decided.

### ❌ Bad Handoff 4: Everything is Required
```
"Read all these 20 files before starting."
```
**Problem:** Sonnet wastes time on irrelevant context.

### ❌ Bad Handoff 5: No Rationale
```
"Use integer math."
```
**Problem:** Sonnet doesn't know why, may "optimize" to floats later.

---

## Quick Checklist for Opus

Before handing off, verify:

- [ ] Decision is clear and specific
- [ ] Constraints include non-goals
- [ ] Success criteria are measurable
- [ ] Rationale explains why (not just what)
- [ ] References distinguish MUST vs DO NOT READ
- [ ] Known issues are flagged
- [ ] Integration points are documented

**If any unchecked:** Add before handing off.

---

## Quick Checklist for Sonnet

Upon receiving handoff, verify:

- [ ] I understand what to build
- [ ] I know where constraints are documented
- [ ] I can verify success criteria
- [ ] I've read all MUST READ references
- [ ] I know what NOT to build (non-goals)
- [ ] I understand the rationale (won't second-guess)

**If any unclear:** Ask Opus before implementing.

---

## Escalation

If Sonnet discovers during implementation that:
- Constraints are impossible
- Success criteria contradict each other
- New information invalidates the decision

**Signal:** "Escalating to Opus — [reason]"

Do not proceed with assumptions. Re-engage Opus.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | Agent model (D4) definition |
| `docs/process/CLAUDE-CODE-FEEDBACK-PLAN.md` | How to handle feedback |
| `prompts/opus-decision-idirnet-v2-readiness.md` | Opus decision template |
| `prompts/claude-code-task-prompts.md` | Sonnet execution prompts |

---

*Opus → Sonnet Handoff Protocol — March 17, 2026*
