export type OppStage =
  | 'ss1_pipeline_generation'
  | 'ss2_new_business_meeting'
  | 'ss3_qualification'
  | 'ss4_solution_validation'
  | 'ss5_proposal_negotiation'
  | 'ss6_purchasing'
  | 'ss7_po_received'
  | 'closed_won'
  | 'closed_lost';

export interface MAPItem {
  id: string;
  milestone: string;
  owner: string;      // rep | customer
  ownerName: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'complete' | 'overdue';
  notes?: string;
}

export interface Stakeholder {
  name: string;
  title: string;
  role: 'economic_buyer' | 'champion' | 'technical_evaluator' | 'user' | 'blocker' | 'coach';
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
}

export interface ClosePlan {
  executiveSummary: string;
  meddpicc: {
    metrics: string;
    economicBuyer: string;
    decisionCriteria: string;
    decisionProcess: string;
    paperProcess: string;
    identifyPain: string;
    champion: string;
    competition: string;
  };
  map: MAPItem[];
  stakeholders: Stakeholder[];
  risks: { risk: string; mitigation: string; severity: 'high' | 'medium' | 'low' }[];
  competitorNotes: string;
  whyNetskope: string;
}

export interface Opportunity {
  id: string;
  name: string;
  accountName: string;
  arrValue: number;          // Annual Recurring Revenue
  type: 'New Business' | 'Expansion' | 'Renewal' | 'Upsell';
  stage: OppStage;
  probability: number;       // 0–100
  closeDate: string;
  nextStep: string;
  daysInStage: number;
  territory: string;
  rep: string;
  product: string;
  status: 'healthy' | 'at_risk' | 'stalled';
  closePlan?: ClosePlan;
}

// ─── Stage metadata ───────────────────────────────────────────────────────────

export const STAGES: { id: OppStage; label: string; code: string; probability: number; color: string; bg: string; border: string }[] = [
  { id: 'ss1_pipeline_generation',  label: 'Pipeline Generation',      code: 'SS1', probability: 10,  color: 'text-slate-600',   bg: 'bg-slate-100',   border: 'border-slate-300'   },
  { id: 'ss2_new_business_meeting', label: 'New Business Meeting',     code: 'SS2', probability: 25,  color: 'text-violet-700',  bg: 'bg-violet-50',   border: 'border-violet-200'  },
  { id: 'ss3_qualification',        label: 'Qualification',            code: 'SS3', probability: 40,  color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200'    },
  { id: 'ss4_solution_validation',  label: 'Solution Validation',      code: 'SS4', probability: 55,  color: 'text-cyan-700',    bg: 'bg-cyan-50',     border: 'border-cyan-200'    },
  { id: 'ss5_proposal_negotiation', label: 'Proposal & Negotiation',   code: 'SS5', probability: 70,  color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'   },
  { id: 'ss6_purchasing',           label: 'Purchasing',               code: 'SS6', probability: 85,  color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200'  },
  { id: 'ss7_po_received',          label: 'PO Received',              code: 'SS7', probability: 100, color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  { id: 'closed_won',               label: 'Closed Won',               code: 'WON', probability: 100, color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  { id: 'closed_lost',              label: 'Closed Lost',              code: 'LST', probability: 0,   color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200'     },
];

export const ACTIVE_STAGES = STAGES.filter(s => s.id !== 'closed_won' && s.id !== 'closed_lost');

// ─── Mock opportunity data ────────────────────────────────────────────────────

export const opportunities: Opportunity[] = [
  {
    id: 'opp-001',
    name: 'Apex Financial Group — SSE Platform',
    accountName: 'Apex Financial Group',
    arrValue: 840_000,
    type: 'New Business',
    stage: 'ss6_purchasing',
    probability: 85,
    closeDate: '2026-06-30',
    nextStep: 'Legal review of MSA — expect back by June 27',
    daysInStage: 8,
    territory: 'Northeast',
    rep: 'Elena Martinez',
    product: 'SSE Platform',
    status: 'healthy',
    closePlan: {
      executiveSummary: 'Apex Financial Group ($8.5B AUM) is replacing their legacy Cisco Umbrella + Zscaler stack with Netskope SSE. Executive sponsor is CISO Robert Chang. Deal is in Commit — MSA in legal review, PO expected by June 30.',
      meddpicc: {
        metrics: 'Reduce security incident response time by 60%; eliminate VPN client for 12,000 users; achieve SOC 2 Type II compliance by Q4 2026.',
        economicBuyer: 'Robert Chang, CISO — confirmed budget of $840K ARR. CFO sign-off obtained for multi-year deal.',
        decisionCriteria: 'CASB coverage for M365 + Google Workspace, ZTNA replacing GlobalProtect, inline DLP, FedRAMP readiness.',
        decisionProcess: 'CISO recommends → CTO signs → Procurement issues PO. Legal review of MSA in progress.',
        paperProcess: 'MSA sent to legal June 20. Standard 10-day legal review. PO issued within 5 business days of MSA execution.',
        identifyPain: 'Three data exfiltration incidents in 2025. Board mandate for Zero Trust by Q3. Legacy VPN causing productivity loss for remote workforce.',
        champion: 'Kevin Nakamura, Director of Cybersecurity — ran the evaluation, strong internal advocate. Presented Netskope to CISO.',
        competition: 'Zscaler (incumbent for internet gateway) was shortlisted but lost on DLP capability. Palo Alto Prisma evaluated but eliminated on pricing.',
      },
      stakeholders: [
        { name: 'Robert Chang', title: 'CISO', role: 'economic_buyer', sentiment: 'positive' },
        { name: 'Kevin Nakamura', title: 'Director of Cybersecurity', role: 'champion', sentiment: 'positive' },
        { name: 'Sarah Goldstein', title: 'CTO', role: 'technical_evaluator', sentiment: 'neutral' },
        { name: 'James Holt', title: 'VP Procurement', role: 'user', sentiment: 'neutral' },
      ],
      map: [
        { id: 'm1', milestone: 'MSA legal review complete', owner: 'customer', ownerName: 'James Holt (Legal)', dueDate: '2026-06-27', status: 'in_progress' },
        { id: 'm2', milestone: 'MSA executed (both signatures)', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-06-28', status: 'pending' },
        { id: 'm3', milestone: 'PO issued by Procurement', owner: 'customer', ownerName: 'James Holt', dueDate: '2026-06-30', status: 'pending' },
        { id: 'm4', milestone: 'Kickoff call scheduled', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-07', status: 'pending' },
        { id: 'm5', milestone: 'Onboarding begins', owner: 'rep', ownerName: 'SE Team', dueDate: '2026-07-14', status: 'pending' },
        { id: 'm6', milestone: 'POC environment decommissioned', owner: 'customer', ownerName: 'Kevin Nakamura', dueDate: '2026-06-25', status: 'complete' },
        { id: 'm7', milestone: 'Security review approved by CISO', owner: 'customer', ownerName: 'Robert Chang', dueDate: '2026-06-18', status: 'complete' },
      ],
      risks: [
        { risk: 'Legal review extends past June 27', mitigation: 'Escalate to CISO if legal delays — Robert has committed to June 30 PO', severity: 'medium' },
        { risk: 'Procurement requests additional vendor bids', mitigation: 'Robert Chang has locked sole-source — document via email', severity: 'low' },
      ],
      competitorNotes: 'Zscaler lost on DLP depth and M365 coverage. Palo Alto eliminated on TCO — 40% more expensive at 3-year. No active competitor at this stage.',
      whyNetskope: 'Best-in-class CASB for M365 + Google, inline DLP with OCR, superior ZTNA client experience. FedRAMP High roadmap aligns with their compliance requirements.',
    },
  },
  {
    id: 'opp-002',
    name: 'BlueCross Digital Health — SASE Full Platform',
    accountName: 'BlueCross Digital Health',
    arrValue: 1_200_000,
    type: 'New Business',
    stage: 'ss5_proposal_negotiation',
    probability: 70,
    closeDate: '2026-07-31',
    nextStep: 'Commercial negotiation call with VP Procurement — July 2',
    daysInStage: 14,
    territory: 'Midwest',
    rep: 'Elena Martinez',
    product: 'SASE Platform',
    status: 'healthy',
    closePlan: {
      executiveSummary: 'BlueCross Digital Health ($5.7B) replacing their existing Symantec SWG + Cisco AnyConnect stack. Full SASE platform deal. Melissa Harrington (VP InfoSec) is champion and economic buyer. In negotiation on pricing — 15% discount requested.',
      meddpicc: {
        metrics: 'Consolidate 4 security vendors into 1; reduce security opex by 35%; achieve HIPAA audit readiness by Q1 2027.',
        economicBuyer: 'Melissa Harrington, VP Information Security — $1.2M ARR budget approved by CFO.',
        decisionCriteria: 'HIPAA-compliant DLP, PHI data protection, SWG + CASB + ZTNA in single platform, 24/7 SOC support.',
        decisionProcess: 'VP InfoSec selects → CIO approves → Finance issues PO.',
        paperProcess: 'Netskope standard agreement. 20-day legal review expected. NET-30 payment terms.',
        identifyPain: 'HIPAA audit in 2025 flagged PHI data moving to unsanctioned cloud apps. 3 separate vendor contracts expiring Q3 2026.',
        champion: 'Melissa Harrington — attended SASE Summit, ran internal evaluation, presented to CIO.',
        competition: 'Palo Alto Prisma SASE shortlisted. Zscaler not evaluated (HIPAA DLP gaps). Netskope ahead on PHI-specific DLP.',
      },
      stakeholders: [
        { name: 'Melissa Harrington', title: 'VP Information Security', role: 'economic_buyer', sentiment: 'positive' },
        { name: 'David Park', title: 'CIO', role: 'champion', sentiment: 'positive' },
        { name: 'Linda Torres', title: 'VP Procurement', sentiment: 'neutral', role: 'user' },
        { name: 'Tom Brennan', title: 'Network Architect', role: 'technical_evaluator', sentiment: 'positive' },
      ],
      map: [
        { id: 'm1', milestone: 'Pricing proposal v2 delivered', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-01', status: 'complete' },
        { id: 'm2', milestone: 'Commercial negotiation call', owner: 'rep', ownerName: 'Elena Martinez + Melissa H.', dueDate: '2026-07-02', status: 'in_progress' },
        { id: 'm3', milestone: 'Final pricing agreed', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-08', status: 'pending' },
        { id: 'm4', milestone: 'MSA sent to legal', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-10', status: 'pending' },
        { id: 'm5', milestone: 'CIO executive sign-off', owner: 'customer', ownerName: 'David Park', dueDate: '2026-07-22', status: 'pending' },
        { id: 'm6', milestone: 'PO issued', owner: 'customer', ownerName: 'Linda Torres', dueDate: '2026-07-31', status: 'pending' },
      ],
      risks: [
        { risk: 'Procurement requests 20% discount (budget above 15% needs VP approval)', mitigation: 'Engage Netskope VP Sales for discount authorization. Offer multi-year prepay to offset.', severity: 'high' },
        { risk: 'Palo Alto re-engages with counter-proposal', mitigation: 'Reinforce PHI DLP differentiation with Melissa. Request reference call with existing healthcare customer.', severity: 'medium' },
      ],
      competitorNotes: 'Palo Alto Prisma SASE is still active. Their DLP is weaker on PHI classification. Pricing is comparable. Push Netskope HIPAA reference customers.',
      whyNetskope: 'Only platform with OCR-based PHI detection inline. HIPAA BAA available. Healthcare-specific DLP policies out of the box.',
    },
  },
  {
    id: 'opp-003',
    name: 'Sterling Aerospace — SSE Platform',
    accountName: 'Sterling Aerospace & Defense',
    arrValue: 2_100_000,
    type: 'New Business',
    stage: 'ss5_proposal_negotiation',
    probability: 55,
    closeDate: '2026-08-29',
    nextStep: 'Deliver formal proposal deck to CIO James Whitfield — July 5',
    daysInStage: 21,
    territory: 'West',
    rep: 'Elena Martinez',
    product: 'SSE Platform + DLP',
    status: 'at_risk',
    closePlan: {
      executiveSummary: 'Sterling A&D ($12B) evaluating SSE for 18,000 employees across 28 defense facilities. CIO James Whitfield engaged post-Gartner Summit. CMMC 2.0 compliance is primary driver. Proposal being prepared — at risk due to CMMC advisory firm evaluating 3 vendors simultaneously.',
      meddpicc: {
        metrics: 'CMMC 2.0 Level 3 compliance by Q1 2027; protect CUI across 28 facilities; replace 6 point solutions.',
        economicBuyer: 'James Whitfield, CIO — budget TBD, estimated $2.1M ARR. CFO not yet engaged.',
        decisionCriteria: 'CMMC 2.0 Level 3 support, FedRAMP High, CUI data protection, on-prem deployment option for classified networks.',
        decisionProcess: 'CIO + CISO jointly select vendor → CMMC advisory firm validates → Board Security Committee approves.',
        paperProcess: 'Unknown — CMMC advisory firm may require GovCloud contract vehicle.',
        identifyPain: 'CMMC 2.0 audit required by Nov 2026. Current DLP tools cannot classify CUI. 6 security vendors creating operational complexity.',
        champion: 'James Whitfield (CIO) — engaged but CMMC advisory firm is influencing evaluation.',
        competition: 'Microsoft Purview (incumbent for M365), Forcepoint (CUI specialist), Palo Alto Prisma. 3-way bake-off.',
      },
      stakeholders: [
        { name: 'James Whitfield', title: 'CIO', role: 'economic_buyer', sentiment: 'positive' },
        { name: 'Col. Robert Steele', title: 'CISO', role: 'technical_evaluator', sentiment: 'unknown' },
        { name: 'Accenture Federal', title: 'CMMC Advisory Firm', role: 'coach', sentiment: 'neutral' },
      ],
      map: [
        { id: 'm1', milestone: 'Discovery call with CISO', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-06-28', status: 'complete' },
        { id: 'm2', milestone: 'Proposal delivered to CIO', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-05', status: 'in_progress' },
        { id: 'm3', milestone: 'Accenture Federal briefing on Netskope CMMC capabilities', owner: 'rep', ownerName: 'SE + Fed Team', dueDate: '2026-07-12', status: 'pending' },
        { id: 'm4', milestone: 'Technical deep-dive with CISO', owner: 'rep', ownerName: 'SE Team', dueDate: '2026-07-19', status: 'pending' },
        { id: 'm5', milestone: 'POC scope agreed', owner: 'rep', ownerName: 'Elena + CISO team', dueDate: '2026-07-31', status: 'pending' },
      ],
      risks: [
        { risk: 'CMMC advisory firm recommends Forcepoint (existing relationship)', mitigation: 'Get Netskope onto advisory firm approved vendor list. Engage Netskope Federal team for Accenture relationship.', severity: 'high' },
        { risk: 'CUI + classified network requirements may require on-prem — Netskope is cloud-first', mitigation: 'Position Netskope Private Access for classified workloads. Engage product team on hybrid deployment options.', severity: 'high' },
        { risk: 'Decision timeline slips to Q1 2027', mitigation: 'Anchor to CMMC audit deadline (Nov 2026) — they must decide by Q3 to deploy in time.', severity: 'medium' },
      ],
      competitorNotes: 'Forcepoint has CUI classification advantage. Microsoft Purview is incumbent but lacks network-layer enforcement. Differentiate on: inline DLP at network layer, FedRAMP High authorization, unified SWG+CASB+ZTNA.',
      whyNetskope: 'Only SSE vendor with FedRAMP High + ITAR support roadmap. Inline CUI detection without agents on classified devices. Unified platform reduces vendor sprawl.',
    },
  },
  {
    id: 'opp-004',
    name: 'Triton Manufacturing — ZTNA Expansion',
    accountName: 'Triton Manufacturing',
    arrValue: 390_000,
    type: 'Expansion',
    stage: 'ss4_solution_validation',
    probability: 55,
    closeDate: '2026-08-15',
    nextStep: 'POC kick-off call with network team — June 27',
    daysInStage: 11,
    territory: 'Midwest',
    rep: 'Elena Martinez',
    product: 'ZTNA',
    status: 'healthy',
    closePlan: {
      executiveSummary: 'Existing Netskope SWG customer expanding to ZTNA for 3,500 remote manufacturing employees. Sandra Okafor (VP IT) is champion after ransomware incident. POC starts June 27.',
      meddpicc: {
        metrics: 'Replace GlobalProtect VPN for 3,500 users; reduce ransomware attack surface; achieve network segmentation for OT/IT convergence.',
        economicBuyer: 'Sandra Okafor, VP IT — board approved $390K ZTNA budget post-ransomware.',
        decisionCriteria: 'Agentless ZTNA for contractors, OT/IT network segmentation, integration with existing Netskope SWG tenant.',
        decisionProcess: 'VP IT selects → CTO approves → Procurement PO.',
        paperProcess: 'Existing Netskope master agreement in place — addendum only. Fast-track expected.',
        identifyPain: 'Ransomware lateral movement via VPN in 2025. Board mandate for Zero Trust. 800 contractors with no endpoint management.',
        champion: 'Sandra Okafor — attended our ZTNA webinar. Strong internal advocate.',
        competition: 'Zscaler Private Access (ZPA) is the only active competitor. Netskope advantage: single-tenant, existing SWG integration.',
      },
      stakeholders: [
        { name: 'Sandra Okafor', title: 'VP IT Infrastructure', role: 'champion', sentiment: 'positive' },
        { name: 'Michael Huang', title: 'CTO', role: 'economic_buyer', sentiment: 'neutral' },
        { name: 'Rick Patel', title: 'Network Security Lead', role: 'technical_evaluator', sentiment: 'positive' },
      ],
      map: [
        { id: 'm1', milestone: 'POC environment provisioned', owner: 'rep', ownerName: 'SE Team', dueDate: '2026-06-27', status: 'in_progress' },
        { id: 'm2', milestone: 'POC kickoff with network team', owner: 'rep', ownerName: 'Elena + SE', dueDate: '2026-06-27', status: 'in_progress' },
        { id: 'm3', milestone: 'Contractor agentless ZTNA validated', owner: 'customer', ownerName: 'Rick Patel', dueDate: '2026-07-11', status: 'pending' },
        { id: 'm4', milestone: 'OT/IT segmentation use case validated', owner: 'customer', ownerName: 'Rick Patel', dueDate: '2026-07-18', status: 'pending' },
        { id: 'm5', milestone: 'POC results presented to CTO', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-25', status: 'pending' },
        { id: 'm6', milestone: 'Commercial proposal delivered', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-28', status: 'pending' },
        { id: 'm7', milestone: 'PO issued', owner: 'customer', ownerName: 'Procurement', dueDate: '2026-08-15', status: 'pending' },
      ],
      risks: [
        { risk: 'OT network constraints block agentless ZTNA deployment', mitigation: 'Engage Netskope OT/ICS specialist. Pre-test in isolated lab environment first.', severity: 'medium' },
        { risk: 'ZPA counter-proposal during POC', mitigation: 'Anchor on existing SWG investment — migration to ZPA means losing SWG-ZTNA integration.', severity: 'low' },
      ],
      competitorNotes: 'ZPA is the only active competitor. Key differentiator: Netskope ZTNA integrates with existing SWG for unified policy — ZPA would require a separate stack.',
      whyNetskope: 'Existing customer — single-platform advantage. Agentless for contractors out of the box. OT/IT convergence roadmap aligns with their needs.',
    },
  },
  {
    id: 'opp-005',
    name: 'Harbor Financial Services — SSE Expansion',
    accountName: 'Harbor Financial Services',
    arrValue: 560_000,
    type: 'Expansion',
    stage: 'ss3_qualification',
    probability: 40,
    closeDate: '2026-09-30',
    nextStep: 'Discovery call with CISO and architecture team — July 1',
    daysInStage: 6,
    territory: 'Northeast',
    rep: 'Elena Martinez',
    product: 'SSE Platform',
    status: 'healthy',
    closePlan: {
      executiveSummary: 'Harbor Financial ($2.1B AUM) — existing CASB customer looking to expand to full SSE. Kevin Nakamura (Director CyberSec) inbound from Gartner MQ download. Discovery phase.',
      meddpicc: {
        metrics: 'TBD — discovery in progress.',
        economicBuyer: 'TBD — likely CISO (not yet met).',
        decisionCriteria: 'TBD — CASB + SWG + ZTNA consolidation suspected.',
        decisionProcess: 'TBD.',
        paperProcess: 'Existing master agreement in place.',
        identifyPain: 'Downloaded Gartner SSE MQ — likely evaluating full SSE platform post-CASB deployment.',
        champion: 'Kevin Nakamura — strong internal advocate. Need to identify economic buyer.',
        competition: 'Unknown — early stage.',
      },
      stakeholders: [
        { name: 'Kevin Nakamura', title: 'Director of Cybersecurity', role: 'champion', sentiment: 'positive' },
      ],
      map: [
        { id: 'm1', milestone: 'Discovery call with Kevin + CISO', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-01', status: 'pending' },
        { id: 'm2', milestone: 'Identify economic buyer', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-08', status: 'pending' },
        { id: 'm3', milestone: 'Document pain points and metrics', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-15', status: 'pending' },
        { id: 'm4', milestone: 'Technical demo — full SSE platform', owner: 'rep', ownerName: 'SE Team', dueDate: '2026-07-22', status: 'pending' },
      ],
      risks: [
        { risk: 'CISO not yet engaged — Kevin may not have budget authority', mitigation: 'Ask Kevin directly about budget owner. Offer executive briefing to get CISO in the room.', severity: 'high' },
      ],
      competitorNotes: 'Too early to know. Existing CASB customer gives Netskope home-field advantage.',
      whyNetskope: 'Existing CASB customer — natural SSE expansion. Single-tenant architecture preferred by financial services.',
    },
  },
  {
    id: 'opp-006',
    name: 'Quantum Logistics — SASE Renewal + Expansion',
    accountName: 'Quantum Logistics Group',
    arrValue: 720_000,
    type: 'Renewal',
    stage: 'ss6_purchasing',
    probability: 85,
    closeDate: '2026-06-30',
    nextStep: 'Order form signature from Christine Patel — due June 26',
    daysInStage: 5,
    territory: 'Southwest',
    rep: 'Elena Martinez',
    product: 'SASE Platform',
    status: 'healthy',
    closePlan: {
      executiveSummary: 'Quantum Logistics renewal ($480K) + ZTNA expansion ($240K) = $720K total. Christine Patel (VP Network Engineering) confirmed renewal + expansion. Order form in customer\'s hands. Closing June 30.',
      meddpicc: {
        metrics: 'Renew full SASE platform + expand ZTNA to cover 500 new warehouse employees.',
        economicBuyer: 'Christine Patel, VP Network Engineering — budget confirmed.',
        decisionCriteria: 'Renewal is standard. Expansion: agentless ZTNA for warehouse devices (no MDM).',
        decisionProcess: 'Christine signs order form → Finance countersigns → Done.',
        paperProcess: 'Order form only — existing MSA in place. Legal review not required.',
        identifyPain: 'Warehouse expansion with 500 new non-managed devices needing secure access.',
        champion: 'Christine Patel — long-term relationship. QBR last month was excellent.',
        competition: 'None — renewal + upsell to existing happy customer.',
      },
      stakeholders: [
        { name: 'Christine Patel', title: 'VP Network Engineering', role: 'economic_buyer', sentiment: 'positive' },
      ],
      map: [
        { id: 'm1', milestone: 'Order form sent', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-06-23', status: 'complete' },
        { id: 'm2', milestone: 'Order form signed by Christine', owner: 'customer', ownerName: 'Christine Patel', dueDate: '2026-06-26', status: 'in_progress' },
        { id: 'm3', milestone: 'Finance countersignature', owner: 'rep', ownerName: 'Netskope Finance', dueDate: '2026-06-28', status: 'pending' },
        { id: 'm4', milestone: 'PO booked', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-06-30', status: 'pending' },
        { id: 'm5', milestone: 'Expansion ZTNA provisioning kickoff', owner: 'rep', ownerName: 'SE Team', dueDate: '2026-07-07', status: 'pending' },
      ],
      risks: [
        { risk: 'Finance delay at quarter-end', mitigation: 'Escalate to Netskope Finance VP if signature not received by June 27.', severity: 'low' },
      ],
      competitorNotes: 'No competition. Renewal.',
      whyNetskope: 'Existing SASE customer, proven ROI, expanding to new use case.',
    },
  },
  {
    id: 'opp-007',
    name: 'Cascade Health Network — SASE Platform',
    accountName: 'Cascade Health Network',
    arrValue: 980_000,
    type: 'New Business',
    stage: 'ss2_new_business_meeting',
    probability: 25,
    closeDate: '2026-10-31',
    nextStep: 'CISO intro call — follow up from RSA badge scan',
    daysInStage: 18,
    territory: 'West',
    rep: 'Elena Martinez',
    product: 'SASE Platform',
    status: 'at_risk',
    closePlan: {
      executiveSummary: 'Cascade Health ($3.2B) — CISO Angela Merritt badge scanned at RSA. HIPAA SASE inquiry. Early qualification stage. MEDDPICC mostly blank. Need discovery call.',
      meddpicc: {
        metrics: 'TBD.',
        economicBuyer: 'TBD — Angela Merritt is CISO but budget authority unclear.',
        decisionCriteria: 'HIPAA-compliant SASE — mentioned explicitly at RSA.',
        decisionProcess: 'TBD.',
        paperProcess: 'TBD.',
        identifyPain: 'HIPAA compliance gap suspected. Mentioned interest in "cloud-first security" at RSA.',
        champion: 'Angela Merritt — early stage, need to qualify further.',
        competition: 'Unknown.',
      },
      stakeholders: [
        { name: 'Angela Merritt', title: 'CISO', role: 'champion', sentiment: 'positive' },
      ],
      map: [
        { id: 'm1', milestone: 'CISO intro call (post-RSA follow up)', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-01', status: 'pending' },
        { id: 'm2', milestone: 'Qualify: budget, timeline, pain', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-08', status: 'pending' },
        { id: 'm3', milestone: 'Executive briefing with Netskope VP Sales', owner: 'rep', ownerName: 'Elena + VP Sales', dueDate: '2026-07-22', status: 'pending' },
      ],
      risks: [
        { risk: 'Angela may not have budget authority — CISO at health systems often report to CIO', mitigation: 'Ask Angela directly about budget process. Offer to include CIO in executive briefing.', severity: 'high' },
        { risk: 'Cold lead — RSA badge scan is weak buying signal', mitigation: 'Qualify hard in first call. If no budget or timeline, downgrade to nurture.', severity: 'medium' },
      ],
      competitorNotes: 'Unknown. Large health system likely being pitched by all major SASE vendors post-RSA.',
      whyNetskope: 'HIPAA-specific DLP, OCR for PHI, BAA available. Healthcare use case resonates.',
    },
  },
  {
    id: 'opp-008',
    name: 'Nexus Energy — GRC Compliance Platform',
    accountName: 'Nexus Energy Partners',
    arrValue: 310_000,
    type: 'New Business',
    stage: 'ss3_qualification',
    probability: 40,
    closeDate: '2026-09-15',
    nextStep: 'Zero Trust Maturity workshop — July 8',
    daysInStage: 9,
    territory: 'Southwest',
    rep: 'Elena Martinez',
    product: 'ZTNA + SWG',
    status: 'healthy',
    closePlan: {
      executiveSummary: 'Nexus Energy ($1.4B) — Brian Castellano (Sr. Security Architect) inbound from Zero Trust Maturity Assessment. NERC CIP compliance driver. Discovery phase.',
      meddpicc: {
        metrics: 'NERC CIP compliance for 12 substations; replace legacy MPLS for OT remote access.',
        economicBuyer: 'TBD — Brian is technical influencer, need to meet CISO.',
        decisionCriteria: 'OT/IT network segmentation, NERC CIP compliance, agentless access for substation equipment.',
        decisionProcess: 'TBD — likely CISO + CTO joint decision for OT security.',
        paperProcess: 'TBD.',
        identifyPain: 'NERC CIP audit in Q3 2026 flagged remote access to substations as critical gap.',
        champion: 'Brian Castellano — technical champion but not economic buyer.',
        competition: 'Claroty (OT specialist) likely to be evaluated. Netskope not traditionally OT-focused.',
      },
      stakeholders: [
        { name: 'Brian Castellano', title: 'Sr. Security Architect', role: 'technical_evaluator', sentiment: 'positive' },
      ],
      map: [
        { id: 'm1', milestone: 'Zero Trust Maturity workshop with Brian', owner: 'rep', ownerName: 'Elena + SE', dueDate: '2026-07-08', status: 'pending' },
        { id: 'm2', milestone: 'Meet CISO / identify economic buyer', owner: 'rep', ownerName: 'Elena Martinez', dueDate: '2026-07-15', status: 'pending' },
        { id: 'm3', milestone: 'OT/IT use case technical deep-dive', owner: 'rep', ownerName: 'SE + OT Specialist', dueDate: '2026-07-22', status: 'pending' },
      ],
      risks: [
        { risk: 'OT/ICS requirements may exceed Netskope platform capabilities', mitigation: 'Engage Netskope OT specialist. Be transparent about OT roadmap. Position ZTNA for IT-side, OT partner for substation layer.', severity: 'high' },
      ],
      competitorNotes: 'Claroty likely to be evaluated for OT layer. Position Netskope for IT/OT convergence layer — not replacing OT tools.',
      whyNetskope: 'ZTNA for IT remote access + NERC CIP compliant logging. Partner with OT-specialist for substation layer.',
    },
  },
];
