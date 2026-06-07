import { expect, test } from '@playwright/test'
import { social } from '../lib/site'
import { PAGE_ROUTES, collectJsonLd, getSitemapPaths } from './helpers'

test.describe('per-page metadata', () => {
  for (const route of PAGE_ROUTES) {
    test(`meta: ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      const head = page.locator('head')

      await expect(page, `${route} <title>`).toHaveTitle(/\S/)

      const description = await head
        .locator('meta[name="description"]')
        .getAttribute('content')
      expect(description?.trim(), `${route} meta description`).toBeTruthy()

      const canonicalHref = await head
        .locator('link[rel="canonical"]')
        .getAttribute('href')
      expect(canonicalHref, `${route} canonical`).toBeTruthy()
      const canonicalPath = new URL(canonicalHref!).pathname.replace(
        /(.)\/$/,
        '$1',
      )
      expect(canonicalPath, `${route} canonical path`).toBe(route)

      const ogImage = await head
        .locator('meta[property="og:image"]')
        .getAttribute('content')
      expect(ogImage, `${route} og:image`).toContain('/og')

      const ogTitle = await head
        .locator('meta[property="og:title"]')
        .getAttribute('content')
      expect(ogTitle?.trim(), `${route} og:title`).toBeTruthy()
    })
  }
})

test('page titles are unique', async ({ page }) => {
  const seen = new Map<string, string>()
  for (const route of PAGE_ROUTES) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    const title = await page.title()
    const dupe = [...seen.entries()].find(([, t]) => t === title)
    expect(
      dupe,
      `${route} duplicates the title of ${dupe?.[0]}: "${title}"`,
    ).toBeUndefined()
    seen.set(route, title)
  }
})

test('homepage emits Person + WebSite structured data', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const nodes = await collectJsonLd(page)

  const person = nodes.find((n) => n['@type'] === 'Person')
  expect(person, 'Person node in JSON-LD').toBeTruthy()
  expect(
    nodes.some((n) => n['@type'] === 'WebSite'),
    'WebSite node in JSON-LD',
  ).toBe(true)

  const sameAs = (person?.sameAs as string[] | undefined) ?? []
  expect(sameAs, 'Person.sameAs includes the X profile').toContain(social.x)
})

test('writing posts emit BlogPosting structured data', async ({
  page,
  request,
}) => {
  const post = (await getSitemapPaths(request)).find((p) =>
    p.startsWith('/writing/'),
  )
  expect(post, 'a /writing/* path in the sitemap').toBeTruthy()

  await page.goto(post!, { waitUntil: 'domcontentloaded' })
  const nodes = await collectJsonLd(page)
  expect(
    nodes.some((n) => n['@type'] === 'BlogPosting'),
    'BlogPosting node in JSON-LD',
  ).toBe(true)
})
