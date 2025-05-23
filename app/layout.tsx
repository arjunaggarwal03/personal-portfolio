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
import { BackgroundProvider } from './context/BackgroundContext'

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
        <link 
          rel="preload" 
          href="/rembrandt-bridge.jpg"
          as="image"
          fetchPriority="high"
          type="image/jpeg"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" />
      </head>
      <body className="min-h-screen">
        <BackgroundProvider>
          <div className="relative min-h-screen pb-24">
            {/* Main content first */}
            <main className="relative flex items-center justify-center z-10 p-4 md:p-8 min-h-[calc(100vh-8rem)] mt-16 md:mt-0">
              <div className="rounded-3xl bg-white/50 dark:bg-white/20 backdrop-blur-md border border-white/20 dark:border-white/10 p-6 md:p-8 max-w-2xl w-full shadow-lg">
                {children}
              </div>
            </main>

            {/* Top Navigation Bar - Mobile */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 p-4 bg-white/30 dark:bg-white/10 backdrop-blur-md border-b border-white/20">
              <div className="flex justify-between items-center">
                <Navbar />
                <SocialLinks />
              </div>
            </div>

            {/* Navigation Blob - Top Left - Desktop */}
            <div className="hidden md:block absolute top-6 left-6 z-20">
              <div className="rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 px-6 py-3 shadow-lg">
                <Navbar />
              </div>
            </div>

            {/* Social Links Blob - Top Right - Desktop */}
            <div className="hidden md:block absolute top-6 right-6 z-20">
              <div className="rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 px-6 py-3 shadow-lg">
                <SocialLinks />
              </div>
            </div>

            {/* Carousel Controls - Bottom Center */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
              <div className="rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 px-3 py-2 shadow-lg">
                <CarouselControls />
              </div>
            </div>

            {/* Background last */}
            <Background />

            <Analytics />
            <SpeedInsights />
          </div>
        </BackgroundProvider>
      </body>
    </html>
  );
}
