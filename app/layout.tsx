import './global.css'
import type { Metadata } from 'next'
import { Inter, Newsreader, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Header } from './components/header'
import { Footer } from './components/footer'
import { baseUrl, site } from 'lib/site'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

const defaultOgImage = `/og?title=${encodeURIComponent(site.name)}`

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': `${baseUrl}/rss`,
    },
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: baseUrl,
    siteName: site.name,
    locale: 'en_US',
    type: 'website',
    images: [defaultOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-[760px] flex-1 px-6 pt-10 md:pt-14">
            {children}
          </main>
          <Footer />
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
