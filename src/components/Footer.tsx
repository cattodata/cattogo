'use client'

export function Footer() {
  return (
    <footer className="text-center mt-8 mb-4 animate-fade-in">
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '3px solid #D4E8FF', boxShadow: '0 8px 30px rgba(107, 143, 216, 0.12)' }}>
        <p className="text-sm text-gray-500 mb-3">
          📊 แหล่งข้อมูล:&nbsp;
          <a href="https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Home Affairs</a>&nbsp;|&nbsp;
          <a href="https://www.ato.gov.au/tax-rates-and-codes/tax-rates-resident" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">ATO FY25-26</a>&nbsp;|&nbsp;
          <a href="https://www.numbeo.com/cost-of-living/country_result.jsp?country=Australia" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Numbeo</a>&nbsp;|&nbsp;
          <a href="https://www.fairwork.gov.au/pay-and-wages/minimum-wages" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Fair Work</a>&nbsp;|&nbsp;
          <a href="https://www.seek.com.au/career-advice/role" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">SEEK</a>&nbsp;|&nbsp;
          <a href="https://www.xe.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">XE Rate</a>
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
          <p className="text-xs text-amber-700">
            📋 <strong>POC Data</strong> — ข้อมูล ณ March 2026 ไม่ได้ live update อาจเปลี่ยนแปลง กรุณาเช็คจากแหล่งทางการก่อนตัดสินใจ
          </p>
          <p className="text-xs text-amber-700 mt-1">
            ⚠️ ไม่ใช่คำแนะนำทางกฎหมาย เป็นข้อมูลทั่วไปเท่านั้น ควรปรึกษา MARA agent ก่อนตัดสินใจ
          </p>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          อัตราแลกเปลี่ยนผันผวนได้ ควรเช็คจาก XE.com ก่อนใช้จริง
        </p>
        {/* Contact & Social */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <a href="https://cattodata.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" title="Website">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          </a>
          <a href="https://x.com/cattodata" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" title="X (Twitter)">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61570184627763" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" title="Facebook">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="mailto:cattodata@gmail.com" className="text-gray-400 hover:text-gray-600 transition-colors" title="Email">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </a>
        </div>
        <p className="text-xs text-gray-400">
          Built with ❤️ by <a href="https://cattodata.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">cattodata.com</a> 🇦🇺🇹🇭 | Last updated: Mar 2026
        </p>
      </div>
    </footer>
  )
}
