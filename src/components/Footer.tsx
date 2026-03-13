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
        <p className="text-xs text-gray-400 mb-3">
          ⚠️ ข้อมูลนี้เป็นการประมาณการเท่านั้น ไม่ใช่คำแนะนำอย่างเป็นทางการ
          ผลลัพธ์จริงอาจแตกต่าง กรุณาตรวจสอบข้อมูลล่าสุดจากเว็บไซต์ทางการก่อนตัดสินใจ
          อัตราแลกเปลี่ยนผันผวนได้ ควรเช็คจาก XE.com ก่อนใช้จริง
          ปรึกษา Migration Agent ที่ได้รับอนุญาตก่อนยื่นวีซ่าจริง
        </p>
        {/* Contact & Social */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <a href="https://github.com/cattodata/cattogo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" title="GitHub">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href="https://x.com/rainflowdata" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" title="X (Twitter)">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61570184627763" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors" title="Facebook">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
        </div>
        <p className="text-xs text-gray-400">
          Built with ❤️ by <a href="https://x.com/rainflowdata" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">CattoGO</a> 🇦🇺🇹🇭 | Last updated: Mar 2026
        </p>
      </div>
    </footer>
  )
}
