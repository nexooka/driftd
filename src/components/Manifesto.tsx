'use client'

import { useTranslations } from 'next-intl'
import { useInView } from '@/lib/useInView'
import { CSSProperties } from 'react'

type Size = 'sm' | 'lg' | 'xl' | '2xl'

interface LineConfig {
  key: string
  accent: boolean
  blank: boolean
  size: Size
  strike?: boolean
  dim?: boolean
}

const LINE_CONFIGS: LineConfig[] = [
  { key: 'l0', accent: false, blank: false, size: 'sm', dim: true },
  { key: 'l1', accent: false, blank: false, size: 'xl', strike: true, dim: true },
  { key: '', accent: false, blank: true, size: 'lg' },
  { key: 'l3', accent: false, blank: false, size: 'sm', dim: true },
  { key: 'l4', accent: false, blank: false, size: '2xl' },
  { key: 'l5', accent: false, blank: false, size: '2xl' },
  { key: '', accent: false, blank: true, size: 'lg' },
  { key: 'l7', accent: true, blank: false, size: '2xl' },
]

export default function Manifesto() {
  const t = useTranslations('manifesto')
  const { ref, inView } = useInView(0.1)

  return (
    <section className="relative py-20 md:py-28 bg-[#0a0a0a] overflow-hidden">
      <div
        className="blob absolute opacity-10 pointer-events-none"
        style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)', filter: 'blur(100px)' }}
      />
      <div className="max-w-4xl mx-auto px-6 md:px-10" ref={ref}>
        {LINE_CONFIGS.map((line, i) => {
          if (line.blank) return <div key={i} className="h-10 md:h-16" />

          const sizeClass = {
            sm: 'text-xs md:text-sm tracking-[0.18em] uppercase',
            lg: 'text-2xl md:text-3xl',
            xl: 'text-2xl md:text-4xl',
            '2xl': 'text-3xl md:text-5xl lg:text-6xl',
          }[line.size]

          const style: CSSProperties = {
            transitionDelay: `${i * 120}ms`,
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
            ...(line.strike ? { textDecoration: 'line-through', textDecorationColor: 'rgba(245,240,232,0.3)' } : {}),
          }

          // dim lines now use warm-gray-300 (was 500 — nearly invisible)
          const colorClass = line.accent ? 'gradient-text' : line.dim ? 'text-warm-gray-300' : 'text-warm-white'
          const weightClass = line.size === 'sm' ? 'font-medium' : 'font-bold'

          return (
            <p key={i} style={style} className={`font-display ${weightClass} leading-tight mb-3 md:mb-5 ${sizeClass} ${colorClass}`}>
              {t(line.key as any)}
            </p>
          )
        })}
      </div>
    </section>
  )
}
