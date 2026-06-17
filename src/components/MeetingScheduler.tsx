import React from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { salesforceMCP } from '../lib/salesforceMCP';
import {
  Calendar, Database, BarChart3, X, Send, Loader2, Check,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAgentStream } from '@/src/hooks/useAgentStream';

interface MeetingSchedulerProps {
  onClose: () => void;
  onViewDashboard: () => void;
}

export default function MeetingScheduler({ onClose, onViewDashboard }: MeetingSchedulerProps) {
  const [chatInput, setChatInput] = React.useState('');
  const [showSyncLog, setShowSyncLog] = React.useState(false);
  const [pendingDraft, setPendingDraft] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { messages, streamingText, isStreaming, sendMessage } = useAgentStream();

  // Seed the initial bot greeting as a local message (not from API)
  const [initialized, setInitialized] = React.useState(false);
  const [localGreeting] = React.useState({
    role: 'assistant' as const,
    content: "Hello! I am **Meetings Manager**, your AI-powered meeting management assistant. I can help you manage booking links, track meeting outcomes, and sync everything to Salesforce.\n\nWould you like to **draft an outreach email** with a booking link, or **view your tracking dashboard** for analytics?",
  });

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const handleSend = async (overrideInput?: string) => {
    const text = (overrideInput ?? chatInput).trim();
    if (!text || isStreaming) return;
    setChatInput('');

    if (text.toLowerCase().includes('sync') && text.toLowerCase().includes('salesforce')) {
      setShowSyncLog(true);
      setTimeout(() => setShowSyncLog(false), 3000);
    }

    await sendMessage(text, { intent: 'meeting' });

    // Show send button if the reply looks like a draft
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.content?.toLowerCase().includes('subject:') || lastMsg?.content?.toLowerCase().includes('book a time')) {
      setPendingDraft(true);
    }
  };

  const handleSendEmail = () => {
    sendMessage("Email sent and confirmed.", { intent: 'meeting' });
    setPendingDraft(false);
    setShowSyncLog(true);
    setTimeout(() => setShowSyncLog(false), 3000);
  };

  const allMessages = initialized ? messages : [localGreeting, ...messages];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-[450px] z-[120] bg-white shadow-2xl border-l border-slate-200 flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500 rounded-xl text-white">
            <Calendar size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black font-headline tracking-tight">Meetings Manager</h2>
            <p className="text-[9px] font-label font-bold text-cyan-400 uppercase tracking-widest">Meeting Intelligence Agent</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={18} className="text-white/60" />
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
        {allMessages.map((msg, idx) => (
          <div key={`${msg.role}-${idx}-${msg.content.slice(0, 20)}`} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
            <div className={cn(
              "max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed",
              msg.role === 'user'
                ? "bg-primary text-white rounded-tr-none"
                : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm"
            )}>
              <div className="markdown-body gsync-chat">
                <Markdown components={{
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border-collapse border border-slate-200 text-[10px]">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => <th className="border border-slate-200 bg-slate-100 p-2 font-bold uppercase">{children}</th>,
                  td: ({ children }) => <td className="border border-slate-200 p-2">{children}</td>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-cyan-500 bg-cyan-50 p-3 my-4 rounded-r-xl italic font-medium text-cyan-800">{children}</blockquote>
                  ),
                }}>
                  {msg.content}
                </Markdown>
              </div>
            </div>
            <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              {msg.role === 'assistant' ? 'Meetings Manager' : 'You'}
            </span>
          </div>
        ))}
        {streamingText && (
          <div className="flex flex-col items-start">
            <div className="max-w-[90%] p-4 rounded-2xl rounded-tl-none text-xs leading-relaxed bg-white border border-slate-200 text-slate-700 shadow-sm whitespace-pre-wrap">
              {streamingText}
              <span className="inline-block w-1 h-3 bg-cyan-500 ml-1 animate-pulse" />
            </div>
          </div>
        )}
        {isStreaming && !streamingText && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Actions / Input */}
      <div className="p-6 bg-white border-t border-slate-100 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button onClick={() => handleSend("Show my Tracking Dashboard")} className="whitespace-nowrap px-3 py-1.5 bg-cyan-50 border border-cyan-100 rounded-full text-[10px] font-bold text-cyan-700 hover:bg-cyan-100 transition-all">
            📊 View Dashboard
          </button>
          <button onClick={() => setChatInput("Draft a concise meeting invite for Sarah using Hunter intelligence")} className="whitespace-nowrap px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-bold text-primary hover:bg-primary/10 transition-all">
            📧 Draft Invite
          </button>
          <button onClick={() => handleSend("Add a meeting invite to my last message")} className="whitespace-nowrap px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-all">
            📅 Add Meeting Invite
          </button>
          <button onClick={() => setChatInput("Sync last meeting to Salesforce")} className="whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
            ☁️ Salesforce Sync
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a command..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-xs font-medium focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!chatInput.trim() || isStreaming}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>

        <AnimatePresence>
          {pendingDraft && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={handleSendEmail}
              disabled={isStreaming}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Send size={16} />
              Confirm & Send Email
            </motion.button>
          )}
        </AnimatePresence>

        <button
          onClick={onViewDashboard}
          className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <BarChart3 size={14} />
          Open Full Dashboard
        </button>
      </div>

      {/* Salesforce Sync Notification */}
      <AnimatePresence>
        {showSyncLog && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-[200] flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-cyan-500/20"
          >
            <Database size={16} className="text-cyan-400" />
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-cyan-400">Salesforce Sync</p>
              <p className="text-[10px] font-bold">Data Synchronized</p>
            </div>
            <Check size={14} className="text-emerald-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
