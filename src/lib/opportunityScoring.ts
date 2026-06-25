import { type Opportunity, type OppStage, ACTIVE_STAGES } from '@/src/data/opportunityData';

// ─── Milestone definitions ─────────────────────────────────────────────────────

export interface MilestoneDef {
  id: string;
  label: string;
  description: string;
  points: number;
  category: 'qualification' | 'technical' | 'commercial' | 'executive';
}

export const MILESTONE_DEFS: MilestoneDef[] = [
  { id: 'discovery',               label: 'Discovery completed',               description: 'Initial discovery call done, pain points identified',           points: 5,  category: 'qualification' },
  { id: 'pain_documented',         label: 'Business pain documented',          description: 'Primary & secondary pain formally documented in CRM',            points: 8,  category: 'qualification' },
  { id: 'champion_identified',     label: 'Champion identified',               description: 'Internal champion confirmed and actively engaged',               points: 10, category: 'qualification' },
  { id: 'economic_buyer_identified', label: 'Economic Buyer engaged',          description: 'Economic buyer identified and directly engaged',                 points: 10, category: 'executive'     },
  { id: 'success_criteria',        label: 'Success criteria agreed',           description: 'Mutual definition of success documented and agreed',             points: 8,  category: 'qualification' },
  { id: 'map_shared',              label: 'Mutual Action Plan shared',         description: 'MAP sent and acknowledged by the customer',                      points: 5,  category: 'commercial'    },
  { id: 'technical_validation',    label: 'Technical validation completed',    description: 'POC or technical eval completed with positive outcome',          points: 8,  category: 'technical'     },
  { id: 'security_review',         label: 'Security review completed',         description: 'Customer security team has reviewed Netskope documentation',     points: 8,  category: 'technical'     },
  { id: 'procurement_documented',  label: 'Procurement process documented',    description: 'Procurement requirements and process fully mapped',              points: 5,  category: 'commercial'    },
  { id: 'legal_initiated',         label: 'Legal review initiated',            description: 'Legal / contract review process kicked off',                    points: 5,  category: 'commercial'    },
  { id: 'executive_alignment',     label: 'Executive alignment completed',     description: 'Executive sponsor meeting held with positive outcome',           points: 8,  category: 'executive'     },
  { id: 'close_plan_validated',    label: 'Close plan validated',              description: 'Close plan confirmed by champion and economic buyer',            points: 5,  category: 'commercial'    },
  { id: 'contract_negotiation',    label: 'Contract negotiation completed',    description: 'Commercial terms agreed, contract ready for signature',          points: 10, category: 'commercial'    },
];

export const TOTAL_MILESTONE_POINTS = MILESTONE_DEFS.reduce((s, m) => s + m.points, 0); // 95

// ─── Score types ───────────────────────────────────────────────────────────────

export interface DimScore {
  raw: number;
  max: number;
  pct: number;
  factors: string[];
  gaps: string[];
}

export interface ContentRec {
  title: string;
  type: 'battlecard' | 'playbook' | 'case_study' | 'roi' | 'security' | 'demo' | 'guide' | 'reference';
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OpportunityScore {
  total: number;
  health: 'excellent' | 'healthy' | 'at_risk' | 'critical';
  winProbability: number;
  confidence: 'high' | 'medium' | 'low';
  dimensions: {
    icp:         DimScore;
    meddpicc:    DimScore;
    stakeholders: DimScore;
    milestones:  DimScore;
    momentum:    DimScore;
    revenue:     DimScore;
  };
  deductions: { reason: string; points: number }[];
  strengths: string[];
  risks: string[];
  missingElements: string[];
  milestoneProgress: { completed: number; total: number; pts: number; totalPts: number; pct: number };
  nextActions: string[];
  contentRecs: ContentRec[];
}

// ─── MEDDPICC field helpers ────────────────────────────────────────────────────

const MEDDPICC_FIELD_LABELS: Record<string, string> = {
  metrics: 'Metrics', economicBuyer: 'Economic Buyer', decisionCriteria: 'Decision Criteria',
  decisionProcess: 'Decision Process', paperProcess: 'Paper Process', identifyPain: 'Identify Pain',
  champion: 'Champion', competition: 'Competition',
};

function isFilled(v: string | undefined): boolean {
  if (!v) return false;
  return v.trim().length > 10 && !v.trim().toLowerCase().startsWith('tbd');
}

// ─── Scoring dimensions ────────────────────────────────────────────────────────

function scoreICP(opp: Opportunity): DimScore {
  const MAX = 15;
  let raw = 0;
  const factors: string[] = [];
  const gaps: string[] = [];

  if (opp.isICP) { raw += 8; factors.push('Matches ICP profile'); }
  else { gaps.push('Account does not match ideal customer profile'); }

  if (opp.isStrategicAccount) { raw += 4; factors.push('Strategic account'); }

  // Industry bonus from account name / product heuristic
  const name = opp.accountName.toLowerCase();
  const isEnterprise = opp.arrValue >= 500_000;
  if (isEnterprise) { raw += 2; factors.push('Enterprise ARR segment'); }
  else gaps.push('Sub-enterprise ARR');

  const geoBonus = opp.territory ? 1 : 0;
  raw += geoBonus;
  if (geoBonus) factors.push('Defined territory coverage');

  return { raw: Math.min(raw, MAX), max: MAX, pct: Math.round(Math.min(raw, MAX) / MAX * 100), factors, gaps };
}

function scoreMEDDPICC(opp: Opportunity): DimScore {
  const MAX = 20;
  const m = opp.closePlan?.meddpicc;
  if (!m) return { raw: 0, max: MAX, pct: 0, factors: [], gaps: Object.values(MEDDPICC_FIELD_LABELS) };

  const PER_FIELD = MAX / 8;
  let raw = 0;
  const factors: string[] = [];
  const gaps: string[] = [];

  for (const [key, label] of Object.entries(MEDDPICC_FIELD_LABELS)) {
    if (isFilled((m as Record<string, string>)[key])) {
      raw += PER_FIELD;
      factors.push(`${label} documented`);
    } else {
      gaps.push(`${label} missing or TBD`);
    }
  }

  return { raw: Math.min(Math.round(raw), MAX), max: MAX, pct: Math.round(Math.min(raw, MAX) / MAX * 100), factors, gaps };
}

function scoreStakeholders(opp: Opportunity): DimScore {
  const MAX = 20;
  let raw = 0;
  const factors: string[] = [];
  const gaps: string[] = [];
  const stakeholders = opp.closePlan?.stakeholders ?? [];

  const champion = stakeholders.find(s => s.role === 'champion');
  const eb = stakeholders.find(s => s.role === 'economic_buyer');
  const techEval = stakeholders.find(s => s.role === 'technical_evaluator');

  if (champion) { raw += 6; factors.push('Champion identified'); }
  else gaps.push('No champion identified');

  if (champion?.sentiment === 'positive') { raw += 2; factors.push('Champion is positive'); }
  else if (champion) gaps.push('Champion sentiment not confirmed positive');

  if (eb) { raw += 6; factors.push('Economic Buyer engaged'); }
  else gaps.push('Economic Buyer not engaged');

  if (eb?.sentiment === 'positive') { raw += 2; factors.push('Economic Buyer is positive'); }

  if (techEval) { raw += 2; factors.push('Technical evaluator mapped'); }

  if (stakeholders.length >= 3) { raw += 2; factors.push('Multi-threaded (3+ stakeholders)'); }
  else if (stakeholders.length <= 1) gaps.push('Single-threaded — high risk');

  return { raw: Math.min(raw, MAX), max: MAX, pct: Math.round(Math.min(raw, MAX) / MAX * 100), factors, gaps };
}

function scoreMilestones(opp: Opportunity): DimScore {
  const MAX = 20;
  const ms = opp.milestones ?? {};
  const completedDefs = MILESTONE_DEFS.filter(m => ms[m.id]);
  const pts = completedDefs.reduce((s, m) => s + m.points, 0);
  const raw = Math.round((pts / TOTAL_MILESTONE_POINTS) * MAX);
  const factors = completedDefs.map(m => m.label);
  const gaps = MILESTONE_DEFS.filter(m => !ms[m.id]).map(m => m.label);
  return { raw, max: MAX, pct: Math.round(raw / MAX * 100), factors, gaps };
}

function scoreMomentum(opp: Opportunity): DimScore {
  const MAX = 15;
  let raw = 0;
  const factors: string[] = [];
  const gaps: string[] = [];

  // Stage progress (up to 8 pts)
  const stageIdx = ACTIVE_STAGES.findIndex(s => s.id === opp.stage);
  const stagePts = stageIdx >= 0 ? Math.round((stageIdx / (ACTIVE_STAGES.length - 1)) * 8) : 0;
  raw += stagePts;
  if (stagePts >= 6) factors.push('Advanced stage progression');
  else if (stagePts <= 2) gaps.push('Early stage — low momentum score');

  // Days in stage (up to 3 pts)
  if (opp.daysInStage <= 14) { raw += 3; factors.push('On track in current stage'); }
  else if (opp.daysInStage <= 30) { raw += 1; }
  else gaps.push(`Stalled — ${opp.daysInStage}d in current stage`);

  // Activity recency (up to 2 pts)
  const actDays = opp.lastActivityDays ?? 7;
  if (actDays <= 3) { raw += 2; factors.push('Recent activity'); }
  else if (actDays <= 7) { raw += 1; }
  else gaps.push(`No activity in ${actDays} days`);

  // Next step defined (2 pts)
  if (opp.nextStep) { raw += 2; factors.push('Next step defined'); }
  else gaps.push('No next step defined');

  return { raw: Math.min(raw, MAX), max: MAX, pct: Math.round(Math.min(raw, MAX) / MAX * 100), factors, gaps };
}

function scoreRevenue(opp: Opportunity): DimScore {
  const MAX = 10;
  let raw = 0;
  const factors: string[] = [];
  const gaps: string[] = [];
  const arr = opp.arrValue;

  if (arr >= 1_000_000)      { raw = 10; factors.push('$1M+ ARR deal'); }
  else if (arr >= 500_000)   { raw = 8;  factors.push('$500K+ ARR deal'); }
  else if (arr >= 250_000)   { raw = 6;  factors.push('$250K+ ARR deal'); }
  else if (arr >= 100_000)   { raw = 4;  factors.push('$100K+ ARR deal'); }
  else                       { raw = 2;  gaps.push('Sub-$100K ARR — limited strategic value'); }

  if (opp.type === 'Expansion' || opp.type === 'Upsell') factors.push('Expansion opportunity — high retention value');

  return { raw, max: MAX, pct: Math.round(raw / MAX * 100), factors, gaps };
}

function calcDeductions(opp: Opportunity): { reason: string; points: number }[] {
  const ded: { reason: string; points: number }[] = [];
  const stakeholders = opp.closePlan?.stakeholders ?? [];

  if (opp.status === 'stalled')                                             ded.push({ reason: 'Deal is stalled',                             points: 10 });
  else if (opp.status === 'at_risk')                                        ded.push({ reason: 'Deal is at risk',                             points: 5  });

  if (!stakeholders.find(s => s.role === 'champion'))                       ded.push({ reason: 'No champion identified',                      points: 5  });
  if (!stakeholders.find(s => s.role === 'economic_buyer'))                 ded.push({ reason: 'Economic Buyer not engaged',                  points: 5  });
  if (stakeholders.length <= 1)                                             ded.push({ reason: 'Single-threaded engagement',                  points: 3  });

  const days = Math.round((new Date(opp.closeDate).getTime() - Date.now()) / 86_400_000);
  if (days < 0)                                                             ded.push({ reason: 'Close date overdue',                          points: 5  });

  if (!opp.nextStep)                                                        ded.push({ reason: 'No next step defined',                        points: 3  });

  const actDays = opp.lastActivityDays ?? 0;
  if (actDays > 30)                                                         ded.push({ reason: `No activity for ${actDays} days`,             points: 5  });
  else if (actDays > 14)                                                    ded.push({ reason: `Low activity (${actDays}d since last touch)`,  points: 2  });

  const highRisks = (opp.closePlan?.risks ?? []).filter(r => r.severity === 'high').length;
  if (highRisks > 0)                                                        ded.push({ reason: `${highRisks} high-severity risk(s)`,           points: Math.min(highRisks * 2, 6) });

  // Cap total deductions
  const total = ded.reduce((s, d) => s + d.points, 0);
  if (total > 20) {
    const factor = 20 / total;
    return ded.map(d => ({ ...d, points: Math.round(d.points * factor) }));
  }
  return ded;
}

// ─── Content recommendations ───────────────────────────────────────────────────

function buildContentRecs(opp: Opportunity): ContentRec[] {
  const recs: ContentRec[] = [];
  const comp = opp.closePlan?.competitorNotes?.toLowerCase() ?? '';
  const product = opp.product.toLowerCase();
  const stage = opp.stage;
  const stakeholders = opp.closePlan?.stakeholders ?? [];
  const hasEB = stakeholders.some(s => s.role === 'economic_buyer');
  const hasChampion = stakeholders.some(s => s.role === 'champion');

  // Battlecards
  if (comp.includes('zscaler'))    recs.push({ title: 'Netskope vs Zscaler Battlecard',        type: 'battlecard', reason: 'Zscaler mentioned in competitive notes', priority: 'high' });
  if (comp.includes('palo alto'))  recs.push({ title: 'Netskope vs Palo Alto Prisma Battlecard', type: 'battlecard', reason: 'Palo Alto Prisma in active evaluation',   priority: 'high' });
  if (comp.includes('microsoft') || comp.includes('purview')) recs.push({ title: 'Netskope vs Microsoft Purview Battlecard', type: 'battlecard', reason: 'Microsoft Purview competing for workload', priority: 'high' });
  if (comp.includes('forcepoint')) recs.push({ title: 'Netskope vs Forcepoint Battlecard',     type: 'battlecard', reason: 'Forcepoint identified as competitor',       priority: 'high' });

  // Stage-specific
  if (stage === 'ss2_new_business_meeting') {
    recs.push({ title: 'Executive Overview Deck', type: 'demo', reason: 'First meeting stage — lead with vision', priority: 'high' });
    recs.push({ title: 'SSE Gartner MQ Positioning Brief', type: 'guide', reason: 'Establish thought leadership early', priority: 'medium' });
  }
  if (stage === 'ss3_qualification') {
    recs.push({ title: 'Discovery Question Playbook', type: 'playbook', reason: 'Deepen qualification with structured discovery', priority: 'high' });
    recs.push({ title: 'ROI Calculator', type: 'roi', reason: 'Quantify business value for economic buyer conversation', priority: 'medium' });
  }
  if (stage === 'ss4_solution_validation') {
    recs.push({ title: 'POC Success Criteria Template', type: 'guide', reason: 'Define measurable POC success criteria upfront', priority: 'high' });
    recs.push({ title: 'Technical Architecture Guide', type: 'security', reason: 'Support technical evaluator during POC', priority: 'high' });
  }
  if (stage === 'ss5_proposal_negotiation') {
    recs.push({ title: 'Competitive Differentiation One-Pager', type: 'guide', reason: 'Reinforce Netskope strengths during negotiation', priority: 'high' });
    recs.push({ title: 'Customer Reference — Similar Industry', type: 'reference', reason: 'Third-party validation accelerates decisions', priority: 'medium' });
  }
  if (stage === 'ss6_purchasing' || stage === 'ss7_po_received') {
    recs.push({ title: 'Implementation Timeline & Onboarding Guide', type: 'guide', reason: 'Set expectations for post-signature delivery', priority: 'medium' });
    recs.push({ title: 'Contract FAQ for Procurement', type: 'guide', reason: 'Unblock legal/procurement questions', priority: 'high' });
  }

  // Stakeholder gaps
  if (!hasEB) recs.push({ title: 'Economic Buyer Value Proposition', type: 'playbook', reason: 'Economic Buyer not yet engaged — prepare EB-specific messaging', priority: 'high' });
  if (!hasChampion) recs.push({ title: 'Champion Enablement Kit', type: 'playbook', reason: 'No champion identified — help the champion sell internally', priority: 'high' });

  // Product-specific
  if (product.includes('hipaa') || opp.accountName.toLowerCase().includes('health') || opp.accountName.toLowerCase().includes('medical')) {
    recs.push({ title: 'HIPAA Compliance & PHI DLP Guide', type: 'security', reason: 'Healthcare account — HIPAA positioning is critical', priority: 'high' });
    recs.push({ title: 'Healthcare Reference Architecture', type: 'guide', reason: 'Industry-specific architecture validation', priority: 'medium' });
  }
  if (product.includes('cmmc') || opp.accountName.toLowerCase().includes('aerospace') || opp.accountName.toLowerCase().includes('defense')) {
    recs.push({ title: 'CMMC 2.0 Compliance Guide', type: 'security', reason: 'Defense account — CMMC 2.0 is primary compliance driver', priority: 'high' });
    recs.push({ title: 'FedRAMP High Authorization Documentation', type: 'security', reason: 'Required for defense/government evaluation', priority: 'high' });
  }
  if (product.includes('financial') || opp.accountName.toLowerCase().includes('financial') || opp.accountName.toLowerCase().includes('bank')) {
    recs.push({ title: 'Financial Services Security Brief', type: 'case_study', reason: 'Financial services industry — compliance-first messaging', priority: 'medium' });
  }

  // Deduplicate by title
  const seen = new Set<string>();
  return recs.filter(r => { if (seen.has(r.title)) return false; seen.add(r.title); return true; }).slice(0, 8);
}

// ─── Next actions ──────────────────────────────────────────────────────────────

function buildNextActions(
  opp: Opportunity,
  dims: OpportunityScore['dimensions'],
  deductions: { reason: string; points: number }[],
): string[] {
  const actions: { text: string; urgency: number }[] = [];
  const stakeholders = opp.closePlan?.stakeholders ?? [];
  const ms = opp.milestones ?? {};

  // Critical deductions → highest urgency actions
  if (opp.status === 'stalled') actions.push({ text: 'Deal is stalled — schedule re-engagement call with champion immediately', urgency: 10 });
  if (!stakeholders.find(s => s.role === 'economic_buyer')) actions.push({ text: 'Identify and engage the Economic Buyer — ask champion for an introduction', urgency: 9 });
  if (!stakeholders.find(s => s.role === 'champion')) actions.push({ text: 'Identify an internal champion — qualify the most engaged stakeholder for the role', urgency: 9 });

  if (opp.daysInStage > 20) actions.push({ text: `Deal has been in ${ACTIVE_STAGES.find(s => s.id === opp.stage)?.label} for ${opp.daysInStage} days — review and update the MAP to create urgency`, urgency: 8 });

  const actDays = opp.lastActivityDays ?? 0;
  if (actDays > 14) actions.push({ text: `No activity for ${actDays} days — send a value-add touchpoint or schedule a check-in call`, urgency: 8 });

  // MEDDPICC gaps
  if (dims.meddpicc.pct < 50) actions.push({ text: 'Complete MEDDPICC qualification — at least 4 fields are missing or TBD', urgency: 7 });
  const meddpicc = opp.closePlan?.meddpicc;
  if (meddpicc && !isFilled(meddpicc.metrics)) actions.push({ text: 'Document quantifiable success Metrics with the champion — ROI and KPIs', urgency: 6 });
  if (meddpicc && !isFilled(meddpicc.decisionProcess)) actions.push({ text: 'Map the Decision Process — who decides, how many steps, what triggers the final approval', urgency: 6 });
  if (meddpicc && !isFilled(meddpicc.paperProcess)) actions.push({ text: 'Clarify the Paper Process — procurement steps, legal review, and PO requirements', urgency: 5 });

  // Milestone gaps by category
  if (!ms['economic_buyer_identified']) actions.push({ text: 'Complete milestone: Engage Economic Buyer directly — invite to an executive briefing', urgency: 7 });
  if (!ms['success_criteria']) actions.push({ text: 'Complete milestone: Agree on Success Criteria — define what "winning" looks like for the customer', urgency: 6 });
  if (!ms['technical_validation'] && ['ss4_solution_validation','ss5_proposal_negotiation','ss6_purchasing'].includes(opp.stage)) {
    actions.push({ text: 'Complete milestone: Run technical validation / POC to reduce technical risk', urgency: 6 });
  }
  if (!ms['executive_alignment'] && ['ss5_proposal_negotiation','ss6_purchasing'].includes(opp.stage)) {
    actions.push({ text: 'Schedule executive alignment meeting — Netskope VP + customer executive sponsor', urgency: 7 });
  }
  if (!ms['close_plan_validated'] && opp.stage === 'ss6_purchasing') {
    actions.push({ text: 'Validate close plan with champion and EB — confirm every step to PO is agreed', urgency: 8 });
  }

  // Stage-specific
  if (opp.stage === 'ss6_purchasing' && !ms['procurement_documented']) {
    actions.push({ text: 'Map procurement process end-to-end — vendor setup, approval chain, PO issuance timeline', urgency: 7 });
  }

  // High risks
  const highRisks = (opp.closePlan?.risks ?? []).filter(r => r.severity === 'high');
  if (highRisks.length > 0) actions.push({ text: `Address ${highRisks.length} high-severity risk(s): ${highRisks[0].risk}`, urgency: 7 });

  // Sort by urgency and deduplicate
  return actions
    .sort((a, b) => b.urgency - a.urgency)
    .map(a => a.text)
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .slice(0, 6);
}

// ─── Main scoring function ─────────────────────────────────────────────────────

export function calculateScore(opp: Opportunity): OpportunityScore {
  const icp         = scoreICP(opp);
  const meddpicc    = scoreMEDDPICC(opp);
  const stakeholders = scoreStakeholders(opp);
  const milestones  = scoreMilestones(opp);
  const momentum    = scoreMomentum(opp);
  const revenue     = scoreRevenue(opp);
  const deductions  = calcDeductions(opp);

  const rawTotal = icp.raw + meddpicc.raw + stakeholders.raw + milestones.raw + momentum.raw + revenue.raw;
  const totalDed = deductions.reduce((s, d) => s + d.points, 0);
  const total = Math.round(Math.max(0, Math.min(100, rawTotal - totalDed)));

  const health: OpportunityScore['health'] =
    total >= 75 ? 'excellent' : total >= 55 ? 'healthy' : total >= 35 ? 'at_risk' : 'critical';

  // Win probability: blend score with stage probability
  const stagePct = (ACTIVE_STAGES.find(s => s.id === opp.stage)?.probability ?? opp.probability);
  const winProbability = Math.round((total * 0.6 + stagePct * 0.4));

  const confidence: OpportunityScore['confidence'] =
    meddpicc.pct >= 75 && stakeholders.raw >= 14 ? 'high' :
    meddpicc.pct >= 50 ? 'medium' : 'low';

  // Strengths = top factors across all dims
  const strengths = [
    ...icp.factors, ...meddpicc.factors.slice(0, 2),
    ...stakeholders.factors, ...momentum.factors.slice(0, 2),
    ...revenue.factors,
  ].slice(0, 5);

  // Risks = top gaps + deduction reasons
  const risks = [
    ...deductions.map(d => d.reason),
    ...stakeholders.gaps.slice(0, 2),
    ...meddpicc.gaps.slice(0, 1),
  ].slice(0, 5);

  const missingElements = [
    ...meddpicc.gaps,
    ...stakeholders.gaps,
    ...MILESTONE_DEFS.filter(m => !(opp.milestones ?? {})[m.id]).map(m => m.label),
  ].slice(0, 8);

  // Milestone progress
  const ms = opp.milestones ?? {};
  const completedMs = MILESTONE_DEFS.filter(m => ms[m.id]);
  const completedPts = completedMs.reduce((s, m) => s + m.points, 0);
  const milestoneProgress = {
    completed: completedMs.length,
    total: MILESTONE_DEFS.length,
    pts: completedPts,
    totalPts: TOTAL_MILESTONE_POINTS,
    pct: Math.round((completedPts / TOTAL_MILESTONE_POINTS) * 100),
  };

  const dims = { icp, meddpicc, stakeholders, milestones, momentum, revenue };
  const nextActions = buildNextActions(opp, dims, deductions);
  const contentRecs = buildContentRecs(opp);

  return {
    total, health, winProbability, confidence,
    dimensions: dims,
    deductions, strengths, risks, missingElements,
    milestoneProgress, nextActions, contentRecs,
  };
}
