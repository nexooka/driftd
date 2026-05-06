'use client'

const OPTIONS = [
  {
    id: 'A',
    label: 'current — amber d',
    note: 'what you have now',
    render: () => (
      <span className="font-display text-xl font-bold" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white">drift</span><span className="text-amber-400">d</span>
      </span>
    ),
  },
  {
    id: 'B',
    label: 'weight contrast',
    note: 'drift thin · d heavy amber',
    render: () => (
      <span className="font-display text-xl" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white/70 font-light">drift</span><span className="text-amber-400 font-black">d</span>
      </span>
    ),
  },
  {
    id: 'C',
    label: 'full gradient',
    note: 'warm white fading to amber',
    render: () => (
      <span
        className="font-display text-xl font-bold"
        style={{
          letterSpacing: '0.05em',
          background: 'linear-gradient(90deg, #f5f0e8 40%, #fbbf24 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        driftd
      </span>
    ),
  },
  {
    id: 'D',
    label: 'slash separator',
    note: 'drift / d with amber slash',
    render: () => (
      <span className="font-display text-xl font-bold" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white">drift</span>
        <span className="text-amber-400/50 font-light mx-0.5" style={{ letterSpacing: 0 }}>/</span>
        <span className="text-amber-400">d</span>
      </span>
    ),
  },
  {
    id: 'E',
    label: 'dot accent',
    note: 'amber dot beneath the d',
    render: () => (
      <span className="font-display text-xl font-bold relative" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white">drift</span>
        <span className="relative inline-block">
          <span className="text-white">d</span>
          <span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 block" />
        </span>
      </span>
    ),
  },
  {
    id: 'F',
    label: 'wide + amber d',
    note: 'more spacing, bolder presence',
    render: () => (
      <span className="font-display text-xl font-bold" style={{ letterSpacing: '0.12em' }}>
        <span className="text-white">drift</span><span className="text-amber-400">d</span>
      </span>
    ),
  },
]

export default function LogoTestPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-32">
      <div className="max-w-2xl mx-auto px-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium mb-3">logo options</p>
        <h1 className="text-warm-white text-2xl font-bold mb-1">pick your favourite</h1>
        <p className="text-warm-gray-400 text-sm mb-16">all shown at exact navbar size — tell me the letter and i'll set it live.</p>

        <div className="flex flex-col gap-5">
          {OPTIONS.map(opt => (
            <div
              key={opt.id}
              className="flex items-center gap-8 px-8 py-6 rounded-2xl border border-white/[0.07] bg-[#0f0e0c]"
            >
              {/* Letter */}
              <span className="font-display font-black text-amber-400/40 text-3xl w-6 shrink-0">{opt.id}</span>

              {/* Logo preview — dark bar simulating navbar */}
              <div className="flex-1 flex items-center px-6 py-4 rounded-xl" style={{ background: '#070707' }}>
                {opt.render()}
              </div>

              {/* Description */}
              <div className="w-44 shrink-0 text-right">
                <p className="text-warm-white text-sm font-medium">{opt.label}</p>
                <p className="text-warm-gray-500 text-xs mt-0.5">{opt.note}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-warm-gray-500 text-xs mt-12 text-center">this page is not linked anywhere — delete it once you've decided.</p>
      </div>
    </main>
  )
}
