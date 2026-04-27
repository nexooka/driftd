'use client'

const ROUTE_STOPS = [
  { number: '01', name: 'Zachęta National Gallery', neighborhood: 'Śródmieście', walkNext: 9 },
  { number: '02', name: 'Saxon Garden Passage',      neighborhood: 'Śródmieście', walkNext: 12 },
  { number: '03', name: 'Praga Street Art District', neighborhood: 'Praga Północ', walkNext: null },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise-overlay">
      {/* Base bg */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Atmospheric blobs */}
      <div
        className="blob absolute opacity-20"
        style={{
          width: 700, height: 700, bottom: '-15%', left: '-12%',
          background: 'radial-gradient(circle, #e2714b 0%, transparent 68%)',
          filter: 'blur(110px)',
        }}
      />
      <div
        className="blob absolute opacity-15"
        style={{
          width: 500, height: 500, top: '-8%', right: '-5%',
          background: 'radial-gradient(circle, #f59e0b 0%, transparent 68%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 py-36 md:py-44">
        <div className="flex flex-col lg:flex-row lg:items-center gap-16 lg:gap-20 xl:gap-28">

          {/* ── LEFT ── */}
          <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left">

            {/* Coordinates */}
            <div className="flex items-center gap-3 mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" />
              <span className="text-[11px] font-medium tracking-[0.2em] text-warm-gray-500 uppercase">
                52.2297° N · 21.0122° E · anti-tourist tourism
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display font-black text-warm-white leading-[0.92] tracking-tight"
              style={{ fontSize: 'clamp(2.8rem, 9vw, 6.8rem)' }}
            >
              stop following.
              <br />
              <span className="italic gradient-text">start drifting.</span>
            </h1>

            {/* Subheadline */}
            <p
              className="mt-8 max-w-lg text-base md:text-xl leading-relaxed text-warm-gray-300"
              style={{ fontWeight: 300 }}
            >
              <span className="text-amber-400/90 font-medium">driftd</span>{' '}is an AI companion
              that whispers a city&apos;s secrets in your ear.
              no landmarks. no tourist traps.{' '}
              <span className="text-warm-white font-normal">just the real city.</span>
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <a href="/demo" className="btn-primary text-sm px-9 py-4">
                try the demo
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2.5 7.5h10M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#waitlist" className="btn-outline text-sm px-9 py-4">
                join the waitlist
              </a>
            </div>

            {/* Micro copy */}
            <p className="mt-5 text-xs text-warm-gray-500 tracking-wide">
              live demo · no signup · free forever for explorers
            </p>
          </div>

          {/* ── RIGHT: route card ── */}
          <div
            className="hidden lg:block shrink-0 w-[360px] xl:w-[400px]"
            style={{ animation: 'fadeIn 1s ease-out 0.5s both' }}
          >
            {/* Amber top bar */}
            <div className="h-[2px] rounded-t-sm" style={{ background: 'linear-gradient(90deg, #fbbf24 0%, rgba(251,191,36,0.2) 60%, transparent 100%)' }} />

            <div
              className="border border-t-0 border-white/[0.09] rounded-b-xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #111009 0%, #0d0c0a 100%)' }}
            >
              {/* Card header */}
              <div className="px-7 pt-6 pb-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-warm-gray-500 mb-2">
                    a drift through
                  </p>
                  <p className="font-display font-bold text-warm-white leading-none" style={{ fontSize: '1.6rem' }}>
                    Warsaw
                  </p>
                  <p className="text-warm-gray-400 text-sm mt-2" style={{ fontWeight: 300 }}>
                    artsy &amp; off the beaten path
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                    <span className="text-[10px] tracking-[0.2em] uppercase text-emerald-400/80">live</span>
                  </div>
                  <p className="font-display font-bold text-amber-400 leading-none" style={{ fontSize: '1.8rem' }}>47 min</p>
                  <p className="text-warm-gray-600 text-xs mt-1.5">4 stops · 2.1 km</p>
                </div>
              </div>

              {/* Stops */}
              <div className="px-7 py-3">
                {ROUTE_STOPS.map((stop, i) => (
                  <div key={i}>
                    <div
                      className="flex items-start gap-5 py-4"
                      style={{ animation: `fadeUp 0.6s ease-out ${1 + i * 0.45}s both` }}
                    >
                      {/* Ghost number */}
                      <span
                        className="font-display font-black text-warm-white/[0.1] leading-none shrink-0 select-none"
                        style={{ fontSize: '2rem', lineHeight: 1, marginTop: 2 }}
                      >
                        {stop.number}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-warm-white leading-snug" style={{ fontSize: '1rem' }}>
                          {stop.name}
                        </p>
                        <p className="text-amber-400/50 text-xs mt-1 tracking-[0.12em] uppercase">
                          {stop.neighborhood}
                        </p>
                      </div>
                    </div>

                    {stop.walkNext && (
                      <div
                        className="flex items-center gap-3 ml-[3.25rem] pb-1"
                        style={{ animation: `fadeIn 0.4s ease-out ${1.2 + i * 0.45}s both` }}
                      >
                        <div className="flex flex-col items-center gap-[3px]">
                          <div className="w-px h-2" style={{ background: 'rgba(251,191,36,0.2)' }} />
                          <div className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(251,191,36,0.2)' }} />
                          <div className="w-px h-2" style={{ background: 'rgba(251,191,36,0.2)' }} />
                        </div>
                        <span className="text-[11px] text-warm-gray-500 tracking-widest">
                          {stop.walkNext} min walk
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="px-7 py-4 border-t border-white/[0.06] flex items-center justify-between"
                style={{ animation: 'fadeIn 0.5s ease-out 2.4s both' }}
              >
                <span className="text-xs text-warm-gray-500">generated in 3.2s</span>
                <a href="/demo" className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors">
                  generate yours →
                </a>
              </div>
            </div>

            <p className="mt-3 text-center text-[10px] text-warm-gray-600 tracking-wide">
              every route is unique — never the same twice
            </p>
          </div>

        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-bounce-slow">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-warm-gray-500">
          <path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  )
}
