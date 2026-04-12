'use client'

import { useState, useEffect, useRef, CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false })

/* ── Types ──────────────────────────────────────────────────────────── */
interface RouteStop {
  number: number
  name: string
  neighborhood: string
  address?: string
  lat?: number
  lng?: number
  description: string
  why_this_spot: string
  tagline?: string
  walk_to_next_minutes: number | null
  walk_to_next_meters?: number | null
  walk_note?: string | null
  time_at_stop_minutes: number
}
interface RouteResult {
  city: string
  intro: string
  total_minutes: number
  total_walking_minutes?: number
  total_walking_meters?: number
  vibes: string[]
  stops: RouteStop[]
  time_warning: string | null
}

/* ── Constants ──────────────────────────────────────────────────────── */
const VIBES = [
  'artsy', 'historic', 'foodie', 'nightlife',
  'sketchy-but-cool', 'chill', 'romantic', 'photogenic', 'quirky',
]

const LOADING_MSGS = [
  'reading local reddit threads...',
  'consulting the neighborhood...',
  'finding spots guidebooks missed...',
  'walking the route in our heads...',
  'timing the walk...',
  'picking the right coffee stops...',
  'almost there...',
]

/* ── City card patterns ─────────────────────────────────────────────── */
function CityPattern({ city }: { city: string }) {
  if (city === 'Warsaw') return (
    <svg viewBox="0 0 120 80" fill="none" className="absolute inset-0 w-full h-full opacity-[0.12]" aria-hidden>
      <rect x="56" y="14" width="8" height="66" fill="white"/>
      <rect x="48" y="30" width="24" height="50" fill="white"/>
      <rect x="40" y="42" width="40" height="38" fill="white"/>
      <polygon points="60,5 53,14 67,14" fill="white"/>
      <rect x="34" y="56" width="10" height="24" fill="white"/>
      <rect x="76" y="56" width="10" height="24" fill="white"/>
    </svg>
  )
  if (city === 'Berlin') return (
    <svg viewBox="0 0 120 80" fill="none" className="absolute inset-0 w-full h-full opacity-[0.12]" aria-hidden>
      <rect x="8"  y="28" width="7" height="52" fill="white"/>
      <rect x="22" y="28" width="7" height="52" fill="white"/>
      <rect x="36" y="28" width="7" height="52" fill="white"/>
      <rect x="50" y="28" width="7" height="52" fill="white"/>
      <rect x="64" y="28" width="7" height="52" fill="white"/>
      <rect x="78" y="28" width="7" height="52" fill="white"/>
      <rect x="92" y="28" width="7" height="52" fill="white"/>
      <rect x="106" y="28" width="7" height="52" fill="white"/>
      <rect x="4" y="22" width="112" height="9" fill="white"/>
      <rect x="4" y="14" width="112" height="6" fill="white"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 120 80" fill="none" className="absolute inset-0 w-full h-full opacity-[0.12]" aria-hidden>
      <path d="M15 80 L15 38 Q60 2 105 38 L105 80" fill="white"/>
      <path d="M25 80 L25 44 Q60 14 95 44 L95 80" fill="#0a0a0a"/>
      <path d="M40 80 L40 52 Q60 30 80 52 L80 80" fill="white"/>
      <path d="M50 80 L50 58 Q60 42 70 58 L70 80" fill="#0a0a0a"/>
    </svg>
  )
}

const CITY_BG: Record<string, string> = {
  Warsaw: 'from-red-950/50 to-stone-900/40',
  Berlin: 'from-slate-800/60 to-zinc-900/50',
  Prague: 'from-violet-950/50 to-amber-950/40',
}
const CITY_COUNTRY: Record<string, string> = {
  Warsaw: 'poland',
  Berlin: 'germany',
  Prague: 'czech republic',
}

/* ── Map helpers ─────────────────────────────────────────────────────── */
function computeMapPositions(stops: RouteStop[]) {
  const n = stops.length
  if (!n) return []
  const xL = 80, xR = 720, yHi = 105, yLo = 235
  return stops.map((stop, i) => {
    const x = n === 1 ? 400 : Math.round(xL + (i / (n - 1)) * (xR - xL))
    const y = i % 2 === 0 ? yLo : yHi
    const lw = Math.max(90, Math.min(160, stop.name.length * 7 + 20))
    const isLeft = x < 180, isRight = x > 620, isHigh = y < 170
    let lx: number, ly: number
    if (isLeft)       { lx = x + 14;       ly = y - 7  }
    else if (isRight) { lx = x - lw - 14;  ly = y - 7  }
    else if (isHigh)  { lx = x - lw / 2;   ly = y + 12 }
    else              { lx = x - lw / 2;   ly = y - 27 }
    return {
      x, y,
      lx: Math.round(Math.max(4, Math.min(800 - lw - 4, lx))),
      ly: Math.round(Math.max(4, Math.min(321, ly))),
      lw,
    }
  })
}

function buildPath(pts: Array<{x: number; y: number}>): string {
  if (!pts.length) return ''
  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i]
    const mx = Math.round((p.x + c.x) / 2)
    d += ` C ${mx},${p.y} ${mx},${c.y} ${c.x},${c.y}`
  }
  return d
}

/* ── Formatting helpers ──────────────────────────────────────────────── */
function fmtDist(meters: number): string {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`
}
function fmtWalkingLeg(minutes: number, meters?: number | null): string {
  const t = `${minutes} min walk`
  return meters ? `${t} · ${fmtDist(meters)}` : t
}
function fmtTotalWalking(minutes?: number, meters?: number): string | null {
  if (!minutes && !meters) return null
  const parts: string[] = []
  if (meters) parts.push(fmtDist(meters))
  if (minutes) {
    const h = Math.floor(minutes / 60), m = minutes % 60
    parts.push(h > 0 ? `${h}h ${m}min walking` : `${m}min walking`)
  }
  return parts.join(' · ')
}

/* ── Rate limiter ────────────────────────────────────────────────────── */
function checkRateLimit() {
  if (typeof window === 'undefined') return true
  const key = 'driftd_gen_times'
  const now = Date.now()
  const times: number[] = JSON.parse(localStorage.getItem(key) ?? '[]')
  const recent = times.filter(t => now - t < 60_000)
  if (recent.length >= 5) return false
  localStorage.setItem(key, JSON.stringify([...recent, now]))
  return true
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function DemoPage() {
  // Form
  const [city, setCity] = useState('')
  const [vibes, setVibes] = useState<string[]>([])
  const [minutes, setMinutes] = useState(60)
  const [startPt, setStartPt] = useState('')
  const [endPt, setEndPt] = useState('')
  const [notes, setNotes] = useState('')

  // UI
  const [view, setView] = useState<'form' | 'loading' | 'result'>('form')
  const [loadingIdx, setLoadingIdx] = useState(0)
  const [formError, setFormError] = useState('')

  // Result
  const [route, setRoute] = useState<RouteResult | null>(null)
  const [prevStops, setPrevStops] = useState<string[]>([])
  const [mapKey, setMapKey] = useState(0)
  const [visibleStops, setVisibleStops] = useState<boolean[]>([])
  const [pinnedWalk, setPinnedWalk] = useState<number | null>(null)

  // Optional field toggles
  const [showEnd, setShowEnd] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  // Per-stop photo + info panels
  const [stopPhotos, setStopPhotos] = useState<Record<number, string | 'loading' | 'notfound'>>({})
  const [stopInfos, setStopInfos] = useState<Record<number, string | 'loading'>>({})
  const [photoModal, setPhotoModal] = useState<number | null>(null)

  // Email modal
  const [showModal, setShowModal] = useState(false)
  const [modalEmail, setModalEmail] = useState('')
  const [modalStatus, setModalStatus] = useState<'idle' | 'saving' | 'done'>('idle')
  const [modalError, setModalError] = useState('')

  const handleFetchPhoto = async (idx: number, _name: string, _city: string) => {
    if (stopPhotos[idx] && stopPhotos[idx] !== 'loading') {
      if (stopPhotos[idx] !== 'notfound') setPhotoModal(idx)
      return
    }
    if (stopPhotos[idx] === 'loading') return

    const stop = route?.stops[idx]
    if (!stop?.lat || !stop?.lng) { setStopPhotos(p => ({ ...p, [idx]: 'notfound' })); return }

    setStopPhotos(p => ({ ...p, [idx]: 'loading' }))
    const key = process.env.NEXT_PUBLIC_GOOGLE_STREET_VIEW_KEY

    try {
      // ── 1. Try Google Places photo (real venue photo, often interior) ───
      const placesUrl = `/api/stop-photo?name=${encodeURIComponent(stop.name)}&lat=${stop.lat}&lng=${stop.lng}`
      const placesRes = await fetch(placesUrl)
      if (placesRes.ok) {
        setStopPhotos(p => ({ ...p, [idx]: placesUrl }))
        setPhotoModal(idx)
        return
      }

      // ── 2. Fall back to Street View (outdoor shot of the location) ──────
      if (!key) { setStopPhotos(p => ({ ...p, [idx]: 'notfound' })); return }
      const meta = await fetch(
        `https://maps.googleapis.com/maps/api/streetview/metadata?location=${stop.lat},${stop.lng}&source=outdoor&key=${key}`
      )
      const { status } = await meta.json()
      if (status !== 'OK') { setStopPhotos(p => ({ ...p, [idx]: 'notfound' })); return }
      const svUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x500&location=${stop.lat},${stop.lng}&fov=90&pitch=10&source=outdoor&key=${key}`
      setStopPhotos(p => ({ ...p, [idx]: svUrl }))
      setPhotoModal(idx)
    } catch {
      setStopPhotos(p => ({ ...p, [idx]: 'notfound' }))
    }
  }

  const handleFetchInfo = async (idx: number, stop: RouteStop) => {
    if (stopInfos[idx]) return
    setStopInfos(p => ({ ...p, [idx]: 'loading' }))
    try {
      const res = await fetch('/api/stop-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: stop.name,
          city: route?.city ?? '',
          address: stop.address,
          tagline: stop.tagline,
          description: stop.description,
        }),
      })
      const data = await res.json()
      setStopInfos(p => ({ ...p, [idx]: data.info ?? '— no extra info found' }))
    } catch {
      setStopInfos(p => ({ ...p, [idx]: '— couldn\'t load info right now' }))
    }
  }

  const resultRef = useRef<HTMLDivElement>(null)

  /* Loading message rotation */
  useEffect(() => {
    if (view !== 'loading') return
    const t = setInterval(() => setLoadingIdx(i => (i + 1) % LOADING_MSGS.length), 2500)
    return () => clearInterval(t)
  }, [view])

  /* Stagger stop cards on result load */
  useEffect(() => {
    if (view !== 'result' || !route) return
    setVisibleStops(new Array(route.stops.length).fill(false))
    route.stops.forEach((_, i) => {
      setTimeout(() => setVisibleStops(prev => {
        const next = [...prev]; next[i] = true; return next
      }), 200 + i * 150)
    })
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }, [view, route, mapKey])

  /* Escape to close modals */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPhotoModal(null)
        setShowModal(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* Vibe toggle (max 3) */
  const toggleVibe = (v: string) =>
    setVibes(prev => prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 3 ? [...prev, v] : prev)

  /* Validation */
  const validate = () => {
    if (!city) return 'pick a city first.'
    if (!vibes.length) return 'pick at least one vibe.'
    if (minutes < 10) return 'minimum 10 minutes — we need a bit of time to work with.'
    if (minutes > 240) return 'maximum 4 hours for now.'
    if (!startPt.trim()) return 'where are you starting from?'
    return ''
  }

  /* Generate */
  const generate = async (isDriftAgain = false) => {
    const err = validate()
    if (err) { setFormError(err); return }
    if (!checkRateLimit()) { setFormError('too many generations in the last minute. wait 60 seconds.'); return }

    setFormError('')
    setView('loading')
    setLoadingIdx(0)

    try {
      const res = await fetch('/api/generate-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city, vibes, minutes,
          start: startPt.trim(),
          end: endPt.trim(),
          notes: notes.trim(),
          previousStops: isDriftAgain ? prevStops : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'generation failed.')
      setRoute(data)
      setPrevStops(data.stops.map((s: RouteStop) => s.name))
      setStopPhotos({})
      setStopInfos({})
      setPhotoModal(null)
      setMapKey(k => k + 1)
      setView('result')
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "the drift isn't working right now. try again?")
      setView('form')
    }
  }

  /* Google Maps URL */
  const googleMapsUrl = route
    ? (() => {
        const pts = route.stops.filter(s => s.lat && s.lng)
        if (pts.length < 2) return null
        return `https://www.google.com/maps/dir/${pts.map(s => `${s.lat},${s.lng}`).join('/')}/`
      })()
    : null

  /* Save email */
  const saveEmail = async () => {
    if (!modalEmail || modalStatus === 'saving') return
    setModalStatus('saving')
    setModalError('')
    try {
      const res = await fetch('/api/send-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: modalEmail, route }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'error saving.')
      setModalStatus('done')
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'something went wrong.')
      setModalStatus('idle')
    }
  }

  /* ── Loading view ─────────────────────────────────────────────────── */
  if (view === 'loading') return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-6">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="34" stroke="#1a1a1a" strokeWidth="4"/>
            <path d="M40 6 A34 34 0 0 1 74 40" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-amber-400 font-display font-black text-xl italic">d</span>
          </div>
        </div>
        <p className="text-warm-gray-400 text-base tracking-wide text-center max-w-xs transition-all duration-500">
          {LOADING_MSGS[loadingIdx]}
        </p>
        {minutes >= 150 && (
          <p className="text-warm-gray-600 text-xs text-center max-w-[220px] leading-relaxed">
            long route — this can take up to a couple minutes. worth the wait.
          </p>
        )}
      </div>
    </main>
  )

  /* ── Result view ──────────────────────────────────────────────────── */
  if (view === 'result' && route) {
    const mapStops = route.stops
      .filter(s => s.lat && s.lng)
      .map(s => ({ number: s.number, name: s.name, lat: s.lat!, lng: s.lng! }))

    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <Navbar />

        {/* Photo lightbox modal */}
        {photoModal !== null && stopPhotos[photoModal] && stopPhotos[photoModal] !== 'loading' && stopPhotos[photoModal] !== 'notfound' && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-16"
            style={{ background: 'rgba(3,2,1,0.95)', backdropFilter: 'blur(12px) saturate(0.6)' }}
            onClick={() => setPhotoModal(null)}
          >
            <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>

              {/* Ambient glow */}
              <div className="absolute -inset-6 rounded-3xl pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, transparent 70%)',
              }} />

              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden" style={{
                boxShadow: '0 0 0 1px rgba(251,191,36,0.12), 0 32px 80px rgba(0,0,0,0.8)',
              }}>
                <img
                  src={stopPhotos[photoModal] as string}
                  alt={route.stops[photoModal]?.name ?? ''}
                  className="w-full object-cover"
                  style={{ maxHeight: '72vh', display: 'block' }}
                />
                {/* Name overlay at bottom of photo */}
                <div className="absolute bottom-0 inset-x-0 px-5 py-4" style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                }}>
                  <p className="text-warm-white text-sm font-semibold tracking-wide">
                    {route.stops[photoModal]?.name}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {route.stops[photoModal]?.neighborhood}
                  </p>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={() => setPhotoModal(null)}
                className="absolute -top-10 right-0 text-white/30 hover:text-white/70 transition-colors text-xs tracking-widest uppercase"
              >
                esc to close
              </button>
            </div>
          </div>
        )}

        <div ref={resultRef}>
          {/* Header */}
          <section className="pt-28 pb-10 px-6 md:px-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-3">
                  your drift
                </span>
                <h1 className="font-display font-black text-warm-white leading-tight"
                    style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                  through{' '}
                  <span className="italic gradient-text">{route.city.toLowerCase()}</span>
                </h1>
                <div className="flex flex-wrap gap-2 mt-4 items-center">
                  {route.vibes.map(v => (
                    <span key={v} className="px-2.5 py-1 rounded-full text-[11px] border border-amber-400/20 bg-amber-400/5 text-amber-400/80 font-medium">
                      {v}
                    </span>
                  ))}
                  <span className="text-warm-gray-500 text-sm">·</span>
                  <span className="text-warm-gray-400 text-sm">{route.total_minutes} min</span>
                  <span className="text-warm-gray-500 text-sm">·</span>
                  <span className="text-warm-gray-400 text-sm">{route.stops.length} stops</span>
                </div>
                {fmtTotalWalking(route.total_walking_minutes, route.total_walking_meters) && (
                  <p className="text-warm-gray-500 text-xs mt-2 tracking-wide">
                    {fmtTotalWalking(route.total_walking_minutes, route.total_walking_meters)}
                  </p>
                )}
              </div>
              <button
                onClick={() => { setView('form'); setRoute(null) }}
                className="btn-outline text-sm px-7 py-3 self-start md:self-auto"
              >
                ← try another
              </button>
            </div>
          </section>

          {/* Time warning */}
          {route.time_warning && (
            <div className="max-w-7xl mx-auto px-6 md:px-10 mb-6">
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-5 py-4 text-amber-400/90 text-sm leading-relaxed">
                <span className="font-semibold">heads up: </span>{route.time_warning}
              </div>
            </div>
          )}

          {/* Intro */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 mb-10">
            <div className="rounded-2xl border border-white/[0.06] bg-[#111] p-6 md:p-8">
              <p className="text-warm-gray-300 text-base md:text-lg leading-relaxed" style={{ fontWeight: 300 }}>
                {route.intro}
              </p>
            </div>
          </section>

          {/* Real map */}
          {mapStops.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 md:px-10 mb-10">
              <RouteMap stops={mapStops} routeKey={mapKey} />
            </section>
          )}

          {/* Stop cards + walk connectors */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 mb-14">
            <div className="flex flex-col gap-0">
              {route.stops.map((stop, i) => {
                const isLast = i === route.stops.length - 1
                const stopStyle: CSSProperties = {
                  opacity: visibleStops[i] ? 1 : 0,
                  transform: visibleStops[i] ? 'none' : 'translateY(16px)',
                  transition: 'opacity 0.45s ease-out, transform 0.45s ease-out',
                }
                const walkStyle: CSSProperties = {
                  opacity: visibleStops[i] ? 1 : 0,
                  transition: 'opacity 0.45s ease-out 0.1s',
                }
                return (
                  <div key={i}>
                    {/* ── Stop card ── */}
                    <div style={stopStyle}
                         className="group rounded-2xl border border-white/[0.06] bg-[#111] p-6 md:p-8 card-hover">
                      <div className="flex gap-5 items-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-[#0a0a0a] font-bold text-sm">
                          {stop.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* Name + neighborhood */}
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-warm-white text-lg md:text-xl">
                              {stop.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] border border-white/10 bg-white/[0.04] text-warm-gray-400 font-medium uppercase tracking-wide">
                              {stop.neighborhood}
                            </span>
                          </div>
                          {/* Tagline */}
                          {stop.tagline && (
                            <p className="text-amber-400/70 text-sm font-medium mb-2.5 leading-snug">
                              {stop.tagline}
                            </p>
                          )}
                          {/* Address */}
                          {stop.address && (
                            <p className="text-warm-gray-600 text-xs mb-3 flex items-center gap-1">
                              <svg width="9" height="11" viewBox="0 0 10 12" fill="none" className="shrink-0 opacity-50">
                                <path d="M5 0C2.8 0 1 1.8 1 4c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4zm0 5.5A1.5 1.5 0 1 1 5 2.5a1.5 1.5 0 0 1 0 3z" fill="currentColor"/>
                              </svg>
                              {stop.address}
                            </p>
                          )}
                          {/* Description */}
                          <p className="text-warm-gray-300 text-sm leading-relaxed mb-3" style={{ fontWeight: 300 }}>
                            {stop.description}
                          </p>
                          {/* Why */}
                          <p className="text-warm-gray-400 text-sm italic mt-1">
                            {stop.why_this_spot}
                          </p>

                          {/* Photo + Info buttons */}
                          {stop.time_at_stop_minutes > 0 && (
                            <div className="flex gap-2 mt-4">
                              {stopPhotos[i] !== 'notfound' && (
                              <button
                                onClick={() => handleFetchPhoto(i, '', '')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-warm-gray-400 hover:text-warm-gray-200 hover:border-white/20 transition-all text-xs"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/>
                                </svg>
                                {stopPhotos[i] === 'loading' ? 'looking for a photo...' : stopPhotos[i] ? 'see photo' : 'see photo'}
                              </button>
                              )}
                              <button
                                onClick={() => handleFetchInfo(i, stop)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-warm-gray-400 hover:text-warm-gray-200 hover:border-white/20 transition-all text-xs"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/>
                                </svg>
                                {stopInfos[i] === 'loading' ? 'finding out more...' : 'more info'}
                              </button>
                            </div>
                          )}

                          {/* More info panel */}
                          {stopInfos[i] && stopInfos[i] !== 'loading' && (
                            <div className="mt-4 pt-4 border-t border-white/[0.06]">
                              {(stopInfos[i] as string).split('\n').filter(l => l.trim()).map((line, li) => (
                                <p key={li} className="text-warm-gray-400 text-xs leading-relaxed mb-1.5">
                                  {line}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* End of drift badge */}
                          {isLast && (
                            <div className="flex items-center gap-2 text-amber-400/50 text-xs mt-4">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.2"/>
                                <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span>end of drift</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Walk connector (between stops) ── */}
                    {!isLast && stop.walk_to_next_minutes !== null && (
                      <div
                        style={walkStyle}
                        className="group relative my-2 mx-1 rounded-xl bg-white/[0.025] border border-white/[0.04] px-5 py-2.5 cursor-default"
                        onMouseEnter={() => stop.walk_note && setPinnedWalk(i)}
                        onMouseLeave={() => setPinnedWalk(null)}
                        onClick={() => stop.walk_note && setPinnedWalk(pinnedWalk === i ? null : i)}
                      >
                        <div className="flex items-center gap-3">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-warm-gray-500 shrink-0">
                            <circle cx="12" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M9.5 8l-2 4.5 3.5 1L10 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.5 8l2 4-3 1.5 1 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-white/75 text-base font-medium">
                            {fmtWalkingLeg(stop.walk_to_next_minutes, stop.walk_to_next_meters)}
                          </span>
                          {stop.walk_note && (
                            <span className="ml-auto text-[10px] text-warm-gray-600 group-hover:text-warm-gray-500 transition-colors tracking-wide select-none">
                              {pinnedWalk === i ? 'hide ↑' : 'about this walk'}
                            </span>
                          )}
                        </div>
                        {stop.walk_note && (
                          <div
                            className="overflow-hidden transition-all duration-300 ease-out"
                            style={{ maxHeight: pinnedWalk === i ? '120px' : '0px', opacity: pinnedWalk === i ? 1 : 0 }}
                          >
                            <p className="text-warm-gray-400 text-sm italic leading-relaxed pt-2 pl-[23px]">
                              {stop.walk_note}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* End of route summary */}
            <div className="mt-6 px-6 py-5 rounded-2xl border border-white/[0.04] bg-[#0e0e0e] text-center">
              <p className="font-display font-bold text-warm-white text-lg mb-1">
                that&apos;s your drift.
              </p>
              <p className="text-warm-gray-500 text-sm">
                {[
                  route.total_walking_meters ? fmtDist(route.total_walking_meters) + ' total walking' : null,
                  route.total_walking_minutes ? (() => { const h = Math.floor(route.total_walking_minutes! / 60), m = route.total_walking_minutes! % 60; return h > 0 ? `${h}h ${m}min on foot` : `${m}min on foot` })() : null,
                  `${route.stops.length} stops`,
                ].filter(Boolean).join(' · ')}
              </p>
            </div>
          </section>

          {/* Actions */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-wrap">
              <button
                onClick={() => generate(true)}
                className="btn-outline-amber px-8 py-4"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-80">
                  <path d="M14 2v5h-5M2 14V9h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.6 6A6 6 0 0 1 13 5.1M13.4 10A6 6 0 0 1 3 10.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                not feeling it? drift again
              </button>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline px-8 py-4 inline-flex items-center gap-2"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="opacity-70">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
                  </svg>
                  open in google maps
                </a>
              )}
              <button
                onClick={() => { setShowModal(true); setModalStatus('idle'); setModalError('') }}
                className="btn-primary px-8 py-4"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M3 5l4 4 4-4M1 10v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                save this drift
              </button>
            </div>
          </section>
        </div>

        <Footer />

        {/* ── Email modal ── */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          >
            <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111] p-8 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-warm-gray-500 hover:text-warm-gray-300 transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {modalStatus === 'done' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mx-auto mb-5">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M6 14l5.5 5.5L22 8" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="font-display text-xl font-bold text-warm-white mb-2">saved.</p>
                  <p className="text-warm-gray-400 text-sm">check your email for your drift.</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-2xl font-bold text-warm-white mb-2">save your drift</h3>
                  <p className="text-warm-gray-400 text-sm leading-relaxed mb-6">
                    we'll send your full route — all stops, walk times, and a google maps link — straight to your inbox. free.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={modalEmail}
                      onChange={e => setModalEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEmail()}
                      className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-5 py-3 text-warm-white placeholder-warm-gray-500 focus:border-amber-400/35 transition-all text-sm"
                    />
                    <button
                      onClick={saveEmail}
                      disabled={!modalEmail || modalStatus === 'saving'}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {modalStatus === 'saving' ? (
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10"/>
                        </svg>
                      ) : 'save it'}
                    </button>
                  </div>
                  {modalError && <p className="mt-3 text-sm text-red-400">{modalError}</p>}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    )
  }

  /* ── Form view ────────────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 px-6 md:px-10 overflow-hidden">
        <div className="blob absolute opacity-[0.08] pointer-events-none"
             style={{ width: 600, height: 600, top: '-15%', right: '-10%',
                      background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
                      filter: 'blur(110px)' }}/>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-4">
            live demo
          </span>
          <div className="divider mx-auto mb-6"/>
          <h1 className="font-display font-black text-warm-white leading-[0.9] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)' }}>
            drift a city.{' '}
            <span className="italic gradient-text">right now.</span>
          </h1>
          <p className="text-warm-gray-400 text-lg" style={{ fontWeight: 300 }}>
            tell us your vibe. we'll handle the rest.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 pb-28">

        {/* 1. City */}
        <div className="mb-10">
          <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium block mb-4">
            01 — pick a city
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Warsaw', 'Berlin', 'Prague'].map(c => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 border ${
                  city === c
                    ? 'border-amber-400/60 bg-amber-400/5 shadow-[0_0_30px_rgba(251,191,36,0.1)]'
                    : 'border-white/[0.06] bg-[#111] hover:border-white/10 hover:bg-[#141414]'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${CITY_BG[c]}`}/>
                <CityPattern city={c}/>
                <div className="relative z-10">
                  <p className="font-display font-black text-warm-white text-xl mb-1">{c.toLowerCase()}</p>
                  <p className="text-warm-gray-400 text-xs tracking-wide">{CITY_COUNTRY[c]}</p>
                </div>
                {city === c && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center z-10">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#070707" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Vibe */}
        <div className="mb-10">
          <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium block mb-1">
            02 — pick your vibe
          </label>
          <p className="text-warm-gray-500 text-xs mb-4">select up to 3</p>
          <div className="flex flex-wrap gap-2">
            {VIBES.map(v => (
              <button
                key={v}
                onClick={() => toggleVibe(v)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                  vibes.includes(v)
                    ? 'bg-amber-400 text-[#0a0a0a]'
                    : 'bg-white/[0.04] text-warm-gray-300 border border-white/[0.08] hover:bg-white/[0.07] hover:border-amber-400/20'
                } ${!vibes.includes(v) && vibes.length >= 3 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Time */}
        <div className="mb-10">
          <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium block mb-5">
            03 — how many minutes do you have?
          </label>
          <div className="flex items-center gap-5 mb-3">
            <span className="font-display font-black text-warm-white text-3xl w-16 text-center tabular-nums">{minutes}</span>
            <span className="text-warm-gray-500 text-sm">min</span>
          </div>
          <input
            type="range"
            min={10}
            max={240}
            step={5}
            value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            className="drift-slider"
            style={{
              background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((minutes - 10) / 230) * 100}%, #1e1e1e ${((minutes - 10) / 230) * 100}%, #1e1e1e 100%)`
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-warm-gray-600 text-xs">10 min</span>
            <span className="text-warm-gray-600 text-xs">4 hrs</span>
          </div>
          {minutes >= 150 && (
            <p className="mt-3 text-xs text-amber-400/70 leading-relaxed">
              heads up — long drifts take a bit more time to generate (up to a couple minutes). we're building something good.
            </p>
          )}
        </div>

        {/* 4. Starting point */}
        <div className="mb-8">
          <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium block mb-4">
            04 — where are you starting from?
          </label>
          <input
            type="text"
            placeholder="a neighborhood, landmark, or address"
            value={startPt}
            onChange={e => setStartPt(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-warm-white placeholder-warm-gray-500 focus:border-amber-400/35 transition-all text-sm"
          />
        </div>

        {/* 5. End point (optional, collapsible) */}
        <div className="mb-5">
          {!showEnd ? (
            <button
              onClick={() => setShowEnd(true)}
              className="flex items-center gap-2 text-warm-gray-400 hover:text-warm-gray-200 transition-colors text-sm group"
            >
              <span className="w-5 h-5 rounded-full border border-white/25 flex items-center justify-center group-hover:border-white/45 transition-colors text-xs">+</span>
              add destination
              <span className="text-warm-gray-500 text-xs">(optional)</span>
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium">
                  destination
                </label>
                <button onClick={() => { setShowEnd(false); setEndPt('') }} className="text-warm-gray-600 hover:text-warm-gray-400 text-xs transition-colors">remove</button>
              </div>
              <input
                autoFocus
                type="text"
                placeholder="leave blank to drift wherever"
                value={endPt}
                onChange={e => setEndPt(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-warm-white placeholder-warm-gray-500 focus:border-amber-400/35 transition-all text-sm"
              />
            </div>
          )}
        </div>

        {/* 6. Notes (optional, collapsible) */}
        <div className="mb-10">
          {!showNotes ? (
            <button
              onClick={() => setShowNotes(true)}
              className="flex items-center gap-2 text-warm-gray-400 hover:text-warm-gray-200 transition-colors text-sm group"
            >
              <span className="w-5 h-5 rounded-full border border-white/25 flex items-center justify-center group-hover:border-white/45 transition-colors text-xs">+</span>
              add special requests
              <span className="text-warm-gray-500 text-xs">(optional)</span>
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium">
                  special requests
                </label>
                <button onClick={() => { setShowNotes(false); setNotes('') }} className="text-warm-gray-600 hover:text-warm-gray-400 text-xs transition-colors">remove</button>
              </div>
              <textarea
                autoFocus
                placeholder="e.g. 'must include street art', 'no churches', 'coffee stop along the way'"
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 200))}
                rows={3}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-warm-white placeholder-warm-gray-500 focus:border-amber-400/35 transition-all text-sm resize-none"
              />
              <p className="text-warm-gray-600 text-xs mt-1 text-right">{notes.length}/200</p>
            </div>
          )}
        </div>

        {/* Error */}
        {formError && (
          <div className="mb-6 px-5 py-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
            {formError}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={() => generate(false)}
          className="btn-primary w-full justify-center py-5 text-base"
        >
          generate my drift
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="text-warm-gray-600 text-xs text-center mt-4">
          powered by claude ai · routes from curated local knowledge only
        </p>
      </section>

      <Footer />
    </main>
  )
}
