# Open Brain Unified Playbook

**Version:** 2.0  
**Last Updated:** 2026-03-16  
**Purpose:** Single source of truth for Open Brain — roadmap, procedures, and knowledge base

---

## Table of Contents

1. [Philosophy & Principles](#1-philosophy--principles)
2. [Roadmap](#2-roadmap)
3. [Knowledge Base](#3-knowledge-base)
4. [Procedures](#4-procedures)
5. [Templates & Schemas](#5-templates--schemas)
6. [Reference](#6-reference)
7. [Appendices](#7-appendices)

---

## 1. Philosophy & Principles

### The Best Agent is a Markdown File

The best AI agent is not a platform, a visual workflow builder, or a production framework. It is a markdown file and scripts, routed through that markdown file, organized through a folder structure.

This follows the Ken Thompson principle (1968): programs run best through a tree of files. Anthropic's Claude Code uses `CLAUDE.md` files for the same reason.

### Core Principles

1. **Capture Everything, Organize Later** — Don't let perfect be enemy of captured
2. **Documentation-First, Meetings-Second** — Write before talking; async default
3. **Single Source of Truth** — Git-based markdown is canonical
4. **Graduated Access** — 4 tiers: public/network/team/leadership
5. **Knowledge is a Graph** — Link ideas (`[[like this]]`), don't just list
6. **Actionable by Default** — Captures lead to action

---

## 2. Roadmap

### Phase 0: Foundation (COMPLETE)

Core capture and classification pipeline.

- [x] Supabase project live (jeuxslbhjubxmhtzpvqf)
- [x] Slack #log channel webhook connected
- [x] ingest-thought Edge Function
- [x] OpenRouter integration (gpt-4o-mini, text-embedding-3-small)
- [x] thoughts table with vector search
- [x] MCP tools connected
- [x] 120+ thoughts captured
- [x] Claude Code integration
- [x] Git repo initialised
- [x] CLAUDE.md agent routing

### Phase 1: Template System v2 (COMPLETE)

Expanded from 8 to 19 templates across 3 layers.

| Layer | Count | Templates |
|-------|-------|-----------|
| Team Core | 8 | Decision, Risk, Milestone, Spec, Meeting Debrief, Person Note, Stakeholder, Sent |
| Role | 6 | Budget, Invoice, Funding, Legal, Compliance, Contract |
| Personal | 5 | Insight, AI Save, Nutrition, Health, Home |

### Phase 2: Automated Meeting Notes (COMPLETE)

- [x] meeting-notes Edge Function
- [x] Google Apps Script (15-min trigger)
- [x] Shared Drive output folder
- [x] 13 transcripts ready for first run

### Phase 3: Team Onboarding (IN PROGRESS)

- [x] Kris email sent
- [ ] Kris provides Gemini folder ID
- [ ] Laura onboarding (Finance + Compliance)
- [ ] Jochem onboarding (Stakeholder + Sent)
- [ ] Colm onboarding (Spec + Milestone)
- [ ] Team agreement on Layer 1 standard

### Phase 4: Morning Briefing Dashboard (IN PROGRESS)

- [x] Next.js scaffold on Vercel
- [x] Supabase queries
- [x] OpenWeather API (Dublin)
- [x] Renewable energy tickers (ICLN, TAN, PBW, QCLN)
- [x] Mobile-optimized layout
- [ ] Gemini Gem integration
- [ ] 8am Slack DM schedule
- [ ] Deploy

### Phase 5: To-Do Integration

- [ ] work_todos table
- [ ] personal_todos table
- [ ] Auto-populate from action_items
- [ ] Google Calendar sync

### Phase 6: Nutrition Tracking

- [ ] Rolling 7-day summary
- [ ] Morning briefing integration
- [ ] Weekly trend reports

### Phase 7: Gmail Parsing

- [ ] Gemini Gem: Email Triage
- [ ] email_items table
- [ ] 15-min Apps Script trigger

### Phase 8: Weekly Review Automation

- [ ] Sunday evening scheduled function
- [ ] Structured weekly summary
- [ ] Slack/email delivery

---

## 3. Knowledge Base

### 3.1 Open Brain Philosophy

> "The best agent is a markdown file routed through folders." — idirnet v2 methodology

**Core stack:**
- Obsidian — Local markdown editing
- Git — Single source of truth
- Quartz — Publishing to web
- Vercel — Auto-deploy on push
- Claude Code — AI-assisted work

### 3.2 Zettelkasten Method

| Type | Folder | Purpose |
|------|--------|---------|
| Fleeting | 00-Inbox/ | Quick captures, process within 48h |
| Literature | 10-Literature/ | Source summaries, your words |
| Permanent | 20-Permanent/ | Atomic ideas, standalone |

**Linking principle:** Use `[[wikilinks]]` to connect ideas.

### 3.3 Triple Stack Model (TSM)

3 stacks × 7 planes = 21 nodes

| Stack | Focus | Question |
|-------|-------|----------|
| Global | Infrastructure | "What makes this possible?" |
| Internal | Embodied Perception | "What does it feel like?" |
| External | Mediation & Ritual | "How do people interact?" |

**Critical path:** Global Ground → Global Runtime → Internal Root → External Space

### 3.4 PDF Knowledge Inventory

**12 Converted:**
- DELIVERABLES_1_8_9_FINAL.pdf → deliverables-1-8-9-final.md
- DELIVERABLES_6_7_IP_GOVERNANCE.pdf → deliverables-6-7-ip-governance.md
- IDIRNET_LIGHTHEART_COMPLETE_ANALYSIS.pdf → idirnet-lightheart-complete-analysis.md
- WIP ROLES AND RESPONSIBILITIES.pdf → wip-roles-responsibilities.md
- Square Roots Report → square-roots-report.md
- Budgeting For Immersive R&D Lab → budgeting-immersive-rnd-lab.md
- EU AV Action Plan → eu-audiovisual-action-plan.md
- **DELIVERABLE_2_OPTIONS.pdf → [deliverable-2-options.md](../content/knowledge/notes/deliverable-2-options.md)** ⭐ *NEW*
- **DELIVERABLE_3_RETAINER.pdf → [deliverable-3-retainer.md](../content/knowledge/notes/deliverable-3-retainer.md)** ⭐ *NEW*
- **DELIVERABLE_5_CONFLICTS.pdf → [deliverable-5-conflicts.md](../content/knowledge/notes/deliverable-5-conflicts.md)** ⭐ *NEW*

**9 Queued for Conversion:**
- MASTER_SOURCE_MAP.pdf (system architecture)
- Funding Research for WIP_IDIRNET.pdf
- AI Technologies and Emerging Forms of Creative Practice
- Report-GrowthIndustriesForImmersiveTech
- Algorithm_19042022_FF_Summary on company development
- ECP.pdf (employment/contractor policy)
- VALIDATION_GATE_A.pdf
- why-technology-needs-artists
- first-progress-report-on-implementation

**See:** `stubs/PDF_INDEX.md` for full inventory

---

## 4. Procedures

### 4.1 Git Workflow (Colm's Method)

**The 3-Command Push:**
```bash
git add .
git commit -m "Your message"
git push
```

**Before Work:**
```bash
git pull
```

**Check Status:**
```bash
git status
```

### 4.2 Connecting Local to Remote

```bash
# Check if connected
git status

# If "no remote configured":
git remote add origin <repo-url>

# Preserve local work first
git checkout -b version-two
git add .
git commit -m "Save local work"
git push -u origin version-two

# Fetch remote
git fetch origin
git checkout main
git merge version-two  # or: git reset --hard origin/main
```

### 4.3 Vercel Deployment

| Branch | Result |
|--------|--------|
| `main` | Production auto-deploy |
| `staging` | Password-protected preview |
| Other | Preview URL generated |

**Rollback:**
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. **...** → **Promote to Production**

### 4.4 Obsidian + Git Workflow

1. Clone repo locally
2. Open folder as vault
3. Install Obsidian Git plugin
4. Configure auto-commit interval

### 4.5 Emergency Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard)
git reset --hard HEAD~1

# See all branches
git branch -a

# Switch branch
git checkout branch-name

# Stash temporarily
git stash

# Restore stash
git stash pop

# Force push (careful!)
git push --force
```

---

## 5. Templates & Schemas

### 5.1 19 Open Brain Templates

**Layer 1: Team Core**
| Template | Keyword | Emoji |
|----------|---------|-------|
| Decision | `Decision:` | 🎯 |
| Risk | `Risk:` | ⚠️ |
| Milestone | `Milestone:` | 🏁 |
| Spec | `Spec:` | 🔧 |
| Meeting Debrief | `Meeting with` | 📋 |
| Person Note | `[Name] —` | 👤 |
| Stakeholder | `Stakeholder:` | 🤝 |
| Sent | `Sent:` | 📤 |

**Layer 2: Role**
| Template | Keyword | Primary User |
|----------|---------|--------------|
| Budget | `Budget:` | Laura |
| Invoice | `Invoice:` | Laura/Kev |
| Funding | `Funding:` | Laura/Kev |
| Legal | `Legal:` | Laura/Kev |
| Compliance | `Compliance:` | Anyone |
| Contract | `Contract:` | Laura |

**Layer 3: Personal**
| Template | Keyword | Notes |
|----------|---------|-------|
| Insight | `Insight:` | Kev uses heavily |
| AI Save | `Saving from` | Keep AI outputs |
| Nutrition | `Ate:` | Health tracking |
| Health | `Health:` | Wellbeing |
| Home | `Home:` | Personal tasks |

### 5.2 Document Frontmatter Schema

```yaml
---
title: "Required"
description: "Brief summary"
publish: true/false
type: fleeting|literature|permanent|project|meeting|member|structure
status: draft|open|in-progress|review|completed|archived|blocked
author: "Your Name"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
tags: [topic, subtopic]
# TSM metadata:
tsm_stack: global|internal|external
tsm_plane: "Plane Name"
tsm_node: "global-ground"
---
```

### 5.3 Access Levels

```yaml
access_level: "public"      # Anyone
access_level: "network"     # idirnet community
access_level: "team"        # Core team
access_level: "leadership"  # Founders/exec
```

---

## 6. Reference

### 6.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 |
| UI | React 19 + SCSS |
| Language | TypeScript |
| Hosting | Vercel |
| Content | gray-matter + unified |
| Database | Supabase (PostgreSQL) |
| AI Gateway | OpenRouter |
| Embeddings | text-embedding-3-small |
| Classification | gpt-4o-mini |

### 6.2 Key Locations

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Agent routing |
| `docs/status/ROADMAP.md` | Phase planning |
| `PLAYBOOK.md` | This document |
| `docs/process/HANDOVER.md` | System reference |
| `PDF_AUDIT.md` | PDF inventory |
| `stubs/PDF_INDEX.md` | PDF metadata stubs |
| `~/services/supabase/functions/` | Edge Functions |

### 6.3 Glossary

| Term | Definition |
|------|------------|
| **Origin** | GitHub.com version of repo |
| **MOC** | Map of Content — index note |
| **TSM** | Triple Stack Model |
| **Fleeting** | Quick capture, unprocessed |
| **Literature** | Source summary |
| **Permanent** | Atomic idea, standalone |
| **Template** | Classification trigger |
| **Phase** | Roadmap milestone |
| **Node** | TSM plane instance |

---

## 7. Appendices

### Appendix A: Questions for Claude from Kimi

1. "What's the safest way to merge my branch with remote changes?"
2. "How do I recover from a failed force push?"
3. "Why is Vercel showing 'no output directory' error?"
4. "How do we convert 12 PDFs to markdown at scale?"
5. "Should we use Google Drive sync or Git-only for Obsidian?"
6. "What's the best branching strategy for 3-4 developers on retainer?"
7. "How do we handle Obsidian + Git conflicts?"
8. "What should our .gitignore include?"
9. "How do we safely store environment variables?"
10. "Which TSM plane should documentation live in?"

### Appendix B: Rituals

| Trigger | Action |
|---------|--------|
| Start work | `git pull` |
| Finish task | Commit with descriptive message |
| Deploy success | Update roadmap checkboxes |
| Decision made | `capture_thought` via MCP |
| Phase complete | Update project memory |

### Appendix C: Changelog

| Date | Change |
|------|--------|
| 2026-03-16 | Unified PLAYBOOK created (merged ROADMAP + PLAYBOOK + PDF knowledge) |
| 2026-03-16 | PDF audit completed (48 project PDFs catalogued) |
| 2026-03-16 | PDF stubs created (26 unconverted PDFs indexed) |

---

*End of Unified Playbook*

**Next Actions:**
- [ ] Convert 4 critical PDFs to markdown sections
- [ ] Archive 8 duplicate PDFs
- [ ] Extract decisions from meeting transcripts
