import React from 'react';
import {
  TrendingUp, DollarSign, Calendar, ChevronRight, X, CheckCircle2,
  Clock, AlertTriangle, Target, User, Users, Shield, Zap, ArrowRight,
  BarChart2, FileText, Flag, Building2, ChevronDown, Plus, Sparkles,
  LayoutGrid, AlignLeft, List, Columns2, Swords, Trophy, Lightbulb,
  Link, RefreshCw, ChevronDown as ChevDown, MessageSquare,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  opportunities as INITIAL_OPPORTUNITIES, STAGES, ACTIVE_STAGES,
  type Opportunity, type OppStage, type MAPItem, type Stakeholder,
} from '@/src/data/opportunityData';
import { calculateScore } from '@/src/lib/opportunityScoring';
import DealCoachPanel, { ScoreRingSmall } from './DealCoachPanel';
import { COMPETITORS, getCompetitor, getWinStrategy, type CompetitorProfile } from '@/src/data/competitorData';

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

// ─── Gantt view ───────────────────────────────────────────────────────────────

function GanttView({ map }: { map: MAPItem[] }) {
  const today = new Date();
  const sorted = [...map].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const allDates = sorted.map(m => new Date(m.dueDate).getTime());
  const minT = Math.min(today.getTime(), ...allDates);
  const maxT = Math.max(...allDates);
  const range = maxT - minT || 86_400_000;
  const todayPct = Math.min(100, ((today.getTime() - minT) / range) * 100);

  // Generate 3–4 evenly spaced axis labels
  const axisDates: Date[] = [];
  const steps = 3;
  for (let i = 0; i <= steps; i++) {
    axisDates.push(new Date(minT + (range * i) / steps));
  }

  return (
    <div className="space-y-0 rounded-xl border border-slate-200 overflow-hidden">
      {/* Axis header */}
      <div className="flex items-center gap-0 bg-slate-50 border-b border-slate-200 px-0">
        <div className="w-36 shrink-0 px-3 py-2">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Milestone</span>
        </div>
        <div className="flex-1 relative h-7">
          {axisDates.map((d, i) => {
            const pct = (i / steps) * 100;
            return (
              <span
                key={i}
                className="absolute top-1/2 -translate-y-1/2 text-[8px] text-slate-400 font-label"
                style={{ left: `${pct}%`, transform: `translateX(${i === steps ? '-100%' : i === 0 ? '0' : '-50%'}) translateY(-50%)` }}
              >
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            );
          })}
          {/* Today line in axis */}
          <div
            className="absolute top-0 bottom-0 w-px bg-blue-400"
            style={{ left: `${todayPct}%` }}
          />
        </div>
      </div>

      {/* Rows */}
      {sorted.map((item, idx) => {
        const s = MAP_STATUS[item.status];
        const Icon = s.icon;
        const duePct = ((new Date(item.dueDate).getTime() - minT) / range) * 100;
        const days = daysUntil(item.dueDate);

        const barColor =
          item.status === 'complete'  ? 'bg-emerald-400' :
          item.status === 'overdue'   ? 'bg-red-400' :
          item.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300';

        const dotColor =
          item.status === 'complete'  ? 'bg-emerald-500 ring-emerald-200' :
          item.status === 'overdue'   ? 'bg-red-500 ring-red-200' :
          item.status === 'in_progress' ? 'bg-blue-600 ring-blue-200' : 'bg-slate-400 ring-slate-200';

        return (
          <div
            key={item.id}
            className={cn('flex items-center border-b border-slate-100 last:border-0', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40')}
          >
            {/* Label */}
            <div className="w-36 shrink-0 px-3 py-2.5 flex items-center gap-1.5">
              <Icon size={9} className={s.color} />
              <p className={cn(
                'text-[10px] font-semibold truncate leading-snug',
                item.status === 'complete' ? 'text-slate-400 line-through' : 'text-slate-700',
              )}>
                {item.milestone}
              </p>
            </div>

            {/* Track */}
            <div className="flex-1 relative h-8 pr-2">
              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-blue-300/70 z-10"
                style={{ left: `${todayPct}%` }}
              />
              {/* Background track */}
              <div className="absolute inset-y-3 left-0 right-2 rounded-full bg-slate-100" />
              {/* Fill bar */}
              <div
                className={cn('absolute top-3 bottom-3 rounded-full opacity-60', barColor)}
                style={{ left: 0, width: `calc(${duePct}% - 4px)` }}
              />
              {/* Due date dot */}
              <div
                className={cn('absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ring-2 z-20', dotColor)}
                style={{ left: `${duePct}%`, transform: `translateX(-50%) translateY(-50%)` }}
              />
              {/* Due label */}
              <span className={cn(
                'absolute top-1/2 -translate-y-1/2 text-[8px] font-bold ml-1 whitespace-nowrap',
                item.status === 'overdue' ? 'text-red-600' : days < 7 ? 'text-amber-600' : 'text-slate-400',
              )} style={{ left: `${duePct + 2}%` }}>
                {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Kanban view ──────────────────────────────────────────────────────────────

function KanbanView({ map }: { map: MAPItem[] }) {
  const COLUMNS: { key: MAPItem['status']; label: string }[] = [
    { key: 'pending',     label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'overdue',     label: 'Overdue' },
    { key: 'complete',    label: 'Complete' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {COLUMNS.map(col => {
        const items = map.filter(m => m.status === col.key);
        const s = MAP_STATUS[col.key];
        const Icon = s.icon;
        return (
          <div key={col.key} className="bg-slate-50 rounded-xl border border-slate-200 p-2 min-h-[80px]">
            {/* Column header */}
            <div className={cn('flex items-center gap-1.5 mb-2 px-1 py-0.5 rounded-lg', s.bg)}>
              <Icon size={9} className={s.color} />
              <span className={cn('text-[8px] font-black uppercase tracking-widest', s.color)}>{col.label}</span>
              <span className="ml-auto text-[8px] font-bold text-slate-400">{items.length}</span>
            </div>
            {/* Cards */}
            <div className="space-y-1.5">
              {items.map(item => {
                const days = daysUntil(item.dueDate);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'bg-white rounded-lg border p-2 shadow-sm',
                      col.key === 'overdue' ? 'border-red-200' :
                      col.key === 'in_progress' ? 'border-blue-200' :
                      col.key === 'complete' ? 'border-emerald-100' : 'border-slate-200',
                    )}
                  >
                    <p className={cn(
                      'text-[10px] font-semibold leading-snug',
                      col.key === 'complete' ? 'text-slate-400 line-through' : 'text-slate-800',
                    )}>
                      {item.milestone}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[7px] font-black text-blue-700 shrink-0">
                        {item.ownerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-[9px] text-slate-400 truncate">{item.ownerName}</span>
                      <span className={cn(
                        'ml-auto text-[8px] font-bold shrink-0',
                        col.key === 'overdue' ? 'text-red-600' :
                        days < 7 && col.key !== 'complete' ? 'text-amber-600' : 'text-slate-400',
                      )}>
                        {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <p className="text-[9px] text-slate-300 text-center py-4 font-label">Empty</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SFDC-style Path chevron ──────────────────────────────────────────────────

function PathChevron({
  currentStage,
  onStageSelect,
}: {
  currentStage: OppStage;
  onStageSelect?: (stage: OppStage) => void;
}) {
  const currentIdx = ACTIVE_STAGES.findIndex(s => s.id === currentStage);
  return (
    <div className="flex items-center overflow-x-auto gap-0.5">
      {ACTIVE_STAGES.map((s, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const clickable = !!onStageSelect && !current;
        return (
          <React.Fragment key={s.id}>
            <button
              disabled={!clickable}
              onClick={() => onStageSelect?.(s.id)}
              className={cn(
                'flex items-center justify-center shrink-0 h-7 px-2.5 text-[7px] font-black uppercase tracking-wide leading-none rounded transition-all whitespace-nowrap',
                current ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 ring-offset-1' :
                done    ? 'bg-blue-100 text-blue-600' :
                          'text-slate-300 bg-slate-100',
                clickable ? 'hover:opacity-80 hover:scale-105 cursor-pointer' : 'cursor-default',
              )}
            >
              {s.label}
            </button>
            {i < ACTIVE_STAGES.length - 1 && (
              <ChevronRight size={10} className={cn('shrink-0', done || current ? 'text-blue-300' : 'text-slate-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Kanban board card ────────────────────────────────────────────────────────

function KanbanBoardCard({ opp, onClick, onDragStart }: { opp: Opportunity; onClick: () => void; onDragStart: (id: string) => void }) {
  const status = STATUS_STYLE[opp.status];
  const days = daysUntil(opp.closeDate);
  const score = React.useMemo(() => calculateScore(opp), [opp]);

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(opp.id); }}
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-200 transition-all group select-none"
    >
      <div className="flex items-start gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-blue-700 group-hover:underline leading-snug truncate">
            {opp.name}
          </p>
          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
            <Building2 size={8} className="shrink-0" /> {opp.accountName}
          </p>
        </div>
        <ScoreRingSmall score={score.total} size={32} />
      </div>
      <p className="text-base font-black text-slate-900 mt-1 leading-none">{fmt(opp.arrValue)}</p>
      <div className="flex items-center justify-between mt-2">
        <span className={cn(
          'text-[9px] font-bold flex items-center gap-1',
          days < 0 ? 'text-red-600' : days < 14 ? 'text-amber-600' : 'text-slate-400',
        )}>
          <Calendar size={8} />
          {days < 0 ? 'Overdue' : new Date(opp.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span className={cn('text-[8px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1', status.pill)}>
          <span className={cn('w-1 h-1 rounded-full', status.dot)} />
          {status.label}
        </span>
      </div>
      {opp.nextStep && (
        <p className="text-[9px] text-slate-400 mt-1.5 line-clamp-1 leading-snug">
          → {opp.nextStep}
        </p>
      )}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <span className="text-[8px] text-slate-400">{opp.probability}% prob.</span>
        <span className={cn('text-[8px] font-bold', score.total >= 75 ? 'text-emerald-600' : score.total >= 55 ? 'text-blue-600' : score.total >= 35 ? 'text-amber-600' : 'text-red-600')}>
          {score.total}/100 deal score
        </span>
      </div>
    </div>
  );
}

// ─── Kanban board ─────────────────────────────────────────────────────────────

function KanbanBoard({
  opps,
  onSelect,
  onStageChange,
}: {
  opps: Opportunity[];
  onSelect: (id: string) => void;
  onStageChange: (id: string, stage: OppStage) => void;
}) {
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [overStage, setOverStage] = React.useState<OppStage | null>(null);

  return (
    <div className="flex gap-3 h-full overflow-x-auto p-5 pb-6 items-start">
      {ACTIVE_STAGES.map(stage => {
        const stageOpps = opps.filter(o => o.stage === stage.id);
        const total = stageOpps.reduce((s, o) => s + o.arrValue, 0);
        const isOver = overStage === stage.id;

        return (
          <div
            key={stage.id}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverStage(stage.id); }}
            onDragLeave={() => setOverStage(null)}
            onDrop={e => {
              e.preventDefault();
              if (draggingId) onStageChange(draggingId, stage.id);
              setDraggingId(null);
              setOverStage(null);
            }}
            className={cn(
              'flex flex-col shrink-0 w-56 rounded-xl border transition-all duration-150',
              isOver ? 'border-blue-400 bg-blue-50/60 shadow-md scale-[1.01]' : 'border-slate-200 bg-slate-50/80',
            )}
          >
            {/* Column header */}
            <div className={cn('px-3 py-2.5 rounded-t-xl border-b border-slate-200', stage.bg)}>
              <p className={cn('text-[9px] font-black uppercase tracking-widest leading-none', stage.color)}>
                {stage.label}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-slate-500">
                  {stageOpps.length} {stageOpps.length === 1 ? 'opp' : 'opps'}
                </span>
                <span className="text-[10px] font-black text-slate-700">{fmt(total)}</span>
              </div>
            </div>

            {/* Drop zone hint */}
            {isOver && draggingId && !stageOpps.find(o => o.id === draggingId) && (
              <div className="mx-2 mt-2 h-12 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 flex items-center justify-center">
                <p className="text-[9px] font-bold text-blue-500">Drop here</p>
              </div>
            )}

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[80px]">
              {stageOpps
                .sort((a, b) => b.arrValue - a.arrValue)
                .map(opp => (
                  <KanbanBoardCard
                    key={opp.id}
                    opp={opp}
                    onClick={() => onSelect(opp.id)}
                    onDragStart={id => setDraggingId(id)}
                  />
                ))}
              {stageOpps.length === 0 && !isOver && (
                <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                  <Target size={16} className="opacity-30 mb-1" />
                  <p className="text-[9px] font-label">No opportunities</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── List view (table) ────────────────────────────────────────────────────────

function ListView({ opps, onSelect }: { opps: Opportunity[]; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 border-b border-slate-200">
            {['Score', 'Opportunity', 'Account', 'Amount', 'Stage', 'Close Date', 'Prob.', 'Status', 'Rep'].map(h => (
              <th key={h} className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {opps.map(opp => {
            const stage = stageMeta(opp.stage);
            const status = STATUS_STYLE[opp.status];
            const days = daysUntil(opp.closeDate);
            return (
              <tr
                key={opp.id}
                onClick={() => onSelect(opp.id)}
                className="hover:bg-blue-50/40 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <ScoreRingSmall score={calculateScore(opp).total} size={32} />
                </td>
                <td className="px-4 py-3 max-w-[180px]">
                  <p className="text-[11px] font-bold text-blue-700 truncate">{opp.name}</p>
                  <p className="text-[9px] text-slate-400 truncate">{opp.type}</p>
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-700 whitespace-nowrap">{opp.accountName}</td>
                <td className="px-4 py-3 text-[11px] font-bold text-slate-900 whitespace-nowrap">{fmt(opp.arrValue)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-wide', stage.bg, stage.color, stage.border)}>
                    {stage.label}
                  </span>
                </td>
                <td className={cn(
                  'px-4 py-3 text-[11px] font-bold whitespace-nowrap',
                  days < 0 ? 'text-red-600' : days < 14 ? 'text-amber-600' : 'text-slate-600',
                )}>
                  {new Date(opp.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {days < 0 && <span className="ml-1 text-[9px] font-normal">(overdue)</span>}
                </td>
                <td className="px-4 py-3 text-[11px] text-slate-600 whitespace-nowrap">{opp.probability}%</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={cn('flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded border w-fit', status.pill)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-[10px] text-slate-500 whitespace-nowrap">{opp.rep}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Competitor selector ──────────────────────────────────────────────────────

function CompetitorSelect({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-[11px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
        >
          <option value="">{placeholder}</option>
          {COMPETITORS.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <ChevDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X size={10} />
          </button>
        )}
      </div>
      {value && (() => {
        const c = getCompetitor(value);
        if (!c) return null;
        return (
          <div className={cn('mt-1.5 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold flex items-center gap-1.5', c.bg, c.color, c.border)}>
            <span className="w-5 h-5 rounded-full bg-white/60 flex items-center justify-center text-[8px] font-black shrink-0">
              {c.shortName}
            </span>
            {c.name} · {c.category}
          </div>
        );
      })()}
    </div>
  );
}

// ─── Compete tab ──────────────────────────────────────────────────────────────

function CompeteTab({
  primaryComp, secondaryComp, incumbentComp,
  onPrimaryChange, onSecondaryChange, onIncumbentChange,
  crayonSyncing, crayonSynced, onCrayonSync,
}: {
  primaryComp: string; secondaryComp: string; incumbentComp: string;
  onPrimaryChange: (v: string) => void;
  onSecondaryChange: (v: string) => void;
  onIncumbentChange: (v: string) => void;
  crayonSyncing: boolean;
  crayonSynced: boolean;
  onCrayonSync: () => void;
}) {
  const [expandedObj, setExpandedObj] = React.useState<number | null>(null);
  const strategy = React.useMemo(
    () => getWinStrategy(primaryComp || undefined, secondaryComp || undefined, incumbentComp || undefined),
    [primaryComp, secondaryComp, incumbentComp],
  );
  const primaryProfile = primaryComp ? getCompetitor(primaryComp) : undefined;
  const secondaryProfile = secondaryComp ? getCompetitor(secondaryComp) : undefined;
  const incumbentProfile = incumbentComp ? getCompetitor(incumbentComp) : undefined;

  const hasCompetitors = primaryComp || secondaryComp || incumbentComp;

  return (
    <div className="space-y-5">

      {/* ── Crayon integration banner ── */}
      <div className={cn(
        'rounded-xl border p-3.5 flex items-center gap-3',
        crayonSynced
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-slate-50 border-slate-200',
      )}>
        {/* Crayon logo mock */}
        <div className="shrink-0 w-9 h-9 rounded-lg bg-[#FF5B36] flex items-center justify-center text-white text-[11px] font-black tracking-tight shadow-sm">
          Cr
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-black text-slate-900">Crayon Competitive Intelligence</p>
            {crayonSynced && (
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                Connected
              </span>
            )}
          </div>
          <p className="text-[9px] text-slate-500 mt-0.5">
            {crayonSynced
              ? 'Battlecards and intel synced · Last updated just now'
              : 'Pull real-time battlecards, win/loss data, and competitor positioning'}
          </p>
        </div>
        <button
          onClick={onCrayonSync}
          disabled={crayonSyncing}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all',
            crayonSyncing
              ? 'bg-slate-100 text-slate-400 cursor-wait'
              : crayonSynced
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-[#FF5B36] text-white hover:opacity-90 shadow-sm',
          )}
        >
          {crayonSyncing ? (
            <><RefreshCw size={10} className="animate-spin" /> Syncing…</>
          ) : crayonSynced ? (
            <><RefreshCw size={10} /> Re-sync</>
          ) : (
            <><Link size={10} /> Connect</>
          )}
        </button>
      </div>

      {/* ── Competitor selectors ── */}
      <div className="grid grid-cols-3 gap-3">
        <CompetitorSelect
          label="Primary Competitor"
          value={primaryComp}
          onChange={onPrimaryChange}
          placeholder="Select primary…"
        />
        <CompetitorSelect
          label="Secondary Competitor"
          value={secondaryComp}
          onChange={onSecondaryChange}
          placeholder="Select secondary…"
        />
        <CompetitorSelect
          label="Incumbent"
          value={incumbentComp}
          onChange={onIncumbentChange}
          placeholder="Select incumbent…"
        />
      </div>

      {!hasCompetitors ? (
        /* Empty state */
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
          <Swords size={28} className="text-slate-200 mb-3" />
          <p className="text-[11px] font-bold text-slate-400">Select competitors above to unlock win strategy</p>
          <p className="text-[9px] text-slate-300 mt-1">Battlecards, talking points, and objection handlers will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">

          {/* Left column: win strategy + talking points */}
          <div className="space-y-4">

            {/* How to Win */}
            <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mb-3 flex items-center gap-1.5">
                <Trophy size={9} /> How to Win This Deal
              </p>
              {strategy.urgency && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3">
                  <AlertTriangle size={10} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 leading-snug">{strategy.urgency}</p>
                </div>
              )}
              <div className="space-y-2">
                {strategy.focusAreas.map((area, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-emerald-600 text-white text-[8px] font-black flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[11px] text-emerald-900 leading-snug">{area}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Key talking points */}
            {strategy.keyMessages.length > 0 && (
              <section className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-700 mb-3 flex items-center gap-1.5">
                  <MessageSquare size={9} /> Key Talking Points
                </p>
                <div className="space-y-2">
                  {strategy.keyMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white border border-blue-100 rounded-lg px-3 py-2">
                      <ArrowRight size={9} className="text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-900 leading-snug italic">{msg}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column: competitor profiles + objection handlers + proof */}
          <div className="space-y-4">

            {/* Active competitor profiles */}
            {[
              { profile: primaryProfile, role: 'Primary' },
              { profile: secondaryProfile, role: 'Secondary' },
              { profile: incumbentProfile, role: 'Incumbent' },
            ].filter(({ profile }) => !!profile).map(({ profile, role }) => {
              const p = profile as CompetitorProfile;
              return (
                <section key={p.id} className={cn('rounded-xl border p-3.5', p.bg, p.border)}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black bg-white/70', p.color)}>
                      {p.shortName}
                    </div>
                    <div>
                      <p className={cn('text-[10px] font-black leading-tight', p.color)}>{p.name}</p>
                      <p className="text-[8px] text-slate-500">{role} · {p.category}</p>
                    </div>
                    <span className={cn('ml-auto text-[7px] font-black uppercase px-1.5 py-0.5 rounded border bg-white/60', p.color, p.border)}>
                      {role}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[8px] font-black uppercase text-red-600 mb-1">Their Weaknesses</p>
                      {p.weaknesses.slice(0, 3).map((w, i) => (
                        <div key={i} className="flex items-start gap-1 mb-1">
                          <span className="text-red-400 text-[9px] shrink-0 mt-0.5">✕</span>
                          <p className="text-[9px] text-slate-700 leading-snug">{w}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-emerald-600 mb-1">Our Advantages</p>
                      {p.keyDifferentiators.slice(0, 3).map((d, i) => (
                        <div key={i} className="flex items-start gap-1 mb-1">
                          <span className="text-emerald-500 text-[9px] shrink-0 mt-0.5">✓</span>
                          <p className="text-[9px] text-slate-700 leading-snug">{d}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}

            {/* Objection handlers */}
            {strategy.objectionHandlers.length > 0 && (
              <section className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-1.5">
                  <Lightbulb size={9} /> Objection Handlers
                </p>
                <div className="space-y-2">
                  {strategy.objectionHandlers.map((oh, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-slate-200 bg-white">
                      <button
                        onClick={() => setExpandedObj(expandedObj === i ? null : i)}
                        className="w-full flex items-start gap-2 px-3 py-2 text-left"
                      >
                        <span className="text-amber-500 shrink-0 text-[10px] mt-0.5">?</span>
                        <p className="text-[10px] font-semibold text-slate-800 flex-1 leading-snug">{oh.objection}</p>
                        <ChevronRight size={10} className={cn('shrink-0 text-slate-300 transition-transform mt-0.5', expandedObj === i && 'rotate-90')} />
                      </button>
                      {expandedObj === i && (
                        <div className="px-3 pb-2.5 border-t border-slate-100 pt-2">
                          <p className="text-[10px] text-slate-600 leading-relaxed">{oh.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Proof points */}
            {strategy.proofPoints.length > 0 && (
              <section className="bg-violet-50 border border-violet-200 rounded-xl p-3.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-violet-700 mb-2.5 flex items-center gap-1.5">
                  <Shield size={9} /> Proof Points & References
                </p>
                <div className="space-y-1.5">
                  {strategy.proofPoints.map((pp, i) => (
                    <div key={i} className="flex items-start gap-2 bg-white border border-violet-100 rounded-lg px-2.5 py-1.5">
                      <CheckCircle2 size={9} className="text-violet-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-violet-900 leading-snug">{pp}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Close Plan drawer ────────────────────────────────────────────────────────

function ClosePlanDrawer({
  opp,
  onClose,
  onStageChange,
  onMilestoneToggle,
}: {
  opp: Opportunity;
  onClose: () => void;
  onStageChange: (id: string, stage: OppStage) => void;
  onMilestoneToggle: (oppId: string, milestoneId: string, checked: boolean) => void;
}) {
  const [tab, setTab] = React.useState<'coach' | 'overview' | 'plan' | 'stakeholders' | 'risks' | 'compete'>('coach');
  const [planView, setPlanView] = React.useState<'gantt' | 'kanban'>('gantt');
  const [primaryComp, setPrimaryComp] = React.useState<string>(opp.primaryCompetitor ?? '');
  const [secondaryComp, setSecondaryComp] = React.useState<string>(opp.secondaryCompetitor ?? '');
  const [incumbentComp, setIncumbentComp] = React.useState<string>(opp.incumbent ?? '');
  const [crayonSyncing, setCrayonSyncing] = React.useState(false);
  const [crayonSynced, setCrayonSynced] = React.useState(false);
  const [hunterTrigger, setHunterTrigger] = React.useState(0);
  const stage = stageMeta(opp.stage);
  const status = STATUS_STYLE[opp.status];
  const days = daysUntil(opp.closeDate);
  const cp = opp.closePlan;
  const score = React.useMemo(() => calculateScore(opp), [opp]);

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const TABS = [
    { id: 'coach',        label: '✦ Deal Score' },
    { id: 'overview',     label: 'Overview' },
    { id: 'plan',         label: 'MEDDPICC & Plan' },
    { id: 'stakeholders', label: 'Stakeholders' },
    { id: 'risks',        label: 'Risks' },
    { id: 'compete',      label: '⚔ Compete' },
  ] as const;

  const handleCrayonSync = () => {
    setCrayonSyncing(true);
    setTimeout(() => {
      setCrayonSyncing(false);
      setCrayonSynced(true);
      if (!primaryComp && opp.primaryCompetitor) setPrimaryComp(opp.primaryCompetitor);
      if (!secondaryComp && opp.secondaryCompetitor) setSecondaryComp(opp.secondaryCompetitor);
      if (!incumbentComp && opp.incumbent) setIncumbentComp(opp.incumbent);
    }, 1800);
  };

  // Win probability color
  const winPct = Math.round(score.winProbability);
  const probColor = winPct >= 70 ? 'bg-emerald-500' : winPct >= 40 ? 'bg-blue-500' : 'bg-amber-500';

  // Health badge
  const healthBadge = {
    excellent: 'bg-emerald-100 text-emerald-700',
    healthy:   'bg-blue-100 text-blue-700',
    at_risk:   'bg-amber-100 text-amber-700',
    critical:  'bg-red-100 text-red-700',
  }[score.health];
  const healthLabel = { excellent: 'Excellent', healthy: 'Healthy', at_risk: 'At Risk', critical: 'Critical' }[score.health];

  return (
    /* Full-viewport overlay — content centers inside */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — fixed height so nothing scrolls out of view */}
      <div className="relative w-[96vw] max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ── Compact header ── */}
        <div className={cn('shrink-0 px-5 py-3 border-b border-slate-100 flex items-center gap-3 border-l-4', stage.border)}>
          <ScoreRingSmall score={score.total} size={44} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black text-slate-900">{opp.name}</h2>
              <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-wide', stage.bg, stage.color, stage.border)}>
                {stage.label}
              </span>
              <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-black border flex items-center gap-1', status.pill)}>
                <span className={cn('h-1 w-1 rounded-full', status.dot)} />
                {status.label}
              </span>
              <span className={cn('text-[8px] font-bold flex items-center gap-1', days < 0 ? 'text-red-600' : days < 14 ? 'text-amber-600' : 'text-slate-400')}>
                <Calendar size={8} /> Close {days < 0 ? 'overdue' : `in ${days}d`}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">{opp.accountName} · {opp.type} · {opp.product} · {opp.rep}</p>
          </div>
          <div className="shrink-0 text-right mr-2">
            <p className="text-xl font-black text-slate-900">{fmt(opp.arrValue)}</p>
            <p className="text-[9px] text-slate-400">{opp.probability}% probability</p>
          </div>
          <button onClick={onClose} className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Stage path strip ── */}
        <div className="shrink-0 px-5 py-2 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
          <PathChevron currentStage={opp.stage} onStageSelect={newStage => onStageChange(opp.id, newStage)} />
          <span className="text-[8px] text-slate-400 shrink-0 italic">Click stage to move</span>
        </div>

        {/* ── Body: left rail + right content ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left rail — always visible, scrolls independently if needed */}
          <div className="w-64 shrink-0 border-r border-slate-100 flex flex-col overflow-y-auto bg-slate-50/30">

            {/* Score summary */}
            <div className="p-4 border-b border-slate-100">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Deal Score</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900 leading-none">{score.total}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">/ 100</p>
                </div>
                <div className="flex-1">
                  <span className={cn('text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block mb-1.5', healthBadge)}>
                    {healthLabel}
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-slate-400">
                      <span>Win Prob.</span>
                      <span className="font-bold">{winPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className={cn('h-full rounded-full', probColor)} style={{ width: `${winPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              {/* Compact dimension bars */}
              {[
                { label: 'ICP Fit',      pct: score.dimensions.icp.pct },
                { label: 'MEDDPICC',     pct: score.dimensions.meddpicc.pct },
                { label: 'Stakeholders', pct: score.dimensions.stakeholders.pct },
                { label: 'Milestones',   pct: score.dimensions.milestones.pct },
                { label: 'Momentum',     pct: score.dimensions.momentum.pct },
                { label: 'Revenue',      pct: score.dimensions.revenue.pct },
              ].map(d => (
                <div key={d.label} className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] text-slate-500 w-20 shrink-0 truncate">{d.label}</span>
                  <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', d.pct >= 75 ? 'bg-emerald-400' : d.pct >= 50 ? 'bg-blue-400' : d.pct >= 25 ? 'bg-amber-400' : 'bg-red-400')}
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 w-6 text-right">{Math.round(d.pct)}%</span>
                </div>
              ))}
            </div>

            {/* Key metrics */}
            <div className="p-4 border-b border-slate-100">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Key Info</p>
              <div className="space-y-2">
                {[
                  { label: 'Close Date', value: new Date(opp.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }), cls: days < 0 ? 'text-red-600' : days < 14 ? 'text-amber-600' : 'text-slate-700' },
                  { label: 'Days Left',  value: days < 0 ? 'Overdue' : `${days} days`,                cls: days < 0 ? 'text-red-600' : days < 14 ? 'text-amber-600' : 'text-slate-700' },
                  { label: 'Rep',        value: opp.rep,       cls: 'text-slate-700' },
                  { label: 'Territory',  value: opp.territory, cls: 'text-slate-700' },
                  { label: 'MEDDPICC',   value: `${cp ? meddpiccScore(cp.meddpicc) : 0}%`, cls: 'text-blue-700 font-bold' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-slate-400 shrink-0">{label}</span>
                    <span className={cn('text-[10px] font-semibold truncate text-right', cls)}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next step */}
            {opp.nextStep && (
              <div className="p-4 border-b border-slate-100">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Next Step</p>
                <div className="flex items-start gap-1.5 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                  <ArrowRight size={9} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-800 leading-snug">{opp.nextStep}</p>
                </div>
              </div>
            )}

            {/* Stakeholders summary */}
            {cp && cp.stakeholders.length > 0 && (
              <div className="p-4">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Stakeholders</p>
                <div className="space-y-2">
                  {cp.stakeholders.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[9px] font-black">
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-800 truncate">{s.name}</p>
                        <p className="text-[8px] text-slate-400 truncate">{ROLE_LABEL[s.role]}</p>
                      </div>
                      <span className={cn('shrink-0 text-[7px] font-bold px-1.5 py-0.5 rounded border', SENTIMENT_STYLE[s.sentiment])}>
                        {s.sentiment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: tab bar + tab content */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">

            {/* Tab bar */}
            <div className="shrink-0 flex border-b border-slate-100 bg-white">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-colors',
                    tab === t.id
                      ? 'bg-white text-blue-700 border-b-2 border-blue-600'
                      : 'text-slate-400 hover:text-slate-600',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content — only this area scrolls */}
            <div className="flex-1 overflow-y-auto p-5">

              {/* ── Deal Score & Coach ── */}
              {tab === 'coach' && (
                <DealCoachPanel
                  opp={opp}
                  onMilestoneToggle={(milestoneId, checked) => onMilestoneToggle(opp.id, milestoneId, checked)}
                  openHunter={hunterTrigger}
                />
              )}

              {/* ── Overview ── */}
              {tab === 'overview' && cp && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Left column */}
                  <div className="space-y-4">
                    <section className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-700 mb-2 flex items-center gap-1.5">
                        <Sparkles size={9} /> Executive Summary
                      </p>
                      <p className="text-xs text-blue-900 leading-relaxed">{cp.executiveSummary}</p>
                    </section>
                    <section className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-2 flex items-center gap-1.5">
                        <Zap size={9} /> Competitive Landscape
                      </p>
                      <p className="text-xs text-amber-900 leading-relaxed">{cp.competitorNotes}</p>
                    </section>
                  </div>
                  {/* Right column */}
                  <div className="space-y-4">
                    <section className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                        <Shield size={9} /> Why Netskope
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">{cp.whyNetskope}</p>
                    </section>
                    <section>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                        <ArrowRight size={9} /> Upcoming Milestones
                      </p>
                      <div className="space-y-1.5">
                        {cp.map
                          .filter(m => m.status !== 'complete')
                          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                          .slice(0, 5)
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
                  </div>
                </div>
              )}

              {/* ── MEDDPICC & Action Plan ── */}
              {tab === 'plan' && cp && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Left: MEDDPICC */}
                  <div>
                    <MeddpiccPanel meddpicc={cp.meddpicc} />
                  </div>
                  {/* Right: MAP */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <FileText size={10} /> Mutual Action Plan
                        <span className="font-normal text-slate-400">
                          · {cp.map.filter(m => m.status === 'complete').length}/{cp.map.length} done
                        </span>
                      </p>
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                        <button
                          onClick={() => setPlanView('gantt')}
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-colors',
                            planView === 'gantt' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600',
                          )}
                        >
                          <AlignLeft size={8} /> Gantt
                        </button>
                        <button
                          onClick={() => setPlanView('kanban')}
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-colors',
                            planView === 'kanban' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600',
                          )}
                        >
                          <LayoutGrid size={8} /> Kanban
                        </button>
                      </div>
                    </div>
                    {planView === 'gantt' ? <GanttView map={cp.map} /> : <KanbanView map={cp.map} />}
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-colors">
                      <Plus size={11} /> Add Milestone
                    </button>
                  </div>
                </div>
              )}

              {/* ── Stakeholders ── */}
              {tab === 'stakeholders' && cp && (
                <div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {cp.stakeholders.map((s, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-black">
                            {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 leading-tight truncate">{s.name}</p>
                            <p className="text-[9px] text-slate-500 truncate">{s.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 leading-tight">
                            {ROLE_LABEL[s.role]}
                          </span>
                          <span className={cn('text-[7px] font-bold px-1.5 py-0.5 rounded border leading-tight capitalize', SENTIMENT_STYLE[s.sentiment])}>
                            {s.sentiment}
                          </span>
                        </div>
                      </div>
                    ))}
                    <button className="border-2 border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-slate-300 hover:border-blue-300 hover:text-blue-400 transition-colors min-h-[80px]">
                      <Plus size={18} />
                      <span className="text-[8px] font-black uppercase mt-1">Add</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Risks ── */}
              {tab === 'risks' && cp && (
                <div className="grid grid-cols-2 gap-3">
                  {cp.risks.map((r, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2.5 flex items-center gap-2 bg-slate-50 border-b border-slate-100">
                        <AlertTriangle size={11} className={r.severity === 'high' ? 'text-red-500' : r.severity === 'medium' ? 'text-amber-500' : 'text-emerald-500'} />
                        <span className={cn('text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border shrink-0', SEVERITY_STYLE[r.severity])}>
                          {r.severity}
                        </span>
                        <p className="text-[11px] font-bold text-slate-800 flex-1 truncate">{r.risk}</p>
                      </div>
                      <div className="px-4 py-2.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mb-1">Mitigation</p>
                        <p className="text-[11px] text-slate-600 leading-snug">{r.mitigation}</p>
                      </div>
                    </div>
                  ))}
                  <button className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center text-slate-300 hover:border-red-300 hover:text-red-400 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              )}

              {/* ── Compete ── */}
              {tab === 'compete' && (
                <CompeteTab
                  primaryComp={primaryComp}
                  secondaryComp={secondaryComp}
                  incumbentComp={incumbentComp}
                  onPrimaryChange={setPrimaryComp}
                  onSecondaryChange={setSecondaryComp}
                  onIncumbentChange={setIncumbentComp}
                  crayonSyncing={crayonSyncing}
                  crayonSynced={crayonSynced}
                  onCrayonSync={handleCrayonSync}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-3 flex items-center gap-2 bg-white">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors">
            <FileText size={11} /> Export Close Plan
          </button>
          <button
            onClick={() => { setTab('coach'); setHunterTrigger(n => n + 1); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-sm"
          >
            <span className="text-sm leading-none">🤖</span> Ask Hunter
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
  const [opps, setOpps] = React.useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [stageFilter, setStageFilter] = React.useState<OppStage | 'all'>('all');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'healthy' | 'at_risk' | 'stalled'>('all');
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  const [stageChangedId, setStageChangedId] = React.useState<string | null>(null);

  const handleStageChange = React.useCallback((id: string, stage: OppStage) => {
    setOpps(prev => prev.map(o => o.id === id ? { ...o, stage } : o));
    setStageChangedId(id);
    setTimeout(() => setStageChangedId(null), 2000);
  }, []);

  const handleMilestoneToggle = React.useCallback((oppId: string, milestoneId: string, checked: boolean) => {
    setOpps(prev => prev.map(o => o.id === oppId
      ? { ...o, milestones: { ...(o.milestones ?? {}), [milestoneId]: checked } }
      : o,
    ));
  }, []);

  const selectedOpp = opps.find(o => o.id === selectedId) ?? null;

  const filtered = opps.filter(o => {
    if (stageFilter !== 'all' && o.stage !== stageFilter) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  // Pipeline metrics
  const totalARR = opps.reduce((s, o) => s + o.arrValue * (o.probability / 100), 0);
  const totalPipe = opps.reduce((s, o) => s + o.arrValue, 0);
  const commitARR = opps.filter(o => o.stage === 'ss6_purchasing' || o.stage === 'ss7_po_received' || o.stage === 'closed_won').reduce((s, o) => s + o.arrValue, 0);
  const atRisk = opps.filter(o => o.status === 'at_risk' || o.status === 'stalled').length;

  return (
    <div className="flex flex-col h-full">

      {/* Top metrics bar */}
      <div className="shrink-0 bg-white border-b border-slate-100 px-6 py-4">
        <div className="flex items-end justify-between gap-6 mb-4">
          <div>
            <h1 className="text-lg font-black text-slate-900">Opportunities</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">{opps.length} active · Close plans with MEDDPICC</p>
          </div>
          <div className="flex items-end gap-4">
            {/* View toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5 self-end mb-0.5">
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-colors',
                  viewMode === 'kanban' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600',
                )}
              >
                <Columns2 size={10} /> Pipeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-colors',
                  viewMode === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600',
                )}
              >
                <List size={10} /> List
              </button>
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
            const count = opps.filter(o => o.stage === s.id).length;
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

      {/* Main content area */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <Target size={32} className="opacity-20 mb-3" />
          <p className="text-sm font-label">No opportunities match the current filter</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard opps={filtered} onSelect={setSelectedId} onStageChange={handleStageChange} />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <ListView opps={filtered} onSelect={setSelectedId} />
        </div>
      )}

      {/* Stage-change toast */}
      {stageChangedId && (() => {
        const o = opps.find(x => x.id === stageChangedId);
        const s = o ? ACTIVE_STAGES.find(st => st.id === o.stage) : null;
        if (!o || !s) return null;
        return (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-slate-900 text-white text-[11px] font-bold px-4 py-2.5 rounded-full shadow-xl">
            <CheckCircle2 size={13} className="text-emerald-400" />
            {o.name} moved to <span className={cn('font-black', s.color.replace('text-', 'text-'))}>{s.label}</span>
          </div>
        );
      })()}

      {/* Close Plan drawer */}
      {selectedOpp && (
        <ClosePlanDrawer
          opp={selectedOpp}
          onClose={() => setSelectedId(null)}
          onStageChange={handleStageChange}
          onMilestoneToggle={handleMilestoneToggle}
        />
      )}
    </div>
  );
}
