'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'

const LAST_UPDATED = 'May 2026'

const SECTIONS = [
  {
    title: 'what we collect',
    body: [
      'When you join the waitlist, we collect your email address. That\'s it.',
      'When you use the demo to generate a route, we process your inputs (city, vibe, time budget) to create a route. If you choose to send the route to your email, we collect that address to send the email — we don\'t store it after delivery.',
      'We do not collect your name, location, payment information, or any other personal data at this stage.',
    ],
  },
  {
    title: 'how we use it',
    body: [
      'Waitlist emails are used only to notify you when driftd launches in your city. We will not send marketing emails, sell your address, or share it with third parties.',
      'Route generation inputs are sent to our AI provider (Anthropic) to generate your route. No identifying information is attached.',
      'Email addresses provided for route delivery are used solely to send that one email via Resend, our transactional email provider.',
    ],
  },
  {
    title: 'third-party services',
    body: [
      'We use the following services to operate driftd: Vercel (hosting), Anthropic (AI route generation), Google Maps (walking directions), Resend (email delivery), and Leaflet with CartoDB tiles (maps).',
      'Each provider has their own privacy policy. We share only the minimum data required for each service to function.',
    ],
  },
  {
    title: 'cookies & tracking',
    body: [
      'We don\'t use advertising cookies, tracking pixels, or analytics tools that follow you across the web.',
      'Your city/vibe/time preferences are stored in your browser\'s sessionStorage so the form remembers your last inputs. This data never leaves your device.',
    ],
  },
  {
    title: 'data retention',
    body: [
      'Waitlist email addresses are retained until you unsubscribe or ask us to delete them.',
      'Route inputs and generated routes are not stored on our servers.',
      'To remove your email from our waitlist, write to hello@driftd.world and we\'ll delete it within 48 hours.',
    ],
  },
  {
    title: 'your rights',
    body: [
      'You have the right to access, correct, or delete any personal data we hold about you. You also have the right to object to processing or request data portability.',
      'To exercise any of these rights, email hello@driftd.world. We\'ll respond within 30 days.',
    ],
  },
  {
    title: 'changes to this policy',
    body: [
      'If we make material changes to this policy, we\'ll update the date at the top of this page. For significant changes that affect waitlist subscribers, we\'ll send an email notice.',
    ],
  },
  {
    title: 'contact',
    body: [
      'Questions about privacy? Email us at hello@driftd.world. We\'re a small team and we read everything.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-end pb-16 md:pb-20 overflow-hidden noise-overlay pt-32">
        <div className="absolute inset-0 bg-[#070707]" />
        <div className="blob absolute opacity-10 pointer-events-none" style={{ width: 400, height: 400, top: '-10%', right: '-5%', background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-10 w-full">
          <FadeIn>
            <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400/70 font-medium block mb-5">legal</span>
            <div className="divider mb-6" />
            <h1 className="font-display font-black text-warm-white leading-[0.92] tracking-tight" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
              privacy<br />
              <span className="italic gradient-text">policy</span>
            </h1>
            <p className="text-warm-gray-400 text-sm mt-5">last updated: {LAST_UPDATED}</p>
          </FadeIn>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[#080808] py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <FadeIn className="mb-12">
            <p className="text-warm-gray-200 text-lg leading-relaxed" style={{ fontWeight: 300 }}>
              driftd is built on the belief that your city walk should feel free — not surveilled. we collect as little data as possible and we're transparent about all of it.
            </p>
          </FadeIn>

          <div className="flex flex-col gap-12">
            {SECTIONS.map((s, i) => (
              <FadeIn key={s.title} delay={i * 40}>
                <div className="border-l-2 border-amber-400/15 pl-6">
                  <h2 className="text-base font-semibold text-warm-white mb-4 tracking-wide">{s.title}</h2>
                  <div className="flex flex-col gap-3">
                    {s.body.map((para, j) => (
                      <p key={j} className="text-warm-gray-300 text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
