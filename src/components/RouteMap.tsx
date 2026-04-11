'use client'

import { useEffect, useRef, useState } from 'react'

interface MapStop {
  number: number
  name: string
  lat: number
  lng: number
}

async function fetchSegment(
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
  /* ── All state / refs declared first ─────────────────────────────── */
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const segPolysRef = useRef<any[]>([])
  const markerElemsRef = useRef<(HTMLElement | null)[]>([])
  const animTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const userClickedRef = useRef(false)
  const activeStopRef = useRef(stops.length - 1) // always in sync with state

  // activeStop: 0-indexed. clicking stop k shows segments 0..k-1 in amber.
  const [activeStop, setActiveStop] = useState(stops.length - 1)
  // hasInteracted: true once user has clicked a marker
  const [hasInteracted, setHasInteracted] = useState(false)

  /* ── Keep ref in sync with state ─────────────────────────────────── */
  useEffect(() => {
    activeStopRef.current = activeStop
  }, [activeStop])

  /* ── Reset everything on new route ───────────────────────────────── */
  useEffect(() => {
    userClickedRef.current = false
    activeStopRef.current = stops.length - 1
    setActiveStop(stops.length - 1)
    setHasInteracted(false)
  }, [routeKey, stops.length])

  /* ── Update map visuals on user interaction ───────────────────────── */
  useEffect(() => {
    if (!userClickedRef.current) return

    // Stop the reveal animation
    animTimersRef.current.forEach(clearTimeout)
    animTimersRef.current = []

    segPolysRef.current.forEach((poly, i) => {
      if (!poly) return
      const active = i < activeStop
      poly.setStyle({
        color: active ? '#fbbf24' : '#1e1e1e',
        opacity: active ? 0.92 : 0.45,
        weight: active ? 3.5 : 2,
      })
    })

    markerElemsRef.current.forEach((el, i) => {
      if (!el) return
      el.style.opacity = i <= activeStop ? '1' : '0.28'
    })
  }, [activeStop])

  /* ── Map setup (remounts only on new route) ───────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return
    if (!stops.length || stops.some(s => !s.lat || !s.lng)) return

    let destroyed = false
    segPolysRef.current = []
    markerElemsRef.current = []
    animTimersRef.current.forEach(clearTimeout)
    animTimersRef.current = []

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

      // Fetch all stop-to-stop walking segments in parallel
      const segmentCoords = await Promise.all(
        stops.slice(0, -1).map((stop, i) => {
          const next = stops[i + 1]
          return fetchSegment(stop.lat, stop.lng, next.lat, next.lng)
        })
      )

      if (destroyed) return

      // Draw all segments initially invisible — animation will reveal them
      const polys: any[] = segmentCoords.map((coords, i) => {
        if (coords?.length) {
          return L.polyline(coords, { color: '#fbbf24', opacity: 0, weight: 3.5 }).addTo(map)
        }
        return L.polyline(
          [[stops[i].lat, stops[i].lng], [stops[i + 1].lat, stops[i + 1].lng]],
          { color: '#fbbf24', opacity: 0, weight: 2.5, dashArray: '8 5' }
        ).addTo(map)
      })
      segPolysRef.current = polys

      // Sequential reveal animation: each segment fades in 380ms after the previous
      polys.forEach((poly, i) => {
        const timer = setTimeout(() => {
          if (!destroyed && !userClickedRef.current) {
            poly.setStyle({ opacity: 0.92 })
          }
        }, 150 + i * 380)
        animTimersRef.current.push(timer)
      })

      // Draw numbered markers
      stops.forEach((stop, i) => {
        const isFirst = i === 0
        const size = isFirst ? 36 : 28
        const anchor = isFirst ? 18 : 14

        const markerHtml = isFirst
          ? `<div style="width:36px;height:36px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer">
               <div style="position:absolute;inset:0;border-radius:50%;background:rgba(251,191,36,0.18);border:1.5px solid rgba(251,191,36,0.45)"></div>
               <div style="width:24px;height:24px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#0a0a0a;font-family:ui-sans-serif,system-ui;box-shadow:0 2px 14px rgba(251,191,36,0.65)">1</div>
             </div>`
          : `<div style="width:28px;height:28px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#0a0a0a;font-family:ui-sans-serif,system-ui;box-shadow:0 2px 10px rgba(251,191,36,0.45);cursor:pointer">${i + 1}</div>`

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
            // Clicking last stop when full route visible → no-op
            if (i === stops.length - 1 && activeStopRef.current === stops.length - 1) return
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
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey])

  const isPartial = hasInteracted && activeStop < stops.length - 1

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden border border-white/[0.06]"
        style={{ height: '420px', background: '#0a0a0a' }}
      />
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
