# Incented + idirnet Knowledge Capture Integration

**Purpose:** Token-based incentive alignment for idirnet's knowledge capture and TSM framework  
**Source:** https://docs.incented.co/  
**Integrated:** March 17, 2026

---

## Related idirnet Documentation

This document integrates with existing idirnet Incented documentation:

| Document | Location | Purpose |
|----------|----------|---------|
| `incented-integration-summary.md` | `idirnet_ROOT/content/knowledge/notes/` | Core Incented concepts for idirnet |
| `incented-tsm-mapping.md` | `idirnet_ROOT/content/knowledge/notes/` | Detailed TSM node bounty mapping (15 nodes) |
| `token-curation-incentives.md` | `idirnet_ROOT/content/knowledge/notes/` | Token incentive structures and parameters |
| `submission-tracking-lifecycle.md` | `idirnet_ROOT/content/knowledge/notes/` | Submission workflow and lifecycle |

**id Projects Dashboard Reference:** [`idirnet_PROJECTS_MAP.md`](idirnet_ROOT/content/knowledge/notes/idirnet_PROJECTS_MAP.md)

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

### TSM-Incented Architecture

The Incented system spans all three TSM stacks:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TSM + INCENTED ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                         GLOBAL STACK                                 │     │
│  │                    (Program & Infrastructure)                        │     │
│  ├─────────────────────────────────────────────────────────────────────┤     │
│  │  BOUNTY POOL MANAGEMENT  │  INCENTIVE STRUCTURES  │  GOVERNANCE      │     │
│  │  • IDIR/KNOW allocation  │  • Award curves        │  • Voting tiers  │     │
│  │  • Monthly settlement    │  • Review rewards      │  • Slashing      │     │
│  │  • Prize pool funding    │  • Multiplier rules    │  • Dispute       │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                      │                                        │
│                                      ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                         INTERNAL STACK                               │     │
│  │                    (Contributor Experience)                          │     │
│  ├─────────────────────────────────────────────────────────────────────┤     │
│  │  SUBMISSION WORKFLOW     │  REVIEWER WORKFLOW      │  REPUTATION     │     │
│  │  • Draft → Submit → Lock │  • Stake → Vote → Claim │  • Score calc   │     │
│  │  • Template validation   │  • Conviction voting    │  • Tier levels  │     │
│  │  • Self-review required  │  • Accuracy tracking    │  • Weight decay │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                      │                                        │
│                                      ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                         EXTERNAL STACK                               │     │
│  │                    (Output & Recognition)                            │     │
│  ├─────────────────────────────────────────────────────────────────────┤     │
│  │  WINNER RECOGNITION      │  KNOWLEDGE PUBLISHING   │  NETWORK GROWTH  │     │
│  │  • Prize distribution    │  • CODEX integration    │  • Member invites│     │
│  │  • Contributor badges    │  • Permanent notes      │  • Reputation    │     │
│  │  • Leaderboards          │  • Cross-linking        │  • Onboarding    │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Three Core Incented Components

Based on idirnet's integration design:

### 1. Voter Incentives (KNOW Token)

**Purpose:** Motivate high-quality, thoughtful review of knowledge submissions

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Base stake per vote** | 10 KNOW | Significant enough to matter, not prohibitive |
| **Correct vote reward** | 15 KNOW (1.5x) | 50% profit margin for accuracy |
| **Slashing penalty** | 5 KNOW (50%) | Loss aversion: losing half stings more than winning half |
| **Voting period** | 7 days | Enough time for thorough review |
| **Minimum voters** | 5 per submission | Statistical significance |

**Voting Tiers (Reputation Multipliers):**

```typescript
const VOTING_TIERS = {
  core:      { multiplier: 1.5,  min_accuracy: 0.85, min_reviews: 20 },
  network:   { multiplier: 1.2,  min_accuracy: 0.75, min_reviews: 10 },
  active:    { multiplier: 1.0,  min_accuracy: 0.65, min_reviews: 5 },
  holders:   { multiplier: 0.8,  min_accuracy: 0.50, min_reviews: 0 }
};
```

### 2. Submission Tracking Lifecycle

**Status Flow:**

```
DRAFT → SUBMITTED → IN_REVIEW → [SELECTED | NOT_SELECTED] → [SETTLED | CLAIMED]
                                              ↓
                                        DISPUTED → ARBITRATION
```

| Status | Description | Duration |
|--------|-------------|----------|
| `DRAFT` | Creator editing, not yet finalized | Unlimited |
| `SUBMITTED` | Locked for review, stake required to unlock | 7 days |
| `IN_REVIEW` | Under active voting | 7 days |
| `SELECTED` | Top submissions for the cycle | Immediate |
| `NOT_SELECTED` | Did not make top tier | Immediate |
| `SETTLED` | Rewards distributed, on-chain recorded | Monthly |
| `CLAIMED` | Winner has withdrawn funds | Post-settlement |
| `DISPUTED` | Challenge raised, under arbitration | +3 days |

### 3. Program Management (IDIR Token)

**Award Pool Distribution (Monthly):**

```
┌────────────────────────────────────────────────────────┐
│           MONTHLY IDIR AWARD POOL (~50,000)            │
├────────────────────────────────────────────────────────┤
│  Top Winner:        30%  (~15,000 IDIR)               │
│  2nd Place:         20%  (~10,000 IDIR)               │
│  3rd Place:         15%  (~7,500 IDIR)                │
│  4th Place:         10%  (~5,000 IDIR)                │
│  5th Place:          8%  (~4,000 IDIR)                │
│  Reviewer Rewards:  12%  (~6,000 IDIR)                │
│  Program Reserve:    5%  (~2,500 IDIR)                │
└────────────────────────────────────────────────────────┘
```

**Coverage-Driven Multipliers:**

```typescript
const COVERAGE_MULTIPLIERS = {
  complete:  1.0,   // ✅ 3+ notes exist
  partial:   1.5,   // ⚠️ 1-2 notes exist
  sparse:    2.0    // ❌ No notes yet
};

// Example: TSM Deep Dive for "Gesture" node (sparse coverage)
// Base award: 15,000 IDIR × 2.0 multiplier = 30,000 IDIR
```

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

## Workflow Example: TSM Node Bounty

**Scenario:** New contributor "Jordan" discovers idirnet and wants to contribute

```
WEEK 1: Discovery & Preparation
─────────────────────────────────────────────────────────────
Day 1   Jordan explores TSM graph, notices "Gesture" node is sparse
Day 2   Reads existing documentation on Portal, Mirror nodes
Day 3   Researches academic sources on embodied interaction
Day 4   Drafts TSM Deep Dive using template
Day 5   Self-review against award criteria checklist
Day 6   Finalizes, locks submission (100 KNOW stake required)
Day 7   Submission enters IN_REVIEW status

WEEK 2: Review & Voting
─────────────────────────────────────────────────────────────
Day 8   5 network members begin reviewing (stake 10 KNOW each)
Day 9   Conviction votes accumulate: 3 FOR, 1 AGAINST, 1 ABSTAIN
Day 10  Reviewer discussion on Discord #incented-review
Day 11  Vote momentum shifts toward FOR
Day 12  Final votes tallied
Day 13  Voting closes, Jordan's submission SELECTED
Day 14  Submissions aggregated for monthly settlement

WEEK 3: Settlement & Recognition
─────────────────────────────────────────────────────────────
Day 15  Monthly settlement: Jordan's submission ranks #2
Day 16  Award calculation: 10,000 IDIR × 2.0 coverage = 20,000 IDIR
Day 17  Rewards distributed on-chain
Day 18  Winning submission published to CODEX
Day 19  Jordan receives "TSM Contributor" Discord badge
Day 20  Jordan's reputation score increases (+50 points)
Day 21  Jordan invited to #core-contributors channel

WEEK 4: Ongoing Engagement
─────────────────────────────────────────────────────────────
Day 22  Jordan stakes KNOW to review next cycle's submissions
Day 23  Jordan votes on 3 submissions, achieves 2/3 accuracy
Day 24  Jordan earns 30 KNOW from correct votes (receives 15, loses 5)
Day 25  Jordan begins second TSM Deep Dive on "Feedback Loop"
Day 26  Jordan refers colleague Alex to join network
Day 27  Alex submits first Literature Note
Day 28  New cycle begins...
```

---

## Implementation Roadmap

### Month 1: Foundation
| Week | Task | Owner | Output |
|------|------|-------|--------|
| 1 | Token contract deployment (IDIR, KNOW) | Dev | Contracts on Solana devnet |
| 2 | Multisig setup (Safe/Squads) | Kev/Laura | 3-of-5 wallet configured |
| 3 | Bounty program launch announcement | Comms | Discord announcement, email |
| 4 | Template finalization | Content | 5 templates in `/templates/` |

### Month 2: Pilot Program
| Week | Task | Owner | Output |
|------|------|-------|--------|
| 5 | First submission cycle opens | Ops | 10+ submissions received |
| 6 | Reviewer onboarding | Community | 15+ active reviewers |
| 7 | First voting cycle | Community | 5+ submissions selected |
| 8 | First settlement & retrospectives | All | Lessons learned documented |

### Month 3: Scaling
| Week | Task | Owner | Output |
|------|------|-------|--------|
| 9 | Program refinements based on feedback | Ops | Updated parameters |
| 10 | Integration with CODEX pipeline | Dev | Automated publishing |
| 11 | Cross-project bounties (Lightheart collaboration) | Partnerships | Joint bounty program |
| 12 | Quarterly review & roadmap update | All | Q2 plan finalized |

---

## Related Documents

### Open Brain Documentation
| Document | Purpose |
|----------|---------|
| `docs/INCENTED-INTEGRATION.md` | Core Incented concepts |
| `docs/TSM-ORGANIZATIONAL-FRAMEWORK.md` | TSM structure |
| `docs/DATA-INTAKE-ARCHITECTURE.md` | Open Brain capture flow |

### idirnet Content Documentation
| Document | Location | Purpose |
|----------|----------|---------|
| `incented-integration-summary.md` | `content/knowledge/notes/` | Core Incented integration concepts |
| `incented-tsm-mapping.md` | `content/knowledge/notes/` | Detailed TSM node mapping (15 nodes) |
| `token-curation-incentives.md` | `content/knowledge/notes/` | Token incentive structures |
| `submission-tracking-lifecycle.md` | `content/knowledge/notes/` | Submission workflow |
| `idirnet_PROJECTS_MAP.md` | `content/knowledge/notes/` | Active project tracking |
| `tsm-framework.md` | `content/docs/` | Full TSM documentation |

---

*Integrated for idirnet knowledge capture flow — March 17, 2026*

**Version:** 1.1 (Aligned with idirnet content knowledge base)
