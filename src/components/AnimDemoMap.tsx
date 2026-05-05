'use client'
import { useEffect, useRef } from 'react'

const STOPS = [
  { lat: 52.2348, lng: 21.0175, num: 1, name: 'Bar Familijny' },
  { lat: 52.2466, lng: 21.0479, num: 2, name: 'Neon Muzeum' },
  { lat: 52.2529, lng: 21.0419, num: 3, name: 'Bazar Różyckiego' },
  { lat: 52.2395, lng: 21.0225, num: 4, name: 'Pod Papugami' },
]

async function fetchRoute(): Promise<[number, number][]> {
  const coordStr = STOPS.map(s => `${s.lng},${s.lat}`).join(';')
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${coordStr}?overview=full&geometries=geojson`,
      { signal: AbortSignal.timeout(10000) }
    )
    const data = await res.json()
    const raw: [number, number][] = data.routes?.[0]?.geometry?.coordinates ?? []
    return raw.length ? raw.map(([lng, lat]) => [lat, lng]) : STOPS.map(s => [s.lat, s.lng])
  } catch {
    return STOPS.map(s => [s.lat, s.lng])
  }
}

export default function AnimDemoMap({ height = 230 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let destroyed = false

    import('leaflet').then(async (L) => {
      if (destroyed || !containerRef.current) return

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const latlngs: [number, number][] = STOPS.map(s => [s.lat, s.lng])

      const map = L.map(containerRef.current!, {
        zoom: 14,
        center: [52.244, 21.033],
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        keyboard: false,
        boxZoom: false,
      })

      // No-labels dark tiles → cleaner, more design-tool aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      const routeCoords = await fetchRoute()
      if (destroyed) return

      // Outer glow — wide, low-opacity halo
      L.polyline(routeCoords, {
        color: '#fbbf24',
        weight: 18,
        opacity: 0.12,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)

      // Mid glow — tighter amber bloom
      L.polyline(routeCoords, {
        color: '#fbbf24',
        weight: 9,
        opacity: 0.22,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)

      // Main route line
      L.polyline(routeCoords, {
        color: '#fbbf24',
        weight: 4,
        opacity: 1,
        smoothFactor: 1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)

      // Markers
      STOPS.forEach((stop, i) => {
        const big = i === 0 || i === STOPS.length - 1
        const size = big ? 38 : 28
        const r = size / 2

        let html: string
        if (big) {
          html = `
            <div style="width:${size}px;height:${size}px;position:relative;display:flex;align-items:center;justify-content:center">
              <div style="position:absolute;inset:0;border-radius:50%;border:1px solid rgba(251,191,36,0.32);background:rgba(251,191,36,0.07)"></div>
              <div style="width:24px;height:24px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#080808;font-family:ui-sans-serif,system-ui;box-shadow:0 0 20px rgba(251,191,36,0.75),0 0 6px rgba(251,191,36,0.9)">${stop.num}</div>
            </div>`
        } else {
          html = `
            <div style="width:${size}px;height:${size}px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#080808;font-family:ui-sans-serif,system-ui;box-shadow:0 0 14px rgba(251,191,36,0.65),0 0 4px rgba(251,191,36,0.85)">${stop.num}</div>`
        }

        L.marker([stop.lat, stop.lng], {
          icon: L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [r, r] }),
        }).addTo(map)
      })

      map.fitBounds(L.latLngBounds(latlngs), { padding: [42, 42], maxZoom: 15 })
      mapRef.current = map
    })

    return () => {
      destroyed = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [])

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ height }}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: '#08080f' }}
      />
      {/* Heavy vignette — masks tile edges, keeps focal attention on route */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          boxShadow: 'inset 0 0 40px 25px rgba(8,8,15,0.97), inset 0 0 100px 10px rgba(8,8,15,0.5)',
          zIndex: 500,
        }}
      />
    </div>
  )
}
