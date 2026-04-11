'use client'

import { useEffect, useRef } from 'react'

interface MapStop {
  number: number
  name: string
  lat: number
  lng: number
}

/* Gradient from amber → orange → terracotta across all segments */
function segColor(i: number, n: number): string {
  if (n <= 1) return '#fbbf24'
  const t = i / (n - 1)
  // amber(251,191,36) → orange(249,115,22) → terracotta(220,60,0)
  const r = Math.round(251 + t * (220 - 251))
  const g = Math.round(191 + t * (60 - 191))
  const b = Math.round(36 + t * (0 - 36))
  return `rgb(${r},${g},${b})`
}

/* One OSRM call for a single stop-to-stop leg */
async function fetchLeg(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): Promise<[number, number][] | null> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`,
      { signal: AbortSignal.timeout(5000) }
    )
    const data = await res.json()
    const coords = data.routes?.[0]?.geometry?.coordinates
    if (!coords?.length) return null
    return coords.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number])
  } catch {
    return null
  }
}

export default function RouteMap({ stops, routeKey }: { stops: MapStop[]; routeKey: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (!stops.length || stops.some(s => !s.lat || !s.lng)) return

    let destroyed = false

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    import('leaflet').then(async (L) => {
      if (destroyed || !containerRef.current) return

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const latlngs: [number, number][] = stops.map(s => [s.lat, s.lng])
      const centerLat = latlngs.reduce((s, p) => s + p[0], 0) / latlngs.length
      const centerLng = latlngs.reduce((s, p) => s + p[1], 0) / latlngs.length

      const map = L.map(containerRef.current!, {
        center: [centerLat, centerLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      L.control.attribution({ prefix: false, position: 'bottomright' })
        .addAttribution('© <a href="https://carto.com" style="color:#555">CARTO</a> © <a href="https://openstreetmap.org" style="color:#555">OSM</a>')
        .addTo(map)

      /* ── Draw each segment with its own color + OSRM geometry ── */
      const n = stops.length - 1
      if (n > 0) {
        const segmentCoords = await Promise.all(
          stops.slice(0, -1).map((stop, i) => {
            const next = stops[i + 1]
            return fetchLeg(stop.lat, stop.lng, next.lat, next.lng)
          })
        )

        if (!destroyed) {
          segmentCoords.forEach((coords, i) => {
            const color = segColor(i, n)
            if (coords?.length) {
              L.polyline(coords, { color, weight: 4, opacity: 0.95 }).addTo(map)
            } else {
              // Fallback: dashed straight line in segment color
              L.polyline(
                [[stops[i].lat, stops[i].lng], [stops[i + 1].lat, stops[i + 1].lng]],
                { color, weight: 2.5, opacity: 0.85, dashArray: '8 5' }
              ).addTo(map)
            }
          })
        }
      }

      if (destroyed) return

      /* ── Markers: numbered circles, first = amber, last = terracotta ── */
      stops.forEach((stop, i) => {
        const isFirst = i === 0
        const isLast = i === stops.length - 1
        const bgColor = isFirst ? '#fbbf24' : isLast ? '#dc5f00' : '#fff'
        const textColor = '#0a0a0a'
        const border = isFirst
          ? '2.5px solid rgba(251,191,36,0.4)'
          : isLast
          ? '2.5px solid rgba(220,95,0,0.4)'
          : '2.5px solid rgba(255,255,255,0.2)'
        const shadow = isFirst
          ? '0 2px 14px rgba(251,191,36,0.5)'
          : isLast
          ? '0 2px 14px rgba(220,95,0,0.45)'
          : '0 2px 8px rgba(0,0,0,0.5)'

        const label = isFirst ? 'S' : isLast ? 'E' : String(i + 1)

        const icon = L.divIcon({
          html: `<div style="
            width:32px;height:32px;
            background:${bgColor};
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:${isFirst || isLast ? '11px' : '12px'};
            font-weight:800;color:${textColor};
            font-family:ui-sans-serif,system-ui;
            box-shadow:${shadow};
            border:${border};
          ">${label}</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -20],
        })

        L.marker([stop.lat, stop.lng], { icon })
          .bindPopup(
            `<div style="font-family:ui-sans-serif,system-ui;font-size:13px;font-weight:600;color:#111;padding:2px 0">${stop.name}</div>`,
            { className: 'driftd-popup', maxWidth: 200 }
          )
          .addTo(map)
      })

      if (latlngs.length > 1) {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48], maxZoom: 16 })
      }

      mapRef.current = map
    })

    return () => {
      destroyed = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey])

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border border-white/[0.06]"
        style={{ height: '420px', background: '#0a0a0a' }}
      />
      {/* Color legend */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-2 rounded-full" style={{ background: '#fbbf24' }} />
          <span className="text-[10px] text-warm-gray-500 tracking-wide">start</span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, #fbbf24, #f97316, #dc5f00)', opacity: 0.4 }} />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-2 rounded-full" style={{ background: '#dc5f00' }} />
          <span className="text-[10px] text-warm-gray-500 tracking-wide">end</span>
        </div>
      </div>
    </div>
  )
}
