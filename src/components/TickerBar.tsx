'use client'

import { useTranslations } from 'next-intl'

export default function TickerBar() {
  const t = useTranslations('ticker')
  const phrases = Array.from({ length: 14 }, (_, i) => t(`p${i}` as any))

  return (
    <div className="relative overflow-hidden select-none" style={{ background: '#090807' }}>
      {/* Amber accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.25) 25%, rgba(251,191,36,0.25) 75%, transparent)' }} />

      {/* Edge fade masks */}
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #090807, transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #090807, transparent)' }} />

      {/* Scrolling content */}
      <div className="py-3.5" style={{ animation: 'marquee 55s linear infinite', willChange: 'transform', display: 'flex', width: 'max-content' }}>
        {[0, 1].map(copy => (
          <span key={copy} className="inline-flex items-center">
            {phrases.map((phrase, i) => (
              <span key={`${copy}-${i}`} className="inline-flex items-center gap-7">
                <span
                  className={`text-[10px] tracking-[0.22em] uppercase whitespace-nowrap ${
                    i % 4 === 1
                      ? 'italic text-amber-400/65 font-normal'
                      : 'text-warm-gray-400 font-light'
                  }`}
                >
                  {phrase}
                </span>
                <span className="text-amber-400/25 shrink-0" style={{ fontSize: '5px' }}>◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>

      {/* Subtle bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.04) 75%, transparent)' }} />
    </div>
  )
}
