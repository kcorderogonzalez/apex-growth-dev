import { AgentMemory, AdminConstraints, AdminConstraintEntry, MemoryEntry, TerritoryPrefs, SequencingPrefs, HunterPrefs, OutreachPrefs } from '../types';

export const APP_VERSION = '1.0.0';

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const defaultTerritory: TerritoryPrefs = {
  targetIndustries: [],
  excludedIndustries: [],
  excludeActiveOpportunities: false,
  onlyProspects: false,
  customExclusions: [],
};

export const defaultSequencing: SequencingPrefs = {
  requireReviewForTitles: [],
  autonomousForTitles: [],
  defaultMode: 'selective',
  maxDailyAutonomousEmails: 25,
};

export const defaultHunter: HunterPrefs = {
  preferredChannel: 'email',
  outreachTone: 'consultative',
  focusOnChampions: true,
  avoidColdTitles: [],
};

export const defaultOutreach: OutreachPrefs = {
  tone: 'consultative',
  maxEmailLength: 'medium',
  preferredCTA: '15-minute call',
};

export function createDefaultMemory(userId: string): AgentMemory {
  return {
    userId,
    appVersion: APP_VERSION,
    lastUpdated: new Date().toISOString(),
    entries: [],
    territory: { ...defaultTerritory },
    sequencing: { ...defaultSequencing },
    hunter: { ...defaultHunter },
    outreach: { ...defaultOutreach },
  };
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const memoryKey = (userId: string) => `agentMemory_${userId}`;
const ADMIN_KEY = 'adminConstraints_apex';

export function loadMemory(userId: string): { memory: AgentMemory; versionConflict: boolean } {
  try {
    const raw = localStorage.getItem(memoryKey(userId));
    if (!raw) return { memory: createDefaultMemory(userId), versionConflict: false };
    const parsed = JSON.parse(raw) as AgentMemory;
    const versionConflict = parsed.appVersion !== APP_VERSION;
    return { memory: { ...createDefaultMemory(userId), ...parsed }, versionConflict };
  } catch {
    return { memory: createDefaultMemory(userId), versionConflict: false };
  }
}

export function saveMemory(memory: AgentMemory): void {
  const updated: AgentMemory = { ...memory, lastUpdated: new Date().toISOString(), appVersion: APP_VERSION };
  localStorage.setItem(memoryKey(memory.userId), JSON.stringify(updated));
}

export function loadAdminConstraints(): AdminConstraints {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return defaultAdminConstraints();
    return JSON.parse(raw) as AdminConstraints;
  } catch {
    return defaultAdminConstraints();
  }
}

export function saveAdminConstraints(constraints: AdminConstraints): void {
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ ...constraints, lastUpdated: new Date().toISOString() }));
}

function defaultAdminConstraints(): AdminConstraints {
  return {
    configuredBy: 'Sales Ops Admin',
    lastUpdated: new Date().toISOString(),
    params: [
      { paramPath: 'sequencing.maxDailyAutonomousEmails', locked: false, reason: '', category: 'sequencing', displayName: 'Max daily autonomous emails' },
      { paramPath: 'sequencing.defaultMode', locked: false, reason: '', category: 'sequencing', displayName: 'Default automation mode' },
      { paramPath: 'territory.excludeActiveOpportunities', locked: false, reason: '', category: 'territory', displayName: 'Exclude active opportunities' },
      { paramPath: 'territory.minEmployeeCount', locked: false, reason: '', category: 'territory', displayName: 'Minimum account size (employees)' },
      { paramPath: 'hunter.outreachTone', locked: false, reason: '', category: 'hunter', displayName: 'Outreach tone' },
      { paramPath: 'outreach.maxEmailLength', locked: false, reason: '', category: 'outreach', displayName: 'Max email length' },
    ],
  };
}

// ─── Merge utility ────────────────────────────────────────────────────────────

export function applyChanges(memory: AgentMemory, changes: Record<string, unknown>): AgentMemory {
  const updated = JSON.parse(JSON.stringify(memory)) as AgentMemory;
  for (const [path, value] of Object.entries(changes)) {
    const parts = path.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      const s = section as keyof Pick<AgentMemory, 'territory' | 'sequencing' | 'hunter' | 'outreach'>;
      if (s in updated && (typeof (updated[s] as unknown as Record<string, unknown>)[field] !== 'undefined' || value !== undefined)) {
        (updated[s] as unknown as Record<string, unknown>)[field] = value;
      }
    }
  }
  return updated;
}

export function isParamLocked(paramPath: string, constraints: AdminConstraints): AdminConstraintEntry | null {
  return constraints.params.find(p => p.paramPath === paramPath && p.locked) ?? null;
}

// ─── Human-readable summary ───────────────────────────────────────────────────

export function memoryToContextSummary(memory: AgentMemory): string {
  const lines: string[] = [];

  if (memory.territory.targetIndustries.length > 0)
    lines.push(`Target industries: ${memory.territory.targetIndustries.join(', ')}`);
  if (memory.territory.excludedIndustries.length > 0)
    lines.push(`Excluded industries: ${memory.territory.excludedIndustries.join(', ')}`);
  if (memory.territory.minEmployeeCount)
    lines.push(`Minimum account size: ${memory.territory.minEmployeeCount.toLocaleString()} employees`);
  if (memory.territory.excludeActiveOpportunities)
    lines.push('Exclude accounts with active open opportunities');
  if (memory.territory.onlyProspects)
    lines.push('Show prospects only (exclude existing customers)');
  if (memory.sequencing.requireReviewForTitles.length > 0)
    lines.push(`Always require review for: ${memory.sequencing.requireReviewForTitles.join(', ')}`);
  if (memory.sequencing.defaultMode !== 'selective')
    lines.push(`Sequencing mode: ${memory.sequencing.defaultMode}`);
  lines.push(`Preferred outreach channel: ${memory.hunter.preferredChannel}`);
  lines.push(`Outreach tone: ${memory.hunter.outreachTone}`);
  if (memory.hunter.avoidColdTitles.length > 0)
    lines.push(`Avoid cold outreach to: ${memory.hunter.avoidColdTitles.join(', ')}`);

  return lines.length > 0 ? lines.join('\n') : 'No preferences configured yet.';
}
