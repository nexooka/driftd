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
          L.polyline(routeCoords, { color: '#fbbf24', weight: 3.5, opacity: 0.9 }).addTo(map)
        }
      } catch {
        if (!destroyed) {
          L.polyline(latlngs, {
            color: '#fbbf24', weight: 2.5, opacity: 0.8, dashArray: '8 5',
          }).addTo(map)
        }
      }

      if (destroyed) return

      // Numbered amber markers — first stop slightly larger with outer ring
      stops.forEach((stop, i) => {
        const isFirst = i === 0
        const size = isFirst ? 34 : 28
        const anchor = isFirst ? 17 : 14

        const icon = L.divIcon({
          html: isFirst
            ? `<div style="
                width:34px;height:34px;position:relative;
                display:flex;align-items:center;justify-content:center;
              ">
                <div style="
                  position:absolute;inset:0;border-radius:50%;
                  background:rgba(251,191,36,0.2);
                  border:1.5px solid rgba(251,191,36,0.5);
                "></div>
                <div style="
                  width:24px;height:24px;
                  background:#fbbf24;border-radius:50%;
                  display:flex;align-items:center;justify-content:center;
                  font-size:11px;font-weight:800;color:#0a0a0a;
                  font-family:ui-sans-serif,system-ui;
                  box-shadow:0 2px 12px rgba(251,191,36,0.6);
                ">1</div>
              </div>`
            : `<div style="
                width:28px;height:28px;
                background:#fbbf24;border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                font-size:11px;font-weight:800;color:#0a0a0a;
                font-family:ui-sans-serif,system-ui;
                box-shadow:0 2px 10px rgba(251,191,36,0.45);
              ">${i + 1}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [anchor, anchor],
          popupAnchor: [0, -anchor - 4],
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
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-white/[0.06]"
      style={{ height: '420px', background: '#0a0a0a' }}
    />
  )
}
