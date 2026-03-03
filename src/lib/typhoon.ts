// ===== Typhoon API Client (typhoon-v2.5-30b-a3b-instruct) =====
// ถ้ามี PROXY_URL → เรียกผ่าน Cloudflare Worker (key ซ่อนใน server)
// ถ้าไม่มี → ใช้ TYPHOON_KEY จาก env var (build-time inject)

import { CURRENCY_TO_THB, CURRENCY_SYMBOLS } from '@/data/constants'

const TYPHOON_API_URL = 'https://api.opentyphoon.ai/v1/chat/completions'
const MODEL = 'typhoon-v2.5-30b-a3b-instruct'

// Config จาก env var (inject ตอน build ผ่าน NEXT_PUBLIC_*)
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL || '' // Cloudflare Worker URL
const ENV_KEY = process.env.NEXT_PUBLIC_TYPHOON_KEY || '' // Fallback: direct key

/** เรียก Typhoon API — ผ่าน proxy ถ้ามี, ไม่งั้นใช้ key ตรง */
async function callTyphoon(body: Record<string, unknown>): Promise<Response> {
  if (PROXY_URL) {
    // Proxy mode: key อยู่ฝั่ง server ไม่ส่ง Authorization header
    return fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }
  // Direct mode: ใช้ key จาก env var
  const key = getStoredApiKey()
  if (!key) throw new Error('ไม่มี API key — กรุณาตั้งค่า NEXT_PUBLIC_TYPHOON_KEY หรือ NEXT_PUBLIC_PROXY_URL')
  return fetch(TYPHOON_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  })
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GatheredData {
  goals: string[]
  occupation: string
  monthlyIncome: number
  age: string
  family: string
  ready: boolean // true = มีข้อมูลครบ พร้อมวิเคราะห์
}

export interface AIResponse {
  message: string       // ข้อความที่แสดงให้ user
  gathered: GatheredData // ข้อมูลที่เก็บได้จนถึงตอนนี้
}

/** ส่งข้อความไป Typhoon แล้วได้ AIResponse กลับมา
 * currentGathered: client-side state ปัจจุบัน — inject เข้า system message เพื่อช่วย model ที่อ่อนๆ
 */
export async function chatWithTyphoon(
  _apiKey: string,
  messages: ChatMessage[],
  currentGathered?: GatheredData,
  _retry = 0,
): Promise<AIResponse> {
  // Inject current state as a system hint before the last user message
  // so the model knows what's already collected and what's still missing
  let finalMessages = messages
  if (currentGathered) {
    const missing: string[] = []
    if (currentGathered.goals.length === 0) missing.push('goals')
    if (!currentGathered.occupation) missing.push('occupation')
    if (currentGathered.monthlyIncome === 0) missing.push('monthlyIncome')
    if (!currentGathered.age) missing.push('age')
    if (!currentGathered.family) missing.push('family')
    const stateHint = `[STATE] ข้อมูลที่เก็บได้แล้ว: ${JSON.stringify(currentGathered)}\nยังขาด: ${missing.length > 0 ? missing.join(', ') : 'ครบแล้ว! set ready: true'}`
    // Insert state hint as system message right before the last user message
    const lastIdx = finalMessages.length - 1
    finalMessages = [
      ...finalMessages.slice(0, lastIdx),
      { role: 'system' as const, content: stateHint },
      finalMessages[lastIdx],
    ]
  }

  const res = await callTyphoon({
    model: MODEL,
    messages: finalMessages,
    temperature: 0.6,
    max_tokens: 4096,
    top_p: 0.95,
    repetition_penalty: 1.05,
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    if (res.status === 401) throw new Error('API key ไม่ถูกต้อง — ตรวจสอบ Typhoon API key อีกครั้ง')
    if (res.status === 429) throw new Error('เรียก API ถี่เกินไป — รอสักครู่แล้วลองใหม่')
    // Retry once on 400/500
    if (_retry < 1 && (res.status === 400 || res.status >= 500)) {
      await new Promise(r => setTimeout(r, 1000))
      return chatWithTyphoon('', messages, currentGathered, _retry + 1)
    }
    throw new Error(`Typhoon API error ${res.status}: ${errBody.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || ''

  // Try to find JSON in response (may be embedded in text)
  const parsed = extractJSON(content)
  if (parsed) {
    return {
      message: parsed.message || 'ขอข้อมูลเพิ่มหน่อยนะ',
      gathered: {
        goals: Array.isArray(parsed.gathered?.goals) ? parsed.gathered.goals : [],
        occupation: parsed.gathered?.occupation || '',
        monthlyIncome: Number(parsed.gathered?.monthlyIncome) || 0,
        age: parsed.gathered?.age || '',
        family: parsed.gathered?.family || '',
        ready: !!parsed.gathered?.ready,
      },
    }
  }

  // Fallback: plain text — return empty gathered (client-side will merge with existing state)
  return {
    message: content || 'ขอข้อมูลเพิ่มหน่อยนะ 😊',
    gathered: { goals: [], occupation: '', monthlyIncome: 0, age: '', family: '', ready: false },
  }
}

/** Extract JSON object from text that may contain markdown/extra text */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJSON(text: string): any | null {
  // Try direct parse first
  try {
    const obj = JSON.parse(text)
    if (obj && typeof obj === 'object') return obj
  } catch { /* not pure JSON */ }

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    try {
      const obj = JSON.parse(fenceMatch[1].trim())
      if (obj && typeof obj === 'object') return obj
    } catch { /* malformed inside fence */ }
  }

  // Find JSON block that has both "message" and "gathered"
  const match = text.match(/\{[\s\S]*"message"[\s\S]*"gathered"[\s\S]*\}/)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch { /* malformed */ }
  }

  // Last resort: find any JSON object in the text
  const anyJson = text.match(/\{[\s\S]*\}/)
  if (anyJson) {
    try {
      const obj = JSON.parse(anyJson[0])
      if (obj && typeof obj === 'object' && (obj.message || obj.gathered)) return obj
    } catch { /* not valid */ }
  }

  return null
}

/** AI วิเคราะห์ผลลัพธ์ (เรียกหลัง matching เสร็จ) */
export async function analyzeResults(
  _apiKey: string,
  userContext: string,    // สรุปสิ่งที่ user บอก
  resultsContext: string, // ผลลัพธ์ top 5 countries
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `คุณเป็นผู้เชี่ยวชาญด้านการย้ายประเทศจากไทย พูดภาษาไทยเป็นกันเอง สั้นกระชับ ใช้ emoji บ้าง

วิเคราะห์ผลลัพธ์การจับคู่ประเทศให้ user:
- สรุปว่าทำไมอันดับ 1 เหมาะกับเขา (2-3 ประโยค)
- เปรียบเทียบข้อดี/ข้อเสียสั้นๆ ระหว่าง top 3
- แนะนำ next step จริงๆ 1-2 ข้อ (เช่น เตรียมสอบ IELTS, ลงทะเบียน skill assessment)
- ถ้า Australia อยู่ใน top 3 แนะนำให้ลองจำลองชีวิตจริงที่ออส (มีปุ่มให้กด)

ตอบเป็นข้อความธรรมดา ไม่ต้อง JSON ไม่เกิน 200 คำ`,
    },
    {
      role: 'user',
      content: `ข้อมูลของฉัน:\n${userContext}\n\nผลลัพธ์ประเทศที่แมตช์:\n${resultsContext}`,
    },
  ]

  const res = await callTyphoon({
    model: MODEL,
    messages,
    temperature: 0.6,
    max_tokens: 4096,
    top_p: 0.95,
    repetition_penalty: 1.05,
  })

  if (!res.ok) throw new Error('AI analysis failed')
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/** AI-powered country ranking (replaces hardcoded matchCountries) */
export async function rankCountriesWithAI(
  _apiKey: string,
  userProfile: {
    goals: string[]
    occupation: string
    monthlyIncome: number
    age: string
    family: string
  },
  countries: Array<{
    id: string; name: string; nameTH: string; flag: string
    avgSalaryUSD: number; costIndex: number; currency: string
    hotJobs: string[]; visaPaths: string[]
    pros: string[]; cons: string[]
    thaiCommunity: string
    scores: {
      costOfLiving: number; safety: number; healthcare: number; education: number
      workLifeBalance: number; taxFriendliness: number; immigrationEase: number
      jobMarket: number; climate: number; politicalStability: number
    }
  }>,
): Promise<Array<{
  countryId: string; matchPct: number; reason: string
  highlights: string[]; challenges: string[]
}>> {
  const goalLabels: Record<string, string> = {
    'money-job': 'เงินดี หางานง่าย',
    'balance': 'Work-life balance',
    'family': 'ลูกเรียนดี สวัสดิการ',
    'stable': 'การเมืองมั่นคง ปลอดภัย',
    'lifestyle': 'ย้ายง่าย เกษียณสบาย',
  }
  const userGoals = userProfile.goals.map(g => goalLabels[g] || g).join(', ')

  // CURRENCY_TO_THB + CURRENCY_SYMBOLS imported from @/data/constants at top of file

  const countrySummaries = countries.map(c => {
    const sym = CURRENCY_SYMBOLS[c.currency] || c.currency
    const thbRate = CURRENCY_TO_THB[c.currency] || 1
    const localSalary = Math.round(c.avgSalaryUSD * 34.5 / thbRate) // USD→local via THB
    const thbMonthly = Math.round(localSalary * thbRate / 12)
    return `${c.flag} ${c.id}: salary ${sym}${(localSalary / 1000).toFixed(0)}K/ปี (~${(thbMonthly / 1000).toFixed(0)}K บาท/เดือน), ` +
      `cost ${c.costIndex}% of TH, currency: ${c.currency}, ` +
      `hotJobs: ${c.hotJobs.join('/')}, visa: ${c.visaPaths.slice(0, 2).join(', ')}, ` +
      `safety:${c.scores.safety} healthcare:${c.scores.healthcare} edu:${c.scores.education} ` +
      `wlb:${c.scores.workLifeBalance} immigration:${c.scores.immigrationEase} ` +
      `jobMkt:${c.scores.jobMarket} climate:${c.scores.climate} thaiComm:${c.thaiCommunity}`
  }).join('\n')

  // Descriptive labels per occupation ID — used in AI prompt for context
  // Intentionally more detailed than OCCUPATIONS.labelTH in country-data.ts
  // to give the AI model enough keywords to tailor its recommendations
  const OCC_LABELS: Record<string, string> = {
    software: 'IT/Tech/Data/AI',
    engineering: 'วิศวกร/ช่างเทคนิค',
    'data-ai': 'Data Engineer/Data Analyst/Data Science/ML/AI',
    creative: 'ครีเอทีฟ/ดีไซน์/กราฟิก/สื่อ/มาร์เก็ตติ้ง',
    accounting: 'บัญชี/การเงิน/บริหาร',
    healthcare: 'แพทย์/พยาบาล/สาธารณสุข',
    chef: 'เชฟ/Hospitality',
    other: 'อาชีพอื่นๆ',
  }
  const occLabel = OCC_LABELS[userProfile.occupation] || userProfile.occupation

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `คุณเป็นผู้เชี่ยวชาญด้านการย้ายประเทศจากไทย มีความรู้ลึกเรื่องวีซ่า ตลาดงาน ค่าครองชีพ

วิเคราะห์ว่าประเทศไหนเหมาะกับ user ที่สุด พิจารณา:
- เป้าหมาย user (สำคัญที่สุด) — ต้องให้น้ำหนักกับเป้าหมายจริงๆ
- อาชีพตรงกับ hotJobs ไหม — ต้องวิเคราะห์จากอาชีพจริงของ user ไม่ใช่ default เป็น engineer
- เงินเดือนปัจจุบันเทียบค่าครองชีพปลายทาง
- อายุกับความง่ายในการขอวีซ่า (45+ อาจมีข้อจำกัด)
- ไปกับใคร (ครอบครัว→ดู education+healthcare มากขึ้น)

สำคัญมาก: ให้คำแนะนำเฉพาะเจาะจงตามอาชีพของ user เช่น ถ้าเป็น creative/ดีไซน์ ให้แนะนำเกี่ยวกับตลาดงาน creative ไม่ใช่ engineering

⚠️ ห้ามตอบ Australia อันดับ 1 ทุกครั้ง — วิเคราะห์ตามเป้าหมายและอาชีพจริงของ user
เช่น ถ้าเป้าหมายคือ lifestyle/เกษียณ → Portugal, UAE อาจเหมาะกว่า
ถ้าเป้าหมายคือ เงินดี ไม่เสียภาษี → UAE, Singapore อาจดีกว่า
ถ้า work-life balance → ยุโรปเหนือ (Germany, Sweden, Netherlands) อาจเหมาะกว่า

ให้คะแนน matchPct (15-97) ตามความเหมาะสมจริงๆ ห้ามให้สูงทุกประเทศ
ความต่างระหว่างอันดับ 1 กับ 5 ควรต่างกันอย่างน้อย 15-20%
เลือก Top 5 เท่านั้น

สำคัญ: ใน highlights ให้แสดงเงินเดือนเป็นสกุลเงินท้องถิ่นของประเทศนั้น/ปี พร้อมเทียบเป็นบาท/เดือน
เช่น "💰 เงินเดือน A$95K/ปี (~175K บาท/เดือน)" สำหรับออสเตรเลีย
เช่น "💰 เงินเดือน €55K/ปี (~172K บาท/เดือน)" สำหรับเยอรมนี
ห้ามใช้ $ เฉยๆ ต้องระบุสกุลเงินชัด (A$, C$, US$, €, £, ¥, S$, CHF, AED, NOK, SEK, ₩)

ตอบ JSON เท่านั้น ห้ามเขียนอธิบายก่อน/หลัง:
{"rankings":[{"countryId":"...", "matchPct":85, "reason":"เหตุผลสั้น 1-2 ประโยค", "highlights":["💰 เงินเดือน X/ปี (~Yบาท/เดือน)","✅ จุดเด่น","🔥 อาชีพ demand"], "challenges":["⚠️ ข้อควรรู้ 1","⚠️ ข้อควรรู้ 2"]}]}`,
    },
    {
      role: 'user',
      content: `ข้อมูลของฉัน:
- เป้าหมาย: ${userGoals}
- อาชีพ: ${occLabel}
- เงินเดือนปัจจุบัน: ${userProfile.monthlyIncome.toLocaleString()} บาท/เดือน
- อายุ: ${userProfile.age}
- ไปกับ: ${userProfile.family === 'single' ? 'คนเดียว' : userProfile.family === 'couple' ? 'คนรัก' : 'ครอบครัว'}

ข้อมูลประเทศ (scores 1-10):
${countrySummaries}

วิเคราะห์ Top 5 ที่เหมาะกับฉันที่สุด:`,
    },
  ]

  const res = await callTyphoon({
    model: MODEL,
    messages,
    temperature: 0.4,
    max_tokens: 4096,
    top_p: 0.95,
    repetition_penalty: 1.05,
  })

  if (!res.ok) throw new Error(`AI ranking failed: ${res.status}`)
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || ''

  // Parse rankings from AI response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any = null
  try {
    parsed = JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*"rankings"\s*:\s*\[[\s\S]*\]\s*\}/)
    if (match) { try { parsed = JSON.parse(match[0]) } catch { /* malformed */ } }
  }

  if (!parsed || !Array.isArray(parsed.rankings)) {
    throw new Error('AI ranking response invalid')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return parsed.rankings.slice(0, 5).map((r: any) => ({
    countryId: r.countryId || '',
    matchPct: Math.min(97, Math.max(15, Number(r.matchPct) || 50)),
    reason: r.reason || '',
    highlights: Array.isArray(r.highlights) ? r.highlights : [],
    challenges: Array.isArray(r.challenges) ? r.challenges : [],
  }))
}

/** ดึง API key (จาก env var ถ้ามี, หรือ localStorage ถ้า user ใส่เอง) */
export function getStoredApiKey(): string {
  // 1. Proxy mode → ไม่ต้องใช้ key client-side
  if (PROXY_URL) return 'proxy'
  // 2. Build-time env var
  if (ENV_KEY) return ENV_KEY
  // 3. User ใส่เอง (localStorage)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('typhoon_key') || ''
  }
  return ''
}

/** เก็บ API key ใน localStorage */
export function storeApiKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('typhoon_key', key)
  }
}

/** ลบ API key จาก localStorage */
export function clearApiKey() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('typhoon_key')
  }
}

/** ตรวจว่าใช้ proxy mode หรือไม่ */
export function isProxyMode(): boolean {
  return !!PROXY_URL
}
