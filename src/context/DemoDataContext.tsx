import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { allInboundLeads as inboundLeads, allLeadPool as leadPool, allOutboundPicks as priorityOutreachPicks, allDormantPicks as dormantPicks, InboundLead, PriorityOutreachPick } from '@/src/data/crmData';
import { Lead, HunterPick } from '@/src/types';
import { useVisibleData } from '@/src/hooks/useVisibleData';

// ─── Freshness labels ─────────────────────────────────────────────────────────

// Labels used for the "today" cohort of refreshed leads (5-6 leads)
const TODAY_LABELS = [
  'Just now', '1 min ago', '3 min ago', '7 min ago', '12 min ago',
  '18 min ago', '31 min ago', '47 min ago', '1h ago', '2h ago',
];

// Labels used for the "yesterday" cohort (4-5 leads)
const YESTERDAY_LABELS = [
  'Yesterday 8:04 AM', 'Yesterday 9:30 AM', 'Yesterday 11:17 AM',
  'Yesterday 1:45 PM', 'Yesterday 3:22 PM', 'Yesterday 4:51 PM',
  'Yesterday 6:10 PM',
];

// Outbound picks originated today
const OUTBOUND_TODAY_LABELS = [
  'Just now', '8 min ago', '22 min ago', '41 min ago', '1h 15m ago',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRefreshedLeads(pool?: InboundLead[]): InboundLead[] {
  const pool_ = shuffle(pool ?? inboundLeads).slice(0, 10);
  const todayCount = 5 + Math.floor(Math.random() * 2); // 5 or 6
  return pool_.map((lead, i) => ({
    ...lead,
    id: `${lead.id}-r${Date.now()}-${i}`, // unique id so reviewed state resets
    _receivedAt: i < todayCount
      ? TODAY_LABELS[i % TODAY_LABELS.length]
      : YESTERDAY_LABELS[(i - todayCount) % YESTERDAY_LABELS.length],
  } as InboundLead & { _receivedAt: string }));
}

function buildRefreshedPicks(pool?: PriorityOutreachPick[]): PriorityOutreachPick[] {
  return shuffle(pool ?? priorityOutreachPicks)
    .slice(0, 5)
    .map((pick, i) => ({
      ...pick,
      id: `${pick.id}-r${Date.now()}-${i}`,
      daysAgo: 0,
      lastContact: pick.lastContact,
      _receivedAt: OUTBOUND_TODAY_LABELS[i],
    } as PriorityOutreachPick & { _receivedAt: string }));
}

// ─── Shape ────────────────────────────────────────────────────────────────────

interface DemoState {
  leads: (InboundLead & { _receivedAt?: string })[];
  picks: (PriorityOutreachPick & { _receivedAt?: string })[];
  leadPoolIndex: number;
  dormantPoolIndex: number;
  lastEvent: DemoEvent | null;
}

export type DemoEventType = 'new_lead' | 'new_pick' | 'revival' | 'intent_signal' | 'refresh';

export interface DemoEvent {
  type: DemoEventType;
  label: string;
  detail: string;
  timestamp: number;
}

type Action =
  | { type: 'ADD_LEAD'; lead: InboundLead }
  | { type: 'REVIVE_CONTACT'; pickId: string }
  | { type: 'REFRESH_DEMO'; pool?: InboundLead[]; picksPool?: PriorityOutreachPick[] }
  | { type: 'CLEAR_EVENT' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'ADD_LEAD': {
      const nextIdx = (state.leadPoolIndex + 1) % leadPool.length;
      return {
        ...state,
        leads: [action.lead, ...state.leads],
        leadPoolIndex: nextIdx,
        lastEvent: {
          type: 'new_lead',
          label: 'New Inbound Lead',
          detail: `${action.lead.firstName} ${action.lead.lastName} from ${action.lead.company}`,
          timestamp: Date.now(),
        },
      };
    }
    case 'REVIVE_CONTACT': {
      const dormant = dormantPicks.find(p => p.id === action.pickId);
      if (!dormant) return state;
      const revived: PriorityOutreachPick = {
        ...dormant,
        status: 'Active',
        signalType: 'nurture',
        signalLabel: 'Re-Engaged · Opened Sequence Email',
        urgency: 'Re-Engagement',
        daysAgo: 0,
        lastContact: 'Today',
      };
      const nextIdx = (state.dormantPoolIndex + 1) % dormantPicks.length;
      return {
        ...state,
        picks: [revived, ...state.picks],
        dormantPoolIndex: nextIdx,
        lastEvent: {
          type: 'revival',
          label: 'Contact Revived',
          detail: `${revived.contactName} at ${revived.company} re-engaged`,
          timestamp: Date.now(),
        },
      };
    }
    case 'REFRESH_DEMO': {
      const freshLeads = buildRefreshedLeads(action.pool);
      const freshPicks = buildRefreshedPicks(action.picksPool);
      return {
        ...state,
        leads: freshLeads,
        picks: freshPicks,
        leadPoolIndex: 0,
        dormantPoolIndex: 0,
        lastEvent: {
          type: 'refresh',
          label: 'Demo Refreshed',
          detail: `${freshLeads.length} new leads · ${freshPicks.length} outbound prospects`,
          timestamp: Date.now(),
        },
      };
    }
    case 'CLEAR_EVENT':
      return { ...state, lastEvent: null };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface DemoContextValue {
  state: DemoState;
  generateNewLead: () => void;
  reviveContact: () => void;
  refreshDemo: () => void;
  clearEvent: () => void;
  asLeads: () => Lead[];
  asPicks: () => HunterPick[];
  nextDormantPick: () => PriorityOutreachPick | null;
}

const DemoDataContext = createContext<DemoContextValue | null>(null);

// ─── Adapters ─────────────────────────────────────────────────────────────────

function toUiLead(l: InboundLead & { _receivedAt?: string }): Lead {
  return {
    id: l.id,
    name: `${l.firstName} ${l.lastName}`,
    role: l.title,
    company: l.company,
    score: l.leadScore,
    tags: l.tags,
    source: l.leadSource,
    message: l.notes,
    initials: l.initials,
    receivedAt: l._receivedAt,
  };
}

function toUiPick(p: PriorityOutreachPick & { _receivedAt?: string }): HunterPick {
  const timeLabel = p._receivedAt ?? (p.daysAgo === 0 ? 'Just now' : `${p.daysAgo}d ago`);
  return {
    id: p.id,
    name: p.contactName,
    title: p.contactTitle,
    company: p.company,
    urgency: p.urgency,
    signal: p.signalLabel,
    draft: p.draftOpener,
    time: timeLabel,
    lastContact: p.lastContact,
    type: p.signalType as HunterPick['type'],
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DemoDataProvider({ children }: { children: React.ReactNode }) {
  const { visibleInboundLeads, visibleOutboundPicks } = useVisibleData();

  const initialLeads = useMemo(() => visibleInboundLeads, [visibleInboundLeads]);
  const initialPicks = useMemo(() => visibleOutboundPicks, [visibleOutboundPicks]);

  const [state, dispatch] = useReducer(reducer, {
    leads: initialLeads,
    picks: initialPicks,
    leadPoolIndex: 0,
    dormantPoolIndex: 0,
    lastEvent: null,
  });

  // Re-sync state when territory changes (login-as switch)
  const prevTerritoryRef = React.useRef<string | null | undefined>(undefined);
  React.useEffect(() => {
    const key = initialLeads.length + ':' + initialPicks.length;
    if (prevTerritoryRef.current !== key) {
      prevTerritoryRef.current = key;
      dispatch({ type: 'REFRESH_DEMO', pool: initialLeads, picksPool: initialPicks });
    }
  }, [initialLeads, initialPicks]);

  const generateNewLead = useCallback(() => {
    const lead = leadPool[state.leadPoolIndex];
    dispatch({ type: 'ADD_LEAD', lead });
  }, [state.leadPoolIndex]);

  const reviveContact = useCallback(() => {
    const dormant = dormantPicks[state.dormantPoolIndex];
    if (dormant) dispatch({ type: 'REVIVE_CONTACT', pickId: dormant.id });
  }, [state.dormantPoolIndex]);

  const refreshDemo = useCallback(
    () => dispatch({ type: 'REFRESH_DEMO', pool: initialLeads, picksPool: initialPicks }),
    [initialLeads, initialPicks],
  );

  const clearEvent = useCallback(() => dispatch({ type: 'CLEAR_EVENT' }), []);

  const asLeads = useCallback(() => state.leads.map(toUiLead), [state.leads]);
  const asPicks = useCallback(() => state.picks.map(toUiPick), [state.picks]);

  const nextDormantPick = useCallback(
    () => dormantPicks[state.dormantPoolIndex] ?? null,
    [state.dormantPoolIndex],
  );

  return (
    <DemoDataContext.Provider value={{ state, generateNewLead, reviveContact, refreshDemo, clearEvent, asLeads, asPicks, nextDormantPick }}>
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const ctx = useContext(DemoDataContext);
  if (!ctx) throw new Error('useDemoData must be used inside DemoDataProvider');
  return ctx;
}
