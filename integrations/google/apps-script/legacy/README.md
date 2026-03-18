# Open Brain Google Apps Script Integration

This Apps Script provides polling-based sync between Google Workspace and Open Brain.

## Setup Instructions

### 1. Create Standalone Script
1. Go to https://script.google.com
2. Create new project: "Open Brain Workspace Sync"
3. Paste code from `OpenBrainSync.gs`

### 2. Enable APIs
1. Click **Services** (+) next to "Services"
2. Add:
   - Gmail API
   - Google Calendar API
   - Google Drive API
   - Tasks API (Advanced Google Services)

### 3. Set Properties
1. Run `setupProperties()` function
2. Enter MCP Access Key when prompted
   - Find this in your Supabase secrets or `.claude.json`

### 4. Create Trigger
1. Run `setup()` function
2. This creates a time-driven trigger running every 15 minutes

### 5. Authorize
1. Run `testSync()` function
2. Grant all requested permissions

## Manual Testing

Run individual sync functions:
- `syncGmail()` - Sync emails only
- `syncCalendar()` - Sync calendar only
- `syncDrive()` - Sync Drive files only
- `syncTasks()` - Sync tasks only
- `testSync()` - Run full sync

## Logs

View execution logs:
1. Click **Executions** (⏱️ icon)
2. See recent function runs
3. Click any execution for details
