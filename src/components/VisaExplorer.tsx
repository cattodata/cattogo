'use client'

import { useState } from 'react'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

// ===== Points Calculator Helper =====
function calcPoints(age: string, english: string, exp: string, edu: string) {
  const ageScores: Record<string, number> = { '18-24': 25, '25-32': 30, '33-39': 25, '40-44': 15, '45+': 0 }
  const engScores: Record<string, number> = { superior: 20, proficient: 10, competent: 0 }
  const expScores: Record<string, number> = { '8+': 15, '5-7': 10, '3-4': 5, '0-2': 0 }
  const eduScores: Record<string, number> = { phd: 20, masters: 15, bachelor: 15, trade: 10, highschool: 0 }
  return (ageScores[age] || 0) + (engScores[english] || 0) + (expScores[exp] || 0) + (eduScores[edu] || 0)
}

// ===== Visa Data =====
const VISA_CATEGORIES = [
  {
    id: 'skilled',
    title: '🎯 Points-Based Skilled',
    subtitle: 'ต้องมี 65+ คะแนน — เหมาะกับคนมีประสบการณ์+วุฒิ',
    color: 'indigo',
    bg: 'from-indigo-50 to-blue-50',
    border: 'border-indigo-200',
    visas: [
      {
        type: '189', name: 'Skilled Independent',
        tagline: '🏆 PR ทันที ไม่ต้อง sponsor',
        howItWorks: 'ยื่น EOI ใน SkillSelect → รอ Invitation → สมัคร → ได้ PR',
        requirements: ['คะแนน 65+ (จริงๆ cut-off สูงกว่า 85-95+)', 'อาชีพอยู่ใน MLTSSL', 'Skills Assessment ผ่าน', 'IELTS 6.0+'],
        pros: ['ไม่ผูกกับนายจ้าง/รัฐ', 'เลือกอยู่ที่ไหนก็ได้', 'ได้ PR ทันที'],
        cons: ['แข่งขันสูงมาก', 'Cut-off จริง 85-95+ คะแนน', 'รอนาน 12-18 เดือน'],
        cost: '$4,640', timeline: '12-18 เดือน', prPath: '✅ ได้ PR ทันที',
      },
      {
        type: '190', name: 'Skilled Nominated',
        tagline: '🏛️ รัฐ nominate +5 คะแนน',
        howItWorks: 'สมัคร nomination จากรัฐ (NSW/VIC/QLD ฯลฯ) → ได้ +5 → ยื่น EOI → สมัคร',
        requirements: ['คะแนน 65+ (รวม +5 จาก state)', 'อาชีพอยู่ใน state list', 'Skills Assessment ผ่าน', 'IELTS 6.0+'],
        pros: ['ง่ายกว่า 189 (cut-off ต่ำกว่า)', '+5 คะแนนฟรีจากรัฐ', 'ได้ PR ทันที'],
        cons: ['ต้องอยู่รัฐนั้น 2 ปี', 'แต่ละรัฐมี list ต่างกัน'],
        cost: '$4,640', timeline: '12-18 เดือน', prPath: '✅ ได้ PR ทันที (อยู่รัฐนั้น 2 ปี)',
      },
      {
        type: '491', name: 'Skilled Work Regional',
        tagline: '🌾 +15 คะแนน! อยู่ Regional',
        howItWorks: 'ได้ nomination จาก regional area → +15 คะแนน → สมัคร → อยู่ regional 3 ปี → PR',
        requirements: ['คะแนน 65+ (รวม +15 จาก regional)', 'อาชีพอยู่ใน regional list', 'Skills Assessment ผ่าน'],
        pros: ['+15 คะแนนเยอะมาก!', 'คะแนนเริ่มต้น 50 ก็สมัครได้', 'ค่าครองชีพถูกกว่าเมืองใหญ่'],
        cons: ['ต้องอยู่ regional 3 ปี', 'ตัวเลือกงานน้อยกว่าเมืองใหญ่', 'ได้ provisional ก่อน ไม่ใช่ PR ทันที'],
        cost: '$4,640', timeline: '8-12 เดือน', prPath: '🔄 อยู่ 3 ปี → สมัคร 191 → PR',
      },
    ],
  },
  {
    id: 'employer',
    title: '💼 Employer Sponsored',
    subtitle: 'ไม่ต้องใช้คะแนน! — นายจ้างออสสนับสนุน',
    color: 'green',
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    visas: [
      {
        type: '482', name: 'Temporary Skill Shortage (TSS)',
        tagline: '🔥 ทางลัดยอดนิยม! ไม่ต้องใช้คะแนน',
        howItWorks: 'หา employer ใน AU → employer ยื่น sponsor → คุณได้ work visa → ทำงาน 2-4 ปี → สมัคร 186 PR',
        requirements: ['มี job offer จาก AU employer', 'ประสบการณ์ 2+ ปีในสาขา', 'IELTS 5.0+ (ต่ำกว่า skilled!)', 'อาชีพอยู่ใน occupation list'],
        pros: ['ไม่ต้องใช้คะแนนเลย!', 'IELTS ขั้นต่ำ 5.0 เท่านั้น', 'ได้เริ่มทำงานได้เลย', 'เส้นทาง PR ชัดเจน (482 → 186)'],
        cons: ['ต้องหา employer ที่ willing to sponsor', 'ผูกกับนายจ้าง (เปลี่ยนได้แต่ต้องทำเรื่อง)', 'นายจ้างต้องจ่าย SAF levy เพิ่ม'],
        cost: '$3,035', timeline: '3-6 เดือน (ถ้ามี job offer)', prPath: '🔄 ทำ 2 ปี → สมัคร 186 → PR',
        highlight: true,
      },
      {
        type: '186', name: 'Employer Nomination Scheme',
        tagline: '🎯 PR จาก Employer โดยตรง',
        howItWorks: 'Direct Entry: มีประสบการณ์ 3 ปี + employer nominate → PR ทันที\nTransition: จาก 482 ทำ 2 ปี → employer nominate → PR',
        requirements: ['Employer ใน AU nominate ให้', 'อายุต่ำกว่า 45 ปี', 'Skills Assessment (Direct Entry)', 'IELTS 6.0+ (Competent)'],
        pros: ['ได้ PR ทันที', 'Transition stream ง่ายกว่า (จาก 482)', 'ไม่ต้องมี points score'],
        cons: ['ต้องมี employer willing to nominate', 'Direct Entry ต้อง 3 ปีประสบการณ์', 'นายจ้างจ่าย SAF levy'],
        cost: '$4,640', timeline: '6-12 เดือน', prPath: '✅ ได้ PR ทันที',
      },
    ],
  },
  {
    id: 'student',
    title: '🎓 Student → Graduate',
    subtitle: 'เรียนจบ → ทำงาน → PR — เหมาะนักเรียน/คนเปลี่ยนสาย',
    color: 'blue',
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    visas: [
      {
        type: '500', name: 'Student Visa',
        tagline: '📚 เรียน + ทำงานพาร์ทไทม์ได้',
        howItWorks: 'สมัครเรียน (TAFE/Uni) → ได้ CoE → สมัครวีซ่า → เรียน + ทำงานได้ 48 ชม./2 สัปดาห์',
        requirements: ['ได้รับ CoE จากสถาบันที่ลงทะเบียน', 'GTE (Genuine Temporary Entrant)', 'เงินเพียงพอ ($29,710/ปี + ค่าเทอม)', 'OSHC ประกันสุขภาพนักเรียน', 'IELTS 5.5-6.5+ (แล้วแต่สถาบัน)'],
        pros: ['เริ่มต้นได้เลยไม่ต้องมีประสบการณ์', 'ทำงานพาร์ทไทม์ได้', 'จบแล้วสมัคร 485 ต่อได้', 'ได้วุฒิ AU เพิ่มคะแนนวีซ่า +5'],
        cons: ['ค่าเทอมแพง $20,000-50,000/ปี', 'ต้องเรียนจริง attendance ครบ', 'ไม่ได้ PR โดยตรง'],
        cost: '$1,600 + ค่าเทอม $20K-50K/ปี', timeline: '1-3 เดือน', prPath: '🔄 จบ → 485 → 189/190/482 → PR',
      },
      {
        type: '485', name: 'Temporary Graduate',
        tagline: '🎓 จบ AU แล้ว ทำงานต่อ 2-4 ปี',
        howItWorks: 'จบการศึกษาจาก AU → สมัคร 485 → ได้ full work rights → หางาน → สมัคร PR',
        requirements: ['จบ ป.ตรี+ จากสถาบันใน AU', 'อายุต่ำกว่า 50 ปี', 'IELTS 6.0 (Overall)', 'สมัครภายใน 6 เดือนหลังจบ'],
        pros: ['Full-time work rights ไม่จำกัด', 'เวลาเยอะในการหางาน/sponsor', 'ป.ตรี=2ปี, ป.โท=3ปี, ป.เอก=4ปี'],
        cons: ['ต้องจบจาก AU เท่านั้น', 'ไม่ได้ PR โดยตรง', 'ต้อง plan ดีๆ ว่าจะไป PR ยังไง'],
        cost: '$1,895', timeline: 'สมัครได้เลยหลังจบ', prPath: '🔄 หางาน → 482/189/190 → PR',
      },
    ],
  },
  {
    id: 'whv',
    title: '🏖️ Working Holiday',
    subtitle: 'อายุ 18-30 — ไทยมีข้อตกลงกับ AU!',
    color: 'orange',
    bg: 'from-orange-50 to-yellow-50',
    border: 'border-orange-200',
    visas: [
      {
        type: '462', name: 'Work and Holiday Visa',
        tagline: '✈️ ทำงาน+เที่ยว 12 เดือน!',
        howItWorks: 'ไทย 🇹🇭 มี agreement กับ AU → สมัครออนไลน์ → ได้วีซ่า 12 เดือน → ต่อได้ถึง 3 ปี!',
        requirements: ['อายุ 18-30 ปี ณ วันสมัคร', 'หนังสือเดินทางไทย', 'IELTS 4.5+ (ง่ายมาก)', 'ป.ตรี หรือ เรียนจบ 2+ ปี', 'เงินเพียงพอ ~$5,000 AUD', 'โควต้า 1,500 คน/ปี'],
        pros: ['ค่าวีซ่าถูกมาก $640!', 'ทำงานเต็มเวลาได้ทุกอาชีพ', 'ต่อได้ถึง 3 ปี (ทำงาน regional)', 'ใช้หาประสบการณ์ AU → เปลี่ยนวีซ่า', 'ไม่ต้องมี skill assessment'],
        cons: ['โควต้า 1,500/ปี เปิดหมดเร็ว', 'อายุ 31+ สมัครไม่ได้', 'ไม่ได้ PR โดยตรง'],
        cost: '$640', timeline: '1-3 เดือน', prPath: '🔄 หาประสบการณ์ → 482/employer sponsor → PR',
        highlight: true,
      },
    ],
  },
  {
    id: 'partner',
    title: '💑 Partner / Family',
    subtitle: 'มีคู่สมรส/แฟนเป็น AU citizen/PR',
    color: 'pink',
    bg: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    visas: [
      {
        type: '309/100', name: 'Partner Visa (Offshore)',
        tagline: '💍 สมัครจากไทย → PR ผ่านคู่สมรส',
        howItWorks: 'คู่สมรส/แฟน AU sponsor ให้ → สมัครจากนอก AU → ได้ 309 temp → อีก 2 ปี ได้ 100 permanent',
        requirements: ['คู่สมรสเป็น AU citizen/PR', 'ความสัมพันธ์จริง (de facto 12+ เดือน หรือ แต่งงาน)', 'ตรวจสุขภาพ + ประวัติอาชญากรรม'],
        pros: ['ไม่ต้องมี skills/points/English!', 'ได้ work rights ทันที (bridging visa)', 'PR ภายใน 2 ปี'],
        cons: ['แพงที่สุด $9,095!', 'รอนาน 12-24 เดือน', 'ต้องพิสูจน์ความสัมพันธ์จริง'],
        cost: '$9,095', timeline: '12-24 เดือน', prPath: '🔄 309 temp → 100 permanent (2 ปี)',
      },
      {
        type: '820/801', name: 'Partner Visa (Onshore)',
        tagline: '💑 อยู่ AU แล้ว สมัครใน AU',
        howItWorks: 'เหมือน 309/100 แต่สมัครขณะอยู่ใน AU → ได้ bridging visa E ระหว่างรอ → ทำงานได้',
        requirements: ['เหมือน 309/100', 'ต้องอยู่ใน AU ตอนสมัคร'],
        pros: ['ได้ bridging visa ทำงานได้ทันที', 'ไม่ต้องออกนอก AU', 'ผลเหมือน 309/100'],
        cons: ['แพงเท่ากัน $9,095', 'รอนาน 12-24 เดือน'],
        cost: '$9,095', timeline: '12-24 เดือน', prPath: '🔄 820 temp → 801 permanent (2 ปี)',
      },
    ],
  },
]

// ===== Decision Tree =====
const DECISION_PATHS = [
  { q: 'มีประสบการณ์ทำงาน 3+ ปี + วุฒิ ป.ตรี+', answer: '🎯 Skilled (189/190/491) หรือ 💼 482 → 186', icon: '💼' },
  { q: 'จบใหม่ ยังไม่มีประสบการณ์ อายุ 18-30', answer: '🏖️ WHV 462 เป็นจุดเริ่มต้น → หาประสบการณ์ AU', icon: '🎒' },
  { q: 'อยากเรียนต่อ ป.โท/ป.ตรี ที่ AU', answer: '🎓 Student 500 → 485 → แล้วค่อย PR', icon: '📚' },
  { q: 'มีแฟน/คู่สมรสเป็นชาว AU', answer: '💑 Partner 309/100 หรือ 820/801', icon: '💍' },
  { q: 'มี employer สนใจ sponsor', answer: '💼 482 TSS → 186 ENS → PR', icon: '🏢' },
  { q: 'คะแนนไม่ถึง 65 + ไม่มี sponsor', answer: '🎓 เรียนใน AU → เพิ่มคะแนน +5 → 485 → PR', icon: '📈' },
]

export function VisaExplorer() {
  const [expandedVisa, setExpandedVisa] = useState<string | null>(null)
  const [showCalc, setShowCalc] = useState(false)
  const [age, setAge] = useState('')
  const [english, setEnglish] = useState('')
  const [exp, setExp] = useState('')
  const [edu, setEdu] = useState('')

  const points = calcPoints(age, english, exp, edu)
  const hasInput = !!(age && english && exp && edu)

  return (
    <div className="space-y-4">
      {/* Back Link */}
      <div className="flex items-center gap-3 mb-2">
        <a href={`${basePath}/`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors bg-white/70 rounded-full px-4 py-2 shadow-sm border border-blue-100">
          ← กลับหน้าเลือกประเทศ
        </a>
      </div>

      {/* Hero */}
      <div className="card mb-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">📋 วีซ่า & เส้นทางไปออสเตรเลีย</h2>
          <p className="text-sm text-gray-500 mt-1">ดูวีซ่าทั้งหมด 10 ประเภท เลือกเส้นทางที่เหมาะกับคุณ</p>
        </div>

        {/* Quick Decision Tree */}
        <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-amber-800 mb-3">🗺️ เลือกเส้นทางเร็ว — คุณอยู่ในสถานการณ์ไหน?</h3>
          <div className="space-y-2">
            {DECISION_PATHS.map((d, i) => (
              <div key={i} className="flex gap-3 bg-white/80 rounded-lg p-3 hover:bg-white transition-colors">
                <span className="text-lg">{d.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700">{d.q}</div>
                  <div className="text-xs text-amber-700 font-semibold mt-0.5">→ {d.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Points Calculator (Collapsible) */}
      <div className="card">
        <button
          onClick={() => setShowCalc(!showCalc)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <h3 className="text-lg font-bold text-gray-800">🧮 คำนวณคะแนน Skilled Migration</h3>
            <p className="text-xs text-gray-500">กรอกข้อมูลเพื่อดูว่าได้กี่คะแนน (ต้อง 65+ สำหรับ 189/190/491)</p>
          </div>
          <span className="text-2xl text-gray-400">{showCalc ? '▲' : '▼'}</span>
        </button>

        {showCalc && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">📅 อายุ</label>
                <select className="form-select mt-1" value={age} onChange={e => setAge(e.target.value)}>
                  <option value="">เลือก</option>
                  <option value="18-24">18-24 ปี (25 คะแนน)</option>
                  <option value="25-32">25-32 ปี (30 คะแนน)</option>
                  <option value="33-39">33-39 ปี (25 คะแนน)</option>
                  <option value="40-44">40-44 ปี (15 คะแนน)</option>
                  <option value="45+">45+ ปี (0 คะแนน)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">🗣️ IELTS/PTE</label>
                <select className="form-select mt-1" value={english} onChange={e => setEnglish(e.target.value)}>
                  <option value="">เลือก</option>
                  <option value="superior">8.0+ Superior (20)</option>
                  <option value="proficient">7.0-7.9 Proficient (10)</option>
                  <option value="competent">6.0-6.9 Competent (0)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">💼 ประสบการณ์ (นอก AU)</label>
                <select className="form-select mt-1" value={exp} onChange={e => setExp(e.target.value)}>
                  <option value="">เลือก</option>
                  <option value="8+">8+ ปี (15 คะแนน)</option>
                  <option value="5-7">5-7 ปี (10 คะแนน)</option>
                  <option value="3-4">3-4 ปี (5 คะแนน)</option>
                  <option value="0-2">0-2 ปี (0 คะแนน)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">🎓 การศึกษา</label>
                <select className="form-select mt-1" value={edu} onChange={e => setEdu(e.target.value)}>
                  <option value="">เลือก</option>
                  <option value="phd">ปริญญาเอก (20)</option>
                  <option value="masters">ปริญญาโท (15)</option>
                  <option value="bachelor">ปริญญาตรี (15)</option>
                  <option value="trade">Diploma/Trade (10)</option>
                  <option value="highschool">มัธยม (0)</option>
                </select>
              </div>
            </div>

            {hasInput && (
              <div className={`rounded-xl p-4 ${points >= 65 ? 'bg-green-50 border-2 border-green-300' : points >= 50 ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-red-50 border-2 border-red-300'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">คะแนนรวม (เบื้องต้น)</span>
                  <span className={`text-3xl font-black ${points >= 65 ? 'text-green-600' : points >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{points}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">* ยังไม่รวม Partner/AU Study/NAATI/STEM/Professional Year ที่อาจเพิ่มได้อีก 5-40 คะแนน</div>
                {points >= 65 && <div className="text-sm text-green-700 font-bold mt-2">✅ ผ่าน 65 คะแนน! สมัคร 189/190/491 ได้</div>}
                {points >= 50 && points < 65 && <div className="text-sm text-yellow-700 font-bold mt-2">⚠️ ลอง 491 Regional (+15) = {points + 15} คะแนน หรือ 190 (+5) = {points + 5}</div>}
                {points < 50 && <div className="text-sm text-red-600 font-bold mt-2">❌ คะแนน Skilled ต่ำ — แต่ยังมีเส้นทาง 482/Student/WHV ดูด้านล่าง!</div>}
              </div>
            )}

            <div className="text-xs text-gray-400 text-center">
              📊 อ้างอิง: <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" target="_blank" rel="noopener noreferrer" className="underline">Home Affairs SkillSelect Points Table</a>
            </div>
          </div>
        )}
      </div>

      {/* All Visa Categories */}
      {VISA_CATEGORIES.map(cat => (
        <div key={cat.id} className="card overflow-hidden">
          <div className={`bg-gradient-to-r ${cat.bg} -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 py-4 mb-4 ${cat.border} border-b`}>
            <h3 className="text-lg font-bold text-gray-800">{cat.title}</h3>
            <p className="text-xs text-gray-600 mt-0.5">{cat.subtitle}</p>
          </div>

          <div className="space-y-3">
            {cat.visas.map(visa => {
              const isExpanded = expandedVisa === visa.type
              return (
                <div
                  key={visa.type}
                  className={`rounded-xl border-2 transition-all ${
                    visa.highlight
                      ? `border-${cat.color}-300 bg-gradient-to-r ${cat.bg} shadow-md`
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  {/* Visa Header */}
                  <button
                    onClick={() => setExpandedVisa(isExpanded ? null : visa.type)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-gray-800">Subclass {visa.type}</span>
                          <span className="text-xs font-medium text-gray-500">— {visa.name}</span>
                          {visa.highlight && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">แนะนำ</span>}
                        </div>
                        <div className="text-sm mt-1">{visa.tagline}</div>
                        <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md">💰 {visa.cost}</span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md">⏱️ {visa.timeline}</span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md">{visa.prPath}</span>
                        </div>
                      </div>
                      <span className="text-gray-400 text-lg ml-2">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-gray-100 pt-3">
                      {/* How it works */}
                      <div>
                        <div className="text-xs font-bold text-gray-700 mb-1">📋 วิธีการ:</div>
                        <div className="text-sm text-gray-600 whitespace-pre-line">{visa.howItWorks}</div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <div className="text-xs font-bold text-gray-700 mb-1">✅ เงื่อนไข:</div>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {visa.requirements.map((r, i) => <li key={i}>• {r}</li>)}
                        </ul>
                      </div>

                      {/* Pros & Cons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-lg p-2.5">
                          <div className="text-xs font-bold text-green-700 mb-1">👍 ข้อดี</div>
                          <ul className="text-xs text-green-600 space-y-0.5">
                            {visa.pros.map((p, i) => <li key={i}>✓ {p}</li>)}
                          </ul>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2.5">
                          <div className="text-xs font-bold text-red-700 mb-1">👎 ข้อจำกัด</div>
                          <ul className="text-xs text-red-600 space-y-0.5">
                            {visa.cons.map((c, i) => <li key={i}>✗ {c}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Comparison Table */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-3">📊 เปรียบเทียบเส้นทาง</h3>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 rounded-tl-lg">เส้นทาง</th>
                <th className="text-center p-2">ค่าวีซ่า</th>
                <th className="text-center p-2">ภาษาอังกฤษ</th>
                <th className="text-center p-2">เวลา→PR</th>
                <th className="text-center p-2 rounded-tr-lg">ความยาก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="p-2 font-medium">🎯 189 Skilled</td><td className="text-center p-2">$4,640</td><td className="text-center p-2">IELTS 6+</td><td className="text-center p-2">12-18 เดือน</td><td className="text-center p-2">⭐⭐⭐⭐⭐</td></tr>
              <tr><td className="p-2 font-medium">🏛️ 190 State</td><td className="text-center p-2">$4,640</td><td className="text-center p-2">IELTS 6+</td><td className="text-center p-2">12-18 เดือน</td><td className="text-center p-2">⭐⭐⭐⭐</td></tr>
              <tr><td className="p-2 font-medium">🌾 491 Regional</td><td className="text-center p-2">$4,640</td><td className="text-center p-2">IELTS 6+</td><td className="text-center p-2">3-5 ปี</td><td className="text-center p-2">⭐⭐⭐</td></tr>
              <tr className="bg-green-50"><td className="p-2 font-medium">💼 482→186</td><td className="text-center p-2">$3,035→$4,640</td><td className="text-center p-2">IELTS 5+</td><td className="text-center p-2">2-4 ปี</td><td className="text-center p-2">⭐⭐</td></tr>
              <tr><td className="p-2 font-medium">🎓 500→485→PR</td><td className="text-center p-2">$1,600+เทอม</td><td className="text-center p-2">IELTS 5.5+</td><td className="text-center p-2">4-6 ปี</td><td className="text-center p-2">⭐⭐</td></tr>
              <tr className="bg-orange-50"><td className="p-2 font-medium">🏖️ 462 WHV</td><td className="text-center p-2">$640</td><td className="text-center p-2">IELTS 4.5+</td><td className="text-center p-2">ไม่มี PR ตรง</td><td className="text-center p-2">⭐</td></tr>
              <tr><td className="p-2 font-medium">💑 309/820 Partner</td><td className="text-center p-2">$9,095</td><td className="text-center p-2">ไม่ต้อง</td><td className="text-center p-2">2 ปี</td><td className="text-center p-2">⭐⭐</td></tr>
            </tbody>
          </table>
        </div>
        <div className="text-[10px] text-gray-400 mt-2">ความยาก: ⭐=ง่าย ⭐⭐⭐⭐⭐=ยากมาก | ค่าวีซ่า=ผู้สมัครหลัก Feb 2026</div>
      </div>

      {/* Sources */}  
      <div className="card">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-700 font-medium mb-2">📊 แหล่งข้อมูล:</p>
          <div className="text-xs text-blue-600 space-y-0.5">
            <div>• <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" target="_blank" rel="noopener noreferrer" className="underline">Home Affairs — SkillSelect & Points Table</a></div>
            <div>• <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing" target="_blank" rel="noopener noreferrer" className="underline">Home Affairs — Visa Listing (ค่าธรรมเนียม)</a></div>
            <div>• <a href="https://immi.homeaffairs.gov.au/what-we-do/whm-program/latest-news/thai" target="_blank" rel="noopener noreferrer" className="underline">Home Affairs — Work and Holiday 462 (ไทย)</a></div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
          <p className="text-xs text-amber-700">
            ⚠️ ข้อมูลเป็นการสรุปเบื้องต้น อาจเปลี่ยนแปลงได้ กรุณาตรวจสอบจาก <a href="https://immi.homeaffairs.gov.au" target="_blank" rel="noopener noreferrer" className="underline font-medium">Home Affairs</a> ก่อนตัดสินใจ
            และปรึกษา Migration Agent ที่ได้รับอนุญาตก่อนยื่นวีซ่าจริง
          </p>
        </div>

        {/* Cross-link */}
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <a href={`${basePath}/sim`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-center text-sm text-green-700 font-medium hover:shadow-md transition-all">
            🇦🇺 จำลองชีวิตในออส →
          </a>
          <a href={`${basePath}/`} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-center text-sm text-blue-700 font-medium hover:shadow-md transition-all">
            🌍 เลือกประเทศที่เหมาะ →
          </a>
        </div>
      </div>
    </div>
  )
}
