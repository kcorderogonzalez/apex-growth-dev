export interface CompetitorProfile {
  id: string;
  name: string;
  shortName: string;
  category: 'SSE' | 'SASE' | 'CASB' | 'NGFW' | 'Endpoint' | 'Cloud';
  color: string;        // tailwind text color
  bg: string;           // tailwind bg color
  border: string;
  strengths: string[];
  weaknesses: string[];
  winThemes: string[];
  keyDifferentiators: string[];   // Netskope advantages vs. this competitor
  talkingPoints: string[];
  objectionHandlers: { objection: string; response: string }[];
  proofPoints: string[];          // reference accounts, case studies
  crayonUrl?: string;
}

export const COMPETITORS: CompetitorProfile[] = [
  {
    id: 'zscaler',
    name: 'Zscaler',
    shortName: 'ZS',
    category: 'SSE',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    strengths: [
      'Largest SSE install base and brand recognition',
      'Strong ZIA internet security proxy',
      'Good SE / sales coverage in Enterprise',
      'ZPA (ZTNA) widely adopted',
    ],
    weaknesses: [
      'CASB is bolt-on via acquisition (Shiftech) — not natively integrated',
      'DLP lacks granularity for regulated data (HIPAA, PCI-DSS)',
      'No inline AI/ML for advanced threat detection on SaaS traffic',
      'High TCO when bundling ZIA + ZPA + CASB + DLP + Posture',
      'FedRAMP IL4 coverage limited vs. Netskope',
      'Private app connector architecture adds complexity',
    ],
    winThemes: [
      'Win on DLP depth — Netskope DLP covers 3,000+ data identifiers vs. ZS ~400',
      'Win on CASB coverage — native API-based CASB for 1,000+ SaaS apps',
      'Win on total cost — consolidate 3–5 ZS SKUs into one Netskope platform',
      'Win on AI/ML — Netskope AI-powered threat intelligence on SaaS traffic',
      'Win on FedRAMP — Netskope IL4 authorized; ZS still pending in key scopes',
    ],
    keyDifferentiators: [
      '3,000+ DLP data identifiers vs. ~400 in ZIA DLP',
      'Native CASB (not bolt-on) with inline + API coverage',
      'Single-pass cloud architecture reduces latency',
      'Netskope Cloud Confidence Index (CCI) for 60,000+ cloud apps',
      'Integrated Threat Exchange (ITE) with real-time SaaS threat Intel',
    ],
    talkingPoints: [
      '"ZS DLP is a checkbox feature — Netskope DLP was purpose-built for SaaS data protection."',
      '"Your ZS + CASB + DLP bundle is likely 30–40% more expensive than a comparable Netskope SSE license."',
      '"ZS CASB is the Shiftech acquisition stitched in — ask them about API latency on live DLP scans."',
      '"Netskope has twice the CASB app integrations — critical if you\'re running multi-cloud SaaS."',
    ],
    objectionHandlers: [
      {
        objection: 'We already have ZS ZIA — why replace it?',
        response: 'ZIA covers web proxy well, but if you need DLP on SaaS, M365 API scanning, or CASB with real coverage, ZIA alone leaves gaps. Netskope can co-exist as an overlay or a full replacement — your POC will show the delta on DLP hits.',
      },
      {
        objection: 'Zscaler has a better brand name in the market.',
        response: 'Gartner SSE MQ has Netskope as a Leader 3 years running — ranked #1 in execution in 2024. Our NPS is consistently 15–20 points higher than ZS in enterprise accounts.',
      },
    ],
    proofPoints: [
      'UBS: Replaced ZS with Netskope — saved $2.3M over 3 years',
      'IQVIA: 95% DLP alert reduction using Netskope ML-based classification',
      '20+ Fortune 100 financial services accounts running Netskope SSE',
    ],
  },
  {
    id: 'palo_alto',
    name: 'Palo Alto Networks (Prisma Access)',
    shortName: 'PA',
    category: 'SASE',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    strengths: [
      'Strong NGFW brand and existing firewall install base',
      'Prisma Access integrates well with Cortex XDR / XSOAR',
      'Large field sales force with executive relationships',
      'Cortex platform strategy resonates with CISOs',
    ],
    weaknesses: [
      'CASB and DLP added via acquisition (RedLock/Dig) — integration immature',
      'SASE pricing is among the highest in the market',
      'Prisma Access architecture requires on-prem nodes for branch deployments',
      'Complex multi-product bundle leads to long deployment timelines',
      'Cloud-native SaaS threat intel inferior to Netskope for API-based threats',
      'Customers with NGFW find it hard to justify SSE add-on cost',
    ],
    winThemes: [
      'Win on TCO — PA bundles are typically 40–60% more expensive than Netskope',
      'Win on SaaS-native security — Netskope built for cloud, PA adapted from firewall',
      'Win on speed to value — Netskope deploys in weeks, PA Prisma in months',
      'Win on pure-play SSE — no distraction from NGFW hardware roadmap',
      'Win on CASB maturity — Netskope CASB launched in 2012, PA CASB is < 3 years old',
    ],
    keyDifferentiators: [
      'Netskope purpose-built for cloud; PA is NGFW vendor adding SSE features',
      'Netskope deploys 60% faster (avg. 6 weeks vs. 15 weeks for Prisma Access)',
      'Netskope real-time ML threat detection on SaaS — PA relies on Wildfire sandbox',
      'Netskope Universal ZTNA covers 100% app types; PA covers ~60%',
      'No hardware dependency — 100% cloud-delivered',
    ],
    talkingPoints: [
      '"PA Prisma Access is a great NGFW company adding cloud security — Netskope was built cloud-first, cloud-only."',
      '"Your existing PA NGFW refresh budget is separate from SASE — don\'t let them bundle and inflate the price."',
      '"Ask PA for their CASB app coverage list — compare to Netskope\'s 1,000+ natively integrated apps."',
      '"PA deals take 2–3x longer to deploy. For your Q4 timeline, Netskope is the lower-risk choice."',
    ],
    objectionHandlers: [
      {
        objection: 'We already use PA NGFWs — easier to stay in one vendor.',
        response: 'NGFW and SSE solve different problems. Many PA NGFW customers run Netskope SSE alongside — in fact, we have 200+ joint customers. Your existing PA infrastructure stays; Netskope adds SaaS and ZTNA coverage PA Prisma can\'t match natively.',
      },
      {
        objection: 'PA is a bigger company with more resources.',
        response: 'Netskope focuses 100% on SASE/SSE — it\'s our only business. PA splits R&D across firewalls, EDR, SOAR, and cloud. Our SSE product velocity is measurably faster — check the last three MQ updates.',
      },
    ],
    proofPoints: [
      'Goldman Sachs: Replaced PA Prisma with Netskope — 45% cost reduction',
      'AstraZeneca: Chose Netskope over PA for global SSE rollout (60,000 users)',
      'Typical TCO comparison: $840K/yr Netskope vs. $1.3M/yr PA equivalent bundle',
    ],
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare One',
    shortName: 'CF',
    category: 'SASE',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    strengths: [
      'Largest global anycast network (fastest latency globally)',
      'Very aggressive pricing — typically 30–50% cheaper',
      'Strong developer and SMB brand recognition',
      'Magic Transit and CDN products create land-and-expand opportunities',
      'Simple onboarding and UI',
    ],
    weaknesses: [
      'CASB coverage is limited (< 200 apps) vs. enterprise needs',
      'DLP is early-stage and lacks regulated-data classifiers (HIPAA, PCI)',
      'No enterprise-grade SaaS threat intelligence',
      'Lacks advanced behavioural analytics (UEBA)',
      'Support and enterprise CS model not yet mature',
      'SaaS Security Posture Management (SSPM) not available',
    ],
    winThemes: [
      'Win on enterprise security depth — CF One is great for web, weak on SaaS',
      'Win on compliance — Netskope DLP/CASB meets HIPAA, PCI, SOX, GDPR out of the box',
      'Win on CASB maturity — 1,000+ apps vs. CF ~150',
      'Win on UEBA — Netskope behavior analytics detect insider threats; CF has none',
      'Win on enterprise support SLA and dedicated CSM',
    ],
    keyDifferentiators: [
      'Netskope: 1,000+ CASB app integrations; Cloudflare ~150',
      'Netskope DLP: 3,000+ pre-built identifiers; CF DLP < 50',
      'Netskope UEBA: ML-based anomaly detection; CF: none',
      'Netskope SSPM: continuous posture monitoring; CF: not on roadmap',
      'Netskope enterprise support: 24/7 dedicated TAM; CF: ticket-based',
    ],
    talkingPoints: [
      '"Cloudflare is a network company. Their CASB and DLP are 1.0 products — for a regulated industry, that\'s risk."',
      '"CF One pricing is attractive for SMB. For your 10,000-user enterprise with compliance requirements, the gaps cost more than the savings."',
      '"Ask CF: what\'s their HIPAA BAA coverage? Their DLP for PHI/PII? Your compliance team will find the gaps."',
    ],
    objectionHandlers: [
      {
        objection: 'Cloudflare is significantly cheaper.',
        response: 'CF is cheaper for web-only security. Add CASB, DLP, SSPM, and UEBA that you need for compliance — the gap closes fast. Netskope typically wins on 3-year TCO when total data protection scope is included.',
      },
    ],
    proofPoints: [
      'Multiple FS customers replaced early CF One POCs with Netskope after compliance gap analysis',
      'Netskope DLP prevented 3x more data exfiltration events in head-to-head POC vs. CF One (client available on request)',
    ],
  },
  {
    id: 'cisco',
    name: 'Cisco (Umbrella / SSE)',
    shortName: 'CS',
    category: 'SASE',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    strengths: [
      'Massive install base and enterprise relationships',
      'Bundled with Cisco network stack (Meraki, Catalyst, Duo)',
      'Cisco XDR integration for SOC teams',
      'Strong government/defense vertical relationships',
    ],
    weaknesses: [
      'Umbrella CASB is limited and rarely used in enterprise deals',
      'Acquisition-stitched product (Umbrella + OpenDNS + Cloudlock) lacks cohesion',
      'ZTNA is bolted on — not natively designed for zero trust',
      'DLP lags behind market leaders by 2–3 years',
      'High licensing complexity — requires multiple Cisco products to match SSE',
      'Post-acquisition Cloudlock CASB has stagnated in development',
    ],
    winThemes: [
      'Win on CASB modernity — Cloudlock was acquired in 2017, barely updated',
      'Win on zero trust architecture — Netskope ZTNA is native, Cisco\'s is stitched',
      'Win on product velocity — Cisco SSE roadmap has slowed vs. pure-play vendors',
      'Win on multi-cloud — Netskope covers AWS, Azure, GCP natively; Cisco favors on-prem',
    ],
    keyDifferentiators: [
      'Netskope: single-vendor native SSE; Cisco: multiple products bundled',
      'Netskope ZTNA: continuous trust evaluation; Cisco: session-based',
      'Netskope: 60,000+ cloud app visibility; Cisco: ~15,000',
      'Netskope SSPM: real-time SaaS posture; Cisco: none',
    ],
    talkingPoints: [
      '"Cisco SSE is Umbrella + Cloudlock + AnyConnect stitched together — the user experience shows it."',
      '"Ask Cisco for their CASB API coverage list — compare it to Netskope\'s 1,000+ natively integrated apps."',
      '"Cisco is a networking company. SASE is strategic for Netskope. Who do you want leading your zero trust journey?"',
    ],
    objectionHandlers: [
      {
        objection: 'We use Cisco for everything — easier to consolidate.',
        response: 'Cisco\'s network portfolio is excellent. Their SSE portfolio is 3–4 years behind pure-play vendors. Many Cisco network customers add Netskope for SSE — the API integration is mature and the security outcomes are significantly better.',
      },
    ],
    proofPoints: [
      'State Street: Replaced Cisco Umbrella with Netskope — improved DLP coverage by 80%',
      'Major manufacturing co: POC showed Cisco missed 60% of DLP events that Netskope caught',
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft (Defender / Entra)',
    shortName: 'MS',
    category: 'Cloud',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    strengths: [
      'Already licensed via M365 E5 — "zero incremental cost" narrative',
      'Tight M365 integration (Teams, SharePoint, OneDrive)',
      'Entra ID is the identity plane for most enterprises',
      'Strong executive relationships at CIO/CTO level',
    ],
    weaknesses: [
      'Defender for Cloud Apps is M365-only — minimal third-party SaaS',
      'Global Secure Access (SSE product) is early-stage and not enterprise-proven',
      'No UEBA beyond M365 telemetry',
      'DLP requires E5 + Purview add-on — and only covers M365 data',
      'No web proxy or SWG (Secure Web Gateway) capability',
      'Multi-cloud and non-Microsoft SaaS blind spots',
    ],
    winThemes: [
      'Win on multi-cloud SaaS coverage — MS only sees M365; Netskope sees everything',
      'Win on third-party app security — Salesforce, Workday, GitHub, ServiceNow, etc.',
      'Win on SWG — Microsoft has no web proxy; Netskope covers all web traffic',
      'Win on UEBA scope — MS UEBA is M365-only; Netskope sees all cloud activity',
      'Win on SSE maturity — MS Global Secure Access is 2 years old; Netskope is 12+ years',
    ],
    keyDifferentiators: [
      'Netskope covers 1,000+ third-party SaaS apps; MS DFCA: M365 only',
      'Netskope SWG: full web proxy + SSL inspection; MS: none',
      'Netskope UEBA: cross-app behavioral analytics; MS: limited to M365',
      'Netskope ZTNA: universal app support; MS: works best with Azure AD apps',
    ],
    talkingPoints: [
      '"M365 E5 gives you DFCA for M365. What about Salesforce, Workday, GitHub, and the 900 other SaaS apps your users touch every day?"',
      '"Microsoft\'s SSE (Global Secure Access) was announced in 2023 — Netskope has been purpose-built for 12+ years."',
      '"Ask Microsoft: what\'s their SWG coverage? What\'s their DLP story for non-Microsoft apps? You\'ll hear \'on the roadmap\'."',
      '"The M365 E5 license covers data in Microsoft\'s cloud — Netskope protects data everywhere it goes."',
    ],
    objectionHandlers: [
      {
        objection: 'We already pay for E5 — Microsoft SSE is essentially free.',
        response: 'E5 gives you DFCA for M365 — which is excellent for Microsoft data. But 40–60% of enterprise data risk sits in non-Microsoft SaaS. Netskope protects your full cloud footprint. Most CISOs run both: MS for identity + M365 protection, Netskope for everything else.',
      },
      {
        objection: 'We want to consolidate on Microsoft.',
        response: 'Microsoft is a great choice for identity, productivity, and endpoint. SSE is a specialized discipline — and Microsoft themselves acknowledge they\'re building toward parity, not there yet. A 3-year consolidation bet on MS SSE is a security risk today.',
      },
    ],
    proofPoints: [
      'Siemens: Runs Entra ID + Netskope — best of both worlds at 300,000 users',
      'Multiple E5 customers run Netskope as the SWG + CASB layer; MS DFCA for M365 DLP',
      'Netskope catches 4x more shadow IT apps than Defender for Cloud Apps in head-to-head deployments',
    ],
  },
  {
    id: 'skyhigh',
    name: 'Skyhigh Security',
    shortName: 'SH',
    category: 'CASB',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    strengths: [
      'Legacy McAfee/MVision CASB customers still in contract',
      'Strong relationships in government (FedRAMP High authorized)',
      'Competitive pricing due to market share pressure',
      'SWG + CASB bundle available',
    ],
    weaknesses: [
      'Carve-out from Trellix — product investment pace has slowed significantly',
      'Limited field sales and SE coverage globally',
      'ZTNA offering is immature compared to SSE leaders',
      'No AI/ML-based threat detection innovation',
      'Customer support has degraded since Trellix separation',
      'Many legacy McAfee customers actively looking to migrate',
    ],
    winThemes: [
      'Win on innovation velocity — Skyhigh has slowed R&D post-carve-out',
      'Win on enterprise support — Netskope NPS 2x higher than Skyhigh in enterprise',
      'Win on ZTNA — Netskope ZTNA is market-leading; Skyhigh is minimal',
      'Win on customer confidence — Skyhigh ownership uncertainty creates risk',
      'Win on AI/ML — Netskope has active threat intelligence; Skyhigh has stagnated',
    ],
    keyDifferentiators: [
      'Netskope: 3 years of continued Gartner Leader recognition; Skyhigh: Challenger',
      'Netskope ZTNA: full private app coverage; Skyhigh: basic web-only',
      'Netskope: 500+ engineers on SSE; Skyhigh: < 100 post-carve-out',
      'Netskope active threat Intel updates daily; Skyhigh: monthly',
    ],
    talkingPoints: [
      '"Skyhigh is a McAfee carve-out — ask them about their R&D headcount and product roadmap since the split."',
      '"If you\'re renewing Skyhigh, make sure you negotiate — they\'re under revenue pressure and will discount heavily."',
      '"Netskope has invested $500M+ in product since 2020. Skyhigh has restructured twice. Which roadmap do you trust?"',
    ],
    objectionHandlers: [
      {
        objection: 'We\'re an existing McAfee/Skyhigh customer with data already in the platform.',
        response: 'We have a full migration playbook for Skyhigh customers — typically 4–6 weeks to migrate policies and DLP rules. Many Skyhigh customers cite the migration as straightforward; the hard part is always the procurement decision, not the technical move.',
      },
    ],
    proofPoints: [
      'AXA: Migrated 40,000 users from McAfee MVISION to Netskope in 8 weeks',
      '25+ Skyhigh/McAfee migrations completed by Netskope PS in 2024',
    ],
  },
  {
    id: 'broadcom',
    name: 'Broadcom (Symantec)',
    shortName: 'BC',
    category: 'SSE',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    strengths: [
      'Massive Symantec legacy install base in enterprise',
      'Strong SWG (Blue Coat) heritage',
      'DLP from legacy Vontu/Symantec — deep feature set',
      'Federal government relationships and FedRAMP',
    ],
    weaknesses: [
      'Broadcom acquisition has led to talent exodus and support degradation',
      'CASB integration with SWG is complex and slow',
      'Legacy on-prem architecture being replatformed — migration risk for customers',
      'Sales motion changed — Broadcom focuses only on top 600 accounts',
      'Pricing dramatically increased post-acquisition (50–200% uplift)',
      'Many existing Symantec customers are actively evaluating alternatives',
    ],
    winThemes: [
      'Win on existing Broadcom dissatisfaction — TAM tool showing 60%+ renewal risk',
      'Win on pricing — Broadcom raised prices 50–200%; Netskope holds competitive pricing',
      'Win on support quality — Broadcom support SLAs degraded post-acquisition',
      'Win on cloud-native architecture — Symantec SWG is being replatformed (risk!)',
      'Win on innovation — Broadcom is harvesting Symantec, not investing',
    ],
    keyDifferentiators: [
      'Netskope: cloud-native from day 1; Broadcom: SaaS migration of on-prem appliance',
      'Netskope: 24/7 dedicated CSM; Broadcom: support degraded, tickets routed offshore',
      'Netskope: competitive renewal pricing; Broadcom: 50–200% price increases reported',
      'Netskope: unified console; Broadcom: separate SWG + CASB + DLP UIs',
    ],
    talkingPoints: [
      '"Broadcom bought Symantec as a cash cow — not to invest in it. Ask their R&D team how many PMs left since 2019."',
      '"Their existing customers are our biggest source of pipeline — 40% of our new logos in 2024 came from Broadcom/Symantec migrations."',
      '"If they\'re renewing Broadcom and taking a 100% price increase — that\'s the perfect time for a POC."',
    ],
    objectionHandlers: [
      {
        objection: 'Symantec DLP is extremely mature — hard to switch.',
        response: 'Symantec DLP (Vontu) is excellent for endpoint/email DLP. Netskope DLP is superior for cloud and SaaS data protection. Many customers run Symantec DLP for endpoint + Netskope for cloud — it\'s not all-or-nothing. We have a migration tool that imports Symantec DLP policies.',
      },
    ],
    proofPoints: [
      '40% of Netskope new logos in FY24 came from Broadcom/Symantec displacements',
      'Cargill: Migrated from Symantec SWG + CASB to Netskope in 12 weeks',
      'Average Broadcom renewal increase for displaced accounts: 140%',
    ],
  },
  {
    id: 'crowdstrike',
    name: 'CrowdStrike (Falcon)',
    shortName: 'CS2',
    category: 'Endpoint',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    strengths: [
      'Best-in-class EDR/XDR with strong security credibility',
      'Charlotte AI resonates with CISO/SOC buyers',
      'Falcon platform vision — single agent strategy',
      'Strong channel and alliance partnerships',
    ],
    weaknesses: [
      'No cloud-native SWG or web proxy capability',
      'CASB is early-stage (acquired Reposify, Bionic) — not enterprise-ready',
      'ZTNA product (Falcon Identity) is identity-focused, not network-based',
      'No DLP for SaaS data in transit',
      'No FedRAMP IL4/IL5 for SSE use cases',
      'July 2024 outage has created credibility concerns at some accounts',
    ],
    winThemes: [
      'Win on SaaS coverage — CrowdStrike has no SWG or inline CASB capability',
      'Win on data protection — Netskope DLP protects data in motion; Falcon covers endpoint only',
      'Win on complementary positioning — CrowdStrike for endpoint + Netskope for network/cloud',
      'Win on ZTNA — Netskope ZTNA is network-based and app-agnostic; Falcon Identity is narrow',
    ],
    keyDifferentiators: [
      'Netskope SWG: full web/cloud proxy; CrowdStrike: none',
      'Netskope CASB: 1,000+ apps, API + inline; CrowdStrike CASB: early, app-limited',
      'Netskope DLP: inline SaaS data protection; CrowdStrike: endpoint DLP only',
      'Netskope + CrowdStrike: complementary — 300+ joint customers globally',
    ],
    talkingPoints: [
      '"CrowdStrike and Netskope are highly complementary — 300+ joint customers. CS secures the endpoint; Netskope secures cloud traffic and data."',
      '"Ask CrowdStrike for their cloud DLP story — for data flowing to M365, Salesforce, GitHub. They\'ll point you to Netskope."',
      '"If the CISO is a CrowdStrike fan, that\'s great — we integrate with Falcon via API for shared threat intel. Both vendors win."',
    ],
    objectionHandlers: [
      {
        objection: 'We want to standardize on CrowdStrike for all security.',
        response: 'CrowdStrike is the best endpoint/identity vendor in the market. SSE is a distinct security domain — network traffic, cloud proxying, SaaS DLP, CASB. CS leadership would confirm this: they partner with Netskope because they don\'t compete here.',
      },
    ],
    proofPoints: [
      '300+ organizations run Netskope + CrowdStrike jointly as a best-of-breed SSE + EDR stack',
      'CrowdStrike and Netskope are integration partners — joint solution brief available',
    ],
  },
];

export const COMPETITOR_LIST = COMPETITORS.map(c => ({ id: c.id, name: c.name, shortName: c.shortName, category: c.category }));

export function getCompetitor(id: string): CompetitorProfile | undefined {
  return COMPETITORS.find(c => c.id === id);
}

export function getWinStrategy(
  primary?: string,
  secondary?: string,
  incumbent?: string,
): {
  focusAreas: string[];
  keyMessages: string[];
  objectionHandlers: { objection: string; response: string }[];
  proofPoints: string[];
  urgency: string;
} {
  const ids = [primary, secondary, incumbent].filter(Boolean) as string[];
  const profiles = ids.map(id => getCompetitor(id)).filter(Boolean) as CompetitorProfile[];

  if (profiles.length === 0) {
    return {
      focusAreas: ['Define competitive landscape to unlock tailored win strategy'],
      keyMessages: [],
      objectionHandlers: [],
      proofPoints: [],
      urgency: '',
    };
  }

  const focusAreas = [...new Set(profiles.flatMap(p => p.winThemes))].slice(0, 5);
  const keyMessages = [...new Set(profiles.flatMap(p => p.talkingPoints))].slice(0, 4);
  const objectionHandlers = profiles.flatMap(p => p.objectionHandlers).slice(0, 4);
  const proofPoints = [...new Set(profiles.flatMap(p => p.proofPoints))].slice(0, 5);

  const incumbentProfile = incumbent ? getCompetitor(incumbent) : undefined;
  const urgency = incumbentProfile
    ? `${incumbentProfile.name} is the incumbent — target renewal timing and document switching risks early.`
    : 'No incumbent identified — frame this as a greenfield opportunity to define the standard.';

  return { focusAreas, keyMessages, objectionHandlers, proofPoints, urgency };
}
