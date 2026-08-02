import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const roots = ['content', 'lib/site.ts']
const sources = []

async function collect(target) {
  const absolute = path.join(process.cwd(), target)
  if (path.extname(target)) {
    sources.push(absolute)
    return
  }
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const relative = path.join(target, entry.name)
    if (entry.isDirectory()) await collect(relative)
    else if (/\.(?:mdx?|json|ts)$/.test(entry.name))
      sources.push(path.join(process.cwd(), relative))
  }
}

for (const root of roots) await collect(root)

const urls = new Set()
for (const source of sources) {
  const text = await readFile(source, 'utf8')
  for (const match of text.matchAll(/https:\/\/[^\s"'<>)}\]]+/g)) {
    try {
      const url = new URL(match[0])
      if (!['example.com', 'localhost'].includes(url.hostname))
        urls.add(url.href)
    } catch {}
  }
}

const failures = []
const values = [...urls].sort()
let cursor = 0
async function worker() {
  while (cursor < values.length) {
    const url = values[cursor++]
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(15_000),
        headers: { 'User-Agent': 'personal-portfolio-link-check/1.0' },
      })
      const botBlockedButReachable = [401, 403, 429, 999].includes(
        response.status,
      )
      if (
        !botBlockedButReachable &&
        (response.status === 404 ||
          response.status === 410 ||
          response.status >= 500)
      ) {
        failures.push(`${response.status} ${url}`)
      }
    } catch (error) {
      failures.push(
        `${url}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
await Promise.all(
  Array.from({ length: Math.min(4, values.length) }, () => worker()),
)

console.log(`Checked ${values.length} external content links.`)
if (failures.length) {
  throw new Error(
    `External link failures:\n${failures.map((item) => `  - ${item}`).join('\n')}`,
  )
}
