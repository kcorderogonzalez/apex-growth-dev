import React from 'react';
import {
  TrendingUp, DollarSign, Calendar, ChevronRight, X, CheckCircle2,
  Clock, AlertTriangle, Target, User, Users, Shield, Zap, ArrowRight,
  BarChart2, FileText, Flag, Building2, ChevronDown, Plus, Sparkles,
  LayoutGrid, AlignLeft, List, Columns2,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  opportunities as INITIAL_OPPORTUNITIES, STAGES, ACTIVE_STAGES,
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
  const mScore = opp.closePlan ? meddpiccScore(opp.closePlan.meddpicc) : 0;

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(opp.id); }}
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-200 transition-all group select-none"
    >
      <p className="text-[11px] font-bold text-blue-700 group-hover:underline leading-snug truncate">
        {opp.name}
      </p>
      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
        <Building2 size={8} className="shrink-0" /> {opp.accountName}
      </p>
      <p className="text-base font-black text-slate-900 mt-2 leading-none">{fmt(opp.arrValue)}</p>
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
        <span className="text-[8px] font-bold text-blue-600">MEDDPICC {mScore}%</span>
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
            {['Opportunity', 'Account', 'Amount', 'Stage', 'Close Date', 'Prob.', 'Status', 'Rep'].map(h => (
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

// ─── Close Plan drawer ────────────────────────────────────────────────────────

function ClosePlanDrawer({
  opp,
  onClose,
  onStageChange,
}: {
  opp: Opportunity;
  onClose: () => void;
  onStageChange: (id: string, stage: OppStage) => void;
}) {
  const [tab, setTab] = React.useState<'overview' | 'plan' | 'stakeholders' | 'risks'>('overview');
  const [planView, setPlanView] = React.useState<'gantt' | 'kanban'>('gantt');
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
    { id: 'plan',         label: 'MEDDPICC & Plan' },
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

          {/* SFDC-style Path — click any stage to move */}
          <div className="mt-3 space-y-1">
            <PathChevron
              currentStage={opp.stage}
              onStageSelect={newStage => onStageChange(opp.id, newStage)}
            />
            <p className="text-[8px] text-slate-400 font-label">Click a stage to move this opportunity</p>
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

          {/* ── MEDDPICC & Action Plan ── */}
          {tab === 'plan' && cp && (
            <>
              <MeddpiccPanel meddpicc={cp.meddpicc} />

              {/* Action plan section with Gantt/Kanban toggle */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-label flex items-center gap-1.5">
                    <FileText size={10} /> Mutual Action Plan
                    <span className="font-normal text-slate-400">
                      · {cp.map.filter(m => m.status === 'complete').length}/{cp.map.length} complete
                    </span>
                  </p>
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
                    <button
                      onClick={() => setPlanView('gantt')}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-colors',
                        planView === 'gantt' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600',
                      )}
                    >
                      <AlignLeft size={9} /> Gantt
                    </button>
                    <button
                      onClick={() => setPlanView('kanban')}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-colors',
                        planView === 'kanban' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400 hover:text-slate-600',
                      )}
                    >
                      <LayoutGrid size={9} /> Kanban
                    </button>
                  </div>
                </div>

                {planView === 'gantt' ? <GanttView map={cp.map} /> : <KanbanView map={cp.map} />}

                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-colors">
                  <Plus size={12} /> Add Milestone
                </button>
              </section>
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
        />
      )}
    </div>
  );
}
