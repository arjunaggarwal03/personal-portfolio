import { defineConfig, devices } from '@playwright/test'

const PORT = 3000
const baseURL = `http://localhost:${PORT}`

/**
 * Playwright drives the accessibility gate (tests/accessibility.spec.ts), which
 * runs the full axe-core WCAG 2.2 ruleset against every key route. It boots the
 * production build via `npm run start` and tears it down when the run finishes,
 * mirroring how the site is actually served. Locally, run `npm run build` first
 * (CI does this in a dedicated step before the audit).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
})
