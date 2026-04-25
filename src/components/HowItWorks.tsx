import { FadeIn } from './FadeIn'

const STEPS = [
  {
    number: '01',
    title: 'pick your vibe',
    description: 'tell driftd how you\'re feeling and how long you have. every route is unique, generated in seconds, never the same twice.',
    tags: ['artsy', 'historic', 'foodie', 'nightlife', 'sketchy-but-cool', 'chill', 'romantic'],
    quote: null,
  },
  {
    number: '02',
    title: 'put in your headphones',
    description: 'driftd becomes your AI audio companion — narrating your walk with stories, history, and secrets as you pass each spot.',
    tags: null,
    quote: 'like having a friend who grew up here whispering in your ear',
  },
  {
    number: '03',
    title: 'just walk.',
    description: 'no staring at your phone. no following arrows. driftd guides by voice and nudges you when something worth knowing is nearby.',
    tags: null,
    quote: "you didn't follow a route. you drifted.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 md:py-36 bg-[#0a0a0a]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-5xl mx-auto px-6 md:px-14">

        {/* Header */}
        <FadeIn className="mb-20 md:mb-28">
          <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-warm-gray-500 block mb-5">
            how driftd works
          </span>
          <h2
            className="font-display font-extrabold text-warm-white leading-[0.88] tracking-tight uppercase"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
          >
            three steps to{' '}
            <span className="font-serif font-light italic normal-case text-amber-400" style={{ fontSize: '1.05em' }}>
              drift
            </span>
          </h2>
        </FadeIn>

        {/* Steps */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute top-8 bottom-8 hidden md:block"
            style={{ left: '2.8rem', width: 1, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.07) 15%, rgba(251,191,36,0.12) 50%, rgba(255,255,255,0.07) 85%, transparent)' }}
          />

          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <FadeIn key={step.number} delay={i * 130}>
                <div className="flex gap-8 md:gap-16 group">

                  {/* Number column */}
                  <div className="flex flex-col items-center shrink-0 relative">
                    {/* Route dot */}
                    <div className="relative z-10 mt-3 w-2.5 h-2.5 rounded-full border border-amber-400/50 bg-[#0a0a0a] flex-shrink-0 hidden md:block" />
                    {/* Ghost number */}
                    <span
                      className="font-display font-extrabold leading-none text-warm-white/[0.06] select-none mt-0 md:-mt-4 group-hover:text-warm-white/[0.1] transition-colors duration-500 md:hidden"
                      style={{ fontSize: 'clamp(3rem, 7vw, 5rem)' }}
                    >
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 ${i < STEPS.length - 1 ? 'pb-20 md:pb-24' : 'pb-2'}`}>
                    {/* Number + title row */}
                    <div className="flex items-baseline gap-5 mb-5">
                      <span
                        className="font-display font-extrabold leading-none text-warm-white/[0.08] select-none hidden md:block"
                        style={{ fontSize: 'clamp(3.5rem, 6vw, 5rem)' }}
                      >
                        {step.number}
                      </span>
                      <h3
                        className="font-display font-extrabold text-warm-white leading-tight tracking-tight"
                        style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}
                      >
                        {step.title}
                      </h3>
                    </div>

                    <div className="md:pl-0">
                      <p
                        className="font-sans text-warm-gray-300 text-base md:text-lg leading-relaxed mb-6 max-w-xl"
                        style={{ fontWeight: 300 }}
                      >
                        {step.description}
                      </p>

                      {step.tags && (
                        <div className="flex flex-wrap gap-2">
                          {step.tags.map((tag) => (
                            <span
                              key={tag}
                              className="font-sans px-3 py-1.5 text-[11px] tracking-widest uppercase border border-white/[0.08] text-warm-gray-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {step.quote && (
                        <p
                          className="font-serif italic text-amber-400/65 leading-snug"
                          style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 300 }}
                        >
                          &ldquo;{step.quote}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
    </section>
  )
}
