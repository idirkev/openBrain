# idirnet → Open Brain Extraction Summary

**Date:** 2026-03-16  
**Purpose:** Document pivotal architectural pieces extracted from idirnet and incorporated into Open Brain

---

## Overview

Worked through idirnet documents from bottom to top, extracting architectural patterns, decision records, and operational frameworks that should inform Open Brain's evolution.

**Documents reviewed:** 50+ across templates, requests, ADRs, strategic notes, and operational guides.

---

## Key Architectural Pieces Extracted

### 1. Document Type System (Zettelkasten-Inspired)

**Source:** `idirnet/content/50-Templates/*.md`

**Pivotal Insight:** Not everything is a "thought." Different knowledge stages need different types:
- **Fleeting** — Raw capture (process within 48h or lose it)
- **Literature** — Notes on external sources (with attribution)
- **Permanent** — Atomic ideas, written in own words
- **Project** — Active work with status, tasks, log
- **Structure** — Maps of content (MOCs)
- **Request** — Formal asks with acceptance criteria

**Open Brain Integration:** Phase 9 — Document Type System

**Why it matters:** The 19 templates classify *topic domain* (what it's about). Document types classify *knowledge stage* (how processed it is). Both dimensions needed.

---

### 2. Frontmatter Schema Standardization

**Source:** All idirnet markdown files (consistent YAML frontmatter)

**Pivotal Insight:** Every document has consistent metadata enabling programmatic access:
```yaml
id: "YYYYMMDDHHmm"  # Sortable timestamp
title: "..."
description: "..."
type: "..."
status: "..."
author: "..."
created: "..."
updated: "..."
tags: []
publish: true|false
access_level: public|network|team|leadership
aliases: []
related: [id1, id2]
```

**Open Brain Integration:** Phase 10 — Frontmatter Schema Standardization

**Why it matters:** Frontmatter is the structured API that makes unstructured content queryable. Without it, we have a bag of text. With it, we have a knowledge graph.

---

### 3. 4-Tier Access Control Model

**Source:** `idirnet/docs/adr/adr-005-access-control.md`

**Pivotal Insight:** Privacy-first content governance with graduated access:
- **Public** — Anyone (project descriptions, philosophy)
- **Network** — Extended network (40+) (profiles, meeting notes)
- **Team** — Core team (5) (contracts, budgets)
- **Leadership** — Kev + Laura only (strategic, personnel)

**Decision Rationale:**
- Matches actual team structure
- Creator-friendly mental model
- Auditability (grep `access_level:` across docs)
- Future-proof (can add tiers)
- Implementable via middleware + frontmatter

**Security Principle:** Return 404 (not 403) for unauthorized access to prevent enumeration.

**Open Brain Integration:** Phase 11 — 4-Tier Access Control

**Why it matters:** Without access control, users self-censor. With clear tiers, people capture freely knowing the right audience will see it.

---

### 4. Request/Project Tracking System

**Source:** `idirnet/content/requests/*.md` (18 request files)

**Pivotal Insight:** Tasks need formal structure to be actionable. A "request" type transforms ideas into deliverables:
```yaml
type: request
status: open|in-progress|review|completed|blocked
priority: critical|high|medium|low
assigned: "name"
due_date: "YYYY-MM-DD"
acceptance_criteria:
  - [ ] Specific, measurable criterion
  - [ ] Clear pass/fail state
dependencies: [req-001, req-002]
blocks: [req-003]
critical_path_position: "#3 of 12"
```

**Pattern observed:** All requests include:
- Context (why this matters)
- Acceptance criteria (how we know it's done)
- Dependencies (what must complete first)
- Downstream impact (what this enables)
- TSM context (which stack/plane/node)

**Open Brain Integration:** Phase 12 — Request/Project Tracking

**Why it matters:** Thoughts are captured. Requests are delivered. Without structured requests, action items get lost in the stream.

---

### 5. Knowledge Graph & Bidirectional Linking

**Source:** `idirnet/content/30-Structure/MOC-*.md`, wikilink syntax throughout

**Pivotal Insight:** Knowledge is a graph, not a list. `[[wikilinks]]`, `related` fields, and automated relationship detection create emergent structure.

**Relationship types identified:**
- `derives_from` — Built upon another thought
- `relates_to` — Connected concept
- `contradicts` — Opposing view
- `supports` — Evidence for
- `references` — Cites/mentions

**Pattern observed:** Structure notes (MOCs) act as curated indexes — living documents that organize clusters of related notes.

**Open Brain Integration:** Phase 13 — Knowledge Graph & Network

**Why it matters:** Lists are for search. Graphs are for discovery. The knowledge graph enables serendipity.

---

### 6. TSM Framework (Triple Stack Model)

**Source:** `idirnet/docs/tsm-framework.md`, `idirnet/content/docs/adr/adr-004-tsm.md`

**Pivotal Insight:** Complex projects need multi-dimensional organization. TSM provides 21 nodes (3 stacks × 7 planes) ensuring nothing falls through cracks.

**Stacks:**
- **Global** — Infrastructure & systems (Ground, Runtime, Circulation, Channels, Frames, Roles, Horizons)
- **Internal** — Embodied perception (Root, Sacral, Solar Plexus, Heart, Throat, Third Eye, Crown)
- **External** — Mediation & ritual (Space, Portal, Gesture, Mirror, Narrative, Atmosphere, Feedback Loop)

**Dependencies:**
- Global Ground → Internal Root
- Global Runtime → Internal Sacral
- Global Circulation → Internal Solar Plexus
- etc.

**Decision Rationale (ADR-004):**
- Holistic coverage across all dimensions
- Dependency clarity (cross-stack dependencies explicit)
- Creative resonance (chakra mapping resonates with artists)
- Scalable (works for current and future projects)
- Language bridge (shared vocabulary between technical and creative)

**Open Brain Integration:** Phase 14 — TSM Framework Integration

**Why it matters:** For complex projects, todo lists are insufficient. TSM ensures coverage and makes dependencies explicit.

---

### 7. Remote-Native Documentation Protocols

**Source:** `idirnet/content/knowledge/notes/remote-native-open-source-development.md`

**Pivotal Insight:** Remote-native teams (like open source projects) operate differently than office teams forced remote:
- Documentation is primary; meetings are secondary
- Decisions are recorded; rationale is preserved
- Async is default; sync is escalation
- Single source of truth in git (markdown)

**Core principles:**
1. **Transparency** — decisions public by default
2. **Meritocracy** — contribution quality determines influence
3. **Asynchronous communication** — depth over speed

**Key practices:**
- Documentation-first decision making (ADRs)
- Async handoff protocols (status + context in writing)
- Explicit availability norms (working hours documented)
- Meeting notes mandatory (if not captured, didn't happen)

**Open Brain Integration:** Phase 15 — Remote-Native Documentation Protocol

**Why it matters:** Synchronous communication doesn't scale across timezones and doesn't create organizational memory.

---

### 8. RACI Decision Matrix

**Source:** `idirnet/content/knowledge/notes/idirnet-operating-model.md`

**Pivotal Insight:** Clear decision rights prevent bottlenecks:
- **R**esponsible — Does the work
- **A**ccountable — Owns outcome (single point)
- **C**onsulted — Provides input
- **I**nformed — Kept in loop

**Decision speed protocol observed:**
- Tier 1 (Same day): Day-to-day operational
- Tier 2 (48h): Cross-domain, client changes
- Tier 3 (1 week): Strategic, process changes
- Tier 4 (2+ weeks): Major investments, hiring

**Application to Open Brain:** Codify decision rights for AI-assisted workflows (when does human decide vs AI decide?).

---

### 9. Network Strategy & Core-Periphery Model

**Source:** `idirnet/content/knowledge/notes/idirnet-network-strategy.md`

**Pivotal Insight:** Distributed teams naturally form core-periphery structures:
- **Core** — 3-15 people, majority of decisions
- **Periphery** — Focused, time-limited engagements

**Network tiers:**
- Warm/Active (verified, recent contact)
- Warm/Dormant (prior relationship, needs reactivation)
- Cold/Aspirational (target list only)

**Application to Open Brain:** Design for core team (Kev) + extended network (Kris, Laura, Jochem, Colm) + aspirational (future team members).

---

### 10. Systems Stack Design

**Source:** `idirnet/content/knowledge/notes/idirnet-operating-model.md` (Systems Stack section)

**Pivotal Insight:** Intentional tool selection with integration map:

| Layer | Primary Tool | Cost |
|-------|--------------|------|
| Communication | Slack Pro | €40/mo |
| Project Management | Notion Team | €50/mo |
| Financial | Xero | €30/mo |
| Documents | Google Workspace | €30/mo |
| Design | Figma + Miro | €60/mo |
| Development | GitHub + Vercel | €20/mo |
| **Total** | | **~€230/mo** |

**Integration principle:** Tools should talk to each other. Changes in one propagate to others.

**Application to Open Brain:** Document the Open Brain systems stack and integration patterns.

---

## Mapping to Open Brain Phases

| idirnet Pattern | Open Brain Phase | Status |
|-----------------|------------------|--------|
| Document types (Zettelkasten) | Phase 9: Document Type System | NEW |
| Frontmatter schema | Phase 10: Frontmatter Schema | NEW |
| 4-tier access control (ADR-005) | Phase 11: 4-Tier Access Control | NEW |
| Request tracking | Phase 12: Request/Project Tracking | NEW |
| Knowledge graph (MOCs, wikilinks) | Phase 13: Knowledge Graph | NEW |
| TSM framework (ADR-004) | Phase 14: TSM Framework | NEW |
| Remote-native protocols | Phase 15: Remote-Native Protocol | NEW |

---

## Files Created/Updated

### Updated
- `~/OPENBRAIN/openBrain/ROADMAP.md` — Added Phases 9-15

### Created
- `~/OPENBRAIN/openBrain/PLAYBOOK.md` — Field guide for knowledge capture, organization, and action
- `~/OPENBRAIN/openBrain/IDIRNET_EXTRACTION_SUMMARY.md` — This document

---

## Next Steps

1. **Review** the new phases (9-15) in ROADMAP.md
2. **Prioritize** which phase to implement next
3. **Validate** document types and frontmatter schema with actual usage
4. **Iterate** on the playbook as Open Brain evolves

---

## Source References

**Key idirnet documents reviewed:**

| Document | Key Contribution |
|----------|------------------|
| `docs/adr/adr-001-nextjs.md` | Decision record pattern |
| `docs/adr/adr-004-tsm.md` | TSM framework adoption |
| `docs/adr/adr-005-access-control.md` | 4-tier access model |
| `docs/tsm-framework.md` | Complete TSM documentation (21 nodes) |
| `knowledge/notes/idirnet-operating-model.md` | RACI matrix, systems stack, meeting cadence |
| `knowledge/notes/idirnet-network-strategy.md` | Core-periphery model, network tiers |
| `knowledge/notes/remote-native-open-source-development.md` | Documentation-first protocols |
| `50-Templates/*.md` | Document type taxonomy |
| `requests/*.md` | Request format with acceptance criteria |
| `30-Structure/MOC-*.md` | Structure notes, knowledge graph |

---

*This extraction represents architectural learning from idirnet's 275+ documents, applied to Open Brain's next evolution.*
