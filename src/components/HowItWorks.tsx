'use client'

import { useTranslations } from 'next-intl'
import { FadeIn } from './FadeIn'

const STEP_ICONS = [
  <svg key="1" width="24" height="24" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2.5" />
    <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14" cy="14" r="1.5" fill="currentColor" />
  </svg>,
  <svg key="2" width="24" height="24" viewBox="0 0 28 28" fill="none">
    <path d="M7 9a7 7 0 0 1 14 0v5a7 7 0 0 1-14 0V9Z" stroke="currentColor" strokeWidth="1.4" />
    <path d="M14 21v4M11 25h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="14" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
    <path d="M11.5 16s.8 1.5 2.5 1.5 2.5-1.5 2.5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>,
  <svg key="3" width="24" height="24" viewBox="0 0 28 28" fill="none">
    <path d="M14 4C8.5 4 4 8.5 4 14c0 7 10 12 10 12s10-5 10-12c0-5.5-4.5-10-10-10Z" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M14 10V8M19 14h2M14 18v2M9 14H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>,
]

export default function HowItWorks() {
  const t = useTranslations('howItWorks')

  const steps = [
    {
      number: '01',
      icon: STEP_ICONS[0],
      title: t('step1Title'),
      description: t('step1Desc'),
      detail: t('step1Detail'),
      tags: Array.from({ length: 7 }, (_, i) => t(`tag${i}` as any)),
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
    <section id="how-it-works" className="relative py-20 md:py-28 bg-[#0a0a0a]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <FadeIn className="mb-14">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-6 h-px bg-amber-400/60" />
            <span className="text-[11px] tracking-[0.15em] uppercase text-amber-400/90 font-medium">
              {t('sectionLabel')}
            </span>
          </div>
          <div className="divider mb-5" />
          <h2 className="font-display font-bold text-warm-white leading-tight" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
            {t('heading')}{' '}
            <span className="italic gradient-text">{t('headingAccent')}</span>
          </h2>
        </FadeIn>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 110}>
              <div className="card-hover group relative flex flex-col h-full p-6 md:p-8 rounded-2xl border border-white/[0.07] bg-[#0f0e0c]">

                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-7">
                  <span className="text-[11px] text-amber-400/60 font-medium tracking-[0.15em] tabular-nums">{step.number}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-400/20 to-transparent" />
                </div>

                {/* Icon */}
                <div className="text-amber-400 mb-5 transition-transform duration-300 group-hover:scale-110 origin-left">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-warm-white mb-3 leading-snug">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-warm-gray-200 text-base leading-relaxed mb-4" style={{ fontWeight: 300 }}>
                  {step.description}
                </p>

                {/* Tags (step 1) */}
                {step.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {step.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] border border-amber-400/20 bg-amber-400/[0.06] text-amber-400/80 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Detail */}
                {step.detail && (
                  <p className="text-warm-gray-300 text-sm italic mt-auto leading-relaxed">
                    &ldquo;{step.detail}&rdquo;
                  </p>
                )}

                {/* Quote (steps 2 & 3) */}
                {step.quote && (
                  <p className="text-amber-400/75 text-sm italic mt-auto border-t border-white/[0.06] pt-4 leading-relaxed">
                    &ldquo;{step.quote}&rdquo;
                  </p>
                )}

                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/20 transition-all duration-500" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/15 to-transparent" />
    </section>
  )
}
