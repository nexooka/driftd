'use client'

// Two fonts loaded for this page only (not affecting the rest of the site)
const EXTRA_FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Space+Grotesk:wght@300;400;700&family=Instrument+Serif:ital@0;1&display=swap');
`

const OPTIONS = [
  {
    id: 'A',
    label: 'current baseline',
    note: 'drift Playfair · d Playfair amber',
    render: () => (
      <span className="font-display text-xl font-bold" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white">drift</span><span className="text-amber-400">d</span>
      </span>
    ),
  },
  {
    id: 'B',
    label: 'sans + serif split',
    note: 'drift DM Sans · d Playfair italic amber',
    render: () => (
      <span className="text-xl font-bold" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, letterSpacing: '0.06em' }}>drift</span>
        <span className="text-amber-400 font-display italic font-black" style={{ letterSpacing: 0 }}>d</span>
      </span>
    ),
  },
  {
    id: 'C',
    label: 'serif + sans split',
    note: 'drift Playfair · d DM Sans bold amber',
    render: () => (
      <span className="text-xl" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white font-display font-bold">drift</span>
        <span className="text-amber-400 font-bold" style={{ fontFamily: 'var(--font-dm-sans)', letterSpacing: 0, fontWeight: 700 }}>d</span>
      </span>
    ),
  },
  {
    id: 'D',
    label: 'Cormorant drift',
    note: 'drift Cormorant italic · d DM Sans amber',
    render: () => (
      <span className="text-xl" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white" style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 600, fontSize: '1.35rem' }}>drift</span>
        <span className="text-amber-400 font-bold" style={{ fontFamily: 'var(--font-dm-sans)', letterSpacing: 0 }}>d</span>
      </span>
    ),
  },
  {
    id: 'E',
    label: 'Space Grotesk drift',
    note: 'drift Space Grotesk · d Playfair italic amber',
    render: () => (
      <span className="text-xl" style={{ letterSpacing: '0.04em' }}>
        <span className="text-white" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 300, letterSpacing: '0.08em' }}>drift</span>
        <span className="text-amber-400 font-display font-black italic" style={{ letterSpacing: 0 }}>d</span>
      </span>
    ),
  },
  {
    id: 'F',
    label: 'Instrument Serif drift',
    note: 'drift Instrument Serif italic · d DM Sans amber',
    render: () => (
      <span className="text-xl" style={{ letterSpacing: '0.04em' }}>
        <span className="text-white" style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontWeight: 400, fontSize: '1.35rem' }}>drift</span>
        <span className="text-amber-400 font-bold" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, letterSpacing: 0 }}>d</span>
      </span>
    ),
  },
  {
    id: 'G',
    label: 'Cormorant + Playfair',
    note: 'drift Cormorant thin · d Playfair italic amber',
    render: () => (
      <span className="text-xl" style={{ letterSpacing: '0.05em' }}>
        <span className="text-white/85" style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: '1.4rem', letterSpacing: '0.08em' }}>drift</span>
        <span className="text-amber-400 font-display font-black italic" style={{ letterSpacing: 0, fontSize: '1.2rem' }}>d</span>
      </span>
    ),
  },
]

export default function LogoTestPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-32">
      <style>{EXTRA_FONTS}</style>
      <div className="max-w-2xl mx-auto px-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium mb-3">logo options · font mixing</p>
        <h1 className="text-warm-white text-2xl font-bold mb-1">pick your favourite</h1>
        <p className="text-warm-gray-400 text-sm mb-16">all shown at exact navbar size · tell me the letter</p>

        <div className="flex flex-col gap-4">
          {OPTIONS.map(opt => (
            <div
              key={opt.id}
              className="flex items-center gap-6 px-6 py-5 rounded-2xl border border-white/[0.07] bg-[#0f0e0c]"
            >
              <span className="font-display font-black text-amber-400/35 text-2xl w-5 shrink-0">{opt.id}</span>

              <div className="flex-1 flex items-center px-6 py-4 rounded-xl" style={{ background: '#070707' }}>
                {opt.render()}
              </div>

              <div className="w-48 shrink-0 text-right">
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
