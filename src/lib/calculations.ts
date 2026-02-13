import type {
  FeasibilityResult,
  VisaOption,
  BudgetResult,
  ParityResult,
  CityKey,
  FamilyStatus,
  CityData,
  PointsBreakdown,
} from './types'

// ===== City Cost Data (Numbeo Feb 2026) =====
export const CITY_DATA: Record<CityKey, CityData> = {
  sydney: {
    rent1br: 3440, rent2br: 4800, rentFamily: 6800,
    groceries: 680, transport: 217, utilities: 294, misc: 450,
  },
  melbourne: {
    rent1br: 2460, rent2br: 3440, rentFamily: 4750,
    groceries: 620, transport: 200, utilities: 291, misc: 400,
  },
  brisbane: {
    rent1br: 2200, rent2br: 3000, rentFamily: 4000,
    groceries: 550, transport: 180, utilities: 250, misc: 350,
  },
}

// ===== Helper: parse age string to score (ตาม Home Affairs) =====
function ageScore(age: string): number {
  switch (age) {
    case '18-24': return 25
    case '25-32': return 30
    case '33-39': return 25
    case '40-44': return 15
    default: return 0 // 45+
  }
}

// ===== Helper: parse english to score (ตาม Home Affairs) =====
function englishScore(level: string): number {
  switch (level) {
    case 'superior': return 20  // IELTS 8.0+
    case 'proficient': return 10 // IELTS 7.0-7.9
    case 'competent': return 0   // IELTS 6.0-6.9
    default: return 0
  }
}

// ===== Helper: Overseas work experience (ตาม Home Affairs) =====
function overseasExperienceScore(exp: string): number {
  switch (exp) {
    case '8+': return 15
    case '5-7': return 10
    case '3-4': return 5
    default: return 0 // 0-2 years
  }
}

// ===== Helper: Australian work experience (ตาม Home Affairs) =====
function australianExperienceScore(exp: string): number {
  const years = parseFloat(exp)
  if (years >= 8) return 20
  if (years >= 5) return 15
  if (years >= 3) return 10
  if (years >= 1) return 5
  return 0
}

// ===== Helper: parse education to score (ตาม Home Affairs) =====
function educationScore(edu: string): number {
  switch (edu) {
    case 'phd': return 20
    case 'masters':
    case 'bachelor': return 15
    case 'trade': return 10
    default: return 0
  }
}

// ===== Helper: Partner points (ตาม Home Affairs) =====
function partnerScore(status: string): number {
  switch (status) {
    case 'has-skills': return 10  // Partner <45, competent English, skills assessment
    case 'has-english': return 5  // Partner with competent English only
    case 'au-citizen-pr': return 10 // Single or partner is AU citizen/PR
    default: return 0
  }
}

// ===== Feasibility Calculation =====
export function calculateFeasibility(
  age: string,
  englishLevel: string,
  experience: string,
  australianExperience: string,
  education: string,
  partnerStatus: string,
  australianStudy: boolean,
  stemQualification: boolean,
  professionalYear: boolean,
  naatiCertified: boolean,
  regionalStudy: boolean
): FeasibilityResult {
  
  // คำนวณคะแนนแต่ละหมวด
  const agePoints = ageScore(age)
  const englishPoints = englishScore(englishLevel)
  const overseasExpPoints = overseasExperienceScore(experience)
  const australianExpPoints = australianExperienceScore(australianExperience)
  const educationPoints = educationScore(education)
  const partnerPoints = partnerScore(partnerStatus)
  const australianStudyPoints = australianStudy ? 5 : 0
  const stemPoints = stemQualification ? 10 : 0
  const professionalYearPoints = professionalYear ? 5 : 0
  const naatiPoints = naatiCertified ? 5 : 0
  const regionalStudyPoints = regionalStudy ? 5 : 0
  
  // Work experience มี cap ที่ 20 คะแนน (ตาม Home Affairs)
  const workExpPoints = Math.min(overseasExpPoints + australianExpPoints, 20)
  const overseasUsed = Math.min(overseasExpPoints, workExpPoints)
  const australianUsed = Math.min(australianExpPoints, workExpPoints - overseasUsed)
  
  const totalScore = 
    agePoints + 
    englishPoints + 
    workExpPoints +
    educationPoints + 
    partnerPoints + 
    australianStudyPoints + 
    stemPoints + 
    professionalYearPoints + 
    naatiPoints + 
    regionalStudyPoints

  const pointsBreakdown: PointsBreakdown = {
    age: agePoints,
    english: englishPoints,
    overseasExperience: overseasUsed,
    australianExperience: australianUsed,
    education: educationPoints,
    partner: partnerPoints,
    australianStudy: australianStudyPoints,
    stemQualification: stemPoints,
    professionalYear: professionalYearPoints,
    naati: naatiPoints,
    regionalStudy: regionalStudyPoints,
    total: totalScore,
  }

  const warnings: string[] = []
  let feasible = true

  if (age === '45+') {
    warnings.push('อายุ 45+ จะได้ 0 คะแนนอายุ ยากมากใน skilled visa')
  }
  if (englishLevel === 'functional' || !englishLevel) {
    warnings.push('ต้องมี IELTS/PTE ขั้นต่ำ Competent (6.0) ถึงจะสมัคร skilled visa ได้')
    if (englishLevel === 'functional') feasible = false
  }
  if (experience === '0-2' || !experience) {
    warnings.push('ประสบการณ์น้อยกว่า 3 ปี จะได้ 0 คะแนนในส่วนนี้')
  }
  if (!education || education === 'trade') {
    warnings.push('วุฒิ Trade/Diploma ได้ 10 คะแนน — พิจารณาวีซ่า Trades ที่มี cut-off ต่ำกว่า')
  }

  // Visa options — categorized into skilled (points-based) and non-points pathways
  const visaOptions: VisaOption[] = []

  // ===== POINTS-BASED SKILLED VISAS =====
  if (totalScore >= 65) {
    visaOptions.push({
      type: 'Subclass 189',
      name: 'Skilled Independent Visa',
      category: 'skilled',
      difficulty: totalScore >= 85 ? 'medium' : 'very-hard',
      description: 'ไม่ต้อง sponsor สมัครเองได้ แต่แข่งสูงมาก (cut-off 85-95+ คะแนน ในปี 2025-26)',
      pathToPR: 'ได้ PR ทันที',
      timeline: '12-18 เดือน',
      cost: '$4,910 (หลัก) + $2,455 (คู่สมรส)',
      eligible: totalScore >= 65,
    })
  }

  if (totalScore >= 60) {
    visaOptions.push({
      type: 'Subclass 190',
      name: 'Skilled Nominated Visa',
      category: 'skilled',
      difficulty: 'medium',
      description: 'ต้องได้ nomination จาก state (NSW/VIC/QLD) +5 คะแนน → รวมแล้ว ' + (totalScore + 5) + ' คะแนน',
      pathToPR: 'ได้ PR ทันที แต่ต้องอยู่ state นั้น 2 ปี',
      timeline: '12-18 เดือน',
      cost: '$4,910 (หลัก)',
      eligible: true,
    })
  }

  if (totalScore >= 50) {
    visaOptions.push({
      type: 'Subclass 491',
      name: 'Skilled Work Regional Visa',
      category: 'skilled',
      difficulty: 'easy',
      description: 'Regional nomination +15 คะแนน → รวมแล้ว ' + (totalScore + 15) + ' คะแนน (ต้องอยู่ regional 3 ปี)',
      pathToPR: 'หลัง 3 ปีสมัคร 191 เป็น PR',
      timeline: '8-12 เดือน',
      cost: '$4,910 (หลัก)',
      eligible: true,
    })
  }

  // ===== EMPLOYER SPONSORED =====
  visaOptions.push({
    type: 'Subclass 482',
    name: 'Temporary Skill Shortage (TSS)',
    category: 'work',
    difficulty: 'easy',
    description: 'ต้องมี employer sponsor ก่อน ไม่ต้องใช้คะแนน ต้องมีประสบการณ์ 2 ปี+',
    pathToPR: 'ทำ 2-3 ปี → สมัคร 186 (Employer Nomination) ได้ PR',
    timeline: '3-6 เดือน (ถ้ามี job offer)',
    cost: '$3,115 (หลัก)',
    eligible: true,
  })

  visaOptions.push({
    type: 'Subclass 186',
    name: 'Employer Nomination Scheme (ENS)',
    category: 'work',
    difficulty: 'medium',
    description: 'นายจ้าง AU nominate ให้ ต้องทำงานกับนายจ้างนั้น 2-3 ปี หรือมี 3 ปีประสบการณ์',
    pathToPR: 'ได้ PR ทันที (Direct Entry stream)',
    timeline: '6-12 เดือน',
    cost: '$4,910 (หลัก)',
    eligible: true,
  })

  // ===== STUDENT PATHWAY =====
  visaOptions.push({
    type: 'Subclass 500',
    name: 'Student Visa',
    category: 'study',
    difficulty: 'easy',
    description: 'เรียนที่ AU (TAFE, Uni, VET) ทำงานได้ 48 ชม./2 สัปดาห์ ระหว่างเรียน ต้องมี CoE + GTE + เงินเพียงพอ',
    pathToPR: 'ไม่ได้โดยตรง → จบแล้วสมัคร 485 → แล้วไป 189/190/482',
    timeline: 'ได้เร็ว 1-3 เดือน',
    cost: '$1,600 (ค่าวีซ่า) + ค่าเทอม $20,000-50,000/ปี',
    eligible: true,
  })

  visaOptions.push({
    type: 'Subclass 485',
    name: 'Temporary Graduate Visa',
    category: 'study',
    difficulty: 'easy',
    description: 'จบ ป.ตรี+ จาก AU ได้ work visa: ป.ตรี 2 ปี, ป.โท 3 ปี, ป.เอก 4 ปี ทำงานได้เต็มเวลา',
    pathToPR: 'ใช้เวลาหางาน → apply 482/189/190 ภายหลัง',
    timeline: 'จบแล้วสมัครได้เลย',
    cost: '$1,895 (หลัก)',
    eligible: australianStudy,
  })

  // ===== WORKING HOLIDAY =====
  // Thailand มีข้อตกลง Work and Holiday (462) กับ Australia
  const ageNum = age === '18-24' ? 21 : age === '25-32' ? 28 : age === '33-39' ? 36 : age === '40-44' ? 42 : 50
  const whvEligible = ageNum >= 18 && ageNum <= 30

  visaOptions.push({
    type: 'Subclass 462',
    name: 'Work and Holiday Visa',
    category: 'other',
    difficulty: whvEligible ? 'easy' : 'very-hard',
    description: whvEligible
      ? 'ไทยมีข้อตกลงกับ AU! อายุ 18-30 ปี ไปทำงาน+ท่องเที่ยว 12 เดือน ทำงานได้เต็มเวลา ต่อได้ถึง 3 ปี'
      : 'สำหรับอายุ 18-30 ปีเท่านั้น (ไม่ตรงเงื่อนไขอายุของคุณ)',
    pathToPR: 'ไม่ได้โดยตรง แต่ใช้หาประสบการณ์ → เปลี่ยน 482/employer sponsor',
    timeline: '1-3 เดือน',
    cost: '$640 (ค่าวีซ่า)',
    eligible: whvEligible,
  })

  // ===== PARTNER/FAMILY =====
  visaOptions.push({
    type: 'Subclass 309/100',
    name: 'Partner Visa (Offshore)',
    category: 'partner',
    difficulty: 'medium',
    description: 'มีคู่สมรส/แฟนเป็น AU citizen/PR สมัครจากนอก AU → ได้ temporary แล้วรอ permanent',
    pathToPR: '309 (temp) → 100 (permanent) ภายใน 2 ปี',
    timeline: '12-24 เดือน',
    cost: '$9,095 (หลัก — แพงที่สุด)',
    eligible: partnerStatus === 'au-citizen-pr',
  })

  visaOptions.push({
    type: 'Subclass 820/801',
    name: 'Partner Visa (Onshore)',
    category: 'partner',
    difficulty: 'medium',
    description: 'เหมือน 309/100 แต่สมัครในขณะที่อยู่ AU แล้ว ได้ bridging visa ระหว่างรอ',
    pathToPR: '820 (temp) → 801 (permanent) ภายใน 2 ปี',
    timeline: '12-24 เดือน',
    cost: '$9,095 (หลัก)',
    eligible: partnerStatus === 'au-citizen-pr',
  })

  return { feasible, score: totalScore, pointsBreakdown, visaOptions, warnings }
}

// ===== Budget Calculation =====
export function calculateBudget(
  city: CityKey,
  familyStatus: FamilyStatus
): BudgetResult {
  const data = CITY_DATA[city]

  const monthlyRent =
    familyStatus === 'single'
      ? data.rent1br
      : familyStatus === 'couple'
      ? data.rent2br
      : data.rentFamily

  const monthlyLiving = data.groceries + data.transport + data.utilities + data.misc
  const monthlyTotal = monthlyRent + monthlyLiving

  // All in AUD
  const initialCosts = {
    visa: familyStatus === 'family' ? 8595 : 4910,  // Home Affairs 189 base $4,910 + additional applicants
    flight: familyStatus === 'single' ? 1000 : familyStatus === 'couple' ? 2000 : 3000,
    bond: Math.round(monthlyRent),   // 4 weeks bond ≈ 1 month rent
    furniture: familyStatus === 'single' ? 2000 : 4000,
    documents: 1500,                  // skills assessment (~$500-1500) + translations + police checks
  }

  const totalInitial = Object.values(initialCosts).reduce((a, b) => a + b, 0)

  return {
    monthlyRent,
    monthlyLiving,
    monthlyTotal,
    initialCosts,
    totalInitial,
    minimum: totalInitial + monthlyTotal * 2,
    comfortable: totalInitial + monthlyTotal * 4 + 5000,
    city,
  }
}

// ===== Parity Calculation =====
export function calculateParity(
  thaiMonthlySalary: number,
  exchangeRate: number
): ParityResult {
  const annualSalary = thaiMonthlySalary * 12
  const thaiTax = annualSalary > 750000 ? 0.2 : annualSalary > 500000 ? 0.15 : 0.1
  const ausTax = 0.25
  const thaiNetMonthly = thaiMonthlySalary * (1 - thaiTax)
  const colMultiplier = 2.2

  const requiredAusNet = (thaiNetMonthly * colMultiplier) / exchangeRate
  const requiredAusGross = requiredAusNet / (1 - ausTax)
  const requiredAusAnnual = Math.round(requiredAusGross * 12)

  return {
    thaiSalaryAnnual: annualSalary,
    thaiNetMonthly,
    requiredAusAnnual,
    zones: {
      tight: Math.round(requiredAusAnnual * 0.85),
      okay: requiredAusAnnual,
      comfortable: Math.round(requiredAusAnnual * 1.2),
      spacious: Math.round(requiredAusAnnual * 1.5),
    },
  }
}

// ===== Score Calculation (Quiet - for summary) =====
export function calculateScoreQuiet(
  age: string,
  englishLevel: string,
  experience: string,
  australianExperience: string,
  education: string,
  partnerStatus: string,
  australianStudy: boolean,
  stemQualification: boolean,
  professionalYear: boolean,
  naatiCertified: boolean,
  regionalStudy: boolean
): number {
  const agePoints = ageScore(age)
  const englishPoints = englishScore(englishLevel)
  const overseasExpPoints = overseasExperienceScore(experience)
  const australianExpPoints = australianExperienceScore(australianExperience)
  const workExpPoints = Math.min(overseasExpPoints + australianExpPoints, 20)
  const educationPoints = educationScore(education)
  const partnerPoints = partnerScore(partnerStatus)
  const australianStudyPoints = australianStudy ? 5 : 0
  const stemPoints = stemQualification ? 10 : 0
  const professionalYearPoints = professionalYear ? 5 : 0
  const naatiPoints = naatiCertified ? 5 : 0
  const regionalStudyPoints = regionalStudy ? 5 : 0
  
  return agePoints + englishPoints + workExpPoints + educationPoints + partnerPoints + 
         australianStudyPoints + stemPoints + professionalYearPoints + naatiPoints + regionalStudyPoints
}
