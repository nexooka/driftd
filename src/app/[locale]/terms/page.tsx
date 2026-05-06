'use client'

import { useTranslations } from 'next-intl'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'

type SectionDef = { titleKey: string; bodyKeys: string[] }

const SECTIONS: SectionDef[] = [
  { titleKey: 's0Title', bodyKeys: ['s0p0', 's0p1'] },
  { titleKey: 's1Title', bodyKeys: ['s1p0', 's1p1'] },
  { titleKey: 's2Title', bodyKeys: ['s2p0', 's2p1', 's2p2'] },
  { titleKey: 's3Title', bodyKeys: ['s3p0', 's3p1'] },
  { titleKey: 's4Title', bodyKeys: ['s4p0', 's4p1'] },
  { titleKey: 's5Title', bodyKeys: ['s5p0', 's5p1'] },
  { titleKey: 's6Title', bodyKeys: ['s6p0'] },
  { titleKey: 's7Title', bodyKeys: ['s7p0'] },
]

export default function TermsPage() {
  const t = useTranslations('terms')

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-end pb-16 md:pb-20 overflow-hidden noise-overlay pt-32">
        <div className="absolute inset-0 bg-[#070707]" />
        <div className="blob absolute opacity-10 pointer-events-none" style={{ width: 400, height: 400, top: '-10%', right: '-5%', background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-10 w-full">
          <FadeIn>
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-5">{t('sectionLabel')}</span>
            <div className="divider mb-6" />
            <h1 className="font-display font-black text-warm-white leading-[0.92] tracking-tight" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
              {t('heading')}<br />
              <span className="italic gradient-text">{t('headingAccent')}</span>
            </h1>
            <p className="text-warm-gray-400 text-sm mt-5">{t('lastUpdated')}</p>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[#080808] py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <FadeIn className="mb-12">
            <p className="text-warm-gray-200 text-lg leading-relaxed" style={{ fontWeight: 300 }}>
              {t('intro')}
            </p>
          </FadeIn>

          <div className="flex flex-col gap-12">
            {SECTIONS.map((s, i) => (
              <FadeIn key={s.titleKey} delay={i * 40}>
                <div className="border-l-2 border-amber-400/15 pl-6">
                  <h2 className="text-base font-semibold text-warm-white mb-4 tracking-wide">
                    {t(s.titleKey as Parameters<typeof t>[0])}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {s.bodyKeys.map(k => (
                      <p key={k} className="text-warm-gray-300 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                        {t(k as Parameters<typeof t>[0])}
                      </p>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
