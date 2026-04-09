import { FadeIn } from './FadeIn'

const STEPS = [
  {
    number: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2.5" />
        <circle cx="14" cy="14" r="5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14" cy="14" r="1.5" fill="currentColor" />
      </svg>
    ),
    title: 'pick your vibe',
    description: 'tell driftd how you\'re feeling today — and how long you have.',
    detail: 'every route is unique. generated in seconds. never the same twice.',
    tags: ['artsy', 'historic', 'foodie', 'nightlife', 'sketchy-but-cool', 'chill', 'romantic'],
    quote: null,
  },
  {
    number: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M7 9a7 7 0 0 1 14 0v5a7 7 0 0 1-14 0V9Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M14 21v4M11 25h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="14" cy="12" r="1.5" fill="currentColor" opacity="0.7" />
        <path d="M11.5 16s.8 1.5 2.5 1.5 2.5-1.5 2.5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: 'put in your headphones',
    description: 'driftd becomes your AI audio companion — it narrates your walk with stories, history, and secrets.',
    detail: null,
    tags: null,
    quote: 'like having a friend who grew up here whispering in your ear',
  },
  {
    number: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C8.5 4 4 8.5 4 14c0 7 10 12 10 12s10-5 10-12c0-5.5-4.5-10-10-10Z" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M14 10V8M19 14h2M14 18v2M9 14H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: 'just walk',
    description: 'no staring at your phone. no following arrows. driftd guides by voice and nudges you when something cool is nearby.',
    detail: null,
    tags: null,
    quote: "you didn't follow a route. you drifted.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 md:py-36 bg-[#0c0c0c]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <FadeIn className="mb-20">
          <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-4">
            how driftd works
          </span>
          <div className="divider mb-5" />
          <h2 className="font-display font-bold text-warm-white leading-tight"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}>
            three ways to{' '}
            <span className="italic gradient-text">drift</span>
          </h2>
        </FadeIn>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 110}>
              <div className="card-hover group relative flex flex-col h-full p-8 md:p-9 rounded-2xl border border-white/[0.06] bg-[#111]">

                {/* Big number */}
                <div
                  className="font-display font-black leading-none mb-6 opacity-30"
                  style={{
                    fontSize: 'clamp(4rem, 8vw, 5.5rem)',
                    background: 'linear-gradient(135deg, #fbbf24, #e2714b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-amber-400 mb-5 transition-transform duration-300 group-hover:scale-110 origin-left">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="font-display text-xl md:text-2xl font-bold text-warm-white mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-warm-gray-300 text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Tags (step 1) */}
                {step.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {step.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] border border-amber-400/15 bg-amber-400/5 text-amber-400/75 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Detail */}
                {step.detail && (
                  <p className="text-warm-gray-400 text-xs italic mt-auto">
                    &ldquo;{step.detail}&rdquo;
                  </p>
                )}

                {/* Quote (steps 2 & 3) */}
                {step.quote && (
                  <p className="text-amber-400/70 text-xs italic mt-auto border-t border-white/[0.05] pt-4">
                    &ldquo;{step.quote}&rdquo;
                  </p>
                )}

                {/* Bottom glow on hover */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/25 transition-all duration-500" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#080808] to-transparent" />
    </section>
  )
}
