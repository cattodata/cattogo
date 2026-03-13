// ===== Migration Life Simulator Data =====
// ข้อมูลสำหรับจำลองชีวิตหลังย้ายประเทศ
// อ้างอิง: ATO (Jun 2025), Fair Work (Jul 2025), Home Affairs (Jan 2026),
//         Numbeo (Feb 2026), PayScale AU (Jan-Feb 2026), XE (Feb 2026)
// อัปเดตล่าสุด: กุมภาพันธ์ 2026
//
// Exchange rates → import จาก constants.ts (single source of truth)
// AU Salary categories → import จาก constants.ts (derived from PayScale ใน occupations.ts)

import {
  AUD_TO_THB as _AUD_TO_THB,
  AU_SALARY_BY_CATEGORY,
  AU_UNSKILLED_SALARY as _AU_UNSKILLED_SALARY,
} from './constants'

// Re-export for backward compatibility
export const AUD_TO_THB = _AUD_TO_THB
export const AU_UNSKILLED_SALARY = _AU_UNSKILLED_SALARY

// ===== Australian Tax Brackets FY 2025-26 (Stage 3 Tax Cuts) =====
export function calculateAusTax(annualGross: number): {
  tax: number
  medicare: number
  netAnnual: number
  netMonthly: number
  effectiveRate: number
} {
  let tax = 0
  if (annualGross > 190000) {
    tax = 51638 + (annualGross - 190000) * 0.45
  } else if (annualGross > 135000) {
    tax = 31288 + (annualGross - 135000) * 0.37
  } else if (annualGross > 45000) {
    tax = 4288 + (annualGross - 45000) * 0.30
  } else if (annualGross > 18200) {
    tax = (annualGross - 18200) * 0.16
  }
  const medicare = annualGross * 0.02
  const netAnnual = annualGross - tax - medicare
  return {
    tax: Math.round(tax),
    medicare: Math.round(medicare),
    netAnnual: Math.round(netAnnual),
    netMonthly: Math.round(netAnnual / 12),
    effectiveRate: Math.round(((tax + medicare) / annualGross) * 100),
  }
}

// ===== Thai Tax Calculator =====
export function calculateThaiTax(annualGross: number): {
  tax: number
  socialSec: number
  netMonthly: number
} {
  // Thai personal income tax brackets 2025 (Revenue Dept rd.go.th)
  // Deductions: 100K expense (50% of salary, max 100K) + 60K personal allowance = 160K
  const taxable = Math.max(0, annualGross - 160000) // employee expense 100K + personal allowance 60K
  let tax = 0
  if (taxable > 5000000) tax = 1265000 + (taxable - 5000000) * 0.35
  else if (taxable > 2000000) tax = 365000 + (taxable - 2000000) * 0.30
  else if (taxable > 1000000) tax = 115000 + (taxable - 1000000) * 0.25
  else if (taxable > 750000) tax = 65000 + (taxable - 750000) * 0.20
  else if (taxable > 500000) tax = 27500 + (taxable - 500000) * 0.15
  else if (taxable > 300000) tax = 7500 + (taxable - 300000) * 0.10
  else if (taxable > 150000) tax = (taxable - 150000) * 0.05
  const socialSec = Math.min(750, annualGross / 12 * 0.05) * 12
  const netAnnual = annualGross - tax - socialSec
  return { tax: Math.round(tax), socialSec: Math.round(socialSec), netMonthly: Math.round(netAnnual / 12) }
}

// ===== Salary Data (AUD/year) =====
// Derived from PayScale AU (Jan-Feb 2026) via constants.ts → AU_SALARY_BY_CATEGORY
// Source of truth = occupations.ts (p10/median/p90)
// ห้ามแก้ตัวเลขที่นี่ — แก้ที่ occupations.ts + constants.ts แทน
export const AU_SALARIES: Record<string, { entry: number; mid: number; senior: number; label: string }> =
  Object.fromEntries(
    Object.entries(AU_SALARY_BY_CATEGORY).map(([key, cat]) => [
      key,
      { entry: cat.entry, mid: cat.mid, senior: cat.senior, label: cat.label },
    ])
  )

// Unskilled / Working Holiday salary (Fair Work Jul 2025)
// ใช้ค่าจาก constants.ts — re-exported ด้านบน
// $24.10/hr × 38hrs × 52wks = $47,654/yr
// Source: https://www.fairwork.gov.au/pay/minimum-wages

// Thai salaries for comparison (THB/year)
// Source: JobsDB Thailand, PayScale TH, Glassdoor TH (Feb 2026)
// หมายเหตุ: ค่า median ของคนที่ทำงานใน กทม. 3-5 ปี
export const TH_SALARIES: Record<string, number> = {
  'software': 720000,      // 60K/เดือน — JobsDB avg software dev Bangkok
  'data-ai': 660000,       // 55K/เดือน — JobsDB avg data engineer Bangkok
  'devops-cloud': 720000,  // 60K/เดือน — DevOps/Cloud ใกล้เคียง software dev
  'cybersecurity': 600000, // 50K/เดือน — Cybersecurity analyst Bangkok
  'network-admin': 480000, // 40K/เดือน — Network/SysAdmin Bangkok
  'it-management': 840000, // 70K/เดือน — IT Manager Bangkok
  'accounting': 420000,    // 35K/เดือน — JobsDB avg accountant Bangkok
  'engineering': 540000,   // 45K/เดือน — JobsDB avg engineer Bangkok
  'healthcare': 360000,    // 30K/เดือน — พยาบาลวิชาชีพ รพ.รัฐ
  'chef': 240000,          // 20K/เดือน — SEEK TH avg chef
  'trades': 300000,        // 25K/เดือน — ช่างไฟฟ้า/ประปา กทม.
  'other': 360000,         // 30K/เดือน
}

// Thai living costs (single, Bangkok, THB/month)
// Source: Numbeo Bangkok Feb 2026 + ประสบการณ์จริง
// สมมติ: คอนโดใกล้ BTS กทม., กินข้าวแกงส้มตำ mix กับ delivery, ประกัน OPD+IPD
export const TH_LIVING_COSTS = {
  rent: 15000,          // คอนโดใกล้ BTS — Numbeo Bangkok 1BR centre: ~14K-16K
  food: 10000,          // กินข้าวแกง ส้มตำ mix กับ delivery
  transport: 2500,      // BTS/MRT monthly
  utilities: 2500,      // น้ำไฟ (PEA/MEA + ประปา)
  phone: 1000,          // เน็ตมือถือ AIS/TRUE/DTAC
  entertainment: 5000,  // สังสรรค์ / พักผ่อน
  insurance: 2500,      // ประกันสุขภาพที่ครอบคลุมดี (OPD+IPD)
}
export const TH_TOTAL_LIVING = Object.values(TH_LIVING_COSTS).reduce((a, b) => a + b, 0) // ~39,000

// ===== Australian City Costs (AUD/month) =====
export interface CityInfo {
  id: string
  name: string
  rent1br: number
  rent2br: number
  rentFamily: number
  rentShare: number // shared house
  utilities: number
  internet: number
  label: string
}

export const AU_CITIES: Record<string, CityInfo> = {
  // Numbeo Feb 2026: https://www.numbeo.com/cost-of-living/in/{City}
  'sydney': {
    id: 'sydney', name: 'Sydney', label: '🏙️ Sydney',
    rent1br: 3700, rent2br: 5000, rentFamily: 6900, rentShare: 1400, // Numbeo Mar 2026: 1BR city $3,695, 3BR city $6,898
    utilities: 294, internet: 78, // Numbeo: utilities 85m² $293.68, internet 60Mbps $78.00
  },
  'melbourne': {
    id: 'melbourne', name: 'Melbourne', label: '🎭 Melbourne',
    rent1br: 2460, rent2br: 3440, rentFamily: 4750, rentShare: 1100, // Numbeo Feb 2026: 1BR city $2,459, 3BR city $4,752
    utilities: 310, internet: 76, // Numbeo: utilities 85m² $308.97, internet 60Mbps $76.38
  },
  // Numbeo Feb 2026: https://www.numbeo.com/cost-of-living/in/Brisbane
  'brisbane': {
    id: 'brisbane', name: 'Brisbane', label: '☀️ Brisbane',
    rent1br: 2580, rent2br: 3500, rentFamily: 4510, rentShare: 1050, // Numbeo Feb 2026: 1BR city $2,584, 3BR city $4,507
    utilities: 281, internet: 84, // Numbeo: utilities 85m² $280.96, internet 60Mbps $84.24
  },
}

// ===== Food Costs (AUD/month, single person) =====
// Numbeo Melbourne Feb 2026: inexpensive meal $25, mid-range 2-person $120
// Grocery basket: milk $2.68, bread $4.30, rice $3.29, chicken $13.42/kg, eggs $8.51/12
export const FOOD_COSTS: Record<string, { cost: number; label: string }> = {
  'always': { cost: 500, label: 'ทำกินเองทุกมื้อ (ไม่ฟุ่มเฟือย)' },     // ~$17/day groceries
  'often': { cost: 650, label: 'ทำเองบ้าง ซื้อบ้าง' },          // mix cook + eat out
  'sometimes': { cost: 800, label: 'ซื้อกินบ่อย' },                 // eat out ~5x/week
  'rarely': { cost: 1000, label: 'ซื้อกินเกือบทุกมื้อ' },           // ~$33/day (1-2 cheap meals/day)
}

// ===== Transport Costs (AUD/month) =====
// Numbeo Melbourne: monthly pass $199, gasoline $1.85/L
// RACV car ownership estimates 2025
export const TRANSPORT_COSTS: Record<string, { cost: number; label: string; breakdown: string }> = {
  'public': { cost: 200, label: 'รถไฟ/รถเมล์', breakdown: 'Myki/Opal monthly $199 (Numbeo)' },
  'mixed': { cost: 380, label: 'ผสม', breakdown: 'รถไฟ $199 + Uber ~$120 + parking $60' },
  'car': { cost: 850, label: 'ขับรถเอง', breakdown: 'ผ่อนรถมือสอง $400 + ประกัน Comprehensive $200 + น้ำมัน $150 + rego $100 (ประกันแพงถ้าไม่มีประวัติขับขี่ใน AU)' },
}

// ===== Savings Ranges (THB) =====
export const SAVINGS_RANGES: Record<string, { min: number; max: number; label: string }> = {
  'under100k': { min: 0, max: 100000, label: 'ต่ำกว่า 100,000 บาท' },
  '100k-300k': { min: 100000, max: 300000, label: '100,000-300,000 บาท' },
  '300k-500k': { min: 300000, max: 500000, label: '300,000-500,000 บาท' },
  '500k-1m': { min: 500000, max: 1000000, label: '500,000-1,000,000 บาท' },
  'over1m': { min: 1000000, max: 2000000, label: 'มากกว่า 1,000,000 บาท' },
}

// ===== Initial Costs (AUD) =====
export function calculateInitialCosts(family: string, rent: number): {
  visa: number; flight: number; bond: number; furniture: number; docs: number; total: number
} {
  // Home Affairs visa pricing FY25-26 — subclass 189 Skilled Independent
  // Source: https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-tested
  // Main applicant: $4,640 | Additional adult: $2,320 | Child (<18): $1,160
  // Note: These are 189 costs. 482 TSS costs different — see country-detailed-data.ts
  const visa = family === 'family' ? 8120 : family === 'couple' ? 6960 : 4640
  const flight = family === 'family' ? 3500 : family === 'couple' ? 2200 : 1100
  const bond = rent // 4 weeks bond ≈ 1 month
  const furniture = family === 'single' ? 2000 : 4000
  const docs = 1500 // skills assessment (~$500-1500 varies by body), translations, police checks
  return { visa, flight, bond, furniture, docs, total: visa + flight + bond + furniture + docs }
}

// ===== Visa Score (Simplified for chat) =====
export function calculateSimpleVisaScore(
  age: string, english: string, experience: string, education: string, jobType: string
): { score: number; possible: boolean; details: string[] } {
  let score = 0
  const details: string[] = []

  // Age
  const ageScores: Record<string, number> = { '18-24': 25, '25-32': 30, '33-39': 25, '40-44': 15, '45+': 0 }
  const agePoints = ageScores[age] || 0
  score += agePoints
  details.push(`อายุ ${age}: ${agePoints} คะแนน`)

  // English
  const engScores: Record<string, number> = { 'superior': 20, 'proficient': 10, 'competent': 0, 'low': 0 }
  const engPoints = engScores[english] || 0
  score += engPoints
  details.push(`ภาษาอังกฤษ: ${engPoints} คะแนน`)

  // Experience (overseas only for simplicity)
  const expScores: Record<string, number> = { '8+': 15, '5-7': 10, '3-4': 5, '0-2': 0 }
  const expPoints = expScores[experience] || 0
  score += expPoints
  details.push(`ประสบการณ์: ${expPoints} คะแนน`)

  // Education
  const eduScores: Record<string, number> = { 'phd': 20, 'masters': 15, 'bachelor': 15, 'diploma': 10, 'highschool': 0 }
  const eduPoints = eduScores[education] || 0
  score += eduPoints
  details.push(`การศึกษา: ${eduPoints} คะแนน`)

  const possible = score >= 65 || (score >= 50 && jobType === 'skilled') // 491 regional possible at 50+15

  return { score, possible, details }
}

// ===== Country Recommendation =====
export interface CountryRec {
  id: string
  name: string
  flag: string
  reasons: string[]
  caveat: string
}

const COUNTRY_TAGS: Record<string, string[]> = {
  'australia': ['savings', 'weather', 'career', 'safety', 'healthcare', 'jobs'],
  'newzealand': ['work-life', 'weather', 'safety', 'nature', 'diversity'],
  'canada': ['diversity', 'career', 'safety', 'healthcare', 'jobs'],
  'japan': ['safety', 'food', 'culture', 'healthcare'],
  'germany': ['work-life', 'career', 'education', 'diversity'],
}

const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
  'australia': { name: 'Australia', flag: '🇦🇺' },
  'newzealand': { name: 'New Zealand', flag: '🇳🇿' },
  'canada': { name: 'Canada', flag: '🇨🇦' },
  'japan': { name: 'Japan', flag: '🇯🇵' },
  'germany': { name: 'Germany', flag: '🇩🇪' },
}

const COUNTRY_REASONS: Record<string, Record<string, string>> = {
  'australia': {
    'savings': 'เงินเดือนสูงมาก IT เริ่มต้น 70K AUD+ เก็บเงินได้เยอะ',
    'weather': 'อากาศดีมาก โดยเฉพาะ Brisbane/Sydney ☀️',
    'career': 'ตลาด IT/Data demand สูงมากๆ Skill shortage list ยาวเป็นหางว่าว',
    'safety': 'ปลอดภัยมาก ระบบกฎหมายเข้มแข็ง',
    'healthcare': 'Medicare ฟรี! ไม่ต้องจ่ายประกันเพิ่ม',
    'jobs': 'หางานง่ายกว่าหลายประเทศ โดยเฉพาะสาย IT',
    'diversity': 'Multicultural มาก มีคนไทยเยอะ',
  },
  'newzealand': {
    'work-life': 'Work-life balance ดีเยี่ยม คนสบายๆ',
    'weather': 'อากาศเย็นสบาย ธรรมชาติสวยมาก',
    'safety': 'ปลอดภัยมาก คนน้อย สงบ',
  },
  'canada': {
    'diversity': 'Diverse มาก Canada เปิดรับคนนอกหนักสุด',
    'career': 'Toronto/Vancouver มี tech scene ใหญ่',
    'safety': 'ปลอดภัย ระบบดี',
    'jobs': 'Express Entry ก็คล้าย AU points system',
  },
  'japan': {
    'safety': 'ปลอดภัยที่สุดในโลก เดินกลางคืนสบาย',
    'food': 'อาหารคุณภาพดี ราคาเข้าถึงได้',
    'culture': 'วัฒนธรรมเข้มแข็ง ระบบเป็นระเบียบ',
  },
  'germany': {
    'work-life': 'กฎหมายแรงงานเข้มงวด Work-life balance ดีมาก',
    'career': 'Berlin tech hub ใหญ่ของ EU',
    'education': 'มหาวิทยาลัยฟรี! ถ้ามีลูกดีมาก',
  },
}

const COUNTRY_CAVEATS: Record<string, string> = {
  'australia': 'ค่าครองชีพสูง (โดยเฉพาะ Sydney) แต่เงินเดือนสูงตามไปด้วย',
  'newzealand': 'เงินเดือนต่ำกว่า AU ประมาณ 20% เมืองเล็ก ตัวเลือกงานน้อยกว่า',
  'canada': 'อากาศหนาวจัด ❄️ ถึง -30°C ค่าที่อยู่อาศัยใน Toronto สูงมาก',
  'japan': 'ภาษาญี่ปุ่นจำเป็นมาก วัฒนธรรมการทำงานเข้มข้น เงินเดือนต่ำกว่า AU/CA',
  'germany': 'ภาษาเยอรมันช่วยได้มาก อากาศหนาว ระบบราชการค่อนข้างช้า',
}

export function recommendCountry(priorities: string[]): CountryRec {
  const scores: Record<string, number> = {}

  for (const [countryId, tags] of Object.entries(COUNTRY_TAGS)) {
    scores[countryId] = 0
    for (const priority of priorities) {
      if (tags.includes(priority)) {
        scores[countryId] += (countryId === 'australia' ? 2 : 1.5) // slight AU bias since it's our focus
      }
    }
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a)
  const bestId = sorted[0][0]
  const info = COUNTRY_NAMES[bestId]

  const reasons: string[] = []
  const countryReasons = COUNTRY_REASONS[bestId] || {}
  for (const priority of priorities) {
    if (countryReasons[priority]) {
      reasons.push(countryReasons[priority])
    }
  }
  if (reasons.length === 0) reasons.push('เหมาะกับสิ่งที่คุณมองหา')

  return {
    id: bestId,
    name: info.name,
    flag: info.flag,
    reasons,
    caveat: COUNTRY_CAVEATS[bestId],
  }
}

// ===== Motivation Responses =====
export const MOTIVATION_RESPONSES: Record<string, string[]> = {
  'politics': [
    '🛡️ เสถียรภาพทางการเมืองเป็นปัจจัยสำคัญ หลายประเทศมีระบบที่โปร่งใสและตรวจสอบได้',
    'ประเทศที่ระบบราชการมีประสิทธิภาพ ภาษีที่จ่ายไปจะเห็นผลชัดเจนในสาธารณูปโภคและสวัสดิการ',
  ],
  'money': [
    '💰 เงินเดือนสาย IT ในไทยเฉลี่ย 40-60K บาท ขณะที่ค่าครองชีพกรุงเทพสูงขึ้นต่อเนื่อง',
    'เงินเดือนต่างประเทศสูงกว่า แต่ค่าครองชีพก็สูงตาม — เดี๋ยวเทียบตัวเลขจริงหลังหักค่าใช้จ่ายให้ดู',
  ],
  'work-life': [
    '⚖️ หลายประเทศมีกฎหมายแรงงานเข้มงวด ห้ามทำ OT โดยไม่จ่ายค่าตอบแทน',
    'มาตรฐานทำงาน 38 ชม./สัปดาห์ ลาพักร้อน 4 สัปดาห์ + ลาป่วย 10 วัน ตามกฎหมาย',
  ],
  'education': [
    '🎓 ระบบการศึกษาในหลายประเทศเน้น critical thinking และการคิดวิเคราะห์',
    'โรงเรียนรัฐคุณภาพดี เรียนฟรีถึงมัธยมปลาย ไม่จำเป็นต้องเข้าโรงเรียนนานาชาติ',
  ],
  'adventure': [
    '🌏 การไปใช้ชีวิตต่างประเทศเป็นประสบการณ์ที่มีคุณค่า ทั้งด้านอาชีพและมุมมองชีวิต',
    'สามารถเริ่มต้นจาก 2-3 ปี เพื่อเก็บประสบการณ์ก่อนตัดสินใจระยะยาว',
  ],
  'healthcare': [
    '🏥 ระบบสาธารณสุขเป็นปัจจัยสำคัญในคุณภาพชีวิต',
    'ออสเตรเลียมีระบบ Medicare ครอบคลุม ประเทศอื่นๆ ก็มีระบบประกันสุขภาพถ้วนหน้าเช่นกัน',
  ],
}

// ===== Country Responses =====
export const COUNTRY_RESPONSES: Record<string, string> = {
  'australia': 'ออสเตรเลีย! 🇦🇺 เลือกดีนะ เงินเดือนสูง อากาศดี ระบบแน่น IT demand สูงมาก แถม Medicare ฟรี',
  'newzealand': 'นิวซีแลนด์! 🇳🇿 ธรรมชาติสวยมาก Work-life balance ดีเลิศ แต่เงินเดือนต่ำกว่า AU นิดนึง',
  'canada': 'แคนาดา! 🇨🇦 Diverse มาก Express Entry ก็คล้ายระบบ AU แต่เตรียมใจเรื่องหนาวไว้ 🥶',
  'japan': 'ญี่ปุ่น! 🇯🇵 ปลอดภัยมาก อาหารเทพ ระบบเป๊ะ แต่ต้องพูดญี่ปุ่นได้นะ',
  'germany': 'เยอรมนี! 🇩🇪 Work-life balance ดี EU Blue Card ไม่ยาก Berlin tech hub ใหญ่ ค่าครองชีพไม่แพง',
}
