import assert from 'node:assert/strict'
import test from 'node:test'
import { uploadCloudinaryWithLookup } from '../../lib/media/cloudinary-publish'
import { publishAction } from '../../lib/media/publish-plan'

test('recovers a prior Cloudinary upload through idempotent lookup', async () => {
  let lookups = 0
  const result = await uploadCloudinaryWithLookup({
    upload: async () => {
      throw Object.assign(new Error('already exists'), { http_code: 409 })
    },
    lookup: async () => {
      lookups += 1
      return { public_id: 'portfolio/log/hash' }
    },
  })
  assert.deepEqual(result, { public_id: 'portfolio/log/hash' })
  assert.equal(lookups, 1)
})

test('resumes partial Mux state and skips completed upload bytes', () => {
  assert.equal(
    publishAction(
      { kind: 'video' },
      { muxUploadId: 'upload-id', stage: 'created', uploadedBytes: 1024 },
      undefined,
    ),
    'resumable',
  )
  assert.equal(
    publishAction(
      { kind: 'video' },
      {
        complete: true,
        record: {
          id: 'video-id' as never,
          kind: 'video',
          provider: 'mux',
          sourceId: 'asset-id',
          playbackId: 'playback-id',
          width: 1280,
          height: 720,
          duration: 5,
          alt: 'Test video',
          visibility: 'public',
        },
      },
      undefined,
    ),
    'skip-upload',
  )
})

test('refuses an unexplained catalog collision', () => {
  assert.equal(
    publishAction({ kind: 'image' }, undefined, {
      id: 'image-id' as never,
      kind: 'image',
      provider: 'cloudinary',
      sourceId: 'portfolio/log/hash',
      width: 1200,
      height: 800,
      alt: 'Test image',
      visibility: 'public',
    }),
    'conflicting',
  )
})
