import { getPublishedWriting } from 'lib/content'
import { baseUrl, person } from 'lib/site'
import { formatDate } from 'lib/dates'

export const dynamic = 'force-static'

const CONTENT_TYPE = 'text/plain; charset=utf-8'

/**
 * /llms-full.txt — the llmstxt.org companion to /llms.txt: the full writing
 * corpus inlined as markdown so an AI engine can ingest everything in a single
 * fetch and cite it accurately, without crawling page by page.
 */
export function GET() {
  const writing = getPublishedWriting()

  const header = [
    `# ${person.name} — Full Content`,
    '',
    `> ${person.bio}`,
    '',
    `Source: ${baseUrl}`,
    '',
    '---',
    '',
  ]

  const posts = writing.flatMap((post) => [
    `# ${post.title}`,
    '',
    post.subtitle ? `*${post.subtitle}*` : '',
    `URL: ${baseUrl}/writing/${post.slug}`,
    `Published: ${formatDate(post.date)}`,
    post.tags.length > 0 ? `Tags: ${post.tags.join(', ')}` : '',
    '',
    post.body?.trim() ?? '',
    '',
    '---',
    '',
  ])

  return new Response([...header, ...posts].join('\n'), {
    headers: { 'Content-Type': CONTENT_TYPE },
  })
}
