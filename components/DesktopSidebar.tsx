'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { StocklyLogo } from '@/components/StocklyLogo'
import { getCurrentUser, signOut } from '@/lib/auth'

const XP_KEYS = ['stockly_starter_xp', 'stockly_builder_xp', 'stockly_leveler_xp', 'stockly_wealth_xp']

const NAV_ITEMS = [
  { label: 'My Tracks', href: '/learn', emoji: '📚' },
  { label: 'Glossary', href: '/glossary', emoji: '📖' },
  { label: 'Settings', href: '/settings', emoji: '⚙️' },
  { label: 'About', href: '/about', emoji: 'ℹ️' },
  { label: 'Contact', href: '/contact', emoji: '✉️' },
]

export function DesktopSidebar() {
  const [userName, setUserName] = useState('')
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [totalXP, setTotalXP] = useState(0)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) return
    setUserName(user.name)
    setUserPlan(user.plan)
    const xp = XP_KEYS.reduce((sum, k) => sum + parseInt(localStorage.getItem(k) ?? '0', 10), 0)
    setTotalXP(xp)
  }, [pathname])

  function handleSignOut() {
    signOut()
    router.push('/')
  }

  const initial = userName.charAt(0).toUpperCase()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-brand-surface border-r border-white/10 px-4 py-6 fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <Link href="/learn" className="flex items-center gap-1.5 mb-8">
        <StocklyLogo size={28} />
        <span className="text-xl font-black text-brand-white tracking-tight leading-none">tockly</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-brand-purple/20 text-brand-white border border-brand-purple/40'
                  : 'text-brand-muted hover:text-brand-white hover:bg-white/5'
              }`}
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}

        <Link
          href="/onboarding/plan"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-purple hover:bg-brand-purple/10 transition-all mt-2"
        >
          <span>⭐</span>
          Upgrade to Pro
        </Link>
      </nav>

      {/* Footer: XP + User + Sign Out */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="mb-3">
          <span className="text-brand-green text-sm font-black">⚡ {totalXP} XP</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-sm font-black text-brand-white flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-brand-white text-xs font-bold truncate">{userName}</p>
            <p className="text-brand-muted text-xs capitalize">{userPlan ?? 'free'} plan</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full text-left text-xs text-brand-muted hover:text-brand-error transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
