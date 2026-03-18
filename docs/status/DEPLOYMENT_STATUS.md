# Google Workspace Integration - Deployment Status

**Date:** March 17, 2026  
**Status:** Functions Deployed ✅ | Database Migration Pending ⏳

---

## ✅ Successfully Deployed

### Edge Functions (6/6 ACTIVE)

| Function | Status | Version | Endpoint |
|----------|--------|---------|----------|
| google-auth | ✅ ACTIVE | 1 | `/functions/v1/google-auth` |
| email-ingest | ✅ ACTIVE | 1 | `/functions/v1/email-ingest` |
| calendar-sync | ✅ ACTIVE | 1 | `/functions/v1/calendar-sync` |
| drive-sync | ✅ ACTIVE | 1 | `/functions/v1/drive-sync` |
| tasks-sync | ✅ ACTIVE | 1 | `/functions/v1/tasks-sync` |
| google-webhook | ✅ ACTIVE | 1 | `/functions/v1/google-webhook` |

**Dashboard:** https://supabase.com/dashboard/project/jeuxslbhjubxmhtzpvqf/functions

---

## ⏳ Pending: Database Migration

The migration needs to be applied via the Supabase Dashboard SQL Editor (CLI has issues with earlier migrations).

### Step 1: Open SQL Editor
1. Go to https://supabase.com/dashboard/project/jeuxslbhjubxmhtzpvqf/sql/new
2. Copy the SQL below
3. Click "Run"

### Step 2: Apply Migration SQL

```sql
-- Google Workspace Integration Migration
-- Stores synced data from Gmail, Calendar, Drive, and Tasks

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. EMAIL ITEMS (Processed Gmail messages)
-- ============================================

CREATE TABLE IF NOT EXISTS email_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gmail_id TEXT UNIQUE NOT NULL,
  thread_id TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_addresses TEXT[] DEFAULT '{}',
  cc_addresses TEXT[] DEFAULT '{}',
  subject TEXT,
  snippet TEXT,
  body_text TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  labels TEXT[] DEFAULT '{}',
  template TEXT, -- Open Brain template classification
  action_required BOOLEAN DEFAULT false,
  due_date DATE,
  reply_to_email_id TEXT,
  thought_id UUID REFERENCES thoughts(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_items_gmail_id ON email_items(gmail_id);
CREATE INDEX IF NOT EXISTS idx_email_items_received_at ON email_items(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_items_action_required ON email_items(action_required) WHERE action_required = true;
CREATE INDEX IF NOT EXISTS idx_email_items_thought_id ON email_items(thought_id);

-- ============================================
-- 2. CALENDAR EVENTS (Google Calendar events)
-- ============================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gcal_event_id TEXT UNIQUE NOT NULL,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  attendees JSONB DEFAULT '[]',
  organizer TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  status TEXT DEFAULT 'confirmed',
  meet_link TEXT,
  thought_id UUID REFERENCES thoughts(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_gcal_id ON calendar_events(gcal_event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_thought_id ON calendar_events(thought_id);

-- ============================================
-- 3. DRIVE FILES (Google Drive file tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS drive_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_file_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT,
  web_view_link TEXT,
  created_time TIMESTAMP WITH TIME ZONE,
  modified_time TIMESTAMP WITH TIME ZONE,
  last_modifying_user TEXT,
  parents TEXT[] DEFAULT '{}',
  shared BOOLEAN DEFAULT false,
  owners JSONB DEFAULT '[]',
  thought_id UUID REFERENCES thoughts(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drive_files_drive_id ON drive_files(drive_file_id);
CREATE INDEX IF NOT EXISTS idx_drive_files_modified_time ON drive_files(modified_time DESC);
CREATE INDEX IF NOT EXISTS idx_drive_files_thought_id ON drive_files(thought_id);

-- ============================================
-- 4. GOOGLE TASKS (Synced Google Tasks)
-- ============================================

CREATE TABLE IF NOT EXISTS google_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_task_id TEXT UNIQUE NOT NULL,
  tasklist_id TEXT NOT NULL DEFAULT '@default',
  title TEXT NOT NULL,
  notes TEXT,
  due_date DATE,
  status TEXT DEFAULT 'needsAction',
  completed_at TIMESTAMP WITH TIME ZONE,
  parent_task_id TEXT,
  position TEXT,
  links JSONB DEFAULT '[]',
  thought_id UUID REFERENCES thoughts(id) ON DELETE SET NULL,
  reclaim_task_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_tasks_task_id ON google_tasks(google_task_id);
CREATE INDEX IF NOT EXISTS idx_google_tasks_due_date ON google_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_google_tasks_status ON google_tasks(status);
CREATE INDEX IF NOT EXISTS idx_google_tasks_thought_id ON google_tasks(thought_id);

-- ============================================
-- 5. GOOGLE SYNC STATE (Incremental sync tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS google_sync_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service TEXT UNIQUE NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_history_id TEXT,
  next_page_token TEXT,
  sync_token TEXT,
  change_token TEXT,
  status TEXT DEFAULT 'active',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_sync_state_service ON google_sync_state(service);

-- ============================================
-- 6. AUTO-UPDATE TRIGGERS
-- ============================================

-- Ensure the update function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for all new tables
DROP TRIGGER IF EXISTS update_email_items_updated_at ON email_items;
CREATE TRIGGER update_email_items_updated_at
  BEFORE UPDATE ON email_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drive_files_updated_at ON drive_files;
CREATE TRIGGER update_drive_files_updated_at
  BEFORE UPDATE ON drive_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_tasks_updated_at ON google_tasks;
CREATE TRIGGER update_google_tasks_updated_at
  BEFORE UPDATE ON google_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_sync_state_updated_at ON google_sync_state;
CREATE TRIGGER update_google_sync_state_updated_at
  BEFORE UPDATE ON google_sync_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. UTILITY FUNCTIONS
-- ============================================

-- Function: Get emails requiring action
CREATE OR REPLACE FUNCTION get_action_required_emails(
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  gmail_id TEXT,
  from_address TEXT,
  subject TEXT,
  received_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  days_waiting INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.gmail_id,
    e.from_address,
    e.subject,
    e.received_at,
    e.due_date,
    EXTRACT(DAY FROM NOW() - e.received_at)::INTEGER as days_waiting
  FROM email_items e
  WHERE e.action_required = true
    AND (e.due_date IS NULL OR e.due_date >= CURRENT_DATE)
  ORDER BY 
    CASE WHEN e.due_date IS NOT NULL THEN 0 ELSE 1 END,
    e.due_date ASC NULLS LAST,
    e.received_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get upcoming calendar events
CREATE OR REPLACE FUNCTION get_upcoming_events(
  p_days INTEGER DEFAULT 7,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  gcal_event_id TEXT,
  title TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  has_meet_link BOOLEAN,
  days_until INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.id,
    ce.gcal_event_id,
    ce.title,
    ce.start_time,
    ce.end_time,
    ce.location,
    ce.meet_link IS NOT NULL as has_meet_link,
    EXTRACT(DAY FROM ce.start_time - NOW())::INTEGER as days_until
  FROM calendar_events ce
  WHERE ce.start_time >= NOW()
    AND ce.start_time <= NOW() + INTERVAL '1 day' * p_days
    AND ce.status != 'cancelled'
  ORDER BY ce.start_time ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get recently modified drive files
CREATE OR REPLACE FUNCTION get_recent_drive_files(
  p_days INTEGER DEFAULT 7,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  drive_file_id TEXT,
  name TEXT,
  mime_type TEXT,
  modified_time TIMESTAMP WITH TIME ZONE,
  last_modifying_user TEXT,
  is_shared BOOLEAN,
  days_since_modified INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    df.id,
    df.drive_file_id,
    df.name,
    df.mime_type,
    df.modified_time,
    df.last_modifying_user,
    df.shared as is_shared,
    EXTRACT(DAY FROM NOW() - df.modified_time)::INTEGER as days_since_modified
  FROM drive_files df
  WHERE df.modified_time >= NOW() - INTERVAL '1 day' * p_days
  ORDER BY df.modified_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Get pending tasks
CREATE OR REPLACE FUNCTION get_pending_tasks(
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  google_task_id TEXT,
  title TEXT,
  notes TEXT,
  due_date DATE,
  days_until_due INTEGER,
  is_overdue BOOLEAN,
  reclaim_task_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gt.id,
    gt.google_task_id,
    gt.title,
    gt.notes,
    gt.due_date,
    CASE 
      WHEN gt.due_date IS NOT NULL THEN EXTRACT(DAY FROM gt.due_date - CURRENT_DATE)::INTEGER
      ELSE NULL
    END as days_until_due,
    CASE 
      WHEN gt.due_date IS NOT NULL AND gt.due_date < CURRENT_DATE THEN true
      ELSE false
    END as is_overdue,
    gt.reclaim_task_id
  FROM google_tasks gt
  WHERE gt.status = 'needsAction'
  ORDER BY 
    CASE WHEN gt.due_date IS NULL THEN 1 ELSE 0 END,
    gt.due_date ASC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Google Workspace sync overview
CREATE OR REPLACE VIEW google_workspace_overview AS
SELECT
  'email' as data_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE action_required = true) as action_required_count,
  MAX(received_at) as last_activity
FROM email_items
UNION ALL
SELECT
  'calendar' as data_type,
  COUNT(*),
  COUNT(*) FILTER (WHERE start_time > NOW()),
  MAX(start_time)
FROM calendar_events
UNION ALL
SELECT
  'drive' as data_type,
  COUNT(*),
  COUNT(*) FILTER (WHERE shared = true),
  MAX(modified_time)
FROM drive_files
UNION ALL
SELECT
  'tasks' as data_type,
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'needsAction'),
  MAX(updated_at)
FROM google_tasks;

-- View: Sync health status
CREATE OR REPLACE VIEW google_sync_health AS
SELECT
  service,
  last_sync_at,
  EXTRACT(EPOCH FROM (NOW() - last_sync_at))/60 as minutes_since_sync,
  status,
  retry_count,
  CASE 
    WHEN last_sync_at IS NULL THEN 'never_synced'
    WHEN EXTRACT(EPOCH FROM (NOW() - last_sync_at))/3600 > 24 THEN 'stale'
    WHEN status = 'error' THEN 'error'
    WHEN retry_count > 5 THEN 'failing'
    ELSE 'healthy'
  END as health_status
FROM google_sync_state;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE email_items IS 'Processed Gmail messages synced from Google Workspace';
COMMENT ON TABLE calendar_events IS 'Google Calendar events synced from Google Workspace';
COMMENT ON TABLE drive_files IS 'Google Drive files tracked from Google Workspace';
COMMENT ON TABLE google_tasks IS 'Google Tasks synced from Google Workspace';
COMMENT ON TABLE google_sync_state IS 'Incremental sync state tracking for Google Workspace services';
```

---

## 🔐 Next: OAuth Setup

After the SQL migration is applied, you need to complete OAuth setup:

### Step 1: Get Google OAuth Credentials
1. Go to https://console.cloud.google.com/
2. Create project "Open Brain Integration"
3. Enable APIs: Gmail, Calendar, Drive, Tasks
4. Configure OAuth Consent Screen
5. Create OAuth 2.0 credentials (Web application)
6. Add redirect URI: `https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/callback`

### Step 2: Set Supabase Secrets

```bash
# Set Google OAuth credentials
supabase secrets set GOOGLE_CLIENT_ID="your-client-id"
supabase secrets set GOOGLE_CLIENT_SECRET="your-client-secret"
supabase secrets set GOOGLE_REDIRECT_URI="https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/callback"
```

### Step 3: Complete OAuth Flow

1. Visit: `https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/google-auth/initiate`
2. Sign in with kev@idirnet.com
3. Grant permissions
4. Copy the refresh_token from the success page

### Step 4: Store Refresh Token

```bash
supabase secrets set GOOGLE_REFRESH_TOKEN="your-refresh-token"
```

---

## 🔄 Set Up Google Apps Script (Polling)

1. Go to https://script.google.com
2. Create project: "Open Brain Workspace Sync"
3. Paste code from `~/OPENBRAIN/openBrain/integrations/google/apps-script/legacy/OpenBrainSync.gs`
4. Run `setupProperties()` - enter MCP_ACCESS_KEY
5. Run `setup()` - creates 15-minute trigger
6. Run `testSync()` - authorize permissions

---

## 📊 Verification Commands

After OAuth is complete:

```bash
# Test email sync
curl "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/email-ingest?key=$MCP_ACCESS_KEY&maxResults=5"

# Test calendar sync
curl "https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/calendar-sync?key=$MCP_ACCESS_KEY&days=7"

# Check sync status
psql -h db.jeuxslbhjubxmhtzpvqf.supabase.co -U postgres -c "SELECT * FROM google_sync_health;"
```

---

## 🎯 Deployment Checklist

- [x] Link Supabase project
- [x] Deploy 6 Edge Functions
- [ ] Apply database migration (SQL Editor)
- [ ] Create Google Cloud Project
- [ ] Enable Google APIs
- [ ] Configure OAuth Consent Screen
- [ ] Create OAuth Credentials
- [ ] Set Supabase Secrets (CLIENT_ID, CLIENT_SECRET)
- [ ] Complete OAuth Flow (get refresh token)
- [ ] Set Refresh Token secret
- [ ] Set up Google Apps Script
- [ ] Test sync functions
- [ ] Verify dashboard shows real data

---

**Questions or issues?** Check:
- `~/OPENBRAIN/openBrain/docs/guides/GOOGLE_CLOUD_SETUP.md` - Detailed setup guide
- `~/OPENBRAIN/openBrain/docs/guides/GOOGLE_WORKSPACE_DEPLOYMENT_CHECKLIST.md` - Full deployment guide
