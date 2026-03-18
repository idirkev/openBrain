# Google Workspace Integration - Deployment Checklist

**Last Updated:** March 17, 2026  
**Status:** Ready for Deployment

---

## Pre-Deployment Checklist

### 1. Google Cloud Project Setup (Manual)

- [ ] Create Google Cloud Project at https://console.cloud.google.com/
- [ ] Project Name: "Open Brain Integration"
- [ ] Note the Project ID

**Enable APIs:**
- [ ] Gmail API
- [ ] Google Calendar API
- [ ] Google Drive API
- [ ] Google Tasks API

**Configure OAuth Consent Screen:**
- [ ] User Type: Internal (idirnet workspace) or External
- [ ] App name: "Open Brain"
- [ ] User support email: kev@idirnet.com
- [ ] Developer contact: kev@idirnet.com
- [ ] Add authorized domains: supabase.co, idirnet.com

**Add OAuth Scopes:**
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/drive.readonly
https://www.googleapis.com/auth/drive.metadata.readonly
https://www.googleapis.com/auth/tasks
https://www.googleapis.com/auth/tasks.readonly
```

**Create OAuth 2.0 Credentials:**
- [ ] Application type: Web application
- [ ] Name: "Open Brain Edge Functions"
- [ ] Authorized redirect URI: `https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/callback`
- [ ] Download client_secrets.json

---

### 2. Database Migration

```bash
# Apply migration
cd ~/OPENBRAIN/openBrain
supabase db push
```

- [ ] Migration 008_google_workspace_integration.sql applied
- [ ] Tables created: email_items, calendar_events, drive_files, google_tasks, google_sync_state
- [ ] Indexes created
- [ ] RLS policies applied

---

### 3. Supabase Secrets Configuration

```bash
# Set Google OAuth credentials
supabase secrets set GOOGLE_CLIENT_ID="your-client-id"
supabase secrets set GOOGLE_CLIENT_SECRET="your-client-secret"
supabase secrets set GOOGLE_REDIRECT_URI="https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/callback"
```

---

### 4. Deploy Edge Functions

```bash
# Deploy all functions
cd ~/OPENBRAIN/openBrain
supabase functions deploy google-auth
supabase functions deploy email-ingest
supabase functions deploy calendar-sync
supabase functions deploy drive-sync
supabase functions deploy tasks-sync
supabase functions deploy google-webhook
```

- [ ] google-auth deployed
- [ ] email-ingest deployed
- [ ] calendar-sync deployed
- [ ] drive-sync deployed
- [ ] tasks-sync deployed
- [ ] google-webhook deployed

---

### 5. OAuth Flow (Get Refresh Token)

```bash
# 1. Initiate OAuth flow
curl https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/initiate
# Or visit in browser

# 2. Complete consent in browser
# 3. Copy refresh_token from success page

# 4. Store refresh token
supabase secrets set GOOGLE_REFRESH_TOKEN="your-refresh-token"
```

- [ ] OAuth flow completed
- [ ] Refresh token stored in Supabase secrets

---

### 6. Set Up Google Apps Script (Polling Fallback)

1. [ ] Go to https://script.google.com
2. [ ] Create new project: "Open Brain Workspace Sync"
3. [ ] Paste code from `~/OPENBRAIN/openBrain/integrations/google/apps-script/legacy/OpenBrainSync.gs`
4. [ ] Enable APIs: Gmail, Calendar, Drive, Tasks
5. [ ] Run `setupProperties()` - enter MCP access key
6. [ ] Run `setup()` - create 15-minute trigger
7. [ ] Run `testSync()` - authorize permissions

---

### 7. Configure Push Notifications (Optional but Recommended)

**Calendar Watch:**
```bash
curl -X POST "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/calendar-sync?key=$MCP_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"watch"}'
```

**Drive Watch:**
```bash
curl -X POST "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/drive-sync?key=$MCP_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"watch"}'
```

**Note:** Domain verification may be required for webhooks on Supabase shared domains.

---

### 8. Dashboard Environment Variables

Ensure `~/OPENBRAIN/openBrain/apps/dashboard/.env.local` has:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://jeuxslbhjubxmhtzpvqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GEMINI_API_KEY=<gemini-api-key>
RECLAIM_API_KEY=<reclaim-api-key>
```

---

### 9. Build and Test Dashboard

```bash
cd ~/OPENBRAIN/openBrain/apps/dashboard
npm install
npm run build
npm start
```

Test endpoints:
```bash
# Test Gemini Brief (with real data)
curl http://localhost:3000/api/gemini-brief | jq .

# Test email sync
curl "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/email-ingest?key=$MCP_ACCESS_KEY&maxResults=5"

# Test calendar sync
curl "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/calendar-sync?key=$MCP_ACCESS_KEY&days=7"
```

---

### 10. Set Up Scheduled Sync (Alternative to Apps Script)

Create Supabase Cron jobs:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Gmail sync every 15 minutes
SELECT cron.schedule('gmail-sync', '*/15 * * * *', 
  'SELECT net.http_get(url:=''https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/email-ingest?key=<MCP_ACCESS_KEY>'')');

-- Calendar sync every hour
SELECT cron.schedule('calendar-sync', '0 * * * *',
  'SELECT net.http_get(url:=''https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/calendar-sync?key=<MCP_ACCESS_KEY>'')');

-- Drive sync every hour
SELECT cron.schedule('drive-sync', '0 * * * *',
  'SELECT net.http_get(url:=''https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/drive-sync?key=<MCP_ACCESS_KEY>'')');
```

---

## Post-Deployment Verification

### Data Flow Verification

- [ ] Send test email to kev@idirnet.com
- [ ] Verify email appears in `email_items` table within 15 minutes
- [ ] Create test calendar event
- [ ] Verify event appears in `calendar_events` table
- [ ] Modify a file in Google Drive
- [ ] Verify file change tracked in `drive_files` table
- [ ] Create task in Google Tasks
- [ ] Verify task appears in `google_tasks` table

### Dashboard Verification

- [ ] Load dashboard at http://localhost:3000
- [ ] Verify Gemini Brief card loads
- [ ] Verify emails display with real data
- [ ] Verify calendar events display
- [ ] Verify Drive activity shows
- [ ] Verify tasks are listed

### API Verification

```bash
# Test all endpoints
curl -s "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/email-ingest?key=$MCP_ACCESS_KEY&maxResults=1" | jq .status
curl -s "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/calendar-sync?key=$MCP_ACCESS_KEY&days=1" | jq .status
curl -s "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/drive-sync?key=$MCP_ACCESS_KEY" | jq .status
curl -s "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/tasks-sync?key=$MCP_ACCESS_KEY" | jq .status
```

---

## Troubleshooting

### Common Issues

**"Invalid grant" error:**
- Refresh token expired or revoked
- Solution: Re-run OAuth flow

**"Rate limit exceeded":**
- Gmail API has 250 quota units/second
- Solution: Increase delay between requests in Edge Function

**"Sync token expired":**
- Calendar/Drive sync tokens expire after some time
- Solution: Function automatically falls back to full sync

**No data in dashboard:**
- Check if sync has run
- Check `google_sync_state` table for errors
- Review Edge Function logs in Supabase Dashboard

---

## Rollback Plan

If issues occur:

1. **Disable sync:**
   - Delete Apps Script triggers
   - Or delete Supabase cron jobs: `SELECT cron.unschedule('gmail-sync');`

2. **Stop push notifications:**
   ```bash
   curl -X POST "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/calendar-sync?key=$MCP_ACCESS_KEY" \
     -d '{"action":"stopWatch"}'
   ```

3. **Unpublish Edge Functions:**
   ```bash
   supabase functions delete email-ingest
   supabase functions delete calendar-sync
   # etc.
   ```

4. **Database:** Data remains intact, can be cleaned later if needed

---

## Success Metrics

| Metric | Target | How to Check |
|--------|--------|--------------|
| Email capture rate | > 95% | `SELECT COUNT(*) FROM email_items WHERE received_at > NOW() - INTERVAL '1 day';` |
| Calendar sync latency | < 1 hour | Check `google_sync_state.last_sync_at` |
| Dashboard load time | < 3 seconds | Browser dev tools |
| Classification accuracy | > 80% | Manual review of `email_items.template` |

---

## Next Steps After Deployment

1. **Monitor sync health** via `google_sync_health` view
2. **Fine-tune classification** rules based on initial results
3. **Train Gemini** with idirnet-specific context for better briefs
4. **Add team members** to Google Apps Script (share project)
5. **Document** any customizations in project wiki

---

**Deployment completed by:** Claude Code + Gemini  
**Date:** March 17, 2026
