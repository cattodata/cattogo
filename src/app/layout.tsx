import type { Metadata, Viewport } from 'next'
import './globals.css'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

export const metadata: Metadata = {
  title: '🌏 Life After Migration - จำลองชีวิตหลังย้ายประเทศ',
  description:
    'จำลองชีวิตจริงหลังย้ายไปต่างประเทศ ภาษี ค่าเช่า ค่ากิน ค่ารถ เหลือเก็บเท่าไหร่ เทียบกับอยู่ไทย ข้อมูลอัพเดท Feb 2026',
  keywords: ['migration', 'australia', 'visa', 'skilled worker', 'immigration'],
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Migration',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#6FA8DD',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="apple-touch-icon" href={`${basePath}/rainflow.png`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
