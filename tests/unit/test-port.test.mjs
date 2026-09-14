import assert from 'node:assert/strict'
import test from 'node:test'
import { findAvailablePort, parseTestPort } from '../../scripts/test-port.mjs'

test('allocates and validates isolated test ports', async () => {
  assert.equal(parseTestPort('3107'), 3107)
  assert.throws(() => parseTestPort('70000'), /Invalid test port/)
  const port = await findAvailablePort()
  assert.equal(Number.isSafeInteger(port), true)
  assert.equal(port > 0 && port <= 65_535, true)
})
