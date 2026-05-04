'use client'

import { useTranslations } from 'next-intl'

export default function TickerBar() {
  const t = useTranslations('ticker')
  const phrases = Array.from({ length: 14 }, (_, i) => t(`p${i}` as any))
  const ticker = phrases.join('  ·  ')

  return (
    <div className="overflow-hidden bg-[#0d0d0d] border-y border-white/[0.05] py-3.5 select-none">
      <div className="animate-marquee">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="text-warm-gray-300 text-xs tracking-widest font-mono pr-16 whitespace-nowrap"
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
          >
            {ticker}
          </span>
        ))}
      </div>
    </div>
  )
}
