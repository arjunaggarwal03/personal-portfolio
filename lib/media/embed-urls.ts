const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/
const SPOTIFY_TYPES = new Set([
  'track',
  'album',
  'playlist',
  'artist',
  'show',
  'episode',
])

export function youtubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return null
    let id: string | null = null
    if (url.hostname === 'youtu.be') id = url.pathname.split('/')[1] ?? null
    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : null
      if (url.pathname.startsWith('/embed/')) id = url.pathname.split('/')[2]
    }
    return id && YOUTUBE_ID.test(id)
      ? `https://www.youtube.com/embed/${id}`
      : null
  } catch {
    return null
  }
}

export function spotifyUri(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com')
      return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'embed') parts.shift()
    const [type, id] = parts
    return type && id && SPOTIFY_TYPES.has(type) && /^[a-zA-Z0-9]+$/.test(id)
      ? `spotify:${type}:${id}`
      : null
  } catch {
    return null
  }
}
