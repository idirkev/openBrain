/**
 * Email Ingest Edge Function for Open Brain
 * 
 * Syncs emails from Gmail and classifies them against Open Brain templates.
 * Supports both full sync and incremental sync using Gmail History API.
 * 
 * Endpoints:
 *   GET  /functions/v1/email-ingest - List/sync emails with query params
 *   POST /functions/v1/email-ingest - Perform actions (fullSync, incremental, classify)
 */

import { createClient } from "npm:@supabase/supabase-js@2.47.10";
import { getAccessToken } from "../_shared/google-auth.ts";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MCP_ACCESS_KEY = Deno.env.get("MCP_ACCESS_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================
// TYPES
// ============================================

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  payload?: GmailPayload;
  internalDate?: string;
  historyId?: string;
}

interface GmailPayload {
  headers: GmailHeader[];
  parts?: GmailPart[];
  body?: GmailBody;
  mimeType?: string;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailPart {
  mimeType: string;
  body?: GmailBody;
  parts?: GmailPart[];
}

interface GmailBody {
  data?: string;
  size?: number;
}

interface EmailHeaders {
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  date: string;
}

interface ClassificationResult {
  template: string;
  formatted: string;
  action_required?: boolean;
  due_date?: string;
}

interface SyncResult {
  status: string;
  processed: number;
  new: number;
  updated: number;
  historyId: string | null;
  syncState: {
    service: string;
    lastSyncAt: string;
    lastHistoryId: string | null;
  };
  errors?: string[];
}

// ============================================
// GMAIL API FUNCTIONS
// ============================================

/**
 * Get history changes since a specific history ID (incremental sync)
 */
async function getHistory(
  accessToken: string,
  historyId: string
): Promise<{ history?: any[]; historyId?: string; error?: any }> {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/history?startHistoryId=${historyId}&historyTypes=messageAdded`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    const error = await response.json();
    // History ID may be stale, return error for fallback to full sync
    return { error };
  }

  return await response.json();
}

/**
 * List messages (for full sync or search)
 */
async function listMessages(
  accessToken: string,
  maxResults: number,
  labelIds: string[],
  q?: string,
  pageToken?: string
): Promise<{ messages?: Array<{ id: string; threadId: string }>; nextPageToken?: string; error?: any }> {
  const params = new URLSearchParams();
  params.set("maxResults", maxResults.toString());
  labelIds.forEach((id) => params.append("labelIds", id));
  if (q) params.set("q", q);
  if (pageToken) params.set("pageToken", pageToken);

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    const error = await response.json();
    return { error };
  }

  return await response.json();
}

/**
 * Get full message details
 */
async function getMessage(
  accessToken: string,
  messageId: string
): Promise<GmailMessage | { error: any }> {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    const error = await response.json();
    return { error };
  }

  return await response.json();
}

/**
 * Apply labels to a message
 */
async function modifyMessage(
  accessToken: string,
  messageId: string,
  addLabels: string[],
  removeLabels?: string[]
): Promise<boolean> {
  const body: { addLabelIds?: string[]; removeLabelIds?: string[] } = {};
  if (addLabels.length > 0) body.addLabelIds = addLabels;
  if (removeLabels && removeLabels.length > 0) body.removeLabelIds = removeLabels;

  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return response.ok;
}

/**
 * Get or create the "OB-processed" label
 */
async function getOrCreateProcessedLabel(accessToken: string): Promise<string | null> {
  // First, try to find existing label
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/labels`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const existingLabel = data.labels?.find(
    (label: any) => label.name === "OB-processed"
  );

  if (existingLabel) return existingLabel.id;

  // Create the label if it doesn't exist
  const createResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/labels`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "OB-processed",
        labelListVisibility: "labelShow",
        messageListVisibility: "show",
        color: {
          backgroundColor: "#4CAF50",
          textColor: "#FFFFFF",
        },
      }),
    }
  );

  if (!createResponse.ok) return null;

  const newLabel = await createResponse.json();
  return newLabel.id;
}

// ============================================
// EMAIL PARSING
// ============================================

/**
 * Extract headers from Gmail message
 */
function extractHeaders(payload: GmailPayload): EmailHeaders {
  const headers = payload.headers || [];
  
  const getHeader = (name: string): string => {
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header?.value || "";
  };

  const parseAddresses = (headerValue: string): string[] => {
    if (!headerValue) return [];
    // Simple parsing - split by comma and clean up
    return headerValue
      .split(",")
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0);
  };

  return {
    from: getHeader("from"),
    to: parseAddresses(getHeader("to")),
    cc: parseAddresses(getHeader("cc")),
    subject: getHeader("subject"),
    date: getHeader("date"),
  };
}

/**
 * Decode base64url encoded data
 */
function decodeBase64url(data: string): string {
  // Replace URL-safe characters and add padding
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const decoded = atob(base64 + padding);
  
  // Handle UTF-8
  try {
    return new TextDecoder("utf-8").decode(
      new Uint8Array(decoded.split("").map((c) => c.charCodeAt(0)))
    );
  } catch {
    return decoded;
  }
}

/**
 * Extract text body from message payload
 */
function extractBody(payload: GmailPayload): string {
  let text = "";

  // Recursive function to find text parts
  function findTextParts(part: GmailPart | GmailPayload): void {
    const mimeType = (part as GmailPart).mimeType || (part as GmailPayload).mimeType;
    
    // Prefer text/plain
    if (mimeType === "text/plain" && (part as GmailPart).body?.data) {
      text = decodeBase64url((part as GmailPart).body!.data!);
      return;
    }
    
    // Fallback to text/html (we'll strip tags later)
    if (mimeType === "text/html" && (part as GmailPart).body?.data && !text) {
      const html = decodeBase64url((part as GmailPart).body!.data!);
      text = stripHtmlTags(html);
      return;
    }

    // Recurse into multipart
    if ((part as GmailPart).parts) {
      for (const subPart of (part as GmailPart).parts!) {
        findTextParts(subPart);
        if (text) return; // Stop if we found text
      }
    }

    // Check payload.parts
    if ((part as GmailPayload).parts) {
      for (const subPart of (part as GmailPayload).parts!) {
        findTextParts(subPart);
        if (text) return;
      }
    }
  }

  findTextParts(payload);
  
  // Truncate to 10000 chars for storage
  return text.substring(0, 10000);
}

/**
 * Strip HTML tags from text
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<style[^>]*>[^]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[^]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================
// CLASSIFICATION
// ============================================

/**
 * Classify email against Open Brain templates
 */
function classifyEmail(email: GmailMessage, headers: EmailHeaders): ClassificationResult {
  const subject = headers.subject?.toLowerCase() || "";
  const from = headers.from?.toLowerCase() || "";
  const body = extractBody(email.payload || { headers: [] }).toLowerCase();
  
  // Action keywords
  const actionKeywords = ["urgent", "asap", "action required", "please review", "needs approval"];
  const hasActionKeyword = actionKeywords.some(kw => subject.includes(kw) || body.includes(kw));
  
  // Invoice detection
  if (subject.includes("invoice") || subject.includes("payment") || subject.includes("receipt") || subject.includes("billing")) {
    return {
      template: "Invoice",
      formatted: `Invoice: ${headers.subject}. From: ${headers.from}.`,
      action_required: hasActionKeyword || subject.includes("unpaid") || subject.includes("overdue"),
    };
  }
  
  // Contract detection
  if (subject.includes("contract") || subject.includes("agreement") || subject.includes("terms") || subject.includes("nda")) {
    return {
      template: "Contract",
      formatted: `Contract: ${headers.subject}. Status: received for review.`,
      action_required: hasActionKeyword || subject.includes("signature") || subject.includes("sign"),
    };
  }
  
  // Risk detection
  if (subject.includes("risk") || subject.includes("issue") || subject.includes("problem") || subject.includes("critical")) {
    return {
      template: "Risk",
      formatted: `Risk identified: ${headers.subject}. Source: ${headers.from}.`,
      action_required: true,
    };
  }
  
  // Decision detection
  if (subject.includes("decision") || subject.includes("approve") || subject.includes("approval") || subject.includes("go/no-go")) {
    return {
      template: "Decision",
      formatted: `Decision required: ${headers.subject}. Requested by: ${headers.from}.`,
      action_required: true,
    };
  }
  
  // Milestone detection
  if (subject.includes("milestone") || subject.includes("launch") || subject.includes("release") || subject.includes("shipped")) {
    return {
      template: "Milestone",
      formatted: `Milestone update: ${headers.subject}. From: ${headers.from}.`,
      action_required: false,
    };
  }
  
  // Compliance detection
  if (subject.includes("compliance") || subject.includes("regulatory") || subject.includes("gdpr") || subject.includes("audit")) {
    return {
      template: "Compliance",
      formatted: `Compliance matter: ${headers.subject}. Source: ${headers.from}.`,
      action_required: hasActionKeyword,
    };
  }
  
  // Legal detection
  if (subject.includes("legal") || subject.includes("lawsuit") || subject.includes("litigation") || subject.includes("attorney")) {
    return {
      template: "Legal",
      formatted: `Legal matter: ${headers.subject}. From: ${headers.from}.`,
      action_required: true,
    };
  }
  
  // Budget detection
  if (subject.includes("budget") || subject.includes("expense") || subject.includes("cost") || subject.includes("financial")) {
    return {
      template: "Budget",
      formatted: `Budget update: ${headers.subject}. From: ${headers.from}.`,
      action_required: hasActionKeyword,
    };
  }
  
  // Funding detection
  if (subject.includes("funding") || subject.includes("investment") || subject.includes("vc") || subject.includes("raise")) {
    return {
      template: "Funding",
      formatted: `Funding related: ${headers.subject}. From: ${headers.from}.`,
      action_required: hasActionKeyword,
    };
  }
  
  // Meeting detection
  if (subject.includes("meeting") || subject.includes("sync") || subject.includes("standup") || subject.includes("1:1")) {
    return {
      template: "Meeting Debrief",
      formatted: `Meeting: ${headers.subject}. Organizer: ${headers.from}.`,
      action_required: false,
    };
  }
  
  // Stakeholder detection
  if (from.includes("client") || from.includes("partner") || from.includes("investor") || from.includes("board")) {
    return {
      template: "Stakeholder",
      formatted: `Stakeholder: ${headers.from}. Update: ${headers.subject}. Sentiment: neutral.`,
      action_required: hasActionKeyword,
    };
  }
  
  // Spec detection
  if (subject.includes("spec") || subject.includes("specification") || subject.includes("requirements") || subject.includes("rfc")) {
    return {
      template: "Spec",
      formatted: `Spec: ${headers.subject}. From: ${headers.from}.`,
      action_required: hasActionKeyword || subject.includes("review"),
    };
  }
  
  // Insight detection
  if (subject.includes("insight") || subject.includes("analysis") || subject.includes("report") || subject.includes("metrics")) {
    return {
      template: "Insight",
      formatted: `Insight: ${headers.subject}. Source: ${headers.from}.`,
      action_required: false,
    };
  }
  
  // Person Note detection (specific people)
  const personMatch = from.match(/^([^<]+)</);
  if (personMatch) {
    return {
      template: "Person Note",
      formatted: `${personMatch[1].trim()}: ${headers.subject}.`,
      action_required: hasActionKeyword,
    };
  }
  
  // Default to Sent template
  return {
    template: "Sent",
    formatted: `Received: correspondence from ${headers.from}. Re: ${headers.subject}.`,
    action_required: hasActionKeyword,
  };
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Store email in database
 */
async function storeEmail(
  message: GmailMessage,
  headers: EmailHeaders,
  classification: ClassificationResult
): Promise<{ success: boolean; isNew: boolean; error?: string }> {
  const bodyText = extractBody(message.payload || { headers: [] });
  
  // Parse date
  let receivedAt: Date;
  try {
    receivedAt = headers.date ? new Date(headers.date) : new Date();
    if (isNaN(receivedAt.getTime())) {
      receivedAt = new Date();
    }
  } catch {
    receivedAt = new Date();
  }

  const emailData = {
    gmail_id: message.id,
    thread_id: message.threadId,
    from_address: headers.from,
    to_addresses: headers.to,
    cc_addresses: headers.cc,
    subject: headers.subject,
    snippet: message.snippet || "",
    body_text: bodyText,
    received_at: receivedAt.toISOString(),
    labels: message.labelIds || [],
    template: classification.template,
    action_required: classification.action_required || false,
    due_date: classification.due_date || null,
    metadata: {
      formatted_summary: classification.formatted,
      history_id: message.historyId,
    },
  };

  const { data, error } = await supabase
    .from("email_items")
    .upsert(emailData, { onConflict: "gmail_id" })
    .select();

  if (error) {
    return { success: false, isNew: false, error: error.message };
  }

  // Check if this was an insert or update by comparing created_at and updated_at
  const isNew = data && data[0] && data[0].created_at === data[0].updated_at;

  return { success: true, isNew: isNew || false };
}

/**
 * Update sync state
 */
async function updateSyncState(
  service: string,
  historyId: string | null,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase.rpc("update_sync_state", {
    p_service: service,
    p_last_sync_at: new Date().toISOString(),
    p_last_history_id: historyId,
    p_status: errorMessage ? "error" : "active",
    p_error_message: errorMessage || null,
  });

  if (error) {
    console.error("Failed to update sync state:", error);
  }
}

/**
 * Get last sync state
 */
async function getSyncState(service: string): Promise<{ lastHistoryId: string | null; lastSyncAt: string | null }> {
  const { data, error } = await supabase
    .from("google_sync_state")
    .select("last_history_id, last_sync_at")
    .eq("service", service)
    .single();

  if (error || !data) {
    return { lastHistoryId: null, lastSyncAt: null };
  }

  return {
    lastHistoryId: data.last_history_id,
    lastSyncAt: data.last_sync_at,
  };
}

// ============================================
// SYNC FUNCTIONS
// ============================================

/**
 * Process a single email message
 */
async function processMessage(
  accessToken: string,
  messageId: string,
  processedLabelId: string | null
): Promise<{ success: boolean; isNew: boolean; error?: string }> {
  // Get full message details
  const message = await getMessage(accessToken, messageId);
  
  if ("error" in message) {
    return { success: false, isNew: false, error: JSON.stringify(message.error) };
  }

  // Extract headers and body
  const headers = extractHeaders(message.payload || { headers: [] });
  
  // Classify email
  const classification = classifyEmail(message, headers);
  
  // Store in database
  const result = await storeEmail(message, headers, classification);
  
  if (!result.success) {
    return result;
  }

  // Apply "OB-processed" label
  if (processedLabelId) {
    await modifyMessage(accessToken, messageId, [processedLabelId]);
  }

  return result;
}

/**
 * Perform incremental sync using Gmail History API
 */
async function incrementalSync(
  accessToken: string,
  historyId: string,
  processedLabelId: string | null
): Promise<SyncResult> {
  const errors: string[] = [];
  let processed = 0;
  let newCount = 0;
  let updatedCount = 0;
  let latestHistoryId = historyId;

  const history = await getHistory(accessToken, historyId);

  if (history.error) {
    // History ID is stale, fallback to full sync
    return {
      status: "error",
      processed: 0,
      new: 0,
      updated: 0,
      historyId: null,
      syncState: {
        service: "gmail",
        lastSyncAt: new Date().toISOString(),
        lastHistoryId: historyId,
      },
      errors: ["History ID expired, full sync required"],
    };
  }

  const messageIds = new Set<string>();
  
  // Extract added messages from history
  for (const entry of history.history || []) {
    if (entry.messagesAdded) {
      for (const added of entry.messagesAdded) {
        if (added.message?.id) {
          messageIds.add(added.message.id);
        }
      }
    }
  }

  // Process each unique message
  for (const messageId of messageIds) {
    try {
      // Rate limiting: delay between requests
      await new Promise((r) => setTimeout(r, 100));
      
      const result = await processMessage(accessToken, messageId, processedLabelId);
      
      if (result.success) {
        processed++;
        if (result.isNew) {
          newCount++;
        } else {
          updatedCount++;
        }
      } else {
        errors.push(`Failed to process ${messageId}: ${result.error}`);
      }
    } catch (err) {
      errors.push(`Error processing ${messageId}: ${(err as Error).message}`);
    }
  }

  // Update history ID
  if (history.historyId) {
    latestHistoryId = history.historyId;
  }

  // Update sync state
  await updateSyncState("gmail", latestHistoryId, errors.length > 0 ? errors.join("; ") : undefined);

  return {
    status: errors.length > 0 ? "partial" : "success",
    processed,
    new: newCount,
    updated: updatedCount,
    historyId: latestHistoryId,
    syncState: {
      service: "gmail",
      lastSyncAt: new Date().toISOString(),
      lastHistoryId: latestHistoryId,
    },
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Perform full sync using Gmail messages.list
 */
async function fullSync(
  accessToken: string,
  maxResults: number,
  labelIds: string[],
  q: string | undefined,
  processedLabelId: string | null
): Promise<SyncResult> {
  const errors: string[] = [];
  let processed = 0;
  let newCount = 0;
  let updatedCount = 0;
  let latestHistoryId: string | null = null;

  const listResult = await listMessages(accessToken, maxResults, labelIds, q);

  if (listResult.error) {
    return {
      status: "error",
      processed: 0,
      new: 0,
      updated: 0,
      historyId: null,
      syncState: {
        service: "gmail",
        lastSyncAt: new Date().toISOString(),
        lastHistoryId: null,
      },
      errors: [JSON.stringify(listResult.error)],
    };
  }

  const messages = listResult.messages || [];

  for (const msg of messages) {
    try {
      // Rate limiting: delay between requests
      await new Promise((r) => setTimeout(r, 100));
      
      const result = await processMessage(accessToken, msg.id, processedLabelId);
      
      if (result.success) {
        processed++;
        if (result.isNew) {
          newCount++;
        } else {
          updatedCount++;
        }
      } else {
        errors.push(`Failed to process ${msg.id}: ${result.error}`);
      }

      // Get the history ID from the message for sync state
      const fullMessage = await getMessage(accessToken, msg.id);
      if (!("error" in fullMessage) && fullMessage.historyId) {
        latestHistoryId = fullMessage.historyId;
      }
    } catch (err) {
      errors.push(`Error processing ${msg.id}: ${(err as Error).message}`);
    }
  }

  // Update sync state
  await updateSyncState("gmail", latestHistoryId, errors.length > 0 ? errors.join("; ") : undefined);

  return {
    status: errors.length > 0 ? "partial" : "success",
    processed,
    new: newCount,
    updated: updatedCount,
    historyId: latestHistoryId,
    syncState: {
      service: "gmail",
      lastSyncAt: new Date().toISOString(),
      lastHistoryId: latestHistoryId,
    },
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ============================================
// MAIN HANDLER
// ============================================

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
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
    // Get access token for Gmail API
    const accessToken = await getAccessToken();
    
    // Get or create the "OB-processed" label
    const processedLabelId = await getOrCreateProcessedLabel(accessToken);

    // GET: Sync emails with query params
    if (req.method === "GET") {
      const maxResults = parseInt(url.searchParams.get("maxResults") || "50", 10);
      const labelIdsParam = url.searchParams.get("labelIds");
      const labelIds = labelIdsParam ? labelIdsParam.split(",") : ["INBOX"];
      const q = url.searchParams.get("q") || undefined;
      const historyOnly = url.searchParams.get("historyOnly") === "true";

      let result: SyncResult;

      if (historyOnly) {
        // Get last history ID from database
        const syncState = await getSyncState("gmail");
        
        if (!syncState.lastHistoryId) {
          return new Response(
            JSON.stringify({
              error: "No history ID found. Perform a full sync first.",
              syncState,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        result = await incrementalSync(accessToken, syncState.lastHistoryId, processedLabelId);
      } else {
        result = await fullSync(accessToken, maxResults, labelIds, q, processedLabelId);
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: Perform actions
    if (req.method === "POST") {
      const body = await req.json();
      const { action, historyId, maxResults = 50, labelIds = ["INBOX"], q } = body;

      let result: SyncResult;

      switch (action) {
        case "fullSync":
          result = await fullSync(accessToken, maxResults, labelIds, q, processedLabelId);
          break;

        case "incremental":
          if (!historyId) {
            // Use stored history ID if not provided
            const syncState = await getSyncState("gmail");
            if (!syncState.lastHistoryId) {
              return new Response(
                JSON.stringify({ error: "No history ID found. Provide historyId or perform fullSync first." }),
                {
                  status: 400,
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
              );
            }
            result = await incrementalSync(accessToken, syncState.lastHistoryId, processedLabelId);
          } else {
            result = await incrementalSync(accessToken, historyId, processedLabelId);
          }
          break;

        case "classify":
          // Re-classify existing emails (placeholder for future implementation)
          return new Response(
            JSON.stringify({ message: "Re-classification not yet implemented" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );

        default:
          return new Response(
            JSON.stringify({ error: "Invalid action. Use 'fullSync', 'incremental', or 'classify'" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("Email ingest error:", err);
    
    // Update sync state with error
    await updateSyncState("gmail", null, (err as Error).message);

    return new Response(
      JSON.stringify({
        status: "error",
        error: (err as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
