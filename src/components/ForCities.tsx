import { FadeIn } from './FadeIn'

const VALUE_PROPS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M5 10h1M14 10h1M10 5v1M10 14v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: 'redistribute foot traffic',
    description:
      'driftd routes tourists to undervisited neighborhoods, reducing pressure on overcrowded hotspots. tourists discover more. locals deal with less.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 17V9l7-6 7 6v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="7" y="12" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
    title: 'boost local economies',
    description:
      'partner businesses in quiet neighborhoods see real, measurable increases in foot traffic. driftd routes discovery — not just tourists.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 13l3-4 2 2.5 2-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'data you can act on',
    description:
      'real-time analytics on tourist movement, preferences, and spending patterns — so cities can make evidence-based decisions about tourism policy.',
  },
]

export default function ForCities() {
  return (
    <section id="cities" className="relative py-28 md:py-36 bg-[#0d0d0d] overflow-hidden">
      <div
        className="blob absolute opacity-15 pointer-events-none"
        style={{
          width: 500,
          height: 500,
          bottom: '-10%',
          left: '-10%',
          background: 'radial-gradient(circle, #e2714b 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Label */}
        <FadeIn className="mb-16">
          <span className="text-[11px] tracking-[0.2em] uppercase text-terra font-medium">
            for cities & tourism boards
          </span>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Left */}
          <div>
            <FadeIn direction="left">
              <div className="divider-terra mb-7" />
              <h2
                className="font-display font-bold text-warm-white leading-tight mb-6"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)' }}
              >
                overtourism isn&apos;t a demand{' '}
                <span className="italic" style={{ color: '#e2714b' }}>problem.</span>
                <br />
                it&apos;s a distribution{' '}
                <span className="italic" style={{ color: '#e2714b' }}>problem.</span>
              </h2>
              <p className="text-warm-gray-300 text-lg leading-relaxed mb-10 max-w-lg" style={{ fontWeight: 300 }}>
                overcrowded landmarks, underfunded neighborhoods. driftd redistributes
                tourist foot traffic intelligently — sending curious people to the places
                that deserve them, not just the ones that already have signs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:cities@driftd.world"
                  className="btn-outline-amber"
                >
                  partner with us
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </FadeIn>
          </div>

          {/* Right: value props */}
          <div className="flex flex-col gap-5">
            {VALUE_PROPS.map((prop, i) => (
              <FadeIn key={prop.title} delay={i * 100} direction="right">
                <div className="card-hover flex gap-5 p-7 rounded-2xl border border-white/[0.06] bg-[#111]">
                  <div
                    className="flex-shrink-0 p-2.5 rounded-xl h-fit"
                    style={{ color: '#e2714b', background: 'rgba(226,113,75,0.08)', border: '1px solid rgba(226,113,75,0.15)' }}
                  >
                    {prop.icon}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-warm-white mb-2">
                      {prop.title}
                    </h3>
                    <p className="text-warm-gray-300 text-sm leading-relaxed">
                      {prop.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}

            {/* Stat */}
            <FadeIn delay={320} direction="right">
              <div className="p-5 rounded-xl border border-white/[0.04] bg-[#0f0f0f] flex items-center gap-5">
                <div
                  className="font-display font-black text-4xl flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #e2714b, #fbbf24)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  73%
                </div>
                <p className="text-warm-gray-300 text-sm leading-snug">
                  of tourists in major cities never leave the main tourist corridor.
                  driftd changes that.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
