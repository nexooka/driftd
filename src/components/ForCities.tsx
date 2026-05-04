'use client'

import { useRef, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { FadeIn } from './FadeIn'
import { useInView } from '@/lib/useInView'

const ICONS = [
  <svg key="1" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
    <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M5 10h1M14 10h1M10 5v1M10 14v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 17V9l7-6 7 6v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="7" y="12" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
  </svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7 13l3-4 2 2.5 2-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
]

export default function ForCities() {
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
  ]

  return (
    <section id="cities" className="relative py-20 md:py-28 bg-[#0a0a0a] overflow-hidden">
      <div className="blob absolute opacity-15 pointer-events-none" style={{ width: 500, height: 500, bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, #e2714b 0%, transparent 70%)', filter: 'blur(100px)' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        <FadeIn className="mb-10">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-px bg-terra/60" />
            <span className="text-[11px] tracking-[0.15em] uppercase text-terra font-medium">
              {t('sectionLabel')}
            </span>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left */}
          <div>
            <FadeIn direction="left">
              <div className="divider-terra mb-7" />
              <h2 className="font-display font-bold text-warm-white leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)' }}>
                {t('heading1')}{' '}
                <span className="italic" style={{ color: '#e2714b' }}>{t('headingAccent1')}</span>
                {t('headingAccent1') ? <br /> : ' '}
                {t('heading2')}{' '}
                <span className="italic" style={{ color: '#e2714b' }}>{t('headingAccent2')}</span>
              </h2>
              <p className="text-warm-gray-200 text-lg leading-relaxed mb-10 max-w-lg" style={{ fontWeight: 300 }}>
                {t('body')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="mailto:cities@driftd.world" className="btn-outline-amber">
                  {t('cta')}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Right: value props */}
          <div className="flex flex-col gap-5">
            {valueProps.map((prop, i) => (
              <FadeIn key={prop.title} delay={i * 100} direction="right">
                <div className="card-hover flex gap-5 p-7 rounded-2xl border border-white/[0.07] bg-[#0f0e0c]">
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

            <FadeIn delay={320} direction="right">
              <div ref={statRef} className="p-6 rounded-xl border border-white/[0.05] bg-[#0d0c0a] flex items-center gap-5">
                <div
                  className="font-display font-black text-4xl flex-shrink-0 tabular-nums"
                  style={{ background: 'linear-gradient(135deg, #e2714b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {count}%
                </div>
                <p className="text-warm-gray-200 text-sm leading-snug" style={{ fontWeight: 300 }}>{t('statText')}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
