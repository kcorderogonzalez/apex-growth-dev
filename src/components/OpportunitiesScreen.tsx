import React from 'react';
import {
  TrendingUp, DollarSign, Calendar, ChevronRight, X, CheckCircle2,
  Clock, AlertTriangle, Target, User, Users, Shield, Zap, ArrowRight,
  BarChart2, FileText, Flag, Building2, ChevronDown, Plus, Sparkles,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  opportunities, STAGES, ACTIVE_STAGES,
  type Opportunity, type OppStage, type MAPItem, type Stakeholder,
} from '@/src/data/opportunityData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function daysUntil(dateStr: string) {
  const d = Math.round((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  return d;
}

function stageMeta(id: OppStage) {
  return STAGES.find(s => s.id === id)!;
}

const STATUS_STYLE = {
  healthy:  { dot: 'bg-emerald-500', label: 'Healthy',  pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  at_risk:  { dot: 'bg-amber-500',   label: 'At Risk',  pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  stalled:  { dot: 'bg-red-500',     label: 'Stalled',  pill: 'bg-red-50 text-red-700 border-red-200' },
};

const MAP_STATUS = {
  complete:    { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50',  label: 'Complete' },
  in_progress: { icon: Zap,          color: 'text-blue-600',    bg: 'bg-blue-50',     label: 'In Progress' },
  pending:     { icon: Clock,         color: 'text-slate-400',   bg: 'bg-slate-50',    label: 'Pending' },
  overdue:     { icon: AlertTriangle, color: 'text-red-600',     bg: 'bg-red-50',      label: 'Overdue' },
};

const ROLE_LABEL: Record<Stakeholder['role'], string> = {
  economic_buyer:     'Economic Buyer',
  champion:           'Champion',
  technical_evaluator:'Technical Evaluator',
  user:               'User / Influencer',
  blocker:            'Blocker',
  coach:              'Coach',
};

const SENTIMENT_STYLE: Record<Stakeholder['sentiment'], string> = {
  positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  neutral:  'bg-slate-100 text-slate-600 border-slate-200',
  negative: 'bg-red-50 text-red-700 border-red-200',
  unknown:  'bg-slate-50 text-slate-400 border-slate-200',
};

const SEVERITY_STYLE = {
  high:   'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const MEDDPICC_KEYS = [
  { key: 'metrics',          label: 'Metrics',          letter: 'M' },
  { key: 'economicBuyer',    label: 'Economic Buyer',   letter: 'E' },
  { key: 'decisionCriteria', label: 'Decision Criteria',letter: 'D' },
  { key: 'decisionProcess',  label: 'Decision Process', letter: 'D' },
  { key: 'paperProcess',     label: 'Paper Process',    letter: 'P' },
  { key: 'identifyPain',     label: 'Identify Pain',    letter: 'I' },
  { key: 'champion',         label: 'Champion',         letter: 'C' },
  { key: 'competition',      label: 'Competition',      letter: 'C' },
] as const;

function meddpiccScore(m: Opportunity['closePlan']['meddpicc']): number {
  if (!m) return 0;
  const filled = MEDDPICC_KEYS.filter(({ key }) => {
    const v = m[key];
    return v && v.length > 5 && !v.toLowerCase().startsWith('tbd');
  }).length;
  return Math.round((filled / MEDDPICC_KEYS.length) * 100);
}

// ─── Stage progress bar ────────────────────────────────────────────────────────

function StageBar({ stage }: { stage: OppStage }) {
  const activeIds = ACTIVE_STAGES.map(s => s.id);
  const currentIdx = activeIds.indexOf(stage);
  return (
    <div className="flex items-center gap-0">
      {ACTIVE_STAGES.map((s, i) => {
        const done = i <= currentIdx;
        const current = i === currentIdx;
        return (
          <React.Fragment key={s.id}>
            <div className={cn(
              'flex flex-col items-center gap-0.5',
            )}>
              <div className={cn(
                'h-1.5 rounded-full transition-all',
                i === 0 ? 'rounded-l-full' : '',
                i === ACTIVE_STAGES.length - 1 ? 'rounded-r-full' : '',
                done ? current ? 'bg-blue-600' : 'bg-blue-400' : 'bg-slate-200',
              )} style={{ width: `${Math.floor(100 / ACTIVE_STAGES.length)}px` }} />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Opp card ─────────────────────────────────────────────────────────────────

function OppCard({ opp, onClick }: { opp: Opportunity; onClick: () => void }) {
  const stage = stageMeta(opp.stage);
  const status = STATUS_STYLE[opp.status];
  const days = daysUntil(opp.closeDate);
  const mScore = opp.closePlan ? meddpiccScore(opp.closePlan.meddpicc) : 0;

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-slate-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
            {opp.name}
          </p>
          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
            <Building2 size={9} className="shrink-0" /> {opp.accountName}
          </p>
        </div>
        <span className={cn(
          'text-sm font-black shrink-0',
          opp.arrValue >= 1_000_000 ? 'text-emerald-700' : 'text-slate-700',
        )}>
          {fmt(opp.arrValue)}
        </span>
      </div>

      {/* Stage pill */}
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wide', stage.bg, stage.color, stage.border)}>
          {stage.label}
        </span>
        <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black border flex items-center gap-0.5', status.pill)}>
          <span className={cn('h-1 w-1 rounded-full', status.dot)} />
          {status.label}
        </span>
        <span className="ml-auto text-[9px] text-slate-400 font-label">{opp.probability}%</span>
      </div>

      {/* Stage bar */}
      <StageBar stage={opp.stage} />

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-2.5">
        <span className={cn(
          'flex items-center gap-1 text-[10px] font-bold',
          days < 14 ? 'text-red-600' : days < 30 ? 'text-amber-600' : 'text-slate-500',
        )}>
          <Calendar size={9} /> {days < 0 ? 'Overdue' : `${days}d`}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <Flag size={9} /> {opp.daysInStage}d in stage
        </span>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-blue-700">
          <BarChart2 size={9} /> MEDDPICC {mScore}%
        </span>
      </div>

      {/* Next step */}
      {opp.nextStep && (
        <p className="text-[10px] text-slate-500 mt-2 leading-snug line-clamp-1 flex items-center gap-1">
          <ArrowRight size={8} className="shrink-0 text-blue-400" />
          {opp.nextStep}
        </p>
      )}
    </div>
  );
}

// ─── MEDDPICC section ─────────────────────────────────────────────────────────

function MeddpiccPanel({ meddpicc }: { meddpicc: Opportunity['closePlan']['meddpicc'] }) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const score = meddpiccScore(meddpicc);

  return (
    <section className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-label flex items-center gap-1.5">
          <Target size={10} /> MEDDPICC Score
        </p>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400')}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className={cn('text-xs font-black', score >= 75 ? 'text-emerald-700' : score >= 50 ? 'text-amber-700' : 'text-red-600')}>
            {score}%
          </span>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {MEDDPICC_KEYS.map(({ key, label, letter }) => {
          const value = meddpicc[key];
          const filled = value && value.length > 5 && !value.toLowerCase().startsWith('tbd');
          const isOpen = expanded === key;
          return (
            <button
              key={key}
              onClick={() => setExpanded(isOpen ? null : key)}
              className="w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 transition-colors"
            >
              <span className={cn(
                'shrink-0 w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center mt-0.5',
                filled ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400',
              )}>
                {letter}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">{label}</span>
                  <div className="flex items-center gap-1.5">
                    {filled
                      ? <CheckCircle2 size={10} className="text-emerald-500" />
                      : <AlertTriangle size={10} className="text-amber-400" />}
                    <ChevronDown size={10} className={cn('text-slate-400 transition-transform', isOpen && 'rotate-180')} />
                  </div>
                </div>
                {isOpen && (
                  <p className="text-[11px] text-slate-600 leading-snug mt-1 pr-4">
                    {filled ? value : <span className="text-amber-600 italic">Not documented — update this field.</span>}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── MAP section ──────────────────────────────────────────────────────────────

function MapPanel({ map }: { map: MAPItem[] }) {
  const sorted = [...map].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  return (
    <section className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-label flex items-center gap-1.5">
          <FileText size={10} /> Mutual Action Plan
        </p>
        <span className="text-[9px] text-slate-400 font-label">
          {map.filter(m => m.status === 'complete').length}/{map.length} complete
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {sorted.map((item) => {
          const s = MAP_STATUS[item.status];
          const Icon = s.icon;
          const days = daysUntil(item.dueDate);
          return (
            <div key={item.id} className="px-4 py-2.5 flex items-start gap-3">
              <div className={cn('shrink-0 mt-0.5 p-1 rounded-md', s.bg)}>
                <Icon size={10} className={s.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-[11px] font-semibold leading-snug',
                  item.status === 'complete' ? 'text-slate-400 line-through' : 'text-slate-800',
                )}>
                  {item.milestone}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400">
                    {item.ownerName}
                  </span>
                  <span className={cn(
                    'text-[9px] font-bold',
                    item.status === 'complete' ? 'text-slate-400' :
                    days < 0 ? 'text-red-600' :
                    days < 7 ? 'text-amber-600' : 'text-slate-400',
                  )}>
                    · {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {item.status !== 'complete' && days < 7 && days >= 0 && ` (${days}d)`}
                    {item.status !== 'complete' && days < 0 && ' (overdue)'}
                  </span>
                </div>
              </div>
              <span className={cn('shrink-0 text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border', s.bg, s.color)}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Close Plan drawer ────────────────────────────────────────────────────────

function ClosePlanDrawer({ opp, onClose }: { opp: Opportunity; onClose: () => void }) {
  const [tab, setTab] = React.useState<'overview' | 'meddpicc' | 'map' | 'stakeholders' | 'risks'>('overview');
  const stage = stageMeta(opp.stage);
  const status = STATUS_STYLE[opp.status];
  const days = daysUntil(opp.closeDate);
  const cp = opp.closePlan;

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const TABS = [
    { id: 'overview',     label: 'Overview' },
    { id: 'meddpicc',     label: 'MEDDPICC' },
    { id: 'map',          label: 'Action Plan' },
    { id: 'stakeholders', label: 'Stakeholders' },
    { id: 'risks',        label: 'Risks' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-2xl bg-white flex flex-col shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={cn(
          'px-6 py-4 border-b border-slate-100 border-l-4 shrink-0',
          stage.border,
        )}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wide', stage.bg, stage.color, stage.border)}>
                  {stage.label}
                </span>
                <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black border flex items-center gap-1', status.pill)}>
                  <span className={cn('h-1 w-1 rounded-full', status.dot)} />
                  {status.label}
                </span>
                <span className={cn(
                  'text-[9px] font-bold flex items-center gap-1',
                  days < 14 ? 'text-red-600' : days < 30 ? 'text-amber-600' : 'text-slate-500',
                )}>
                  <Calendar size={9} /> Close {days < 0 ? 'overdue' : `in ${days}d`}
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 leading-tight">{opp.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{opp.type} · {opp.product} · {opp.rep}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-black text-slate-900">{fmt(opp.arrValue)}</p>
              <p className="text-[10px] text-slate-400">ARR · {opp.probability}% prob.</p>
            </div>
          </div>

          {/* Stage progress */}
          <div className="mt-3">
            <div className="flex items-center gap-0.5 mb-1">
              {ACTIVE_STAGES.map((s, i) => {
                const currentIdx = ACTIVE_STAGES.findIndex(x => x.id === opp.stage);
                const done = i <= currentIdx;
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className={cn(
                      'w-full h-1 rounded-full',
                      done ? i === currentIdx ? 'bg-blue-600' : 'bg-blue-300' : 'bg-slate-200',
                    )} />
                    <span className={cn(
                      'text-[7px] font-bold font-label text-center leading-none',
                      done ? 'text-blue-600' : 'text-slate-300',
                    )}>
                      {s.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next step */}
          {opp.nextStep && (
            <div className="mt-2 flex items-start gap-1.5">
              <ArrowRight size={10} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-snug"><span className="font-bold text-blue-700">Next:</span> {opp.nextStep}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0 bg-slate-50">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest font-label transition-colors',
                tab === t.id
                  ? 'bg-white text-blue-700 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-600',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── Overview ── */}
          {tab === 'overview' && cp && (
            <>
              {/* Executive summary */}
              <section className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-700 font-label mb-2 flex items-center gap-1.5">
                  <Sparkles size={9} /> Executive Summary
                </p>
                <p className="text-xs text-blue-900 leading-relaxed">{cp.executiveSummary}</p>
              </section>

              {/* KPI grid */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'ARR', value: fmt(opp.arrValue), color: 'text-slate-900' },
                  { label: 'Probability', value: `${opp.probability}%`, color: opp.probability >= 70 ? 'text-emerald-700' : opp.probability >= 40 ? 'text-amber-700' : 'text-red-600' },
                  { label: 'Close Date', value: new Date(opp.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: days < 14 ? 'text-red-600' : 'text-slate-900' },
                  { label: 'MEDDPICC', value: `${cp ? meddpiccScore(cp.meddpicc) : 0}%`, color: 'text-blue-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white border border-slate-100 rounded-xl p-3 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-label mb-1">{label}</p>
                    <p className={cn('text-sm font-black', color)}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Why Netskope */}
              <section className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-label mb-2 flex items-center gap-1.5">
                  <Shield size={9} /> Why Netskope
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">{cp.whyNetskope}</p>
              </section>

              {/* Competitive notes */}
              <section className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 font-label mb-2 flex items-center gap-1.5">
                  <Zap size={9} /> Competitive Landscape
                </p>
                <p className="text-xs text-amber-900 leading-relaxed">{cp.competitorNotes}</p>
              </section>

              {/* MAP snapshot — top 3 upcoming */}
              <section>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label mb-2 flex items-center gap-1.5">
                  <ArrowRight size={9} /> Upcoming Milestones
                </p>
                <div className="space-y-1.5">
                  {cp.map
                    .filter(m => m.status !== 'complete')
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 3)
                    .map(item => {
                      const s = MAP_STATUS[item.status];
                      const Icon = s.icon;
                      return (
                        <div key={item.id} className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2">
                          <Icon size={10} className={s.color} />
                          <span className="text-[11px] text-slate-700 flex-1 truncate">{item.milestone}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </section>
            </>
          )}

          {/* ── MEDDPICC ── */}
          {tab === 'meddpicc' && cp && <MeddpiccPanel meddpicc={cp.meddpicc} />}

          {/* ── MAP ── */}
          {tab === 'map' && cp && (
            <>
              <MapPanel map={cp.map} />
              <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-colors">
                <Plus size={12} /> Add Milestone
              </button>
            </>
          )}

          {/* ── Stakeholders ── */}
          {tab === 'stakeholders' && cp && (
            <section className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-label flex items-center gap-1.5">
                  <Users size={10} /> Stakeholder Map
                </p>
              </div>
              <div className="divide-y divide-slate-50">
                {cp.stakeholders.map((s, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-black">
                      {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-slate-900">{s.name}</p>
                        <span className={cn(
                          'px-1.5 py-0.5 rounded border text-[8px] font-bold uppercase tracking-wide capitalize',
                          SENTIMENT_STYLE[s.sentiment],
                        )}>
                          {s.sentiment}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.title}</p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {ROLE_LABEL[s.role]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors border-t border-slate-100">
                <Plus size={12} /> Add Stakeholder
              </button>
            </section>
          )}

          {/* ── Risks ── */}
          {tab === 'risks' && cp && (
            <section className="space-y-3">
              {cp.risks.map((r, i) => (
                <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 flex items-center gap-2 bg-slate-50 border-b border-slate-100">
                    <AlertTriangle size={11} className={r.severity === 'high' ? 'text-red-500' : r.severity === 'medium' ? 'text-amber-500' : 'text-emerald-500'} />
                    <span className={cn('text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border', SEVERITY_STYLE[r.severity])}>
                      {r.severity} risk
                    </span>
                    <p className="text-[11px] font-bold text-slate-800 flex-1">{r.risk}</p>
                  </div>
                  <div className="px-4 py-2.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mb-1">Mitigation</p>
                    <p className="text-[11px] text-slate-600 leading-snug">{r.mitigation}</p>
                  </div>
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-red-300 hover:text-red-500 transition-colors">
                <Plus size={12} /> Add Risk
              </button>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-3 flex items-center gap-2 bg-white">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors">
            <FileText size={11} /> Export Close Plan
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-colors">
            <Sparkles size={11} /> AI Coach
          </button>
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OpportunitiesScreen() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [stageFilter, setStageFilter] = React.useState<OppStage | 'all'>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'healthy' | 'at_risk' | 'stalled'>('all');

  const selectedOpp = opportunities.find(o => o.id === selectedId) ?? null;

  const filtered = opportunities.filter(o => {
    if (stageFilter !== 'all' && o.stage !== stageFilter) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  // Pipeline metrics
  const totalARR = opportunities.reduce((s, o) => s + o.arrValue * (o.probability / 100), 0);
  const totalPipe = opportunities.reduce((s, o) => s + o.arrValue, 0);
  const commitARR = opportunities.filter(o => o.stage === 'commit' || o.stage === 'closed_won').reduce((s, o) => s + o.arrValue, 0);
  const atRisk = opportunities.filter(o => o.status === 'at_risk' || o.status === 'stalled').length;

  return (
    <div className="flex flex-col h-full">

      {/* Top metrics bar */}
      <div className="shrink-0 bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-end justify-between gap-6 mb-4">
          <div>
            <h1 className="text-lg font-black text-slate-900">Opportunities</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">{opportunities.length} active · Close plans with MEDDPICC</p>
          </div>
          <div className="flex items-end gap-6">
            {[
              { label: 'Weighted Pipeline', value: fmt(totalARR), color: 'text-blue-700' },
              { label: 'Total Pipeline', value: fmt(totalPipe), color: 'text-slate-900' },
              { label: 'Commit', value: fmt(commitARR), color: 'text-emerald-700' },
              { label: 'At Risk', value: atRisk, color: atRisk > 0 ? 'text-amber-600' : 'text-slate-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-right">
                <p className={cn('text-xl font-black font-headline leading-none', color)}>{value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-label mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stage filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStageFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest font-label transition-colors',
              stageFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
            )}
          >
            All Stages
          </button>
          {ACTIVE_STAGES.map(s => {
            const count = opportunities.filter(o => o.stage === s.id).length;
            if (count === 0) return null;
            return (
              <button
                key={s.id}
                onClick={() => setStageFilter(stageFilter === s.id ? 'all' : s.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest font-label transition-colors border',
                  stageFilter === s.id ? `${s.bg} ${s.color} ${s.border}` : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100',
                )}
              >
                {s.label} · {count}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-1">
            {(['all', 'healthy', 'at_risk', 'stalled'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest font-label transition-colors',
                  statusFilter === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                )}
              >
                {s === 'all' ? 'All Status' : s === 'at_risk' ? 'At Risk' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Opportunity grid */}
      <div className="flex-1 overflow-y-auto p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Target size={32} className="opacity-20 mb-3" />
            <p className="text-sm font-label">No opportunities match the current filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {filtered
              .sort((a, b) => {
                // sort: commit first, then by ARR desc
                const stageOrder = ACTIVE_STAGES.map(s => s.id);
                return (stageOrder.indexOf(b.stage) - stageOrder.indexOf(a.stage)) || b.arrValue - a.arrValue;
              })
              .map(opp => (
                <OppCard
                  key={opp.id}
                  opp={opp}
                  onClick={() => setSelectedId(opp.id)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Close Plan drawer */}
      {selectedOpp && (
        <ClosePlanDrawer
          opp={selectedOpp}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
