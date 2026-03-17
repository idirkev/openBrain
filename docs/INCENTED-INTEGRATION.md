# Incented Core Concepts Integration

**Source:** https://docs.incented.co/core-concepts  
**Integrated:** March 17, 2026  
**Purpose:** Token-based conviction voting system for incentive programs

---

## Overview

Incented is a conviction voting mechanism that uses real token stakes to ensure quality decision-making. When participants vote, they stake tokens with real economic consequences:

- **Vote correctly** → Earn rewards from the voting pool + share of slashed tokens
- **Vote incorrectly** → Lose a percentage of stake

This creates a filtering mechanism where participants pay attention, read submissions, and think before voting.

---

## Core Concepts Mapping

### Terminology Reference

| Term | Definition | Open Brain Mapping |
|------|------------|-------------------|
| **Incentive Program** | Configured funding program with award pool, voting pool, and rules | `incentive_program` metadata type |
| **Cycle** | Submission + voting period within a program | `cycle` field in program metadata |
| **Award Token** | Token used to pay winning submissions | Tracked in `metadata.tokens.award` |
| **Voting Token** | Token staked by voters for rewards/slashing | Tracked in `metadata.tokens.voting` |
| **Award Pool** | Total tokens available for winning submissions | `metadata.pools.award` |
| **Voting Pool** | Total tokens available to reward correct voters | `metadata.pools.voting` |
| **Slash Percentage** | Percentage of stake lost by incorrect voters | `metadata.rules.slash_pct` |
| **Conviction** | Strength of vote expressed by stake amount | `metadata.vote.conviction` |
| **Net Votes** | FOR votes minus AGAINST votes | Calculated field |
| **Winner Selection** | Method to determine winners (Top X or Quorum) | `metadata.rules.selection_method` |
| **Settlement** | Process of calculating and distributing rewards | `metadata.status.settlement` |
| **Multisig** | Multi-signature wallet for transaction approval | `metadata.governance.multisig` |

---

## New Template Layer: Incented

Add to Open Brain's 19 templates (3 layers → 4 layers):

### Layer 4: Incented (8 Templates)

| Template | Keyword | Purpose |
|----------|---------|---------|
| **Program** | `Program:` | Define new incentive program parameters |
| **Submission** | `Submission:` | Submit work to a program cycle |
| **Vote** | `Vote:` | Record voting decision with conviction |
| **Cycle Start** | `Cycle:` | Begin new submission/voting cycle |
| **Settlement** | `Settle:` | Trigger reward distribution |
| **Pool** | `Pool:` | Update or configure token pools |
| **Rule Change** | `Rule:` | Modify program parameters |
| **Slash Appeal** | `Appeal:` | Challenge slashing decision |

---

## Metadata Schema Extension

### New Metadata Structure for Incented Captures

```typescript
// Incentive Program metadata
interface IncentiveProgramMetadata {
  template: "incented";
  subtype: "program" | "submission" | "vote" | "cycle" | "settlement" | "pool" | "rule" | "appeal";
  program?: {
    id: string;
    name: string;
    status: "draft" | "active" | "paused" | "closed";
  };
  tokens?: {
    award: string;      // Token contract/identifier
    voting: string;     // Token contract/identifier
  };
  pools?: {
    award: number;      // Total award pool size
    voting: number;     // Total voting pool size
    distributed: number;
  };
  rules?: {
    slash_pct: number;           // 0-100
    selection_method: "top_x" | "quorum";
    quorum_threshold?: number;   // For quorum-based
    top_x_count?: number;        // For Top X selection
    min_stake: number;           // Minimum voting stake
    cycle_duration_days: number;
  };
  cycle?: {
    number: number;
    phase: "submission" | "voting" | "settlement";
    start_date: string;
    end_date: string;
  };
  vote?: {
    submission_id: string;
    direction: "for" | "against";
    conviction: number;          // Stake amount
    voter: string;
  };
  submission?: {
    id: string;
    submitter: string;
    title: string;
    content_ref: string;         // Link to full content
    net_votes: number;
    status: "pending" | "winner" | "rejected";
  };
  settlement?: {
    cycle_number: number;
    winners: string[];           // Submission IDs
    total_awarded: number;
    voters_rewarded: number;
    total_slashed: number;
  };
  governance?: {
    multisig: string;
    signers: string[];
    required_signatures: number;
  };
}
```

---

## Capture Examples

### Program Definition
```
Program: Developer Bounty Q2 2026
Award Pool: 50,000 USDC
Voting Pool: 10,000 USDC
Slash: 10%
Selection: Top 5 submissions
Min Stake: 100 VOTE tokens
Cycle: 14 days submission, 7 days voting
Multisig: 0xABC...XYZ (3/5)
```

### Submission
```
Submission: Developer Bounty Q2 2026 - Cycle 1
Title: Open Brain Reclaim Integration
Submitter: kevfreeney
Content: Full implementation of smart scheduler...
Links: github.com/.../pr-123
```

### Vote
```
Vote: Developer Bounty Q2 2026 - Submission #42
Direction: FOR
Conviction: 500 VOTE tokens
Reasoning: Well-documented, solves real problem...
```

### Cycle Management
```
Cycle: Developer Bounty Q2 2026 - Cycle 2
Phase: submission
Start: 2026-04-01
End: 2026-04-14
Status: active
```

### Settlement
```
Settle: Developer Bounty Q2 2026 - Cycle 1
Winners: [42, 15, 23, 8, 31]
Award Distribution: 20k, 15k, 8k, 4k, 3k
Voter Rewards: 8,500 distributed
Slashed: 1,500 (15 voters)
```

---

## Settlement Process Deep Dive

**Source:** https://docs.incented.co/program-managers/settlement

Settlement automatically calculates winners, payouts, and voting rewards when a voting period ends.

### Settlement Timing

- **Runs automatically:** Daily at midnight UTC
- **Processes:** All cycles that finished voting but haven't been settled
- **Scope:** All eligible cycles across all programs in a single run

### 7-Step Settlement Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    SETTLEMENT WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DETERMINE WINNERS                                            │
│     ─────────────────                                            │
│     Top X: Sort by net votes (FOR - AGAINST), select top X       │
│     Quorum: FOR ÷ total votes ≥ quorum threshold                 │
│     Tie-breaker: Unique voter count                              │
│                                                                  │
│  2. CALCULATE AWARDS                                             │
│     ─────────────────                                            │
│     Fixed: Each winner gets configured amount                    │
│     Split Equal: Pool ÷ winner count                             │
│     Split Proportional: By relative vote share                   │
│     Milestone: Sum of approved milestone budgets                 │
│                                                                  │
│  3. DETERMINE VOTE CORRECTNESS                                   │
│     ──────────────────────────                                   │
│     Correct: FOR winner OR AGAINST loser                         │
│     Incorrect: FOR loser OR AGAINST winner                       │
│                                                                  │
│  4. APPLY SLASHING                                               │
│     ────────────────                                             │
│     Incorrect voters lose % of stake (configurable)              │
│     Slashed tokens → slash pool                                  │
│                                                                  │
│  5. DISTRIBUTE VOTING REWARDS                                    │
│     ─────────────────────────                                    │
│     Correct voters share: voting pool + slash pool               │
│     Proportional to stake amount                                 │
│                                                                  │
│  6. CREATE TRANSACTIONS                                          │
│     ───────────────────                                          │
│     Awards → winners                                             │
│     Rewards → correct voters                                     │
│     Stake returns → all voters (minus slash)                     │
│                                                                  │
│  7. QUEUE FOR MULTISIG                                           │
│     ──────────────────                                           │
│     Auto-distribution: Queue in Safe/Squads                      │
│     Manual: Create with "pending" status for review              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Winner Selection Logic

| Method | Calculation | Tie Breaker |
|--------|-------------|-------------|
| **Top X** | Net votes (FOR - AGAINST), sort descending | Unique voter count |
| **Quorum** | Approval rate (FOR ÷ total) ≥ threshold | Positive net votes required |

### Award Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Fixed** | Each winner gets configured amount | Standard bounties |
| **Split Equal** | Award pool ÷ winner count | Equal recognition |
| **Split Proportional** | By relative vote share | Merit-based distribution |
| **Milestone** | Sum of approved milestone budgets | Project-based funding |

### Vote Correctness Rules

| Vote | Submission Result | Correctness |
|------|-------------------|-------------|
| FOR | Winner | ✅ Correct |
| FOR | Loser | ❌ Incorrect (slashed) |
| AGAINST | Winner | ❌ Incorrect (slashed) |
| AGAINST | Loser | ✅ Correct |

### Settlement Example

**Program Configuration:**
- Award Pool: 10,000 USDC
- Voting Pool: 1,000 USDC
- Slash: 10%
- Winners: Top 3
- Award Type: Split Equal

**Submission Results:**
| App | Net Votes | Result |
|-----|-----------|--------|
| App A | +800 | 🏆 Winner (1st) |
| App B | +500 | 🏆 Winner (2nd) |
| App C | +250 | 🏆 Winner (3rd) |
| App D | -100 | ❌ Loser |

**Awards:** 10,000 ÷ 3 = **3,333.33 USDC each**

**Voter Results:**
| Voter | Stake | Vote | Target | Correct? | Slash | Reward |
|-------|-------|------|--------|----------|-------|--------|
| Alice | 500 | FOR | App A (winner) | ✅ | 0 | 530 + stake |
| Bob | 300 | FOR | App B (winner) | ✅ | 0 | 318 + stake |
| Carol | 200 | FOR | App C (winner) | ✅ | 0 | 212 + stake |
| Dave | 400 | FOR | App D (loser) | ❌ | 40 (10%) | 360 returned |
| Eve | 200 | AGAINST | App A (winner) | ❌ | 20 (10%) | 180 returned |

**Math:**
- Total correct stake: 1,000
- Voting pool: 1,000
- Slash pool: 60
- Total to distribute: 1,060
- Alice: (500/1000) × 1060 = 530
- Bob: (300/1000) × 1060 = 318
- Carol: (200/1000) × 1060 = 212

### Multisig Execution

**EVM (Safe):**
1. Go to safe.global
2. Connect wallet
3. Find pending transactions
4. Sign and execute (meet threshold)

**Solana (Squads):**
1. Go to Squads app
2. Connect wallet
3. Find pending transactions
4. Approve and execute (meet threshold)

### Settlement Timeline

| Day | Action |
|-----|--------|
| 0 | Voting ends |
| 1 | Settlement runs (midnight UTC), transactions queued |
| 1-3 | Multisig owners review and sign |
| 2-4 | Transactions executed, funds distributed |

### Settlement Metadata Schema

```typescript
interface SettlementRecord {
  settlement: {
    id: string;
    program_id: string;
    cycle_number: number;
    
    // Timing
    voting_ended_at: string;
    settlement_run_at: string;
    
    // Results
    winners: {
      submission_id: string;
      rank: number;
      net_votes: number;
      award_amount: number;
      award_type: "fixed" | "split_equal" | "split_proportional" | "milestone";
    }[];
    
    // Financials
    award_pool: {
      total: number;
      distributed: number;
      remaining: number;
    };
    
    voting_pool: {
      total: number;
      distributed: number;
      slash_pool: number;
    };
    
    // Vote analysis
    votes: {
      total: number;
      correct: number;
      incorrect: number;
      total_staked: number;
      total_slashed: number;
    };
    
    // Transactions
    transactions: {
      id: string;
      type: "award" | "voter_reward" | "stake_return";
      recipient: string;
      amount: number;
      status: "pending" | "approved" | "executed" | "failed";
      tx_hash?: string;
    }[];
    
    // Multisig
    multisig: {
      address: string;
      type: "safe" | "squads";
      threshold: number;
      signers: string[];
    };
    
    status: "calculated" | "queued" | "executing" | "complete";
  };
}
```

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Settlement didn't run | Voting hasn't ended / already settled | Verify cycle status |
| Wrong winners | Config mismatch | Check Top X vs Quorum setting |
| Insufficient funds | Multisig balance low | Add tokens before executing |

### Open Brain Capture: Settlement

```
Settle: [Program Name] - Cycle [N]
Run At: [timestamp]
Status: [calculated|queued|executing|complete]

Winners:
- [Submission ID]: [Title] - [Net Votes] votes - [Award Amount] [TOKEN]
- [Submission ID]: [Title] - [Net Votes] votes - [Award Amount] [TOKEN]

Financials:
- Award Pool: [Total] / [Distributed] / [Remaining]
- Voting Pool: [Total] + [Slash Pool] = [Distributed]
- Total Slashed: [Amount] ([Count] voters)

Vote Summary:
- Total Votes: [N]
- Correct: [N] ([Amount] staked)
- Incorrect: [N] ([Amount] slashed)

Transactions:
- Queued: [N] pending
- Approved: [N]
- Executed: [N]
- Failed: [N]

Multisig: [Address] ([Type], [Threshold]/[Total] signatures)
```

---

## Edge Function: process-incented

New Edge Function to handle Incented-specific logic:

```typescript
// ~/supabase/functions/process-incented/index.ts

interface IncentedAction {
  type: "program_create" | "submission_record" | "vote_record" | 
        "cycle_advance" | "settlement_trigger" | "rule_update";
  payload: unknown;
}

// Key operations:
// 1. Validate stake amounts against balances
// 2. Calculate net votes per submission
// 3. Determine winners based on selection_method
// 4. Calculate reward distributions (split equal/proportional/fixed/milestone)
// 5. Apply slashing to incorrect votes
// 6. Generate settlement reports with transaction queue
// 7. Queue for multisig execution
```

---

## Dashboard Integration

### New Component: IncentedWidget.tsx

Add to Morning Briefing Dashboard (`apps/my-app/app/components/`):

```typescript
// Features:
- Active programs list
- Current cycle phase with countdown
- My submissions status
- My voting positions
- Recent settlements
- Pending rewards
```

### API Endpoint

```
GET /api/incented/summary
Response: {
  active_programs: ProgramSummary[];
  my_submissions: Submission[];
  my_votes: Vote[];
  pending_rewards: {
    award_tokens: number;
    voting_tokens: number;
  };
  recent_settlements: Settlement[];
}
```

---

## MCP Tool Extension

Add to `open-brain-mcp` Edge Function:

```typescript
// New tools:
{
  name: "list_incented_programs",
  description: "List all incentive programs with status"
},
{
  name: "get_program_details",
  description: "Get full details of a specific program"
},
{
  name: "calculate_settlement",
  description: "Calculate settlement for a completed cycle"
}
```

---

## Migration Path

### Phase 1: Documentation (Current)
- [x] Document Incented concepts
- [x] Define Open Brain mapping
- [x] Create template layer specification

### Phase 2: Schema Extension
- [ ] Add `incented` template type to classification
- [ ] Update metadata schema validation
- [ ] Add database indexes for program queries

### Phase 3: Edge Function
- [ ] Create `process-incented` Edge Function
- [ ] Implement calculation logic
- [ ] Add settlement triggers

### Phase 4: Dashboard
- [ ] Build IncentedWidget component
- [ ] Add API endpoints
- [ ] Integrate into Morning Brief

### Phase 5: MCP Tools
- [ ] Extend open-brain-mcp with incented tools
- [ ] Add settlement calculations
- [ ] Query program status

---

## Contributor Workflow: Submitting Applications

**Source:** https://docs.incented.co/contributors/submitting-application

### Submission Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUBMISSION WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DRAFT              Save work privately                       │
│     ─────────          Only submitter can see                    │
│     │                   Edit as much as needed                   │
│     │                                                            │
│     ▼                                                            │
│  2. SUBMIT             Enter public voting queue                 │
│     ─────────          Becomes visible to voters                 │
│     │                   Can still edit until period ends         │
│     │                   Reward address locks on submit           │
│     │                                                            │
│     ▼                                                            │
│  3. VOTING             Community evaluates submissions           │
│     ─────────          Voters stake tokens on decisions          │
│     │                   Conviction voting determines winners     │
│     │                                                            │
│     ▼                                                            │
│  4. SETTLEMENT         Winners determined, rewards distributed   │
│     ─────────          Tokens sent after multisig approval       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Required Fields

| Field | Purpose | Open Brain Capture |
|-------|---------|-------------------|
| **Project Title** | Specific, descriptive name | `Submission:` + title |
| **Project Summary** | Problem, solution, beneficiaries, why you | `Context:` + detailed explanation |
| **Requested Amount** | Funding needed (within program limits) | `Amount:` + value |
| **Reward Address** | Where tokens are sent (0x for EVM, Solana addr) | `Reward Address:` + address |
| **Categories** | DeFi, Infrastructure, Security, Education, etc. | `Category:` + tags |
| **Milestones** | Phased deliverables with effort/budget | `Milestone:` + details |

### Address Requirements

| Chain | Address Format | Example |
|-------|---------------|---------|
| EVM (Base, Optimism, Ethereum) | 0x... | `0xABC123...XYZ789` |
| Solana | Base58 | `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU` |

> ⚠️ **Critical:** Double-check reward address. Tokens sent to wrong addresses cannot be recovered.

### Milestone Structure

For milestone-based programs, each milestone needs:
- **Title** — Clear, specific deliverable name
- **Description** — What will be delivered
- **Estimated Effort** — Time/resources required
- **Budget** — Amount allocated to this milestone

**Best Practice:** Front-load smaller milestones to build trust with voters.

### Submission State Tracking

```typescript
// Extended submission metadata
interface SubmissionWorkflow {
  submission: {
    id: string;
    program_id: string;
    cycle_number: number;
    
    // Workflow state
    state: "draft" | "submitted" | "locked" | "settled";
    
    // Content
    title: string;
    summary: string;
    categories: string[];
    
    // Financial
    requested_amount: number;
    reward_address: string;
    address_type: "evm" | "solana";
    
    // Milestones (if required)
    milestones?: {
      number: number;
      title: string;
      description: string;
      effort: string;
      budget: number;
      status: "pending" | "in_progress" | "complete";
    }[];
    
    // Supporting materials
    attachments?: {
      type: "deck" | "spec" | "portfolio" | "demo" | "other";
      url: string;
      description?: string;
    }[];
    
    // Links
    links?: {
      website?: string;
      github?: string;
      twitter?: string;
      demo?: string;
    };
    
    // Timing
    created_at: string;
    submitted_at?: string;
    locked_at?: string;
    
    // Voting results
    votes_for: number;
    votes_against: number;
    net_votes: number;
    final_status?: "winner" | "rejected" | "disqualified";
  };
}
```

### Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Invalid reward address" | Wrong format for chain | Use 0x for EVM, Solana format for Solana |
| "Amount exceeds limit" | Requested > program cap | Lower amount to within limits |
| "Submission period ended" | Missed deadline | Check for future cycles/rounds |

### Open Brain Capture Templates

#### Draft Submission
```
Submission: [Program Name] - Cycle [N] - DRAFT
Title: [Specific Project Name]
Amount: [X] [TOKEN]
Reward Address: [0x... or Solana address]
Category: [DeFi|Infrastructure|Security|Education|...]

Context: 
Problem: [What problem are you solving?]
Solution: [How will you solve it?]
Beneficiaries: [Who benefits?]
Why Me: [Why are you the right person?]

Milestone 1: [Title] - [Budget] - [Effort]
Milestone 2: [Title] - [Budget] - [Effort]

Links: [github], [website], [demo]
Status: draft
```

#### Final Submission
```
Submission: [Program Name] - Cycle [N] - SUBMITTED
ID: [submission-id]
Title: [Project Title]
Submitted At: [timestamp]
Status: submitted (editable until [deadline])
Reward Address Locked: [0x...]
```

#### Post-Settlement
```
Settlement: [Program Name] - Cycle [N]
Submission ID: [id]
Result: [winner|rejected]
Award Received: [amount] [token]
Transaction: [tx-hash]
```

### Pre-Submission Checklist

Before submitting, verify:
- [ ] Title actually describes the project
- [ ] Summary explains why voters should back you
- [ ] Amount is realistic and within limits
- [ ] Reward address is correct (check twice)
- [ ] Milestones are complete (if required)
- [ ] Categories accurately describe the work
- [ ] Supporting materials demonstrate capability

---

## Related Concepts

| Concept | Deep Dive |
|---------|-----------|
| Conviction Voting | https://docs.incented.co/conviction-voting |
| Incentive Programs | https://docs.incented.co/programs |
| Tokens & Rewards | https://docs.incented.co/tokens |
| Submitting Applications | https://docs.incented.co/contributors/submitting-application |
| Settlement Process | https://docs.incented.co/program-managers/settlement |

---

## Key Insight

> "Most voting systems have no teeth. Vote wrong? Nothing happens. Vote without reading? No one knows. Incented is different. When you vote, you stake tokens - real value on the line."

This principle can extend beyond incentive programs to:
- **Decision tracking** → Who voted for what, with what conviction
- **Stake-weighted consensus** → Important decisions require stake
- **Reputation systems** → Track voting accuracy over time
- **Accountability** → Decisions have consequences

---

*Integrated from https://docs.incented.co/core-concepts, https://docs.incented.co/contributors/submitting-application, and https://docs.incented.co/program-managers/settlement*
