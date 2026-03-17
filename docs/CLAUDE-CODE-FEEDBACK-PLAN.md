# Claude Code Feedback Plan of Action

**Purpose:** Structured approach to receiving, evaluating, and acting on feedback from Claude Code sessions  
**Applies to:** Code review, architecture decisions, implementation feedback  
**Created:** March 17, 2026

---

## Overview

This plan defines how to handle feedback received during Claude Code sessions—whether from the human partner, code reviewer subagents, or external sources. It ensures technical rigor without performative agreement.

**Core Principle:** Verify before implementing. Technical correctness over social comfort.

---

## Phase 1: Receive Feedback

### Step 1: Read Without Reacting

```
WHEN feedback arrives:
  1. READ complete feedback
  2. PAUSE - do not respond immediately
  3. IDENTIFY: What type of feedback is this?
```

**Feedback Type Classification:**

| Type | Source | Priority | Approach |
|------|--------|----------|----------|
| **Directive** | Human partner | Immediate | Implement after clarification |
| **Code Review** | Reviewer subagent | High | Evaluate technically, then act |
| **External** | Outside reviewer | Medium | Verify against codebase first |
| **Clarification** | Any | Blocking | Resolve before proceeding |
| **Suggestion** | Any | Low | Evaluate, implement if valid |

### Step 2: Understand Before Acting

**Restate the requirement in your own words:**

```
✅ "You want me to [specific action] because [technical reason]"

❌ "You're absolutely right!"
❌ "Great point!"
❌ "Let me implement that now"
```

**If unclear, ask before implementing:**
```
✅ "I understand items 1, 2, 3, and 6. Need clarification on 4 and 5 before proceeding."

❌ Implement what you understand, ignore the rest
```

---

## Phase 2: Evaluate Feedback

### Verification Checklist

For each feedback item, verify:

| Check | Question | Action if No |
|-------|----------|--------------|
| **Correctness** | Is this technically correct? | Push back with reasoning |
| **Context** | Does reviewer understand the full context? | Provide context or clarify |
| **Compatibility** | Does this break existing functionality? | Flag as blocking issue |
| **YAGNI** | Is this feature actually used? | grep codebase, question necessity |
| **Alignment** | Does this align with prior architectural decisions? | Discuss with human partner |

### YAGNI Check

```bash
# Before implementing "proper" features:
grep -r "function_name\|endpoint_name" --include="*.ts" --include="*.tsx" src/

IF no usage found:
  → "This isn't called anywhere. Remove it (YAGNI)?"
IF usage found:
  → Proceed with implementation
```

### When to Push Back

Push back when:
- [ ] Suggestion breaks existing functionality
- [ ] Reviewer lacks full context
- [ ] Violates YAGNI (unused feature)
- [ ] Technically incorrect for this stack
- [ ] Legacy/compatibility reasons exist
- [ ] Conflicts with human partner's architectural decisions

**How to push back:**
```
✅ "Checking... [specific technical finding]. [Question or alternative]."

❌ Long defensive explanation
❌ "I think you're wrong"
```

---

## Phase 3: Respond to Feedback

### Response Templates

#### For Correct Feedback
```
✅ "Fixed. [Brief description of what changed]"
✅ "Good catch - [specific issue]. Fixed in [location]."
✅ [Just fix it and show in the code]

❌ "You're absolutely right!"
❌ "Thanks for catching that!"
❌ ANY gratitude expression
```

#### For Unclear Feedback
```
✅ "I understand [what you understand]. Need clarification on [what's unclear] before proceeding."

❌ Partial implementation
❌ Silent assumption
```

#### For Incorrect Feedback
```
✅ "Checking... [technical finding]. This would [break X / conflict with Y]. [Alternative approach]?"

❌ "I disagree"
❌ No explanation
```

#### When You Were Wrong (After Pushback)
```
✅ "You were right - I checked [X] and it does [Y]. Implementing now."
✅ "Verified this and you're correct. My initial understanding was wrong because [reason]. Fixing."

❌ Long apology
❌ Defending why you pushed back
```

---

## Phase 4: Implement Feedback

### Implementation Order

```
FOR multi-item feedback:
  1. Clarify anything unclear FIRST
  2. Then implement in this order:
     a. Blocking issues (breaks, security)
     b. Simple fixes (typos, imports)
     c. Complex fixes (refactoring, logic)
  3. Test each fix individually
  4. Verify no regressions
```

### One Item at a Time

```
✅ Fix item 1 → Test → Commit
✅ Fix item 2 → Test → Commit

❌ Fix all items → Test once
❌ Fix without testing
```

### Test Before Declaring Done

```bash
# After each fix:
npm test
# or
npm run build
# or
supabase functions serve <function-name>
```

---

## Phase 5: Request Review (When Applicable)

### When to Request Code Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

### How to Request Review

```bash
# 1. Get git SHAs
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)

# 2. Dispatch code-reviewer subagent via Task tool
# Template: superpowers:code-reviewer
# Fill: code-reviewer.md
```

**Required Context:**
- `{WHAT_WAS_IMPLEMENTED}` - What you just built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit
- `{DESCRIPTION}` - Brief summary

### Act on Review Results

| Priority | Action | Timeline |
|----------|--------|----------|
| **Critical** | Fix immediately | Before any other work |
| **Important** | Fix before proceeding | Before next task |
| **Minor** | Note for later | Next cleanup cycle |
| **Invalid** | Push back with reasoning | Immediately |

---

## Feedback Source-Specific Handling

### From Human Partner

```
✅ Trusted - implement after understanding
✅ Still ask if scope unclear
✅ No performative agreement
✅ Skip to action or technical acknowledgment
```

### From Code Reviewer Subagent

```
✅ Evaluate technically before implementing
✅ Check against codebase reality
✅ Push back if reviewer is wrong
✅ Request clarification if unclear
```

### From External Reviewers

```
BEFORE implementing:
  1. Check: Technically correct for THIS codebase?
  2. Check: Breaks existing functionality?
  3. Check: Reason for current implementation?
  4. Check: Works on all platforms/versions?
  5. Check: Does reviewer understand full context?

IF suggestion seems wrong:
  → Push back with technical reasoning

IF can't easily verify:
  → "I can't verify this without [X]. Should I [investigate/ask/proceed]?"

IF conflicts with human partner's prior decisions:
  → Stop and discuss with human partner first
```

---

## Common Mistakes to Avoid

| Mistake | Why It Happens | Fix |
|---------|----------------|-----|
| Performative agreement | Social comfort | State requirement or just act |
| Blind implementation | Trust without verification | Check against codebase first |
| Batch without testing | Efficiency perceived | One at a time, test each |
| Assuming reviewer is right | Authority bias | Verify technical correctness |
| Avoiding pushback | Conflict avoidance | Technical correctness > comfort |
| Partial implementation | Unclear on some items | Clarify ALL items first |
| Can't verify, proceed anyway | Uncertainty | State limitation, ask for direction |

---

## Feedback Loop Integration

### After Implementation

```
1. TEST - Verify fix works
2. CHECK - No regressions introduced
3. UPDATE - Documentation if needed
4. RECORD - In PROGRESS_LOG.md if significant
5. PROCEED - To next task or feedback item
```

### Git Workflow

```bash
# After feedback implementation:
git add -A
git commit -m "[specific description of fix]"

# If multiple feedback items:
git add -A
git commit -m "[item 1 fix]"
git add -A
git commit -m "[item 2 fix]"
# etc.
```

---

## Emergency Escalation

### When to Escalate to Human Partner

- [ ] Feedback conflicts with prior architectural decisions
- [ ] Multiple reviewers give conflicting feedback
- [ ] Technical uncertainty can't be resolved
- [ ] Feedback requires scope change
- [ ] Implementation would break critical functionality

### Escalation Message Template

```
"Need guidance on feedback for [file/feature]:

Feedback: [Brief summary]
Conflict: [Why this is problematic]
Options: [A, B, C]
Recommendation: [Your technical preference]

Need decision before proceeding."
```

---

## Quick Reference

### The 5-Phase Process

| Phase | Action | Time |
|-------|--------|------|
| 1. Receive | Read, classify, pause | 1 min |
| 2. Evaluate | Verify, check YAGNI, assess | 2-5 min |
| 3. Respond | Restate, ask, or push back | 1-2 min |
| 4. Implement | Fix in priority order, test each | Varies |
| 5. Request Review | If needed, dispatch subagent | 2 min |

### Forbidden Phrases

❌ "You're absolutely right!"
❌ "Great point!"
❌ "Excellent feedback!"
❌ "Thanks for catching that!"
❌ "Let me implement that now"
❌ "I agree completely"

### Approved Responses

✅ "Fixed. [Description]"
✅ "Checking... [Finding]"
✅ "Need clarification on [item]"
✅ "This would [break X]. [Alternative]?"
✅ [Just fix it silently]

---

## Related Skills

| Skill | Use When |
|-------|----------|
| `receiving-code-review` | Processing any feedback |
| `requesting-code-review` | After implementation, before merge |
| `verification-before-completion` | Before claiming work is done |
| `systematic-debugging` | When feedback reveals bugs |

---

## Example Session

```
[Human partner]: "Fix these issues: 1) Edge function timeout too low, 
2) Missing error handling in API route, 3) Type safety issue in component"

[Claude Code]:
  Phase 1: Read and classify
    - Type: Directive from human partner
    - Priority: Immediate
    - All items appear clear

  Phase 2: Evaluate
    - Item 1: Check current timeout (currently 10s, should be 30s for embedding gen)
    - Item 2: Verify error handling gap (confirmed, catch block empty)
    - Item 3: Check TypeScript errors (confirmed, any type used)

  Phase 3: Respond
    → "Fixing: 1) Timeout 10s→30s, 2) Add error logging + user message, 
       3) Add proper interface for response type"

  Phase 4: Implement
    → Fix timeout → Test locally → Commit
    → Add error handling → Test error case → Commit
    → Add interface → Run type check → Commit

  Phase 5: Verify
    → All tests pass
    → No regressions
    → Ready for next task
```

---

*Plan of action for Claude Code feedback — March 17, 2026*
