import assert from 'node:assert/strict'
import test from 'node:test'
import {
  spotifyEmbed,
  spotifyUri,
  youtubeEmbedUrl,
} from '../../lib/media/embed-urls'

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
  assert.equal(
    spotifyUri('https://open.spotify.com/album/abc123/unexpected'),
    null,
  )
})

test('builds a lazy iframe-ready Spotify embed without the client API', () => {
  assert.deepEqual(spotifyEmbed('https://open.spotify.com/track/abc123'), {
    url: 'https://open.spotify.com/embed/track/abc123',
    title: 'Spotify track player',
    height: 152,
  })
  assert.deepEqual(spotifyEmbed('https://open.spotify.com/playlist/abc123'), {
    url: 'https://open.spotify.com/embed/playlist/abc123',
    title: 'Spotify playlist player',
    height: 352,
  })
})
