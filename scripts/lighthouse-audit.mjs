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
const runsPerRoute = full ? 3 : 1

const thresholds = {
  performance: 0.95,
  accessibility: 1,
  'best-practices': 0.95,
  seo: 1,
}
const numericLimits = {
  'largest-contentful-paint': 3000,
  'cumulative-layout-shift': 0.03,
  'total-blocking-time': 100,
  'speed-index': 2000,
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b)
  return ordered[Math.floor(ordered.length / 2)]
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
    const reports = []
    for (let run = 0; run < runsPerRoute; run++) {
      const result = await lighthouse(`${origin}${route}`, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
      })
      if (!result) throw new Error(`Lighthouse returned no result for ${route}`)
      reports.push(result.lhr)
    }
    const categoryScores = Object.fromEntries(
      Object.keys(thresholds).map((name) => [
        name,
        median(reports.map((report) => report.categories[name]?.score ?? 0)),
      ]),
    )
    const failures = Object.entries(thresholds).flatMap(([name, minimum]) => {
      const score = categoryScores[name]
      return score < minimum ? [`${name} ${score} < ${minimum}`] : []
    })
    for (const [name, maximum] of Object.entries(numericLimits)) {
      const value = median(
        reports.map((report) => report.audits[name]?.numericValue ?? Infinity),
      )
      if (value > maximum) failures.push(`${name} ${value} > ${maximum}`)
    }
    console.log(
      `${route} (${runsPerRoute} run${runsPerRoute === 1 ? '' : 's'}): ${Object.keys(
        thresholds,
      )
        .map((name) => `${name}=${categoryScores[name]}`)
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
