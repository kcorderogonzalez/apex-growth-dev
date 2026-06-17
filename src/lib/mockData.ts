import { Deal, Account, MedPicc, Persona, RepPerformance, Meeting, Contact } from '../types';
import { extendedAccounts } from '../data/extendedProspects';

const initialMedPicc: MedPicc = {
  metrics: 'Targeting 30% reduction in cloud spend',
  economicBuyer: 'Sarah Chen, CFO',
  decisionCriteria: 'Security compliance, Scalability, Cost-efficiency',
  decisionProcess: 'Technical review -> Security audit -> CFO approval',
  identifyPain: 'Legacy system downtime costing $50k/hour',
  champion: 'James Wilson, Head of Infrastructure',
  competition: 'Incumbent vendor (AWS Native), Zscaler'
};

const initialPersonas: Persona[] = [
  { name: 'Sarah Chen', role: 'CFO', sentiment: 'neutral', engagement: 45 },
  { name: 'James Wilson', role: 'Head of Infrastructure', sentiment: 'positive', engagement: 90 },
  { name: 'David Miller', role: 'Security Architect', sentiment: 'negative', engagement: 30 }
];

const realCompanies = [
  { name: 'Apple', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Microsoft', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Alphabet', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Amazon', industry: 'Technology', tier: 'Enterprise' },
  { name: 'NVIDIA', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Meta', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Berkshire Hathaway', industry: 'Finance', tier: 'Enterprise' },
  { name: 'Tesla', industry: 'Manufacturing', tier: 'Enterprise' },
  { name: 'Eli Lilly', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Broadcom', industry: 'Technology', tier: 'Enterprise' },
  { name: 'JPMorgan Chase', industry: 'Finance', tier: 'Enterprise' },
  { name: 'UnitedHealth', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Visa', industry: 'Finance', tier: 'Enterprise' },
  { name: 'ExxonMobil', industry: 'Energy', tier: 'Enterprise' },
  { name: 'Johnson & Johnson', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Walmart', industry: 'Retail', tier: 'Enterprise' },
  { name: 'Mastercard', industry: 'Finance', tier: 'Enterprise' },
  { name: 'Procter & Gamble', industry: 'Consumer Goods', tier: 'Enterprise' },
  { name: 'Home Depot', industry: 'Retail', tier: 'Enterprise' },
  { name: 'Chevron', industry: 'Energy', tier: 'Enterprise' },
  { name: 'AbbVie', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Merck', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Costco', industry: 'Retail', tier: 'Enterprise' },
  { name: 'Adobe', industry: 'Technology', tier: 'Strategic' },
  { name: 'Salesforce', industry: 'Technology', tier: 'Strategic' },
  { name: 'PepsiCo', industry: 'Consumer Goods', tier: 'Enterprise' },
  { name: 'Coca-Cola', industry: 'Consumer Goods', tier: 'Enterprise' },
  { name: 'Netflix', industry: 'Technology', tier: 'Strategic' },
  { name: 'Thermo Fisher', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Cisco', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Accenture', industry: 'Professional Services', tier: 'Enterprise' },
  { name: 'McDonald\'s', industry: 'Retail', tier: 'Enterprise' },
  { name: 'Intel', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Danaher', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Verizon', industry: 'Telecommunications', tier: 'Enterprise' },
  { name: 'NextEra Energy', industry: 'Energy', tier: 'Enterprise' },
  { name: 'Comcast', industry: 'Telecommunications', tier: 'Enterprise' },
  { name: 'Texas Instruments', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Wells Fargo', industry: 'Finance', tier: 'Enterprise' },
  { name: 'Nike', industry: 'Retail', tier: 'Strategic' },
  { name: 'Intuit', industry: 'Technology', tier: 'Strategic' },
  { name: 'Amgen', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'IBM', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Medtronic', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Honeywell', industry: 'Manufacturing', tier: 'Enterprise' },
  { name: 'Oracle', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Morgan Stanley', industry: 'Finance', tier: 'Enterprise' },
  { name: 'Lowe\'s', industry: 'Retail', tier: 'Enterprise' },
  { name: 'AT&T', industry: 'Telecommunications', tier: 'Enterprise' },
  { name: 'Union Pacific', industry: 'Logistics', tier: 'Enterprise' },
  { name: 'Boeing', industry: 'Manufacturing', tier: 'Enterprise' },
  { name: 'Caterpillar', industry: 'Manufacturing', tier: 'Enterprise' },
  { name: 'American Express', industry: 'Finance', tier: 'Enterprise' },
  { name: 'Goldman Sachs', industry: 'Finance', tier: 'Enterprise' },
  { name: 'Starbucks', industry: 'Retail', tier: 'Strategic' },
  { name: 'ServiceNow', industry: 'Technology', tier: 'Strategic' },
  { name: 'BlackRock', industry: 'Finance', tier: 'Enterprise' },
  { name: 'Intuitive Surgical', industry: 'Healthcare', tier: 'Strategic' },
  { name: 'Mondelez', industry: 'Consumer Goods', tier: 'Enterprise' },
  { name: 'Applied Materials', industry: 'Technology', tier: 'Enterprise' },
  { name: 'CVS Health', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'GE', industry: 'Manufacturing', tier: 'Enterprise' },
  { name: 'Marsh & McLennan', industry: 'Professional Services', tier: 'Enterprise' },
  { name: 'Analog Devices', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Stryker', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Gilead Sciences', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'Booking Holdings', industry: 'Technology', tier: 'Strategic' },
  { name: 'TJX Companies', industry: 'Retail', tier: 'Enterprise' },
  { name: 'Vertex Pharmaceuticals', industry: 'Healthcare', tier: 'Strategic' },
  { name: 'Progressive', industry: 'Finance', tier: 'Enterprise' },
  { name: 'Uber', industry: 'Technology', tier: 'Strategic' },
  { name: 'Airbnb', industry: 'Technology', tier: 'Strategic' },
  { name: 'Snowflake', industry: 'Technology', tier: 'Strategic' },
  { name: 'Palantir', industry: 'Technology', tier: 'Strategic' },
  { name: 'CrowdStrike', industry: 'Technology', tier: 'Strategic' },
  { name: 'Datadog', industry: 'Technology', tier: 'Strategic' },
  { name: 'Zscaler', industry: 'Technology', tier: 'Strategic' },
  { name: 'Cloudflare', industry: 'Technology', tier: 'Strategic' },
  { name: 'MongoDB', industry: 'Technology', tier: 'Strategic' },
  { name: 'Okta', industry: 'Technology', tier: 'Strategic' },
  { name: 'Twilio', industry: 'Technology', tier: 'Strategic' },
  { name: 'HubSpot', industry: 'Technology', tier: 'Strategic' },
  { name: 'Zoom', industry: 'Technology', tier: 'Strategic' },
  { name: 'Shopify', industry: 'Technology', tier: 'Strategic' },
  { name: 'Square', industry: 'Finance', tier: 'Strategic' },
  { name: 'PayPal', industry: 'Finance', tier: 'Strategic' },
  { name: 'Stripe', industry: 'Finance', tier: 'Strategic' },
  { name: 'SpaceX', industry: 'Manufacturing', tier: 'Strategic' },
  { name: 'Rivian', industry: 'Manufacturing', tier: 'Mid-Market' },
  { name: 'Lucid Motors', industry: 'Manufacturing', tier: 'Mid-Market' },
  { name: 'Moderna', industry: 'Healthcare', tier: 'Strategic' },
  { name: 'Pfizer', industry: 'Healthcare', tier: 'Enterprise' },
  { name: 'BioNTech', industry: 'Healthcare', tier: 'Strategic' },
  { name: 'Regeneron', industry: 'Healthcare', tier: 'Strategic' },
  { name: 'Illumina', industry: 'Healthcare', tier: 'Strategic' },
  { name: 'Equinix', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Digital Realty', industry: 'Technology', tier: 'Enterprise' },
  { name: 'Iron Mountain', industry: 'Professional Services', tier: 'Enterprise' },
  { name: 'American Tower', industry: 'Telecommunications', tier: 'Enterprise' },
  { name: 'Crown Castle', industry: 'Telecommunications', tier: 'Enterprise' }
];

export const territories = [
  { id: 't1',  name: 'Northwest',           manager: 'Arlene McCoy'    },
  { id: 't2',  name: 'Northern California', manager: 'Jerome Bell'     },
  { id: 't3',  name: 'Southern California', manager: 'Sandra Torres'   },
  { id: 't4',  name: 'Southwest',           manager: 'Guy Hawkins'     },
  { id: 't5',  name: 'Mountain',            manager: 'Bessie Richards' },
  { id: 't6',  name: 'Great Plains',        manager: 'Cody Fisher'     },
  { id: 't7',  name: 'Southeast',           manager: 'Elena L.'        },
  { id: 't8',  name: 'New England',         manager: 'Robert Fox'      },
  { id: 't9',  name: 'Northeast',           manager: 'Patricia Brown'  },
  { id: 't10', name: 'Mid-Atlantic',        manager: 'Jane Cooper'     },
  { id: 't11', name: 'Texas',               manager: 'Buck Holliday'   },
];

// HQ-based territory assignment for base 100 companies
const COMPANY_TERRITORY: Record<string, string> = {
  'Apple': 'Northern California', 'Microsoft': 'Northwest', 'Alphabet': 'Northern California',
  'Amazon': 'Northwest', 'NVIDIA': 'Northern California', 'Meta': 'Northern California',
  'Berkshire Hathaway': 'Great Plains', 'Tesla': 'Texas', 'Eli Lilly': 'Great Plains',
  'Broadcom': 'Northern California', 'JPMorgan Chase': 'Northeast', 'UnitedHealth': 'Great Plains',
  'Visa': 'Northern California', 'ExxonMobil': 'Texas', 'Johnson & Johnson': 'Northeast',
  'Walmart': 'Great Plains', 'Mastercard': 'Northeast', 'Procter & Gamble': 'Great Plains',
  'Home Depot': 'Southeast', 'Chevron': 'Northern California', 'AbbVie': 'Great Plains',
  'Merck': 'Northeast', 'Costco': 'Northwest', 'Adobe': 'Northern California',
  'Salesforce': 'Northern California', 'PepsiCo': 'Northeast', 'Coca-Cola': 'Southeast',
  'Netflix': 'Northern California', 'Thermo Fisher': 'New England', 'Cisco': 'Northern California',
  'Accenture': 'Northeast', "McDonald's": 'Great Plains', 'Intel': 'Northern California',
  'Danaher': 'Mid-Atlantic', 'Verizon': 'Northeast', 'NextEra Energy': 'Southeast',
  'Comcast': 'Northeast', 'Texas Instruments': 'Texas', 'Wells Fargo': 'Northern California',
  'Nike': 'Northwest', 'Intuit': 'Northern California', 'Amgen': 'Southern California',
  'IBM': 'Northeast', 'Medtronic': 'Great Plains', 'Honeywell': 'Southeast',
  'Oracle': 'Texas', 'Morgan Stanley': 'Northeast', "Lowe's": 'Southeast',
  'AT&T': 'Texas', 'Union Pacific': 'Great Plains', 'Boeing': 'Mid-Atlantic',
  'Caterpillar': 'Texas', 'American Express': 'Northeast', 'Goldman Sachs': 'Northeast',
  'Starbucks': 'Northwest', 'ServiceNow': 'Northern California', 'BlackRock': 'Northeast',
  'Intuitive Surgical': 'Northern California', 'Mondelez': 'Great Plains',
  'Applied Materials': 'Northern California', 'CVS Health': 'New England', 'GE': 'New England',
  'Marsh & McLennan': 'Northeast', 'Analog Devices': 'New England', 'Stryker': 'Great Plains',
  'Gilead Sciences': 'Northern California', 'Booking Holdings': 'New England',
  'TJX Companies': 'New England', 'Vertex Pharmaceuticals': 'New England',
  'Progressive': 'Great Plains', 'Uber': 'Northern California', 'Airbnb': 'Northern California',
  'Snowflake': 'Northern California', 'Palantir': 'Mountain', 'CrowdStrike': 'Texas',
  'Datadog': 'Northeast', 'Zscaler': 'Northern California', 'Cloudflare': 'Northern California',
  'MongoDB': 'Northeast', 'Okta': 'Northern California', 'Twilio': 'Northern California',
  'HubSpot': 'New England', 'Zoom': 'Northern California', 'Shopify': 'Northeast',
  'Square': 'Northern California', 'PayPal': 'Northern California', 'Stripe': 'Northern California',
  'SpaceX': 'Southern California', 'Rivian': 'Great Plains', 'Lucid Motors': 'Northern California',
  'Moderna': 'New England', 'Pfizer': 'Northeast', 'BioNTech': 'Northeast',
  'Regeneron': 'Northeast', 'Illumina': 'Southern California', 'Equinix': 'Northern California',
  'Digital Realty': 'Northern California', 'Iron Mountain': 'New England',
  'American Tower': 'New England', 'Crown Castle': 'Texas',
};

// Generate 10 reps (1 per territory)
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Barbara'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Martinez'];

export const reps: RepPerformance[] = [];
territories.forEach((t, i) => {
  const name = t.name === 'South East' ? 'Elena L.' : `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
  reps.push({
    id: `r-${i}`,
    name: name,
    meetings: Math.floor(Math.random() * 40) + 20,
    povs: Math.floor(Math.random() * 10) + 5,
    technicalWinRate: Math.floor(Math.random() * 30) + 60,
    bookings: Math.floor(Math.random() * 1000000) + 500000,
    quota: 1500000,
    efficiencyVariance: Math.floor(Math.random() * 40) - 20,
    status: Math.random() > 0.2 ? 'Effective' : 'At Risk'
  });
});

// Assign 100 accounts to territories based on actual HQ location
const baseAccounts: Account[] = realCompanies.map((c, i) => {
  const territoryName = COMPANY_TERRITORY[c.name] ?? territories[i % territories.length].name;
  const type: Account['type'] = i % 3 === 0 ? 'Customer' : 'Prospect';

  return {
    id: `acc-${i}`,
    name: c.name,
    type: type,
    arr: type === 'Customer' ? Math.floor(Math.random() * 3000000) + 500000 : 0,
    healthScore: type === 'Customer' ? Math.floor(Math.random() * 30) + 70 : 0,
    industry: c.industry,
    tier: c.tier as Account['tier'],
    territory: territoryName
  };
});

export const accounts: Account[] = [...baseAccounts, ...extendedAccounts];

// Distribute 300 deals to 100 accounts
const generateOpportunities = (): Deal[] => {
  const deals: Deal[] = [];
  const stages: Deal['stage'][] = ['discovery', 'proposal', 'negotiation', 'closing'];
  const statuses: Deal['status'][] = ['healthy', 'stalled', 'on-track'];
  const types = ['Expansion', 'New Business', 'Renewal', 'Upsell'];
  
  // Some prospects should have no deals
  const accountsWithDeals = accounts.filter((acc, i) => {
    if (acc.type === 'Prospect' && i % 5 === 0) return false; // 20% of prospects have no deals
    return true;
  });

  let dealCounter = 0;
  const targetDeals = 120; // Reduced from 160 to make it even more manageable
  
  // Distribute targetDeals among accountsWithDeals
  while (dealCounter < targetDeals) {
    const account = accountsWithDeals[dealCounter % accountsWithDeals.length];
    const territory = territories.find(t => t.name === account.territory)!;
    const territoryIndex = territories.findIndex(t => t.name === territory.name);
    const rep = reps[territoryIndex];
    
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const quarter = Math.floor(Math.random() * 3) + 2; 
    const month = (quarter - 1) * 3 + Math.floor(Math.random() * 3);
    const day = Math.floor(Math.random() * 28) + 1;
    const closeDate = `2026-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    deals.push({
      id: `deal-${dealCounter}`,
      name: `${types[Math.floor(Math.random() * types.length)]} - ${account.name}`,
      accountName: account.name,
      value: Math.floor(Math.random() * 450000) + 50000,
      type: types[Math.floor(Math.random() * types.length)] as any,
      status: status,
      stage: stage,
      closeDate: closeDate,
      nextStep: 'Executive alignment call',
      lastStageChangeDate: '2026-03-15',
      povSuccess: Math.random() > 0.3,
      validated: Math.random() > 0.4,
      territory: territory.name,
      rep: rep.name,
      medpicc: { ...initialMedPicc },
      personas: [...initialPersonas]
    });
    dealCounter++;
  }
  
  return deals;
};

export const allDeals = generateOpportunities();

// Filtered data for Elena in South East territory
export const elenaDeals = allDeals.filter(d => d.territory === 'South East');
export const elenaAccounts = accounts.filter(acc => acc.territory === 'South East');

export const mockMeetings: Meeting[] = [
  { id: 'm1', person: 'Sarah Jenkins', company: 'Stellar Dynamics Inc.', contactId: 'c1', date: '2026-04-10', time: '09:00 AM', status: 'Upcoming' },
  { id: 'm1-2', person: 'Michael Chen', company: 'Stellar Dynamics Inc.', contactId: 'c2', date: '2026-04-10', time: '01:30 PM', status: 'Upcoming' },
  { id: 'm2', person: 'Marcus Thorne', company: 'Stellar Dynamics Inc.', contactId: 'c3', date: '2026-04-12', time: '11:00 AM', status: 'Upcoming' },
  { id: 'm3', person: 'David Miller', company: 'Apple', contactId: 'c4', date: '2026-04-05', time: '02:00 PM', status: 'Attended', notes: 'Discussed cloud migration strategy. David is concerned about the timeline but likes the security features.' },
  { id: 'm3-prev', person: 'David Miller', company: 'Apple', contactId: 'c4', date: '2026-03-20', time: '11:00 AM', status: 'Attended', notes: 'Initial discovery call. Identified pain points in legacy infrastructure.' },
  { id: 'm4', person: 'Jennifer Smith', company: 'Microsoft', contactId: 'c5', date: '2026-04-02', time: '10:30 AM', status: 'Attended', notes: 'Product demo went well. Jennifer wants a follow-up with her technical architect.' },
  { id: 'm5', person: 'Robert Johnson', company: 'Amazon', contactId: 'c6', date: '2026-04-08', time: '03:00 PM', status: 'Canceled', notes: 'Client had a scheduling conflict. Rescheduling for next week.' },
  { id: 'm6', person: 'Patricia Williams', company: 'Alphabet', contactId: 'c7', date: '2026-04-15', time: '09:30 AM', status: 'Upcoming' },
];

const netskopeTitles = [
  'CISO', 'CIO', 'VP of IT Infrastructure', 'Head of Information Security', 
  'Cloud Security Architect', 'Network Security Engineer', 'Director of Cyber Security',
  'Security Operations Manager', 'Compliance Officer', 'IT Director',
  'Lead Security Analyst', 'VP of Cloud Engineering', 'Enterprise Architect'
];

const generateContacts = (): Contact[] => {
  const contacts: Contact[] = [];
  const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const sentiments: Contact['sentiment'][] = ['positive', 'neutral', 'negative'];

  for (let i = 0; i < 500; i++) {
    const account = accounts[i % accounts.length];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const title = netskopeTitles[Math.floor(Math.random() * netskopeTitles.length)];
    
    contacts.push({
      id: `c-${i}`,
      name,
      title,
      accountId: account.id,
      accountName: account.name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${account.name.toLowerCase().replace(/\s/g, '')}.com`,
      phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)]
    });
  }
  return contacts;
};

export const allContacts = generateContacts();
