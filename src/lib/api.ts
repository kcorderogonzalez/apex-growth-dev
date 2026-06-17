import { auth } from "./firebase";
import type { AgentRegistryEntry, InboundLeadStats, Memory, MemoryVersion, ProcessedInboundLead } from "../types";

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (import.meta.env.VITE_SKIP_AUTH === "true") return headers;
  const user = auth.currentUser;
  if (user) {
    try {
      headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
    } catch {
      // No token — backend will reject if auth is required
    }
  }
  return headers;
}

export interface AgentEvent {
  type: "delta" | "result" | "error" | "unknown";
  content?: string;
}

export interface QueryOptions {
  intent?: string;
  context?: Record<string, unknown>;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

// ─── Memory Library API ────────────────────────────────────────────────────────

export interface MemoryFilters {
  status?: string;
  department?: string;
  target_agent?: string;
}

export interface MemoryCreateData {
  name: string;
  description: string;
  department: string;
  target_agents: string[];
  content: string;
  change_summary?: string;
  status?: string;
}

export interface MemoryUpdateData {
  name?: string;
  description?: string;
  department?: string;
  target_agents?: string[];
  status?: string;
}

export interface MemoryVersionCreateData {
  content: string;
  change_summary?: string;
  status?: string;
}

export async function getMemories(filters?: MemoryFilters): Promise<Memory[]> {
  const headers = await authHeaders();
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.department) params.set("department", filters.department);
  if (filters?.target_agent) params.set("target_agent", filters.target_agent);
  const qs = params.toString();
  const res = await fetch(`/api/memory-library${qs ? `?${qs}` : ""}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createMemory(data: MemoryCreateData): Promise<Memory> {
  const headers = await authHeaders();
  const res = await fetch("/api/memory-library", { method: "POST", headers, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getMemory(id: string): Promise<Memory> {
  const headers = await authHeaders();
  const res = await fetch(`/api/memory-library/${id}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateMemory(id: string, data: MemoryUpdateData): Promise<Memory> {
  const headers = await authHeaders();
  const res = await fetch(`/api/memory-library/${id}`, { method: "PUT", headers, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function saveMemoryVersion(id: string, data: MemoryVersionCreateData): Promise<MemoryVersion> {
  const headers = await authHeaders();
  const res = await fetch(`/api/memory-library/${id}/versions`, { method: "POST", headers, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function promoteVersion(memoryId: string, versionId: string): Promise<Memory> {
  const headers = await authHeaders();
  const res = await fetch(`/api/memory-library/${memoryId}/promote/${versionId}`, { method: "PUT", headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function archiveMemory(id: string): Promise<Memory> {
  const headers = await authHeaders();
  const res = await fetch(`/api/memory-library/${id}/archive`, { method: "PUT", headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getMemoryVersions(id: string): Promise<MemoryVersion[]> {
  const headers = await authHeaders();
  const res = await fetch(`/api/memory-library/${id}/versions`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getAgentRegistry(): Promise<AgentRegistryEntry[]> {
  const headers = await authHeaders();
  const res = await fetch("/api/agent-registry", { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function queryAgent(prompt: string, options: QueryOptions = {}): Promise<string> {
  const headers = await authHeaders();

  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt,
      intent: options.intent,
      context: options.context,
      history: options.history,
    }),
  });

  if (!res.ok) {
    throw new Error(`Agent API error: HTTP ${res.status}`);
  }
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return result;
      try {
        const event: AgentEvent = JSON.parse(data);
        if (event.type === "result" && event.content) result = event.content;
        if (event.type === "error") throw new Error(event.content ?? "Agent error");
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }

  return result;
}

// ─── Inbound Leads API ────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function fetchInboundLeadStats(): Promise<InboundLeadStats> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/inbound-leads/stats`, { headers });
  if (!res.ok) throw new Error(`Inbound leads stats error: HTTP ${res.status}`);
  return res.json();
}

export async function fetchInboundLeads(
  queue?: string,
  territory?: string,
  limit = 100,
): Promise<ProcessedInboundLead[]> {
  const headers = await authHeaders();
  const params = new URLSearchParams({ limit: String(limit) });
  if (queue) params.set("queue", queue);
  if (territory) params.set("territory", territory);
  const res = await fetch(`${BASE}/api/inbound-leads?${params}`, { headers });
  if (!res.ok) throw new Error(`Inbound leads fetch error: HTTP ${res.status}`);
  return res.json();
}

export async function triggerLeadProcessing(batchSize = 25): Promise<{ processed: number; pending_remaining: number }> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/inbound-leads/process?batch_size=${batchSize}`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error(`Lead processing error: HTTP ${res.status}`);
  return res.json();
}
