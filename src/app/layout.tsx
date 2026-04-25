import type { Metadata } from 'next'
import { Syne, Cormorant_Garamond, Space_Grotesk } from 'next/font/google'
import CursorTrail from '@/components/CursorTrail'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
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
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${cormorant.variable} ${spaceGrotesk.variable}`}>
      <body>
        <CursorTrail />
        {children}
      </body>
    </html>
  )
}
