'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FadeIn } from './FadeIn'

const CITIES = ['Warsaw', 'Berlin', 'Prague']

type Step = 'email' | 'city' | 'done'

export default function WaitlistSection() {
  const t = useTranslations('waitlist')
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [other, setOther] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("looks like that email isn't valid.")
      return
    }
    setError('')
    setStep('city')
  }

  const handleCitySubmit = async () => {
    const chosenCity = city === 'other' ? other.trim() : city
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city: chosenCity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'something went wrong.')
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="waitlist" className="relative py-28 md:py-36 bg-[#0a0a0a] overflow-hidden">
      <div className="blob absolute opacity-[0.12] pointer-events-none" style={{ width: 700, height: 700, top: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, #fbbf24 0%, transparent 65%)', filter: 'blur(130px)' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

      <div className="max-w-3xl mx-auto px-6 md:px-10 text-center relative z-10">

        {/* Done */}
        {step === 'done' && (
          <FadeIn className="flex flex-col items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-amber-400/8 border border-amber-400/25 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M7 16l6 6 12-12" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full border border-amber-400/10 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <p className="font-display text-2xl md:text-3xl font-bold text-warm-white">{t('doneHeading')}</p>
            <p className="text-warm-gray-300 text-lg">{t('doneBody')}</p>
          </FadeIn>
        )}

        {/* Email step */}
        {step === 'email' && (
          <>
            <FadeIn>
              <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-6">
                {t('sectionLabel')}
              </span>
              <h2 className="font-display font-bold text-warm-white leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                {t('heading')}{' '}
                <span className="italic gradient-text">{t('headingAccent')}</span>
              </h2>
              <p className="text-warm-gray-300 text-lg leading-relaxed mb-12 max-w-lg mx-auto" style={{ fontWeight: 300 }}>
                {t('body')}
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-6 py-4 text-warm-white placeholder-warm-gray-500 focus:border-amber-400/35 focus:bg-white/[0.06] transition-all duration-200 text-sm"
                />
                <button type="submit" className="btn-primary">
                  {t('submitEmail')}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
              <p className="mt-5 text-xs text-warm-gray-500 tracking-wide">{t('microcopy')}</p>
            </FadeIn>
          </>
        )}

        {/* City picker */}
        {step === 'city' && (
          <FadeIn className="flex flex-col items-center gap-8">
            <div>
              <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-6">
                {t('cityStepLabel')}
              </span>
              <h2 className="font-display font-bold text-warm-white leading-tight mb-3" style={{ fontSize: 'clamp(1.8rem, 5vw, 3.2rem)' }}>
                {t('cityHeading')}{' '}
                <span className="italic gradient-text">{t('cityHeadingAccent')}</span>{' '}
                {t('cityHeadingEnd')}
              </h2>
              <p className="text-warm-gray-400 text-sm mt-2">{t('citySubtitle')}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                    city === c
                      ? 'bg-amber-400 text-[#0a0a0a]'
                      : 'bg-white/[0.05] text-warm-gray-300 border border-white/[0.08] hover:bg-white/[0.09] hover:border-amber-400/25'
                  }`}
                >
                  {c}
                </button>
              ))}
              <button
                onClick={() => setCity('other')}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                  city === 'other'
                    ? 'bg-amber-400 text-[#0a0a0a]'
                    : 'bg-white/[0.05] text-warm-gray-300 border border-white/[0.08] hover:bg-white/[0.09] hover:border-amber-400/25'
                }`}
              >
                {t('somewhereElse')}
              </button>
            </div>

            {city === 'other' && (
              <input
                type="text"
                placeholder={t('cityPlaceholder')}
                value={other}
                onChange={(e) => setOther(e.target.value)}
                autoFocus
                className="bg-white/[0.04] border border-white/10 rounded-full px-6 py-3 text-warm-white placeholder-warm-gray-500 focus:border-amber-400/35 transition-all duration-200 text-sm w-64 text-center"
              />
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleCitySubmit}
                disabled={loading || !city || (city === 'other' && !other.trim())}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" />
                    </svg>
                    {t('loading')}
                  </span>
                ) : t('submitCity')}
              </button>
              <button onClick={handleCitySubmit} disabled={loading} className="text-xs text-warm-gray-500 hover:text-warm-gray-400 transition-colors">
                {t('skip')}
              </button>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  )
}
