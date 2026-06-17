import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Linkedin, Phone, Copy, Check, Send, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { queryAgent } from '@/src/lib/api';
import { useAgentMemory } from '@/src/context/AgentMemoryContext';

export interface PgSeqContext {
  contactName: string;
  contactTitle?: string;
  company: string;
  channel?: 'email' | 'linkedin' | 'phone';
  signal?: string;
  sourcePanel?: 'inbound' | 'outbound' | 'hunter';
  itemId?: string;
}

interface ParsedOutreach {
  subject?: string;
  email?: string;
  linkedin?: string;
  phone_script?: string;
}

interface PgSeqDrawerProps {
  context: PgSeqContext | null;
  onClose: () => void;
  onMarkSent?: (itemId: string) => void;
}

const CHANNELS = [
  { id: 'email' as const, label: 'Email', icon: Mail },
  { id: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
  { id: 'phone' as const, label: 'Phone', icon: Phone },
];

export default function PgSeqDrawer({ context, onClose, onMarkSent }: PgSeqDrawerProps) {
  const { contextSummary } = useAgentMemory();
  const [channel, setChannel] = React.useState<'email' | 'linkedin' | 'phone'>('email');
  const [isLoading, setIsLoading] = React.useState(false);
  const [parsed, setParsed] = React.useState<ParsedOutreach | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [marked, setMarked] = React.useState(false);
  const prevContextRef = React.useRef<string>('');

  React.useEffect(() => {
    if (context) {
      setChannel(context.channel ?? 'email');
      setParsed(null);
      setError(null);
      setMarked(false);
    }
  }, [context]);

  const generate = React.useCallback(async () => {
    if (!context || isLoading) return;
    setIsLoading(true);
    setError(null);
    const mem = contextSummary();
    try {
      const prompt = `Write outreach for ${context.contactName}${context.contactTitle ? ` (${context.contactTitle})` : ''} at ${context.company}.${context.signal ? ` Trigger signal: ${context.signal}.` : ''} Preferred channel: ${channel}.`;
      const raw = await queryAgent(prompt, {
        intent: 'outreach',
        context: {
          repPreferences: mem,
          contactName: context.contactName,
          contactTitle: context.contactTitle ?? '',
          company: context.company,
          signal: context.signal ?? '',
          channel,
        },
      });
      // Try JSON parse
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const obj: ParsedOutreach = JSON.parse(jsonMatch[0]);
        setParsed(obj);
      } else {
        // Fallback: treat raw as email body
        setParsed({ email: raw, linkedin: raw });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  }, [context, channel, contextSummary, isLoading]);

  // Auto-generate when drawer opens
  React.useEffect(() => {
    if (!context) return;
    const key = `${context.contactName}-${context.company}-${channel}`;
    if (key !== prevContextRef.current) {
      prevContextRef.current = key;
      generate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, channel]);

  const getMessage = () => {
    if (!parsed) return '';
    if (channel === 'email') return parsed.email ?? parsed.linkedin ?? '';
    if (channel === 'linkedin') return parsed.linkedin ?? parsed.email ?? '';
    return parsed.phone_script ?? parsed.email ?? '';
  };

  const handleCopy = async () => {
    const msg = getMessage();
    if (!msg) return;
    const full = channel === 'email' && parsed?.subject ? `Subject: ${parsed.subject}\n\n${msg}` : msg;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkSent = () => {
    setMarked(true);
    if (context?.itemId && onMarkSent) onMarkSent(context.itemId);
    setTimeout(onClose, 1200);
  };

  return (
    <AnimatePresence>
      {context && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 z-[130]"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 h-full w-[480px] z-[140] bg-white shadow-2xl border-l border-slate-200 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 font-label">PG-SEQ · Start Sequence</span>
                </div>
                <h2 className="text-base font-black font-headline tracking-tight leading-tight">
                  {context.contactName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {context.contactTitle ? `${context.contactTitle} · ` : ''}{context.company}
                </p>
                {context.signal && (
                  <p className="text-[10px] text-cyan-300 mt-1.5 font-medium">Signal: {context.signal}</p>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors mt-0.5">
                <X size={16} className="text-white/60" />
              </button>
            </div>

            {/* Channel selector */}
            <div className="px-6 pt-4 pb-3 border-b border-slate-100 shrink-0">
              <div className="flex gap-2">
                {CHANNELS.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setChannel(ch.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all border',
                      channel === ch.id
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200',
                    )}
                  >
                    <ch.icon size={13} />
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Loader2 size={24} className="text-primary animate-spin" />
                  <p className="text-xs text-slate-400 font-label">Generating {channel} message…</p>
                </div>
              )}

              {error && !isLoading && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                  <button
                    onClick={generate}
                    className="mt-2 text-[11px] font-bold text-primary hover:underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !error && parsed && (
                <div className="space-y-4">
                  {channel === 'email' && parsed.subject && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 font-label">Subject</p>
                      <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700">
                        {parsed.subject}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 font-label">
                      {channel === 'phone' ? 'Talk Track' : 'Message'}
                    </p>
                    <div className="px-4 py-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-body">
                      {getMessage()}
                    </div>
                  </div>
                  <button
                    onClick={generate}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <ChevronDown size={12} /> Regenerate
                  </button>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 py-5 border-t border-slate-100 space-y-3 shrink-0 bg-white">
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  disabled={!parsed || isLoading}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border',
                    copied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 disabled:opacity-40',
                  )}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleMarkSent}
                  disabled={!parsed || isLoading || marked}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg',
                    marked
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-primary text-white shadow-primary/20 hover:opacity-90 disabled:opacity-40',
                  )}
                >
                  {marked ? <Check size={14} /> : <Send size={14} />}
                  {marked ? 'Sent!' : 'Mark as Sent'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
