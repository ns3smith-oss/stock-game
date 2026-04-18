import type { Metadata, Viewport } from 'next'
import './globals.css'
import { XPBar } from '@/components/XPBar'

export const metadata: Metadata = {
  title: 'StockQuest — Learn to Trade',
  description: 'Learn stock trading through gamified lessons and a live simulator',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy text-white antialiased">
        {/* Persistent XP bar at the very top */}
        <XPBar />

        {/* Page content — push down to clear the fixed XPBar (~44px) */}
        <main className="pt-12 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
