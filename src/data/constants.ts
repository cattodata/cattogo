// ===== Shared Constants — Single Source of Truth =====
// ทุก exchange rate, currency symbol, และค่าคงที่ที่ใช้ร่วมกันอยู่ที่นี่
// ห้ามมี copy ซ้ำในไฟล์อื่น — import จากที่นี่เท่านั้น
//
// วิธีอัพเดท:
// 1. อัพเดทค่าในไฟล์นี้
// 2. อัพเดท LAST_UPDATED
// 3. ทุกที่ที่ import จะได้ค่าใหม่อัตโนมัติ

// ===== EXCHANGE RATES TO THB =====
// Source: Bank of Thailand mid-rate, XE.com mid-market average
// Last updated: Feb 2026
export const CURRENCY_TO_THB: Record<string, number> = {
  AUD: 22.10,
  NZD: 20.00,
  CAD: 24.50,
  USD: 34.50,
  GBP: 43.50,
  EUR: 37.50,
  JPY: 0.23,
  SGD: 25.80,
  CHF: 39.50,
  AED: 9.40,
  NOK: 3.25,
  SEK: 3.30,
  KRW: 0.025,
}

// Convenience: AUD to THB (most commonly used)
export const AUD_TO_THB = CURRENCY_TO_THB.AUD

// ===== CURRENCY SYMBOLS =====
export const CURRENCY_SYMBOLS: Record<string, string> = {
  AUD: 'A$',
  NZD: 'NZ$',
  CAD: 'C$',
  USD: 'US$',
  GBP: '£',
  EUR: '€',
  JPY: '¥',
  SGD: 'S$',
  CHF: 'CHF',
  AED: 'AED',
  NOK: 'NOK',
  SEK: 'SEK',
  KRW: '₩',
}

// ===== DATA VERSION TRACKING =====
// รวม lastUpdated ไว้ที่เดียว ใช้ตรวจว่าข้อมูลเก่าหรือยัง
export const DATA_LAST_UPDATED = {
  exchangeRates: 'Feb 2026',        // XE.com, Bank of Thailand
  auSalaries: 'Jan-Feb 2026',       // PayScale AU (source of truth = occupations.ts)
  countryScores: 'Feb 2026',        // OECD, Numbeo, GPI
  visaCosts: 'Feb 2026',            // Official immigration sites
  costOfLiving: 'Feb 2026',         // Numbeo
  occupations: 'Jan-Feb 2026',      // PayScale AU, SkillSelect Nov 2025
} as const

// ===== AUSTRALIAN SALARY AGGREGATION FROM PAYSCALE =====
// ค่าเฉลี่ยจาก PayScale AU ใน occupations.ts (p10 → entry, median → mid, p90 → senior)
// ใช้เป็น source of truth สำหรับ simulator-data.ts + country-detailed-data.ts
//
// วิธีคำนวณ: ดึง p10/median/p90 จาก occupations.ts แล้ว average ตาม category
// อ้างอิง: PayScale AU Jan-Feb 2026 — ดู occupations.ts สำหรับ URL แต่ละอาชีพ

export interface AUSalaryCategory {
  entry: number   // ≈ PayScale p10 (0-2 yrs)
  mid: number     // ≈ PayScale median (3-6 yrs)
  senior: number  // ≈ PayScale p90 (7+ yrs)
  label: string
  derivedFrom: string  // ระบุว่าคำนวณจากอาชีพไหนใน occupations.ts
}

// Derived from PayScale AU data in occupations.ts
// ห้ามเดาเอง — ต้องคำนวณจาก p10/median/p90 จริงเท่านั้น
export const AU_SALARY_BY_CATEGORY: Record<string, AUSalaryCategory> = {
  'software': {
    // softwareEngineer: p10=65K, median=90K, p90=127K
    entry: 65000, mid: 90000, senior: 127000,
    label: 'Software Developer',
    derivedFrom: 'softwareEngineer (PayScale AU Jan 2026, 1,262 profiles)',
  },
  'data-ai': {
    // avg(dataEngineer, dataScientist, mlEngineer)
    // p10: (71+80+85)/3 = 79K → 79K | median: (104+110+125)/3 = 113K | p90: (146+150+170)/3 = 155K
    entry: 79000, mid: 113000, senior: 155000,
    label: 'Data / AI Engineer',
    derivedFrom: 'avg(dataEngineer, dataScientist, mlEngineer) — PayScale+SEEK Jan-Feb 2026',
  },
  'accounting': {
    // accountant: p10=52K, median=68K, p90=90K
    entry: 52000, mid: 68000, senior: 90000,
    label: 'Accountant',
    derivedFrom: 'accountant (PayScale AU Jan 2026, 1,830 profiles)',
  },
  'engineering': {
    // avg(civilEngineer, mechanicalEngineer, electricalEngineer)
    // p10: (63+63+64)/3 = 63K | median: (85+83+87)/3 = 85K | p90: (122+125+130)/3 = 126K
    entry: 63000, mid: 85000, senior: 126000,
    label: 'Engineer',
    derivedFrom: 'avg(civil, mechanical, electrical Engineer) — PayScale AU Jan 2026',
  },
  'healthcare': {
    // registeredNurse: p10=61K, median=76K, p90=95K
    entry: 61000, mid: 76000, senior: 95000,
    label: 'Nurse / Healthcare',
    derivedFrom: 'registeredNurse (PayScale AU Jan 2026, 1,825 profiles — hourly×1,976)',
  },
  'chef': {
    // ไม่มีใน occupations.ts (ไม่อยู่ใน ANZSCO skill list ระดับสูง)
    // Source: Fair Work minimum wage + SEEK chef salary data Feb 2026
    // https://www.seek.com.au/career-advice/role/chef/salary
    entry: 55000, mid: 68000, senior: 85000,
    label: 'Chef / Hospitality',
    derivedFrom: 'SEEK + Fair Work Feb 2026 (ไม่มีใน PayScale occupations.ts)',
  },
  'trades': {
    // avg(electrician, plumber, carpenter, welder)
    // p10: (49+36+43+45)/4 = 43K | median: (73+64+67+59)/4 = 66K | p90: (99+97+100+76)/4 = 93K
    entry: 43000, mid: 66000, senior: 93000,
    label: 'Trades (ช่าง)',
    derivedFrom: 'avg(electrician, plumber, carpenter, welder) — PayScale AU Jan 2026 (hourly×1,976)',
  },
  'devops-cloud': {
    // DevOps/Cloud maps close to software engineer salaries
    entry: 70000, mid: 100000, senior: 140000,
    label: 'DevOps / Cloud Engineer',
    derivedFrom: 'SEEK + PayScale AU Feb 2026 — similar to software engineer range',
  },
  'cybersecurity': {
    // Cyber security specialist — slightly above software avg
    entry: 72000, mid: 105000, senior: 145000,
    label: 'Cybersecurity',
    derivedFrom: 'SEEK + PayScale AU Feb 2026 — ICT Security Specialist',
  },
  'network-admin': {
    // Network/SysAdmin — slightly below software dev
    entry: 55000, mid: 80000, senior: 115000,
    label: 'Network / SysAdmin',
    derivedFrom: 'SEEK + PayScale AU Feb 2026 — Network Engineer / Systems Administrator',
  },
  'it-management': {
    // IT Manager / PM — higher range
    entry: 80000, mid: 120000, senior: 165000,
    label: 'IT Manager / PM',
    derivedFrom: 'SEEK + PayScale AU Feb 2026 — ICT Project Manager',
  },
  'other': {
    // ค่ากลางประมาณ — ระหว่าง trades กับ accounting
    entry: 55000, mid: 70000, senior: 90000,
    label: 'Other',
    derivedFrom: 'estimate based on ABS average weekly earnings + SEEK Feb 2026',
  },
}

// Australian minimum wage (Fair Work Jul 2025)
// $24.10/hr × 38hrs × 52wks = $47,654/year
// Source: https://www.fairwork.gov.au/pay/minimum-wages
export const AU_UNSKILLED_SALARY = 47654
