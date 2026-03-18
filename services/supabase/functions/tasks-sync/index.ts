/**
 * Tasks Sync Edge Function for Open Brain
 * 
 * Bidirectional sync with Google Tasks. Tasks created from action items sync to Google Tasks,
 * and completed tasks update thought action items.
 * 
 * Endpoints:
 * GET /functions/v1/tasks-sync?tasklistId=@default&showCompleted=true&dueMin=...&dueMax=...
 * POST /functions/v1/tasks-sync { action: 'syncFromGoogle' | 'syncToGoogle' | 'create' | 'update' | 'complete' | 'delete' }
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

interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: "needsAction" | "completed";
  due?: string; // ISO 8601 date
  completed?: string; // ISO 8601 timestamp
  parent?: string;
  position?: string;
  links?: Array<{ type: string; description: string; link: string }>;
  updated?: string;
  selfLink?: string;
}

interface GoogleTasklist {
  id: string;
  title: string;
  selfLink?: string;
}

interface ProcessedTask {
  google_task_id: string;
  tasklist_id: string;
  title: string;
  notes?: string;
  due_date?: string;
  status: string;
  completed_at?: string;
  parent_task_id?: string;
  position?: string;
  links?: Array<{ type: string; description: string; link: string }>;
}

interface SyncResult {
  status: string;
  direction: "fromGoogle" | "toGoogle" | "bidirectional";
  tasksSynced: number;
  newTasks: number;
  updatedTasks: number;
  completedTasks: number;
  linkedToThoughts: number;
  syncState: {
    service: string;
    lastSyncAt: string;
  };
}

interface Thought {
  id: string;
  content: string;
  metadata?: {
    action_items?: Array<{
      text: string;
      due_date?: string;
      completed?: boolean;
      completed_at?: string;
    }>;
  };
}

// ============================================
// Google Tasks API Functions
// ============================================

/**
 * List all tasklists for the authenticated user
 */
async function listTasklists(accessToken: string): Promise<{ items?: GoogleTasklist[]; error?: string }> {
  const response = await fetch(
    "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { error: `Google Tasks API error (${response.status}): ${errorText}` };
  }

  return await response.json();
}

/**
 * List tasks from a specific tasklist
 */
async function listTasks(
  accessToken: string,
  tasklistId: string,
  showCompleted = true,
  dueMin?: string,
  dueMax?: string
): Promise<{ items?: GoogleTask[]; error?: string }> {
  const params = new URLSearchParams();
  params.set("showCompleted", showCompleted.toString());
  params.set("showHidden", "false");
  if (dueMin) params.set("dueMin", dueMin);
  if (dueMax) params.set("dueMax", dueMax);

  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { error: `Google Tasks API error (${response.status}): ${errorText}` };
  }

  return await response.json();
}

/**
 * Get a specific task
 */
async function getTask(
  accessToken: string,
  tasklistId: string,
  taskId: string
): Promise<GoogleTask | { error: string }> {
  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { error: `Google Tasks API error (${response.status}): ${errorText}` };
  }

  return await response.json();
}

/**
 * Create a new task
 */
async function createTask(
  accessToken: string,
  tasklistId: string,
  task: Partial<GoogleTask>
): Promise<GoogleTask | { error: string }> {
  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(task),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { error: `Google Tasks API error (${response.status}): ${errorText}` };
  }

  return await response.json();
}

/**
 * Update an existing task
 */
async function updateTask(
  accessToken: string,
  tasklistId: string,
  taskId: string,
  task: Partial<GoogleTask>
): Promise<GoogleTask | { error: string }> {
  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(task),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return { error: `Google Tasks API error (${response.status}): ${errorText}` };
  }

  return await response.json();
}

/**
 * Complete a task (set status to completed)
 */
async function completeTask(
  accessToken: string,
  tasklistId: string,
  taskId: string
): Promise<GoogleTask | { error: string }> {
  return updateTask(accessToken, tasklistId, taskId, { status: "completed" });
}

/**
 * Delete a task
 */
async function deleteTask(
  accessToken: string,
  tasklistId: string,
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    return { success: false, error: `Google Tasks API error (${response.status}): ${errorText}` };
  }

  return { success: true };
}

// ============================================
// Task Processing
// ============================================

/**
 * Process a Google Task into our schema format
 */
function processTask(task: GoogleTask, tasklistId: string): ProcessedTask {
  return {
    google_task_id: task.id,
    tasklist_id: tasklistId,
    title: task.title || "(No title)",
    notes: task.notes,
    due_date: task.due,
    status: task.status || "needsAction",
    completed_at: task.completed,
    parent_task_id: task.parent,
    position: task.position,
    links: task.links,
  };
}

// ============================================
// Database Operations
// ============================================

/**
 * Get the current sync state for tasks
 */
async function getSyncState(): Promise<{
  lastSyncAt?: string;
} | null> {
  const { data, error } = await supabase
    .from("google_sync_state")
    .select("last_sync_at")
    .eq("service", "tasks")
    .single();

  if (error || !data) {
    return null;
  }

  return {
    lastSyncAt: data.last_sync_at,
  };
}

/**
 * Update sync state after successful sync
 */
async function updateSyncState(status = "active", errorMessage?: string): Promise<void> {
  const { error } = await supabase
    .from("google_sync_state")
    .upsert(
      {
        service: "tasks",
        last_sync_at: new Date().toISOString(),
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
 * Update thought action item when task is completed
 */
async function updateThoughtActionItem(
  supabaseClient: SupabaseClient,
  thoughtId: string,
  actionText: string,
  completed: boolean
): Promise<void> {
  const { data: thought, error } = await supabaseClient
    .from("thoughts")
    .select("metadata")
    .eq("id", thoughtId)
    .single();

  if (error || !thought) {
    console.error("Error fetching thought for action item update:", error);
    return;
  }

  const actionItems = thought.metadata?.action_items || [];
  let updated = false;

  const updatedItems = actionItems.map((action: { text: string; completed?: boolean; completed_at?: string | null }) => {
    // Match by exact text or partial match
    if (
      action.text === actionText ||
      action.text.includes(actionText) ||
      actionText.includes(action.text)
    ) {
      updated = true;
      return {
        ...action,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      };
    }
    return action;
  });

  if (!updated) return;

  const { error: updateError } = await supabaseClient
    .from("thoughts")
    .update({
      metadata: { ...thought.metadata, action_items: updatedItems },
    })
    .eq("id", thoughtId);

  if (updateError) {
    console.error("Error updating thought action items:", updateError);
  }
}

/**
 * Find thoughts related to a task based on title
 */
async function findRelatedThoughts(
  supabaseClient: SupabaseClient,
  taskTitle: string
): Promise<Array<{ id: string }>> {
  // Search for thoughts that might be related to this task
  // Match by action items or content similarity
  const searchTerms = taskTitle
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5);

  if (searchTerms.length === 0) {
    return [];
  }

  // Build OR query for content search
  const orConditions = searchTerms.map((term) => `content.ilike.%${term}%`);

  const { data: thoughts, error } = await supabaseClient
    .from("thoughts")
    .select("id")
    .or(orConditions.join(","))
    .limit(3);

  if (error) {
    console.error("Error finding related thoughts:", error);
    return [];
  }

  return thoughts || [];
}

// ============================================
// Sync Logic
// ============================================

/**
 * Sync tasks from Google Tasks to Open Brain
 */
async function syncFromGoogle(
  supabaseClient: SupabaseClient,
  accessToken: string
): Promise<{
  tasksSynced: number;
  newTasks: number;
  updatedTasks: number;
  completedTasks: number;
  linkedToThoughts: number;
}> {
  let tasksSynced = 0;
  let newTasks = 0;
  let updatedTasks = 0;
  let completedTasks = 0;
  let linkedToThoughts = 0;

  // Get all tasklists
  const tasklistsResult = await listTasklists(accessToken);

  if (tasklistsResult.error) {
    throw new Error(tasklistsResult.error);
  }

  const tasklists = tasklistsResult.items || [];

  for (const tasklist of tasklists) {
    // Get tasks from each list
    const tasksResult = await listTasks(accessToken, tasklist.id);

    if (tasksResult.error) {
      console.error(`Error fetching tasks from list ${tasklist.id}:`, tasksResult.error);
      continue;
    }

    const tasks = tasksResult.items || [];

    for (const task of tasks) {
      try {
        const processed = processTask(task, tasklist.id);

        // Check if already linked to a thought
        const { data: existing } = await supabaseClient
          .from("google_tasks")
          .select("thought_id, status")
          .eq("google_task_id", task.id)
          .single();

        const isNew = !existing;
        const wasCompleted = existing?.status === "completed";
        const nowCompleted = task.status === "completed";

        // Find related thoughts if not already linked
        let thoughtId = existing?.thought_id;
        if (!thoughtId) {
          const related = await findRelatedThoughts(supabaseClient, task.title);
          if (related.length > 0) {
            thoughtId = related[0].id;
            linkedToThoughts++;
          }
        }

        // Upsert task
        const { error: upsertError } = await supabaseClient
          .from("google_tasks")
          .upsert(
            {
              ...processed,
              thought_id: thoughtId,
              synced_at: new Date().toISOString(),
            },
            { onConflict: "google_task_id" }
          );

        if (upsertError) {
          console.error(`Error upserting task ${task.id}:`, upsertError);
          continue;
        }

        tasksSynced++;

        if (isNew) {
          newTasks++;
        } else {
          updatedTasks++;
        }

        // If newly completed and linked to thought, update thought's action item
        if (nowCompleted && !wasCompleted && thoughtId) {
          await updateThoughtActionItem(supabaseClient, thoughtId, task.title, true);
          completedTasks++;
        }
      } catch (err) {
        console.error(`Error processing task ${task.id}:`, err);
      }
    }
  }

  return {
    tasksSynced,
    newTasks,
    updatedTasks,
    completedTasks,
    linkedToThoughts,
  };
}

/**
 * Sync action items from Open Brain thoughts to Google Tasks
 */
async function syncToGoogle(
  supabaseClient: SupabaseClient,
  accessToken: string
): Promise<{
  tasksSynced: number;
  newTasks: number;
}> {
  let tasksSynced = 0;
  let newTasks = 0;

  // Find thoughts with action items
  const { data: thoughts, error } = await supabaseClient
    .from("thoughts")
    .select("id, content, metadata")
    .not("metadata->action_items", "is", null);

  if (error) {
    throw new Error(`Error fetching thoughts: ${error.message}`);
  }

  for (const thought of (thoughts as Thought[]) || []) {
    const actionItems = thought.metadata?.action_items || [];

    for (const action of actionItems) {
      // Skip already completed action items
      if (action.completed) continue;

      try {
        // Check if already has a linked task
        const { data: existing } = await supabaseClient
          .from("google_tasks")
          .select("id")
          .eq("thought_id", thought.id)
          .ilike("title", `%${action.text.substring(0, 50)}%`)
          .single();

        if (existing) continue; // Already synced

        // Create task in Google Tasks
        const newTask = await createTask(accessToken, "@default", {
          title: action.text,
          notes: `From Open Brain: ${thought.content.substring(0, 200)}${
            thought.content.length > 200 ? "..." : ""
          }`,
          due: action.due_date,
        });

        if ("error" in newTask) {
          console.error(`Error creating task for action "${action.text}":`, newTask.error);
          continue;
        }

        // Store link
        const { error: insertError } = await supabaseClient.from("google_tasks").insert({
          google_task_id: newTask.id,
          tasklist_id: "@default",
          title: newTask.title,
          notes: newTask.notes,
          due_date: action.due_date,
          status: "needsAction",
          thought_id: thought.id,
          synced_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error(`Error storing task link:`, insertError);
          continue;
        }

        tasksSynced++;
        newTasks++;
      } catch (err) {
        console.error(`Error syncing action "${action.text}":`, err);
      }
    }
  }

  return {
    tasksSynced,
    newTasks,
  };
}

/**
 * Perform bidirectional sync
 */
async function performBidirectionalSync(
  supabaseClient: SupabaseClient,
  accessToken: string
): Promise<SyncResult> {
  // First sync from Google to get completed tasks
  const fromGoogle = await syncFromGoogle(supabaseClient, accessToken);

  // Then sync to Google for new action items
  const toGoogle = await syncToGoogle(supabaseClient, accessToken);

  // Update sync state
  await updateSyncState("active");

  return {
    status: "success",
    direction: "bidirectional",
    tasksSynced: fromGoogle.tasksSynced + toGoogle.tasksSynced,
    newTasks: fromGoogle.newTasks + toGoogle.newTasks,
    updatedTasks: fromGoogle.updatedTasks,
    completedTasks: fromGoogle.completedTasks,
    linkedToThoughts: fromGoogle.linkedToThoughts,
    syncState: {
      service: "tasks",
      lastSyncAt: new Date().toISOString(),
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
    // GET: List tasks from Google
    if (req.method === "GET") {
      const tasklistId = url.searchParams.get("tasklistId") || "@default";
      const showCompleted = url.searchParams.get("showCompleted") !== "false";
      const dueMin = url.searchParams.get("dueMin") || undefined;
      const dueMax = url.searchParams.get("dueMax") || undefined;

      const accessToken = await getAccessToken();

      // Check if this is a status check
      const action = url.searchParams.get("action");
      if (action === "status") {
        const syncState = await getSyncState();
        return new Response(
          JSON.stringify({
            status: "ok",
            syncState,
            tasklistId,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get tasklists
      const tasklistsResult = await listTasklists(accessToken);
      if (tasklistsResult.error) {
        throw new Error(tasklistsResult.error);
      }

      // Get tasks
      const tasksResult = await listTasks(accessToken, tasklistId, showCompleted, dueMin, dueMax);
      if (tasksResult.error) {
        throw new Error(tasksResult.error);
      }

      return new Response(
        JSON.stringify({
          status: "success",
          tasklists: tasklistsResult.items || [],
          tasks: tasksResult.items || [],
          tasklistId,
          showCompleted,
          dueMin,
          dueMax,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // POST: Actions (syncFromGoogle, syncToGoogle, create, update, complete, delete)
    if (req.method === "POST") {
      const body = await req.json();
      const {
        action = "bidirectional",
        tasklistId = "@default",
        task,
        taskId,
        thoughtId,
      } = body;

      const accessToken = await getAccessToken();

      // Sync from Google
      if (action === "syncFromGoogle") {
        const result = await syncFromGoogle(supabase, accessToken);
        await updateSyncState("active");

        return new Response(
          JSON.stringify({
            status: "success",
            direction: "fromGoogle",
            ...result,
            syncState: {
              service: "tasks",
              lastSyncAt: new Date().toISOString(),
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Sync to Google
      if (action === "syncToGoogle") {
        const result = await syncToGoogle(supabase, accessToken);
        await updateSyncState("active");

        return new Response(
          JSON.stringify({
            status: "success",
            direction: "toGoogle",
            ...result,
            syncState: {
              service: "tasks",
              lastSyncAt: new Date().toISOString(),
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Bidirectional sync
      if (action === "bidirectional") {
        const result = await performBidirectionalSync(supabase, accessToken);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create task
      if (action === "create") {
        if (!task || !task.title) {
          return new Response(
            JSON.stringify({ error: "Task title is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const newTask = await createTask(accessToken, tasklistId, {
          title: task.title,
          notes: task.notes,
          due: task.due,
        });

        if ("error" in newTask) {
          return new Response(JSON.stringify({ error: newTask.error }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Store in database if linked to thought
        if (thoughtId) {
          await supabase.from("google_tasks").insert({
            google_task_id: newTask.id,
            tasklist_id: tasklistId,
            title: newTask.title,
            notes: newTask.notes,
            due_date: task.due,
            status: "needsAction",
            thought_id: thoughtId,
            synced_at: new Date().toISOString(),
          });
        }

        return new Response(
          JSON.stringify({
            status: "success",
            action: "create",
            task: newTask,
            thoughtId,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Update task
      if (action === "update") {
        if (!taskId) {
          return new Response(
            JSON.stringify({ error: "taskId is required for update" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const updatedTask = await updateTask(accessToken, tasklistId, taskId, task);

        if ("error" in updatedTask) {
          return new Response(JSON.stringify({ error: updatedTask.error }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update in database
        const processed = processTask(updatedTask, tasklistId);
        await supabase
          .from("google_tasks")
          .upsert(
            {
              ...processed,
              synced_at: new Date().toISOString(),
            },
            { onConflict: "google_task_id" }
          );

        return new Response(
          JSON.stringify({
            status: "success",
            action: "update",
            task: updatedTask,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Complete task
      if (action === "complete") {
        if (!taskId) {
          return new Response(
            JSON.stringify({ error: "taskId is required for complete" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const completedTask = await completeTask(accessToken, tasklistId, taskId);

        if ("error" in completedTask) {
          return new Response(JSON.stringify({ error: completedTask.error }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Update in database and link to thought
        const { data: existing } = await supabase
          .from("google_tasks")
          .select("thought_id")
          .eq("google_task_id", taskId)
          .single();

        const processed = processTask(completedTask, tasklistId);
        await supabase
          .from("google_tasks")
          .upsert(
            {
              ...processed,
              synced_at: new Date().toISOString(),
            },
            { onConflict: "google_task_id" }
          );

        // Update thought action item if linked
        if (existing?.thought_id) {
          await updateThoughtActionItem(supabase, existing.thought_id, completedTask.title, true);
        }

        return new Response(
          JSON.stringify({
            status: "success",
            action: "complete",
            task: completedTask,
            thoughtId: existing?.thought_id,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Delete task
      if (action === "delete") {
        if (!taskId) {
          return new Response(
            JSON.stringify({ error: "taskId is required for delete" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const deleteResult = await deleteTask(accessToken, tasklistId, taskId);

        if (!deleteResult.success) {
          return new Response(JSON.stringify({ error: deleteResult.error }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete from database
        await supabase.from("google_tasks").delete().eq("google_task_id", taskId);

        return new Response(
          JSON.stringify({
            status: "success",
            action: "delete",
            taskId,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error:
            "Invalid action. Use 'syncFromGoogle', 'syncToGoogle', 'bidirectional', 'create', 'update', 'complete', or 'delete'",
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
    console.error("Tasks sync error:", err);

    // Update sync state with error
    await updateSyncState("error", errorMessage);

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
