import 'server-only'
import { spotifyEnv } from 'lib/env/server'
import type { Listening, SourceResult, Track } from './types'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API = 'https://api.spotify.com/v1'
const RECENT_LIMIT = 4
const TOKEN_SKEW_MS = 30_000

type SpotifyTrack = {
  name: string
  artists: { name: string }[]
  album?: { images?: { url: string }[] }
  external_urls?: { spotify?: string }
}

const now = () => new Date().toISOString()
let tokenCache: { value: string; expires: number } | null = null

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && tokenCache.expires - TOKEN_SKEW_MS > Date.now()) {
    return tokenCache.value
  }
  const config = spotifyEnv()
  if (!config) return null

  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: config.refreshToken,
      }),
      cache: 'no-store',
    })
    if (!response.ok) return null
    const body = (await response.json()) as {
      access_token?: string
      expires_in?: number
    }
    if (!body.access_token) return null
    tokenCache = {
      value: body.access_token,
      expires: Date.now() + (body.expires_in ?? 3600) * 1000,
    }
    return body.access_token
  } catch {
    return null
  }
}

function toTrack(track: SpotifyTrack, nowPlaying: boolean): Track {
  return {
    title: track.name,
    artist: track.artists.map(({ name }) => name).join(', '),
    url: track.external_urls?.spotify ?? 'https://open.spotify.com',
    image: track.album?.images?.[0]?.url ?? null,
    nowPlaying,
  }
}

async function apiGet<T>(path: string, token: string): Promise<T | null> {
  try {
    const response = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (response.status === 204 || !response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function getListening(): Promise<SourceResult<Listening>> {
  if (!spotifyEnv()) {
    return { state: 'unconfigured', data: null, fetchedAt: now() }
  }
  const token = await getAccessToken()
  if (!token) return { state: 'empty', data: null, fetchedAt: now() }

  const [current, recent, top] = await Promise.all([
    apiGet<{ item: SpotifyTrack | null; is_playing: boolean }>(
      '/me/player/currently-playing',
      token,
    ),
    apiGet<{ items: { track: SpotifyTrack; played_at: string }[] }>(
      `/me/player/recently-played?limit=${RECENT_LIMIT}`,
      token,
    ),
    apiGet<{ items: SpotifyTrack[] }>(
      '/me/top/tracks?time_range=short_term&limit=1',
      token,
    ),
  ])

  const currentTrack =
    current?.is_playing && current.item ? toTrack(current.item, true) : null
  const recentTracks = (recent?.items ?? []).map(({ track, played_at }) => ({
    ...toTrack(track, false),
    playedAt: played_at,
  }))
  const topTrack = top?.items?.[0] ? toTrack(top.items[0], false) : null
  if (!currentTrack && recentTracks.length === 0 && !topTrack) {
    return { state: 'empty', data: null, fetchedAt: now() }
  }
  return {
    state: 'ok',
    data: { current: currentTrack, recent: recentTracks, topTrack },
    fetchedAt: now(),
  }
}
