/**
 * Open Brain Google Workspace Sync
 * Triggers: Every 15 minutes via time-driven trigger
 */

// Open Brain configuration
// TODO: Configure supabaseUrl with your own Supabase project URL before deploying
const OB_CONFIG = {
  supabaseUrl: 'https://jeuxslbhjubxmhtzpvqf.supabase.co',
  mcpAccessKey: PropertiesService.getScriptProperties().getProperty('OB_MCP_ACCESS_KEY'),
  endpoints: {
    emailIngest: '/functions/v1/email-ingest',
    calendarSync: '/functions/v1/calendar-sync',
    driveSync: '/functions/v1/drive-sync',
    tasksSync: '/functions/v1/tasks-sync',
  }
};

/**
 * Main entry point - called by time trigger every 15 minutes
 */
function syncOpenBrain() {
  console.log('Starting Open Brain sync...');
  
  try {
    // Sync each service
    syncGmail();
    syncCalendar();
    syncDrive();
    syncTasks();
    
    console.log('Open Brain sync completed successfully');
  } catch (error) {
    console.error('Open Brain sync failed:', error);
    // Send error notification (optional)
    notifyError(error);
  }
}

/**
 * Sync Gmail messages
 */
function syncGmail() {
  console.log('Syncing Gmail...');
  
  // Get the OB-processed label
  const label = getOrCreateLabel('OB-processed');
  
  // Search for emails without the label (unprocessed)
  // Use Gmail search query to find recent unread emails
  const threads = GmailApp.search('in:inbox -label:OB-processed newer_than:1d', 0, 50);
  
  console.log(`Found ${threads.length} unprocessed email threads`);
  
  for (const thread of threads) {
    const messages = thread.getMessages();
    
    for (const message of messages) {
      // Extract email data
      const emailData = {
        gmailId: message.getId(),
        threadId: thread.getId(),
        from: message.getFrom(),
        to: message.getTo().split(',').map(e => e.trim()),
        cc: message.getCc() ? message.getCc().split(',').map(e => e.trim()) : [],
        subject: message.getSubject(),
        snippet: message.getPlainBody().substring(0, 500),
        bodyText: message.getPlainBody().substring(0, 10000),
        receivedAt: message.getDate().toISOString(),
        labels: message.getLabels().map(l => l.getName()),
      };
      
      // Send to Open Brain
      const response = callOpenBrain(OB_CONFIG.endpoints.emailIngest, {
        method: 'POST',
        payload: {
          action: 'classify',
          email: emailData,
        }
      });
      
      if (response.success) {
        // Mark as processed
        thread.addLabel(label);
        console.log(`Processed email: ${emailData.subject}`);
      } else {
        console.error(`Failed to process email: ${emailData.subject}`, response.error);
      }
    }
  }
  
  console.log('Gmail sync complete');
}

/**
 * Sync Calendar events
 */
function syncCalendar() {
  console.log('Syncing Calendar...');
  
  const calendar = CalendarApp.getDefaultCalendar();
  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead
  
  const events = calendar.getEvents(now, future);
  console.log(`Found ${events.length} upcoming events`);
  
  const eventsData = events.map(event => ({
    gcalEventId: event.getId(),
    title: event.getTitle(),
    description: event.getDescription(),
    startTime: event.getStartTime().toISOString(),
    endTime: event.getEndTime().toISOString(),
    location: event.getLocation(),
    guests: event.getGuestList().map(g => ({
      email: g.getEmail(),
      name: g.getName(),
      status: g.getGuestStatus(),
    })),
    isRecurring: event.isRecurringEvent(),
    meetLink: event.getVideoCallId() || null,
  }));
  
  const response = callOpenBrain(OB_CONFIG.endpoints.calendarSync, {
    method: 'POST',
    payload: {
      action: 'fullSync',
      events: eventsData,
    }
  });
  
  if (response.success) {
    console.log(`Synced ${eventsData.length} calendar events`);
  } else {
    console.error('Calendar sync failed:', response.error);
  }
}

/**
 * Sync Drive files
 */
function syncDrive() {
  console.log('Syncing Drive...');
  
  // Get files modified in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const files = DriveApp.searchFiles(`modifiedDate > "${oneHourAgo.toISOString().split('T')[0]}"`);
  
  const filesData = [];
  while (files.hasNext()) {
    const file = files.next();
    filesData.push({
      driveFileId: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      modifiedTime: file.getLastUpdated().toISOString(),
      createdTime: file.getDateCreated().toISOString(),
      lastModifyingUser: file.getLastUpdated() ? 'unknown' : null, // DriveApp doesn't expose editor name easily
      webViewLink: file.getUrl(),
      shared: file.isShareableByEditors(),
    });
  }
  
  console.log(`Found ${filesData.length} recently modified files`);
  
  if (filesData.length > 0) {
    const response = callOpenBrain(OB_CONFIG.endpoints.driveSync, {
      method: 'POST',
      payload: {
        action: 'incremental',
        files: filesData,
      }
    });
    
    if (response.success) {
      console.log(`Synced ${filesData.length} Drive files`);
    } else {
      console.error('Drive sync failed:', response.error);
    }
  }
}

/**
 * Sync Tasks
 */
function syncTasks() {
  console.log('Syncing Tasks...');
  
  // Note: TasksApp is limited in Google Apps Script
  // This is a placeholder - you may need to use Advanced Tasks API
  
  const tasks = Tasks.Tasks.list('@default');
  
  if (tasks.items) {
    const tasksData = tasks.items.map(task => ({
      googleTaskId: task.id,
      title: task.title,
      notes: task.notes,
      due: task.due,
      status: task.status,
      completed: task.completed,
    }));
    
    const response = callOpenBrain(OB_CONFIG.endpoints.tasksSync, {
      method: 'POST',
      payload: {
        action: 'syncFromGoogle',
        tasks: tasksData,
      }
    });
    
    if (response.success) {
      console.log(`Synced ${tasksData.length} tasks`);
    } else {
      console.error('Tasks sync failed:', response.error);
    }
  }
}

/**
 * Helper: Call Open Brain Edge Function
 */
function callOpenBrain(endpoint, options = {}) {
  const url = `${OB_CONFIG.supabaseUrl}${endpoint}?key=${OB_CONFIG.mcpAccessKey}`;
  
  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    muteHttpExceptions: true,
  };
  
  if (options.payload) {
    fetchOptions.payload = JSON.stringify(options.payload);
  }
  
  try {
    const response = UrlFetchApp.fetch(url, fetchOptions);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode >= 200 && responseCode < 300) {
      return {
        success: true,
        data: JSON.parse(responseText),
      };
    } else {
      return {
        success: false,
        error: `HTTP ${responseCode}: ${responseText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * Helper: Get or create Gmail label
 */
function getOrCreateLabel(name) {
  const labels = GmailApp.getUserLabels();
  for (const label of labels) {
    if (label.getName() === name) {
      return label;
    }
  }
  return GmailApp.createLabel(name);
}

/**
 * Setup function - run once to create triggers
 */
function setup() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    ScriptApp.deleteTrigger(trigger);
  }
  
  // Create 15-minute trigger
  ScriptApp.newTrigger('syncOpenBrain')
    .timeBased()
    .everyMinutes(15)
    .create();
  
  console.log('Open Brain sync trigger created (every 15 minutes)');
}

/**
 * Setup properties - run once to store secrets
 */
function setupProperties() {
  const properties = PropertiesService.getScriptProperties();
  
  // Prompt for values (or set directly)
  const mcpKey = Browser.inputBox('Enter Open Brain MCP Access Key:');
  properties.setProperty('OB_MCP_ACCESS_KEY', mcpKey);
  
  console.log('Properties set successfully');
}

/**
 * Test function - run to test sync manually
 */
function testSync() {
  syncOpenBrain();
}

/**
 * Error notification (optional)
 */
function notifyError(error) {
  // Could send email or post to Slack
  console.error('Sync error notification:', error);
}
