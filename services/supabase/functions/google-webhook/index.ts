/**
 * Google Webhook Edge Function for Open Brain
 * 
 * Receives push notifications from Google Workspace (Calendar, Drive, Gmail)
 * and triggers appropriate sync functions asynchronously.
 * 
 * Endpoints:
 * POST /functions/v1/google-webhook/calendar - Google Calendar push notifications
 * POST /functions/v1/google-webhook/drive   - Google Drive push notifications
 * POST /functions/v1/google-webhook/gmail   - Gmail Pub/Sub notifications
 * 
 * IMPORTANT: Always returns 200 OK quickly to prevent Google retries.
 * Sync operations are triggered asynchronously (fire-and-forget).
 */

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.47.10";

// ============================================
// Types
// ============================================

interface PubSubMessage {
  message: {
    data: string;  // base64 encoded
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

interface GmailPubSubData {
  historyId: string;
  emailAddress: string;
}

// ============================================
// Configuration
// ============================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Goog-Channel-ID, X-Goog-Channel-Token, X-Goog-Resource-ID, X-Goog-Resource-State, X-Goog-Message-Number, X-Goog-Changed",
};

// ============================================
// Sync Trigger Functions (Fire and Forget)
// ============================================

/**
 * Trigger sync via HTTP call (fire-and-forget pattern)
 * We don't await this to ensure quick response to Google
 */
function triggerSyncHttp(service: string, accessKey: string, extraBody?: Record<string, unknown>): void {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  
  if (!supabaseUrl) {
    console.error("SUPABASE_URL not configured");
    return;
  }

  const body: Record<string, unknown> = { action: "incremental" };
  if (extraBody) {
    Object.assign(body, extraBody);
  }

  // Fire and forget - don't await
  fetch(`${supabaseUrl}/functions/v1/${service}-sync?key=${accessKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(err => console.error(`Trigger ${service} failed:`, err));
}

/**
 * Trigger email ingest via HTTP (separate endpoint)
 */
function triggerEmailSync(accessKey: string, historyId?: string): void {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  
  if (!supabaseUrl) {
    console.error("SUPABASE_URL not configured");
    return;
  }

  const body: Record<string, unknown> = { action: "incremental" };
  if (historyId) {
    body.historyId = historyId;
  }

  // Fire and forget
  fetch(`${supabaseUrl}/functions/v1/email-ingest?key=${accessKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(err => console.error("Trigger email sync failed:", err));
}

// ============================================
// Channel Verification
// ============================================

/**
 * Verify channel token (optional security check)
 * If a token was set when creating the watch, verify it matches
 */
async function verifyChannel(
  supabase: SupabaseClient, 
  channelId: string, 
  token: string | null
): Promise<boolean> {
  // If no token provided in request, skip verification
  if (!token) {
    return true;
  }

  try {
    const { data } = await supabase
      .from("google_sync_state")
      .select("channel_token, channel_id")
      .eq("channel_id", channelId)
      .single();

    // If no stored token, allow (backwards compatibility)
    if (!data?.channel_token) {
      return true;
    }

    return data.channel_token === token;
  } catch (error) {
    console.error("Channel verification error:", error);
    // Fail open to prevent sync disruption (log the error)
    return true;
  }
}

// ============================================
// Webhook Handlers
// ============================================

/**
 * Handle Google Calendar push notifications
 * 
 * Headers:
 * - X-Goog-Channel-ID: string
 * - X-Goog-Channel-Token: string (optional, for verification)
 * - X-Goog-Resource-ID: string
 * - X-Goog-Resource-State: string (sync|exists|not_exists)
 * - X-Goog-Message-Number: string
 */
async function handleCalendarWebhook(req: Request, supabase: SupabaseClient): Promise<Response> {
  const headers = req.headers;
  
  const channelId = headers.get("X-Goog-Channel-ID");
  const resourceId = headers.get("X-Goog-Resource-ID");
  const resourceState = headers.get("X-Goog-Resource-State");
  const channelToken = headers.get("X-Goog-Channel-Token");
  const messageNumber = headers.get("X-Goog-Message-Number");
  
  console.log("Calendar webhook received:", {
    channelId,
    resourceId,
    resourceState,
    messageNumber,
    timestamp: new Date().toISOString(),
  });

  // Validate required headers
  if (!channelId || !resourceId || !resourceState) {
    console.error("Missing required headers for calendar webhook");
    return new Response("Missing required headers", { status: 400 });
  }

  // Optional: Verify channel token
  const isValid = await verifyChannel(supabase, channelId, channelToken);
  if (!isValid) {
    console.error("Invalid channel token for calendar webhook:", channelId);
    return new Response("Invalid channel token", { status: 403 });
  }

  // Resource state: 'sync' (initial), 'exists' (update), 'not_exists' (deleted)
  if (resourceState === "sync") {
    // Initial sync notification - no action needed
    console.log("Calendar sync notification received (initial setup)");
    return new Response("Sync notification received", { status: 200 });
  }

  // Get access key for triggering sync
  const accessKey = Deno.env.get("MCP_ACCESS_KEY");
  if (!accessKey) {
    console.error("MCP_ACCESS_KEY not configured");
    return new Response("Server configuration error", { status: 500 });
  }

  // Trigger calendar sync (async, don't await)
  triggerSyncHttp("calendar", accessKey);
  console.log("Calendar sync triggered asynchronously");

  // Update sync state (don't await, best effort)
  supabase
    .from("google_sync_state")
    .upsert({
      service: "calendar",
      last_webhook_at: new Date().toISOString(),
      status: "active",
    }, { onConflict: "service" })
    .then(({ error }) => {
      if (error) {
        console.error("Failed to update calendar sync state:", error);
      }
    });

  return new Response("Webhook processed", { status: 200 });
}

/**
 * Handle Google Drive push notifications
 * 
 * Headers:
 * - X-Goog-Channel-ID: string
 * - X-Goog-Channel-Token: string
 * - X-Goog-Resource-ID: string
 * - X-Goog-Resource-State: string (change)
 * - X-Goog-Changed: string (comma-separated: file,etc)
 */
async function handleDriveWebhook(req: Request, supabase: SupabaseClient): Promise<Response> {
  const headers = req.headers;
  
  const channelId = headers.get("X-Goog-Channel-ID");
  const resourceId = headers.get("X-Goog-Resource-ID");
  const resourceState = headers.get("X-Goog-Resource-State");
  const channelToken = headers.get("X-Goog-Channel-Token");
  const changed = headers.get("X-Goog-Changed");  // e.g., "file,teamDrive"
  
  console.log("Drive webhook received:", {
    channelId,
    resourceId,
    resourceState,
    changed,
    timestamp: new Date().toISOString(),
  });

  // Validate required headers
  if (!channelId || !resourceId || !resourceState) {
    console.error("Missing required headers for drive webhook");
    return new Response("Missing required headers", { status: 400 });
  }

  // Optional: Verify channel token
  const isValid = await verifyChannel(supabase, channelId, channelToken);
  if (!isValid) {
    console.error("Invalid channel token for drive webhook:", channelId);
    return new Response("Invalid channel token", { status: 403 });
  }

  // Get access key for triggering sync
  const accessKey = Deno.env.get("MCP_ACCESS_KEY");
  if (!accessKey) {
    console.error("MCP_ACCESS_KEY not configured");
    return new Response("Server configuration error", { status: 500 });
  }

  // Trigger drive sync (async, don't await)
  triggerSyncHttp("drive", accessKey);
  console.log("Drive sync triggered asynchronously");

  // Update sync state (don't await, best effort)
  const changeTypes = changed?.split(",").map(s => s.trim()).filter(Boolean) || [];
  
  supabase
    .from("google_sync_state")
    .upsert({
      service: "drive",
      last_webhook_at: new Date().toISOString(),
      status: "active",
    }, { onConflict: "service" })
    .then(({ error }) => {
      if (error) {
        console.error("Failed to update drive sync state:", error);
      }
    });

  return new Response("Webhook processed", { status: 200 });
}

/**
 * Handle Gmail Pub/Sub push notifications
 * 
 * Body format (Pub/Sub push message):
 * {
 *   message: {
 *     data: string (base64 encoded JSON with historyId, emailAddress)
 *     messageId: string
 *     publishTime: string
 *   },
 *   subscription: string
 * }
 */
async function handleGmailPubSub(req: Request, supabase: SupabaseClient): Promise<Response> {
  let body: PubSubMessage;
  
  try {
    body = await req.json();
  } catch (error) {
    console.error("Failed to parse Pub/Sub message:", error);
    return new Response("Invalid JSON body", { status: 400 });
  }

  // Validate Pub/Sub message structure
  if (!body?.message?.data) {
    console.error("Invalid Pub/Sub message format");
    return new Response("Invalid Pub/Sub message format", { status: 400 });
  }

  // Decode base64 data
  let data: GmailPubSubData;
  try {
    const decoded = atob(body.message.data);
    data = JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode Pub/Sub data:", error);
    return new Response("Invalid base64 data", { status: 400 });
  }

  console.log("Gmail Pub/Sub received:", {
    messageId: body.message.messageId,
    historyId: data.historyId,
    emailAddress: data.emailAddress,
    timestamp: new Date().toISOString(),
  });

  // Get access key for triggering sync
  const accessKey = Deno.env.get("MCP_ACCESS_KEY");
  if (!accessKey) {
    console.error("MCP_ACCESS_KEY not configured");
    return new Response("Server configuration error", { status: 500 });
  }

  // Trigger email sync with historyId (async, don't await)
  triggerEmailSync(accessKey, data.historyId);
  console.log("Email sync triggered asynchronously with historyId:", data.historyId);

  // Update sync state (don't await, best effort)
  supabase
    .from("google_sync_state")
    .upsert({
      service: "gmail",
      last_webhook_at: new Date().toISOString(),
      last_history_id: data.historyId,
      status: "active",
    }, { onConflict: "service" })
    .then(({ error }) => {
      if (error) {
        console.error("Failed to update gmail sync state:", error);
      }
    });

  return new Response("Pub/Sub processed", { status: 200 });
}

// ============================================
// Main Handler
// ============================================

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  
  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase configuration");
    return new Response("Server configuration error", { 
      status: 500,
      headers: corsHeaders,
    });
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Route based on path
    if (path.endsWith("/calendar")) {
      return await handleCalendarWebhook(req, supabase);
    } else if (path.endsWith("/drive")) {
      return await handleDriveWebhook(req, supabase);
    } else if (path.endsWith("/gmail")) {
      return await handleGmailPubSub(req, supabase);
    } else {
      console.error("Unknown webhook endpoint:", path);
      return new Response("Unknown webhook endpoint", { 
        status: 404,
        headers: corsHeaders,
      });
    }
  } catch (error) {
    // ALWAYS return 200 to prevent Google from retrying
    // Log the error for debugging
    console.error("Webhook error:", error);
    console.error("Error details:", {
      path,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
    
    // Return 200 to acknowledge receipt (prevents Google retries)
    return new Response("Error logged", { 
      status: 200,
      headers: corsHeaders,
    });
  }
});
