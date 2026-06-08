import type { Listening, NowPlaying, SourceResult, Track } from './types'

/**
 * Spotify "Listening" source.
 *
 * NOTE: Spotify removed algorithmic/editorial playlists (incl. the daylist)
 * from the Web API in Nov 2024, so there is no way to surface the daylist.
 * Instead we show what IS still available for the app owner's own account via
 * an OAuth refresh token: the currently-playing track, recently played, and
 * top track of the last 4 weeks.
 *
 * Required env (server-only):
 *   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
 */

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API = 'https://api.spotify.com/v1'

const RECENT_LIMIT = 4
/** Refresh the live data at most this often (seconds). */
const REVALIDATE = 60

const now = () => new Date().toISOString()

type SpotifyArtist = { name: string }
type SpotifyImage = { url: string; width?: number }
type SpotifyTrack = {
  name: string
  artists: SpotifyArtist[]
  album?: { images?: SpotifyImage[] }
  duration_ms?: number
  external_urls?: { spotify?: string }
}

const TOP_ARTIST_LIMIT = 5

function isConfigured(): boolean {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET &&
      process.env.SPOTIFY_REFRESH_TOKEN,
  )
}

// Access tokens last ~1h. Cache the minted token in module memory so frequent
// now-playing polls reuse it instead of hitting the token endpoint each time.
let tokenCache: { value: string; expires: number } | null = null
/** Renew this many ms before actual expiry to avoid edge-of-expiry 401s. */
const TOKEN_SKEW_MS = 30_000

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && tokenCache.expires - TOKEN_SKEW_MS > Date.now()) {
    return tokenCache.value
  }

  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN
  if (!id || !secret || !refresh) return null

  const basic = Buffer.from(`${id}:${secret}`).toString('base64')
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh,
      }),
      // Access tokens are short-lived; never cache the mint request.
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      access_token?: string
      expires_in?: number
    }
    if (!json.access_token) return null
    tokenCache = {
      value: json.access_token,
      expires: Date.now() + (json.expires_in ?? 3600) * 1000,
    }
    return json.access_token
  } catch {
    return null
  }
}

/** Pick the largest album image Spotify offers (first entry is highest-res). */
function albumArt(track: SpotifyTrack): string | null {
  return track.album?.images?.[0]?.url ?? null
}

function toTrack(track: SpotifyTrack, nowPlaying: boolean): Track {
  return {
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    url: track.external_urls?.spotify ?? 'https://open.spotify.com',
    image: albumArt(track),
    nowPlaying,
  }
}

async function apiGet<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: REVALIDATE },
    })
    // 204 = nothing currently playing; treat as no data, not an error.
    if (res.status === 204 || !res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function getListening(): Promise<SourceResult<Listening>> {
  if (!isConfigured()) {
    return { state: 'unconfigured', data: null, fetchedAt: now() }
  }

  const token = await getAccessToken()
  if (!token) return { state: 'empty', data: null, fetchedAt: now() }

  const [current, recent, top, topArtistsRes] = await Promise.all([
    apiGet<{
      item: SpotifyTrack | null
      is_playing: boolean
      progress_ms: number | null
    }>('/me/player/currently-playing', token),
    apiGet<{ items: { track: SpotifyTrack }[] }>(
      `/me/player/recently-played?limit=${RECENT_LIMIT}`,
      token,
    ),
    apiGet<{ items: SpotifyTrack[] }>(
      '/me/top/tracks?time_range=short_term&limit=1',
      token,
    ),
    apiGet<{ items: SpotifyArtist[] }>(
      `/me/top/artists?time_range=short_term&limit=${TOP_ARTIST_LIMIT}`,
      token,
    ),
  ])

  const playing = Boolean(current?.is_playing && current?.item)
  const currentTrack =
    playing && current?.item ? toTrack(current.item, true) : null
  const progressMs = playing ? (current?.progress_ms ?? null) : null
  const durationMs = playing ? (current?.item?.duration_ms ?? null) : null

  const recentTracks: Track[] = (recent?.items ?? [])
    .map((i) => i.track)
    .filter(Boolean)
    .map((t) => toTrack(t, false))

  const topTrack = top?.items?.[0] ? toTrack(top.items[0], false) : null

  const topArtists = (topArtistsRes?.items ?? []).map((a) => a.name)

  const hasAny =
    currentTrack || recentTracks.length > 0 || topTrack || topArtists.length > 0
  if (!hasAny) return { state: 'empty', data: null, fetchedAt: now() }

  return {
    state: 'ok',
    data: {
      current: currentTrack,
      recent: recentTracks,
      topTrack,
      topArtists,
      progressMs,
      durationMs,
    },
    fetchedAt: now(),
  }
}

// Briefly cache the live snapshot so concurrent client polls collapse into at
// most one upstream Spotify call per window — keeps us well clear of the
// per-app rate limit no matter how many tabs are open.
let nowCache: { result: SourceResult<NowPlaying>; expires: number } | null =
  null
const NOW_TTL_MS = 5000

/**
 * Single-purpose, low-latency playback snapshot for the client poller. Only
 * touches `/me/player/currently-playing` (one request) and skips Next's data
 * cache so each refresh is genuinely current.
 */
export async function getNowPlaying(): Promise<SourceResult<NowPlaying>> {
  if (nowCache && nowCache.expires > Date.now()) return nowCache.result

  const result = await fetchNowPlaying()
  nowCache = { result, expires: Date.now() + NOW_TTL_MS }
  return result
}

async function fetchNowPlaying(): Promise<SourceResult<NowPlaying>> {
  if (!isConfigured()) {
    return { state: 'unconfigured', data: null, fetchedAt: now() }
  }

  const token = await getAccessToken()
  if (!token) return { state: 'empty', data: null, fetchedAt: now() }

  try {
    const res = await fetch(`${API}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    // 204 (nothing playing) or any non-OK: report a valid "not playing" state
    // so the client keeps its last-shown track instead of blanking out.
    if (res.status === 204 || !res.ok) {
      return {
        state: 'ok',
        data: {
          isPlaying: false,
          track: null,
          progressMs: null,
          durationMs: null,
        },
        fetchedAt: now(),
      }
    }

    const body = (await res.json()) as {
      item: SpotifyTrack | null
      is_playing: boolean
      progress_ms: number | null
    }
    const playing = Boolean(body.is_playing && body.item)

    // Keep position/duration whenever there's an item — a paused track reports
    // is_playing:false but still has a meaningful progress_ms, so the client can
    // show a static position rather than discarding it as "last played".
    return {
      state: 'ok',
      data: {
        isPlaying: playing,
        track: body.item ? toTrack(body.item, playing) : null,
        progressMs: body.item ? (body.progress_ms ?? null) : null,
        durationMs: body.item ? (body.item.duration_ms ?? null) : null,
      },
      fetchedAt: now(),
    }
  } catch {
    return { state: 'empty', data: null, fetchedAt: now() }
  }
}
