import type { Metadata, Viewport } from 'next'
import './globals.css'
import { XPBar } from '@/components/XPBar'

export const metadata: Metadata = {
  title: 'Stockly — Learn to Trade',
  description: 'The fun, beginner-friendly way to learn stocks and start building wealth.',
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
      <body className="min-h-screen bg-brand-purple text-white antialiased">
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
