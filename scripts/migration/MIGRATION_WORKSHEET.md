# Migration Worksheet

**Track progress as you migrate each data type**

---

## Pre-Migration Checklist

- [ ] Database backup created (`openbrain-backup-YYYYMMDD.sql`)
- [ ] Document repository initialized (`openbrain-documents/`)
- [ ] Folder structure created per PLAYBOOK.md
- [ ] Test environment configured
- [ ] Team notified of migration window

---

## Data Type Migration Tracker

### 🔴 Tier 1: Critical

#### 1. Decisions → `decision` documents

| Step | Status | Notes |
|------|--------|-------|
| Export from DB | ⬜ | |
| Transform to frontmatter | ⬜ | |
| Write to `20-permanent/` | ⬜ | |
| Validate checksums | ⬜ | |
| Update link graph | ⬜ | |

**Records**: ___/___ migrated  
**Issues**:  
**Sample file**: `20-permanent/decision-YYYY-MM-DD-[slug].md`

---

#### 2. Meeting Debriefs → `meeting` documents

| Step | Status | Notes |
|------|--------|-------|
| Export from DB | ⬜ | |
| Group by date | ⬜ | |
| Transform to frontmatter | ⬜ | |
| Write to `00-fleeting/02-meetings/` | ⬜ | |
| Link to decisions/risks | ⬜ | |

**Records**: ___/___ migrated  
**Issues**:  
**Sample file**: `00-fleeting/02-meetings/2024-01-15-team-standup.md`

---

#### 3. Specs → `spec` documents

| Step | Status | Notes |
|------|--------|-------|
| Export from DB | ⬜ | |
| Transform to frontmatter | ⬜ | |
| Write to `20-permanent/` | ⬜ | |
| Link to implementations | ⬜ | |

**Records**: ___/___ migrated  
**Issues**:  
**Sample file**: `20-permanent/spec-api-authentication.md`

---

#### 4. Risks → `risk` documents

| Step | Status | Notes |
|------|--------|-------|
| Export from DB | ⬜ | |
| Transform to frontmatter | ⬜ | |
| Write to `20-permanent/` | ⬜ | |
| Link to related decisions | ⬜ | |

**Records**: ___/___ migrated  
**Issues**:  
**Sample file**: `20-permanent/risk-database-migration.md`

---

### 🟡 Tier 2: High

#### 5. Person Notes → `person` documents

| Step | Status | Notes |
|------|--------|-------|
| Export from DB | ⬜ | |
| Deduplicate names | ⬜ | |
| Create person MOC | ⬜ | |
| Transform to frontmatter | ⬜ | |
| Write to `20-permanent/` | ⬜ | |

**Records**: ___/___ migrated  
**Unique people**: ___  
**Issues**:  
**Sample file**: `20-permanent/person-alice-chen.md`

---

#### 6. Insights → `insight` documents

| Step | Status | Notes |
|------|--------|-------|
| Export from DB | ⬜ | |
| Transform to frontmatter | ⬜ | |
| Write to `20-permanent/` | ⬜ | |

**Records**: ___/___ migrated  
**Issues**:  
**Sample file**: `20-permanent/insight-zettelkasten-principle.md`

---

#### 7. AI Saves → `ai_save` documents

| Step | Status | Notes |
|------|--------|-------|
| Export from DB | ⬜ | |
| Transform to frontmatter | ⬜ | |
| Write to `10-literature/` | ⬜ | |

**Records**: ___/___ migrated  
**Issues**:  
**Sample file**: `10-literature/ai-save-claude-code-patterns.md`

---

#### 8. Sent → `sent` documents

| Step | Status | Notes |
|------|--------|-------|
| Export from DB | ⬜ | |
| Transform to frontmatter | ⬜ | |
| Write to `00-fleeting/` | ⬜ | |

**Records**: ___/___ migrated  
**Issues**:  
**Sample file**: `00-fleeting/sent-2024-01-15-proposal.md`

---

### 🟢 Tier 3: Medium/Low

#### 9-19. Remaining Templates

| Template | Records | Status | Issues |
|----------|---------|--------|--------|
| Milestone | ___ | ⬜ | |
| Budget | ___ | ⬜ | |
| Invoice | ___ | ⬜ | |
| Funding | ___ | ⬜ | |
| Stakeholder | ___ | ⬜ | |
| Legal | ___ | ⬜ | |
| Compliance | ___ | ⬜ | |
| Contract | ___ | ⬜ | |
| Nutrition | ___ | ⬜ | |
| Health | ___ | ⬜ | |
| Home | ___ | ⬜ | |

---

## Validation Checklist

### Data Integrity

- [ ] All Tier 1 records migrated
- [ ] No data loss (compare counts)
- [ ] Checksums match (Git ↔ DB)
- [ ] Timestamps preserved

### Link Validation

- [ ] Run broken link checker
- [ ] <1% broken link rate
- [ ] All `[[person:...]]` resolve
- [ ] All `[[decision:...]]` resolve
- [ ] Backlinks populated

### Application Testing

- [ ] Morning Briefing loads
- [ ] Document viewer works
- [ ] Search returns results
- [ ] Captures list shows migrated data
- [ ] Action items display correctly

### Performance

- [ ] Search <5 seconds
- [ ] Document load <2 seconds
- [ ] Backlink query <1 second

---

## Rollback Plan

If critical issues arise:

1. **Immediate**: Disable document sync
   ```bash
   npm run sync:disable
   ```

2. **Within 24h**: Restore old table RLS
   ```sql
   ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
   ```

3. **Within 1 week**: Full rollback if needed
   ```bash
   psql $DATABASE_URL < openbrain-backup-YYYYMMDD.sql
   ```

---

## Post-Migration Actions

- [ ] Archive old `thoughts` table (rename to `thoughts_archive`)
- [ ] Update team on new workflow
- [ ] Schedule training session
- [ ] Update CLAUDE.md with new architecture
- [ ] Celebrate! 🎉

---

**Started**: ___  
**Completed**: ___  
**Migrated by**: ___
