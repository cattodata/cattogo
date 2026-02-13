'use client'

import { useMemo } from 'react'
import type { FormData, CityKey, FamilyStatus } from '@/lib/types'
import {
  calculateFeasibility,
  calculateBudget,
  calculateParity,
  calculateScoreQuiet,
} from '@/lib/calculations'
import { occupations } from '@/data/occupations'

interface SummaryStepProps {
  formData: FormData
  exchangeRate: number
  lastUpdate: string | null
  goToStep: (n: number) => void
}

export function SummaryStep({
  formData,
  exchangeRate,
  lastUpdate,
  goToStep,
}: SummaryStepProps) {
  const score = useMemo(
    () =>
      calculateScoreQuiet(
        formData.age,
        formData.englishLevel,
        formData.experience,
        formData.australianExperience,
        formData.education,
        formData.partnerStatus,
        formData.australianStudy,
        formData.stemQualification,
        formData.professionalYear,
        formData.naatiCertified,
        formData.regionalStudy
      ),
    [
      formData.age,
      formData.englishLevel,
      formData.experience,
      formData.australianExperience,
      formData.education,
      formData.partnerStatus,
      formData.australianStudy,
      formData.stemQualification,
      formData.professionalYear,
      formData.naatiCertified,
      formData.regionalStudy,
    ]
  )

  const feasibility = useMemo(
    () =>
      calculateFeasibility(
        formData.age,
        formData.englishLevel,
        formData.experience,
        formData.australianExperience,
        formData.education,
        formData.partnerStatus,
        formData.australianStudy,
        formData.stemQualification,
        formData.professionalYear,
        formData.naatiCertified,
        formData.regionalStudy
      ),
    [
      formData.age,
      formData.englishLevel,
      formData.experience,
      formData.australianExperience,
      formData.education,
      formData.partnerStatus,
      formData.australianStudy,
      formData.stemQualification,
      formData.professionalYear,
      formData.naatiCertified,
      formData.regionalStudy,
    ]
  )

  const budget = useMemo(() => {
    if (!formData.city || !formData.familyStatus) return null
    return calculateBudget(
      formData.city as CityKey,
      formData.familyStatus as FamilyStatus
    )
  }, [formData.city, formData.familyStatus])

  const parity = useMemo(() => {
    if (!formData.thaiSalary) return null
    return calculateParity(Number(formData.thaiSalary), exchangeRate)
  }, [formData.thaiSalary, exchangeRate])

  const selectedOcc = formData.occupation ? occupations[formData.occupation] : null

  const fmt = (n: number) => `$${n.toLocaleString()}`
  const fmtTHB = (n: number) => `฿${n.toLocaleString()}`

  // Overall assessment
  const getOverallVerdict = () => {
    let positives = 0
    let negatives = 0

    if (score >= 75) positives++
    else negatives++

    if (selectedOcc) {
      if (selectedOcc.demand === 'สูงมาก' || selectedOcc.demand === 'สูง') positives++
      else negatives++
    }

    if (parity && selectedOcc) {
      if (selectedOcc.salaryRange.median >= (parity.requiredAusAnnual || 0)) positives++
      else negatives++
    }

    if (positives >= 2) return { emoji: '🟢', text: 'มีโอกาสดี', color: 'success' }
    if (positives >= 1) return { emoji: '🟡', text: 'พอเป็นไปได้', color: 'warning' }
    return { emoji: '🔴', text: 'ยังต้องเตรียมตัวเพิ่ม', color: 'danger' }
  }

  const verdict = getOverallVerdict()

  const cityNames: Record<string, string> = {
    sydney: 'Sydney',
    melbourne: 'Melbourne',
    brisbane: 'Brisbane',
  }

  const familyNames: Record<string, string> = {
    single: 'คนเดียว',
    couple: 'คู่ ไม่มีลูก',
    family: 'ครอบครัว มีลูก',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Verdict */}
      <div className={`info-box ${verdict.color}`}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{verdict.emoji}</span>
          <div>
            <p className="font-bold text-xl">{verdict.text}</p>
            <p className="text-sm opacity-80">
              สรุปจากคะแนนวีซ่า, อาชีพที่เลือก, และรายได้ของคุณ
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Visa Score */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50">
          <h3 className="font-bold text-gray-800">📋 คะแนนวีซ่า</h3>
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            ✏️ แก้ไข
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-primary">{score}</span>
              <span className="text-gray-400 text-xl"> / 130</span>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>อายุ: {formData.age || '–'}</p>
              <p>ภาษา: {formData.englishLevel || '–'}</p>
              <p>ปสก.: {formData.experience || '–'}</p>
              <p>การศึกษา: {formData.education || '–'}</p>
            </div>
          </div>
          {feasibility.visaOptions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {feasibility.visaOptions.slice(0, 3).map((v, i) => (
                <span key={i} className="pill-blue text-xs">
                  {v.type} {v.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Budget */}
      {budget && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50">
            <h3 className="font-bold text-gray-800">💰 งบประมาณ</h3>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              ✏️ แก้ไข
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">🏙️ เมือง</p>
              <p className="font-semibold">{cityNames[formData.city] || '–'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">👨‍👩‍👧 สถานะ</p>
              <p className="font-semibold">
                {familyNames[formData.familyStatus] || '–'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">📊 ค่าใช้จ่าย/เดือน</p>
              <p className="font-semibold text-blue-600">
                {fmt(budget.monthlyTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">✅ เงินเก็บที่แนะนำ</p>
              <p className="font-semibold text-green-600">
                {fmt(budget.comfortable)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Parity */}
      {parity && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="font-bold text-gray-800">⚖️ เปรียบเทียบรายได้</h3>
            <button
              type="button"
              onClick={() => goToStep(4)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              ✏️ แก้ไข
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">เงินเดือนไทย</p>
              <p className="font-semibold text-purple-600">
                {fmtTHB(Number(formData.thaiSalary))}/เดือน
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ต้องได้ใน AU (เทียบเท่า)</p>
              <p className="font-semibold text-blue-600">
                {fmt(parity.requiredAusAnnual)}/ปี
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Job Market */}
      {selectedOcc && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="font-bold text-gray-800">💼 ตลาดงาน</h3>
            <button
              type="button"
              onClick={() => goToStep(5)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              ✏️ แก้ไข
            </button>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-gray-800">{selectedOcc.title}</p>
                <p className="text-xs text-gray-500">{selectedOcc.category}</p>
              </div>
              <span className="text-sm font-bold text-green-600">
                ⚡ {selectedOcc.demand}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">💰 เงินเดือน AUD/ปี</p>
                <p className="font-semibold">
                  {fmt(selectedOcc.salaryRange.p10)} –{' '}
                  {fmt(selectedOcc.salaryRange.p90)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">📋 คะแนนขั้นต่ำ</p>
                <p className="font-semibold">{selectedOcc.minPoints} pts</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">🏠 เส้นทาง PR</p>
                <p className="font-semibold">{selectedOcc.pathToPR}</p>
              </div>
            </div>

            {/* Score vs Required */}
            {score > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-gray-50">
                <p className="text-sm">
                  {score >= selectedOcc.minPoints ? (
                    <span className="text-green-600 font-bold">
                      ✅ คะแนนคุณ ({score}) &ge; ขั้นต่ำอาชีพนี้ (
                      {selectedOcc.minPoints}) — ผ่าน!
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold">
                      ❌ คะแนนคุณ ({score}) &lt; ขั้นต่ำอาชีพนี้ (
                      {selectedOcc.minPoints}) — ต้องเพิ่ม{' '}
                      {selectedOcc.minPoints - score} คะแนน
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Sources */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        <p>
          📊 ข้อมูลจาก: Home Affairs SkillSelect Nov 2025 | PayScale AU Feb 2026 | Numbeo Feb 2026 | SEEK AU
        </p>
        <p>💱 อัตราแลกเปลี่ยน: 1 AUD = {exchangeRate.toFixed(2)} THB {lastUpdate && `(${lastUpdate})`}</p>
      </div>
    </div>
  )
}
