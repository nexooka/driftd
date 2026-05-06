'use client'

import { useTranslations } from 'next-intl'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'

export default function CareersPage() {
  const t = useTranslations('careers')

  const values = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2l2.4 5 5.6.8-4 3.9.9 5.5L10 14.5l-4.9 2.7.9-5.5L2 7.8l5.6-.8L10 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      ),
      title: t('value1Title'),
      desc: t('value1Desc'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
      title: t('value2Title'),
      desc: t('value2Desc'),
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 17V9l7-6 7 6v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="7" y="12" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      ),
      title: t('value3Title'),
      desc: t('value3Desc'),
    },
  ]

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
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[#080808] py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-10">

          {/* Opening */}
          <FadeIn className="mb-20">
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium block mb-4">{t('openingLabel')}</span>
            <div className="divider mb-6" />
            <h2 className="font-display font-bold text-warm-white leading-tight mb-6" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)' }}>
              {t('openingHeading')}{' '}
              <span className="italic gradient-text">{t('openingHeadingAccent')}</span>{' '}
              {t('openingHeadingEnd')}
            </h2>
            <p className="text-warm-gray-300 text-lg leading-relaxed mb-4" style={{ fontWeight: 300 }}>
              {t('openingBody1')}
            </p>
            <p className="text-warm-gray-300 text-lg leading-relaxed" style={{ fontWeight: 300 }}>
              {t('openingBody2')}
            </p>
          </FadeIn>

          {/* Values */}
          <FadeIn delay={80} className="mb-20">
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium block mb-4">{t('valuesLabel')}</span>
            <div className="divider mb-6" />
            <div className="flex flex-col gap-4">
              {values.map((v, i) => (
                <div key={i} className="card-hover flex gap-5 p-6 rounded-2xl border border-white/[0.07] bg-[#0f0e0c]">
                  <div className="flex-shrink-0 p-2.5 rounded-xl h-fit" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-warm-white mb-1">{v.title}</h3>
                    <p className="text-warm-gray-200 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* How to apply */}
          <FadeIn delay={160}>
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium block mb-4">{t('howLabel')}</span>
            <div className="divider mb-6" />
            <h2 className="font-display font-bold text-warm-white leading-tight mb-6" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
              {t('howHeading')}
            </h2>
            <p className="text-warm-gray-300 text-lg leading-relaxed mb-4" style={{ fontWeight: 300 }}>
              {t('howBody1')}
            </p>
            <p className="text-warm-gray-300 text-lg leading-relaxed mb-8" style={{ fontWeight: 300 }}>
              {t('howBody2')}
            </p>
            <a
              href="mailto:apply@driftd.world"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border border-amber-400/30 text-amber-400 text-sm font-medium hover:bg-amber-400/[0.08] transition-all duration-200"
              style={{ background: 'rgba(251,191,36,0.05)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1.5 5.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              apply@driftd.world
            </a>
            <p className="mt-5 text-warm-gray-500 text-sm italic">
              {t('howEmailNote')}
            </p>
          </FadeIn>

        </div>
      </section>

      <Footer />
    </main>
  )
}
