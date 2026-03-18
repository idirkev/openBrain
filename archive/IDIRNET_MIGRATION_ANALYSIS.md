# Deep Analysis: idirnet Data Migration Strategies

**Date:** 2026-03-16  
**Purpose:** Comprehensive comparison of approaches to get idirnet's local data online

---

## Executive Summary

idirnet contains **~5,300 structured records** across three main datasets:
- **773 open source applications** (curated from definitive-opensource)
- **4,178 free programming books/resources** (from EbookFoundation)
- **275 markdown documents** (internal knowledge base)

The current architecture is **local-first** (ChromaDB + Ollama), making it unusable for visitors. This analysis explores 5 approaches to make this data available online.

---

## The 5 Approaches

### Approach 1: Full Migration to Open Brain Supabase

**Concept:** Extend the existing Open Brain infrastructure to host all idirnet data

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE PROJECT                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   thoughts   │  │ opensource_  │  │    idirnet_docs      │  │
│  │   (existing) │  │    apps      │  │   (from markdown)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ free_books   │  │  tsm_nodes   │  │   email_items        │  │
│  │              │  │              │  │   (Phase 7)          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                    ┌──────────────────┐                        │
│                    │  pgvector        │                        │
│                    │  (embeddings)    │                        │
│                    └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │  Open Brain  │ │   idirnet    │ │   Morning    │
      │   (Slack)    │ │   (Web UI)   │ │   Briefing   │
      └──────────────┘ └──────────────┘ └──────────────┘
```

**Implementation:**
```sql
-- New tables in existing Supabase project
CREATE TABLE opensource_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    stars INTEGER,
    language TEXT,
    license TEXT,
    platforms TEXT[],
    tags TEXT[],
    repo_url TEXT,
    homepage_url TEXT,
    last_commit DATE,
    flags TEXT,
    embedding VECTOR(1536),  -- OpenAI text-embedding-3-small
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE free_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    url TEXT NOT NULL,
    category TEXT,
    section TEXT,
    formats TEXT[],
    license TEXT,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE idirnet_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    content TEXT,
    frontmatter JSONB,
    access_level TEXT CHECK (access_level IN ('public', 'network', 'team', 'leadership')),
    author TEXT,
    created DATE,
    updated DATE,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Migration Script Pattern:**
```typescript
// Edge Function: ingest-idirnet-data
import { createClient } from '@supabase/supabase-js';

export default async (req: Request) => {
  const { dataType, records } = await req.json();
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  
  // Generate embeddings via OpenRouter
  const embeddings = await Promise.all(
    records.map(r => generateEmbedding(r.description || r.content))
  );
  
  // Bulk insert with embeddings
  const { error } = await supabase
    .from(dataType)
    .insert(records.map((r, i) => ({ ...r, embedding: embeddings[i] })));
    
  return new Response(JSON.stringify({ success: !error }));
};
```

| Aspect | Assessment |
|--------|------------|
| **Time to implement** | 2-3 weeks |
| **Cost** | ~$25-50/month (existing Supabase plan + vector storage) |
| **Data volume** | ~50MB + embeddings (~300MB) |
| **Complexity** | Medium — extends existing pattern |
| **Risk** | Low — proven infrastructure |
| **Unified search** | ✅ Yes — single query across all data |
| **Personal + Collective** | ✅ Yes — thoughts + idirnet in one DB |

---

### Approach 2: Fix idirnet In-Place (Keep ChromaDB, Make It Remote)

**Concept:** Keep idirnet's Python/ChromaDB stack but deploy it properly

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel (Frontend)                       │
│              Next.js 16 — same as current                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Railway / Render / VPS                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   FastAPI    │  │   ChromaDB   │  │      Ollama          │  │
│  │   (RAG API)  │  │   (vectors)  │  │    (llama3.2)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                  │                                       │
│         └──────────────────┘                                       │
│                   │                                                │
│              Python Backend                                        │
└─────────────────────────────────────────────────────────────────┘
```

**Required Changes:**
1. **Fix citation paths** — Use relative slugs instead of absolute paths
2. **Add access control to RAG** — Filter ChromaDB results by user level
3. **Deploy Python stack** — Railway/Render for FastAPI + ChromaDB
4. **Ollama replacement options:**
   - Option A: Deploy Ollama on GPU instance ($$$)
   - Option B: Switch to OpenRouter (loses privacy)
   - Option C: Use smaller models on CPU (slower)

**ChromaDB Access Control Pattern:**
```python
# scripts/rag_api.py — modified
@app.post("/query")
async def query(request: QueryRequest, user: User = Depends(get_user)):
    # Filter by access level before querying ChromaDB
    allowed_levels = get_access_levels(user.tier)  # e.g., ['public', 'network']
    
    results = collection.query(
        query_embeddings=[embedding],
        n_results=10,
        where={"access_level": {"$in": allowed_levels}}  # <-- NEW
    )
    return results
```

| Aspect | Assessment |
|--------|------------|
| **Time to implement** | 3-4 weeks |
| **Cost** | $50-200/month (depending on Ollama option) |
| **Complexity** | High — new deployment pattern, infra management |
| **Risk** | Medium — unfamiliar hosting pattern |
| **Privacy preserved** | ⚠️ Only if self-hosting Ollama (expensive) |
| **Tim's feedback addressed** | ⚠️ Partial (citations fixed, documents still in ChromaDB) |

---

### Approach 3: Hybrid — Keep Files, Add Supabase as Search Layer

**Concept:** Keep markdown files in Git (as source of truth), add Supabase only for search

```
┌─────────────────────────────────────────────────────────────────┐
│                    TWO DATA LAYERS                              │
│                                                                 │
│  ┌─────────────────────────┐    ┌──────────────────────────┐   │
│  │   GIT (Source of Truth) │    │   SUPABASE (Search Index)│   │
│  │                         │    │                          │   │
│  │  content/**/*.md        │───▶│  idirnet_docs            │   │
│  │  src/data/*.json        │    │  (slugs + embeddings)    │   │
│  │                         │    │                          │   │
│  │  275 markdown files     │    │  Full-text search        │   │
│  │  773 OSS apps (JSON)    │    │  Vector search           │   │
│  │  4178 books (JSON)      │    │  Access control          │   │
│  │                         │    │                          │   │
│  │  GitHub Actions sync    │    │  Re-indexed on push      │   │
│  └─────────────────────────┘    └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Next.js App    │
                    │                  │
                    │  Content: Git    │
                    │  Search: Supabase│
                    └──────────────────┘
```

**GitHub Actions Workflow:**
```yaml
# .github/workflows/sync-to-supabase.yml
name: Sync to Search Index
on:
  push:
    branches: [main]
    
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Index content to Supabase
        run: |
          pip install -r requirements.txt
          python scripts/index_to_supabase.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```

| Aspect | Assessment |
|--------|------------|
| **Time to implement** | 2 weeks |
| **Cost** | $25-50/month |
| **Complexity** | Medium — sync logic needed |
| **Risk** | Low — Git remains source of truth |
| **Document-centric view** | ✅ Yes — files stay as files |
| **Search performance** | ✅ Yes — Supabase handles vectors |
| **Sync complexity** | ⚠️ Must handle deletes, renames |

---

### Approach 4: Static Site + Client-Side Search (No Database)

**Concept:** Pre-build search index at deploy time, serve as static JSON

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUILD TIME                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Markdown   │  │   Generate   │  │   Static JSON        │  │
│  │   Files      │──▶│   Indices    │──▶│   (search index)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Static)                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Next.js    │  │  MiniSearch  │  │   Static JSON        │  │
│  │   (SSG)      │  │  (client)    │  │   (pre-built)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  No database, no backend — all search happens in browser       │
└─────────────────────────────────────────────────────────────────┘
```

**Build Script:**
```typescript
// scripts/build-search-index.ts
import MiniSearch from 'minisearch';
import { getAllContent } from '../src/lib/content';

const content = await getAllContent();
const miniSearch = new MiniSearch({
  fields: ['title', 'content', 'tags'],
  storeFields: ['title', 'slug', 'excerpt']
});

miniSearch.addAll(content);
await fs.writeFile('./public/search-index.json', JSON.stringify(miniSearch.toJSON()));
```

**Client-Side Search:**
```typescript
// src/hooks/useSearch.ts
import MiniSearch from 'minisearch';

const index = useMemo(async () => {
  const response = await fetch('/search-index.json');
  const json = await response.json();
  return MiniSearch.loadJSON(json, { fields: ['title', 'content'] });
}, []);

const results = index.search(query);
```

| Aspect | Assessment |
|--------|------------|
| **Time to implement** | 1 week |
| **Cost** | $0 (Vercel hobby tier) |
| **Complexity** | Low — no backend |
| **Risk** | Very low |
| **Semantic search** | ❌ No — only text matching |
| **AI chat** | ❌ No — no RAG possible |
| **Scalability** | ⚠️ Index size ~5MB, manageable |
| **Offline capable** | ✅ Yes — works without internet |

---

### Approach 5: Edge-Native Architecture (Deno/Supabase Functions Only)

**Concept:** No Python, no ChromaDB — pure TypeScript on edge functions

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTIONS                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Deno Runtime                                           │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  ingest-idir │  │   search-    │  │   capture-   │  │   │
│  │  │  net-content │  │   thoughts   │  │   thought    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                         │   │
│  │  No Python runtime — all TypeScript/Deno               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   + pgvector     │
                    └──────────────────┘
```

**Key Innovation:** Use `postgres-meta` or `pgvector` directly from Deno:
```typescript
// services/supabase/functions/search-unified/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const { query, userTier } = await req.json();
  
  // Generate embedding via OpenRouter
  const embedding = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${Deno.env.get('OPENROUTER_KEY')}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: query })
  }).then(r => r.json());
  
  // Query all tables with access control
  const { data: results } = await supabase.rpc('unified_search', {
    query_embedding: embedding,
    user_access_level: userTier,
    match_threshold: 0.7,
    match_count: 10
  });
  
  return new Response(JSON.stringify(results));
});
```

| Aspect | Assessment |
|--------|------------|
| **Time to implement** | 3 weeks |
| **Cost** | $25-50/month |
| **Complexity** | Medium-High — rewrite Python logic in TS |
| **Risk** | Medium — new patterns |
| **Cold starts** | ⚠️ Edge functions can be slow |
| **No Python maintenance** | ✅ Simpler stack |
| **Scales infinitely** | ✅ Yes — edge-native |

---

## Comparative Analysis

### Decision Matrix

| Criterion | Approach 1 | Approach 2 | Approach 3 | Approach 4 | Approach 5 |
|-----------|------------|------------|------------|------------|------------|
| **Implementation Time** | 2-3 wks | 3-4 wks | 2 wks | 1 wk | 3 wks |
| **Monthly Cost** | $25-50 | $50-200 | $25-50 | $0 | $25-50 |
| **Operational Complexity** | Low | High | Medium | Low | Medium |
| **Semantic Search** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **AI Chat / RAG** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Access Control** | ✅ | ⚠️ | ✅ | ❌ | ✅ |
| **Document-Centric** | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ |
| **Privacy-Preserving** | ⚠️ | ⚠️* | ⚠️ | ✅ | ⚠️ |
| **Unified Personal+Collective** | ✅ | ❌ | ⚠️ | ❌ | ✅ |
| **Proven Pattern** | ✅ | ❌ | ⚠️ | ✅ | ⚠️ |
| **Scalability** | ✅ | ⚠️ | ✅ | ⚠️ | ✅ |

\* Only if self-hosting Ollama (expensive)

### Cost Breakdown (Monthly Estimates)

| Approach | Infra | Hosting | LLM API | Total |
|----------|-------|---------|---------|-------|
| **1. Full Supabase** | Supabase Pro $25 | Vercel Free | OpenRouter ~$10 | **$35** |
| **2. Fixed idirnet** | Railway $25 + ChromaDB $15 | Vercel Free | Ollama GPU $150 OR OpenRouter $20 | **$60-190** |
| **3. Hybrid** | Supabase Pro $25 | Vercel Free | OpenRouter ~$10 | **$35** |
| **4. Static** | None | Vercel Free | None | **$0** |
| **5. Edge-Native** | Supabase Pro $25 | Vercel Free | OpenRouter ~$10 | **$35** |

### Risk Assessment

| Risk | Approach 1 | Approach 2 | Approach 3 | Approach 4 | Approach 5 |
|------|------------|------------|------------|------------|------------|
| **Data loss** | Low (Supabase backups) | Medium | Low (Git backup) | Low (Git backup) | Low (Supabase backups) |
| **Vendor lock-in** | Medium (Supabase) | Low | Medium (Supabase) | Low | Medium (Supabase) |
| **Performance issues** | Low | Medium (Python cold starts) | Low | Low (client-side) | Medium (edge cold starts) |
| **Maintenance burden** | Low | High (Python infra) | Medium (sync logic) | Low | Low |
| **Feature limitations** | None | None | Sync complexity | No AI chat | Edge timeouts |

---

## Recommendation

### Primary Recommendation: **Approach 3 (Hybrid)** with elements of Approach 1

**Why:**
1. **Preserves document-centric view** — Tim's core feedback. Markdown files stay as files.
2. **Lowest risk** — Git remains source of truth; Supabase is just a search index
3. **Addresses access control** — Can filter search results by user tier in Supabase
4. **Cost-effective** — ~$35/month
5. **Proven pattern** — Similar to how GitHub Codesearch or Algolia Docsearch work

**Architecture:**
```
Markdown Files (Git) ──▶ GitHub Actions ──▶ Supabase (search index only)
                                                     │
                                                     ▼
                    Next.js ──▶ Read files from Git for display
                            ──▶ Query Supabase for search
```

**Implementation Plan:**

**Phase 1: Content Indexing (Week 1)**
- Create `idirnet_docs` table in Supabase
- Build `scripts/index_to_supabase.py` (reads markdown, generates embeddings, upserts)
- Add GitHub Actions workflow for auto-reindex on push

**Phase 2: Search API (Week 2)**
- Create `/api/search` route in Next.js
- Query Supabase with access level filtering
- Return results with file paths for linking

**Phase 3: Document Pages (Week 3-4)**
- Build `/docs/[...slug]` pages that read from Git
- Link search results to document pages
- Add "Edit in GitHub" buttons

### Secondary Option: Approach 4 (Static) for MVP

If you want something **working this week** without any database:
- Implement client-side search with MiniSearch
- Skip AI chat for now
- Add semantic search later via Approach 3

### What to Avoid

- **Approach 2 (Fix in-place)** — Too expensive, too complex, doesn't solve the core issue
- **Full migration (Approach 1)** — Loses the document-centric view Tim wants

---

## Open Questions

Before proceeding, clarify:

1. **Is AI chat (RAG) required for v1, or is search enough?**
   - If search only → Approach 4 (static) gets you live in days
   - If AI chat required → Approach 3 or 5

2. **How important is privacy-preserving AI?**
   - If critical → Self-host Ollama (expensive) or client-side inference
   - If not → OpenRouter is fine

3. **Do you need real-time collaboration?**
   - If yes → Need operational transform (more complex)
   - If no → Git-based workflow is fine

4. **What's the budget ceiling?**
   - $0 → Approach 4
   - $50 → Approach 3
   - $200 → Approach 2 (with self-hosted Ollama)

---

## Appendix: Data Volume Calculations

### Open Source Apps (773 records)
```
Raw JSON: ~475 KB
With embeddings (1536 dims × 4 bytes): ~4.7 MB
Supabase storage: ~5 MB
```

### Free Books (4,178 records)
```
Raw JSON: ~1.6 MB
With embeddings: ~25 MB
Supabase storage: ~27 MB
```

### Markdown Documents (275 files)
```
Raw content: ~131 MB
With embeddings: ~200 MB
Supabase storage: ~330 MB
```

### Total
```
Raw data: ~133 MB
With embeddings: ~230 MB
Supabase vector storage: ~360 MB
Cost at Supabase: Included in Pro tier ($25)
```

---

## Next Steps

1. **Review this analysis** and decide on approach
2. **Clarify open questions** above
3. **Create detailed implementation plan** for chosen approach
4. **Start with data migration scripts** (can be tested locally)
