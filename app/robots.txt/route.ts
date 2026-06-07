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

/**
 * Content Signals (contentsignals.org / draft-romm-aipref-contentsignals).
 * We want to be searchable and citable by AI answers, but reserve content from
 * model training (consistent with the rights note in the README).
 */
const CONTENT_SIGNAL = 'search=yes, ai-input=yes, ai-train=no'

/**
 * Hand-rolled robots.txt (instead of the Next metadata convention) so we can
 * emit Content-Signal directives, which the typed MetadataRoute API can't.
 */
export function GET() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    `Content-Signal: ${CONTENT_SIGNAL}`,
    '',
    ...AI_CRAWLERS.map((agent) => `User-agent: ${agent}`),
    'Allow: /',
    `Content-Signal: ${CONTENT_SIGNAL}`,
    '',
    `Host: ${baseUrl}`,
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
