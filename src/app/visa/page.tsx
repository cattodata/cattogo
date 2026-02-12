import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { VisaExplorer } from '@/components/VisaExplorer'

export default function VisaPage() {
  return (
    <main className="min-h-screen min-h-dvh py-3 px-3 sm:py-4 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <Header />
        <VisaExplorer />
        <Footer />
      </div>
    </main>
  )
}
