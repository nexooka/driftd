'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'

const FACTS = [
  { label: 'founded', value: '2026' },
  { label: 'category', value: 'AI travel' },
  { label: 'model', value: 'B2B2C — cities pay, tourists explore free' },
  { label: 'launching', value: 'Warsaw · Kraków · Prague · 2026' },
]

const BOILERPLATE = `driftd is an AI-powered city exploration platform that helps tourists discover hidden, off-the-beaten-path spots through personalized walking routes with an AI audio companion. on the B2B side, driftd helps cities and tourism boards redistribute foot traffic from overcrowded landmarks to undervisited neighborhoods. driftd is anti-tourist tourism — we help people explore like locals, not tourists.`

export default function PressPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end pb-20 md:pb-28 overflow-hidden noise-overlay pt-32">
        <div className="absolute inset-0 bg-[#070707]" />
        <div className="blob absolute opacity-12 pointer-events-none" style={{ width: 500, height: 500, top: '-15%', right: '-10%', background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(110px)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10">
          <FadeIn>
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-5">
              press & media
            </span>
            <div className="divider mb-6" />
            <h1 className="font-display font-black text-warm-white leading-[0.92] tracking-tight" style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}>
              media<br />
              <span className="italic gradient-text">resources</span>
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[#080808] py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-10">

          {/* Press contact */}
          <FadeIn className="mb-20">
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium block mb-4">press contact</span>
            <div className="divider mb-6" />
            <h2 className="font-display font-bold text-warm-white leading-tight mb-4" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
              get in touch
            </h2>
            <p className="text-warm-gray-300 text-lg leading-relaxed mb-6" style={{ fontWeight: 300 }}>
              for press inquiries, interview requests, and media assets — reach out directly.
            </p>
            <a
              href="mailto:press@driftd.world"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] text-amber-400 text-sm font-medium hover:bg-amber-400/[0.1] transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M1 4.5l6 3.5 6-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              press@driftd.world
            </a>
          </FadeIn>

          {/* Boilerplate */}
          <FadeIn delay={80} className="mb-20">
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium block mb-4">about driftd</span>
            <div className="divider mb-6" />
            <h2 className="font-display font-bold text-warm-white leading-tight mb-4" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
              boilerplate
            </h2>
            <div className="relative p-6 rounded-xl border border-white/[0.07] bg-[#0f0e0c]">
              <p className="text-warm-gray-200 text-base leading-relaxed italic" style={{ fontWeight: 300 }}>
                {BOILERPLATE}
              </p>
              <button
                onClick={() => navigator.clipboard?.writeText(BOILERPLATE)}
                className="mt-4 text-[11px] text-warm-gray-400 hover:text-amber-400 transition-colors tracking-wide"
              >
                copy text ↗
              </button>
            </div>
          </FadeIn>

          {/* Fast facts */}
          <FadeIn delay={160} className="mb-20">
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium block mb-4">fast facts</span>
            <div className="divider mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FACTS.map((f) => (
                <div key={f.label} className="p-5 rounded-xl border border-white/[0.07] bg-[#0f0e0c]">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-warm-gray-400 mb-1">{f.label}</p>
                  <p className="text-warm-white text-sm font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Brand assets */}
          <FadeIn delay={240}>
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium block mb-4">brand assets</span>
            <div className="divider mb-6" />
            <h2 className="font-display font-bold text-warm-white leading-tight mb-4" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}>
              logos & guidelines
            </h2>
            <p className="text-warm-gray-300 text-lg leading-relaxed mb-6" style={{ fontWeight: 300 }}>
              logos, screenshots, and brand guidelines are available on request. drop us an email and we'll send over a press kit within 24 hours.
            </p>
            <a href="mailto:press@driftd.world" className="text-amber-400/80 hover:text-amber-400 transition-colors text-sm">
              request press kit →
            </a>
          </FadeIn>

        </div>
      </section>

      <Footer />
    </main>
  )
}
