'use client'

import { useRouter } from 'next/navigation'
import { StocklyLogo } from '@/components/StocklyLogo'

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="max-w-sm mx-auto px-6 py-6 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-brand-muted text-sm active:scale-95">← Back</button>
      </div>

      <div className="flex flex-col items-center text-center gap-4 mb-8 animate-slideUp">
        <StocklyLogo size={72} />
        <div>
          <h1 className="text-3xl font-black text-brand-white">About Stockly</h1>
          <p className="text-brand-green font-semibold text-sm mt-1">Learning stocks, simplified.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 animate-slideIn">
        <div className="bg-brand-surface border border-white/10 rounded-3xl p-5">
          <h2 className="text-brand-white font-black text-base mb-2">Our Mission</h2>
          <p className="text-brand-muted text-sm leading-relaxed">
            Stockly was built for people who were never given access to financial education — especially women, young adults, and first-generation wealth builders. We believe investing should feel like something for you, not just for Wall Street.
          </p>
        </div>

        <div className="bg-brand-surface border border-white/10 rounded-3xl p-5">
          <h2 className="text-brand-white font-black text-base mb-2">What We Do</h2>
          <p className="text-brand-muted text-sm leading-relaxed">
            We break down stocks, markets, and investing into short, interactive lessons — the same way Duolingo teaches languages. No jargon. No judgment. Just the real knowledge you need to start building wealth.
          </p>
        </div>

        <div className="bg-brand-surface border border-white/10 rounded-3xl p-5">
          <h2 className="text-brand-white font-black text-base mb-2">Built With You in Mind</h2>
          <p className="text-brand-muted text-sm leading-relaxed">
            Every lesson is written to be practical — not just educational. By the time you complete all three tracks, you'll have the knowledge to open a brokerage account, research a company, and make your first trade with confidence.
          </p>
        </div>
      </div>
    </div>
  )
}
