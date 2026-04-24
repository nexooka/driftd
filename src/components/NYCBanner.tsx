'use client'

import { useState } from 'react'

export default function NYCBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="relative z-40 bg-amber-400 text-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 flex items-center justify-center gap-3 text-sm font-semibold">
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a] animate-pulse-slow shrink-0" />
        </span>
        <p className="text-center leading-snug">
          <span className="font-black tracking-tight">new york city</span>
          {' '}is coming to driftd —{' '}
          <span className="opacity-75">anti-tourist routes through Brooklyn, Queens & beyond.</span>
          {' '}
          <a href="#waitlist" className="underline underline-offset-2 hover:opacity-75 transition-opacity font-bold whitespace-nowrap">
            get early access →
          </a>
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 md:right-10 shrink-0 opacity-50 hover:opacity-100 transition-opacity p-1"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
