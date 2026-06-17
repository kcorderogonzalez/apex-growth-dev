import React from 'react';
import { ShieldCheck, TrendingUp, CheckCircle2, CalendarCheck, Activity, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { elenaDeals } from '@/src/lib/mockData';

const deals = elenaDeals;
const totalPipeline = deals.reduce((s, d) => s + d.value, 0);
const pipelineFidelity = Math.round((deals.filter(d => d.validated).length / deals.length) * 100);
const povSuccessRate = Math.round((deals.filter(d => d.povSuccess).length / deals.length) * 100);
const activeSequences = Math.floor(deals.length * 1.5);
const quotaAttainment = 104;
const stalledDeals = deals.filter(d => d.status === 'stalled');
const meetingsBooked = 12;

const STAGE_ORDER = ['discovery', 'proposal', 'negotiation', 'closing'];
const STAGE_LABELS: Record<string, string> = {
  discovery: 'Discovery', proposal: 'Proposal', negotiation: 'Negotiate', closing: 'Closing',
};
const STAGE_COLORS: Record<string, string> = {
  discovery: 'bg-blue-400', proposal: 'bg-violet-500', negotiation: 'bg-amber-500', closing: 'bg-emerald-500',
};

function stageSummary() {
  const counts: Record<string, number> = {};
  for (const d of deals) counts[d.stage] = (counts[d.stage] ?? 0) + 1;
  return STAGE_ORDER.filter(s => counts[s]).map(s => ({
    stage: s, label: STAGE_LABELS[s] ?? s,
    count: counts[s], pct: Math.round((counts[s] / deals.length) * 100),
  }));
}

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  valueColor?: string;
  bg?: string;
}

function MetricCard({ label, value, sub, icon: Icon, valueColor = 'text-slate-800', bg = 'bg-slate-50' }: MetricCardProps) {
  return (
    <div className={cn('flex items-center gap-3 px-5 py-3 rounded-2xl min-w-0 shrink-0', bg)}>
      <Icon size={18} className={valueColor} />
      <div className="min-w-0">
        <div className={cn('text-xl font-black font-headline leading-none', valueColor)}>{value}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-label mt-0.5 whitespace-nowrap">{label}</div>
        {sub && <div className="text-[8px] text-slate-400 font-label mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function InlineMetricsPanel() {
  const [expanded, setExpanded] = React.useState(false);
  const stages = stageSummary();

  const healthColor = stalledDeals.length === 0 ? 'text-emerald-600' : stalledDeals.length <= 2 ? 'text-amber-600' : 'text-red-600';
  const healthBg   = stalledDeals.length === 0 ? 'bg-emerald-50'    : stalledDeals.length <= 2 ? 'bg-amber-50'    : 'bg-red-50';

  return (
    <div className="bg-white border-b border-slate-200">
      {/* ── Main metrics row ── */}
      <div className="flex items-stretch gap-3 px-6 py-4 overflow-x-auto no-scrollbar">

        {/* Pipeline headline */}
        <div className="flex flex-col justify-center pr-5 border-r border-slate-100 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label">Q3 Pipeline</span>
          <span className="text-3xl font-black font-headline text-emerald-600 leading-none mt-1">
            ${(totalPipeline / 1_000_000).toFixed(1)}M
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(quotaAttainment, 100)}%` }} />
            </div>
            <span className="text-[9px] font-black text-emerald-600 font-label">{quotaAttainment}% quota</span>
          </div>
        </div>

        {/* KPI cards */}
        <MetricCard label="Pipeline Fidelity" value={`${pipelineFidelity}%`} sub="System-validated" icon={ShieldCheck} valueColor="text-primary" bg="bg-cyan-50" />
        <MetricCard label="POV Success" value={`${povSuccessRate}%`} sub="Technical wins" icon={CheckCircle2} valueColor="text-indigo-600" bg="bg-indigo-50" />
        <MetricCard label="Meetings Booked" value={meetingsBooked} sub="This week" icon={CalendarCheck} valueColor="text-amber-600" bg="bg-amber-50" />
        <MetricCard label="Active Sequences" value={activeSequences} sub="72% engagement" icon={Activity} valueColor="text-violet-600" bg="bg-violet-50" />

        {/* Stalled alert or all-clear */}
        <div className={cn('flex items-center gap-2.5 px-4 py-3 rounded-2xl shrink-0 ml-auto', healthBg)}>
          {stalledDeals.length > 0
            ? <AlertTriangle size={16} className={healthColor} />
            : <CheckCircle2 size={16} className={healthColor} />}
          <div>
            <div className={cn('text-sm font-black font-headline leading-none', healthColor)}>
              {stalledDeals.length > 0 ? `${stalledDeals.length} Stalled` : 'On Track'}
            </div>
            <div className="text-[8px] font-label text-slate-400 mt-0.5 uppercase tracking-wide">
              {stalledDeals.length > 0 ? 'Needs attention' : 'All deals moving'}
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="ml-2 shrink-0 flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors self-center text-[10px] font-bold font-label uppercase tracking-wide"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Less' : 'Detail'}
        </button>
      </div>

      {/* ── Expandable detail row: pipeline by stage + stalled deals ── */}
      {expanded && (
        <div className="flex gap-8 px-6 pb-5 pt-1 border-t border-slate-50">
          {/* Stage breakdown */}
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label mb-3">Pipeline by Stage</p>
            <div className="space-y-2.5">
              {stages.map(s => (
                <div key={s.stage} className="flex items-center gap-3">
                  <div className="w-20 shrink-0">
                    <p className="text-[10px] font-bold text-slate-600">{s.label}</p>
                  </div>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', STAGE_COLORS[s.stage] ?? 'bg-slate-400')} style={{ width: `${s.pct}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 w-12 text-right shrink-0">{s.count} deals</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stalled deals */}
          {stalledDeals.length > 0 && (
            <div className="w-72 shrink-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 font-label mb-3 flex items-center gap-1.5">
                <AlertTriangle size={10} /> Needs Attention
              </p>
              <div className="space-y-2">
                {stalledDeals.slice(0, 4).map(d => (
                  <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{d.accountName}</p>
                      <p className="text-[9px] text-slate-500 font-label capitalize mt-0.5">{d.stage} · ${(d.value / 1000).toFixed(0)}K</p>
                    </div>
                    <span className="shrink-0 text-[8px] font-black text-amber-700 font-label uppercase px-2 py-0.5 bg-amber-100 rounded-lg">Stalled</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
