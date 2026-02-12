'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  AUD_TO_THB, calculateAusTax, calculateThaiTax,
  AU_SALARIES, AU_UNSKILLED_SALARY, TH_TOTAL_LIVING,
  AU_CITIES, FOOD_COSTS, TRANSPORT_COSTS,
  calculateSimpleVisaScore,
} from '@/data/simulator-data'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

// ===== Types =====
interface Profile {
  age: string; english: string; experience: string; education: string
  thaiSalary: string; city: string; family: string; occupation: string
}

const fmt = (n: number) => Math.round(n).toLocaleString()
const fmtAud = (n: number) => `$${fmt(n)}`
const fmtThb = (n: number) => `฿${fmt(n)}`

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

const OCCUPATIONS = [
  { id: 'software', label: '💻 IT / Software' },
  { id: 'data-ai', label: '🤖 Data / AI' },
  { id: 'engineering', label: '⚙️ Engineering' },
  { id: 'accounting', label: '📊 Accounting' },
  { id: 'healthcare', label: '🏥 Healthcare' },
  { id: 'chef', label: '👨‍🍳 Chef / Hospitality' },
  { id: 'trades', label: '🔧 Trades (ช่าง)' },
  { id: 'other', label: '📦 อื่นๆ' },
]

export function AuLifeSim() {
  const [phase, setPhase] = useState<'profile' | 'sim' | 'result'>('profile')
  const [profile, setProfile] = useState<Profile>({
    age: '', english: '', experience: '', education: '',
    thaiSalary: '', city: 'melbourne', family: 'single', occupation: 'software',
  })

  // Sim state
  const [simStage, setSimStage] = useState(0)
  const [savingsInput, setSavingsInput] = useState('')
  const [isMotherLord, setIsMotherLord] = useState(false)
  const [initialAUD, setInitialAUD] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})

  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 200)
  }, [simStage, phase])

  const up = (field: keyof Profile, val: string) => setProfile(p => ({ ...p, [field]: val }))
  const allFilled = profile.age && profile.english && profile.experience && profile.education && profile.thaiSalary
  const startSim = () => { if (allFilled) setPhase('sim') }

  // ===== Derived =====
  const city = AU_CITIES[profile.city] || AU_CITIES['melbourne']
  const salaryData = AU_SALARIES[profile.occupation] || AU_SALARIES['other']

  const preDepartureCosts = useMemo(() => {
    const visa = profile.family === 'family' ? 9825 : profile.family === 'couple' ? 7365 : 4910
    return [
      { label: '📋 Visa Application Fee', aud: visa },
      { label: '📝 Skills Assessment', aud: 1000 },
      { label: '📖 IELTS/PTE สอบภาษา', aud: 400 },
      { label: '🏥 ตรวจสุขภาพ Medical', aud: 400 },
      { label: '📄 เอกสาร+แปล+รับรอง', aud: 500 },
    ]
  }, [profile.family])
  const preDepartureTotal = preDepartureCosts.reduce((s, c) => s + c.aud, 0)

  const grossAnnual = choices['job'] === 'top' ? salaryData.senior : choices['job'] === 'min' ? AU_UNSKILLED_SALARY : salaryData.mid
  const monthlyRent = choices['housing'] === 'share' ? city.rentShare : choices['housing'] === '2bed' ? (profile.family === 'family' ? city.rentFamily : city.rent2br) : city.rent1br
  const bond = monthlyRent
  const flightCost = choices['flight'] === 'business' ? (profile.family === 'single' ? 4500 : profile.family === 'couple' ? 9000 : 13500) : choices['flight'] === 'company' ? 0 : (profile.family === 'single' ? 1100 : profile.family === 'couple' ? 2200 : 3500)
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

  const thaiSalary = parseInt(profile.thaiSalary) || 40000
  const thaiTax = calculateThaiTax(thaiSalary * 12)
  const thaiNetMonthly = thaiTax.netMonthly
  const thaiMonthlySavings = thaiNetMonthly - TH_TOTAL_LIVING

  const visa = calculateSimpleVisaScore(profile.age, profile.english, profile.experience, profile.education, choices['job'] === 'min' ? 'unskilled' : 'skilled')
  const finalOneTime = preDepartureTotal + flightCost + tempCost + bond + furnishCost

  // Handlers
  const commitSavings = (motherLord: boolean) => {
    if (motherLord) { setIsMotherLord(true); setInitialAUD(9999999) }
    else { setInitialAUD(Math.round((parseInt(savingsInput) || 0) / AUD_TO_THB)) }
    setSimStage(1)
  }
  const advanceStage = () => setSimStage(s => s + 1)
  const pick = (stageId: string, optionId: string) => { setChoices(prev => ({ ...prev, [stageId]: optionId })); setSimStage(s => s + 1) }
  const allDone = simStage >= TOTAL_STAGES
  const restart = () => { setPhase('profile'); setSimStage(0); setSavingsInput(''); setIsMotherLord(false); setInitialAUD(0); setChoices({}) }

  // When all stages done → show results
  useEffect(() => {
    if (allDone && phase === 'sim') setPhase('result')
  }, [allDone, phase])

  // ================================================================
  // RENDER: PROFILE
  // ================================================================
  if (phase === 'profile') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <a href={`${basePath}/`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors bg-white/70 rounded-full px-4 py-2 shadow-sm border border-blue-100">
            ← กลับหน้าเลือกประเทศ
          </a>
        </div>

        <div className="card">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🇦🇺</div>
            <h2 className="text-2xl font-bold text-gray-800">จำลองชีวิตจริงที่ออสเตรเลีย</h2>
            <p className="text-sm text-gray-500 mt-1">ผ่าน 10 ด่าน ตั้งแต่เตรียมกระสุน → หาบ้าน → สรุปเงินเก็บ</p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">💼 อาชีพ</label>
                <select className="form-select" value={profile.occupation} onChange={e => up('occupation', e.target.value)}>
                  {OCCUPATIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">📅 อายุ</label>
                <select className="form-select" value={profile.age} onChange={e => up('age', e.target.value)}>
                  <option value="">— เลือก —</option>
                  <option value="18-24">18-24 ปี</option>
                  <option value="25-32">25-32 ปี</option>
                  <option value="33-39">33-39 ปี</option>
                  <option value="40-44">40-44 ปี</option>
                  <option value="45+">45+ ปี</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">🗣️ IELTS/PTE</label>
                <select className="form-select" value={profile.english} onChange={e => up('english', e.target.value)}>
                  <option value="">— เลือก —</option>
                  <option value="superior">8.0+ Superior</option>
                  <option value="proficient">7.0 Proficient</option>
                  <option value="competent">6.0 Competent</option>
                  <option value="low">ต่ำกว่า 6</option>
                </select>
              </div>
              <div>
                <label className="form-label">💪 ประสบการณ์</label>
                <select className="form-select" value={profile.experience} onChange={e => up('experience', e.target.value)}>
                  <option value="">— เลือก —</option>
                  <option value="0-2">0-2 ปี</option>
                  <option value="3-4">3-4 ปี</option>
                  <option value="5-7">5-7 ปี</option>
                  <option value="8+">8+ ปี</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">🎓 การศึกษา</label>
                <select className="form-select" value={profile.education} onChange={e => up('education', e.target.value)}>
                  <option value="">— เลือก —</option>
                  <option value="phd">ปริญญาเอก</option>
                  <option value="masters">ปริญญาโท</option>
                  <option value="bachelor">ปริญญาตรี</option>
                  <option value="diploma">ปวส./Diploma</option>
                  <option value="highschool">ม.6 หรือต่ำกว่า</option>
                </select>
              </div>
              <div>
                <label className="form-label">🏙️ เมืองที่จะไป</label>
                <select className="form-select" value={profile.city} onChange={e => up('city', e.target.value)}>
                  <option value="sydney">🏙️ Sydney</option>
                  <option value="melbourne">🎭 Melbourne</option>
                  <option value="brisbane">☀️ Brisbane</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">👥 ไปกับใคร</label>
                <select className="form-select" value={profile.family} onChange={e => up('family', e.target.value)}>
                  <option value="single">🧑 คนเดียว</option>
                  <option value="couple">👫 กับคนรัก</option>
                  <option value="family">👨‍👩‍👧 ครอบครัว</option>
                </select>
              </div>
              <div>
                <label className="form-label">💵 เงินเดือนไทย (บาท)</label>
                <input type="number" className="form-input" placeholder="เช่น 45000"
                  value={profile.thaiSalary} onChange={e => up('thaiSalary', e.target.value)} />
              </div>
            </div>

            {allFilled && (
              <button onClick={startSim} className="btn-primary w-full mt-2 justify-center rounded-xl py-4 text-lg animate-fade-in">
                🎮 เริ่มจำลองชีวิตกันเลย!
              </button>
            )}
          </div>
        </div>

        {/* Cross-links */}
        <div className="flex flex-col sm:flex-row gap-2">
          <a href={`${basePath}/visa`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 text-center text-sm text-orange-700 font-medium hover:shadow-md transition-all">
            📋 ดูวีซ่า & เส้นทาง →
          </a>
          <a href={`${basePath}/`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-center text-sm text-blue-700 font-medium hover:shadow-md transition-all">
            🌍 เลือกประเทศที่เหมาะ →
          </a>
        </div>
      </div>
    )
  }

  // ================================================================
  // RENDER: SIMULATION
  // ================================================================
  if (phase === 'sim') {
    return (
      <div className="sim-container">
        {/* Balance bar */}
        <div className={`balance-bar ${isMotherLord ? 'motherlord' : balanceAUD < 0 ? 'negative' : ''}`}>
          {isMotherLord
            ? <span>🏦 <strong>MOTHERLORD MODE</strong> 💰 ∞</span>
            : <span>🏦 เงินคงเหลือ: <strong>{fmtAud(balanceAUD)}</strong> <span className="bal-thb">({fmtThb(Math.round(balanceAUD * AUD_TO_THB))})</span></span>
          }
        </div>

        <div className="sim-scroll sim-scroll-with-bar">
          {/* Progress dots */}
          <div className="stage-progress">
            {STAGE_META.map((_, i) => (
              <div key={i} className={`stage-dot ${i < simStage ? 'done' : i === simStage ? 'current' : ''}`} />
            ))}
          </div>

          {/* Completed stages */}
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

          {/* Current stage */}
          {!allDone && (
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
                      <input type="number" className="form-input" placeholder="เช่น 500000" value={savingsInput} onChange={e => setSavingsInput(e.target.value)} />
                      {savingsInput && <div className="text-xs text-gray-500 mt-1">= {fmtAud(Math.round((parseInt(savingsInput) || 0) / AUD_TO_THB))} AUD</div>}
                    </div>
                    {savingsInput && <Opt onClick={() => commitSavings(false)}>✅ มีเงินเก็บ {fmtThb(parseInt(savingsInput))} — ไปเลย!</Opt>}
                    <Opt onClick={() => commitSavings(true)}>🤑 MOTHERLORD — เงินไม่จำกัด!</Opt>
                  </div>
                )}
                {simStage === 1 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-3">ก่อนไปต้องจ่ายทั้งหมดนี้:</div>
                    {preDepartureCosts.map((c, i) => (
                      <SumRow key={i} label={c.label} aud={c.aud} />
                    ))}
                    <div className="flex justify-between py-2 font-bold border-t-2 border-gray-200 mt-2">
                      <span>รวม</span><span className="text-red-600">-{fmtAud(preDepartureTotal)}</span>
                    </div>
                    <Opt onClick={advanceStage}>💳 จ่ายเลย! ไม่มีทางถอยแล้ว 🔥</Opt>
                  </div>
                )}
                {simStage === 2 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('job', 'avg')}><div className="font-semibold">💼 {salaryData.label} — Average</div><div className="text-sm text-gray-500">{fmtAud(salaryData.mid)}/ปี</div></Opt>
                    <Opt onClick={() => pick('job', 'top')}><div className="font-semibold">👑 Top Salary</div><div className="text-sm text-gray-500">{fmtAud(salaryData.senior)}/ปี</div></Opt>
                    <Opt onClick={() => pick('job', 'min')}><div className="font-semibold">🏪 งาน Casual ขั้นต่ำ</div><div className="text-sm text-gray-500">{fmtAud(AU_UNSKILLED_SALARY)}/ปี ($24.10/hr)</div></Opt>
                  </div>
                )}
                {simStage === 3 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('flight', 'eco')}><div className="font-semibold">✈️ Economy</div><div className="text-sm text-gray-500">{fmtAud(profile.family === 'single' ? 1100 : profile.family === 'couple' ? 2200 : 3500)}</div></Opt>
                    <Opt onClick={() => pick('flight', 'business')}><div className="font-semibold">💎 Business Class</div><div className="text-sm text-gray-500">{fmtAud(profile.family === 'single' ? 4500 : 9000)}</div></Opt>
                    <Opt onClick={() => pick('flight', 'company')}><div className="font-semibold">🏢 บริษัทออกให้! ฟรี</div><div className="text-sm text-gray-500">$0</div></Opt>
                  </div>
                )}
                {simStage === 4 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('temp', 'airbnb')}><div className="font-semibold">🏠 Airbnb 2 สัปดาห์</div><div className="text-sm text-gray-500">~{fmtAud(2100)}</div></Opt>
                    <Opt onClick={() => pick('temp', 'hostel')}><div className="font-semibold">🛏️ Hostel ประหยัด</div><div className="text-sm text-gray-500">~{fmtAud(700)}</div></Opt>
                    <Opt onClick={() => pick('temp', 'friend')}><div className="font-semibold">🤝 อาศัยเพื่อน/ญาติ</div><div className="text-sm text-gray-500">ฟรี!</div></Opt>
                  </div>
                )}
                {simStage === 5 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('housing', 'share')}><div className="font-semibold">👥 Share House</div><div className="text-sm text-gray-500">{fmtAud(city.rentShare)}/เดือน</div></Opt>
                    <Opt onClick={() => pick('housing', '1bed')}><div className="font-semibold">🏠 1 Bed อยู่คนเดียว</div><div className="text-sm text-gray-500">{fmtAud(city.rent1br)}/เดือน</div></Opt>
                    <Opt onClick={() => pick('housing', '2bed')}><div className="font-semibold">🏡 {profile.family === 'family' ? 'บ้าน 3 ห้องนอน' : '2 Bed'}</div><div className="text-sm text-gray-500">{fmtAud(profile.family === 'family' ? city.rentFamily : city.rent2br)}/เดือน</div></Opt>
                  </div>
                )}
                {simStage === 6 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('furnish', 'nice')}><div className="font-semibold">🛋️ ซื้อใหม่ดีๆ</div><div className="text-sm text-gray-500">{fmtAud(4000)}</div></Opt>
                    <Opt onClick={() => pick('furnish', 'ikea')}><div className="font-semibold">📦 IKEA / Kmart</div><div className="text-sm text-gray-500">{fmtAud(2000)}</div></Opt>
                    <Opt onClick={() => pick('furnish', 'second')}><div className="font-semibold">♻️ มือสอง Marketplace</div><div className="text-sm text-gray-500">{fmtAud(800)}</div></Opt>
                    <Opt onClick={() => pick('furnish', 'furnished')}><div className="font-semibold">🏠 Furnished แล้ว!</div><div className="text-sm text-gray-500">$0</div></Opt>
                  </div>
                )}
                {simStage === 7 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('commute', 'public')}><div className="font-semibold">🚇 รถไฟ/รถเมล์</div><div className="text-sm text-gray-500">{fmtAud(200)}/เดือน</div></Opt>
                    <Opt onClick={() => pick('commute', 'mixed')}><div className="font-semibold">🚗 ผสม (รถไฟ+Uber)</div><div className="text-sm text-gray-500">{fmtAud(380)}/เดือน</div></Opt>
                    <Opt onClick={() => pick('commute', 'car')}><div className="font-semibold">🚙 ขับรถเอง</div><div className="text-sm text-gray-500">{fmtAud(720)}/เดือน (ผ่อน+ประกัน+น้ำมัน)</div></Opt>
                  </div>
                )}
                {simStage === 8 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('food', 'always')}><div className="font-semibold">🥗 ทำเองทุกมื้อ</div><div className="text-sm text-gray-500">{fmtAud(400)}/เดือน</div></Opt>
                    <Opt onClick={() => pick('food', 'often')}><div className="font-semibold">🍳 ทำเอง+ซื้อบ้าง</div><div className="text-sm text-gray-500">{fmtAud(550)}/เดือน</div></Opt>
                    <Opt onClick={() => pick('food', 'sometimes')}><div className="font-semibold">🍔 ซื้อกินบ่อย</div><div className="text-sm text-gray-500">{fmtAud(700)}/เดือน</div></Opt>
                    <Opt onClick={() => pick('food', 'rarely')}><div className="font-semibold">🥡 ซื้อกินเกือบทุกมื้อ</div><div className="text-sm text-gray-500">{fmtAud(900)}/เดือน</div></Opt>
                  </div>
                )}
                {simStage === 9 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('insurance', 'medicare')}><div className="font-semibold">🏥 Medicare (ฟรี!)</div><div className="text-sm text-gray-500">PR/citizen ใช้ฟรี</div></Opt>
                    <Opt onClick={() => pick('insurance', 'private')}><div className="font-semibold">🏥 Private Health</div><div className="text-sm text-gray-500">{fmtAud(150)}/เดือน</div></Opt>
                  </div>
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
  // RENDER: RESULTS
  // ================================================================
  return (
    <div className="space-y-4">
      <div className="card">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800">สรุปชีวิตจริงที่ {city.name}!</h2>
          <p className="text-sm text-gray-500">ทุกตัวเลขคำนวณจากข้อมูลจริง</p>
        </div>

        {/* One-time costs */}
        <div className="result-section">
          <h4 className="text-base font-bold text-gray-800 mb-2">💸 ค่าใช้จ่ายก่อนเริ่มต้น (ครั้งเดียว)</h4>
          <SumRow label="📋 วีซ่า+เอกสาร+สอบ+ตรวจ" aud={preDepartureTotal} />
          <SumRow label="✈️ ตั๋วเครื่องบิน" aud={flightCost} />
          <SumRow label="🏨 ที่พักชั่วคราว" aud={tempCost} />
          <SumRow label="🏠 มัดจำบ้าน" aud={bond} />
          <SumRow label="🛋️ ของเข้าบ้าน" aud={furnishCost} />
          <div className="flex justify-between py-2 font-bold border-t-2 border-gray-200 text-red-600">
            <span>รวมค่าเริ่มต้น</span>
            <span>-{fmtAud(finalOneTime)} ({fmtThb(Math.round(finalOneTime * AUD_TO_THB))})</span>
          </div>
        </div>

        {/* Monthly breakdown */}
        <div className="result-section">
          <h4 className="text-base font-bold text-gray-800 mb-2">📊 รายรับ-รายจ่ายรายเดือน</h4>
          <Row label="💰 เงินเดือน (gross)" val={fmtAud(Math.round(grossAnnual / 12))} />
          <Row label="📋 ภาษี+Medicare" val={`-${fmtAud(Math.round((auTax.tax + auTax.medicare) / 12))}`} red />
          <Row label="💵 สุทธิ (net)" val={fmtAud(monthlyNet)} green />
          <div className="border-t border-gray-200 mt-2 pt-2" />
          <Row label="🏠 ค่าเช่า" val={`-${fmtAud(monthlyRent)}`} red />
          <Row label="🔌 ค่าน้ำไฟ+เน็ต" val={`-${fmtAud(monthlyUtils)}`} red />
          <Row label="🍳 อาหาร" val={`-${fmtAud(monthlyFood)}`} red />
          <Row label="🚗 เดินทาง" val={`-${fmtAud(monthlyTransport)}`} red />
          {monthlyInsurance > 0 && <Row label="🏥 ประกัน" val={`-${fmtAud(monthlyInsurance)}`} red />}
          <Row label="📱 มือถือ+อื่นๆ" val={`-${fmtAud(monthlyPhone + monthlyMisc)}`} red />
          <div className="flex justify-between py-2 font-bold border-t-2 border-gray-200 mt-2">
            <span>💰 เหลือเก็บ/เดือน</span>
            <span className={monthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}>
              {fmtAud(monthlySavings)} ({fmtThb(monthlySavingsTHB)})
            </span>
          </div>
        </div>

        {/* TH vs AU comparison */}
        <div className="result-section" style={{ background: '#FFF7ED', borderColor: '#FDBA74' }}>
          <h4 className="text-base font-bold text-gray-800 mb-2">🇹🇭 vs 🇦🇺 เปรียบเทียบ</h4>
          <Row label="เงินเดือนไทย (net)" val={fmtThb(thaiNetMonthly)} />
          <Row label="ค่าใช้จ่ายไทย" val={`-${fmtThb(TH_TOTAL_LIVING)}`} />
          <Row label="เหลือเก็บ (ไทย)" val={fmtThb(thaiMonthlySavings)} />
          <div className="border-t border-gray-200 my-2" />
          <Row label="เหลือเก็บ (ออส)" val={fmtThb(monthlySavingsTHB)} />
          <div className="font-semibold text-sm mt-2">
            {monthlySavingsTHB > thaiMonthlySavings
              ? <span className="text-green-700">💡 อยู่ออส เหลือเก็บมากกว่า +{fmtThb(monthlySavingsTHB - thaiMonthlySavings)}/เดือน</span>
              : <span className="text-red-700">💡 ตัวเลขไม่โกหก ลองดูแล้วตัดสินใจเอง</span>
            }
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
            {visa.score >= 65 ? <div className="text-sm text-green-700 font-semibold mt-2">✅ ผ่าน 65! สมัคร 189/190 ได้</div>
              : visa.score >= 50 ? <div className="text-sm text-yellow-700 font-semibold mt-2">⚠️ ลอง 491 Regional (+15) = {visa.score + 15}</div>
              : <div className="text-sm text-red-700 font-semibold mt-2">❌ คะแนน Skilled ต่ำ — ดูเส้นทางอื่นที่ 📋 วีซ่า & เส้นทาง</div>}
          </div>
        </div>

        {/* Sources */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="text-xs text-blue-700 font-medium mb-1">📊 แหล่งข้อมูล:</div>
          <div className="text-xs text-blue-600 space-y-0.5">
            <div>• <a href="https://www.ato.gov.au/tax-rates-and-codes/tax-rates-resident" target="_blank" rel="noopener noreferrer" className="underline">ATO Tax Rates FY 2025-26</a></div>
            <div>• <a href="https://www.numbeo.com/cost-of-living/country_result.jsp?country=Australia" target="_blank" rel="noopener noreferrer" className="underline">Numbeo AU Cost of Living</a></div>
            <div>• <a href="https://www.fairwork.gov.au/pay-and-wages/minimum-wages" target="_blank" rel="noopener noreferrer" className="underline">Fair Work Minimum Wage</a></div>
            <div>• <a href="https://www.seek.com.au/career-advice/role" target="_blank" rel="noopener noreferrer" className="underline">SEEK Salary Guide</a></div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <a href={`${basePath}/visa`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 text-center text-sm text-orange-700 font-medium hover:shadow-md transition-all">
          📋 ดูวีซ่าทั้งหมด & เส้นทาง →
        </a>
        <button onClick={restart} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium">
          🔄 ลองใหม่
        </button>
      </div>
    </div>
  )
}

// ===== Sub-components =====
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
      <span>{label}</span><span className="font-mono text-red-500">{aud > 0 ? `-${fmtAud(aud)}` : '$0'}</span>
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
