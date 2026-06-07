import { baseUrl, site } from 'lib/site'
import { getPublishedWriting } from 'lib/content'

const RSS_DESCRIPTION =
  'Essays on agents, customer context, workflow systems, and startup engineering.'
const RSS_CONTENT_TYPE = 'text/xml'

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
    .map(
      (post) =>
        `<item>
          <title>${escapeXml(post.title)}</title>
          <link>${baseUrl}/writing/${post.slug}</link>
          <description>${escapeXml(post.summary || '')}</description>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
        </item>`
    )
    .join('\n')

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>${site.name} · Writing</title>
        <link>${baseUrl}</link>
        <description>${RSS_DESCRIPTION}</description>
        ${itemsXml}
    </channel>
  </rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': RSS_CONTENT_TYPE,
    },
  })
}
