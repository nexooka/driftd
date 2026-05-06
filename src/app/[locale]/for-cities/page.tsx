'use client'

import { useRef, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'
import { useInView } from '@/lib/useInView'

const ICONS = [
  <svg key="1" width="22" height="22" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
    <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M5 10h1M14 10h1M10 5v1M10 14v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 20 20" fill="none">
    <path d="M3 17V9l7-6 7 6v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="7" y="12" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
  </svg>,
  <svg key="3" width="22" height="22" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7 13l3-4 2 2.5 2-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  <svg key="4" width="22" height="22" viewBox="0 0 20 20" fill="none">
    <path d="M3 10h14M10 3v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
  </svg>,
]

export default function ForCitiesPage() {
  const t = useTranslations('forCities')
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)
  const { ref: statRef, inView: statInView } = useInView(0.5)

  useEffect(() => {
    if (statInView && !hasAnimated.current) {
      hasAnimated.current = true
      const start = performance.now()
      const duration = 1600
      const target = 73
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
  }, [statInView])

  const valueProps = [
    { icon: ICONS[0], title: t('prop1Title'), description: t('prop1Desc') },
    { icon: ICONS[1], title: t('prop2Title'), description: t('prop2Desc') },
    { icon: ICONS[2], title: t('prop3Title'), description: t('prop3Desc') },
    {
      icon: ICONS[3],
      title: 'free for tourists',
      description: 'driftd is permanently free for explorers. cities and tourism boards fund the platform — aligning incentives with what makes cities actually worth visiting.',
    },
  ]

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end pb-20 md:pb-28 overflow-hidden noise-overlay pt-32">
        <div className="absolute inset-0 bg-[#070707]" />
        <div className="blob absolute opacity-15 pointer-events-none" style={{ width: 500, height: 500, bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, #e2714b 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="blob absolute opacity-10 pointer-events-none" style={{ width: 400, height: 400, top: '-5%', right: '-5%', background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(90px)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10">
          <FadeIn>
            <span className="text-[11px] tracking-[0.2em] uppercase font-medium block mb-5" style={{ color: '#e2714b' }}>
              {t('sectionLabel')}
            </span>
            <div className="divider-terra mb-6" />
            <h1 className="font-display font-black text-warm-white leading-[0.92] tracking-tight" style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)' }}>
              {t('heading1')}{' '}
              <span className="italic" style={{ color: '#e2714b' }}>{t('headingAccent1')}</span>
              <br />
              {t('heading2')}{' '}
              <span className="italic" style={{ color: '#e2714b' }}>{t('headingAccent2')}</span>
            </h1>
            <p className="text-warm-gray-300 text-lg mt-6 max-w-xl leading-relaxed" style={{ fontWeight: 300 }}>
              {t('body')}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Stats + value props */}
      <section className="bg-[#080808] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-10">

          {/* Big stat */}
          <FadeIn>
            <div ref={statRef} className="mb-16 p-8 md:p-12 rounded-2xl border border-white/[0.06] bg-[#0d0c0a] flex flex-col md:flex-row items-start md:items-center gap-6">
              <div
                className="font-display font-black shrink-0 tabular-nums leading-none"
                style={{ fontSize: 'clamp(4rem, 10vw, 6rem)', background: 'linear-gradient(135deg, #e2714b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {count}%
              </div>
              <p className="text-warm-gray-200 text-xl leading-relaxed" style={{ fontWeight: 300 }}>{t('statText')}</p>
            </div>
          </FadeIn>

          {/* Value props */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {valueProps.map((prop, i) => (
              <FadeIn key={prop.title} delay={i * 80}>
                <div className="card-hover flex gap-5 p-7 rounded-2xl border border-white/[0.07] bg-[#0f0e0c] h-full">
                  <div className="flex-shrink-0 p-2.5 rounded-xl h-fit" style={{ color: '#e2714b', background: 'rgba(226,113,75,0.08)', border: '1px solid rgba(226,113,75,0.18)' }}>
                    {prop.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-warm-white mb-2">{prop.title}</h3>
                    <p className="text-warm-gray-200 text-sm leading-relaxed" style={{ fontWeight: 300 }}>{prop.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#070707] py-20 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center">
          <FadeIn>
            <p className="font-display font-bold text-warm-white mb-4" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}>
              interested in partnering?
            </p>
            <p className="text-warm-gray-300 mb-8 text-lg" style={{ fontWeight: 300 }}>
              we're selectively onboarding city partners for our 2026 launch. reach out and let's talk.
            </p>
            <a href="mailto:cities@driftd.world" className="btn-outline-amber text-sm px-10 py-4 inline-flex items-center gap-2">
              {t('cta')}
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
