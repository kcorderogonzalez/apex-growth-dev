import React from 'react';
import {
  Target, CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles,
  AlertTriangle, TrendingUp, ArrowRight, BookOpen, Shield, Users,
  FileText, BarChart2, Zap, Award, Loader2, RefreshCw,
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

// ─── AI Coach section ─────────────────────────────────────────────────────────

function AICoachSection({ opp, score }: { opp: Opportunity; score: OpportunityScore }) {
  const [state, setState] = React.useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [response, setResponse] = React.useState<{
    coachingInsight: string;
    dealHealthSummary: string;
    topRisks: string[];
    winFactors: string[];
    forecastAssessment: string;
  } | null>(null);

  const buildPrompt = () => {
    const ms = MILESTONE_DEFS.filter(m => (opp.milestones ?? {})[m.id]).map(m => m.label);
    const missingMs = MILESTONE_DEFS.filter(m => !(opp.milestones ?? {})[m.id]).map(m => m.label);
    const meddpicc = opp.closePlan?.meddpicc;

    return `You are a senior enterprise sales coach at Netskope. Analyze this opportunity and provide concise, practical coaching.

OPPORTUNITY: ${opp.name}
ACCOUNT: ${opp.accountName}
ARR: $${(opp.arrValue / 1000).toFixed(0)}K
STAGE: ${opp.stage.replace(/_/g, ' ')}
DEAL SCORE: ${score.total}/100 (${score.health.replace('_', ' ')})
WIN PROBABILITY: ${score.winProbability}%
STATUS: ${opp.status}
DAYS IN STAGE: ${opp.daysInStage}
CLOSE DATE: ${opp.closeDate}
NEXT STEP: ${opp.nextStep || 'Not defined'}

MEDDPICC GAPS: ${score.dimensions.meddpicc.gaps.join(', ') || 'None'}
MEDDPICC STRENGTHS: ${score.dimensions.meddpicc.factors.join(', ') || 'None'}

STAKEHOLDER GAPS: ${score.dimensions.stakeholders.gaps.join(', ') || 'None'}
MILESTONES COMPLETED (${score.milestoneProgress.completed}/${score.milestoneProgress.total}): ${ms.join(', ') || 'None'}
MILESTONES PENDING: ${missingMs.slice(0, 5).join(', ')}

KEY RISKS: ${(opp.closePlan?.risks ?? []).map(r => r.risk).join('; ') || 'None documented'}
COMPETITOR NOTES: ${opp.closePlan?.competitorNotes || 'Unknown'}

Provide a JSON response (only JSON, no markdown) with these exact keys:
{
  "coachingInsight": "2-3 sentence direct coaching insight about the biggest opportunity to improve this deal",
  "dealHealthSummary": "1 sentence honest assessment of deal health and where it stands",
  "topRisks": ["risk 1", "risk 2", "risk 3"],
  "winFactors": ["factor 1", "factor 2", "factor 3"],
  "forecastAssessment": "1 sentence on forecast confidence and what needs to happen to close on time"
}`;
  };

  const runCoach = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setState('error');
      return;
    }
    setState('loading');
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt() }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
          }),
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setResponse(parsed);
      setState('done');
    } catch {
      setState('error');
    }
  };

  if (state === 'idle') {
    return (
      <button
        onClick={runCoach}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-blue-700 hover:to-violet-700 transition-all shadow-md"
      >
        <Sparkles size={12} /> Analyze with AI Coach
      </button>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs font-label">AI Coach is analyzing the deal…</span>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 space-y-1">
        <p className="font-bold">AI Coach unavailable</p>
        <p className="text-[11px]">Add <code className="bg-red-100 px-1 rounded">VITE_GEMINI_API_KEY</code> to your .env file to enable AI coaching.</p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="space-y-3">
      {/* Coaching insight */}
      <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-xl p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-blue-700 mb-2 flex items-center gap-1.5">
          <Sparkles size={9} /> AI Coach Insight
        </p>
        <p className="text-[11px] text-blue-900 leading-relaxed">{response.coachingInsight}</p>
      </div>

      {/* Deal health + forecast */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Deal Health</p>
          <p className="text-[10px] text-slate-700 leading-snug">{response.dealHealthSummary}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Forecast View</p>
          <p className="text-[10px] text-slate-700 leading-snug">{response.forecastAssessment}</p>
        </div>
      </div>

      {/* Risks & win factors */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[8px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1">
            <AlertTriangle size={8} /> Top Risks
          </p>
          {response.topRisks.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 bg-red-50 rounded-lg px-2 py-1.5 border border-red-100">
              <span className="text-[8px] font-black text-red-400 shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-[9px] text-red-800 leading-snug">{r}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
            <TrendingUp size={8} /> Win Factors
          </p>
          {response.winFactors.map((f, i) => (
            <div key={i} className="flex items-start gap-1.5 bg-emerald-50 rounded-lg px-2 py-1.5 border border-emerald-100">
              <span className="text-[8px] font-black text-emerald-500 shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-[9px] text-emerald-900 leading-snug">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={runCoach}
        className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-blue-600 transition-colors"
      >
        <RefreshCw size={9} /> Re-analyze
      </button>
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
}

export default function DealCoachPanel({ opp, onMilestoneToggle }: DealCoachPanelProps) {
  const score = React.useMemo(() => calculateScore(opp), [opp]);
  const health = HEALTH_STYLE[score.health];
  const [section, setSection] = React.useState<ActiveSection>('score');

  const SECTIONS: { id: ActiveSection; label: string }[] = [
    { id: 'score',      label: 'Score' },
    { id: 'milestones', label: 'Milestones' },
    { id: 'actions',    label: 'Next Actions' },
    { id: 'content',    label: 'Content' },
    { id: 'coach',      label: '✨ AI Coach' },
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

      {/* ── AI Coach ── */}
      {section === 'coach' && (
        <AICoachSection opp={opp} score={score} />
      )}
    </div>
  );
}
