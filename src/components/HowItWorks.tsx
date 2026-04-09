import { FadeIn } from './FadeIn'

const VIBES = ['artsy', 'historic', 'foodie', 'sketchy-but-cool', 'chill']

const STEPS = [
  {
    number: '01',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="16" cy="16" r="6" fill="currentColor" opacity="0.2" />
        <path d="M10 16a6 6 0 0 1 6-6M16 22a6 6 0 0 1-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
    title: 'Pick your vibe',
    description:
      'Tell driftd what kind of explorer you are today. We\'ll shape your route around your mood, not around what TripAdvisor thinks is important.',
    extra: (
      <div className="flex flex-wrap gap-2 mt-4">
        {VIBES.map((v) => (
          <span
            key={v}
            className="px-3 py-1 rounded-full text-xs border border-amber-400/20 bg-amber-400/5 text-amber-400/80 font-medium"
          >
            {v}
          </span>
        ))}
      </div>
    ),
  },
  {
    number: '02',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M8 10a8 8 0 0 1 16 0v6a8 8 0 0 1-16 0v-6Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 24v4M12 28h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="13" r="2" fill="currentColor" opacity="0.6" />
        <path d="M13 17c0 0 1 1.5 3 1.5s3-1.5 3-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Put in your headphones',
    description:
      'Launch driftd, slip in your earbuds, and let the AI companion take over. It speaks as you walk — not a list of facts, but actual stories.',
    extra: null,
  },
  {
    number: '03',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4C10 4 5 9 5 15c0 8 11 13 11 13s11-5 11-13c0-6-5-11-11-11Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="15" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 11V9M21 15h2M16 19v2M11 15H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'driftd',
    description:
      'Walk. Discover. Ask questions about that strange building. Let yourself get a little lost. This is how the city actually wants to be seen.',
    extra: null,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 md:py-36 bg-[#0c0c0c]">
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section header */}
        <FadeIn className="mb-20 md:mb-24">
          <div className="flex flex-col items-start">
            <span className="text-xs tracking-widest uppercase text-amber-400/70 font-medium mb-4">
              How driftd works
            </span>
            <div className="divider mb-6" />
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white leading-tight max-w-lg">
              Three steps to <span className="italic text-amber-400">actually</span> seeing a city
            </h2>
          </div>
        </FadeIn>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 120}>
              <div className="card-hover group relative flex flex-col h-full p-8 md:p-10 rounded-2xl border border-white/[0.06] bg-[#111111]">
                {/* Number */}
                <span
                  className="font-display text-6xl md:text-7xl font-black leading-none mb-6 gradient-text opacity-40"
                  style={{ WebkitTextStroke: '1px rgba(251,191,36,0.2)' }}
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div className="text-amber-400 mb-5 transition-transform duration-300 group-hover:scale-110 origin-left">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="font-display text-xl md:text-2xl font-semibold text-warm-white mb-3">
                  {step.title}
                </h3>
                <p className="text-warm-gray-300 leading-relaxed text-sm md:text-base">
                  {step.description}
                </p>

                {step.extra}

                {/* Bottom glow line on hover */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400/30 transition-all duration-500" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#080808] to-transparent" />
    </section>
  )
}
