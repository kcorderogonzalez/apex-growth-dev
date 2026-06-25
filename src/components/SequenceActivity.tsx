import React from 'react';
import {
  Mail, Phone, Linkedin, Calendar, CheckSquare, Inbox,
  Play, Pause, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronRight,
  Clock, TrendingUp, BarChart2, RefreshCw, Search, Filter, LayoutDashboard,
  MousePointerClick, MessageSquareReply, Eye, UserPlus, Zap, Info, ThumbsUp, Target,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  sequences, tasks, calls, meetings, outboxEmails,
  SequenceStatus, TaskStatus, CallDisposition, MeetingStatus, EmailStatus,
} from '@/src/data/sequenceData';

// ─── Shared helpers ───────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'sequences' | 'tasks' | 'calls' | 'meetings' | 'outbox';

const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType; count: () => number }[] = [
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard, count: () => 0 },
  { id: 'sequences',  label: 'Sequences',   icon: Play,        count: () => sequences.length },
  { id: 'tasks',      label: 'Tasks',       icon: CheckSquare, count: () => tasks.filter(t => t.status !== 'Completed' && t.status !== 'Skipped').length },
  { id: 'calls',      label: 'Calls',       icon: Phone,       count: () => calls.length },
  { id: 'meetings',   label: 'Meetings',    icon: Calendar,    count: () => meetings.length },
  { id: 'outbox',     label: 'Email Outbox',icon: Inbox,       count: () => outboxEmails.filter(e => e.status === 'Scheduled').length },
];

// ─── Sequence step types ──────────────────────────────────────────────────────

type StepType = 'Auto Email' | 'Manual Email' | 'Call' | 'Voicemail' | 'LinkedIn' | 'Task';
type StepStatus = 'best' | 'weak' | 'normal';

interface SequenceStep {
  step: number;
  day: number;
  type: StepType;
  subject: string;
  note: string;
  openRate?: number;
  replyRate?: number;
  status: StepStatus;   // driven by engagement score insights
}

const STEP_TYPE_META: Record<StepType, { icon: React.ElementType; color: string; bg: string }> = {
  'Auto Email':   { icon: Mail,         color: 'text-blue-600',   bg: 'bg-blue-100'   },
  'Manual Email': { icon: Mail,         color: 'text-violet-600', bg: 'bg-violet-100' },
  'Call':         { icon: Phone,        color: 'text-emerald-600',bg: 'bg-emerald-100'},
  'Voicemail':    { icon: Phone,        color: 'text-amber-600',  bg: 'bg-amber-100'  },
  'LinkedIn':     { icon: Linkedin,     color: 'text-cyan-600',   bg: 'bg-cyan-100'   },
  'Task':         { icon: CheckSquare,  color: 'text-slate-500',  bg: 'bg-slate-100'  },
};

// ─── Engagement score data ────────────────────────────────────────────────────

interface EngagementScore {
  sequenceName: string;
  score: number | null;
  rating: string | null;
  ratingLevel: 'low' | 'mid' | 'high' | null;
  bestReplyStep: number | null;
  bestChannel: string | null;
  leastEngagingStep: number | null;
  topObjection: string | null;
  noDataReasons?: string[];
  steps: SequenceStep[];
}

const engagementScores: EngagementScore[] = [
  {
    sequenceName: 'Enterprise SSE Launch',
    score: null,
    rating: 'Lowest engagement',
    ratingLevel: 'low',
    bestReplyStep: 3,
    bestChannel: null,
    leastEngagingStep: 1,
    topObjection: 'Other reasons',
    noDataReasons: [
      'Less than 20 prospects completed the sequence in the last 90 days.',
      'The sequence does not contain any email or call steps.',
    ],
    // Research: Enterprise 12-step, 30-60 day, ABM-style. Step 1 is weakest (cold open), Step 3 best reply.
    steps: [
      { step:1, day:0,  type:'Auto Email',   subject:'Why Netskope for Enterprise SSE',            note:'Relevance hook — current VPN pain point',        openRate:22, replyRate:1, status:'weak' },
      { step:2, day:1,  type:'LinkedIn',     subject:'Connection request + brief note',            note:'Warm the contact before follow-up email',       status:'normal' },
      { step:3, day:3,  type:'Manual Email', subject:'SSE case study — similar account win',       note:'Social proof, named peer reference',             openRate:41, replyRate:8, status:'best' },
      { step:4, day:5,  type:'Call',         subject:'Discovery call — 15-min ask',                note:'Voicemail drop if no answer',                    status:'normal' },
      { step:5, day:7,  type:'Auto Email',   subject:'Zero Trust ROI calculator (interactive)',    note:'Click-driven; link to ROI tool',                 openRate:35, replyRate:3, status:'normal' },
      { step:6, day:10, type:'LinkedIn',     subject:'Engage with recent post',                    note:'Like/comment to stay visible',                   status:'normal' },
      { step:7, day:14, type:'Manual Email', subject:'Executive brief — CISO peer insights',       note:'New angle: security leadership POV',             openRate:38, replyRate:5, status:'normal' },
      { step:8, day:18, type:'Call',         subject:'Follow-up: did you get my last email?',      note:'Reference step 7 email in voicemail',            status:'normal' },
    ],
  },
  {
    sequenceName: 'CISO High-Touch ZTNA',
    score: 67,
    rating: 'Above average engagement',
    ratingLevel: 'high',
    bestReplyStep: 6,
    bestChannel: 'Manual email',
    leastEngagingStep: 4,
    topObjection: 'Other reasons',
    // Research: CISO 6-step, email+LinkedIn, executive nurture. Step 6 manual email best; Step 4 weakest.
    steps: [
      { step:1, day:0,  type:'Auto Email',   subject:'Zero Trust is not a product — it\'s a journey', note:'Thought leadership open, no pitch',           openRate:58, replyRate:6,  status:'normal' },
      { step:2, day:2,  type:'LinkedIn',     subject:'InMail: ZTNA maturity benchmark report',      note:'Peer comparison angle for CISOs',               status:'normal' },
      { step:3, day:4,  type:'Auto Email',   subject:'How [peer company] cut lateral movement risk', note:'Named case study, 3 metrics',                 openRate:55, replyRate:9,  status:'normal' },
      { step:4, day:7,  type:'Call',         subject:'15-min CISO peer call — your ZTNA roadmap',   note:'Low reply; CISO phone aversion',                openRate:undefined, replyRate:2, status:'weak' },
      { step:5, day:10, type:'LinkedIn',     subject:'Share: Gartner ZTNA Market Guide 2025',       note:'Value-add share, no ask',                       status:'normal' },
      { step:6, day:14, type:'Manual Email', subject:'Personalized ZTNA gap analysis — your stack', note:'Highest reply rate; hyper-personalized',        openRate:63, replyRate:18, status:'best' },
    ],
  },
  {
    sequenceName: 'VPN Replacement Track',
    score: 41,
    rating: 'Below average engagement',
    ratingLevel: 'mid',
    bestReplyStep: 2,
    bestChannel: 'Automated email',
    leastEngagingStep: 5,
    topObjection: 'Not interested',
    // Research: Mid-market 5-step, 14-day, email+call. Step 2 best (evidence), Step 5 weakest (fatigue).
    steps: [
      { step:1, day:0,  type:'Auto Email',   subject:'Still running a hardware VPN in 2025?',       note:'Pain-point subject line, curiosity hook',       openRate:47, replyRate:4,  status:'normal' },
      { step:2, day:2,  type:'Auto Email',   subject:'3 companies that replaced VPN in 30 days',    note:'Best reply — social proof & urgency',           openRate:52, replyRate:11, status:'best' },
      { step:3, day:4,  type:'Call',         subject:'Quick call — VPN consolidation ROI',          note:'Reference step 2 email in opening',             status:'normal' },
      { step:4, day:7,  type:'Manual Email', subject:'Custom VPN → ZTNA migration checklist',       note:'Personalized asset, increases intent signal',   openRate:39, replyRate:6,  status:'normal' },
      { step:5, day:14, type:'Auto Email',   subject:'Last note — is VPN modernization a priority?', note:'Weak: "last email" framing causes fatigue',   openRate:28, replyRate:2,  status:'weak' },
    ],
  },
  {
    sequenceName: 'GRC Compliance Track',
    score: null,
    rating: null,
    ratingLevel: null,
    bestReplyStep: null,
    bestChannel: null,
    leastEngagingStep: null,
    topObjection: null,
    noDataReasons: [
      'Less than 20 prospects completed the sequence in the last 90 days.',
    ],
    // Research: Compliance 6-step, email+LinkedIn, GDPR/PCI focus. No engagement data yet.
    steps: [
      { step:1, day:0,  type:'Auto Email',   subject:'GDPR in the cloud: are you covered?',         note:'Compliance angle, regulatory urgency',          status:'normal' },
      { step:2, day:1,  type:'LinkedIn',     subject:'Connection — compliance & cloud security',    note:'Warm outreach before follow-up',                status:'normal' },
      { step:3, day:3,  type:'Auto Email',   subject:'PCI-DSS 4.0 deadline — what changes for you', note:'Deadline urgency, specific regulation',         status:'normal' },
      { step:4, day:6,  type:'Manual Email', subject:'How [peer] passed their SOC2 audit with us',  note:'Peer proof point in compliance context',        status:'normal' },
      { step:5, day:9,  type:'Call',         subject:'15-min: walk through your compliance gaps',   note:'Discovery framing, not a pitch',                status:'normal' },
      { step:6, day:14, type:'Auto Email',   subject:'HIPAA + GDPR checklist — free download',      note:'Value asset as final touch before nurture',     status:'normal' },
    ],
  },
];

// ─── Score gauge ring ─────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const pct = score / 100;
  const color = score >= 60 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle cx="48" cy="48" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={radius} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="53" textAnchor="middle" fontSize="20" fontWeight="900" fill={color} fontFamily="inherit">
        {score}
      </text>
    </svg>
  );
}

// ─── Step timeline row ────────────────────────────────────────────────────────

function StepRow({ s, isLast }: { s: SequenceStep; isLast: boolean }) {
  const meta = STEP_TYPE_META[s.type];
  const Icon = meta.icon;

  const statusRing =
    s.status === 'best' ? 'ring-2 ring-emerald-400' :
    s.status === 'weak' ? 'ring-2 ring-red-300'     : '';

  const statusLabel =
    s.status === 'best' ? <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[7px] font-black uppercase tracking-widest font-label">Best</span> :
    s.status === 'weak' ? <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[7px] font-black uppercase tracking-widest font-label">Improve</span> :
    null;

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0">
        <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0', meta.bg, statusRing)}>
          <Icon size={12} className={meta.color} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 min-w-0 pb-4', isLast && 'pb-0')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-label">Step {s.step}</span>
              <span className="text-[8px] text-slate-300 font-label">· Day {s.day}</span>
              <span className={cn('text-[8px] font-bold font-label', meta.color)}>{s.type}</span>
              {statusLabel}
            </div>
            <p className="text-[11px] font-semibold text-slate-700 mt-0.5 leading-snug">{s.subject}</p>
            <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">{s.note}</p>
          </div>
          {/* Micro metrics */}
          {(s.openRate !== undefined || s.replyRate !== undefined) && (
            <div className="flex gap-2 shrink-0 mt-0.5">
              {s.openRate !== undefined && (
                <div className="text-center">
                  <p className={cn('text-[10px] font-black font-headline leading-none',
                    s.openRate >= 50 ? 'text-emerald-600' : s.openRate >= 35 ? 'text-amber-600' : 'text-red-500'
                  )}>{s.openRate}%</p>
                  <p className="text-[7px] text-slate-400 font-label uppercase tracking-wide">Open</p>
                </div>
              )}
              {s.replyRate !== undefined && (
                <div className="text-center">
                  <p className={cn('text-[10px] font-black font-headline leading-none',
                    s.replyRate >= 10 ? 'text-emerald-600' : s.replyRate >= 5 ? 'text-amber-600' : 'text-red-500'
                  )}>{s.replyRate}%</p>
                  <p className="text-[7px] text-slate-400 font-label uppercase tracking-wide">Reply</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Single engagement card ───────────────────────────────────────────────────

function EngagementCard({ data }: { data: EngagementScore }) {
  const hasScore = data.score !== null;
  const [showSteps, setShowSteps] = React.useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">{data.sequenceName}</p>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label">Score Insights</span>
      </div>

      <div className="p-5">
        {!hasScore ? (
          /* ── No data state ── */
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
              <Info size={20} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-500 mb-1.5">Not enough data to display an accurate score</p>
              <p className="text-[10px] text-slate-400 mb-1.5">It could be due to one of these reasons:</p>
              <ul className="space-y-1">
                {(data.noDataReasons ?? []).map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-500">
                    <span className="text-slate-300 mt-0.5">•</span> {r}
                  </li>
                ))}
              </ul>
              {(data.bestReplyStep || data.leastEngagingStep) && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                  {data.bestReplyStep && (
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 font-label flex items-center gap-1"><ThumbsUp size={8} /> What's going well</p>
                      <p className="text-[10px] text-slate-600 font-medium">Best email reply: Step {data.bestReplyStep}</p>
                    </div>
                  )}
                  {data.leastEngagingStep && (
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-amber-600 font-label flex items-center gap-1"><Target size={8} /> Where to focus</p>
                      <p className="text-[10px] text-slate-600 font-medium">Least engaging: Step {data.leastEngagingStep}</p>
                      {data.topObjection && <p className="text-[10px] text-slate-400">Highest objection: {data.topObjection}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Score state ── */
          <div className="flex gap-5 items-start">
            <ScoreRing score={data.score!} />
            <div className="flex-1 min-w-0 space-y-3">
              <p className={cn('text-sm font-black font-headline',
                data.ratingLevel === 'high' ? 'text-emerald-600' :
                data.ratingLevel === 'mid'  ? 'text-amber-600'   : 'text-red-500'
              )}>
                {data.rating}
              </p>
              <div className="bg-emerald-50 rounded-xl p-3 space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-emerald-700 font-label flex items-center gap-1">
                  <ThumbsUp size={8} /> What's going well
                </p>
                {data.bestReplyStep && <p className="text-[10px] text-slate-700">Best email reply: <span className="font-bold">Step {data.bestReplyStep}</span></p>}
                {data.bestChannel && <p className="text-[10px] text-slate-700">Best performing channel: <span className="font-bold">{data.bestChannel}</span></p>}
              </div>
              <div className="bg-amber-50 rounded-xl p-3 space-y-1">
                <p className="text-[8px] font-black uppercase tracking-widest text-amber-700 font-label flex items-center gap-1">
                  <Target size={8} /> Where to focus
                </p>
                {data.leastEngagingStep && <p className="text-[10px] text-slate-700">Least engaging: <span className="font-bold">Step {data.leastEngagingStep}</span></p>}
                {data.topObjection && <p className="text-[10px] text-slate-700">Highest objection reason: <span className="font-bold">{data.topObjection}</span></p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Step timeline toggle ── */}
        {data.steps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowSteps(v => !v)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors font-label w-full"
            >
              <ChevronRight size={12} className={cn('transition-transform', showSteps && 'rotate-90')} />
              Sequence Steps ({data.steps.length})
              <span className="ml-auto flex gap-2 text-[9px] font-label normal-case tracking-normal font-normal text-slate-400">
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Best step</span>
                <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-300 inline-block" /> Needs work</span>
              </span>
            </button>

            {showSteps && (
              <div className="mt-4">
                {data.steps.map((s, i) => (
                  <StepRow key={s.step} s={s} isLast={i === data.steps.length - 1} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  // Compute metrics from mock data
  const prospectsAdded = sequences.length;
  const sentEmails     = outboxEmails.filter(e => e.status !== 'Scheduled').length;
  const openedEmails   = outboxEmails.filter(e => ['Opened','Clicked','Replied'].includes(e.status)).length;
  const clickedEmails  = outboxEmails.filter(e => ['Clicked','Replied'].includes(e.status)).length;
  const repliedEmails  = outboxEmails.filter(e => e.status === 'Replied').length;

  const openRate   = sentEmails > 0 ? Math.round((openedEmails  / sentEmails) * 100) : 0;
  const clickRate  = sentEmails > 0 ? Math.round((clickedEmails / sentEmails) * 100) : 0;
  const replyRate  = sentEmails > 0 ? Math.round((repliedEmails / sentEmails) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <UserPlus size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black font-headline text-slate-800 leading-none">{prospectsAdded}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-label mt-0.5">Prospects Added</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0">
            <Eye size={18} className="text-cyan-600" />
          </div>
          <div>
            <p className="text-2xl font-black font-headline text-cyan-600 leading-none">{openRate}%</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-label mt-0.5">Email Open Rate</p>
            <p className="text-[8px] text-slate-400">{openedEmails} of {sentEmails} sent</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <MousePointerClick size={18} className="text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-black font-headline text-violet-600 leading-none">{clickRate}%</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-label mt-0.5">Email Click Rate</p>
            <p className="text-[8px] text-slate-400">{clickedEmails} of {sentEmails} sent</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <MessageSquareReply size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black font-headline text-emerald-600 leading-none">{replyRate}%</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-label mt-0.5">Email Reply Rate</p>
            <p className="text-[8px] text-slate-400">{repliedEmails} of {sentEmails} sent</p>
          </div>
        </div>
      </div>

      {/* Engagement score section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-amber-500" />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-600 font-label">Sequence Engagement Score</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engagementScores.map(s => (
            <EngagementCard key={s.sequenceName} data={s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-cyan-100 text-cyan-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700', 'bg-rose-100 text-rose-700'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={cn('rounded-full flex items-center justify-center font-black font-label shrink-0', color,
      size === 'sm' ? 'h-7 w-7 text-[9px]' : 'h-9 w-9 text-[10px]'
    )}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex flex-col gap-1 shadow-sm">
      <span className={cn('text-2xl font-black font-headline leading-none', accent ?? 'text-slate-800')}>{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-label">{label}</span>
      {sub && <span className="text-[9px] text-slate-400">{sub}</span>}
    </div>
  );
}

// ─── Status badges ────────────────────────────────────────────────────────────

const SEQ_STATUS: Record<SequenceStatus, string> = {
  Active:     'bg-emerald-100 text-emerald-700',
  Paused:     'bg-amber-100 text-amber-700',
  Finished:   'bg-slate-100 text-slate-500',
  'Opted Out':'bg-red-100 text-red-600',
  Bounced:    'bg-rose-100 text-rose-600',
};

const TASK_STATUS: Record<TaskStatus, string> = {
  'Due Today':  'bg-primary/10 text-primary',
  Overdue:      'bg-red-100 text-red-600',
  Upcoming:     'bg-slate-100 text-slate-500',
  Completed:    'bg-emerald-100 text-emerald-700',
  Skipped:      'bg-slate-100 text-slate-400',
};

const TASK_TYPE_ICON: Record<string, React.ElementType> = {
  Email: Mail, Call: Phone, LinkedIn: Linkedin, Research: Search,
};

const CALL_DISPOSITION: Record<CallDisposition, string> = {
  Connected:    'bg-emerald-100 text-emerald-700',
  Voicemail:    'bg-amber-100 text-amber-700',
  'No Answer':  'bg-slate-100 text-slate-500',
  'Bad Number': 'bg-red-100 text-red-600',
  'Do Not Call':'bg-rose-100 text-rose-600',
};

const MEETING_STATUS: Record<MeetingStatus, string> = {
  Scheduled:   'bg-primary/10 text-primary',
  Completed:   'bg-emerald-100 text-emerald-700',
  'No Show':   'bg-red-100 text-red-600',
  Rescheduled: 'bg-amber-100 text-amber-700',
};

const EMAIL_STATUS: Record<EmailStatus, string> = {
  Scheduled: 'bg-slate-100 text-slate-500',
  Sent:      'bg-blue-100 text-blue-600',
  Opened:    'bg-cyan-100 text-cyan-700',
  Clicked:   'bg-violet-100 text-violet-700',
  Replied:   'bg-emerald-100 text-emerald-700',
  Bounced:   'bg-red-100 text-red-600',
  Failed:    'bg-rose-100 text-rose-600',
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest font-label shrink-0', className)}>
      {label}
    </span>
  );
}

// ─── Sequences tab ────────────────────────────────────────────────────────────

function SequencesTab() {
  const active   = sequences.filter(s => s.status === 'Active').length;
  const paused   = sequences.filter(s => s.status === 'Paused').length;
  const finished = sequences.filter(s => s.status === 'Finished' || s.status === 'Opted Out' || s.status === 'Bounced').length;
  const avgOpen  = Math.round(sequences.reduce((s, e) => s + e.openRate, 0) / sequences.length);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Active" value={active} accent="text-emerald-600" sub="in sequence" />
        <StatCard label="Paused" value={paused} accent="text-amber-600" sub="awaiting action" />
        <StatCard label="Finished / Exited" value={finished} accent="text-slate-500" />
        <StatCard label="Avg Open Rate" value={`${avgOpen}%`} accent="text-primary" sub="across sequences" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-label">All Enrollments</p>
          <span className="text-[9px] text-slate-400 font-label">{sequences.length} contacts</span>
        </div>
        <div className="divide-y divide-slate-50">
          {sequences.map(s => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors">
              <Avatar name={s.contactName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{s.contactName}</p>
                <p className="text-[10px] text-slate-400 truncate">{s.contactTitle} · {s.company}</p>
              </div>
              <div className="hidden md:block min-w-0 w-44">
                <p className="text-[10px] text-slate-600 font-medium truncate">{s.sequenceName}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex-1 bg-slate-100 rounded-full h-1">
                    <div className="bg-primary h-1 rounded-full" style={{ width: `${Math.round((s.currentStep / s.totalSteps) * 100)}%` }} />
                  </div>
                  <span className="text-[8px] text-slate-400 font-label shrink-0">Step {s.currentStep}/{s.totalSteps}</span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-3 text-[9px] text-slate-400 font-label">
                <span>Open {s.openRate}%</span>
                {s.nextStepAt && <span className="flex items-center gap-0.5"><Clock size={9} /> {s.nextStepAt}</span>}
              </div>
              <Badge label={s.status} className={SEQ_STATUS[s.status]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tasks tab ────────────────────────────────────────────────────────────────

function TasksTab() {
  const dueToday = tasks.filter(t => t.status === 'Due Today').length;
  const overdue  = tasks.filter(t => t.status === 'Overdue').length;
  const upcoming = tasks.filter(t => t.status === 'Upcoming').length;
  const completed = tasks.filter(t => t.status === 'Completed').length;

  const priority: TaskStatus[] = ['Overdue', 'Due Today', 'Upcoming', 'Completed', 'Skipped'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Due Today"  value={dueToday}  accent="text-primary" />
        <StatCard label="Overdue"    value={overdue}   accent="text-red-600" sub="needs action" />
        <StatCard label="Upcoming"   value={upcoming}  accent="text-slate-500" />
        <StatCard label="Completed"  value={completed} accent="text-emerald-600" sub="this week" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-label">Task Queue</p>
        </div>
        <div className="divide-y divide-slate-50">
          {priority.flatMap(status => tasks.filter(t => t.status === status)).map(task => {
            const TypeIcon = TASK_TYPE_ICON[task.type] ?? Mail;
            return (
              <div key={task.id} className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                <div className={cn('mt-0.5 p-1.5 rounded-lg shrink-0', TASK_STATUS[task.status])}>
                  <TypeIcon size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{task.subject}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{task.contactName} · {task.company}</p>
                  <p className="text-[9px] text-slate-300 font-label mt-0.5">{task.sequenceName}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge label={task.status} className={TASK_STATUS[task.status]} />
                  <span className="text-[9px] text-slate-400 font-label flex items-center gap-0.5">
                    <Clock size={8} /> {task.dueAt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Calls tab ────────────────────────────────────────────────────────────────

function CallsTab() {
  const connected = calls.filter(c => c.disposition === 'Connected').length;
  const voicemail = calls.filter(c => c.disposition === 'Voicemail').length;
  const noAnswer  = calls.filter(c => c.disposition === 'No Answer').length;
  const connectRate = Math.round((connected / calls.length) * 100);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total Calls"    value={calls.length}     />
        <StatCard label="Connected"      value={connected}        accent="text-emerald-600" />
        <StatCard label="Voicemail"      value={voicemail}        accent="text-amber-600" />
        <StatCard label="Connect Rate"   value={`${connectRate}%`} accent="text-primary" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-label">Call Log</p>
        </div>
        <div className="divide-y divide-slate-50">
          {calls.map(call => (
            <div key={call.id} className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors">
              <Avatar name={call.contactName} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{call.contactName}</p>
                  <span className="text-[9px] text-slate-400">{call.contactTitle} · {call.company}</span>
                </div>
                {call.notes && (
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-snug">{call.notes}</p>
                )}
                <p className="text-[9px] text-slate-300 font-label mt-1">{call.sequenceName}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge label={call.disposition} className={CALL_DISPOSITION[call.disposition]} />
                <span className="text-[9px] text-slate-400 font-label">{call.calledAt}</span>
                {call.duration && (
                  <span className="text-[9px] text-slate-400 font-label flex items-center gap-0.5">
                    <Clock size={8} /> {call.duration}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Meetings tab ─────────────────────────────────────────────────────────────

function MeetingsTab() {
  const scheduled  = meetings.filter(m => m.status === 'Scheduled').length;
  const completed  = meetings.filter(m => m.status === 'Completed').length;
  const noShow     = meetings.filter(m => m.status === 'No Show').length;
  const showRate   = Math.round((completed / Math.max(completed + noShow, 1)) * 100);

  const order: MeetingStatus[] = ['Scheduled', 'Rescheduled', 'Completed', 'No Show'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Scheduled"  value={scheduled} accent="text-primary" sub="upcoming" />
        <StatCard label="Completed"  value={completed} accent="text-emerald-600" />
        <StatCard label="No Show"    value={noShow}    accent="text-red-600" />
        <StatCard label="Show Rate"  value={`${showRate}%`} accent="text-primary" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-label">Meeting Log</p>
        </div>
        <div className="divide-y divide-slate-50">
          {order.flatMap(status => meetings.filter(m => m.status === status)).map(meeting => (
            <div key={meeting.id} className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors">
              <Avatar name={meeting.contactName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{meeting.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{meeting.contactName} · {meeting.contactTitle} · {meeting.company}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-400 font-label flex items-center gap-0.5">
                    <Clock size={8} /> {meeting.scheduledAt}
                  </span>
                  <span className="text-[9px] text-slate-400 font-label">· {meeting.duration}</span>
                  <span className="text-[9px] text-slate-300 font-label">· via {meeting.source}</span>
                </div>
              </div>
              <Badge label={meeting.status} className={MEETING_STATUS[meeting.status]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Outbox tab ───────────────────────────────────────────────────────────────

function OutboxTab() {
  const scheduled = outboxEmails.filter(e => e.status === 'Scheduled').length;
  const sent      = outboxEmails.filter(e => e.status !== 'Scheduled').length;
  const opened    = outboxEmails.filter(e => ['Opened','Clicked','Replied'].includes(e.status)).length;
  const replied   = outboxEmails.filter(e => e.status === 'Replied').length;
  const openRate  = Math.round((opened / Math.max(sent, 1)) * 100);

  const order: EmailStatus[] = ['Scheduled', 'Replied', 'Clicked', 'Opened', 'Sent', 'Bounced', 'Failed'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Scheduled"  value={scheduled} accent="text-slate-600" sub="queued to send" />
        <StatCard label="Sent"       value={sent}       accent="text-blue-600" />
        <StatCard label="Open Rate"  value={`${openRate}%`} accent="text-cyan-600" />
        <StatCard label="Replies"    value={replied}    accent="text-emerald-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-label">Email Outbox</p>
        </div>
        <div className="divide-y divide-slate-50">
          {order.flatMap(status => outboxEmails.filter(e => e.status === status)).map(email => (
            <div key={email.id} className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors">
              <div className={cn('mt-0.5 p-1.5 rounded-lg shrink-0', EMAIL_STATUS[email.status])}>
                <Mail size={12} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{email.subject}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{email.to} · {email.contactTitle} · {email.company}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-300 font-label">{email.sequenceName} — Step {email.stepNumber}</span>
                  {email.openedAt && (
                    <span className="text-[9px] text-cyan-500 font-label">· Opened {email.openedAt}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge label={email.status} className={EMAIL_STATUS[email.status]} />
                <span className="text-[9px] text-slate-400 font-label">
                  {email.sentAt ?? email.scheduledAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SequenceActivity() {
  const [activeTab, setActiveTab] = React.useState<Tab>('dashboard');

  // Top-level KPIs
  const activeSeqs  = sequences.filter(s => s.status === 'Active').length;
  const tasksDue    = tasks.filter(t => t.status === 'Due Today' || t.status === 'Overdue').length;
  const mtgScheduled = meetings.filter(m => m.status === 'Scheduled').length;
  const emailsQueued = outboxEmails.filter(e => e.status === 'Scheduled').length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 shrink-0">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-xl font-black font-headline text-slate-900 leading-tight">Sequence Activity</h1>
            <p className="text-[11px] text-slate-400 font-label mt-0.5">Outreach sequences, tasks, calls, meetings & email outbox</p>
          </div>
          {/* KPI pill row */}
          <div className="flex items-center gap-3">
            {[
              { label: 'Active Seqs',    value: activeSeqs,   color: 'text-emerald-600' },
              { label: 'Tasks Due',      value: tasksDue,     color: tasksDue > 0 ? 'text-red-600' : 'text-slate-400' },
              { label: 'Meetings Set',   value: mtgScheduled, color: 'text-primary' },
              { label: 'Emails Queued',  value: emailsQueued, color: 'text-blue-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <span className={cn('text-lg font-black font-headline leading-none', color)}>{value}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 font-label mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            const count = tab.count();
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest font-label transition-all',
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
                )}
              >
                <Icon size={12} />
                {tab.label}
                {count > 0 && tab.id !== 'dashboard' && (
                  <span className={cn('px-1.5 py-0.5 rounded-full text-[8px] font-black',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {activeTab === 'dashboard'  && <DashboardTab />}
        {activeTab === 'sequences' && <SequencesTab />}
        {activeTab === 'tasks'     && <TasksTab />}
        {activeTab === 'calls'     && <CallsTab />}
        {activeTab === 'meetings'  && <MeetingsTab />}
        {activeTab === 'outbox'    && <OutboxTab />}
      </div>
    </div>
  );
}
