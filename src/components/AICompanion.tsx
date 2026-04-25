'use client'

import { useState } from 'react'
import { FadeIn } from './FadeIn'

const MODES = [
  {
    id: 'narration',
    label: 'guided narration',
    tagline: 'your city, as a story',
    status: 'live' as const,
    description:
      'start a route, put in your headphones, and drift. driftd narrates your walk with stories, history, and local secrets as you pass each spot — not a tour script, but a conversation.',
    popupDetail:
      'you pick a neighborhood and a vibe, driftd generates a walking route and narrates each stop as you arrive. stories, context, recommendations — all in real time, all felt like a local friend telling you about their city. no scripted audio, no stiff museum voice. just good conversation.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2C6.5 2 3 5.2 3 9.5c0 2.2 1 4.2 2.7 5.6L5 19l3.6-1.4c.8.2 1.6.4 2.4.4 4.5 0 8-3.2 8-7.5S15.5 2 11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M7.5 9h7M7.5 12.5h4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    accent: '#fbbf24',
  },
  {
    id: 'whats-that',
    label: '"what\'s that?"',
    tagline: 'point and ask anything',
    status: 'soon' as const,
    description:
      'see a building that catches your eye? ask driftd. it figures out what you\'re looking at and tells you the story behind it — the thing no signpost ever would.',
    popupDetail:
      'point your phone at anything — a building, a mural, a market stall, a weird statue — and ask driftd what it is. it uses your location and camera context to figure out exactly what you\'re looking at, then gives you the story behind it. the kind of detail that takes hours of googling, delivered in seconds.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M15 15l4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M10 7.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: '#e2714b',
  },
  {
    id: 'ambient',
    label: 'ambient discovery',
    tagline: 'let curiosity lead',
    status: 'soon' as const,
    description:
      'not following a route? just walking? driftd watches your location and nudges you when something interesting is nearby. say yes or keep walking — that\'s the whole point.',
    popupDetail:
      'no plan, no pressure. just turn it on and walk. driftd runs quietly in the background, tracking where you are, and taps you when something worth knowing about is within reach — a courtyard most people miss, a bar that\'s been there since 1962, a mural that appeared last week. you decide whether to detour or drift on.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M11 2v2M11 18v2M2 11h2M18 11h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M4.5 4.5l1.4 1.4M16.1 16.1l1.4 1.4M4.5 17.5l1.4-1.4M16.1 5.9l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    accent: '#d4a017',
  },
]

export default function AICompanion() {
  const [activeInfo, setActiveInfo] = useState<string | null>(null)
  const activeMode = MODES.find(m => m.id === activeInfo)

  return (
    <section id="features" className="relative py-28 md:py-36 bg-[#0a0a0a] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
      <div
        className="blob absolute opacity-12 pointer-events-none"
        style={{
          width: 550,
          height: 550,
          top: '5%',
          right: '-15%',
          background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
          filter: 'blur(120px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">

          {/* Left: sticky text */}
          <div className="lg:sticky lg:top-28">
            <FadeIn direction="left">
              <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-4">
                the driftd companion
              </span>
              <div className="divider mb-5" />
              <h2
                className="font-display font-bold text-warm-white leading-tight mb-6"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)' }}
              >
                your city has stories.
                <br />
                <span className="italic gradient-text">driftd tells them.</span>
              </h2>
              <p className="text-warm-gray-300 text-lg leading-relaxed mb-8 max-w-md" style={{ fontWeight: 300 }}>
                most travel apps give you lists. driftd gives you a voice — one that knows
                the neighborhood, remembers what you&apos;ve seen, and gets more interesting
                the further you wander.
              </p>
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-amber-400/12 bg-amber-400/[0.04]">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-slow flex-shrink-0" />
                <span className="text-sm text-warm-gray-200">
                  driftd · real-time AI · no scripted tours · no app switching
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Right: mode cards */}
          <div className="flex flex-col gap-4">
            <FadeIn direction="right">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm tracking-[0.15em] uppercase text-warm-gray-200 font-semibold">3 ai modes</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </FadeIn>
            {MODES.map((mode, i) => (
              <FadeIn key={mode.id} delay={i * 100} direction="right">
                <div className="card-hover relative flex flex-col p-7 rounded-2xl border border-white/[0.06] bg-[#111] overflow-hidden">
                  {/* Corner glow */}
                  <div
                    className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-50 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${mode.accent}30 0%, transparent 70%)`,
                      filter: 'blur(16px)',
                    }}
                  />

                  <div className="flex items-start gap-4 mb-3 relative z-10">
                    <div
                      className="flex-shrink-0 p-2.5 rounded-xl border"
                      style={{ color: mode.accent, borderColor: `${mode.accent}22`, background: `${mode.accent}0d` }}
                    >
                      {mode.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-widest uppercase font-medium mb-0.5" style={{ color: mode.accent }}>
                        {mode.label}
                      </p>
                      <h3 className="font-display text-lg font-semibold text-warm-white">
                        {mode.tagline}
                      </h3>
                    </div>

                    {/* Info button */}
                    <button
                      onClick={() => setActiveInfo(mode.id)}
                      className="flex-shrink-0 w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-warm-gray-200 hover:text-warm-white hover:border-white/60 transition-colors"
                      aria-label={`learn more about ${mode.label}`}
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <circle cx="5.5" cy="5.5" r="5" stroke="currentColor" strokeWidth="1"/>
                        <path d="M5.5 5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <circle cx="5.5" cy="3.5" r="0.6" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>

                  <p className="text-warm-gray-300 text-sm leading-relaxed relative z-10 mb-4">
                    {mode.description}
                  </p>

                  {/* Status badge */}
                  {mode.status === 'live' ? (
                    <div className="flex items-center gap-2 relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        demo live now
                      </span>
                      <a
                        href="/demo"
                        className="text-[11px] text-amber-400/70 hover:text-amber-400 transition-colors"
                      >
                        try it →
                      </a>
                    </div>
                  ) : (
                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/20 text-warm-gray-300 text-[11px] font-medium">
                        coming later this year
                      </span>
                    </div>
                  )}

                  <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${mode.accent}25, transparent)` }}
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Info modal */}
      {activeMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setActiveInfo(null) }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111] p-8 relative">
            <button
              onClick={() => setActiveInfo(null)}
              className="absolute top-5 right-5 text-warm-gray-500 hover:text-warm-gray-300 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Icon + label */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="flex-shrink-0 p-3 rounded-xl border"
                style={{ color: activeMode.accent, borderColor: `${activeMode.accent}22`, background: `${activeMode.accent}0d` }}
              >
                {activeMode.icon}
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase font-medium mb-0.5" style={{ color: activeMode.accent }}>
                  {activeMode.label}
                </p>
                <h3 className="font-display text-xl font-bold text-warm-white">{activeMode.tagline}</h3>
              </div>
            </div>

            <p className="text-warm-gray-300 text-sm leading-relaxed mb-6">
              {activeMode.popupDetail}
            </p>

            {activeMode.status === 'live' ? (
              <a
                href="/demo"
                className="btn-primary w-full text-center block"
                onClick={() => setActiveInfo(null)}
              >
                try the demo →
              </a>
            ) : (
              <p className="text-warm-gray-500 text-xs text-center">coming later this year</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
