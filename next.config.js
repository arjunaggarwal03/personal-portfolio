// Keep in sync with `baseUrl` in lib/site.ts (this file is plain CommonJS and
// can't import the TS module).
const BASE_URL = 'https://www.arjunaggarwal.dev'

/**
 * RFC 8288 Link header advertising agent-facing resources (llms.txt + RSS) so
 * crawlers and agents can discover them without parsing HTML. Applied to every
 * route; per-page canonicals are still emitted as <link> tags via metadata.
 */
const AGENT_LINK_HEADER = [
  `<${BASE_URL}/llms.txt>; rel="alternate"; type="text/plain"; title="llms.txt"`,
  `<${BASE_URL}/rss>; rel="alternate"; type="application/rss+xml"; title="RSS"`,
].join(', ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  outputFileTracingRoot: __dirname,
  // Baked in at build time (= deploy time on Vercel) so the /now "This site"
  // tile can show how long ago the running build shipped, without an API call.
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
  // The OG route reads this font from disk at runtime; make sure it ships in
  // the serverless function bundle.
  outputFileTracingIncludes: {
    '/og': ['./app/og/fonts/**'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Scope the optimizer to hosts we actually render (Spotify album art on the
    // /now tiles). A `**` wildcard turns the optimizer into an open proxy for
    // arbitrary remote images — a cost/abuse vector Next explicitly warns
    // against. Add a pattern here when introducing images from a new host.
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: '**.scdn.co' },
      { protocol: 'https', hostname: '**.spotifycdn.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Link', value: AGENT_LINK_HEADER }],
      },
    ]
  },
}

module.exports = nextConfig
