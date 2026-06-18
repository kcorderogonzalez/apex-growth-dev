export interface BattleCardItem {
  title: string;
  pitch: string;
  question: string;
}

export interface BattleCard {
  persona: string;
  icon: string;
  items: BattleCardItem[];
}

const BATTLECARDS: Record<string, BattleCard> = {
  security_arch: {
    persona: 'Security Arch & Engineering',
    icon: '🛡️',
    items: [
      {
        title: 'Discover and Classify All Data',
        pitch: 'Security architects need visibility into all data before they can enforce Zero Trust or compliance. Netskope discovers and classifies sensitive data across SaaS, cloud, web, and private apps, enabling consistent protection.',
        question: 'How confident are you today that you can discover and classify all sensitive data across your SaaS, cloud, and web environments?',
      },
      {
        title: 'Secure AI Usage and Prevent Data Leakage',
        pitch: 'AI adoption introduces risks such as shadow AI, sensitive data exposure, and regulatory gaps. Netskope provides real-time visibility and controls to prevent data leakage while enabling safe use of AI tools.',
        question: 'What guardrails are you designing to prevent sensitive or regulated data from being exposed through AI tools?',
      },
      {
        title: 'Replace Legacy VPN with Zero Trust',
        pitch: 'VPNs expand the attack surface, create bottlenecks, and increase operational burden. Netskope delivers Zero Trust access with least-privilege, app-level policies, improving security and user experience.',
        question: 'Are you planning to replace legacy VPNs with Zero Trust access to simplify your architecture and reduce risk?',
      },
      {
        title: 'Reduce Tool Sprawl with a Unified Architecture',
        pitch: 'Security architects are often forced to integrate multiple point products, creating complexity and gaps. Netskope converges CASB, SWG, ZTNA, DLP, and threat protection into a unified SSE/SASE platform.',
        question: 'Are you evaluating ways to consolidate point products into a more unified security architecture for better consistency?',
      },
      {
        title: 'Gain Granular Inline Visibility and Control',
        pitch: 'Security teams need more than basic app detection. Netskope inspects traffic at the API level to provide app-instance awareness and detailed user, device, and activity context for precise policy enforcement.',
        question: 'How do you get granular, instance-level visibility into app usage and activity so your team can enforce the right policies and respond quickly?',
      },
    ],
  },
  network_arch: {
    persona: 'Network Arch & Engineering',
    icon: '🌐',
    items: [
      {
        title: 'Improve Application Performance and Reliability',
        pitch: "Networking teams need to deliver fast, reliable access to SaaS, cloud, and private apps. Netskope's cloud-native architecture improves performance while securing traffic without backhauling.",
        question: 'Are your users consistently getting fast, reliable access to SaaS and cloud apps, or are security controls slowing them down?',
      },
      {
        title: 'Reduce Complexity Through Convergence',
        pitch: "Networking teams are asked to manage both connectivity and security, often across multiple point solutions. Netskope's SASE platform converges networking and security for simpler management and fewer vendors.",
        question: 'How are you addressing the growing complexity of managing multiple networking and security tools?',
      },
      {
        title: 'Replace Legacy VPN with Zero Trust Access',
        pitch: 'VPNs create performance bottlenecks, are expensive to maintain, and expose the network to unnecessary risk. Netskope enables direct, secure access to apps with Zero Trust principles.',
        question: 'Are you exploring Zero Trust access as a replacement for VPN to simplify architecture and improve user experience?',
      },
      {
        title: 'Faster Problem Identification and Resolution',
        pitch: 'Networking teams are measured on uptime and mean time to resolution. Netskope provides deep visibility into traffic and user experience, helping identify root causes quickly and improve MTTR.',
        question: 'How quickly can your team identify whether an issue is on the endpoint, the network, or the application today?',
      },
      {
        title: 'Future-Ready Cloud Architecture',
        pitch: "Traditional hub-and-spoke architectures were built for a data center world, not SaaS and cloud. Netskope's cloud-native infrastructure is designed for scale, agility, and secure direct-to-app connectivity.",
        question: 'What steps are you taking to modernize your network architecture for a cloud-first environment?',
      },
    ],
  },
  netops: {
    persona: 'Network Operations (NetOps)',
    icon: '📡',
    items: [
      {
        title: 'Improve Application Performance and Reliability',
        pitch: 'NetOps teams are measured on delivering fast, reliable access to SaaS, cloud, and private apps. Netskope improves performance with direct-to-app architecture while enforcing security inline.',
        question: 'Are your users consistently getting fast, reliable access to SaaS and cloud apps, or are security controls slowing them down?',
      },
      {
        title: 'Faster Problem Identification and Resolution',
        pitch: 'NetOps needs to quickly identify whether an issue is the endpoint, the network, or the application. Netskope provides granular visibility to speed MTTR and reduce downtime.',
        question: 'How quickly can your team isolate whether a performance issue is caused by the endpoint, the network, or the application?',
      },
      {
        title: 'Replace Legacy VPN with Zero Trust Access',
        pitch: 'VPNs create bottlenecks and add operational overhead. Netskope provides secure, direct-to-app Zero Trust access that reduces complexity and improves user experience.',
        question: 'Are you planning to replace legacy VPNs with Zero Trust access to improve performance and simplify management?',
      },
      {
        title: 'Reduce Complexity Through Convergence',
        pitch: "NetOps teams often manage both connectivity and security infrastructure. Netskope's converged SASE architecture reduces the number of vendors and tools, simplifying operations.",
        question: 'What steps are you taking to reduce the complexity of managing separate networking and security tools?',
      },
      {
        title: 'Gain End-to-End Visibility',
        pitch: 'NetOps needs visibility into traffic flows, app performance, and user experience. Netskope provides inline insights with detailed telemetry to help optimize the network and troubleshoot faster.',
        question: 'Do you have end-to-end visibility into user traffic and app performance to proactively address issues before they impact users?',
      },
    ],
  },
  secops: {
    persona: 'Security Operations (SecOps)',
    icon: '🔍',
    items: [
      {
        title: 'Improve Threat Detection and Response Speed',
        pitch: 'SecOps teams need to detect and stop threats across SaaS, cloud, and web in real time. Netskope provides inline inspection with rich context to shorten detection and response cycles.',
        question: 'How quickly can your team detect and respond to threats moving through SaaS, cloud, and web traffic today?',
      },
      {
        title: 'Gain Granular Visibility and Context',
        pitch: 'Alerts without context slow investigations. Netskope provides detailed user, device, app, and activity visibility, including app-instance awareness, to accelerate triage and decision-making.',
        question: 'Do your analysts have the context they need to understand who is doing what in cloud and SaaS apps when investigating alerts?',
      },
      {
        title: 'Reduce Alert Fatigue and False Positives',
        pitch: "Too many point products create noise. Netskope's converged SSE reduces duplication of alerts and correlates activity across apps and traffic for higher signal quality.",
        question: 'Are your analysts spending too much time chasing alerts that turn out to be false positives?',
      },
      {
        title: 'Streamline Incident Response Workflows',
        pitch: 'SecOps teams rely on SIEM, SOAR, and XDR to coordinate response. Netskope integrates with these tools to stream actionable telemetry, helping teams resolve incidents faster.',
        question: 'How easily does your current security stack integrate with your SIEM or SOAR to automate response?',
      },
      {
        title: 'Protect Data While Responding to Incidents',
        pitch: 'Incident response is not only about threats but also about data. Netskope enforces data protection policies in real time so SecOps can focus on high-risk incidents instead of chasing leaks.',
        question: 'How are you protecting sensitive data in real time while your team manages incidents?',
      },
    ],
  },
  data_privacy: {
    persona: 'Data Protection & Privacy',
    icon: '🔒',
    items: [
      {
        title: 'Discover and Classify Sensitive Data',
        pitch: 'Privacy teams need to know what sensitive data exists, where it lives, and how it moves. Netskope discovers and classifies data across SaaS, cloud, web, and private apps for consistent governance.',
        question: 'How confident are you that you can accurately discover and classify sensitive data across all SaaS, cloud, and web environments?',
      },
      {
        title: 'Secure AI Usage and Data Exposure',
        pitch: 'Generative AI tools present risks of sensitive data exposure through prompts or training data. Netskope provides visibility and controls to prevent unintentional data sharing while supporting safe AI adoption.',
        question: 'What controls are in place to stop employees from exposing sensitive data when using AI tools?',
      },
      {
        title: 'Prevent Data Leakage and Insider Risk',
        pitch: 'Employees often move data to personal accounts or unsanctioned apps. Netskope enforces granular policies with app-instance awareness to prevent unauthorized sharing.',
        question: 'What safeguards do you have to stop sensitive data from being uploaded to personal or unsanctioned applications?',
      },
      {
        title: 'Ensure Compliance with Regulations',
        pitch: 'Meeting requirements for GDPR, HIPAA, PCI, and other mandates is challenging without visibility. Netskope enforces compliance policies inline and provides audit-ready reporting.',
        question: 'How do you ensure compliance with privacy regulations when sensitive data is moving across SaaS and cloud services?',
      },
      {
        title: 'Enable Consistent Global Policies',
        pitch: 'Privacy teams need consistent data protection policies across regions and environments. Netskope applies governance policies globally while honoring local requirements.',
        question: 'Are your data protection policies applied consistently worldwide, or do you face challenges managing policies across regions?',
      },
    ],
  },
  grc: {
    persona: 'Governance, Risk & Compliance',
    icon: '⚖️',
    items: [
      {
        title: 'Ensure Regulatory Compliance',
        pitch: 'GRC leaders are accountable for proving compliance with frameworks like GDPR, HIPAA, PCI, and CCPA. Netskope enforces controls inline and provides audit-ready reporting.',
        question: 'How confident are you that your data protection policies align with current regulatory requirements across SaaS and cloud?',
      },
      {
        title: 'Discover and Classify Sensitive Data',
        pitch: 'Without visibility into sensitive data, compliance programs fail. Netskope discovers and classifies data across SaaS, cloud, web, and private apps for consistent governance.',
        question: 'Do you have a clear view of where your regulated data resides and how it moves across the enterprise?',
      },
      {
        title: 'Govern AI Usage and Prevent Data Exposure',
        pitch: 'Generative AI creates new compliance risks, including data leakage and regulatory violations. Netskope provides visibility and controls to govern AI usage safely.',
        question: 'What controls are in place to prevent sensitive or regulated data from being exposed when employees use AI tools?',
      },
      {
        title: 'Reduce Risk Through Consistent Policy Enforcement',
        pitch: 'Inconsistent enforcement creates audit gaps. Netskope applies unified data protection and access policies everywhere, ensuring governance frameworks are applied consistently.',
        question: 'How do you ensure data protection and access policies are applied consistently across different apps and environments?',
      },
      {
        title: 'Streamline Reporting and Assurance',
        pitch: 'GRC teams spend too much time collecting data for audits and assurance. Netskope simplifies compliance reporting with detailed logs and dashboards that map to controls.',
        question: 'How much effort does your team spend preparing audit evidence and compliance reports today?',
      },
    ],
  },
  endpoint: {
    persona: 'Endpoint',
    icon: '💻',
    items: [
      {
        title: 'Reduce Endpoint Agent Sprawl',
        pitch: 'Endpoint teams are burdened by too many agents that slow performance and complicate support. Netskope reduces agent footprint by consolidating controls into a single lightweight client.',
        question: 'How many agents are you running on your endpoints today, and is agent sprawl impacting user experience or support costs?',
      },
      {
        title: 'Improve User Experience and Performance',
        pitch: 'Endpoints often take the blame for slow applications or poor connectivity. Netskope enables direct-to-app secure access that improves performance and reduces VPN-related complaints.',
        question: 'Do users frequently report poor performance or connectivity issues that end up being escalated as endpoint problems?',
      },
      {
        title: 'Replace VPN with Zero Trust Access',
        pitch: 'VPN clients are a constant source of tickets for endpoint teams. Netskope eliminates the need for legacy VPN agents by delivering Zero Trust access directly to apps.',
        question: 'How much time does your team spend troubleshooting VPN clients on endpoints?',
      },
      {
        title: 'Ensure Endpoint Compliance and Security',
        pitch: 'Keeping endpoints compliant with security policies is a constant challenge. Netskope enforces context-aware access based on device posture, ensuring only healthy devices connect.',
        question: 'How are you verifying device compliance before granting access to sensitive applications and data?',
      },
      {
        title: 'Faster Troubleshooting and Root Cause Analysis',
        pitch: 'Endpoint teams need to quickly determine if an issue is device-related or somewhere else. Netskope provides visibility into endpoint, network, and app activity to speed diagnosis.',
        question: 'How quickly can you determine whether a user issue is actually endpoint-related or caused by the network or application?',
      },
    ],
  },
  service_desk: {
    persona: 'Service Desk',
    icon: '🎧',
    items: [
      {
        title: 'Reduce Help Desk Tickets',
        pitch: 'Service desks often get flooded with tickets related to slow apps, VPN issues, or poor connectivity. Netskope eliminates many of these problems with secure direct-to-app access and better performance.',
        question: 'How much time does your team spend today troubleshooting VPN-related tickets and access issues?',
      },
      {
        title: 'Faster Issue Diagnosis',
        pitch: 'Identifying the root cause of a user issue is time-consuming. Netskope provides visibility into endpoint, network, and app performance, helping service desk teams resolve issues quickly.',
        question: 'How quickly can your team identify whether a user issue is caused by the endpoint, the network, or the application?',
      },
      {
        title: 'Improve Mean Time to Resolution (MTTR)',
        pitch: 'Service desk performance is measured by MTTR. Netskope provides actionable insights and detailed telemetry to accelerate ticket resolution and reduce escalations.',
        question: 'What tools are you using today to shorten MTTR and reduce escalations to higher-level support teams?',
      },
      {
        title: 'Enhance Employee Experience',
        pitch: 'A poor end-user experience leads to frustration and more tickets. Netskope ensures fast, secure access to SaaS and cloud apps, reducing complaints and improving satisfaction.',
        question: 'Do employees ever complain that security tools are slowing them down or making it harder to access the apps they need?',
      },
      {
        title: 'Shift from Reactive to Proactive Support',
        pitch: 'Service desks spend too much time firefighting. Netskope enables proactive detection and remediation of issues before users notice them, reducing ticket volume and improving productivity.',
        question: 'How are you shifting from reactive firefighting to proactively addressing issues before they impact employees?',
      },
    ],
  },
  it_finance: {
    persona: 'IT Finance & Procurement',
    icon: '💰',
    items: [
      {
        title: 'Reduce Cost Through Consolidation',
        pitch: 'Multiple point products increase costs for licenses, support, and renewals. Netskope converges networking and security into a unified platform, reducing overall spend.',
        question: 'How are you approaching cost reduction by consolidating multiple networking and security vendors?',
      },
      {
        title: 'Simplify Vendor Management',
        pitch: 'Managing many security vendors increases contract complexity and overhead. Netskope replaces multiple tools with a single platform, simplifying renewals and support.',
        question: 'Are vendor sprawl and overlapping contracts driving complexity for your procurement process?',
      },
      {
        title: 'Lower Risk Exposure and Potential Financial Impact',
        pitch: 'Data breaches, insider threats, and compliance fines create financial risk. Netskope reduces risk through unified data protection, Zero Trust access, and advanced threat defense.',
        question: 'How do you evaluate the financial risk of data breaches and compliance penalties when assessing security investments?',
      },
      {
        title: 'Improve ROI on Technology Spend',
        pitch: 'Finance leaders want proof that technology investments deliver value. Netskope improves efficiency, lowers TCO, and provides measurable reductions in security incidents and support costs.',
        question: 'How are you measuring ROI on current security and networking investments?',
      },
      {
        title: 'Enable Predictable Budgeting',
        pitch: "Point solutions often come with surprise add-ons and hidden costs. Netskope's platform model provides clearer, more predictable cost structures.",
        question: 'Are you looking for more predictable cost models that simplify long-term security and networking budgeting?',
      },
    ],
  },
  enterprise_data: {
    persona: 'Enterprise Data',
    icon: '🗄️',
    items: [
      {
        title: 'Discover and Classify Enterprise Data',
        pitch: 'Enterprise data teams need to know what data exists, where it resides, and how it moves across systems. Netskope discovers and classifies sensitive data in SaaS, cloud, web, and private apps.',
        question: 'How confident are you that you can discover and classify sensitive enterprise data across SaaS, cloud, and analytics platforms?',
      },
      {
        title: 'Enable Secure AI and Analytics Adoption',
        pitch: 'AI and analytics projects depend on trustworthy data that is securely managed. Netskope ensures sensitive data is not exposed during model training or analytics workflows.',
        question: 'What steps are you taking to secure sensitive data as it is used for AI model training or analytics?',
      },
      {
        title: 'Prevent Unauthorized Data Movement',
        pitch: 'Business users often move data into unsanctioned apps or personal accounts for convenience. Netskope enforces granular, app-instance aware policies to prevent leakage while supporting productivity.',
        question: 'How do you ensure enterprise data is not being moved into personal or unsanctioned apps?',
      },
      {
        title: 'Support Data Governance and Compliance',
        pitch: 'Data teams must align with regulatory, privacy, and corporate governance standards. Netskope provides real-time enforcement and audit-ready reporting to help meet compliance requirements.',
        question: 'How are you ensuring compliance with privacy and data governance requirements as data moves across SaaS and cloud services?',
      },
      {
        title: 'Improve Data Trust and Accessibility',
        pitch: 'For data to be valuable, business and AI teams need both access and assurance it is secure. Netskope delivers the balance of enabling data access while enforcing protection policies.',
        question: 'How do you balance enabling broad data access for business and AI use while still ensuring it is protected and governed?',
      },
    ],
  },
  cio: {
    persona: 'CIO',
    icon: '🏢',
    items: [
      {
        title: 'Enable Secure AI Adoption',
        pitch: 'CIOs are enabling Generative AI while ensuring sensitive data is protected. Netskope provides the guardrails for safe AI use so innovation can move forward without compliance or security risks.',
        question: 'How are you enabling business teams to safely use Generative AI while protecting sensitive and regulated data?',
      },
      {
        title: 'Reduce Cost and Complexity',
        pitch: "CIOs are under pressure to optimize budgets and reduce vendor sprawl. Netskope's converged SASE and SSE platform helps consolidate multiple point products, lowering costs while simplifying operations.",
        question: 'What steps are you taking to reduce the number of security and networking vendors your teams have to manage?',
      },
      {
        title: 'Deliver Great User Experiences and Faster Problem Resolution',
        pitch: 'CIOs want employees to stay productive and IT teams to resolve issues quickly. Netskope improves app performance, reduces downtime, and enables faster MTTR through proactive problem identification.',
        question: 'How quickly can your teams identify and resolve user experience issues today, and is security ever a bottleneck in that process?',
      },
      {
        title: 'Know Your Data, Everywhere',
        pitch: 'CIOs need visibility into what data they have, where it resides, and how it is accessed. Netskope delivers classification, governance, and protection across SaaS, cloud, web, and private apps.',
        question: 'Do you have a clear understanding of what sensitive data you own, where it lives, and how it is being accessed across your environment?',
      },
      {
        title: 'Replace Legacy VPN with Zero Trust',
        pitch: 'Traditional VPNs are costly, complex, and create security risks. Netskope enables secure, direct-to-app access with Zero Trust principles, improving security and user experience while eliminating VPN overhead.',
        question: 'Are you planning to replace legacy VPNs with a Zero Trust approach to simplify access and strengthen security for your hybrid workforce?',
      },
    ],
  },
  ciso: {
    persona: 'CISO',
    icon: '🔐',
    items: [
      {
        title: 'Protect Sensitive Data Everywhere',
        pitch: 'CISOs must safeguard IP, customer data, and regulated information across SaaS, cloud, web, and private apps. Netskope applies real-time, context-aware data protection everywhere data moves.',
        question: 'How confident are you that sensitive data is being protected consistently across SaaS, cloud, and web traffic?',
      },
      {
        title: 'Secure AI Usage and Guard Against Data Exposure',
        pitch: 'Generative AI introduces new risks like shadow AI, unintentional data leakage, and compliance violations. Netskope provides visibility, controls, and policies to govern how employees and systems use AI.',
        question: 'What guardrails do you have in place today to prevent sensitive or regulated data from being exposed through AI tools?',
      },
      {
        title: 'Replace Legacy VPN with Zero Trust',
        pitch: 'Traditional VPNs expand the attack surface and create lateral movement risk. Netskope delivers Zero Trust network access with least-privilege controls, reducing risk while enabling hybrid work.',
        question: 'Are you planning to replace legacy VPNs with Zero Trust access to strengthen your security posture?',
      },
      {
        title: 'Reduce Threat Exposure',
        pitch: 'Attackers are targeting users and cloud services with phishing, malware, and insider threats. Netskope detects and stops advanced attacks inline, with real-time context.',
        question: 'What challenges are you facing today in detecting and stopping advanced threats across SaaS and cloud environments?',
      },
      {
        title: 'Simplify and Consolidate Point Security Products',
        pitch: "Security teams struggle with alert fatigue and tool sprawl. Netskope's converged platform reduces complexity, consolidates tools, and provides unified visibility for faster response.",
        question: 'Are you exploring ways to consolidate security tools to reduce overhead and improve visibility for your team?',
      },
    ],
  },
  infra_ops: {
    persona: 'Infrastructure & Operations',
    icon: '⚙️',
    items: [
      {
        title: 'Modernize Legacy Infrastructure',
        pitch: 'I&O leaders are under pressure to retire legacy VPNs, proxies, and appliances. Netskope delivers a cloud-native platform that supports SaaS, cloud, and hybrid work without the burden of legacy infrastructure.',
        question: 'Are you planning to retire legacy VPNs, proxies, or appliances in favor of a cloud-first model?',
      },
      {
        title: 'Improve Service Reliability and Uptime',
        pitch: 'I&O is measured on uptime and service quality. Netskope ensures fast, secure, and reliable access to applications while reducing outages tied to legacy infrastructure.',
        question: 'How are you ensuring reliable, always-on access for employees as apps move to SaaS and cloud?',
      },
      {
        title: 'Reduce Cost and Complexity Through Consolidation',
        pitch: 'Multiple point products create operational overhead and high costs. Netskope converges networking and security into a unified SASE platform, reducing vendor sprawl and lowering TCO.',
        question: 'What steps are you taking to reduce cost and complexity by consolidating networking and security vendors?',
      },
      {
        title: 'Enhance User Experience and Productivity',
        pitch: 'Poor application performance or security slowdowns drive employee frustration and IT tickets. Netskope optimizes user experience with direct-to-app secure access and faster problem resolution.',
        question: 'Do employees ever complain about slow or unreliable access to critical apps due to legacy security infrastructure?',
      },
      {
        title: 'Enable Agility for Cloud and AI Initiatives',
        pitch: 'Business leaders expect IT to enable agility and innovation. Netskope provides the flexibility to support new SaaS, cloud, and AI initiatives securely and at scale.',
        question: 'How are you adapting your infrastructure to securely support new SaaS and AI-driven initiatives?',
      },
    ],
  },
  enterprise_arch: {
    persona: 'Enterprise Architecture',
    icon: '🏗️',
    items: [
      {
        title: 'Modernize Architecture for Cloud and SaaS',
        pitch: 'Enterprise Architects are under pressure to move away from data center-centric models. Netskope provides a cloud-native platform designed for SaaS, cloud, and hybrid work.',
        question: 'How are you modernizing your architecture to support SaaS, cloud-first strategies, and hybrid work models?',
      },
      {
        title: 'Converge Networking and Security',
        pitch: 'Running parallel networking and security stacks creates complexity and cost. Netskope converges CASB, SWG, ZTNA, DLP, and threat protection into a unified SSE and integrates with SD-WAN for full SASE.',
        question: 'Are you looking at ways to converge networking and security into a unified SASE architecture?',
      },
      {
        title: 'Replace Legacy VPN with Zero Trust',
        pitch: "VPNs don't fit modern architectures and create performance bottlenecks and risk. Netskope delivers app-level, least-privilege Zero Trust access that scales across the enterprise.",
        question: 'Are you planning to replace legacy VPNs with a Zero Trust approach that better fits your future-state architecture?',
      },
      {
        title: 'Enable Secure AI and Data Strategies',
        pitch: 'AI and enterprise data strategies depend on secure, governed access. Netskope provides data discovery, classification, and AI guardrails to protect sensitive data while supporting innovation.',
        question: 'How are you securing sensitive data while enabling AI and enterprise data initiatives?',
      },
      {
        title: 'Simplify and Future-Proof the Ecosystem',
        pitch: "Enterprise Architects want platforms that reduce tool sprawl, integrate into the ecosystem, and scale with business needs. Netskope's open integrations and unified platform reduce complexity and build future resilience.",
        question: 'How are you approaching tool consolidation and ensuring your architecture is future-proof for new business and technology demands?',
      },
    ],
  },
};

const TITLE_MAP: Array<{ patterns: RegExp; key: string }> = [
  // C-Suite
  { patterns: /ciso|chief information security|chief security officer/i,              key: 'ciso' },
  { patterns: /cio|chief information officer/i,                                       key: 'cio' },
  { patterns: /cto|chief technology/i,                                                key: 'infra_ops' },
  { patterns: /cfo|chief financial/i,                                                 key: 'it_finance' },
  // Security roles
  { patterns: /security arch|security engineer|security design/i,                    key: 'security_arch' },
  { patterns: /secops|security operations|soc analyst|soc engineer|security analyst|security operations engineer|information security/i, key: 'secops' },
  { patterns: /endpoint security|endpoint engineer|desktop engineer|device management|client engineer/i, key: 'endpoint' },
  { patterns: /privacy|data protection officer|dpo/i,                                key: 'data_privacy' },
  { patterns: /compliance|grc|risk officer|risk manager|audit/i,                     key: 'grc' },
  // Network roles
  { patterns: /network arch|network engineer|network design/i,                       key: 'network_arch' },
  { patterns: /netops|network operations|network admin/i,                            key: 'netops' },
  // IT roles
  { patterns: /enterprise arch|solution arch|it architect|systems architect/i,       key: 'enterprise_arch' },
  { patterns: /infrastructure|i&o|sysadmin|systems admin|systems administrator|it ops|it operations|devops|platform engineer|site reliability|sre/i, key: 'infra_ops' },
  { patterns: /systems engineer|senior systems|staff engineer|principal engineer/i,  key: 'infra_ops' },
  { patterns: /help desk|service desk|support tech|it support|helpdesk/i,            key: 'service_desk' },
  { patterns: /finance|procurement|purchasing|it finance|budget/i,                   key: 'it_finance' },
  { patterns: /data engineer|data architect|data analyst|data scientist|analytics|data platform/i, key: 'enterprise_data' },
  // Director / VP / Manager fallbacks
  { patterns: /vp.*security|director.*security|head.*security|security.*director|security.*vp/i, key: 'ciso' },
  { patterns: /vp.*it|director.*it|head.*it|it.*director|it.*vp|it.*manager|it.*director/i, key: 'cio' },
  { patterns: /vp.*network|director.*network/i,                                      key: 'network_arch' },
  { patterns: /program manager|project manager|technical.*manager|technology.*manager/i, key: 'cio' },
  // Broad keyword sweeps — order matters, more specific first
  { patterns: /network/i,                                                             key: 'netops' },
  { patterns: /security/i,                                                            key: 'secops' },
  { patterns: /endpoint|desktop/i,                                                   key: 'endpoint' },
  { patterns: /data|analytics/i,                                                     key: 'enterprise_data' },
  // Catch-all for any remaining IT title
  { patterns: /engineer|architect|manager|director|administrator|analyst|specialist|officer|lead|vp|head/i, key: 'infra_ops' },
];

export function getBattleCard(title: string | null): BattleCard | null {
  if (!title) return null;
  for (const { patterns, key } of TITLE_MAP) {
    if (patterns.test(title)) return BATTLECARDS[key] ?? null;
  }
  return null;
}

const URGENCY_CARD_MAP: Array<{ patterns: RegExp; key: string }> = [
  { patterns: /competitive displacement|zscaler|palo alto|crowdstrike/i, key: 'ciso' },
  { patterns: /compliance|regulatory|pci|hipaa|gdpr|audit/i,            key: 'grc' },
  { patterns: /infrastructure|moderniz|legacy|appliance/i,              key: 'infra_ops' },
  { patterns: /expansion|global|fast growth|rapid growth/i,             key: 'cio' },
  { patterns: /breach|incident|sec 8-k/i,                               key: 'secops' },
  { patterns: /new hire|ciso|cio|vp.*security/i,                        key: 'ciso' },
  { patterns: /funding|series|ipo/i,                                    key: 'cio' },
];

const SIGNAL_TYPE_CARD_MAP: Record<string, string> = {
  breach:    'secops',
  funding:   'cio',
  expansion: 'cio',
  hire:      'ciso',
  interest:  'security_arch',
  nurture:   'infra_ops',
};

export function getBattleCardBySignal(urgency: string, signalType: string): BattleCard | null {
  for (const { patterns, key } of URGENCY_CARD_MAP) {
    if (patterns.test(urgency)) return BATTLECARDS[key] ?? null;
  }
  const key = SIGNAL_TYPE_CARD_MAP[signalType];
  return key ? (BATTLECARDS[key] ?? null) : null;
}
