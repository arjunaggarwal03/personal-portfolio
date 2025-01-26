import './global.css';
import type { Metadata } from 'next';
import { Navbar } from './components/nav';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from './components/footer';
import { baseUrl } from './sitemap';
import SocialLinks from './components/social-links';
import CarouselControls from './components/carousel-controls';
import Background from './components/background';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Arjun's Portfolio",
    template: "Arjun's Portfolio",
  },
  description: "This is Arjun Aggarwal's personal website.",
  openGraph: {
    title: "Arjun's Portfolio",
    description: "This is Arjun's portfolio.",
    url: baseUrl,
    siteName: "Arjun's Portfolio",
    locale: 'en_US',
    type: 'website',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="text-black bg-white dark:text-white dark:bg-[#111]"
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" />
      </head>
      <body className="min-h-screen">
        <div className="relative min-h-screen pb-24">
          {/* Background Component */}
          <Background />

          {/* Navigation Blob - Top Left */}
          <div className="absolute top-6 left-6 z-20">
            <div className="rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 px-6 py-3 shadow-lg">
              <Navbar />
            </div>
          </div>

          {/* Social Links Blob - Top Right */}
          <div className="absolute top-6 right-6 z-20">
            <div className="rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 px-6 py-3 shadow-lg">
              <SocialLinks />
            </div>
          </div>

          {/* Content Blob - Center */}
          <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center p-8 z-10">
            <div className="rounded-3xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 p-8 max-w-2xl w-full shadow-lg">
              {children}
            </div>
          </main>

          {/* Carousel Controls - Bottom Center */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 px-6 py-3 shadow-lg">
              <CarouselControls />
            </div>
          </div>

          <Analytics />
          <SpeedInsights />
        </div>
      </body>
    </html>
  );
}
