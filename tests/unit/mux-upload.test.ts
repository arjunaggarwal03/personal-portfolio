import assert from 'node:assert/strict'
import test from 'node:test'
import { nextUploadedByte } from '../../lib/media/mux-upload'

test('continues after the exact range acknowledged by Mux storage', () => {
  assert.equal(nextUploadedByte('bytes=0-20971519', 0), 20 * 1024 * 1024)
})

test('uses the checkpoint fallback for absent or malformed ranges', () => {
  assert.equal(nextUploadedByte(null, 42), 42)
  assert.equal(nextUploadedByte('bytes=12-20', 42), 42)
})
