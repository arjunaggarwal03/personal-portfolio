import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'

const port = 3100
const origin = `http://localhost:${port}`
const full = process.argv.includes('--full')
const routes = full
  ? ['/', '/work', '/writing/why-this-site-exists', '/log', '/now']
  : ['/now']

const thresholds = {
  performance: 0.95,
  accessibility: 1,
  'best-practices': 0.95,
  seo: 1,
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      if ((await fetch(origin)).ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('Production server did not become ready')
}

const server = spawn('npm', ['run', 'start', '--', '-p', String(port)], {
  stdio: 'inherit',
  env: { ...process.env, MEDIA_TEST_FIXTURES: '1' },
})

let chrome
try {
  await waitForServer()
  chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  })
  for (const route of routes) {
    const result = await lighthouse(`${origin}${route}`, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
    })
    if (!result) throw new Error(`Lighthouse returned no result for ${route}`)
    const failures = Object.entries(thresholds).flatMap(([name, minimum]) => {
      const score = result.lhr.categories[name]?.score ?? 0
      return score < minimum ? [`${name} ${score} < ${minimum}`] : []
    })
    const audits = result.lhr.audits
    const numericLimits = {
      'largest-contentful-paint': 3000,
      'cumulative-layout-shift': 0.03,
      'total-blocking-time': 100,
      'speed-index': 2000,
    }
    for (const [name, maximum] of Object.entries(numericLimits)) {
      const value = audits[name]?.numericValue ?? Infinity
      if (value > maximum) failures.push(`${name} ${value} > ${maximum}`)
    }
    console.log(
      `${route}: ${Object.keys(thresholds)
        .map((name) => `${name}=${result.lhr.categories[name]?.score ?? 0}`)
        .join(' ')}`,
    )
    if (failures.length) {
      throw new Error(
        `Lighthouse contract failed for ${route}: ${failures.join(', ')}`,
      )
    }
  }
} finally {
  if (chrome) await chrome.kill()
  server.kill('SIGTERM')
}
