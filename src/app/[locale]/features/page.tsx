'use client'

import { useTranslations } from 'next-intl'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'

const MODES = [
  {
    number: '01',
    labelKey: 'm1Label' as const,
    taglineKey: 'm1Tagline' as const,
    descKey: 'm1Desc' as const,
    detailKey: 'm1Detail' as const,
    live: true,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M7 9a7 7 0 0 1 14 0v5a7 7 0 0 1-14 0V9Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M14 21v4M11 25h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="14" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
        <path d="M11.5 16s.8 1.5 2.5 1.5 2.5-1.5 2.5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '02',
    labelKey: 'm2Label' as const,
    taglineKey: 'm2Tagline' as const,
    descKey: 'm2Desc' as const,
    detailKey: 'm2Detail' as const,
    live: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14" cy="14" r="3.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14" cy="14" r="1" fill="currentColor" />
        <path d="M9 11l-2-2M19 11l2-2M9 17l-2 2M19 17l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '03',
    labelKey: 'm3Label' as const,
    taglineKey: 'm3Tagline' as const,
    descKey: 'm3Desc' as const,
    detailKey: 'm3Detail' as const,
    live: false,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C8.5 4 4 8.5 4 14c0 7 10 12 10 12s10-5 10-12c0-5.5-4.5-10-10-10Z" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M14 10V8M19 14h2M14 18v2M9 14H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function FeaturesPage() {
  const t = useTranslations('aiCompanion')

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 md:pb-28 overflow-hidden noise-overlay pt-32">
        <div className="absolute inset-0 bg-[#070707]" />
        <div className="blob absolute opacity-15 pointer-events-none" style={{ width: 600, height: 600, top: '-15%', right: '-10%', background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(110px)' }} />
        <div className="blob absolute opacity-10 pointer-events-none" style={{ width: 400, height: 400, bottom: '-5%', left: '-5%', background: 'radial-gradient(circle, #e2714b 0%, transparent 70%)', filter: 'blur(90px)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10">
          <FadeIn>
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-5">
              {t('sectionLabel')}
            </span>
            <div className="divider mb-6" />
            <h1 className="font-display font-black text-warm-white leading-[0.92] tracking-tight" style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}>
              {t('heading')}<br />
              <span className="italic gradient-text">{t('headingAccent')}</span>
            </h1>
            <p className="text-warm-gray-300 text-lg mt-6 max-w-xl leading-relaxed" style={{ fontWeight: 300 }}>
              {t('body')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Modes */}
      <section className="bg-[#080808] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-10 flex flex-col gap-20 md:gap-28">
          {MODES.map((mode, i) => (
            <FadeIn key={mode.number} delay={i * 80}>
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 md:gap-12">
                <div className="flex md:flex-col items-center md:items-start gap-4">
                  <span className="font-display font-black text-amber-400/25 leading-none select-none" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
                    {mode.number}
                  </span>
                  <div className="text-amber-400 mt-1 hidden md:block">{mode.icon}</div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="text-amber-400 md:hidden">{mode.icon}</div>
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-400/20 to-transparent" />
                    {mode.live ? (
                      <span className="text-[10px] tracking-[0.15em] uppercase font-medium px-2.5 py-1 rounded-full border border-amber-400/30 text-amber-400/80" style={{ background: 'rgba(251,191,36,0.07)' }}>
                        {t('liveNow')}
                      </span>
                    ) : (
                      <span className="text-[10px] tracking-[0.12em] uppercase font-medium px-2.5 py-1 rounded-full border border-white/10 text-warm-gray-400">
                        {t('comingSoon')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium mb-2">{t(mode.labelKey)}</p>
                  <h2 className="font-display font-bold text-warm-white leading-tight mb-4" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
                    {t(mode.taglineKey)}
                  </h2>
                  <p className="text-warm-gray-200 text-lg leading-relaxed mb-5" style={{ fontWeight: 300 }}>
                    {t(mode.descKey)}
                  </p>
                  <p className="text-warm-gray-400 text-sm leading-relaxed border-l-2 border-amber-400/20 pl-4">
                    {t(mode.detailKey)}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#070707] py-20 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <FadeIn>
            <p className="font-display font-bold text-warm-white mb-4" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}>
              see it for yourself
            </p>
            <p className="text-warm-gray-300 mb-8 text-lg" style={{ fontWeight: 300 }}>
              guided narration is live now. try it in under 30 seconds.
            </p>
            <a href="/demo" className="btn-primary text-sm px-10 py-4">
              {t('tryIt')}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  )
}
