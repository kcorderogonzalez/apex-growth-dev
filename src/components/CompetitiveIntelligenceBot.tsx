import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, RefreshCw, Loader2, Clock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAgentStream } from '@/src/hooks/useAgentStream';
import { queryAgent } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';

interface CompetitiveIntelligenceBotProps {
  accountName: string;
  industry: string;
}

export default function CompetitiveIntelligenceBot({ accountName, industry }: CompetitiveIntelligenceBotProps) {
  const [input, setInput] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isResearching, setIsResearching] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, streamingText, isStreaming, sendMessage, clearMessages } = useAgentStream();

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }));
    runInitialResearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const runInitialResearch = async () => {
    setIsResearching(true);
    clearMessages();
    try {
      const prompt = `Provide a competitive intelligence brief for Netskope at account "${accountName}" in the "${industry}" industry. Cover: (1) recent SASE competitive moves relevant to this account, (2) how Zscaler and PANW are likely positioning here, (3) Netskope value killers to lead with.`;
      await sendMessage(prompt, { intent: 'comp_intel', context: { accountName, industry } });
    } finally {
      setIsResearching(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text, { intent: 'comp_intel', context: { accountName, industry } });
  };

  const allMessages = messages;

  return (
    <div className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant flex flex-col h-[600px] shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-outline-variant bg-surface-container-high/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Bot className="text-primary" size={20} />
          </div>
          <div>
            <h4 className="font-bold font-headline text-lg">Competitive Intel Bot</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-outline font-label uppercase tracking-widest">
              <Clock size={10} />
              Last Research: {lastUpdated}
            </div>
          </div>
        </div>
        <button
          onClick={runInitialResearch}
          className="p-2 hover:bg-surface-container rounded-full transition-colors text-outline hover:text-primary"
          title="Refresh Research"
        >
          <RefreshCw size={18} className={cn(isResearching && "animate-spin")} />
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {isResearching && allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-outline space-y-3">
            <Loader2 size={32} className="animate-spin text-primary/40" />
            <p className="text-sm font-label animate-pulse">Analyzing market signals for {accountName}...</p>
          </div>
        ) : (
          <>
            {allMessages.map((msg, idx) => (
              <motion.div
                key={`${msg.role}-${idx}-${msg.content.slice(0, 20)}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
              >
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === 'user'
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-surface-container-highest text-on-surface rounded-tl-none border border-outline-variant/30"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {streamingText && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed bg-surface-container-highest text-on-surface rounded-tl-none border border-outline-variant/30 whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse" />
                </div>
              </motion.div>
            )}
          </>
        )}
        {isStreaming && !streamingText && (
          <div className="flex justify-start">
            <div className="bg-surface-container-highest p-4 rounded-2xl rounded-tl-none border border-outline-variant/30 flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-surface-container-high/30 border-t border-outline-variant">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about competitors, market trends, or strategy..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-2xl py-3 pl-4 pr-12 text-sm font-label focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            "How do we beat Zscaler here?",
            `Palo Alto's weak spots at ${accountName}`,
            "Netskope's data-centric advantage",
            "Recent SASE market shifts",
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => setInput(suggestion)}
              className="whitespace-nowrap px-3 py-1.5 bg-white/50 border border-outline-variant/50 rounded-full text-[10px] font-bold text-outline hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
