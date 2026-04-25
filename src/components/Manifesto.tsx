'use client'

import { useInView } from '@/lib/useInView'
import { CSSProperties } from 'react'

interface Line {
  text: string
  accent: boolean
  blank: boolean
  size: 'sm' | 'lg' | 'xl' | '2xl'
  strike?: boolean
  dim?: boolean
}

const LINES: Line[] = [
  { text: 'what the guidebook had planned:',        accent: false, blank: false, size: 'sm', dim: true },
  { text: 'landmark → tourist lunch → souvenir shop', accent: false, blank: false, size: 'xl', strike: true, dim: true },
  { text: '', accent: false, blank: true, size: 'lg' },
  { text: 'what you actually found:',               accent: false, blank: false, size: 'sm', dim: true },
  { text: 'the alley with no reviews.',             accent: false, blank: false, size: '2xl' },
  { text: 'the afternoon you couldn\'t have planned.', accent: false, blank: false, size: '2xl' },
  { text: '', accent: false, blank: true, size: 'lg' },
  { text: 'you drifted.',                           accent: true,  blank: false, size: '2xl' },
]

export default function Manifesto() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="relative py-28 md:py-40 bg-[#0a0a0a] overflow-hidden">
      {/* Subtle center glow */}
      <div
        className="blob absolute opacity-10 pointer-events-none"
        style={{
          width: 500,
          height: 500,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-10" ref={ref}>
        {LINES.map((line, i) => {
          if (line.blank) return <div key={i} className="h-10 md:h-16" />

          const sizeClass = {
            sm:  'text-xs md:text-sm tracking-[0.18em] uppercase',
            lg:  'text-2xl md:text-3xl',
            xl:  'text-2xl md:text-4xl',
            '2xl': 'text-3xl md:text-5xl lg:text-6xl',
          }[line.size]

          const style: CSSProperties = {
            transitionDelay: `${i * 120}ms`,
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
            ...(line.strike ? { textDecoration: 'line-through', textDecorationColor: 'rgba(245,240,232,0.25)' } : {}),
          }

          const colorClass = line.accent
            ? 'text-amber-400'
            : line.dim
            ? 'text-warm-gray-500'
            : 'text-warm-white'

          const fontClass = line.accent ? 'font-serif font-light italic' : 'font-display font-bold'
          const weightClass = ''

          return (
            <p
              key={i}
              style={style}
              className={`${fontClass} ${weightClass} leading-tight mb-3 md:mb-5 ${sizeClass} ${colorClass}`}
            >
              {line.text}
            </p>
          )
        })}
      </div>
    </section>
  )
}
