import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DesktopSidebar } from '@/components/DesktopSidebar'

export const metadata: Metadata = {
  title: 'Stockly — Learning stocks, simplified.',
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
      <body className="min-h-screen bg-brand-black text-brand-white antialiased">
        <div className="md:flex">
          <DesktopSidebar />
          <main className="flex-1 md:ml-60 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
