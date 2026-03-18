# Google Workspace Integration Plan

**Objective:** Integrate Kev's Google Workspace (Gmail, Calendar, Drive, Docs, Sheets, Tasks) with Open Brain for real-time bidirectional sync.

**Date:** March 17, 2026  
**Status:** Planning Phase  
**Estimated Duration:** 3-4 days

---

## Phase 0: Documentation Discovery & Architecture

### 0.1 Research Google APIs

**Tasks:**
1. Read Google Workspace API documentation for:
   - Gmail API (watch, history, messages)
   - Google Calendar API (events, watch, sync)
   - Google Drive API (changes, files, permissions)
   - Google Docs API (documents, content extraction)
   - Google Sheets API (spreadsheets, values)
   - Google Tasks API (tasklists, tasks)

2. Identify authentication method:
   - OAuth 2.0 with service account vs user credential flow
   - Required scopes for each API
   - Token refresh strategy

3. Define webhook/push notification approach:
   - Gmail push notifications (Pub/Sub or Cloud Functions)
   - Calendar push notifications
   - Drive change notifications

### 0.2 Open Brain Integration Points

**Existing Integration Pattern:**
```
Google Workspace → Apps Script → Edge Function → Supabase
```

**New Pattern for Real-time Sync:**
```
Google Workspace → Push Notification → Edge Function → Supabase
                    ↓
              Poll Fallback (15 min)
```

**Integration Points:**
1. Extend existing `ingest-thought` Edge Function for email_items
2. Create new `google-sync` Edge Function for bidirectional sync
3. Create new `google-webhook` Edge Function for push notifications
4. Update `gemini-brief` API to use real data instead of mock
5. Create Google Apps Script for polling fallback

### 0.3 Data Model Extensions

**New Tables Needed:**

```sql
-- Email items (extracted from Gmail)
CREATE TABLE email_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gmail_id TEXT UNIQUE NOT NULL,
  thread_id TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_addresses TEXT[],
  cc_addresses TEXT[],
  subject TEXT,
  snippet TEXT,
  body_text TEXT,
  received_at TIMESTAMPTZ,
  labels TEXT[],
  template TEXT, -- Open Brain template classification
  action_required BOOLEAN DEFAULT false,
  due_date DATE,
  reply_to_email_id TEXT,
  thought_id UUID REFERENCES thoughts(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events sync
CREATE TABLE calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gcal_event_id TEXT UNIQUE NOT NULL,
  calendar_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  attendees JSONB DEFAULT '[]',
  organizer TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  status TEXT DEFAULT 'confirmed',
  meet_link TEXT,
  thought_id UUID REFERENCES thoughts(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drive file tracking
CREATE TABLE drive_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  drive_file_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT,
  web_view_link TEXT,
  created_time TIMESTAMPTZ,
  modified_time TIMESTAMPTZ,
  last_modifying_user TEXT,
  parents TEXT[],
  shared BOOLEAN DEFAULT false,
  owners JSONB DEFAULT '[]',
  thought_id UUID REFERENCES thoughts(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Google Tasks sync
CREATE TABLE google_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_task_id TEXT UNIQUE NOT NULL,
  tasklist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  due_date DATE,
  status TEXT DEFAULT 'needsAction', -- needsAction, completed
  completed_at TIMESTAMPTZ,
  parent_task_id TEXT,
  position TEXT,
  links JSONB DEFAULT '[]',
  thought_id UUID REFERENCES thoughts(id),
  reclaim_task_id TEXT, -- Link to Reclaim if synced
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync state tracking
CREATE TABLE google_sync_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT UNIQUE NOT NULL, -- gmail, calendar, drive, tasks
  last_sync_at TIMESTAMPTZ,
  last_history_id TEXT, -- Gmail history ID
  next_page_token TEXT, -- For pagination
  sync_token TEXT, -- For Calendar incremental sync
  change_token TEXT, -- For Drive changes
  status TEXT DEFAULT 'active',
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 1: Authentication & Service Account Setup

### 1.1 Google Cloud Project Configuration

**Tasks:**
1. Create or use existing Google Cloud Project
2. Enable APIs:
   - Gmail API
   - Google Calendar API
   - Google Drive API
   - Google Docs API
   - Google Sheets API
   - Google Tasks API

3. Configure OAuth consent screen:
   - User type: Internal (idirnet domain)
   - Scopes needed:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify` (for labels)
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/drive.metadata.readonly`
     - `https://www.googleapis.com/auth/documents.readonly`
     - `https://www.googleapis.com/auth/spreadsheets.readonly`
     - `https://www.googleapis.com/auth/tasks`
     - `https://www.googleapis.com/auth/tasks.readonly`

4. Create OAuth 2.0 credentials (for user auth flow)
5. Download client secrets JSON

### 1.2 Supabase Secrets Configuration

**Secrets to set:**
```bash
supabase secrets set GOOGLE_CLIENT_ID=<client_id>
supabase secrets set GOOGLE_CLIENT_SECRET=<client_secret>
supabase secrets set GOOGLE_REDIRECT_URI=https://<project-ref>.supabase.co/functions/v1/google-auth/callback
supabase secrets set GOOGLE_REFRESH_TOKEN=<refresh_token_from_oauth_flow>
```

### 1.3 OAuth Flow Implementation

**Create:** `~/supabase/functions/google-auth/index.ts`

Two endpoints:
1. `GET /google-auth/initiate` - Start OAuth flow, return auth URL
2. `GET /google-auth/callback` - Handle callback, exchange code for tokens, store refresh token

**Verification:**
- [ ] OAuth flow completes successfully
- [ ] Refresh token is stored securely
- [ ] Token can be used to make API calls

---

## Phase 2: Gmail Integration

### 2.1 Email Ingest Edge Function

**Create:** `~/supabase/functions/email-ingest/index.ts`

**Capabilities:**
1. Fetch recent emails (unread or all with specific labels)
2. Extract structured data:
   - Headers (from, to, cc, subject, date)
   - Body (text content, stripped of HTML)
   - Attachments metadata
3. Classify against Open Brain templates using existing classification logic
4. Store in `email_items` table
5. Mark processed emails with label "OB-processed"

**API Pattern:**
```typescript
// GET /functions/v1/email-ingest
// Query params: maxResults=50, labelIds=INBOX,UNREAD, q=subject:urgent

// POST /functions/v1/email-ingest  
// Body: { "action": "sync", "historyId": "12345" } // Incremental sync
```

### 2.2 Gmail Push Notifications (Optional Advanced)

**For true real-time:**
1. Create Cloud Pub/Sub topic
2. Configure Gmail watch on mailbox
3. Create `google-webhook` Edge Function to receive Pub/Sub messages
4. Trigger email-ingest on notification

**Fallback (Phase 2.3):** Polling via Apps Script

### 2.3 Google Apps Script Polling

**Create:** Standalone Apps Script "Open Brain Gmail Sync"

**Trigger:** Time-driven, every 15 minutes

**Logic:**
```javascript
function syncGmailToOpenBrain() {
  // 1. Get last sync state from PropertiesService
  // 2. Fetch emails since last sync
  // 3. For each email:
  //    - Extract structured data
  //    - POST to email-ingest Edge Function
  //    - Apply "OB-processed" label
  // 4. Update last sync state
}
```

### 2.4 Template Classification

**Integrate with existing `ingest-thought` classification:**

Emails are classified as:
- `Sent:` - Outbound correspondence
- `Stakeholder:` - Client/partner updates  
- `Decision:` - Decision requests or confirmations
- `Risk:` - Risk flagging
- `Budget:` - Financial matters
- `Invoice:` - Billing related
- `Compliance:` - Audit/legal notices

**Classification prompt (reuse from ingest-thought):**
```
Given this email, classify it against Open Brain templates.
Email subject: {subject}
From: {from}
Body: {body}

Return JSON: { template: string, formatted: string, action_required: boolean, due_date?: string }
```

### 2.5 Integration with Gemini Brief

**Update:** `~/OPENBRAIN/openBrain/apps/dashboard/app/api/gemini-brief/route.ts`

Replace mock email data with real data from `email_items` table:
```typescript
// Fetch priority emails from Supabase
const { data: priorityEmails } = await supabase
  .from('email_items')
  .select('*')
  .eq('action_required', true)
  .order('received_at', { ascending: false })
  .limit(10);

// Include in Gemini prompt for context
```

**Verification:**
- [ ] Emails are fetched and stored
- [ ] Template classification works
- [ ] Gemini Brief shows real email data
- [ ] OB-processed label is applied

---

## Phase 3: Google Calendar Integration

### 3.1 Calendar Sync Edge Function

**Create:** `~/supabase/functions/calendar-sync/index.ts`

**Capabilities:**
1. Sync events from primary calendar
2. Support incremental sync using sync tokens
3. Extract meeting details with attendees
4. Link to existing thoughts (match by attendee names, topics)
5. Store in `calendar_events` table

**API Pattern:**
```typescript
// GET /functions/v1/calendar-sync
// Query params: days=7, calendarId=primary

// POST /functions/v1/calendar-sync
// Body: { "action": "incremental", "syncToken": "abc123" }
```

### 3.2 Meeting Preprocessing

**Before meetings:**
1. Query related thoughts (attendee names, topics)
2. Query related emails (same attendees, subjects)
3. Generate prep summary
4. Store in calendar_event.metadata.prep_needed

**Create:** `~/supabase/functions/meeting-prep/index.ts`

Called 15 minutes before meeting via scheduled function.

### 3.3 Calendar Push Notifications

**Setup watch on calendar:**
```
POST https://www.googleapis.com/calendar/v3/calendars/primary/events/watch
{
  "id": "unique-channel-id",
  "type": "web_hook",
  "address": "https://<project-ref>.supabase.co/functions/v1/google-webhook/calendar"
}
```

### 3.4 Integration with Gemini Brief

**Update:** `~/OPENBRAIN/openBrain/apps/dashboard/app/api/gemini-brief/route.ts`

Replace mock calendar data:
```typescript
// Fetch today's events
const today = new Date().toISOString().split('T')[0];
const { data: events } = await supabase
  .from('calendar_events')
  .select('*')
  .gte('start_time', `${today}T00:00:00`)
  .lte('start_time', `${today}T23:59:59`)
  .order('start_time');
```

**Verification:**
- [ ] Calendar events sync
- [ ] Attendees are parsed
- [ ] Meeting links are captured
- [ ] Gemini Brief shows real calendar data

---

## Phase 4: Google Drive Integration

### 4.1 Drive Sync Edge Function

**Create:** `~/supabase/functions/drive-sync/index.ts`

**Capabilities:**
1. Track recent file changes (last 24 hours)
2. Identify files Kev has access to
3. Detect shared files, comments, edits
4. Cross-reference with calendar events
5. Store in `drive_files` table

**API Pattern:**
```typescript
// GET /functions/v1/drive-sync
// Query params: hours=24, folderId=optional

// Uses Drive Changes API with change tokens
```

### 4.2 Document Content Extraction

**For Docs and Sheets:**
1. Extract text content from Google Docs
2. Extract values from Google Sheets (first sheet)
3. Store content summary in metadata
4. Generate embeddings for semantic search

**Create:** `~/supabase/functions/document-extract/index.ts`

### 4.3 Drive Activity Integration

**Link to thoughts:**
- If file is about a project mentioned in thoughts → link thought_id
- If file is shared with stakeholder → create/update Stakeholder thought
- If file is spec document → create/update Spec thought

### 4.4 Integration with Gemini Brief

**Update:** `~/OPENBRAIN/openBrain/apps/dashboard/app/api/gemini-brief/route.ts`

Replace mock Drive data:
```typescript
// Fetch recent drive activity
const { data: driveActivity } = await supabase
  .from('drive_files')
  .select('*')
  .order('modified_time', { ascending: false })
  .limit(20);
```

**Verification:**
- [ ] Drive changes are tracked
- [ ] File metadata is stored
- [ ] Related meetings are linked
- [ ] Gemini Brief shows real Drive activity

---

## Phase 5: Google Tasks Integration

### 5.1 Tasks Sync Edge Function

**Create:** `~/supabase/functions/tasks-sync/index.ts`

**Capabilities:**
1. Sync tasks from all tasklists
2. Bidirectional sync with Open Brain action items
3. Link tasks to thoughts
4. Sync with Reclaim.ai (optional)

**API Pattern:**
```typescript
// GET /functions/v1/tasks-sync
// Query params: tasklistId=@default

// POST /functions/v1/tasks-sync
// Body: { "action": "create", "title": "...", "due": "..." }
```

### 5.2 Action Item Integration

**Flow:**
1. Open Brain thought has action item → Create Google Task
2. Google Task completed → Mark thought action item complete
3. Task due date changes → Update thought metadata

**Bidirectional sync logic:**
- Compare `thoughts.metadata.action_items` with `google_tasks`
- Create tasks for new action items
- Update thoughts when tasks completed

### 5.3 Integration with Morning Brief

**Update Dashboard:** Show tasks from both Open Brain and Google Tasks

**Verification:**
- [ ] Tasks sync bidirectionally
- [ ] Action items create Google Tasks
- [ ] Task completion updates thoughts

---

## Phase 6: Google Sheets Export

### 6.1 Sheets Export Edge Function

**Create:** `~/supabase/functions/sheets-export/index.ts`

**Capabilities:**
1. Export thoughts to specified Google Sheet
2. Support filtering by template, date range, person
3. Create new sheets or append to existing
4. Format data for readability

**API Pattern:**
```typescript
// POST /functions/v1/sheets-export
// Body: {
//   "spreadsheetId": "...",
//   "sheetName": "Captures",
//   "filter": { "template": "Decision", "since": "2026-03-01" }
// }
```

### 6.2 Weekly/Monthly Reports

**Scheduled function:** Export weekly summary to Sheets
- Decisions made
- Risks flagged
- Milestones hit
- Action items completed

**Verification:**
- [ ] Data exports to Sheets
- [ ] Formatting is readable
- [ ] Scheduled exports work

---

## Phase 7: Real-time Sync Infrastructure

### 7.1 Push Notification Webhook

**Create:** `~/supabase/functions/google-webhook/index.ts`

**Handles:**
- Gmail push notifications
- Calendar push notifications
- Drive change notifications

**Logic:**
1. Verify webhook token/signature
2. Parse notification type
3. Trigger appropriate sync function
4. Return 200 OK quickly

### 7.2 Scheduled Sync Jobs

**Create Supabase Cron jobs:**
```sql
-- Every 15 minutes: Gmail sync
SELECT cron.schedule('gmail-sync', '*/15 * * * *', 
  'SELECT net.http_get(url:=''https://<project-ref>.supabase.co/functions/v1/email-ingest?maxResults=50'')');

-- Every hour: Calendar sync
SELECT cron.schedule('calendar-sync', '0 * * * *',
  'SELECT net.http_get(url:=''https://<project-ref>.supabase.co/functions/v1/calendar-sync'')');

-- Every hour: Drive sync  
SELECT cron.schedule('drive-sync', '0 * * * *',
  'SELECT net.http_get(url:=''https://<project-ref>.supabase.co/functions/v1/drive-sync'')');
```

### 7.3 Conflict Resolution

**Handle sync conflicts:**
- Last-write-wins for most data
- Merge strategy for action items
- Manual resolution for conflicting edits

**Verification:**
- [ ] Webhooks receive notifications
- [ ] Scheduled jobs run
- [ ] Conflicts are handled gracefully

---

## Phase 8: Dashboard & UI Updates

### 8.1 Unified Google Workspace Card

**Update:** `~/OPENBRAIN/openBrain/apps/dashboard/app/page.tsx`

Create new component: `GoogleWorkspaceCard.tsx`

Shows:
- Unread priority emails
- Today's meetings with prep
- Recent Drive activity
- Pending tasks

### 8.2 Email Detail View

**Create:** `EmailDetail.tsx` component

Shows:
- Email thread
- Open Brain classification
- Related thoughts
- Quick actions (create task, mark done)

### 8.3 Calendar Integration

**Update:** `ReclaimSchedule.tsx` to include Google Calendar events

**Verification:**
- [ ] Dashboard shows unified workspace view
- [ ] Email details are accessible
- [ ] Calendar and tasks are integrated

---

## Phase 9: Testing & Verification

### 9.1 Unit Tests

**Test each Edge Function:**
- gmail-sync: mock Gmail API responses
- calendar-sync: mock Calendar API responses
- drive-sync: mock Drive API responses
- Classification accuracy test

### 9.2 Integration Tests

**End-to-end scenarios:**
1. Receive email → classify → store → show in dashboard
2. Calendar event created → sync → link to thoughts
3. File edited → track → show in morning brief
4. Task completed → update thought → sync to Reclaim

### 9.3 Performance Tests

**Benchmarks:**
- Sync 100 emails: < 30 seconds
- Sync 7 days of calendar: < 10 seconds
- Dashboard load with real data: < 3 seconds

### 9.4 Verification Checklist

- [ ] All Edge Functions deployed and active
- [ ] OAuth flow works for new users
- [ ] Gmail sync captures and classifies emails
- [ ] Calendar sync tracks events
- [ ] Drive sync monitors file changes
- [ ] Tasks sync bidirectionally
- [ ] Gemini Brief uses real data
- [ ] Dashboard shows unified view
- [ ] Mobile responsive
- [ ] No PII exposed in logs

---

## Deployment Plan

### Step 1: Database Migrations
```bash
supabase db push
```

### Step 2: Deploy Edge Functions (in order)
```bash
supabase functions deploy google-auth
supabase functions deploy email-ingest
supabase functions deploy calendar-sync
supabase functions deploy drive-sync
supabase functions deploy tasks-sync
supabase functions deploy google-webhook
```

### Step 3: Configure Secrets
```bash
supabase secrets set GOOGLE_CLIENT_ID=...
supabase secrets set GOOGLE_CLIENT_SECRET=...
supabase secrets set GOOGLE_REFRESH_TOKEN=...
```

### Step 4: Setup Google Apps Script
1. Create standalone script
2. Add OAuth library
3. Configure triggers
4. Authorize API access

### Step 5: Test End-to-End
```bash
# Test email sync
curl "https://<project-ref>.supabase.co/functions/v1/email-ingest?maxResults=5"

# Test calendar sync  
curl "https://<project-ref>.supabase.co/functions/v1/calendar-sync?days=1"
```

### Step 6: Update Dashboard
```bash
cd ~/OPENBRAIN/openBrain/apps/dashboard
npm run build
npm run deploy  # or vercel --prod
```

---

## Rollback Plan

If issues occur:
1. Disable Apps Script triggers
2. Delete Supabase cron jobs
3. Unpublish Edge Functions
4. Restore dashboard to previous version
5. Data remains intact in Supabase

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Email capture rate | > 95% of unread emails |
| Classification accuracy | > 80% template match |
| Calendar sync latency | < 1 hour |
| Dashboard load time | < 3 seconds |
| User action required | < 1 min/day |

---

## Next Steps

1. **Review this plan** with Kev
2. **Approve scope** (full integration vs phased)
3. **Begin Phase 1** (Authentication)
4. **Deploy iteratively** (one service at a time)
5. **Gather feedback** and refine

---

**Plan Created:** March 17, 2026  
**Plan Version:** 1.0  
**Author:** Claude Code (Orchestrator) + Gemini Workspace Agent
