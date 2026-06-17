import React from 'react';
import { Stars, Sparkles, RefreshCw } from 'lucide-react';
import { Account } from '@/src/types';
import { useDemoData } from '@/src/context/DemoDataContext';
import { useAuth } from '@/src/context/AuthContext';
import PanelShell from './PanelShell';
import InboundLeadsPanel from './InboundLeadsPanel';
import OutboundProspectingPanel from './OutboundProspectingPanel';
import InlineMetricsPanel from './InlineMetricsPanel';
import PgSeqDrawer, { PgSeqContext } from './PgSeqDrawer';

// ─── Persistence ──────────────────────────────────────────────────────────────

type PanelId = 'inbound' | 'outbound';
type CollapseState = Record<PanelId, boolean>;

const COLLAPSE_KEY = 'pg_panel_collapse';
const REVIEWED_KEY = 'pg_reviewed_items';

function loadCollapse(): CollapseState {
  try {
    const raw = localStorage.getItem(COLLAPSE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { inbound: p.inbound ?? false, outbound: p.outbound ?? false };
    }
  } catch {}
  return { inbound: false, outbound: false };
}

function saveCollapse(state: CollapseState) {
  localStorage.setItem(COLLAPSE_KEY, JSON.stringify(state));
}

function loadReviewed(): Set<string> {
  try {
    const raw = localStorage.getItem(REVIEWED_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveReviewed(ids: Set<string>) {
  localStorage.setItem(REVIEWED_KEY, JSON.stringify([...ids]));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PipelineGenScreenProps {
  onLaunchHunter: (account: Account) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PipelineGenScreen({ onLaunchHunter }: PipelineGenScreenProps) {
  const { user } = useAuth();
  const { asPicks, refreshDemo } = useDemoData();
  const picks = asPicks();

  const [collapsed, setCollapsed] = React.useState<CollapseState>(loadCollapse);
  const [reviewedIds, setReviewedIds] = React.useState<Set<string>>(loadReviewed);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshDemo();
    setReviewedIds(new Set());
    localStorage.removeItem(REVIEWED_KEY);
    setTimeout(() => setRefreshing(false), 600);
  };
  const [pgSeqCtx, setPgSeqCtx] = React.useState<PgSeqContext | null>(null);

  const togglePanel = (id: PanelId) => {
    setCollapsed(prev => {
      const next = { ...prev, [id]: !prev[id] };
      saveCollapse(next);
      return next;
    });
  };

  const markReviewed = (id: string) => {
    setReviewedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveReviewed(next);
      return next;
    });
  };

  const outboundBadge = picks.filter(p => !reviewedIds.has(p.id)).length;

  return (
    <>
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {/* ── Top: Metrics bar ── */}
        <InlineMetricsPanel />

        {/* ── Panel toolbar ── */}
        <div className="flex items-center justify-end px-4 py-1.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest font-label text-slate-500 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
            Refresh Demo Data
          </button>
        </div>

        {/* ── Bottom: Inbound + Outbound panels ── */}
        <div className="flex flex-1 overflow-hidden">
          <PanelShell
            title="Inbound Leads"
            icon={Stars}
            collapsed={collapsed.inbound}
            onToggle={() => togglePanel('inbound')}
            accentColor="text-tertiary"
          >
            <InboundLeadsPanel
              userTerritory={user?.territory ?? undefined}
              reviewedIds={reviewedIds}
              onMarkReviewed={markReviewed}
              onStartSequence={ctx => setPgSeqCtx(ctx)}
              onLaunchHunter={onLaunchHunter}
            />
          </PanelShell>

          <PanelShell
            title="Outbound Prospecting"
            icon={Sparkles}
            badge={outboundBadge}
            collapsed={collapsed.outbound}
            onToggle={() => togglePanel('outbound')}
            accentColor="text-primary"
          >
            <OutboundProspectingPanel
              picks={picks}
              reviewedIds={reviewedIds}
              onMarkReviewed={markReviewed}
              onStartSequence={ctx => setPgSeqCtx(ctx)}
              onLaunchHunter={onLaunchHunter}
            />
          </PanelShell>
        </div>
      </div>

      <PgSeqDrawer
        context={pgSeqCtx}
        onClose={() => setPgSeqCtx(null)}
        onMarkSent={markReviewed}
      />
    </>
  );
}
