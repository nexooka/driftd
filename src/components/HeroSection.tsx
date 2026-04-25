'use client'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise-overlay">
      {/* Base bg */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* Atmospheric blobs */}
      <div
        className="blob absolute opacity-20"
        style={{
          width: 700,
          height: 700,
          bottom: '-15%',
          left: '-12%',
          background: 'radial-gradient(circle, #e2714b 0%, transparent 68%)',
          filter: 'blur(110px)',
        }}
      />
      <div
        className="blob absolute opacity-15"
        style={{
          width: 500,
          height: 500,
          top: '-8%',
          right: '-5%',
          background: 'radial-gradient(circle, #f59e0b 0%, transparent 68%)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="blob absolute opacity-8"
        style={{
          width: 350,
          height: 350,
          top: '45%',
          left: '55%',
          background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Topographic / grid lines */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 flex flex-col items-center text-center">

        {/* Coordinates */}
        <div className="flex items-center gap-3 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" />
          <span className="text-[11px] font-medium tracking-[0.2em] text-warm-gray-500 uppercase">
            52.2297° N · 21.0122° E · anti-tourist tourism
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display font-black text-warm-white leading-[0.9] tracking-tight"
          style={{ fontSize: 'clamp(3.6rem, 12vw, 8.5rem)' }}
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
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
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

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-bounce-slow">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-warm-gray-500">
          <path d="M4 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  )
}
