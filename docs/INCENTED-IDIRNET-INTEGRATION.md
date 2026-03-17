# Incented + idirnet Knowledge Capture Integration

**Purpose:** Token-based incentive alignment for idirnet's knowledge capture and TSM framework  
**Source:** https://docs.incented.co/  
**Integrated:** March 17, 2026

---

## Overview

idirnet operates as a knowledge-intensive creative organization using the Triple Stack Model (TSM) framework. The challenge: how do we incentivize quality knowledge contributions from 5 core team members + 40+ network collaborators across 21 TSM nodes?

Incented provides the mechanism: **conviction voting with economic stakes** creates filtering and alignment without centralized gatekeeping.

---

## Why Incented Fits idirnet

### Current Knowledge Capture Challenges

| Challenge | idirnet Context | Incented Solution |
|-----------|-----------------|-------------------|
| **Quality variance** | 40+ network contributors, inconsistent depth | Staked voting filters for quality |
| **TSM coverage gaps** | Some nodes over-documented, others sparse | Targeted bounties for under-covered nodes |
| **Contributor recognition** | Hard to track who contributed what | On-chain attribution + rewards |
| **Review bottleneck** | Kev/Laura become review chokepoints | Distributed conviction voting |
| **Knowledge silos** | Each stack has its own language | Cross-stack submission incentives |

### Core Principle

> "When your money is at stake, you pay attention. You read the submissions. You think before clicking."

This applies equally to knowledge work: when reviewers stake tokens on knowledge quality, they engage more deeply with submissions.

---

## idirnet-Specific Incentive Program Design

### Program Type: Knowledge Bounty System

```
┌─────────────────────────────────────────────────────────────────┐
│              IDIRNET KNOWLEDGE BOUNTY PROGRAM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BOUNTY CATEGORIES:                                              │
│  ─────────────────                                               │
│  • TSM Node Deep Dives (21 nodes)                               │
│  • Literature Notes (academic sources)                          │
│  • Project Documentation (Lightheart, CCC, etc.)                │
│  • ADR (Architecture Decision Records)                          │
│  • Research Synthesis (policy, technology, creative)            │
│  • Member Profiles (network expansion)                          │
│                                                                  │
│  TOKEN DESIGN:                                                   │
│  ─────────────                                                   │
│  • Award Token: IDIR (utility token for bounty payouts)         │
│  • Voting Token: KNOW (governance + conviction staking)         │
│  • Award Pool: 50,000 IDIR per quarter                          │
│  • Voting Pool: 10,000 KNOW per quarter                         │
│                                                                  │
│  SELECTION: Top 5 submissions per cycle                         │
│  SLASH: 10% for incorrect votes                                 │
│  CYCLE: 30 days submission, 7 days voting                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### TSM Node Bounty Mapping

Each TSM node becomes a bounty category. Coverage gaps identified through TSM dashboard trigger increased rewards for under-covered nodes.

| Stack | Plane | Node | Current Coverage | Bounty Multiplier |
|-------|-------|------|------------------|-------------------|
| Global | Ground | Infrastructure | ✅ Complete | 1x |
| Global | Runtime | Media Systems | ✅ Complete | 1x |
| Global | Circulation | Visitor Flow | ⚠️ Partial | 2x |
| Global | Channels | Permissions | ⚠️ Partial | 2x |
| Global | Frames | Legibility | ✅ Complete | 1x |
| Global | Roles | Staffing | ⚠️ Partial | 2x |
| Global | Horizons | Governance | ✅ Complete | 1x |
| Internal | Root | Physical Grounding | ❌ Sparse | 3x |
| Internal | Sacral | Creativity | ❌ Sparse | 3x |
| Internal | Solar Plexus | Agency | ❌ Sparse | 3x |
| Internal | Heart | Connection | ⚠️ Partial | 2x |
| Internal | Throat | Articulation | ✅ Complete | 1x |
| Internal | Third Eye | Perception | ❌ Sparse | 3x |
| Internal | Crown | Integration | ❌ Sparse | 3x |
| External | Space | Spatial Grid | ⚠️ Partial | 2x |
| External | Portal | Entry/Exit | ⚠️ Partial | 2x |
| External | Gesture | Interaction | ❌ Sparse | 3x |
| External | Mirror | Reflection | ❌ Sparse | 3x |
| External | Narrative | Story | ✅ Complete | 1x |
| External | Atmosphere | Ambiance | ⚠️ Partial | 2x |
| External | Feedback Loop | Adaptation | ❌ Sparse | 3x |

**Coverage Status Legend:**
- ✅ Complete = 3+ permanent notes, 1+ deep dive
- ⚠️ Partial = 1-2 permanent notes
- ❌ Sparse = No permanent notes yet

---

## Knowledge Capture Templates for Incented

### Template 1: TSM Node Deep Dive

```markdown
---
title: "TSM Deep Dive: [Node Name]"
description: "Comprehensive analysis of the [Stack] [Plane] node"
type: permanent
author: "[Submitter]"
tsm_stack: [global|internal|external]
tsm_plane: [plane-name]
tsm_node: [stack-plane]
bounty_category: "tsm-deep-dive"
related:
  - "docs/tsm-framework"
  - "knowledge/notes/[related-note]"
---

# TSM Deep Dive: [Node Name]

## Node Definition
- **Stack:** [Global/Internal/External]
- **Plane:** [Plane name]
- **Dependencies:** [What must complete before this node?]
- **Unlocks:** [What does this node enable?]

## Academic Foundations
| Source | Key Concept | Application to idirnet |
|--------|-------------|------------------------|
| [Author, Title] | [Core concept] | [How it applies] |

## Current State Assessment
- **Lightheart Status:** [Not started / In progress / Complete]
- **idirnet Status:** [Not started / In progress / Complete]
- **Key Deliverables:** [List]

## Design Principles
1. [Principle 1 with TSM context]
2. [Principle 2 with TSM context]
3. [Principle 3 with TSM context]

## Implementation Notes
- [Technical or practical considerations]
- [Common pitfalls]
- [Success metrics]

## Related Nodes
- **Upstream:** [Dependencies]
- **Downstream:** [What this unlocks]
- **Cross-stack:** [Related nodes in other stacks]
```

**Award Criteria:**
- Completeness of academic foundations (30%)
- Clarity of design principles (25%)
- Actionable implementation notes (25%)
- Cross-node relationship mapping (20%)

### Template 2: Literature Note

```markdown
---
title: "[Author] - [Title] ([Year])"
description: "Key concepts and idirnet applications"
type: literature
source_author: "[Author]"
source_title: "[Title]"
source_year: [YYYY]
source_url: "[URL if available]"
bounty_category: "literature-note"
tags: [academic, [discipline], [relevant-tsm-node]]
---

# [Author] - [Title] ([Year])

## Core Argument
[1-2 paragraph summary in your own words]

## Key Concepts
| Concept | Definition | idirnet Application |
|---------|------------|---------------------|
| [Concept 1] | [Definition] | [How we apply this] |
| [Concept 2] | [Definition] | [How we apply this] |

## Critical Assessment
- **Strengths:** [What's valuable]
- **Limitations:** [What's missing or problematic]
- **Relevance:** [High/Medium/Low for idirnet]

## TSM Mapping
- **Primary Node:** [TSM node]
- **Secondary Nodes:** [Related nodes]
- **Stack Alignment:** [Global/Internal/External]

## Action Items
- [ ] [Specific action this literature suggests]
```

**Award Criteria:**
- Accurate representation of source (30%)
- Clear idirnet application (35%)
- Critical assessment depth (20%)
- TSM mapping accuracy (15%)

### Template 3: ADR (Architecture Decision Record)

```markdown
---
title: "ADR-[NNN]: [Decision Title]"
description: "Architecture decision for [system/component]"
type: structure
status: proposed | accepted | deprecated | superseded
date: "YYYY-MM-DD"
deciders: [name1, name2]
bounty_category: "adr"
---

# ADR-[NNN]: [Decision Title]

## Status
[proposed | accepted | deprecated | superseded by ADR-XXX]

## Context
[What is the issue we're deciding?]

## Options Considered

### Option A: [Name]
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Effort:** [High/Medium/Low]

### Option B: [Name]
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Effort:** [High/Medium/Low]

## Decision
[What we decided and why]

## Consequences
### Positive
- [Benefit 1]
- [Benefit 2]

### Negative / Trade-offs
- [Cost 1]
- [Cost 2]

## Related
- [Links to related ADRs, specs, etc.]
```

**Award Criteria:**
- Clear context statement (20%)
- Balanced option analysis (30%)
- Explicit decision rationale (25%)
- Honest consequence assessment (25%)

---

## Voting Process for Knowledge Work

### Voter Eligibility

| Tier | Requirement | Voting Weight |
|------|-------------|---------------|
| **Core Team** | Kev, Laura, Jochem, Kris, Colm | 1.5x |
| **Network Contributors** | 3+ accepted submissions | 1.2x |
| **Active Contributors** | 1+ accepted submission | 1.0x |
| **Token Holders** | KNOW staked | 0.8x |

### Vote Correctness Definition

For knowledge submissions, "correctness" is assessed against:

1. **Accuracy** — Facts are correct, sources properly cited
2. **Completeness** — Template fields are fully populated
3. **Actionability** — Content enables decisions or actions
4. **TSM Alignment** — Properly mapped to TSM framework

**Correct Vote:**
- Voting FOR a submission that meets all 4 criteria
- Voting AGAINST a submission that fails 2+ criteria

**Incorrect Vote (Slashed):**
- Voting FOR a submission that fails 2+ criteria
- Voting AGAINST a submission that meets all 4 criteria

### Review Checklist

```markdown
## Knowledge Submission Review

**Submission:** [Title] by [Author]
**Category:** [TSM/Literature/ADR/etc.]
**Reviewer:** [Your name]

### Accuracy
- [ ] Facts are correct and verifiable
- [ ] Sources properly cited
- [ ] No misleading claims

### Completeness
- [ ] All template fields populated
- [ ] Required sections present
- [ ] No obvious gaps

### Actionability
- [ ] Enables decisions or actions
- [ ] Clear next steps or implications
- [ ] Not just descriptive

### TSM Alignment
- [ ] Correctly mapped to nodes
- [ ] Cross-stack relationships noted
- [ ] Consistent with framework

### Overall Assessment
- [ ] APPROVE — Meets all criteria
- [ ] REJECT — Fails 2+ criteria

**Conviction Stake:** [Amount] KNOW
**Reasoning:** [Brief explanation]
```

---

## Settlement for Knowledge Bounties

### Award Distribution (Top 5)

| Rank | Award % | KNOW Multiplier |
|------|---------|-----------------|
| 1st | 30% | 2.0x |
| 2nd | 25% | 1.5x |
| 3rd | 20% | 1.0x |
| 4th | 15% | 0.8x |
| 5th | 10% | 0.5x |

### Example Settlement

**Cycle Q1 2026:**
- Award Pool: 50,000 IDIR
- Voting Pool: 10,000 KNOW
- Slash Rate: 10%
- Submissions: 12
- Winners: 5

**Winners:**
| Rank | Submission | Author | Award | KNOW Bonus |
|------|------------|--------|-------|------------|
| 1 | TSM Deep Dive: Gesture Plane | Kev F | 15,000 IDIR | 2,000 KNOW |
| 2 | Literature: Lynch - Image of City | Laura G | 12,500 IDIR | 1,500 KNOW |
| 3 | ADR-012: Open Source Policy | Jochem vB | 10,000 IDIR | 1,000 KNOW |
| 4 | TSM Deep Dive: Root Plane | Kris B | 7,500 IDIR | 800 KNOW |
| 5 | Member Profile: Agustin Vidal | Colm H | 5,000 IDIR | 500 KNOW |

**Voter Rewards:**
- Correct voters: Share 10,000 KNOW + slash pool
- Incorrect voters: Lose 10% of stake

---

## Integration with Open Brain

### Flow: idirnet → Open Brain → Incented

```
┌─────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE FLOW PIPELINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CAPTURE              Slack #log or Raycast obc              │
│     ─────────            Open Brain ingest-thought              │
│     │                    → Classify with 19 + 8 templates       │
│     │                    → Generate embedding                   │
│     │                                                           │
│     ▼                                                           │
│  2. DEVELOP              idirnet content/ directory             │
│     ─────────            Draft → Review → Refine               │
│     │                    → TSM tagging                          │
│     │                    → Frontmatter completion               │
│     │                                                           │
│     ▼                                                           │
│  3. SUBMIT               Incented program                       │
│     ─────────            Submit polished knowledge              │
│     │                    → Bounty category selection            │
│     │                    → Stake for conviction                 │
│     │                                                           │
│     ▼                                                           │
│  4. REVIEW               Distributed voting                     │
│     ─────────            Core team + network reviewers          │
│     │                    → Stake KNOW on quality                │
│     │                    → Earn rewards for correct votes       │
│     │                                                           │
│     ▼                                                           │
│  5. SETTLE               Monthly at midnight UTC                │
│     ─────────            Winners awarded IDIR                   │
│     │                    → Correct voters rewarded              │
│     │                    → Incorrect voters slashed             │
│     │                                                           │
│     ▼                                                           │
│  6. PUBLISH              idirnet public site + CODEX            │
│     ─────────            Winning knowledge published            │
│     │                    → Attributed to contributors           │
│     │                    → Added to TSM knowledge graph         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Open Brain Template Extension

Add idirnet-specific templates to Open Brain's 19 + 8 Incented templates:

#### Layer 5: idirnet (5 Templates)

| Template | Keyword | Purpose |
|----------|---------|---------|
| **TSM Deep Dive** | `TSM:` | Comprehensive TSM node analysis |
| **Literature Note** | `Literature:` | Academic source with idirnet application |
| **ADR** | `ADR:` | Architecture decision record |
| **Research Synthesis** | `Research:` | Policy/tech/creative research synthesis |
| **Member Profile** | `Member:` | Network member capability profile |

### MCP Tool Extension

```typescript
// Add to open-brain-mcp Edge Function

{
  name: "submit_to_incented",
  description: "Submit polished knowledge to idirnet bounty program",
  parameters: {
    content_ref: "string",      // Open Brain thought ID
    bounty_category: "string",  // tsm-deep-dive | literature | adr | research | member
    requested_amount: "number", // Optional: specific bounty request
    submitter_address: "string" // IDIR token address
  }
},

{
  name: "list_idirnet_bounties",
  description: "List active idirnet knowledge bounties with multipliers",
  parameters: {
    status: "active|closed",
    stack: "global|internal|external|all"
  }
},

{
  name: "calculate_knowledge_settlement",
  description: "Calculate settlement for knowledge bounty cycle",
  parameters: {
    cycle_number: "number",
    program_id: "idirnet-knowledge-bounty"
  }
}
```

---

## Token Economics

### IDIR (Award Token)

| Property | Value |
|----------|-------|
| **Type** | ERC-20 utility token |
| **Initial Supply** | 1,000,000 IDIR |
| **Distribution** | 60% bounties, 20% team, 10% network, 10% reserve |
| **Vesting** | 4-year quarterly releases |
| **Use** | Bounty payouts, service discounts, governance |

### KNOW (Voting Token)

| Property | Value |
|----------|-------|
| **Type** | ERC-20 governance token |
| **Initial Supply** | 500,000 KNOW |
| **Distribution** | 40% reviewers, 30% team, 20% staking rewards, 10% reserve |
| **Earned By** | Correct voting, quality submissions, TSM coverage |
| **Use** | Conviction staking, governance voting, reputation signal |

### Reputation Tracking

```typescript
interface idirnetContributor {
  address: string;
  
  // Submission stats
  submissions: {
    total: number;
    accepted: number;
    rejected: number;
    win_rate: number;  // accepted / total
  };
  
  // Review stats
  reviews: {
    total: number;
    correct: number;
    accuracy: number;  // correct / total
    total_staked: number;
    total_earned: number;
  };
  
  // TSM coverage
  tsm_contributions: {
    node_id: string;
    submission_count: number;
    coverage_score: number;
  }[];
  
  // Reputation score
  reputation: {
    score: number;  // 0-100
    tier: "bronze" | "silver" | "gold" | "platinum";
    voting_weight: number;
  };
}
```

---

## Implementation Roadmap

### Phase 1: Program Setup (Month 1)
- [ ] Deploy IDIR and KNOW tokens
- [ ] Configure multisig (Safe or Squads)
- [ ] Create bounty categories in Incented
- [ ] Map TSM nodes to bounties

### Phase 2: Core Team Onboarding (Month 2)
- [ ] Distribute initial KNOW to core 5
- [ ] Practice voting on test submissions
- [ ] Submit 3+ knowledge pieces each
- [ ] First settlement run

### Phase 3: Network Expansion (Month 3)
- [ ] Invite 10 network contributors
- [ ] KNOW distribution based on past contributions
- [ ] First full cycle with network voting
- [ ] Refine slash rate and multipliers

### Phase 4: Open Brain Integration (Month 4)
- [ ] Extend ingest-thought with idirnet templates
- [ ] Add MCP tools for Incented submission
- [ ] Automated TSM tagging from content
- [ ] Dashboard widget for bounty status

### Phase 5: Full Operation (Month 5+)
- [ ] Quarterly bounty cycles
- [ ] Continuous TSM coverage improvement
- [ ] Reputation-weighted voting
- [ ] Cross-project knowledge bounties

---

## Key idirnet-Specific Insights

### TSM + Incented Alignment

The TSM's 21-node structure maps perfectly to Incented's bounty categories:
- **Coverage gaps** become **bounty multipliers**
- **Node dependencies** inform **submission sequencing**
- **Cross-stack relationships** become **review criteria**

### Knowledge Graph Incentives

Incented rewards don't just capture knowledge—they build the graph:
- Related node linking → Bonus multiplier
- Cross-stack connections → Additional reward
- Backlink completeness → Review scoring criteria

### Network Contributor Activation

The 40+ network becomes economically aligned:
- Quality contributions earn IDIR
- Quality reviews earn KNOW
- Reputation unlocks higher voting weight
- Passive contributors stay in network (no penalty)

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `docs/INCENTED-INTEGRATION.md` | Core Incented concepts |
| `docs/TSM-ORGANIZATIONAL-FRAMEWORK.md` | TSM structure |
| `docs/DATA-INTAKE-ARCHITECTURE.md` | Open Brain capture flow |
| `idirnet/content/docs/tsm-framework.md` | Full TSM documentation |

---

*Integrated for idirnet knowledge capture flow — March 17, 2026*
