# Kimi Review Prompt: Documentation Debt and Consolidation

**Agent:** Kimi 2.5 (Pipeline B, Step 5 validation)
**Mode:** Review
**Purpose:** Map all documentation overlap and propose a single-source-of-truth structure.

---

## Prompt

```
You are Kimi, the review agent for Open Brain. The project has accumulated ~200KB of documentation across 12+ markdown files. Much of it is redundant. Your job is to map every overlap and propose consolidation.

READ THESE FILES:

1. ~/OPENBRAIN/openBrain/ROADMAP.md
2. ~/OPENBRAIN/openBrain/HANDOVER.md
3. ~/OPENBRAIN/openBrain/PLAYBOOK.md
4. ~/OPENBRAIN/openBrain/PLAYBOOK_UNIFIED.md
5. ~/OPENBRAIN/openBrain/CLAUDE.md
6. ~/OPENBRAIN/openBrain/MIGRATION_GUIDE.md
7. ~/OPENBRAIN/openBrain/MIGRATION_ASSESSMENT.md
8. ~/OPENBRAIN/openBrain/AGENT_2_HANDOVER.md
9. ~/OPENBRAIN/openBrain/KIMI_TO_CLAUDE_HANDOVER.md
10. ~/OPENBRAIN/openBrain/KNOWLEDGE_ARCHITECTURE.md
11. ~/OPENBRAIN/openBrain/IDIRNET_EXTRACTION_SUMMARY.md
12. ~/OPENBRAIN/openBrain/PROGRESS_LOG.md
13. ~/OPENBRAIN/openBrain/docs/DATA-INTAKE-ARCHITECTURE.md
14. ~/OPENBRAIN/openBrain/docs/TSM-ORGANIZATIONAL-FRAMEWORK.md
15. ~/OPENBRAIN/openBrain/prompts/*.md

FOR EACH FILE, ANSWER:

1. What unique information does this file contain that exists nowhere else?
2. What information is duplicated in other files? List the overlaps.
3. Is this file current or stale? (Check dates, check if described features exist.)
4. Who is the audience? (Human? Agent? Both?)

THEN PRODUCE:

### Overlap Matrix
A table showing which concepts appear in which files. Columns = files, rows = concepts (template system, TSM framework, database schema, deploy commands, AI pipeline, migration plan, etc.)

### Consolidation Proposal
Propose a new file structure with maximum 5 documents:

1. CODEX.md — Single source of truth (replaces ROADMAP + HANDOVER + PLAYBOOK)
2. CLAUDE.md — Agent routing only (stays lean)
3. docs/DATA-INTAKE-ARCHITECTURE.md — How data enters
4. docs/TSM-ORGANIZATIONAL-FRAMEWORK.md — How data is organized
5. prompts/ — Agent prompts (keep as-is)

For each proposed file: what goes in, what gets cut, what gets merged.

### Kill List
Files that should be deleted or archived after consolidation. For each: why it's safe to remove.

### Migration Docs Decision
The MIGRATION_GUIDE.md and MIGRATION_ASSESSMENT.md describe a 6-phase migration from database to hybrid Git+database. Is this migration still relevant? Should these docs survive or be archived?

OUTPUT FORMAT:
Short sentences. Tables where possible. No filler. Be direct about what's redundant.
```

---

## Expected Output

An overlap matrix and consolidation plan that Opus can approve and Claude can execute.

## When to Use

- When documentation has grown beyond 5 files
- Before major project pivots (like idirnet v2)
- When new agents struggle to find the right information
