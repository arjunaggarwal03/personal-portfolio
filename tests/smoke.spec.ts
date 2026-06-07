import { expect, test } from '@playwright/test'
import { ENDPOINTS, PAGE_ROUTES, getSitemapPaths } from './helpers'

test.describe('pages render as HTML', () => {
  for (const route of PAGE_ROUTES) {
    test(`GET ${route}`, async ({ request }) => {
      const res = await request.get(route)
      expect(res.status(), `${route} status`).toBe(200)
      expect(res.headers()['content-type'], `${route} content-type`).toMatch(
        /text\/html/,
      )
    })
  }
})

test.describe('special endpoints', () => {
  for (const { path, contentType } of ENDPOINTS) {
    test(`GET ${path}`, async ({ request }) => {
      const res = await request.get(path)
      expect(res.status(), `${path} status`).toBe(200)
      expect(res.headers()['content-type'], `${path} content-type`).toMatch(
        contentType,
      )
    })
  }
})

test('every sitemap URL resolves', async ({ request }) => {
  const paths = await getSitemapPaths(request)
  expect(paths.length, 'sitemap entries').toBeGreaterThan(0)

  const broken: string[] = []
  for (const path of paths) {
    const res = await request.get(path)
    if (res.status() !== 200) broken.push(`${path} -> ${res.status()}`)
  }
  expect(broken, `Broken sitemap URLs:\n${broken.join('\n')}`).toEqual([])
})

test('unknown route returns 404', async ({ request }) => {
  const res = await request.get('/this-route-should-not-exist-9f3a2')
  expect(res.status()).toBe(404)
})
