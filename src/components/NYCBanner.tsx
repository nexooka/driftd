'use client'

import { useState } from 'react'

export default function NYCBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <>
      {/* Fixed strip pinned directly below the fixed navbar (top-16 = 64px) */}
      <div
        className="fixed left-0 right-0 z-40 bg-amber-400 text-[#0a0a0a]"
        style={{ top: 64 }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-2.5 flex items-center justify-center relative">
          <p className="text-center text-sm font-semibold leading-snug pr-8">
            <span className="font-black tracking-tight">new york city</span>
            {' '}is coming to driftd —{' '}
            <span className="opacity-70">anti-tourist routes through brooklyn, queens &amp; beyond.</span>
            {' '}
            <a
              href="/#waitlist"
              className="underline underline-offset-2 hover:opacity-70 transition-opacity font-bold whitespace-nowrap"
            >
              get early access →
            </a>
          </p>
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-4 md:right-10 opacity-50 hover:opacity-100 transition-opacity p-1"
            aria-label="dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Spacer — pushes page content below the fixed banner */}
      <div style={{ height: 44 }} />
    </>
  )
}
