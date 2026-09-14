import {
  getPublishedWriting,
  getPublicLogWithDetailPages,
} from 'lib/content/queries'
import { baseUrl, person } from 'lib/site'
import { formatDate } from 'lib/dates'

export const dynamic = 'force-static'

const CONTENT_TYPE = 'text/plain; charset=utf-8'

function absoluteInternalLinks(markdown: string): string {
  return markdown.replaceAll('](/', `](${baseUrl}/`)
}

/**
 * /llms-full.txt — the llmstxt.org companion to /llms.txt: the full writing
 * and public Log corpus inlined as markdown so an AI engine can ingest
 * everything in a single fetch and cite it accurately.
 */
export function GET() {
  const writing = getPublishedWriting()
  const log = getPublicLogWithDetailPages()

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

  const writingSection = [
    '## Writing',
    '',
    ...writing.flatMap((post) => [
      `### ${post.title}`,
      '',
      post.subtitle ? `*${post.subtitle}*` : '',
      `URL: ${baseUrl}/writing/${post.slug}`,
      `Published: ${formatDate(post.date)}`,
      post.tags.length > 0 ? `Tags: ${post.tags.join(', ')}` : '',
      '',
      absoluteInternalLinks(post.body?.trim() ?? ''),
      '',
    ]),
  ]

  const logSection = [
    '## Log',
    '',
    ...log.flatMap((entry) => [
      `### ${entry.title ?? `Log entry from ${formatDate(entry.date)}`}`,
      '',
      `URL: ${baseUrl}/log/${entry.slug}`,
      `Recorded: ${formatDate(entry.date)}`,
      `Type: ${entry.type}`,
      entry.tags.length > 0 ? `Tags: ${entry.tags.join(', ')}` : '',
      '',
      entry.summary ?? '',
      '',
      absoluteInternalLinks(entry.body?.trim() ?? ''),
      '',
    ]),
  ]

  return new Response(
    [...header, ...writingSection, ...logSection].join('\n'),
    {
      headers: { 'Content-Type': CONTENT_TYPE },
    },
  )
}
