import assert from 'node:assert/strict'
import test from 'node:test'
import { spotifyUri, youtubeEmbedUrl } from '../../lib/media/embed-urls'

test('accepts exact YouTube hosts and known URL shapes', () => {
  assert.equal(
    youtubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
  )
  assert.equal(
    youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ'),
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
  )
})

test('rejects lookalike hosts, insecure URLs, and invalid IDs', () => {
  assert.equal(
    youtubeEmbedUrl('https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ'),
    null,
  )
  assert.equal(youtubeEmbedUrl('http://youtube.com/watch?v=dQw4w9WgXcQ'), null)
  assert.equal(youtubeEmbedUrl('https://youtube.com/watch?v=short'), null)
})

test('accepts only exact Spotify embed resources', () => {
  assert.equal(
    spotifyUri('https://open.spotify.com/album/abc123'),
    'spotify:album:abc123',
  )
  assert.equal(
    spotifyUri('https://open.spotify.com.evil.test/album/abc123'),
    null,
  )
})
