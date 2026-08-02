import { expect, test } from '@playwright/test'

const INDEX_ROUTES = [
  '/work',
  '/writing',
  '/log',
  '/now',
  '/about',
  '/resume',
  '/accessibility',
  '/experiments',
] as const

for (const viewport of [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const) {
  test(`index title hierarchy is consistent at ${viewport.name} width`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    const styles = []
    for (const route of INDEX_ROUTES) {
      await page.goto(route)
      styles.push(
        await page.locator('main h1').evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: style.lineHeight,
          }
        }),
      )
    }
    for (const style of styles.slice(1)) expect(style).toEqual(styles[0])
    expect(styles[0].fontSize).toBe('32px')
    expect(Number(styles[0].fontWeight)).toBeGreaterThanOrEqual(600)
  })
}

test('detail titles share one rendered role and mobile prose stays readable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const styles = []
  for (const route of [
    '/writing/why-this-site-exists',
    '/log/2026-06-02-public-api-build',
  ]) {
    await page.goto(route)
    styles.push(
      await page.locator('main h1').evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
        }
      }),
    )
    const proseSize = await page
      .locator('.article p')
      .first()
      .evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      )
    expect(proseSize).toBeGreaterThanOrEqual(16)
  }
  expect(styles[1]).toEqual(styles[0])
})

test('/now remains a compact editorial ledger without integration fallbacks', async ({
  page,
}) => {
  await page.goto('/now')
  await expect(page.locator('main article > section')).toHaveCount(4)
  await expect(
    page.getByText(/not connected|unavailable right now/i),
  ).toHaveCount(0)
  await expect(page.getByText(/weather|air quality|sunset/i)).toHaveCount(0)
})
