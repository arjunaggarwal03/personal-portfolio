import { expect, test } from '@playwright/test'

/**
 * Contract tests for the two dynamic /now API routes the client polls. These
 * don't need any upstream secrets: `/api/ping` is self-contained, and
 * `/api/now-playing` returns a valid discriminated envelope even when Spotify
 * is unconfigured (state: "unconfigured"). We assert the shape + caching
 * guarantees the client relies on, not live data — so they stay green in CI.
 */

test.describe('/api/ping', () => {
  test('returns an uncached 204 with no body', async ({ request }) => {
    const res = await request.get('/api/ping')

    // 204 keeps the payload empty so the measured time is dominated by the
    // network, not bytes — the whole point of the latency probe.
    expect(res.status(), 'ping status').toBe(204)
    expect((await res.body()).length, 'ping body is empty').toBe(0)

    // Must never be cached, or the edge→origin round-trip (and its x-vercel-id)
    // collapses and the latency number goes stale.
    expect(res.headers()['cache-control'], 'ping cache-control').toContain(
      'no-store',
    )
  })
})

test.describe('/api/now-playing', () => {
  test('returns an uncached JSON SourceResult envelope', async ({
    request,
  }) => {
    const res = await request.get('/api/now-playing')

    expect(res.status(), 'now-playing status').toBe(200)
    expect(res.headers()['content-type'], 'now-playing content-type').toMatch(
      /application\/json/,
    )
    // Shared at the CDN (s-maxage + SWR), not no-store — the playback snapshot
    // is identical for every visitor, so the edge should collapse polls.
    const cacheControl = res.headers()['cache-control'] ?? ''
    expect(cacheControl, 'now-playing is edge-cacheable').toMatch(/s-maxage=\d/)
    expect(cacheControl, 'now-playing uses stale-while-revalidate').toContain(
      'stale-while-revalidate',
    )

    const body = await res.json()

    // SourceResult<NowPlaying>: a discriminated envelope the client unwraps via
    // `.data`. Shape must hold regardless of whether Spotify is configured.
    expect(
      ['ok', 'empty', 'unconfigured'],
      'state is a known variant',
    ).toContain(body.state)
    expect(body, 'envelope has a data field').toHaveProperty('data')
    expect(
      typeof body.fetchedAt === 'string' &&
        Number.isFinite(Date.parse(body.fetchedAt)),
      'fetchedAt is an ISO timestamp',
    ).toBe(true)

    // When something is actually playing, the playback snapshot the poller
    // consumes must be fully populated.
    if (body.state === 'ok' && body.data) {
      expect(body.data, 'playback snapshot keys').toMatchObject({
        isPlaying: expect.any(Boolean),
      })
      for (const key of ['track', 'progressMs', 'durationMs']) {
        expect(body.data, `playback has ${key}`).toHaveProperty(key)
      }
    } else {
      // empty / unconfigured carry no playback data.
      expect(body.data, 'no data when not ok').toBeNull()
    }
  })
})
