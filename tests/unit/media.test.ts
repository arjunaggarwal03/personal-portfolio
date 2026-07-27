import assert from 'node:assert/strict'
import test from 'node:test'
import { cloudinaryImageUrl } from '../../lib/media/cloudinary'

test('Cloudinary delivery is direct, bounded, and auto-formatted', () => {
  const url = cloudinaryImageUrl('portfolio/log/example', 1280.4, 'demo-cloud')
  assert.equal(
    url,
    'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,q_auto,w_1280/portfolio/log/example',
  )
  assert.equal(url?.includes('/_next/image'), false)
})

test('Cloudinary delivery has no hidden credential requirement', () => {
  assert.equal(cloudinaryImageUrl('example', 640, ''), undefined)
})
