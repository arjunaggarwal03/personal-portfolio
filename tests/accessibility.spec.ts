import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * Routes that gate the "substantially conformant with WCAG 2.2 AA" claim on
 * /accessibility. One entry per page template (static page, content index,
 * MDX article, log entry with embeds) so a regression in any shared layout or
 * content pipeline is caught.
 */
const ROUTES = [
  '/',
  '/work',
  '/writing',
  '/log',
  '/about',
  '/experiments',
  '/resume',
  '/accessibility',
  '/writing/why-this-site-exists',
  '/log/2026-06-02-public-api-build',
] as const

// The WCAG 2.2 Level A + AA success criteria, which is exactly what the
// accessibility statement claims conformance with.
const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
] as const

async function settle(page: Page) {
  // Let third-party embeds (Spotify/YouTube) inject their iframes and our
  // MutationObserver add the missing frame titles before axe scans. networkidle
  // can hang on long-lived embed connections, so cap the wait and move on.
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {})
}

for (const route of ROUTES) {
  test(`a11y: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await settle(page)

    const { violations } = await new AxeBuilder({ page })
      .withTags([...WCAG_TAGS])
      // Skip the *contents* of third-party embed iframes (YouTube/Spotify). That
      // markup isn't authored here and is out of scope for the conformance
      // claim, and Playwright (unlike Lighthouse) descends into cross-origin
      // frames. Excluding only the inner `body` keeps the <iframe> elements
      // themselves in scope, so frame-title (accessible name) is still gated.
      .exclude(['iframe', 'body'])
      .analyze()

    // Surface a readable summary instead of an opaque "expected 0" on failure.
    const summary = violations
      .map(
        (v) =>
          `  [${v.impact ?? 'n/a'}] ${v.id}: ${v.help} (${v.nodes.length} node${
            v.nodes.length === 1 ? '' : 's'
          })\n    ${v.helpUrl}`,
      )
      .join('\n')

    expect(
      violations,
      `Accessibility violations on ${route}:\n${summary}`,
    ).toEqual([])
  })
}
