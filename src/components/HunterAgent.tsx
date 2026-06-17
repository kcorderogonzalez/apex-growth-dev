import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, X, Loader2, ChevronDown, ChevronUp, AlertCircle,
  MessageSquare, Send, ExternalLink, CheckCircle2, HelpCircle,
  TrendingUp, Users, Shield, Zap, Target, Network, Building2,
  Globe, GitBranch, Layers, Lock, PlayCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { queryAgent } from '@/src/lib/api';
import { useAgentStream } from '@/src/hooks/useAgentStream';
import {
  Account, Contact, Deal,
  HunterResearchResult, HunterResearchItem, ConfidenceTier, HunterChatMessage
} from '@/src/types';
import { getEnrichment } from '@/src/data/accountEnrichment';
import { getCrmProfile } from '@/src/data/crmData';
import { useAgentMemory } from '@/src/context/AgentMemoryContext';

interface HunterAgentProps {
  account: Account;
  contacts: Contact[];
  deals: Deal[];
  territoryAccounts?: string[];
  onClose: () => void;
  onStartSequence?: (contact: { name: string; title: string; channel: string; draft: string }) => void;
}

/**
 * Free-text Hunter searches create synthetic accounts with placeholder
 * values (tier: 'Mid-Market', industry: 'Unknown', arr: 0). Sending those
 * to the AI anchors it on fake facts — strip them so it researches instead.
 */
function sanitizeAccount(account: Account): Record<string, unknown> {
  const clean: Record<string, unknown> = { name: account.name, type: account.type };
  if (account.industry && account.industry !== 'Unknown') clean.industry = account.industry;
  if (account.territory && account.territory !== 'Unknown') clean.territory = account.territory;
  if (account.arr > 0) {
    clean.arr = account.arr;
    clean.tier = account.tier; // tier is only meaningful for real CRM accounts
  }
  if (account.healthScore > 0) clean.healthScore = account.healthScore;
  return clean;
}

// ─── Confidence Badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ tier }: { tier: ConfidenceTier }) {
  const config: Record<ConfidenceTier, { label: string; className: string }> = {
    Verified:        { label: 'Verified',        className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    'High Confidence': { label: 'High',          className: 'bg-blue-50 text-blue-700 border-blue-200' },
    'Low Confidence':  { label: 'Low',           className: 'bg-amber-50 text-amber-700 border-amber-200' },
    Unverified:      { label: 'No Data',         className: 'bg-slate-50 text-slate-400 border-slate-200' },
  };
  const { label, className } = config[tier];
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border', className)}>
      {label}
    </span>
  );
}

// ─── Item icon map ─────────────────────────────────────────────────────────────

const ITEM_ICONS: Record<number, React.ReactNode> = {
  1:  <Building2  size={14} />,
  2:  <TrendingUp size={14} />,
  3:  <Target     size={14} />,
  4:  <Shield     size={14} />,
  5:  <Layers     size={14} />,
  6:  <GitBranch  size={14} />,
  7:  <Users      size={14} />,
  8:  <Sparkles   size={14} />,
  9:  <Network    size={14} />,
  10: <Globe      size={14} />,
  11: <Zap        size={14} />,
  12: <Lock       size={14} />,
};

// ─── Research Card Item ────────────────────────────────────────────────────────

function ResearchCard({
  item,
  onStartSequence,
}: {
  item: HunterResearchItem;
  onStartSequence?: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      className={cn(
        'border rounded-xl overflow-hidden transition-all',
        item.available ? 'border-slate-100 bg-white' : 'border-dashed border-slate-200 bg-slate-50/50',
      )}
    >
      <button
        className="w-full text-left px-4 py-3 flex items-start gap-3"
        onClick={() => item.available && setExpanded(v => !v)}
      >
        <div className={cn('mt-0.5 p-1.5 rounded-lg shrink-0', item.available ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-300')}>
          {ITEM_ICONS[item.id] ?? <HelpCircle size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-black font-label uppercase tracking-widest text-slate-400">
              {item.id.toString().padStart(2, '0')} / 12
            </span>
            <ConfidenceBadge tier={item.confidence} />
          </div>
          <p className="text-xs font-bold text-slate-800 leading-snug">{item.title}</p>
          {item.available ? (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.summary}</p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-0.5 italic">No data available for this dimension.</p>
          )}
        </div>
        {item.available && (
          <div className="shrink-0 mt-1 text-slate-300">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        )}
      </button>

      <AnimatePresence>
        {expanded && item.available && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-slate-50 pt-3">
              <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>

              {item.dataPoints && item.dataPoints.length > 0 && (
                <ul className="space-y-1.5">
                  {item.dataPoints.map((dp, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                      {dp}
                    </li>
                  ))}
                </ul>
              )}

              {item.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.sources.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] text-slate-500 font-medium">
                      <ExternalLink size={8} />
                      {s.name} · {s.date}
                    </span>
                  ))}
                </div>
              )}

              {/* Item 11 gets the Start Sequence CTA */}
              {item.id === 11 && onStartSequence && (
                <button
                  onClick={onStartSequence}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  <PlayCircle size={14} />
                  Start Sequence
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Chat Panel ────────────────────────────────────────────────────────────────

const CHAT_STORAGE_KEY = (accountId: string) => `hunter_chat_${accountId}`;

function ChatPanel({ account, contacts, deals }: { account: Account; contacts: Contact[]; deals: Deal[] }) {
  const [input, setInput] = React.useState('');
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const storedHistory = React.useMemo<HunterChatMessage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY(account.id)) ?? '[]');
    } catch {
      return [];
    }
  }, [account.id]);

  const [persistedMessages, setPersistedMessages] = React.useState<HunterChatMessage[]>(storedHistory);

  const { memory } = useAgentMemory();

  const context = React.useMemo(() => ({
    account: sanitizeAccount(account),
    contacts: contacts.slice(0, 10),
    openDeals: deals.slice(0, 5),
    enrichment: getEnrichment(account.name) ?? undefined,
    crmProfile: getCrmProfile(account.name) ?? undefined,
    repPreferences: {
      preferredChannel: memory.hunter.preferredChannel,
      outreachTone: memory.hunter.outreachTone,
    },
  }), [account, contacts, deals, memory]);

  const apiHistory = React.useMemo(() =>
    persistedMessages.map(m => ({ role: m.role, content: m.content })),
    [persistedMessages],
  );

  const { messages, streamingText, isStreaming, sendMessage } = useAgentStream({
    intent: 'hunter_chat',
    context: context as Record<string, unknown>,
    initialHistory: apiHistory,
  });

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  React.useEffect(() => {
    if (messages.length > 0) {
      const toSave: HunterChatMessage[] = messages.map((m, i) => ({
        id: `${account.id}-${i}`,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date().toISOString(),
      }));
      setPersistedMessages(toSave);
      localStorage.setItem(CHAT_STORAGE_KEY(account.id), JSON.stringify(toSave));
    }
  }, [messages, account.id]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    sendMessage(text);
  };

  const allMessages = messages.length > 0 ? messages : persistedMessages;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {allMessages.length === 0 && !isStreaming && (
          <div className="text-center py-10">
            <MessageSquare size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-medium">Ask Hunter anything about {account.name}</p>
            <p className="text-[10px] text-slate-300 mt-1">E.g. "Who should I email first?" or "Summarize their security gaps"</p>
          </div>
        )}

        {allMessages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed',
              msg.role === 'user'
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-sm',
            )}>
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-xl rounded-bl-sm px-3 py-2 text-xs leading-relaxed bg-slate-50 border border-slate-100 text-slate-700">
              {streamingText}
              <span className="inline-block w-1 h-3 bg-primary ml-0.5 animate-pulse rounded-sm" />
            </div>
          </div>
        )}

        {isStreaming && !streamingText && (
          <div className="flex justify-start">
            <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl">
              <Loader2 size={14} className="animate-spin text-primary" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Ask about ${account.name}...`}
            disabled={isStreaming}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

type Tab = 'research' | 'chat';

export default function HunterAgent({ account, contacts, deals, territoryAccounts, onClose, onStartSequence }: HunterAgentProps) {
  const [tab, setTab] = React.useState<Tab>('research');
  const [result, setResult] = React.useState<HunterResearchResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);

  const { memory } = useAgentMemory();

  const context = React.useMemo(() => ({
    account: sanitizeAccount(account),
    contacts: contacts.slice(0, 10).map(c => ({ name: c.name, title: c.title, sentiment: c.sentiment })),
    openDeals: deals.slice(0, 5).map(d => ({ name: d.name, stage: d.stage, value: d.value, status: d.status })),
    enrichment: getEnrichment(account.name) ?? undefined,
    crmProfile: getCrmProfile(account.name) ?? undefined,
    repPreferences: {
      preferredChannel: memory.hunter.preferredChannel,
      outreachTone: memory.hunter.outreachTone,
      focusOnChampions: memory.hunter.focusOnChampions,
      avoidColdTitles: memory.hunter.avoidColdTitles,
      targetIndustries: memory.territory.targetIndustries,
    },
    ...(territoryAccounts && territoryAccounts.length > 0 ? { territoryAccounts } : {}),
  }), [account, contacts, deals, memory, territoryAccounts]);

  // Each invocation gets an id; responses from superseded invocations are
  // dropped so a slow duplicate (e.g. StrictMode double-mount) can't
  // overwrite a newer result.
  const runIdRef = React.useRef(0);

  const runResearch = React.useCallback(() => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setError(null);
    setParseError(null);
    setResult(null);

    queryAgent(
      `Execute the 12-item Hunter Playbook research for account: "${account.name}". Use the account_context provided to enrich all 12 research dimensions. Return ONLY the JSON object as specified.`,
      { intent: 'hunter', context },
    )
      .then(text => {
        if (runId !== runIdRef.current) return; // stale response
        // Strip code fences, then extract the outermost JSON object in case
        // the model wrapped it in prose.
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        const candidate = start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;
        try {
          const parsed: HunterResearchResult = JSON.parse(candidate);
          setResult(parsed);
        } catch {
          console.error('[Hunter] Unparseable AI response:', text);
          setParseError('The AI response could not be parsed as JSON. Raw output shown below (full text in console).');
          setResult(null);
          setError(cleaned.slice(0, 2000));
        }
      })
      .catch(err => {
        if (runId !== runIdRef.current) return;
        setError(String(err));
      })
      .finally(() => {
        if (runId === runIdRef.current) setLoading(false);
      });
  }, [account, context]);

  React.useEffect(() => {
    runResearch();
  }, [runResearch]);

  const handleStartSequence = () => {
    if (!result?.recommended_entry || !onStartSequence) return;
    const r = result.recommended_entry;
    onStartSequence({
      name: r.contact_name,
      title: r.contact_title,
      channel: r.channel,
      draft: r.draft_message,
    });
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 h-full w-[480px] z-[100] bg-white shadow-2xl border-l border-slate-200 flex flex-col"
    >
      {/* Header */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black font-headline tracking-tight leading-none">{account.name}</h2>
            <p className="text-[9px] font-label font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {account.industry} · {account.tier} · {account.type}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 shrink-0">
        {(['research', 'chat'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors',
              tab === t ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            {t === 'research' ? '12-Point Research' : 'Chat with Hunter'}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'research' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-16">
                <Loader2 className="animate-spin text-primary" size={36} />
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-600">Executing Hunter Playbook</p>
                  <p className="text-[10px] text-slate-400 mt-1 animate-pulse">Researching {account.name} across 12 dimensions...</p>
                </div>
              </div>
            ) : error && !parseError ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 px-8 py-16 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <p className="text-sm font-bold text-slate-700">Research failed</p>
                <p className="text-xs text-slate-400">{error}</p>
                <button
                  onClick={runResearch}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
                >
                  Retry
                </button>
              </div>
            ) : parseError ? (
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-700">{parseError}</p>
                    <pre className="mt-2 text-[10px] text-amber-600 whitespace-pre-wrap font-mono">{error}</pre>
                  </div>
                </div>
                <button onClick={runResearch} className="w-full py-2 bg-primary text-white rounded-xl text-xs font-bold">
                  Retry
                </button>
              </div>
            ) : result ? (
              <div className="p-4 space-y-2">
                {/* Recommended Entry Banner */}
                <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Recommended Entry Point</p>
                      <p className="text-xs font-bold text-slate-800">{result.recommended_entry.contact_name}</p>
                      <p className="text-[10px] text-slate-500">{result.recommended_entry.contact_title} · via {result.recommended_entry.channel}</p>
                      <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{result.recommended_entry.rationale}</p>
                    </div>
                    <button
                      onClick={handleStartSequence}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
                    >
                      <PlayCircle size={12} />
                      Start Sequence
                    </button>
                  </div>
                  {result.recommended_entry.draft_message && (
                    <div className="mt-3 p-3 bg-white border border-slate-100 rounded-lg">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Draft Message</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed italic">"{result.recommended_entry.draft_message}"</p>
                    </div>
                  )}
                </div>

                {/* 12-item cards */}
                {result.items.map(item => (
                  <ResearchCard
                    key={item.id}
                    item={item}
                    onStartSequence={item.id === 11 ? handleStartSequence : undefined}
                  />
                ))}

                {/* Confidence legend */}
                <div className="flex flex-wrap gap-2 pt-2 pb-4">
                  {(['Verified', 'High Confidence', 'Low Confidence', 'Unverified'] as ConfidenceTier[]).map(t => (
                    <ConfidenceBadge key={t} tier={t} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {tab === 'chat' && (
          <ChatPanel account={account} contacts={contacts} deals={deals} />
        )}
      </div>
    </motion.div>
  );
}
