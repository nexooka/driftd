import { FadeIn } from './FadeIn'

const STATS = [
  { value: '73%', label: 'of tourists in Tokyo never leave 3 neighborhoods' },
  { value: '4×', label: 'more neighborhoods visited per driftd user' },
  { value: '€0', label: 'cost to tourists — cities fund the experience' },
]

export default function ForCities() {
  return (
    <section id="cities" className="relative py-28 md:py-36 bg-[#0d0d0d] overflow-hidden">
      {/* Decorative */}
      <div
        className="blob absolute opacity-20 pointer-events-none"
        style={{
          width: 500,
          height: 500,
          bottom: '-10%',
          left: '-10%',
          background: 'radial-gradient(circle, #e2714b 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Label */}
        <FadeIn className="mb-16">
          <span className="text-xs tracking-widest uppercase text-terra font-medium">
            For cities & tourism boards
          </span>
        </FadeIn>

        {/* Main content two-col */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left: text */}
          <div>
            <FadeIn direction="left">
              <div className="divider mb-8" style={{ background: 'linear-gradient(90deg, #e2714b, transparent)' }} />
              <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-warm-white leading-tight mb-8">
                "Cities don't have a tourist{' '}
                <span className="italic text-terra">problem.</span>
                <br />
                They have a distribution{' '}
                <span className="italic text-terra">problem."</span>
              </blockquote>
              <p className="text-warm-gray-300 text-lg leading-relaxed mb-10 max-w-lg">
                Overcrowded landmarks, underfunded neighborhoods. driftd redistributes tourist
                foot traffic intelligently — sending curious people to the places that deserve
                them, not just the ones that already have signs.
              </p>
              <a href="mailto:cities@drift.app" className="btn-outline" style={{ borderColor: 'rgba(226,113,75,0.4)', color: '#e2714b' }}>
                Partner with us
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </FadeIn>
          </div>

          {/* Right: stats */}
          <div className="flex flex-col gap-6">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.value} delay={i * 100} direction="right">
                <div className="card-hover flex items-center gap-6 p-7 rounded-2xl border border-white/[0.06] bg-[#131313]">
                  <div
                    className="flex-shrink-0 font-display text-4xl md:text-5xl font-black leading-none"
                    style={{
                      background: 'linear-gradient(135deg, #e2714b, #fbbf24)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.value}
                  </div>
                  <p className="text-warm-gray-200 leading-snug">{stat.label}</p>
                </div>
              </FadeIn>
            ))}

            {/* Cities active */}
            <FadeIn delay={300} direction="right">
              <div className="flex items-center gap-4 p-5 rounded-xl border border-white/[0.04] bg-[#111]">
                <div className="flex -space-x-2">
                  {['W', 'K', 'P'].map((letter, i) => (
                    <div
                      key={letter}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-ink border-2 border-[#111]"
                      style={{ background: i === 0 ? '#fbbf24' : i === 1 ? '#e2714b' : '#d4a017' }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-warm-white text-sm font-medium">Warsaw · Kraków · Prague</p>
                  <p className="text-warm-gray-400 text-xs">Launching 2025 · More cities coming</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
