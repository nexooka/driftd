'use client'

import { useEffect, useRef, useState } from 'react'

interface MapStop {
  number: number
  name: string
  lat: number
  lng: number
}

/* One OSRM call for the full route → per-leg geometry via steps */
async function fetchAllLegs(
  latlngs: [number, number][]
): Promise<([number, number][] | null)[]> {
  const n = latlngs.length
  if (n < 2) return []
  try {
    const coordStr = latlngs.map(([lat, lng]) => `${lng},${lat}`).join(';')
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/foot/${coordStr}?overview=false&steps=true&geometries=geojson`,
      { signal: AbortSignal.timeout(10000) }
    )
    const data = await res.json()
    const legs: any[] = data.routes?.[0]?.legs
    if (!legs?.length) return new Array(n - 1).fill(null)

    return legs.map(leg => {
      const coords: [number, number][] = []
      leg.steps?.forEach((step: any) => {
        step.geometry?.coordinates?.forEach(([lng, lat]: [number, number]) => {
          const last = coords[coords.length - 1]
          if (!last || last[0] !== lat || last[1] !== lng) {
            coords.push([lat, lng])
          }
        })
      })
      return coords.length > 1 ? coords : null
    })
  } catch {
    return new Array(n - 1).fill(null)
  }
}

export default function RouteMap({ stops, routeKey }: { stops: MapStop[]; routeKey: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const segPolysRef = useRef<any[]>([])
  const segPathElemsRef = useRef<(SVGPathElement | null)[]>([])
  const markerElemsRef = useRef<(HTMLElement | null)[]>([])
  const animTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const userClickedRef = useRef(false)
  const activeStopRef = useRef(stops.length - 1)

  const [activeStop, setActiveStop] = useState(stops.length - 1)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => { activeStopRef.current = activeStop }, [activeStop])

  useEffect(() => {
    userClickedRef.current = false
    activeStopRef.current = stops.length - 1
    setActiveStop(stops.length - 1)
    setHasInteracted(false)
  }, [routeKey, stops.length])

  /* Update segment colors on user interaction */
  useEffect(() => {
    if (!hasInteracted) return
    animTimersRef.current.forEach(clearTimeout)
    animTimersRef.current = []

    segPolysRef.current.forEach(([glow, main], i) => {
      const active = i < activeStop
      if (glow) glow.setStyle({
        color: active ? '#fbbf24' : '#1e1e1e',
        opacity: active ? 0.18 : 0,
      })
      if (main) {
        const pathEl = segPathElemsRef.current[i]
        if (pathEl) {
          pathEl.style.transition = 'none'
          pathEl.style.strokeDasharray = 'none'
          pathEl.style.strokeDashoffset = '0'
        }
        main.setStyle({
          color: active ? '#fbbf24' : '#1e1e1e',
          opacity: active ? 0.92 : 0.3,
        })
      }
    })
    markerElemsRef.current.forEach((el, i) => {
      if (el) el.style.opacity = i <= activeStop ? '1' : '0.28'
    })
  }, [activeStop, hasInteracted])

  /* Map setup */
  useEffect(() => {
    if (!containerRef.current) return
    if (!stops.length || stops.some(s => !s.lat || !s.lng)) return

    let destroyed = false
    segPolysRef.current = []
    segPathElemsRef.current = []
    markerElemsRef.current = []
    animTimersRef.current.forEach(clearTimeout)
    animTimersRef.current = []

    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }

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

      const segmentCoords = await fetchAllLegs(latlngs)
      if (destroyed) return

      // Draw segments — start invisible
      const pairs: any[] = segmentCoords.map((coords, i) => {
        const pts = coords?.length
          ? coords
          : [[stops[i].lat, stops[i].lng], [stops[i + 1].lat, stops[i + 1].lng]] as [number, number][]
        const isDash = !coords?.length

        const glow = L.polyline(pts, {
          color: '#fbbf24',
          opacity: 0,
          weight: 16,
          smoothFactor: 0,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map)

        const main = L.polyline(pts, {
          color: '#fbbf24',
          opacity: 0,
          weight: isDash ? 2.5 : 4,
          smoothFactor: 0,
          lineCap: 'round',
          lineJoin: 'round',
          ...(isDash ? { dashArray: '5 8' } : {}),
        }).addTo(map)

        if (!isDash) {
          // Use double-rAF so the SVG has been painted before we measure
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const pathEl = main.getElement() as SVGPathElement | null
            segPathElemsRef.current[i] = pathEl
            if (pathEl) {
              try {
                const len = pathEl.getTotalLength()
                if (len > 0) {
                  pathEl.style.strokeDasharray = `${len}`
                  pathEl.style.strokeDashoffset = `${len}`
                }
              } catch {}
            }
          }))
        }

        return [glow, main]
      })
      segPolysRef.current = pairs

      // Reveal all segments at once after OSRM fetch completes
      pairs.forEach(([glow, main], i) => {
        const isDash = !segmentCoords[i]?.length
        if (!isDash) glow.setStyle({ opacity: 0.18 })
        main.setStyle({ opacity: isDash ? 0.55 : 0.92 })
        if (!isDash) {
          const pathEl = segPathElemsRef.current[i]
          if (pathEl) {
            pathEl.style.strokeDashoffset = '0'
          }
        }
      })

      // Draw markers
      stops.forEach((stop, i) => {
        const isFirst = i === 0
        const isLast = i === stops.length - 1
        const size = (isFirst || isLast) ? 38 : 28
        const anchor = (isFirst || isLast) ? 19 : 14

        let markerHtml: string
        if (isFirst) {
          markerHtml = `
            <div style="width:38px;height:38px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer">
              <div class="stop-ping-soft" style="position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(251,191,36,0.4)"></div>
              <div style="position:absolute;inset:5px;border-radius:50%;background:rgba(251,191,36,0.14);border:1px solid rgba(251,191,36,0.3)"></div>
              <div style="width:24px;height:24px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#0a0a0a;font-family:ui-sans-serif,system-ui;box-shadow:0 2px 14px rgba(251,191,36,0.65)">1</div>
            </div>`
        } else if (isLast) {
          markerHtml = `
            <div style="width:38px;height:38px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer">
              <div class="stop-ping-soft" style="position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(251,191,36,0.4)"></div>
              <div style="position:absolute;inset:5px;border-radius:50%;background:rgba(251,191,36,0.14);border:1px solid rgba(251,191,36,0.3)"></div>
              <div style="width:24px;height:24px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#0a0a0a;font-family:ui-sans-serif,system-ui;box-shadow:0 2px 14px rgba(251,191,36,0.65)">${stops.length}</div>
            </div>`
        } else {
          markerHtml = `
            <div style="width:28px;height:28px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#0a0a0a;font-family:ui-sans-serif,system-ui;box-shadow:0 2px 10px rgba(251,191,36,0.45);cursor:pointer">${i + 1}</div>`
        }

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [size, size],
          iconAnchor: [anchor, anchor],
          popupAnchor: [0, -anchor - 4],
        })

        const marker = L.marker([stop.lat, stop.lng], { icon })
          .bindPopup(
            `<div style="font-family:ui-sans-serif,system-ui;font-size:13px;font-weight:600;color:#111;padding:2px 0">${stop.name}</div>`,
            { className: 'driftd-popup', maxWidth: 200 }
          )
          .on('click', () => {
            userClickedRef.current = true
            setHasInteracted(true)
            if (i === activeStopRef.current) return
            setActiveStop(i)
          })
          .addTo(map)

        requestAnimationFrame(() => {
          markerElemsRef.current[i] = marker.getElement?.() ?? null
        })
      })

      if (latlngs.length > 1) {
        map.fitBounds(L.latLngBounds(latlngs), { padding: [48, 48], maxZoom: 16 })
      }

      mapRef.current = map
    })

    return () => {
      destroyed = true
      animTimersRef.current.forEach(clearTimeout)
      animTimersRef.current = []
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey])

  const isPartial = hasInteracted && activeStop < stops.length - 1

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          ref={containerRef}
          className="w-full rounded-2xl overflow-hidden border border-white/[0.06]"
          style={{ height: '420px', background: '#0a0a0a' }}
        />
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 90px 35px #0a0a0a', zIndex: 500 }}
        />
      </div>
      <div className="flex items-center justify-between px-1 h-5">
        <p className="text-[10px] text-warm-gray-600 tracking-wide">
          tap a stop marker to walk the route step by step
        </p>
        {isPartial && (
          <button
            onClick={() => {
              userClickedRef.current = true
              activeStopRef.current = stops.length - 1
              setActiveStop(stops.length - 1)
            }}
            className="text-[10px] text-amber-400/70 hover:text-amber-400 transition-colors tracking-wide"
          >
            show full route →
          </button>
        )}
      </div>
    </div>
  )
}
