import { FadeIn } from './FadeIn'

const MODES = [
  {
    id: 'narration',
    label: 'Guided narration',
    tagline: 'Your city, as a story',
    description:
      'As you walk, the AI weaves together architecture, history, gossip, and folklore into a living narrative tied to exactly where you are. Not a tour script — a conversation.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7 3 3 6.5 3 11c0 2.4 1.1 4.6 2.9 6.1L5 21l4-1.5c1 .3 2 .5 3 .5 5 0 9-3.5 9-8s-4-9-9-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accent: '#fbbf24',
    glow: 'rgba(251,191,36,0.12)',
  },
  {
    id: 'whats-that',
    label: '"What\'s that?"',
    tagline: 'Point and ask anything',
    description:
      'See an interesting facade? A weird sculpture? An unmarked door? Ask driftd. It taps into visual context and local knowledge to tell you what no signpost ever would.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 18l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 8v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: '#e2714b',
    glow: 'rgba(226,113,75,0.12)',
  },
  {
    id: 'ambient',
    label: 'Ambient discovery',
    tagline: 'Let curiosity lead',
    description:
      'No destination, no checklist. driftd quietly monitors what\'s around you and nudges you when something worth knowing is nearby. Follow the nudge, or don\'t. That\'s the whole point.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    accent: '#d4a017',
    glow: 'rgba(212,160,23,0.12)',
  },
]

export default function AICompanion() {
  return (
    <section id="companion" className="relative py-28 md:py-36 bg-[#080808] overflow-hidden">
      {/* Background glow */}
      <div
        className="blob absolute opacity-15 pointer-events-none"
        style={{
          width: 600,
          height: 600,
          top: '10%',
          right: '-15%',
          background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
          filter: 'blur(120px)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">

          {/* Left: text */}
          <div className="lg:sticky lg:top-32">
            <FadeIn direction="left">
              <span className="text-xs tracking-widest uppercase text-amber-400/70 font-medium mb-4 block">
                The driftd companion
              </span>
              <div className="divider mb-6" />
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-white leading-tight mb-6">
                A companion,
                <br />
                not a{' '}
                <span className="italic gradient-text">guidebook</span>
              </h2>
              <p className="text-warm-gray-300 text-lg leading-relaxed mb-8 max-w-md">
                Most travel apps give you lists. driftd gives you a voice — one that knows
                the neighborhood, remembers what you've seen, and gets more interesting
                the further you wander.
              </p>

              {/* Premium badge */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-amber-400/15 bg-amber-400/5">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm text-warm-gray-200 font-medium">
                  driftd · Powered by real-time AI · No scripts
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Right: mode cards */}
          <div className="flex flex-col gap-5">
            {MODES.map((mode, i) => (
              <FadeIn key={mode.id} delay={i * 100} direction="right">
                <div
                  className="card-hover relative flex flex-col p-7 rounded-2xl border border-white/[0.07] bg-[#111] overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, #111111 0%, #0f0f0f 100%)`,
                  }}
                >
                  {/* Corner glow */}
                  <div
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-60"
                    style={{
                      background: `radial-gradient(circle, ${mode.accent}22 0%, transparent 70%)`,
                      filter: 'blur(20px)',
                    }}
                  />

                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4 relative z-10">
                    <div
                      className="flex-shrink-0 p-2.5 rounded-xl border"
                      style={{
                        color: mode.accent,
                        borderColor: `${mode.accent}25`,
                        background: `${mode.accent}10`,
                      }}
                    >
                      {mode.icon}
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase font-medium mb-0.5" style={{ color: mode.accent }}>
                        {mode.label}
                      </p>
                      <h3 className="font-display text-lg font-semibold text-warm-white">
                        {mode.tagline}
                      </h3>
                    </div>
                  </div>

                  <p className="text-warm-gray-300 text-sm leading-relaxed relative z-10">
                    {mode.description}
                  </p>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${mode.accent}30, transparent)`,
                    }}
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
