import { getPublishedWriting } from 'lib/content'
import { baseUrl, person, navItems, social } from 'lib/site'

export const dynamic = 'force-static'

const CONTENT_TYPE = 'text/plain; charset=utf-8'

/** Human-readable labels for the named social links. */
const PROFILE_LABELS: Record<keyof typeof social, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  x: 'X (Twitter)',
  email: 'Email',
}

/**
 * /llms.txt — a curated, plain-text map of the site for LLMs and AI agents,
 * following the llmstxt.org convention. Gives generative engines a clean,
 * authoritative summary to quote and cite instead of guessing from markup.
 */
export function GET() {
  const writing = getPublishedWriting()

  const lines: string[] = [
    `# ${person.name}`,
    '',
    `> ${person.bio}`,
    '',
    `- Role: ${person.jobTitle} at ${person.company} (${person.companyUrl})`,
    `- Location: ${person.location}`,
    `- Focus: ${person.knowsAbout.join(', ')}`,
    `- Previously: ${person.affiliations.filter((a) => a !== person.company).join(', ')}`,
    '',
    '## Pages',
    `- [Home](${baseUrl}): overview and current focus`,
    ...navItems.map((n) => `- [${n.label}](${baseUrl}${n.path})`),
    `- [Resume](${baseUrl}/resume)`,
    '',
    '## Writing',
    ...writing.map(
      (post) =>
        `- [${post.title}](${baseUrl}/writing/${post.slug})${post.summary ? `: ${post.summary}` : ''}`
    ),
    '',
    '## Profiles',
    ...(Object.keys(social) as (keyof typeof social)[]).map(
      (key) => `- ${PROFILE_LABELS[key]}: ${social[key].replace(/^mailto:/, '')}`
    ),
    '',
    '## Feeds',
    `- Full content (markdown): ${baseUrl}/llms-full.txt`,
    `- RSS: ${baseUrl}/rss`,
    `- Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': CONTENT_TYPE },
  })
}
