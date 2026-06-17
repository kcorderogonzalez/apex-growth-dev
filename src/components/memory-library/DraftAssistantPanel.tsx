import React from "react";
import { Send, Loader2, Sparkles, X, Download } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAgentStream } from "@/src/hooks/useAgentStream";
import { useAgentRegistry } from "@/src/hooks/useMemoryLibrary";

interface DraftAssistantPanelProps {
  selectedAgentKeys: string[];
  currentContent: string;
  onInsert: (content: string) => void;
  onClose: () => void;
}

export default function DraftAssistantPanel({
  selectedAgentKeys,
  currentContent,
  onInsert,
  onClose,
}: DraftAssistantPanelProps) {
  const [input, setInput] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const { data: registry = [] } = useAgentRegistry();

  const { messages, streamingText, isStreaming, sendMessage } = useAgentStream({
    intent: "memory_draft_assistant",
    context: {
      targetAgentKeys: selectedAgentKeys,
      currentContent,
    },
  });

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const selectedNames = registry
    .filter((e) => selectedAgentKeys.includes(e.intent_key))
    .map((e) => e.display_name);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage(text, {
      intent: "memory_draft_assistant",
      context: {
        targetAgentKeys: selectedAgentKeys,
        currentContent,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Draft Assistant</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16} />
        </button>
      </div>

      {selectedNames.length > 0 && (
        <div className="px-4 py-2 bg-cyan-50 border-b border-cyan-100">
          <p className="text-[10px] text-cyan-700 font-medium">
            Writing for: {selectedNames.join(", ")}
          </p>
        </div>
      )}

      {selectedNames.length === 0 && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
          <p className="text-[10px] text-amber-700 font-medium">
            Select target agents above to give the assistant context.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center py-8 text-slate-400 text-xs leading-relaxed">
            Describe the Memory you want to create and I'll draft it for you.
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="mr-2 mt-1 shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles size={11} className="text-primary" />
              </div>
            )}
            <div className="flex flex-col gap-1 max-w-[90%]">
              <div className={cn(
                "rounded-2xl px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-sm",
              )}>
                {msg.content}
              </div>
              {msg.role === "assistant" && (
                <button
                  onClick={() => onInsert(msg.content)}
                  className="self-start flex items-center gap-1.5 px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-[10px] font-bold transition-colors"
                >
                  <Download size={10} />
                  Insert into Editor
                </button>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="mr-2 mt-1 shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={11} className="text-primary" />
            </div>
            <div className="rounded-2xl rounded-bl-sm px-3 py-2.5 bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-w-[90%]">
              {streamingText || <Loader2 size={12} className="animate-spin text-primary" />}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Describe the Memory you want to draft…"
            disabled={isStreaming}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
