// PDF Export utility — uses jsPDF with embedded Kanit font for Thai text
// Dynamic import to keep bundle light (only loaded when user clicks export)

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export interface PdfSection {
  title?: string
  lines: string[]
}

async function loadFont(doc: import('jspdf').jsPDF, url: string, vfsName: string, fontFamily: string, style: string) {
  const res = await fetch(url)
  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const b64 = btoa(binary)
  doc.addFileToVFS(vfsName, b64)
  doc.addFont(vfsName, fontFamily, style)
}

export async function exportToPdf(filename: string, heading: string, sections: PdfSection[]) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Load Kanit font for Thai text support
  try {
    await Promise.all([
      loadFont(doc, `${basePath}/fonts/Kanit-Regular.ttf`, 'Kanit-Regular.ttf', 'Kanit', 'normal'),
      loadFont(doc, `${basePath}/fonts/Kanit-Bold.ttf`, 'Kanit-Bold.ttf', 'Kanit', 'bold'),
    ])
    doc.setFont('Kanit')
  } catch {
    // Fallback to default font if font loading fails
  }

  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  const maxW = pageW - margin * 2
  let y = 20

  const checkPage = (need: number) => {
    if (y + need > 275) {
      doc.addPage()
      y = 20
    }
  }

  // Header bar
  doc.setFillColor(30, 58, 95)
  doc.rect(0, 0, pageW, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('Kanit', 'bold')
  doc.setFontSize(18)
  doc.text('CattoGO', margin, 14)
  doc.setFont('Kanit', 'normal')
  doc.setFontSize(9)
  doc.text('cattodata.com/cattogo', margin, 22)
  doc.setFontSize(9)
  const dateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(dateStr, pageW - margin, 22, { align: 'right' })
  y = 40

  // Main heading
  doc.setTextColor(30, 58, 95)
  doc.setFont('Kanit', 'bold')
  doc.setFontSize(16)
  const headLines = doc.splitTextToSize(heading, maxW)
  doc.text(headLines, margin, y)
  y += headLines.length * 8 + 4

  // Sections
  for (const section of sections) {
    checkPage(20)

    if (section.title) {
      doc.setFontSize(12)
      doc.setFont('Kanit', 'bold')
      doc.setTextColor(37, 99, 235)
      const titleLines = doc.splitTextToSize(section.title, maxW)
      doc.text(titleLines, margin, y)
      y += titleLines.length * 6 + 2
    }

    doc.setFontSize(10)
    doc.setFont('Kanit', 'normal')
    doc.setTextColor(55, 65, 81)
    for (const line of section.lines) {
      checkPage(8)
      const wrapped = doc.splitTextToSize(line, maxW)
      doc.text(wrapped, margin, y)
      y += wrapped.length * 5 + 1
    }
    y += 4
  }

  // Footer
  checkPage(15)
  y += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, y, pageW - margin, y)
  y += 5
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('POC Data - Mar 2026 | cattodata.com/cattogo', margin, y)
  doc.text('Not legal advice', pageW - margin, y, { align: 'right' })

  doc.save(filename)
}
