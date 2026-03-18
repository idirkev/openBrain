/**
 * Drive Sync Edge Function for Open Brain
 *
 * Syncs Google Drive file changes and cross-references with calendar events and thoughts.
 * Supports incremental sync using page tokens and push notifications via watch.
 *
 * Endpoints:
 * GET /functions/v1/drive-sync?pageSize=100&changeToken=...&includeRemoved=false
 * POST /functions/v1/drive-sync { action: 'fullSync' | 'incremental' | 'watch' | 'stopWatch', changeToken, pageToken }
 */

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.47.10";
import { getAccessToken } from "../_shared/google-auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MCP_ACCESS_KEY = Deno.env.get("MCP_ACCESS_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================
// Types
// ============================================

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  createdTime: string;
  lastModifyingUser?: {
    displayName?: string;
    emailAddress?: string;
  };
  owners?: Array<{
    displayName?: string;
    emailAddress?: string;
  }>;
  shared: boolean;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  description?: string;
  capabilities?: Record<string, boolean>;
}

interface DriveChange {
  fileId: string;
  file?: DriveFile;
  removed?: boolean;
  changeTime?: string;
}

interface ProcessedFile {
  drive_file_id: string;
  name: string;
  mime_type: string;
  web_view_link?: string;
  web_content_link?: string;
  size?: number;
  description?: string;
  created_time: string;
  modified_time: string;
  last_modifying_user?: string;
  last_modifying_user_email?: string;
  parents?: string[];
  shared: boolean;
  owners: Array<{ name: string; email: string }>;
}

interface SyncResult {
  status: string;
  changesProcessed: number;
  newFiles: number;
  updatedFiles: number;
  deletedFiles: number;
  newStartPageToken?: string;
  nextPageToken?: string;
  hasMore: boolean;
  syncState: {
    service: string;
    lastSyncAt: string;
    changeToken?: string;
  };
}

// ============================================
// Google Drive API Functions
// ============================================

/**
 * Get start page token for initial sync
 */
async function getStartPageToken(accessToken: string): Promise<string> {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/changes/startPageToken",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get start page token (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.startPageToken;
}

/**
 * List changes from Google Drive
 */
async function listChanges(
  accessToken: string,
  pageToken: string,
  pageSize = 100,
  includeRemoved = false
): Promise<{
  changes?: DriveChange[];
  nextPageToken?: string;
  newStartPageToken?: string;
  error?: string;
}> {
  const params = new URLSearchParams({
    pageToken,
    pageSize: pageSize.toString(),
    includeRemoved: includeRemoved.toString(),
    fields:
      "nextPageToken,newStartPageToken,changes(fileId,file(id,name,mimeType,modifiedTime,createdTime,lastModifyingUser(displayName,emailAddress),owners(displayName,emailAddress),shared,parents,webViewLink,webContentLink,size,description,capabilities),removed,time)",
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/changes?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { error: `Google Drive API error (${response.status}): ${errorText}` };
  }

  const data = await response.json();
  return {
    changes: data.changes || [],
    nextPageToken: data.nextPageToken,
    newStartPageToken: data.newStartPageToken,
  };
}

/**
 * Get file details from Google Drive
 */
async function getFile(
  accessToken: string,
  fileId: string
): Promise<DriveFile | { error: string }> {
  const params = new URLSearchParams({
    fields:
      "id,name,mimeType,modifiedTime,createdTime,lastModifyingUser(displayName,emailAddress),owners(displayName,emailAddress),shared,parents,webViewLink,webContentLink,size,description,capabilities",
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { error: `Failed to get file (${response.status}): ${errorText}` };
  }

  return await response.json();
}

/**
 * Setup push notification watch for drive changes
 */
async function watchDrive(
  accessToken: string,
  channelId: string,
  webhookUrl: string
): Promise<{ id?: string; resourceId?: string; expiration?: string; error?: string }> {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/changes/watch",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: webhookUrl,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { error: `Watch setup failed (${response.status}): ${errorText}` };
  }

  const data = await response.json();
  return {
    id: data.id,
    resourceId: data.resourceId,
    expiration: data.expiration,
  };
}

/**
 * Stop watching a drive channel
 */
async function stopWatch(
  accessToken: string,
  channelId: string,
  resourceId: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/channels/stop",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: channelId, resourceId }),
    }
  );

  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    return { success: false, error: `Stop watch failed (${response.status}): ${errorText}` };
  }

  return { success: true };
}

// ============================================
// File Processing
// ============================================

/**
 * Process a Google Drive change into our schema format
 */
function processChange(change: DriveChange): ProcessedFile | null {
  if (!change.file) return null;
  const file = change.file;

  return {
    drive_file_id: change.fileId,
    name: file.name,
    mime_type: file.mimeType,
    web_view_link: file.webViewLink,
    web_content_link: file.webContentLink,
    size: file.size ? parseInt(file.size, 10) : undefined,
    description: file.description,
    created_time: file.createdTime,
    modified_time: file.modifiedTime,
    last_modifying_user:
      file.lastModifyingUser?.displayName || file.lastModifyingUser?.emailAddress,
    last_modifying_user_email: file.lastModifyingUser?.emailAddress,
    parents: file.parents,
    shared: file.shared || false,
    owners: (file.owners || []).map((o) => ({
      name: o.displayName || "",
      email: o.emailAddress || "",
    })),
  };
}

// ============================================
// Cross-reference Functions
// ============================================

/**
 * Find calendar events related to this file based on filename keywords
 */
async function findRelatedCalendarEvents(
  supabaseClient: SupabaseClient,
  fileName: string
): Promise<Array<{ id: string; title: string }>> {
  // Extract potential meeting names from filename
  // e.g., "Q2 Planning Notes" might match "Q2 Planning" meeting
  const searchTerms = fileName
    .replace(/\.[^.]+$/, "") // Remove extension
    .split(/[-_\s]+/)
    .filter((term) => term.length > 2);

  if (searchTerms.length === 0) {
    return [];
  }

  // Build OR query for title search
  const orConditions = searchTerms.map((term) => `title.ilike.%${term}%`);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await supabaseClient
    .from("calendar_events")
    .select("id, title")
    .gte("start_time", sevenDaysAgo)
    .or(orConditions.join(","))
    .limit(10);

  if (error) {
    console.error("Error finding related calendar events:", error);
    return [];
  }

  return events || [];
}

/**
 * Find thoughts related to this file based on filename and modifier
 */
async function findRelatedThoughts(
  supabaseClient: SupabaseClient,
  fileName: string,
  lastModifier?: string
): Promise<Array<{ id: string; content: string }>> {
  // Extract search terms from filename
  const searchTerms = fileName
    .replace(/\.[^.]+$/, "")
    .split(/[-_\s]+/)
    .filter((term) => term.length > 2);

  const conditions: string[] = [];

  // Add filename search terms
  for (const term of searchTerms) {
    conditions.push(`content.ilike.%${term}%`);
  }

  // Add modifier name search
  if (lastModifier) {
    conditions.push(`content.ilike.%${lastModifier}%`);
  }

  if (conditions.length === 0) {
    return [];
  }

  const { data: thoughts, error } = await supabaseClient
    .from("thoughts")
    .select("id, content")
    .or(conditions.join(","))
    .limit(5);

  if (error) {
    console.error("Error finding related thoughts:", error);
    return [];
  }

  return thoughts || [];
}

// ============================================
// Database Operations
// ============================================

/**
 * Get the current sync state for drive
 */
async function getSyncState(): Promise<{
  lastSyncAt?: string;
  changeToken?: string;
  channelId?: string;
  resourceId?: string;
  channelExpiration?: string;
} | null> {
  const { data, error } = await supabase
    .from("google_sync_state")
    .select("last_sync_at, change_token, channel_id, resource_id, channel_expiration")
    .eq("service", "drive")
    .single();

  if (error || !data) {
    return null;
  }

  return {
    lastSyncAt: data.last_sync_at,
    changeToken: data.change_token,
    channelId: data.channel_id,
    resourceId: data.resource_id,
    channelExpiration: data.channel_expiration,
  };
}

/**
 * Update sync state after successful sync
 */
async function updateSyncState(
  changeToken?: string,
  status = "active",
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase.from("google_sync_state").upsert(
    {
      service: "drive",
      last_sync_at: new Date().toISOString(),
      change_token: changeToken,
      status,
      error_message: errorMessage,
      retry_count: errorMessage ? 1 : 0,
    },
    { onConflict: "service" }
  );

  if (error) {
    console.error("Error updating sync state:", error);
  }
}

/**
 * Store watch channel info
 */
async function storeWatchInfo(
  channelId: string,
  resourceId: string,
  expiration: string
): Promise<void> {
  const { error } = await supabase.from("google_sync_state").upsert(
    {
      service: "drive",
      channel_id: channelId,
      resource_id: resourceId,
      channel_expiration: new Date(parseInt(expiration)).toISOString(),
      status: "active",
    },
    { onConflict: "service" }
  );

  if (error) {
    console.error("Error storing watch info:", error);
  }
}

/**
 * Clear watch channel info
 */
async function clearWatchInfo(): Promise<void> {
  const { error } = await supabase.from("google_sync_state").upsert(
    {
      service: "drive",
      channel_id: null,
      resource_id: null,
      channel_expiration: null,
    },
    { onConflict: "service" }
  );

  if (error) {
    console.error("Error clearing watch info:", error);
  }
}

/**
 * Delete file from database
 */
async function deleteDriveFile(fileId: string): Promise<boolean> {
  const { error } = await supabase.from("drive_files").delete().eq("drive_file_id", fileId);

  if (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    return false;
  }

  return true;
}

/**
 * Sync a single file to database with cross-referencing
 */
async function syncFile(
  processed: ProcessedFile,
  rawChange: DriveChange
): Promise<{ isNew: boolean; success: boolean }> {
  try {
    // Find related data
    const [relatedEvents, relatedThoughts] = await Promise.all([
      findRelatedCalendarEvents(supabase, processed.name),
      findRelatedThoughts(supabase, processed.name, processed.last_modifying_user),
    ]);

    // Check if file already exists
    const { data: existing } = await supabase
      .from("drive_files")
      .select("id")
      .eq("drive_file_id", processed.drive_file_id)
      .single();

    const isNew = !existing;

    const { error } = await supabase.from("drive_files").upsert(
      {
        ...processed,
        thought_id: relatedThoughts[0]?.id || null,
        metadata: {
          related_calendar_events: relatedEvents.map((e) => e.id),
          related_thoughts: relatedThoughts.map((t) => t.id),
          raw_change: rawChange,
          synced_at: new Date().toISOString(),
        },
      },
      { onConflict: "drive_file_id" }
    );

    if (error) {
      console.error(`Error syncing file ${processed.drive_file_id}:`, error);
      return { isNew, success: false };
    }

    return { isNew, success: true };
  } catch (err) {
    console.error(`Error processing file ${processed.drive_file_id}:`, err);
    return { isNew: false, success: false };
  }
}

/**
 * Process and sync changes to database
 */
async function syncChanges(
  changes: DriveChange[]
): Promise<{ newFiles: number; updatedFiles: number; deletedFiles: number }> {
  let newFiles = 0;
  let updatedFiles = 0;
  let deletedFiles = 0;

  for (const change of changes) {
    // Handle removed files
    if (change.removed) {
      const deleted = await deleteDriveFile(change.fileId);
      if (deleted) deletedFiles++;
      continue;
    }

    // Process the change
    const processed = processChange(change);
    if (!processed) continue;

    const { isNew, success } = await syncFile(processed, change);

    if (success) {
      if (isNew) {
        newFiles++;
      } else {
        updatedFiles++;
      }
    }
  }

  return { newFiles, updatedFiles, deletedFiles };
}

// ============================================
// Main Sync Logic
// ============================================

/**
 * Perform full or incremental sync
 */
async function performSync(
  accessToken: string,
  providedChangeToken?: string,
  providedPageToken?: string,
  pageSize = 100,
  includeRemoved = false
): Promise<SyncResult> {
  let pageToken = providedPageToken;
  let changeToken = providedChangeToken;

  // If no tokens provided, get from database or start fresh
  if (!pageToken && !changeToken) {
    const syncState = await getSyncState();
    if (syncState?.changeToken) {
      changeToken = syncState.changeToken;
    } else {
      // Get start page token for initial sync
      changeToken = await getStartPageToken(accessToken);
    }
  }

  // Use page token if provided (for pagination), otherwise use change token
  const tokenToUse = pageToken || changeToken!;

  // Fetch changes
  const result = await listChanges(accessToken, tokenToUse, pageSize, includeRemoved);

  if (result.error) {
    throw new Error(result.error);
  }

  const changes = result.changes || [];

  // Sync changes to database
  const { newFiles, updatedFiles, deletedFiles } = await syncChanges(changes);

  // Determine the new change token
  const newChangeToken = result.newStartPageToken || changeToken;

  // Update sync state if we have a new start page token (sync is complete for this batch)
  if (result.newStartPageToken && !result.nextPageToken) {
    await updateSyncState(newChangeToken, "active");
  }

  return {
    status: "success",
    changesProcessed: changes.length,
    newFiles,
    updatedFiles,
    deletedFiles,
    newStartPageToken: result.newStartPageToken,
    nextPageToken: result.nextPageToken,
    hasMore: !!result.nextPageToken,
    syncState: {
      service: "drive",
      lastSyncAt: new Date().toISOString(),
      changeToken: newChangeToken,
    },
  };
}

/**
 * Perform full sync (reset and start from beginning)
 */
async function performFullSync(
  accessToken: string,
  pageSize = 100,
  includeRemoved = false
): Promise<SyncResult> {
  // Clear existing change token to force fresh start
  await updateSyncState(undefined, "active");

  // Get fresh start page token
  const startPageToken = await getStartPageToken(accessToken);

  // Perform sync with new token
  return performSync(accessToken, startPageToken, undefined, pageSize, includeRemoved);
}

// ============================================
// HTTP Handler
// ============================================

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-brain-key, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Auth check
  const url = new URL(req.url);
  const key = req.headers.get("x-brain-key") || url.searchParams.get("key");
  if (key !== MCP_ACCESS_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // GET: List/sync changes
    if (req.method === "GET") {
      const pageSize = parseInt(url.searchParams.get("pageSize") || "100", 10);
      const changeToken = url.searchParams.get("changeToken") || undefined;
      const pageToken = url.searchParams.get("pageToken") || undefined;
      const includeRemoved = url.searchParams.get("includeRemoved") === "true";

      const accessToken = await getAccessToken();

      // Check if this is just a status check
      const action = url.searchParams.get("action");
      if (action === "status") {
        const syncState = await getSyncState();
        return new Response(
          JSON.stringify({
            status: "ok",
            syncState,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const result = await performSync(
        accessToken,
        changeToken,
        pageToken,
        pageSize,
        includeRemoved
      );

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: Actions (fullSync, incremental, watch, stopWatch)
    if (req.method === "POST") {
      const body = await req.json();
      const {
        action = "incremental",
        changeToken,
        pageToken,
        pageSize = 100,
        includeRemoved = false,
        channelId,
      } = body;

      const accessToken = await getAccessToken();

      // Full sync
      if (action === "fullSync") {
        const result = await performFullSync(accessToken, pageSize, includeRemoved);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Incremental sync
      if (action === "incremental") {
        const result = await performSync(
          accessToken,
          changeToken,
          pageToken,
          pageSize,
          includeRemoved
        );
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Setup watch
      if (action === "watch") {
        const newChannelId = channelId || crypto.randomUUID();
        const webhookUrl = `${SUPABASE_URL}/functions/v1/google-webhook/drive`;

        const watchResult = await watchDrive(accessToken, newChannelId, webhookUrl);

        if (watchResult.error) {
          return new Response(JSON.stringify({ error: watchResult.error }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (watchResult.id && watchResult.resourceId && watchResult.expiration) {
          await storeWatchInfo(watchResult.id, watchResult.resourceId, watchResult.expiration);
        }

        return new Response(
          JSON.stringify({
            status: "success",
            action: "watch",
            channelId: watchResult.id,
            resourceId: watchResult.resourceId,
            expiration: watchResult.expiration,
            webhookUrl,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Stop watch
      if (action === "stopWatch") {
        const syncState = await getSyncState();

        if (!syncState?.channelId || !syncState?.resourceId) {
          return new Response(
            JSON.stringify({ error: "No active watch channel found" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const stopResult = await stopWatch(
          accessToken,
          syncState.channelId,
          syncState.resourceId
        );

        if (!stopResult.success) {
          return new Response(JSON.stringify({ error: stopResult.error }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        await clearWatchInfo();

        return new Response(
          JSON.stringify({
            status: "success",
            action: "stopWatch",
            channelId: syncState.channelId,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Invalid action. Use 'fullSync', 'incremental', 'watch', or 'stopWatch'",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  } catch (err) {
    const errorMessage = (err as Error).message;
    console.error("Drive sync error:", err);

    // Update sync state with error
    await updateSyncState(undefined, "error", errorMessage);

    return new Response(
      JSON.stringify({
        status: "error",
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
