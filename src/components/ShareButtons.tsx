'use client'

import { useState } from 'react'

const SITE_URL = 'https://cattodata.com/cattogo'
const SHARE_TEXT = '🐱 CattoGO — เครื่องมือช่วยตัดสินใจก่อนย้ายประเทศ สำหรับสาย Tech เปรียบเทียบเงินเดือน วีซ่า ค่าครองชีพ ข้อมูลจริง'

export function ShareButtons({ compact, onCaptureImage }: { compact?: boolean; onCaptureImage?: () => void }) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(SITE_URL)
  const encodedText = encodeURIComponent(SHARE_TEXT)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT}\n${SITE_URL}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = `${SHARE_TEXT}\n${SITE_URL}`
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const buttons = [
    {
      label: '𝕏',
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      label: 'f',
      color: 'bg-[#1877F2] hover:bg-[#166FE5]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    },
    {
      label: 'LINE',
      color: 'bg-[#06C755] hover:bg-[#05B14C]',
      url: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`,
    },
  ]

  if (compact) {
    return (
      <div className="flex items-center gap-2 justify-center">
        <span className="text-xs text-gray-400">แชร์:</span>
        {buttons.map(b => (
          <a
            key={b.label}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${b.color} text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110`}
          >
            {b.label}
          </a>
        ))}
        <button
          onClick={copyLink}
          className="bg-gray-200 hover:bg-gray-300 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
          title="Copy link"
        >
          {copied ? '✓' : '🔗'}
        </button>
        {onCaptureImage && (
          <button
            onClick={onCaptureImage}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
            title="บันทึกเป็นรูป"
          >
            📸
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #f0f7ff, #fff5f5)', border: '2px solid #e2e8f0' }}>
      <div className="text-center mb-3">
        <div className="text-sm font-semibold text-gray-700">📣 แชร์ให้เพื่อนที่อยากย้ายประเทศ!</div>
      </div>
      <div className="flex items-center justify-center gap-3">
        {buttons.map(b => (
          <a
            key={b.label}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${b.color} text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all hover:scale-105 hover:shadow-md`}
          >
            {b.label}
          </a>
        ))}
        <button
          onClick={copyLink}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 border border-gray-200"
        >
          {copied ? '✅ คัดลอกแล้ว!' : '🔗 คัดลอก'}
        </button>
      </div>
      {onCaptureImage && (
        <div className="flex justify-center mt-2">
          <button
            onClick={onCaptureImage}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105 border border-purple-200"
          >
            📸 บันทึกเป็นรูป
          </button>
        </div>
      )}
      <div className="text-center mt-2">
        <span className="text-[10px] text-gray-400">IG / TikTok → กดคัดลอกแล้ววางใน app ได้เลย</span>
      </div>
    </div>
  )
}
