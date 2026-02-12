import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ChatSimulator } from '@/components/ChatSimulator'

export default function Home() {
  return (
    <main className="min-h-screen min-h-dvh py-3 px-3 sm:py-4 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <Header />
        <ChatSimulator />
        <Footer />
      </div>
    </main>
  )
}
