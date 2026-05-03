'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, Link } from '@/lib/navigation'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const t = useTranslations('nav')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { label: t('howItWorks'), href: '#how-it-works' as const },
    { label: t('forCities'), href: '#cities' as const },
    { label: t('about'), href: '/about' as const },
    { label: t('demo'), href: '/demo' as const },
  ]

  const handleWaitlist = (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === '/') {
      document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#waitlist'
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#070707]/90 backdrop-blur-md border-b border-white/[0.05]'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-18 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl font-bold text-warm-white hover:text-amber-400 transition-colors duration-200"
          style={{ letterSpacing: '0.05em' }}
        >
          driftd
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-warm-gray-300 hover:text-warm-white transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <LanguageSwitcher />
          <a href="#waitlist" onClick={handleWaitlist} className="btn-primary text-sm py-2.5 px-6 ml-2">
            {t('joinWaitlist')}
          </a>
        </div>

        {/* Mobile burger */}
        <div className="md:hidden flex items-center gap-4">
          <LanguageSwitcher />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-warm-white flex flex-col gap-[5px]"
            aria-label="menu"
          >
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        } bg-[#0d0d0d]/95 backdrop-blur-md border-b border-white/[0.05]`}
      >
        <div className="flex flex-col px-6 py-6 gap-5">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-warm-gray-200 hover:text-warm-white transition-colors text-sm"
            >
              {l.label}
            </a>
          ))}
          <a href="#waitlist" onClick={(e) => { setOpen(false); handleWaitlist(e) }} className="btn-primary text-center text-sm mt-1">
            {t('joinWaitlist')}
          </a>
        </div>
      </div>
    </header>
  )
}
