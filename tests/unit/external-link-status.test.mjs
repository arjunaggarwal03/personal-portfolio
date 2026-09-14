import assert from 'node:assert/strict'
import test from 'node:test'
import { isExternalLinkFailure } from '../../scripts/external-link-status.mjs'

test('fails ordinary client and server errors but allows known bot blocks', () => {
  assert.equal(isExternalLinkFailure(400), true)
  assert.equal(isExternalLinkFailure(404), true)
  assert.equal(isExternalLinkFailure(500), true)
  assert.equal(isExternalLinkFailure(403), false)
  assert.equal(isExternalLinkFailure(429), false)
  assert.equal(isExternalLinkFailure(399), false)
})
