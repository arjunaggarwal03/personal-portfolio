import { baseUrl } from 'lib/site'

export const dynamic = 'force-static'

/**
 * AI crawlers we explicitly welcome. Most sites block these; we want the
 * opposite, so the site can be cited by ChatGPT, Claude, Perplexity, Gemini,
 * and friends (GEO).
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'cohere-ai',
]

/** Explicit allow-list plus the standard host and sitemap directives. */
export function GET() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_CRAWLERS.map((agent) => `User-agent: ${agent}`),
    'Allow: /',
    '',
    `Host: ${baseUrl}`,
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
