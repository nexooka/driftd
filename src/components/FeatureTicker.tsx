'use client'

import { useTranslations } from 'next-intl'

export default function FeatureTicker() {
  const t = useTranslations('featureTicker')
  const phrases = Array.from({ length: 13 }, (_, i) => t(`p${i}` as any))
  const ticker = phrases.join('  ·  ')

  return (
    <div className="overflow-hidden border-y border-amber-400/10 py-3.5 select-none" style={{ background: '#0c0a06' }}>
      <div className="animate-marquee-reverse" style={{ animationDuration: '35s' }}>
        {[0, 1].map((i) => (
          <span
            key={i}
            className="text-amber-400/70 text-xs tracking-widest pr-16 whitespace-nowrap"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
          >
            {ticker}
          </span>
        ))}
      </div>
    </div>
  )
}
