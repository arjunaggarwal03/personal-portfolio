import { expect, test } from '@playwright/test'
import { PAGE_ROUTES, collectInternalLinks, getSitemapPaths } from './helpers'

// Crawls every page, so give it more headroom than the default per-test budget.
test.slow()

test('internal links all resolve', async ({ page, request }) => {
  const seeds = new Set<string>([
    ...PAGE_ROUTES,
    ...(await getSitemapPaths(request)),
  ])

  const targets = new Set<string>()
  for (const seed of seeds) {
    await page.goto(seed, { waitUntil: 'domcontentloaded' })
    for (const link of await collectInternalLinks(page)) targets.add(link)
  }
  expect(targets.size, 'internal links discovered').toBeGreaterThan(0)

  const broken: string[] = []
  for (const target of targets) {
    const res = await request.get(target)
    if (res.status() >= 400) broken.push(`${target} -> ${res.status()}`)
  }
  expect(broken, `Broken internal links:\n${broken.join('\n')}`).toEqual([])
})
