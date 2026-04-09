import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'

export const metadata: Metadata = {
  title: 'about',
  description: 'The story behind driftd — why we built it, who built it, and where we\'re going.',
}

const SECTIONS = [
  {
    label: 'the problem',
    heading: 'tourism is broken.',
    body: [
      '73% of visitors in major cities never leave the main tourist corridor. local neighborhoods that want visitors get none. overcrowded landmarks get worse every year.',
      'cities are desperate for solutions — imposing entry fees, running "don\'t visit" campaigns, raising tourist taxes. we think there\'s a better way.',
    ],
  },
  {
    label: 'the solution',
    heading: 'better experiences for everyone.',
    body: [
      'driftd uses AI to redistribute tourist foot traffic from overcrowded landmarks to undervisited neighborhoods.',
      'tourists get a better experience. local businesses get customers. cities get relief. everyone wins.',
    ],
  },
  {
    label: 'the founder',
    heading: 'built by someone who got lost on purpose.',
    body: [
      'built by dawid — a yale student studying cognitive science and economics, with experience in investment banking and public policy.',
      'driftd combines a background in decision science with a belief that cities are best experienced without a plan.',
    ],
  },
  {
    label: 'the vision',
    heading: 'infrastructure for the age of AI tourism.',
    body: [
      'we\'re starting with three cities. but driftd isn\'t just a travel app — it\'s infrastructure for how cities manage tourism in the age of AI.',
      'we\'re building the demand-shaping layer between tourists and the places they visit. starting small. thinking big.',
    ],
  },
]

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end pb-20 md:pb-28 overflow-hidden noise-overlay pt-32">
        <div className="absolute inset-0 bg-[#070707]" />
        <div
          className="blob absolute opacity-15 pointer-events-none"
          style={{
            width: 600,
            height: 600,
            top: '-10%',
            right: '-10%',
            background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
            filter: 'blur(110px)',
          }}
        />
        <div
          className="blob absolute opacity-10 pointer-events-none"
          style={{
            width: 400,
            height: 400,
            bottom: '-5%',
            left: '-5%',
            background: 'radial-gradient(circle, #e2714b 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10">
          <FadeIn>
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-5">
              our story
            </span>
            <div className="divider mb-6" />
            <h1
              className="font-display font-black text-warm-white leading-[0.92] tracking-tight"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}
            >
              the story behind
              <br />
              <span className="italic gradient-text">driftd.</span>
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[#080808] py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          {SECTIONS.map((section, i) => (
            <FadeIn key={section.label} delay={i * 80} className="mb-20 md:mb-24">
              <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/60 font-medium block mb-4">
                {section.label}
              </span>
              <div className="divider mb-5" />
              <h2
                className="font-display font-bold text-warm-white leading-tight mb-6"
                style={{ fontSize: 'clamp(1.7rem, 4vw, 2.8rem)' }}
              >
                {section.heading}
              </h2>
              {section.body.map((para, j) => (
                <p
                  key={j}
                  className="text-warm-gray-300 text-lg leading-relaxed mb-4"
                  style={{ fontWeight: 300 }}
                >
                  {para}
                </p>
              ))}
            </FadeIn>
          ))}

          {/* CTA */}
          <FadeIn className="border-t border-white/[0.06] pt-16 text-center">
            <p
              className="font-display font-bold text-warm-white mb-4"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}
            >
              curious to see the real city?
            </p>
            <p className="text-warm-gray-300 mb-8 text-lg" style={{ fontWeight: 300 }}>
              join the waitlist and be first to explore when we launch.
            </p>
            <a href="/#waitlist" className="btn-primary text-sm px-10 py-4">
              join the waitlist
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <p className="mt-4 text-xs text-warm-gray-500">launching summer 2026 in warsaw, berlin & prague</p>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  )
}
