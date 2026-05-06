'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { FadeIn } from './FadeIn'

const AnimDemoMap = dynamic(() => import('@/components/AnimDemoMap'), { ssr: false })

type Phase = 'form' | 'loading' | 'result'
type BtnState = 'idle' | 'pulse' | 'click'

const CITIES = ['Warsaw', 'Berlin', 'Prague', 'New York']
const VIBES = ['artsy', 'chill', 'foodie', 'historic', 'quirky', 'photogenic']
const CITY_COUNTRY: Record<string, string> = {
  Warsaw: 'countryPoland', Berlin: 'countryGermany', Prague: 'countryCzech', 'New York': 'countryUS',
}
const VIBE_KEYS: Record<string, string> = {
  artsy: 'vibeArtsy', chill: 'vibeChill', foodie: 'vibeFoodie',
  historic: 'vibeHistoric', quirky: 'vibeQuirky', photogenic: 'vibePhotogenic',
}

const STOPS = [
  { num: 1, name: 'Bar Familijny',    hood: 'Śródmieście', walk: 12,               descKey: 'stop1Desc' },
  { num: 2, name: 'Neon Muzeum',      hood: 'Praga',       walk: 9,                descKey: 'stop2Desc' },
  { num: 3, name: 'Bazar Różyckiego', hood: 'Praga',       walk: 14,               descKey: 'stop3Desc' },
  { num: 4, name: 'Pod Papugami',     hood: 'Powiśle',     walk: null as null | number, descKey: 'stop4Desc' },
]

export default function DemoAnimation() {
  const t = useTranslations('demoAnim')
  const sectionRef = useRef<HTMLElement>(null)
  const [started, setStarted] = useState(false)

  const [phase, setPhase]               = useState<Phase>('form')
  const [citySelected, setCitySelected] = useState(false)
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [btnState, setBtnState]         = useState<BtnState>('idle')
  const [visibleStops, setVisibleStops] = useState<boolean[]>([])
  const [loadingDot, setLoadingDot]     = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)

  const steps = [
    { phase: 'form' as Phase, label: t('step1Label'), desc: t('step1Desc') },
    { phase: 'loading' as Phase, label: t('step2Label'), desc: t('step2Desc') },
    { phase: 'result' as Phase, label: t('step3Label'), desc: t('step3Desc') },
  ]

  const callouts = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1v6l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
        </svg>
      ),
      title: t('callout1Title'),
      desc: t('callout1Desc'),
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6Z" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: t('callout2Title'),
      desc: t('callout2Desc'),
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      title: t('callout3Title'),
      desc: t('callout3Desc'),
    },
  ]

  // Kick off once when section enters viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.25 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Loading dot pulse
  useEffect(() => {
    if (phase !== 'loading') return
    const id = setInterval(() => setLoadingDot(d => (d + 1) % 3), 550)
    return () => clearInterval(id)
  }, [phase])

  // Main animation loop — starts after section enters viewport
  useEffect(() => {
    if (!started) return
    let alive = true
    const ids: ReturnType<typeof setTimeout>[] = []

    function q(fn: () => void, ms: number) {
      const id = setTimeout(() => { if (alive) fn() }, ms)
      ids.push(id)
    }

    function run() {
      setPhase('form'); setCitySelected(false); setSelectedVibes([])
      setBtnState('idle'); setVisibleStops([]); setScrollOffset(0)

      q(() => setCitySelected(true), 800)
      q(() => setSelectedVibes(['artsy']), 1600)
      q(() => setSelectedVibes(['artsy', 'chill']), 2350)
      q(() => setBtnState('pulse'), 3150)
      q(() => setBtnState('click'), 3950)
      q(() => setPhase('loading'), 4250)
      q(() => { setPhase('result'); setScrollOffset(0); setVisibleStops([]) }, 7350)
      q(() => setScrollOffset(-125), 8850)
      q(() => setVisibleStops(v => [...v, true]), 9000)
      q(() => setVisibleStops(v => [...v, true]), 9350)
      q(() => setVisibleStops(v => [...v, true]), 9700)
      q(() => setVisibleStops(v => [...v, true]), 10050)
      q(run, 18000)
    }

    run()
    return () => { alive = false; ids.forEach(clearTimeout) }
  }, [started])

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="map"
      className="relative py-20 md:py-28 bg-[#0a0a0a] overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr_210px] gap-8 lg:gap-10 items-start">

          {/* ── LEFT ── */}
          <FadeIn direction="left" className="lg:sticky lg:top-28">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-6 h-px bg-amber-400/60" />
              <span className="text-[11px] tracking-[0.15em] uppercase text-amber-400/90 font-medium">
                {t('sectionLabel')}
              </span>
            </div>
            <div className="divider mb-5" />
            <h2 className="font-display font-bold text-warm-white leading-tight" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              {t('heading')}{' '}
              <span className="italic gradient-text">{t('headingAccent')}</span>
            </h2>
            <p className="text-warm-gray-200 text-sm mt-4 leading-relaxed" style={{ fontWeight: 300 }}>
              {t('sub')}
            </p>
            <a href="/demo" className="btn-primary mt-6 text-sm px-6 py-3 inline-flex">
              {t('cta')}
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <div className="mt-10 flex flex-col gap-5">
              {steps.map((s) => (
                <div key={s.phase} className="flex gap-3 transition-all duration-500" style={{ opacity: phase === s.phase ? 1 : 0.3 }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 transition-all duration-500"
                    style={{ background: phase === s.phase ? '#fbbf24' : '#3d3830' }} />
                  <div>
                    <p className="text-sm font-medium text-warm-white leading-snug">{s.label}</p>
                    <p className="text-xs text-warm-gray-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* ── CENTER ── */}
          <FadeIn delay={80}>
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-t-2xl border border-b-0 border-white/[0.08]" style={{ background: '#0e0e0e' }}>
              <div className="flex gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.09]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.09]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.09]" />
              </div>
              <div className="flex-1 h-5 rounded-full border border-white/[0.06] flex items-center px-3 gap-1.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-warm-gray-500 shrink-0">
                  <circle cx="4" cy="4" r="3.5" stroke="currentColor" strokeWidth="0.9"/>
                </svg>
                <span className="text-[10px] text-warm-gray-400 tracking-wide">driftd.world/demo</span>
              </div>
            </div>

            {/* Screen */}
            <div className="relative rounded-b-2xl border border-white/[0.08] overflow-hidden select-none" style={{ background: '#0a0a0a', height: 560 }}>

              {/* ── FORM ── */}
              <div className={`absolute inset-0 transition-opacity duration-500 ${phase === 'form' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="p-6 flex flex-col gap-5">
                  <div>
                    <p className="text-[10px] tracking-[0.18em] uppercase text-warm-gray-400 mb-3">{t('formCityLabel')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CITIES.map(c => (
                        <div
                          key={c}
                          className="rounded-xl px-3 py-2.5 border text-center transition-all duration-500"
                          style={{
                            borderColor: citySelected && c === 'Warsaw' ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.07)',
                            background:  citySelected && c === 'Warsaw' ? 'rgba(251,191,36,0.07)' : 'rgba(255,255,255,0.03)',
                          }}
                        >
                          <p className={`text-xs font-medium transition-colors duration-300 ${citySelected && c === 'Warsaw' ? 'text-warm-white' : 'text-warm-gray-300'}`}>{c}</p>
                          <p className="text-[9px] text-warm-gray-500 mt-0.5">{t(CITY_COUNTRY[c] as Parameters<typeof t>[0])}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] tracking-[0.18em] uppercase text-warm-gray-400 mb-3">
                      {t('formVibeLabel')}
                      <span className="ml-2 text-warm-gray-500 normal-case tracking-normal">{t('formVibeLimit')}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {VIBES.map(v => (
                        <div
                          key={v}
                          className="px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-300"
                          style={{
                            borderColor: selectedVibes.includes(v) ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)',
                            background:  selectedVibes.includes(v) ? 'rgba(251,191,36,0.09)' : 'rgba(255,255,255,0.04)',
                            color:       selectedVibes.includes(v) ? '#fbbf24' : '#9b9284',
                          }}
                        >
                          {t(VIBE_KEYS[v] as Parameters<typeof t>[0])}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] tracking-[0.18em] uppercase text-warm-gray-400 mb-3">{t('formTimeLabel')}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-[3px] rounded-full relative" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: '37.5%', background: 'rgba(251,191,36,0.5)' }} />
                        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ left: 'calc(37.5% - 6px)', background: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.6)' }} />
                      </div>
                      <span className="text-sm font-medium text-warm-white tabular-nums shrink-0">60 min</span>
                    </div>
                  </div>

                  <button
                    className="w-full rounded-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
                    style={{
                      background: (!citySelected || !selectedVibes.length) ? 'rgba(251,191,36,0.25)' : '#fbbf24',
                      color: '#0a0a0a',
                      transform: btnState === 'click' ? 'scale(0.96)' : btnState === 'pulse' ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: btnState === 'pulse' ? '0 0 30px rgba(251,191,36,0.55)' : 'none',
                    }}
                  >
                    {t('formCta')}
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── LOADING ── */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-7 transition-opacity duration-500 ${phase === 'loading' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute rounded-full" style={{ width: 88, height: 88, background: 'radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)', animation: 'drift-logo-glow 3s ease-in-out infinite' }} />
                  <span className="relative font-display font-black italic text-amber-400" style={{ fontSize: '3.2rem', lineHeight: 1 }}>d</span>
                </div>

                <div className="w-full max-w-[240px]">
                  <svg viewBox="0 0 300 165" className="w-full" style={{ overflow: 'visible' }}>
                    <defs>
                      <filter id="anim-glow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="2" result="b"/>
                        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    <rect x="0"   y="100" width="32"  height="65"  fill="#111"/>
                    <rect x="36"  y="62"  width="20"  height="103" fill="#0e0e0e"/>
                    <rect x="60"  y="80"  width="36"  height="85"  fill="#121212"/>
                    <rect x="100" y="42"  width="24"  height="123" fill="#0f0f0f"/>
                    <rect x="128" y="84"  width="42"  height="81"  fill="#111"/>
                    <rect x="174" y="60"  width="22"  height="105" fill="#0e0e0e"/>
                    <rect x="200" y="77"  width="30"  height="88"  fill="#121212"/>
                    <rect x="234" y="44"  width="26"  height="121" fill="#0f0f0f"/>
                    <rect x="264" y="92"  width="22"  height="73"  fill="#111"/>
                    <rect x="0"   y="160" width="300" height="5"   fill="#0d0d0d"/>
                    <rect x="39"  y="70"  width="6"   height="4"   fill="#fbbf24" className="drift-win-a"/>
                    <rect x="47"  y="70"  width="6"   height="4"   fill="#fbbf24" className="drift-win-b" style={{ animationDelay: '1.3s' }}/>
                    <rect x="39"  y="82"  width="6"   height="4"   fill="#fbbf24" className="drift-win-c" style={{ animationDelay: '0.7s' }}/>
                    <rect x="103" y="50"  width="7"   height="5"   fill="#fbbf24" className="drift-win-c" style={{ animationDelay: '0.4s' }}/>
                    <rect x="114" y="50"  width="7"   height="5"   fill="#fbbf24" className="drift-win-a" style={{ animationDelay: '3.1s' }}/>
                    <rect x="103" y="63"  width="7"   height="5"   fill="#fbbf24" className="drift-win-b" style={{ animationDelay: '1.1s' }}/>
                    <rect x="177" y="68"  width="7"   height="4"   fill="#fbbf24" className="drift-win-a" style={{ animationDelay: '1.7s' }}/>
                    <rect x="237" y="52"  width="8"   height="5"   fill="#fbbf24" className="drift-win-c" style={{ animationDelay: '2.2s' }}/>
                    <rect x="249" y="52"  width="8"   height="5"   fill="#fbbf24" className="drift-win-b" style={{ animationDelay: '0.9s' }}/>
                    {([46, 122, 184, 248] as const).map((cx, i) => {
                      const d = 0.4 + i * 0.7
                      return (
                        <g key={cx} style={{ animation: `drift-stop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) ${d}s both`, transformBox: 'fill-box', transformOrigin: 'center' }}>
                          <circle cx={cx} cy="152" r="5" fill="none" stroke="#fbbf24" strokeWidth="1">
                            <animate attributeName="r" values="5;13;5" dur="2.8s" begin={`${d + 0.4}s`} repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.5;0;0.5" dur="2.8s" begin={`${d + 0.4}s`} repeatCount="indefinite"/>
                          </circle>
                          <circle cx={cx} cy="152" r="4" fill="#fbbf24" filter="url(#anim-glow)"/>
                        </g>
                      )
                    })}
                    {([[50, 118], [126, 180], [188, 244]] as const).map(([x1, x2], i) => (
                      <line key={x1} x1={x1} y1="152" x2={x2} y2="152"
                        stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 6" strokeDashoffset="80"
                        style={{ animation: `drift-line-in 0.4s ease-out ${1.1 + i * 0.7}s both` }}
                      />
                    ))}
                    <circle cx="0" cy="0" r="2.5" fill="#fff" opacity="0">
                      <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.06;0.94;1" dur="5.5s" repeatCount="indefinite"/>
                      <animateMotion dur="5.5s" repeatCount="indefinite" calcMode="linear" path="M 46,152 L 248,152"/>
                    </circle>
                  </svg>
                </div>

                <p className="text-warm-gray-300 text-sm tracking-wide">
                  {t('loadingText')}
                  <span className="inline-flex ml-0.5 gap-[1px]">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="transition-opacity duration-200" style={{ opacity: loadingDot >= i ? 1 : 0.2 }}>.</span>
                    ))}
                  </span>
                </p>
              </div>

              {/* ── RESULT ── */}
              <div className={`absolute inset-0 overflow-hidden transition-opacity duration-500 ${phase === 'result' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div
                  style={{
                    transform: `translateY(${scrollOffset}px)`,
                    transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Header */}
                  <div className="px-5 pt-5 pb-3">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-1">{t('resultLabel')}</span>
                    <h3 className="font-display font-black text-warm-white leading-tight" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)' }}>
                      {t('resultThrough')} <span className="italic gradient-text">{t('resultCityWarsaw')}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] border border-amber-400/20 bg-amber-400/[0.06] text-amber-400/80 font-medium">{t('vibeArtsy')}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] border border-amber-400/20 bg-amber-400/[0.06] text-amber-400/80 font-medium">{t('vibeChill')}</span>
                      <span className="text-warm-gray-500 text-[11px]">·</span>
                      <span className="text-warm-gray-400 text-[11px]">60 min</span>
                      <span className="text-warm-gray-500 text-[11px]">·</span>
                      <span className="text-warm-gray-400 text-[11px]">{t('resultStops')}</span>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="px-5 pb-3">
                    <AnimDemoMap height={230} />
                  </div>

                  {/* Stop list */}
                  <div className="px-5 pb-5 flex flex-col">
                    {STOPS.map((stop, i) => (
                      <div key={i}>
                        <div
                          className="flex gap-3 p-3.5 rounded-xl border border-white/[0.06]"
                          style={{
                            background: '#111',
                            opacity: visibleStops[i] ? 1 : 0,
                            transform: visibleStops[i] ? 'none' : 'translateY(8px)',
                            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                          }}
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-[#0a0a0a] font-bold text-[10px]">
                            {stop.num}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2 mb-0.5">
                              <p className="font-semibold text-warm-white text-xs leading-snug">{stop.name}</p>
                              <p className="text-[9px] text-warm-gray-400 shrink-0">{stop.hood}</p>
                            </div>
                            <p className="text-warm-gray-300 text-[10px] leading-relaxed">{t(stop.descKey as Parameters<typeof t>[0])}</p>
                          </div>
                        </div>
                        {stop.walk && (
                          <div className="flex items-center gap-2 px-3 py-1.5" style={{ opacity: visibleStops[i] ? 1 : 0, transition: 'opacity 0.4s ease-out 0.15s' }}>
                            <div className="flex flex-col items-center gap-[3px] ml-2">
                              <div className="w-px h-2" style={{ background: 'rgba(251,191,36,0.3)' }}/>
                              <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(251,191,36,0.25)' }}/>
                              <div className="w-px h-2" style={{ background: 'rgba(251,191,36,0.3)' }}/>
                            </div>
                            <span className="text-[10px] text-warm-gray-400 tracking-widest">{stop.walk} {t('resultWalkMin')}</span>
                          </div>
                        )}
                      </div>
                    ))}

                    <div
                      className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between"
                      style={{ opacity: visibleStops[3] ? 1 : 0, transition: 'opacity 0.4s ease-out 0.5s' }}
                    >
                      <span className="text-[10px] text-warm-gray-400">{t('resultGeneratedIn')}</span>
                      <a href="/demo" className="text-[10px] text-amber-400/80 hover:text-amber-400 transition-colors">{t('resultTryIt')}</a>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Phase dots */}
            <div className="flex justify-center gap-2 mt-4">
              {(['form', 'loading', 'result'] as Phase[]).map(p => (
                <div key={p} className="rounded-full transition-all duration-500"
                  style={{ width: phase === p ? 20 : 6, height: 6, background: phase === p ? '#fbbf24' : 'rgba(255,255,255,0.15)' }} />
              ))}
            </div>
          </FadeIn>

          {/* ── RIGHT ── */}
          <div className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-28">
            {callouts.map((c, i) => (
              <FadeIn key={i} direction="right" delay={i * 80 + 160}>
                <div className="card-hover p-5 rounded-2xl border border-white/[0.07] bg-[#0f0e0c]">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    {c.icon}
                  </div>
                  <p className="text-sm font-semibold text-warm-white mb-1">{c.title}</p>
                  <p className="text-warm-gray-300 text-xs leading-relaxed" style={{ fontWeight: 300 }}>{c.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
