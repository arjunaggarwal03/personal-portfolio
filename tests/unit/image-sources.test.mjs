import assert from 'node:assert/strict'
import test from 'node:test'
import imageSources from '../../lib/media/image-sources.js'

const { isAllowedImageSource, isAllowedRemoteImageUrl } = imageSources

test('keeps image validation aligned with the Next.js allowlist', () => {
  assert.equal(isAllowedImageSource('/local/image.jpg'), true)
  assert.equal(isAllowedImageSource('//attacker.example/image.jpg'), false)
  assert.equal(
    isAllowedRemoteImageUrl(
      'https://res.cloudinary.com/demo/image/upload/example.jpg',
    ),
    true,
  )
  assert.equal(
    isAllowedRemoteImageUrl('https://attacker.example/image.jpg'),
    false,
  )
  assert.equal(isAllowedRemoteImageUrl('https://i.scdn.co/image/test'), true)
  assert.equal(isAllowedRemoteImageUrl('https://scdn.co/image/test'), false)
})
