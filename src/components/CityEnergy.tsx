'use client'
import { useEffect, useRef, useState } from 'react'

const CITIES = [
  { name: 'Warsaw', lat: 52.237, lng: 21.017, active: 31 },
  { name: 'Kraków', lat: 50.064, lng: 19.944, active: 19 },
  { name: 'Prague', lat: 50.088, lng: 14.421, active: 23 },
]

const PER_CITY = 10
const TRAIL_MAX = 22
const SCATTER_R = 20  // px radius particles orbit within

type Particle = {
  x: number; y: number
  tx: number; ty: number
  speed: number
  trail: [number, number][]
  ping: number   // -1 = off, 0–1 = expanding ring
  delay: number  // frames until next ping is eligible
}

function spawnParticle(cx: number, cy: number, initialDelay: number): Particle {
  const a1 = Math.random() * Math.PI * 2
  const r1 = 4 + Math.random() * (SCATTER_R - 4)
  const a2 = Math.random() * Math.PI * 2
  const r2 = 4 + Math.random() * (SCATTER_R - 4)
  return {
    x: cx + Math.cos(a1) * r1, y: cy + Math.sin(a1) * r1,
    tx: cx + Math.cos(a2) * r2, ty: cy + Math.sin(a2) * r2,
    speed: 0.2 + Math.random() * 0.45,
    trail: [], ping: -1, delay: initialDelay,
  }
}

type CityPx = { name: string; active: number; cx: number; cy: number }

export default function CityEnergy() {
  const mapDivRef  = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [cityPos,  setCityPos]  = useState<CityPx[]>([])
  const [total,    setTotal]    = useState(2847)

  // Slowly tick the counter up
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>
    function sched() {
      id = setTimeout(() => { setTotal(n => n + 1); sched() }, 12000 + Math.random() * 18000)
    }
    sched()
    return () => clearTimeout(id)
  }, [])

  // Map + canvas animation
  useEffect(() => {
    const mapEl = mapDivRef.current
    const canvas = canvasRef.current
    if (!mapEl || !canvas) return

    let destroyed = false
    let raf = 0
    let leafletMap: any = null

    import('leaflet').then(L => {
      if (destroyed) return

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const map = L.map(mapEl, {
        zoomControl: false, attributionControl: false,
        dragging: false, touchZoom: false, scrollWheelZoom: false,
        doubleClickZoom: false, keyboard: false, boxZoom: false,
      })
      leafletMap = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19, subdomains: 'abcd',
      }).addTo(map)

      // Fit all three cities with room to breathe
      map.fitBounds([[49.0, 12.5], [53.6, 23.0]], { padding: [16, 16] })

      // Canvas — explicit size, retina-aware
      const W = mapEl.clientWidth
      const H = mapEl.clientHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      const ctx = canvas.getContext('2d')!
      ctx.scale(dpr, dpr)

      // Project city centers into canvas space
      const projected: CityPx[] = CITIES.map(c => {
        const pt = map.latLngToContainerPoint(L.latLng(c.lat, c.lng))
        return { name: c.name, active: c.active, cx: pt.x, cy: pt.y }
      })
      if (!destroyed) setCityPos(projected)

      // Spawn particle clouds for each city
      const clouds: Particle[][] = projected.map((city, ci) =>
        Array.from({ length: PER_CITY }, (_, i) =>
          spawnParticle(city.cx, city.cy, i * 14 + ci * 7)
        )
      )

      function tick() {
        if (destroyed) return
        raf = requestAnimationFrame(tick)
        ctx.clearRect(0, 0, W, H)

        projected.forEach((city, ci) => {
          const { cx, cy } = city

          clouds[ci].forEach(p => {
            // Move toward target
            const dx = p.tx - p.x, dy = p.ty - p.y
            const dist = Math.hypot(dx, dy)

            if (dist < p.speed) {
              p.x = p.tx; p.y = p.ty
              const a = Math.random() * Math.PI * 2
              const r = 4 + Math.random() * (SCATTER_R - 4)
              p.tx = cx + Math.cos(a) * r
              p.ty = cy + Math.sin(a) * r
              if (p.delay <= 0 && p.ping < 0 && Math.random() < 0.28) {
                p.ping = 0
                p.delay = 140 + Math.floor(Math.random() * 280)
              }
            } else {
              p.x += (dx / dist) * p.speed
              p.y += (dy / dist) * p.speed
            }
            if (p.delay > 0) p.delay--

            // Append trail, cap length
            p.trail.push([p.x, p.y])
            if (p.trail.length > TRAIL_MAX) p.trail.shift()

            // Draw trail — fades from transparent to amber
            for (let t = 1; t < p.trail.length; t++) {
              const frac = t / p.trail.length
              ctx.beginPath()
              ctx.moveTo(p.trail[t - 1][0], p.trail[t - 1][1])
              ctx.lineTo(p.trail[t][0], p.trail[t][1])
              ctx.strokeStyle = `rgba(251,191,36,${frac * 0.4})`
              ctx.lineWidth = frac * 1.8
              ctx.lineCap = 'round'
              ctx.stroke()
            }

            // Soft halo
            ctx.beginPath()
            ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(251,191,36,0.09)'
            ctx.fill()

            // Core dot
            ctx.beginPath()
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2)
            ctx.fillStyle = '#fbbf24'
            ctx.fill()

            // Ping ring — expands and fades
            if (p.ping >= 0) {
              ctx.beginPath()
              ctx.arc(p.x, p.y, p.ping * 30, 0, Math.PI * 2)
              ctx.strokeStyle = `rgba(251,191,36,${(1 - p.ping) * 0.5})`
              ctx.lineWidth = 1.2
              ctx.stroke()
              p.ping += 0.017
              if (p.ping > 1) p.ping = -1
            }
          })
        })
      }

      tick()
    })

    return () => {
      destroyed = true
      cancelAnimationFrame(raf)
      if (leafletMap) { leafletMap.remove(); leafletMap = null }
    }
  }, [])

  return (
    <section className="relative bg-[#0a0a0a] overflow-hidden" style={{ height: 500 }}>
      {/* Leaflet base map */}
      <div ref={mapDivRef} className="absolute inset-0" style={{ background: '#07070f' }} />

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 650 }}
      />

      {/* HTML city labels — positioned via Leaflet projections */}
      {cityPos.map(city => (
        <div
          key={city.name}
          className="absolute pointer-events-none z-[700] text-center"
          style={{ left: city.cx, top: city.cy + SCATTER_R + 10, transform: 'translateX(-50%)' }}
        >
          <p className="text-[9px] font-semibold tracking-[0.18em] uppercase text-white/60">{city.name}</p>
          <p className="text-[8.5px] font-semibold text-amber-400/60 mt-px">{city.active} active</p>
        </div>
      ))}

      {/* Edge fades — blend into surrounding sections */}
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-[710]"
        style={{ background: 'linear-gradient(to bottom, #0a0a0a, transparent)' }} />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-[710]"
        style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }} />
      <div className="absolute inset-y-0 left-0 w-28 pointer-events-none z-[710]"
        style={{ background: 'linear-gradient(to right, #0a0a0a, transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-28 pointer-events-none z-[710]"
        style={{ background: 'linear-gradient(to left, #0a0a0a, transparent)' }} />

      {/* UI overlay */}
      <div className="absolute inset-0 z-[750] pointer-events-none flex items-start justify-between px-10 pt-10 md:px-14 md:pt-12">
        {/* Live pulse badge */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
          <span className="text-[10px] tracking-[0.22em] uppercase text-amber-400/75 font-medium">drift activity</span>
        </div>

        {/* Running total */}
        <div className="text-right">
          <div
            className="font-display font-black text-warm-white tabular-nums leading-none"
            style={{ fontSize: '2.4rem', textShadow: '0 0 50px rgba(251,191,36,0.22)' }}
          >
            {total.toLocaleString()}
          </div>
          <p className="text-[9.5px] text-warm-gray-400 tracking-[0.18em] uppercase mt-1">drifts generated</p>
        </div>
      </div>
    </section>
  )
}
