# Open Brain: TSM Organizational Framework

How captured data is organized and presented.

---

## Principle

Data enters Open Brain through intake channels (see DATA-INTAKE-ARCHITECTURE.md). The Triple Stack Model (TSM) is the organizational lens that gives that data meaning, position, and relationship to everything else.

Two classification dimensions work together:

1. **Template** answers: *What is this about?* (topic domain)
2. **TSM position** answers: *Where does this sit in the world?* (ontological position)

A budget note is a "Budget" template (topic = finance). Its TSM position is Global/Ground (infrastructure, economics). That positioning connects it to other Global/Ground items like contracts, equipment costs, and resource allocation, even though those use different templates.

---

## The Triple Stack Model

From Kev's MPhil thesis. Three stacks, each with seven planes. 21 nodes total.

```
┌─────────────────────────────────────────────────────────────────┐
│                       GLOBAL STACK                              │
│              Infrastructure and Collective Systems               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Ground      Economics, material resources, funding             │
│  Runtime     Institutions, governance, operational systems      │
│  Circulation Information flow, communication channels           │
│  Channels    Platforms, tools, distribution networks            │
│  Frames      Culture, values, shared meaning                    │
│  Roles       Power structures, team roles, org charts           │
│  Horizons    Vision, strategy, long-term direction              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      INTERNAL STACK                             │
│              Embodied Experience and Perception                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Root        Body, physical space, presence                     │
│  Sacral      Emotion, intuition, felt sense                     │
│  Solar Plexus Perception, attention, awareness                  │
│  Heart       Discourse, dialogue, connection                    │
│  Throat      Expression, articulation, voice                    │
│  Third Eye   Insight, pattern recognition, synthesis            │
│  Crown       Will, intention, agency                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL STACK                             │
│              Mediation, Tools, and Interfaces                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Space       Artefacts, physical objects, materials             │
│  Portal      Entry points, interfaces, access mechanisms        │
│  Gesture     Interaction design, user experience                │
│  Mirror      Reflection, feedback, evaluation                   │
│  Narrative   Storytelling, documentation, knowledge sharing     │
│  Atmosphere  Environment, mood, context setting                 │
│  Feedback Loop  Iteration, learning, adaptation                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## How TSM Organizes Open Brain Data

### Template-to-TSM Mapping

Every template has a natural TSM home. This is not rigid. A decision about infrastructure lives in Global/Ground. A decision about team culture lives in Global/Frames.

| Template | Primary TSM Position | Why |
|----------|---------------------|-----|
| Decision | Global/Horizons | Decisions shape direction |
| Risk | Global/Horizons | Risks threaten direction |
| Milestone | Global/Runtime | Milestones mark operational progress |
| Spec | External/Portal | Specs define interfaces |
| Meeting | Internal/Heart | Meetings are discourse |
| Person Note | Internal/Sacral | People notes are relational |
| Stakeholder | External/Gesture | Stakeholder mgmt is interaction design |
| Sent | Internal/Throat | Sending is expression |
| Budget | Global/Ground | Money is infrastructure |
| Invoice | Global/Ground | Billing is infrastructure |
| Funding | Global/Ground | Grants are infrastructure |
| Legal | Global/Runtime | Law is governance |
| Compliance | Global/Runtime | Regulation is governance |
| Contract | Global/Ground | Contracts are material agreements |
| Insight | Internal/Third Eye | Insights are pattern recognition |
| AI Save | External/Narrative | AI outputs are documented knowledge |
| Nutrition | Internal/Root | Food is body |
| Health | Internal/Root | Health is body |
| Home | External/Space | Home is physical space |

### What This Enables

**Cluster discovery.** All Global/Ground items (Budget, Invoice, Funding, Contract) cluster together regardless of template. A risk about funding connects to the budget, which connects to the contract.

**Cross-stack insight.** An insight (Internal/Third Eye) about a stakeholder relationship (External/Gesture) that affects a budget decision (Global/Ground) creates a three-stack thread. The TSM makes this visible.

**Gap detection.** If Global/Frames (culture, values) has zero entries, the team is not documenting its cultural decisions. The TSM grid reveals blind spots.

---

## Presentation Layer

The TSM organizes how data appears in three output contexts:

### 1. Morning Briefing Dashboard

Groups today's items by urgency, but sidebar shows TSM distribution. Reveals which stacks are active today.

### 2. Weekly Review

Organizes the week's captures by TSM stack. Shows: which stacks got attention, which were neglected, where cross-stack connections emerged.

### 3. Knowledge Graph (Phase 13)

TSM positions become nodes in a force-directed graph. Items cluster by stack and plane. Edges show `related`, `derives_from`, `supports`, `contradicts` relationships.

---

## The Two Dimensions Together

```
                    TEMPLATE (What is this about?)
                    ─────────────────────────────────
                    Decision  Risk  Budget  Insight  ...

TSM POSITION        ┌────────┬─────┬───────┬────────┐
(Where does it sit?)│        │     │       │        │
                    │        │     │       │        │
Global/Ground       │        │     │  ██   │        │  Budget lives here
Global/Horizons     │  ██    │ ██  │       │        │  Decisions and Risks
Internal/Third Eye  │        │     │       │  ██    │  Insights live here
Internal/Heart      │        │     │       │        │  Meetings live here
External/Portal     │        │     │       │        │  Specs live here
                    └────────┴─────┴───────┴────────┘
```

Template tells you the **type** of knowledge.
TSM tells you the **position** of that knowledge in the world.

Both are needed. A list of decisions is useful. A map of decisions positioned across infrastructure, embodied experience, and mediation is transformative.

---

## 4-Tier Access Control

Orthogonal to both template and TSM. Controls who sees what.

| Tier | Visibility | Example |
|------|------------|---------|
| Public | Anyone | Project descriptions, philosophy |
| Network | Extended network | Meeting notes, member profiles |
| Team | Core idirnet | Contracts, budgets, internal decisions |
| Leadership | Kev + Laura | Strategy, personnel, negotiations |

Access is enforced at the database level (Row Level Security). Unauthorized requests return 404, not 403.

---

## Summary

```
DATA IN          →  CLASSIFICATION  →  ORGANIZATION    →  PRESENTATION

5 intake channels    19 templates       TSM (21 nodes)     Dashboard
(Slack, Meet,        (topic domain)     (ontological       Weekly Review
 MCP, Gemini,                           position)          Knowledge Graph
 Manual)             6 doc types        4 access tiers
                     (knowledge stage)
```

*Data enters through intake channels (DATA-INTAKE-ARCHITECTURE.md).*
*Data is organized through the TSM lens (this document).*
*Together they form the Open Brain protocol.*
