# Open Brain — Project Handover

**Date:** 2026-03-17 16:30 GMT
**From:** Session S237 (Google OAuth Fix + API Enable)
**Status:** Google Workspace integration LIVE

---

## COMPLETED THIS SESSION

1. Fixed `GOOGLE_REDIRECT_URI` missing from Supabase secrets
2. Redeployed all 6 Edge Functions with `--no-verify-jwt` (google-auth, email-ingest, calendar-sync, drive-sync, tasks-sync, google-webhook)
3. Set correct `GOOGLE_CLIENT_SECRET` (was mismatched)
4. Completed OAuth flow, got fresh refresh token
5. User enabled 4 Google APIs in Cloud Console (Gmail, Calendar, Drive, Tasks)
6. Fixed Drive API `changeTime` field bug (should be `time`) in both repo and deploy locations
7. Removed `gmail.modify` scope — user wants read-only Gmail access
8. All 4 services tested and returning real data

**Important discovery:** Supabase CLI deploys from `~/supabase/functions/` (linked project location), NOT from `~/OPENBRAIN/openBrain/services/supabase/functions/`. Both locations have copies. Edits must go to `~/supabase/functions/` for deploys to take effect.

## NEXT TASK

**Launch the Morning Briefing Dashboard and verify it displays live Google data.**

### Steps

1. **Start the dashboard:**
   ```bash
   cd /Users/kevfreeney/OPENBRAIN/openBrain/apps/dashboard
   npm run dev
   # Visit http://localhost:3000
   ```

2. **Verify dashboard shows real data from all 4 services:**
   - Calendar events (31 synced)
   - Gmail summaries (3 processed)
   - Drive recent files
   - Tasks

3. **Fix any dashboard issues** — the dashboard fetches from the Edge Functions. Check `apps/dashboard/app/page.tsx` and component files for hardcoded URLs or missing env vars.

4. **Sync the two function directories** — `~/supabase/functions/` is the deploy source, `~/OPENBRAIN/openBrain/services/supabase/functions/` is the repo copy. They should match. Consider symlinking or documenting which is canonical.

5. **Commit working state** — all OAuth and API fixes should be committed.

### Key Files
| File | Purpose |
|------|---------|
| `services/supabase/functions/_shared/google-auth.ts` | Token refresh logic (working) |
| `services/supabase/functions/google-auth/index.ts` | OAuth flow (working, read-only Gmail) |
| `services/supabase/functions/drive-sync/index.ts` | Fixed `time` field (both locations) |
| `apps/dashboard/app/page.tsx` | Dashboard main page |
| `apps/dashboard/src/features/email/components/EmailInbox.tsx` | Email display component |
| `apps/dashboard/.env.local` | Dashboard config |

### Working Endpoints (all use `?key=<MCP_ACCESS_KEY>`)
```
https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/calendar-sync?key=...&days=7
https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/email-ingest?key=...&maxResults=3
https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/drive-sync?key=...
https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/tasks-sync?key=...
```

### Credentials
- Supabase URL: `https://jeuxslbhjubxmhtzpvqf.supabase.co`
- MCP_ACCESS_KEY: `91375beb3df1c34169a802c11d1195cf7d65a10886896152f58c20dd5344128a`
- Google Client ID: `550429763060-rj4ckub7hjasccbhu4til46tq6k8o8ae.apps.googleusercontent.com`
- OAuth consent screen: Testing mode (tokens expire after 7 days)
