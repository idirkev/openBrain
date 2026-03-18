/**
 * Open Brain Gmail Ingest — Google Apps Script
 *
 * Deploy at: script.google.com
 * Set up time-driven trigger: every 15 minutes
 *
 * Configuration:
 *   Set EDGE_FUNCTION_URL and MCP_ACCESS_KEY in Script Properties
 *   (Project Settings → Script Properties)
 */

// -----------------------------------------------
// CONFIG — set these in Script Properties, not here
// -----------------------------------------------
function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    edgeFunctionUrl: props.getProperty('EDGE_FUNCTION_URL'),
    // e.g. https://jeuxslbhjubxmhtzpvqf.supabase.co/functions/v1/email-ingest
    mcpAccessKey: props.getProperty('MCP_ACCESS_KEY'),
  };
}

// -----------------------------------------------
// MAIN — called by time-driven trigger every 15 min
// -----------------------------------------------
function runEmailIngest() {
  const config = getConfig();

  if (!config.edgeFunctionUrl || !config.mcpAccessKey) {
    console.error('Missing EDGE_FUNCTION_URL or MCP_ACCESS_KEY in Script Properties');
    return;
  }

  // Check if we have a stored history ID for incremental sync
  const props = PropertiesService.getScriptProperties();
  const lastHistoryId = props.getProperty('GMAIL_HISTORY_ID');
  const action = lastHistoryId ? 'incremental' : 'fullSync';

  const payload = {
    action: action,
    maxResults: 50,
    labelIds: ['INBOX'],
  };

  if (action === 'incremental') {
    payload.historyId = lastHistoryId;
  }

  console.log('Running email ingest, action:', action);

  try {
    const response = UrlFetchApp.fetch(config.edgeFunctionUrl, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-brain-key': config.mcpAccessKey,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const statusCode = response.getResponseCode();
    const body = response.getContentText();

    if (statusCode !== 200) {
      console.error('Edge function error:', statusCode, body);
      return;
    }

    const result = JSON.parse(body);
    console.log('Sync complete:', JSON.stringify(result));

    // Store the new history ID for next incremental sync
    if (result.historyId) {
      props.setProperty('GMAIL_HISTORY_ID', result.historyId);
      console.log('Updated history ID to:', result.historyId);
    }

    // If incremental sync failed because history ID is stale, clear it for full sync next run
    if (result.errors && result.errors.some(e => e.includes('History ID expired'))) {
      console.log('History ID expired — clearing for full sync next run');
      props.deleteProperty('GMAIL_HISTORY_ID');
    }

    console.log(
      `Processed: ${result.processed}, New: ${result.new}, Updated: ${result.updated}`
    );
  } catch (err) {
    console.error('Apps Script error:', err.toString());
  }
}

// -----------------------------------------------
// SETUP — run once to install the time trigger
// -----------------------------------------------
function setupTrigger() {
  // Delete any existing triggers for this function
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'runEmailIngest')
    .forEach(t => ScriptApp.deleteTrigger(t));

  // Create new 15-minute trigger
  ScriptApp.newTrigger('runEmailIngest')
    .timeBased()
    .everyMinutes(15)
    .create();

  console.log('Trigger created: runEmailIngest every 15 minutes');
}

// -----------------------------------------------
// RESET — clear stored history ID to force full sync
// -----------------------------------------------
function resetSync() {
  PropertiesService.getScriptProperties().deleteProperty('GMAIL_HISTORY_ID');
  console.log('History ID cleared — next run will perform full sync');
}
