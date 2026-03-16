# Open Brain Playbook

**Companion to ROADMAP.md** — Operational procedures for day-to-day work.

Last updated: 2026-03-16

---

## Quick Reference: Git Workflow (Colm's Method)

This is the workflow Colm taught in the March 12 session. Fast path from local work → live deployment.

### The 3-Command Push (Standard)

```bash
git add .
git commit -m "Your message here"
git push
```

Or ask Claude: *"Push changes"* — it knows to run all three.

### Before You Start Work (Always)

```bash
git pull
```

This ensures you have the latest changes before you start editing.

### Check Your Status

```bash
git status
```

Shows: which branch you're on, what's changed, what's staged.

---

## Play-by-Play Scenarios

### Scenario 1: Starting a Fresh Project from GitHub

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd <project-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start working** — Edit files locally

4. **Push when done** — See "The 3-Command Push" above

---

### Scenario 2: Connecting Local Project to Remote (First Time)

When you have local files that aren't connected to GitHub yet:

1. **Check status**
   ```bash
   git status
   ```
   If it says "no remote configured," continue.

2. **Connect to remote**
   ```bash
   git remote add origin <repo-url>
   ```

3. **Preserve your local work first** (Critical!)
   ```bash
   git add .
   git commit -m "Save local work before fetching remote"
   git checkout -b version-two
   git push -u origin version-two
   ```

4. **Now fetch the remote**
   ```bash
   git fetch origin
   ```

5. **Check out main branch**
   ```bash
   git checkout main
   ```

6. **Merge or reset** (Choose one)
   - **Merge your changes:** `git merge version-two`
   - **Match remote exactly:** `git reset --hard origin/main`

---

### Scenario 3: Fixing "My Changes Aren't Showing Up"

Symptom: You pushed but the site isn't updating.

1. **Check which branch you're on**
   ```bash
   git status
   ```
   Look for: "On branch main" or "On branch staging"

2. **Check GitHub** — Are your commits visible on the branch you expected?

3. **Common fix: Wrong branch connection**
   ```bash
   git checkout main
   git pull origin main
   git merge version-two  # If your work is on version-two
   git push
   ```

4. **Nuclear option: Match remote exactly**
   ```bash
   git reset --hard origin/main
   ```
   ⚠️ This deletes all local changes. Use with caution.

---

### Scenario 4: Branching for Safe Development

Use this when working on big features or with multiple people:

1. **Create a new branch**
   ```bash
   git checkout -b feature-name
   ```

2. **Work and commit normally**
   ```bash
   git add .
   git commit -m "Feature progress"
   git push -u origin feature-name
   ```

3. **When ready to merge** (Colm's method)
   ```bash
   git checkout main
   git pull origin main
   git merge feature-name
   git push
   ```

4. **Clean up**
   ```bash
   git branch -d feature-name
   ```

---

### Scenario 5: Handling Merge Conflicts

When two people edit the same file:

1. **Try to merge**
   ```bash
   git pull origin main
   ```
   If conflicts exist, Git will pause and list conflicted files.

2. **Open conflicted files** — Look for markers:
   ```
   <<<<<<< HEAD
   Your local version
   =======
   Remote version
   >>>>>>> main
   ```

3. **Edit to resolve** — Choose which version to keep, delete the markers.

4. **Complete the merge**
   ```bash
   git add .
   git commit -m "Resolved merge conflict"
   git push
   ```

---

## Vercel Deployment Rules

| Action | Result |
|--------|--------|
| Push to `main` | Auto-deploys to production |
| Push to `staging` | Deploys to password-protected preview |
| Push to any other branch | Preview URL generated |
| Build error | Check Vercel dashboard for logs |

**Key insight from Colm:** Vercel listens for commits. The workflow is:
1. Work locally
2. Push to GitHub
3. Vercel detects push → builds → deploys

---

## Git + Obsidian Workflow

For the shared knowledge base:

1. **Clone the repo** to your local machine
2. **Open the folder as vault** in Obsidian
3. **Install Obsidian Git plugin** (community plugin)
4. **Configure plugin:**
   - Set git binary path (usually automatic)
   - Enable "Automatically refresh source control"
   - Set backup interval (e.g., 5 minutes)

5. **Daily workflow:**
   - Edit notes in Obsidian
   - Plugin auto-commits periodically
   - Or manually: Command palette → "Git: Commit all changes"
   - Then: "Git: Push"

---

## Questions for Claude from Kimi

Use these when stuck or before making architectural decisions.

### Git & Deployment
1. "What's the safest way to merge my branch with remote changes?"
2. "How do I recover from a failed force push?"
3. "Why is Vercel showing 'no output directory' error?"
4. "What's the difference between git pull and git fetch?"

### Architecture
5. "Should we use Next.js or Quartz for the docs site?"
6. "Tailwind vs SCSS — trade-offs for this specific project?"
7. "How should we structure subdomains: subfolder vs subdomain?"

### Collaboration
8. "What's the best branching strategy for 3-4 developers on retainer?"
9. "How do we handle Obsidian + Git conflicts when multiple people edit?"
10. "Should we use Google Drive sync or Git-only for Obsidian vaults?"

### Security
11. "What should our .gitignore include for this project?"
12. "How do we safely store environment variables for Vercel?"

---

## Rituals (When to Update What)

| Trigger | Action | File to Update |
|---------|--------|----------------|
| Start work | Check git status, pull latest | N/A |
| Finish task | Commit with descriptive message | Git history |
| Deploy successful | Update ROADMAP.md checkboxes | ROADMAP.md |
| Decision made | Capture in Open Brain | Via MCP capture_thought |
| Phase complete | Update project memory | ~/.claude/projects/.../memory/ |
| New team member onboarded | Add to playbook | This file |

---

## Key Terms (Colm's Definitions)

| Term | What It Means |
|------|---------------|
| **Origin** | The version of the repo on GitHub.com |
| **Main branch** | The primary branch — what's live on production |
| **Staging branch** | Test environment, password protected |
| **Fetch** | Download changes from remote (doesn't apply them) |
| **Pull** | Download changes AND apply them to your local files |
| **Push** | Upload your commits to GitHub |
| **Commit** | Bundle of changes with a message |
| **Stage** | Mark files to include in next commit (`git add`) |
| **Merge conflict** | When two people change the same lines — requires manual fix |

---

## Emergency Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# See all branches
git branch -a

# Switch to a branch
git checkout branch-name

# Force push (overwrites remote — use carefully)
git push --force

# See commit history
git log --oneline

# Stash changes temporarily
git stash

# Restore stashed changes
git stash pop
```

---

## Philosophy (From the Colm Session)

> "The perfect way to work: Start by pulling from remote. Make changes locally. Commit. Push back up. Everyone has their own copy. Git manages the merging." — Colm Hewson, March 12, 2026

**Key principle:** Git is the single source of truth. Obsidian reads from Git. Web apps read from Git. No Google Drive sync needed — Git replaces it.

---

## Next Steps to Complete This Playbook

- [ ] Test the 3-command push on a real change
- [ ] Set up Obsidian Git plugin with the dev repo
- [ ] Verify Vercel auto-deploy works from main branch
- [ ] Document any additional gotchas discovered
- [ ] Share with Tim for his onboarding

---

**Source:** Transcript from March 12, 2026 meeting with Colm Hewson
**Location:** `~/Downloads/Meeting started 2026_03_12 16_11 GMT – Notes by Gemini.md`

---

## Internet/idirnet Knowledge System (Extracted from Vault)

### Philosophy: "The Best Agent is a Markdown File"

The idirnet v2 methodology from March 16, 2026:

> "The best AI agent is not a platform, a visual workflow builder, or a production framework. It is a markdown file and scripts, routed through that markdown file, organized through a folder structure."

This follows the Ken Thompson principle (1968): programs run best through a tree of files. Anthropic's Claude Code uses `CLAUDE.md` files for the same reason.

**Core stack:**
- **Obsidian** — Local markdown editing
- **Git** — Single source of truth (replaces Google Drive sync)
- **Quartz** — Publishing to web
- **Vercel** — Auto-deploy on push
- **Claude Code** — AI-assisted knowledge work

### Zettelkasten Method (3 Note Types)

| Type | Folder | Purpose | Lifecycle |
|------|--------|---------|-----------|
| **Fleeting** | `00-Inbox/` | Quick raw captures | Process within days, then promote or archive |
| **Literature** | `10-Literature/` | Source summaries | Extract from books/articles, link to permanent notes |
| **Permanent** | `20-Permanent/` | Atomic ideas | Standalone, linked, refined knowledge |

**Linking principle:** Use `[[wikilinks]]` to connect ideas. The network grows more valuable over time.

### Vault Folder Structure

```
content/
├── 00-Inbox/          # Transient captures (process regularly)
├── 10-Literature/     # Source notes (books, articles, meetings)
├── 20-Permanent/      # Atomic ideas, refined knowledge
├── 30-Structure/      # MOCs (Maps of Content), indexes
├── 40-Projects/       # Active project notes
├── 50-Templates/      # Note templates (Fleeting, Literature, Permanent)
├── 60-Assets/         # Images, attachments
├── 70-Archive/        # Old notes, stale captures
├── docs/              # Documentation, guides
├── knowledge/         # Accumulated notes
├── projects/          # meetings/, members/, proposals/
└── requests/          # AV specs, training manuals, etc.
```

### Document Frontmatter Schema

Every note must include:

```yaml
---
title: "Required — display title"
description: "Brief summary"
publish: true/false          # Controls website visibility
type: permanent|literature|project|meeting|member|structure
status: draft|open|in-progress|review|completed
author: "Your Name"          # Always set this
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
tags: [topic, subtopic]
# TSM metadata (for Lightheart work):
tsm_stack: global|internal|external
tsm_plane: Ground|Runtime|Circulation|...
tsm_node: global-ground
---
```

### Collaboration Rules

1. **Always set `author`** — Fill in your name in frontmatter
2. **Don't overwrite others** — If you disagree, create a linked response:
   ```markdown
   ## My response to [[Original Note Title]]
   
   I think the opposite because...
   ```
3. **Use callouts for comments:**
   ```markdown
   > [!note] @YourName
   > This connects to [[Another Idea]]
   ```
4. **Process your inbox** — Regularly review `00-Inbox/`, promote to Permanent or archive
5. **One idea per note** — If writing about two things, make two notes
6. **Your own words** — Never copy-paste from sources

---

## Triple Stack Model (TSM) Quick Reference

The organizing framework for Lightheart and idirnet work. 3 stacks × 7 planes = 21 nodes.

### The 3 Stacks

| Stack | Focus | Question |
|-------|-------|----------|
| **Global** | Infrastructure & Systems | "What makes this possible?" |
| **Internal** | Embodied Perception | "What does it feel like to be here?" |
| **External** | Mediation & Ritual | "How do people interact?" |

### The 21 Planes (Selected)

**Global Stack (Infrastructure):**
- Ground → Power, HVAC, safety
- Runtime → Media servers, sync, playback
- Circulation → Visitor flow
- Channels → Consent, GDPR
- Frames → Sightlines, captions
- Roles → Staff training
- Horizons → Governance, KPIs

**Internal Stack (Embodied):**
- Root → Physical grounding
- Sacral → Creativity, pacing
- Solar Plexus → Agency, choice
- Heart → Connection
- Throat → Articulation
- Third Eye → Perception
- Crown → Integration

**External Stack (Mediation):**
- Space → Point clouds, sightlines
- Portal → Threshold, entry
- Gesture → Movement, consent
- Mirror → Feedback
- Narrative → Story, horizon cards
- Atmosphere → Light, sound, air
- Feedback Loop → Learning

### Key Dependencies

```
Global Ground → Global Runtime
      ↓              ↓
Internal Root    Internal Sacral
      ↓
External Space → External Portal
```

**Status legend:** 🟢 Complete | 🟡 Active | ⚪ Planned | 🔴 Blocked

---

## Vercel + GitHub Auto-Deploy Setup

### Prerequisites
- Vercel account access
- GitHub repository admin access
- Environment variables ready

### Dashboard Setup (Recommended)

1. **Vercel Dashboard** → Find project → Settings → Git
2. **Connect Git Repository** → Select GitHub → Authorize
3. **Select repo:** `legofsalmon/idirdev`
4. **Configure:**
   - Production Branch: `main`
   - Build Command: `npm run build`
   - Install Command: `npm install`
5. **Environment Variables:** Add all from `.env.local`
6. **Deploy** — Trigger first build

### Post-Setup Verification

```bash
# Test auto-deploy
echo "# Test" >> README.md
git add README.md
git commit -m "chore: Test auto-deploy"
git push origin main
```

Check Vercel dashboard — deployment should appear within 1-2 minutes.

### Rollback Procedure

If deployment breaks:
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click **...** → **Promote to Production**
4. Site immediately reverts

---

## Tech Stack Reference (idirnet)

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 15 | App Router, SSG |
| UI | React 19 + SCSS | Components, custom design system |
| Language | TypeScript | Type safety |
| Hosting | Vercel | Auto-deploy on push |
| Content | gray-matter + unified | Markdown processing |
| Viz | React Flow + dagre | Node-based diagrams |
| 3D | Hyperfy (evaluating) | Virtual worlds, WebXR |
| AV | openFrameworks, Pixera, L-ISA | Creative tech |
| Sync | Obsidian Git plugin | Auto-commit/push |

---

## Expanded Questions for Claude from Kimi

### Git & Deployment
1. "What's the safest way to merge my branch with remote changes?"
2. "How do I recover from a failed force push?"
3. "Why is Vercel showing 'no output directory' error?"
4. "What's the difference between git pull and git fetch?"
5. "How do I set up Obsidian Git plugin for auto-sync?"

### Architecture
6. "Should we use Next.js or Quartz for the docs site?"
7. "Tailwind vs SCSS — trade-offs for this specific project?"
8. "How should we structure subdomains: subfolder vs subdomain?"
9. "When should we use static site generation vs server-side rendering?"
10. "How do we implement the TSM framework in code?"

### Collaboration
11. "What's the best branching strategy for 3-4 developers on retainer?"
12. "How do we handle Obsidian + Git conflicts when multiple people edit?"
13. "Should we use Google Drive sync or Git-only for Obsidian vaults?"
14. "How do we structure meeting notes for maximum discoverability?"
15. "What's the best way to link fleeting notes to permanent notes?"

### Security
16. "What should our .gitignore include for this project?"
17. "How do we safely store environment variables for Vercel?"
18. "How do we handle sensitive data in meeting notes?"

### TSM & Framework
19. "Which TSM plane should documentation live in?"
20. "How do we track dependencies between the 21 nodes?"
21. "What are the acceptance criteria for each TSM plane?"

### Integration
22. "How does Open Brain protocol handshake with KOD (Knowledge Organization/Decision system)?"
23. "How do we extract metadata from Slack/WhatsApp into the vault?"
24. "What's the best way to sync Obsidian with the published website?"

---

## Document Evolution Tracker

| Source | Extracted To | Date |
|--------|--------------|------|
| Colm Session (March 12) | Git workflow, Vercel rules | 2026-03-16 |
| idirdev vault (20-Permanent) | Zettelkasten method, Philosophy | 2026-03-16 |
| idirdev vault (docs/) | TSM framework, Deployment guide | 2026-03-16 |
| idirdev vault (50-Templates) | Frontmatter schema, Note types | 2026-03-16 |
| idirdev vault (30-Structure) | MOC navigation pattern | 2026-03-16 |

---

## Action Items for Next Pass (Bottom-Up Agent)

The following areas need exploration from the bottom up:

1. **knowledge/notes/** — 61 subfolders of accumulated notes
2. **projects/meetings/** — 12 meeting transcripts to extract decisions
3. **projects/members/** — 8 team profiles for roles/responsibilities
4. **70-Archive/** — Historical decisions and context
5. **requests/** — AV specs, training manuals, operational docs
6. **Google Drive shared folders** — Documents not yet in Git
7. **idirnet/content/** — Additional vault content (learning/, hiring/)

---

*This section added by top-down extraction pass. See Document Evolution Tracker above.*
