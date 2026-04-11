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

/* Interpolate a [lat,lng] position at fraction t (0–1) along a polyline */
function interpolateAlongPath(
  points: [number, number][],
  t: number
): [number, number] | null {
  if (points.length < 2) return null
  // Build cumulative distances
  const dists: number[] = [0]
  for (let i = 1; i < points.length; i++) {
    const [lat1, lng1] = points[i - 1]
    const [lat2, lng2] = points[i]
    const d = Math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2)
    dists.push(dists[i - 1] + d)
  }
  const total = dists[dists.length - 1]
  if (total === 0) return points[0]
  const target = t * total
  for (let i = 1; i < points.length; i++) {
    if (dists[i] >= target) {
      const seg = dists[i] - dists[i - 1]
      const frac = seg > 0 ? (target - dists[i - 1]) / seg : 0
      const [lat1, lng1] = points[i - 1]
      const [lat2, lng2] = points[i]
      return [lat1 + (lat2 - lat1) * frac, lng1 + (lng2 - lng1) * frac]
    }
  }
  return points[points.length - 1]
}

export default function RouteMap({ stops, routeKey }: { stops: MapStop[]; routeKey: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const segPolysRef = useRef<any[]>([])        // [glow, main] pairs per segment
  const markerElemsRef = useRef<(HTMLElement | null)[]>([])
  const animTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const dotMarkerRef = useRef<any>(null)
  const dotRafRef = useRef<number>(0)
  const allRoutePointsRef = useRef<[number, number][]>([])
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

  /* Update visuals on user interaction */
  useEffect(() => {
    if (!userClickedRef.current) return
    animTimersRef.current.forEach(clearTimeout)
    animTimersRef.current = []

    // Hide traveling dot in segment mode
    if (dotMarkerRef.current) {
      dotMarkerRef.current.setStyle({ opacity: 0, fillOpacity: 0 })
    }

    segPolysRef.current.forEach(([glow, main], i) => {
      const active = i < activeStop
      if (glow) glow.setStyle({
        color: active ? '#fbbf24' : '#1e1e1e',
        opacity: active ? 0.13 : 0,
      })
      if (main) main.setStyle({
        color: active ? '#fbbf24' : '#1e1e1e',
        opacity: active ? 0.88 : 0.3,
      })
    })
    markerElemsRef.current.forEach((el, i) => {
      if (el) el.style.opacity = i <= activeStop ? '1' : '0.28'
    })
  }, [activeStop])

  /* Map setup */
  useEffect(() => {
    if (!containerRef.current) return
    if (!stops.length || stops.some(s => !s.lat || !s.lng)) return

    let destroyed = false
    segPolysRef.current = []
    markerElemsRef.current = []
    animTimersRef.current.forEach(clearTimeout)
    animTimersRef.current = []
    cancelAnimationFrame(dotRafRef.current)
    allRoutePointsRef.current = []

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

      // Flatten all route points for the traveling dot
      const allPoints: [number, number][] = []
      segmentCoords.forEach((coords, i) => {
        const pts = coords ?? [[latlngs[i][0], latlngs[i][1]], [latlngs[i + 1][0], latlngs[i + 1][1]]] as [number, number][]
        pts.forEach((p, j) => {
          if (j === 0 && allPoints.length > 0) return // skip duplicate junction
          allPoints.push(p)
        })
      })
      allRoutePointsRef.current = allPoints

      // Draw segments: each is [glow polyline, main polyline], start opacity 0
      const pairs: any[] = segmentCoords.map((coords, i) => {
        const pts = coords?.length
          ? coords
          : [[stops[i].lat, stops[i].lng], [stops[i + 1].lat, stops[i + 1].lng]] as [number, number][]
        const isDash = !coords?.length

        const glow = L.polyline(pts, {
          color: '#fbbf24',
          opacity: 0,
          weight: 14,
          smoothFactor: 0,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map)

        const main = L.polyline(pts, {
          color: '#fbbf24',
          opacity: 0,
          weight: 2.5,
          smoothFactor: 0,
          lineCap: 'round',
          lineJoin: 'round',
          ...(isDash ? { dashArray: '8 6' } : {}),
        }).addTo(map)

        return [glow, main]
      })
      segPolysRef.current = pairs

      // Sequential reveal animation
      pairs.forEach(([glow, main], i) => {
        const timer = setTimeout(() => {
          if (!destroyed && !userClickedRef.current) {
            glow.setStyle({ opacity: 0.13 })
            main.setStyle({ opacity: 0.88 })
          }
        }, 150 + i * 380)
        animTimersRef.current.push(timer)
      })

      // Traveling dot (appears after route fully revealed)
      const dot = L.circleMarker(latlngs[0], {
        radius: 5,
        color: '#fbbf24',
        fillColor: '#fbbf24',
        fillOpacity: 0,
        opacity: 0,
        weight: 2,
      }).addTo(map)
      dotMarkerRef.current = dot

      const dotDelay = 150 + pairs.length * 380 + 400
      const dotTimer = setTimeout(() => {
        if (destroyed || userClickedRef.current) return
        dot.setStyle({ fillOpacity: 0.95, opacity: 0 }) // fill only, no border ring

        const duration = Math.max(18000, allPoints.length * 80) // ~18-35s per loop
        let startTime: number | null = null

        const animateDot = (ts: number) => {
          if (destroyed || userClickedRef.current) return
          if (!startTime) startTime = ts
          const elapsed = ts - startTime
          const t = (elapsed % duration) / duration
          const pos = interpolateAlongPath(allPoints, t)
          if (pos) dot.setLatLng(pos)
          dotRafRef.current = requestAnimationFrame(animateDot)
        }
        dotRafRef.current = requestAnimationFrame(animateDot)
      }, dotDelay)
      animTimersRef.current.push(dotTimer)

      // Draw markers
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
      cancelAnimationFrame(dotRafRef.current)
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
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
