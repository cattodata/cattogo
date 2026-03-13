// ===== Country Migration Data =====
// แหล่งอ้างอิง: OECD Better Life Index 2025, Numbeo 2026, Global Peace Index 2025,
// WHO HAQ (Lancet 2018), World Bank WGI 2023, OECD PISA 2022
// Last updated: Mar 2026
//
// === SCORE METHODOLOGY (1–10) ===
// ทุก score อิงจาก published index + formula ด้านล่าง
// แต่ละประเทศมี reference comment บอก source value → score
//
// costOfLiving: Numbeo costIndex (TH=100). Bands: <110→9, 110-130→8, 131-150→7, 151-170→6, 171-195→5, 196-215→4, 216-250→3, 251-290→2, 291+→1
//   Source: https://www.numbeo.com/cost-of-living/rankings_by_country.jsp
// safety: Global Peace Index 2025 rank. #1-5→10, #6-15→9, #16-25→8, #26-40→7, #41-60→6, #61-80→5, #81-110→4, #111+→3
//   Source: https://www.visionofhumanity.org/maps/
// healthcare: WHO Healthcare Access & Quality Index (Lancet 2018). 90+→10, 87-89→9, 84-86→8, 80-83→7, 75-79→6, 70-74→5, <70→4
//   Source: Lancet 2018; DOI: 10.1016/S0140-6736(18)30994-2
// education: OECD PISA 2022 average + university quality (QS/THE) + free tuition (+1). Qualitative composite.
//   Source: https://www.oecd.org/pisa/
// workLifeBalance: OECD BLI hours + statutory vacation + parental leave + culture. Qualitative composite.
//   Source: https://www.oecdbetterlifeindex.org/
// taxFriendliness: Top marginal rate + social contrib. 0%→10, <20%→9, 20-30%→7, 30-40%→5, 40-50%→3, 50%+→2
//   Source: https://taxsummaries.pwc.com/
// immigrationEase: Qualitative — # visa paths for Thai, processing time, points vs sponsor
// jobMarket: Unemployment rate + skilled job openings. <3%→9-10, 3-5%→7-8, 5-7%→6, 7%+→5
//   Source: https://data.oecd.org/unemp/unemployment-rate.htm
// climate: สำหรับคนไทย (ชอบอบอุ่น). Mediterranean/subtropical→9, temperate→6-7, cold→3-4, extreme heat→2-3
// politicalStability: World Bank WGI percentile. 90+→10, 80-90→9, 70-80→8, 60-70→7, 50-60→6, <50→5
//   Source: https://info.worldbank.org/governance/wgi/
// politicalStability: World Bank WGI. 90%ile+→10, 80-90→9, 70-80→8, 60-70→7, 50-60→6, <50→5
//
// Exchange rates & currency symbols → import จาก constants.ts (single source of truth)
// ห้ามประกาศซ้ำในไฟล์นี้

import {
  CURRENCY_TO_THB as _CURRENCY_TO_THB,
  CURRENCY_SYMBOLS as _CURRENCY_SYMBOLS,
} from './constants'

// Re-export for backward compatibility (components ที่ import จากไฟล์นี้อยู่แล้วจะไม่พัง)
export const CURRENCY_TO_THB = _CURRENCY_TO_THB
export const CURRENCY_SYMBOLS = _CURRENCY_SYMBOLS

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
  currency: string // local currency code (AUD, CAD, GBP, etc.)
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
  goalReasons: string[]
  challenges: string[]
  occupationNote: string
}

// ===== OCCUPATION CATEGORIES (6 กลุ่มรวม — matchIds ใช้จับคู่กับ hotJobs) =====
export const OCCUPATIONS = [
  // 6 Tech/IT subcategories based on ANZSCO grouping
  { id: 'software', label: '💻 Software Developer / Programmer', labelTH: 'โปรแกรมเมอร์', matchIds: ['software'] },
  { id: 'data-ai', label: '🤖 Data / AI / ML Engineer', labelTH: 'Data / AI / ML', matchIds: ['data-ai', 'software'] },
  { id: 'devops-cloud', label: '☁️ DevOps / Cloud / Infra', labelTH: 'DevOps / Cloud', matchIds: ['software'] },
  { id: 'cybersecurity', label: '🔒 Cybersecurity', labelTH: 'Cybersecurity', matchIds: ['software'] },
  { id: 'network-admin', label: '🌐 Network / SysAdmin / IT Support', labelTH: 'Network / IT Support', matchIds: ['software', 'other'] },
  { id: 'it-management', label: '📋 IT Manager / PM / Scrum Master', labelTH: 'IT Manager / PM', matchIds: ['software', 'other'] },
  { id: 'other', label: '🔍 สาย Tech อื่นๆ', labelTH: 'Tech อื่นๆ', matchIds: ['software', 'other'] },
  /* Temporarily disabled — scope reduced to Tech/IT
  { id: 'engineering', label: '⚙️ วิศวกร / ช่างเทคนิค', labelTH: 'วิศวกร / ช่าง', matchIds: ['engineering', 'trades'] },
  { id: 'creative', label: '🎨 ครีเอทีฟ / ดีไซน์ / สื่อ', labelTH: 'ครีเอทีฟ / ดีไซน์', matchIds: ['creative', 'marketing'] },
  { id: 'accounting', label: '💰 บัญชี / การเงิน / บริหาร', labelTH: 'บัญชี / บริหาร', matchIds: ['accounting', 'business'] },
  { id: 'healthcare', label: '🏥 แพทย์ / พยาบาล', labelTH: 'แพทย์ / สุขภาพ', matchIds: ['healthcare'] },
  { id: 'chef', label: '🍳 เชฟ / Hospitality', labelTH: 'เชฟ / บริการ', matchIds: ['chef'] },
  */
] as const

// ===== GOALS (combined motivation + priority — ถามทีเดียว เลือก 1-3) =====
export const GOALS = [
  { id: 'money-job', label: '💰 เงินดี หางานง่าย เก็บเงินได้', emoji: '💰', response: '💰 รับทราบ — เดี๋ยวเทียบเงินเดือนและค่าครองชีพจริงให้ดูทุกประเทศ' },
  { id: 'balance', label: '⚖️ Work-life balance ดี ปลอดภัย', emoji: '⚖️', response: '⚖️ รับทราบ — เดี๋ยวเทียบชั่วโมงทำงาน กฎหมายแรงงาน และดัชนีความปลอดภัยให้' },
  { id: 'family', label: '🎓 ลูกเรียนดี สวัสดิการครบ', emoji: '🎓', response: '🎓 รับทราบ — เดี๋ยวเทียบคุณภาพการศึกษาและระบบสวัสดิการแต่ละประเทศให้' },
  { id: 'stable', label: '🛡️ การเมืองมั่นคง ระบบเป๊ะ', emoji: '🛡️', response: '🛡️ รับทราบ — เดี๋ยวเทียบดัชนีเสถียรภาพการเมืองและระบบราชการให้' },
  { id: 'lifestyle', label: '☀️ อากาศดี เกษียณสบาย ย้ายง่าย', emoji: '☀️', response: '☀️ รับทราบ — เดี๋ยวเทียบสภาพอากาศ ค่าครองชีพ และความง่ายในการย้ายให้' },
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
    creative: 'ℹ️ Graphic Design/UX อยู่ใน ANZSCO — 482 employer sponsor ได้, freelance ยาก',
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
    creative: '✅ London เป็น creative hub ระดับโลก — Global Talent visa สาย Arts & Culture',
    default: 'ℹ️ ใช้ Points-based system post-Brexit',
  },
  germany: {
    software: '✅ EU Blue Card — ไม่ต้องพูดเยอรมันก็ได้ช่วงแรก',
    engineering: '🔥 วิศวกรเป็นที่ต้องการมาก — auto/manufacturing',
    creative: '✅ Berlin เป็น creative hub — ค่าครองชีพถูกกว่า London/Paris, freelance visa ได้',
    default: 'ℹ️ EU Blue Card หรือ Job Seeker visa',
  },
  japan: {
    software: '✅ Engineer visa — แต่ต้องพูด JP ในหลายบริษัท. HSP fast-track PR (1-3 years)',
    chef: '✅ Thai restaurant demand — ได้ Specified Skilled Worker visa',
    default: '⚠️ ภาษาญี่ปุ่นสำคัญมาก (JLPT N2+). Visa fees ขึ้น 500% April 2026: PR ¥100K!',
  },
  singapore: {
    software: '✅ Employment Pass — Tech hub ของ SEA, แต่กำลัง tighten',
    accounting: '✅ Financial hub — บัญชี/บริหารมี demand',
    creative: 'ℹ️ Creative sector กำลังโต — แต่ Employment Pass min $5,000/mo',
    default: 'ℹ️ Employment Pass ขั้นต่ำ $5,000/เดือน',
  },
  uae: {
    software: '✅ Tech hub ของ Middle East — Dubai Internet City, salary ดี',
    engineering: '✅ Construction/Oil & Gas demand สูง — tax-free income',
    accounting: '✅ Financial hub — บัญชี/บริหารมี demand',
    healthcare: '✅ Nurses & doctors ขาด — salary competitive',
    creative: '✅ Dubai Media City/Design District — creative demand สูง, tax-free',
    default: 'ℹ️ Employment Visa 2 ปี หรือ Golden Visa 10 ปี',
  },
  norway: {
    software: '✅ Tech demand ดี — Bergen/Oslo hubs, เงินเดือนสูงยุโรป',
    engineering: '🔥 Oil & Gas engineering demand สูง — offshore + onshore',
    healthcare: '🔥 Nurses/doctors ขาดมาก — fast PR track',
    trades: '✅ Electrician/plumber demand ดี — เงินเดือนสูง',
    default: 'ℹ️ Skilled Worker Permit — Norwegian helpful long-term',
  },
  portugal: {
    software: '✅ Web Summit hub — Lisbon tech scene growing, €25K-70K',
    creative: '✅ Digital Nomad visa D8 — ดีไซน์/freelance เหมาะมาก, ค่าครองชีพถูก',
    default: 'ℹ️ D7 Passive Income (€920/mo) หรือ D8 Digital Nomad',
  },
  korea: {
    software: '✅ E-7 visa — Samsung, LG, Naver, Kakao. TOPIK 3-4 required',
    engineering: '✅ Manufacturing/auto demand — Hyundai, SK, LG',
    creative: '✅ K-content/entertainment industry กำลังบูม — แต่ Korean จำเป็น',
    default: '⚠️ Korean language essential (TOPIK 3-4) — E-7 min ₩35.2M/year',
  },
  switzerland: {
    software: '💰 Highest EU salaries CHF 100K-200K+ — Zurich, Geneva',
    engineering: '💰 Pharma/machinery engineers — CHF 95K-160K',
    accounting: '✅ Financial center — Banking demands high',
    healthcare: '✅ Healthcare professionals — CHF 70K-105K',
    default: '⚠️ Non-EU quota limited — German/French helpful, 10 years to PR',
  },
  netherlands: {
    software: '✅ Highly Skilled Migrant — Amsterdam tech hub, พูดอังกฤษได้',
    creative: '✅ Amsterdam/Rotterdam เป็น design hub — DAFT visa สำหรับ freelancer ได้',
    default: 'ℹ️ Highly Skilled Migrant หรือ DAFT visa (freelancer)',
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
// Cost of Living Index: Thailand = 100 (Bangkok baseline)
// Source: Numbeo 2026 - Bangkok index 41.4 (on NYC=100 scale)
// Formula: (City Numbeo Index / 41.4) × 100
export const COUNTRIES: Country[] = [
  {
    id: 'australia', name: 'Australia', nameTH: 'ออสเตรเลีย', flag: '🇦🇺',
    // REF: GPI#18→8, HAQ89→9, CI181→5, PISA493+uni→9, BLI13%+4wk→8, tax39%→5, 多visa→7, unemp3.5%→8, subtropical→8, WGI89→9
    scores: { costOfLiving: 5, safety: 8, healthcare: 9, education: 9, workLifeBalance: 8, taxFriendliness: 5, immigrationEase: 7, jobMarket: 8, climate: 8, politicalStability: 9 },
    avgSalaryUSD: 68000, costIndex: 181, currency: 'AUD',
    hotJobs: ['software', 'data-ai', 'engineering', 'healthcare', 'trades', 'chef', 'accounting'],
    visaPaths: ['Skilled 189/190', 'Regional 491', 'Employer 482', 'WHV 462 (ไทย: first-come, no quota)'],
    pros: ['เงินเดือนสูงมาก', 'Medicare ฟรี', 'อากาศดี', 'Skill list ยาว', 'มีคนไทยเยอะ'],
    cons: ['ค่าครองชีพสูง (Sydney)', 'ห่างจากไทย ~9 ชม.'],
    thaiCommunity: 'large',
  },
  {
    id: 'newzealand', name: 'New Zealand', nameTH: 'นิวซีแลนด์', flag: '🇳🇿',
    // REF: GPI#3→10, HAQ87→9, CI152→6, PISA485→8, BLI~8%→9, tax33%→5, immig→6, unemp4.3%→6, temperate→6, WGI95→9
    scores: { costOfLiving: 6, safety: 10, healthcare: 9, education: 8, workLifeBalance: 9, taxFriendliness: 5, immigrationEase: 6, jobMarket: 6, climate: 6, politicalStability: 9 },
    avgSalaryUSD: 55000, costIndex: 152, currency: 'NZD',
    hotJobs: ['software', 'engineering', 'healthcare', 'trades'],
    visaPaths: ['Skilled Migrant', 'Essential Skills', 'WHV'],
    pros: ['ธรรมชาติสวยมาก', 'Work-life balance เยี่ยม', 'คนสบายๆ', 'ปลอดภัยมาก'],
    cons: ['เงินเดือนต่ำกว่า AU ~20%', 'เมืองเล็ก ตัวเลือกงานน้อย'],
    thaiCommunity: 'small',
  },
  {
    id: 'canada', name: 'Canada', nameTH: 'แคนาดา', flag: '🇨🇦',
    // REF: GPI#14→9, HAQ88→9, CI163→6, PISA506→9, BLI3.7%→7, tax43%→4, Express Entry→7, unemp5.4%→7, cold→3, WGI89→9
    scores: { costOfLiving: 6, safety: 9, healthcare: 9, education: 9, workLifeBalance: 7, taxFriendliness: 4, immigrationEase: 7, jobMarket: 7, climate: 3, politicalStability: 9 },
    avgSalaryUSD: 60000, costIndex: 163, currency: 'CAD',
    hotJobs: ['software', 'data-ai', 'healthcare', 'engineering', 'trades'],
    visaPaths: ['Express Entry', 'PNP', 'LMIA Work Permit'],
    pros: ['Diverse มาก เปิดรับผู้อพยพ', 'Express Entry ชัดเจน', 'การศึกษาดีมาก'],
    cons: ['หนาวมาก 🥶 -30°C ได้', 'Toronto/Vancouver แพงมาก'],
    thaiCommunity: 'medium',
  },
  {
    id: 'usa', name: 'USA', nameTH: 'อเมริกา', flag: '🇺🇸',
    // REF: GPI#128→3, HAQ81→7, CI242→3, PISA484+top uni→9, BLI10%+0 mandatory PTO→4, tax37%→6, H1B lottery→3, unemp3.7%→9, varied→7, WGI60→6
    scores: { costOfLiving: 3, safety: 3, healthcare: 7, education: 9, workLifeBalance: 4, taxFriendliness: 6, immigrationEase: 3, jobMarket: 9, climate: 7, politicalStability: 6 },
    avgSalaryUSD: 80000, costIndex: 242, currency: 'USD',
    hotJobs: ['software', 'data-ai', 'healthcare', 'engineering'],
    visaPaths: ['H1B (lottery)', 'L-1', 'EB Green Card', 'O-1 Extraordinary'],
    pros: ['เงินเดือนสูงสุดในโลก', 'Tech hub ของโลก', 'มหาวิทยาลัยระดับโลก'],
    cons: ['H1B lottery ยากมาก', 'ไม่มี universal healthcare', 'ปลอดภัยน้อยกว่า'],
    thaiCommunity: 'large',
  },
  {
    id: 'uk', name: 'United Kingdom', nameTH: 'อังกฤษ', flag: '🇬🇧',
    // REF: GPI#30→7, HAQ85→8, CI211→4, PISA498+Oxbridge→9, BLI10.8%+28d→7, tax45%→4, Skilled Worker→5, unemp4%→7, ฝนทึม→4, WGI78→8
    scores: { costOfLiving: 4, safety: 7, healthcare: 8, education: 9, workLifeBalance: 7, taxFriendliness: 4, immigrationEase: 5, jobMarket: 7, climate: 4, politicalStability: 8 },
    avgSalaryUSD: 55000, costIndex: 211, currency: 'GBP',
    hotJobs: ['software', 'data-ai', 'healthcare', 'engineering', 'accounting', 'creative'],
    visaPaths: ['Skilled Worker', 'Global Talent', 'Youth Mobility'],
    pros: ['ตลาดงานใหญ่', 'NHS universal healthcare', 'Oxford/Cambridge', 'Annual leave 28 วัน'],
    cons: ['London แพงมาก', 'อากาศทึม ฝนเยอะ 🌧️', 'ภาษีสูง'],
    thaiCommunity: 'medium',
  },
  {
    id: 'germany', name: 'Germany', nameTH: 'เยอรมนี', flag: '🇩🇪',
    // REF: GPI#20→8, HAQ88→9, CI169→6, PISA488+free uni→10, BLI3.8%+30d→9, tax42%+soc→3, Blue Card→5, unemp3.2%→7, cold→4, WGI84→9
    scores: { costOfLiving: 6, safety: 8, healthcare: 9, education: 10, workLifeBalance: 9, taxFriendliness: 3, immigrationEase: 5, jobMarket: 7, climate: 4, politicalStability: 9 },
    avgSalaryUSD: 58000, costIndex: 169, currency: 'EUR',
    hotJobs: ['software', 'engineering', 'data-ai', 'healthcare', 'creative'],
    visaPaths: ['EU Blue Card', 'Job Seeker Visa', 'Skilled Worker'],
    pros: ['มหาวิทยาลัยฟรี! 🆓', 'Work-life ดีมาก', 'กฎหมายแรงงานเข้ม', 'Berlin ค่าครองชีพพอรับได้'],
    cons: ['ภาษาเยอรมันจำเป็น', 'ภาษี+ประกันสังคมสูง ~42%', 'อากาศทึม ❄️'],
    thaiCommunity: 'small',
  },
  {
    id: 'japan', name: 'Japan', nameTH: 'ญี่ปุ่น', flag: '🇯🇵',
    // REF: GPI#12→9, HAQ89→9, CI131→7, PISA539+barrier→8, BLI15.7%→4, tax45%→5, immig→4, unemp2.6%→6, temperate→6, WGI88→9
    scores: { costOfLiving: 7, safety: 9, healthcare: 9, education: 8, workLifeBalance: 4, taxFriendliness: 5, immigrationEase: 4, jobMarket: 6, climate: 6, politicalStability: 9 },
    avgSalaryUSD: 45000, costIndex: 131, currency: 'JPY',
    hotJobs: ['software', 'engineering', 'chef'],
    visaPaths: ['Engineer/Specialist', 'Specified Skilled Worker', 'Highly Skilled Professional'],
    pros: ['ปลอดภัยที่สุดในโลก', 'อาหารอร่อยมาก', 'ระบบเป๊ะ', 'ใกล้ไทย 6 ชม.'],
    cons: ['ภาษาญี่ปุ่นจำเป็นมาก', 'Work culture intense', 'เงินเดือนต่ำกว่า AU/US'],
    thaiCommunity: 'large',
  },
  {
    id: 'singapore', name: 'Singapore', nameTH: 'สิงคโปร์', flag: '🇸🇬',
    // REF: GPI#6→9, HAQ86→8, CI212→4, PISA#1→9, BLI~20%→4, tax22%→9, EP→5, unemp2.1%→8, ร้อนชื้น→5, WGI95→9
    scores: { costOfLiving: 4, safety: 9, healthcare: 8, education: 9, workLifeBalance: 4, taxFriendliness: 9, immigrationEase: 5, jobMarket: 8, climate: 5, politicalStability: 9 },
    avgSalaryUSD: 58000, costIndex: 212, currency: 'SGD',
    hotJobs: ['software', 'data-ai', 'accounting', 'business'],
    visaPaths: ['Employment Pass', 'S Pass', 'EntrePass'],
    pros: ['ภาษีต่ำมาก', 'ปลอดภัยมาก', 'ใกล้ไทย 2 ชม.! ✈️', 'Financial hub'],
    cons: ['ค่าครองชีพสูงมาก (บ้าน!)', 'ร้อนชื้นตลอดปี', 'เข้มงวดเรื่องกฎหมาย'],
    thaiCommunity: 'large',
  },
  {
    id: 'netherlands', name: 'Netherlands', nameTH: 'เนเธอร์แลนด์', flag: '🇳🇱',
    // REF: GPI#14→9, HAQ90→10, CI200→4, PISA500→9, BLI0.3%+25d→9, tax49.5%→4, HSM→5, unemp3.6%→7, ฝนลมแรง→4, WGI91→9
    scores: { costOfLiving: 4, safety: 9, healthcare: 10, education: 9, workLifeBalance: 9, taxFriendliness: 4, immigrationEase: 5, jobMarket: 7, climate: 4, politicalStability: 9 },
    avgSalaryUSD: 55000, costIndex: 200, currency: 'EUR',
    hotJobs: ['software', 'data-ai', 'engineering', 'business', 'creative'],
    visaPaths: ['Highly Skilled Migrant', 'DAFT (สำหรับ freelancer)', 'EU Blue Card'],
    pros: ['Work-life balance ดีมาก', 'ปั่นจักรยานทุกที่ 🚲', 'พูดอังกฤษได้ทั่ว', 'เปิดกว้าง'],
    cons: ['อากาศฝน ลมแรง', 'หาบ้านยากมาก', 'ภาษีสูง'],
    thaiCommunity: 'small',
  },
  {
    id: 'sweden', name: 'Sweden', nameTH: 'สวีเดน', flag: '🇸🇪',
    // REF: GPI#35→7, HAQ88→9, CI190→5, PISA+free all levels→10, BLI1.1%+25d+480d parental→10, tax52%→2, immig→4, unemp7.5%→6, มืด+หนาว→2, WGI91→9
    scores: { costOfLiving: 5, safety: 7, healthcare: 9, education: 10, workLifeBalance: 10, taxFriendliness: 2, immigrationEase: 4, jobMarket: 6, climate: 2, politicalStability: 9 },
    avgSalaryUSD: 50000, costIndex: 190, currency: 'SEK',
    hotJobs: ['software', 'engineering', 'healthcare'],
    visaPaths: ['Work Permit', 'EU Blue Card'],
    pros: ['Work-life balance ดีที่สุดในโลก', 'Education ฟรีทุกระดับ', 'Parental leave 480 วัน!', 'สวัสดิการครบ'],
    cons: ['ภาษีสูง (top rate 52%)', 'มืดยาว+หนาวจัด ❄️', 'ภาษาสวีเดนต้องเรียน'],
    thaiCommunity: 'small',
  },
  {
    id: 'uae', name: 'UAE (Dubai)', nameTH: 'ดูไบ', flag: '🇦🇪',
    // REF: GPI#52→6, HAQ72→5, CI149→7, PISA~440→7, BLI~15%→5, tax0%→10, employer visa→7, unemp2.9%→8, 45°C+→3, WGI82→8
    scores: { costOfLiving: 7, safety: 6, healthcare: 5, education: 7, workLifeBalance: 5, taxFriendliness: 10, immigrationEase: 7, jobMarket: 8, climate: 3, politicalStability: 8 },
    avgSalaryUSD: 55000, costIndex: 149, currency: 'AED',
    hotJobs: ['software', 'data-ai', 'engineering', 'accounting', 'healthcare', 'creative'],
    visaPaths: ['Employment Visa 2-year', 'Golden Visa 10-year'],
    pros: ['ไม่มีภาษีเงินได้! 🎉', 'เก็บเงินได้เยอะ', 'ปลอดภัยมาก', 'ใกล้ไทย 6 ชม.', 'ทันสมัย'],
    cons: ['ร้อนมาก 45°C+ ☀️', 'วีซ่าผูกกับนายจ้าง', 'ไม่มี PR แบบปกติ', 'ค่าครองชีพสูงถ้าใช้ชีวิต western'],
    thaiCommunity: 'large',
  },
  {
    id: 'norway', name: 'Norway', nameTH: 'นอร์เวย์', flag: '🇳🇴',
    // REF: GPI#32→7, HAQ90→10, CI218→3, PISA479+free→9, BLI2.8%+5wk→9, tax46%→4, Skilled Worker→5, unemp3.6%→7, หนาวจัด→2, WGI96→10
    scores: { costOfLiving: 3, safety: 7, healthcare: 10, education: 9, workLifeBalance: 9, taxFriendliness: 4, immigrationEase: 5, jobMarket: 7, climate: 2, politicalStability: 10 },
    avgSalaryUSD: 70000, costIndex: 218, currency: 'NOK',
    hotJobs: ['software', 'engineering', 'data-ai', 'healthcare', 'trades'],
    visaPaths: ['Skilled Worker Permit', 'Permanent Residence'],
    pros: ['เงินเดือนสูงสุดยุโรปชดเชย', 'ธรรมชาติสวยมาก 🏔️', 'Healthcare ฟรี', 'Work-life ดีมาก', '5 สัปดาห์ลา'],
    cons: ['แพงที่สุดในโลก (top 2)', 'หนาวจัด -20°C ❄️', 'มืดยาวในหน้าหนาว', 'ราคาแอลกอฮอล์สูงมาก'],
    thaiCommunity: 'small',
  },
  {
    id: 'portugal', name: 'Portugal', nameTH: 'โปรตุเกส', flag: '🇵🇹',
    // REF: GPI#7→9, HAQ82→7, CI131→7, PISA475→7, BLI7.3%→8, NHR→6, D7/DN→8, unemp6.6%→4, Mediterranean→9, WGI80→8
    scores: { costOfLiving: 7, safety: 9, healthcare: 7, education: 7, workLifeBalance: 8, taxFriendliness: 6, immigrationEase: 8, jobMarket: 4, climate: 9, politicalStability: 8 },
    avgSalaryUSD: 28000, costIndex: 131, currency: 'EUR',
    hotJobs: ['software', 'data-ai', 'creative'],
    visaPaths: ['D7 Passive Income', 'Digital Nomad Visa', 'Golden Visa'],
    pros: ['ค่าครองชีพถูกสุดใน EU', 'อากาศดีมาก ☀️', 'Digital Nomad Visa ง่าย', 'คนน่ารัก'],
    cons: ['เงินเดือนต่ำมาก', 'ตลาดงานเล็ก', 'ภาษาโปรตุเกสช่วยได้เยอะ'],
    thaiCommunity: 'small',
  },
  {
    id: 'korea', name: 'South Korea', nameTH: 'เกาหลีใต้', flag: '🇰🇷',
    // REF: GPI#41→6, HAQ87→9, CI165→6, PISA536→8, BLI18.2%→3, tax42%→6, E-7→4, unemp2.7%→6, 4seasons→5, WGI72→7
    scores: { costOfLiving: 6, safety: 6, healthcare: 9, education: 8, workLifeBalance: 3, taxFriendliness: 6, immigrationEase: 4, jobMarket: 6, climate: 5, politicalStability: 7 },
    avgSalaryUSD: 42000, costIndex: 165, currency: 'KRW',
    hotJobs: ['software', 'engineering', 'creative'],
    visaPaths: ['E-7 Skilled Worker', 'D-10 Job Seeker', 'F-2 Points System'],
    pros: ['ปลอดภัยมาก', 'Healthcare ดีมากราคาถูก', 'Internet เร็วสุดในโลก', 'K-culture 🎵'],
    cons: ['Work culture หนักมาก', 'ภาษาเกาหลีจำเป็น', 'สังคมกดดัน'],
    thaiCommunity: 'medium',
  },
  {
    id: 'ireland', name: 'Ireland', nameTH: 'ไอร์แลนด์', flag: '🇮🇪',
    // REF: GPI#2→10, HAQ85.5→8, CI185→5, PISA506→8, BLI5.1%→8, tax40%→5, Critical Skills→6, unemp4.3%→8, ฝนลม→4, WGI91→9
    scores: { costOfLiving: 5, safety: 10, healthcare: 8, education: 8, workLifeBalance: 8, taxFriendliness: 5, immigrationEase: 6, jobMarket: 8, climate: 4, politicalStability: 9 },
    avgSalaryUSD: 60000, costIndex: 185, currency: 'EUR',
    hotJobs: ['software', 'data-ai', 'accounting', 'business'],
    visaPaths: ['Critical Skills Permit', 'General Work Permit', 'Stamp 4'],
    pros: ['EU tech hub (Google, Meta, Apple)', 'พูดอังกฤษ', 'เงินเดือนดี', 'ประตูสู่ EU'],
    cons: ['Dublin แพงมาก (บ้าน!)', 'อากาศฝน ลม', 'เมืองเล็ก'],
    thaiCommunity: 'small',
  },
  {
    id: 'switzerland', name: 'Switzerland', nameTH: 'สวิตเซอร์แลนด์', flag: '🇨🇭',
    // REF: GPI#4→10, HAQ92→10, CI286→2, PISA508+ETH→9, BLI0.4%+4wk→8, tax35%→7, non-EU ยาก→3, unemp2.0%→7, temperate/alps→5, WGI97→10
    scores: { costOfLiving: 2, safety: 10, healthcare: 10, education: 9, workLifeBalance: 8, taxFriendliness: 7, immigrationEase: 3, jobMarket: 7, climate: 5, politicalStability: 10 },
    avgSalaryUSD: 95000, costIndex: 286, currency: 'CHF',
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
  // 1. Build weight vector from goal choices
  const weights: Record<keyof CountryScores, number> = {
    costOfLiving: 0, safety: 0, healthcare: 0, education: 0, workLifeBalance: 0,
    taxFriendliness: 0, immigrationEase: 0, jobMarket: 0, climate: 0, politicalStability: 0,
  }

  for (const g of params.goals) {
    const mapping = GOAL_WEIGHTS[g]
    if (mapping) {
      for (const [criterion, weight] of Object.entries(mapping)) {
        weights[criterion as keyof CountryScores] += weight
      }
    }
  }

  // 2. Family status adjusts priorities (ถ้าไปกับครอบครัว → education+healthcare สำคัญขึ้น)
  if (params.family === 'family') {
    weights.education += 3
    weights.healthcare += 2
    weights.safety += 1
  } else if (params.family === 'couple') {
    weights.safety += 1
  }

  // Labels for explanation
  const criteriaLabels: Record<string, string> = {
    costOfLiving: 'ค่าครองชีพ', safety: 'ความปลอดภัย', healthcare: 'สาธารณสุข',
    education: 'การศึกษา', workLifeBalance: 'Work-life balance', taxFriendliness: 'ภาษีเป็นมิตร',
    immigrationEase: 'ย้ายเข้าง่าย', jobMarket: 'ตลาดงาน', climate: 'อากาศดี',
    politicalStability: 'การเมืองมั่นคง',
  }

  // 3. Score each country using ONLY goal-relevant criteria
  const results: MatchResult[] = COUNTRIES.map(country => {
    let score = 0
    let maxPossible = 0
    const breakdown: Array<{ label: string; val: number; weight: number }> = []

    for (const [criterion, weight] of Object.entries(weights)) {
      if (weight === 0) continue // skip criteria user didn't pick
      const val = country.scores[criterion as keyof CountryScores] || 5
      score += val * weight
      maxPossible += 10 * weight
      breakdown.push({ label: criteriaLabels[criterion] || criterion, val, weight })
    }

    // If user didn't pick any goals (shouldn't happen) → fallback to average
    if (maxPossible === 0) {
      for (const [, val] of Object.entries(country.scores)) {
        score += val
        maxPossible += 10
      }
    }

    // 4. Occupation demand bonus
    const occDef = OCCUPATIONS.find(o => o.id === params.occupation || (o.matchIds as readonly string[]).includes(params.occupation))
    const isHotJob = occDef
      ? occDef.matchIds.some(mid => country.hotJobs.includes(mid))
      : country.hotJobs.includes(params.occupation)
    if (isHotJob) {
      score *= 1.10
    } else {
      score *= 0.95
    }

    // 5. Income feasibility — compare user income to country's cost of living
    const userIncome = params.monthlyIncome || 30000
    // costIndex: Thailand = 100. Rough monthly living cost = costIndex/100 * 25000 THB
    const estimatedMonthlyCost = (country.costIndex / 100) * 25000
    const affordRatio = userIncome / estimatedMonthlyCost
    if (affordRatio < 0.3) {
      score *= 0.80 // very hard to afford
    } else if (affordRatio < 0.5) {
      score *= 0.88 // tight budget
    } else if (affordRatio < 0.8) {
      score *= 0.94 // manageable but not comfortable
    }
    // No bonus for high income — we don't want to artificially boost expensive countries

    // 6. Age adjustment for points-based systems
    if (params.age === '45+') {
      const pointsBasedCountries = ['australia', 'canada', 'newzealand']
      if (pointsBasedCountries.includes(country.id)) {
        score *= 0.85
      }
    }

    // Calculate match percentage
    const rawPct = maxPossible > 0 ? (score / maxPossible) * 100 : 50
    const matchPct = Math.min(97, Math.max(15, Math.round(rawPct)))

    // Sort breakdown by contribution (weight * val), descending
    breakdown.sort((a, b) => (b.val * b.weight) - (a.val * a.weight))

    // Generate TRANSPARENT highlights tied to user's actual choices
    const highlights = generateHighlights(country, params, breakdown, isHotJob, affordRatio)
    const goalReasons = generateGoalReasons(country, params, breakdown)
    const occupationNote = getOccupationNote(country.id, params.occupation)

    return {
      country,
      matchPct,
      highlights,
      goalReasons,
      challenges: country.cons,
      occupationNote,
    }
  })

  // Sort by match percentage, return top 5
  return results.sort((a, b) => b.matchPct - a.matchPct).slice(0, 5)
}

function generateHighlights(
  country: Country,
  params: MatchParams,
  breakdown: Array<{ label: string; val: number; weight: number }>,
  isHotJob: boolean,
  affordRatio: number,
): string[] {
  const highlights: string[] = []

  // 1. Show top criteria that match user's goals (with score)
  for (const item of breakdown) {
    if (highlights.length >= 2) break
    if (item.val >= 8) {
      highlights.push(`🎯 ${item.label} ${item.val}/10 — ตรงเป้าหมายคุณ`)
    } else if (item.val >= 6) {
      highlights.push(`👍 ${item.label} ${item.val}/10`)
    }
  }

  // 2. Occupation demand
  if (isHotJob) {
    const occDef = OCCUPATIONS.find(o => o.id === params.occupation || (o.matchIds as readonly string[]).includes(params.occupation))
    highlights.push(`🔥 ${occDef?.labelTH || params.occupation} เป็นที่ต้องการ`)
  } else {
    highlights.push(`⚠️ อาชีพไม่อยู่ใน shortage list`)
  }

  // 3. Affordability note based on actual income
  if (affordRatio >= 1.0) {
    highlights.push(`💰 รายได้ปัจจุบันอยู่ได้สบาย`)
  } else if (affordRatio >= 0.5) {
    highlights.push(`💰 ค่าครองชีพพอรับได้ แต่ต้องวางแผน`)
  } else {
    highlights.push(`⚠️ ค่าครองชีพสูงเทียบรายได้ปัจจุบัน`)
  }

  return highlights.slice(0, 4)
}

// Generate explicit goal→score connection for transparency
const GOAL_LABELS: Record<string, string> = {
  'money-job': '💰 เงินดี หางานง่าย',
  'balance': '⚖️ Work-life balance',
  'family': '🎓 ลูกเรียนดี สวัสดิการ',
  'stable': '🛡️ การเมืองมั่นคง',
  'lifestyle': '☀️ อากาศดี ย้ายง่าย',
}

const GOAL_TO_CRITERIA: Record<string, { keys: (keyof CountryScores)[]; labels: string[] }> = {
  'money-job': { keys: ['jobMarket', 'taxFriendliness', 'costOfLiving'], labels: ['ตลาดงาน', 'ภาษีเป็นมิตร', 'ค่าครองชีพ'] },
  'balance': { keys: ['workLifeBalance', 'safety'], labels: ['Work-life balance', 'ปลอดภัย'] },
  'family': { keys: ['education', 'healthcare'], labels: ['การศึกษา', 'สาธารณสุข'] },
  'stable': { keys: ['politicalStability', 'safety'], labels: ['การเมืองมั่นคง', 'ปลอดภัย'] },
  'lifestyle': { keys: ['climate', 'immigrationEase', 'costOfLiving'], labels: ['อากาศ', 'ย้ายเข้าง่าย', 'ค่าครองชีพ'] },
}

function generateGoalReasons(
  country: Country,
  params: MatchParams,
  breakdown: Array<{ label: string; val: number; weight: number }>,
): string[] {
  const reasons: string[] = []

  for (const goalId of params.goals) {
    const goalLabel = GOAL_LABELS[goalId]
    const mapping = GOAL_TO_CRITERIA[goalId]
    if (!goalLabel || !mapping) continue

    const scoreParts = mapping.keys.map((key, i) => {
      const val = country.scores[key]
      return `${mapping.labels[i]} ${val}/10`
    })

    const avgScore = mapping.keys.reduce((sum, key) => sum + country.scores[key], 0) / mapping.keys.length
    const emoji = avgScore >= 8 ? '✅' : avgScore >= 6 ? '👍' : avgScore >= 4 ? '⚠️' : '❌'

    reasons.push(`${emoji} คุณเลือก ${goalLabel} → ${scoreParts.join(', ')}`)
  }

  // Family status reason
  if (params.family === 'family') {
    const eduScore = country.scores.education
    const hcScore = country.scores.healthcare
    reasons.push(`👨‍👩‍👧 ไปกับครอบครัว → การศึกษา ${eduScore}/10, สาธารณสุข ${hcScore}/10`)
  }

  // Age reason for points-based
  if (params.age === '45+' && ['australia', 'canada', 'newzealand'].includes(country.id)) {
    reasons.push(`⚠️ อายุ 45+ → ระบบ Points-based ให้คะแนนน้อยลง`)
  }

  return reasons
}
