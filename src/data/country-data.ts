// ===== Country Migration Data =====
// แหล่งอ้างอิง: OECD Better Life Index 2025, Numbeo, Global Peace Index 2025,
// WHO, World Bank, Home Affairs skill lists, immigration.govt.nz, IRCC Canada
// Last updated: Feb 2026

// ===== TYPES =====
export interface CountryScores {
  costOfLiving: number      // 1-10 (10 = affordable)
  safety: number            // 1-10
  healthcare: number        // 1-10
  education: number         // 1-10
  workLifeBalance: number   // 1-10
  taxFriendliness: number   // 1-10 (10 = low tax)
  immigrationEase: number   // 1-10 (for Thai citizens)
  jobMarket: number         // 1-10
  climate: number           // 1-10 (10 = warm/pleasant)
  politicalStability: number // 1-10
}

export interface Country {
  id: string
  name: string
  nameTH: string
  flag: string
  scores: CountryScores
  avgSalaryUSD: number
  costIndex: number // Thailand = 100
  hotJobs: string[] // occupation IDs with high demand
  visaPaths: string[]
  pros: string[]
  cons: string[]
  thaiCommunity: 'large' | 'medium' | 'small'
}

export interface MatchResult {
  country: Country
  matchPct: number
  highlights: string[]
  challenges: string[]
  occupationNote: string
}

// ===== OCCUPATION CATEGORIES (6 กลุ่มรวม — matchIds ใช้จับคู่กับ hotJobs) =====
export const OCCUPATIONS = [
  { id: 'software', label: '💻 IT / Tech / AI', labelTH: 'ไอที / เทค', matchIds: ['software', 'data-ai'] },
  { id: 'engineering', label: '⚙️ วิศวกร / ช่างเทคนิค', labelTH: 'วิศวกร / ช่าง', matchIds: ['engineering', 'trades'] },
  { id: 'accounting', label: '💰 บัญชี / การเงิน / บริหาร', labelTH: 'บัญชี / บริหาร', matchIds: ['accounting', 'business', 'marketing'] },
  { id: 'healthcare', label: '🏥 แพทย์ / พยาบาล', labelTH: 'แพทย์ / สุขภาพ', matchIds: ['healthcare'] },
  { id: 'chef', label: '🍳 เชฟ / Hospitality', labelTH: 'เชฟ / บริการ', matchIds: ['chef'] },
  { id: 'other', label: '📋 สายอื่นๆ', labelTH: 'อื่นๆ', matchIds: ['other', 'teaching', 'creative'] },
] as const

// ===== GOALS (combined motivation + priority — ถามทีเดียว เลือก 1-3) =====
export const GOALS = [
  { id: 'money-job', label: '💰 เงินดี หางานง่าย เก็บเงินได้', emoji: '💰', response: 'จริงจริง 💸 ค่าแรงไทยต่ำเทียบค่าครองชีพ เดี๋ยวคำนวณตัวเลขจริงให้ดู' },
  { id: 'balance', label: '⚖️ Work-life balance ดี ปลอดภัย', emoji: '⚖️', response: 'บอกเลย! 😩 เลิก 5 โมงคือเลิก กฎหมายแรงงานเข้ม ไม่มี OT ไม่จ่าย' },
  { id: 'family', label: '🎓 ลูกเรียนดี สวัสดิการครบ', emoji: '🎓', response: 'เรื่องลูกเข้าใจเลย 🎓 โรงเรียนรัฐดี Healthcare ฟรี ไม่ต้องจ่ายเพิ่ม' },
  { id: 'stable', label: '🛡️ การเมืองมั่นคง ระบบเป๊ะ', emoji: '🛡️', response: 'สำคัญมาก 🛡️ ไปอยู่ที่ระบบเวิร์ค ภาษีจ่ายเห็นผลจริง ชีวิตเปลี่ยน' },
  { id: 'lifestyle', label: '☀️ อากาศดี เกษียณสบาย ย้ายง่าย', emoji: '☀️', response: 'ชอบ! 🌏 ชีวิตสั้น ถ้าไม่ลองตอนนี้ แล้วจะลองตอนไหน' },
] as const

// ===== GOAL → CRITERIA WEIGHT MAPPING =====
const GOAL_WEIGHTS: Record<string, Partial<Record<keyof CountryScores, number>>> = {
  'money-job': { jobMarket: 4, taxFriendliness: 3, costOfLiving: 2 },
  'balance': { workLifeBalance: 4, safety: 3 },
  'family': { education: 4, healthcare: 3 },
  'stable': { politicalStability: 4, safety: 2 },
  'lifestyle': { climate: 3, immigrationEase: 3, costOfLiving: 2 },
}

// ===== OCCUPATION NOTES PER COUNTRY (ใช้ new grouped IDs) =====
const OCCUPATION_NOTES: Record<string, Record<string, string>> = {
  australia: {
    software: '🔥 IT/AI อยู่ใน Skill Shortage List — วีซ่า 189/190 เปิดรับ, Data/AI demand สูงมาก $80K+',
    engineering: '🔥 วิศวกร+ช่างขาดแคลนหนัก — Engineers Australia assess, electrician/plumber demand สูง',
    accounting: '✅ อยู่ใน Skill List — CPA Australia ต้องเทียบวุฒิ',
    healthcare: '🔥 พยาบาลขาดหนักมาก — fast track visa',
    chef: '✅ Chef อยู่ใน shortage list — 482 visa ได้',
    other: 'ℹ️ ตรวจสอบ Skill Shortage List ที่ Home Affairs',
  },
  canada: {
    software: '🔥 Express Entry NOC 21232 — IT/AI demand สูง, Toronto/Montreal เป็น hub',
    healthcare: '🔥 พยาบาลขาดมาก — PNP fast track',
    engineering: '✅ Engineers Canada assess — demand ดี, Red Seal trades สูงมาก',
    default: 'ℹ️ ใช้ระบบ Express Entry CRS points',
  },
  usa: {
    software: '💰 เงินเดือน IT/AI สูงสุดในโลก — แต่ H1B lottery ยาก',
    default: '⚠️ H1B visa lottery ~25% chance — ยากมาก',
  },
  uk: {
    software: '✅ Skilled Worker visa — Tech Nation endorsement',
    healthcare: '🔥 NHS ขาดแคลนหนัก — fast track',
    default: 'ℹ️ ใช้ Points-based system post-Brexit',
  },
  germany: {
    software: '✅ EU Blue Card — ไม่ต้องพูดเยอรมันก็ได้ช่วงแรก',
    engineering: '🔥 วิศวกรเป็นที่ต้องการมาก — auto/manufacturing',
    default: 'ℹ️ EU Blue Card หรือ Job Seeker visa',
  },
  japan: {
    software: '✅ Engineer visa — แต่ต้องพูด JP ในหลายบริษัท',
    chef: '✅ Thai restaurant demand — ได้ Specified Skilled Worker visa',
    default: '⚠️ ภาษาญี่ปุ่นสำคัญมาก — JLPT N2+ แนะนำ',
  },
  singapore: {
    software: '✅ Employment Pass — Tech hub ของ SEA, แต่กำลัง tighten',
    accounting: '✅ Financial hub — บัญชี/บริหารมี demand',
    default: 'ℹ️ Employment Pass ขั้นต่ำ $5,000/เดือน',
  },
}

function getOccupationNote(countryId: string, occupation: string): string {
  const countryNotes = OCCUPATION_NOTES[countryId]
  if (!countryNotes) return ''
  // ลองหา note ตรง id ก่อน → ถ้าไม่มี ลอง matchIds → fallback to default
  if (countryNotes[occupation]) return countryNotes[occupation]
  const occDef = OCCUPATIONS.find(o => o.id === occupation)
  if (occDef) {
    for (const mid of occDef.matchIds) {
      if (countryNotes[mid]) return countryNotes[mid]
    }
  }
  return countryNotes['default'] || ''
}

// ===== COUNTRY DATA =====
export const COUNTRIES: Country[] = [
  {
    id: 'australia', name: 'Australia', nameTH: 'ออสเตรเลีย', flag: '🇦🇺',
    scores: { costOfLiving: 4, safety: 8, healthcare: 9, education: 9, workLifeBalance: 8, taxFriendliness: 5, immigrationEase: 7, jobMarket: 8, climate: 8, politicalStability: 9 },
    avgSalaryUSD: 68000, costIndex: 250,
    hotJobs: ['software', 'data-ai', 'engineering', 'healthcare', 'trades', 'chef', 'accounting'],
    visaPaths: ['Skilled 189/190', 'Regional 491', 'Employer 482', 'WHV 417'],
    pros: ['เงินเดือนสูงมาก', 'Medicare ฟรี', 'อากาศดี', 'Skill list ยาว', 'มีคนไทยเยอะ'],
    cons: ['ค่าครองชีพสูง (Sydney)', 'ห่างจากไทย ~9 ชม.'],
    thaiCommunity: 'large',
  },
  {
    id: 'newzealand', name: 'New Zealand', nameTH: 'นิวซีแลนด์', flag: '🇳🇿',
    scores: { costOfLiving: 4, safety: 9, healthcare: 8, education: 8, workLifeBalance: 9, taxFriendliness: 5, immigrationEase: 6, jobMarket: 6, climate: 6, politicalStability: 9 },
    avgSalaryUSD: 55000, costIndex: 230,
    hotJobs: ['software', 'engineering', 'healthcare', 'trades'],
    visaPaths: ['Skilled Migrant', 'Essential Skills', 'WHV'],
    pros: ['ธรรมชาติสวยมาก', 'Work-life balance เยี่ยม', 'คนสบายๆ', 'ปลอดภัยมาก'],
    cons: ['เงินเดือนต่ำกว่า AU ~20%', 'เมืองเล็ก ตัวเลือกงานน้อย'],
    thaiCommunity: 'small',
  },
  {
    id: 'canada', name: 'Canada', nameTH: 'แคนาดา', flag: '🇨🇦',
    scores: { costOfLiving: 5, safety: 8, healthcare: 8, education: 9, workLifeBalance: 7, taxFriendliness: 4, immigrationEase: 7, jobMarket: 7, climate: 3, politicalStability: 9 },
    avgSalaryUSD: 60000, costIndex: 220,
    hotJobs: ['software', 'data-ai', 'healthcare', 'engineering', 'trades'],
    visaPaths: ['Express Entry', 'PNP', 'LMIA Work Permit'],
    pros: ['Diverse มาก เปิดรับผู้อพยพ', 'Express Entry ชัดเจน', 'การศึกษาดีมาก'],
    cons: ['หนาวมาก 🥶 -30°C ได้', 'Toronto/Vancouver แพงมาก'],
    thaiCommunity: 'medium',
  },
  {
    id: 'usa', name: 'USA', nameTH: 'อเมริกา', flag: '🇺🇸',
    scores: { costOfLiving: 5, safety: 5, healthcare: 5, education: 9, workLifeBalance: 4, taxFriendliness: 6, immigrationEase: 3, jobMarket: 9, climate: 7, politicalStability: 6 },
    avgSalaryUSD: 80000, costIndex: 260,
    hotJobs: ['software', 'data-ai', 'healthcare', 'engineering'],
    visaPaths: ['H1B (lottery)', 'L-1', 'EB Green Card', 'O-1 Extraordinary'],
    pros: ['เงินเดือนสูงสุดในโลก', 'Tech hub ของโลก', 'มหาวิทยาลัยระดับโลก'],
    cons: ['H1B lottery ยากมาก', 'ไม่มี universal healthcare', 'ปลอดภัยน้อยกว่า'],
    thaiCommunity: 'large',
  },
  {
    id: 'uk', name: 'United Kingdom', nameTH: 'อังกฤษ', flag: '🇬🇧',
    scores: { costOfLiving: 3, safety: 7, healthcare: 8, education: 9, workLifeBalance: 7, taxFriendliness: 4, immigrationEase: 5, jobMarket: 7, climate: 4, politicalStability: 8 },
    avgSalaryUSD: 55000, costIndex: 250,
    hotJobs: ['software', 'data-ai', 'healthcare', 'engineering', 'accounting'],
    visaPaths: ['Skilled Worker', 'Global Talent', 'Youth Mobility'],
    pros: ['ตลาดงานใหญ่', 'NHS universal healthcare', 'Oxford/Cambridge', 'Annual leave 28 วัน'],
    cons: ['London แพงมาก', 'อากาศทึม ฝนเยอะ 🌧️', 'ภาษีสูง'],
    thaiCommunity: 'medium',
  },
  {
    id: 'germany', name: 'Germany', nameTH: 'เยอรมนี', flag: '🇩🇪',
    scores: { costOfLiving: 6, safety: 8, healthcare: 9, education: 10, workLifeBalance: 9, taxFriendliness: 3, immigrationEase: 5, jobMarket: 7, climate: 4, politicalStability: 9 },
    avgSalaryUSD: 58000, costIndex: 200,
    hotJobs: ['software', 'engineering', 'data-ai', 'healthcare'],
    visaPaths: ['EU Blue Card', 'Job Seeker Visa', 'Skilled Worker'],
    pros: ['มหาวิทยาลัยฟรี! 🆓', 'Work-life ดีมาก', 'กฎหมายแรงงานเข้ม', 'Berlin ค่าครองชีพพอรับได้'],
    cons: ['ภาษาเยอรมันจำเป็น', 'ภาษี+ประกันสังคมสูง ~42%', 'อากาศทึม ❄️'],
    thaiCommunity: 'small',
  },
  {
    id: 'japan', name: 'Japan', nameTH: 'ญี่ปุ่น', flag: '🇯🇵',
    scores: { costOfLiving: 6, safety: 10, healthcare: 9, education: 8, workLifeBalance: 4, taxFriendliness: 5, immigrationEase: 4, jobMarket: 6, climate: 6, politicalStability: 9 },
    avgSalaryUSD: 45000, costIndex: 190,
    hotJobs: ['software', 'engineering', 'chef'],
    visaPaths: ['Engineer/Specialist', 'Specified Skilled Worker', 'Highly Skilled Professional'],
    pros: ['ปลอดภัยที่สุดในโลก', 'อาหารอร่อยมาก', 'ระบบเป๊ะ', 'ใกล้ไทย 6 ชม.'],
    cons: ['ภาษาญี่ปุ่นจำเป็นมาก', 'Work culture intense', 'เงินเดือนต่ำกว่า AU/US'],
    thaiCommunity: 'large',
  },
  {
    id: 'singapore', name: 'Singapore', nameTH: 'สิงคโปร์', flag: '🇸🇬',
    scores: { costOfLiving: 3, safety: 10, healthcare: 9, education: 9, workLifeBalance: 4, taxFriendliness: 9, immigrationEase: 5, jobMarket: 8, climate: 5, politicalStability: 9 },
    avgSalaryUSD: 58000, costIndex: 270,
    hotJobs: ['software', 'data-ai', 'accounting', 'business'],
    visaPaths: ['Employment Pass', 'S Pass', 'EntrePass'],
    pros: ['ภาษีต่ำมาก', 'ปลอดภัยมาก', 'ใกล้ไทย 2 ชม.! ✈️', 'Financial hub'],
    cons: ['ค่าครองชีพสูงมาก (บ้าน!)', 'ร้อนชื้นตลอดปี', 'เข้มงวดเรื่องกฎหมาย'],
    thaiCommunity: 'large',
  },
  {
    id: 'netherlands', name: 'Netherlands', nameTH: 'เนเธอร์แลนด์', flag: '🇳🇱',
    scores: { costOfLiving: 4, safety: 8, healthcare: 9, education: 9, workLifeBalance: 9, taxFriendliness: 4, immigrationEase: 5, jobMarket: 7, climate: 4, politicalStability: 9 },
    avgSalaryUSD: 55000, costIndex: 220,
    hotJobs: ['software', 'data-ai', 'engineering', 'business'],
    visaPaths: ['Highly Skilled Migrant', 'DAFT (สำหรับ freelancer)', 'EU Blue Card'],
    pros: ['Work-life balance ดีมาก', 'ปั่นจักรยานทุกที่ 🚲', 'พูดอังกฤษได้ทั่ว', 'เปิดกว้าง'],
    cons: ['อากาศฝน ลมแรง', 'หาบ้านยากมาก', 'ภาษีสูง'],
    thaiCommunity: 'small',
  },
  {
    id: 'sweden', name: 'Sweden', nameTH: 'สวีเดน', flag: '🇸🇪',
    scores: { costOfLiving: 5, safety: 7, healthcare: 9, education: 10, workLifeBalance: 10, taxFriendliness: 2, immigrationEase: 4, jobMarket: 6, climate: 2, politicalStability: 9 },
    avgSalaryUSD: 50000, costIndex: 220,
    hotJobs: ['software', 'engineering', 'healthcare'],
    visaPaths: ['Work Permit', 'EU Blue Card'],
    pros: ['Work-life balance ดีที่สุดในโลก', 'Education ฟรีทุกระดับ', 'Parental leave 480 วัน!', 'สวัสดิการครบ'],
    cons: ['ภาษีสูงมาก 50%+', 'มืดยาว+หนาวจัด ❄️', 'ภาษาสวีเดนต้องเรียน'],
    thaiCommunity: 'small',
  },
  {
    id: 'portugal', name: 'Portugal', nameTH: 'โปรตุเกส', flag: '🇵🇹',
    scores: { costOfLiving: 7, safety: 8, healthcare: 7, education: 7, workLifeBalance: 8, taxFriendliness: 6, immigrationEase: 8, jobMarket: 4, climate: 9, politicalStability: 8 },
    avgSalaryUSD: 28000, costIndex: 140,
    hotJobs: ['software', 'data-ai', 'creative'],
    visaPaths: ['D7 Passive Income', 'Digital Nomad Visa', 'Golden Visa'],
    pros: ['ค่าครองชีพถูกสุดใน EU', 'อากาศดีมาก ☀️', 'Digital Nomad Visa ง่าย', 'คนน่ารัก'],
    cons: ['เงินเดือนต่ำมาก', 'ตลาดงานเล็ก', 'ภาษาโปรตุเกสช่วยได้เยอะ'],
    thaiCommunity: 'small',
  },
  {
    id: 'korea', name: 'South Korea', nameTH: 'เกาหลีใต้', flag: '🇰🇷',
    scores: { costOfLiving: 5, safety: 9, healthcare: 9, education: 8, workLifeBalance: 3, taxFriendliness: 6, immigrationEase: 4, jobMarket: 6, climate: 5, politicalStability: 7 },
    avgSalaryUSD: 42000, costIndex: 190,
    hotJobs: ['software', 'engineering', 'creative'],
    visaPaths: ['E-7 Skilled Worker', 'D-10 Job Seeker', 'F-2 Points System'],
    pros: ['ปลอดภัยมาก', 'Healthcare ดีมากราคาถูก', 'Internet เร็วสุดในโลก', 'K-culture 🎵'],
    cons: ['Work culture หนักมาก', 'ภาษาเกาหลีจำเป็น', 'สังคมกดดัน'],
    thaiCommunity: 'medium',
  },
  {
    id: 'ireland', name: 'Ireland', nameTH: 'ไอร์แลนด์', flag: '🇮🇪',
    scores: { costOfLiving: 3, safety: 8, healthcare: 7, education: 8, workLifeBalance: 8, taxFriendliness: 5, immigrationEase: 6, jobMarket: 8, climate: 4, politicalStability: 9 },
    avgSalaryUSD: 60000, costIndex: 240,
    hotJobs: ['software', 'data-ai', 'accounting', 'business'],
    visaPaths: ['Critical Skills Permit', 'General Work Permit', 'Stamp 4'],
    pros: ['EU tech hub (Google, Meta, Apple)', 'พูดอังกฤษ', 'เงินเดือนดี', 'ประตูสู่ EU'],
    cons: ['Dublin แพงมาก (บ้าน!)', 'อากาศฝน ลม', 'เมืองเล็ก'],
    thaiCommunity: 'small',
  },
  {
    id: 'switzerland', name: 'Switzerland', nameTH: 'สวิตเซอร์แลนด์', flag: '🇨🇭',
    scores: { costOfLiving: 2, safety: 9, healthcare: 10, education: 9, workLifeBalance: 8, taxFriendliness: 7, immigrationEase: 3, jobMarket: 7, climate: 5, politicalStability: 10 },
    avgSalaryUSD: 95000, costIndex: 350,
    hotJobs: ['software', 'engineering', 'accounting', 'healthcare'],
    visaPaths: ['L Permit (short-term)', 'B Permit (work)', 'C Permit (permanent)'],
    pros: ['เงินเดือนสูงสุดในยุโรป', 'Healthcare ดีที่สุดในโลก', 'ภาษีต่ำ (เทียบ EU)', 'ธรรมชาติสวย 🏔️'],
    cons: ['แพงที่สุดในโลก', 'วีซ่ายากมาก (non-EU)', 'ต้องพูด FR/DE/IT'],
    thaiCommunity: 'small',
  },
]

// ===== MATCHING ALGORITHM =====
export interface MatchParams {
  goals: string[]
  occupation: string
  monthlyIncome: number // THB
  age: string
  family: string
}

export function matchCountries(params: MatchParams): MatchResult[] {
  // 1. Build weight vector from goals
  const weights: Partial<Record<keyof CountryScores, number>> = {}

  for (const g of params.goals) {
    const mapping = GOAL_WEIGHTS[g]
    if (mapping) {
      for (const [criterion, weight] of Object.entries(mapping)) {
        const key = criterion as keyof CountryScores
        weights[key] = (weights[key] || 0) + weight
      }
    }
  }

  // Ensure baseline weights for all criteria (so nothing is ignored)
  const allCriteria: (keyof CountryScores)[] = [
    'costOfLiving', 'safety', 'healthcare', 'education', 'workLifeBalance',
    'taxFriendliness', 'immigrationEase', 'jobMarket', 'climate', 'politicalStability'
  ]
  for (const c of allCriteria) {
    if (!weights[c]) weights[c] = 1
  }

  // 2. Score each country
  const results: MatchResult[] = COUNTRIES.map(country => {
    let score = 0
    let maxPossible = 0

    for (const [criterion, weight] of Object.entries(weights)) {
      const countryScore = country.scores[criterion as keyof CountryScores] || 5
      score += countryScore * weight
      maxPossible += 10 * weight
    }

    // 3. Occupation demand bonus (ใช้ matchIds จับคู่กับ hotJobs)
    const occDef = OCCUPATIONS.find(o => o.id === params.occupation)
    const isHotJob = occDef
      ? occDef.matchIds.some(mid => country.hotJobs.includes(mid))
      : country.hotJobs.includes(params.occupation)
    if (isHotJob) {
      score *= 1.12
    } else {
      score *= 0.92
    }

    // 4. Income feasibility adjustment
    // If user's income is low and country is very expensive, slight penalty
    const incomeLevel = params.monthlyIncome / 30000 // normalized (30K THB = 1.0)
    if (country.costIndex > 250 && incomeLevel < 1.5) {
      score *= 0.95 // slight penalty for very expensive countries with lower income
    }

    // 5. Age adjustment for immigration ease
    if (params.age === '45+') {
      // Some countries have age limits for skilled migration
      const ageRestrictedCountries = ['australia', 'canada', 'newzealand']
      if (ageRestrictedCountries.includes(country.id)) {
        score *= 0.90
      }
    }

    // Calculate match percentage
    const rawPct = (score / maxPossible) * 100
    const matchPct = Math.min(97, Math.max(15, Math.round(rawPct)))

    // Generate highlights based on user priorities
    const highlights = generateHighlights(country, params)
    const occupationNote = getOccupationNote(country.id, params.occupation)

    return {
      country,
      matchPct,
      highlights,
      challenges: country.cons,
      occupationNote,
    }
  })

  // Sort by match percentage, return top 5
  return results.sort((a, b) => b.matchPct - a.matchPct).slice(0, 5)
}

function generateHighlights(country: Country, params: MatchParams): string[] {
  const highlights: string[] = []

  // Add highlights based on high-scoring criteria that match user priorities
  const criteriaLabels: Record<string, string> = {
    costOfLiving: 'ค่าครองชีพ',
    safety: 'ความปลอดภัย',
    healthcare: 'สาธารณสุข',
    education: 'การศึกษา',
    workLifeBalance: 'Work-life balance',
    taxFriendliness: 'ภาษีเป็นมิตร',
    immigrationEase: 'ย้ายเข้าง่าย',
    jobMarket: 'ตลาดงาน',
    climate: 'อากาศดี',
    politicalStability: 'การเมืองมั่นคง',
  }

  // Sort country scores by value, pick top ones that match priorities
  const scoredCriteria = Object.entries(country.scores)
    .map(([key, val]) => ({ key: key as keyof CountryScores, val }))
    .sort((a, b) => b.val - a.val)

  for (const { key, val } of scoredCriteria) {
    if (val >= 8 && highlights.length < 3) {
      const label = criteriaLabels[key]
      if (val === 10) highlights.push(`⭐ ${label} ดีเลิศ`)
      else if (val === 9) highlights.push(`✅ ${label} ดีมาก`)
      else highlights.push(`✅ ${label} ดี`)
    }
  }

  // Add occupation note if it's a hot job (ใช้ matchIds)
  const occDef = OCCUPATIONS.find(o => o.id === params.occupation)
  const isHotJob = occDef
    ? occDef.matchIds.some(mid => country.hotJobs.includes(mid))
    : country.hotJobs.includes(params.occupation)
  if (isHotJob) {
    const occLabel = occDef?.labelTH || params.occupation
    highlights.push(`🔥 ${occLabel} เป็นที่ต้องการ`)
  }

  return highlights.slice(0, 4)
}
