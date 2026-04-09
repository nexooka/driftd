'use client'

import { useState } from 'react'
import { FadeIn } from './FadeIn'

export default function WaitlistSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="waitlist" className="relative py-28 md:py-36 bg-[#070707] overflow-hidden">
      {/* Glow */}
      <div
        className="blob absolute opacity-20 pointer-events-none"
        style={{
          width: 600,
          height: 600,
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
          filter: 'blur(120px)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

      <div className="max-w-3xl mx-auto px-6 md:px-10 text-center relative z-10">
        <FadeIn>
          <span className="text-xs tracking-widest uppercase text-amber-400/70 font-medium block mb-6">
            Early access
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white leading-tight mb-6">
            Be first to{' '}
            <span className="italic gradient-text">drift</span>
          </h2>
          <p className="text-warm-gray-300 text-lg leading-relaxed mb-12 max-w-xl mx-auto">
            We're opening city by city. Drop your email and we'll reach out when driftd
            lands somewhere you'll want to explore.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          {submitted ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-2">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l5 5 11-11" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-warm-white text-xl font-semibold font-display">You're on the list.</p>
              <p className="text-warm-gray-300">We'll be in touch before we launch in your city.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-warm-white placeholder-warm-gray-400 focus:outline-none focus:border-amber-400/40 focus:bg-white/8 transition-all duration-200 text-base"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" />
                    </svg>
                    Joining…
                  </span>
                ) : (
                  'Join waitlist'
                )}
              </button>
            </form>
          )}
          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
          {!submitted && (
            <p className="mt-4 text-xs text-warm-gray-400">No spam. Just a heads up when we're ready.</p>
          )}
        </FadeIn>
      </div>
    </section>
  )
}
