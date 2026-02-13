// ===== Occupation Types =====
export interface Occupation {
  title: string
  anzsco: string              // Official ANZSCO code (e.g. '261313')
  category: string
  demand: 'สูงมาก' | 'สูง' | 'ปานกลาง' | 'ต่ำ'
  demandSource: string        // e.g. 'SEEK volume + Skills Priority List 2025'
  minPoints: number           // 189 minimum from latest SkillSelect round (0 = not listed)
  minPoints491: number | null // 491 minimum (null = N/A or not listed)
  shortageList: string
  salaryRange: { p10: number; median: number; p90: number }  // PayScale percentiles AUD/year
  salarySource: string        // e.g. 'PayScale AU Jan 2026 (1262 profiles)'
  salarySourceUrl: string     // Direct URL to salary page
  pathToPR: string
  skills: string[]
  pointsNote: string          // e.g. 'SkillSelect Nov 2025' or 'ไม่ได้ถูกเชิญในรอบ Nov 2025'
}

// ===== Form Data =====
export interface FormData {
  age: string
  englishLevel: string
  experience: string
  australianExperience: string // แยกจาก overseas experience
  education: string
  occupation: string
  familyStatus: string
  city: string
  thaiSalary: string
  specialization: string
  // คะแนนโบนัส
  partnerStatus: 'none' | 'has-skills' | 'has-english' | 'au-citizen-pr'
  australianStudy: boolean // 2 years study in AU
  stemQualification: boolean // Masters/PhD STEM from AU
  professionalYear: boolean // Accounting/ICT/Engineering
  naatiCertified: boolean // Community language
  regionalStudy: boolean // Study in regional AU
  // Lifestyle & Motivation
  motivation: string // เหตุผลที่อยากย้าย
  priorities: string[] // สิ่งที่สำคัญ: salary, lifestyle, air-quality, political, career
  cookingHabit: 'always' | 'often' | 'sometimes' | 'rarely' // ทำกินเองบ่อยแค่ไหน
  transportPreference: 'car' | 'public' | 'mixed' // รถยนต์ หรือ รถไฟ
  savingsUSD: string // เงินสำรองที่มี (USD)
}

export const INITIAL_FORM_DATA: FormData = {
  age: '',
  englishLevel: '',
  experience: '',
  australianExperience: '0',
  education: '',
  occupation: '',
  familyStatus: '',
  city: '',
  thaiSalary: '',
  specialization: '',
  partnerStatus: 'none',
  australianStudy: false,
  stemQualification: false,
  professionalYear: false,
  naatiCertified: false,
  regionalStudy: false,
  motivation: '',
  priorities: [],
  cookingHabit: 'often',
  transportPreference: 'mixed',
  savingsUSD: '',
}

// ===== Visa Types =====
export interface VisaOption {
  type: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard'
  description: string
  pathToPR: string
  timeline: string
  category: 'skilled' | 'study' | 'work' | 'partner' | 'other'
  cost?: string
  eligible?: boolean  // whether user likely qualifies based on profile
}

// ===== Calculation Results =====
export interface PointsBreakdown {
  age: number
  english: number
  overseasExperience: number
  australianExperience: number
  education: number
  partner: number
  australianStudy: number
  stemQualification: number
  professionalYear: number
  naati: number
  regionalStudy: number
  total: number
}

export interface FeasibilityResult {
  feasible: boolean
  score: number
  pointsBreakdown: PointsBreakdown
  visaOptions: VisaOption[]
  warnings: string[]
}

export interface BudgetResult {
  monthlyRent: number
  monthlyLiving: number
  monthlyTotal: number
  initialCosts: {
    visa: number
    flight: number
    bond: number
    furniture: number
    documents: number
  }
  totalInitial: number
  minimum: number
  comfortable: number
  city: string
}

export interface DetailedBudget {
  // Income
  grossAnnual: number
  grossMonthly: number
  taxAnnual: number
  netMonthly: number
  
  // Housing
  rent: number
  utilities: number
  internet: number
  
  // Transport
  carCost: number // monthly if buying/leasing
  carInsurance: number
  carFuel: number
  carMaintenance: number
  publicTransport: number
  
  // Food
  groceriesCooking: number // if cook at home
  groceriesBasic: number // basic groceries even if eat out
  diningOut: number
  
  // Other
  phone: number
  entertainment: number
  healthInsurance: number
  miscellaneous: number
  
  // Totals
  totalFixed: number // rent + utilities + internet + insurance + phone
  totalVariable: number // food + transport + entertainment + misc
  totalMonthly: number
  netSavings: number // what's left after everything
  
  // Scenarios
  scenario: 'budget' | 'moderate' | 'comfortable'
}

export interface ParityResult {
  thaiSalaryAnnual: number
  thaiNetMonthly: number
  requiredAusAnnual: number
  zones: {
    tight: number
    okay: number
    comfortable: number
    spacious: number
  }
}

// ===== City Data =====
export interface CityData {
  rent1br: number
  rent2br: number
  rentFamily: number
  groceries: number
  transport: number
  utilities: number
  misc: number
}

export type CityKey = 'sydney' | 'melbourne' | 'brisbane'
export type FamilyStatus = 'single' | 'couple' | 'family'

// ===== Step Labels =====
export const STEP_LABELS = [
  '👤 ข้อมูลส่วนตัว',
  '📊 ความเป็นไปได้',
  '💰 งบประมาณ',
  '⚖️ เปรียบเทียบรายได้',
  '💼 ตลาดงาน',
  '📋 สรุป',
] as const
