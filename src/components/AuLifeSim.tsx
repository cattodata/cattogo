'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  AUD_TO_THB, calculateAusTax, calculateThaiTax,
  AU_UNSKILLED_SALARY, TH_LIVING_COSTS,
  AU_CITIES, FOOD_COSTS, TRANSPORT_COSTS,
  calculateSimpleVisaScore,
} from '@/data/simulator-data'
import { occupations, POPULAR_OCCUPATIONS, searchOccupations } from '@/data/occupations'
import { ShareButtons } from './ShareButtons'

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
  { id: 'savings', title: '💰 ด่าน 1: เตรียมเงิน', sub: 'มีเงินเก็บเท่าไหร่?' },
  { id: 'predeparture', title: '📋 ด่าน 2: ค่าใช้จ่ายก่อนบิน', sub: 'ก่อนไปต้องจ่ายค่าอะไรบ้าง?' },
  { id: 'job', title: '💼 ด่าน 3: ได้งานแล้ว!', sub: 'เงินเดือนเท่าไหร่?' },
  { id: 'flight', title: '✈️ ด่าน 4: ซื้อตั๋วบินกัน!', sub: 'Business หรือ Economy?' },
  { id: 'temp', title: '🛬 ด่าน 5: ถึงแล้ว! พักไหนก่อน?', sub: 'ที่พักชั่วคราวช่วง 2 สัปดาห์แรก' },
  { id: 'housing', title: '🏠 ด่าน 6: หาบ้านอยู่จริงๆ!', sub: 'แชร์ห้อง หรือ อยู่คนเดียว?' },
  { id: 'furnish', title: '🛋️ ด่าน 7: ซื้อของเข้าบ้าน', sub: 'ตกแต่งบ้านสไตล์ไหน?' },
  { id: 'shipping', title: '📦 ด่าน 8: ขนของจากไทย', sub: 'ส่งของไปออสยังไง?' },
  { id: 'commute', title: '🚗 ด่าน 9: ไปทำงานยังไง', sub: 'ขับรถ หรือ รถไฟ?' },
  { id: 'food', title: '🍳 ด่าน 10: กินข้าวยังไง', sub: 'ทำเอง หรือ ซื้อกิน?' },
  { id: 'insurance', title: '🏥 ด่าน 11: ประกันสุขภาพ', sub: 'จัดเอง หรือ Medicare ฟรี?' },
]
const TOTAL_STAGES = STAGE_META.length

// Occupation data imported from @/data/occupations (65+ real occupations with PayScale salary data)

export function AuLifeSim() {
  const [phase, setPhase] = useState<'profile' | 'sim' | 'result'>('profile')
  const [profile, setProfile] = useState<Profile>({
    age: '', english: '', experience: '', education: '',
    thaiSalary: '50000', city: 'sydney', family: 'single', occupation: '',
  })

  // Sim state
  const [simStage, setSimStage] = useState(0)
  const [savingsInput, setSavingsInput] = useState('')
  const [isMotherLord, setIsMotherLord] = useState(false)
  const [initialAUD, setInitialAUD] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})
  const [occSearch, setOccSearch] = useState('')
  const [thaiCosts, setThaiCosts] = useState({ ...TH_LIVING_COSTS })
  const [editingThaiCosts, setEditingThaiCosts] = useState(false)
  const [visaType, setVisaType] = useState<'skilled' | 'employer'>('skilled')
  const [preDepartureOverrides, setPreDepartureOverrides] = useState<Record<string, number>>({})

  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 200)
  }, [simStage, phase])

  const up = (field: keyof Profile, val: string) => setProfile(p => ({ ...p, [field]: val }))
  const allFilled = profile.age && profile.english && profile.experience && profile.education && profile.thaiSalary && profile.occupation
  const startSim = () => { if (allFilled) setPhase('sim') }

  // ===== Derived =====
  const city = AU_CITIES[profile.city] || AU_CITIES['melbourne']
  const selectedOcc = occupations[profile.occupation]
  const salaryP10 = selectedOcc?.salaryRange.p10 || 60000
  const salaryMedian = selectedOcc?.salaryRange.median || 75000
  const salaryP90 = selectedOcc?.salaryRange.p90 || 95000
  const salaryLabel = selectedOcc?.title || 'อาชีพทั่วไป'
  const salarySourceUrl = selectedOcc?.salarySourceUrl || ''
  const salarySource = selectedOcc?.salarySource || ''

  const preDepartureCosts = useMemo(() => {
    const getVal = (key: string, def: number, skip?: boolean) => {
      const ov = preDepartureOverrides[key]
      if (ov === -1 && skip) return 0
      if (ov !== undefined && ov >= 0) return ov
      return def
    }
    // Visa 189/190 (Skilled): Primary $4,640 + Partner $2,320 + Child $1,160 (FY2025-26)
    // Visa 482 (Employer Sponsored): Primary $3,035 + Partner $3,035 + Child $760 (FY2025-26)
    const visa189 = profile.family === 'family' ? 8120 : profile.family === 'couple' ? 6960 : 4640
    const visa482 = profile.family === 'family' ? 6830 : profile.family === 'couple' ? 6070 : 3035
    const visa = visaType === 'employer' ? visa482 : visa189
    const visaLabel = visaType === 'employer' ? '📋 Visa 482 (Employer Sponsored)' : '📋 Visa 189/190 (Skilled)'
    // Skills Assessment: only required for Skilled visas, not 482
    const itOccs = ['softwareEngineer', 'dataEngineer', 'dataScientist', 'mlEngineer',
      'devopsEngineer', 'cloudArchitect', 'cybersecurityAnalyst', 'networkEngineer',
      'systemAdministrator', 'itProjectManager', 'solutionArchitect', 'uxDesigner',
      'webDeveloper', 'mobileDeveloper', 'databaseAdmin', 'businessAnalyst', 'qualityAssurance']
    const isIT = itOccs.includes(profile.occupation) || profile.occupation.toLowerCase().includes('software') || profile.occupation.toLowerCase().includes('ict')
    const saFee = visaType === 'employer' ? 0 : (isIT ? 530 : 1000)
    const saLabel = isIT ? '📝 Skills Assessment (ACS)' : '📝 Skills Assessment (VETASSESS)'
    const rawCosts: { label: string; key: string; defaultAud: number; skippable: boolean; source: string }[] = [
      { label: visaLabel, key: 'visa', defaultAud: visa, skippable: false, source: 'Home Affairs FY25-26' },
    ]
    if (visaType === 'skilled') {
      rawCosts.push({ label: saLabel, key: 'sa', defaultAud: saFee, skippable: false, source: isIT ? 'ACS' : 'VETASSESS' })
    }
    rawCosts.push(
      { label: '📖 IELTS/PTE สอบภาษา', key: 'ielts', defaultAud: 410, skippable: true, source: 'IELTS.org / PTE' },
      { label: '🏥 ตรวจสุขภาพ Medical', key: 'medical', defaultAud: 400, skippable: false, source: 'Bupa/HAP' },
      { label: '📄 เอกสาร+แปล+รับรอง', key: 'docs', defaultAud: 500, skippable: false, source: 'ประมาณ' },
    )
    return rawCosts.map(c => ({ ...c, aud: getVal(c.key, c.defaultAud, c.skippable) }))
  }, [profile.family, profile.occupation, visaType, preDepartureOverrides])
  const preDepartureTotal = preDepartureCosts.reduce((s, c) => s + c.aud, 0)

  const grossAnnual = choices['job'] === 'p90' ? salaryP90 : choices['job'] === 'p10' ? salaryP10 : choices['job'] === 'min' ? AU_UNSKILLED_SALARY : salaryMedian
  const monthlyRent = choices['housing'] === 'share' ? city.rentShare : choices['housing'] === '2bed' ? (profile.family === 'family' ? city.rentFamily : city.rent2br) : city.rent1br
  const bond = monthlyRent
  const flightCost = choices['flight'] === 'business' ? (profile.family === 'single' ? 4500 : profile.family === 'couple' ? 9000 : 13500) : choices['flight'] === 'company' ? 0 : (profile.family === 'single' ? 1100 : profile.family === 'couple' ? 2200 : 3500)
  const tempCost = choices['temp'] === 'airbnb' ? 2100 : choices['temp'] === 'hostel' ? 700 : 0
  const furnishCost = choices['furnish'] === 'nice' ? 4000 : choices['furnish'] === 'ikea' ? 2000 : choices['furnish'] === 'second' ? 800 : 0

  const shippingCost = choices['shipping'] === 'full' ? 4000 : choices['shipping'] === 'shared' ? 2000 : 0

  const oneTimeCosts = useMemo(() => {
    let total = 0
    if (simStage > 1) total += preDepartureTotal
    if (simStage > 3) total += flightCost
    if (simStage > 4) total += tempCost
    if (simStage > 5) total += bond
    if (simStage > 6) total += furnishCost
    if (simStage > 7) total += shippingCost
    return total
  }, [simStage, preDepartureTotal, flightCost, tempCost, bond, furnishCost, shippingCost])

  const balanceAUD = isMotherLord ? Infinity : initialAUD - oneTimeCosts
  const auTax = calculateAusTax(grossAnnual)
  const monthlyNet = auTax.netMonthly
  const monthlyFood = FOOD_COSTS[choices['food']]?.cost || 550
  const monthlyTransport = choices['commute'] === 'company' ? 0 : (TRANSPORT_COSTS[choices['commute']]?.cost || 200)
  const monthlyInsurance = choices['insurance'] === 'private' ? 150 : 0
  const monthlyUtils = city.utilities + city.internet
  const monthlyPhone = 50
  const monthlyMisc = 250
  const totalMonthlyExp = monthlyRent + monthlyUtils + monthlyFood + monthlyTransport + monthlyInsurance + monthlyPhone + monthlyMisc
  const monthlySavings = monthlyNet - totalMonthlyExp
  const monthlySavingsTHB = Math.round(monthlySavings * AUD_TO_THB)

  const thaiSalary = parseInt(profile.thaiSalary) || 50000
  const thaiTax = calculateThaiTax(thaiSalary * 12)
  const thaiNetMonthly = thaiTax.netMonthly
  const thaiTotalLiving = Object.values(thaiCosts).reduce((a, b) => a + b, 0)
  const thaiMonthlySavings = thaiNetMonthly - thaiTotalLiving

  const visa = calculateSimpleVisaScore(profile.age, profile.english, profile.experience, profile.education, choices['job'] === 'min' ? 'unskilled' : 'skilled')
  const finalOneTime = preDepartureTotal + flightCost + tempCost + bond + furnishCost + shippingCost

  // Handlers
  const commitSavings = (motherLord: boolean) => {
    if (motherLord) { setIsMotherLord(true); setInitialAUD(9999999) }
    else { setInitialAUD(Math.round((parseInt(savingsInput) || 0) / AUD_TO_THB)) }
    setSimStage(1)
  }
  const advanceStage = () => setSimStage(s => s + 1)
  const pick = (stageId: string, optionId: string) => { setChoices(prev => ({ ...prev, [stageId]: optionId })); setSimStage(s => s + 1) }
  const allDone = simStage >= TOTAL_STAGES
  const restart = () => { setPhase('profile'); setSimStage(0); setSavingsInput(''); setIsMotherLord(false); setInitialAUD(0); setChoices({}); setThaiCosts({ ...TH_LIVING_COSTS }); setEditingThaiCosts(false); setVisaType('skilled'); setPreDepartureOverrides({}) }

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
            <h2 className="text-2xl font-bold text-gray-800">จำลองค่าใช้จ่ายจริงที่ออสเตรเลีย</h2>
            <p className="text-sm text-gray-500 mt-1">ประมาณการค่าใช้จ่ายทั้งหมด ตั้งแต่เตรียมเงิน → ค่าบิน → ที่อยู่ → ค่าครองชีพรายเดือน</p>
          </div>

          <div className="space-y-3">
            {/* Occupation picker */}
            <div>
              <label className="form-label">💼 อาชีพ</label>
              {profile.occupation ? (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="font-medium text-sm text-blue-800">
                    {selectedOcc?.title || 'อาชีพทั่วไป (Other)'}
                  </span>
                  <button onClick={() => { up('occupation', ''); setOccSearch('') }} className="text-xs text-blue-600 underline ml-auto">เปลี่ยน</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_OCCUPATIONS.map(p => (
                      <button key={p.key} onClick={() => up('occupation', p.key)}
                        className="px-2.5 py-1.5 text-xs rounded-full bg-gray-100 hover:bg-blue-100 hover:border-blue-300 transition-colors border border-gray-200">
                        {p.emoji} {occupations[p.key]?.title}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input type="text" className="form-input text-sm" placeholder="🔍 ค้นหาอาชีพอื่น..."
                      value={occSearch} onChange={e => setOccSearch(e.target.value)} />
                    {occSearch.length >= 2 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {searchOccupations(occSearch).map(r => (
                          <button key={r.key} onClick={() => { up('occupation', r.key); setOccSearch('') }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0">
                            <span className="font-medium">{r.title}</span>
                            <span className="text-xs text-gray-400 ml-2">{r.category}</span>
                          </button>
                        ))}
                        {searchOccupations(occSearch).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-400">ไม่พบ — ลองค้นหาอีกครั้ง</div>
                        )}
                      </div>
                    )}
                  </div>
                  <button onClick={() => up('occupation', 'other-generic')}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600">
                    📦 อื่นๆ — ไม่อยู่ในรายการ
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="form-label">🗣️ IELTS (คะแนนเฉลี่ย)</label>
                <select className="form-select" value={profile.english} onChange={e => up('english', e.target.value)}>
                  <option value="">— เลือก —</option>
                  <option value="superior">IELTS 8.0+ (Superior) — 20 คะแนน</option>
                  <option value="proficient">IELTS 7.0-7.5 (Proficient) — 10 คะแนน</option>
                  <option value="competent">IELTS 6.0-6.5 (Competent) — 0 คะแนน</option>
                  <option value="low">ต่ำกว่า IELTS 6.0</option>
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
                <input type="number" className="form-input" placeholder="เช่น 50000"
                  value={profile.thaiSalary} onChange={e => up('thaiSalary', e.target.value)} />
                <div className="text-[10px] text-gray-400 mt-0.5">🔒 ข้อมูลไม่ถูกส่งไปไหน ประมวลผล local บนเครื่องคุณเท่านั้น</div>
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
          {simStage >= 1 && <Completed emoji="💰" title="เตรียมเงิน" detail={isMotherLord ? 'MOTHERLORD ∞' : `${fmtThb(parseInt(savingsInput) || 0)} = ${fmtAud(initialAUD)}`} />}
          {simStage >= 2 && <Completed emoji="📋" title="ค่าก่อนบิน" detail={`-${fmtAud(preDepartureTotal)}`} negative />}
          {simStage > 2 && choices['job'] && <Completed emoji="💼" title="ได้งาน" detail={`${fmtAud(grossAnnual)}/ปี (${choices['job'] === 'p90' ? '👑 ระดับสูง' : choices['job'] === 'p10' ? '📊 เริ่มต้น' : choices['job'] === 'min' ? 'ขั้นต่ำ' : '💼 ระดับกลาง'})`} />}
          {simStage > 3 && choices['flight'] && <Completed emoji="✈️" title="ตั๋วเครื่องบิน" detail={choices['flight'] === 'company' ? 'ฟรี! บ.ออกให้' : `-${fmtAud(flightCost)}`} negative={choices['flight'] !== 'company'} />}
          {simStage > 4 && choices['temp'] && <Completed emoji="🏨" title="พักชั่วคราว" detail={choices['temp'] === 'friend' ? 'ฟรี!' : `-${fmtAud(tempCost)}`} negative={choices['temp'] !== 'friend'} />}
          {simStage > 5 && choices['housing'] && <Completed emoji="🏠" title="บ้าน" detail={`มัดจำ -${fmtAud(bond)} + ${fmtAud(monthlyRent)}/เดือน`} negative />}
          {simStage > 6 && choices['furnish'] && <Completed emoji="🛋️" title="ของเข้าบ้าน" detail={furnishCost === 0 ? 'Furnished! $0' : `-${fmtAud(furnishCost)}`} negative={furnishCost > 0} />}
          {simStage > 7 && choices['shipping'] && <Completed emoji="📦" title="ขนของ" detail={shippingCost > 0 ? `-${fmtAud(shippingCost)}` : choices['shipping'] === 'company' ? 'บ.ออกให้!' : 'แค่กระเป๋า!'} negative={shippingCost > 0} />}
          {simStage > 8 && choices['commute'] && <Completed emoji="🚗" title="เดินทาง" detail={choices['commute'] === 'company' ? 'บ.จัดรถให้!' : `${fmtAud(monthlyTransport)}/เดือน`} />}
          {simStage > 9 && choices['food'] && <Completed emoji="🍳" title="อาหาร" detail={`${fmtAud(monthlyFood)}/เดือน`} />}
          {simStage > 10 && choices['insurance'] && <Completed emoji="🏥" title="ประกัน" detail={monthlyInsurance > 0 ? '$150/เดือน' : choices['insurance'] === 'company' ? 'บ.ออกให้!' : 'ฟรี!'} />}

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
                      <div className="text-[10px] text-gray-400 mt-0.5">🔒 ข้อมูลไม่ถูกส่งไปไหน ประมวลผล local บนเครื่องคุณเท่านั้น</div>
                    </div>
                    {savingsInput && <Opt onClick={() => commitSavings(false)}>✅ มีเงินเก็บ {fmtThb(parseInt(savingsInput))} — ไปเลย!</Opt>}
                    <Opt onClick={() => commitSavings(true)}>🤑 MOTHERLORD — เงินไม่จำกัด!</Opt>
                  </div>
                )}
                {simStage === 1 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-3">ก่อนไปต้องจ่ายทั้งหมดนี้: <span className="text-[10px] text-gray-400">(กด ✏️ แก้ราคาได้)</span></div>
                    <div className="flex gap-2 mb-3">
                      <button onClick={() => setVisaType('skilled')} className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-colors ${visaType === 'skilled' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        🎯 189/190 Skilled
                      </button>
                      <button onClick={() => setVisaType('employer')} className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-colors ${visaType === 'employer' ? 'bg-green-50 border-green-400 text-green-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        💼 482 Employer Sponsored
                      </button>
                    </div>
                    {preDepartureCosts.map((c) => (
                      <div key={c.key} className="flex justify-between py-1.5 text-sm border-b border-gray-100">
                        <span>{c.label}</span>
                        <div className="text-right flex items-center gap-1">
                          {preDepartureOverrides[c.key] === -1 ? (
                            <button onClick={() => setPreDepartureOverrides(p => { const n = { ...p }; delete n[c.key]; return n })}
                              className="text-xs text-red-400 underline">ข้าม ↩️</button>
                          ) : preDepartureOverrides[c.key] !== undefined && preDepartureOverrides[c.key] >= 0 ? (
                            <>
                              <span className="text-[10px] text-gray-400 line-through">${fmt(c.defaultAud)}</span>
                              <input type="number" min={0} className="w-20 px-1.5 py-0.5 text-xs text-right border border-blue-300 rounded font-mono bg-blue-50"
                                value={preDepartureOverrides[c.key]} onChange={e => setPreDepartureOverrides(p => ({ ...p, [c.key]: Math.max(0, parseInt(e.target.value) || 0) }))} />
                              <button onClick={() => setPreDepartureOverrides(p => { const n = { ...p }; delete n[c.key]; return n })}
                                className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="font-mono text-red-500">{c.aud > 0 ? `-${fmtAud(c.aud)}` : '$0'}</span>
                                {c.aud > 0 && <div className="text-[10px] text-gray-400">({fmtThb(Math.round(c.aud * AUD_TO_THB))})</div>}
                              </div>
                              <button onClick={() => setPreDepartureOverrides(p => ({ ...p, [c.key]: c.defaultAud }))}
                                className="text-xs text-gray-300 hover:text-blue-500">✏️</button>
                            </>
                          )}
                          {c.skippable && preDepartureOverrides[c.key] !== -1 && (
                            <button onClick={() => setPreDepartureOverrides(p => ({ ...p, [c.key]: -1 }))}
                              className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 whitespace-nowrap">ไม่ต้องสอบ</button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 font-bold border-t-2 border-gray-200 mt-2">
                      <span>รวม</span><span className="text-red-600">-{fmtAud(preDepartureTotal)}</span>
                    </div>
                    <Opt onClick={advanceStage}>💳 จ่ายเลย! ไม่มีทางถอยแล้ว 🔥</Opt>
                  </div>
                )}
                {simStage === 2 && (
                  <div className="space-y-2">
                    {selectedOcc && (
                      <div className="text-xs text-gray-500 mb-1 p-2 bg-gray-50 rounded-lg">
                        💰 เงินเดือน <strong>{salaryLabel}</strong> ({salarySource})
                        {salarySourceUrl && <> — <a href={salarySourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">ดูแหล่งข้อมูล</a></>}
                      </div>
                    )}
                    <Opt onClick={() => pick('job', 'p10')}><div className="font-semibold">📊 เริ่มต้น (0-2 ปีประสบการณ์)</div><div className="text-sm text-gray-500">{fmtAud(salaryP10)}/ปี ≈ {fmtThb(Math.round(salaryP10 / 12 * AUD_TO_THB))}/เดือน</div></Opt>
                    <Opt onClick={() => pick('job', 'median')}><div className="font-semibold">💼 ระดับกลาง (3-6 ปี)</div><div className="text-sm text-gray-500">{fmtAud(salaryMedian)}/ปี ≈ {fmtThb(Math.round(salaryMedian / 12 * AUD_TO_THB))}/เดือน</div></Opt>
                    <Opt onClick={() => pick('job', 'p90')}><div className="font-semibold">👑 ระดับสูง (7+ ปี)</div><div className="text-sm text-gray-500">{fmtAud(salaryP90)}/ปี ≈ {fmtThb(Math.round(salaryP90 / 12 * AUD_TO_THB))}/เดือน</div></Opt>
                    <Opt onClick={() => pick('job', 'min')}><div className="font-semibold">🏣 ค่าแรงขั้นต่ำ (ทำอะไรก็ได้)</div><div className="text-sm text-gray-500">{fmtAud(AU_UNSKILLED_SALARY)}/ปี ($24.10/hr × 38hr)</div></Opt>
                  </div>
                )}
                {simStage === 3 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('flight', 'eco')}><div className="font-semibold">✈️ Economy</div><div className="text-sm text-gray-500">{fmtAud(profile.family === 'single' ? 1100 : profile.family === 'couple' ? 2200 : 3500)} <span className="text-gray-400">({fmtThb(Math.round((profile.family === 'single' ? 1100 : profile.family === 'couple' ? 2200 : 3500) * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('flight', 'business')}><div className="font-semibold">💎 Business Class</div><div className="text-sm text-gray-500">{fmtAud(profile.family === 'single' ? 4500 : 9000)} <span className="text-gray-400">({fmtThb(Math.round((profile.family === 'single' ? 4500 : 9000) * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('flight', 'company')}><div className="font-semibold">🏢 บริษัทออกให้! ฟรี</div><div className="text-sm text-gray-500">$0</div></Opt>
                  </div>
                )}
                {simStage === 4 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('temp', 'airbnb')}><div className="font-semibold">🏠 Airbnb 2 สัปดาห์</div><div className="text-sm text-gray-500">~{fmtAud(2100)} <span className="text-gray-400">({fmtThb(Math.round(2100 * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('temp', 'hostel')}><div className="font-semibold">🛏️ Hostel ประหยัด</div><div className="text-sm text-gray-500">~{fmtAud(700)} <span className="text-gray-400">({fmtThb(Math.round(700 * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('temp', 'friend')}><div className="font-semibold">🤝 อาศัยเพื่อน/ญาติ</div><div className="text-sm text-gray-500">ฟรี!</div></Opt>
                    <Opt onClick={() => pick('temp', 'company')}><div className="font-semibold">💼 บริษัทจัดที่พักให้</div><div className="text-sm text-green-600">$0</div></Opt>
                  </div>
                )}
                {simStage === 5 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('housing', 'share')}><div className="font-semibold">👥 Share House</div><div className="text-sm text-gray-500">{fmtAud(city.rentShare)}/เดือน ({fmtAud(Math.round(city.rentShare * 12 / 52))}/wk) <span className="text-gray-400">{fmtThb(Math.round(city.rentShare * AUD_TO_THB))}</span></div></Opt>
                    <Opt onClick={() => pick('housing', '1bed')}><div className="font-semibold">🏠 1 Bed อยู่คนเดียว</div><div className="text-sm text-gray-500">{fmtAud(city.rent1br)}/เดือน ({fmtAud(Math.round(city.rent1br * 12 / 52))}/wk) <span className="text-gray-400">{fmtThb(Math.round(city.rent1br * AUD_TO_THB))}</span></div></Opt>
                    <Opt onClick={() => pick('housing', '2bed')}><div className="font-semibold">🏡 {profile.family === 'family' ? 'บ้าน 3 ห้องนอน' : '2 Bed'}</div><div className="text-sm text-gray-500">{fmtAud(profile.family === 'family' ? city.rentFamily : city.rent2br)}/เดือน ({fmtAud(Math.round((profile.family === 'family' ? city.rentFamily : city.rent2br) * 12 / 52))}/wk) <span className="text-gray-400">{fmtThb(Math.round((profile.family === 'family' ? city.rentFamily : city.rent2br) * AUD_TO_THB))}</span></div></Opt>
                  </div>
                )}
                {simStage === 6 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('furnish', 'nice')}><div className="font-semibold">🛋️ ซื้อใหม่ดีๆ</div><div className="text-sm text-gray-500">{fmtAud(4000)} <span className="text-gray-400">({fmtThb(Math.round(4000 * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('furnish', 'ikea')}><div className="font-semibold">📦 IKEA / Kmart</div><div className="text-sm text-gray-500">{fmtAud(2000)} <span className="text-gray-400">({fmtThb(Math.round(2000 * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('furnish', 'second')}><div className="font-semibold">♻️ มือสอง Marketplace</div><div className="text-sm text-gray-500">{fmtAud(800)} <span className="text-gray-400">({fmtThb(Math.round(800 * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('furnish', 'furnished')}><div className="font-semibold">🏠 Furnished แล้ว!</div><div className="text-sm text-gray-500">$0</div></Opt>
                    <Opt onClick={() => pick('furnish', 'company')}><div className="font-semibold">💼 บริษัทจัดให้</div><div className="text-sm text-green-600">$0</div></Opt>
                  </div>
                )}
                {simStage === 7 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('shipping', 'full')}><div className="font-semibold">📦 ตู้คอนเทนเนอร์เต็ม (Full FCL)</div><div className="text-sm text-gray-500">{fmtAud(4000)} <span className="text-gray-400">({fmtThb(Math.round(4000 * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('shipping', 'shared')}><div className="font-semibold">📦 ตู้รวม LCL (Shared)</div><div className="text-sm text-gray-500">{fmtAud(2000)} <span className="text-gray-400">({fmtThb(Math.round(2000 * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('shipping', 'luggage')}><div className="font-semibold">🧳 เอาแค่กระเป๋า</div><div className="text-sm text-gray-500">$0</div></Opt>
                    <Opt onClick={() => pick('shipping', 'company')}><div className="font-semibold">💼 บริษัทขนของให้</div><div className="text-sm text-green-600">$0</div></Opt>
                  </div>
                )}
                {simStage === 8 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('commute', 'public')}><div className="font-semibold">🚇 รถไฟ/รถเมล์</div><div className="text-sm text-gray-500">{fmtAud(TRANSPORT_COSTS['public'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(TRANSPORT_COSTS['public'].cost * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('commute', 'mixed')}><div className="font-semibold">🚗 ผสม (รถไฟ+Uber)</div><div className="text-sm text-gray-500">{fmtAud(TRANSPORT_COSTS['mixed'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(TRANSPORT_COSTS['mixed'].cost * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('commute', 'car')}><div className="font-semibold">🚙 ขับรถเอง</div><div className="text-sm text-gray-500">{fmtAud(TRANSPORT_COSTS['car'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(TRANSPORT_COSTS['car'].cost * AUD_TO_THB))})</span></div><div className="text-[10px] text-gray-400">{TRANSPORT_COSTS['car'].breakdown}</div></Opt>
                    <Opt onClick={() => pick('commute', 'company')}><div className="font-semibold">💼 บริษัทจัดรถให้</div><div className="text-sm text-green-600">$0/เดือน</div></Opt>
                  </div>
                )}
                {simStage === 9 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('food', 'always')}><div className="font-semibold">🥗 ทำเองทุกมื้อ</div><div className="text-sm text-gray-500">{fmtAud(FOOD_COSTS['always'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(FOOD_COSTS['always'].cost * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('food', 'often')}><div className="font-semibold">🍳 ทำเอง+ซื้อบ้าง</div><div className="text-sm text-gray-500">{fmtAud(FOOD_COSTS['often'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(FOOD_COSTS['often'].cost * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('food', 'sometimes')}><div className="font-semibold">🍔 ซื้อกินบ่อย</div><div className="text-sm text-gray-500">{fmtAud(FOOD_COSTS['sometimes'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(FOOD_COSTS['sometimes'].cost * AUD_TO_THB))})</span></div></Opt>
                    <Opt onClick={() => pick('food', 'rarely')}><div className="font-semibold">🥡 ซื้อกินเกือบทุกมื้อ</div><div className="text-sm text-gray-500">{fmtAud(FOOD_COSTS['rarely'].cost)}/เดือน <span className="text-gray-400">({fmtThb(Math.round(FOOD_COSTS['rarely'].cost * AUD_TO_THB))})</span></div></Opt>
                  </div>
                )}
                {simStage === 10 && (
                  <div className="space-y-2">
                    <Opt onClick={() => pick('insurance', 'medicare')}><div className="font-semibold">🏥 Medicare (ฟรี!)</div><div className="text-sm text-gray-500">PR/citizen ใช้ได้ — ครอบคลุม รพ.รัฐ + GP</div></Opt>
                    <Opt onClick={() => pick('insurance', 'private')}><div className="font-semibold">🏥 Private Health Insurance</div><div className="text-sm text-gray-500">{fmtAud(150)}/เดือน — เลือก hospital ได้ ไม่ต้องรอคิว</div></Opt>
                    <Opt onClick={() => pick('insurance', 'company')}><div className="font-semibold">💼 บริษัททำให้!</div><div className="text-sm text-green-600">$0/เดือน</div></Opt>
                    <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                      ⚠️ วีซ่า <strong>482/494 (Employer Sponsored)</strong> บังคับทำ Private Health Insurance — เป็นเงื่อนไขวีซ่า ใช้ Medicare ไม่ได้ (ยกเว้นประเทศที่มี RHCA เช่น UK, NZ — ไทยไม่มี)
                    </div>
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
          <SumRow label="📦 ขนของจากไทย" aud={shippingCost} />
          <div className="flex justify-between py-2 font-bold border-t-2 border-gray-200 text-red-600">
            <span>รวมค่าเริ่มต้น</span>
            <span>-{fmtAud(finalOneTime)} ({fmtThb(Math.round(finalOneTime * AUD_TO_THB))})</span>
          </div>
        </div>

        {/* Monthly breakdown */}
        <div className="result-section">
          <h4 className="text-base font-bold text-gray-800 mb-2">📊 รายรับ-รายจ่ายรายเดือน</h4>
          <Row label="💰 เงินเดือน (gross)" val={fmtAud(Math.round(grossAnnual / 12))} note={selectedOcc ? `${salaryLabel} — ${salarySource}` : undefined} />
          <Row label="📋 ภาษี+Medicare" val={`-${fmtAud(Math.round((auTax.tax + auTax.medicare) / 12))}`} red note={`ATO FY 2025-26 Stage 3 Tax Cuts (effective rate ${auTax.effectiveRate}%) + Medicare 2%`} />
          <Row label="💵 สุทธิ (net)" val={fmtAud(monthlyNet)} green />
          <div className="border-t border-gray-200 mt-2 pt-2" />
          <Row label="🏠 ค่าเช่า" val={`-${fmtAud(monthlyRent)} (${fmtAud(Math.round(monthlyRent * 12 / 52))}/wk)`} red note={`Numbeo ${city.name} Mar 2026 — inner/mid suburbs`} />
          <Row label="🔌 ค่าน้ำไฟ+เน็ต" val={`-${fmtAud(monthlyUtils)}`} red note={`Numbeo: utilities 85m² $${city.utilities} + internet 60Mbps $${city.internet}`} />
          <Row label="🍳 อาหาร" val={`-${fmtAud(monthlyFood)}`} red note={`${FOOD_COSTS[choices['food']]?.label || 'ผสม'} — ประมาณจาก Numbeo meal prices`} />
          <Row label="🚗 เดินทาง" val={`-${fmtAud(monthlyTransport)}`} red note={TRANSPORT_COSTS[choices['commute']]?.breakdown} />
          {monthlyInsurance > 0 && <Row label="🏥 ประกัน" val={`-${fmtAud(monthlyInsurance)}`} red note="Medibank/Bupa Hospital+Extras basic cover เฉลี่ย" />}
          <Row label="📱 มือถือ+อื่นๆ" val={`-${fmtAud(monthlyPhone + monthlyMisc)}`} red note={`มือถือ $${monthlyPhone} (Numbeo avg) + ค่าใช้จ่ายจิปาถะ $${monthlyMisc}`} />
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
          <div className="flex justify-between items-center py-1 text-sm">
            <span className="text-gray-600">ค่าใช้จ่ายไทย</span>
            <span className="font-mono text-red-500">-{fmtThb(thaiTotalLiving)}</span>
          </div>
          <div className="text-[10px] text-gray-500 ml-1 -mt-1 mb-1">
            เช่า ฿{fmt(thaiCosts.rent)} + อาหาร ฿{fmt(thaiCosts.food)} + เดินทาง ฿{fmt(thaiCosts.transport)} + น้ำไฟ ฿{fmt(thaiCosts.utilities)} + มือถือ ฿{fmt(thaiCosts.phone)} + สังสรรค์ ฿{fmt(thaiCosts.entertainment)} + ประกัน ฿{fmt(thaiCosts.insurance)}
          </div>
          <button onClick={() => setEditingThaiCosts(e => !e)} className="mt-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200 transition-colors">
            {editingThaiCosts ? '✕ ปิด' : '✏️ แก้ไขค่าใช้จ่ายไทย'}
          </button>
          {editingThaiCosts && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 my-1.5 space-y-1.5">
              <div className="text-xs font-medium text-orange-700 mb-1">ปรับค่าใช้จ่ายรายเดือน (฿/เดือน)</div>
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
                  <label htmlFor={`th-cost-${key}`} className="text-xs text-gray-600 w-24">{label}</label>
                  <input
                    id={`th-cost-${key}`}
                    type="number"
                    min={0}
                    className="flex-1 px-2 py-1 text-xs border border-orange-200 rounded bg-white text-right font-mono"
                    value={thaiCosts[key] || ''}
                    onBlur={e => { if (e.target.value === '') setThaiCosts(prev => ({ ...prev, [key]: 0 })) }}
                    onChange={e => setThaiCosts(prev => ({ ...prev, [key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                  />
                </div>
              ))}
              <div className="flex justify-between items-center pt-1.5 border-t border-orange-200 text-xs font-semibold text-orange-800">
                <span>รวม</span>
                <span>฿{fmt(thaiTotalLiving)}</span>
              </div>
              <button onClick={() => setThaiCosts({ ...TH_LIVING_COSTS })} className="text-[10px] text-orange-500 underline hover:text-orange-700">
                รีเซ็ตเป็นค่าเริ่มต้น
              </button>
            </div>
          )}
          {!editingThaiCosts && (
            <div className="text-[10px] text-gray-400 ml-1 mb-1">(สมมติ: คอนโดใกล้ BTS กทม., กินข้าวแกงผสม delivery, ประกัน OPD+IPD)</div>
          )}
          <Row label="เหลือเก็บ (ไทย)" val={fmtThb(thaiMonthlySavings)} />
          <div className="border-t border-gray-200 my-2" />
          <Row label="เหลือเก็บ (ออส)" val={fmtThb(monthlySavingsTHB)} />
          <div className="font-semibold text-sm mt-2">
            {monthlySavingsTHB > thaiMonthlySavings
              ? <span className="text-green-700">💡 อยู่ออส เหลือเก็บมากกว่า +{fmtThb(monthlySavingsTHB - thaiMonthlySavings)}/เดือน</span>
              : <span className="text-red-700">⚠️ อยู่ออส เหลือเก็บน้อยกว่า — ลองปรับค่าเช่า/เมือง/การเดินทางดู</span>
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
            <div className="text-[10px] text-gray-500 mt-2">* คำนวณเบื้องต้น (อายุ + ภาษา + ประสบการณ์ + การศึกษา) ไม่รวมคะแนนโบนัส — <a href={`${basePath}/visa`} className="text-blue-600 underline">ดูคะแนนเต็มที่หน้าวีซ่า</a></div>
          </div>
        </div>

        {/* Sources */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="text-xs text-blue-700 font-medium mb-1">📊 แหล่งข้อมูล (ตรวจสอบได้ทุกตัวเลข):</div>
          <div className="text-xs text-blue-600 space-y-0.5">
            <div>• <a href="https://www.ato.gov.au/tax-rates-and-codes/tax-rates-resident" target="_blank" rel="noopener noreferrer" className="underline">ATO Tax Rates FY 2025-26</a> — Stage 3 Tax Cuts (16%/30%/37%/45%)</div>
            <div>• <a href={`https://www.numbeo.com/cost-of-living/in/${city.name}`} target="_blank" rel="noopener noreferrer" className="underline">Numbeo {city.name} Cost of Living</a> — ค่าเช่า, น้ำไฟ, อาหาร, เดินทาง (Mar 2026)</div>
            {salarySourceUrl && <div>• <a href={salarySourceUrl} target="_blank" rel="noopener noreferrer" className="underline">PayScale {salaryLabel}</a> — เงินเดือน เริ่มต้น/กลาง/สูง</div>}
            <div>• <a href="https://www.fairwork.gov.au/pay-and-wages/minimum-wages" target="_blank" rel="noopener noreferrer" className="underline">Fair Work Minimum Wage</a> — $24.95/hr (Jul 2025)</div>
            <div>• <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing" target="_blank" rel="noopener noreferrer" className="underline">Home Affairs Visa Fees</a> — 189: $4,640 / 482: $3,035 (FY2025-26)</div>
            <div>• <a href="https://www.privatehealth.gov.au/dynamic/Insurer" target="_blank" rel="noopener noreferrer" className="underline">Private Health Insurance Ombudsman</a> — ค่าประกันเฉลี่ย</div>
          </div>
          <div className="text-[10px] text-blue-500 mt-2 italic">ข้อมูลอัปเดตล่าสุด: มีนาคม 2026 — คลิกลิงก์ตรวจสอบได้เลย</div>
        </div>
      </div>

      {/* Catto Summary */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #F0FFF4, #E6FFFA)', border: '2px solid #68D391' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🐱</span>
          <h4 className="text-base font-bold text-gray-800">Catto สรุปให้</h4>
        </div>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            {monthlySavings >= 0
              ? `ถ้าย้ายไป ${city.name} ทำงาน ${salaryLabel} เงินเดือนปีละ ${fmtAud(grossAnnual)} หักภาษี+ค่าใช้จ่ายแล้ว เหลือเก็บเดือนละ ${fmtAud(monthlySavings)} (${fmtThb(monthlySavingsTHB)})`
              : `เตือนก่อนนะ — ตัวเลขออกมาติดลบเดือนละ ${fmtAud(Math.abs(monthlySavings))} ถ้าใช้จ่ายแบบนี้เงินไม่พอ ลองลดค่าเช่าหรือค่าอาหารดู`
            }
          </p>
          {monthlySavings >= 0 && (
            <p className="text-xs text-gray-600">
              {monthlySavingsTHB > thaiMonthlySavings
                ? `💪 อยู่ออส เก็บเงินได้มากกว่าอยู่ไทย +${fmtThb(monthlySavingsTHB - thaiMonthlySavings)}/เดือน`
                : '🤔 เก็บเงินได้น้อยกว่าอยู่ไทย — แต่ได้คุณภาพชีวิต สวัสดิการ และโอกาสที่ต่างออกไป'
              }
            </p>
          )}
          <p className="text-xs text-gray-500">
            💡 ค่าตั้งต้นทั้งหมด {fmtAud(finalOneTime)} ({fmtThb(Math.round(finalOneTime * AUD_TO_THB))}) —{' '}
            {!isMotherLord && initialAUD >= finalOneTime
              ? 'เงินเก็บพอ ✅'
              : !isMotherLord
                ? `ยังไม่พอ ต้องเก็บเพิ่มอีก ${fmtAud(finalOneTime - initialAUD)}`
                : 'MOTHERLORD 👑'
            }
          </p>
          {visa.score < 65 && (
            <p className="text-xs text-amber-700">
              📋 คะแนน Skilled Migration ได้ {visa.score} (ต้อง 65) — ลองดูเส้นทาง Employer Sponsored (482→186) หรือ Regional (491→191) แทนได้ที่
              {' '}<a href={`${basePath}/visa`} className="text-blue-600 underline font-medium">หน้าวีซ่า</a>
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <a href={`${basePath}/visa`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 text-center text-sm text-orange-700 font-medium hover:shadow-md transition-all">
          📋 ดูวีซ่าทั้งหมด & เส้นทาง →
        </a>
        <button onClick={restart} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 text-blue-700 hover:shadow-md text-sm font-bold transition-all">
          🔄 ลองใหม่
        </button>
      </div>

      {/* Share buttons */}
      <div className="mt-3">
        <ShareButtons />
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
      <span>{label}</span>
      <div className="text-right">
        <span className="font-mono text-red-500">{aud > 0 ? `-${fmtAud(aud)}` : '$0'}</span>
        {aud > 0 && <div className="text-[10px] text-gray-400">({fmtThb(Math.round(aud * AUD_TO_THB))})</div>}
      </div>
    </div>
  )
}

function Row({ label, val, red, green, note }: { label: string; val: string; red?: boolean; green?: boolean; note?: string }) {
  return (
    <div>
      <div className="flex justify-between py-1 text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-mono ${red ? 'text-red-500' : green ? 'text-green-600' : 'text-gray-800'}`}>{val}</span>
      </div>
      {note && <div className="text-[10px] text-gray-400 -mt-0.5 mb-0.5 ml-1">{note}</div>}
    </div>
  )
}
