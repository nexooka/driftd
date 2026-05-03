'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { FadeIn } from './FadeIn'

interface Stop {
  x: number; y: number
  label: string
  lx: number; ly: number; lw: number
}

interface City {
  id: string
  name: string
  path: string
  stops: Stop[]
}

const H = [55, 115, 175, 235, 295, 355, 415]
const V = [55, 125, 195, 265, 335, 405, 475, 545, 615, 685, 755]
const BLOCKS = [
  [57,57,56,46],[127,57,56,46],[197,57,56,46],[337,57,56,46],[407,57,56,46],[547,57,56,46],[617,57,56,46],[687,57,56,46],
  [57,117,56,46],[197,117,56,46],[267,117,56,46],[407,117,56,46],[477,117,56,46],[617,117,56,46],[687,117,56,46],
  [57,177,56,46],[127,177,56,46],[337,177,56,46],[407,177,56,46],[547,177,56,46],[687,177,56,46],
  [57,237,56,46],[267,237,56,46],[337,237,56,46],[477,237,56,46],[617,237,56,46],
  [127,297,56,46],[197,297,56,46],[407,297,56,46],[477,297,56,46],[547,297,56,46],
  [57,357,56,46],[267,357,56,46],[337,357,56,46],[477,357,56,46],[617,357,56,46],[687,357,56,46],
]

const CITY_PATHS = {
  berlin: 'M 90,308 C 140,258 180,194 225,198 C 268,202 314,272 362,268 C 406,264 448,148 492,152 C 534,156 578,246 622,242 C 658,239 700,164 742,162',
  warsaw: 'M 80,350 C 95,240 135,110 175,108 C 215,106 275,138 340,135 C 405,132 460,120 515,118 C 575,116 625,130 668,125 C 710,120 740,195 760,280',
  prague: 'M 120,318 C 162,258 215,148 265,152 C 328,156 385,126 445,128 C 505,130 558,215 598,212 C 576,212 554,368 532,368 C 594,368 656,282 718,282',
}

const CITY_STOP_POSITIONS = {
  berlin: [
    { x:  90, y: 308, lw:  90, lx: 102, ly: 301 },
    { x: 225, y: 198, lw: 112, lx: 169, ly: 171 },
    { x: 362, y: 268, lw: 112, lx: 306, ly: 278 },
    { x: 492, y: 152, lw: 112, lx: 436, ly: 125 },
    { x: 622, y: 242, lw:  88, lx: 578, ly: 252 },
    { x: 742, y: 162, lw: 100, lx: 630, ly: 155 },
  ],
  warsaw: [
    { x:  80, y: 350, lw: 100, lx:  92, ly: 343 },
    { x: 175, y: 108, lw: 116, lx: 117, ly: 118 },
    { x: 340, y: 135, lw: 112, lx: 284, ly: 108 },
    { x: 515, y: 118, lw: 108, lx: 461, ly: 128 },
    { x: 668, y: 125, lw: 100, lx: 614, ly:  98 },
    { x: 760, y: 280, lw:  92, lx: 656, ly: 273 },
  ],
  prague: [
    { x: 120, y: 318, lw: 116, lx: 132, ly: 311 },
    { x: 265, y: 152, lw:  96, lx: 217, ly: 125 },
    { x: 445, y: 128, lw: 116, lx: 387, ly: 101 },
    { x: 598, y: 212, lw:  88, lx: 610, ly: 205 },
    { x: 532, y: 368, lw:  92, lx: 486, ly: 378 },
    { x: 718, y: 282, lw: 120, lx: 586, ly: 275 },
  ],
}

export default function MapDemo() {
  const t = useTranslations('mapDemo')
  const [active, setActive] = useState(0)
  const [routeKey, setRouteKey] = useState(0)
  const touchStartX = useRef(0)

  const CITIES: City[] = [
    {
      id: 'berlin', name: 'Berlin', path: CITY_PATHS.berlin,
      stops: CITY_STOP_POSITIONS.berlin.map((pos, i) => ({ ...pos, label: t(`berlin${i}` as any) })),
    },
    {
      id: 'warsaw', name: 'Warsaw', path: CITY_PATHS.warsaw,
      stops: CITY_STOP_POSITIONS.warsaw.map((pos, i) => ({ ...pos, label: t(`warsaw${i}` as any) })),
    },
    {
      id: 'prague', name: 'Prague', path: CITY_PATHS.prague,
      stops: CITY_STOP_POSITIONS.prague.map((pos, i) => ({ ...pos, label: t(`prague${i}` as any) })),
    },
  ]

  const goTo = (idx: number) => { if (idx !== active) { setActive(idx); setRouteKey((k) => k + 1) } }
  const prev = () => goTo((active - 1 + CITIES.length) % CITIES.length)
  const next = () => goTo((active + 1) % CITIES.length)
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) { if (diff > 0) next(); else prev() }
  }

  const city = CITIES[active]

  return (
    <section id="map" className="relative py-28 md:py-36 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <FadeIn className="mb-10">
          <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-4">
            {t('sectionLabel')}
          </span>
          <div className="divider mb-5" />
          <h2 className="font-display font-bold text-warm-white leading-tight max-w-2xl" style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)' }}>
            {t('heading')}{' '}
            <span className="italic gradient-text">{t('headingAccent')}</span>
          </h2>
        </FadeIn>

        {/* City tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CITIES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => goTo(i)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                i === active
                  ? 'bg-amber-400 text-[#0a0a0a]'
                  : 'bg-white/[0.05] text-warm-gray-300 hover:bg-white/[0.09] border border-white/[0.08]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Desktop SVG map */}
        <div
          className="hidden md:block relative rounded-2xl overflow-hidden border border-white/[0.06] select-none"
          style={{ background: '#0a0a0a' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button onClick={prev} aria-label="Previous city" className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-warm-gray-300 hover:text-warm-white hover:border-amber-400/30 hover:bg-black/90 transition-all duration-150 active:scale-90">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={next} aria-label="Next city" className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-warm-gray-300 hover:text-warm-white hover:border-amber-400/30 hover:bg-black/90 transition-all duration-150 active:scale-90">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <svg viewBox="0 0 810 420" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="810" height="420" fill="#0a0a0a" />
            {BLOCKS.map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} fill="#0f0f0f" rx="1" />
            ))}
            {H.map((y) => <line key={`h${y}`} x1="0" y1={y} x2="810" y2={y} stroke="#161616" strokeWidth="1" />)}
            {V.map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="420" stroke="#161616" strokeWidth="1" />)}
            <line x1="0" y1="235" x2="810" y2="235" stroke="#1d1d1d" strokeWidth="2" />
            <line x1="405" y1="0" x2="405" y2="420" stroke="#1d1d1d" strokeWidth="2" />
            <defs>
              <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#0a0a0a" stopOpacity="0" />
                <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
              </radialGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <rect width="810" height="420" fill="url(#vignette)" />
            <path
              key={`${city.id}-${routeKey}`}
              d={city.path}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="route-path draw"
            />
            {city.stops.map((stop, i) => (
              <g key={`${city.id}-stop-${i}`}>
                {i === 0 && (
                  <circle cx={stop.x} cy={stop.y} r="10" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0">
                    <animate attributeName="r" values="8;18;8" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0;0.35" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={stop.x} cy={stop.y} r="7.5" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.25" />
                <circle cx={stop.x} cy={stop.y} r="4.5" fill="#fbbf24" />
                <text x={stop.x} y={stop.y + 0.5} fill="#0a0a0a" fontSize="5.5" fontWeight="bold" fontFamily="ui-sans-serif,system-ui" textAnchor="middle" dominantBaseline="middle">{i + 1}</text>
                <rect x={stop.lx} y={stop.ly} width={stop.lw} height={15} rx="3.5" fill="#0e0e0e" stroke="#282828" strokeWidth="0.5" opacity="0.97" />
                <text x={stop.lx + 6} y={stop.ly + 7.5} fill="#c8c0b5" fontSize="7" fontFamily="ui-sans-serif,system-ui" dominantBaseline="middle">{stop.label}</text>
              </g>
            ))}
          </svg>

          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent flex items-end justify-center pb-2.5">
            <p className="text-warm-gray-600 text-[10px] tracking-widest uppercase">{t('caption')}</p>
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prev} aria-label="Previous city" className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-warm-gray-300 active:scale-90 transition-all">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="font-display text-xl font-bold text-warm-white">{city.name}</span>
            <button onClick={next} aria-label="Next city" className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-warm-gray-300 active:scale-90 transition-all">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="absolute left-[18px] top-5 bottom-10 w-px bg-gradient-to-b from-amber-400/50 via-amber-400/15 to-transparent" />
            {city.stops.map((stop, i) => (
              <div key={`${city.id}-m-${i}`} className="flex items-center gap-5 mb-5">
                <div className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-[#0a0a0a] text-xs font-bold">{i + 1}</div>
                <p className="text-warm-white text-sm font-medium leading-snug">{stop.label}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {CITIES.map((c, i) => (
              <button key={c.id} onClick={() => goTo(i)} aria-label={`Show ${c.name}`} className={`rounded-full transition-all duration-200 ${i === active ? 'w-5 h-2 bg-amber-400' : 'w-2 h-2 bg-white/20'}`} />
            ))}
          </div>

          <p className="text-warm-gray-600 text-[10px] text-center mt-4 tracking-widest uppercase">{t('captionMobile')}</p>
        </div>
      </div>
    </section>
  )
}
