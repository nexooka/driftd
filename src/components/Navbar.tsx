'use client'

import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#070707]/90 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="font-display text-2xl font-bold tracking-widest text-warm-white hover:text-amber-400 transition-colors duration-200"
          style={{ letterSpacing: '0.2em' }}
        >
          DRIFT
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-warm-gray-300 hover:text-warm-white transition-colors duration-200">
            How it works
          </a>
          <a href="#companion" className="text-sm text-warm-gray-300 hover:text-warm-white transition-colors duration-200">
            The companion
          </a>
          <a href="#cities" className="text-sm text-warm-gray-300 hover:text-warm-white transition-colors duration-200">
            For cities
          </a>
          <a href="#waitlist" className="btn-primary text-sm py-2.5 px-6">
            Join the waitlist
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 text-warm-white"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        } bg-[#0e0e0e]/95 backdrop-blur-md border-b border-white/5`}
      >
        <div className="flex flex-col px-6 py-6 gap-5">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-warm-gray-200 hover:text-warm-white transition-colors">How it works</a>
          <a href="#companion"    onClick={() => setMenuOpen(false)} className="text-warm-gray-200 hover:text-warm-white transition-colors">The companion</a>
          <a href="#cities"       onClick={() => setMenuOpen(false)} className="text-warm-gray-200 hover:text-warm-white transition-colors">For cities</a>
          <a href="#waitlist"     onClick={() => setMenuOpen(false)} className="btn-primary text-center mt-2">
            Join the waitlist
          </a>
        </div>
      </div>
    </header>
  )
}
