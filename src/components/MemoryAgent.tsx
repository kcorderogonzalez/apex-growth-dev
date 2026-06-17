import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain, Trash2, ToggleLeft, ToggleRight, Plus, AlertTriangle,
  CheckCircle2, X, Shield, ChevronDown, ChevronUp, Lock, Unlock,
  Send, Loader2, Sparkles, Settings2, MapPin, Zap, MessageSquare,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAgentMemory } from '@/src/context/AgentMemoryContext';
import { MemoryCategory, MemoryEntry, AdminConstraintEntry } from '@/src/types';
import { queryAgent } from '@/src/lib/api';

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<MemoryCategory, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> ; color: string; bg: string }> = {
  territory:  { label: 'Territory',            icon: MapPin,       color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
  sequencing: { label: 'Sequencing (PG-SEQ)',   icon: Zap,          color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
  hunter:     { label: 'Hunter Agent',          icon: Sparkles,     color: 'text-primary',    bg: 'bg-cyan-50 border-cyan-100' },
  outreach:   { label: 'Outreach Writer',       icon: MessageSquare,color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
  general:    { label: 'General',               icon: Brain,        color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-100' },
};

// ─── Chat types ───────────────────────────────────────────────────────────────

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface PendingPref {
  understood: string;
  confirmedRule: string;
  category: MemoryCategory;
  changes: Record<string, unknown>;
  originalText: string;
}

// ─── Preference Entry Card ────────────────────────────────────────────────────

function PrefCard({ entry, onDelete, onToggle }: {
  entry: MemoryEntry;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const cfg = CATEGORY_CONFIG[entry.category];
  const Icon = cfg.icon;
  return (
    <div className={cn('border rounded-xl p-3 flex items-start gap-3 transition-opacity', cfg.bg, !entry.active && 'opacity-50')}>
      <div className={cn('p-1.5 rounded-lg shrink-0', 'bg-white/70')}>
        <Icon size={13} className={cfg.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-700 leading-snug">{entry.confirmedRule}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate italic">"{entry.originalText}"</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onToggle} className="p-1 text-slate-300 hover:text-slate-600 transition-colors" title={entry.active ? 'Disable' : 'Enable'}>
          {entry.active ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
        </button>
        <button onClick={onDelete} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────

function AdminPanel() {
  const { adminConstraints, updateAdminConstraints } = useAgentMemory();

  const toggleLock = (paramPath: string) => {
    const updated = {
      ...adminConstraints,
      params: adminConstraints.params.map(p =>
        p.paramPath === paramPath ? { ...p, locked: !p.locked } : p,
      ),
    };
    updateAdminConstraints(updated);
  };

  const updateReason = (paramPath: string, reason: string) => {
    const updated = {
      ...adminConstraints,
      params: adminConstraints.params.map(p =>
        p.paramPath === paramPath ? { ...p, reason } : p,
      ),
    };
    updateAdminConstraints(updated);
  };

  const byCategory: Record<string, AdminConstraintEntry[]> = {};
  for (const p of adminConstraints.params) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <Shield size={14} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700 font-medium">Locked parameters cannot be changed by individual reps. Use this to enforce RevOps policies.</p>
      </div>
      {Object.entries(byCategory).map(([cat, params]) => {
        const cfg = CATEGORY_CONFIG[cat as MemoryCategory];
        return (
          <div key={cat} className="space-y-2">
            <p className={cn('text-[10px] font-black uppercase tracking-widest', cfg.color)}>{cfg.label}</p>
            {params.map(p => (
              <div key={p.paramPath} className="border border-slate-100 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{p.displayName}</span>
                  <button
                    onClick={() => toggleLock(p.paramPath)}
                    className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all',
                      p.locked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100',
                    )}
                  >
                    {p.locked ? <Lock size={10} /> : <Unlock size={10} />}
                    {p.locked ? 'Locked' : 'Unlocked'}
                  </button>
                </div>
                {p.locked && (
                  <input
                    type="text"
                    value={p.reason}
                    onChange={e => updateReason(p.paramPath, e.target.value)}
                    placeholder="Reason shown to reps (e.g. 'Set by RevOps policy Q3 2026')"
                    className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type Tab = 'chat' | 'preferences' | 'admin';

const GREETING = `Hi Elena! I'm your Memory Agent — I personalize every Apex AI agent to match your workflow.

You can configure:
• **Hunter Agent** — target account criteria, preferred entry channel, outreach tone
• **PG-SEQ Sequencing** — which contact tiers require your review vs. run autonomously
• **Territory** — account size filters, industry focus, active opportunity exclusions
• **Outreach Writer** — message tone, email length, CTA style

What would you like to configure? Or type "walk me through it" for a guided setup.`;

export default function MemoryAgent() {
  const {
    memory, adminConstraints, versionConflict, addEntry,
    toggleEntry, deleteEntry, dismissConflict, isLocked,
    contextSummary, isAdminMode, setAdminMode,
  } = useAgentMemory();

  const [tab, setTab] = React.useState<Tab>('chat');
  const [messages, setMessages] = React.useState<ChatMsg[]>([
    { id: 'greeting', role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [pending, setPending] = React.useState<PendingPref | null>(null);
  const [expandedCats, setExpandedCats] = React.useState<Set<MemoryCategory>>(new Set(['territory', 'sequencing', 'hunter', 'outreach']));
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pending]);

  const toggleCat = (cat: MemoryCategory) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
    setIsStreaming(true);

    const adminLocks = adminConstraints.params
      .filter(p => p.locked)
      .map(p => `${p.displayName}${p.reason ? ` (${p.reason})` : ''}`);

    try {
      // First try to parse as a preference; if not parseable use memory_agent for guidance
      const parseResult = await queryAgent(text, {
        intent: 'memory_parse',
        context: { memorySummary: contextSummary(), adminLocks },
      });

      let parsed: { understood: string; confirmedRule: string; category: MemoryCategory; changes: Record<string, unknown> } | null = null;
      try {
        const cleaned = parseResult.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = null;
      }

      if (parsed && Object.keys(parsed.changes ?? {}).length > 0) {
        // Check admin locks
        const locked = Object.keys(parsed.changes).filter(path => isLocked(path));
        if (locked.length > 0) {
          const lockInfo = adminConstraints.params.find(p => locked.includes(p.paramPath));
          setMessages(prev => [...prev, {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: `That preference (${lockInfo?.displayName ?? locked[0]}) is currently locked by Sales Ops${lockInfo?.reason ? `: "${lockInfo.reason}"` : ''}. I can't change it. Is there something else I can help configure?`,
          }]);
        } else {
          setPending({ ...parsed, originalText: text });
        }
      } else {
        // Fall back to conversational memory_agent
        const convResult = await queryAgent(text, {
          intent: 'memory_agent',
          context: { memorySummary: contextSummary(), adminLocks },
          history: messages.map(m => ({ role: m.role, content: m.content })),
        });
        setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: convResult }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: `Error: ${String(err)}` }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const confirmPref = () => {
    if (!pending) return;
    addEntry(pending.originalText, pending.confirmedRule, pending.category, pending.changes);
    setMessages(prev => [...prev, {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: `Got it! I've saved: "${pending.confirmedRule}" This preference is now active across all Apex agents. You can manage it in the Preferences tab.`,
    }]);
    setPending(null);
    setTab('preferences');
    setTimeout(() => setTab('chat'), 1500);
  };

  const rejectPref = () => {
    setPending(null);
    setMessages(prev => [...prev, {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: 'No problem. Can you describe what you\'d like differently? I\'ll re-interpret it.',
    }]);
  };

  // Group entries by category
  const entriesByCategory = React.useMemo(() => {
    const map: Partial<Record<MemoryCategory, MemoryEntry[]>> = {};
    for (const e of memory.entries) {
      if (!map[e.category]) map[e.category] = [];
      map[e.category]!.push(e);
    }
    return map;
  }, [memory.entries]);

  const hasEntries = memory.entries.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-on-background tracking-tighter font-headline mb-2 flex items-center gap-3">
            <Brain className="text-primary" size={36} />
            Agent Memory
          </h1>
          <p className="text-slate-500 font-label">Configure all Apex AI agents to match your workflow. No IT required.</p>
        </div>
        <div className="flex items-center gap-3">
          {memory.entries.length > 0 && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-widest">
              {memory.entries.filter(e => e.active).length} active preferences
            </span>
          )}
          <button
            onClick={() => setAdminMode(!isAdminMode)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all',
              isAdminMode
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400',
            )}
          >
            <Settings2 size={13} />
            {isAdminMode ? 'Exit Admin Mode' : 'Admin Mode'}
          </button>
        </div>
      </div>

      {/* Version conflict banner */}
      <AnimatePresence>
        {versionConflict && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
          >
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Apex was updated</p>
              <p className="text-xs text-amber-600 mt-0.5">Some default settings may have changed. Review your preferences below to confirm they still reflect how you work.</p>
            </div>
            <button onClick={dismissConflict} className="text-amber-400 hover:text-amber-600">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {([['chat', 'Configure via Chat'], ['preferences', 'My Preferences'], ...(isAdminMode ? [['admin', 'Admin Controls']] : [])] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors',
              tab === t ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Chat */}
      {tab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
          {/* Chat panel */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2rem] flex flex-col overflow-hidden shadow-sm">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="mr-2 mt-1 shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain size={13} className="text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-sm',
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-1 shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain size={13} className="text-primary" />
                  </div>
                  <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-sm">
                    <Loader2 size={14} className="animate-spin text-primary" />
                  </div>
                </div>
              )}

              {/* Pending confirmation */}
              <AnimatePresence>
                {pending && !isStreaming && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mx-auto max-w-lg bg-white border-2 border-primary/20 rounded-2xl p-4 space-y-3 shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Confirm Preference</p>
                        <p className="text-sm text-slate-700 font-medium">{pending.understood}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pending.confirmedRule}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={confirmPref}
                        className="flex-1 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
                      >
                        Apply
                      </button>
                      <button
                        onClick={rejectPref}
                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        No, adjust
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder='e.g. "Only show financial services accounts above 2,000 employees"'
                  disabled={isStreaming || !!pending}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming || !!pending}
                  className="p-2.5 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  'Walk me through all agents',
                  'CIO-level always needs my review',
                  'Only financial services accounts',
                  'Prefer LinkedIn first contact',
                ].map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-medium text-slate-500 hover:border-primary hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick summary sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Current Settings Snapshot</p>
              <div className="space-y-2">
                {[
                  { label: 'Channel', value: memory.hunter.preferredChannel },
                  { label: 'Tone', value: memory.hunter.outreachTone },
                  { label: 'Automation', value: memory.sequencing.defaultMode },
                  { label: 'Industries', value: memory.territory.targetIndustries.length ? memory.territory.targetIndustries.join(', ') : 'All' },
                  { label: 'Min size', value: memory.territory.minEmployeeCount ? `${memory.territory.minEmployeeCount.toLocaleString()} employees` : 'Any' },
                  { label: 'Review for', value: memory.sequencing.requireReviewForTitles.length ? memory.sequencing.requireReviewForTitles.join(', ') : 'None set' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">{label}</span>
                    <span className="text-[10px] font-bold text-slate-700 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            {hasEntries && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Active Preferences</p>
                <p className="text-2xl font-black text-emerald-700 font-headline">{memory.entries.filter(e => e.active).length}</p>
                <p className="text-[10px] text-emerald-600 font-medium">applied across all agents</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Preferences */}
      {tab === 'preferences' && (
        <div className="space-y-6">
          {!hasEntries ? (
            <div className="text-center py-20">
              <Brain size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-400">No preferences configured yet</p>
              <p className="text-sm text-slate-300 mt-1">Go to the Configure tab to add your first preference</p>
              <button
                onClick={() => setTab('chat')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
              >
                Start Configuring
              </button>
            </div>
          ) : (
            (Object.keys(CATEGORY_CONFIG) as MemoryCategory[])
              .filter(cat => (entriesByCategory[cat]?.length ?? 0) > 0)
              .map(cat => {
                const cfg = CATEGORY_CONFIG[cat];
                const Icon = cfg.icon;
                const entries = entriesByCategory[cat] ?? [];
                const expanded = expandedCats.has(cat);
                return (
                  <div key={cat} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => toggleCat(cat)}
                      className="w-full flex items-center justify-between px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-xl', cfg.bg)}>
                          <Icon size={16} className={cfg.color} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-slate-800">{cfg.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{entries.filter(e => e.active).length} of {entries.length} active</p>
                        </div>
                      </div>
                      {expanded ? <ChevronUp size={16} className="text-slate-300" /> : <ChevronDown size={16} className="text-slate-300" />}
                    </button>
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-2 border-t border-slate-50 pt-3">
                            {entries.map(entry => (
                              <PrefCard
                                key={entry.id}
                                entry={entry}
                                onDelete={() => deleteEntry(entry.id)}
                                onToggle={() => toggleEntry(entry.id)}
                              />
                            ))}
                            <button
                              onClick={() => setTab('chat')}
                              className="mt-1 flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-primary transition-colors"
                            >
                              <Plus size={11} />
                              Add another via chat
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Tab: Admin */}
      {tab === 'admin' && isAdminMode && (
        <div className="max-w-2xl">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Shield size={18} className="text-slate-700" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800">Sales Ops Admin Controls</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Lock parameters that individual reps cannot change.</p>
              </div>
            </div>
            <AdminPanel />
          </div>
        </div>
      )}
    </div>
  );
}
