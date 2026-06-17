import { useState, useCallback, useRef } from "react";
import { auth } from "../lib/firebase";
import type { AgentEvent, QueryOptions } from "../lib/api";
import { useAgentMemory } from "../context/AgentMemoryContext";

export type { AgentEvent };

interface UseAgentStreamOptions {
  intent?: string;
  context?: Record<string, unknown>;
  initialHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

interface UseAgentStreamReturn {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  streamingText: string;
  isStreaming: boolean;
  sendMessage: (prompt: string, options?: QueryOptions) => Promise<void>;
  clearMessages: () => void;
}

export function useAgentStream(config: UseAgentStreamOptions = {}): UseAgentStreamReturn {
  const { memory } = useAgentMemory();
  const memoryRef = useRef(memory);
  memoryRef.current = memory;

  const configRef = useRef(config);
  configRef.current = config;

  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>(
    config.initialHistory ?? [],
  );
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (prompt: string, options: QueryOptions = {}) => {
    if (isStreaming) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setStreamingText("");
    setIsStreaming(true);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const user = auth.currentUser;
    if (user && import.meta.env.VITE_SKIP_AUTH !== "true") {
      try {
        headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
      } catch { /* skip */ }
    }

    // Build history from existing messages
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt,
          intent: options.intent ?? configRef.current.intent,
          context: {
            repPreferences: {
              preferredChannel: memoryRef.current.hunter.preferredChannel,
              outreachTone: memoryRef.current.hunter.outreachTone,
              focusOnChampions: memoryRef.current.hunter.focusOnChampions,
              avoidColdTitles: memoryRef.current.hunter.avoidColdTitles,
              targetIndustries: memoryRef.current.territory.targetIndustries,
              requireReviewForTitles: memoryRef.current.sequencing.requireReviewForTitles,
              emailLength: memoryRef.current.outreach.maxEmailLength,
            },
            ...(options.context ?? configRef.current.context),
          },
          history,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const event: AgentEvent = JSON.parse(data);
            if (event.type === "delta" && event.content) {
              accumulated += event.content;
              setStreamingText(accumulated);
            }
            if (event.type === "result" && event.content) {
              accumulated = event.content;
              setStreamingText("");
              setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
            }
            if (event.type === "error") {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Error: ${event.content}` },
              ]);
            }
          } catch { /* ignore malformed */ }
        }
      }

      // Flush any remaining streaming text as a message
      if (accumulated && streamingText) {
        setStreamingText("");
        setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${(err as Error).message}` },
        ]);
      }
    } finally {
      setIsStreaming(false);
      setStreamingText("");
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingText("");
  }, []);

  return { messages, streamingText, isStreaming, sendMessage, clearMessages };
}
