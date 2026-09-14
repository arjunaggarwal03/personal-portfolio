import assert from 'node:assert/strict'
import test from 'node:test'
import { serializeJsonLd } from '../../app/components/json-ld'

test('escapes markup-significant characters in JSON-LD', () => {
  const serialized = serializeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: '</script><script>globalThis.injected = true</script>',
  })
  assert.equal(serialized.includes('</script>'), false)
  assert.match(serialized, /\\u003c\/script>/)
})
