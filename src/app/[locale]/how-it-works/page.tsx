'use client'

import { useTranslations } from 'next-intl'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'

const STEP_ICONS = [
  <svg key="1" width="32" height="32" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2.5" />
    <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14" cy="14" r="1.5" fill="currentColor" />
  </svg>,
  <svg key="2" width="32" height="32" viewBox="0 0 28 28" fill="none">
    <path d="M7 9a7 7 0 0 1 14 0v5a7 7 0 0 1-14 0V9Z" stroke="currentColor" strokeWidth="1.4" />
    <path d="M14 21v4M11 25h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="14" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
    <path d="M11.5 16s.8 1.5 2.5 1.5 2.5-1.5 2.5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>,
  <svg key="3" width="32" height="32" viewBox="0 0 28 28" fill="none">
    <path d="M14 4C8.5 4 4 8.5 4 14c0 7 10 12 10 12s10-5 10-12c0-5.5-4.5-10-10-10Z" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M14 10V8M19 14h2M14 18v2M9 14H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>,
]

const VIBES = ['artsy', 'historic', 'foodie', 'nightlife', 'sketchy-but-cool', 'chill', 'romantic']

export default function HowItWorksPage() {
  const t = useTranslations('howItWorks')

  const steps = [
    {
      number: '01',
      icon: STEP_ICONS[0],
      title: t('step1Title'),
      description: t('step1Desc'),
      detail: t('step1Detail'),
      tags: VIBES,
      quote: null,
    },
    {
      number: '02',
      icon: STEP_ICONS[1],
      title: t('step2Title'),
      description: t('step2Desc'),
      detail: null,
      tags: null,
      quote: t('step2Quote'),
    },
    {
      number: '03',
      icon: STEP_ICONS[2],
      title: t('step3Title'),
      description: t('step3Desc'),
      detail: null,
      tags: null,
      quote: t('step3Quote'),
    },
  ]

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-20 md:pb-28 overflow-hidden noise-overlay pt-32">
        <div className="absolute inset-0 bg-[#070707]" />
        <div className="blob absolute opacity-15 pointer-events-none" style={{ width: 600, height: 600, top: '-15%', right: '-10%', background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(110px)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10">
          <FadeIn>
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-5">
              {t('sectionLabel')}
            </span>
            <div className="divider mb-6" />
            <h1 className="font-display font-black text-warm-white leading-[0.92] tracking-tight" style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}>
              {t('heading')}{' '}
              <span className="italic gradient-text">{t('headingAccent')}</span>
            </h1>
            <p className="text-warm-gray-300 text-lg mt-6 max-w-xl leading-relaxed" style={{ fontWeight: 300 }}>
              pick a city. pick a vibe. let an AI companion turn a walk into something you'll actually remember.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[#080808] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-10 flex flex-col gap-20 md:gap-28">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 80}>
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 md:gap-12">
                {/* Number + icon column */}
                <div className="flex md:flex-col items-center md:items-start gap-4">
                  <span className="font-display font-black text-amber-400/25 leading-none select-none" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
                    {step.number}
                  </span>
                  <div className="text-amber-400 mt-1 hidden md:block">{step.icon}</div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="text-amber-400 md:hidden">{step.icon}</div>
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-400/20 to-transparent" />
                  </div>
                  <h2 className="font-display font-bold text-warm-white leading-tight mb-4" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)' }}>
                    {step.title}
                  </h2>
                  <p className="text-warm-gray-200 text-lg leading-relaxed mb-5" style={{ fontWeight: 300 }}>
                    {step.description}
                  </p>
                  {step.tags && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {step.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1.5 rounded-full text-xs border border-amber-400/20 bg-amber-400/[0.06] text-amber-400/80 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {step.detail && (
                    <p className="text-warm-gray-400 text-sm italic border-l-2 border-amber-400/30 pl-4 leading-relaxed">
                      {step.detail}
                    </p>
                  )}
                  {step.quote && (
                    <p className="text-amber-400/70 text-base italic border-l-2 border-amber-400/30 pl-4 leading-relaxed">
                      &ldquo;{step.quote}&rdquo;
                    </p>
                  )}
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
              ready to stop following?
            </p>
            <p className="text-warm-gray-300 mb-8 text-lg" style={{ fontWeight: 300 }}>
              try the live demo — no signup, free forever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/demo" className="btn-primary text-sm px-10 py-4">
                try the demo
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="/#waitlist" className="btn-outline-amber text-sm px-10 py-4">
                join the waitlist
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  )
}
