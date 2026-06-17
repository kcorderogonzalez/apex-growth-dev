import React from 'react';
import { Sparkles, Mail, Linkedin } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { HunterPick, Account } from '@/src/types';
import { accounts } from '@/src/lib/mockData';
import { PgSeqContext } from './PgSeqDrawer';

interface OutboundProspectingPanelProps {
  picks: HunterPick[];
  reviewedIds: Set<string>;
  onMarkReviewed: (id: string) => void;
  onStartSequence: (ctx: PgSeqContext) => void;
  onLaunchHunter: (account: Account) => void;
}

// ─── Signal styles ────────────────────────────────────────────────────────────

const SIGNAL_STYLES: Record<string, { bg: string; text: string; border: string; leftBorder: string }> = {
  funding:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  leftBorder: 'border-l-amber-400'   },
  interest:  { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',   leftBorder: 'border-l-cyan-400'    },
  hire:      { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   leftBorder: 'border-l-blue-400'    },
  nurture:   { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200', leftBorder: 'border-l-violet-400'  },
  expansion: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',leftBorder: 'border-l-emerald-400' },
  breach:    { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    leftBorder: 'border-l-red-400'     },
  renewal:   { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',  leftBorder: 'border-l-slate-300'   },
};

const URGENCY_STYLES: Record<string, string> = {
  'High Intent':              'bg-cyan-100 text-cyan-700',
  'High Priority':            'bg-red-100 text-red-700',
  'Expansion Signal':         'bg-emerald-100 text-emerald-700',
  'New Hire':                 'bg-blue-100 text-blue-700',
  'Competitive Displacement': 'bg-violet-100 text-violet-700',
  'Regulatory Mandate':       'bg-amber-100 text-amber-700',
  'Compliance Deadline':      'bg-amber-100 text-amber-700',
  'Compliance Pressure':      'bg-amber-100 text-amber-700',
  'Regulatory Response':      'bg-amber-100 text-amber-700',
  'PCI Compliance':           'bg-amber-100 text-amber-700',
  'Fast Growth':              'bg-blue-100 text-blue-700',
  'Rapid Growth':             'bg-blue-100 text-blue-700',
  'Global Expansion':         'bg-emerald-100 text-emerald-700',
  'Infrastructure Modernization': 'bg-cyan-100 text-cyan-700',
  'IP Protection':            'bg-violet-100 text-violet-700',
  'OT Security Initiative':   'bg-amber-100 text-amber-700',
  'Consolidation Play':       'bg-cyan-100 text-cyan-700',
  'Client Compliance':        'bg-violet-100 text-violet-700',
  'Platform Consolidation':   'bg-cyan-100 text-cyan-700',
};

// ─── Convert raw signal label to plain English ────────────────────────────────

function signalToReason(signal: string, type: string, urgency: string): string {
  const s = signal.trim();

  // Bombora intent score
  const bomboraMatch = s.match(/^Bombora:\s*(\d+)\/100\s*[—–-]\s*(.+)$/i);
  if (bomboraMatch) {
    return `Bombora intent score ${bomboraMatch[1]}/100 for ${bomboraMatch[2].toLowerCase()}.`;
  }

  // G2 comparisons / research
  const g2Match = s.match(/^G2[:\s]+(.+)$/i);
  if (g2Match) return g2Match[1].charAt(0).toUpperCase() + g2Match[1].slice(1) + '.';

  // TechTarget content engagement
  const ttMatch = s.match(/^TechTarget:\s*(.+)$/i);
  if (ttMatch) return ttMatch[1].charAt(0).toUpperCase() + ttMatch[1].slice(1) + '.';

  // LinkedIn hiring signal
  const liMatch = s.match(/^LinkedIn:\s*(.+)$/i);
  if (liMatch) return liMatch[1].charAt(0).toUpperCase() + liMatch[1].slice(1) + '.';

  // Job posting signal
  const jobMatch = s.match(/^Job Posting:\s*(.+)$/i);
  if (jobMatch) return jobMatch[1].charAt(0).toUpperCase() + jobMatch[1].slice(1) + '.';

  // Press release / announcement
  const pressMatch = s.match(/^Press(?:\s+Release)?:\s*(.+)$/i);
  if (pressMatch) return pressMatch[1].charAt(0).toUpperCase() + pressMatch[1].slice(1) + '.';

  // Acquisition
  const acqMatch = s.match(/^Acquisition:\s*(.+)$/i);
  if (acqMatch) return 'Acquisition: ' + acqMatch[1].charAt(0).toLowerCase() + acqMatch[1].slice(1) + '.';

  // SEC 8-K / breach filing
  if (s.match(/^SEC 8-K/i) || type === 'breach') {
    return s.replace(/^SEC 8-K filed:\s*/i, 'Breach disclosure filed — ');
  }

  // DoD / compliance reports
  const dodMatch = s.match(/^DoD\s+(.+)$/i);
  if (dodMatch) return dodMatch[1].charAt(0).toUpperCase() + dodMatch[1].slice(1) + '.';

  // FCC / regulatory
  const fccMatch = s.match(/^FCC\s+(.+)$/i);
  if (fccMatch) return fccMatch[1].charAt(0).toUpperCase() + fccMatch[1].slice(1) + '.';

  // GridEx report
  const gridMatch = s.match(/^GridEx\s+(.+)$/i);
  if (gridMatch) return gridMatch[1].charAt(0).toUpperCase() + gridMatch[1].slice(1) + '.';

  // Fallback: use urgency category + trimmed signal
  if (urgency && urgency !== 'High Intent') {
    return s.endsWith('.') ? s : s + '.';
  }
  return s.endsWith('.') ? s : s + '.';
}

// ─── Sub-components shared with InboundLeadsPanel layout ─────────────────────

function StatItem({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className={cn('text-lg font-black font-headline leading-none', accent ?? 'text-slate-800')}>
        {value}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-label whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function SignalPill({ type, count }: { type: string; count: number }) {
  const s = SIGNAL_STYLES[type];
  if (!s || count === 0) return null;
  return (
    <span className={cn('px-2 py-1 rounded-lg text-[9px] font-black font-label uppercase tracking-wide border', s.bg, s.text, s.border)}>
      {count} {type}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OutboundProspectingPanel({
  picks,
  reviewedIds,
  onMarkReviewed,
  onStartSequence,
  onLaunchHunter,
}: OutboundProspectingPanelProps) {
  const findAccount = (company: string): Account =>
    accounts.find(a => a.name.toLowerCase() === company.toLowerCase()) ??
    { id: company, name: company, type: 'Prospect', arr: 0, healthScore: 0, industry: 'Unknown', tier: 'Mid-Market', territory: 'Unknown' };

  const newPicks = picks.filter(p => !reviewedIds.has(p.id));
  const reviewed = picks.filter(p => reviewedIds.has(p.id));
  const neverContacted = picks.filter(p => p.lastContact === 'Never').length;

  const signalCounts = picks.reduce<Record<string, number>>((acc, p) => {
    acc[p.type] = (acc[p.type] ?? 0) + 1;
    return acc;
  }, {});

  const renderPick = (pick: HunterPick) => {
    const isNew = !reviewedIds.has(pick.id);
    const sigStyle = SIGNAL_STYLES[pick.type] ?? SIGNAL_STYLES.interest;
    const urgencyStyle = URGENCY_STYLES[pick.urgency] ?? 'bg-slate-100 text-slate-500';
    const reason = signalToReason(pick.signal, pick.type, pick.urgency);
    const timeLabel = pick.time;
    const isToday = timeLabel === 'Just now' || timeLabel.includes('min') || timeLabel.includes('h ago') || timeLabel.includes('1h');

    return (
      <div
        key={pick.id}
        onClick={() => onMarkReviewed(pick.id)}
        className={cn(
          'border-b border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer group',
          'border-l-4',
          isNew ? sigStyle.leftBorder + ' bg-white' : 'border-l-transparent opacity-60',
        )}
      >
        <div className="px-5 pt-3 pb-3">
          {/* Row 1: Name + signal type badge — mirrors InboundLeadsPanel */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0 flex items-baseline gap-2">
              {isNew && (
                <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-red-500 mt-2" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                  {pick.name}
                </p>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-[11px] text-slate-500 truncate">
                    {pick.urgency !== 'High Intent' ? pick.urgency + ' · ' : ''}{pick.company}
                  </p>
                  {timeLabel && (
                    <span className={cn(
                      'text-[9px] font-bold font-label shrink-0',
                      isToday ? 'text-emerald-500' : 'text-slate-300',
                    )}>
                      {timeLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className={cn(
              'shrink-0 text-[8px] font-black font-label uppercase tracking-wide px-2 py-0.5 rounded-lg border',
              sigStyle.bg, sigStyle.text, sigStyle.border,
            )}>
              {pick.type}
            </span>
          </div>

          {/* Row 2: Why selected + actions — mirrors InboundLeadsPanel tags row */}
          <div className="flex items-center gap-1.5">
            {/* Urgency tag chip — same position/style as lead source tags */}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[8px] font-bold font-label uppercase tracking-tight shrink-0',
              urgencyStyle,
            )}>
              {pick.urgency}
            </span>
            {/* Plain-spoken reason sentence */}
            <p className="text-[9px] text-slate-400 truncate min-w-0 flex-1">
              {reason}
            </p>
            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onStartSequence({
                    contactName: pick.name,
                    company: pick.company,
                    signal: pick.signal,
                    sourcePanel: 'outbound',
                    itemId: pick.id,
                  });
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all"
                title="Start Sequence"
              >
                <Mail size={10} />
                Sequence
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onLaunchHunter(findAccount(pick.company));
                }}
                className="p-1.5 hover:bg-tertiary/10 hover:text-tertiary text-slate-300 rounded-lg transition-all"
                title="Run Hunter"
              >
                <Sparkles size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Summary bar — sticky, mirrors InboundLeadsPanel structure */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4">
        <div className="flex items-end justify-between gap-4 mb-3">
          <StatItem label="Total Picks" value={picks.length} />
          <StatItem label="Unreviewed" value={newPicks.length} accent={newPicks.length > 0 ? 'text-primary' : undefined} />
          <StatItem label="Never Contacted" value={neverContacted} accent={neverContacted > 0 ? 'text-emerald-600' : undefined} />
        </div>
        {/* Signal breakdown bar — mirrors inbound score distribution bar */}
        <div className="flex gap-0.5 h-1 rounded-full overflow-hidden">
          {(['interest', 'hire', 'expansion', 'breach', 'funding', 'nurture', 'renewal'] as const).map(type => {
            const count = signalCounts[type] ?? 0;
            if (!count) return null;
            const pct = Math.round((count / Math.max(picks.length, 1)) * 100);
            return (
              <div
                key={type}
                className={cn('h-full', SIGNAL_STYLES[type]?.bg.replace('bg-', 'bg-').replace('-50', '-300'))}
                style={{ width: `${pct}%` }}
                title={`${type}: ${count}`}
              />
            );
          })}
          <div className="bg-slate-100 flex-1 rounded-r-full" />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(['interest', 'hire', 'expansion', 'breach', 'funding', 'nurture'] as const).map(type => (
            <SignalPill key={type} type={type} count={signalCounts[type] ?? 0} />
          ))}
        </div>
      </div>

      {/* Lists */}
      {newPicks.length > 0 && (
        <div>
          <div className="px-5 py-2.5 bg-cyan-50/60 border-b border-cyan-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-cyan-600 font-label flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse inline-block" />
              {newPicks.length} Active · Awaiting Action
            </p>
          </div>
          {newPicks.map(renderPick)}
        </div>
      )}
      {reviewed.length > 0 && (
        <div>
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label">
              Reviewed · {reviewed.length}
            </p>
          </div>
          {reviewed.map(renderPick)}
        </div>
      )}
      {picks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Sparkles size={32} className="opacity-20 mb-3" />
          <p className="text-sm font-label font-medium">No outbound picks</p>
          <p className="text-xs text-slate-300 mt-1">Hunter picks will appear here</p>
        </div>
      )}
    </div>
  );
}
