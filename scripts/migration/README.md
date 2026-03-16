# Open Brain Migration Scripts

Scripts for migrating from the current database-centric system to the new document-based system.

## Setup

```bash
cd scripts/migration
npm install
```

Set environment variables:

```bash
export SUPABASE_URL="https://jeuxslbhjubxmhtzpvqf.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Scripts

### 1. Export Data

Export thoughts from the database:

```bash
# Export all
npm run export

# Export specific template
npm run export:decisions
npm run export:meetings
npm run export:insights

# Custom export
npx tsx export-data.ts --template Risk --since 2024-01-01 --output risks.json
```

### 2. Transform to Markdown

Convert exported JSON to Markdown documents:

```bash
# Transform specific export
npm run transform:decisions

# Custom transform
npx tsx transform-to-markdown.ts --input export.json --output-dir ../../documents
```

### 3. Validate Links

Check for broken wikilinks:

```bash
npm run validate

# Or with custom path
npx tsx validate-links.ts --docs-dir ../../documents
```

### 4. Full Migration (Single Template)

Run export + transform + validate in one command:

```bash
npm run full:migrate-decisions
```

## Workflow

1. **Create document repository** (one-time):
   ```bash
   mkdir -p ../../documents
   cd ../../documents
   git init
   # Create folder structure per PLAYBOOK.md
   ```

2. **Export data by template**:
   ```bash
   npm run export:decisions
   npm run export:meetings
   # ... etc
   ```

3. **Transform to Markdown**:
   ```bash
   npm run transform:decisions
   ```

4. **Review and commit**:
   ```bash
   cd ../../documents
   git add .
   git commit -m "Migrate decisions from database"
   ```

5. **Validate links**:
   ```bash
   npm run validate
   ```

6. **Sync to database** (optional, for search):
   ```bash
   npm run sync:git-to-db
   ```

## Migration Order

Follow the tiers defined in `MIGRATION_ASSESSMENT.md`:

### Tier 1 (Critical)
1. Decisions
2. Meeting Debriefs
3. Specs
4. Risks

### Tier 2 (High)
5. Person Notes
6. Insights
7. AI Saves
8. Sent

### Tier 3 (Medium/Low)
9-19. Remaining templates

## Troubleshooting

### Missing environment variables
```
❌ Export failed: supabaseUrl is required
```
**Fix**: Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Empty export
```
✅ Found 0 records
```
**Fix**: Check template name spelling (case-sensitive)

### Broken links after migration
```
❌ Broken Links: 15
```
**Fix**: Person documents need to be created first (link targets)

## Files

| File | Purpose |
|------|---------|
| `export-data.ts` | Export from Supabase to JSON |
| `transform-to-markdown.ts` | Convert JSON to Markdown + frontmatter |
| `validate-links.ts` | Check for broken wikilinks |
| `MIGRATION_WORKSHEET.md` | Track migration progress |
