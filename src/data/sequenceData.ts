// ─── Sequence Activity mock data ─────────────────────────────────────────────

export type SequenceCategory = 'Enterprise' | 'Mid-Market' | 'SMB' | 'CISO' | 'Compliance' | 'Executive' | 'Inbound';

export interface SequenceTemplate {
  id: string;
  name: string;
  category: SequenceCategory;
  description: string;
  steps: number;
  avgDays: number;        // typical completion window
  openRate: number;       // historic avg %
  replyRate: number;      // historic avg %
  channels: ('Email' | 'Call' | 'LinkedIn')[];
  tags: string[];
}

export const sequenceTemplates: SequenceTemplate[] = [
  {
    id: 'seq-sse-enterprise',
    name: 'Enterprise SSE Launch',
    category: 'Enterprise',
    description: 'Full-funnel 8-step sequence targeting enterprise security buyers with SSE value prop.',
    steps: 8, avgDays: 21, openRate: 54, replyRate: 12,
    channels: ['Email', 'Call', 'LinkedIn'],
    tags: ['SSE', 'Enterprise', 'Security'],
  },
  {
    id: 'seq-ciso-ztna',
    name: 'CISO High-Touch ZTNA',
    category: 'CISO',
    description: 'Personalized 6-step sequence for CISOs focused on Zero Trust Network Access.',
    steps: 6, avgDays: 18, openRate: 61, replyRate: 18,
    channels: ['Email', 'LinkedIn'],
    tags: ['ZTNA', 'CISO', 'Zero Trust'],
  },
  {
    id: 'seq-vpn-replace',
    name: 'VPN Replacement Track',
    category: 'Mid-Market',
    description: 'ROI-led 5-step sequence for mid-market prospects evaluating VPN consolidation.',
    steps: 5, avgDays: 14, openRate: 49, replyRate: 10,
    channels: ['Email', 'Call'],
    tags: ['VPN', 'SASE', 'Mid-Market'],
  },
  {
    id: 'seq-sase-midmarket',
    name: 'Mid-Market SASE Play',
    category: 'Mid-Market',
    description: 'SD-WAN + SSE convergence story for network and IT buyers at mid-market accounts.',
    steps: 7, avgDays: 20, openRate: 47, replyRate: 9,
    channels: ['Email', 'Call', 'LinkedIn'],
    tags: ['SASE', 'SD-WAN', 'Mid-Market'],
  },
  {
    id: 'seq-grc-compliance',
    name: 'GRC Compliance Track',
    category: 'Compliance',
    description: 'GDPR/PCI/HIPAA compliance angle for DPOs, compliance managers and legal teams.',
    steps: 6, avgDays: 16, openRate: 58, replyRate: 14,
    channels: ['Email', 'LinkedIn'],
    tags: ['Compliance', 'GDPR', 'PCI', 'HIPAA'],
  },
  {
    id: 'seq-cio-nurture',
    name: 'CIO Executive Nurture',
    category: 'Executive',
    description: 'Long-form 8-step executive nurture for CIOs focused on cloud transformation ROI.',
    steps: 8, avgDays: 28, openRate: 52, replyRate: 11,
    channels: ['Email', 'LinkedIn'],
    tags: ['CIO', 'Executive', 'Cloud'],
  },
  {
    id: 'seq-inbound-rsm',
    name: 'Inbound RSM Fast Follow',
    category: 'Inbound',
    description: 'High-velocity 4-step sequence for warm inbound leads with RSM-ready signals.',
    steps: 4, avgDays: 7, openRate: 68, replyRate: 22,
    channels: ['Email', 'Call'],
    tags: ['Inbound', 'Fast Follow', 'RSM-Ready'],
  },
  {
    id: 'seq-smb-cloud',
    name: 'SMB Cloud Security Starter',
    category: 'SMB',
    description: 'Lightweight 4-step email-first sequence for SMB IT directors and owners.',
    steps: 4, avgDays: 10, openRate: 44, replyRate: 8,
    channels: ['Email', 'Call'],
    tags: ['SMB', 'Cloud', 'Security'],
  },
];

export type SequenceStatus = 'Active' | 'Paused' | 'Finished' | 'Opted Out' | 'Bounced';
export type TaskType = 'Email' | 'Call' | 'LinkedIn' | 'Research';
export type TaskStatus = 'Due Today' | 'Overdue' | 'Upcoming' | 'Completed' | 'Skipped';
export type CallDisposition = 'Connected' | 'Voicemail' | 'No Answer' | 'Bad Number' | 'Do Not Call';
export type MeetingStatus = 'Scheduled' | 'Completed' | 'No Show' | 'Rescheduled';
export type EmailStatus = 'Scheduled' | 'Sent' | 'Opened' | 'Clicked' | 'Replied' | 'Bounced' | 'Failed';

export interface SequenceEnrollment {
  id: string;
  contactName: string;
  contactTitle: string;
  company: string;
  sequenceName: string;
  status: SequenceStatus;
  currentStep: number;
  totalSteps: number;
  enrolledAt: string;
  nextStepAt: string | null;
  openRate: number;    // 0–100
  replyRate: number;   // 0–100
  lastActivity: string;
}

export interface SequenceTask {
  id: string;
  contactName: string;
  contactTitle: string;
  company: string;
  type: TaskType;
  status: TaskStatus;
  subject: string;
  dueAt: string;
  sequenceName: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface CallRecord {
  id: string;
  contactName: string;
  contactTitle: string;
  company: string;
  calledAt: string;
  duration: string | null;
  disposition: CallDisposition;
  notes: string | null;
  sequenceName: string;
}

export interface MeetingRecord {
  id: string;
  contactName: string;
  contactTitle: string;
  company: string;
  title: string;
  status: MeetingStatus;
  scheduledAt: string;
  duration: string;
  source: 'Sequence' | 'Manual' | 'Inbound';
}

export interface OutboxEmail {
  id: string;
  to: string;
  contactTitle: string;
  company: string;
  subject: string;
  status: EmailStatus;
  scheduledAt: string;
  sentAt: string | null;
  openedAt: string | null;
  sequenceName: string;
  stepNumber: number;
}

// ─── Sequences ────────────────────────────────────────────────────────────────

export const sequences: SequenceEnrollment[] = [
  { id: 's1', contactName: 'Sarah Mitchell', contactTitle: 'CISO', company: 'Pacific Financial Group', sequenceName: 'CISO High-Touch ZTNA', status: 'Active', currentStep: 3, totalSteps: 7, enrolledAt: '2026-06-10', nextStepAt: '2026-06-19', openRate: 80, replyRate: 0, lastActivity: '3 days ago' },
  { id: 's2', contactName: 'James Chen', contactTitle: 'VP Infrastructure', company: 'Meridian Health System', sequenceName: 'Enterprise SSE Launch', status: 'Active', currentStep: 2, totalSteps: 6, enrolledAt: '2026-06-12', nextStepAt: '2026-06-18', openRate: 100, replyRate: 0, lastActivity: 'Yesterday' },
  { id: 's3', contactName: 'Monica Rodriguez', contactTitle: 'Director of Network Security', company: 'Apex Manufacturing', sequenceName: 'Mid-Market SASE Play', status: 'Active', currentStep: 5, totalSteps: 7, enrolledAt: '2026-06-01', nextStepAt: '2026-06-20', openRate: 60, replyRate: 0, lastActivity: '5 days ago' },
  { id: 's4', contactName: 'David Kim', contactTitle: 'IT Director', company: 'Skyline Logistics', sequenceName: 'VPN Replacement Track', status: 'Paused', currentStep: 2, totalSteps: 5, enrolledAt: '2026-06-05', nextStepAt: null, openRate: 40, replyRate: 0, lastActivity: '10 days ago' },
  { id: 's5', contactName: 'Rachel Torres', contactTitle: 'Security Architect', company: 'NexGen Biotech', sequenceName: 'CISO High-Touch ZTNA', status: 'Active', currentStep: 1, totalSteps: 7, enrolledAt: '2026-06-15', nextStepAt: '2026-06-19', openRate: 100, replyRate: 0, lastActivity: 'Today' },
  { id: 's6', contactName: 'Brian Wallace', contactTitle: 'CIO', company: 'Summit Capital Partners', sequenceName: 'CIO Executive Nurture', status: 'Finished', currentStep: 6, totalSteps: 6, enrolledAt: '2026-05-20', nextStepAt: null, openRate: 67, replyRate: 17, lastActivity: '2 weeks ago' },
  { id: 's7', contactName: 'Angela Foster', contactTitle: 'Compliance Manager', company: 'Riverside Insurance Group', sequenceName: 'GRC Compliance Track', status: 'Active', currentStep: 4, totalSteps: 6, enrolledAt: '2026-06-08', nextStepAt: '2026-06-21', openRate: 75, replyRate: 0, lastActivity: '2 days ago' },
  { id: 's8', contactName: 'Marcus Thompson', contactTitle: 'SOC Manager', company: 'Fortress Defense Contractors', sequenceName: 'SecOps Threat Track', status: 'Opted Out', currentStep: 2, totalSteps: 5, enrolledAt: '2026-06-03', nextStepAt: null, openRate: 50, replyRate: 0, lastActivity: '12 days ago' },
  { id: 's9', contactName: 'Lisa Park', contactTitle: 'Network Engineer', company: 'Cascade Telecom', sequenceName: 'Mid-Market SASE Play', status: 'Active', currentStep: 3, totalSteps: 7, enrolledAt: '2026-06-11', nextStepAt: '2026-06-20', openRate: 33, replyRate: 0, lastActivity: '4 days ago' },
  { id: 's10', contactName: 'Tom Nguyen', contactTitle: 'VP IT Operations', company: 'GlobalEdge Retail', sequenceName: 'Enterprise SSE Launch', status: 'Bounced', currentStep: 1, totalSteps: 6, enrolledAt: '2026-06-14', nextStepAt: null, openRate: 0, replyRate: 0, lastActivity: '4 days ago' },
  { id: 's11', contactName: 'Priya Patel', contactTitle: 'Data Privacy Officer', company: 'ClearPath Financial', sequenceName: 'GRC Compliance Track', status: 'Active', currentStep: 2, totalSteps: 6, enrolledAt: '2026-06-13', nextStepAt: '2026-06-22', openRate: 100, replyRate: 0, lastActivity: '1 day ago' },
  { id: 's12', contactName: 'Kevin Hart', contactTitle: 'Endpoint Security Manager', company: 'Rocky Mountain Energy', sequenceName: 'VPN Replacement Track', status: 'Active', currentStep: 4, totalSteps: 5, enrolledAt: '2026-06-04', nextStepAt: '2026-06-19', openRate: 100, replyRate: 0, lastActivity: '2 days ago' },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasks: SequenceTask[] = [
  { id: 't1', contactName: 'Sarah Mitchell', contactTitle: 'CISO', company: 'Pacific Financial Group', type: 'Call', status: 'Due Today', subject: 'Follow up on ZTNA evaluation — check timeline', dueAt: 'Today, 2:00 PM', sequenceName: 'CISO High-Touch ZTNA', priority: 'High' },
  { id: 't2', contactName: 'James Chen', contactTitle: 'VP Infrastructure', company: 'Meridian Health System', type: 'Email', status: 'Due Today', subject: 'SSE Architecture Overview — personalized deck', dueAt: 'Today, 4:00 PM', sequenceName: 'Enterprise SSE Launch', priority: 'High' },
  { id: 't3', contactName: 'Rachel Torres', contactTitle: 'Security Architect', company: 'NexGen Biotech', type: 'LinkedIn', status: 'Due Today', subject: 'Connect and share ZTNA whitepaper', dueAt: 'Today, 5:00 PM', sequenceName: 'CISO High-Touch ZTNA', priority: 'Medium' },
  { id: 't4', contactName: 'Kevin Hart', contactTitle: 'Endpoint Security Manager', company: 'Rocky Mountain Energy', type: 'Email', status: 'Due Today', subject: 'Step 4: VPN consolidation ROI breakdown', dueAt: 'Today, 3:30 PM', sequenceName: 'VPN Replacement Track', priority: 'High' },
  { id: 't5', contactName: 'Monica Rodriguez', contactTitle: 'Director of Network Security', company: 'Apex Manufacturing', type: 'Call', status: 'Overdue', subject: 'Check in after SASE webinar attendance', dueAt: 'Yesterday, 11:00 AM', sequenceName: 'Mid-Market SASE Play', priority: 'High' },
  { id: 't6', contactName: 'Angela Foster', contactTitle: 'Compliance Manager', company: 'Riverside Insurance Group', type: 'Email', status: 'Overdue', subject: 'HIPAA / PCI compliance alignment deck', dueAt: 'Jun 16, 9:00 AM', sequenceName: 'GRC Compliance Track', priority: 'Medium' },
  { id: 't7', contactName: 'Priya Patel', contactTitle: 'Data Privacy Officer', company: 'ClearPath Financial', type: 'Research', status: 'Upcoming', subject: 'Research GDPR posture before next outreach', dueAt: 'Jun 20, 10:00 AM', sequenceName: 'GRC Compliance Track', priority: 'Medium' },
  { id: 't8', contactName: 'Lisa Park', contactTitle: 'Network Engineer', company: 'Cascade Telecom', type: 'Email', status: 'Upcoming', subject: 'Step 3: SD-WAN + SSE convergence case study', dueAt: 'Jun 20, 2:00 PM', sequenceName: 'Mid-Market SASE Play', priority: 'Low' },
  { id: 't9', contactName: 'Sarah Mitchell', contactTitle: 'CISO', company: 'Pacific Financial Group', type: 'Email', status: 'Completed', subject: 'Step 2: Zero Trust Executive Brief sent', dueAt: 'Jun 14, 9:00 AM', sequenceName: 'CISO High-Touch ZTNA', priority: 'High' },
  { id: 't10', contactName: 'Brian Wallace', contactTitle: 'CIO', company: 'Summit Capital Partners', type: 'Call', status: 'Completed', subject: 'Discovery call — 30 min completed', dueAt: 'Jun 12, 3:00 PM', sequenceName: 'CIO Executive Nurture', priority: 'High' },
];

// ─── Calls ────────────────────────────────────────────────────────────────────

export const calls: CallRecord[] = [
  { id: 'c1', contactName: 'Brian Wallace', contactTitle: 'CIO', company: 'Summit Capital Partners', calledAt: 'Jun 12, 3:04 PM', duration: '32 min', disposition: 'Connected', notes: 'Discussed SASE roadmap. High interest in ZTNA. Agreed to a technical deep-dive.', sequenceName: 'CIO Executive Nurture' },
  { id: 'c2', contactName: 'Sarah Mitchell', contactTitle: 'CISO', company: 'Pacific Financial Group', calledAt: 'Jun 14, 2:10 PM', duration: '18 min', disposition: 'Connected', notes: 'Walking through their VPN pain points. Evaluating 3 vendors. Netskope in active consideration.', sequenceName: 'CISO High-Touch ZTNA' },
  { id: 'c3', contactName: 'Monica Rodriguez', contactTitle: 'Director of Network Security', company: 'Apex Manufacturing', calledAt: 'Jun 17, 11:30 AM', duration: null, disposition: 'Voicemail', notes: 'Left voicemail re: SASE webinar follow-up.', sequenceName: 'Mid-Market SASE Play' },
  { id: 'c4', contactName: 'David Kim', contactTitle: 'IT Director', company: 'Skyline Logistics', calledAt: 'Jun 8, 9:15 AM', duration: '5 min', disposition: 'Connected', notes: 'Not the right time — budget freeze. Asked to follow up in Q3.', sequenceName: 'VPN Replacement Track' },
  { id: 'c5', contactName: 'Marcus Thompson', contactTitle: 'SOC Manager', company: 'Fortress Defense Contractors', calledAt: 'Jun 6, 1:45 PM', duration: null, disposition: 'No Answer', notes: null, sequenceName: 'SecOps Threat Track' },
  { id: 'c6', contactName: 'Angela Foster', contactTitle: 'Compliance Manager', company: 'Riverside Insurance Group', calledAt: 'Jun 15, 4:00 PM', duration: '12 min', disposition: 'Connected', notes: 'Confirmed PCI audit in August. Interested in compliance reporting features.', sequenceName: 'GRC Compliance Track' },
  { id: 'c7', contactName: 'Kevin Hart', contactTitle: 'Endpoint Security Manager', company: 'Rocky Mountain Energy', calledAt: 'Jun 16, 10:00 AM', duration: '8 min', disposition: 'Connected', notes: 'Currently running 4 endpoint agents. Very interested in consolidation story.', sequenceName: 'VPN Replacement Track' },
  { id: 'c8', contactName: 'Tom Nguyen', contactTitle: 'VP IT Operations', company: 'GlobalEdge Retail', calledAt: 'Jun 14, 3:30 PM', duration: null, disposition: 'Bad Number', notes: 'Number bounced — need to verify contact details.', sequenceName: 'Enterprise SSE Launch' },
];

// ─── Meetings ─────────────────────────────────────────────────────────────────

export const meetings: MeetingRecord[] = [
  { id: 'm1', contactName: 'Brian Wallace', contactTitle: 'CIO', company: 'Summit Capital Partners', title: 'Technical Deep-Dive: SASE Architecture', status: 'Scheduled', scheduledAt: 'Jun 20, 10:00 AM', duration: '60 min', source: 'Sequence' },
  { id: 'm2', contactName: 'Sarah Mitchell', contactTitle: 'CISO', company: 'Pacific Financial Group', title: 'ZTNA POC Scoping Call', status: 'Scheduled', scheduledAt: 'Jun 23, 2:00 PM', duration: '45 min', source: 'Sequence' },
  { id: 'm3', contactName: 'Angela Foster', contactTitle: 'Compliance Manager', company: 'Riverside Insurance Group', title: 'Compliance & Data Protection Overview', status: 'Scheduled', scheduledAt: 'Jun 25, 11:00 AM', duration: '30 min', source: 'Manual' },
  { id: 'm4', contactName: 'Brian Wallace', contactTitle: 'CIO', company: 'Summit Capital Partners', title: 'Discovery Call — SSE Fit Assessment', status: 'Completed', scheduledAt: 'Jun 12, 3:00 PM', duration: '32 min', source: 'Sequence' },
  { id: 'm5', contactName: 'Kevin Hart', contactTitle: 'Endpoint Security Manager', company: 'Rocky Mountain Energy', title: 'VPN Consolidation ROI Walkthrough', status: 'Completed', scheduledAt: 'Jun 16, 10:00 AM', duration: '25 min', source: 'Sequence' },
  { id: 'm6', contactName: 'Lisa Park', contactTitle: 'Network Engineer', company: 'Cascade Telecom', title: 'SD-WAN + SSE Demo', status: 'No Show', scheduledAt: 'Jun 13, 1:00 PM', duration: '45 min', source: 'Inbound' },
  { id: 'm7', contactName: 'Priya Patel', contactTitle: 'Data Privacy Officer', company: 'ClearPath Financial', title: 'GDPR / Data Governance Briefing', status: 'Rescheduled', scheduledAt: 'Jun 28, 3:00 PM', duration: '30 min', source: 'Sequence' },
];

// ─── Email outbox ─────────────────────────────────────────────────────────────

export const outboxEmails: OutboxEmail[] = [
  { id: 'e1', to: 'james.chen@meridianhealth.com', contactTitle: 'VP Infrastructure', company: 'Meridian Health System', subject: 'SSE Architecture Overview — Built for Healthcare', status: 'Scheduled', scheduledAt: 'Today, 4:00 PM', sentAt: null, openedAt: null, sequenceName: 'Enterprise SSE Launch', stepNumber: 2 },
  { id: 'e2', to: 'rachel.torres@nexgenbiotech.com', contactTitle: 'Security Architect', company: 'NexGen Biotech', subject: 'Zero Trust Network Access — Where to Start', status: 'Scheduled', scheduledAt: 'Today, 5:30 PM', sentAt: null, openedAt: null, sequenceName: 'CISO High-Touch ZTNA', stepNumber: 1 },
  { id: 'e3', to: 'kevin.hart@rockymtn.energy', contactTitle: 'Endpoint Security Manager', company: 'Rocky Mountain Energy', subject: 'Your VPN Consolidation ROI — The Numbers', status: 'Scheduled', scheduledAt: 'Today, 3:30 PM', sentAt: null, openedAt: null, sequenceName: 'VPN Replacement Track', stepNumber: 4 },
  { id: 'e4', to: 'lisa.park@cascadetelecom.com', contactTitle: 'Network Engineer', company: 'Cascade Telecom', subject: "SD-WAN + SSE: The Converged Network You've Been Waiting For", status: 'Scheduled', scheduledAt: 'Jun 20, 2:00 PM', sentAt: null, openedAt: null, sequenceName: 'Mid-Market SASE Play', stepNumber: 3 },
  { id: 'e5', to: 'sarah.mitchell@pacificfinancial.com', contactTitle: 'CISO', company: 'Pacific Financial Group', subject: 'Zero Trust Executive Brief — Tailored for Financial Services', status: 'Opened', scheduledAt: 'Jun 14, 9:00 AM', sentAt: 'Jun 14, 9:01 AM', openedAt: 'Jun 14, 11:32 AM', sequenceName: 'CISO High-Touch ZTNA', stepNumber: 2 },
  { id: 'e6', to: 'priya.patel@clearpathfinancial.com', contactTitle: 'Data Privacy Officer', company: 'ClearPath Financial', subject: 'How Netskope Addresses GDPR in the Cloud', status: 'Sent', scheduledAt: 'Jun 17, 10:00 AM', sentAt: 'Jun 17, 10:00 AM', openedAt: null, sequenceName: 'GRC Compliance Track', stepNumber: 2 },
  { id: 'e7', to: 'angela.foster@riversideinsurance.com', contactTitle: 'Compliance Manager', company: 'Riverside Insurance Group', subject: 'PCI-DSS Compliance in the Age of Cloud — A Practical Guide', status: 'Replied', scheduledAt: 'Jun 15, 9:00 AM', sentAt: 'Jun 15, 9:00 AM', openedAt: 'Jun 15, 9:47 AM', sequenceName: 'GRC Compliance Track', stepNumber: 3 },
  { id: 'e8', to: 'tom.nguyen@globaledgeretail.com', contactTitle: 'VP IT Operations', company: 'GlobalEdge Retail', subject: 'Enterprise SSE for Distributed Retail — Free Assessment', status: 'Bounced', scheduledAt: 'Jun 14, 2:00 PM', sentAt: 'Jun 14, 2:00 PM', openedAt: null, sequenceName: 'Enterprise SSE Launch', stepNumber: 1 },
  { id: 'e9', to: 'monica.rodriguez@apexmfg.com', contactTitle: 'Director of Network Security', company: 'Apex Manufacturing', subject: 'Your SASE Webinar Follow-Up + Next Steps', status: 'Clicked', scheduledAt: 'Jun 15, 11:00 AM', sentAt: 'Jun 15, 11:00 AM', openedAt: 'Jun 15, 2:14 PM', sequenceName: 'Mid-Market SASE Play', stepNumber: 5 },
  { id: 'e10', to: 'brian.wallace@summitcapital.com', contactTitle: 'CIO', company: 'Summit Capital Partners', subject: 'Your SASE Journey: Phase 1 Roadmap', status: 'Replied', scheduledAt: 'Jun 10, 9:00 AM', sentAt: 'Jun 10, 9:00 AM', openedAt: 'Jun 10, 10:05 AM', sequenceName: 'CIO Executive Nurture', stepNumber: 4 },
];
