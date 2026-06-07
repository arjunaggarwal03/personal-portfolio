import { getPublishedWriting, getLogWithDetailPages } from 'lib/content'
import { baseUrl, navItems } from 'lib/site'

/** Routes not covered by nav items (home + secondary pages). */
const EXTRA_ROUTES = ['', '/experiments', '/resume']

export default async function sitemap() {
  const routePaths = [...EXTRA_ROUTES, ...navItems.map((n) => n.path)]
  const staticRoutes = routePaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  const writing = getPublishedWriting().map((post) => ({
    url: `${baseUrl}/writing/${post.slug}`,
    lastModified: post.updated ?? post.date,
  }))

  const log = getLogWithDetailPages().map((entry) => ({
    url: `${baseUrl}/log/${entry.slug}`,
    lastModified: entry.updated ?? entry.date,
  }))

  return [...staticRoutes, ...writing, ...log]
}
