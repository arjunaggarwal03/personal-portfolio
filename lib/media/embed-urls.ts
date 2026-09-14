const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/
const SPOTIFY_HEIGHTS = {
  track: 152,
  album: 352,
  playlist: 352,
  artist: 352,
  show: 352,
  episode: 352,
} as const

type SpotifyResource = {
  type: keyof typeof SPOTIFY_HEIGHTS
  id: string
}

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

function spotifyResource(value: string): SpotifyResource | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com')
      return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'embed') parts.shift()
    const [type, id] = parts
    if (
      parts.length !== 2 ||
      !type ||
      !id ||
      !Object.hasOwn(SPOTIFY_HEIGHTS, type) ||
      !/^[a-zA-Z0-9]+$/.test(id)
    )
      return null
    return { type: type as SpotifyResource['type'], id }
  } catch {
    return null
  }
}

export function spotifyUri(value: string): string | null {
  const resource = spotifyResource(value)
  return resource ? `spotify:${resource.type}:${resource.id}` : null
}

export function spotifyEmbed(value: string): {
  url: string
  title: string
  height: number
} | null {
  const resource = spotifyResource(value)
  if (!resource) return null
  return {
    url: `https://open.spotify.com/embed/${resource.type}/${resource.id}`,
    title: `Spotify ${resource.type} player`,
    height: SPOTIFY_HEIGHTS[resource.type],
  }
}
