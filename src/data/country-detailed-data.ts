// ===== Detailed Country Migration Data =====
// Complete visa costs, salaries, cost of living from official sources
// Last updated: Feb 12, 2026
// Sources: Home Affairs, IRCC, GOV.UK, Immigration NZ, Make it in Germany,
//          MOM Singapore, Migrationsverket, UDI, IND, GDRFAD, Department of Enterprise,
//          USCIS, Numbeo, PayScale, Glassdoor, SEEK, Job Bank Canada

export interface VisaCosts {
  single: number
  couple: number
  family: number // 2 adults + 1 child
  currency: string
  notes: string
  source: string
  lastUpdated: string
}

export interface SalaryRange {
  entry: number // 0-2 years
  mid: number // 3-6 years
  senior: number // 7+ years
  currency: string
}

export interface OccupationSalaries {
  softwareDev: SalaryRange
  dataAI: SalaryRange
  nurse: SalaryRange
  engineer: SalaryRange
  accountant: SalaryRange
  trades: SalaryRange
}

export interface CostOfLiving {
  city: string
  rent1BR: number
  food: number // monthly for single person
  transport: number // monthly
  utilities?: number
  currency: string
  notes?: string
}

export interface PRPath {
  minYears: number
  maxYears: number
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard'
  notes: string
}

export interface CountryDetailedData {
  id: string
  name: string
  flag: string
  
  // Visa
  visaCosts: VisaCosts
  minSalaryRequirement?: string
  
  // Salaries
  salaries: OccupationSalaries
  
  // Living costs
  costOfLiving: CostOfLiving[]
  
  // PR info
  prPath: PRPath
  
  // Key info
  keyBenefits: string[]
  keyChallenges: string[]
  
  // Sources
  officialSources: {
    immigration: string
    salaries: string
    costOfLiving: string
  }
  
  dataVersion: string
}

// ===== AUSTRALIA 🇦🇺 =====
export const AUSTRALIA: CountryDetailedData = {
  id: 'australia',
  name: 'Australia',
  flag: '🇦🇺',
  
  visaCosts: {
    single: 4765,
    couple: 7150,
    family: 8545,
    currency: 'AUD',
    notes: 'Skilled Independent 189 visa fees (Jan 2026)',
    source: 'Home Affairs',
    lastUpdated: 'Feb 2026',
  },
  
  salaries: {
    softwareDev: { entry: 75000, mid: 95000, senior: 140000, currency: 'AUD' },
    dataAI: { entry: 90000, mid: 120000, senior: 150000, currency: 'AUD' },
    nurse: { entry: 75000, mid: 85000, senior: 105000, currency: 'AUD' },
    engineer: { entry: 80000, mid: 100000, senior: 130000, currency: 'AUD' },
    accountant: { entry: 65000, mid: 80000, senior: 110000, currency: 'AUD' },
    trades: { entry: 65000, mid: 85000, senior: 130000, currency: 'AUD' },
  },
  
  costOfLiving: [
    { city: 'Sydney', rent1BR: 3440, food: 500, transport: 850, utilities: 294, currency: 'AUD', notes: 'Inner/Mid suburbs' },
    { city: 'Melbourne', rent1BR: 2460, food: 450, transport: 750, utilities: 291, currency: 'AUD' },
    { city: 'Brisbane', rent1BR: 2200, food: 400, transport: 700, utilities: 250, currency: 'AUD' },
  ],
  
  prPath: {
    minYears: 3,
    maxYears: 5,
    difficulty: 'medium',
    notes: '189 visa is direct PR. 491 regional requires 3 years in regional area.',
  },
  
  keyBenefits: [
    'High salaries (Top 3 globally)',
    'Medicare free healthcare',
    'Strong job market for skilled workers',
    'Large Thai community',
    'Clear points-based system',
  ],
  
  keyChallenges: [
    'Very expensive (Sydney/Melbourne)',
    'Far from Thailand (~9 hours)',
    'High visa cost',
    'Competitive points system (65+ required)',
  ],
  
  officialSources: {
    immigration: 'homeaffairs.gov.au',
    salaries: 'PayScale AU, SEEK Feb 2026',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Feb 2026',
}

// ===== CANADA 🇨🇦 =====
export const CANADA: CountryDetailedData = {
  id: 'canada',
  name: 'Canada',
  flag: '🇨🇦',
  
  visaCosts: {
    single: 1525,
    couple: 3050,
    family: 3310,
    currency: 'CAD',
    notes: 'Express Entry: Processing $950 + PR fee $575. Total realistic with docs: $3,500-5,000 single',
    source: 'IRCC',
    lastUpdated: 'Dec 2025',
  },
  
  minSalaryRequirement: 'CRS 470-490 points (fluctuates)',
  
  salaries: {
    softwareDev: { entry: 70000, mid: 90000, senior: 130000, currency: 'CAD' },
    dataAI: { entry: 80000, mid: 100000, senior: 140000, currency: 'CAD' },
    nurse: { entry: 60000, mid: 70000, senior: 90000, currency: 'CAD' },
    engineer: { entry: 70000, mid: 90000, senior: 120000, currency: 'CAD' },
    accountant: { entry: 55000, mid: 70000, senior: 95000, currency: 'CAD' },
    trades: { entry: 55000, mid: 75000, senior: 100000, currency: 'CAD' },
  },
  
  costOfLiving: [
    { city: 'Toronto', rent1BR: 2500, food: 500, transport: 200, currency: 'CAD', notes: 'Most expensive Canadian city' },
    { city: 'Vancouver', rent1BR: 2800, food: 550, transport: 180, currency: 'CAD', notes: 'Highest rent in Canada' },
    { city: 'Montreal', rent1BR: 1600, food: 400, transport: 150, currency: 'CAD', notes: 'More affordable, French speaking' },
  ],
  
  prPath: {
    minYears: 0.5,
    maxYears: 1,
    difficulty: 'medium',
    notes: 'Express Entry gives PR directly after 6-12 months if CRS score high enough',
  },
  
  keyBenefits: [
    'Fast PR (6-12 months)',
    'Diverse & welcoming',
    'Free healthcare',
    'Excellent education system',
    'Clear Express Entry system',
  ],
  
  keyChallenges: [
    'Extremely cold winters (-30°C possible)',
    'Toronto/Vancouver very expensive',
    'High CRS score needed (470+)',
    'Competitive job market in cities',
  ],
  
  officialSources: {
    immigration: 'ircc.canada.ca',
    salaries: 'Job Bank Canada, PayScale',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Dec 2025',
}

// ===== UNITED KINGDOM 🇬🇧 =====
export const UK: CountryDetailedData = {
  id: 'uk',
  name: 'United Kingdom',
  flag: '🇬🇧',
  
  visaCosts: {
    single: 1519,
    couple: 3038,
    family: 4557,
    currency: 'GBP',
    notes: 'Skilled Worker 3+ years: £1,519. PLUS Immigration Health Surcharge £1,035/year (Total 5yr: £5,175 + visa)',
    source: 'GOV.UK',
    lastUpdated: 'Oct 2024',
  },
  
  minSalaryRequirement: '£41,700/year (most jobs), 70 points required',
  
  salaries: {
    softwareDev: { entry: 35000, mid: 50000, senior: 70000, currency: 'GBP' },
    dataAI: { entry: 45000, mid: 65000, senior: 85000, currency: 'GBP' },
    nurse: { entry: 28000, mid: 35000, senior: 45000, currency: 'GBP' },
    engineer: { entry: 35000, mid: 50000, senior: 70000, currency: 'GBP' },
    accountant: { entry: 30000, mid: 45000, senior: 65000, currency: 'GBP' },
    trades: { entry: 28000, mid: 40000, senior: 55000, currency: 'GBP' },
  },
  
  costOfLiving: [
    { city: 'London', rent1BR: 1850, food: 400, transport: 200, currency: 'GBP', notes: 'Very expensive, zones 1-3' },
    { city: 'Manchester', rent1BR: 1000, food: 300, transport: 120, currency: 'GBP', notes: 'More affordable northern city' },
    { city: 'Edinburgh', rent1BR: 1200, food: 350, transport: 100, currency: 'GBP', notes: 'Scotland capital' },
  ],
  
  prPath: {
    minYears: 5,
    maxYears: 5,
    difficulty: 'medium',
    notes: 'Skilled Worker visa → Indefinite Leave to Remain after 5 years continuous residence',
  },
  
  keyBenefits: [
    'NHS universal healthcare',
    'English speaking',
    '28 days annual leave standard',
    'Access to Europe',
    'Strong education system',
  ],
  
  keyChallenges: [
    'London extremely expensive',
    'Gloomy weather, lots of rain 🌧️',
    'High tax rates',
    'IHS surcharge adds significant cost',
  ],
  
  officialSources: {
    immigration: 'gov.uk/skilled-worker-visa',
    salaries: 'Glassdoor UK, Reed',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Oct 2024',
}

// ===== NEW ZEALAND 🇳🇿 =====
export const NEW_ZEALAND: CountryDetailedData = {
  id: 'newzealand',
  name: 'New Zealand',
  flag: '🇳🇿',
  
  visaCosts: {
    single: 6450,
    couple: 7500,
    family: 8500,
    currency: 'NZD',
    notes: 'Skilled Migrant Category: Residence visa $6,450 (MAJOR increase from $4,290 Oct 2024!). Total with docs: $7,000-10,000',
    source: 'Immigration NZ',
    lastUpdated: 'Oct 2024',
  },
  
  salaries: {
    softwareDev: { entry: 65000, mid: 80000, senior: 100000, currency: 'NZD' },
    dataAI: { entry: 80000, mid: 100000, senior: 120000, currency: 'NZD' },
    nurse: { entry: 60000, mid: 70000, senior: 80000, currency: 'NZD' },
    engineer: { entry: 70000, mid: 85000, senior: 105000, currency: 'NZD' },
    accountant: { entry: 55000, mid: 70000, senior: 90000, currency: 'NZD' },
    trades: { entry: 55000, mid: 70000, senior: 90000, currency: 'NZD' },
  },
  
  costOfLiving: [
    { city: 'Auckland', rent1BR: 2200, food: 500, transport: 200, currency: 'NZD', notes: 'Most expensive NZ city' },
    { city: 'Wellington', rent1BR: 1900, food: 450, transport: 180, currency: 'NZD', notes: 'Capital city' },
    { city: 'Christchurch', rent1BR: 1600, food: 400, transport: 150, currency: 'NZD', notes: 'More affordable South Island' },
  ],
  
  prPath: {
    minYears: 2,
    maxYears: 5,
    difficulty: 'medium',
    notes: 'Skilled Migrant gives residence directly, can apply for citizenship after 5 years',
  },
  
  keyBenefits: [
    'Beautiful nature',
    'Work-life balance excellent',
    'Safe & peaceful',
    'Free healthcare',
    'Easy going culture',
  ],
  
  keyChallenges: [
    'Salaries 20-30% lower than AU',
    'Smaller job market',
    'Expensive visa (50% increase 2024!)',
    'Remote location',
  ],
  
  officialSources: {
    immigration: 'immigration.govt.nz',
    salaries: 'PayScale NZ, SEEK NZ',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Oct 2024',
}

// ===== GERMANY 🇩🇪 =====
export const GERMANY: CountryDetailedData = {
  id: 'germany',
  name: 'Germany',
  flag: '🇩🇪',
  
  visaCosts: {
    single: 100,
    couple: 200,
    family: 300,
    currency: 'EUR',
    notes: 'EU Blue Card: €100 (CHEAPEST!). Extension: €93-96',
    source: 'Make it in Germany',
    lastUpdated: 'Jan 2026',
  },
  
  minSalaryRequirement: '€50,700/year (general), €45,934/year (IT/Engineering shortage list)',
  
  salaries: {
    softwareDev: { entry: 50000, mid: 65000, senior: 90000, currency: 'EUR' },
    dataAI: { entry: 60000, mid: 75000, senior: 100000, currency: 'EUR' },
    nurse: { entry: 38000, mid: 45000, senior: 55000, currency: 'EUR' },
    engineer: { entry: 55000, mid: 70000, senior: 85000, currency: 'EUR' },
    accountant: { entry: 45000, mid: 60000, senior: 80000, currency: 'EUR' },
    trades: { entry: 40000, mid: 55000, senior: 70000, currency: 'EUR' },
  },
  
  costOfLiving: [
    { city: 'Berlin', rent1BR: 1200, food: 350, transport: 49, currency: 'EUR', notes: 'Deutschland-Ticket €49/month covers all public transport!' },
    { city: 'Munich', rent1BR: 1800, food: 400, transport: 49, currency: 'EUR', notes: 'Most expensive DE city' },
    { city: 'Frankfurt', rent1BR: 1400, food: 380, transport: 49, currency: 'EUR', notes: 'Financial center' },
  ],
  
  prPath: {
    minYears: 1.75,
    maxYears: 2.75,
    difficulty: 'easy',
    notes: 'EU Blue Card → PR after 33 months (with German B1) or 21 months (with German B2)',
  },
  
  keyBenefits: [
    'Cheapest visa (€100)!',
    'Free university education',
    'Excellent work-life balance',
    'Strong labor laws',
    'Fast PR (21 months possible)',
  ],
  
  keyChallenges: [
    'German language very helpful',
    'High tax + social security (~42%)',
    'Gloomy weather in winter',
    'Bureaucracy slow',
  ],
  
  officialSources: {
    immigration: 'make-it-in-germany.com',
    salaries: 'PayScale DE, Glassdoor DE',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Jan 2026',
}

// ===== SINGAPORE 🇸🇬 =====
export const SINGAPORE: CountryDetailedData = {
  id: 'singapore',
  name: 'Singapore',
  flag: '🇸🇬',
  
  visaCosts: {
    single: 330,
    couple: 660,
    family: 990,
    currency: 'SGD',
    notes: 'Employment Pass: Application $105 + Issuance $225 = $330',
    source: 'MOM Singapore',
    lastUpdated: 'Jan 2026',
  },
  
  minSalaryRequirement: '$5,600/month (most sectors), $6,200/month (finance), age-adjusted',
  
  salaries: {
    softwareDev: { entry: 60000, mid: 90000, senior: 130000, currency: 'SGD' },
    dataAI: { entry: 80000, mid: 110000, senior: 150000, currency: 'SGD' },
    nurse: { entry: 40000, mid: 55000, senior: 75000, currency: 'SGD' },
    engineer: { entry: 55000, mid: 80000, senior: 110000, currency: 'SGD' },
    accountant: { entry: 50000, mid: 75000, senior: 110000, currency: 'SGD' },
    trades: { entry: 35000, mid: 50000, senior: 70000, currency: 'SGD' },
  },
  
  costOfLiving: [
    { city: 'Singapore', rent1BR: 3000, food: 750, transport: 125, currency: 'SGD', notes: 'MRT excellent & cheap. Housing very expensive!' },
  ],
  
  prPath: {
    minYears: 5,
    maxYears: 10,
    difficulty: 'very-hard',
    notes: 'PR extremely difficult, requires long stay + contribution. No guaranteed path.',
  },
  
  keyBenefits: [
    'No capital gains tax, low income tax',
    'Very safe (world top)',
    'Close to Thailand (2 hours!)',
    'Financial hub of Asia',
    'English speaking',
  ],
  
  keyChallenges: [
    'Very expensive housing',
    'PR extremely difficult',
    'Hot & humid year-round',
    'Strict laws',
  ],
  
  officialSources: {
    immigration: 'mom.gov.sg',
    salaries: 'PayScale SG, Glassdoor SG',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Jan 2026',
}

// ===== SWEDEN 🇸🇪 =====
export const SWEDEN: CountryDetailedData = {
  id: 'sweden',
  name: 'Sweden',
  flag: '🇸🇪',
  
  visaCosts: {
    single: 2200,
    couple: 3200,
    family: 3700,
    currency: 'SEK',
    notes: 'Work Permit: Main applicant 2,200 SEK, Adult dependent 1,000 SEK, Child 500 SEK',
    source: 'Swedish Migration Agency',
    lastUpdated: 'Jan 2026',
  },
  
  minSalaryRequirement: '33,390 SEK/month (90% of median wage, June 2026)',
  
  salaries: {
    softwareDev: { entry: 480000, mid: 600000, senior: 720000, currency: 'SEK' },
    dataAI: { entry: 550000, mid: 700000, senior: 850000, currency: 'SEK' },
    nurse: { entry: 420000, mid: 480000, senior: 550000, currency: 'SEK' },
    engineer: { entry: 500000, mid: 620000, senior: 700000, currency: 'SEK' },
    accountant: { entry: 450000, mid: 580000, senior: 680000, currency: 'SEK' },
    trades: { entry: 420000, mid: 540000, senior: 650000, currency: 'SEK' },
  },
  
  costOfLiving: [
    { city: 'Stockholm', rent1BR: 15000, food: 4000, transport: 990, currency: 'SEK', notes: 'SL monthly pass 990 SEK' },
    { city: 'Gothenburg', rent1BR: 12000, food: 3500, transport: 900, currency: 'SEK', notes: 'Second largest city' },
    { city: 'Malmö', rent1BR: 10000, food: 3200, transport: 800, currency: 'SEK', notes: 'Close to Denmark' },
  ],
  
  prPath: {
    minYears: 4,
    maxYears: 5,
    difficulty: 'medium',
    notes: 'Permanent residence after 4 years with work permit. Citizenship after 5 years.',
  },
  
  keyBenefits: [
    'Best work-life balance in world',
    'Free education all levels',
    '480 days parental leave!',
    '5 weeks vacation standard',
    'Excellent welfare system',
  ],
  
  keyChallenges: [
    'Very high taxes (50%+)',
    'Dark & cold winters (6 hrs daylight Dec-Jan)',
    'Swedish language needed long-term',
    'Housing shortage in Stockholm',
  ],
  
  officialSources: {
    immigration: 'migrationsverket.se',
    salaries: 'Statistics Sweden (SCB)',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Jan 2026',
}

// ===== UAE (DUBAI) 🇦🇪 =====
export const UAE: CountryDetailedData = {
  id: 'uae',
  name: 'United Arab Emirates',
  flag: '🇦🇪',
  
  visaCosts: {
    single: 900,
    couple: 1800,
    family: 2700,
    currency: 'USD',
    notes: '2-Year Employment Visa: ~3,000-4,000 AED (~$815-1,090). Includes work permit, entry permit, Emirates ID, medical',
    source: 'GDRFA Dubai',
    lastUpdated: 'Nov 2025',
  },
  
  salaries: {
    softwareDev: { entry: 144000, mid: 204000, senior: 300000, currency: 'AED' },
    dataAI: { entry: 180000, mid: 264000, senior: 420000, currency: 'AED' },
    nurse: { entry: 96000, mid: 120000, senior: 180000, currency: 'AED' },
    engineer: { entry: 144000, mid: 192000, senior: 288000, currency: 'AED' },
    accountant: { entry: 120000, mid: 168000, senior: 240000, currency: 'AED' },
    trades: { entry: 72000, mid: 120000, senior: 180000, currency: 'AED' },
  },
  
  costOfLiving: [
    { city: 'Dubai', rent1BR: 5000, food: 2000, transport: 1200, currency: 'AED', notes: 'Very hot in summer (45°C+)' },
    { city: 'Abu Dhabi', rent1BR: 4500, food: 1800, transport: 1000, currency: 'AED', notes: 'Capital, slightly cheaper' },
  ],
  
  prPath: {
    minYears: 10,
    maxYears: 10,
    difficulty: 'medium',
    notes: 'Golden Visa (10 years) for high earners, investors, or exceptional talents',
  },
  
  keyBenefits: [
    'NO INCOME TAX!',
    'High savings potential',
    'Safe & modern',
    'Close to Thailand (6 hours)',
    'Golden Visa long-term option',
  ],
  
  keyChallenges: [
    'Extremely hot summers (45°C+)',
    'Employer-tied visa',
    'Expensive lifestyle if western standards',
    'No traditional PR path',
  ],
  
  officialSources: {
    immigration: 'gdrfad.gov.ae',
    salaries: 'Glassdoor UAE, Michael Page',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Nov 2025',
}

// ===== NORWAY 🇳🇴 =====
export const NORWAY: CountryDetailedData = {
  id: 'norway',
  name: 'Norway',
  flag: '🇳🇴',
  
  visaCosts: {
    single: 6300,
    couple: 16800,
    family: 17115,
    currency: 'NOK',
    notes: 'Skilled Worker Permit: Main 6,300 NOK, Adult dependent 10,500 NOK. Service fee €27 (~315 NOK)',
    source: 'UDI',
    lastUpdated: 'Dec 2025',
  },
  
  salaries: {
    softwareDev: { entry: 600000, mid: 750000, senior: 900000, currency: 'NOK' },
    dataAI: { entry: 700000, mid: 900000, senior: 1100000, currency: 'NOK' },
    nurse: { entry: 500000, mid: 600000, senior: 700000, currency: 'NOK' },
    engineer: { entry: 650000, mid: 800000, senior: 950000, currency: 'NOK' },
    accountant: { entry: 550000, mid: 700000, senior: 850000, currency: 'NOK' },
    trades: { entry: 500000, mid: 650000, senior: 800000, currency: 'NOK' },
  },
  
  costOfLiving: [
    { city: 'Oslo', rent1BR: 15000, food: 5000, transport: 1000, currency: 'NOK', notes: 'VERY expensive, highest salaries' },
    { city: 'Bergen', rent1BR: 13000, food: 4500, transport: 900, currency: 'NOK', notes: 'Second city, rainy' },
    { city: 'Trondheim', rent1BR: 12000, food: 4000, transport: 800, currency: 'NOK', notes: 'Student city' },
  ],
  
  prPath: {
    minYears: 3,
    maxYears: 3,
    difficulty: 'medium',
    notes: 'Permanent residence after 3 years with work permit. Citizenship after 8 years total.',
  },
  
  keyBenefits: [
    'Highest salaries in Europe',
    'Stunning nature',
    'Free healthcare & education',
    'Excellent work-life balance',
    '5 weeks vacation',
  ],
  
  keyChallenges: [
    'Most expensive country in Europe',
    'Very cold & dark winters (-20°C, polar night)',
    'Norwegian language helpful',
    'High alcohol prices',
  ],
  
  officialSources: {
    immigration: 'udi.no',
    salaries: 'Statistics Norway (SSB)',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Dec 2025',
}

// ===== NETHERLANDS 🇳🇱 =====
export const NETHERLANDS: CountryDetailedData = {
  id: 'netherlands',
  name: 'Netherlands',
  flag: '🇳🇱',
  
  visaCosts: {
    single: 423,
    couple: 846,
    family: 1269,
    currency: 'EUR',
    notes: 'Residence Permit: €423. Sponsor recognition (employer pays): €2,539-5,080',
    source: 'IND',
    lastUpdated: 'Nov 2025',
  },
  
  minSalaryRequirement: '€5,942/month (30+), €4,357/month (<30)',
  
  salaries: {
    softwareDev: { entry: 45000, mid: 62000, senior: 80000, currency: 'EUR' },
    dataAI: { entry: 55000, mid: 75000, senior: 95000, currency: 'EUR' },
    nurse: { entry: 35000, mid: 45000, senior: 60000, currency: 'EUR' },
    engineer: { entry: 50000, mid: 67000, senior: 85000, currency: 'EUR' },
    accountant: { entry: 42000, mid: 58000, senior: 75000, currency: 'EUR' },
    trades: { entry: 38000, mid: 52000, senior: 68000, currency: 'EUR' },
  },
  
  costOfLiving: [
    { city: 'Amsterdam', rent1BR: 1650, food: 400, transport: 125, currency: 'EUR', notes: '30% tax ruling saves ~€12K/year!' },
    { city: 'Rotterdam', rent1BR: 1300, food: 350, transport: 100, currency: 'EUR', notes: 'More affordable than AMS' },
    { city: 'Utrecht', rent1BR: 1400, food: 380, transport: 120, currency: 'EUR', notes: 'Central, bike-friendly' },
  ],
  
  prPath: {
    minYears: 5,
    maxYears: 5,
    difficulty: 'medium',
    notes: 'PR after 5 years. 30% tax ruling (30% income tax-free) for skilled migrants up to 5 years!',
  },
  
  keyBenefits: [
    '30% tax ruling (HUGE savings)',
    'English widely spoken',
    'Excellent work-life balance',
    'Bike-friendly culture 🚲',
    'Central Europe location',
  ],
  
  keyChallenges: [
    'Housing crisis (very hard to find)',
    'High normal tax without ruling',
    'Rainy & windy weather',
    'Bureaucracy',
  ],
  
  officialSources: {
    immigration: 'ind.nl',
    salaries: 'PayScale NL, Glassdoor NL',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Nov 2025',
}

// ===== IRELAND 🇮🇪 =====
export const IRELAND: CountryDetailedData = {
  id: 'ireland',
  name: 'Ireland',
  flag: '🇮🇪',
  
  visaCosts: {
    single: 1000,
    couple: 2000,
    family: 3000,
    currency: 'EUR',
    notes: 'Critical Skills Employment Permit: €1,000 (valid 2 years, 90% refund if refused). Visa fee: ~€60-100',
    source: 'Department of Enterprise',
    lastUpdated: 'Jan 2026',
  },
  
  minSalaryRequirement: '€40,904/year (Critical Skills List + degree), €68,911/year (High earner)',
  
  salaries: {
    softwareDev: { entry: 46000, mid: 55000, senior: 93000, currency: 'EUR' },
    dataAI: { entry: 55000, mid: 70000, senior: 85000, currency: 'EUR' },
    nurse: { entry: 35000, mid: 42000, senior: 50000, currency: 'EUR' },
    engineer: { entry: 45000, mid: 60000, senior: 80000, currency: 'EUR' },
    accountant: { entry: 40000, mid: 55000, senior: 65000, currency: 'EUR' },
    trades: { entry: 38000, mid: 50000, senior: 65000, currency: 'EUR' },
  },
  
  costOfLiving: [
    { city: 'Dublin', rent1BR: 1850, food: 500, transport: 145, currency: 'EUR', notes: 'Rent crisis! Very expensive housing' },
    { city: 'Cork', rent1BR: 1400, food: 450, transport: 100, currency: 'EUR', notes: 'Second city, more affordable' },
    { city: 'Galway', rent1BR: 1300, food: 420, transport: 90, currency: 'EUR', notes: 'West coast, artsy' },
  ],
  
  prPath: {
    minYears: 1.75,
    maxYears: 5,
    difficulty: 'easy',
    notes: 'Stamp 4 (unrestricted work) after 21 months! Fastest in EU. PR after 5 years. Citizenship after 5 years.',
  },
  
  keyBenefits: [
    'Fastest Stamp 4 in EU (21 months)!',
    'English speaking',
    'EU tech hub (Google, Meta, Apple)',
    'Gateway to EU',
    'Good salaries',
  ],
  
  keyChallenges: [
    'Dublin rent extremely high',
    'Housing shortage',
    'Rainy year-round 🌧️',
    'Small country, limited cities',
  ],
  
  officialSources: {
    immigration: 'irishimmigration.ie, enterprise.gov.ie',
    salaries: 'PayScale Ireland, Jobted Ireland',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Jan 2026',
}

// ===== USA 🇺🇸 =====
export const USA: CountryDetailedData = {
  id: 'usa',
  name: 'United States',
  flag: '🇺🇸',
  
  visaCosts: {
    single: 100000,
    couple: 200000,
    family: 300000,
    currency: 'USD',
    notes: 'H-1B: NEW Presidential Proclamation fee $100,000! (Sept 2025+) + standard fees $2,645-8,145. Indians also pay $250 Visa Integrity Fee. VERY EXPENSIVE!',
    source: 'USCIS',
    lastUpdated: 'Jan 2026',
  },
  
  minSalaryRequirement: 'Varies by role & location (prevailing wage)',
  
  salaries: {
    softwareDev: { entry: 100000, mid: 140000, senior: 250000, currency: 'USD' },
    dataAI: { entry: 120000, mid: 150000, senior: 195000, currency: 'USD' },
    nurse: { entry: 65000, mid: 80000, senior: 110000, currency: 'USD' },
    engineer: { entry: 85000, mid: 115000, senior: 160000, currency: 'USD' },
    accountant: { entry: 60000, mid: 80000, senior: 120000, currency: 'USD' },
    trades: { entry: 50000, mid: 70000, senior: 100000, currency: 'USD' },
  },
  
  costOfLiving: [
    { city: 'San Francisco', rent1BR: 3750, food: 800, transport: 250, currency: 'USD', notes: 'Highest cost, +27% salary premium' },
    { city: 'New York', rent1BR: 4250, food: 750, transport: 130, currency: 'USD', notes: 'Very expensive, best transit' },
    { city: 'Austin', rent1BR: 1850, food: 500, transport: 250, currency: 'USD', notes: 'Mid-tier, car needed' },
  ],
  
  prPath: {
    minYears: 5,
    maxYears: 15,
    difficulty: 'very-hard',
    notes: 'H-1B lottery ~25% chance. Green Card: EB-2/EB-3 1-3 years normally, BUT India/China backlog 5-15+ YEARS 😢',
  },
  
  keyBenefits: [
    'Highest salaries worldwide (2-3× other countries)',
    'Best tech opportunities (FAANG)',
    'Equity compensation common',
    'Career growth unmatched',
    'Innovation hub',
  ],
  
  keyChallenges: [
    'H-1B lottery system (low odds)',
    '$100K proclamation fee!',
    'Green Card backlog (10+ yrs for Indians)',
    'No universal healthcare ($300-800/mo insurance)',
    'Employer-tied visa',
  ],
  
  officialSources: {
    immigration: 'uscis.gov, travel.state.gov',
    salaries: 'Built In, Coursera, BLS',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Jan 2026',
}

// ===== PORTUGAL 🇵🇹 =====
export const PORTUGAL: CountryDetailedData = {
  id: 'portugal',
  name: 'Portugal',
  flag: '🇵🇹',
  
  visaCosts: {
    single: 110,
    couple: 220,
    family: 330,
    currency: 'EUR',
    notes: 'D7 Passive Income Visa: National D visa €110 (increased from €90 in 2025) + residence permit €160-170 + AIMA fee €156. Total realistic: €500-800',
    source: 'AIMA, Jobbatical',
    lastUpdated: 'Jan 2026',
  },
  
  minSalaryRequirement: 'D7: €920/month (€11,040/year), D8 Digital Nomad: €3,480-3,680/month',
  
  salaries: {
    softwareDev: { entry: 22000, mid: 39000, senior: 71000, currency: 'EUR' },
    dataAI: { entry: 30000, mid: 50000, senior: 85000, currency: 'EUR' },
    nurse: { entry: 18000, mid: 25000, senior: 35000, currency: 'EUR' },
    engineer: { entry: 25000, mid: 42000, senior: 65000, currency: 'EUR' },
    accountant: { entry: 22000, mid: 35000, senior: 55000, currency: 'EUR' },
    trades: { entry: 18000, mid: 28000, senior: 42000, currency: 'EUR' },
  },
  
  costOfLiving: [
    { city: 'Lisbon', rent1BR: 1150, food: 325, transport: 40, utilities: 100, currency: 'EUR', notes: 'Cheapest transport in Western EU (€40/month pass)' },
    { city: 'Porto', rent1BR: 850, food: 280, transport: 35, utilities: 90, currency: 'EUR', notes: '20-30% cheaper than Lisbon' },
  ],
  
  prPath: {
    minYears: 5,
    maxYears: 5,
    difficulty: 'easy',
    notes: 'Permanent residence after 5 years. Citizenship after 5 years (Portuguese A2 required). Stay requirement: only 7-14 days/year!',
  },
  
  keyBenefits: [
    'Lowest cost of living in Western Europe',
    'NHR Tax: 20% flat tax for qualified activities',
    'Tech hub growing (Web Summit, Lisbon)',
    'Golden visa alternative (D7 much cheaper)',
    '300+ sunny days per year',
    'English widely spoken in tech scene',
  ],
  
  keyChallenges: [
    'Lowest EU salaries (€25K-45K typical)',
    '40-60% lower than DE/NL',
    'AIMA appointments hard to get',
    'Housing crisis (Lisbon rent rising)',
    'Portuguese language helpful for integration',
  ],
  
  officialSources: {
    immigration: 'imigrante.sef.pt, aima.gov.pt',
    salaries: 'PayScale, Levels.fyi Feb 2026',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Jan 2026',
}

// ===== SOUTH KOREA 🇰🇷 =====
export const SOUTH_KOREA: CountryDetailedData = {
  id: 'korea',
  name: 'South Korea',
  flag: '🇰🇷',
  
  visaCosts: {
    single: 100,
    couple: 200,
    family: 300,
    currency: 'USD',
    notes: 'E-7 Professional Work Visa: Single entry $60, Multiple entry $100. Total with docs/translations: $200-500',
    source: 'Ministry of Justice Korea, Kowork',
    lastUpdated: 'Jan 2026',
  },
  
  minSalaryRequirement: 'E-7-1: ₩35,200,000/year (₩2,933,000/month ≈ $2,100/mo) increased Feb 1, 2026',
  
  salaries: {
    softwareDev: { entry: 36000000, mid: 47400000, senior: 94000000, currency: 'KRW' },
    dataAI: { entry: 45000000, mid: 66000000, senior: 73200000, currency: 'KRW' },
    nurse: { entry: 30000000, mid: 40000000, senior: 55000000, currency: 'KRW' },
    engineer: { entry: 40000000, mid: 53000000, senior: 94000000, currency: 'KRW' },
    accountant: { entry: 35000000, mid: 45000000, senior: 65000000, currency: 'KRW' },
    trades: { entry: 30000000, mid: 42000000, senior: 60000000, currency: 'KRW' },
  },
  
  costOfLiving: [
    { city: 'Seoul', rent1BR: 1200000, food: 400000, transport: 80000, utilities: 200000, currency: 'KRW', notes: 'Transport excellent & cheap. Internet fastest in world!' },
    { city: 'Busan', rent1BR: 900000, food: 350000, transport: 70000, utilities: 180000, currency: 'KRW', notes: '20-30% cheaper than Seoul' },
  ],
  
  prPath: {
    minYears: 5,
    maxYears: 5,
    difficulty: 'hard',
    notes: 'F-2 residence after 3-5 years (80+ points). F-5 PR after 5 years + TOPIK Level 4. Citizenship very difficult (must renounce).',
  },
  
  keyBenefits: [
    'Fastest internet in world (1Gbps standard)',
    'Excellent public transport',
    'Very safe, low crime',
    'Amazing food, affordable restaurants',
    'Tech jobs (Samsung, LG, Naver, Kakao)',
    '6-hour flight to Thailand',
  ],
  
  keyChallenges: [
    'Korean language essential (TOPIK 3-4)',
    'Work culture: long hours, hierarchical',
    'PR difficult (requires fluent Korean + 5 years)',
    'Salaries 30-50% lower than US/AU',
    'Age discrimination (harder for 35+)',
  ],
  
  officialSources: {
    immigration: 'hikorea.go.kr, kowork.kr',
    salaries: 'Join Horizons, Tivazo Jan 2026',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Jan 2026',
}

// ===== SWITZERLAND 🇨🇭 =====
export const SWITZERLAND: CountryDetailedData = {
  id: 'switzerland',
  name: 'Switzerland',
  flag: '🇨🇭',
  
  visaCosts: {
    single: 88,
    couple: 176,
    family: 264,
    currency: 'CHF',
    notes: 'Work Permit B: CHF 88 (Category D). Fees vary by canton (CHF 100-300 typical). Total realistic: CHF 200-500 (~$220-550 USD)',
    source: 'Swiss State Secretariat (SEM), Deel',
    lastUpdated: '2024',
  },
  
  salaries: {
    softwareDev: { entry: 90000, mid: 133000, senior: 287000, currency: 'CHF' },
    dataAI: { entry: 120000, mid: 150000, senior: 180000, currency: 'CHF' },
    nurse: { entry: 70000, mid: 85000, senior: 105000, currency: 'CHF' },
    engineer: { entry: 95000, mid: 120000, senior: 160000, currency: 'CHF' },
    accountant: { entry: 85000, mid: 110000, senior: 145000, currency: 'CHF' },
    trades: { entry: 75000, mid: 95000, senior: 125000, currency: 'CHF' },
  },
  
  costOfLiving: [
    { city: 'Zurich', rent1BR: 2400, food: 750, transport: 120, utilities: 200, currency: 'CHF', notes: 'Most expensive! + CHF 300-500/mo mandatory health insurance' },
    { city: 'Geneva', rent1BR: 2500, food: 800, transport: 130, utilities: 210, currency: 'CHF', notes: 'Slightly more expensive than Zurich' },
    { city: 'Basel', rent1BR: 1900, food: 650, transport: 100, utilities: 180, currency: 'CHF', notes: '10-20% cheaper than Zurich' },
  ],
  
  prPath: {
    minYears: 10,
    maxYears: 10,
    difficulty: 'very-hard',
    notes: 'Permit C (settlement): 10 years for non-EU (EU: 5 years). Citizenship after 10-12 years + canton approval (very strict).',
  },
  
  keyBenefits: [
    'Highest salaries in Europe (CHF 100K-200K+)',
    'High quality of life',
    'World-class healthcare',
    'Central Europe location',
    'Low taxes (compared to other high-salary countries)',
    'Multilingual (DE/FR/IT/EN)',
  ],
  
  keyChallenges: [
    'Most expensive country in world',
    'PR very slow (10 years for non-EU)',
    'Mandatory health insurance (CHF 300-500/mo)',
    'Work permit quotas for non-EU',
    'Must learn German/French for PR',
    'Not EU (no automatic EU work rights)',
  ],
  
  officialSources: {
    immigration: 'sem.admin.ch',
    salaries: 'Levels.fyi, Jobs.ch Feb 2026',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: '2024',
}

// ===== JAPAN 🇯🇵 =====
export const JAPAN: CountryDetailedData = {
  id: 'japan',
  name: 'Japan',
  flag: '🇯🇵',
  
  visaCosts: {
    single: 650,
    couple: 1300,
    family: 1950,
    currency: 'USD',
    notes: 'MAJOR INCREASE April 2026! PR: ¥100,000 (~$650, was ¥10,000). Visa status change: ¥30,000-40,000 (~$200-260, was ¥4,000-6,000). 500%+ increase!',
    source: 'Japan Ministry of Justice',
    lastUpdated: 'Feb 2026',
  },
  
  salaries: {
    softwareDev: { entry: 3500000, mid: 6000000, senior: 10000000, currency: 'JPY' },
    dataAI: { entry: 5500000, mid: 7000000, senior: 9000000, currency: 'JPY' },
    nurse: { entry: 3800000, mid: 4500000, senior: 6000000, currency: 'JPY' },
    engineer: { entry: 4000000, mid: 6000000, senior: 8500000, currency: 'JPY' },
    accountant: { entry: 3500000, mid: 5000000, senior: 7500000, currency: 'JPY' },
    trades: { entry: 3200000, mid: 4500000, senior: 6500000, currency: 'JPY' },
  },
  
  costOfLiving: [
    { city: 'Tokyo', rent1BR: 125000, food: 50000, transport: 15000, utilities: 12500, currency: 'JPY', notes: 'Most expensive JP city. Food affordable!' },
    { city: 'Osaka', rent1BR: 90000, food: 42000, transport: 13000, utilities: 11000, currency: 'JPY', notes: '20-30% cheaper than Tokyo' },
    { city: 'Fukuoka', rent1BR: 70000, food: 38000, transport: 11000, utilities: 10000, currency: 'JPY', notes: 'Most affordable major city' },
  ],
  
  prPath: {
    minYears: 1,
    maxYears: 10,
    difficulty: 'medium',
    notes: 'Standard: 10 years. HSP (Highly Skilled Professional): 1 year (80+ points) or 3 years (70-79 points). Citizenship: 5-10 years (must renounce).',
  },
  
  keyBenefits: [
    'Safest country in world',
    'Amazing cuisine, affordable eating out',
    'Best train system (Shinkansen)',
    'National Health Insurance affordable',
    'HSP visa fast-track PR (1-3 years)',
    'Unique culture, travel',
  ],
  
  keyChallenges: [
    'Japanese essential (JLPT N2-N1)',
    'Salaries 40-60% lower than US/AU',
    'Work culture: long hours, hierarchy',
    'Visa fees skyrocketing (PR ¥100K from April 2026)',
    'Must renounce citizenship',
    'Language barrier in daily life',
  ],
  
  officialSources: {
    immigration: 'moj.go.jp, immi-moj.go.jp',
    salaries: 'PayScale JP, Glassdoor JP',
    costOfLiving: 'Numbeo Feb 2026',
  },
  
  dataVersion: 'Feb 2026',
}

// ===== EXPORT ALL =====
export const ALL_DETAILED_COUNTRIES = [
  AUSTRALIA,
  CANADA,
  UK,
  NEW_ZEALAND,
  GERMANY,
  SINGAPORE,
  SWEDEN,
  UAE,
  NORWAY,
  NETHERLANDS,
  IRELAND,
  USA,
  PORTUGAL,
  SOUTH_KOREA,
  SWITZERLAND,
  JAPAN,
]

export function getCountryDetails(countryId: string): CountryDetailedData | undefined {
  return ALL_DETAILED_COUNTRIES.find(c => c.id === countryId)
}
