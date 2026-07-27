import { gzipSync } from 'node:zlib'
import { expect, test, type Page } from '@playwright/test'

const VIDEO_BYTES = /(?:\.m3u8|\.m4s|\.mp4|\.ts)(?:\?|$)|stream\.mux\.com/i

async function routeBytes(page: Page, route: string) {
  const resources = new Map<string, { type: string; bytes: number }>()
  let authoringLeak = false
  page.on('response', async (response) => {
    const request = response.request()
    if (!response.url().startsWith('http://localhost:3100')) return
    try {
      const body = await response.body()
      if (
        request.resourceType() === 'script' &&
        /log-scan|log-publish|\.log-workspace/.test(body.toString('utf8'))
      )
        authoringLeak = true
      resources.set(response.url(), {
        type: request.resourceType(),
        bytes: gzipSync(body).byteLength,
      })
    } catch {}
  })
  await page.goto(route, { waitUntil: 'networkidle' })
  const values = [...resources.values()]
  return {
    total: values.reduce((sum, item) => sum + item.bytes, 0),
    script: values
      .filter((item) => item.type === 'script')
      .reduce((sum, item) => sum + item.bytes, 0),
    stylesheet: values
      .filter((item) => item.type === 'stylesheet')
      .reduce((sum, item) => sum + item.bytes, 0),
    authoringLeak,
  }
}

test('@perf Log index is bounded and never mounts personal video', async ({
  page,
}) => {
  const videoRequests: string[] = []
  page.on('request', (request) => {
    if (VIDEO_BYTES.test(request.url())) videoRequests.push(request.url())
  })
  await page.goto('/log', { waitUntil: 'networkidle' })
  expect(await page.locator('main article').count()).toBeLessThanOrEqual(20)
  await expect(page.locator('video, mux-player')).toHaveCount(0)
  expect(videoRequests).toEqual([])
})

test('@perf image detail has stable responsive lazy media without double optimization', async ({
  page,
}) => {
  let largestImage = 0
  page.on('response', async (response) => {
    if (response.request().resourceType() !== 'image') return
    try {
      largestImage = Math.max(largestImage, (await response.body()).byteLength)
    } catch {}
  })
  await page.goto('/log/fixture-image-gallery', { waitUntil: 'networkidle' })
  const image = page.locator('[data-gallery-layout] img').first()
  await expect(image).toHaveAttribute('width', '1600')
  await expect(image).toHaveAttribute('height', '1067')
  await expect(image).toHaveAttribute('sizes', /100vw/)
  await expect(image).toHaveAttribute('srcset', /\S/)
  await expect(image).not.toHaveAttribute('loading', 'lazy')
  await expect(
    page.locator('[data-gallery-layout] img').nth(1),
  ).toHaveAttribute('loading', 'lazy')
  const sources = await page
    .locator('img')
    .evaluateAll((images) =>
      images.flatMap((item) => [
        item.getAttribute('src') ?? '',
        item.getAttribute('srcset') ?? '',
      ]),
    )
  const doubleOptimized = sources.some((source) =>
    source.split(',').some((candidate) => {
      const value = candidate.trim().split(/\s+/)[0]
      if (!value) return false
      const delivery = new URL(value, 'http://localhost:3100')
      if (delivery.pathname !== '/_next/image') return false
      const nested = delivery.searchParams.get('url')
      if (!nested) return false
      return new URL(nested, delivery).hostname === 'res.cloudinary.com'
    }),
  )
  expect(doubleOptimized).toBe(false)
  expect(largestImage).toBeGreaterThan(0)
  expect(largestImage).toBeLessThanOrEqual(180 * 1024)
})

test('@perf video detail is poster-first and does not request video before interaction', async ({
  page,
}) => {
  const videoRequests: string[] = []
  let posterBytes = 0
  page.on('request', (request) => {
    if (VIDEO_BYTES.test(request.url())) videoRequests.push(request.url())
  })
  page.on('response', async (response) => {
    if (!response.url().includes('editorial-video-poster')) return
    try {
      posterBytes = (await response.body()).byteLength
    } catch {}
  })
  await page.goto('/log/fixture-video-gallery', {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.locator('mux-player')).toHaveCount(0)
  await page.waitForTimeout(1_000)
  expect(videoRequests).toEqual([])
  expect(posterBytes).toBeGreaterThan(0)
  expect(posterBytes).toBeLessThanOrEqual(100 * 1024)
  await page.getByRole('button', { name: /Play/ }).click()
  await expect(page.locator('mux-player')).toHaveCount(1)
})

test('@perf text route excludes provider activity and stays inside transfer contracts', async ({
  page,
}) => {
  const providerRequests: string[] = []
  page.on('request', (request) => {
    if (/cloudinary|mux\.com/i.test(request.url()))
      providerRequests.push(request.url())
  })
  const bytes = await routeBytes(page, '/writing/why-this-site-exists')
  expect(providerRequests).toEqual([])
  expect(bytes.script).toBeLessThanOrEqual(175 * 1024)
  expect(bytes.stylesheet).toBeLessThanOrEqual(35 * 1024)
  expect(bytes.total).toBeLessThanOrEqual(300 * 1024)
  expect(bytes.authoringLeak).toBe(false)
})

test('@perf Log index stays inside its initial-transfer contract', async ({
  page,
}) => {
  const bytes = await routeBytes(page, '/log')
  expect(bytes.script).toBeLessThanOrEqual(175 * 1024)
  expect(bytes.stylesheet).toBeLessThanOrEqual(35 * 1024)
  expect(bytes.total).toBeLessThanOrEqual(500 * 1024)
})
