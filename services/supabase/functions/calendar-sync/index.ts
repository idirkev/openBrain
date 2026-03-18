/**
 * Calendar Sync Edge Function for Open Brain
 * 
 * Syncs Google Calendar events and links them to related thoughts.
 * Supports incremental sync using sync tokens and push notifications via watch.
 * 
 * Endpoints:
 * GET /functions/v1/calendar-sync?calendarId=primary&days=7&syncToken=...
 * POST /functions/v1/calendar-sync { action: 'fullSync' | 'incremental' | 'watch' | 'stopWatch' }
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

interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string; };
  end?: { dateTime?: string; date?: string; };
  location?: string;
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  organizer?: { email: string; displayName?: string };
  recurrence?: string[];
  status: string;
  hangoutLink?: string;
  conferenceData?: { entryPoints?: Array<{ uri: string }> };
  updated?: string;
  created?: string;
  creator?: { email?: string };
}

interface ProcessedEvent {
  gcal_event_id: string;
  calendar_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees: Array<{ email: string; name?: string; response?: string }>;
  organizer?: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  status: string;
  meet_link?: string;
}

interface SyncResult {
  status: string;
  eventsSynced: number;
  newEvents: number;
  updatedEvents: number;
  nextSyncToken?: string;
  hasMore: boolean;
  syncState: {
    service: string;
    lastSyncAt: string;
    syncToken?: string;
  };
}

// ============================================
// Google Calendar API Functions
// ============================================

/**
 * List events from Google Calendar
 * Supports both full sync (time range) and incremental sync (sync token)
 */
async function listEvents(
  accessToken: string,
  calendarId: string,
  timeMin?: string,
  timeMax?: string,
  syncToken?: string,
  singleEvents = true,
  pageToken?: string
): Promise<{ events?: CalendarEvent[]; nextSyncToken?: string; nextPageToken?: string; syncTokenExpired?: boolean; error?: string }> {
  const params = new URLSearchParams();

  if (syncToken) {
    // Incremental sync
    params.set("syncToken", syncToken);
  } else {
    // Full sync with time range
    if (timeMin) params.set("timeMin", timeMin);
    if (timeMax) params.set("timeMax", timeMax);
    params.set("singleEvents", singleEvents.toString());
    params.set("orderBy", "startTime");
  }

  params.set("maxResults", "250");
  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (response.status === 410) {
    // Sync token expired, need full sync
    return { syncTokenExpired: true };
  }

  if (!response.ok) {
    const errorText = await response.text();
    return { error: `Google Calendar API error (${response.status}): ${errorText}` };
  }

  const data = await response.json();
  return {
    events: data.items || [],
    nextSyncToken: data.nextSyncToken,
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Setup push notification watch for calendar changes
 */
async function watchCalendar(
  accessToken: string,
  calendarId: string,
  channelId: string,
  webhookUrl: string,
  expirationDays = 30
): Promise<{ id?: string; resourceId?: string; expiration?: string; error?: string }> {
  const expiration = Date.now() + expirationDays * 24 * 60 * 60 * 1000;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/watch`,
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
        expiration: expiration.toString(),
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
 * Stop watching a calendar channel
 */
async function stopWatch(
  accessToken: string,
  channelId: string,
  resourceId: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch("https://www.googleapis.com/calendar/v3/channels/stop", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: channelId, resourceId }),
  });

  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    return { success: false, error: `Stop watch failed (${response.status}): ${errorText}` };
  }

  return { success: true };
}

// ============================================
// Event Processing
// ============================================

/**
 * Process a Google Calendar event into our schema format
 */
function processEvent(event: CalendarEvent, calendarId: string): ProcessedEvent {
  const startTime = event.start?.dateTime || event.start?.date;
  const endTime = event.end?.dateTime || event.end?.date;

  // Ensure we have valid dates
  const now = new Date().toISOString();
  const safeStartTime = startTime || now;
  const safeEndTime = endTime || now;

  return {
    gcal_event_id: event.id,
    calendar_id: calendarId,
    title: event.summary || "(No title)",
    description: event.description?.substring(0, 5000),
    start_time: safeStartTime,
    end_time: safeEndTime,
    location: event.location,
    attendees: (event.attendees || [])
      .filter(a => a.email) // Filter out attendees without email
      .map(a => ({
        email: a.email,
        name: a.displayName,
        response: a.responseStatus,
      })),
    organizer: event.organizer?.email || event.creator?.email,
    is_recurring: !!(event.recurrence && event.recurrence.length > 0),
    recurrence_rule: event.recurrence?.[0],
    status: event.status || "confirmed",
    meet_link: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri,
  };
}

/**
 * Find thoughts related to this event based on attendees and subject
 */
async function findRelatedThoughts(
  supabaseClient: SupabaseClient,
  event: CalendarEvent
): Promise<Array<{ id: string; content: string }>> {
  const searchTerms: string[] = [];

  // Add attendee names and emails to search
  if (event.attendees) {
    for (const attendee of event.attendees) {
      if (attendee.displayName) {
        searchTerms.push(attendee.displayName);
      }
      // Extract name part from email (e.g., "john.doe" from "john.doe@company.com")
      if (attendee.email) {
        const emailName = attendee.email.split("@")[0];
        if (emailName && emailName.length > 2) {
          searchTerms.push(emailName.replace(/[._]/g, " "));
        }
      }
    }
  }

  // Add organizer
  if (event.organizer?.displayName) {
    searchTerms.push(event.organizer.displayName);
  }

  // Add event title words (exclude common words)
  if (event.summary) {
    const titleWords = event.summary
      .split(/\s+/)
      .filter(w => w.length > 3 && !["meeting", "call", "sync", "review", "update"].includes(w.toLowerCase()));
    searchTerms.push(...titleWords.slice(0, 3));
  }

  // Remove duplicates and empty strings
  const uniqueTerms = [...new Set(searchTerms.filter(Boolean))];

  if (uniqueTerms.length === 0) {
    return [];
  }

  // Build OR query for content search
  const orConditions = uniqueTerms.map(term => `content.ilike.%${term}%`);

  const { data: thoughts, error } = await supabaseClient
    .from("thoughts")
    .select("id, content")
    .or(orConditions.join(","))
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
 * Get the current sync state for calendar
 */
async function getSyncState(): Promise<{
  lastSyncAt?: string;
  syncToken?: string;
  channelId?: string;
  resourceId?: string;
  channelExpiration?: string;
} | null> {
  const { data, error } = await supabase
    .from("google_sync_state")
    .select("last_sync_at, sync_token, channel_id, resource_id, channel_expiration")
    .eq("service", "calendar")
    .single();

  if (error || !data) {
    return null;
  }

  return {
    lastSyncAt: data.last_sync_at,
    syncToken: data.sync_token,
    channelId: data.channel_id,
    resourceId: data.resource_id,
    channelExpiration: data.channel_expiration,
  };
}

/**
 * Update sync state after successful sync
 */
async function updateSyncState(
  syncToken?: string,
  status = "active",
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase
    .from("google_sync_state")
    .upsert(
      {
        service: "calendar",
        last_sync_at: new Date().toISOString(),
        sync_token: syncToken,
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
  const { error } = await supabase
    .from("google_sync_state")
    .upsert(
      {
        service: "calendar",
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
  const { error } = await supabase
    .from("google_sync_state")
    .upsert(
      {
        service: "calendar",
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
 * Sync events to database with thought linking
 */
async function syncEvents(
  events: CalendarEvent[],
  calendarId: string
): Promise<{ newEvents: number; updatedEvents: number }> {
  let newEvents = 0;
  let updatedEvents = 0;

  for (const event of events) {
    try {
      const processed = processEvent(event, calendarId);
      const relatedThoughts = await findRelatedThoughts(supabase, event);

      // Check if event already exists
      const { data: existing } = await supabase
        .from("calendar_events")
        .select("id")
        .eq("gcal_event_id", event.id)
        .single();

      const isNew = !existing;

      const { error } = await supabase.from("calendar_events").upsert(
        {
          ...processed,
          thought_id: relatedThoughts[0]?.id || null,
          metadata: {
            related_thoughts: relatedThoughts.map(t => t.id),
            raw_event: event,
            synced_at: new Date().toISOString(),
          },
        },
        { onConflict: "gcal_event_id" }
      );

      if (error) {
        console.error(`Error syncing event ${event.id}:`, error);
      } else {
        if (isNew) {
          newEvents++;
        } else {
          updatedEvents++;
        }
      }
    } catch (err) {
      console.error(`Error processing event ${event.id}:`, err);
    }
  }

  return { newEvents, updatedEvents };
}

// ============================================
// Main Sync Logic
// ============================================

/**
 * Perform full or incremental sync
 */
async function performSync(
  accessToken: string,
  calendarId: string,
  days: number,
  providedSyncToken?: string
): Promise<SyncResult> {
  let syncToken = providedSyncToken;
  let isIncremental = !!syncToken;

  // If no sync token provided, try to get from database
  if (!isIncremental) {
    const syncState = await getSyncState();
    if (syncState?.syncToken) {
      syncToken = syncState.syncToken;
      isIncremental = true;
    }
  }

  // Calculate time range for full sync
  let timeMin: string | undefined;
  let timeMax: string | undefined;

  if (!isIncremental) {
    const now = new Date();
    timeMin = now.toISOString();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    timeMax = future.toISOString();
  }

  let allEvents: CalendarEvent[] = [];
  let nextSyncToken: string | undefined;
  let pageToken: string | undefined;
  let hasMore = false;

  // Fetch all pages
  do {
    const result = await listEvents(
      accessToken,
      calendarId,
      timeMin,
      timeMax,
      syncToken,
      true,
      pageToken
    );

    if (result.syncTokenExpired) {
      // Token expired, do full sync instead
      console.log("Sync token expired, performing full sync");
      isIncremental = false;
      syncToken = undefined;
      
      const now = new Date();
      timeMin = now.toISOString();
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      timeMax = future.toISOString();
      
      // Retry without sync token
      const retryResult = await listEvents(
        accessToken,
        calendarId,
        timeMin,
        timeMax,
        undefined,
        true,
        undefined
      );

      if (retryResult.error) {
        throw new Error(retryResult.error);
      }

      allEvents = retryResult.events || [];
      nextSyncToken = retryResult.nextSyncToken;
      pageToken = retryResult.nextPageToken;
    } else if (result.error) {
      throw new Error(result.error);
    } else {
      if (result.events) {
        allEvents = allEvents.concat(result.events);
      }
      nextSyncToken = result.nextSyncToken;
      pageToken = result.nextPageToken;
    }
  } while (pageToken);

  hasMore = !!pageToken;

  // Sync events to database
  const { newEvents, updatedEvents } = await syncEvents(allEvents, calendarId);

  // Update sync state
  await updateSyncState(nextSyncToken, "active");

  return {
    status: "success",
    eventsSynced: allEvents.length,
    newEvents,
    updatedEvents,
    nextSyncToken,
    hasMore,
    syncState: {
      service: "calendar",
      lastSyncAt: new Date().toISOString(),
      syncToken: nextSyncToken,
    },
  };
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
    // GET: List/sync events
    if (req.method === "GET") {
      const calendarId = url.searchParams.get("calendarId") || "primary";
      const days = parseInt(url.searchParams.get("days") || "7", 10);
      const syncToken = url.searchParams.get("syncToken") || undefined;
      const singleEvents = url.searchParams.get("singleEvents") !== "false";

      const accessToken = await getAccessToken();

      // Check if this is just a status check
      const action = url.searchParams.get("action");
      if (action === "status") {
        const syncState = await getSyncState();
        return new Response(
          JSON.stringify({
            status: "ok",
            syncState,
            calendarId,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const result = await performSync(accessToken, calendarId, days, syncToken);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: Actions (fullSync, incremental, watch, stopWatch)
    if (req.method === "POST") {
      const body = await req.json();
      const {
        action = "incremental",
        calendarId = "primary",
        days = 7,
        syncToken,
        channelId,
      } = body;

      const accessToken = await getAccessToken();

      // Full sync
      if (action === "fullSync") {
        // Clear sync token to force full sync
        await updateSyncState(undefined, "active");
        const result = await performSync(accessToken, calendarId, days, undefined);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Incremental sync
      if (action === "incremental") {
        const result = await performSync(accessToken, calendarId, days, syncToken);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Setup watch
      if (action === "watch") {
        const newChannelId = channelId || crypto.randomUUID();
        const webhookUrl = `${SUPABASE_URL}/functions/v1/google-webhook/calendar`;

        const watchResult = await watchCalendar(
          accessToken,
          calendarId,
          newChannelId,
          webhookUrl
        );

        if (watchResult.error) {
          return new Response(
            JSON.stringify({ error: watchResult.error }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
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
          return new Response(
            JSON.stringify({ error: stopResult.error }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
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
        JSON.stringify({ error: "Invalid action. Use 'fullSync', 'incremental', 'watch', or 'stopWatch'" }),
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
    console.error("Calendar sync error:", err);

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
