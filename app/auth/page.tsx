'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'
import { signIn, signUp, getResumeRoute, resetPassword } from '@/lib/auth'
import { StocklyLogo } from '@/components/StocklyLogo'

const isDev = process.env.NODE_ENV === 'development'

function clearTestData() {
  ['stockly_users', 'stockly_session', 'stockly_terms_agreed',
   'stockly_quick_answers', 'stockly_goal', 'stockly_referral',
   'stockly_level', 'stockly_why', 'stockly_routine',
   'stockly_daily_goal', 'stockly_plan', 'stockly_start_choice',
   'stockly_knowledge_score'].forEach((k) => localStorage.removeItem(k))
  window.location.reload()
}

type View = 'signup' | 'signin' | 'forgot'

export default function AuthPage() {
  const [view, setView] = useState<View>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNew, setConfirmNew] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function switchView(v: View) {
    haptics.tap()
    setView(v)
    setError('')
    setSuccess('')
  }

  async function handleSubmit() {
    setError('')
    setSuccess('')
    haptics.tap()

    if (view === 'signup') {
      if (!name.trim()) return setError('Please enter your name.')
      if (!email.trim()) return setError('Please enter your email.')
      if (password.length < 6) return setError('Password must be at least 6 characters.')
      if (password !== confirm) return setError('Passwords do not match.')

      setLoading(true)
      const result = signUp(name.trim(), email.trim(), password)
      setLoading(false)

      if (!result.success) return setError(result.error ?? 'Something went wrong.')
      haptics.success()
      router.push('/welcome')

    } else if (view === 'signin') {
      if (!email.trim()) return setError('Please enter your email.')
      if (!password) return setError('Please enter your password.')

      setLoading(true)
      const result = signIn(email.trim(), password)
      setLoading(false)

      if (!result.success) {
        haptics.wrong()
        return setError(result.error ?? 'Something went wrong.')
      }

      haptics.success()
      router.push(getResumeRoute(result.user!))

    } else {
      // Forgot password
      if (!email.trim()) return setError('Please enter your email.')
      if (newPassword.length < 6) return setError('New password must be at least 6 characters.')
      if (newPassword !== confirmNew) return setError('Passwords do not match.')

      setLoading(true)
      const result = resetPassword(email.trim(), newPassword)
      setLoading(false)

      if (!result.success) {
        haptics.wrong()
        return setError(result.error ?? 'Something went wrong.')
      }

      haptics.success()
      setSuccess('Password updated! You can now sign in.')
      setNewPassword('')
      setConfirmNew('')
      setTimeout(() => switchView('signin'), 2000)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      {/* Logo */}
      <div className="flex justify-center mb-8 animate-slideUp">
        <div className="flex items-center -space-x-2">
          <StocklyLogo size={48} />
          <span className="text-4xl font-black text-brand-white tracking-tight leading-none">tockly</span>
        </div>
      </div>

      {/* Tab switcher — only shown on signin/signup */}
      {view !== 'forgot' && (
        <div className="flex bg-brand-surface rounded-2xl p-1 mb-8 animate-slideUp">
          {(['signup', 'signin'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => switchView(v)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                view === v
                  ? 'bg-brand-purple text-brand-white shadow-md'
                  : 'text-brand-muted'
              }`}
            >
              {v === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>
      )}

      {/* Forgot password header */}
      {view === 'forgot' && (
        <div className="text-center mb-8 animate-slideUp">
          <div className="text-4xl mb-3">🔑</div>
          <h2 className="text-xl font-black text-brand-white mb-1">Reset your password</h2>
          <p className="text-brand-muted text-sm">Enter your email and choose a new password.</p>
        </div>
      )}

      {/* Form */}
      <div className="flex flex-col gap-4 flex-1 animate-slideUp">

        {/* Sign Up only — name */}
        {view === 'signup' && (
          <div className="flex flex-col gap-1">
            <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-brand-surface border-2 border-white/10 rounded-2xl px-5 py-4 text-brand-white text-sm font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-purple transition-colors"
            />
          </div>
        )}

        {/* Email — all views */}
        <div className="flex flex-col gap-1">
          <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="bg-brand-surface border-2 border-white/10 rounded-2xl px-5 py-4 text-brand-white text-sm font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-purple transition-colors"
          />
        </div>

        {/* Password — signin and signup */}
        {view !== 'forgot' && (
          <div className="flex flex-col gap-1">
            <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="bg-brand-surface border-2 border-white/10 rounded-2xl px-5 py-4 text-brand-white text-sm font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-purple transition-colors"
            />
          </div>
        )}

        {/* Confirm password — signup only */}
        {view === 'signup' && (
          <div className="flex flex-col gap-1">
            <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="bg-brand-surface border-2 border-white/10 rounded-2xl px-5 py-4 text-brand-white text-sm font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-purple transition-colors"
            />
          </div>
        )}

        {/* Forgot password — new password fields */}
        {view === 'forgot' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="bg-brand-surface border-2 border-white/10 rounded-2xl px-5 py-4 text-brand-white text-sm font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-purple transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmNew}
                onChange={(e) => setConfirmNew(e.target.value)}
                placeholder="Re-enter new password"
                className="bg-brand-surface border-2 border-white/10 rounded-2xl px-5 py-4 text-brand-white text-sm font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-purple transition-colors"
              />
            </div>
          </>
        )}

        {error && (
          <p className="text-brand-error text-sm text-center font-medium animate-slideUp">{error}</p>
        )}
        {success && (
          <p className="text-brand-green text-sm text-center font-medium animate-slideUp">{success}</p>
        )}

      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-brand-green text-brand-black font-black text-xl py-5 rounded-2xl shadow-lg shadow-brand-green/30 active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading
            ? 'Just a sec...'
            : view === 'signup'
            ? 'Create My Account →'
            : view === 'signin'
            ? 'Sign In →'
            : 'Reset Password →'}
        </button>

        {/* Forgot password link — sign in only */}
        {view === 'signin' && (
          <button
            onClick={() => switchView('forgot')}
            className="text-brand-purple text-sm text-center font-semibold"
          >
            Forgot your password?
          </button>
        )}

        {/* Back / switch links */}
        {view === 'forgot' ? (
          <button
            onClick={() => switchView('signin')}
            className="text-brand-muted text-sm text-center"
          >
            ← Back to sign in
          </button>
        ) : (
          <button
            onClick={() => switchView(view === 'signup' ? 'signin' : 'signup')}
            className="text-brand-muted text-sm text-center"
          >
            {view === 'signup'
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        )}

        {isDev && (
          <button
            onClick={clearTestData}
            className="text-brand-error/50 text-xs text-center mt-2 underline"
          >
            [DEV] Clear all test accounts
          </button>
        )}
      </div>

    </div>
  )
}
