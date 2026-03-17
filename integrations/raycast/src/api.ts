// @ts-nocheck
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  mcpEndpoint: string;
  accessKey: string;
  defaultDays: string;
}

export interface Thought {
  id: string;
  content: string;
  metadata: {
    type?: string;
    template?: string;
    topics?: string[];
    people?: string[];
    action_items?: string[];
    dates?: string[];
  };
  created_at: string;
  similarity?: number;
}

export interface ThoughtStats {
  total: number;
  by_type: Record<string, number>;
  top_topics: Record<string, number>;
  people: Record<string, number>;
}

export interface CaptureResult {
  status: "captured";
  id: string;
  type: string;
  topics: string[];
  created_at: string;
}

function getPreferences(): Preferences {
  return getPreferenceValues<Preferences>();
}

async function callMCP(method: string, params?: unknown): Promise<unknown> {
  const { mcpEndpoint, accessKey } = getPreferences();

  const url = new URL(mcpEndpoint);
  url.searchParams.set("key", accessKey);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-brain-key": accessKey,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  const data = (await response.json()) as {
    result?: { content?: Array<{ text?: string }> };
    error?: { message: string };
  };

  if (data.error) {
    throw new Error(data.error.message);
  }

  const text = data.result?.content?.[0]?.text;
  if (!text) {
    throw new Error("Invalid response format");
  }

  return JSON.parse(text);
}

export async function captureThought(content: string): Promise<CaptureResult> {
  return callMCP("tools/call", {
    name: "capture_thought",
    arguments: { content },
  }) as Promise<CaptureResult>;
}

export async function searchThoughts(
  query: string,
  limit = 10,
  threshold = 0.7
): Promise<Thought[]> {
  return callMCP("tools/call", {
    name: "search_thoughts",
    arguments: { query, limit, threshold },
  }) as Promise<Thought[]>;
}

export async function listThoughts(options: {
  type?: string;
  topic?: string;
  person?: string;
  days?: number;
  limit?: number;
} = {}): Promise<Thought[]> {
  const { defaultDays } = getPreferences();
  return callMCP("tools/call", {
    name: "list_thoughts",
    arguments: {
      days: parseInt(defaultDays) || 7,
      limit: 20,
      ...options,
    },
  }) as Promise<Thought[]>;
}

export async function getThoughtStats(): Promise<ThoughtStats> {
  return callMCP("tools/call", {
    name: "thought_stats",
    arguments: {},
  }) as Promise<ThoughtStats>;
}
