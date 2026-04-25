'use client'

import { useState } from 'react'
import { FadeIn } from './FadeIn'

const ITEMS = [
  {
    assumption: "it's just Google Maps.",
    answer: "Google Maps wants you to find things. we want you to find things you didn't know you were looking for.",
  },
  {
    assumption: "is it safe?",
    answer: "safer than following a tour group into a restaurant with photos on the menu.",
  },
  {
    assumption: "isn't this just a travel blog?",
    answer: "travel blogs are written by people who got paid to be there. driftd is built by people who got tired of those blogs.",
  },
  {
    assumption: "what if the places are closed?",
    answer: "most of our best stops don't have opening hours.",
  },
  {
    assumption: "is it for tourists?",
    answer: "it's for anyone who thinks the version of a city in a guidebook is a lie.",
  },
  {
    assumption: "what if i don't speak the language?",
    answer: "the best discoveries happen before you figure out what to say.",
  },
]

export default function AntiFaq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="relative py-24 md:py-32 bg-[#0a0a0a]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-3xl mx-auto px-6 md:px-10">
        <FadeIn>
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-warm-gray-500 mb-5">
            things people assume
          </p>
          <h2
            className="font-display font-extrabold text-warm-white leading-[0.9] tracking-tight uppercase mb-14"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}
          >
            go on, we&apos;ve{' '}
            <span className="font-serif font-light italic normal-case text-amber-400" style={{ fontSize: '1.05em' }}>heard them all.</span>
          </h2>
        </FadeIn>

        <div className="space-y-px">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <FadeIn key={i} delay={i * 60}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left group"
                >
                  <div className={`
                    flex items-start justify-between gap-6 py-6
                    border-b transition-colors duration-200
                    ${isOpen ? 'border-amber-400/20' : 'border-white/[0.06] hover:border-white/[0.12]'}
                  `}>
                    <div className="flex-1">
                      <p className={`
                        font-medium text-base md:text-lg transition-colors duration-200
                        ${isOpen ? 'text-amber-400' : 'text-warm-gray-300 group-hover:text-warm-white'}
                      `}>
                        &ldquo;{item.assumption}&rdquo;
                      </p>
                      <div
                        className="overflow-hidden transition-all duration-300 ease-out"
                        style={{ maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0 }}
                      >
                        <p className="text-warm-gray-400 text-sm md:text-base leading-relaxed pt-3" style={{ fontWeight: 300 }}>
                          {item.answer}
                        </p>
                      </div>
                    </div>
                    <div className={`
                      shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5
                      transition-all duration-200
                      ${isOpen
                        ? 'border-amber-400/40 bg-amber-400/10'
                        : 'border-white/15 group-hover:border-white/30'}
                    `}>
                      <svg
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                      >
                        <path d="M5 1v8M1 5h8" stroke={isOpen ? '#fbbf24' : 'currentColor'} strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </button>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
