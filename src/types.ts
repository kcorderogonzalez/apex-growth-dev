export type View = 'pipeline' | 'deals' | 'quotes' | 'accounts' | 'manager-insights' | 'meetings' | 'memory' | 'users' | 'memory-library';

// ─── Agent Memory ─────────────────────────────────────────────────────────────

export type MemoryCategory = 'territory' | 'sequencing' | 'hunter' | 'outreach' | 'general';

export interface MemoryEntry {
  id: string;
  originalText: string;
  confirmedRule: string;
  category: MemoryCategory;
  changes: Record<string, unknown>;
  createdAt: string;
  active: boolean;
}

export interface TerritoryPrefs {
  minEmployeeCount?: number;
  maxEmployeeCount?: number;
  targetIndustries: string[];
  excludedIndustries: string[];
  excludeActiveOpportunities: boolean;
  onlyProspects: boolean;
  customExclusions: string[];
}

export interface SequencingPrefs {
  requireReviewForTitles: string[];
  autonomousForTitles: string[];
  requireReviewAboveEmployeeCount?: number;
  defaultMode: 'autonomous' | 'review_all' | 'selective';
  maxDailyAutonomousEmails: number;
}

export interface HunterPrefs {
  preferredChannel: 'email' | 'linkedin' | 'phone';
  outreachTone: 'formal' | 'casual' | 'consultative';
  focusOnChampions: boolean;
  avoidColdTitles: string[];
}

export interface OutreachPrefs {
  tone: 'formal' | 'casual' | 'consultative';
  maxEmailLength: 'short' | 'medium' | 'long';
  preferredCTA: string;
  signatureNote?: string;
}

export interface AgentMemory {
  userId: string;
  appVersion: string;
  lastUpdated: string;
  entries: MemoryEntry[];
  territory: TerritoryPrefs;
  sequencing: SequencingPrefs;
  hunter: HunterPrefs;
  outreach: OutreachPrefs;
}

export interface AdminConstraintEntry {
  paramPath: string;
  locked: boolean;
  lockedValue?: unknown;
  reason: string;
  category: MemoryCategory;
  displayName: string;
}

export interface AdminConstraints {
  configuredBy: string;
  lastUpdated: string;
  params: AdminConstraintEntry[];
}

export interface Meeting {
  id: string;
  person: string;
  company: string;
  contactId: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Attended' | 'Canceled';
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  role: string;
  company: string;
  score: number;
  tags: string[];
  source: string;
  message: string;
  initials: string;
  receivedAt?: string; // human-readable freshness label, e.g. "4 min ago", "Yesterday 2:15 PM"
}

export interface Signal {
  id: string;
  name: string;
  role: string;
  company: string;
  type: 'funding' | 'interest' | 'hire';
  value?: string;
  initials: string;
}

export interface HunterPick {
  id: string;
  name: string;
  company: string;
  urgency: string;
  signal: string;
  draft: string;
  time: string;
  lastContact: string;
  type: 'funding' | 'interest' | 'hire' | 'nurture' | 'expansion';
}

export interface Quote {
  id: string;
  name: string;
  status: 'sent' | 'pending' | 'draft';
  value: number;
  client: string;
  ftrAccuracy: boolean; // First-Time-Right
  simplificationIndex: number; // 0-100
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  isLegacy?: boolean;
}

export interface ProductAttribute {
  id: string;
  name: string;
  type: 'number' | 'select' | 'multi-select';
  options?: string[];
  value: any;
}

export interface Account {
  id: string;
  name: string;
  type: 'Customer' | 'Prospect';
  arr: number;
  healthScore: number;
  industry: string;
  tier: string;
  territory: string;
}

export interface AccountEvent {
  id: string;
  accountId: string;
  accountName?: string;
  type: 'telemetry' | 'support' | 'cs' | 'marketing';
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface MedPicc {
  metrics: string;
  economicBuyer: string;
  decisionCriteria: string;
  decisionProcess: string;
  identifyPain: string;
  champion: string;
  competition: string;
}

export interface Persona {
  name: string;
  role: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  engagement: number; // 0-100
}

export interface Deal {
  id: string;
  name: string;
  accountName: string;
  value: number;
  type: string;
  status: 'healthy' | 'stalled' | 'on-track';
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closing';
  closeDate: string;
  nextStep?: string;
  stalledDays?: number;
  lastStageChangeDate: string; // ISO date
  povSuccess: boolean;
  validated: boolean; // System-validated vs Gut-feel
  medpicc?: MedPicc;
  personas?: Persona[];
  territory?: string;
  rep?: string;
}

export interface RepPerformance {
  id: string;
  name: string;
  meetings: number;
  povs: number;
  technicalWinRate: number; // %
  bookings: number;
  quota: number;
  efficiencyVariance: number; // %
  status: 'Effective' | 'Ineffective' | 'At Risk';
}

export interface GlobalMetrics {
  sellingTimeReclaimed: number; // %
  ftrAccuracy: number; // %
  pipelineFidelity: number; // %
  renewalEfficiency: number; // %
}

// ─── Hunter Research Types ────────────────────────────────────────────────────

export type ConfidenceTier = 'Verified' | 'High Confidence' | 'Low Confidence' | 'Unverified';

export interface HunterResearchItem {
  id: number;
  title: string;
  summary: string;
  detail: string;
  dataPoints?: string[];
  sources: Array<{ name: string; date: string }>;
  confidence: ConfidenceTier;
  available: boolean;
}

export interface HunterRecommendedEntry {
  contact_name: string;
  contact_title: string;
  channel: 'email' | 'linkedin' | 'phone';
  rationale: string;
  draft_message: string;
}

export interface HunterResearchResult {
  items: HunterResearchItem[];
  recommended_entry: HunterRecommendedEntry;
}

export interface HunterChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  draftMessage?: string;
  draftContact?: string;
}

// ─── Contact ──────────────────────────────────────────────────────────────────

// ─── Memory Library ───────────────────────────────────────────────────────────

export interface AgentRegistryEntry {
  intent_key: string;
  display_name: string;
  description: string;
  is_active: boolean;
  is_targetable: boolean;
}

export interface MemoryVersion {
  id: string;
  memory_id: string;
  version_number: number;
  content: string;
  change_summary: string | null;
  authored_by: string | null;
  authored_at: string;
  is_current: boolean;
  author_name?: string;
}

export interface Memory {
  id: string;
  name: string;
  description: string;
  department: 'Sales Ops' | 'Sales Engineering' | 'Marketing' | 'Product Marketing' | 'Other';
  target_agents: string[];
  status: 'Draft' | 'Published' | 'Archived';
  current_version_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  current_version?: MemoryVersion;
  creator_name?: string;
}

// ─── Inbound Lead (processed) ─────────────────────────────────────────────────

export interface ProcessedInboundLead {
  id: string;
  source: string;
  source_detail: string | null;
  captured_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  company_size: string | null;
  industry: string | null;
  hq_city: string | null;
  hq_state: string | null;
  hq_country: string;
  annual_revenue: number | null;
  message: string | null;
  product_interest: string | null;
  data_quality_score: number;
  lead_tier: string;
  is_duplicate: boolean;
  is_competitor: boolean;
  processing_status: string;
  processed: boolean;
  processed_at: string | null;
  assigned_territory: string | null;
  assigned_to_role: string | null;
  routing_queue: string | null;
  contact_validated: boolean;
  is_existing_customer: boolean;
  persona_tier: string | null;
  intent_signal: string | null;
  priority_score: number | null;
  recommended_action: string | null;
  campaign_sequence: string | null;
  sdr_ready_notes: string | null;
  agent_notes: string | null;
  created_at: string;
}

export interface InboundLeadStats {
  pending: number;
  primary: number;
  rsm: number;
  needs_resolution: number;
  low_quality: number;
  disqualified: number;
  total_processed: number;
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  accountId: string;
  accountName: string;
  email: string;
  phone: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}
