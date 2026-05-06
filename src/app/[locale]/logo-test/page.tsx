'use client'

const OPTIONS = [
  {
    id: 'A',
    label: 'current',
    note: 'no tilt — baseline',
    render: () => (
      <span className="font-display text-xl font-bold" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white">drift</span><span className="text-amber-400">d</span>
      </span>
    ),
  },
  {
    id: 'B',
    label: 'italic d',
    note: 'Playfair italic — natural elegant tilt',
    render: () => (
      <span className="font-display text-xl font-bold" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white">drift</span><span className="text-amber-400 italic">d</span>
      </span>
    ),
  },
  {
    id: 'C',
    label: 'italic d, heavier',
    note: 'italic + black weight for more presence',
    render: () => (
      <span className="font-display text-xl font-bold" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white">drift</span><span className="text-amber-400 italic font-black">d</span>
      </span>
    ),
  },
  {
    id: 'D',
    label: 'css skew',
    note: 'forced slant — more dramatic tilt',
    render: () => (
      <span className="font-display text-xl font-bold" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white">drift</span>
        <span className="text-amber-400 inline-block" style={{ transform: 'skewX(-12deg)', display: 'inline-block' }}>d</span>
      </span>
    ),
  },
  {
    id: 'E',
    label: 'italic d, slightly larger',
    note: 'tiny size bump makes it feel like a mark',
    render: () => (
      <span className="font-display font-bold" style={{ letterSpacing: '0.05em', fontSize: '1.25rem' }}>
        <span className="text-white">drift</span><span className="text-amber-400 italic font-black" style={{ fontSize: '1.45rem' }}>d</span>
      </span>
    ),
  },
]

export default function LogoTestPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-32">
      <div className="max-w-2xl mx-auto px-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium mb-3">logo options · tilted d</p>
        <h1 className="text-warm-white text-2xl font-bold mb-1">how tilted?</h1>
        <p className="text-warm-gray-400 text-sm mb-14">italic is a font thing · skew is a css thing · both tilt the d</p>

        <div className="flex flex-col gap-4">
          {OPTIONS.map(opt => (
            <div key={opt.id} className="flex items-center gap-6 px-6 py-5 rounded-2xl border border-white/[0.07] bg-[#0f0e0c]">
              <span className="font-display font-black text-amber-400/35 text-2xl w-5 shrink-0">{opt.id}</span>
              <div className="flex-1 flex items-center px-6 py-4 rounded-xl" style={{ background: '#070707' }}>
                {opt.render()}
              </div>
              <div className="w-44 shrink-0 text-right">
                <p className="text-warm-white text-sm font-medium">{opt.label}</p>
                <p className="text-warm-gray-500 text-[11px] mt-0.5 leading-relaxed">{opt.note}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-warm-gray-500 text-xs mt-12 text-center">temp page · not linked anywhere</p>
      </div>
    </main>
  )
}
