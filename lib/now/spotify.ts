import { clampChroma, formatHex, oklch } from 'culori'
import sharp from 'sharp'
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

// --- Album-art accent extraction -------------------------------------------
// Pull a dominant swatch from the cover and bend it into the site's warm
// palette so every album lands in a harmonious mid-tone band (never neon,
// never washed-out) that reads as an accent on the cream surface AND works as
// a soft glow. Memoized by image URL — album art is immutable, so each cover
// is decoded at most once no matter how many polls reuse it.

const colorCache = new Map<string, string | null>()
const COLOR_TIMEOUT_MS = 2500
/** Cap the memo so a long-lived server instance can't grow it unbounded. */
const COLOR_CACHE_MAX = 64

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

/**
 * Bend a swatch into the site's accent band using OKLCH. Because OKLCH is
 * perceptually uniform, clamping lightness + chroma into a narrow band makes
 * every album land at the *same apparent* brightness/saturation — only the hue
 * varies. (HSL clamping couldn't do this: equal HSL lightness looks far
 * brighter for yellow/green than for blue/purple, so glows were inconsistent.)
 * A hueless (grayscale) cover defaults to the warm terracotta hue so its glow
 * still reads on-palette. `clampChroma` gamut-maps back into sRGB.
 */
function toAccent(r: number, g: number, b: number): string | null {
  const c = oklch({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 })
  if (!c) return null
  const tuned = clampChroma(
    {
      mode: 'oklch',
      l: clamp(c.l, 0.55, 0.62),
      c: clamp(c.c ?? 0, 0.09, 0.14),
      h: c.h ?? 50,
    },
    'oklch',
  )
  return formatHex(tuned) ?? null
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('color timeout')), ms)
  })
  // Clear the timer once the race settles so the rejection callback (and its
  // captured promise) can't linger for the full timeout after a fast decode.
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

/**
 * Fetch the cover and pull its dominant color with sharp (already in the tree
 * for Next's image optimization), then bend it onto the site palette. sharp's
 * histogram-based `dominant` gives a stable representative hue; `toAccent`
 * clamps lightness/chroma so the exact swatch choice doesn't matter — only the
 * hue carries through to the glow.
 */
async function dominantAccent(url: string): Promise<string | null> {
  const res = await fetch(url)
  if (!res.ok) return null
  const buf = Buffer.from(await res.arrayBuffer())
  const { dominant } = await sharp(buf).stats()
  if (!dominant) return null
  return toAccent(dominant.r, dominant.g, dominant.b)
}

async function extractColor(url: string | null): Promise<string | null> {
  if (!url) return null
  const cached = colorCache.get(url)
  if (cached !== undefined) {
    // Touch on read so the cap below evicts genuinely-cold covers (LRU).
    colorCache.delete(url)
    colorCache.set(url, cached)
    return cached
  }

  let result: string | null = null
  try {
    result = await withTimeout(dominantAccent(url), COLOR_TIMEOUT_MS)
  } catch {
    result = null
  }
  if (colorCache.size >= COLOR_CACHE_MAX) {
    const oldest = colorCache.keys().next().value
    if (oldest !== undefined) colorCache.delete(oldest)
  }
  colorCache.set(url, result)
  return result
}

async function apiGet<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      // Never cache: /now is rendered per request, so each refresh should show
      // the genuinely-current track + recently-played list, not a 60s-stale
      // snapshot. The token cache + color memo keep this cheap.
      cache: 'no-store',
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

  const [current, recent, top] = await Promise.all([
    apiGet<{
      item: SpotifyTrack | null
      is_playing: boolean
      progress_ms: number | null
    }>('/me/player/currently-playing', token),
    apiGet<{ items: { track: SpotifyTrack; played_at: string }[] }>(
      `/me/player/recently-played?limit=${RECENT_LIMIT}`,
      token,
    ),
    apiGet<{ items: SpotifyTrack[] }>(
      '/me/top/tracks?time_range=short_term&limit=1',
      token,
    ),
  ])

  const playing = Boolean(current?.is_playing && current?.item)
  const currentTrack =
    playing && current?.item ? toTrack(current.item, true) : null
  const progressMs = playing ? (current?.progress_ms ?? null) : null
  const durationMs = playing ? (current?.item?.duration_ms ?? null) : null

  const recentTracks: Track[] = (recent?.items ?? [])
    .filter((i) => i.track)
    .map((i) => ({ ...toTrack(i.track, false), playedAt: i.played_at }))

  const topTrack = top?.items?.[0] ? toTrack(top.items[0], false) : null

  const hasAny = currentTrack || recentTracks.length > 0 || topTrack
  if (!hasAny) return { state: 'empty', data: null, fetchedAt: now() }

  // Only the headline cover drives the hero glow (the recently-played
  // thumbnails don't use an accent), so extract a single color for whichever
  // track becomes the headline — current → most-recent → top — instead of
  // decoding covers whose accent is never read. Mutating the headline object
  // colors the exact instance the tile re-selects with the same precedence.
  const headline = currentTrack ?? recentTracks[0] ?? topTrack
  if (headline) headline.color = await extractColor(headline.image)

  return {
    state: 'ok',
    data: {
      current: currentTrack,
      recent: recentTracks,
      topTrack,
      progressMs,
      durationMs,
    },
    fetchedAt: now(),
  }
}

/**
 * Single-purpose, low-latency playback snapshot for the client poller. Only
 * touches `/me/player/currently-playing` (one request). Bursts are collapsed at
 * the CDN, not here: the /api/now-playing route sets `s-maxage` +
 * `stale-while-revalidate`, so Vercel serves nearly every poll from the edge
 * and this function only runs once per window globally (across all visitors and
 * instances) — something a per-instance memory cache could never coordinate.
 */
export async function getNowPlaying(): Promise<SourceResult<NowPlaying>> {
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
    const track = body.item ? toTrack(body.item, playing) : null
    if (track) track.color = await extractColor(track.image)

    // Keep position/duration whenever there's an item — a paused track reports
    // is_playing:false but still has a meaningful progress_ms, so the client can
    // show a static position rather than discarding it as "last played".
    return {
      state: 'ok',
      data: {
        isPlaying: playing,
        track,
        progressMs: body.item ? (body.progress_ms ?? null) : null,
        durationMs: body.item ? (body.item.duration_ms ?? null) : null,
      },
      fetchedAt: now(),
    }
  } catch {
    return { state: 'empty', data: null, fetchedAt: now() }
  }
}
