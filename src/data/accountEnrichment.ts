export interface AccountEnrichment {
  companyName: string;
  snapshot: {
    industry: string;
    revenueTier: string;
    employees: string;
    hq: string;
    publicOrPrivate: 'Public' | 'Private' | 'PE-Backed';
    stockTicker?: string;
  };
  financialSignals: {
    annualRevenue: string;
    recentMAndA?: string;
    budgetCycleNote: string;
    fiscalYearEnd: string;
  };
  securityPosture: {
    complianceMandates: string[];
    knownIncidents?: string;
    zeroTrustMaturity: 'Early' | 'In Progress' | 'Advanced';
    notes: string;
  };
  techStack: {
    cloudFootprint: string[];
    confirmedSaseVendors: string[];
    saasSprawl: 'Low' | 'Medium' | 'High';
    notes: string;
  };
  competitiveExposure: {
    likelyIncumbents: string[];
    contractRenewalWindow?: string;
    displacementDifficulty: 'Low' | 'Medium' | 'High';
    notes: string;
  };
}

export const accountEnrichment: Record<string, AccountEnrichment> = {
  'Apple': {
    companyName: 'Apple',
    snapshot: {
      industry: 'Consumer Electronics / Technology',
      revenueTier: '$380B+',
      employees: '~161,000',
      hq: 'Cupertino, CA',
      publicOrPrivate: 'Public',
      stockTicker: 'AAPL',
    },
    financialSignals: {
      annualRevenue: '$383B (FY2023)',
      recentMAndA: 'Acquired multiple AI startups in 2024–2025 to bolster on-device AI',
      budgetCycleNote: 'Fiscal year budgets locked by September; large discretionary security spend visible in Q1 procurement cycles',
      fiscalYearEnd: 'September',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'GDPR', 'CCPA', 'PCI-DSS', 'ISO 27001'],
      knownIncidents: 'XcodeGhost supply-chain attack (2015) drove long-term investment in supply chain security controls',
      zeroTrustMaturity: 'Advanced',
      notes: 'Apple operates a highly proprietary security stack. Internal security engineering is world-class; third-party SASE adoption is selective but growing for contractor and retail network segments.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary for services)', 'Azure', 'GCP', 'Private data centers'],
      confirmedSaseVendors: ['Zscaler (reported for enterprise access)'],
      saasSprawl: 'Medium',
      notes: 'Heavy internal tooling; significant SaaS adoption in enterprise functions (Salesforce, ServiceNow). Retail and contractor environments are SASE-addressable.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Palo Alto Networks'],
      contractRenewalWindow: 'Q4 2026 estimated',
      displacementDifficulty: 'High',
      notes: 'Security decisions highly centralized; long procurement cycles. Best entry point is contractor/third-party access use case or retail network transformation.',
    },
  },

  'Microsoft': {
    companyName: 'Microsoft',
    snapshot: {
      industry: 'Cloud Computing / Enterprise Software',
      revenueTier: '$210B+',
      employees: '~220,000',
      hq: 'Redmond, WA',
      publicOrPrivate: 'Public',
      stockTicker: 'MSFT',
    },
    financialSignals: {
      annualRevenue: '$211B (FY2024)',
      recentMAndA: 'Acquired Activision Blizzard ($69B, 2023); ongoing acquisitions in AI/cloud security',
      budgetCycleNote: 'Fiscal year starts July 1; large security budget renewal in Q1 (July–September)',
      fiscalYearEnd: 'June',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'FedRAMP High', 'ISO 27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'CJIS'],
      knownIncidents: 'Storm-0558 nation-state breach (2023) compromised Exchange Online email accounts; subsequent CSRB review and Secure Future Initiative launched',
      zeroTrustMaturity: 'Advanced',
      notes: 'Microsoft is both a SASE competitor (via Entra Internet Access / Global Secure Access) and a potential customer for third-party SSE for non-Microsoft workloads. Compliance pressure from government contracts drives advanced posture.',
    },
    techStack: {
      cloudFootprint: ['Azure (dominant)', 'AWS (selective workloads)', 'GCP (minimal)'],
      confirmedSaseVendors: ['Microsoft Entra Internet Access (internal)', 'Zscaler (reported legacy)'],
      saasSprawl: 'High',
      notes: 'Microsoft 365 ecosystem is pervasive. Third-party SaaS sprawl significant due to Activision and LinkedIn subsidiaries. Netskope angle: securing non-Microsoft cloud apps and subsidiaries.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Microsoft (self)', 'Zscaler'],
      contractRenewalWindow: 'Q1 FY2027 (July 2026)',
      displacementDifficulty: 'High',
      notes: 'Native Microsoft SASE play is a headwind. Best displacement angle is multi-cloud data security, subsidiary environments, or advanced DLP where Entra Internet Access falls short.',
    },
  },

  'Alphabet': {
    companyName: 'Alphabet',
    snapshot: {
      industry: 'Internet / Cloud / Advertising',
      revenueTier: '$300B+',
      employees: '~182,000',
      hq: 'Mountain View, CA',
      publicOrPrivate: 'Public',
      stockTicker: 'GOOGL',
    },
    financialSignals: {
      annualRevenue: '$307B (FY2023)',
      recentMAndA: 'Acquired Mandiant ($5.4B, 2022); Wiz acquisition pending (~$23B, 2025)',
      budgetCycleNote: 'Annual budget cycle aligns to calendar year; security tech spend concentrated in Q4 approval and Q1 deployment',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'GDPR', 'CCPA', 'FedRAMP', 'ISO 27001', 'PCI-DSS'],
      knownIncidents: 'Google+ data exposure (2018) accelerated zero-trust BeyondCorp initiative',
      zeroTrustMaturity: 'Advanced',
      notes: 'BeyondCorp is the original zero-trust architecture; Alphabet is a thought leader. Netskope opportunity lies in GCP-adjacent data security and protecting third-party SaaS access outside Google Workspace.',
    },
    techStack: {
      cloudFootprint: ['GCP (dominant)', 'Internal private cloud'],
      confirmedSaseVendors: ['BeyondCorp Enterprise (internal)'],
      saasSprawl: 'Medium',
      notes: 'Primarily self-hosted and GCP-native. Non-Google SaaS and partner integrations create shadow IT exposure. Mandiant and Wiz integration creates new security data flows.',
    },
    competitiveExposure: {
      likelyIncumbents: ['BeyondCorp Enterprise (Google internal)', 'Palo Alto Networks (Prisma Access)'],
      contractRenewalWindow: 'Q4 2026',
      displacementDifficulty: 'High',
      notes: 'Google builds much of its own security infrastructure. Best angle: data protection for unmanaged devices and third-party contractors accessing GCP.',
    },
  },

  'Amazon': {
    companyName: 'Amazon',
    snapshot: {
      industry: 'E-Commerce / Cloud / Logistics',
      revenueTier: '$570B+',
      employees: '~1,525,000',
      hq: 'Seattle, WA',
      publicOrPrivate: 'Public',
      stockTicker: 'AMZN',
    },
    financialSignals: {
      annualRevenue: '$574B (FY2023)',
      recentMAndA: 'Acquired iRobot (blocked); ongoing investment in Anthropic ($4B+)',
      budgetCycleNote: 'AWS and corporate budgets on calendar year; large enterprise security decisions often Q3–Q4',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'PCI-DSS', 'FedRAMP High', 'HIPAA', 'ISO 27001', 'GDPR', 'CCPA'],
      knownIncidents: 'Twitch data breach (2021, subsidiary) exposed source code and creator payout data',
      zeroTrustMaturity: 'In Progress',
      notes: 'AWS is a cloud provider but Amazon corporate and retail divisions have significant SASE needs. Enormous workforce including warehouse and logistics creates unique endpoint diversity challenges.',
    },
    techStack: {
      cloudFootprint: ['AWS (dominant)', 'Azure (selective)', 'GCP (minimal)'],
      confirmedSaseVendors: ['Zscaler (reported for corporate access)'],
      saasSprawl: 'High',
      notes: 'Massive SaaS footprint across retail, AWS, Alexa, advertising, and entertainment divisions. Each subsidiary operates semi-independently with its own security posture.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Palo Alto Networks', 'Cisco (Umbrella)'],
      contractRenewalWindow: 'Q2 2027 estimated',
      displacementDifficulty: 'High',
      notes: 'AWS division builds competing security services (AWS Security Hub, CloudFront Shield). Best angle: non-AWS workload protection and corporate employee access management.',
    },
  },

  'NVIDIA': {
    companyName: 'NVIDIA',
    snapshot: {
      industry: 'Semiconductors / AI Infrastructure',
      revenueTier: '$60B+',
      employees: '~36,000',
      hq: 'Santa Clara, CA',
      publicOrPrivate: 'Public',
      stockTicker: 'NVDA',
    },
    financialSignals: {
      annualRevenue: '$60B (FY2024)',
      recentMAndA: 'Attempted Arm acquisition blocked (2022); acquired Mellanox ($6.9B, 2020)',
      budgetCycleNote: 'Fiscal year ends January; major security budget decisions in Q4 (November–January)',
      fiscalYearEnd: 'January',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'Export Controls (EAR/ITAR)', 'ISO 27001', 'GDPR'],
      knownIncidents: 'Lapsus$ ransomware attack (2022) leaked DLSS source code and employee credentials',
      zeroTrustMaturity: 'In Progress',
      notes: 'IP protection is existential — GPU designs and AI model weights are crown jewels. Export control compliance adds a unique regulatory layer. Post-Lapsus$ incident drove significant security investment.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure', 'GCP', 'NVIDIA DGX Cloud (self)'],
      confirmedSaseVendors: ['Zscaler (post-breach deployment reported)'],
      saasSprawl: 'Medium',
      notes: 'Engineering-heavy workforce with high SaaS adoption. NVIDIA DGX Cloud creates unique internal cloud security requirements. Partner and customer access to AI development environments is a key risk surface.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Palo Alto Networks'],
      contractRenewalWindow: 'Q3 2026 (October–November)',
      displacementDifficulty: 'Medium',
      notes: 'Post-breach refresh cycle creates displacement opportunity. Key angle: DLP for AI model and chip design data, and securing remote engineering access.',
    },
  },

  'Meta': {
    companyName: 'Meta',
    snapshot: {
      industry: 'Social Media / Digital Advertising / AR/VR',
      revenueTier: '$130B+',
      employees: '~67,000',
      hq: 'Menlo Park, CA',
      publicOrPrivate: 'Public',
      stockTicker: 'META',
    },
    financialSignals: {
      annualRevenue: '$134B (FY2023)',
      budgetCycleNote: 'Calendar year budget cycle; security investments often announced alongside infrastructure capex in Q1 earnings',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['GDPR', 'CCPA', 'SOX', 'FTC Consent Decree (2012, 2019)', 'ISO 27001'],
      knownIncidents: 'Cambridge Analytica data misuse scandal (2018); 533M user record scrape exposed (2021)',
      zeroTrustMaturity: 'Advanced',
      notes: 'FTC consent decrees mandate a comprehensive privacy program. Meta has a large internal security team and custom-built zero-trust tooling. SASE opportunity is in contractor access and Reality Labs division.',
    },
    techStack: {
      cloudFootprint: ['Meta private cloud (dominant)', 'AWS (selective)', 'Azure (selective)'],
      confirmedSaseVendors: ['Zscaler (reported for remote access)'],
      saasSprawl: 'Medium',
      notes: 'Heavily self-hosted. Reality Labs (Quest/AR) and WhatsApp/Instagram subsidiaries have distinct security architectures. Cross-platform data flows create complex DLP requirements.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Palo Alto Networks (Prisma Access)'],
      contractRenewalWindow: 'Q4 2026',
      displacementDifficulty: 'High',
      notes: 'Large internal security engineering org. Best angle: Reality Labs physical-digital convergence security and data protection compliance under FTC oversight.',
    },
  },

  'JPMorgan Chase': {
    companyName: 'JPMorgan Chase',
    snapshot: {
      industry: 'Financial Services / Banking',
      revenueTier: '$160B+',
      employees: '~309,000',
      hq: 'New York, NY',
      publicOrPrivate: 'Public',
      stockTicker: 'JPM',
    },
    financialSignals: {
      annualRevenue: '$158B (FY2023)',
      recentMAndA: 'Acquired First Republic Bank ($10.6B, 2023)',
      budgetCycleNote: 'Calendar year budgets; CISO and technology spend approved in Q4 for following year; First Republic integration creating incremental security spend in 2025–2026',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'PCI-DSS', 'GLBA', 'FFIEC', 'DORA (EU)', 'NY DFS Cybersecurity Regulation', 'GDPR'],
      knownIncidents: '2014 breach exposed contact data of 76M households; drove $600M+ annual cybersecurity investment',
      zeroTrustMaturity: 'Advanced',
      notes: 'JPMorgan spends ~$15B/year on technology and >$600M on cybersecurity. Jamie Dimon has cited cyber as the #1 threat. Advanced zero-trust architecture in place; SASE opportunity is in branch banking and contractor access.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure', 'Private data centers (significant)'],
      confirmedSaseVendors: ['Zscaler (confirmed enterprise deployment)', 'Cisco (legacy)'],
      saasSprawl: 'High',
      notes: 'Massive SaaS footprint across trading, retail banking, asset management, and corporate functions. First Republic integration adds legacy infrastructure to secure.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Cisco (Umbrella/SD-WAN)', 'Palo Alto Networks'],
      contractRenewalWindow: 'Q1 2027',
      displacementDifficulty: 'Medium',
      notes: 'First Republic integration creates natural consolidation opportunity. DORA compliance deadline pressure in EU operations is a compelling event. DLP and cloud security for trading data is key differentiator.',
    },
  },

  'Goldman Sachs': {
    companyName: 'Goldman Sachs',
    snapshot: {
      industry: 'Investment Banking / Financial Services',
      revenueTier: '$45B+',
      employees: '~45,000',
      hq: 'New York, NY',
      publicOrPrivate: 'Public',
      stockTicker: 'GS',
    },
    financialSignals: {
      annualRevenue: '$46B (FY2023)',
      recentMAndA: 'Divested Marcus consumer banking assets (2023–2024); refocusing on core IB and asset management',
      budgetCycleNote: 'Calendar year budget; technology and security budgets heavily influenced by annual bonus/comp cycle ending in Q4',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'PCI-DSS', 'GLBA', 'FFIEC', 'SEC Rule 17a-4', 'MiFID II', 'DORA', 'NY DFS', 'GDPR'],
      zeroTrustMaturity: 'In Progress',
      notes: 'Goldman invests heavily in proprietary trading systems security. Post-Marcus divestiture, security architecture is being rationalized. Regulatory scrutiny from SEC and CFTC on data residency is a key driver.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Private data centers (significant for trading)'],
      confirmedSaseVendors: ['Palo Alto Networks (Prisma Access, reported)'],
      saasSprawl: 'Medium',
      notes: 'Trading infrastructure is largely private. Corporate functions and asset management have high SaaS adoption. Cloud migration accelerating post-Marcus simplification.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Palo Alto Networks', 'Zscaler'],
      contractRenewalWindow: 'Q3 2026',
      displacementDifficulty: 'Medium',
      notes: 'Architecture rationalization post-Marcus creates refresh opportunity. DORA compliance in London/EU offices is a compelling event. DLP for M&A deal data is a strong value proposition.',
    },
  },

  'Cisco': {
    companyName: 'Cisco',
    snapshot: {
      industry: 'Networking / Cybersecurity / Enterprise Technology',
      revenueTier: '$55B+',
      employees: '~85,000',
      hq: 'San Jose, CA',
      publicOrPrivate: 'Public',
      stockTicker: 'CSCO',
    },
    financialSignals: {
      annualRevenue: '$57B (FY2023)',
      recentMAndA: 'Acquired Splunk ($28B, 2024); acquired Isovalent (eBPF security)',
      budgetCycleNote: 'Fiscal year ends July; large security and cloud infrastructure spend approved in Q3–Q4',
      fiscalYearEnd: 'July',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'ISO 27001', 'FedRAMP', 'GDPR', 'PCI-DSS'],
      zeroTrustMaturity: 'Advanced',
      notes: 'Cisco is both a SASE competitor (Cisco+ Secure Connect, Umbrella) and a large enterprise. Internal security team is world-class. Splunk integration creates new internal SIEM/SOAR use cases. Netskope opportunity: non-Cisco workloads and data security layer.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure', 'GCP', 'Private data centers'],
      confirmedSaseVendors: ['Cisco Umbrella (internal)', 'Cisco+ Secure Connect (internal pilot)'],
      saasSprawl: 'High',
      notes: 'Massive Salesforce, Workday, and ServiceNow footprint. Splunk acquisition adds a large additional employee base with its own tooling. Cross-company SaaS rationalization underway.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Cisco (self-deployed Umbrella/SASE)', 'Palo Alto Networks'],
      contractRenewalWindow: 'Q4 FY2026 (April–July 2026)',
      displacementDifficulty: 'High',
      notes: 'Cisco is a direct SASE competitor; internal dogfooding is strong. Best angle: data security and DLP capabilities where Cisco Umbrella has gaps, particularly for cloud-native apps.',
    },
  },

  'ServiceNow': {
    companyName: 'ServiceNow',
    snapshot: {
      industry: 'Enterprise Software / ITSM / AI Platform',
      revenueTier: '$10B+',
      employees: '~22,000',
      hq: 'Santa Clara, CA',
      publicOrPrivate: 'Public',
      stockTicker: 'NOW',
    },
    financialSignals: {
      annualRevenue: '$10.1B (FY2023)',
      budgetCycleNote: 'Calendar year budget; hyper-growth mode means security budget grows proportionally with ARR — strong buying signal in Q4 and Q2',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'ISO 27001', 'FedRAMP High', 'GDPR', 'SOC 2 Type II', 'PCI-DSS'],
      zeroTrustMaturity: 'In Progress',
      notes: 'ServiceNow holds sensitive IT and HR data for thousands of enterprises, making it a high-value target. FedRAMP High authorization demands rigorous access controls. Rapid hiring growth outpaces security architecture maturity.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure (secondary)', 'GCP (selective)'],
      confirmedSaseVendors: ['Zscaler (reported)'],
      saasSprawl: 'High',
      notes: 'Engineering and sales teams use diverse SaaS tools. AI platform expansion (Now Assist) increases data sensitivity. High contractor density creates privileged access risk.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Palo Alto Networks'],
      contractRenewalWindow: 'Q4 2026',
      displacementDifficulty: 'Medium',
      notes: 'Zscaler relationship may be early-stage given growth trajectory. Now Assist AI data flows create new DLP requirements that are a strong Netskope wedge.',
    },
  },

  'Salesforce': {
    companyName: 'Salesforce',
    snapshot: {
      industry: 'Enterprise CRM / Cloud Software',
      revenueTier: '$34B+',
      employees: '~72,000',
      hq: 'San Francisco, CA',
      publicOrPrivate: 'Public',
      stockTicker: 'CRM',
    },
    financialSignals: {
      annualRevenue: '$34.9B (FY2024)',
      recentMAndA: 'Acquired Slack ($27.7B, 2021); acquired Tableau ($15.7B, 2019)',
      budgetCycleNote: 'Fiscal year ends January; budget approved in Q3 (November); major renewals concentrated Q3–Q4',
      fiscalYearEnd: 'January',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'ISO 27001', 'FedRAMP Moderate', 'GDPR', 'SOC 2 Type II', 'PCI-DSS', 'HIPAA BAA'],
      zeroTrustMaturity: 'In Progress',
      notes: 'Salesforce stores CRM data for a significant fraction of the Fortune 500, making it a high-value target. Slack and Tableau subsidiaries add complex data security requirements. Einstein AI data flows create new DLP surface area.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure (Slack)', 'GCP (selective)'],
      confirmedSaseVendors: ['Zscaler (confirmed for employee access)', 'Netskope (reported for CASB on Slack)'],
      saasSprawl: 'High',
      notes: 'Massive internal SaaS footprint including Slack, Tableau, MuleSoft, and dozens of acquired tools. Potential expansion or consolidation play if Netskope already has a foothold.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Netskope (potential incumbent)'],
      contractRenewalWindow: 'Q3 FY2026 (October–November 2025)',
      displacementDifficulty: 'Low',
      notes: 'If Netskope has an existing CASB deployment, this is an expansion opportunity into full SSE. Timing aligns with upcoming FY renewal.',
    },
  },

  'Adobe': {
    companyName: 'Adobe',
    snapshot: {
      industry: 'Creative Software / Digital Experience / SaaS',
      revenueTier: '$20B+',
      employees: '~30,000',
      hq: 'San Jose, CA',
      publicOrPrivate: 'Public',
      stockTicker: 'ADBE',
    },
    financialSignals: {
      annualRevenue: '$21.5B (FY2024)',
      recentMAndA: 'Abandoned Figma acquisition ($20B, blocked by regulators 2023)',
      budgetCycleNote: 'Fiscal year ends November; budget cycle peaks in Q3 (August–November)',
      fiscalYearEnd: 'November',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'ISO 27001', 'GDPR', 'CCPA', 'SOC 2 Type II', 'PCI-DSS'],
      knownIncidents: '2013 breach exposed 153M encrypted customer records and source code',
      zeroTrustMaturity: 'In Progress',
      notes: 'Adobe holds creative IP and payment data for millions of creative professionals. Post-2013 breach drove significant security investment. AI-generated content (Firefly) creates new IP protection requirements.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure (secondary)'],
      confirmedSaseVendors: ['Zscaler (reported)', 'Palo Alto Networks (legacy firewall)'],
      saasSprawl: 'Medium',
      notes: 'Adobe is itself a SaaS provider; internal tooling is more controlled. Creative Cloud global content delivery requires complex edge security. Firefly AI pipeline security is an emerging requirement.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Palo Alto Networks'],
      contractRenewalWindow: 'Q2 FY2026 (May–August 2026)',
      displacementDifficulty: 'Medium',
      notes: 'Figma acquisition failure created budget flexibility. AI content security (Firefly data flows) is a compelling differentiator for Netskope DLP.',
    },
  },

  'Verizon': {
    companyName: 'Verizon',
    snapshot: {
      industry: 'Telecommunications',
      revenueTier: '$133B+',
      employees: '~105,000',
      hq: 'New York, NY',
      publicOrPrivate: 'Public',
      stockTicker: 'VZ',
    },
    financialSignals: {
      annualRevenue: '$134B (FY2023)',
      budgetCycleNote: 'Calendar year budgets; large technology investments announced in Q1 operational planning; 5G security architecture refresh ongoing',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'CPNI (FCC)', 'GDPR', 'CCPA', 'PCI-DSS', 'HIPAA (partial)', 'CJIS'],
      knownIncidents: 'Published DBIR annual breach report; internal: 2012 employee data exposure',
      zeroTrustMaturity: 'In Progress',
      notes: 'Verizon is both a Managed Security Service Provider (MSSP) and a SASE sales partner. Internal SASE deployment would influence customer recommendations. Huge 5G network infrastructure creates unique SASE edge opportunity.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure', 'Private data centers (massive telecom infrastructure)'],
      confirmedSaseVendors: ['Verizon Business (resells multiple SASE vendors)', 'Cisco (Meraki/Umbrella for SD-WAN)'],
      saasSprawl: 'High',
      notes: 'Telco infrastructure is largely proprietary. Enterprise and business functions have high SaaS adoption. Verizon is an MSSP that could be a channel partner or direct account.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Cisco (SD-WAN)', 'Palo Alto Networks', 'Fortinet'],
      contractRenewalWindow: 'Q3 2026',
      displacementDifficulty: 'Medium',
      notes: 'Verizon Business resells competing SASE vendors; a co-sell or white-label partnership angle may be more productive than direct displacement.',
    },
  },

  'Boeing': {
    companyName: 'Boeing',
    snapshot: {
      industry: 'Aerospace & Defense / Manufacturing',
      revenueTier: '$77B+',
      employees: '~172,000',
      hq: 'Arlington, VA',
      publicOrPrivate: 'Public',
      stockTicker: 'BA',
    },
    financialSignals: {
      annualRevenue: '$78B (FY2023)',
      budgetCycleNote: 'Calendar year; defense contracts drive non-discretionary security spend; commercial recovery (737 MAX) unlocking deferred IT investment',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['ITAR', 'EAR', 'CMMC Level 3', 'DFARS 252.204-7012', 'SOX', 'ISO 27001'],
      knownIncidents: 'LockBit ransomware attack (2023) leaked ~43GB of sensitive data including supplier information',
      zeroTrustMaturity: 'In Progress',
      notes: 'CMMC and ITAR compliance are non-negotiable for DoD contracts. Post-LockBit breach drove emergency security investment. Supply chain security is a priority given 737 MAX quality issues broadening to cybersecurity scrutiny.',
    },
    techStack: {
      cloudFootprint: ['AWS GovCloud (DoD workloads)', 'Azure Government', 'Private data centers'],
      confirmedSaseVendors: ['Zscaler (reported post-breach deployment)'],
      saasSprawl: 'Medium',
      notes: 'Mix of classified and commercial environments. Supply chain partner portals create significant third-party access security challenges. Remote engineering access to design tools (CATIA, etc.) is a key SASE use case.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Palo Alto Networks', 'Leidos (MSSP)'],
      contractRenewalWindow: 'Q4 2026',
      displacementDifficulty: 'Medium',
      notes: 'LockBit breach response creates urgency for improved DLP and zero-trust access. CMMC Level 3 certification requirements are a compelling event for full SSE deployment.',
    },
  },

  'Pfizer': {
    companyName: 'Pfizer',
    snapshot: {
      industry: 'Pharmaceuticals / Biotechnology',
      revenueTier: '$58B+',
      employees: '~88,000',
      hq: 'New York, NY',
      publicOrPrivate: 'Public',
      stockTicker: 'PFE',
    },
    financialSignals: {
      annualRevenue: '$58.5B (FY2023, post-COVID normalization)',
      recentMAndA: 'Acquired Seagen ($43B, 2023); acquired Arena Pharmaceuticals',
      budgetCycleNote: 'Calendar year; security budget under pressure due to COVID revenue normalization; Seagen integration creating incremental security spend in 2025–2026',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'HIPAA', 'FDA 21 CFR Part 11', 'GDPR', 'ISO 27001', 'GxP'],
      knownIncidents: 'COVID-19 vaccine formula theft attempt by nation-state actors (2020, FBI/CISA warning)',
      zeroTrustMaturity: 'In Progress',
      notes: 'Research IP (drug formulas, clinical trial data) is the highest-value target. FDA GxP compliance requires strict data integrity controls. Seagen acquisition brings new research environments to secure.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure', 'GCP (research)'],
      confirmedSaseVendors: ['Palo Alto Networks (Prisma Access, reported)', 'Zscaler (selective)'],
      saasSprawl: 'High',
      notes: 'Large Veeva, Salesforce, and Workday footprint. Research collaboration tools (Microsoft Teams, SharePoint) are primary data exfiltration vectors. Seagen integration adds diverse cloud environments.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Palo Alto Networks', 'Zscaler'],
      contractRenewalWindow: 'Q2 2027',
      displacementDifficulty: 'Medium',
      notes: 'Seagen integration is a natural consolidation event. DLP for clinical trial data and research IP protection is a strong differentiated pitch for Netskope.',
    },
  },

  'ExxonMobil': {
    companyName: 'ExxonMobil',
    snapshot: {
      industry: 'Oil & Gas / Energy',
      revenueTier: '$390B+',
      employees: '~62,000',
      hq: 'Spring, TX',
      publicOrPrivate: 'Public',
      stockTicker: 'XOM',
    },
    financialSignals: {
      annualRevenue: '$398B (FY2023)',
      recentMAndA: 'Acquired Pioneer Natural Resources ($60B, 2024)',
      budgetCycleNote: 'Calendar year; Pioneer acquisition driving significant IT integration spend in 2025–2026',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'NERC CIP', 'TSA Pipeline Security Directives', 'ISO 27001', 'GDPR'],
      knownIncidents: 'Targeted by nation-state actors (China, attributed by NSA) for energy infrastructure intelligence',
      zeroTrustMaturity: 'Early',
      notes: 'OT/ICS security is the primary focus (pipeline and refinery controls). IT/OT convergence is accelerating as digital oilfield initiatives expand. Pioneer acquisition adds 7,000+ employees and disparate IT environments to integrate.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure', 'Private data centers (OT environments)'],
      confirmedSaseVendors: ['Cisco (SD-WAN for remote field operations)'],
      saasSprawl: 'Medium',
      notes: 'Conservative technology adopter. Cloud migration accelerating for corporate functions. Pioneer integration creating cloud-native vs. legacy IT consolidation requirement.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Cisco', 'Palo Alto Networks (industrial security)'],
      contractRenewalWindow: 'Q3 2026',
      displacementDifficulty: 'Medium',
      notes: 'Pioneer acquisition is a high-urgency integration event. Remote field worker access and contractor security for drilling operations is a strong Netskope use case.',
    },
  },

  'Walmart': {
    companyName: 'Walmart',
    snapshot: {
      industry: 'Retail / E-Commerce / Grocery',
      revenueTier: '$640B+',
      employees: '~2,100,000',
      hq: 'Bentonville, AR',
      publicOrPrivate: 'Public',
      stockTicker: 'WMT',
    },
    financialSignals: {
      annualRevenue: '$648B (FY2024)',
      recentMAndA: 'Acquired Vizio ($2.3B, 2024); acquired TV streaming advertising platform',
      budgetCycleNote: 'Fiscal year ends January; technology investments approved in Q3 (October–January); major digital transformation spend ongoing',
      fiscalYearEnd: 'January',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'PCI-DSS', 'CCPA', 'GDPR (international)', 'HIPAA (pharmacy)'],
      knownIncidents: 'Target breach (competitor, 2013) drove major PCI investment across retail sector; Walmart proactively upgraded',
      zeroTrustMaturity: 'In Progress',
      notes: 'World\'s largest retailer with massive POS and supply chain attack surface. Walmart+ digital membership requires strong identity and access management. 2M+ associates create enormous endpoint diversity challenge.',
    },
    techStack: {
      cloudFootprint: ['Azure (primary — strategic Microsoft partnership)', 'GCP (secondary)', 'Private data centers (massive)'],
      confirmedSaseVendors: ['Zscaler (reported for corporate access)', 'Microsoft (Entra ID Governance)'],
      saasSprawl: 'High',
      notes: 'Microsoft is the primary cloud partner. Flipkart (India subsidiary) operates independently on AWS. Vizio acquisition adds consumer IoT and advertising technology environments.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Microsoft (Entra SSE)', 'Cisco'],
      contractRenewalWindow: 'Q2 FY2026 (May–August 2026)',
      displacementDifficulty: 'Medium',
      notes: 'Microsoft strategic partnership is a headwind; however, Vizio/Flipkart subsidiary environments and supply chain partner access are strong SASE entry points independent of core Microsoft footprint.',
    },
  },

  'IBM': {
    companyName: 'IBM',
    snapshot: {
      industry: 'Enterprise IT / Consulting / Hybrid Cloud',
      revenueTier: '$61B+',
      employees: '~288,000',
      hq: 'Armonk, NY',
      publicOrPrivate: 'Public',
      stockTicker: 'IBM',
    },
    financialSignals: {
      annualRevenue: '$61.9B (FY2023)',
      recentMAndA: 'Acquired HashiCorp ($6.4B, 2024); divested Kyndryl (2021)',
      budgetCycleNote: 'Calendar year; internal IT budget is a fraction of revenue; HashiCorp integration creating security architecture refresh',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'FedRAMP', 'ISO 27001', 'GDPR', 'HIPAA', 'PCI-DSS', 'FISMA'],
      zeroTrustMaturity: 'In Progress',
      notes: 'IBM Security is a major MSSP and SASE reseller (IBM QRadar, X-Force, Guardium). Internal SASE deployment would influence customer recommendations. Post-Kyndryl spin, IBM is refocusing on hybrid cloud and AI (watsonx).',
    },
    techStack: {
      cloudFootprint: ['IBM Cloud (primary)', 'AWS (secondary)', 'Azure'],
      confirmedSaseVendors: ['Zscaler (IBM is a Zscaler channel partner)', 'Palo Alto Networks (reseller)'],
      saasSprawl: 'High',
      notes: 'IBM Cloud and on-prem mainframe environments are primary. As a major SI and channel partner, IBM\'s internal tooling choices influence customer deployments. HashiCorp integration adds DevOps security surface area.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler (channel partner/incumbent)', 'Palo Alto Networks'],
      contractRenewalWindow: 'Q3 2026',
      displacementDifficulty: 'High',
      notes: 'IBM is a Zscaler channel partner — displacement requires executive sponsorship. Best angle: co-sell or technology partnership for IBM Consulting SASE practice.',
    },
  },

  'AT&T': {
    companyName: 'AT&T',
    snapshot: {
      industry: 'Telecommunications',
      revenueTier: '$122B+',
      employees: '~160,000',
      hq: 'Dallas, TX',
      publicOrPrivate: 'Public',
      stockTicker: 'T',
    },
    financialSignals: {
      annualRevenue: '$122.4B (FY2023)',
      budgetCycleNote: 'Calendar year; significant deferred IT investment following WarnerMedia divestiture; cybersecurity spend elevated post-2024 breach',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'CPNI (FCC)', 'CJIS', 'GDPR', 'CCPA', 'HIPAA (partial)'],
      knownIncidents: '2024 breach: call and text records of ~110M customers exposed; prior 2023 data leak of 73M customer records on dark web',
      zeroTrustMaturity: 'Early',
      notes: 'Two major breaches in two years have created regulatory and reputational urgency. FCC consent decree likely. AT&T is simultaneously an MSSP reselling SASE and a direct security investment target.',
    },
    techStack: {
      cloudFootprint: ['Microsoft Azure (primary)', 'AWS (secondary)', 'Private telco infrastructure'],
      confirmedSaseVendors: ['AT&T Business (resells Palo Alto Prisma Access)', 'Cisco (SD-WAN)'],
      saasSprawl: 'High',
      notes: 'Post-WarnerMedia divestiture IT landscape is complex. FirstNet (public safety network) creates unique federal compliance requirements. DirectTV separation ongoing.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Palo Alto Networks (Prisma Access — AT&T resells)', 'Cisco'],
      contractRenewalWindow: 'Q2 2026',
      displacementDifficulty: 'Medium',
      notes: 'Post-breach urgency is the highest in this account list. FCC oversight creates a board-level security mandate. Netskope DLP and data exfiltration protection is directly relevant to breach remediation.',
    },
  },

  'Intel': {
    companyName: 'Intel',
    snapshot: {
      industry: 'Semiconductors / Computing',
      revenueTier: '$54B+',
      employees: '~124,000',
      hq: 'Santa Clara, CA',
      publicOrPrivate: 'Public',
      stockTicker: 'INTC',
    },
    financialSignals: {
      annualRevenue: '$54.2B (FY2023)',
      budgetCycleNote: 'Calendar year; cost reduction program (layoffs of 15,000+ in 2024) creates budget rationalization pressure; foundry business investment may unlock security spend',
      fiscalYearEnd: 'December',
    },
    securityPosture: {
      complianceMandates: ['SOX', 'Export Controls (EAR)', 'ITAR (selective)', 'ISO 27001', 'GDPR', 'CHIPS Act compliance'],
      knownIncidents: 'Meltdown/Spectre hardware vulnerabilities disclosed (2018); targeted by nation-state actors for chip design IP',
      zeroTrustMaturity: 'In Progress',
      notes: 'Chip design IP and process node technology are existential crown jewels. CHIPS Act funding requires enhanced cybersecurity standards. Nation-state threat from China and others is persistent.',
    },
    techStack: {
      cloudFootprint: ['AWS (primary)', 'Azure', 'Private data centers (fab environments)'],
      confirmedSaseVendors: ['Zscaler (reported)', 'Palo Alto Networks (legacy)'],
      saasSprawl: 'Medium',
      notes: 'Fab environments are air-gapped; IT environments are cloud-hybrid. Foundry-as-a-Service expansion (Intel Foundry) creates new third-party access requirements for customer IP protection.',
    },
    competitiveExposure: {
      likelyIncumbents: ['Zscaler', 'Palo Alto Networks'],
      contractRenewalWindow: 'Q4 2026',
      displacementDifficulty: 'Medium',
      notes: 'CHIPS Act compliance and Intel Foundry third-party access are compelling events. Cost pressure from restructuring may favor consolidation onto a single SSE platform — good displacement angle.',
    },
  },
};

export function getEnrichment(accountName: string): AccountEnrichment | null {
  const key = Object.keys(accountEnrichment).find(
    (k) => k.toLowerCase() === accountName.toLowerCase()
  );
  return key ? accountEnrichment[key] : null;
}
