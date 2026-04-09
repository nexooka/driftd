'use client'

import { useState } from 'react'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'The companion', href: '#companion' },
  { label: 'For cities', href: '#cities' },
  { label: 'About', href: '/about' },
  { label: 'Press', href: 'mailto:press@drift.app' },
  { label: 'Careers', href: 'mailto:hello@drift.app' },
]

const SOCIAL = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setDone(true)
  }

  return (
    <footer className="relative bg-[#050505] border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-14">

          {/* Brand */}
          <div>
            <a
              href="/"
              className="font-display text-2xl font-bold text-warm-white tracking-widest block mb-4 hover:text-amber-400 transition-colors"
              style={{ letterSpacing: '0.2em' }}
            >
              DRIFT
            </a>
            <p className="text-warm-gray-400 text-sm leading-relaxed max-w-xs">
              Explore cities like they were meant to be explored. Anti-tourist tourism, powered by AI.
            </p>
            <div className="flex gap-3 mt-6">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg border border-white/8 bg-white/4 flex items-center justify-center text-warm-gray-400 hover:text-amber-400 hover:border-amber-400/30 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs tracking-widest uppercase text-warm-gray-400 font-medium mb-5">
              Navigate
            </p>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-warm-gray-300 hover:text-warm-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Email signup */}
          <div>
            <p className="text-xs tracking-widest uppercase text-warm-gray-400 font-medium mb-5">
              Stay in the loop
            </p>
            <p className="text-sm text-warm-gray-300 mb-4 leading-relaxed">
              City launches, feature drops, and the occasional interesting thing we noticed while wandering.
            </p>
            {done ? (
              <p className="text-amber-400 text-sm font-medium">You're in. ✓</p>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-warm-white placeholder-warm-gray-500 focus:outline-none focus:border-amber-400/30 transition-all text-sm"
                />
                <button
                  type="submit"
                  className="btn-primary text-sm py-3 justify-center"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-warm-gray-500">
            © {new Date().getFullYear()} Drift. Built for the curious.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-warm-gray-500 hover:text-warm-gray-300 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-warm-gray-500 hover:text-warm-gray-300 transition-colors">Terms</a>
            <a href="mailto:hello@drift.app" className="text-xs text-warm-gray-500 hover:text-warm-gray-300 transition-colors">hello@drift.app</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
