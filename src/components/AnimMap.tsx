'use client'
import { useEffect, useRef, useState } from 'react'

const W = 480, H = 300

// Warsaw stops projected into SVG space
// Bounding box: lat 52.220–52.265, lng 21.005–21.060
const STOPS_XY = [
  { n: 1, x: 109, y: 201 }, // Bar Familijny — Śródmieście
  { n: 2, x: 374, y: 123 }, // Neon Muzeum — Praga
  { n: 3, x: 321, y:  81 }, // Bazar Różyckiego — Praga
  { n: 4, x: 153, y: 170 }, // Pod Papugami — Powiśle
]

// Smooth bezier route: Śródmieście → Praga (cross river) → Praga → Powiśle (cross back)
const ROUTE = 'M 109,201 C 190,185 340,145 374,123 C 390,110 345,78 321,81 C 270,84 185,148 153,170'

// Vistula river (flows N→S, center of map)
const RIVER = 'M 172,0 C 167,50 174,130 170,220 L 168,300 L 308,300 C 306,225 312,130 308,55 Z'

// Major streets [x1, y1, x2, y2]
const STR_MAJOR: [number, number, number, number][] = [
  [62, 0, 62, 300], [123, 80, 123, 300], [149, 60, 149, 300],   // W N-S
  [340, 0, 340, 300], [393, 0, 393, 200],                        // E N-S
  [0, 247, 168, 247], [0, 187, 168, 187], [0, 120, 168, 120],   // W E-W
  [312, 247, 480, 247], [312, 187, 480, 187], [312, 120, 480, 120], // E E-W
]
const STR_MINOR: [number, number, number, number][] = [
  [88, 140, 88, 300], [35, 0, 35, 300], [360, 90, 360, 300], [420, 50, 420, 250], [445, 0, 445, 300],
  [0, 165, 162, 165], [0, 210, 162, 210], [0, 75, 162, 75], [0, 290, 162, 290],
  [312, 160, 480, 160], [312, 90, 480, 90], [312, 220, 480, 220], [312, 260, 480, 260],
]

export default function AnimMap({
  drawProgress,
  stopsVisible,
}: {
  drawProgress: number
  stopsVisible: number
}) {
  const pathRef = useRef<SVGPathElement>(null)
  const [pathLen, setPathLen] = useState(2000)

  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength())
  }, [])

  const dp = Math.max(0, Math.min(1, drawProgress))
  const offset = pathLen * (1 - dp)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ display: 'block' }}>
      <defs>
        <pattern id="amap-dots" x="10" y="10" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.65" fill="rgba(255,255,255,0.048)" />
        </pattern>
        <filter id="amap-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" />
        </filter>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="#07070f" />
      <rect width={W} height={H} fill="url(#amap-dots)" />

      {/* Vistula */}
      <path d={RIVER} fill="rgba(18,42,105,0.24)" stroke="rgba(45,90,200,0.18)" strokeWidth="0.8" />

      {/* Bridge (Most Poniatowskiego) */}
      <line x1="170" y1="187" x2="308" y2="187"
        stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Streets */}
      {STR_MINOR.map(([x1, y1, x2, y2], i) => (
        <line key={`n${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(255,255,255,0.052)" strokeWidth="0.6" />
      ))}
      {STR_MAJOR.map(([x1, y1, x2, y2], i) => (
        <line key={`M${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(255,255,255,0.12)" strokeWidth="1.1" />
      ))}

      {/* Area labels */}
      <text x="22" y="268" fill="rgba(255,255,255,0.055)" fontSize="7" fontWeight="600"
        fontFamily="ui-sans-serif,system-ui,sans-serif" letterSpacing="0.18em">ŚRÓDMIEŚCIE</text>
      <text x="322" y="195" fill="rgba(255,255,255,0.048)" fontSize="7" fontWeight="600"
        fontFamily="ui-sans-serif,system-ui,sans-serif" letterSpacing="0.18em">PRAGA</text>
      <text x="195" y="148" fill="rgba(45,90,200,0.22)" fontSize="6" fontStyle="italic"
        fontFamily="ui-sans-serif,system-ui,sans-serif" letterSpacing="0.06em"
        transform="rotate(-4 220 148)">Wisła</text>

      {/* Route glow */}
      <path
        d={ROUTE}
        fill="none"
        stroke="rgba(251,191,36,0.32)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#amap-glow)"
        strokeDasharray={pathLen}
        strokeDashoffset={offset}
      />

      {/* Route line */}
      <path
        ref={pathRef}
        d={ROUTE}
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLen}
        strokeDashoffset={offset}
      />

      {/* Stop markers */}
      {STOPS_XY.map((s, i) => {
        const big = i === 0 || i === STOPS_XY.length - 1
        const r = big ? 12 : 9
        return (
          <g key={i} style={{ opacity: i < stopsVisible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            {big && (
              <circle cx={s.x} cy={s.y} r={r + 7}
                fill="rgba(251,191,36,0.07)" stroke="rgba(251,191,36,0.2)" strokeWidth="1" />
            )}
            <circle cx={s.x} cy={s.y} r={r} fill="#fbbf24" />
            <text
              x={s.x} y={s.y}
              textAnchor="middle" dominantBaseline="central"
              fill="#070710" fontSize={big ? 8 : 7}
              fontWeight="800" fontFamily="ui-sans-serif,system-ui,sans-serif"
            >{s.n}</text>
          </g>
        )
      })}
    </svg>
  )
}
