'use client'

import { useEffect, useRef } from 'react'

interface MapStop {
  number: number
  name: string
  lat: number
  lng: number
}

export default function RouteMap({ stops, routeKey }: { stops: MapStop[]; routeKey: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (!stops.length || stops.some(s => !s.lat || !s.lng)) return

    let destroyed = false

    // Clean up previous instance
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    import('leaflet').then(async (L) => {
      if (destroyed || !containerRef.current) return

      // Inject leaflet CSS once
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

      // Dark tiles — CartoDB Dark Matter, no API key needed
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      // Subtle attribution
      L.control.attribution({ prefix: false, position: 'bottomright' })
        .addAttribution('© <a href="https://carto.com" style="color:#555">CARTO</a> © <a href="https://openstreetmap.org" style="color:#555">OSM</a>')
        .addTo(map)

      // Helper: bearing in degrees between two lat/lng points
      function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const toRad = (d: number) => d * Math.PI / 180
        const dLng = toRad(lng2 - lng1)
        const y = Math.sin(dLng) * Math.cos(toRad(lat2))
        const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2))
          - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng)
        return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
      }

      // Place arrow markers along a geometry at ~every `interval` metres
      function addArrows(coords: [number, number][], intervalM: number) {
        let accumulated = 0
        for (let i = 1; i < coords.length; i++) {
          const [lat1, lng1] = coords[i - 1]
          const [lat2, lng2] = coords[i]
          const dLat = (lat2 - lat1) * Math.PI / 180
          const dLng = (lng2 - lng1) * Math.PI / 180
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
          const segM = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          accumulated += segM
          if (accumulated >= intervalM) {
            accumulated = 0
            const midLat = (lat1 + lat2) / 2
            const midLng = (lng1 + lng2) / 2
            const deg = bearing(lat1, lng1, lat2, lng2)
            const arrowIcon = L.divIcon({
              html: `<div style="
                width:18px;height:18px;
                display:flex;align-items:center;justify-content:center;
                transform:rotate(${deg}deg);
              ">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1 L12 10 L7 8 L2 10 Z" fill="#fbbf24" fill-opacity="0.9"/>
                </svg>
              </div>`,
              className: '',
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })
            L.marker([midLat, midLng], { icon: arrowIcon, interactive: false }).addTo(map)
          }
        }
      }

      // Try OSRM for actual walking path
      try {
        const coordStr = latlngs.map(([lat, lng]) => `${lng},${lat}`).join(';')
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/foot/${coordStr}?overview=full&geometries=geojson`,
          { signal: AbortSignal.timeout(5000) }
        )
        const data = await res.json()
        const routeCoords = data.routes?.[0]?.geometry?.coordinates?.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
        )
        if (!destroyed && routeCoords?.length) {
          L.polyline(routeCoords, {
            color: '#fbbf24',
            weight: 3.5,
            opacity: 0.9,
          }).addTo(map)
          addArrows(routeCoords, 120)
        }
      } catch {
        // Fallback: straight dashed lines with arrows
        if (!destroyed) {
          L.polyline(latlngs, {
            color: '#fbbf24',
            weight: 2.5,
            opacity: 0.8,
            dashArray: '8 5',
          }).addTo(map)
          addArrows(latlngs, 120)
        }
      }

      if (destroyed) return

      // Amber numbered markers
      stops.forEach((stop, i) => {
        const icon = L.divIcon({
          html: `<div style="
            width: 30px; height: 30px;
            background: #fbbf24;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 800; color: #0a0a0a;
            font-family: ui-sans-serif, system-ui;
            box-shadow: 0 2px 14px rgba(251,191,36,0.55);
            border: 2px solid rgba(251,191,36,0.3);
          ">${i + 1}</div>`,
          className: '',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -18],
        })

        L.marker([stop.lat, stop.lng], { icon })
          .bindPopup(
            `<div style="font-family:ui-sans-serif,system-ui;font-size:13px;font-weight:600;color:#111;padding:2px 0">${stop.name}</div>`,
            { className: 'driftd-popup', maxWidth: 200 }
          )
          .addTo(map)
      })

      // Fit all stops in view
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
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-white/[0.06]"
      style={{ height: '420px', background: '#0a0a0a' }}
    />
  )
}
