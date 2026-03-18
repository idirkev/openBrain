# Kimi → Claude Handover

**Date:** 2026-03-16  
**From:** Kimi (idirnet project)  
**To:** Claude (Open Brain continuation)  
**Status:** Active handover — Phase 3 transition

---

## Executive Summary

Kimi built the idirnet knowledge portal (Phase 1-2 complete). Claude is now consolidating Open Brain operations, converting legacy PDFs, and creating unified documentation. This handover bridges the two systems.

| System | Owner | Status |
|--------|-------|--------|
| idirnet Portal | Kimi | Phase 2 COMPLETE, 97 files published |
| Open Brain Core | Claude | Phase 3 IN PROGRESS |
| PDF Migration | Claude | Audit complete, conversion queued |
| Unified PLAYBOOK | Claude | v2.0 created, needs PDF integration |

---

## What Kimi Built (Context for Claude)

### idirnet Portal Architecture

```
idirnet/idirnet/idirnet_ROOT/
├── content/
│   ├── docs/                    # 13 documentation pages
│   ├── knowledge/notes/         # 57 strategic/legal/marketing notes
│   ├── knowledge/research/      # Policy, technology, research
│   ├── projects/members/        # 8 team profiles
│   ├── projects/meetings/       # 10 meeting stubs
│   ├── requests/                # 6 formal requests (NEW)
│   └── templates/               # 5 Obsidian templates
├── src/
│   ├── app/tsm/[nodeId]/        # TSM node detail pages
│   ├── app/requests/            # Request board
│   ├── lib/request-router.ts    # AI routing logic
│   └── lib/auth/                # Magic link auth
└── CODEX.md                     # Token Codex (START HERE)
```

### Key Achievements (Phase 2 Complete)

- ✅ 97 content files with TSM tagging
- ✅ 41 files with cross-reference arrays
- ✅ 21 TSM node detail pages
- ✅ Request system with router logic
- ✅ Auth system (magic link, ready to enforce)
- ✅ Build passing

### Kimi's Active Blockers (Needs Colm/Kev)

| Blocker | Status | Owner | Action Required |
|---------|--------|-------|-----------------|
| DNS staging.idirnet.com | 🔴 BLOCKED | Colm | Update DNS records (see HANDOVER.md) |
| Git push 137 files | 🟡 READY | Kev | `git commit -m "Phase 2 complete" && git push` |
| Meeting .docx processing | ⏸️ PAUSED | — | 10 files in `Documents/Projects/2025/IDIR8/idirnet meet recordings/` |

---

## What Claude Has Done (Since Handover)

### Completed 2026-03-16

| Task | Output | Location |
|------|--------|----------|
| PDF Audit | Catalogued 48 project PDFs | `PDF_AUDIT.md` |
| PDF Index | Metadata stubs for 26 unconverted | `stubs/PDF_INDEX.md` |
| Unified PLAYBOOK | Merged ROADMAP + PLAYBOOK + KB | `PLAYBOOK_UNIFIED.md` |
| Chime Script | Completion notification | `scripts/chime.sh` |
| Git Commits | 4 commits on main | `git log` |

### Claude's Current Understanding

- Git workflow (Colm's 3-command method)
- TSM framework (21 nodes, 3 stacks)
- Zettelkasten note types (Fleeting/Literature/Permanent)
- 19 Open Brain templates (Team Core/Role/Personal)
- idirnet/Internet project structure
- PDF conversion queue (12 high-priority)

---

## Next Steps: Detailed Roadmap

### Phase A: PDF Conversion (Critical Path)

**Goal:** Convert 4 critical PDFs → markdown → integrate into PLAYBOOK_UNIFIED.md Section 3

#### A1. Convert DELIVERABLE_2_OPTIONS.pdf

**Input:** `idirnet/content/knowledge/research/pdfs/DELIVERABLE_2_OPTIONS.pdf`
**Output:** `content/knowledge/notes/deliverable-2-options.md`
**Integration:** Add to PLAYBOOK_UNIFIED.md Section 3.4

**Steps:**
1. [ ] Read PDF content
2. [ ] Extract key sections:
   - Business model options (day rate vs retainer vs hybrid)
   - Pricing structures
   - Scope boundaries
   - Recommendation
3. [ ] Convert to markdown with frontmatter:
   ```yaml
   ---
   type: literature
   source: "PDF: DELIVERABLE_2_OPTIONS.pdf"
   author: "idirnet"
   created: "2026-03-16"
   tags: [deliverable, strategy, business-model, pricing]
   tsm_stack: external
   tsm_plane: Governance
   tsm_node: external-governance
   ---
   ```
4. [ ] Add summary + key points + full content
5. [ ] Update PLAYBOOK_UNIFIED.md Section 3.4 with link
6. [ ] Commit: `git add . && git commit -m "Convert DELIVERABLE_2_OPTIONS.pdf"`
7. [ ] Play chime: `./scripts/chime.sh`

**Checkpoint A1:** File exists at `content/knowledge/notes/deliverable-2-options.md` with frontmatter and summary.

---

#### A2. Convert DELIVERABLE_3_RETAINER.pdf

**Input:** `idirnet/content/knowledge/research/pdfs/DELIVERABLE_3_RETAINER.pdf`
**Output:** `content/knowledge/notes/deliverable-3-retainer.md`
**Integration:** PLAYBOOK_UNIFIED.md Section 3.4

**Steps:**
1. [ ] Read PDF content
2. [ ] Extract:
   - Retainer tier structure (bronze/silver/gold)
   - Monthly/hourly breakdowns
   - Overage handling
   - Termination clauses
3. [ ] Convert to markdown with frontmatter
4. [ ] Add to PLAYBOOK_UNIFIED.md Section 3.4
5. [ ] Commit
6. [ ] Chime

**Checkpoint A2:** Retainer structure documented and linked.

---

#### A3. Convert DELIVERABLE_5_CONFLICTS.pdf

**Input:** `idirnet/content/knowledge/research/pdfs/DELIVERABLE_5_CONFLICTS.pdf`
**Output:** `content/knowledge/notes/deliverable-5-conflicts.md`
**Integration:** PLAYBOOK_UNIFIED.md Section 3.4

**Steps:**
1. [ ] Read PDF content
2. [ ] Extract:
   - Conflict of interest definitions
   - Disclosure requirements
   - Resolution procedures
   - Escalation paths
3. [ ] Convert to markdown
4. [ ] Add to PLAYBOOK_UNIFIED.md
5. [ ] Commit
6. [ ] Chime

**Checkpoint A3:** Governance framework documented.

---

#### A4. Convert MASTER_SOURCE_MAP.pdf

**Input:** `idirnet/content/knowledge/research/pdfs/MASTER_SOURCE_MAP.pdf`
**Output:** `content/knowledge/notes/master-source-map-v2.md` (update existing)
**Integration:** PLAYBOOK_UNIFIED.md Section 3.3 (TSM)

**Steps:**
1. [ ] Read PDF content
2. [ ] Compare to existing `master-source-map.md`
3. [ ] Extract system dependencies diagram
4. [ ] Update or replace existing file
5. [ ] Add dependency visual to PLAYBOOK_UNIFIED.md
6. [ ] Commit
7. [ ] Chime

**Checkpoint A4:** System architecture documented with dependencies.

---

### Phase B: Git Consolidation (Operational)

**Goal:** Resolve 137 staged files, push to origin, notify team

#### B1. Review Staged Files

**Location:** `idirnet/idirnet/idirnet_ROOT/`

**Steps:**
1. [ ] `cd /Users/kevfreeney/idirnet/idirnet/idirnet_ROOT`
2. [ ] `git status` (verify 137 files staged)
3. [ ] `git diff --stat` (review what changed)
4. [ ] Spot-check 5 critical files:
   - `src/app/tsm/[nodeId]/page.tsx`
   - `src/lib/request-router.ts`
   - `content/requests/*.md`
   - `middleware.ts`

**Checkpoint B1:** Confident that changes are correct and complete.

---

#### B2. Commit and Push

**Steps:**
1. [ ] `git add -A` (ensure all staged)
2. [ ] `git commit -m "feat: Phase 2 Interconnection complete

   - TSM tagging: 97 files with tsm_stack, tsm_plane, tsm_node
   - Cross-references: 41 files with related arrays
   - TSM node pages: 21 detail pages
   - Request system: 6 requests with routing logic
   - Auth system: Magic link implementation
   - Router: AI-powered request suggestions
   
   Closes Phase 2."`
3. [ ] `git push origin main`
4. [ ] Verify deploy on Vercel dashboard

**Checkpoint B2:** Code pushed, Vercel building, no errors.

---

#### B3. Notify Stakeholders

**Slack #log channel:**
```
Milestone: Phase 2 Interconnection deployed to production

- 97 content files published
- TSM framework fully integrated
- Request system live at /requests
- Auth system ready (not yet enforced)

Next: Phase 3 Team Onboarding
```

**Email to Colm:**
- DNS records needed for staging.idirnet.com
- GitHub repo now up to date
- Request review of TSM node pages

**Checkpoint B3:** Team notified, Colm has action items.

---

### Phase C: Meeting Transcript Processing (Knowledge Capture)

**Goal:** Extract decisions from 5 Gemini meeting transcripts → Open Brain

**Location:** `idirnet/content/knowledge/research/pdfs/`

**Files to Process:**
1. `Meeting started 2026_02_17 11_54 GMT – Notes by Gemini.pdf`
2. `Kev _ Jochem – 2026_02_25 11_32 GMT – Notes by Gemini.pdf`
3. `idirnet Team Alignment _ Meeting Prep – 2026_02_25 14_00 GMT.pdf`
4. `idirnet Team Alignment _ Meeting Prep – 2026_02_25 15_01 GMT.pdf`
5. `idirnet mgmt meeting – 2026_02_25 18_00 GMT.pdf`

#### C1. Process Meeting 2026-02-17

**Steps:**
1. [ ] Read PDF transcript
2. [ ] Identify decisions made → `Decision:` captures
3. [ ] Identify risks raised → `Risk:` captures
4. [ ] Identify milestones → `Milestone:` captures
5. [ ] Create meeting summary note:
   ```markdown
   ---
   type: meeting
   date: "2026-02-17"
   participants: [Kev, ...]
   tags: [meeting, alignment]
   ---
   
   ## Decisions
   - Decision: ...
   
   ## Risks
   - Risk: ...
   ```
6. [ ] Capture individual thoughts via MCP
7. [ ] Archive PDF (mark as processed)

**Checkpoint C1:** Meeting knowledge extracted and captured.

---

#### C2-C5. Process Remaining Meetings

Repeat C1 process for remaining 4 transcripts.

**Checkpoint C2-C5:** All meeting knowledge in Open Brain.

---

### Phase D: PLAYBOOK Integration (Documentation)

**Goal:** PLAYBOOK_UNIFIED.md becomes canonical, old files deprecated

#### D1. Integrate Converted PDFs

**Steps:**
1. [ ] Add links to converted PDFs in Section 3.4
2. [ ] Add summaries to knowledge base index
3. [ ] Cross-reference with TSM nodes
4. [ ] Update changelog in Appendix C

**Checkpoint D1:** All converted PDFs linked and discoverable.

---

#### D2. Deprecate Old Files

**Steps:**
1. [ ] Add header to `docs/status/ROADMAP.md`:
   ```markdown
   # DEPRECATED — See PLAYBOOK_UNIFIED.md
   ```
2. [ ] Add header to `PLAYBOOK.md`:
   ```markdown
   # DEPRECATED — See PLAYBOOK_UNIFIED.md
   ```
3. [ ] Update `CLAUDE.md` to reference unified playbook
4. [ ] Commit changes

**Checkpoint D2:** Single source of truth established.

---

#### D3. Create Quick Reference Card

**Output:** `QUICKSTART.md`

**Contents:**
- 3-command git workflow
- 19 template keywords
- Emergency contacts
- Common commands

**Checkpoint D3:** New team members can onboard in 5 minutes.

---

### Phase E: Team Onboarding Support (Phase 3)

**Goal:** Prepare onboarding materials for Kris, Laura, Jochem, Colm

#### E1. Kris Onboarding Package

**Already Sent:** 19-template guide + Apps Script setup

**Remaining:**
1. [ ] Wait for Kris's Gemini folder ID
2. [ ] Create personalized template guide:
   - Focus: Spec + Milestone (engineering focus)
   - Examples from his domain
3. [ ] Test Slack capture with his templates
4. [ ] Schedule check-in

**Checkpoint E1:** Kris fully operational.

---

#### E2. Laura Onboarding Package

**Focus:** Budget, Invoice, Funding, Legal, Compliance, Contract

**Steps:**
1. [ ] Create Laura-specific guide:
   - Finance template examples
   - Compliance checklist
   - Invoice workflow
2. [ ] Set up her Apps Script
3. [ ] Share relevant converted PDFs:
   - DELIVERABLE_2_OPTIONS (business model)
   - DELIVERABLE_3_RETAINER (retainer structure)
   - ECP (employment policy)
4. [ ] Schedule onboarding call

**Checkpoint E2:** Laura ready to capture finance/compliance thoughts.

---

#### E3. Jochem Onboarding Package

**Focus:** Stakeholder, Sent, Risk

**Steps:**
1. [ ] Create Jochem-specific guide:
   - Stakeholder relationship tracking
   - Sent item follow-up
   - Risk identification
2. [ ] Set up Apps Script
3. [ ] Schedule onboarding

**Checkpoint E3:** Jochem ready for stakeholder management.

---

#### E4. Colm Onboarding Package

**Focus:** Spec, Milestone

**Steps:**
1. [ ] Create Colm-specific guide:
   - Technical spec format
   - Milestone definitions
   - Git integration with Open Brain
2. [ ] Share MASTER_SOURCE_MAP (updated)
3. [ ] Coordinate DNS fix for staging
4. [ ] Schedule technical alignment

**Checkpoint E4:** Colm integrated with both idirnet portal and Open Brain.

---

## Handoff Protocols

### When to Involve Kimi Again

| Scenario | Action |
|----------|--------|
| idirnet portal build fails | Escalate to Kimi with error logs |
| TSM framework needs expansion | Kimi designed it, consult first |
| Request router logic errors | Kimi wrote the AI routing |
| Auth system enforcement | Kimi implemented, review together |
| Performance issues | Kimi optimized, benchmark against his baselines |
| New major feature (Phase 4+) | Kimi should architect |

### When Claude Handles Solo

| Scenario | Action |
|----------|--------|
| PDF conversion | Claude's workflow now |
| Open Brain captures | Claude's domain |
| PLAYBOOK updates | Claude maintains |
| Meeting processing | Claude's knowledge extraction |
| Git workflow questions | Colm trained Claude, reference playbook |
| Template classification | Well-documented, Claude handles |

### Joint Sessions Needed

1. **Phase 3 Kickoff** — Both agents present for team onboarding
2. **Morning Briefing Dashboard** — Kimi's UI + Claude's data pipeline
3. **Weekly Review Automation** — Kimi's scheduling + Claude's summarization
4. **KOD Integration** — Knowledge handshake between systems

---

## Decision Register (Pending)

| ID | Decision | Kimi View | Claude View | Status |
|----|----------|-----------|-------------|--------|
| D7 | Include KIMI CODE docs? | Waiting | Needs Kev input | ⏸️ |
| D9 | Auth enforcement timing? | Ready to enable | Coordinate with onboarding | ⏸️ |
| D10 | PDF conversion tool? | — | Marker/pandoc/Claude | 🟡 |
| D11 | Unified vs separate playbooks? | — | Unified created | ✅ |
| D12 | Kimi-Claude handoff frequency? | — | Daily during Phase 3 | 🟡 |

---

## Files Reference

### Kimi's Canonical Sources
- `/idirnet/idirnet/idirnet_ROOT/CODEX.md` — START HERE
- `/idirnet/docs/project/KIMI_HANDOVER.md` — Kimi-to-Kimi handover
- `/idirnet/IDIRNET_PROGRESS_REPORT_2026-03-13.md` — Full status

### Claude's Canonical Sources
- `/OPENBRAIN/openBrain/PLAYBOOK_UNIFIED.md` — Unified documentation
- `/OPENBRAIN/openBrain/PDF_AUDIT.md` — PDF inventory
- `/OPENBRAIN/openBrain/stubs/PDF_INDEX.md` — Metadata stubs
- `/OPENBRAIN/openBrain/KIMI_TO_CLAUDE_HANDOVER.md` — This file

---

## Daily Standup Template (Claude → Kimi Updates)

```markdown
**Date:** YYYY-MM-DD
**Claude Session:** #

## Completed
- [ ] Item 1
- [ ] Item 2

## Blocked
- [ ] Blocker 1 (needs: ___)

## Next
- [ ] Item 3
- [ ] Item 4

## Questions for Kimi
1. 
2. 

## Handoff Needed?
- [ ] Yes — scheduled for ___
- [ ] No — continuing solo
```

---

## Success Metrics

| Metric | Target | Current | Owner |
|--------|--------|---------|-------|
| 4 critical PDFs converted | 100% | 0% | Claude |
| 137 files pushed to origin | 100% | 0% | Claude/Kev |
| Meeting transcripts processed | 100% (5/5) | 0% | Claude |
| Team members onboarded | 4/4 | 0/4 | Claude |
| DNS staging resolved | 1/1 | 0/1 | Colm |
| Unified playbook adopted | 100% | 50% | Claude |

---

**End of Handover Document**

*Next checkpoint: After Phase A1 (DELIVERABLE_2_OPTIONS.pdf converted)*
