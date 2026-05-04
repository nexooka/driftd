'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { FadeIn } from './FadeIn'

export default function AntiFaq() {
  const t = useTranslations('antiFaq')
  const [open, setOpen] = useState<number | null>(null)

  const items = Array.from({ length: 6 }, (_, i) => ({
    assumption: t(`q${i}` as any),
    answer: t(`a${i}` as any),
  }))

  return (
    <section className="relative py-24 md:py-32 bg-[#0a0a0a]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <FadeIn>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-6 h-px bg-amber-400/60" />
            <span className="text-[11px] tracking-[0.15em] uppercase text-amber-400/90 font-medium">
              {t('sectionLabel')}
            </span>
          </div>
          <h2 className="font-display font-bold text-warm-white leading-tight mb-14" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
            {t('heading')}{' '}
            <span className="italic gradient-text">{t('headingAccent')}</span>
          </h2>
        </FadeIn>

        <div className="space-y-px">
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <FadeIn key={i} delay={i * 60}>
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full text-left group">
                  <div className={`flex items-start justify-between gap-6 py-6 border-b transition-colors duration-200 ${isOpen ? 'border-amber-400/20' : 'border-white/[0.07] hover:border-white/[0.14]'}`}>
                    <div className="flex-1">
                      <p className={`font-medium text-base md:text-lg transition-colors duration-200 leading-snug ${isOpen ? 'text-amber-400' : 'text-warm-gray-200 group-hover:text-warm-white'}`}>
                        &ldquo;{item.assumption}&rdquo;
                      </p>
                      <div className="overflow-hidden transition-all duration-300 ease-out" style={{ maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0 }}>
                        <p className="text-warm-gray-300 text-base leading-relaxed pt-3" style={{ fontWeight: 300 }}>
                          {item.answer}
                        </p>
                      </div>
                    </div>
                    <div className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-all duration-200 ${isOpen ? 'border-amber-400/40 bg-amber-400/10' : 'border-white/20 group-hover:border-white/35'}`}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                        <path d="M5 1v8M1 5h8" stroke={isOpen ? '#fbbf24' : 'currentColor'} strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </button>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
