import assert from 'node:assert/strict'
import test from 'node:test'
import sitemap from '../../app/sitemap'
import { baseUrl } from '../../lib/site'

test('static sitemap routes do not claim a new modification date every build', async () => {
  const entries = await sitemap()
  const home = entries.find((entry) => entry.url === baseUrl)
  const writing = entries.find((entry) =>
    entry.url.startsWith(`${baseUrl}/writing/`),
  )
  assert.equal(home?.lastModified, undefined)
  assert.ok(writing?.lastModified)
})
