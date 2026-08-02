import assert from 'node:assert/strict'
import test from 'node:test'
import {
  cloudinaryImageUrl,
  isCloudinaryDeliveryUrl,
} from '../../lib/media/cloudinary'

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

test('Cloudinary delivery validation uses an exact HTTPS hostname', () => {
  assert.equal(
    isCloudinaryDeliveryUrl(
      'https://res.cloudinary.com/demo/image/upload/example',
    ),
    true,
  )
  assert.equal(
    isCloudinaryDeliveryUrl(
      'https://res.cloudinary.com.attacker.example/image/upload/example',
    ),
    false,
  )
  assert.equal(
    isCloudinaryDeliveryUrl(
      'https://attacker.example/res.cloudinary.com/image/upload/example',
    ),
    false,
  )
  assert.equal(
    isCloudinaryDeliveryUrl(
      'https://attacker.example/?next=res.cloudinary.com',
    ),
    false,
  )
  assert.equal(
    isCloudinaryDeliveryUrl(
      'http://res.cloudinary.com/demo/image/upload/example',
    ),
    false,
  )
})
