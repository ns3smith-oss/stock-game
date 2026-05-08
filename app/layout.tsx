import type { Metadata, Viewport } from 'next'
import './globals.css'

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
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
