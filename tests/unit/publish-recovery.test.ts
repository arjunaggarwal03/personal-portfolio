import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { uploadCloudinaryWithLookup } from '../../lib/media/cloudinary-publish'
import { publishAction } from '../../lib/media/publish-plan'
import { loadPublishCheckpoints } from '../../lib/media/publish-checkpoints'

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

test('treats only a missing checkpoint file as new state', async (context) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'portfolio-checkpoints-'))
  context.after(() => rm(directory, { recursive: true, force: true }))
  const checkpoint = path.join(directory, 'publish-checkpoints.json')

  assert.deepEqual(await loadPublishCheckpoints(checkpoint), {})
  await writeFile(checkpoint, '{not-json')
  await assert.rejects(loadPublishCheckpoints(checkpoint), /Unable to read/)
  await writeFile(checkpoint, JSON.stringify({ invalid: { complete: true } }))
  await assert.rejects(loadPublishCheckpoints(checkpoint), /Unable to read/)
})
