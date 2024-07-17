import './global.css';
import type { Metadata } from 'next';
import { Navbar } from './components/nav';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from './components/footer';
import { baseUrl } from './sitemap';

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

const cx = (...classes) => classes.filter(Boolean).join(' ');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-white dark:text-white dark:bg-black',
      )}
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" />
      </head>
      <body className="antialiased mx-4 mt-8 lg:mx-auto font-sans">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0 container">
          <Navbar />
          {children}
          <Footer />
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
