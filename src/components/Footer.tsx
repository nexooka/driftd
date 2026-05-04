'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

const SOCIAL = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10v7M7 7v.5M11 17v-4c0-1.5 1-2 2-2s2 .5 2 2v4M11 10v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function Footer() {
  const t = useTranslations('footer')
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setDone(true)
  }

  const navLinks = [
    { label: t('link0'), href: '#how-it-works' },
    { label: t('link1'), href: '#features' },
    { label: t('link2'), href: '#cities' },
    { label: t('link3'), href: '/about' },
    { label: t('link4'), href: 'mailto:press@driftd.world' },
    { label: t('link5'), href: 'mailto:hello@driftd.world' },
  ]

  return (
    <footer className="relative bg-[#050505] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-14">

          {/* Brand */}
          <div>
            <a href="/" className="font-display text-xl font-bold text-warm-white hover:text-amber-400 transition-colors block mb-3" style={{ letterSpacing: '0.05em' }}>
              driftd
            </a>
            <p className="text-warm-gray-300 text-sm leading-relaxed max-w-xs mb-6" style={{ fontWeight: 300 }}>{t('brand')}</p>
            <div className="flex gap-2.5">
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="w-9 h-9 rounded-lg border border-white/8 bg-white/[0.03] flex items-center justify-center text-warm-gray-300 hover:text-amber-400 hover:border-amber-400/25 transition-all duration-200">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray-400 font-medium mb-5">{t('navLabel')}</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-warm-gray-200 hover:text-warm-white transition-colors duration-200" style={{ fontWeight: 300 }}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-warm-gray-400 font-medium mb-5">{t('newsletterLabel')}</p>
            <p className="text-sm text-warm-gray-200 mb-4 leading-relaxed" style={{ fontWeight: 300 }}>{t('newsletterBody')}</p>
            {done ? (
              <p className="text-amber-400 text-sm font-medium">{t('subscribeDone')}</p>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-2.5">
                <input
                  type="email"
                  required
                  placeholder={t('newsletterPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3 text-warm-white placeholder-warm-gray-400 focus:border-amber-400/30 transition-all text-sm"
                />
                <button type="submit" className="btn-primary text-sm py-3 justify-center">{t('subscribe')}</button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-warm-gray-400">© {new Date().getFullYear()} driftd</p>
          <p className="text-xs text-warm-gray-400 italic tracking-wide">{t('tagline')}</p>
          <div className="flex gap-5">
            <a href="#" className="text-xs text-warm-gray-400 hover:text-warm-gray-200 transition-colors">{t('privacy')}</a>
            <a href="#" className="text-xs text-warm-gray-400 hover:text-warm-gray-200 transition-colors">{t('terms')}</a>
            <a href="mailto:hello@driftd.world" className="text-xs text-warm-gray-400 hover:text-warm-gray-200 transition-colors">hello@driftd.world</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
