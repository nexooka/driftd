'use client'

const EXTRA_FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Space+Grotesk:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=Raleway:wght@200;300;400&family=Josefin+Sans:wght@100;200;300&display=swap');
`

// The 'd' is fixed: Playfair italic black amber
const D = () => (
  <span className="text-amber-400 font-display font-black italic" style={{ letterSpacing: 0 }}>d</span>
)

const OPTIONS = [
  {
    id: 'A',
    label: 'DM Sans regular',
    note: 'clean, modern sans',
    render: () => (
      <span className="text-xl">
        <span className="text-white font-medium" style={{ fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.07em' }}>drift</span><D />
      </span>
    ),
  },
  {
    id: 'B',
    label: 'DM Sans light',
    note: 'thin sans — more delicate',
    render: () => (
      <span className="text-xl">
        <span className="text-white/80 font-light" style={{ fontFamily: 'var(--font-dm-sans)', letterSpacing: '0.1em' }}>drift</span><D />
      </span>
    ),
  },
  {
    id: 'C',
    label: 'Space Grotesk light',
    note: 'geometric, editorial spacing',
    render: () => (
      <span className="text-xl">
        <span className="text-white" style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 300, letterSpacing: '0.1em' }}>drift</span><D />
      </span>
    ),
  },
  {
    id: 'D',
    label: 'Cormorant upright',
    note: 'elegant thin serif, same family vibe as d',
    render: () => (
      <span style={{ fontSize: '1.35rem' }}>
        <span className="text-white" style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, letterSpacing: '0.08em' }}>drift</span><D />
      </span>
    ),
  },
  {
    id: 'E',
    label: 'Cormorant italic',
    note: 'both italic — unified but d still pops',
    render: () => (
      <span style={{ fontSize: '1.35rem' }}>
        <span className="text-white/80" style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.06em' }}>drift</span><D />
      </span>
    ),
  },
  {
    id: 'F',
    label: 'Instrument Serif upright',
    note: 'same family as d but upright vs italic',
    render: () => (
      <span style={{ fontSize: '1.3rem' }}>
        <span className="text-white" style={{ fontFamily: '"Instrument Serif", serif', fontWeight: 400, letterSpacing: '0.06em' }}>drift</span><D />
      </span>
    ),
  },
  {
    id: 'G',
    label: 'Raleway thin',
    note: 'ultra-light geometric caps feel',
    render: () => (
      <span className="text-xl">
        <span className="text-white/75" style={{ fontFamily: '"Raleway", sans-serif', fontWeight: 200, letterSpacing: '0.18em' }}>drift</span><D />
      </span>
    ),
  },
  {
    id: 'H',
    label: 'Josefin Sans thin',
    note: 'geometric, slightly retro, lots of air',
    render: () => (
      <span className="text-xl">
        <span className="text-white/80" style={{ fontFamily: '"Josefin Sans", sans-serif', fontWeight: 100, letterSpacing: '0.2em' }}>drift</span><D />
      </span>
    ),
  },
]

export default function LogoTestPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20 pb-32">
      <style>{EXTRA_FONTS}</style>
      <div className="max-w-2xl mx-auto px-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium mb-3">logo options · drift font</p>
        <h1 className="text-warm-white text-2xl font-bold mb-1">pick a style for <span className="italic text-warm-gray-400">drift</span></h1>
        <p className="text-warm-gray-400 text-sm mb-2">the <span className="font-display font-black italic text-amber-400 text-base">d</span> is locked in — Playfair italic black amber.</p>
        <p className="text-warm-gray-500 text-sm mb-14">now choosing the font for <span className="text-warm-gray-300">drift</span> ↓</p>

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
