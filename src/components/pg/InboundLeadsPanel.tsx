import React from 'react';
import {
  Mail, Linkedin, Sparkles, AlertTriangle, CheckCircle2, XCircle,
  Clock, Loader2, RefreshCw, ChevronDown, ChevronRight, Zap,
  MapPin, Globe, TrendingUp, Target, X, Building2, Phone, User,
  DollarSign, Tag, BarChart2, MessageSquare,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useInboundLeads } from '@/src/hooks/useInboundLeads';
import type { Account, ProcessedInboundLead } from '@/src/types';
import { PgSeqContext } from './PgSeqDrawer';
import { getBattleCard } from '@/src/data/battlecards';

// ─── Props ────────────────────────────────────────────────────────────────────

interface InboundLeadsPanelProps {
  userTerritory?: string;
  reviewedIds: Set<string>;
  onMarkReviewed: (id: string) => void;
  onStartSequence: (ctx: PgSeqContext) => void;
  onLaunchHunter: (account: Account) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function intentColor(signal: string | null) {
  switch (signal) {
    case 'High':   return 'bg-red-100 text-red-700';
    case 'Medium': return 'bg-amber-100 text-amber-700';
    case 'Low':    return 'bg-slate-100 text-slate-500';
    default:       return 'bg-slate-50 text-slate-400';
  }
}

function scoreColor(score: number | null) {
  if (!score) return 'text-slate-300';
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-500';
  return 'text-slate-400';
}

function scoreBg(score: number | null) {
  if (!score) return 'bg-slate-100';
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-400';
  return 'bg-slate-300';
}

function sourceLabel(source: string): string {
  return source.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Processing banner ────────────────────────────────────────────────────────

function ProcessingBanner({ progress }: { progress: { processed: number; remaining: number } | null }) {
  return (
    <div className="flex items-center gap-2 px-5 py-2.5 bg-primary/5 border-b border-primary/10">
      <Loader2 size={12} className="animate-spin text-primary shrink-0" />
      <p className="text-[10px] font-bold text-primary font-label">
        {progress
          ? `Processing leads… ${progress.processed} done, ${progress.remaining} remaining`
          : 'Preparing leads for your queue…'}
      </p>
    </div>
  );
}

// ─── Verification badges ──────────────────────────────────────────────────────

function VerificationBadges({ lead }: { lead: ProcessedInboundLead }) {
  return (
    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
      <span className={cn(
        'flex items-center gap-0.5 text-[8px] font-bold font-label uppercase tracking-tight',
        lead.assigned_territory ? 'text-emerald-600' : 'text-amber-600',
      )}>
        {lead.assigned_territory ? <CheckCircle2 size={9} /> : <AlertTriangle size={9} />}
        {lead.assigned_territory ?? 'Territory Unverified'}
      </span>
      <span className={cn(
        'flex items-center gap-0.5 text-[8px] font-bold font-label uppercase tracking-tight',
        lead.contact_validated ? 'text-emerald-600' : 'text-red-500',
      )}>
        {lead.contact_validated ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
        {lead.contact_validated ? 'Contact OK' : 'Contact Invalid'}
      </span>
      {lead.is_existing_customer && (
        <span className="flex items-center gap-0.5 text-[8px] font-bold font-label uppercase tracking-tight text-primary">
          <CheckCircle2 size={9} />
          Existing Customer
        </span>
      )}
      {lead.is_duplicate && (
        <span className="flex items-center gap-0.5 text-[8px] font-bold font-label uppercase tracking-tight text-amber-600">
          <AlertTriangle size={9} />
          Duplicate
        </span>
      )}
    </div>
  );
}

// ─── Lead card ────────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  isReviewed,
  onOpen,
  onMarkReviewed,
  onStartSequence,
  onLaunchHunter,
}: {
  lead: ProcessedInboundLead;
  isReviewed: boolean;
  onOpen: (lead: ProcessedInboundLead) => void;
  onMarkReviewed: (id: string) => void;
  onStartSequence: (ctx: PgSeqContext) => void;
  onLaunchHunter: (account: Account) => void;
}) {
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Unknown';
  const score = lead.priority_score;

  return (
    <div
      onClick={() => onOpen(lead)}
      title="Click to view details"
      className={cn(
        'border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer group border-l-4',
        isReviewed
          ? 'border-l-transparent opacity-60'
          : score && score >= 75 ? 'border-l-emerald-400 bg-white'
          : score && score >= 50 ? 'border-l-amber-400 bg-white'
          : 'border-l-slate-200 bg-white',
      )}
    >
      <div className="px-4 pt-3 pb-3">
        {/* Name + score */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {!isReviewed && (
                <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                {fullName}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {lead.title ?? '—'} · {lead.company ?? '—'}
            </p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className={cn('text-lg font-black font-headline leading-none', scoreColor(score))}>
              {score ?? '—'}
            </span>
            <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div className={cn('h-full rounded-full', scoreBg(score))} style={{ width: `${score ?? 0}%` }} />
            </div>
          </div>
        </div>

        {/* Verification badges */}
        <VerificationBadges lead={lead} />

        {/* Intent + persona + source */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {lead.intent_signal && (
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[8px] font-black font-label uppercase tracking-tight flex items-center gap-0.5',
              intentColor(lead.intent_signal),
            )}>
              <Zap size={7} />
              {lead.intent_signal} Intent
            </span>
          )}
          {lead.persona_tier && (
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold font-label uppercase tracking-tight bg-slate-100 text-slate-600 flex items-center gap-0.5">
              <Target size={7} />
              {lead.persona_tier}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold font-label uppercase tracking-tight bg-slate-50 text-slate-400">
            {sourceLabel(lead.source)}
          </span>
          {lead.marketo_signal && (
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black font-label uppercase tracking-tight bg-[#5C4EE5]/10 text-[#5C4EE5]">
              {lead.marketo_signal}
            </span>
          )}
          <span className="ml-auto text-[9px] text-slate-400 font-label shrink-0">
            {formatRelativeTime(lead.captured_at)}
          </span>
        </div>

        {/* SDR ready notes */}
        {lead.sdr_ready_notes && (
          <p className="text-[10px] text-slate-600 mt-2 leading-snug line-clamp-2">
            {lead.sdr_ready_notes}
          </p>
        )}

        {/* Recommended action + campaign */}
        {(lead.recommended_action || lead.campaign_sequence) && (
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            {lead.recommended_action && (
              <span className="text-[9px] font-bold text-primary font-label flex items-center gap-0.5">
                <TrendingUp size={8} />
                {lead.recommended_action}
              </span>
            )}
            {lead.campaign_sequence && (
              <span className="text-[9px] text-slate-400 font-label">· {lead.campaign_sequence}</span>
            )}
          </div>
        )}

        {/* Location + actions */}
        <div className="flex items-center gap-2 mt-2.5">
          {(lead.hq_city || lead.hq_state) && (
            <span className="flex items-center gap-0.5 text-[9px] text-slate-400 font-label">
              <MapPin size={8} />
              {[lead.hq_city, lead.hq_state].filter(Boolean).join(', ')}
            </span>
          )}
          {lead.hq_country !== 'United States' && (
            <span className="flex items-center gap-0.5 text-[9px] text-amber-500 font-label">
              <Globe size={8} />
              {lead.hq_country}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={e => {
                e.stopPropagation();
                onStartSequence({
                  contactName: fullName,
                  contactTitle: lead.title ?? undefined,
                  company: lead.company ?? '',
                  channel: 'email',
                  signal: lead.source_detail ?? lead.source,
                  sourcePanel: 'inbound',
                  itemId: lead.id,
                });
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all"
            >
              <Mail size={10} />
              Sequence
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onStartSequence({
                  contactName: fullName,
                  contactTitle: lead.title ?? undefined,
                  company: lead.company ?? '',
                  channel: 'linkedin',
                  signal: lead.source_detail ?? lead.source,
                  sourcePanel: 'inbound',
                  itemId: lead.id,
                });
              }}
              className="p-1.5 hover:bg-[#0077b5]/10 hover:text-[#0077b5] text-slate-300 rounded-lg transition-all"
              title="LinkedIn"
            >
              <Linkedin size={12} />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onLaunchHunter({
                  id: lead.id,
                  name: lead.company ?? 'Unknown',
                  type: 'Prospect',
                  arr: 0,
                  healthScore: 0,
                  industry: lead.industry ?? 'Unknown',
                  tier: 'Mid-Market',
                  territory: lead.assigned_territory ?? 'Unknown',
                });
              }}
              className="p-1.5 hover:bg-tertiary/10 hover:text-tertiary text-slate-300 rounded-lg transition-all"
              title="Run Hunter"
            >
              <Sparkles size={12} />
            </button>
          </div>
        </div>

        {/* Pre-processing timestamp (AC-5) */}
        {lead.processed_at && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-50">
            <CheckCircle2 size={8} className="text-emerald-500 shrink-0" />
            <span className="text-[8px] text-slate-400 font-label">
              Pre-processed {formatRelativeTime(lead.processed_at)} · All checks passed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Collapsible secondary queue ──────────────────────────────────────────────

function SecondaryQueue({
  title,
  leads,
  icon: Icon,
  accentClass,
  reviewedIds,
  onOpen,
  onMarkReviewed,
  onStartSequence,
  onLaunchHunter,
}: {
  title: string;
  leads: ProcessedInboundLead[];
  icon: React.ElementType;
  accentClass: string;
  reviewedIds: Set<string>;
  onOpen: (lead: ProcessedInboundLead) => void;
  onMarkReviewed: (id: string) => void;
  onStartSequence: (ctx: PgSeqContext) => void;
  onLaunchHunter: (account: Account) => void;
}) {
  const [open, setOpen] = React.useState(false);
  if (leads.length === 0) return null;

  return (
    <div className="border-t border-slate-100">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn('w-full flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors', accentClass)}
      >
        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest font-label">
          <Icon size={10} />
          {title} · {leads.length}
        </span>
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
      </button>
      {open && leads.map(lead => (
        <LeadCard
          key={lead.id}
          lead={lead}
          isReviewed={reviewedIds.has(lead.id)}
          onOpen={onOpen}
          onMarkReviewed={onMarkReviewed}
          onStartSequence={onStartSequence}
          onLaunchHunter={onLaunchHunter}
        />
      ))}
    </div>
  );
}

// ─── Battlecard row ───────────────────────────────────────────────────────────

function BattleCardRow({ item }: { item: { title: string; pitch: string; question: string } }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="bg-white rounded-lg border border-amber-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-amber-50/50 transition-colors"
      >
        <span className="text-[10px] font-bold text-slate-700 leading-snug">{item.title}</span>
        <ChevronDown size={12} className={cn('shrink-0 text-amber-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-amber-100">
          <p className="text-[10px] text-slate-600 leading-relaxed pt-2">{item.pitch}</p>
          <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
            <p className="text-[8px] font-black uppercase tracking-widest text-amber-600 mb-1">Discovery Question</p>
            <p className="text-[10px] text-amber-900 font-medium leading-snug italic">"{item.question}"</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lead detail modal ────────────────────────────────────────────────────────

function LeadDetailModal({
  lead,
  isReviewed,
  onClose,
  onMarkReviewed,
  onStartSequence,
  onLaunchHunter,
}: {
  lead: ProcessedInboundLead;
  isReviewed: boolean;
  onClose: () => void;
  onMarkReviewed: (id: string) => void;
  onStartSequence: (ctx: PgSeqContext) => void;
  onLaunchHunter: (account: Account) => void;
}) {
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Unknown';
  const score = lead.priority_score;

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className={cn(
          'flex items-start justify-between p-5 border-b border-slate-100 border-l-4 rounded-tl-2xl',
          score && score >= 75 ? 'border-l-emerald-400' : score && score >= 50 ? 'border-l-amber-400' : 'border-l-slate-200',
        )}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-slate-900">{fullName}</h2>
              {lead.intent_signal && (
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[9px] font-black font-label uppercase tracking-tight flex items-center gap-0.5',
                  intentColor(lead.intent_signal),
                )}>
                  <Zap size={8} /> {lead.intent_signal} Intent
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{lead.title ?? '—'} · {lead.company ?? '—'}</p>
            <VerificationBadges lead={lead} />
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-3">
            <div className="text-right">
              <span className={cn('text-2xl font-black font-headline leading-none', scoreColor(score))}>
                {score ?? '—'}
              </span>
              <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Score</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">

          {/* Contact info */}
          <section>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label mb-2">Contact</p>
            <div className="grid grid-cols-2 gap-2">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate">
                  <Mail size={11} className="shrink-0" /> {lead.email}
                </a>
              )}
              {lead.phone && (
                <span className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                  <Phone size={11} className="shrink-0" /> {lead.phone}
                </span>
              )}
              {lead.title && (
                <span className="flex items-center gap-1.5 text-xs text-slate-600 truncate col-span-2">
                  <User size={11} className="shrink-0" /> {lead.title}
                </span>
              )}
            </div>
          </section>

          {/* Company / Firmographics */}
          <section>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label mb-2">Company</p>
            <div className="grid grid-cols-2 gap-2">
              {lead.company && (
                <span className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold truncate col-span-2">
                  <Building2 size={11} className="shrink-0 text-slate-400" /> {lead.company}
                </span>
              )}
              {lead.industry && (
                <span className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                  <Tag size={11} className="shrink-0 text-slate-400" /> {lead.industry}
                </span>
              )}
              {lead.company_size && (
                <span className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                  <User size={11} className="shrink-0 text-slate-400" /> {lead.company_size} employees
                </span>
              )}
              {(lead.hq_city || lead.hq_state) && (
                <span className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                  <MapPin size={11} className="shrink-0 text-slate-400" />
                  {[lead.hq_city, lead.hq_state, lead.hq_country !== 'United States' ? lead.hq_country : null].filter(Boolean).join(', ')}
                </span>
              )}
              {lead.annual_revenue && (
                <span className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                  <DollarSign size={11} className="shrink-0 text-slate-400" />
                  ${(lead.annual_revenue / 1_000_000).toFixed(1)}M ARR
                </span>
              )}
            </div>
          </section>

          {/* AI Enrichment */}
          {(lead.persona_tier || lead.recommended_action || lead.campaign_sequence || lead.sdr_ready_notes) && (
            <section className="bg-primary/5 rounded-xl p-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary font-label mb-2 flex items-center gap-1">
                <Sparkles size={9} /> AI Enrichment
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {lead.persona_tier && (
                  <div>
                    <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Persona</p>
                    <p className="text-xs font-semibold text-slate-700">{lead.persona_tier}</p>
                  </div>
                )}
                {lead.intent_signal && (
                  <div>
                    <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Intent</p>
                    <p className="text-xs font-semibold text-slate-700">{lead.intent_signal}</p>
                  </div>
                )}
                {lead.recommended_action && (
                  <div className="col-span-2">
                    <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Recommended Action</p>
                    <p className="text-xs font-semibold text-primary flex items-center gap-1">
                      <TrendingUp size={10} /> {lead.recommended_action}
                    </p>
                  </div>
                )}
                {lead.campaign_sequence && (
                  <div className="col-span-2">
                    <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Campaign</p>
                    <p className="text-xs text-slate-600">{lead.campaign_sequence}</p>
                  </div>
                )}
              </div>
              {lead.sdr_ready_notes && (
                <p className="text-[10px] text-slate-600 leading-relaxed border-t border-primary/10 pt-2">{lead.sdr_ready_notes}</p>
              )}
            </section>
          )}

          {/* Message / Intent */}
          {lead.message && (
            <section>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label mb-2 flex items-center gap-1">
                <MessageSquare size={9} /> Message
              </p>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{lead.message}</p>
            </section>
          )}

          {/* Routing */}
          <section>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label mb-2 flex items-center gap-1">
              <BarChart2 size={9} /> Routing
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Queue</p>
                <p className="text-xs font-semibold text-slate-700 capitalize">{lead.routing_queue?.replace(/_/g, ' ') ?? '—'}</p>
              </div>
              <div>
                <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Assigned To</p>
                <p className="text-xs font-semibold text-slate-700 uppercase">{lead.assigned_to_role ?? '—'}</p>
              </div>
              <div>
                <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Territory</p>
                <p className="text-xs font-semibold text-slate-700">{lead.assigned_territory ?? '—'}</p>
              </div>
              <div>
                <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Source</p>
                <p className="text-xs font-semibold text-slate-700">{sourceLabel(lead.source)}</p>
              </div>
              <div>
                <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Tier</p>
                <p className="text-xs font-semibold text-slate-700">{lead.lead_tier.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest">Quality</p>
                <p className="text-xs font-semibold text-slate-700">{Math.round(lead.data_quality_score * 100)}%</p>
              </div>
              {lead.marketo_signal && (
                <div className="col-span-3 border-t border-slate-100 pt-2 mt-1">
                  <p className="text-[8px] text-slate-400 font-label uppercase tracking-widest mb-1.5">Marketo Signal</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-[#5C4EE5] leading-none tracking-tight">{lead.marketo_signal}</span>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-700">
                        {lead.marketo_signal[0] === 'A' ? 'Top ICP' : lead.marketo_signal[0] === 'B' ? 'Strong ICP' : lead.marketo_signal[0] === 'C' ? 'Moderate ICP' : lead.marketo_signal[0] === 'D' ? 'Weak ICP' : lead.marketo_signal[0] === 'E' ? 'Non-ICP' : 'Junk Data'}
                        {' · '}
                        {lead.marketo_signal[1] === '1' ? 'High Activity' : lead.marketo_signal[1] === '2' ? 'Medium-High Activity' : lead.marketo_signal[1] === '3' ? 'Medium Activity' : lead.marketo_signal[1] === '4' ? 'Minimal Activity' : 'No Activity'}
                      </p>
                      {lead.marketo_program && (
                        <p className="text-[9px] text-slate-400 mt-0.5">{lead.marketo_program}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Battlecard */}
          {(() => {
            const card = getBattleCard(lead.title);
            if (!card) return null;
            return (
              <section className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 font-label mb-3 flex items-center gap-1.5">
                  <span>{card.icon}</span> Battlecard — {card.persona}
                </p>
                <div className="space-y-3">
                  {card.items.map((item, i) => (
                    <BattleCardRow key={i} item={item} />
                  ))}
                </div>
              </section>
            );
          })()}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 flex items-center gap-2 rounded-b-2xl">
          <button
            onClick={() => {
              onLaunchHunter({
                id: lead.id,
                name: lead.company ?? 'Unknown',
                type: 'Prospect',
                arr: 0,
                healthScore: 0,
                industry: lead.industry ?? 'Unknown',
                tier: 'Mid-Market',
                territory: lead.assigned_territory ?? 'Unknown',
              });
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-tertiary/10 text-tertiary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-tertiary hover:text-white transition-all"
          >
            <Sparkles size={12} /> Launch Hunter
          </button>
          <button
            onClick={() => {
              onStartSequence({
                contactName: fullName,
                contactTitle: lead.title ?? undefined,
                company: lead.company ?? '',
                channel: 'email',
                signal: lead.source_detail ?? lead.source,
                sourcePanel: 'inbound',
                itemId: lead.id,
              });
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all"
          >
            <Mail size={12} /> Email Sequence
          </button>
          <button
            onClick={() => {
              onStartSequence({
                contactName: fullName,
                contactTitle: lead.title ?? undefined,
                company: lead.company ?? '',
                channel: 'linkedin',
                signal: lead.source_detail ?? lead.source,
                sourcePanel: 'inbound',
                itemId: lead.id,
              });
              onClose();
            }}
            className="p-2 hover:bg-[#0077b5]/10 hover:text-[#0077b5] text-slate-400 rounded-xl transition-all"
            title="LinkedIn Sequence"
          >
            <Linkedin size={14} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => { onMarkReviewed(lead.id); onClose(); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all',
              isReviewed
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
            )}
          >
            <CheckCircle2 size={12} />
            {isReviewed ? 'Move to New' : 'Mark Reviewed'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reviewed queue (collapsible) ────────────────────────────────────────────

function ReviewedQueue({
  leads,
  onOpen,
  onMarkReviewed,
  onStartSequence,
  onLaunchHunter,
}: {
  leads: ProcessedInboundLead[];
  onOpen: (lead: ProcessedInboundLead) => void;
  onMarkReviewed: (id: string) => void;
  onStartSequence: (ctx: PgSeqContext) => void;
  onLaunchHunter: (account: Account) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-t-2 border-slate-100">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 font-label">
          <CheckCircle2 size={10} className="text-slate-400" />
          Reviewed · {leads.length}
          <span className="text-[8px] font-normal normal-case tracking-normal text-slate-400">
            — open any lead to move it back to New
          </span>
        </span>
        {open ? <ChevronDown size={10} className="text-slate-400" /> : <ChevronRight size={10} className="text-slate-400" />}
      </button>
      {open && leads.map(lead => (
        <LeadCard
          key={lead.id}
          lead={lead}
          isReviewed={true}
          onOpen={onOpen}
          onMarkReviewed={onMarkReviewed}
          onStartSequence={onStartSequence}
          onLaunchHunter={onLaunchHunter}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InboundLeadsPanel({
  userTerritory,
  reviewedIds,
  onMarkReviewed,
  onStartSequence,
  onLaunchHunter,
}: InboundLeadsPanelProps) {
  const {
    stats,
    primaryQueue,
    rsmQueue,
    needsResolution,
    lowQuality,
    isLoading,
    isProcessing,
    processingProgress,
    error,
    lastRefreshed,
    refresh,
  } = useInboundLeads(userTerritory);

  const [selectedLead, setSelectedLead] = React.useState<ProcessedInboundLead | null>(null);
  const [view, setView] = React.useState<'queue' | 'details'>('queue');

  const allPrimary = [...primaryQueue, ...rsmQueue];
  const newLeads = allPrimary
    .filter(l => !reviewedIds.has(l.id))
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
  const reviewed = allPrimary
    .filter(l => reviewedIds.has(l.id))
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
  const avgScore = allPrimary.length
    ? Math.round(allPrimary.reduce((s, l) => s + (l.priority_score ?? 0), 0) / allPrimary.length)
    : 0;
  const highIntent = allPrimary.filter(l => l.intent_signal === 'High').length;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <XCircle size={32} className="opacity-30" />
        <p className="text-sm font-label font-medium">Could not load leads</p>
        <p className="text-xs text-slate-300 text-center max-w-xs">{error}</p>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest font-label text-primary hover:bg-primary/5 rounded-lg transition-all"
        >
          <RefreshCw size={10} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isReviewed={reviewedIds.has(selectedLead.id)}
          onClose={() => setSelectedLead(null)}
          onMarkReviewed={onMarkReviewed}
          onStartSequence={onStartSequence}
          onLaunchHunter={onLaunchHunter}
        />
      )}
      {isProcessing && <ProcessingBanner progress={processingProgress} />}

      {/* Stats bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4">
        <div className="flex items-end justify-between gap-4 mb-3">
          <div className="flex items-end gap-4">
            {[
              { label: 'Ready', value: isLoading ? '…' : allPrimary.length, accent: undefined },
              { label: 'New', value: isLoading ? '…' : newLeads.length, accent: newLeads.length > 0 ? 'text-primary' : undefined },
              { label: 'Avg Score', value: isLoading ? '…' : (avgScore || '—'), accent: 'text-primary' },
              { label: 'High Intent', value: isLoading ? '…' : highIntent, accent: highIntent > 0 ? 'text-red-500' : undefined },
            ].map(({ label, value, accent }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className={cn('text-lg font-black font-headline leading-none', accent ?? 'text-slate-800')}>
                  {value}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-label whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setView('queue')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest font-label transition-all',
                  view === 'queue' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600',
                )}
              >
                Queue
              </button>
              <button
                onClick={() => setView('details')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest font-label transition-all',
                  view === 'details' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600',
                )}
              >
                Details
              </button>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading || isProcessing}
              className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all disabled:opacity-40"
              title={lastRefreshed ? `Updated ${formatRelativeTime(lastRefreshed.toISOString())}` : 'Refresh'}
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Score distribution bar */}
        <div className="flex gap-0.5 h-1 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 rounded-l-full"
            style={{ width: `${Math.round((allPrimary.filter(l => (l.priority_score ?? 0) >= 75).length / Math.max(allPrimary.length, 1)) * 100)}%` }}
          />
          <div
            className="bg-amber-400"
            style={{ width: `${Math.round((allPrimary.filter(l => (l.priority_score ?? 0) >= 50 && (l.priority_score ?? 0) < 75).length / Math.max(allPrimary.length, 1)) * 100)}%` }}
          />
          <div className="bg-slate-200 rounded-r-full flex-1" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-slate-400 font-label">Score distribution</span>
          <span className="text-[8px] text-slate-400 font-label">High · Mid · Low</span>
        </div>

        {stats && stats.pending > 0 && !isProcessing && (
          <div className="mt-2 flex items-center gap-1.5">
            <Clock size={9} className="text-amber-500" />
            <span className="text-[9px] text-amber-600 font-label font-bold">
              {stats.pending} lead{stats.pending !== 1 ? 's' : ''} still processing…
            </span>
          </div>
        )}
      </div>

      {/* ── Queue view ── */}
      {view === 'queue' && (
        <>
          {isLoading && !allPrimary.length && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 size={24} className="animate-spin opacity-30" />
              <p className="text-xs font-label">Loading your queue…</p>
            </div>
          )}

          {newLeads.length > 0 && (
            <div>
              <div className="px-5 py-2.5 bg-primary/5 border-b border-primary/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary font-label flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />
                  {newLeads.length} New · Ready for Action
                </p>
              </div>
              {newLeads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isReviewed={false}
                  onOpen={setSelectedLead}
                  onMarkReviewed={onMarkReviewed}
                  onStartSequence={onStartSequence}
                  onLaunchHunter={onLaunchHunter}
                />
              ))}
            </div>
          )}

          {reviewed.length > 0 && (
            <ReviewedQueue
              leads={reviewed}
              onOpen={setSelectedLead}
              onMarkReviewed={onMarkReviewed}
              onStartSequence={onStartSequence}
              onLaunchHunter={onLaunchHunter}
            />
          )}

          {!isLoading && !isProcessing && allPrimary.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Mail size={32} className="opacity-20 mb-3" />
              <p className="text-sm font-label font-medium">Queue is clear</p>
              <p className="text-xs text-slate-300 mt-1">New leads will appear here automatically</p>
            </div>
          )}
        </>
      )}

      {/* ── Details view ── */}
      {view === 'details' && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b border-slate-100">
            {[
              { label: 'Needs Resolution', value: needsResolution.length, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Low Quality',       value: lowQuality.length,      color: 'text-slate-500', bg: 'bg-slate-50' },
              { label: 'Reviewed',          value: reviewed.length,        color: 'text-primary',   bg: 'bg-primary/5' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={cn('rounded-xl p-3 flex flex-col gap-0.5', bg)}>
                <span className={cn('text-xl font-black font-headline leading-none', color)}>{value}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 font-label leading-tight">{label}</span>
              </div>
            ))}
          </div>

          <SecondaryQueue
            title="Needs Resolution"
            leads={needsResolution}
            icon={AlertTriangle}
            accentClass="text-amber-600"
            reviewedIds={reviewedIds}
            onOpen={setSelectedLead}
            onMarkReviewed={onMarkReviewed}
            onStartSequence={onStartSequence}
            onLaunchHunter={onLaunchHunter}
          />
          <SecondaryQueue
            title="Low Quality"
            leads={lowQuality}
            icon={XCircle}
            accentClass="text-slate-500"
            reviewedIds={reviewedIds}
            onOpen={setSelectedLead}
            onMarkReviewed={onMarkReviewed}
            onStartSequence={onStartSequence}
            onLaunchHunter={onLaunchHunter}
          />
          <SecondaryQueue
            title="Reviewed"
            leads={reviewed}
            icon={CheckCircle2}
            accentClass="text-primary"
            reviewedIds={reviewedIds}
            onOpen={setSelectedLead}
            onMarkReviewed={onMarkReviewed}
            onStartSequence={onStartSequence}
            onLaunchHunter={onLaunchHunter}
          />

          {needsResolution.length === 0 && lowQuality.length === 0 && reviewed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <CheckCircle2 size={32} className="opacity-20 mb-3" />
              <p className="text-sm font-label font-medium">Nothing to review</p>
              <p className="text-xs text-slate-300 mt-1">All leads have been processed cleanly</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
