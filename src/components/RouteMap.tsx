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
  const segPolysRef = useRef<any[]>([])          // [glow, main] pairs
  const segPathElemsRef = useRef<(SVGPathElement | null)[]>([])  // main SVG path elements
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

  /* Update segment colors on user interaction */
  useEffect(() => {
    if (!hasInteracted) return
    animTimersRef.current.forEach(clearTimeout)
    animTimersRef.current = []

    segPolysRef.current.forEach(([glow, main], i) => {
      const active = i < activeStop
      if (glow) glow.setStyle({
        color: active ? '#fbbf24' : '#1e1e1e',
        opacity: active ? 0.13 : 0,
      })
      if (main) {
        // Remove draw animation, switch to plain opacity control
        const pathEl = segPathElemsRef.current[i]
        if (pathEl) {
          pathEl.style.transition = 'none'
          pathEl.style.strokeDasharray = 'none'
          pathEl.style.strokeDashoffset = '0'
        }
        main.setStyle({
          color: active ? '#fbbf24' : '#1e1e1e',
          opacity: active ? 0.88 : 0.3,
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

      // Flatten all route points for the dot
      const allPoints: [number, number][] = []
      segmentCoords.forEach((coords, i) => {
        const pts = coords ?? [[latlngs[i][0], latlngs[i][1]], [latlngs[i + 1][0], latlngs[i + 1][1]]] as [number, number][]
        pts.forEach((p, j) => {
          if (j === 0 && allPoints.length > 0) return
          allPoints.push(p)
        })
      })
      allRoutePointsRef.current = allPoints

      // Draw segments — start invisible
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

        // Prepare stroke-dashoffset draw animation on the SVG path
        if (!isDash) {
          requestAnimationFrame(() => {
            const pathEl = main.getElement() as SVGPathElement | null
            segPathElemsRef.current[i] = pathEl
            if (pathEl) {
              try {
                const len = pathEl.getTotalLength()
                pathEl.style.strokeDasharray = `${len}`
                pathEl.style.strokeDashoffset = `${len}`
              } catch {}
            }
          })
        }

        return [glow, main]
      })
      segPolysRef.current = pairs

      // Sequential reveal — glow fades in, main line draws itself
      pairs.forEach(([glow, main], i) => {
        const isDash = !segmentCoords[i]?.length
        const delay = 200 + i * 420

        const timer = setTimeout(() => {
          if (destroyed || userClickedRef.current) return
          glow.setStyle({ opacity: 0.13 })
          main.setStyle({ opacity: 0.88 })

          if (!isDash) {
            const pathEl = segPathElemsRef.current[i]
            if (pathEl) {
              pathEl.style.transition = 'stroke-dashoffset 0.72s ease-out'
              pathEl.style.strokeDashoffset = '0'
            }
          }
        }, delay)
        animTimersRef.current.push(timer)
      })

      // Traveling dot — always loops, never stopped by click
      const dot = L.circleMarker(latlngs[0], {
        radius: 4.5,
        color: 'transparent',
        fillColor: '#fbbf24',
        fillOpacity: 0,
        opacity: 0,
        weight: 0,
      }).addTo(map)
      dotMarkerRef.current = dot

      const dotDelay = 200 + pairs.length * 420 + 300
      const dotTimer = setTimeout(() => {
        if (destroyed) return
        dot.setStyle({ fillOpacity: 0.9 })

        const duration = Math.max(9000, allPoints.length * 45)
        let startTime: number | null = null

        const animateDot = (ts: number) => {
          if (destroyed) return
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

      // Draw markers with permanent labels
      stops.forEach((stop, i) => {
        const isFirst = i === 0
        const isLast = i === stops.length - 1
        const size = isLast ? 40 : isFirst ? 36 : 28
        const anchor = isLast ? 20 : isFirst ? 18 : 14

        let markerHtml: string
        if (isFirst) {
          markerHtml = `
            <div style="width:36px;height:36px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer">
              <div style="position:absolute;inset:0;border-radius:50%;background:rgba(251,191,36,0.18);border:1.5px solid rgba(251,191,36,0.45)"></div>
              <div style="width:24px;height:24px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#0a0a0a;font-family:ui-sans-serif,system-ui;box-shadow:0 2px 14px rgba(251,191,36,0.65)">1</div>
            </div>`
        } else if (isLast) {
          markerHtml = `
            <div style="width:40px;height:40px;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer">
              <div class="stop-ping" style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(251,191,36,0.55)"></div>
              <div style="position:absolute;inset:5px;border-radius:50%;background:rgba(251,191,36,0.14);border:1px solid rgba(251,191,36,0.32)"></div>
              <div style="width:26px;height:26px;background:#fbbf24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#0a0a0a;font-family:ui-sans-serif,system-ui;box-shadow:0 2px 18px rgba(251,191,36,0.75)">${stops.length}</div>
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
        })

        const marker = L.marker([stop.lat, stop.lng], { icon })
          .bindTooltip(stop.name, {
            permanent: true,
            direction: 'right',
            className: 'drift-label',
            offset: [anchor + 5, 0],
          })
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
      cancelAnimationFrame(dotRafRef.current)
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
        {/* Edge vignette — blends map into page background */}
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
