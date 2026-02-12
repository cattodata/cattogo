import { ToolsPage } from '@/components/ToolsPage'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function Tools() {
  return (
    <main className="min-h-screen min-h-dvh py-3 px-3 sm:py-4 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <Header />
        <ToolsPage />
        <Footer />
      </div>
    </main>
  )
}
