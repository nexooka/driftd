'use client'

import { useState, useEffect, useRef, CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations, useLocale } from 'next-intl'
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

const VIBE_T_KEY: Record<string, string> = {
  'artsy': 'vibeArtsy',
  'historic': 'vibeHistoric',
  'foodie': 'vibeFoodie',
  'nightlife': 'vibeNightlife',
  'sketchy-but-cool': 'vibeSketchyButCool',
  'chill': 'vibeChill',
  'romantic': 'vibeRomantic',
  'photogenic': 'vibePhotogenic',
  'quirky': 'vibeQuirky',
}

const CITY_T_KEY: Record<string, string> = {
  'Warsaw': 'cityWarsaw',
  'Berlin': 'cityBerlin',
  'Prague': 'cityPrague',
  'New York': 'cityNewYork',
}

const COUNTRY_T_KEY: Record<string, string> = {
  'Warsaw': 'countryPoland',
  'Berlin': 'countryGermany',
  'Prague': 'countryCzechRepublic',
  'New York': 'countryUnitedStates',
}

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
  if (city === 'New York') return (
    <svg viewBox="0 0 120 80" fill="none" className="absolute inset-0 w-full h-full opacity-[0.12]" aria-hidden>
      <rect x="4"  y="50" width="6"  height="30" fill="white"/>
      <rect x="12" y="40" width="5"  height="40" fill="white"/>
      <rect x="19" y="55" width="7"  height="25" fill="white"/>
      <rect x="28" y="35" width="6"  height="45" fill="white"/>
      <polygon points="31,35 34,26 37,35" fill="white"/>
      <rect x="36" y="45" width="5"  height="35" fill="white"/>
      <rect x="43" y="30" width="7"  height="50" fill="white"/>
      <polygon points="45,30 46.5,22 48,30" fill="white"/>
      <rect x="52" y="20" width="8"  height="60" fill="white"/>
      <polygon points="54,20 56,10 58,20" fill="white"/>
      <rect x="62" y="38" width="5"  height="42" fill="white"/>
      <rect x="69" y="44" width="6"  height="36" fill="white"/>
      <rect x="77" y="32" width="8"  height="48" fill="white"/>
      <rect x="87" y="48" width="5"  height="32" fill="white"/>
      <rect x="94" y="42" width="6"  height="38" fill="white"/>
      <rect x="102" y="52" width="5" height="28" fill="white"/>
      <rect x="109" y="46" width="7" height="34" fill="white"/>
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
  'New York': 'from-blue-950/50 to-slate-900/40',
}
const CITY_COUNTRY: Record<string, string> = {
  Warsaw: 'poland',
  Berlin: 'germany',
  Prague: 'czech republic',
  'New York': 'united states',
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

/* ── Formatting helpers (locale-independent) ─────────────────────────── */
function fmtDist(meters: number): string {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`
}

/* ── Lowercase prose (not names/addresses) ───────────────────────────── */
const lc = (s?: string | null): string => s ? s.toLowerCase() : ''

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
  const t = useTranslations('demo')
  const locale = useLocale()

  // Form — restored from session so driftAgain works after page refresh
  const [city, setCity] = useState(() => {
    if (typeof window === 'undefined') return ''
    try { return sessionStorage.getItem('driftd_city') ?? '' } catch { return '' }
  })
  const [vibes, setVibes] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { const s = sessionStorage.getItem('driftd_vibes'); return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [minutes, setMinutes] = useState(() => {
    if (typeof window === 'undefined') return 60
    try { return Number(sessionStorage.getItem('driftd_minutes')) || 60 } catch { return 60 }
  })
  const [startPt, setStartPt] = useState(() => {
    if (typeof window === 'undefined') return ''
    try { return sessionStorage.getItem('driftd_start') ?? '' } catch { return '' }
  })
  const [endPt, setEndPt] = useState('')
  const [notes, setNotes] = useState('')

  // UI — restore 'result' view if a route was saved in session
  const [view, setView] = useState<'form' | 'loading' | 'result'>(() => {
    if (typeof window === 'undefined') return 'form'
    try { return sessionStorage.getItem('driftd_route') ? 'result' : 'form' } catch { return 'form' }
  })
  const [loadingIdx, setLoadingIdx] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [formError, setFormError] = useState('')

  // Result — initialise from sessionStorage so locale switches don't lose state
  const [route, setRoute] = useState<RouteResult | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const saved = sessionStorage.getItem('driftd_route')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [prevStops, setPrevStops] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = sessionStorage.getItem('driftd_prev_stops')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
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

  // Share
  const [shareCopied, setShareCopied] = useState(false)

  /* Locale-aware walk formatters */
  const fmtWalkingLeg = (minutes: number, meters?: number | null): string => {
    if (meters) return t('walkMinDist', { n: minutes, dist: fmtDist(meters) })
    return t('walkMin', { n: minutes })
  }

  const fmtTotalWalking = (mins?: number, meters?: number): string | null => {
    if (!mins && !meters) return null
    const parts: string[] = []
    if (meters) parts.push(t('totalWalk', { dist: fmtDist(meters) }))
    if (mins) {
      const h = Math.floor(mins / 60), m = mins % 60
      parts.push(h > 0 ? t('totalWalkTimeH', { h, m }) : t('totalWalkTime', { n: mins }))
    }
    return parts.join(' · ')
  }

  const LOADING_MSGS = Array.from({ length: 7 }, (_, i) => t(`loadingMsg${i}` as Parameters<typeof t>[0]))

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
  const loadingDoneRef = useRef(false)
  const loadingProgressRef = useRef(0)

  /* Share route */
  const shareRoute = async () => {
    if (!route) return
    const lines = [
      `my drift through ${route.city} — ${route.total_minutes}min`,
      '',
      ...route.stops.map(s => {
        const parts = [`${s.number}. ${s.name}`]
        if (s.tagline) parts.push(`   ${s.tagline}`)
        if (s.walk_to_next_minutes) parts.push(`   ↓ ${s.walk_to_next_minutes} min walk`)
        return parts.join('\n')
      }),
      '',
      'generated by driftd.world',
    ]
    const text = lines.join('\n')
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: `drift through ${route.city}`, text })
      } else {
        await navigator.clipboard.writeText(text)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2500)
      }
    } catch { /* user cancelled share */ }
  }

  /* Loading message rotation */
  useEffect(() => {
    if (view !== 'loading') return
    const interval = setInterval(() => setLoadingIdx(i => (i + 1) % LOADING_MSGS.length), 2500)
    return () => clearInterval(interval)
  }, [view])

  /* Simulated progress — easeOut to 80% over 60s, completes to 100 when API responds */
  useEffect(() => {
    if (view !== 'loading') return
    loadingDoneRef.current = false
    const start = Date.now()
    const DURATION = 60000
    const TARGET = 80
    const interval = setInterval(() => {
      if (loadingDoneRef.current) return
      const t = Math.min((Date.now() - start) / DURATION, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const val = Math.round(eased * TARGET)
      loadingProgressRef.current = val
      setLoadingProgress(val)
    }, 150)
    return () => clearInterval(interval)
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
    if (!city) return t('errPickCity')
    if (!vibes.length) return t('errPickVibe')
    if (minutes < 10) return t('errMinTime')
    if (minutes > 240) return t('errMaxTime')
    if (!startPt.trim()) return t('errNeedStart')
    return ''
  }

  /* Generate */
  const generate = async (isDriftAgain = false) => {
    const err = validate()
    if (err) { setFormError(err); return }
    if (!checkRateLimit()) { setFormError(t('errRateLimit')); return }

    setFormError('')
    loadingDoneRef.current = false
    setLoadingProgress(0)
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
          lang: locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'generation failed.')
      const newPrevStops = data.stops.map((s: RouteStop) => s.name)
      setRoute(data)
      setPrevStops(newPrevStops)
      try {
        sessionStorage.setItem('driftd_route', JSON.stringify(data))
        sessionStorage.setItem('driftd_prev_stops', JSON.stringify(newPrevStops))
        sessionStorage.setItem('driftd_city', city)
        sessionStorage.setItem('driftd_vibes', JSON.stringify(vibes))
        sessionStorage.setItem('driftd_minutes', String(minutes))
        sessionStorage.setItem('driftd_start', startPt.trim())
      } catch { /* storage unavailable */ }
      setStopPhotos({})
      setStopInfos({})
      setPhotoModal(null)
      setMapKey(k => k + 1)
      loadingDoneRef.current = true
      const from = loadingProgressRef.current
      const FILL_MS = 600
      await new Promise<void>(resolve => {
        const t0 = Date.now()
        function tick() {
          const t = Math.min((Date.now() - t0) / FILL_MS, 1)
          const eased = 1 - Math.pow(1 - t, 2)
          const val = Math.round(from + (100 - from) * eased)
          loadingProgressRef.current = val
          setLoadingProgress(val)
          if (t < 1) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      })
      await new Promise(r => setTimeout(r, 150))
      setView('result')
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      const isNetworkError = msg === 'Load failed' || msg === 'Failed to fetch' || msg === 'NetworkError when attempting to fetch resource.'
      setFormError(isNetworkError ? t('errTimeout') : (msg || t('errGeneric')))
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
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">

        {/* "d" logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute rounded-full pointer-events-none" style={{
            width: 110, height: 110,
            background: 'radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)',
            animation: 'drift-logo-glow 3s ease-in-out infinite',
          }}/>
          <span className="relative font-display font-black italic text-amber-400"
            style={{ fontSize: '4.5rem', lineHeight: 1 }}>
            d
          </span>
        </div>

        {/* City scene */}
        <div className="relative w-full max-w-xs select-none">
          <div className="absolute bottom-0 inset-x-0 h-14 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.08) 0%, transparent 70%)',
          }}/>

          <svg viewBox="0 0 300 165" className="w-full" style={{ overflow: 'visible' }}>
            <defs>
              <filter id="wglow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="2" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* ── Buildings ── */}
            <rect x="0"   y="100" width="32"  height="65"  fill="#111"/>
            <rect x="36"  y="62"  width="20"  height="103" fill="#0e0e0e"/>
            <rect x="60"  y="80"  width="36"  height="85"  fill="#121212"/>
            <rect x="100" y="42"  width="24"  height="123" fill="#0f0f0f"/>
            <rect x="128" y="84"  width="42"  height="81"  fill="#111"/>
            <rect x="174" y="60"  width="22"  height="105" fill="#0e0e0e"/>
            <rect x="200" y="77"  width="30"  height="88"  fill="#121212"/>
            <rect x="234" y="44"  width="26"  height="121" fill="#0f0f0f"/>
            <rect x="264" y="92"  width="22"  height="73"  fill="#111"/>
            <rect x="290" y="72"  width="10"  height="93"  fill="#0e0e0e"/>
            <rect x="0" y="160" width="300" height="5" fill="#0d0d0d"/>

            {/* ── Windows ── */}
            <rect x="39"  y="70" width="6" height="4" fill="#fbbf24" className="drift-win-a" style={{animationDelay:'0s'}}/>
            <rect x="47"  y="70" width="6" height="4" fill="#fbbf24" className="drift-win-b" style={{animationDelay:'1.3s'}}/>
            <rect x="39"  y="82" width="6" height="4" fill="#fbbf24" className="drift-win-c" style={{animationDelay:'0.7s'}}/>
            <rect x="47"  y="82" width="6" height="4" fill="#fbbf24" className="drift-win-a" style={{animationDelay:'2.8s'}}/>
            <rect x="39"  y="94" width="6" height="4" fill="#fbbf24" className="drift-win-b" style={{animationDelay:'1.9s'}}/>
            <rect x="103" y="50" width="7" height="5" fill="#fbbf24" className="drift-win-c" style={{animationDelay:'0.4s'}}/>
            <rect x="114" y="50" width="7" height="5" fill="#fbbf24" className="drift-win-a" style={{animationDelay:'3.1s'}}/>
            <rect x="103" y="63" width="7" height="5" fill="#fbbf24" className="drift-win-b" style={{animationDelay:'1.1s'}}/>
            <rect x="114" y="63" width="7" height="5" fill="#fbbf24" className="drift-win-c" style={{animationDelay:'2.4s'}}/>
            <rect x="103" y="76" width="7" height="5" fill="#fbbf24" className="drift-win-a" style={{animationDelay:'0.6s'}}/>
            <rect x="114" y="76" width="7" height="5" fill="#fbbf24" className="drift-win-b" style={{animationDelay:'3.6s'}}/>
            <rect x="177" y="68" width="7" height="4" fill="#fbbf24" className="drift-win-c" style={{animationDelay:'1.7s'}}/>
            <rect x="187" y="68" width="7" height="4" fill="#fbbf24" className="drift-win-a" style={{animationDelay:'0.3s'}}/>
            <rect x="177" y="80" width="7" height="4" fill="#fbbf24" className="drift-win-b" style={{animationDelay:'2.6s'}}/>
            <rect x="177" y="92" width="7" height="4" fill="#fbbf24" className="drift-win-c" style={{animationDelay:'1.4s'}}/>
            <rect x="237" y="52" width="8" height="5" fill="#fbbf24" className="drift-win-a" style={{animationDelay:'2.2s'}}/>
            <rect x="249" y="52" width="8" height="5" fill="#fbbf24" className="drift-win-b" style={{animationDelay:'0.9s'}}/>
            <rect x="237" y="65" width="8" height="5" fill="#fbbf24" className="drift-win-c" style={{animationDelay:'3.8s'}}/>
            <rect x="249" y="65" width="8" height="5" fill="#fbbf24" className="drift-win-a" style={{animationDelay:'1.5s'}}/>
            <rect x="237" y="78" width="8" height="5" fill="#fbbf24" className="drift-win-b" style={{animationDelay:'2.9s'}}/>

            {/* ── Stop dots — small glowing dots, no numbers ── */}
            {([46, 122, 184, 248] as const).map((cx, idx) => {
              const delay = 0.5 + idx * 0.85
              return (
                <g key={cx} style={{
                  animation: `drift-stop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
                  transformBox: 'fill-box' as const,
                  transformOrigin: 'center',
                }}>
                  {/* Expanding ring */}
                  <circle cx={cx} cy="152" r="5" fill="none" stroke="#fbbf24" strokeWidth="1">
                    <animate attributeName="r" values="5;13;5" dur="2.8s" begin={`${delay + 0.4}s`} repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.8s" begin={`${delay + 0.4}s`} repeatCount="indefinite"/>
                  </circle>
                  {/* Core dot */}
                  <circle cx={cx} cy="152" r="4" fill="#fbbf24" filter="url(#wglow)"/>
                </g>
              )
            })}

            {/* ── Connecting dashed lines ── */}
            {([[50,118],[126,180],[188,244]] as const).map(([x1,x2], idx) => (
              <line key={x1} x1={x1} y1="152" x2={x2} y2="152"
                stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 6" strokeDashoffset="80"
                style={{animation:`drift-line-in 0.4s ease-out ${1.4 + idx * 0.85}s both`}}/>
            ))}

            {/* ── Walker — stays between first and last dot, fades at edges ── */}
            <circle cx="0" cy="0" r="2.5" fill="#fff" opacity="0">
              <animate attributeName="opacity"
                values="0;0.75;0.75;0" keyTimes="0;0.06;0.94;1"
                dur="5.5s" repeatCount="indefinite"/>
              <animateMotion dur="5.5s" repeatCount="indefinite" calcMode="linear"
                path="M 46,152 L 248,152"/>
            </circle>
          </svg>
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <p className="text-warm-gray-300 text-sm tracking-wide transition-all duration-500">
            {LOADING_MSGS[loadingIdx]}
          </p>
          {minutes >= 150 && (
            <p className="text-warm-gray-600 text-xs max-w-[200px] mx-auto leading-relaxed">
              {t('loadingLong')}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="flex flex-col items-center gap-3 w-full max-w-[240px]">
          <div className="relative w-full" style={{ height: '2px' }}>
            <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(251,191,36,0.07)' }} />
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${loadingProgress}%`,
                background: 'linear-gradient(to right, rgba(251,191,36,0.6), #fbbf24)',
                boxShadow: '0 0 10px rgba(251,191,36,0.4)',
                transition: 'width 0.2s ease-out',
              }}
            >
              {loadingProgress > 1 && loadingProgress < 100 && (
                <div style={{
                  position: 'absolute',
                  right: -3,
                  top: -2,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#fbbf24',
                  boxShadow: '0 0 8px rgba(251,191,36,0.9), 0 0 3px #fbbf24',
                }} />
              )}
            </div>
          </div>
          <p
            className="tabular-nums font-medium tracking-widest"
            style={{ fontSize: '10px', color: 'rgba(251,191,36,0.4)', letterSpacing: '0.15em' }}
          >
            {loadingProgress}%
          </p>
        </div>

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
                {t('escClose')}
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
                  {t('yourDrift')}
                </span>
                <h1 className="font-display font-black text-warm-white leading-tight"
                    style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                  {t('through')}{' '}
                  <span className="italic gradient-text">{CITY_T_KEY[route.city] ? t(CITY_T_KEY[route.city] as Parameters<typeof t>[0]) : route.city.toLowerCase()}</span>
                </h1>
                <div className="flex flex-wrap gap-2 mt-4 items-center">
                  {route.vibes.map(v => (
                    <span key={v} className="px-2.5 py-1 rounded-full text-[11px] border border-amber-400/20 bg-amber-400/5 text-amber-400/80 font-medium">
                      {VIBE_T_KEY[v] ? t(VIBE_T_KEY[v] as Parameters<typeof t>[0]) : v}
                    </span>
                  ))}
                  <span className="text-warm-gray-500 text-sm">·</span>
                  <span className="text-warm-gray-400 text-sm">{route.total_minutes} min</span>
                  <span className="text-warm-gray-500 text-sm">·</span>
                  <span className="text-warm-gray-400 text-sm">{route.stops.length} {t('stops')}</span>
                </div>
                {fmtTotalWalking(route.total_walking_minutes, route.total_walking_meters) && (
                  <p className="text-warm-gray-500 text-xs mt-2 tracking-wide">
                    {fmtTotalWalking(route.total_walking_minutes, route.total_walking_meters)}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Time warning */}
          {route.time_warning && (
            <div className="max-w-7xl mx-auto px-6 md:px-10 mb-6">
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-5 py-4 text-amber-400/90 text-sm leading-relaxed">
                <span className="font-semibold">{t('headsUp')}</span>{lc(route.time_warning)}
              </div>
            </div>
          )}

          {/* Intro */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 mb-10">
            <div className="rounded-2xl border border-white/[0.06] bg-[#111] p-6 md:p-8">
              <p className="text-warm-gray-300 text-base md:text-lg leading-relaxed" style={{ fontWeight: 300 }}>
                {lc(route.intro)}
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
                              {lc(stop.tagline)}
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
                            {lc(stop.description)}
                          </p>
                          {/* Why */}
                          <p className="text-warm-gray-400 text-sm italic mt-1">
                            {lc(stop.why_this_spot)}
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
                                {stopPhotos[i] === 'loading' ? t('lookingForPhoto') : t('seePhoto')}
                              </button>
                              )}
                              <button
                                onClick={() => handleFetchInfo(i, stop)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-warm-gray-400 hover:text-warm-gray-200 hover:border-white/20 transition-all text-xs"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z"/>
                                </svg>
                                {stopInfos[i] === 'loading' ? t('findingInfo') : t('moreInfo')}
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
                              <span>{t('endOfDrift')}</span>
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
                              {pinnedWalk === i ? t('hideWalk') : t('aboutThisWalk')}
                            </span>
                          )}
                        </div>
                        {stop.walk_note && (
                          <div
                            className="overflow-hidden transition-all duration-300 ease-out"
                            style={{ maxHeight: pinnedWalk === i ? '120px' : '0px', opacity: pinnedWalk === i ? 1 : 0 }}
                          >
                            <p className="text-warm-gray-400 text-sm italic leading-relaxed pt-2 pl-[23px]">
                              {lc(stop.walk_note)}
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
                {t('driftSummary')}
              </p>
              <p className="text-warm-gray-500 text-sm">
                {[
                  route.total_walking_meters ? t('totalWalk', { dist: fmtDist(route.total_walking_meters) }) : null,
                  route.total_walking_minutes ? (() => { const h = Math.floor(route.total_walking_minutes! / 60), m = route.total_walking_minutes! % 60; return h > 0 ? t('totalWalkTimeH', { h, m }) + ' ' + t('onFoot') : t('totalWalkTime', { n: m }) + ' ' + t('onFoot') })() : null,
                  `${route.stops.length} ${t('stops')}`,
                ].filter(Boolean).join(' · ')}
              </p>
            </div>
          </section>

          {/* Actions */}
          <section className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-wrap">
              <button
                onClick={() => {
                  setView('form')
                  setRoute(null)
                  try {
                    sessionStorage.removeItem('driftd_route')
                    sessionStorage.removeItem('driftd_prev_stops')
                  } catch {}
                }}
                className="btn-outline-amber px-8 py-4"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-80">
                  <path d="M14 2v5h-5M2 14V9h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.6 6A6 6 0 0 1 13 5.1M13.4 10A6 6 0 0 1 3 10.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                {t('driftAgain')}
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
                  {t('openMaps')}
                </a>
              )}
              <button
                onClick={shareRoute}
                className="btn-outline px-8 py-4 relative"
              >
                {shareCopied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
                    </svg>
                    {t('share')}
                  </>
                )}
              </button>
              <button
                onClick={() => { setShowModal(true); setModalStatus('idle'); setModalError('') }}
                className="btn-primary px-8 py-4"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v8M3 5l4 4 4-4M1 10v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('saveDrift')}
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
                  <p className="font-display text-xl font-bold text-warm-white mb-2">{t('savedHeading')}</p>
                  <p className="text-warm-gray-400 text-sm">{t('savedBody')}</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-2xl font-bold text-warm-white mb-2">{t('saveHeading')}</h3>
                  <p className="text-warm-gray-400 text-sm leading-relaxed mb-6">
                    {t('saveBody')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder={t('savePlaceholder')}
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
                      ) : t('saveBtn')}
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
            {t('sectionLabel')}
          </span>
          <div className="divider mx-auto mb-6"/>
          <h1 className="font-display font-black text-warm-white leading-[0.9] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)' }}>
            {t('pageTitle')}{' '}
            <span className="italic gradient-text">{t('pageTitleAccent')}</span>
          </h1>
          <p className="text-warm-gray-400 text-lg" style={{ fontWeight: 300 }}>
            {t('pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 pb-28">

        {/* 1. City */}
        <div className="mb-10">
          <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium block mb-4">
            {t('step1')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {['Warsaw', 'Berlin', 'Prague', 'New York'].map(c => (
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
                  <p className="font-display font-black text-warm-white text-xl mb-1">{CITY_T_KEY[c] ? t(CITY_T_KEY[c] as Parameters<typeof t>[0]) : c.toLowerCase()}</p>
                  <p className="text-warm-gray-400 text-xs tracking-wide">{COUNTRY_T_KEY[c] ? t(COUNTRY_T_KEY[c] as Parameters<typeof t>[0]) : CITY_COUNTRY[c]}</p>
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
            {t('step2')}
          </label>
          <p className="text-warm-gray-500 text-xs mb-4">{t('step2Sub')}</p>
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
                {VIBE_T_KEY[v] ? t(VIBE_T_KEY[v] as Parameters<typeof t>[0]) : v}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Time */}
        <div className="mb-10">
          <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium block mb-5">
            {t('step3')}
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
            <span className="text-warm-gray-600 text-xs">{t('step3Min')}</span>
            <span className="text-warm-gray-600 text-xs">{t('step3Max')}</span>
          </div>
          {minutes >= 150 && (
            <p className="mt-3 text-xs text-amber-400/70 leading-relaxed">
              {t('step3LongWarn')}
            </p>
          )}
        </div>

        {/* 4. Starting point */}
        <div className="mb-8">
          <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium block mb-4">
            {t('step4')}
          </label>
          <input
            type="text"
            placeholder={t('step4Placeholder')}
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
              {t('addDestination')}
              <span className="text-warm-gray-500 text-xs">{t('optional')}</span>
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium">
                  {t('destinationLabel')}
                </label>
                <button onClick={() => { setShowEnd(false); setEndPt('') }} className="text-warm-gray-600 hover:text-warm-gray-400 text-xs transition-colors">{t('removeField')}</button>
              </div>
              <input
                autoFocus
                type="text"
                placeholder={t('destinationPlaceholder')}
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
              {t('addRequests')}
              <span className="text-warm-gray-500 text-xs">{t('optional')}</span>
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] tracking-[0.15em] uppercase text-amber-400/60 font-medium">
                  {t('requestsLabel')}
                </label>
                <button onClick={() => { setShowNotes(false); setNotes('') }} className="text-warm-gray-600 hover:text-warm-gray-400 text-xs transition-colors">{t('removeField')}</button>
              </div>
              <textarea
                autoFocus
                placeholder={t('requestsPlaceholder')}
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
          {t('generateBtn')}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="text-warm-gray-600 text-xs text-center mt-4">
          {t('poweredBy')}
        </p>
      </section>

      <Footer />
    </main>
  )
}
