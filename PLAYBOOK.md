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
