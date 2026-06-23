"""
Procedural inbound lead generator.

Distribution:
  10% JUNK          — students, unemployed, journalists, raffle bait
  10% TOO_SMALL     — mom-and-pop, solo consultants, <10 employees
  15% INTERNATIONAL — outside US, unroutable to a territory
  35% SDR_WORTHY    — real companies, relevant titles, needs qualification
  20% RSM_READY     — enterprise / target persona, high signal
  10% DUPLICATE     — same person re-submitted via different source
"""

import random
from datetime import datetime, timedelta, timezone

# ---------------------------------------------------------------------------
# Reference data pools
# ---------------------------------------------------------------------------

FIRST_NAMES = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
    "David", "Barbara", "William", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Lisa", "Daniel", "Nancy",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Dorothy", "Paul", "Kimberly", "Andrew", "Emily", "Kenneth", "Donna",
    "Joshua", "Michelle", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Timothy", "Deborah", "Ronald", "Stephanie", "Edward", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Angela", "Eric", "Shirley", "Jonathan", "Anna", "Stephen", "Brenda",
    "Larry", "Pamela", "Justin", "Emma", "Scott", "Nicole", "Brandon", "Helen",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra",
    "Frank", "Rachel", "Alexander", "Carolyn", "Patrick", "Janet", "Jack", "Catherine",
    "Dennis", "Maria", "Jerry", "Heather", "Tyler", "Diane", "Aaron", "Julie",
    "Jose", "Joyce", "Adam", "Victoria", "Henry", "Kelly", "Nathan", "Christina",
    "Douglas", "Lauren", "Zachary", "Joan", "Peter", "Evelyn", "Kyle", "Judith",
    "Walter", "Olivia", "Ethan", "Megan", "Jeremy", "Cheryl", "Harold", "Martha",
    "Carl", "Andrea", "Arthur", "Frances", "Gerald", "Hannah", "Roger", "Jacqueline",
    "Dylan", "Ann", "Joe", "Gloria", "Juan", "Teresa", "Jack", "Kathryn",
    "Albert", "Sara", "Jonathan", "Janice", "Justin", "Jean", "Terry", "Alice",
    "Sean", "Madison", "Austin", "Doris", "Logan", "Abigail", "Noah", "Julia",
    "Liam", "Judy", "Mason", "Grace", "Lucas", "Denise", "Aiden", "Amber",
    "Ravi", "Priya", "Wei", "Mei", "Carlos", "Sofia", "Ahmed", "Fatima",
    "Yuki", "Hana", "Kwame", "Amara", "Igor", "Natasha", "Luca", "Elena",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
    "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
    "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz",
    "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales",
    "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson",
    "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward",
    "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray",
    "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel",
    "Myers", "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry",
    "Russell", "Sullivan", "Bell", "Coleman", "Butler", "Henderson", "Barnes", "Gonzales",
    "Fisher", "Vasquez", "Simmons", "Romero", "Jordan", "Patterson", "Alexander", "Hamilton",
    "Graham", "Reynolds", "Griffin", "Wallace", "Moreno", "West", "Cole", "Hayes",
    "Bryant", "Herrera", "Gibson", "Ellis", "Tran", "Medina", "Aguilar", "Stevens",
    "Murray", "Ford", "Castro", "Marshall", "Owens", "Harrison", "Fernandez", "Mcdonald",
    "Woods", "Washington", "Kennedy", "Wells", "Vargas", "Henry", "Chen", "Freeman",
    "Webb", "Tucker", "Guzman", "Burns", "Crawford", "Olson", "Simpson", "Porter",
    "Hunter", "Gordon", "Mendez", "Silva", "Shaw", "Snyder", "Mason", "Dixon",
    "Munoz", "Rose", "Blacks", "Stone", "Hawkins", "Dunn", "Perkins", "Hudson",
]

# --- Sources and their quality profiles ---
SOURCES = {
    "CONFERENCE":         {"quality_base": 0.55, "detail_pool": ["RSA Conference 2026", "Gartner Security Summit", "Black Hat USA", "Infosecurity Europe", "AWS re:Inforce", "Cisco Live", "CrowdStrike Fal.Con", "Palo Alto Ignite"]},
    "TRADE_SHOW":         {"quality_base": 0.40, "detail_pool": ["NAB Show", "CES 2026", "MWC Barcelona", "VMworld", "Dell Technologies World", "Dreamforce", "Microsoft Ignite", "Google Cloud Next"]},
    "WEB_FORM":           {"quality_base": 0.75, "detail_pool": ["netskope.com/demo-request", "netskope.com/contact-sales", "netskope.com/free-trial", "netskope.com/get-started"]},
    "CONTENT_DOWNLOAD":   {"quality_base": 0.30, "detail_pool": ["ZTNA Buyer's Guide", "SSE Market Report 2026", "Zero Trust Architecture Whitepaper", "Data Security Playbook", "SASE for Dummies"]},
    "PARTNER_REFERRAL":   {"quality_base": 0.80, "detail_pool": ["Deloitte Partner", "Accenture Alliance", "CDW Referral", "Presidio Partner", "WWT Alliance", "SHI International"]},
    "SOCIAL":             {"quality_base": 0.35, "detail_pool": ["LinkedIn Ad - ZTNA Campaign", "LinkedIn Ad - SSE Awareness", "Twitter/X Promoted Post", "LinkedIn InMail Campaign"]},
    "MARKETING_EVENT":    {"quality_base": 0.45, "detail_pool": ["Netskope Roadshow - NYC", "Netskope Roadshow - Chicago", "Netskope Roadshow - Austin", "CISO Forum - Virtual", "Partner Summit 2026", "Executive Dinner - SF"]},
}

# --- Title pools by persona tier ---
JUNK_TITLES = [
    "Student", "Graduate Student", "PhD Candidate", "Undergraduate", "MBA Student",
    "Intern", "Research Intern", "Summer Intern", "IT Intern",
    "Journalist", "Tech Reporter", "Freelance Writer", "Blogger", "Analyst (Freelance)",
    "Professor", "Associate Professor", "Lecturer", "Academic Researcher",
    "Retired", "Between Opportunities", "Job Seeker", "Career Transition",
    "Homemaker", "Self-Employed", "Hobbyist", "Independent Researcher",
    "Government Employee (Non-IT)", "Library Technician", "School Administrator",
]

TOO_SMALL_TITLES = [
    "Owner", "Co-Owner", "Founder", "Co-Founder", "CEO",
    "IT Guy", "IT Person", "Computer Guy", "Tech Person",
    "Office Manager", "General Manager", "Operations Manager",
    "Bookkeeper", "Accountant", "Administrative Assistant",
    "Small Business Owner", "Sole Proprietor", "President",
    "Managing Member", "Principal", "Proprietor",
]

TOO_SMALL_COMPANIES = [
    "Mike's Plumbing", "Sunrise Bakery", "Lakewood Auto Repair", "Cozy Corner Cafe",
    "Green Thumb Landscaping", "Peak Performance Gym", "Riverside Dental", "Main Street Hardware",
    "Golden Gate Cleaners", "Blue Sky Photography", "Harbor Lights Restaurant", "Maple Leaf Florist",
    "Rocky Mountain Roofing", "Coastal Realty", "Happy Paws Pet Shop", "Bright Minds Tutoring",
    "Silver Creek Consulting LLC", "Johnson Family Farm", "Downtown Yoga Studio", "Quick Print Shop",
    "Meadow Brook Veterinary", "Sunset Insurance Agency", "Old Town Barbershop", "The Handyman Co",
    "River Run Construction", "Mountain View Accounting", "Pine Ridge IT Services", "Clearwater Web Design",
]

SDR_TITLES = [
    "IT Manager", "Senior IT Manager", "IT Director",
    "Network Administrator", "Network Engineer", "Senior Network Engineer",
    "Systems Administrator", "Systems Engineer", "Senior Systems Engineer",
    "Security Analyst", "Senior Security Analyst", "Information Security Analyst",
    "Cloud Engineer", "Senior Cloud Engineer", "Cloud Architect",
    "DevOps Engineer", "Senior DevOps Engineer", "Platform Engineer",
    "Infrastructure Engineer", "Infrastructure Manager",
    "Security Operations Engineer", "SOC Analyst", "Senior SOC Analyst",
    "Compliance Manager", "Risk Analyst", "GRC Analyst",
    "IT Operations Manager", "IT Operations Lead",
    "Application Security Engineer", "Security Engineer",
    "Endpoint Security Manager", "Identity and Access Management Analyst",
    "Procurement Manager", "IT Procurement Specialist",
    "Technical Program Manager", "Solutions Architect",
    "Enterprise Architect", "IT Architect",
]

RSM_TITLES = [
    "CISO", "Chief Information Security Officer",
    "CIO", "Chief Information Officer",
    "CTO", "Chief Technology Officer",
    "VP of Security", "VP of Information Security", "VP of Cybersecurity",
    "VP of IT", "VP of Infrastructure", "VP of Engineering",
    "VP of Cloud Infrastructure", "VP of Technology",
    "Director of Security", "Director of Information Security", "Director of Cybersecurity",
    "Director of IT", "Director of Infrastructure", "Director of Cloud",
    "Director of Network Security", "Director of IT Operations",
    "Head of Security", "Head of Cybersecurity", "Head of IT Security",
    "Head of Cloud Security", "Head of Zero Trust",
    "Global Head of IT Security", "Global CISO",
    "SVP of Technology", "SVP of IT", "SVP of Engineering",
    "EVP of Technology", "Chief Security Officer", "CSO",
    "Managing Director - Technology", "Managing Director - Cybersecurity",
]

INDUSTRIES = [
    "Financial Services", "Banking", "Insurance", "Healthcare", "Life Sciences",
    "Pharmaceuticals", "Technology", "Software", "Cybersecurity", "Cloud Services",
    "Manufacturing", "Automotive", "Aerospace & Defense", "Government", "Federal Government",
    "State & Local Government", "Education", "Higher Education", "Retail", "E-Commerce",
    "Energy & Utilities", "Oil & Gas", "Telecommunications", "Media & Entertainment",
    "Professional Services", "Consulting", "Legal Services", "Real Estate", "Construction",
    "Transportation & Logistics", "Agriculture", "Non-Profit",
]

COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1001-5000", "5000+"]

PRODUCT_INTERESTS = ["ZTNA", "SSE", "Data Security", "CASB", "SWG", "SASE", "DLP", "Zero Trust", None, None, None]

# State → territory mapping
STATE_TERRITORY = {
    "WA": "Northwest", "OR": "Northwest", "ID": "Northwest", "AK": "Northwest",
    "CA": None,  # handled separately by city below
    "AZ": "Southwest", "NV": "Southwest", "NM": "Southwest", "UT": "Southwest", "HI": "Southwest",
    "CO": "Mountain", "WY": "Mountain", "MT": "Mountain",
    "OK": "Great Plains", "KS": "Great Plains", "NE": "Great Plains", "MN": "Great Plains",
    "IA": "Great Plains", "MO": "Great Plains", "WI": "Great Plains", "IL": "Great Plains",
    "MI": "Great Plains", "IN": "Great Plains", "OH": "Great Plains", "AR": "Great Plains",
    "FL": "Southeast", "GA": "Southeast", "AL": "Southeast", "MS": "Southeast",
    "TN": "Southeast", "SC": "Southeast", "NC": "Southeast", "LA": "Southeast",
    "MA": "New England", "CT": "New England", "RI": "New England", "VT": "New England",
    "NH": "New England", "ME": "New England",
    "NY": "Northeast", "NJ": "Northeast", "PA": "Northeast", "DE": "Northeast",
    "DC": "Mid-Atlantic", "MD": "Mid-Atlantic", "VA": "Mid-Atlantic", "WV": "Mid-Atlantic",
    "TX": "Texas",
    "ND": "Great Plains", "SD": "Great Plains", "KY": "Southeast",
}

US_CITIES_BY_STATE = {
    "WA": [("Seattle", "WA"), ("Bellevue", "WA"), ("Redmond", "WA"), ("Spokane", "WA")],
    "OR": [("Portland", "OR"), ("Eugene", "OR"), ("Salem", "OR")],
    "ID": [("Boise", "ID"), ("Nampa", "ID")],
    "AZ": [("Phoenix", "AZ"), ("Scottsdale", "AZ"), ("Tempe", "AZ"), ("Tucson", "AZ")],
    "NV": [("Las Vegas", "NV"), ("Reno", "NV"), ("Henderson", "NV")],
    "CO": [("Denver", "CO"), ("Boulder", "CO"), ("Colorado Springs", "CO"), ("Fort Collins", "CO")],
    "TX": [("Austin", "TX"), ("Dallas", "TX"), ("Houston", "TX"), ("San Antonio", "TX"), ("Plano", "TX")],
    "IL": [("Chicago", "IL"), ("Naperville", "IL"), ("Schaumburg", "IL")],
    "OH": [("Columbus", "OH"), ("Cleveland", "OH"), ("Cincinnati", "OH")],
    "GA": [("Atlanta", "GA"), ("Alpharetta", "GA"), ("Savannah", "GA")],
    "FL": [("Miami", "FL"), ("Tampa", "FL"), ("Orlando", "FL"), ("Jacksonville", "FL")],
    "NC": [("Charlotte", "NC"), ("Raleigh", "NC"), ("Durham", "NC")],
    "VA": [("McLean", "VA"), ("Arlington", "VA"), ("Richmond", "VA"), ("Reston", "VA")],
    "MD": [("Baltimore", "MD"), ("Bethesda", "MD"), ("Columbia", "MD")],
    "DC": [("Washington", "DC")],
    "NY": [("New York", "NY"), ("Buffalo", "NY"), ("Albany", "NY")],
    "NJ": [("Newark", "NJ"), ("Princeton", "NJ"), ("Jersey City", "NJ")],
    "PA": [("Philadelphia", "PA"), ("Pittsburgh", "PA"), ("Harrisburg", "PA")],
    "MA": [("Boston", "MA"), ("Cambridge", "MA"), ("Waltham", "MA"), ("Burlington", "MA")],
    "CT": [("Stamford", "CT"), ("Hartford", "CT"), ("Norwalk", "CT")],
    "MN": [("Minneapolis", "MN"), ("Saint Paul", "MN"), ("Eden Prairie", "MN")],
    "MO": [("St. Louis", "MO"), ("Kansas City", "MO")],
    "TN": [("Nashville", "TN"), ("Memphis", "TN"), ("Chattanooga", "TN")],
    "MI": [("Detroit", "MI"), ("Grand Rapids", "MI"), ("Ann Arbor", "MI")],
    "IN": [("Indianapolis", "IN"), ("Fort Wayne", "IN")],
    "WI": [("Milwaukee", "WI"), ("Madison", "WI")],
    "UT": [("Salt Lake City", "UT"), ("Provo", "UT")],
    "KS": [("Kansas City", "KS"), ("Wichita", "KS"), ("Overland Park", "KS")],
    "NE": [("Omaha", "NE"), ("Lincoln", "NE")],
    "OK": [("Oklahoma City", "OK"), ("Tulsa", "OK")],
    "LA": [("New Orleans", "LA"), ("Baton Rouge", "LA")],
    "SC": [("Charleston", "SC"), ("Columbia", "SC")],
    "AL": [("Birmingham", "AL"), ("Huntsville", "AL")],
    "MS": [("Jackson", "MS")],
    "AR": [("Little Rock", "AR"), ("Bentonville", "AR")],
    "IA": [("Des Moines", "IA"), ("Cedar Rapids", "IA")],
    "KY": [("Louisville", "KY"), ("Lexington", "KY")],
}

# Northern CA cities → Northern California territory
NORCAL_CITIES = {"San Francisco", "San Jose", "Oakland", "Santa Clara", "Sunnyvale",
                 "Mountain View", "Palo Alto", "Redwood City", "Menlo Park", "Foster City",
                 "Fremont", "Berkeley", "Sacramento", "Stockton", "San Mateo"}

SOCAL_CITIES = {"Los Angeles", "San Diego", "Irvine", "Anaheim", "Santa Ana",
                "Riverside", "San Bernardino", "Oxnard", "Thousand Oaks", "Long Beach",
                "Pasadena", "Torrance", "Hawthorne", "Burbank", "Santa Monica"}

INTERNATIONAL_COUNTRIES = [
    "United Kingdom", "Germany", "France", "Canada", "Australia",
    "Netherlands", "Sweden", "Switzerland", "Japan", "Singapore",
    "India", "Brazil", "Mexico", "Italy", "Spain",
    "South Korea", "Israel", "United Arab Emirates", "Denmark", "Finland",
]

INTERNATIONAL_CITIES = {
    "United Kingdom": "London", "Germany": "Munich", "France": "Paris",
    "Canada": "Toronto", "Australia": "Sydney", "Netherlands": "Amsterdam",
    "Sweden": "Stockholm", "Switzerland": "Zurich", "Japan": "Tokyo",
    "Singapore": "Singapore", "India": "Bangalore", "Brazil": "São Paulo",
    "Mexico": "Mexico City", "Italy": "Milan", "Spain": "Madrid",
    "South Korea": "Seoul", "Israel": "Tel Aviv", "United Arab Emirates": "Dubai",
    "Denmark": "Copenhagen", "Finland": "Helsinki",
}

ENTERPRISE_COMPANIES = [
    # Cybersecurity / Tech targets
    "JPMorgan Chase", "Bank of America", "Wells Fargo", "Citigroup", "Goldman Sachs",
    "Morgan Stanley", "Capital One", "Fidelity Investments", "Charles Schwab", "BlackRock",
    "UnitedHealth", "Anthem", "Cigna", "Aetna", "CVS Health",
    "HCA Healthcare", "Kaiser Permanente", "Mayo Clinic", "Cleveland Clinic",
    "Northrop Grumman", "Raytheon Technologies", "General Dynamics", "Boeing", "Lockheed Martin",
    "Booz Allen Hamilton", "Leidos", "SAIC", "CACI International", "ManTech International",
    "ExxonMobil", "Chevron", "ConocoPhillips", "Schlumberger", "Halliburton",
    "Duke Energy", "Dominion Energy", "Southern Company", "Exelon", "American Electric Power",
    "AT&T", "Verizon", "T-Mobile", "Comcast", "Charter Communications",
    "Deloitte", "PricewaterhouseCoopers", "EY", "KPMG", "Accenture",
    "Cognizant", "Infosys", "Wipro", "Tata Consultancy", "Capgemini",
    "Walmart", "Target Corporation", "Kroger", "Home Depot", "Costco",
    "FedEx", "UPS", "Amazon", "Microsoft", "IBM",
    "Salesforce", "Oracle", "SAP America", "ServiceNow", "Workday",
    "Adobe", "Cisco", "Intel", "Qualcomm", "Broadcom",
    "Tesla", "Ford", "General Motors", "Stellantis", "Toyota USA",
    "Johnson & Johnson", "Pfizer", "Merck", "AbbVie", "Eli Lilly",
    "Procter & Gamble", "Unilever USA", "Colgate-Palmolive", "Kimberly-Clark",
    "American Airlines", "Delta Air Lines", "United Airlines", "Southwest Airlines",
    "Marriott International", "Hilton Worldwide", "Hyatt Hotels",
    "Anthem Blue Cross", "Humana", "Molina Healthcare", "Centene Corporation",
    "Raytheon", "BAE Systems USA", "L3Harris Technologies",
    "Freddie Mac", "Fannie Mae", "Visa", "Mastercard", "American Express",
    "T. Rowe Price", "Vanguard Group", "State Street", "TIAA",
    "3M", "Honeywell", "Emerson Electric", "Parker Hannifin", "Rockwell Automation",
    "Stryker", "Medtronic", "Boston Scientific", "Becton Dickinson", "Baxter International",
    "Marriott", "Wyndham", "IHG Hotels", "Best Western",
    "Publix", "Albertsons", "Dollar General", "Dollar Tree", "AutoZone",
]

SDR_COMPANIES = [
    # Mid-market companies — real but not F500
    "Zendesk", "Freshworks", "Klaviyo", "Braze", "Amplitude", "Mixpanel",
    "Asana", "Monday.com", "Notion", "Airtable", "Figma", "Miro",
    "Greenhouse", "Lever", "Lattice", "Rippling", "Gusto", "Justworks",
    "Cloudflare", "Fastly", "Akamai Technologies", "Imperva", "Ping Identity",
    "SailPoint", "BeyondTrust", "CyberArk", "Delinea", "Saviynt",
    "Arctic Wolf", "Expel", "Huntress", "Deepwatch", "eSentire",
    "LogicMonitor", "Sumo Logic", "Elastic", "Grafana Labs", "Splunk",
    "Rapid7", "Qualys", "Tenable", "Tanium", "Dragos",
    "KnowBe4", "Proofpoint", "Mimecast", "Abnormal Security", "Cofense",
    "Verkada", "Genetec", "Avigilon", "Motorola Solutions",
    "Itron", "Trimble", "Hexagon", "ESRI", "Bentley Systems",
    "Tyler Technologies", "Granicus", "NIC Inc", "OpenGov", "Socrata",
    "VSP Global", "Pacific Premier Bank", "Banner Bank", "First Horizon",
    "Simmons Bank", "Glacier Bancorp", "National Western Life", "Erie Indemnity",
    "Stifel Financial", "Piper Sandler", "Baird", "Robert W. Baird",
    "Burns & McDonnell", "HDR Inc", "Jacobs Engineering", "AECOM",
    "Benchmark Electronics", "Jabil Circuit", "Flex Ltd", "Celestica",
    "TreeHouse Foods", "Prestige Brands", "Church & Dwight", "Spectrum Brands",
    "AMC Networks", "Lions Gate Entertainment", "iHeartMedia", "Cumulus Media",
    "Encompass Health", "Surgery Partners", "Acadia Healthcare", "Select Medical",
    "Apria Healthcare", "BrightSpring Health", "Option Care Health",
    "US Foods", "Sysco", "Performance Food Group",
    "Beacon Roofing Supply", "Foundation Building Materials", "WESCO International",
    "Anixter", "Graybar Electric", "Rexel USA",
    "Ryan LLC", "Alvarez & Marsal", "FTI Consulting", "Huron Consulting",
    "West Monroe Partners", "Protiviti", "Navigant Consulting",
]

EMAIL_DOMAINS_PERSONAL = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com"]

COMPETITOR_DOMAINS = [
    "zscaler.com", "paloaltonetworks.com", "fortinet.com", "cisco.com",
    "checkpoint.com", "broadcom.com", "forcepoint.com", "mcafee.com",
]

JUNK_MESSAGES = [
    "Just curious about your product", "My professor assigned me to research this company",
    "I'm writing an article about network security", "Saw your booth, grabbed a brochure",
    "Entered the raffle at the conference", "What is SASE? Asking for school",
    "Do you have an internship program?", "Looking for free tools for my home network",
    "Can you send me a t-shirt?", "I think I accidentally signed up for this",
    None, None, None,
]

SDR_MESSAGES = [
    "We're evaluating ZTNA solutions for our remote workforce",
    "Currently using Zscaler and looking to compare options",
    "Our CISO asked me to gather information on SSE platforms",
    "We have a security audit coming up and need to improve our posture",
    "Interested in learning more about your data security capabilities",
    "We're a mid-size company looking to modernize our network security",
    "Can you explain how Netskope compares to our current solution?",
    "We need help with cloud security — currently all on AWS",
    "Looking at SASE architectures for our distributed workforce",
    "Our compliance team flagged gaps in our DLP coverage",
    None, None,
]

RSM_MESSAGES = [
    "We're issuing an RFP for SSE and Netskope is on our shortlist",
    "I'm the CISO at a Fortune 500 and we're actively evaluating SASE vendors",
    "Our board mandated a Zero Trust initiative — need to move fast Q2",
    "We have 15,000 employees globally and need a cloud-native security platform",
    "Currently in contract renewal with Zscaler — want to run a competitive eval",
    "Our M&A activity has created security gaps we need to close immediately",
    "We have a $2M budget allocated for network security transformation this year",
    "I'm driving our data security strategy and Netskope keeps coming up in analyst reports",
    "We're a regulated financial institution needing CASB + DLP + ZTNA in one platform",
    "Just went through a ransomware incident — evaluating our entire security stack",
]


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _rng_email(first: str, last: str, company: str, tier: str, rng: random.Random) -> str:
    """Generate an email address. Junk/small leads more likely to use personal email."""
    use_personal = (
        tier == "JUNK" and rng.random() < 0.60
    ) or (
        tier == "TOO_SMALL" and rng.random() < 0.40
    ) or (
        tier in ("SDR_WORTHY", "INTERNATIONAL") and rng.random() < 0.15
    )

    if use_personal:
        domain = rng.choice(EMAIL_DOMAINS_PERSONAL)
    else:
        # Derive domain from company name
        slug = company.lower().replace(" ", "").replace(",", "").replace(".", "").replace("&", "and")[:20]
        domain = f"{slug}.com"

    local = f"{first.lower()}.{last.lower()}"
    if rng.random() < 0.1:
        local = f"{first[0].lower()}{last.lower()}"
    return f"{local}@{domain}"


def _is_competitor(email: str) -> bool:
    domain = email.split("@")[-1].lower()
    return any(domain.endswith(cd) for cd in COMPETITOR_DOMAINS)


def _quality_score(lead: dict, tier: str) -> float:
    """Compute 0–1 quality score from field completeness + tier signal."""
    fields = ["first_name", "last_name", "email", "company", "title",
              "hq_state", "hq_city", "company_size", "industry"]
    filled = sum(1 for f in fields if lead.get(f))
    base = filled / len(fields)

    # Source bonus
    source_quality = {
        "WEB_FORM": 0.15, "PARTNER_REFERRAL": 0.15,
        "CONFERENCE": 0.05, "MARKETING_EVENT": 0.05,
        "TRADE_SHOW": -0.05, "CONTENT_DOWNLOAD": -0.10, "SOCIAL": -0.10,
    }
    base += source_quality.get(lead.get("source", ""), 0)

    # Tier modifier
    tier_mod = {
        "RSM_READY": 0.10, "SDR_WORTHY": 0.05,
        "DUPLICATE": 0.0, "INTERNATIONAL": -0.05,
        "TOO_SMALL": -0.10, "JUNK": -0.20,
    }
    base += tier_mod.get(tier, 0)

    return round(min(max(base, 0.05), 1.0), 2)


# Sources that flow through Marketo (digital/marketing-tracked)
MARKETO_SOURCES = {"WEB_FORM", "CONTENT_DOWNLOAD", "SOCIAL", "MARKETING_EVENT"}

def _marketo_signal(rng: random.Random, tier: str, source: str) -> tuple[str | None, str | None]:
    """Return (marketo_signal, marketo_program) for leads originating from Marketo.

    Signal grid — letter = ICP fit (A=Top ICP → F=Junk), number = activity (1=High → 5=None).
      A1 Top ICP / High Activity    A4 Top ICP / Minimal Activity   A5 Top ICP / No Activity
      C3 Minimum ICP+Activity threshold
      E1 Non-ICP / High Activity    F1 Junk / High Activity         F5 Non-ICP / No Activity
    """
    # all sources get a signal; MARKETO_SOURCES only affects program name selection

    signal_pools = {
        "RSM_READY":    ["A1", "A1", "A2", "B1", "B2", "A3"],
        "SDR_WORTHY":   ["B2", "B3", "C2", "C3", "C1", "B1", "C3"],
        "INTERNATIONAL":["C3", "D2", "D3", "C4", "D4", "C3"],
        "TOO_SMALL":    ["D4", "D5", "E4", "E5", "D3", "E3"],
        "JUNK":         ["F1", "F2", "F3", "E1", "F5", "E5", "F4"],
        "DUPLICATE":    ["B2", "C3", "D3", "C2", "B3"],
    }
    signal = rng.choice(signal_pools.get(tier, ["C3"]))

    programs = {
        "WEB_FORM":         ["Netskope.com - Demo Request Form", "Netskope.com - Contact Sales Form", "Netskope.com - Free Trial", "Netskope.com - Get Started"],
        "CONTENT_DOWNLOAD": ["ZTNA Buyer's Guide - Gated", "SSE Market Report 2026 - Gated", "Zero Trust Whitepaper - Gated", "Data Security Playbook - Gated", "SASE for Dummies - Gated"],
        "SOCIAL":           ["LI - ZTNA Awareness Q2 2026", "LI - SSE Retargeting Q2 2026", "LI - Executive ABM Campaign", "LI - SASE Mid-Market Nurture"],
        "MARKETING_EVENT":  ["Netskope Roadshow 2026 - NYC", "Netskope Roadshow 2026 - Chicago", "Netskope Roadshow 2026 - Austin", "CISO Virtual Forum Q2 2026", "Executive Dinner SF 2026"],
    }
    program = rng.choice(programs.get(source, ["Marketo Campaign"]))
    return signal, program


def _random_captured_at(rng: random.Random, days_back: int = 90) -> datetime:
    """Return a random UTC datetime within the past N days, weighted toward recent."""
    # Weight recent days more heavily (exponential-ish)
    weight = rng.random() ** 1.5  # 0–1, skewed toward 0 (recent)
    delta_seconds = int(weight * days_back * 86400)
    base = datetime.now(timezone.utc) - timedelta(seconds=delta_seconds)
    # Add random time-of-day noise (business hours weighted)
    hour = rng.choices(range(24), weights=[1,1,1,1,1,2,4,8,10,10,10,9,8,10,10,10,9,8,7,6,5,4,3,2])[0]
    minute = rng.randint(0, 59)
    return base.replace(hour=hour, minute=minute, second=rng.randint(0, 59), microsecond=0)


def _pick_us_location(rng: random.Random) -> tuple[str, str]:
    """Return (city, state) from the US city pool."""
    state = rng.choice(list(US_CITIES_BY_STATE.keys()))
    city, st = rng.choice(US_CITIES_BY_STATE[state])
    return city, st


def _territory_for_location(city: str, state: str) -> str | None:
    if state == "CA":
        if city in NORCAL_CITIES:
            return "Northern California"
        if city in SOCAL_CITIES:
            return "Southern California"
        # Default split: assume NorCal if unrecognized CA city (edge case)
        return "Northern California"
    return STATE_TERRITORY.get(state)


# ---------------------------------------------------------------------------
# Tier-specific builders
# ---------------------------------------------------------------------------

def _build_junk(rng: random.Random, source: str, source_detail: str) -> dict:
    first = rng.choice(FIRST_NAMES)
    last = rng.choice(LAST_NAMES)
    title = rng.choice(JUNK_TITLES)
    company_options = ["N/A", "", "Self", "Student", "University of " + rng.choice(["Michigan", "Texas", "Florida", "Georgia", "Ohio State", "Penn State", "Arizona", "Washington"]), rng.choice(TOO_SMALL_COMPANIES)]
    company = rng.choice(company_options)
    email = _rng_email(first, last, company or "personal", "JUNK", rng)

    # Junk leads have lots of missing fields
    return {
        "source": source, "source_detail": source_detail,
        "first_name": first if rng.random() > 0.05 else None,
        "last_name": last if rng.random() > 0.10 else None,
        "email": email if rng.random() > 0.05 else None,
        "phone": None,
        "company": company if rng.random() > 0.20 else None,
        "title": title if rng.random() > 0.10 else None,
        "company_size": rng.choice(["1-10", "11-50", None, None, None]),
        "industry": rng.choice(["Education", "Non-Profit", None, None, None]),
        "hq_city": None,
        "hq_state": None,
        "hq_country": "United States",
        "annual_revenue": None,
        "message": rng.choice(JUNK_MESSAGES),
        "product_interest": None,
        "lead_tier": "JUNK",
        "is_competitor": False,
        "is_duplicate": False,
        "account_match": False,
        "meeting_secured": False,
        **dict(zip(("marketo_signal", "marketo_program"), _marketo_signal(rng, "JUNK", source))),
    }


def _build_too_small(rng: random.Random, source: str, source_detail: str) -> dict:
    first = rng.choice(FIRST_NAMES)
    last = rng.choice(LAST_NAMES)
    title = rng.choice(TOO_SMALL_TITLES)
    company = rng.choice(TOO_SMALL_COMPANIES)
    email = _rng_email(first, last, company, "TOO_SMALL", rng)
    city, state = _pick_us_location(rng)

    return {
        "source": source, "source_detail": source_detail,
        "first_name": first,
        "last_name": last if rng.random() > 0.05 else None,
        "email": email,
        "phone": f"({rng.randint(200,999)}) {rng.randint(200,999)}-{rng.randint(1000,9999)}" if rng.random() > 0.60 else None,
        "company": company,
        "title": title,
        "company_size": rng.choice(["1-10", "1-10", "11-50"]),
        "industry": rng.choice(["Retail", "Food & Beverage", "Construction", "Professional Services", None]),
        "hq_city": city if rng.random() > 0.30 else None,
        "hq_state": state if rng.random() > 0.20 else None,
        "hq_country": "United States",
        "annual_revenue": rng.choice([None, None, rng.uniform(100_000, 2_000_000)]),
        "message": rng.choice([None, "We're a small business looking to improve our security", "Is there a small business plan?", None]),
        "product_interest": rng.choice([None, None, "ZTNA"]),
        "lead_tier": "TOO_SMALL",
        "is_competitor": False,
        "is_duplicate": False,
        "account_match": False,
        "meeting_secured": False,
        **dict(zip(("marketo_signal", "marketo_program"), _marketo_signal(rng, "TOO_SMALL", source))),
    }


def _build_international(rng: random.Random, source: str, source_detail: str) -> dict:
    first = rng.choice(FIRST_NAMES)
    last = rng.choice(LAST_NAMES)
    country = rng.choice(INTERNATIONAL_COUNTRIES)
    city = INTERNATIONAL_CITIES[country]
    tier_titles = rng.choice([SDR_TITLES, RSM_TITLES, SDR_TITLES])
    title = rng.choice(tier_titles)
    company = rng.choice(SDR_COMPANIES + ENTERPRISE_COMPANIES[:30])
    email = _rng_email(first, last, company, "INTERNATIONAL", rng)

    return {
        "source": source, "source_detail": source_detail,
        "first_name": first,
        "last_name": last,
        "email": email if rng.random() > 0.05 else None,
        "phone": None if rng.random() > 0.40 else f"+{rng.randint(1,99)} {rng.randint(100,999)} {rng.randint(1000,9999)}",
        "company": company,
        "title": title,
        "company_size": rng.choice(COMPANY_SIZES),
        "industry": rng.choice(INDUSTRIES),
        "hq_city": city,
        "hq_state": None,
        "hq_country": country,
        "annual_revenue": rng.choice([None, rng.uniform(10_000_000, 5_000_000_000)]),
        "message": rng.choice(SDR_MESSAGES + [None]),
        "product_interest": rng.choice(PRODUCT_INTERESTS),
        "lead_tier": "INTERNATIONAL",
        "is_competitor": _is_competitor(email) if email else False,
        "is_duplicate": False,
        "account_match": rng.random() < 0.15,
        "meeting_secured": False,
        **dict(zip(("marketo_signal", "marketo_program"), _marketo_signal(rng, "INTERNATIONAL", source))),
    }


def _build_sdr_worthy(rng: random.Random, source: str, source_detail: str) -> dict:
    first = rng.choice(FIRST_NAMES)
    last = rng.choice(LAST_NAMES)
    title = rng.choice(SDR_TITLES)
    company = rng.choice(SDR_COMPANIES)
    city, state = _pick_us_location(rng)
    email = _rng_email(first, last, company, "SDR_WORTHY", rng)
    revenue = rng.choice([None, rng.uniform(5_000_000, 500_000_000)])

    return {
        "source": source, "source_detail": source_detail,
        "first_name": first,
        "last_name": last if rng.random() > 0.02 else None,
        "email": email if rng.random() > 0.03 else None,
        "phone": f"({rng.randint(200,999)}) {rng.randint(200,999)}-{rng.randint(1000,9999)}" if rng.random() > 0.45 else None,
        "company": company if rng.random() > 0.03 else None,
        "title": title,
        "company_size": rng.choice(["201-1000", "201-1000", "1001-5000", "51-200", None]),
        "industry": rng.choice(INDUSTRIES) if rng.random() > 0.25 else None,
        "hq_city": city if rng.random() > 0.20 else None,
        "hq_state": state if rng.random() > 0.15 else None,
        "hq_country": "United States",
        "annual_revenue": revenue,
        "message": rng.choice(SDR_MESSAGES),
        "product_interest": rng.choice(PRODUCT_INTERESTS),
        "lead_tier": "SDR_WORTHY",
        "is_competitor": _is_competitor(email) if email else False,
        "is_duplicate": False,
        "account_match": (_acct := rng.random() < 0.40),
        "meeting_secured": _acct and rng.random() < 0.10,
        **dict(zip(("marketo_signal", "marketo_program"), _marketo_signal(rng, "SDR_WORTHY", source))),
    }


def _build_rsm_ready(rng: random.Random, source: str, source_detail: str) -> dict:
    first = rng.choice(FIRST_NAMES)
    last = rng.choice(LAST_NAMES)
    title = rng.choice(RSM_TITLES)
    company = rng.choice(ENTERPRISE_COMPANIES)
    city, state = _pick_us_location(rng)
    email = _rng_email(first, last, company, "RSM_READY", rng)

    return {
        "source": source, "source_detail": source_detail,
        "first_name": first,
        "last_name": last,
        "email": email,
        "phone": f"({rng.randint(200,999)}) {rng.randint(200,999)}-{rng.randint(1000,9999)}" if rng.random() > 0.30 else None,
        "company": company,
        "title": title,
        "company_size": rng.choice(["1001-5000", "5000+", "5000+", "1001-5000"]),
        "industry": rng.choice(INDUSTRIES),
        "hq_city": city if rng.random() > 0.10 else None,
        "hq_state": state if rng.random() > 0.08 else None,
        "hq_country": "United States",
        "annual_revenue": rng.uniform(500_000_000, 50_000_000_000),
        "message": rng.choice(RSM_MESSAGES),
        "product_interest": rng.choice([p for p in PRODUCT_INTERESTS if p]),
        "lead_tier": "RSM_READY",
        "is_competitor": _is_competitor(email),
        "is_duplicate": False,
        "account_match": (_acct2 := rng.random() < 0.70),
        "meeting_secured": _acct2 and rng.random() < 0.25,
        **dict(zip(("marketo_signal", "marketo_program"), _marketo_signal(rng, "RSM_READY", source))),
    }


# ---------------------------------------------------------------------------
# Main generator
# ---------------------------------------------------------------------------

def generate_leads(count: int = 200, seed: int | None = None) -> list[dict]:
    """
    Generate `count` procedural leads with the configured distribution.
    Pass a fixed `seed` for deterministic output.
    """
    rng = random.Random(seed)

    # Target counts per tier
    targets = {
        "JUNK":          round(count * 0.10),
        "TOO_SMALL":     round(count * 0.10),
        "INTERNATIONAL": round(count * 0.15),
        "SDR_WORTHY":    round(count * 0.35),
        "RSM_READY":     round(count * 0.20),
        "DUPLICATE":     round(count * 0.10),
    }
    # Adjust for rounding so we hit exactly `count`
    total = sum(targets.values())
    if total < count:
        targets["SDR_WORTHY"] += count - total
    elif total > count:
        targets["SDR_WORTHY"] -= total - count

    builders = {
        "JUNK":          _build_junk,
        "TOO_SMALL":     _build_too_small,
        "INTERNATIONAL": _build_international,
        "SDR_WORTHY":    _build_sdr_worthy,
        "RSM_READY":     _build_rsm_ready,
    }

    leads = []

    # Build non-duplicate leads first
    for tier, target_count in targets.items():
        if tier == "DUPLICATE":
            continue
        for _ in range(target_count):
            source_key = rng.choice(list(SOURCES.keys()))
            source_detail = rng.choice(SOURCES[source_key]["detail_pool"])
            lead = builders[tier](rng, source_key, source_detail)
            lead["captured_at"] = _random_captured_at(rng)
            lead["data_quality_score"] = _quality_score(lead, tier)
            leads.append(lead)

    # Build duplicates by cloning existing leads with a different source
    base_leads_for_dupe = [l for l in leads if l["lead_tier"] in ("SDR_WORTHY", "RSM_READY")]
    for _ in range(targets["DUPLICATE"]):
        if not base_leads_for_dupe:
            break
        original = rng.choice(base_leads_for_dupe)
        dupe = original.copy()
        # Slightly different source, slightly later timestamp
        new_source_key = rng.choice(list(SOURCES.keys()))
        dupe["source"] = new_source_key
        dupe["source_detail"] = rng.choice(SOURCES[new_source_key]["detail_pool"])
        dupe["captured_at"] = original["captured_at"] + timedelta(hours=rng.randint(2, 72))
        dupe["is_duplicate"] = True
        dupe["lead_tier"] = "DUPLICATE"
        # Introduce minor data variation (common in real dupes)
        if rng.random() < 0.40:
            dupe["phone"] = None
        if rng.random() < 0.30:
            dupe["title"] = dupe["title"]  # sometimes exact match
        dupe["data_quality_score"] = _quality_score(dupe, "DUPLICATE")
        leads.append(dupe)

    # Shuffle so tiers aren't grouped
    rng.shuffle(leads)
    return leads
