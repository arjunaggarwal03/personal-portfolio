import { baseUrl, site } from 'lib/site'
import { getPublishedWriting } from 'lib/content'

const RSS_DESCRIPTION =
  'Essays on agents, customer context, workflow systems, and startup engineering.'
const RSS_CONTENT_TYPE = 'application/rss+xml; charset=utf-8'
const LANGUAGE = 'en-us'

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char)
}

export async function GET() {
  const posts = getPublishedWriting()

  const itemsXml = posts
    .map((post) => {
      const url = `${baseUrl}/writing/${post.slug}`
      return `<item>
          <title>${escapeXml(post.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description>${escapeXml(post.summary || '')}</description>
          <pubDate>${new Date(post.updated ?? post.date).toUTCString()}</pubDate>
        </item>`
    })
    .join('\n')

  // Most recent change across the feed, so editing a post re-dates it.
  const latest = posts.reduce<number>((max, post) => {
    return Math.max(max, new Date(post.updated ?? post.date).getTime())
  }, 0)
  const lastBuildDate = new Date(latest || Date.now()).toUTCString()

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${escapeXml(site.name)} · Writing</title>
        <link>${baseUrl}</link>
        <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
        <description>${escapeXml(RSS_DESCRIPTION)}</description>
        <language>${LANGUAGE}</language>
        <lastBuildDate>${lastBuildDate}</lastBuildDate>
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': RSS_CONTENT_TYPE,
    },
  })
}
