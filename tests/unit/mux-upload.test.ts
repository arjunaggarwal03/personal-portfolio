import assert from 'node:assert/strict'
import test from 'node:test'
import {
  nextUploadedByte,
  uploadResumableChunks,
} from '../../lib/media/mux-upload'

test('continues after the exact range acknowledged by Mux storage', () => {
  assert.equal(nextUploadedByte('bytes=0-20971519', 0), 20 * 1024 * 1024)
})

test('uses the checkpoint fallback for absent or malformed ranges', () => {
  assert.equal(nextUploadedByte(null, 42), 42)
  assert.equal(nextUploadedByte('bytes=12-20', 42), 42)
})

test('fills every chunk across short reads before sending it', async () => {
  const source = Buffer.from('abcde')
  const sent: { value: string; start: number; end: number; total: number }[] =
    []
  const progress: number[] = []

  const uploaded = await uploadResumableChunks({
    reader: {
      async read(buffer, offset, length, position) {
        const bytesRead = Math.min(2, length, source.length - position)
        source.copy(buffer, offset, position, position + bytesRead)
        return { bytesRead }
      },
    },
    fileSize: source.length,
    startByte: 0,
    chunkSize: 4,
    async send(chunk) {
      sent.push({
        value: chunk.bytes.toString(),
        start: chunk.start,
        end: chunk.end,
        total: chunk.total,
      })
      return null
    },
    async onProgress(value) {
      progress.push(value)
    },
  })

  assert.equal(uploaded, 5)
  assert.deepEqual(sent, [
    { value: 'abcd', start: 0, end: 3, total: 5 },
    { value: 'e', start: 4, end: 4, total: 5 },
  ])
  assert.deepEqual(progress, [4, 5])
})

test('fails instead of sending a partially filled chunk', async () => {
  await assert.rejects(
    uploadResumableChunks({
      reader: {
        async read() {
          return { bytesRead: 0 }
        },
      },
      fileSize: 4,
      startByte: 0,
      chunkSize: 4,
      async send() {
        assert.fail('send must not run after an incomplete read')
      },
      async onProgress() {},
    }),
    /Unexpected end of upload source/,
  )
})
