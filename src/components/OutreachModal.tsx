import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Linkedin, Send, Loader2, Sparkles, Copy, Check, Calendar, Database } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { HunterPick } from '@/src/types';
import { handleEmailOutreach, handleLinkedInOutreach } from '@/src/lib/outreachUtils';
import { queryAgent } from '@/src/lib/api';

interface OutreachModalProps {
  pick: HunterPick | null;
  initialPlatform?: 'email' | 'linkedin';
  onClose: () => void;
}

interface OutreachMessages {
  subject: string;
  email: string;
  linkedin: string;
}

export default function OutreachModal({ pick, initialPlatform = 'email', onClose }: OutreachModalProps) {
  const [platform, setPlatform] = React.useState<'email' | 'linkedin'>(initialPlatform);
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<OutreachMessages | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [showSyncLog, setShowSyncLog] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (pick) {
      setPlatform(initialPlatform);
      generateOutreach();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick, initialPlatform]);

  async function generateOutreach() {
    if (!pick) return;
    setLoading(true);
    setError(null);
    try {
      const prompt = `Generate outreach messages for ${pick.name} at ${pick.company}.
Context (Hunter Intelligence): ${pick.signal}.
Goal: Set up a meeting to discuss how Netskope addresses this signal compared to Palo Alto Networks or Zscaler.

1. Email: Very short, punchy subject line, focus on the meeting request. Include a courtesy invite.
2. LinkedIn: Ultra-concise, conversational, direct meeting ask.

Return ONLY JSON: { "subject": "...", "email": "...", "linkedin": "..." }`;

      const text = await queryAgent(prompt, {
        intent: 'outreach',
        context: { contact: pick.name, company: pick.company, signal: pick.signal },
      });

      const cleaned = text.replace(/```json|```/g, '').trim();
      setMessages(JSON.parse(cleaned));
    } catch (err) {
      setError('Failed to generate messages. Check that the backend is running.');
      setMessages({
        subject: `Netskope Solution for ${pick?.company}`,
        email: 'Could not generate email. Please retry.',
        linkedin: 'Could not generate LinkedIn message. Please retry.',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSend = async () => {
    if (!pick || !messages) return;
    setSending(true);
    try {
      if (platform === 'email') {
        await handleEmailOutreach(
          pick.name, pick.company,
          `${pick.name.toLowerCase().replace(' ', '.')}@${pick.company.toLowerCase().replace(' ', '')}.com`,
          messages.subject, messages.email,
        );
      } else {
        await handleLinkedInOutreach(pick.name, pick.company, messages.linkedin);
      }
      onClose();
    } catch (err) {
      console.error('Send Error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleCopy = () => {
    const text = platform === 'email' ? messages?.email : messages?.linkedin;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const insertBookingLink = () => {
    if (!messages) return;
    const link = `\n\nWould you be open to a brief 15-minute chat? Book a time here: https://meetings.netskope.com/schedule/15min`;
    setMessages((prev) => prev ? ({
      ...prev,
      email: prev.email + link,
      linkedin: prev.linkedin + link,
    }) : prev);
    setShowSyncLog(true);
    setTimeout(() => setShowSyncLog(false), 3000);
  };

  if (!pick) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black font-headline tracking-tight">Outreach: {pick.name}</h2>
                <p className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">{pick.company} • {pick.signal}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Platform Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-2xl w-fit mx-auto">
              {(['email', 'linkedin'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    platform === p ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {p === 'email' ? <Mail size={14} /> : <Linkedin size={14} />}
                  {p === 'email' ? 'Email' : 'LinkedIn'}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-xs font-label font-bold text-slate-500 animate-pulse uppercase tracking-widest">Hunter is drafting your message...</p>
              </div>
            ) : (
              <motion.div
                key={platform}
                initial={{ opacity: 0, x: platform === 'email' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                <div className="relative group">
                  <div className="relative bg-slate-50 border border-slate-100 rounded-[2rem] p-8 min-h-[300px] whitespace-pre-wrap text-sm font-label text-slate-700 leading-relaxed">
                    {platform === 'email' ? messages?.email : messages?.linkedin}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={insertBookingLink}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                  >
                    <Calendar size={14} />
                    Add Meeting Invite
                  </button>
                </div>

                <AnimatePresence>
                  {showSyncLog && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-3 shadow-xl border border-cyan-500/20"
                    >
                      <Database size={16} className="text-cyan-400" />
                      <div className="flex-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-cyan-400">Salesforce Sync</p>
                        <p className="text-[10px] font-bold">Meeting Request Logged</p>
                      </div>
                      <Check size={14} className="text-emerald-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context:</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-tight">{pick.urgency}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || loading}
                className="px-8 py-3 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                Send via {platform === 'email' ? 'Gmail' : 'LinkedIn'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
