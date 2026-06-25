import React from 'react';
import {
  Target, CheckCircle2, ChevronDown, ChevronUp, Sparkles,
  AlertTriangle, TrendingUp, ArrowRight, BookOpen, Shield, Users,
  FileText, BarChart2, Zap, Award, Loader2, Send, RotateCcw,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { type Opportunity } from '@/src/data/opportunityData';
import {
  calculateScore, MILESTONE_DEFS, type OpportunityScore, type ContentRec,
} from '@/src/lib/opportunityScoring';

// ─── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#3b82f6' : score >= 35 ? '#f59e0b' : '#ef4444';
  const stroke = score >= 75 ? '#d1fae5' : score >= 55 ? '#dbeafe' : score >= 35 ? '#fef3c7' : '#fee2e2';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${filled} ${c - filled}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.3} fontWeight="900" fill={color}>{score}</text>
      <text x="50%" y="68%" textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.13} fontWeight="600" fill="#94a3b8">/ 100</text>
    </svg>
  );
}

// ─── Small score ring for cards ───────────────────────────────────────────────

export function ScoreRingSmall({ score, size = 36 }: { score: number; size?: number }) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  const filled = (score / 100) * c;
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#3b82f6' : score >= 35 ? '#f59e0b' : '#ef4444';
  const stroke = score >= 75 ? '#d1fae5' : score >= 55 ? '#dbeafe' : score >= 35 ? '#fef3c7' : '#fee2e2';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth={3.5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3.5}
        strokeDasharray={`${filled} ${c - filled}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.3} fontWeight="900" fill={color}>{score}</text>
    </svg>
  );
}

// ─── Dimension bar ─────────────────────────────────────────────────────────────

function DimBar({
  label, raw, max, pct, factors, gaps,
}: { label: string; raw: number; max: number; pct: number; factors: string[]; gaps: string[] }) {
  const [open, setOpen] = React.useState(false);
  const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : pct >= 25 ? 'bg-amber-500' : 'bg-red-400';

  return (
    <div className="space-y-1">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 text-left group">
        <span className="text-[10px] font-bold text-slate-600 w-32 shrink-0">{label}</span>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
        </div>
        <span className={cn('text-[10px] font-black w-8 text-right', pct >= 75 ? 'text-emerald-700' : pct >= 50 ? 'text-blue-700' : pct >= 25 ? 'text-amber-700' : 'text-red-600')}>
          {raw}/{max}
        </span>
        {open ? <ChevronUp size={10} className="text-slate-400" /> : <ChevronDown size={10} className="text-slate-400" />}
      </button>
      {open && (
        <div className="ml-32 space-y-0.5">
          {factors.map(f => (
            <div key={f} className="flex items-center gap-1.5">
              <CheckCircle2 size={8} className="text-emerald-500 shrink-0" />
              <span className="text-[9px] text-slate-600">{f}</span>
            </div>
          ))}
          {gaps.map(g => (
            <div key={g} className="flex items-center gap-1.5">
              <AlertTriangle size={8} className="text-amber-500 shrink-0" />
              <span className="text-[9px] text-slate-500">{g}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Content rec icon ─────────────────────────────────────────────────────────

const CONTENT_ICON: Record<ContentRec['type'], React.ElementType> = {
  battlecard: Zap,
  playbook:   BookOpen,
  case_study: Award,
  roi:        BarChart2,
  security:   Shield,
  demo:       Target,
  guide:      FileText,
  reference:  Users,
};

const CONTENT_COLOR: Record<ContentRec['priority'], string> = {
  high:   'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low:    'bg-slate-50 border-slate-200 text-slate-600',
};

// ─── Hunter AI chat ────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'hunter' | 'user';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  'What\'s the biggest risk to closing this deal?',
  'How should I handle the legal delay?',
  'Who should I call this week?',
  'Am I discounting too early?',
  'How do I strengthen my champion?',
  'What\'s my best competitive angle?',
];

function buildSystemPrompt(opp: Opportunity, score: OpportunityScore): string {
  const completedMs = MILESTONE_DEFS.filter(m => (opp.milestones ?? {})[m.id]).map(m => m.label);
  const missingMs   = MILESTONE_DEFS.filter(m => !(opp.milestones ?? {})[m.id]).map(m => m.label);
  const cp = opp.closePlan;

  return `You are Hunter, an elite enterprise sales coach embedded in Netskope's revenue intelligence platform. You are direct, strategic, and speak like a seasoned deal coach — not a generic assistant. You know this deal inside-out.

DEAL BRIEFING:
- Opportunity: ${opp.name}
- Account: ${opp.accountName}
- ARR: $${(opp.arrValue / 1_000).toFixed(0)}K
- Stage: ${opp.stage.replace(/_/g, ' ')}
- Deal Score: ${score.total}/100 (${score.health.replace('_', ' ')})
- Win Probability: ${Math.round(score.winProbability)}%
- Status: ${opp.status.replace('_', ' ')}
- Close Date: ${opp.closeDate} (${Math.round((new Date(opp.closeDate).getTime() - Date.now()) / 86_400_000)} days)
- Days in Stage: ${opp.daysInStage}
- Rep: ${opp.rep}
- Next Step: ${opp.nextStep || 'Not defined'}

MEDDPICC:
- Metrics: ${cp?.meddpicc.metrics || 'Not documented'}
- Economic Buyer: ${cp?.meddpicc.economicBuyer || 'Not identified'}
- Decision Criteria: ${cp?.meddpicc.decisionCriteria || 'Unknown'}
- Decision Process: ${cp?.meddpicc.decisionProcess || 'Unknown'}
- Paper Process: ${cp?.meddpicc.paperProcess || 'Unknown'}
- Identify Pain: ${cp?.meddpicc.identifyPain || 'Not documented'}
- Champion: ${cp?.meddpicc.champion || 'Not identified'}
- Competition: ${cp?.meddpicc.competition || 'Unknown'}

SCORE GAPS: ${score.dimensions.meddpicc.gaps.concat(score.dimensions.stakeholders.gaps).join('; ') || 'None'}
STRENGTHS: ${score.strengths.join('; ') || 'None'}
RISKS: ${score.risks.join('; ') || 'None documented'}

MILESTONES DONE (${score.milestoneProgress.completed}/${score.milestoneProgress.total}): ${completedMs.join(', ') || 'None'}
MILESTONES PENDING: ${missingMs.join(', ') || 'All complete'}

STAKEHOLDERS: ${(cp?.stakeholders ?? []).map(s => `${s.name} (${s.role.replace('_', ' ')}, ${s.sentiment})`).join('; ') || 'Not mapped'}
DEAL RISKS: ${(cp?.risks ?? []).map(r => `${r.severity}: ${r.risk}`).join('; ') || 'None documented'}
COMPETITOR NOTES: ${cp?.competitorNotes || 'Unknown competitive landscape'}
WHY NETSKOPE: ${cp?.whyNetskope || 'Not documented'}

COACHING STYLE:
- Be direct and actionable — no fluffy motivational talk
- Give specific, deal-relevant advice, not generic sales tips
- Reference actual deal details (names, dates, amounts) in your responses
- Keep responses concise — 3–5 sentences max unless asked to elaborate
- If something looks risky, say so clearly
- You can push back on the rep if the deal looks shaky
- Format using short paragraphs; use bullet points only when listing 3+ items`;
}

async function callGemini(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('no_key');

  const contents = [
    ...history.map(m => ({
      role: m.role === 'hunter' ? 'model' : 'user',
      parts: [{ text: m.text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 400 },
      }),
    },
  );
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('empty_response');
  return text.trim();
}

function HunterBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      {/* Hunter avatar */}
      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
        H
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-500 mb-1">Hunter</p>
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
          <p className="text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 flex-row-reverse">
      <div className="shrink-0 w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-black">
        Me
      </div>
      <div className="flex-1 min-w-0 flex justify-end">
        <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[85%]">
          <p className="text-[11px] text-white leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
        H
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function HunterChat({ opp, score }: { opp: Opportunity; score: OpportunityScore }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const [noKey, setNoKey] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const systemPrompt = React.useMemo(() => buildSystemPrompt(opp, score), [opp, score]);

  // Auto-scroll on new messages
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Hunter's opening message on first render
  React.useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    const openingMsg = `Hey — I'm Hunter, your deal coach on ${opp.name}.\n\nDeal score is **${score.total}/100** (${score.health.replace('_', ' ')}), with ${Math.round(score.winProbability)}% win probability. ${score.risks[0] ? `The biggest risk I see right now: ${score.risks[0].toLowerCase()}.` : 'The deal looks clean so far.'}\n\nWhat do you want to work through?`;
    setMessages([{ role: 'hunter', text: openingMsg }]);
  }, []);

  const send = React.useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setInput('');

    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    try {
      const reply = await callGemini(systemPrompt, messages, trimmed);
      setMessages(prev => [...prev, { role: 'hunter', text: reply }]);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'no_key') {
        setNoKey(true);
        setMessages(prev => [...prev, {
          role: 'hunter',
          text: 'I need a Gemini API key to respond. Add VITE_GEMINI_API_KEY to your .env file and reload.',
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'hunter',
          text: 'Sorry, something went wrong on my end. Try again in a moment.',
        }]);
      }
    } finally {
      setThinking(false);
    }
  }, [thinking, messages, systemPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const reset = () => {
    setMessages([]);
    setInitialized(false);
    setNoKey(false);
  };

  const showSuggestions = messages.length <= 1 && !thinking;

  return (
    <div className="flex flex-col" style={{ height: '420px' }}>

      {/* Hunter header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-violet-50 rounded-t-xl">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-sm font-black shadow-md">
          H
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-slate-900">Hunter</p>
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Deal Coach · Online
            </span>
          </div>
          <p className="text-[9px] text-slate-500">AI-powered · knows this deal · speaks straight</p>
        </div>
        <button
          onClick={reset}
          title="Reset conversation"
          className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-slate-600 transition-colors"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/40">
        {messages.map((msg, i) =>
          msg.role === 'hunter'
            ? <HunterBubble key={i} text={msg.text} />
            : <UserBubble key={i} text={msg.text} />,
        )}
        {thinking && <ThinkingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {showSuggestions && (
        <div className="shrink-0 px-4 pt-2 pb-1 border-t border-slate-100 bg-white">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick questions</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-[9px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors border border-slate-200 hover:border-blue-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-100 bg-white flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Hunter anything about this deal…"
          rows={1}
          disabled={noKey}
          className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all disabled:opacity-50"
          style={{ maxHeight: '80px' }}
          onInput={e => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || thinking || noKey}
          className="shrink-0 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {thinking ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main DealCoachPanel ───────────────────────────────────────────────────────

const HEALTH_STYLE = {
  excellent: { color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', label: 'Excellent'  },
  healthy:   { color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    label: 'Healthy'    },
  at_risk:   { color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   label: 'At Risk'    },
  critical:  { color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',     label: 'Critical'   },
};

const CONF_LABEL = { high: 'High confidence', medium: 'Medium confidence', low: 'Low confidence' };
const CONF_COLOR = { high: 'text-emerald-600', medium: 'text-amber-600', low: 'text-red-600' };

const CAT_COLOR = {
  qualification: 'bg-blue-100 text-blue-700',
  technical:     'bg-violet-100 text-violet-700',
  commercial:    'bg-amber-100 text-amber-700',
  executive:     'bg-emerald-100 text-emerald-700',
};

type ActiveSection = 'score' | 'milestones' | 'actions' | 'content' | 'coach';

export interface DealCoachPanelProps {
  opp: Opportunity;
  onMilestoneToggle: (milestoneId: string, checked: boolean) => void;
  openHunter?: number; // increment to imperatively jump to Hunter tab
}

export default function DealCoachPanel({ opp, onMilestoneToggle, openHunter }: DealCoachPanelProps) {
  const score = React.useMemo(() => calculateScore(opp), [opp]);
  const health = HEALTH_STYLE[score.health];
  const [section, setSection] = React.useState<ActiveSection>('score');

  // Jump to Hunter when footer button triggers it
  React.useEffect(() => {
    if (openHunter && openHunter > 0) setSection('coach');
  }, [openHunter]);

  const SECTIONS: { id: ActiveSection; label: string }[] = [
    { id: 'score',      label: 'Score' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'actions',    label: 'Next Actions' },
    { id: 'content',    label: 'Content' },
    { id: 'coach',      label: '🤖 Hunter' },
  ];

  return (
    <div className="space-y-4">

      {/* ── Hero: score + health ── */}
      <div className={cn('rounded-xl border p-4 flex items-start gap-4', health.bg, health.border)}>
        <ScoreRing score={score.total} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn('text-sm font-black', health.color)}>{health.label}</span>
            <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/60 border', health.border, health.color)}>
              {CONF_LABEL[score.confidence]}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-600 mt-1">
            <span><span className="font-black text-slate-900">{score.winProbability}%</span> win probability</span>
            <span><span className="font-black text-slate-900">{score.milestoneProgress.completed}/{score.milestoneProgress.total}</span> milestones</span>
          </div>
          {/* Mini strengths */}
          <div className="flex flex-wrap gap-1 mt-2">
            {score.strengths.slice(0, 3).map(s => (
              <span key={s} className="text-[8px] font-bold bg-white/70 border border-white rounded px-1.5 py-0.5 text-slate-600 truncate max-w-[120px]">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section nav ── */}
      <div className="flex items-center bg-slate-100 rounded-xl p-0.5 gap-0.5 overflow-x-auto">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={cn(
              'flex-1 shrink-0 py-1.5 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors',
              section === s.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Score breakdown ── */}
      {section === 'score' && (
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                <BarChart2 size={10} /> Score Breakdown
              </p>
              <span className="text-[9px] text-slate-400">{score.total}/100</span>
            </div>
            <div className="p-4 space-y-3">
              <DimBar label="ICP Fit"          {...score.dimensions.icp} />
              <DimBar label="MEDDPICC"         {...score.dimensions.meddpicc} />
              <DimBar label="Stakeholders"     {...score.dimensions.stakeholders} />
              <DimBar label="Milestones"       {...score.dimensions.milestones} />
              <DimBar label="Momentum"         {...score.dimensions.momentum} />
              <DimBar label="Revenue"          {...score.dimensions.revenue} />
              {score.deductions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">Deductions</p>
                  {score.deductions.map(d => (
                    <div key={d.reason} className="flex items-center justify-between text-[9px]">
                      <span className="text-slate-500">{d.reason}</span>
                      <span className="font-bold text-red-500">−{d.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 4-question framework */}
          <section className="grid grid-cols-2 gap-2">
            {[
              { q: 'Where am I?',            a: `${health.label} — ${score.total}/100`, color: health.color, bg: health.bg, border: health.border },
              { q: 'Why am I here?',         a: score.risks[0] ?? score.strengths[0] ?? 'Score reflects current deal state', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
              { q: 'What should I do next?', a: score.nextActions[0] ?? 'Keep executing the close plan', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
              { q: 'What resources help?',   a: score.contentRecs[0] ? `${score.contentRecs[0].title}` : 'Check the Content tab', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
            ].map(({ q, a, color, bg, border }) => (
              <div key={q} className={cn('rounded-xl border p-3', bg, border)}>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{q}</p>
                <p className={cn('text-[10px] font-bold leading-snug', color)}>{a}</p>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* ── Milestones ── */}
      {section === 'milestones' && (
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Mutual Success Plan Progress</span>
                <span className="text-[10px] font-black text-slate-700">{score.milestoneProgress.pct}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', score.milestoneProgress.pct >= 75 ? 'bg-emerald-500' : score.milestoneProgress.pct >= 50 ? 'bg-blue-500' : 'bg-amber-500')}
                  style={{ width: `${score.milestoneProgress.pct}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-600 shrink-0">
              {score.milestoneProgress.completed}/{score.milestoneProgress.total}
            </span>
          </div>

          {/* Milestone list by category */}
          {(['qualification', 'executive', 'technical', 'commercial'] as const).map(cat => {
            const items = MILESTONE_DEFS.filter(m => m.category === cat);
            return (
              <div key={cat} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                  <span className={cn('text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full', CAT_COLOR[cat])}>
                    {cat}
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {items.map(m => {
                    const done = !!(opp.milestones ?? {})[m.id];
                    return (
                      <label key={m.id} className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                        <button
                          onClick={() => onMilestoneToggle(m.id, !done)}
                          className={cn(
                            'shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                            done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-blue-400',
                          )}
                        >
                          {done && <CheckCircle2 size={10} className="text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-[11px] font-semibold leading-snug', done ? 'text-slate-400 line-through' : 'text-slate-800')}>
                            {m.label}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">{m.description}</p>
                        </div>
                        <span className={cn('shrink-0 text-[8px] font-black', done ? 'text-emerald-600' : 'text-slate-400')}>
                          +{m.points}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Next actions ── */}
      {section === 'actions' && (
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
            Prioritized recommendations to increase deal score
          </p>
          {score.nextActions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No critical actions — deal is well-executed</p>
            </div>
          ) : score.nextActions.map((action, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-200 transition-colors">
              <span className={cn(
                'shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white mt-0.5',
                i === 0 ? 'bg-red-500' : i <= 2 ? 'bg-amber-500' : 'bg-blue-400',
              )}>
                {i + 1}
              </span>
              <p className="text-[11px] text-slate-700 leading-snug flex-1">{action}</p>
              <ArrowRight size={10} className="text-slate-300 shrink-0 mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* ── Content recs ── */}
      {section === 'content' && (
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">
            Recommended sales enablement assets
          </p>
          {score.contentRecs.map((rec, i) => {
            const Icon = CONTENT_ICON[rec.type];
            return (
              <div key={i} className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', CONTENT_COLOR[rec.priority].split(' ').slice(0, 2).join(' '), 'border-slate-200')}>
                <div className="shrink-0 p-1.5 rounded-lg bg-white/60">
                  <Icon size={12} className={CONTENT_COLOR[rec.priority].split(' ')[2]} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 leading-snug">{rec.title}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5 leading-snug">{rec.reason}</p>
                </div>
                <span className={cn('shrink-0 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border', CONTENT_COLOR[rec.priority])}>
                  {rec.type.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Hunter AI chat ── */}
      {section === 'coach' && (
        <HunterChat opp={opp} score={score} />
      )}
    </div>
  );
}
