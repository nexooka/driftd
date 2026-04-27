import { FadeIn } from './FadeIn'

const STOPS = [
  {
    name: 'Zachęta National Gallery',
    neighborhood: 'Śródmieście',
    note: 'contemporary art that will either move you or confuse you completely. both are the right reaction.',
    walkNext: 9,
  },
  {
    name: 'Saxon Garden Passage',
    neighborhood: 'Śródmieście',
    note: "warsaw's oldest public park. locals eat lunch here. tourists march straight through without noticing.",
    walkNext: 12,
  },
  {
    name: 'Praga Street Art District',
    neighborhood: 'Praga Północ',
    note: 'pre-war tenements covered in murals that appeared overnight. this is what berlin looked like before it got expensive.',
    walkNext: 8,
  },
  {
    name: 'Nowy Świat Coffee Roasters',
    neighborhood: 'Śródmieście',
    note: 'end here. order a natural process espresso. sit by the window. decide if you want to keep drifting.',
    walkNext: null,
  },
]

export default function SampleDrift() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#070706' }}>
      <div className="noise-overlay absolute inset-0" />

      {/* Subtle side glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          top: '50%',
          right: '-5%',
          transform: 'translateY(-50%)',
          background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-10 relative z-10">

        <FadeIn className="mb-10 flex items-center justify-between gap-4">
          <span className="text-[10px] tracking-[0.28em] uppercase text-warm-gray-500">
            what drifting looks like
          </span>
          <div className="flex-1 h-px bg-white/[0.05]" />
          <a
            href="/demo"
            className="text-[10px] tracking-[0.2em] uppercase text-amber-400/60 hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            try it live →
          </a>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="relative">
            {/* Top amber rule */}
            <div
              className="h-px mb-0"
              style={{ background: 'linear-gradient(90deg, #fbbf24 0%, rgba(251,191,36,0.15) 40%, transparent 100%)' }}
            />

            <div className="border border-t-0 border-white/[0.07]">

              {/* Card header */}
              <div className="px-7 md:px-10 pt-8 pb-7 border-b border-white/[0.06] flex items-start justify-between gap-6">
                <div>
                  <p className="text-[10px] tracking-[0.28em] uppercase text-warm-gray-500 mb-2.5">your drift</p>
                  <p className="font-display font-bold text-warm-white text-2xl md:text-3xl leading-none">Warsaw</p>
                  <p className="text-warm-gray-400 text-sm mt-2" style={{ fontWeight: 300 }}>artsy & off the beaten path</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] tracking-[0.28em] uppercase text-warm-gray-500 mb-2.5">total time</p>
                  <p className="font-display font-bold text-amber-400 text-3xl md:text-4xl leading-none">47 min</p>
                  <p className="text-warm-gray-600 text-xs mt-2">4 stops · 2.1 km</p>
                </div>
              </div>

              {/* Stops */}
              <div className="px-7 md:px-10">
                {STOPS.map((stop, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-6 py-6">
                      {/* Ghost number */}
                      <span
                        className="font-display font-black text-warm-white/[0.07] leading-none shrink-0 select-none"
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1, marginTop: '-4px' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-baseline gap-4 justify-between flex-wrap mb-1.5">
                          <h4 className="font-display font-semibold text-warm-white text-base md:text-lg leading-tight">
                            {stop.name}
                          </h4>
                          <span className="text-[11px] text-warm-gray-500 tracking-[0.12em] shrink-0">
                            {stop.neighborhood}
                          </span>
                        </div>
                        <p
                          className="text-warm-gray-400 text-sm leading-relaxed italic"
                          style={{ fontWeight: 300 }}
                        >
                          {stop.note}
                        </p>
                      </div>
                    </div>

                    {/* Walk connector */}
                    {stop.walkNext && (
                      <div className="flex items-center gap-3 ml-[calc(clamp(2.5rem,5vw,3.5rem)+1.5rem)] pb-1">
                        <div className="flex flex-col items-center gap-[3px] ml-1">
                          <div className="w-px h-2 bg-white/[0.08]" />
                          <div className="w-[3px] h-[3px] rounded-full bg-white/[0.08]" />
                          <div className="w-px h-2 bg-white/[0.08]" />
                        </div>
                        <span className="text-[11px] text-warm-gray-600 tracking-widest">
                          {stop.walkNext} min walk
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Card footer */}
              <div className="px-7 md:px-10 py-5 border-t border-white/[0.06] flex items-center justify-between gap-4">
                <span className="text-[11px] text-warm-gray-600 tracking-wide">
                  generated by driftd · 3.4 seconds · unique to you
                </span>
                <a
                  href="/demo"
                  className="text-[11px] text-amber-400/70 hover:text-amber-400 transition-colors tracking-wide whitespace-nowrap"
                >
                  generate yours →
                </a>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Bottom note */}
        <FadeIn delay={160}>
          <p className="mt-8 text-center text-[11px] text-warm-gray-600 tracking-wide">
            every drift is unique — same city, same time, different route. always.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
