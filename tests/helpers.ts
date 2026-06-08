import type { APIRequestContext, Page } from '@playwright/test'

/** Every user-facing HTML page: one per template plus the standalone pages. */
export const PAGE_ROUTES = [
  '/',
  '/work',
  '/writing',
  '/log',
  '/now',
  '/about',
  '/experiments',
  '/resume',
  '/accessibility',
] as const

/** Non-HTML endpoints, each with the content-type it is required to serve. */
export const ENDPOINTS: { path: string; contentType: RegExp }[] = [
  { path: '/rss', contentType: /application\/rss\+xml/ },
  { path: '/atom', contentType: /application\/atom\+xml/ },
  { path: '/feed.json', contentType: /application\/feed\+json/ },
  { path: '/sitemap.xml', contentType: /xml/ },
  { path: '/robots.txt', contentType: /text\/plain/ },
  { path: '/llms.txt', contentType: /text\/plain/ },
  { path: '/llms-full.txt', contentType: /text\/plain/ },
  { path: '/og?title=Test', contentType: /image\/png/ },
  { path: '/manifest.webmanifest', contentType: /manifest|json/ },
]

/**
 * Pull every canonical path from the live sitemap. Using the sitemap as the
 * source of truth keeps the smoke/link suites in sync with content without
 * hardcoding writing/log slugs.
 */
export async function getSitemapPaths(
  request: APIRequestContext,
): Promise<string[]> {
  const res = await request.get('/sitemap.xml')
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  )
}

/** Unique same-origin link targets (path + search) rendered on the page. */
export async function collectInternalLinks(page: Page): Promise<string[]> {
  const hrefs = await page.$$eval('a[href]', (els) =>
    els.map((el) => el.getAttribute('href') ?? ''),
  )
  const internal = new Set<string>()
  for (const href of hrefs) {
    if (!href || href.startsWith('//')) continue
    if (/^(https?:|mailto:|tel:|#)/.test(href)) continue
    const path = href.split('#')[0] // drop in-page hash anchors
    if (path.startsWith('/')) internal.add(path)
  }
  return [...internal]
}

/** All JSON-LD objects on the page, flattening any @graph arrays into nodes. */
export async function collectJsonLd(
  page: Page,
): Promise<Record<string, unknown>[]> {
  const blocks = await page.$$eval(
    'script[type="application/ld+json"]',
    (els) => els.map((el) => el.textContent ?? ''),
  )
  const nodes: Record<string, unknown>[] = []
  for (const block of blocks) {
    const parsed = JSON.parse(block) as Record<string, unknown>
    const graph = parsed['@graph']
    if (Array.isArray(graph)) {
      for (const node of graph) nodes.push(node as Record<string, unknown>)
    } else {
      nodes.push(parsed)
    }
  }
  return nodes
}
