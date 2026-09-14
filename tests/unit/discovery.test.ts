import assert from 'node:assert/strict'
import test from 'node:test'
import { GET as getLlmsIndex } from '../../app/llms.txt/route'
import { GET as getLlmsFull } from '../../app/llms-full.txt/route'
import { getSiteModel } from '../../lib/content/model'
import { getPublicLogWithDetailPages } from '../../lib/content/queries'
import { baseUrl } from '../../lib/site'

test('the immutable content model is built once per server process', () => {
  assert.strictEqual(getSiteModel(), getSiteModel())
})

test('every public Log entry has a canonical page and machine-readable copy', async () => {
  const publicLog = getSiteModel().log.filter(
    (entry) => entry.visibility === 'public',
  )
  const detailPages = getPublicLogWithDetailPages()
  assert.ok(publicLog.length > 0)
  assert.deepEqual(
    detailPages.map((entry) => entry.slug),
    publicLog.map((entry) => entry.slug),
  )

  const [index, full] = await Promise.all([
    getLlmsIndex().text(),
    getLlmsFull().text(),
  ])
  for (const entry of publicLog) {
    const url = `${baseUrl}/log/${entry.slug}`
    assert.match(index, new RegExp(url.replaceAll('.', '\\.')))
    assert.match(full, new RegExp(url.replaceAll('.', '\\.')))
  }
  assert.doesNotMatch(full, /\]\(\//)
})
