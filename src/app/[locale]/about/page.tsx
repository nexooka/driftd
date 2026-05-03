'use client'

import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'
import { Link } from '@/lib/navigation'

export default function AboutPage() {
  const t = useTranslations('about')

  const sections = [
    { label: t('s1Label'), heading: t('s1Heading'), body: [t('s1p0'), t('s1p1')] },
    { label: t('s2Label'), heading: t('s2Heading'), body: [t('s2p0'), t('s2p1')] },
    { label: t('s3Label'), heading: t('s3Heading'), body: [t('s3p0'), t('s3p1')] },
    { label: t('s4Label'), heading: t('s4Heading'), body: [t('s4p0'), t('s4p1')] },
  ]

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end pb-20 md:pb-28 overflow-hidden noise-overlay pt-32">
        <div className="absolute inset-0 bg-[#070707]" />
        <div
          className="blob absolute opacity-15 pointer-events-none"
          style={{ width: 600, height: 600, top: '-10%', right: '-10%', background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(110px)' }}
        />
        <div
          className="blob absolute opacity-10 pointer-events-none"
          style={{ width: 400, height: 400, bottom: '-5%', left: '-5%', background: 'radial-gradient(circle, #e2714b 0%, transparent 70%)', filter: 'blur(90px)' }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10">
          <FadeIn>
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-5">
              {t('sectionLabel')}
            </span>
            <div className="divider mb-6" />
            <h1
              className="font-display font-black text-warm-white leading-[0.92] tracking-tight"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}
            >
              {t('headline1')}
              <br />
              <span className="italic gradient-text">{t('headline2')}</span>
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[#080808] py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          {sections.map((section, i) => (
            <FadeIn key={section.label} delay={i * 80} className="mb-20 md:mb-24">
              <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium block mb-4">
                {section.label}
              </span>
              <div className="divider mb-5" />
              <h2
                className="font-display font-bold text-warm-white leading-tight mb-6"
                style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)' }}
              >
                {section.heading}
              </h2>
              {section.body.map((para, j) => (
                <p key={j} className="text-warm-gray-300 text-lg leading-relaxed mb-4" style={{ fontWeight: 300 }}>
                  {para}
                </p>
              ))}
            </FadeIn>
          ))}

          {/* CTA */}
          <FadeIn className="border-t border-white/[0.06] pt-16 text-center">
            <p className="font-display font-bold text-warm-white mb-4" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}>
              {t('ctaHeading')}
            </p>
            <p className="text-warm-gray-300 mb-8 text-lg" style={{ fontWeight: 300 }}>
              {t('ctaBody')}
            </p>
            <a href="/#waitlist" className="btn-primary text-sm px-10 py-4">
              {t('ctaButton')}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <p className="mt-4 text-xs text-warm-gray-500">{t('ctaMicro')}</p>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  )
}
