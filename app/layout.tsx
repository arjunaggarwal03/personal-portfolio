import './global.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Header } from './components/header'
import { Footer } from './components/footer'
import { baseUrl, site, person, brand } from 'lib/site'
import { ogImageUrl } from 'lib/seo'

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

const defaultOgImage = ogImageUrl(site.name)

/**
 * Browser/SERP title is just the name: short, and an exact match for the query
 * we want to rank ("Arjun Aggarwal"). The longer role-qualified variant is kept
 * for social share cards, where there's room and it reads well.
 */
const socialTitle = `${person.name} · ${person.jobTitle} at ${person.company}`

/** Search-intent keywords: name variants first, then topics. */
const keywords: string[] = [
  'Arjun Aggarwal',
  'Arjun Aggarwal Lightfield',
  'Arjun Aggarwal engineer',
  'Arjun Aggarwal San Francisco',
  'Arjun Aggarwal founding engineer',
  ...person.knowsAbout,
]

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: person.name, url: baseUrl }],
  creator: person.name,
  publisher: person.name,
  keywords,
  category: 'technology',
  // NOTE: no global `canonical` here. Next inherits metadata into child
  // routes, so a canonical set in the layout makes every page canonicalize to
  // it. Each page declares its own canonical instead.
  alternates: {
    types: {
      'application/rss+xml': `${baseUrl}/rss`,
    },
  },
  openGraph: {
    title: socialTitle,
    description: site.description,
    url: baseUrl,
    siteName: site.name,
    locale: 'en_US',
    type: 'profile',
    firstName: 'Arjun',
    lastName: 'Aggarwal',
    username: 'arjunaggarwal',
    images: [defaultOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: socialTitle,
    description: site.description,
    creator: '@arjunaggarwal1',
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

export const viewport: Viewport = {
  themeColor: brand.bg,
  colorScheme: 'light',
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
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-[760px] flex-1 px-6 pt-10 md:pt-14"
          >
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
