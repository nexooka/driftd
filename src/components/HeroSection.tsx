'use client'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#080807]" />

      {/* Street grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Noise overlay */}
      <div className="noise-overlay absolute inset-0" />

      {/* Warm ground glow — bottom left only */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: 700,
          height: 500,
          background: 'radial-gradient(ellipse at 0% 100%, rgba(226,113,75,0.07) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 md:px-14 lg:px-20 pt-36 pb-10 md:pt-40 md:pb-14">

        {/* Top meta row */}
        <div className="flex items-center justify-between mb-auto">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow flex-shrink-0" />
            <span className="font-sans text-[10px] tracking-[0.22em] uppercase text-warm-gray-400">
              52.2297° N · 21.0122° E
            </span>
          </div>
          <span className="hidden sm:block font-sans text-[10px] tracking-[0.2em] uppercase text-warm-gray-500">
            anti-tourist tourism
          </span>
        </div>

        {/* Main headline */}
        <div className="py-14 md:py-20">
          <h1
            className="font-display font-extrabold text-warm-white leading-[0.85] tracking-[-0.02em] uppercase"
            style={{ fontSize: 'clamp(3.8rem, 11vw, 9rem)' }}
          >
            stop
            <br />
            following.
          </h1>
          <p
            className="font-serif italic text-amber-400 leading-[0.88]"
            style={{ fontSize: 'clamp(3.5rem, 10.5vw, 8.5rem)', fontWeight: 300 }}
          >
            start drifting.
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 sm:gap-6">
          {/* Description + cities */}
          <div className="max-w-xs">
            <p className="font-sans text-warm-gray-300 text-base leading-relaxed" style={{ fontWeight: 300 }}>
              an AI companion that whispers a city&apos;s secrets in your ear.
              no landmarks. no tourist traps.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {['Warsaw', 'Berlin', 'Prague', 'New York'].map((city) => (
                <span key={city} className="font-sans text-[10px] tracking-[0.15em] uppercase text-warm-gray-600">
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:items-end shrink-0">
            <a href="/demo" className="btn-primary self-start sm:self-auto">
              try the demo →
            </a>
            <a
              href="#waitlist"
              className="font-sans text-sm text-warm-gray-400 hover:text-warm-white transition-colors duration-200 underline underline-offset-4 decoration-warm-gray-700 hover:decoration-warm-gray-400 self-start sm:self-auto"
            >
              join the waitlist
            </a>
            <p className="font-sans text-[11px] text-warm-gray-600 tracking-wide">
              live demo · no signup · free for explorers
            </p>
          </div>
        </div>
      </div>

      {/* Bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
