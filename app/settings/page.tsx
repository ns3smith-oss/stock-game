'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, updateUser, signOut } from '@/lib/auth'
import { haptics } from '@/lib/haptics'

export default function SettingsPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [plan, setPlan] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.push('/auth'); return }
    setName(user.name)
    setEmail(user.email)
    setPlan(user.plan)
  }, [router])

  function handleSave() {
    if (!name.trim()) return
    haptics.success()
    updateUser({ name: name.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleSignOut() {
    haptics.tap()
    signOut()
    router.push('/')
  }

  function clearProgress() {
    haptics.tap()
    ;['stockly_starter_progress', 'stockly_builder_progress',
      'stockly_leveler_progress', 'stockly_wealth_progress',
      'stockly_starter_xp', 'stockly_builder_xp',
      'stockly_leveler_xp', 'stockly_wealth_xp',
    ].forEach((k) => localStorage.removeItem(k))
    router.push('/learn')
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-6 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-brand-muted text-sm active:scale-95">← Back</button>
      </div>

      <div className="text-center mb-8 animate-slideUp">
        <div className="text-5xl mb-3">⚙️</div>
        <h1 className="text-2xl font-black text-brand-white">Settings</h1>
      </div>

      <div className="flex flex-col gap-6 animate-slideIn">

        {/* Profile */}
        <div className="flex flex-col gap-3">
          <h2 className="text-brand-white font-black text-sm uppercase tracking-wide pl-1">Profile</h2>

          <div className="flex flex-col gap-1">
            <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-brand-surface border-2 border-white/10 rounded-2xl px-5 py-4 text-brand-white text-sm font-medium focus:outline-none focus:border-brand-purple transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">Email</label>
            <div className="bg-brand-surface/50 border-2 border-white/5 rounded-2xl px-5 py-4">
              <p className="text-brand-muted text-sm">{email}</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full font-black text-base py-4 rounded-2xl transition-all active:scale-95 ${
              saved
                ? 'bg-brand-green/20 border-2 border-brand-green text-brand-green'
                : 'bg-brand-purple text-brand-white'
            }`}
          >
            {saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>

        {/* Plan */}
        <div className="flex flex-col gap-3">
          <h2 className="text-brand-white font-black text-sm uppercase tracking-wide pl-1">Plan</h2>
          <div className="bg-brand-surface border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-brand-white font-bold text-sm">{plan === 'pro' ? 'Pro Plan ⚡' : 'Free Plan'}</p>
              <p className="text-brand-muted text-xs mt-0.5">{plan === 'pro' ? 'All features unlocked' : 'Core lessons included'}</p>
            </div>
            {plan !== 'pro' && (
              <button
                onClick={() => router.push('/onboarding/plan')}
                className="bg-brand-purple text-brand-white text-xs font-black px-4 py-2 rounded-xl active:scale-95 transition-transform"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="flex flex-col gap-3">
          <h2 className="text-brand-muted font-black text-sm uppercase tracking-wide pl-1">Account</h2>

          <button
            onClick={clearProgress}
            className="w-full text-left px-5 py-4 bg-brand-surface border border-white/10 rounded-2xl text-brand-muted text-sm font-semibold active:scale-95 transition-transform"
          >
            Reset Learning Progress
          </button>

          <button
            onClick={handleSignOut}
            className="w-full text-left px-5 py-4 bg-brand-error/10 border border-brand-error/30 rounded-2xl text-brand-error text-sm font-semibold active:scale-95 transition-transform"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}
