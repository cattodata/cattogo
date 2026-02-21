'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  COUNTRIES, GOALS, OCCUPATIONS,
  CURRENCY_TO_THB, CURRENCY_SYMBOLS,
  matchCountries,
  type MatchResult, type MatchParams,
} from '@/data/country-data'
import {
  AUD_TO_THB, calculateAusTax, calculateThaiTax,
  AU_SALARIES, AU_UNSKILLED_SALARY, TH_TOTAL_LIVING,
  AU_CITIES, FOOD_COSTS, TRANSPORT_COSTS,
  calculateSimpleVisaScore,
} from '@/data/simulator-data'
import { searchOccupations } from '@/data/occupations'
import { getCountryDetails, type OccupationSalaries, type SalaryRange } from '@/data/country-detailed-data'
import {
  chatWithTyphoon, analyzeResults, rankCountriesWithAI,
  getStoredApiKey,
  type ChatMessage, type GatheredData,
} from '@/lib/typhoon'
import { ShareButtons } from './ShareButtons'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

// ===== TYPES =====
type Phase = 'welcome' | 'quiz' | 'aiChat' | 'analyzing' | 'countryResults' | 'auProfile' | 'sim' | 'result'

interface QuickProfile {
  age: string
  monthlyIncome: string
  savings: string
  family: string
}

interface AuProfile {
  english: string
  experience: string
  education: string
  thaiSalary: string
  city: string
}

// ===== CONSTANTS =====
const fmt = (n: number) => Math.round(n).toLocaleString()
const fmtAud = (n: number) => `$${fmt(n)}`
const fmtThb = (n: number) => `฿${fmt(n)}`

// Map user occupation ID → key in OccupationSalaries
const OCC_TO_SALARY_KEY: Record<string, keyof OccupationSalaries> = {
  'software': 'softwareDev',
  'engineering': 'engineer',
  'creative': 'softwareDev', // No dedicated creative salary data available; uses softwareDev as proxy (UX/UI overlap). Actual creative salaries may be lower for roles like graphic design or photography.
  'accounting': 'accountant',
  'healthcare': 'nurse',
  'chef': 'trades', // chef uses trades salary range as closest proxy
  'other': 'trades',
}

function getOccSalary(countryId: string, occId: string): SalaryRange | null {
  const details = getCountryDetails(countryId)
  if (!details) return null
  const key = OCC_TO_SALARY_KEY[occId] || 'softwareDev'
  return details.salaries[key] || null
}

const STAGE_META = [
  { id: 'savings', title: '💰 ด่าน 1: เตรียมกระสุน', sub: 'มีเงินเก็บเท่าไหร่?' },
  { id: 'predeparture', title: '📋 ด่าน 2: ค่าใช้จ่ายก่อนบิน', sub: 'ก่อนไปต้องจ่ายค่าอะไรบ้าง?' },
  { id: 'job', title: '💼 ด่าน 3: ได้งานแล้ว!', sub: 'เงินเดือนเท่าไหร่?' },
  { id: 'flight', title: '✈️ ด่าน 4: ซื้อตั๋วบินกัน!', sub: 'Business หรือ Economy?' },
  { id: 'temp', title: '🛬 ด่าน 5: ถึงแล้ว! พักไหนก่อน?', sub: 'ที่พักชั่วคราวช่วง 2 สัปดาห์แรก' },
  { id: 'housing', title: '🏠 ด่าน 6: หาบ้านอยู่จริงๆ!', sub: 'แชร์ห้อง หรือ อยู่คนเดียว?' },
  { id: 'furnish', title: '🛋️ ด่าน 7: ซื้อของเข้าบ้าน', sub: 'ตกแต่งบ้านสไตล์ไหน?' },
  { id: 'commute', title: '🚗 ด่าน 8: ไปทำงานยังไง', sub: 'ขับรถ หรือ รถไฟ?' },
  { id: 'food', title: '🍳 ด่าน 9: กินข้าวยังไง', sub: 'ทำเอง หรือ ซื้อกิน?' },
  { id: 'insurance', title: '🏥 ด่าน 10: ประกันสุขภาพ', sub: 'จัดเอง หรือ Medicare ฟรี?' },
]
const TOTAL_STAGES = STAGE_META.length

// ===== AI SYSTEM PROMPT =====
const AI_SYSTEM_PROMPT = `คุณชื่อ "Catto" 🐱 ผู้ช่วยวิเคราะห์การย้ายประเทศ (14 ประเทศ ไม่ใช่แค่ออสเตรเลีย) คุยเป็นกันเอง ใช้ emoji พอดี

⛔ GUARDRAILS — ห้ามละเมิด:
- ห้ามใช้ภาษาอื่นนอกจากภาษาไทย+อังกฤษ — ห้ามภาษาจีน ญี่ปุ่น เกาหลี หรืออักษรอื่น
- ห้ามตอบเรื่องนอกเหนือจาก: การย้ายประเทศ, วีซ่า, ค่าครองชีพ, อาชีพ/เงินเดือน, คุณภาพชีวิต, เปรียบเทียบประเทศ
- ถ้า user ถามนอกเรื่อง (สูตรอาหาร, การเมือง, ความรัก, การบ้าน, coding, ฯลฯ) → ตอบ: "เรื่องนี้ Catto ช่วยไม่ได้นะ 😸 ถามเรื่องย้ายประเทศมาได้เลย!"
- ห้ามตอบยาวเกิน 3 ประโยค (ไม่เกิน 80 คำ) — ถ้ามีเยอะ ให้สรุปสั้นแล้วถามต่อ
- ห้ามเขียนเรียงความ ห้ามอธิบายยืดยาว ห้ามแจกแจงหลายข้อ
- ห้ามสร้างข้อมูลเท็จ ถ้าไม่แน่ใจให้บอกว่า "Catto ไม่ชัวร์ ลองเช็คจากเว็บทางการนะ"
- ห้ามแสร้งเป็น migration agent หรือให้คำแนะนำทางกฎหมาย

กฎสำคัญ:
1. ตอบรับเนื้อหาที่ user พูดจริงๆ — ถ้าเขาบอกว่าเป็นพยาบาล ก็พูดถึงพยาบาล ไม่ใช่แค่พูดว่า "เข้าใจ!"
2. ถ้า user พูดถึงประเทศเฉพาะ (เช่น เยอรมัน, อเมริกา) ให้ acknowledge เช่น "เยอรมันกับอเมริกาเหรอ น่าสนใจ!"
3. ถ้า user ถามคำถามเฉพาะเจาะจง (work-life balance, เงินเดือน, ฯลฯ) ให้ตอบสั้นๆ 1-2 ประโยคจากความรู้ทั่วไปก่อน แล้วค่อยถามเก็บข้อมูล
4. ห้ามพูด "เข้าใจแล้ว! 💪" ซ้ำทุกข้อความ — ใช้คำแตกต่างกัน เช่น "ว้าว พยาบาลเลยเหรอ", "โห เยอรมันน่าสนใจมาก", "เงินเดือนโอเคเลย"
5. ถ้า user ให้ข้อมูลหลายอย่างพร้อมกัน (เช่น อาชีพ + อายุ + ประเทศ) ให้เก็บทั้งหมดทีเดียว ไม่ต้องถามซ้ำ
6. ตอบสั้น 1-3 ประโยค จบด้วยคำถาม 1 ข้อ
7. ถามทีละเรื่อง ไม่ถามหลายเรื่องพร้อมกัน

Flow:
1. คำถามแรก: ให้ user เล่าอิสระ
2. หลัง user เล่า: ตอบรับเนื้อหาจริงๆ + สรุปสิ่งที่จับได้ + ถาม "มีอะไรอยากเสริมไหม?"
3. เก็บข้อมูลที่ขาด ทีละเรื่อง (ลำดับยืดหยุ่นได้):
   - goals (1-3): money-job | balance | family | stable | lifestyle
   - occupation: software | engineering | creative | accounting | healthcare | chef | other
   - age: "18-24" | "25-32" | "33-39" | "40-44" | "45+"
   - family: "single" | "couple" | "family"
   - monthlyIncome: number (บาท)
4. พอครบ → set ready: true + สรุปสั้น 1 บรรทัด

Mapping อาชีพ:
- IT/software/dev/data/programmer → "software"
- วิศวกร/engineer/mechanical/civil/electrical → "engineering"
- กราฟิก/graphic designer/ดีไซน์/UI/UX/creative/สื่อ/media/photographer/ช่างภาพ/animator/illustrator/marketing → "creative"
- บัญชี/finance/accountant → "accounting"
- พยาบาล/nurse/หมอ/doctor/สาธารณสุข/เภสัช → "healthcare"
- เชฟ/chef/cook/ครัว/barista → "chef"
- อื่นๆ/ครู/teacher → "other"

ตอบเป็น JSON:
{"message": "...", "gathered": {"goals": [], "occupation": "", "monthlyIncome": 0, "age": "", "family": "", "ready": false}}`

// ===== MAIN COMPONENT =====
export function ChatSimulator() {
  const [phase, setPhase] = useState<Phase>('welcome')

  // Quiz state
  const [quizStep, setQuizStep] = useState(0)
  const [goals, setGoals] = useState<string[]>([])
  const [occupation, setOccupation] = useState('')
  const [quickProfile, setQuickProfile] = useState<QuickProfile>({ age: '', monthlyIncome: '', savings: '', family: 'single' })

  // Country results
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [expandedCountry, setExpandedCountry] = useState('')

  // AU Profile
  const [auProfile, setAuProfile] = useState<AuProfile>({ english: '', experience: '', education: '', thaiSalary: '', city: 'melbourne' })

  // Simulation
  const [simStage, setSimStage] = useState(0)
  const [savingsInput, setSavingsInput] = useState('')
  const [isMotherLord, setIsMotherLord] = useState(false)
  const [initialAUD, setInitialAUD] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})

  // Occupation search
  const [occSearchMode, setOccSearchMode] = useState(false)
  const [occSearchQuery, setOccSearchQuery] = useState('')
  const [occDisplayLabel, setOccDisplayLabel] = useState('')

  // AI Chat state
  const [aiMode, setAiMode] = useState(false)
  const [apiKey] = useState(getStoredApiKey())
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([])
  const [aiChatHistory, setAiChatHistory] = useState<ChatMessage[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiGathered, setAiGathered] = useState<GatheredData>({ goals: [], occupation: '', monthlyIncome: 0, age: '', family: '', ready: false })
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiError, setAiError] = useState('')
  const [chipSelected, setChipSelected] = useState<string[]>([])
  const [occChatSearch, setOccChatSearch] = useState('')
  const [showOccSearch, setShowOccSearch] = useState(false)
  const [goalsConfirmed, setGoalsConfirmed] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 200)
  }, [quizStep, phase, simStage, aiMessages.length])

  // Init: auto-start AI mode
  useEffect(() => {
    // Auto launch AI chat on first load
    if (phase === 'welcome' && apiKey) {
      startAiChat()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ===== AI HANDLERS =====
  const startAiChat = () => {
    setAiMode(true)
    setPhase('aiChat')
    const greeting = 'เหมียว! 🐱 ฉันชื่อ Catto — ผู้ช่วยวิเคราะห์ว่าคุณเหมาะจะย้ายไปประเทศไหน\n\nเล่าให้ฟังหน่อยสิ ตอนนี้ทำอะไรอยู่ แล้วทำไมถึงคิดอยากย้าย? 🌍'
    setAiMessages([{ role: 'bot', text: greeting }])
    setAiChatHistory([{ role: 'system', content: AI_SYSTEM_PROMPT }, { role: 'assistant', content: JSON.stringify({ message: greeting, gathered: { goals: [], occupation: '', monthlyIncome: 0, age: '', family: '', ready: false } }) }])
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || aiLoading) return
    setAiInput('')
    setChipSelected([])
    setShowOccSearch(false)
    setOccChatSearch('')
    setAiError('')
    setAiMessages(prev => [...prev, { role: 'user', text: text.trim() }])
    setAiLoading(true)

    const newHistory: ChatMessage[] = [...aiChatHistory, { role: 'user', content: text.trim() }]
    setAiChatHistory(newHistory)

    try {
      const aiRes = await chatWithTyphoon(apiKey, newHistory)
      // Merge gathered: keep previously confirmed data, add new data from AI
      const merged: GatheredData = {
        goals: aiRes.gathered.goals.length > 0
          ? [...new Set([...aiGathered.goals, ...aiRes.gathered.goals])]
          : aiGathered.goals,
        occupation: aiRes.gathered.occupation || aiGathered.occupation,
        monthlyIncome: aiRes.gathered.monthlyIncome || aiGathered.monthlyIncome,
        age: aiRes.gathered.age || aiGathered.age,
        family: aiRes.gathered.family || aiGathered.family,
        ready: aiRes.gathered.ready,
      }
      setAiMessages(prev => [...prev, { role: 'bot', text: aiRes.message }])
      setAiChatHistory(prev => [...prev, { role: 'assistant', content: JSON.stringify({ message: aiRes.message, gathered: merged }) }])
      setAiGathered(merged)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด ลองพิมพ์ใหม่นะ')
    }
    setAiLoading(false)
  }

  const sendAiMessage = () => sendMessage(aiInput)

  const runAiAnalysis = async (gathered: GatheredData, results: MatchResult[]) => {
    try {
      const userCtx = `เป้าหมาย: ${gathered.goals.join(', ')}, อาชีพ: ${gathered.occupation}, เงินเดือน: ${gathered.monthlyIncome} บาท, อายุ: ${gathered.age}, ไป: ${gathered.family}`
      const resultsCtx = results.map((r, i) => `${i + 1}. ${r.country.nameTH} (${r.matchPct}%) — ${r.highlights.join(', ')}`).join('\\n')
      const analysis = await analyzeResults(apiKey, userCtx, resultsCtx)
      setAiAnalysis(analysis)
    } catch {
      // fail silently — analysis is optional
    }
  }

  // ===== POST-CHAT NAVIGATION =====
  const applyGatheredData = (g: GatheredData) => {
    setGoals(g.goals)
    setOccupation(g.occupation)
    setQuickProfile({ age: g.age, monthlyIncome: String(g.monthlyIncome), savings: '', family: g.family })
  }

  const goToCountryAnalysis = async () => {
    applyGatheredData(aiGathered)
    setPhase('analyzing')
    const fallbackParams: MatchParams = {
      goals: aiGathered.goals, occupation: aiGathered.occupation,
      monthlyIncome: aiGathered.monthlyIncome, age: aiGathered.age, family: aiGathered.family,
    }
    try {
      const rankings = await rankCountriesWithAI(apiKey, fallbackParams, COUNTRIES)
      const results: MatchResult[] = rankings
        .map(r => {
          const country = COUNTRIES.find(c => c.id === r.countryId)
          if (!country) return null
          return { country, matchPct: r.matchPct, highlights: r.highlights, challenges: r.challenges.length > 0 ? r.challenges : country.cons, occupationNote: r.reason }
        })
        .filter((r): r is MatchResult => r !== null)
      // If AI returned bad country IDs → fall through to hardcoded
      if (results.length === 0) throw new Error('no valid results from AI')
      setMatchResults(results)
      runAiAnalysis(aiGathered, results)
      setPhase('countryResults')
    } catch {
      // Fallback to hardcoded matching — always produces results
      const results = matchCountries(fallbackParams)
      setMatchResults(results)
      runAiAnalysis(aiGathered, results)
      setPhase('countryResults')
    }
  }

  const goToAuSim = () => {
    applyGatheredData(aiGathered)
    setAuProfile(p => ({ ...p, thaiSalary: String(aiGathered.monthlyIncome) }))
    setPhase('auProfile')
  }

  // ===== CHIP HANDLERS =====
  const toggleChip = (id: string) => {
    setChipSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  const GOAL_LABELS: Record<string, string> = {
    'money-job': '💰 เงินดี หางานง่าย',
    'balance': '🏖️ Work-life balance',
    'family': '👨‍👩‍👧 ลูกเรียนดี สวัสดิการ',
    'stable': '🏛️ การเมืองมั่นคง',
    'lifestyle': '🌴 ย้ายง่าย เกษียณสบาย',
  }

  const sendGoalChips = () => {
    if (chipSelected.length === 0) return
    const text = chipSelected.map(id => GOAL_LABELS[id] || id).join(', ')
    // Directly record goals + auto-confirm so chips advance to next phase
    setAiGathered(prev => ({
      ...prev,
      goals: [...new Set([...prev.goals, ...chipSelected])]
    }))
    setGoalsConfirmed(true)
    sendMessage(text)
  }

  // Pick occupation from search and send to AI
  const pickOccFromSearch = (title: string, occId: string) => {
    setShowOccSearch(false)
    setOccChatSearch('')
    // Directly record occupation — don't rely solely on AI to echo it
    setAiGathered(prev => ({ ...prev, occupation: occId }))
    sendMessage(title)
  }

  // Quick occupation chip mapping → proper AI-expected IDs
  const OCC_CHIP_MAP: { label: string; text: string; occId: string }[] = [
    { label: '💻 Software Dev', text: 'Software Developer / โปรแกรมเมอร์', occId: 'software' },
    { label: '📊 Data / Analytics', text: 'Data Engineer / Analyst', occId: 'software' },
    { label: '☁️ DevOps / Cloud', text: 'DevOps / Cloud Engineer', occId: 'software' },
    { label: '🤖 AI / ML', text: 'AI / Machine Learning Engineer', occId: 'software' },
    { label: '🔒 Cybersecurity', text: 'Cybersecurity Analyst', occId: 'software' },
    { label: '⚙️ วิศวกร', text: 'วิศวกร', occId: 'engineering' },
    { label: '🎨 ดีไซน์ / ครีเอทีฟ', text: 'Graphic Designer / ดีไซเนอร์', occId: 'creative' },
    { label: '🏥 สาธารณสุข', text: 'แพทย์ / พยาบาล', occId: 'healthcare' },
    { label: '📋 บัญชี', text: 'บัญชี / การเงิน', occId: 'accounting' },
    { label: '👨‍🍳 เชฟ', text: 'เชฟ / ครัว', occId: 'chef' },
  ]
  const sendOccChip = (text: string, occId: string) => {
    setAiGathered(prev => ({ ...prev, occupation: occId }))
    sendMessage(text)
  }

  // Determine what chips to show — match the LAST BOT MESSAGE topic, not just gathered state
  type ChipMode = 'none' | 'goals' | 'goals-confirm' | 'occ-search' | 'age' | 'family' | 'income'
  const getChipMode = (): ChipMode => {
    if (aiLoading || aiGathered.ready || aiMessages.length < 1) return 'none'
    const lastBotMsg = [...aiMessages].reverse().find(m => m.role === 'bot')
    if (!lastBotMsg) return 'none'
    const txt = lastBotMsg.text.toLowerCase()
    // Off-topic rejection → no chips
    if (txt.includes('catto ช่วยไม่ได้')) return 'none'

    // Don't show chips until user has sent at least 1 message — let them type freely first
    const userMsgCount = aiMessages.filter(m => m.role === 'user').length
    if (userMsgCount < 1) return 'none'

    // Detect what the AI is asking about from its message
    const asksIncome = /รายได้|เงินเดือน|เดือนละ|ได้เท่าไร|salary|income/.test(txt)
    const asksAge = /อายุ|เกิดปี|กี่ปี|age/.test(txt)
    const asksFamily = /ครอบครัว|ไปคนเดียว|แต่งงาน|ลูก|single|family|couple/.test(txt)
    const asksOcc = /อาชีพ|ทำงาน|ทำอะไร|ตำแหน่ง|งาน.*อะไร|occupation|job/.test(txt)

    // Priority: show chips matching what AI asks; fall back to gathered-state order
    if (asksIncome && aiGathered.monthlyIncome === 0) return 'income'
    if (asksAge && !aiGathered.age) return 'age'
    if (asksFamily && !aiGathered.family) return 'family'
    if (asksOcc && !aiGathered.occupation) return 'occ-search'

    // Fallback: follow gathered-state order for what's missing
    if (aiGathered.goals.length === 0) return 'goals'
    if (!goalsConfirmed) return 'goals-confirm'
    if (!aiGathered.occupation) return 'occ-search'
    if (!aiGathered.age) return 'age'
    if (!aiGathered.family) return 'family'
    if (aiGathered.monthlyIncome === 0) return 'income'
    return 'none'
  }

  // ===== DERIVED (AU SIMULATION) =====
  const auOccKey = occupation // new 6 IDs map directly to AU_SALARIES keys
  const city = AU_CITIES[auProfile.city] || AU_CITIES['melbourne']
  const salaryData = AU_SALARIES[auOccKey] || AU_SALARIES['other']

  const preDepartureCosts = useMemo(() => {
    const visa = quickProfile.family === 'family' ? 9825 : quickProfile.family === 'couple' ? 7365 : 4910
    return [
      { label: '📋 Visa Application Fee', aud: visa },
      { label: '📝 Skills Assessment', aud: 1000 },
      { label: '📖 IELTS/PTE สอบภาษา', aud: 400 },
      { label: '🏥 ตรวจสุขภาพ Medical', aud: 400 },
      { label: '📄 เอกสาร+แปล+รับรอง', aud: 500 },
    ]
  }, [quickProfile.family])
  const preDepartureTotal = preDepartureCosts.reduce((s, c) => s + c.aud, 0)

  const grossAnnual = choices['job'] === 'top' ? salaryData.senior : choices['job'] === 'min' ? AU_UNSKILLED_SALARY : salaryData.mid
  const monthlyRent = choices['housing'] === 'share' ? city.rentShare : choices['housing'] === '2bed' ? (quickProfile.family === 'family' ? city.rentFamily : city.rent2br) : city.rent1br
  const bond = monthlyRent
  const flightCost = choices['flight'] === 'business' ? (quickProfile.family === 'single' ? 4500 : quickProfile.family === 'couple' ? 9000 : 13500) : choices['flight'] === 'company' ? 0 : (quickProfile.family === 'single' ? 1100 : quickProfile.family === 'couple' ? 2200 : 3500)
  const tempCost = choices['temp'] === 'airbnb' ? 2100 : choices['temp'] === 'hostel' ? 700 : 0
  const furnishCost = choices['furnish'] === 'nice' ? 4000 : choices['furnish'] === 'ikea' ? 2000 : choices['furnish'] === 'second' ? 800 : 0

  const oneTimeCosts = useMemo(() => {
    let total = 0
    if (simStage > 1) total += preDepartureTotal
    if (simStage > 3) total += flightCost
    if (simStage > 4) total += tempCost
    if (simStage > 5) total += bond
    if (simStage > 6) total += furnishCost
    return total
  }, [simStage, preDepartureTotal, flightCost, tempCost, bond, furnishCost])

  const balanceAUD = isMotherLord ? Infinity : initialAUD - oneTimeCosts

  const auTax = calculateAusTax(grossAnnual)
  const monthlyNet = auTax.netMonthly
  const monthlyFood = FOOD_COSTS[choices['food']]?.cost || 550
  const monthlyTransport = TRANSPORT_COSTS[choices['commute']]?.cost || 200
  const monthlyInsurance = choices['insurance'] === 'private' ? 150 : 0
  const monthlyUtils = city.utilities + city.internet
  const monthlyPhone = 50
  const monthlyMisc = 250
  const totalMonthlyExp = monthlyRent + monthlyUtils + monthlyFood + monthlyTransport + monthlyInsurance + monthlyPhone + monthlyMisc
  const monthlySavings = monthlyNet - totalMonthlyExp
  const monthlySavingsTHB = Math.round(monthlySavings * AUD_TO_THB)

  const thaiSalary = parseInt(auProfile.thaiSalary) || parseInt(quickProfile.monthlyIncome) || 40000
  const thaiTax = calculateThaiTax(thaiSalary * 12)
  const thaiNetMonthly = thaiTax.netMonthly
  const thaiMonthlySavings = thaiNetMonthly - TH_TOTAL_LIVING

  const visa = calculateSimpleVisaScore(quickProfile.age, auProfile.english, auProfile.experience, auProfile.education, choices['job'] === 'min' ? 'unskilled' : 'skilled')
  const finalOneTime = preDepartureTotal + flightCost + tempCost + bond + furnishCost

  // ===== HANDLERS =====
  const toggleGoal = (id: string) => {
    setGoals(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  const confirmGoals = () => {
    if (goals.length >= 1) setQuizStep(1)
  }

  const pickOccupation = (id: string, displayLabel?: string) => {
    setOccupation(id)
    if (displayLabel) setOccDisplayLabel(displayLabel)
    setOccSearchMode(false)
    setOccSearchQuery('')
    setQuizStep(2)
  }

  const upQ = (field: keyof QuickProfile, val: string) => setQuickProfile(p => ({ ...p, [field]: val }))

  const confirmProfile = () => {
    if (quickProfile.age && quickProfile.monthlyIncome) startAnalyzing()
  }

  const startAnalyzing = () => {
    setPhase('analyzing')
    setTimeout(() => {
      const params: MatchParams = {
        goals,
        occupation,
        monthlyIncome: parseInt(quickProfile.monthlyIncome) || 30000,
        age: quickProfile.age,
        family: quickProfile.family,
      }
      const results = matchCountries(params)
      setMatchResults(results)
      setPhase('countryResults')
    }, 2500)
  }

  const selectCountryForDeepDive = (countryId: string) => {
    setSelectedCountry(countryId)
    if (countryId === 'australia') {
      setAuProfile(p => ({ ...p, thaiSalary: quickProfile.monthlyIncome }))
      setPhase('auProfile')
    }
  }

  const upAU = (field: keyof AuProfile, val: string) => setAuProfile(p => ({ ...p, [field]: val }))
  const allAuFilled = auProfile.english && auProfile.experience && auProfile.education && auProfile.thaiSalary

  const startSim = () => {
    if (allAuFilled) { setPhase('sim'); setSimStage(0) }
  }

  const commitSavings = (motherLord: boolean) => {
    if (motherLord) { setIsMotherLord(true); setInitialAUD(9999999) }
    else {
      const thb = parseInt(savingsInput) || 0
      setInitialAUD(Math.round(thb / AUD_TO_THB))
    }
    setSimStage(1)
  }

  const advanceStage = () => setSimStage(s => s + 1)
  const pick = (stageId: string, optionId: string) => { setChoices(prev => ({ ...prev, [stageId]: optionId })); setSimStage(s => s + 1) }

  const restart = () => {
    setPhase('welcome'); setQuizStep(0); setGoals([]); setOccupation('')
    setQuickProfile({ age: '', monthlyIncome: '', savings: '', family: 'single' })
    setMatchResults([]); setSelectedCountry(''); setExpandedCountry('')
    setAuProfile({ english: '', experience: '', education: '', thaiSalary: '', city: 'melbourne' })
    setSimStage(0); setSavingsInput(''); setIsMotherLord(false); setInitialAUD(0); setChoices({})
    setAiMessages([]); setAiChatHistory([]); setAiInput(''); setAiGathered({ goals: [], occupation: '', monthlyIncome: 0, age: '', family: '', ready: false })
    setAiAnalysis(''); setAiError(''); setOccDisplayLabel(''); setChipSelected([]); setShowOccSearch(false); setOccChatSearch(''); setAiMode(false); setGoalsConfirmed(false)
    // Re-start AI chat after reset
    setTimeout(() => {
      setAiMode(true)
      setPhase('aiChat')
      const greeting = 'สวัสดีอีกครั้ง! 👋 เล่าใหม่ได้เลยนะ ตอนนี้ทำอะไรอยู่ แล้วทำไมถึงอยากย้ายประเทศ? 🌍'
      setAiMessages([{ role: 'bot', text: greeting }])
      setAiChatHistory([{ role: 'system', content: AI_SYSTEM_PROMPT }, { role: 'assistant', content: JSON.stringify({ message: greeting, gathered: { goals: [], occupation: '', monthlyIncome: 0, age: '', family: '', ready: false } }) }])
    }, 100)
  }

  // ================================================================
  // ===== RENDER: WELCOME =====
  // ================================================================
  if (phase === 'welcome') {
    return (
      <div className="sim-container">
        <div className="sim-scroll flex flex-col items-center justify-center min-h-[450px]">
          <div className="text-center animate-fade-in">
            <div className="text-5xl mb-4">🐱</div>
            <div className="text-2xl font-bold text-gray-800 mb-2">คุณเหมาะจะย้ายไปประเทศไหน?</div>
            <div className="text-sm text-gray-500 mb-8">วิเคราะห์จาก 14 ประเทศ — เงินเดือน วีซ่า ค่าครองชีพ ข้อมูลจริง</div>

            <button onClick={startAiChat} className="btn-primary w-full justify-center rounded-xl py-4 text-base mb-3">
              🐱 เริ่มคุยกับ AI วิเคราะห์
            </button>

            <button onClick={() => setPhase('quiz')} className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium">
              📋 ใช้แบบกดเลือก (ไม่ใช้ AI)
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ================================================================
  // ===== RENDER: AI CHAT =====
  // ================================================================
  if (phase === 'aiChat') {
    const chipMode = getChipMode()
    const occResults = occChatSearch.length >= 1 ? searchOccupations(occChatSearch) : []
    return (
      <div className="sim-container">
        <div className="sim-scroll">
          {/* Chat messages */}
          {aiMessages.map((msg, i) => (
            msg.role === 'bot'
              ? <BotMsg key={i}>{msg.text}</BotMsg>
              : <UserMsg key={i}>{msg.text}</UserMsg>
          ))}

          {/* Loading indicator */}
          {aiLoading && (
            <div className="chat-bubble bot animate-fade-in">
              <span className="bot-avatar">🐱</span>
              <div className="bubble-content ai-typing">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}

          {/* ===== GOALS: multi-select chips (fallback if AI didn't detect) ===== */}
          {chipMode === 'goals' && (
            <div className="quick-replies animate-fade-in">
              <div className="chip-hint">🎯 เลือกสิ่งที่สำคัญกับคุณ 1-3 ข้อ (มีผลต่อการจัดอันดับประเทศ)</div>
              <div className="chip-grid">
                {Object.entries(GOAL_LABELS).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => toggleChip(id)}
                    className={`quick-chip ${chipSelected.includes(id) ? 'selected' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {chipSelected.length > 0 && (
                <button onClick={sendGoalChips} className="chip-confirm animate-fade-in">
                  ✅ ส่ง {chipSelected.length} ข้อ
                </button>
              )}
            </div>
          )}

          {/* ===== GOALS CONFIRM: after AI detected goals, ask "มีอื่นอีกไหม?" ===== */}
          {chipMode === 'goals-confirm' && (
            <div className="quick-replies animate-fade-in">
              <div className="chip-hint">เลือกเพิ่มได้ หรือกด &ldquo;ไปต่อ&rdquo; 👇</div>
              <div className="chip-grid">
                {Object.entries(GOAL_LABELS)
                  .filter(([id]) => !aiGathered.goals.includes(id))
                  .map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => toggleChip(id)}
                      className={`quick-chip ${chipSelected.includes(id) ? 'selected' : ''}`}
                    >
                      {label}
                    </button>
                  ))}
              </div>
              {chipSelected.length > 0 && (
                <button onClick={() => {
                  const text = chipSelected.map(id => GOAL_LABELS[id] || id).join(', ')
                  // Directly add selected goals
                  setAiGathered(prev => ({ ...prev, goals: [...new Set([...prev.goals, ...chipSelected])] }))
                  sendMessage(`เพิ่มเหตุผลอีก: ${text}`)
                  setGoalsConfirmed(true)
                }} className="chip-confirm animate-fade-in">
                  ✅ เพิ่ม {chipSelected.length} ข้อ แล้วไปต่อ
                </button>
              )}
              <button onClick={() => {
                setGoalsConfirmed(true)
                sendMessage('ไม่มีเหตุผลอื่นแล้ว ไปต่อเลย')
              }} className="chip-confirm" style={{ background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)', color: '#374151', marginTop: '4px' }}>
                👉 ไม่มีแล้ว ไปต่อเลย
              </button>
            </div>
          )}

          {/* ===== OCCUPATION: searchable dropdown ===== */}
          {chipMode === 'occ-search' && (
            <div className="quick-replies animate-fade-in">
              <div className="chip-hint">🔍 พิมพ์อาชีพ หรือเลือกจากรายการ</div>
              <div className="occ-chat-search">
                <input
                  type="text"
                  value={occChatSearch}
                  onChange={e => { setOccChatSearch(e.target.value); setShowOccSearch(true) }}
                  onFocus={() => setShowOccSearch(true)}
                  placeholder="เช่น nurse, developer, ครู, เชฟ..."
                  className="occ-chat-input"
                />
                {showOccSearch && occChatSearch.length >= 1 && (
                  <div className="occ-chat-results">
                    {occResults.map(r => (
                      <button
                        key={r.key}
                        onClick={() => pickOccFromSearch(r.title, r.occId)}
                        className="occ-chat-item"
                      >
                        <span className="occ-chat-title">{r.title}</span>
                        <span className="occ-chat-cat">{r.category}</span>
                      </button>
                    ))}
                    {occResults.length === 0 && (
                      <div className="occ-chat-empty">
                        ไม่เจอ — <button onClick={() => sendMessage(occChatSearch)} className="occ-chat-fallback">ใช้ &ldquo;{occChatSearch}&rdquo; เลย</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Quick picks below search */}
              <div className="chip-grid" style={{ marginTop: '8px' }}>
                {OCC_CHIP_MAP.map(c => (
                  <button key={c.occId} onClick={() => sendOccChip(c.text, c.occId)} className="quick-chip small">
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== AGE: single-tap chips ===== */}
          {chipMode === 'age' && (
            <div className="quick-replies animate-fade-in">
              <div className="chip-hint">กดเลือกเลย ✍️</div>
              <div className="chip-grid">
                {['18-24 ปี', '25-32 ปี', '33-39 ปี', '40-44 ปี', '45+ ปี'].map(label => (
                  <button key={label} onClick={() => sendMessage(label)} className="quick-chip">{label}</button>
                ))}
              </div>
            </div>
          )}

          {/* ===== FAMILY: single-tap chips ===== */}
          {chipMode === 'family' && (
            <div className="quick-replies animate-fade-in">
              <div className="chip-hint">กดเลือกเลย ✍️</div>
              <div className="chip-grid">
                {[
                  { label: '🧑 คนเดียว' },
                  { label: '👫 กับคนรัก' },
                  { label: '👨‍👩‍👧 ครอบครัว' },
                ].map(c => (
                  <button key={c.label} onClick={() => sendMessage(c.label)} className="quick-chip">{c.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* ===== INCOME: single-tap chips ===== */}
          {chipMode === 'income' && (
            <div className="quick-replies animate-fade-in">
              <div className="chip-hint">เลือกช่วงเงินเดือน หรือพิมพ์ตัวเลข ✍️</div>
              <div className="chip-grid">
                {['15,000 บาท', '25,000 บาท', '35,000 บาท', '50,000 บาท', '80,000 บาท', '100,000 บาท', '150,000 บาท', '200,000+ บาท'].map(label => (
                  <button key={label} onClick={() => sendMessage(label)} className="quick-chip">{label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Gathered info badges */}
          {(aiGathered.goals.length > 0 || aiGathered.occupation) && !aiGathered.ready && (
            <div className="ai-gathered animate-fade-in">
              {aiGathered.goals.length > 0 && <span className="ai-badge">🎯 {aiGathered.goals.map(g => GOAL_LABELS[g] || g).join(', ')}</span>}
              {aiGathered.occupation && <span className="ai-badge">💼 {aiGathered.occupation}</span>}
              {aiGathered.monthlyIncome > 0 && <span className="ai-badge">💰 {aiGathered.monthlyIncome.toLocaleString()}฿</span>}
              {aiGathered.age && <span className="ai-badge">📅 {aiGathered.age}</span>}
              {aiGathered.family && <span className="ai-badge">👥 {aiGathered.family}</span>}
            </div>
          )}

          {/* Error */}
          {aiError && (
            <div className="ai-error animate-fade-in">
              ⚠️ {aiError}
              <button onClick={() => setAiError('')} className="text-xs text-blue-600 underline ml-2">ลองใหม่</button>
            </div>
          )}

          {/* Ready — show choice buttons */}
          {aiGathered.ready && (
            <div className="ai-done-card animate-fade-in">
              <div className="text-center mb-4">
                <div className="text-3xl mb-1">✨</div>
                <div className="text-lg font-bold text-gray-800">Catto เข้าใจคุณแล้ว! 🐱</div>
                <div className="text-xs text-gray-500 mt-1">เลือกว่าจะดูอะไรต่อ</div>
              </div>
              <button onClick={goToCountryAnalysis} className="btn-primary w-full justify-center rounded-xl py-3 text-sm mb-2">
                📊 วิเคราะห์เทียบ 14 ประเทศ
              </button>
              <button onClick={goToAuSim} className="w-full py-3 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium">
                🇦🇺 จำลองชีวิตที่ออสเลย!
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        {!aiGathered.ready && (
          <div className="ai-input-bar">
            <input
              type="text"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAiMessage()}
              placeholder="พิมพ์ข้อความ..."
              className="ai-text-input"
              disabled={aiLoading}
              autoFocus
            />
            <button onClick={sendAiMessage} disabled={aiLoading || !aiInput.trim()} className="ai-send-btn">
              ➤
            </button>
          </div>
        )}
      </div>
    )
  }

  // ================================================================
  // ===== RENDER: QUIZ =====
  // ================================================================
  if (phase === 'quiz') {
    return (
      <div className="sim-container">
        <div className="sim-scroll">
          {/* Quiz Progress */}
          <div className="quiz-progress">
            {['สำคัญอะไร', 'อาชีพ', 'ข้อมูล'].map((label, i) => (
              <div key={i} className={`quiz-step-dot ${i < quizStep ? 'done' : i === quizStep ? 'current' : ''}`}>
                <span className="quiz-step-num">{i + 1}</span>
                <span className="quiz-step-label">{label}</span>
              </div>
            ))}
          </div>

          {/* ===== STEP 0: GOALS ===== */}
          <BotMsg>
            ว่าไง! 👋 กำลังคิดจะย้ายประเทศเหรอ?<br />
            <strong>อะไรสำคัญที่สุด?</strong> เลือก 1-3 ข้อ
          </BotMsg>

          {quizStep === 0 && (
            <div className="animate-fade-in">
              <div className="options-grid">
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => toggleGoal(g.id)}
                    className={`chat-option-btn ${goals.includes(g.id) ? 'selected' : ''}`}>
                    {g.label}
                  </button>
                ))}
              </div>
              {goals.length >= 1 && (
                <button onClick={confirmGoals} className="btn-primary w-full mt-3 justify-center rounded-xl py-3 text-sm">
                  ✅ เลือกแล้ว! ({goals.length} ข้อ)
                </button>
              )}
            </div>
          )}

          {/* User chose goals */}
          {quizStep >= 1 && (
            <>
              <UserMsg>{goals.map(g => GOALS.find(x => x.id === g)?.emoji).join(' ')}</UserMsg>
              <BotMsg>
                {GOALS.find(x => x.id === goals[0])?.response || 'เข้าใจเลย!'}<br /><br />
                แล้วตอนนี้ <strong>ทำงานสายอะไร?</strong> 💼 อาชีพสำคัญเพราะแต่ละประเทศขาดแคลนไม่เหมือนกัน
              </BotMsg>
            </>
          )}

          {/* ===== STEP 1: OCCUPATION ===== */}
          {quizStep === 1 && (
            <div className="animate-fade-in">
              {!occSearchMode ? (
                <div className="options-grid">
                  {OCCUPATIONS.filter(o => o.id !== 'other').map(o => (
                    <button key={o.id} onClick={() => pickOccupation(o.id)} className="chat-option-btn">
                      {o.label}
                    </button>
                  ))}
                  <button onClick={() => setOccSearchMode(true)} className="chat-option-btn occ-search-trigger">
                    🔍 ค้นหาอาชีพอื่น
                  </button>
                </div>
              ) : (
                <div className="occ-search-box">
                  <input
                    type="text"
                    value={occSearchQuery}
                    onChange={e => setOccSearchQuery(e.target.value)}
                    placeholder="พิมพ์ชื่ออาชีพ เช่น nurse, engineer, chef..."
                    className="occ-search-input"
                    autoFocus
                  />
                  {occSearchQuery.length >= 1 && (
                    <div className="occ-search-results">
                      {searchOccupations(occSearchQuery).map(r => (
                        <button
                          key={r.key}
                          onClick={() => pickOccupation(r.occId, r.title)}
                          className="occ-search-item"
                        >
                          <span className="occ-search-title">{r.title}</span>
                          <span className="occ-search-cat">{r.category}</span>
                        </button>
                      ))}
                      {searchOccupations(occSearchQuery).length === 0 && (
                        <div className="occ-search-empty">
                          ไม่เจอ — <button onClick={() => pickOccupation('other', occSearchQuery)} className="occ-search-fallback">ใช้ &ldquo;{occSearchQuery}&rdquo; เลย</button>
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={() => { setOccSearchMode(false); setOccSearchQuery('') }} className="text-xs text-gray-500 mt-2 hover:text-gray-700">
                    ← กลับเลือกกลุ่มหลัก
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User chose occupation */}
          {quizStep >= 2 && (
            <>
              <UserMsg>{occDisplayLabel || OCCUPATIONS.find(o => o.id === occupation)?.label || occupation}</UserMsg>
              <BotMsg>
                เยี่ยม! 🎯 กรอกข้อมูลคร่าวๆ เดี๋ยวเอาไปวิเคราะห์ให้<br />
                <span className="text-xs text-gray-500">ข้อมูลไม่ได้เก็บไว้ คำนวณในเครื่องคุณเท่านั้น 🔒</span>
              </BotMsg>
            </>
          )}

          {/* ===== STEP 2: QUICK PROFILE (and auto-analyze) ===== */}
          {quizStep === 2 && (
            <div className="stage-card animate-fade-in">
              <div className="stage-body space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">📅 อายุ</label>
                    <select className="form-select" value={quickProfile.age} onChange={e => upQ('age', e.target.value)}>
                      <option value="">— เลือก —</option>
                      <option value="18-24">18-24 ปี</option>
                      <option value="25-32">25-32 ปี ⭐</option>
                      <option value="33-39">33-39 ปี</option>
                      <option value="40-44">40-44 ปี</option>
                      <option value="45+">45+ ปี</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">👥 ไปกับใคร</label>
                    <select className="form-select" value={quickProfile.family} onChange={e => upQ('family', e.target.value)}>
                      <option value="single">🧑 คนเดียว</option>
                      <option value="couple">👫 กับคนรัก</option>
                      <option value="family">👨‍👩‍👧 ครอบครัว</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">💵 เงินเดือนตอนนี้ (บาท/เดือน)</label>
                  <input type="number" className="form-input" placeholder="เช่น 45000"
                    value={quickProfile.monthlyIncome} onChange={e => upQ('monthlyIncome', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">🏦 เงินเก็บประมาณ</label>
                  <select className="form-select" value={quickProfile.savings} onChange={e => upQ('savings', e.target.value)}>
                    <option value="">— เลือก —</option>
                    <option value="under100k">ต่ำกว่า 100,000 บาท</option>
                    <option value="100k-300k">100,000 - 300,000 บาท</option>
                    <option value="300k-500k">300,000 - 500,000 บาท</option>
                    <option value="500k-1m">500,000 - 1,000,000 บาท</option>
                    <option value="over1m">มากกว่า 1,000,000 บาท</option>
                  </select>
                </div>
                {quickProfile.age && quickProfile.monthlyIncome && (
                  <button onClick={confirmProfile} className="btn-primary w-full mt-2 justify-center rounded-xl py-3 text-sm animate-fade-in">
                    🔍 วิเคราะห์เลย!
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    )
  }

  // ================================================================
  // ===== RENDER: ANALYZING =====
  // ================================================================
  if (phase === 'analyzing') {
    return (
      <div className="sim-container">
        <div className="sim-scroll flex flex-col items-center justify-center min-h-[400px]">
          <div className="analyzing-screen animate-fade-in text-center">
            <div className="text-5xl mb-4 analyzing-globe">🌍</div>
            <div className="text-xl font-bold text-gray-800 mb-2">{aiMode ? '🐱 Catto กำลังวิเคราะห์ให้คุณ...' : `กำลังวิเคราะห์ ${COUNTRIES.length} ประเทศ...`}</div>
            <div className="text-sm text-gray-500 mb-4">
              {aiMode
                ? `วิเคราะห์ข้อมูลของคุณเทียบ ${COUNTRIES.length} ประเทศ — เงินเดือน วีซ่า ค่าครองชีพจริง`
                : `เทียบ ${goals.length} goals × อาชีพ ${occDisplayLabel || OCCUPATIONS.find(o => o.id === occupation)?.labelTH} × ${COUNTRIES.length} ประเทศ`
              }
            </div>
            <div className="analyzing-bar">
              <div className="analyzing-bar-fill" />
            </div>
            <div className="text-xs text-gray-400 mt-3">ข้อมูลอ้างอิง: OECD, Numbeo, Global Peace Index 2025</div>
          </div>
        </div>
      </div>
    )
  }

  // ================================================================
  // ===== RENDER: COUNTRY RESULTS =====
  // ================================================================
  if (phase === 'countryResults') {
    return (
      <div className="sim-container">
        <div className="sim-scroll">
          <div className="text-center mb-4 animate-fade-in">
            <div className="text-3xl font-bold text-gray-800 mb-1">🌍 ผลวิเคราะห์ของคุณ!</div>
            <div className="text-sm text-gray-500">{aiMode ? '🐱 Catto วิเคราะห์จาก' : 'จาก'} {COUNTRIES.length} ประเทศ — นี่คือ Top 5 ที่เหมาะกับคุณ</div>
          </div>

          <div className="space-y-3">
            {matchResults.map((result, idx) => {
              const isAU = result.country.id === 'australia'
              const isExpanded = expandedCountry === result.country.id
              return (
                <div key={result.country.id}
                  className={`country-card animate-fade-in ${isAU ? 'country-card-au' : ''}`}
                  style={{ animationDelay: `${idx * 0.1}s` }}>

                  {/* Header */}
                  <div className="country-card-header" onClick={() => setExpandedCountry(isExpanded ? '' : result.country.id)}>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{result.country.flag}</div>
                      <div>
                        <div className="font-bold text-gray-800">{result.country.nameTH}</div>
                        <div className="text-xs text-gray-500">{result.country.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${result.matchPct >= 75 ? 'text-green-600' : result.matchPct >= 55 ? 'text-blue-600' : 'text-orange-500'}`}>
                        {result.matchPct}%
                      </div>
                      <div className="text-xs text-gray-400">match</div>
                    </div>
                  </div>

                  {/* Match bar */}
                  <div className="match-bar-bg">
                    <div className="match-bar-fill" style={{
                      width: `${result.matchPct}%`,
                      background: result.matchPct >= 75 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : result.matchPct >= 55 ? 'linear-gradient(90deg, #3b82f6, #2563eb)' : 'linear-gradient(90deg, #f97316, #ea580c)',
                    }} />
                  </div>

                  {/* Highlights */}
                  <div className="country-highlights">
                    {result.highlights.map((h, i) => (
                      <div key={i} className="text-sm">{h}</div>
                    ))}
                  </div>

                  {/* Salary summary (always visible) */}
                  {(() => {
                    const userOcc = aiMode ? aiGathered.occupation : occupation
                    const salary = getOccSalary(result.country.id, userOcc)
                    const cur = result.country.currency || 'USD'
                    const sym = CURRENCY_SYMBOLS[cur] || cur
                    const thbRate = CURRENCY_TO_THB[cur] || 1
                    if (salary) {
                      const thbMonthly = Math.round(salary.mid * thbRate / 12)
                      return <div className="text-xs px-4 pb-1 text-gray-500">💰 {sym}{salary.mid.toLocaleString()}/ปี (~{thbMonthly.toLocaleString()} บาท/เดือน)</div>
                    }
                    const localSalary = Math.round(result.country.avgSalaryUSD * 34.5 / thbRate)
                    const thbMonthly = Math.round(localSalary * thbRate / 12)
                    return <div className="text-xs px-4 pb-1 text-gray-500">💰 ~{sym}{localSalary.toLocaleString()}/ปี (~{thbMonthly.toLocaleString()} บาท/เดือน)</div>
                  })()}

                  {/* Occupation note */}
                  {result.occupationNote && (
                    <div className="text-xs px-4 pb-2 text-blue-700 font-medium">{result.occupationNote}</div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="country-expanded animate-fade-in">
                      {/* Score breakdown */}
                      <div className="text-xs font-semibold text-gray-600 mb-1">📊 คะแนนแต่ละด้าน (1-10):</div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mb-2 text-[11px]">
                        {([
                          ['jobMarket', '💼 ตลาดงาน'],
                          ['workLifeBalance', '⚖️ Work-life'],
                          ['safety', '🛡️ ปลอดภัย'],
                          ['healthcare', '🏥 สาธารณสุข'],
                          ['education', '🎓 การศึกษา'],
                          ['politicalStability', '🏛️ การเมือง'],
                          ['costOfLiving', '💰 ค่าครองชีพ'],
                          ['taxFriendliness', '🧾 ภาษี'],
                          ['climate', '☀️ อากาศ'],
                          ['immigrationEase', '✈️ ย้ายง่าย'],
                        ] as const).map(([key, label]) => {
                          const val = result.country.scores[key as keyof typeof result.country.scores]
                          const barColor = val >= 8 ? 'bg-green-400' : val >= 6 ? 'bg-blue-400' : val >= 4 ? 'bg-yellow-400' : 'bg-red-400'
                          return (
                            <div key={key} className="flex items-center gap-1">
                              <span className="w-20 text-gray-500 truncate">{label}</span>
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full ${barColor} rounded-full`} style={{ width: `${val * 10}%` }} />
                              </div>
                              <span className="w-4 text-right text-gray-400">{val}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="text-[10px] text-gray-400 mb-2">📚 คะแนนจาก: OECD Better Life Index, Numbeo, Global Peace Index, UNDP HDR, Fragile States Index 2024-25</div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">วีซ่าที่เป็นไปได้:</div>
                      <div className="text-xs text-gray-500 mb-2">{result.country.visaPaths.join(' • ')}</div>
                      <div className="text-xs font-semibold text-gray-600 mb-1">ข้อดี:</div>
                      {result.country.pros.map((p, i) => <div key={i} className="text-xs text-green-700">✅ {p}</div>)}
                      <div className="text-xs font-semibold text-gray-600 mt-2 mb-1">ข้อควรรู้:</div>
                      {result.country.cons.map((c, i) => <div key={i} className="text-xs text-orange-600">⚠️ {c}</div>)}
                      {(() => {
                        const userOcc = aiMode ? aiGathered.occupation : occupation
                        const salary = getOccSalary(result.country.id, userOcc)
                        const occLabel = OCCUPATIONS.find(o => o.id === userOcc)?.labelTH || userOcc
                        const cur = result.country.currency || 'USD'
                        const sym = CURRENCY_SYMBOLS[cur] || cur
                        const thbRate = CURRENCY_TO_THB[cur] || 1
                        if (salary) {
                          const midMonthlyTHB = Math.round(salary.mid * thbRate / 12)
                          return (
                            <div className="text-xs mt-2 space-y-1">
                              <div className="text-blue-600 font-medium">💼 เงินเดือน {occLabel} ({sym}/ปี):</div>
                              <div className="text-gray-600">🟢 Entry: {sym}{salary.entry.toLocaleString()} → Mid: {sym}{salary.mid.toLocaleString()} → Senior: {sym}{salary.senior.toLocaleString()}</div>
                              <div className="text-gray-500">≈ Mid ~{midMonthlyTHB.toLocaleString()} บาท/เดือน</div>
                              <div className="text-gray-400">ค่าครองชีพ {result.country.costIndex}% ของไทย | คนไทย: {result.country.thaiCommunity === 'large' ? 'เยอะ' : result.country.thaiCommunity === 'medium' ? 'พอมี' : 'น้อย'}</div>
                            </div>
                          )
                        }
                        const localSalary = Math.round(result.country.avgSalaryUSD * 34.5 / thbRate)
                        const thbMonthly = Math.round(localSalary * thbRate / 12)
                        return <div className="text-xs text-gray-400 mt-2">💰 เงินเดือนเฉลี่ย ~{sym}{localSalary.toLocaleString()}/ปี (~{thbMonthly.toLocaleString()} บาท/เดือน) | ค่าครองชีพ {result.country.costIndex}% ของไทย | คนไทย: {result.country.thaiCommunity === 'large' ? 'เยอะ' : result.country.thaiCommunity === 'medium' ? 'พอมี' : 'น้อย'}</div>
                      })()}
                    </div>
                  )}

                  {/* CTA for AU */}
                  {isAU && (
                    <div className="px-4 pb-4">
                      <button onClick={() => selectCountryForDeepDive('australia')} className="btn-primary w-full justify-center rounded-xl py-3 text-base">
                        🎮 จำลองชีวิตจริงที่ออส! (มีข้อมูลละเอียด)
                      </button>
                    </div>
                  )}

                  {/* Expand/collapse hint */}
                  {!isAU && (
                    <div className="text-center pb-3">
                      <button onClick={() => setExpandedCountry(isExpanded ? '' : result.country.id)} className="text-xs text-blue-500 hover:text-blue-700">
                        {isExpanded ? '▲ ย่อ' : '▼ ดูรายละเอียด'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Note about AU if not in top 5 */}
          {!matchResults.some(r => r.country.id === 'australia') && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center animate-fade-in">
              <div className="text-sm text-blue-800">
                ออสเตรเลียไม่ได้อยู่ใน Top 5 ของคุณ แต่เรามีข้อมูลละเอียดของออส<br />
                <button onClick={() => selectCountryForDeepDive('australia')} className="text-blue-600 font-semibold underline mt-1 hover:text-blue-800">
                  ลองดูข้อมูลออสอยู่ดีไหม?
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {aiMode && aiAnalysis && (
            <div className="ai-analysis-card animate-fade-in mt-4">
              <div className="text-sm font-bold text-gray-800 mb-2">🐱 Catto วิเคราะห์ให้คุณ</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiAnalysis}</div>
            </div>
          )}

          {/* Data Sources & Disclaimer */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="text-xs text-blue-700 font-medium mb-1">📊 แหล่งข้อมูลที่ใช้วิเคราะห์:</div>
            <div className="text-xs text-blue-600 space-y-0.5">
              <div>• OECD Better Life Index 2024 — คุณภาพชีวิต ความปลอดภัย</div>
              <div>• Numbeo Cost of Living Index 2025 — ค่าครองชีพ เปรียบเทียบเมือง</div>
              <div>• Global Peace Index 2024 — ความปลอดภัย</div>
              <div>• UNDP Human Development Report 2024 — ดัชนีพัฒนามนุษย์</div>
              <div>• IMF World Economic Outlook 2025 — GDP, เศรษฐกิจ</div>
            </div>
          </div>
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="text-xs text-amber-700">
              ⚠️ <strong>ข้อจำกัดความรับผิดชอบ:</strong> ข้อมูลเป็นการประมาณจากแหล่งข้อมูลที่น่าเชื่อถือ
              ไม่ใช่คำแนะนำอย่างเป็นทางการ ผลจริงขึ้นกับสถานการณ์ส่วนตัว
              กรุณาตรวจสอบจากเว็บไซต์ทางการของแต่ละประเทศก่อนตัดสินใจ
            </div>
          </div>

          {/* Links to other tabs */}
          <div className="flex flex-col sm:flex-row gap-2 mt-3 mb-1">
            <a href={`${basePath}/sim`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-center text-sm text-green-700 font-medium hover:shadow-md transition-all">
              🇦🇺 จำลองชีวิตในออส →
            </a>
            <a href={`${basePath}/visa`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 text-center text-sm text-orange-700 font-medium hover:shadow-md transition-all">
              📋 ดูวีซ่า & เส้นทาง →
            </a>
          </div>

          <button onClick={restart} className="w-full mt-2 mb-2 py-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium">
            🔄 ลองใหม่ เปลี่ยนคำตอบ
          </button>

          <div className="mb-4">
            <ShareButtons />
          </div>

          <div ref={bottomRef} />
        </div>
      </div>
    )
  }

  // ================================================================
  // ===== RENDER: AU PROFILE =====
  // ================================================================
  if (phase === 'auProfile') {
    return (
      <div className="sim-container">
        <div className="sim-scroll">
          <div className="text-center mb-4 animate-fade-in">
            <div className="text-4xl mb-2">🇦🇺</div>
            <div className="text-xl font-bold text-gray-800">มาจำลองชีวิตที่ออสกัน!</div>
            <div className="text-sm text-gray-500 mt-1">กรอกข้อมูลเพิ่มสำหรับคำนวณ visa + ค่าครองชีพจริง</div>
          </div>

          <div className="stage-card animate-fade-in">
            <div className="stage-body space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">🗣️ IELTS/PTE</label>
                  <select className="form-select" value={auProfile.english} onChange={e => upAU('english', e.target.value)}>
                    <option value="">— เลือก —</option>
                    <option value="superior">8.0+ Superior</option>
                    <option value="proficient">7.0 Proficient</option>
                    <option value="competent">6.0 Competent</option>
                    <option value="low">ต่ำกว่า 6</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">💪 ประสบการณ์</label>
                  <select className="form-select" value={auProfile.experience} onChange={e => upAU('experience', e.target.value)}>
                    <option value="">— เลือก —</option>
                    <option value="0-2">0-2 ปี</option>
                    <option value="3-4">3-4 ปี</option>
                    <option value="5-7">5-7 ปี</option>
                    <option value="8+">8+ ปี</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">🎓 การศึกษา</label>
                  <select className="form-select" value={auProfile.education} onChange={e => upAU('education', e.target.value)}>
                    <option value="">— เลือก —</option>
                    <option value="phd">ปริญญาเอก</option>
                    <option value="masters">ปริญญาโท</option>
                    <option value="bachelor">ปริญญาตรี</option>
                    <option value="diploma">ปวส./Diploma</option>
                    <option value="highschool">ม.6 หรือต่ำกว่า</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">🏙️ เมือง</label>
                  <select className="form-select" value={auProfile.city} onChange={e => upAU('city', e.target.value)}>
                    <option value="sydney">🏙️ Sydney</option>
                    <option value="melbourne">🎭 Melbourne</option>
                    <option value="brisbane">☀️ Brisbane</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">💵 เงินเดือนไทยตอนนี้ (บาท/เดือน)</label>
                <input type="number" className="form-input" placeholder="เช่น 45000"
                  value={auProfile.thaiSalary} onChange={e => upAU('thaiSalary', e.target.value)} />
              </div>

              {allAuFilled && (
                <button onClick={startSim} className="btn-primary w-full mt-2 justify-center rounded-xl py-4 text-lg animate-fade-in">
                  🎮 เริ่มจำลองชีวิตกันเลย!
                </button>
              )}
            </div>
          </div>

          <button onClick={() => setPhase('countryResults')} className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700">
            ← กลับดูประเทศอื่น
          </button>

          <div ref={bottomRef} />
        </div>
      </div>
    )
  }

  // ================================================================
  // ===== RENDER: SIMULATION (GAME STAGES) =====
  // ================================================================
  const allDone = simStage >= TOTAL_STAGES

  return (
    <div className="sim-container">
      {/* Balance bar */}
      <div className={`balance-bar ${isMotherLord ? 'motherlord' : balanceAUD < 0 ? 'negative' : ''}`}>
        {isMotherLord ? (
          <span>🏦 <strong>MOTHERLORD MODE</strong> 💰 ∞</span>
        ) : (
          <span>🏦 เงินคงเหลือ: <strong>{fmtAud(balanceAUD)}</strong> <span className="bal-thb">({fmtThb(Math.round(balanceAUD * AUD_TO_THB))})</span></span>
        )}
      </div>

      <div className="sim-scroll sim-scroll-with-bar">
        {/* Progress */}
        <div className="stage-progress">
          {STAGE_META.map((_, i) => (
            <div key={i} className={`stage-dot ${i < simStage ? 'done' : i === simStage ? 'current' : ''}`} />
          ))}
        </div>

        {/* ===== COMPLETED STAGES ===== */}
        {simStage >= 1 && <Completed emoji="💰" title="เตรียมกระสุน" detail={isMotherLord ? 'MOTHERLORD ∞' : `${fmtThb(parseInt(savingsInput) || 0)} = ${fmtAud(initialAUD)}`} />}
        {simStage >= 2 && <Completed emoji="📋" title="ค่าก่อนบิน" detail={`-${fmtAud(preDepartureTotal)}`} negative />}
        {simStage > 2 && choices['job'] && <Completed emoji="💼" title="ได้งาน" detail={`${fmtAud(grossAnnual)}/ปี (${choices['job'] === 'top' ? '👑 Top' : choices['job'] === 'min' ? 'ขั้นต่ำ' : 'Average'})`} />}
        {simStage > 3 && choices['flight'] && <Completed emoji="✈️" title="ตั๋วเครื่องบิน" detail={choices['flight'] === 'company' ? 'ฟรี! บ.ออกให้' : `-${fmtAud(flightCost)}`} negative={choices['flight'] !== 'company'} />}
        {simStage > 4 && choices['temp'] && <Completed emoji="🏨" title="พักชั่วคราว" detail={choices['temp'] === 'friend' ? 'ฟรี!' : `-${fmtAud(tempCost)}`} negative={choices['temp'] !== 'friend'} />}
        {simStage > 5 && choices['housing'] && <Completed emoji="🏠" title="บ้าน" detail={`มัดจำ -${fmtAud(bond)} + ${fmtAud(monthlyRent)}/เดือน`} negative />}
        {simStage > 6 && choices['furnish'] && <Completed emoji="🛋️" title="ของเข้าบ้าน" detail={furnishCost === 0 ? 'Furnished! $0' : `-${fmtAud(furnishCost)}`} negative={furnishCost > 0} />}
        {simStage > 7 && choices['commute'] && <Completed emoji="🚗" title="เดินทาง" detail={`${fmtAud(monthlyTransport)}/เดือน`} />}
        {simStage > 8 && choices['food'] && <Completed emoji="🍳" title="อาหาร" detail={`${fmtAud(monthlyFood)}/เดือน`} />}
        {simStage > 9 && choices['insurance'] && <Completed emoji="🏥" title="ประกัน" detail={monthlyInsurance > 0 ? '$150/เดือน' : 'ฟรี!'} />}

        {/* ===== CURRENT STAGE ===== */}
        {!allDone && phase === 'sim' && (
          <div className="stage-card animate-fade-in">
            <div className="stage-header">
              <div className="text-lg font-bold text-gray-800">{STAGE_META[simStage].title}</div>
              <div className="text-sm text-gray-500">{STAGE_META[simStage].sub}</div>
            </div>
            <div className="stage-body">
              {simStage === 0 && (
                <div className="space-y-3">
                  <div>
                    <label className="form-label">กรอกเงินเก็บ (บาท)</label>
                    <input type="number" className="form-input" placeholder="เช่น 500000"
                      value={savingsInput} onChange={e => setSavingsInput(e.target.value)} />
                    {savingsInput && <div className="text-xs text-gray-500 mt-1">= {fmtAud(Math.round((parseInt(savingsInput) || 0) / AUD_TO_THB))} AUD</div>}
                  </div>
                  {savingsInput && <button onClick={() => commitSavings(false)} className="stage-option-btn">✅ มีเงินเก็บ {fmtThb(parseInt(savingsInput))} — ไปเลย!</button>}
                  <button onClick={() => commitSavings(true)} className="stage-option-btn motherlord-btn">🤑 9,999,999 MOTHERLORD — เงินไม่จำกัด!</button>
                </div>
              )}
              {simStage === 1 && (
                <div>
                  <div className="text-sm text-gray-600 mb-3">ก่อนไปต้องจ่ายทั้งหมดนี้:</div>
                  {preDepartureCosts.map((c, i) => (
                    <div key={i} className="flex justify-between py-1.5 text-sm border-b border-gray-100">
                      <span>{c.label}</span>
                      <span className="font-mono text-red-500">-{fmtAud(c.aud)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-bold border-t-2 border-gray-200 mt-2">
                    <span>รวม</span><span className="text-red-600">-{fmtAud(preDepartureTotal)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 mb-3">≈ {fmtThb(Math.round(preDepartureTotal * AUD_TO_THB))}</div>
                  <button onClick={advanceStage} className="stage-option-btn">💳 จ่ายเลย! ไม่มีทางถอยแล้ว 🔥</button>
                </div>
              )}
              {simStage === 2 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('job', 'avg')}><div className="font-semibold">💼 ได้งาน {salaryData.label} — Average</div><div className="text-sm text-gray-500">{fmtAud(salaryData.mid)}/ปี ≈ {fmtThb(Math.round(salaryData.mid / 12 * AUD_TO_THB))}/เดือน</div></Opt>
                  <Opt onClick={() => pick('job', 'top')}><div className="font-semibold">👑 ฉันเทพ! Top Salary</div><div className="text-sm text-gray-500">{fmtAud(salaryData.senior)}/ปี</div></Opt>
                  <Opt onClick={() => pick('job', 'min')}><div className="font-semibold">😅 ทำอะไรก็ได้ Minimum wage</div><div className="text-sm text-gray-500">{fmtAud(AU_UNSKILLED_SALARY)}/ปี</div></Opt>
                </div>
              )}
              {simStage === 3 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('flight', 'business')}><div className="font-semibold">✈️ Business Class</div><div className="text-sm text-red-500">-{fmtAud(quickProfile.family === 'single' ? 4500 : quickProfile.family === 'couple' ? 9000 : 13500)} <span className="text-gray-400">({fmtThb(Math.round((quickProfile.family === 'single' ? 4500 : quickProfile.family === 'couple' ? 9000 : 13500) * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('flight', 'economy')}><div className="font-semibold">🪑 Economy</div><div className="text-sm text-red-500">-{fmtAud(quickProfile.family === 'single' ? 1100 : quickProfile.family === 'couple' ? 2200 : 3500)} <span className="text-gray-400">({fmtThb(Math.round((quickProfile.family === 'single' ? 1100 : quickProfile.family === 'couple' ? 2200 : 3500) * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('flight', 'company')}><div className="font-semibold">🏢 บริษัทออกให้!</div><div className="text-sm text-green-600">ฟรี! $0</div></Opt>
                </div>
              )}
              {simStage === 4 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-1">ถึง {city.name} แล้ว!</div>
                  <Opt onClick={() => pick('temp', 'airbnb')}><div className="font-semibold">🏨 Airbnb</div><div className="text-sm text-red-500">-$2,100 (14 คืน) <span className="text-gray-400">({fmtThb(Math.round(2100 * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('temp', 'hostel')}><div className="font-semibold">🛏️ Hostel</div><div className="text-sm text-red-500">-$700 (14 คืน) <span className="text-gray-400">({fmtThb(Math.round(700 * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('temp', 'friend')}><div className="font-semibold">🏠 อาศัยเพื่อน/ญาติ</div><div className="text-sm text-green-600">ฟรี!</div></Opt>
                </div>
              )}
              {simStage === 5 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-1">ค่าเช่า {city.name}:</div>
                  <Opt onClick={() => pick('housing', 'share')}><div className="font-semibold">🏠 แชร์บ้าน</div><div className="text-sm text-gray-500">{fmtAud(city.rentShare)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(city.rentShare * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('housing', '1bed')}><div className="font-semibold">🏢 1 ห้องนอน</div><div className="text-sm text-gray-500">{fmtAud(city.rent1br)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(city.rent1br * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('housing', '2bed')}><div className="font-semibold">🏢 2 ห้องนอน</div><div className="text-sm text-gray-500">{fmtAud(quickProfile.family === 'family' ? city.rentFamily : city.rent2br)}/เดือน <span className="text-gray-400">({fmtThb(Math.round((quickProfile.family === 'family' ? city.rentFamily : city.rent2br) * AUD_TO_THB))})</span></div></Opt>
                </div>
              )}
              {simStage === 6 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('furnish', 'ikea')}><div className="font-semibold">🪑 IKEA ชุดเริ่มต้น</div><div className="text-sm text-red-500">-$2,000 <span className="text-gray-400">({fmtThb(Math.round(2000 * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('furnish', 'nice')}><div className="font-semibold">✨ จัดเต็ม</div><div className="text-sm text-red-500">-$4,000 <span className="text-gray-400">({fmtThb(Math.round(4000 * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('furnish', 'second')}><div className="font-semibold">♻️ มือสอง</div><div className="text-sm text-red-500">-$800 <span className="text-gray-400">({fmtThb(Math.round(800 * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('furnish', 'furnished')}><div className="font-semibold">🏢 Furnished ไม่ต้องซื้อ!</div><div className="text-sm text-green-600">$0</div></Opt>
                </div>
              )}
              {simStage === 7 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('commute', 'car')}><div className="font-semibold">🚗 ขับรถเอง</div><div className="text-sm text-gray-500">{fmtAud(TRANSPORT_COSTS['car'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(TRANSPORT_COSTS['car'].cost * AUD_TO_THB))})</span></div><div className="text-[10px] text-gray-400">{TRANSPORT_COSTS['car'].breakdown}</div></Opt>
                  <Opt onClick={() => pick('commute', 'mixed')}><div className="font-semibold">🚗🚇 ผสม</div><div className="text-sm text-gray-500">{fmtAud(TRANSPORT_COSTS['mixed'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(TRANSPORT_COSTS['mixed'].cost * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('commute', 'public')}><div className="font-semibold">🚇 รถไฟ/รถเมล์</div><div className="text-sm text-gray-500">{fmtAud(TRANSPORT_COSTS['public'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(TRANSPORT_COSTS['public'].cost * AUD_TO_THB))})</span></div></Opt>
                </div>
              )}
              {simStage === 8 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('food', 'always')}><div className="font-semibold">👨‍🍳 ทำเองทุกมื้อ</div><div className="text-sm text-gray-500">{fmtAud(FOOD_COSTS['always'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(FOOD_COSTS['always'].cost * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('food', 'often')}><div className="font-semibold">🍳 ทำเอง+ซื้อมิกซ์</div><div className="text-sm text-gray-500">{fmtAud(FOOD_COSTS['often'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(FOOD_COSTS['often'].cost * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('food', 'sometimes')}><div className="font-semibold">🥡 ซื้อกินบ่อย</div><div className="text-sm text-gray-500">{fmtAud(FOOD_COSTS['sometimes'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(FOOD_COSTS['sometimes'].cost * AUD_TO_THB))})</span></div></Opt>
                  <Opt onClick={() => pick('food', 'rarely')}><div className="font-semibold">🛵 Uber Eats ทุกมื้อ</div><div className="text-sm text-gray-500">{fmtAud(FOOD_COSTS['rarely'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(FOOD_COSTS['rarely'].cost * AUD_TO_THB))})</span></div></Opt>
                </div>
              )}
              {simStage === 9 && (
                <div className="space-y-2">
                  <Opt onClick={() => pick('insurance', 'medicare')}><div className="font-semibold">🏥 Medicare เฉยๆ (ฟรี!)</div><div className="text-sm text-green-600">$0/เดือน</div></Opt>
                  <Opt onClick={() => pick('insurance', 'private')}><div className="font-semibold">🏥+ Medicare + ประกันเอกชน</div><div className="text-sm text-gray-500">$150/เดือน</div></Opt>
                  <Opt onClick={() => pick('insurance', 'company')}><div className="font-semibold">💼 บริษัททำให้!</div><div className="text-sm text-green-600">$0/เดือน</div></Opt>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ALL STAGES DONE: COST SUMMARY ===== */}
        {allDone && phase === 'sim' && (
          <div className="animate-fade-in space-y-4">
            <div className="stage-card">
              <div className="stage-header"><div className="text-lg font-bold text-gray-800">📊 สรุปค่าตั้งต้นทั้งหมด</div></div>
              <div className="stage-body">
                <SumRow label="📋 วีซ่า+เอกสาร+สอบ+ตรวจ" aud={preDepartureTotal} />
                <SumRow label="✈️ ตั๋วเครื่องบิน" aud={flightCost} />
                <SumRow label="🏨 ที่พักชั่วคราว" aud={tempCost} />
                <SumRow label="🏠 มัดจำบ้าน" aud={bond} />
                <SumRow label="🛋️ ของเข้าบ้าน" aud={furnishCost} />
                <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300 mt-2">
                  <span>รวมค่าตั้งต้น</span><span className="text-red-600">-{fmtAud(finalOneTime)}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">≈ {fmtThb(Math.round(finalOneTime * AUD_TO_THB))}</div>
                <div className={`p-4 rounded-xl text-center ${isMotherLord ? 'bg-yellow-50 border-2 border-yellow-300' : (initialAUD - finalOneTime) >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                  <div className="text-sm text-gray-600">{isMotherLord ? '🤑 MOTHERLORD MODE' : '💰 เงินเหลือหลังจ่าย'}</div>
                  <div className={`text-2xl font-bold ${isMotherLord ? 'text-yellow-600' : (initialAUD - finalOneTime) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {isMotherLord ? '∞' : fmtAud(initialAUD - finalOneTime)}
                  </div>
                  {!isMotherLord && (initialAUD - finalOneTime) < 0 && <div className="text-sm text-red-600 mt-1">⚠️ เงินไม่พอ! ต้องหาเพิ่มอีก {fmtAud(Math.abs(initialAUD - finalOneTime))}</div>}
                </div>
              </div>
            </div>
            <button onClick={() => setPhase('result')} className="btn-primary w-full justify-center rounded-xl py-4 text-lg">🎊 ดูชีวิตรายเดือน!</button>
          </div>
        )}

        {/* ================================================================ */}
        {/* ===== RESULT PHASE ===== */}
        {/* ================================================================ */}
        {phase === 'result' && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center py-2">
              <div className="text-3xl font-bold text-gray-800 mb-1">🎊 ยินดีด้วย!</div>
              <div className="text-lg text-blue-600 font-semibold">คุณย้ายไป {city.name}, Australia สำเร็จ!</div>
            </div>

            {/* Monthly Breakdown */}
            <div className="result-section">
              <h4 className="text-base font-bold text-gray-800 mb-2">💵 ชีวิตรายเดือนของคุณ</h4>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">รายรับ</div>
              <Row label={`เงินเดือน (Gross) — ${choices['job'] === 'top' ? '👑 Top' : choices['job'] === 'min' ? 'ขั้นต่ำ' : 'Average'}`} val={fmtAud(Math.round(grossAnnual / 12))} />
              <Row label={`ภาษี (${auTax.effectiveRate}%)`} val={`-${fmtAud(Math.round(auTax.tax / 12))}`} red />
              <Row label="Medicare 2%" val={`-${fmtAud(Math.round(auTax.medicare / 12))}`} red />
              <div className="flex justify-between py-2 font-bold text-green-700 border-t border-gray-200">
                <span>💰 เงินสุทธิ Net</span><span>{fmtAud(monthlyNet)}/เดือน</span>
              </div>
              <div className="text-xs text-gray-400 mb-3">+ Super {fmtAud(Math.round(grossAnnual * 0.115 / 12))}/เดือน (นายจ้างจ่าย 11.5%)</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">รายจ่าย</div>
              <Row label={`🏠 ค่าเช่า (${choices['housing'] === 'share' ? 'แชร์' : choices['housing'] === '1bed' ? '1 bed' : '2 bed'})`} val={`-${fmtAud(monthlyRent)}`} red />
              <Row label="💡 น้ำ/ไฟ+Internet" val={`-${fmtAud(monthlyUtils)}`} red />
              <Row label="🍳 อาหาร" val={`-${fmtAud(monthlyFood)}`} red />
              <Row label="🚇 เดินทาง" val={`-${fmtAud(monthlyTransport)}`} red />
              <Row label="📱 มือถือ" val={`-${fmtAud(monthlyPhone)}`} red />
              {monthlyInsurance > 0 && <Row label="🏥 ประกันเพิ่ม" val={`-${fmtAud(monthlyInsurance)}`} red />}
              <Row label="🎬 เที่ยว/สังสรรค์" val={`-${fmtAud(monthlyMisc)}`} red />
              <Row label="🏥 Medicare" val="ฟรี!" green />
              <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300 mt-1">
                <span>รวมจ่าย</span><span className="text-red-600">-{fmtAud(totalMonthlyExp)}/เดือน</span>
              </div>
            </div>

            {/* Net Savings */}
            <div className={`p-5 rounded-xl text-center ${monthlySavings >= 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <div className="text-sm text-gray-600 mb-1">💰 เหลือเก็บต่อเดือน</div>
              <div className={`text-3xl font-bold ${monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtAud(monthlySavings)} AUD</div>
              <div className={`text-lg font-semibold ${monthlySavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>≈ {fmtThb(monthlySavingsTHB)}/เดือน</div>
              {monthlySavings > 0 && <div className="text-xs text-gray-500 mt-1">1 ปีเก็บได้ ~{fmtThb(monthlySavingsTHB * 12)}</div>}
            </div>

            {/* Fun spend */}
            {monthlySavings > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm">
                <div className="font-bold text-purple-800 mb-2">🎉 เงิน {fmtAud(monthlySavings)}/เดือน ทำอะไรได้?</div>
                <div className="space-y-1 text-purple-700">
                  <div>🍣 กินซูชิ $30 ได้ {Math.round(monthlySavings / 30)} มื้อ</div>
                  <div>✈️ ตั๋วกลับไทย (~$600) ได้ทุก {(600 / monthlySavings).toFixed(1)} เดือน</div>
                  <div>📱 ซื้อ iPhone ได้ทุก {(1899 / monthlySavings).toFixed(1)} เดือน</div>
                  <div>🏦 1 ปีเก็บได้ ~{fmtThb(monthlySavingsTHB * 12)}</div>
                </div>
              </div>
            )}

            {/* TH vs AU */}
            <div className="result-section" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF9C3)', borderColor: '#FDBA74' }}>
              <h4 className="text-base font-bold text-gray-800 mb-3">🔥 เทียบกัน: อยู่ไทย vs ย้ายไป AU</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white/70 rounded-lg">
                  <div className="text-2xl">🇹🇭</div>
                  <div className="font-bold text-gray-800 text-sm">อยู่ไทย</div>
                  <div className="text-xs text-gray-500">เงินเดือน {fmtThb(thaiSalary)}</div>
                  <div className="text-xl font-bold text-orange-600 mt-1">{fmtThb(thaiMonthlySavings)}</div>
                </div>
                <div className="text-center p-3 bg-white/70 rounded-lg">
                  <div className="text-2xl">🇦🇺</div>
                  <div className="font-bold text-gray-800 text-sm">ย้ายไป AU</div>
                  <div className="text-xs text-gray-500">เงินเดือน {fmtAud(Math.round(grossAnnual / 12))}</div>
                  <div className="text-xl font-bold text-green-600 mt-1">{fmtThb(monthlySavingsTHB)}</div>
                </div>
              </div>
              {monthlySavingsTHB > thaiMonthlySavings && (
                <div className="text-center mt-3 p-2 bg-green-100 rounded-lg">
                  <span className="text-green-700 font-bold text-sm">📈 เก็บเงินได้มากกว่า +{fmtThb(monthlySavingsTHB - thaiMonthlySavings)}/เดือน!</span>
                </div>
              )}
              <div className="mt-3 text-xs text-orange-700 space-y-1">
                <div>🏥 + Medicare ฟรี</div>
                <div>🏖️ + Annual Leave 20 วัน</div>
                <div>🤒 + Sick Leave 10 วัน</div>
                <div>🏦 + Super 11.5% นายจ้างจ่าย</div>
                <div>👶 + Parental Leave 18 สัปดาห์</div>
              </div>
            </div>

            {/* Tax section */}
            <div className="result-section" style={{ background: 'linear-gradient(135deg, #FEF2F2, #FCE7F3)', borderColor: '#FCA5A5' }}>
              <h4 className="text-base font-bold text-gray-800 mb-2">😏 สำหรับคนบอก &ldquo;ภาษีเยอะ ไม่เหลืออะไร&rdquo;</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div>ภาษี+Medicare ที่ AU: {auTax.effectiveRate}% ≈ {fmtAud(Math.round((auTax.tax + auTax.medicare) / 12))}/เดือน</div>
                <div className="font-semibold text-red-700">
                  {monthlySavingsTHB > thaiMonthlySavings
                    ? `💡 จ่ายภาษี "เยอะ" แต่เหลือเก็บมากกว่าอยู่ไทย +${fmtThb(monthlySavingsTHB - thaiMonthlySavings)}/เดือน`
                    : '💡 ตัวเลขไม่โกหก ลองดูแล้วตัดสินใจเอง'}
                </div>
              </div>
            </div>

            {/* Visa Score */}
            <div className="result-section">
              <h4 className="text-base font-bold text-gray-800 mb-2">📋 คะแนนวีซ่า Skilled Migration (เบื้องต้น)</h4>
              <div className={`p-3 rounded-lg ${visa.score >= 65 ? 'bg-green-50 border border-green-200' : visa.score >= 50 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">คะแนนรวม</span>
                  <span className={`text-xl font-bold ${visa.score >= 65 ? 'text-green-600' : 'text-yellow-600'}`}>{visa.score} คะแนน</span>
                </div>
                <div className="text-xs text-gray-600 mt-2 space-y-0.5">
                  {visa.details.map((d, i) => <div key={i}>• {d}</div>)}
                </div>
                <div className="text-xs text-gray-400 mt-2">* ยังไม่รวม Partner/เรียนใน AU/NAATI</div>
                {visa.score >= 65 ? <div className="text-sm text-green-700 font-semibold mt-2">✅ ผ่าน 65! สมัคร 189/190 ได้</div>
                  : visa.score >= 50 ? <div className="text-sm text-yellow-700 font-semibold mt-2">⚠️ ลอง 491 Regional (+15) = {visa.score + 15}</div>
                  : <div className="text-sm text-red-700 font-semibold mt-2">❌ คะแนน Skilled ต่ำ — แต่ยังมีทางอื่น! ดูด้านล่าง 👇</div>}
              </div>
            </div>

            {/* Non-points visa pathways */}
            <div className="result-section" style={{ background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', borderColor: '#86EFAC' }}>
              <h4 className="text-base font-bold text-gray-800 mb-2">🎫 เส้นทางอื่นที่ไม่ต้องใช้คะแนน</h4>
              <div className="text-sm text-gray-700 space-y-3">
                <div className="p-2 bg-white/80 rounded-lg">
                  <div className="font-semibold text-green-700">💼 Employer Sponsored (482/186)</div>
                  <div className="text-xs text-gray-600">หานายจ้าง AU sponsor ให้ ไม่ต้องมีคะแนน ทำ 2-3 ปี → PR ได้</div>
                  <div className="text-xs text-gray-400">ค่าวีซ่า ~$3,035</div>
                </div>
                <div className="p-2 bg-white/80 rounded-lg">
                  <div className="font-semibold text-blue-700">🎓 Student → Graduate (500 → 485)</div>
                  <div className="text-xs text-gray-600">เรียนที่ AU → จบได้ work visa 2-4 ปี → หางาน → apply PR</div>
                  <div className="text-xs text-gray-400">ค่าวีซ่า $1,600 + ค่าเทอม $20,000-50,000/ปี</div>
                </div>
                {(() => {
                  const ageN = quickProfile.age === '18-24' ? 21 : quickProfile.age === '25-32' ? 28 : 36
                  return ageN <= 30 ? (
                    <div className="p-2 bg-white/80 rounded-lg border-2 border-orange-200">
                      <div className="font-semibold text-orange-700">🏖️ Working Holiday (462) — คุณมีสิทธิ์!</div>
                      <div className="text-xs text-gray-600">ไทยมีข้อตกลงกับ AU! อายุ 18-30 ไปทำงาน+เที่ยว 12 เดือน ต่อได้ถึง 3 ปี</div>
                      <div className="text-xs text-gray-400">ค่าวีซ่า $640 เท่านั้น!</div>
                    </div>
                  ) : (
                    <div className="p-2 bg-white/80 rounded-lg opacity-60">
                      <div className="font-semibold text-orange-700">🏖️ Working Holiday (462)</div>
                      <div className="text-xs text-gray-500">สำหรับอายุ 18-30 ปี (ไม่ตรงเงื่อนไขอายุของคุณ)</div>
                    </div>
                  )
                })()}
                <div className="p-2 bg-white/80 rounded-lg">
                  <div className="font-semibold text-pink-700">💑 Partner Visa (309/820)</div>
                  <div className="text-xs text-gray-600">มีคู่สมรส/แฟนเป็น AU citizen/PR → สมัครได้เลย → PR ภายใน 2 ปี</div>
                  <div className="text-xs text-gray-400">ค่าวีซ่า $9,095 (แพงที่สุด)</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <a href={`${basePath}/visa`} className="text-blue-600 underline font-medium">→ ดูวีซ่าทั้งหมด + เปรียบเทียบเส้นทาง</a>
              </div>
            </div>

            {/* Tips */}
            <div className="result-section" style={{ background: '#EFF6FF', borderColor: '#93C5FD' }}>
              <h4 className="text-base font-bold text-gray-800 mb-2">💡 เคล็ดลับ</h4>
              <div className="text-sm text-gray-700 space-y-2">
                {choices['job'] === 'min' && <div>📈 <strong>หางาน Professional:</strong> Skilled Visa เงินเดือนสูงกว่า 2-3 เท่า</div>}
                {choices['housing'] !== 'share' && <div>🏠 <strong>แชร์บ้านช่วง 6 เดือนแรก:</strong> ประหยัดได้ {fmtAud(monthlyRent - city.rentShare)}/เดือน</div>}
                {choices['commute'] === 'car' && <div>🚇 <strong>ใช้รถไฟช่วงแรก:</strong> ประหยัด {fmtAud(TRANSPORT_COSTS['car'].cost - TRANSPORT_COSTS['public'].cost)}/เดือน</div>}
                <div>📋 <strong>ขั้นตอน:</strong> สอบ IELTS → Skills Assessment → ยื่น EOI → Invitation → วีซ่า → บินไป!</div>
              </div>
            </div>

            {/* Detailed Sources */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="text-xs text-blue-700 font-medium mb-1">📊 แหล่งข้อมูลที่ใช้คำนวณ:</div>
              <div className="text-xs text-blue-600 space-y-0.5">
                <div>• <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" target="_blank" rel="noopener noreferrer" className="underline">Home Affairs SkillSelect</a> — เกณฑ์วีซ่า ค่าธรรมเนียม</div>
                <div>• <a href="https://www.ato.gov.au/tax-rates-and-codes/tax-rates-resident" target="_blank" rel="noopener noreferrer" className="underline">ATO Tax Rates FY 2025-26</a> — อัตราภาษี Stage 3 Tax Cuts</div>
                <div>• <a href="https://www.numbeo.com/cost-of-living/country_result.jsp?country=Australia" target="_blank" rel="noopener noreferrer" className="underline">Numbeo</a> — ค่าเช่า ค่าครองชีพ แต่ละเมือง</div>
                <div>• <a href="https://www.fairwork.gov.au/pay-and-wages/minimum-wages" target="_blank" rel="noopener noreferrer" className="underline">Fair Work Ombudsman</a> — ค่าแรงขั้นต่ำ $24.95/hr (1 Jul 2025)</div>
                <div>• <a href="https://www.seek.com.au/career-advice/role" target="_blank" rel="noopener noreferrer" className="underline">SEEK Salary Guide</a> — เงินเดือนตามอาชีพ</div>
              </div>
            </div>
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="text-xs text-amber-700">
                ⚠️ <strong>ข้อจำกัดความรับผิดชอบ:</strong> ตัวเลขเป็นการประมาณเบื้องต้น ผลจริงอาจแตกต่างจากนี้
                อัตราแลกเปลี่ยนผันผวนได้ ควรเช็คจาก <a href="https://www.xe.com/currencyconverter/convert/?Amount=1&From=AUD&To=THB" target="_blank" rel="noopener noreferrer" className="underline font-medium">XE.com</a> ก่อนใช้จริง
                กรุณาปรึกษา Migration Agent ที่ได้รับอนุญาตก่อนยื่นวีซ่าจริง
              </div>
            </div>

            {/* Link to detailed calculator */}
            <a href={`${basePath}/visa`} className="block mt-3 py-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 text-center text-sm text-orange-700 font-medium hover:shadow-md transition-all">
              📋 ดูวีซ่าทั้งหมด & เปรียบเทียบเส้นทาง →
            </a>

            <div className="flex gap-2 mt-3 mb-2">
              <button onClick={() => setPhase('countryResults')} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium">
                ← ดูประเทศอื่น
              </button>
              <button onClick={restart} className="flex-1 py-3 rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium">
                🔄 ลองใหม่
              </button>
            </div>
            <div className="mb-4">
              <ShareButtons />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

// ===== SUB-COMPONENTS =====
function BotMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="chat-bubble bot animate-fade-in">
      <span className="bot-avatar">🐱</span>
      <div className="bubble-content">{children}</div>
    </div>
  )
}

function UserMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="chat-bubble user animate-fade-in">
      <div className="bubble-content">{children}</div>
    </div>
  )
}

function Completed({ emoji, title, detail, negative }: { emoji: string; title: string; detail: string; negative?: boolean }) {
  return (
    <div className="completed-stage">
      <span className="text-base">{emoji}</span>
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-gray-700 text-sm">{title}</span>
        <span className={`text-xs ml-2 ${negative ? 'text-red-500' : 'text-gray-500'}`}>{detail}</span>
      </div>
      <span className="text-green-500 text-xs">✓</span>
    </div>
  )
}

function Opt({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className="stage-option-btn">{children}</button>
}

function SumRow({ label, aud }: { label: string; aud: number }) {
  return (
    <div className="flex justify-between py-1.5 text-sm border-b border-gray-100">
      <span>{label}</span>
      <div className="text-right">
        <span className="font-mono text-red-500">{aud > 0 ? `-${fmtAud(aud)}` : '$0'}</span>
        {aud > 0 && <div className="text-[10px] text-gray-400">({fmtThb(Math.round(aud * AUD_TO_THB))})</div>}
      </div>
    </div>
  )
}

function Row({ label, val, red, green }: { label: string; val: string; red?: boolean; green?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-mono ${red ? 'text-red-500' : green ? 'text-green-600' : 'text-gray-800'}`}>{val}</span>
    </div>
  )
}
