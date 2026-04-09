'use client'

import { useInView } from '@/lib/useInView'
import { CSSProperties } from 'react'

const LINES: { text: string; accent: boolean; blank: boolean; size: 'lg' | 'xl' | '2xl' }[] = [
  { text: '73% of tourists never leave the main street.', accent: false, blank: false, size: 'xl' },
  { text: 'they see the same 5 landmarks.', accent: false, blank: false, size: 'xl' },
  { text: 'eat at the same tourist traps.', accent: false, blank: false, size: 'xl' },
  { text: 'take the same photos.', accent: false, blank: false, size: 'xl' },
  { text: '', accent: false, blank: true, size: 'lg' },
  { text: "you're not a tourist.", accent: false, blank: false, size: '2xl' },
  { text: 'you drifted.', accent: true, blank: false, size: '2xl' },
]

export default function Manifesto() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className="relative py-28 md:py-40 bg-[#070707] overflow-hidden">
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
            lg: 'text-2xl md:text-3xl',
            xl: 'text-2xl md:text-4xl',
            '2xl': 'text-3xl md:text-5xl lg:text-6xl',
          }[line.size]

          const style: CSSProperties = {
            transitionDelay: `${i * 120}ms`,
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
          }

          return (
            <p
              key={i}
              style={style}
              className={`font-display font-bold leading-tight mb-3 md:mb-4 ${sizeClass} ${
                line.accent
                  ? 'gradient-text'
                  : i < 4
                  ? 'text-warm-gray-300'
                  : 'text-warm-white'
              }`}
            >
              {line.text}
            </p>
          )
        })}
      </div>
    </section>
  )
}
