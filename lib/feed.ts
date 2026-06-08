import { Feed } from 'feed'
import { baseUrl, person, site } from 'lib/site'
import { getPublishedWriting } from 'lib/content'

const FEED_DESCRIPTION =
  'Essays on agents, customer context, workflow systems, and startup engineering.'

/** Public URLs for each syndication format, advertised in every feed. */
export const feedLinks = {
  rss: `${baseUrl}/rss`,
  atom: `${baseUrl}/atom`,
  json: `${baseUrl}/feed.json`,
} as const

/**
 * Build the Writing feed once, then serialize it to RSS / Atom / JSON Feed from
 * the route handlers. Centralizes channel metadata and item mapping so the
 * three formats can never drift, and lets `feed` handle escaping + spec quirks.
 */
export function buildWritingFeed(): Feed {
  const posts = getPublishedWriting()

  // Most recent change across the feed, so editing a post re-dates the channel.
  const latest = posts.reduce<number>(
    (max, post) => Math.max(max, new Date(post.updated ?? post.date).getTime()),
    0,
  )

  const author = { name: person.name, link: baseUrl }

  const feed = new Feed({
    title: `${site.name} · Writing`,
    description: FEED_DESCRIPTION,
    id: baseUrl,
    link: baseUrl,
    language: 'en-US',
    image: `${baseUrl}${person.image}`,
    copyright: `© ${new Date().getFullYear()} ${person.name}`,
    updated: new Date(latest || Date.now()),
    generator: site.name,
    feedLinks,
    author,
  })

  for (const post of posts) {
    const url = `${baseUrl}/writing/${post.slug}`
    feed.addItem({
      title: post.title,
      id: url,
      link: url,
      description: post.summary || undefined,
      date: new Date(post.updated ?? post.date),
      published: new Date(post.date),
      author: [author],
    })
  }

  return feed
}
