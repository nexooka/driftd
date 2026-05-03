'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/lib/navigation'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const toggle = () => {
    const next = locale === 'en' ? 'pl' : 'en'
    router.replace(pathname, { locale: next })
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="flex items-center gap-1 text-[11px] font-medium tracking-widest transition-colors duration-200 text-warm-gray-400 hover:text-warm-white"
    >
      <span className={locale === 'en' ? 'text-amber-400' : ''}>EN</span>
      <span className="opacity-30">/</span>
      <span className={locale === 'pl' ? 'text-amber-400' : ''}>PL</span>
    </button>
  )
}
