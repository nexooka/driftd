import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
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
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'driftd — explore cities like a local',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'driftd — the city has secrets. we help you hear them.',
    description: 'AI-powered city exploration for the curious traveller.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
