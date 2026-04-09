'use client'

import { useEffect, useState } from 'react'

const CITIES = ['Warsaw', 'Kraków', 'Prague']

export default function HeroSection() {
  const [cityIdx, setCityIdx] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCityIdx((i) => (i + 1) % CITIES.length)
        setFading(false)
      }, 400)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden noise-overlay">
      {/* Background */}
      <div className="absolute inset-0 bg-[#070707]" />

      {/* Atmospheric blobs */}
      <div
        className="blob absolute opacity-25"
        style={{
          width: 700,
          height: 700,
          bottom: '-15%',
          left: '-10%',
          background: 'radial-gradient(circle, #e2714b 0%, transparent 70%)',
          filter: 'blur(120px)',
        }}
      />
      <div
        className="blob absolute opacity-20"
        style={{
          width: 500,
          height: 500,
          top: '-10%',
          right: '-5%',
          background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="blob absolute opacity-10"
        style={{
          width: 400,
          height: 400,
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 flex flex-col items-center text-center">
        {/* Cities pill */}
        <div
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-amber-400/25 bg-amber-400/5 mb-10"
          style={{ animationDelay: '0.1s' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" />
          <span className="text-xs font-medium tracking-widest text-amber-400/80 uppercase">
            Now exploring ·&nbsp;
            <span
              className="inline-block transition-opacity duration-300"
              style={{ opacity: fading ? 0 : 1, minWidth: 56 }}
            >
              {CITIES[cityIdx]}
            </span>
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display font-black leading-none tracking-tight text-warm-white"
          style={{
            fontSize: 'clamp(3.2rem, 10vw, 8rem)',
            textShadow: '0 0 80px rgba(251,191,36,0.08)',
          }}
        >
          Stop Following
          <br />
          <span className="gradient-text italic">the Crowd</span>
        </h1>

        {/* Subheadline */}
        <p
          className="mt-8 max-w-xl text-lg md:text-xl leading-relaxed text-warm-gray-300"
          style={{ fontWeight: 300 }}
        >
          driftd is an AI companion that whispers the city's secrets in your ear.
          No landmarks. No tourist traps.{' '}
          <span className="text-warm-white font-normal">Just the real city.</span>
        </p>

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <a href="#waitlist" className="btn-primary text-base px-10 py-4">
            Join the waitlist
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#how-it-works" className="btn-outline text-base px-10 py-4">
            See how it works
          </a>
        </div>

        {/* Free badge */}
        <p className="mt-6 text-sm text-warm-gray-400">
          Free for explorers · Cities pay us
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 animate-bounce-slow">
        <span className="text-xs tracking-widest text-warm-gray-400 uppercase">Scroll</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-warm-gray-400">
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}
