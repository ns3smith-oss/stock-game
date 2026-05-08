'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'

export default function ContactPage() {
  const router = useRouter()
  const [sent, setSent] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  function handleSend() {
    if (!subject.trim() || !message.trim()) return
    haptics.success()
    setSent(true)
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-6 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="text-brand-muted text-sm active:scale-95">← Back</button>
      </div>

      <div className="text-center mb-8 animate-slideUp">
        <div className="text-5xl mb-3">✉️</div>
        <h1 className="text-2xl font-black text-brand-white">Contact Us</h1>
        <p className="text-brand-muted text-sm mt-1">We read every message.</p>
      </div>

      {sent ? (
        <div className="bg-brand-green/20 border-2 border-brand-green rounded-3xl p-6 text-center animate-slideUp">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-brand-white font-black text-lg mb-1">Message sent!</h2>
          <p className="text-brand-muted text-sm">We'll get back to you as soon as we can.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-slideIn">
          <div className="bg-brand-surface border border-white/10 rounded-3xl p-5">
            <p className="text-brand-muted text-sm mb-1 font-semibold">Email us directly</p>
            <p className="text-brand-purple font-bold text-sm">hello@stockly.app</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Question, feedback, bug report..."
              className="bg-brand-surface border-2 border-white/10 rounded-2xl px-5 py-4 text-brand-white text-sm font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-purple transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide pl-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind..."
              rows={5}
              className="bg-brand-surface border-2 border-white/10 rounded-2xl px-5 py-4 text-brand-white text-sm font-medium placeholder:text-brand-muted focus:outline-none focus:border-brand-purple transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!subject.trim() || !message.trim()}
            className="w-full bg-brand-green text-brand-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-brand-green/30 active:scale-95 transition-transform disabled:opacity-40"
          >
            Send Message →
          </button>
        </div>
      )}
    </div>
  )
}
