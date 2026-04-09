'use client'

import { useInView } from '@/lib/useInView'
import { FadeIn } from './FadeIn'

const STOPS = [
  { x: 100, y: 358, label: 'hidden courtyard', labelX: 118, labelY: 345, anchor: 'start' },
  { x: 248, y: 262, label: '1970s mural', labelX: 265, labelY: 250, anchor: 'start' },
  { x: 372, y: 298, label: 'best pierogi in Praga', labelX: 372, labelY: 282, anchor: 'middle' },
  { x: 488, y: 172, label: 'rooftop nobody knows', labelX: 505, labelY: 160, anchor: 'start' },
  { x: 618, y: 238, label: 'jazz bar, basement', labelX: 618, labelY: 222, anchor: 'middle' },
  { x: 736, y: 152, label: 'soviet-era arcade', labelX: 718, labelY: 140, anchor: 'end' },
]

const MOBILE_STOPS = [
  { num: 1, type: 'courtyard', name: 'hidden courtyard' },
  { num: 2, type: 'mural', name: '1970s mural' },
  { num: 3, type: 'food', name: 'best pierogi in Praga' },
  { num: 4, type: 'viewpoint', name: 'rooftop nobody knows' },
  { num: 5, type: 'music', name: 'jazz bar, basement' },
  { num: 6, type: 'culture', name: 'soviet-era arcade' },
]

// Horizontal street Y values
const H_STREETS = [55, 115, 175, 235, 295, 355, 415]
// Vertical street X values
const V_STREETS = [55, 125, 195, 265, 335, 405, 475, 545, 615, 685, 750]

// City block fills (x, y, w, h)
const BLOCKS = [
  [57, 57, 56, 46], [127, 57, 56, 46], [197, 57, 56, 46], [337, 57, 56, 46], [407, 57, 56, 46], [547, 57, 56, 46], [617, 57, 56, 46], [687, 57, 51, 46],
  [57, 117, 56, 46], [197, 117, 56, 46], [267, 117, 56, 46], [407, 117, 56, 46], [477, 117, 56, 46], [617, 117, 56, 46], [687, 117, 51, 46],
  [57, 177, 56, 46], [127, 177, 56, 46], [337, 177, 56, 46], [407, 177, 56, 46], [547, 177, 56, 46], [687, 177, 51, 46],
  [57, 237, 56, 46], [267, 237, 56, 46], [337, 237, 56, 46], [477, 237, 56, 46], [617, 237, 56, 46], [687, 237, 51, 46],
  [127, 297, 56, 46], [197, 297, 56, 46], [407, 297, 56, 46], [477, 297, 56, 46], [547, 297, 56, 46], [687, 297, 51, 46],
  [57, 357, 56, 46], [267, 357, 56, 46], [337, 357, 56, 46], [477, 357, 56, 46], [617, 357, 56, 46], [687, 357, 51, 46],
]

export default function MapDemo() {
  const { ref, inView } = useInView(0.2)

  return (
    <section id="map" className="relative py-28 md:py-36 bg-[#080808] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <FadeIn className="mb-14">
          <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-4">
            your route
          </span>
          <div className="divider mb-5" />
          <h2 className="font-display font-bold text-warm-white leading-tight max-w-2xl"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)' }}>
            no two walks are ever{' '}
            <span className="italic gradient-text">the same</span>
          </h2>
        </FadeIn>

        {/* Map — desktop only */}
        <div ref={ref} className="hidden md:block relative rounded-2xl overflow-hidden border border-white/[0.06]" style={{ background: '#080808' }}>
          <svg
            viewBox="0 0 810 430"
            width="100%"
            height="auto"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Background */}
            <rect width="810" height="430" fill="#080808" />

            {/* City block fills */}
            {BLOCKS.map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} fill="#0d0d0d" rx="1" />
            ))}

            {/* Streets: horizontal */}
            {H_STREETS.map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="810" y2={y} stroke="#161616" strokeWidth="1" />
            ))}

            {/* Streets: vertical */}
            {V_STREETS.map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="430" stroke="#161616" strokeWidth="1" />
            ))}

            {/* Main road highlight: horizontal y=235 */}
            <line x1="0" y1="235" x2="810" y2="235" stroke="#1e1e1e" strokeWidth="2" />
            {/* Main road highlight: vertical x=405 */}
            <line x1="405" y1="0" x2="405" y2="430" stroke="#1e1e1e" strokeWidth="2" />

            {/* Street name hints (very faint) */}
            <text x="130" y="230" fill="#2a2a2a" fontSize="7" fontFamily="monospace" textAnchor="middle">NOWY ŚWIAT</text>
            <text x="400" y="80" fill="#2a2a2a" fontSize="7" fontFamily="monospace" textAnchor="middle">PRAGA NORTH</text>
            <text x="600" y="230" fill="#2a2a2a" fontSize="7" fontFamily="monospace" textAnchor="middle">MARSZAŁKOWSKA</text>

            {/* Gradient overlay on edges */}
            <defs>
              <radialGradient id="edgeFade" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#080808" stopOpacity="0" />
                <stop offset="100%" stopColor="#080808" stopOpacity="0.9" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect width="810" height="430" fill="url(#edgeFade)" />

            {/* Route path */}
            <path
              d="M 100,358 C 150,320 200,268 248,262 C 295,256 330,306 372,298 C 410,290 448,178 488,172 C 526,166 568,240 618,238 C 652,236 700,158 736,152"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 4"
              className={`route-path ${inView ? 'draw' : ''}`}
              filter="url(#glow)"
            />

            {/* Stop markers */}
            {STOPS.map((stop, i) => (
              <g key={i}>
                {/* Pulse ring (first stop only) */}
                {i === 0 && (
                  <circle cx={stop.x} cy={stop.y} r="10" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Outer ring */}
                <circle cx={stop.x} cy={stop.y} r="7" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3" />
                {/* Inner dot */}
                <circle cx={stop.x} cy={stop.y} r="4" fill="#fbbf24" />
                {/* Number */}
                <text x={stop.x} y={stop.y + 1} fill="#070707" fontSize="5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="middle">
                  {i + 1}
                </text>

                {/* Label box */}
                <g>
                  <rect
                    x={stop.anchor === 'end' ? stop.labelX - 90 : stop.anchor === 'middle' ? stop.labelX - 54 : stop.labelX - 2}
                    y={stop.labelY - 11}
                    width="92"
                    height="16"
                    rx="4"
                    fill="#0f0f0f"
                    stroke="#2a2a2a"
                    strokeWidth="0.5"
                    opacity="0.95"
                  />
                  <text
                    x={stop.labelX}
                    y={stop.labelY - 2}
                    fill="#c8c0b5"
                    fontSize="7.5"
                    fontFamily="ui-sans-serif, system-ui"
                    textAnchor={stop.anchor as 'start' | 'middle' | 'end'}
                    dominantBaseline="middle"
                  >
                    {stop.label}
                  </text>
                </g>
              </g>
            ))}
          </svg>

          {/* Bottom caption */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080808] to-transparent flex items-end justify-center pb-3">
            <p className="text-warm-gray-500 text-xs tracking-wide">
              AI-generated · every walk is one of a kind · this route will never repeat
            </p>
          </div>
        </div>

        {/* Mobile: vertical stop list */}
        <div className="md:hidden">
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-4 top-5 bottom-5 w-px bg-gradient-to-b from-amber-400/60 via-amber-400/20 to-transparent" />

            {MOBILE_STOPS.map((stop, i) => (
              <FadeIn key={stop.num} delay={i * 80} className="flex items-start gap-5 mb-7">
                <div className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-ink text-xs font-bold shadow-lg">
                  {stop.num}
                </div>
                <div className="pt-1">
                  <p className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-0.5">{stop.type}</p>
                  <p className="text-warm-white font-medium">{stop.name}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <p className="text-warm-gray-500 text-xs text-center mt-4 tracking-wide italic">
            AI-generated · every walk is one of a kind
          </p>
        </div>
      </div>
    </section>
  )
}
