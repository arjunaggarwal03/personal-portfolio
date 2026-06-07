import type { MetadataRoute } from 'next'
import { getPublishedWriting, getLogWithDetailPages } from 'lib/content'
import { baseUrl, navItems } from 'lib/site'

/** Routes not covered by nav items (home + secondary pages). */
const EXTRA_ROUTES = ['', '/experiments', '/resume']

/** Per-route crawl hints. Home is the canonical entity page, so highest. */
const PRIORITY: Record<string, number> = {
  '': 1,
  '/writing': 0.9,
  '/work': 0.8,
  '/about': 0.8,
  '/log': 0.7,
}

const today = () => new Date().toISOString().split('T')[0]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routePaths = [...EXTRA_ROUTES, ...navItems.map((n) => n.path)]
  const staticRoutes: MetadataRoute.Sitemap = routePaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: today(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: PRIORITY[route] ?? 0.6,
  }))

  const writing: MetadataRoute.Sitemap = getPublishedWriting().map((post) => ({
    url: `${baseUrl}/writing/${post.slug}`,
    lastModified: post.updated ?? post.date,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const log: MetadataRoute.Sitemap = getLogWithDetailPages().map((entry) => ({
    url: `${baseUrl}/log/${entry.slug}`,
    lastModified: entry.updated ?? entry.date,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...writing, ...log]
}
