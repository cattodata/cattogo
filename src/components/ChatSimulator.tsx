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
  AU_SALARIES, AU_UNSKILLED_SALARY, TH_LIVING_COSTS,
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
  'data-ai': 'dataAI',
  'devops-cloud': 'softwareDev',
  'cybersecurity': 'softwareDev',
  'network-admin': 'softwareDev',
  'it-management': 'softwareDev',
  'other': 'softwareDev',
  /* Temporarily disabled — non-tech
  'engineering': 'engineer',
  'creative': 'trades',
  'accounting': 'accountant',
  'healthcare': 'nurse',
  'chef': 'trades',
  */
}

function getOccSalary(countryId: string, occId: string): SalaryRange | null {
  const details = getCountryDetails(countryId)
  if (!details) return null
  const key = OCC_TO_SALARY_KEY[occId] || 'trades' // safe generic default instead of softwareDev
  return details.salaries[key] || null
}

const STAGE_META = [
  { id: 'savings', title: '💰 ด่าน 1: เตรียมเงิน', sub: 'มีเงินเก็บเท่าไหร่?' },
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
const AI_SYSTEM_PROMPT = `คุณชื่อ "Catto" 🐱 ผู้ช่วยวิเคราะห์การย้ายประเทศ คุยสั้นๆ เป็นกันเอง ใช้ emoji นิดหน่อย

กฎ:
- ตอบภาษาไทยเท่านั้น ห้ามใช้ภาษาจีน ญี่ปุ่น เกาหลี หรืออักษรอื่นเด็ดขาด
- ตอบสั้น 1-3 ประโยค จบด้วยคำถาม 1 ข้อ
- ถามทีละเรื่อง ห้ามถามหลายเรื่องพร้อมกัน
- ตอบรับสิ่งที่ user พูดจริงๆ ไม่ใช่แค่ "เข้าใจ!"
- ถ้า user ถามนอกเรื่องย้ายประเทศ → "เรื่องนี้ Catto ช่วยไม่ได้นะ 😸"
- ห้ามสร้างข้อมูลเท็จ

เป้าหมาย: เก็บข้อมูล 5 อย่างจาก user ทีละเรื่อง:
1. goals: เป้าหมายย้ายประเทศ
2. occupation: อาชีพ
3. age: ช่วงอายุ
4. family: ไปคนเดียว/คู่/ครอบครัว
5. monthlyIncome: รายได้ต่อเดือน (บาท)

พอเก็บครบ → สรุปสั้น 1 บรรทัดว่า "ได้ข้อมูลครบแล้ว!"

ตอบเป็น JSON เสมอ:
{"message": "ข้อความตอบ user", "gathered": {"goals": [], "occupation": "", "monthlyIncome": 0, "age": "", "family": "", "ready": false}}

ค่าที่ใช้ได้:
- goals: "money-job", "balance", "family", "stable", "lifestyle"
- occupation: "healthcare", "engineering", "accounting", "software", "data-ai", "creative", "chef", "other"
- age: "18-24", "25-32", "33-39", "40-44", "45+"
- family: "single", "couple", "family"
- ready: true เมื่อครบทุกช่อง`

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
  const [visaType, setVisaType] = useState<'skilled' | 'employer'>('skilled')
  // Cost editing
  const [thaiCosts, setThaiCosts] = useState({ ...TH_LIVING_COSTS })
  const [editingThaiCosts, setEditingThaiCosts] = useState(false)
  const [editingAuCosts, setEditingAuCosts] = useState(false)
  const [auCostOverrides, setAuCostOverrides] = useState<Record<string, number>>({})
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const captureResultAsImage = async () => {
    if (!resultRef.current) return
    try {
      const html2canvas = (await import('html2canvas-pro')).default
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = 'cattogo-result.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch { /* ignore */ }
  }

  useEffect(() => {
    setTimeout(() => {
      if (phase === 'countryResults' || phase === 'result') {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }, 200)
  }, [quizStep, phase, simStage, aiMessages.length])

  // Init: auto-start quiz mode (choice-based — easier to control than AI chat)
  useEffect(() => {
    if (phase === 'welcome') {
      setPhase('quiz')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ===== AI HANDLERS =====
  /** Strip CJK characters (Chinese/Japanese/Korean) from AI output — safety net for weak model */
  const stripCJK = (text: string): string =>
    text.replace(/[\u2E80-\u9FFF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u3100-\u312F\u31A0-\u31BF]+/g, '').replace(/\s{2,}/g, ' ').trim()

  /** Client-side extraction: parse user text for structured data as fallback when AI doesn't return JSON */
  const extractUserData = (text: string): Partial<GatheredData> => {
    const result: Partial<GatheredData> = {}
    const lower = text.toLowerCase()

    // Occupation: match keywords to IDs (same mapping as AI system prompt)
    if (/data\s*engineer|data\s*analyst|data\s*scien|machine\s*learn|ml\s*engineer|ดาต้า|วิทย.*ข้อมูล/i.test(text)) {
      result.occupation = 'data-ai'
    } else if (/พยาบาล|nurse|หมอ|doctor|แพทย์|สาธารณสุข|เภสัช|pharmacist|ทันตแพทย์|dentist/i.test(text)) {
      result.occupation = 'healthcare'
    } else if (/วิศวกร|engineer|mechanical|civil|electrical|ช่าง/i.test(text) && !/software|data|devops|cloud|ml/i.test(text)) {
      result.occupation = 'engineering'
    } else if (/software|dev|programmer|โปรแกรมเมอร์|fullstack|frontend|backend|web.*dev|mobile.*dev|devops|cloud|cyber|security|IT|ไอที/i.test(text)) {
      result.occupation = 'software'
    } else if (/บัญชี|account|finance|การเงิน|auditor/i.test(text)) {
      result.occupation = 'accounting'
    } else if (/กราฟิก|graphic|design|ดีไซน์|UI|UX|creative|สื่อ|media|market|photographer|ช่างภาพ|animator|illustrator/i.test(text)) {
      result.occupation = 'creative'
    } else if (/เชฟ|chef|cook|ครัว|barista|พ่อครัว|แม่ครัว/i.test(text)) {
      result.occupation = 'chef'
    }

    // Income: numbers with optional commas, followed by optional "บาท"
    const incomeMatch = text.match(/(\d[\d,]{2,})\s*(?:บาท|baht)?/i)
    if (incomeMatch) {
      const num = Number(incomeMatch[1].replace(/,/g, ''))
      if (num >= 10000 && num <= 10000000) result.monthlyIncome = num
    }
    // Age ranges
    if (/18[\s-]*24|อายุ.*18/.test(text)) result.age = '18-24'
    else if (/25[\s-]*32|อายุ.*2[5-9]|อายุ.*3[0-2]/.test(text)) result.age = '25-32'
    else if (/33[\s-]*39|อายุ.*3[3-9]/.test(text)) result.age = '33-39'
    else if (/40[\s-]*44|อายุ.*4[0-4]/.test(text)) result.age = '40-44'
    else if (/45\+|อายุ.*4[5-9]|อายุ.*5\d/.test(text)) result.age = '45+'
    // Family
    if (/คนเดียว|โสด|single|ไม่มีครอบครัว/.test(lower)) result.family = 'single'
    else if (/คู่|แฟน|สามี|ภรรยา|couple|แต่งงาน/.test(lower)) result.family = 'couple'
    else if (/ครอบครัว|ลูก|family|มีลูก/.test(lower)) result.family = 'family'
    return result
  }

  const startAiChat = () => {
    setAiMode(true)
    setPhase('aiChat')
    const greeting = '🐱 สวัสดี ฉันชื่อ Catto — ผู้ช่วยวิเคราะห์ว่าคุณเหมาะจะย้ายไปประเทศไหน\n\nตอนนี้ทำงานสายอะไร และอะไรคือเหตุผลหลักที่อยากย้าย? 🌍'
    setAiMessages([{ role: 'bot', text: greeting }])
    setAiChatHistory([{ role: 'system', content: AI_SYSTEM_PROMPT }, { role: 'assistant', content: greeting }])
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

    // Build history with plain-text assistant messages (not JSON — confuses weak model)
    const newHistory: ChatMessage[] = [...aiChatHistory, { role: 'user', content: text.trim() }]
    setAiChatHistory(newHistory)

    try {
      // Pass current gathered state so typhoon.ts can inject it as a system hint
      const currentState = aiGathered
      const aiRes = await chatWithTyphoon(apiKey, newHistory, currentState)
      // Strip any CJK characters the weak model may have leaked
      aiRes.message = stripCJK(aiRes.message)
      setAiMessages(prev => [...prev, { role: 'bot', text: aiRes.message }])

      // Client-side extraction: parse user text for age, income, family as fallback
      const userText = text.trim()
      const clientExtracted = extractUserData(userText)

      // Use functional updater to read LATEST state (avoids stale closure from chip/search setters)
      setAiGathered(prev => {
        const merged: GatheredData = {
          goals: aiRes.gathered.goals.length > 0
            ? [...new Set([...prev.goals, ...aiRes.gathered.goals])]
            : prev.goals,
          // Client-side regex from CURRENT message takes priority (user just typed it)
          // Then fall back to previously-set value, then AI response
          occupation: clientExtracted.occupation || prev.occupation || aiRes.gathered.occupation || '',
          monthlyIncome: clientExtracted.monthlyIncome || prev.monthlyIncome || aiRes.gathered.monthlyIncome || 0,
          age: clientExtracted.age || prev.age || aiRes.gathered.age || '',
          family: clientExtracted.family || prev.family || aiRes.gathered.family || '',
          ready: false, // will be overridden below
        }
        // Auto-detect ready: if all fields are filled, we're done
        merged.ready = aiRes.gathered.ready || (
          merged.goals.length > 0 &&
          merged.occupation !== '' &&
          merged.monthlyIncome > 0 &&
          merged.age !== '' &&
          merged.family !== ''
        )
        // Store only the bot's TEXT in history (not full JSON) — cleaner for weak model
        setAiChatHistory(h => [...h, { role: 'assistant', content: aiRes.message }])
        return merged
      })
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

  // Quick occupation chip mapping → proper AI-expected IDs (Tech/IT only)
  const OCC_CHIP_MAP: { label: string; text: string; occId: string }[] = [
    { label: '💻 Software Dev', text: 'Software Developer / โปรแกรมเมอร์', occId: 'software' },
    { label: '📊 Data / Analytics', text: 'Data Engineer / Analyst', occId: 'data-ai' },
    { label: '☁️ DevOps / Cloud', text: 'DevOps / Cloud Engineer', occId: 'devops-cloud' },
    { label: '🤖 AI / ML', text: 'AI / Machine Learning Engineer', occId: 'data-ai' },
    { label: '🔒 Cybersecurity', text: 'Cybersecurity Analyst', occId: 'cybersecurity' },
    { label: '🌐 Network / SysAdmin', text: 'Network Engineer / SysAdmin', occId: 'network-admin' },
    { label: '📋 IT Manager / PM', text: 'IT Project Manager', occId: 'it-management' },
    /* Temporarily disabled — non-tech
    { label: '⚙️ วิศวกร', text: 'วิศวกร', occId: 'engineering' },
    { label: '🎨 ดีไซน์ / ครีเอทีฟ', text: 'Graphic Designer / ดีไซเนอร์', occId: 'creative' },
    { label: '🏥 สาธารณสุข', text: 'แพทย์ / พยาบาล', occId: 'healthcare' },
    { label: '📋 บัญชี', text: 'บัญชี / การเงิน', occId: 'accounting' },
    { label: '👨‍🍳 เชฟ', text: 'เชฟ / ครัว', occId: 'chef' },
    */
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

  // Skills Assessment cost depends on occupation:
  // IT (ACS) ~$530, Engineering (EA) ~$700, Other (VETASSESS) ~$1,000
  // Only required for Skilled visas (189/190/491), NOT for employer-sponsored (482)
  const skillsAssessmentCost = useMemo(() => {
    const itOccs = ['software', 'data-ai', 'devops-cloud', 'cybersecurity', 'network-admin', 'it-management']
    if (itOccs.includes(occupation)) return 530 // ACS fee
    return 1000 // VETASSESS / other bodies
  }, [occupation])

  const preDepartureCosts = useMemo(() => {
    // Visa 189/190 (Skilled): Primary $4,640 + Partner $2,320 + Child $1,160 (FY2025-26)
    // Visa 482 (Employer Sponsored): Primary $3,035 + Partner $3,035 + Child $760 (FY2025-26)
    const visa189 = quickProfile.family === 'family' ? 8120 : quickProfile.family === 'couple' ? 6960 : 4640
    const visa482 = quickProfile.family === 'family' ? 6830 : quickProfile.family === 'couple' ? 6070 : 3035
    const visa = visaType === 'employer' ? visa482 : visa189
    const visaLabel = visaType === 'employer' ? '📋 Visa 482 (Employer Sponsored)' : '📋 Visa 189/190 (Skilled)'
    const itOccs = ['software', 'data-ai', 'devops-cloud', 'cybersecurity', 'network-admin', 'it-management']
    const saFee = visaType === 'employer' ? 0 : (itOccs.includes(occupation) ? 530 : 1000)
    const saLabel = itOccs.includes(occupation) ? '📝 Skills Assessment (ACS)' : '📝 Skills Assessment (VETASSESS)'
    const costs = [
      { label: visaLabel, aud: visa },
    ]
    if (visaType === 'skilled') {
      costs.push({ label: saLabel, aud: saFee })
    }
    costs.push(
      { label: '📖 IELTS/PTE สอบภาษา', aud: 410 },
      { label: '🏥 ตรวจสุขภาพ Medical', aud: 400 },
      { label: '📄 เอกสาร+แปล+รับรอง', aud: 500 },
    )
    return costs
  }, [quickProfile.family, occupation, visaType])
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
  const baseFood = FOOD_COSTS[choices['food']]?.cost || 550
  const baseTransport = TRANSPORT_COSTS[choices['commute']]?.cost || 200
  const baseInsurance = choices['insurance'] === 'private' ? 150 : 0
  const baseUtils = city.utilities + city.internet
  const basePhone = 50
  const baseMisc = 250
  const monthlyFood = auCostOverrides.food ?? baseFood
  const monthlyTransport = auCostOverrides.transport ?? baseTransport
  const monthlyInsurance = auCostOverrides.insurance ?? baseInsurance
  const monthlyUtils = auCostOverrides.utils ?? baseUtils
  const monthlyPhone = auCostOverrides.phone ?? basePhone
  const monthlyMisc = auCostOverrides.misc ?? baseMisc
  const monthlyRentAu = auCostOverrides.rent ?? monthlyRent
  const totalMonthlyExp = monthlyRentAu + monthlyUtils + monthlyFood + monthlyTransport + monthlyInsurance + monthlyPhone + monthlyMisc
  const monthlySavings = monthlyNet - totalMonthlyExp
  const monthlySavingsTHB = Math.round(monthlySavings * AUD_TO_THB)

  const thaiSalary = parseInt(auProfile.thaiSalary) || parseInt(quickProfile.monthlyIncome) || 40000
  const thaiTax = calculateThaiTax(thaiSalary * 12)
  const thaiNetMonthly = thaiTax.netMonthly
  const thaiTotalLiving = Object.values(thaiCosts).reduce((a, b) => a + b, 0)
  const thaiMonthlySavings = thaiNetMonthly - thaiTotalLiving

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
    setSimStage(0); setSavingsInput(''); setIsMotherLord(false); setInitialAUD(0); setChoices({}); setVisaType('skilled')
    setThaiCosts({ ...TH_LIVING_COSTS }); setEditingThaiCosts(false); setEditingAuCosts(false); setAuCostOverrides({})
    setAiMessages([]); setAiChatHistory([]); setAiInput(''); setAiGathered({ goals: [], occupation: '', monthlyIncome: 0, age: '', family: '', ready: false })
    setAiAnalysis(''); setAiError(''); setOccDisplayLabel(''); setChipSelected([]); setShowOccSearch(false); setOccChatSearch(''); setAiMode(false); setGoalsConfirmed(false)
    // Re-start quiz mode after reset
    setTimeout(() => {
      setPhase('quiz')
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

            <button onClick={() => setPhase('quiz')} className="btn-primary w-full justify-center rounded-xl py-4 text-base mb-3">
              📋 เริ่มวิเคราะห์
            </button>

            {/* AI Chat mode — temporarily disabled for stability
            <button onClick={startAiChat} className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium">
              🐱 คุยกับ AI วิเคราะห์
            </button>
            */}
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
            👋 สวัสดี! เริ่มวิเคราะห์ประเทศที่เหมาะกับคุณ<br />
            <strong>สิ่งที่สำคัญที่สุดสำหรับคุณคืออะไร?</strong> เลือกได้ 1-3 ข้อ
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
                {GOALS.find(x => x.id === goals[0])?.response || '✅ รับทราบ'}<br /><br />
                💼 <strong>คุณทำงานสายไหน?</strong> อาชีพมีผลต่อวีซ่าและความต้องการตลาดแรงงานแต่ละประเทศ
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
                🎯 กรอกข้อมูลเบื้องต้นเพื่อวิเคราะห์ประเทศที่เหมาะกับคุณ<br />
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
                  <span className="text-[10px] text-gray-400 mt-1 block">ใช้เปรียบเทียบค่าครองชีพแต่ละประเทศ</span>
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
        <div className="sim-scroll" ref={scrollContainerRef}>
          <div className="text-center mb-4 animate-fade-in">
            <div className="text-3xl font-bold text-gray-800 mb-1">🌍 ผลวิเคราะห์ของคุณ!</div>
            <div className="text-sm text-gray-500">{aiMode ? '🐱 Catto วิเคราะห์จาก' : 'จาก'} {COUNTRIES.length} ประเทศ — นี่คือ Top 5 ที่เหมาะกับคุณ</div>
            {/* Show user's selected criteria */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {goals.map(g => {
                const goal = GOALS.find(x => x.id === g)
                return goal ? <span key={g} className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{goal.emoji} {goal.label.replace(/^[^\s]+\s/, '')}</span> : null
              })}
              {occupation && <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">💼 {occDisplayLabel || OCCUPATIONS.find(o => o.id === occupation)?.labelTH}</span>}
              {quickProfile.family && <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{quickProfile.family === 'family' ? '👨‍👩‍👧 ครอบครัว' : quickProfile.family === 'couple' ? '👫 คู่' : '🧑 คนเดียว'}</span>}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">คะแนนคำนวณจากเป้าหมาย × คะแนนประเทศ × อาชีพ × รายได้</div>
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

                  {/* Goal-based reasons: WHY this country matches */}
                  {result.goalReasons && result.goalReasons.length > 0 && (
                    <div className="px-4 pt-2 pb-1 space-y-0.5">
                      <div className="text-[11px] font-semibold text-gray-500 mb-1">📋 ทำไมได้อันดับนี้ (จากที่คุณเลือก):</div>
                      {result.goalReasons.map((r, i) => (
                        <div key={i} className="text-xs text-gray-600">{r}</div>
                      ))}
                    </div>
                  )}

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
              📋 <strong>POC Data</strong> — ข้อมูล ณ March 2026 ไม่ได้ live update อาจเปลี่ยนแปลง กรุณาเช็คจากแหล่งทางการก่อนตัดสินใจ
            </div>
            <div className="text-xs text-amber-700 mt-1">
              ⚠️ ไม่ใช่คำแนะนำทางกฎหมาย เป็นข้อมูลทั่วไปเท่านั้น ควรปรึกษา MARA agent ก่อนตัดสินใจ
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
                  <label className="form-label">🗣️ IELTS (คะแนนเฉลี่ย)</label>
                  <select className="form-select" value={auProfile.english} onChange={e => upAU('english', e.target.value)}>
                    <option value="">— เลือก —</option>
                    <option value="superior">IELTS 8.0+ (Superior) — 20 คะแนน</option>
                    <option value="proficient">IELTS 7.0-7.5 (Proficient) — 10 คะแนน</option>
                    <option value="competent">IELTS 6.0-6.5 (Competent) — 0 คะแนน</option>
                    <option value="low">ต่ำกว่า IELTS 6.0</option>
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

      <div className="sim-scroll sim-scroll-with-bar" ref={scrollContainerRef}>
        {/* Progress */}
        <div className="stage-progress">
          {STAGE_META.map((_, i) => (
            <div key={i} className={`stage-dot ${i < simStage ? 'done' : i === simStage ? 'current' : ''}`} />
          ))}
        </div>

        {/* ===== COMPLETED STAGES ===== */}
        {simStage >= 1 && <Completed emoji="💰" title="เตรียมเงิน" detail={isMotherLord ? 'MOTHERLORD ∞' : `${fmtThb(parseInt(savingsInput) || 0)} = ${fmtAud(initialAUD)}`} />}
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
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => setVisaType('skilled')} className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-colors ${visaType === 'skilled' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      🎯 189/190 Skilled
                    </button>
                    <button onClick={() => setVisaType('employer')} className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-colors ${visaType === 'employer' ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      💼 482 Employer Sponsored
                    </button>
                  </div>
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
          <div ref={resultRef} className="animate-fade-in space-y-4">
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
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-gray-400 uppercase tracking-wide">รายจ่าย</div>
                <button onClick={() => setEditingAuCosts(e => !e)} className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 transition-colors">
                  {editingAuCosts ? '✕ ปิด' : '✏️ แก้ไขได้'}
                </button>
              </div>
              {!editingAuCosts ? (
                <>
                  <Row label={`🏠 ค่าเช่า (${choices['housing'] === 'share' ? 'แชร์' : choices['housing'] === '1bed' ? '1 bed' : '2 bed'})`} val={`-${fmtAud(monthlyRentAu)}`} red />
                  <Row label="💡 น้ำ/ไฟ+Internet" val={`-${fmtAud(monthlyUtils)}`} red />
                  <Row label="🍳 อาหาร" val={`-${fmtAud(monthlyFood)}`} red />
                  <Row label="🚇 เดินทาง" val={`-${fmtAud(monthlyTransport)}`} red />
                  <Row label="📱 มือถือ" val={`-${fmtAud(monthlyPhone)}`} red />
                  {monthlyInsurance > 0 && <Row label="🏥 ประกันเพิ่ม" val={`-${fmtAud(monthlyInsurance)}`} red />}
                  <Row label="🎬 เที่ยว/สังสรรค์" val={`-${fmtAud(monthlyMisc)}`} red />
                </>)
              : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 space-y-1.5">
                  <div className="text-xs font-medium text-blue-700 mb-1">🇦🇺 ปรับค่าใช้จ่ายรายเดือน (AUD/เดือน)</div>
                  {([
                    { key: 'rent', label: `🏠 ค่าเช่า (${choices['housing'] === 'share' ? 'แชร์' : choices['housing'] === '1bed' ? '1 bed' : '2 bed'})`, base: monthlyRent },
                    { key: 'utils', label: '💡 น้ำไฟ+Net', base: baseUtils },
                    { key: 'food', label: '🍳 อาหาร', base: baseFood },
                    { key: 'transport', label: '🚇 เดินทาง', base: baseTransport },
                    { key: 'phone', label: '📱 มือถือ', base: basePhone },
                    { key: 'misc', label: '🎬 สังสรรค์', base: baseMisc },
                    { key: 'insurance', label: '🏥 ประกัน', base: baseInsurance },
                  ] as const).map(({ key, label, base }) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 w-28 truncate">{label}</label>
                      <input
                        type="number" min={0}
                        className="flex-1 px-2 py-1 text-xs border border-blue-200 rounded bg-white text-right font-mono"
                        value={auCostOverrides[key] ?? base}
                        onChange={e => {
                          const v = parseInt(e.target.value) || 0
                          setAuCostOverrides(prev => ({ ...prev, [key]: Math.max(0, v) }))
                        }}
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => setAuCostOverrides({})} className="text-[10px] text-blue-500 underline hover:text-blue-700">รีเซ็ต</button>
                    <button onClick={() => setEditingAuCosts(false)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      🔄 คำนวนใหม่
                    </button>
                  </div>
                </div>
              )}
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

              {/* Header cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/80 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🇹🇭</span>
                    <div className="font-bold text-gray-800 text-sm">อยู่ไทย</div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">เงินเดือน</span><span className="font-mono font-semibold">{fmtThb(thaiSalary)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">ภาษี+ประกันสังคม</span><span className="font-mono text-red-500">-{fmtThb(Math.round((thaiTax.tax + thaiTax.socialSec) / 12))}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">ค่าใช้จ่าย</span><span className="font-mono text-red-500">-{fmtThb(thaiTotalLiving)}</span></div>
                    <div className="flex justify-between pt-1 border-t border-orange-200"><span className="font-semibold text-gray-700">เหลือเก็บ</span><span className="font-mono font-bold text-orange-600">{fmtThb(thaiMonthlySavings)}</span></div>
                  </div>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🇦🇺</span>
                    <div className="font-bold text-gray-800 text-sm">ย้ายไป AU</div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">เงินเดือน</span><span className="font-mono font-semibold">{fmtThb(Math.round(grossAnnual / 12 * AUD_TO_THB))}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">ภาษี+Medicare</span><span className="font-mono text-red-500">-{fmtThb(Math.round((auTax.tax + auTax.medicare) / 12 * AUD_TO_THB))}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">ค่าใช้จ่าย</span><span className="font-mono text-red-500">-{fmtThb(Math.round(totalMonthlyExp * AUD_TO_THB))}</span></div>
                    <div className="flex justify-between pt-1 border-t border-blue-200"><span className="font-semibold text-gray-700">เหลือเก็บ</span><span className="font-mono font-bold text-green-600">{fmtThb(monthlySavingsTHB)}</span></div>
                  </div>
                </div>
              </div>

              {/* Result summary */}
              {monthlySavingsTHB !== thaiMonthlySavings && (
                <div className={`text-center mt-3 p-3 rounded-xl ${monthlySavingsTHB > thaiMonthlySavings ? 'bg-green-100 border border-green-300' : 'bg-amber-100 border border-amber-300'}`}>
                  {monthlySavingsTHB > thaiMonthlySavings ? (
                    <>
                      <div className="text-green-800 font-bold text-sm">📈 ย้ายไป AU เก็บเงินได้มากกว่า!</div>
                      <div className="text-green-700 text-2xl font-bold mt-1">+{fmtThb(monthlySavingsTHB - thaiMonthlySavings)}/เดือน</div>
                      <div className="text-green-600 text-xs mt-1">1 ปีห่างกัน ~{fmtThb((monthlySavingsTHB - thaiMonthlySavings) * 12)}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-amber-800 font-bold text-sm">⚠️ อยู่ไทยเก็บได้มากกว่า</div>
                      <div className="text-amber-700 text-lg font-bold mt-1">+{fmtThb(thaiMonthlySavings - monthlySavingsTHB)}/เดือน</div>
                      <div className="text-amber-600 text-xs mt-1">ลองปรับค่าใช้จ่ายดู หรือเลือกเมือง/งานอื่น</div>
                    </>
                  )}
                </div>
              )}

              {/* Thai cost edit */}
              <div className="mt-3">
                <button onClick={() => setEditingThaiCosts(e => !e)} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200 transition-colors">
                  {editingThaiCosts ? '✕ ปิด' : '✏️ แก้ค่าใช้จ่ายไทย'}
                </button>
              </div>

              {editingThaiCosts && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 mt-2 space-y-1.5">
                  <div className="text-xs font-medium text-orange-700 mb-1">🇹🇭 ปรับค่าใช้จ่ายรายเดือน (฿/เดือน)</div>
                  {([
                    { key: 'rent', label: '🏠 ค่าเช่า' },
                    { key: 'food', label: '🍜 อาหาร' },
                    { key: 'transport', label: '🚇 เดินทาง' },
                    { key: 'utilities', label: '💡 น้ำไฟ' },
                    { key: 'phone', label: '📱 มือถือ' },
                    { key: 'entertainment', label: '🎉 สังสรรค์' },
                    { key: 'insurance', label: '🏥 ประกัน' },
                  ] as const).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <label className="text-xs text-gray-600 w-24">{label}</label>
                      <input
                        type="number" min={0}
                        className="flex-1 px-2 py-1 text-xs border border-orange-200 rounded bg-white text-right font-mono"
                        value={thaiCosts[key] || ''}
                        onBlur={e => { if (e.target.value === '') setThaiCosts(prev => ({ ...prev, [key]: 0 })) }}
                        onChange={e => setThaiCosts(prev => ({ ...prev, [key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                      />
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1.5 border-t border-orange-200 text-xs font-semibold text-orange-800">
                    <span>รวม</span><span>฿{fmt(thaiTotalLiving)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => setThaiCosts({ ...TH_LIVING_COSTS })} className="text-[10px] text-orange-500 underline hover:text-orange-700">รีเซ็ต</button>
                    <button onClick={() => setEditingThaiCosts(false)} className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors">
                      🔄 คำนวนใหม่
                    </button>
                  </div>
                </div>
              )}

              {/* AU benefits */}
              <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs text-orange-700">
                <div className="bg-white/60 rounded-lg px-2 py-1.5">🏥 Medicare ฟรี</div>
                <div className="bg-white/60 rounded-lg px-2 py-1.5">🏖️ Annual Leave 20 วัน</div>
                <div className="bg-white/60 rounded-lg px-2 py-1.5">🤒 Sick Leave 10 วัน</div>
                <div className="bg-white/60 rounded-lg px-2 py-1.5">🏦 Super 11.5%</div>
                <div className="bg-white/60 rounded-lg px-2 py-1.5 col-span-2 text-center">👶 Parental Leave 18 สัปดาห์</div>
              </div>
            </div>

            {/* Tax section */}
            <div className="result-section" style={{ background: 'linear-gradient(135deg, #F0F9FF, #EFF6FF)', borderColor: '#93C5FD' }}>
              <h4 className="text-base font-bold text-gray-800 mb-2">📊 ภาษีจริงๆ จ่ายเท่าไหร่?</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex justify-between"><span>🇦🇺 ภาษี+Medicare</span><span className="font-mono">{auTax.effectiveRate}% ≈ {fmtAud(Math.round((auTax.tax + auTax.medicare) / 12))}/เดือน</span></div>
                <div className="flex justify-between"><span>🇹🇭 ภาษี+ประกันสังคม</span><span className="font-mono">{Math.round(((thaiTax.tax + thaiTax.socialSec) / (thaiSalary * 12)) * 100)}% ≈ {fmtThb(Math.round((thaiTax.tax + thaiTax.socialSec) / 12))}/เดือน</span></div>
                <div className={`font-semibold mt-1 p-2 rounded-lg text-center ${monthlySavingsTHB > thaiMonthlySavings ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {monthlySavingsTHB > thaiMonthlySavings
                    ? `หักภาษีแล้ว เหลือเก็บมากกว่าอยู่ไทย +${fmtThb(monthlySavingsTHB - thaiMonthlySavings)}/เดือน`
                    : '⚠️ อยู่ออส เหลือเก็บน้อยกว่า — ลองปรับค่าเช่า/เมือง/การเดินทางดู'}
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
                  : <div className="text-sm text-red-700 font-semibold mt-2">❌ คะแนน Skilled ต่ำ — ลองหา Employer Sponsor (482/186) แทน</div>}
              </div>
            </div>

            {/* Non-points visa pathways — commented out, keep Employer Sponsored only for now */}
            {/* <div className="result-section" style={{ background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', borderColor: '#86EFAC' }}>
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
              </div>
            </div> */}

            {/* Tips */}
            <div className="result-section" style={{ background: '#EFF6FF', borderColor: '#93C5FD' }}>
              <h4 className="text-base font-bold text-gray-800 mb-2">💡 เคล็ดลับ</h4>
              <div className="text-sm text-gray-700 space-y-2">
                {choices['job'] === 'min' && <div>📈 <strong>หางาน Professional:</strong> Skilled Visa เงินเดือนสูงกว่า 2-3 เท่า</div>}
                {choices['housing'] !== 'share' && <div>🏠 <strong>แชร์บ้านช่วง 6 เดือนแรก:</strong> ประหยัดได้ {fmtAud(monthlyRentAu - city.rentShare)}/เดือน</div>}
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
                📋 <strong>POC Data</strong> — ข้อมูล ณ March 2026 ไม่ได้ live update อาจเปลี่ยนแปลง
                อัตราแลกเปลี่ยนผันผวนได้ ควรเช็คจาก <a href="https://www.xe.com/currencyconverter/convert/?Amount=1&From=AUD&To=THB" target="_blank" rel="noopener noreferrer" className="underline font-medium">XE.com</a> ก่อนใช้จริง
              </div>
              <div className="text-xs text-amber-700 mt-1">
                ⚠️ ไม่ใช่คำแนะนำทางกฎหมาย เป็นข้อมูลทั่วไปเท่านั้น ควรปรึกษา MARA agent ก่อนตัดสินใจ
              </div>
            </div>

            <div className="flex gap-2 mt-3 mb-2">
              <button onClick={() => setPhase('countryResults')} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium">
                ← ดูประเทศอื่น
              </button>
              <button onClick={restart} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-700 hover:shadow-md text-sm font-bold transition-all">
                🔄 ลองใหม่
              </button>
            </div>
            <div className="mb-4">
              <ShareButtons onCaptureImage={captureResultAsImage} />
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
