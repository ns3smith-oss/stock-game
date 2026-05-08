'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'
import { signOut } from '@/lib/auth'

interface HamburgerMenuProps {
  userName?: string
  userPlan?: string | null
}

export function HamburgerMenu({ userName, userPlan }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function toggle() {
    haptics.tap()
    setOpen((v) => !v)
  }

  function close() {
    setOpen(false)
  }

  function navigate(href: string) {
    haptics.tap()
    close()
    router.push(href)
  }

  function handleSignOut() {
    haptics.tap()
    close()
    signOut()
    router.push('/')
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={toggle}
        className="flex flex-col gap-1.5 p-1 active:scale-95 transition-transform"
        aria-label="Menu"
      >
        <span className="block w-5 h-0.5 bg-brand-muted rounded-full" />
        <span className="block w-5 h-0.5 bg-brand-muted rounded-full" />
        <span className="block w-5 h-0.5 bg-brand-muted rounded-full" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-brand-surface z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="px-6 pt-12 pb-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-brand-white font-black text-lg">
              {userName ? `Hey, ${userName} 👋` : 'Stockly'}
            </p>
            <button onClick={close} className="text-brand-muted text-xl active:scale-95">✕</button>
          </div>
          {userPlan === 'pro' ? (
            <span className="inline-block bg-brand-purple/30 border border-brand-purple text-brand-purple text-xs font-bold px-3 py-1 rounded-full">
              Pro Member ⚡
            </span>
          ) : (
            <span className="inline-block bg-white/5 border border-white/10 text-brand-muted text-xs font-semibold px-3 py-1 rounded-full">
              Free Plan
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">

          <button
            onClick={() => navigate('/learn')}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-brand-white font-semibold text-sm hover:bg-white/5 active:scale-95 transition-all text-left"
          >
            <span className="text-xl w-8 text-center">📚</span>
            My Tracks
          </button>

          <div className="h-px bg-white/10 my-2" />

          {userPlan !== 'pro' && (
            <button
              onClick={() => navigate('/onboarding/plan')}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-brand-purple/20 border border-brand-purple text-brand-purple font-bold text-sm active:scale-95 transition-all text-left"
            >
              <span className="text-xl w-8 text-center">⚡</span>
              Upgrade to Pro
            </button>
          )}

          <button
            onClick={() => navigate('/glossary')}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-brand-white font-semibold text-sm hover:bg-white/5 active:scale-95 transition-all text-left"
          >
            <span className="text-xl w-8 text-center">📖</span>
            Glossary
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-brand-white font-semibold text-sm hover:bg-white/5 active:scale-95 transition-all text-left"
          >
            <span className="text-xl w-8 text-center">⚙️</span>
            Settings
          </button>

          <button
            onClick={() => navigate('/about')}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-brand-white font-semibold text-sm hover:bg-white/5 active:scale-95 transition-all text-left"
          >
            <span className="text-xl w-8 text-center">💡</span>
            About Stockly
          </button>

          <button
            onClick={() => navigate('/contact')}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-brand-white font-semibold text-sm hover:bg-white/5 active:scale-95 transition-all text-left"
          >
            <span className="text-xl w-8 text-center">✉️</span>
            Contact Us
          </button>

        </nav>

        {/* Sign out */}
        <div className="px-4 py-6 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-brand-error font-semibold text-sm hover:bg-brand-error/10 active:scale-95 transition-all text-left w-full"
          >
            <span className="text-xl w-8 text-center">🚪</span>
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}
