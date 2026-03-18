/**
 * Open Brain Gmail Ingest — DEBUG VERSION
 * Use this to troubleshoot issues
 */

function testDebug() {
  const config = getConfig();
  
  console.log('=== DEBUG OUTPUT ===');
  console.log('EDGE_FUNCTION_URL exists:', !!config.edgeFunctionUrl);
  console.log('MCP_ACCESS_KEY exists:', !!config.mcpAccessKey);
  console.log('URL length:', config.edgeFunctionUrl ? config.edgeFunctionUrl.length : 0);
  console.log('KEY length:', config.mcpAccessKey ? config.mcpAccessKey.length : 0);
  
  if (!config.edgeFunctionUrl || !config.mcpAccessKey) {
    console.error('❌ ERROR: Missing required properties');
    console.log('Go to Project Settings → Script Properties and add:');
    console.log('- EDGE_FUNCTION_URL');
    console.log('- MCP_ACCESS_KEY');
    return;
  }
  
  console.log('✅ Config looks good, running ingest...');
  runEmailIngest();
}

function runEmailIngest() {
  const config = getConfig();

  if (!config.edgeFunctionUrl || !config.mcpAccessKey) {
    console.error('❌ Missing EDGE_FUNCTION_URL or MCP_ACCESS_KEY in Script Properties');
    return;
  }

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

  console.log('📤 Sending request:', JSON.stringify(payload));
  console.log('🌐 URL:', config.edgeFunctionUrl);

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

    console.log('📥 Response status:', statusCode);
    console.log('📥 Response body:', body);

    if (statusCode !== 200) {
      console.error('❌ Edge function error:', statusCode, body);
      return;
    }

    const result = JSON.parse(body);
    console.log('✅ Sync complete:', JSON.stringify(result, null, 2));

    if (result.historyId) {
      props.setProperty('GMAIL_HISTORY_ID', result.historyId);
      console.log('💾 Stored history ID:', result.historyId);
    }

    console.log(`📊 Processed: ${result.processed}, New: ${result.new}, Updated: ${result.updated}`);
    
  } catch (err) {
    console.error('❌ Apps Script error:', err.toString());
  }
}

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    edgeFunctionUrl: props.getProperty('EDGE_FUNCTION_URL'),
    mcpAccessKey: props.getProperty('MCP_ACCESS_KEY'),
  };
}

function setupTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'runEmailIngest')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('runEmailIngest')
    .timeBased()
    .everyMinutes(15)
    .create();

  console.log('✅ Trigger created: runEmailIngest every 15 minutes');
}

function resetSync() {
  PropertiesService.getScriptProperties().deleteProperty('GMAIL_HISTORY_ID');
  console.log('🔄 History ID cleared — next run will perform full sync');
}
