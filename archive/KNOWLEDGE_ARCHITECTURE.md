# Unified Knowledge Architecture for Open Brain

**Date:** 2026-03-16  
**Status:** Proposal for consolidation

---

## The Problem

We have knowledge scattered across:
- 143 PDFs (not searchable, version-controlled)
- ROADMAP.md (future only)
- PLAYBOOK.md (procedures only)
- idirdev vault (Zettelkasten, separate)
- idirnet vault (Quartz-based, separate)
- Google Drive (gdocs, gsheets, PDFs)
- Meeting transcripts (Gemini notes)

**Result:** No single place to search, navigate, or trust.

---

## The Solution: Unified PLAYBOOK

Merge ROADMAP + PLAYBOOK + Knowledge Base into one navigable document.

### New Structure

```
PLAYBOOK.md (Unified)
├── 1. PHILOSOPHY & PRINCIPLES (was: scattered)
│   ├── Best agent is a markdown file
│   ├── Git as single source of truth
│   └── Zettelkasten method
│
├── 2. ROADMAP (was: ROADMAP.md)
│   ├── Phase 0-2: Complete
│   ├── Phase 3: In Progress
│   └── Phase 4-8: Planned
│
├── 3. KNOWLEDGE BASE (NEW — extracted from PDFs/vaults)
│   ├── 3.1 idirnet Project Knowledge
│   ├── 3.2 Lightheart Knowledge
│   ├── 3.3 Team Profiles
│   ├── 3.4 Meeting Decisions
│   └── 3.5 Research & Policy
│
├── 4. PLAYBOOK / PROCEDURES (was: PLAYBOOK.md git section)
│   ├── Git workflows
│   ├── Deployment procedures
│   ├── Onboarding rituals
│   └── Emergency commands
│
├── 5. TEMPLATES & SCHEMAS
│   ├── 19 Open Brain templates
│   ├── Document frontmatter
│   └── TSM framework
│
├── 6. REFERENCE
│   ├── Tech stack
│   ├── Access control levels
│   └── Glossary
│
└── 7. APPENDICES
    ├── PDF Index (metadata stubs)
    ├── External links
    └── Questions for Claude from Kimi
```

---

## PDF-to-Markdown Strategy

For each of the 143 PDFs, create one of:

### Option A: Full Conversion (High-value docs)
- Tech specs
- Strategy documents
- Research reports

**Template:**
```markdown
---
type: literature
source: "PDF: filename.pdf"
source_location: "idirnet/content/knowledge/research/pdfs/"
converted: "2026-03-16"
author: "extractor"
publish: true
tags: [pdf-extracted, domain/topic]
---

# {Title}

## Summary
{3-5 sentence abstract}

## Key Points
- 
- 

## Decisions Made
- 

## Action Items
- [ ] 

## Full Content
{full markdown text}
```

### Option B: Metadata Stub (Low-value/reference docs)
- Meeting transcripts already captured
- Duplicate documents
- Superseded versions

**Template:**
```markdown
---
type: reference
source: "PDF: filename.pdf"
location: "idirnet/content/knowledge/research/pdfs/"
status: "unconverted"
reason: "{why not converted}"
priority: "low"
tags: [pdf-stub]
---

# {Title}

**Exists as PDF only.** See: `idirnet/content/knowledge/research/pdfs/filename.pdf`

## Contents
{Brief description of what it contains}

## Convert If Needed
- When: {trigger}
- Why: {reason}
```

---

## Required Headings & Terms

### Document Taxonomy (must be consistent)

| Term | Definition | Used In |
|------|------------|---------|
| **Fleeting** | Quick capture, unprocessed | Note type |
| **Literature** | Source summary, your words | Note type |
| **Permanent** | Atomic idea, standalone | Note type |
| **Project** | Active workstream | Note type |
| **Request** | Formal ask with criteria | Note type |
| **Structure** | Index/MOC | Note type |
| **MOC** | Map of Content | Navigation |
| **TSM** | Triple Stack Model | Framework |
| **Template** | Classification trigger | Open Brain |
| **Phase** | Major roadmap milestone | Roadmap |
| **Node** | TSM plane instance | Framework |

### Access Levels (4-tier)

```yaml
access_level: "public"      # Anyone can read
access_level: "network"     # idirnet community
access_level: "team"        # Core team only
access_level: "leadership"  # Founders/exec only
```

### Status Values (standardized)

```yaml
status: "draft"        # Initial capture
status: "open"         # Available for work
status: "in-progress"  # Being worked on
status: "review"       # Ready for review
status: "completed"    # Done
status: "archived"     # Historical
status: "blocked"      # Cannot proceed
```

---

## Integration with Existing Vaults

### idirdev Vault (Zettelkasten)
- **Keep as-is** for atomic knowledge
- **Reference from PLAYBOOK** via links
- **Sync key permanent notes** into PLAYBOOK Knowledge Base

### idirnet Vault (Quartz/Public)
- **Keep for public publishing**
- **Pull published notes** into PLAYBOOK as Literature notes
- **Maintain bidirectional links**

### Google Drive
- **Archive** original PDFs
- **Canonical version** is markdown in PLAYBOOK
- **Sync schedule:** Weekly extraction of new docs

---

## Migration Plan

### Phase 1: Consolidate (This Week)
- [ ] Merge ROADMAP.md into PLAYBOOK.md Section 2
- [ ] Reorganize PLAYBOOK into 7 sections
- [ ] Create PDF inventory (list all 143)

### Phase 2: Extract (Next Week)
- [ ] Identify top 20 high-value PDFs for conversion
- [ ] Create metadata stubs for remaining 123
- [ ] Extract meeting decisions from transcripts

### Phase 3: Integrate (Week After)
- [ ] Link idirdev permanent notes to PLAYBOOK
- [ ] Create cross-references
- [ ] Test search/discovery

### Phase 4: Maintain (Ongoing)
- [ ] New PDFs → Markdown first
- [ ] Weekly sync from vaults
- [ ] Monthly review of stubs

---

## Questions for Claude from Kimi

1. "How do we convert PDFs to markdown at scale?"
2. "What's the best way to maintain bidirectional sync between PLAYBOOK and vaults?"
3. "Should we use a database or keep everything in git?"
4. "How do we handle binary assets (images, diagrams) in this system?"
5. "What's the search strategy across unified knowledge?"

---

## Decision Needed

**Option A:** Proceed with unified PLAYBOOK (single file, 7 sections)
**Option B:** Keep separate files but create unified index/navigation
**Option C:** Database-backed system (Supabase) with markdown frontend

**My recommendation:** Option A for now, evolve to Option C if scale requires.

---

*Ready to implement once direction confirmed.*
