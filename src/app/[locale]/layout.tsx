import type { Metadata } from 'next'
import { Playfair_Display, Space_Grotesk } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import CursorTrail from '@/components/CursorTrail'
import '../globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const SITE_URL = 'https://driftd.world'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'driftd — the city has secrets. we help you hear them.',
    template: '%s | driftd',
  },
  description:
    'AI-powered city exploration. driftd generates unique walking routes and narrates your journey through hidden streets, local spots, and stories guidebooks miss.',
  keywords: ['city exploration', 'AI travel', 'walking routes', 'local travel', 'audio guide', 'hidden spots'],
  authors: [{ name: 'driftd', url: SITE_URL }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'driftd — the city has secrets. we help you hear them.',
    description:
      'AI-powered city exploration. driftd generates unique walking routes and narrates your journey through hidden streets, local spots, and stories guidebooks miss.',
    siteName: 'driftd',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'driftd — explore cities like a local' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'driftd — the city has secrets. we help you hear them.',
    description: 'AI-powered city exploration for the curious traveller.',
    images: ['/og-image.png'],
  },
  icons: {
    apple: '/apple-icon.png',
  },
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'en' | 'pl')) notFound()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${playfair.variable} ${spaceGrotesk.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <CursorTrail />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
