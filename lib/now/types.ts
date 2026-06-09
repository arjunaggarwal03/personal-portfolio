/**
 * Shared shapes for the live /now dashboard.
 *
 * Every source fetcher returns a discriminated result so a tile can render one
 * of three states without throwing: `ok` (data), `empty` (source reachable but
 * nothing to show), or `unconfigured` (missing credentials / env). Network or
 * parse failures are mapped to `empty` so one dead upstream never breaks the
 * page. The `fetchedAt` ISO timestamp powers each tile's "updated Xm ago" stamp.
 */

export type SourceState = 'ok' | 'empty' | 'unconfigured'

export type SourceResult<T> = {
  state: SourceState
  data: T | null
  fetchedAt: string
}

export type Track = {
  title: string
  artist: string
  url: string
  /** Largest album-art URL from Spotify, or null when unavailable. */
  image: string | null
  /** Whether this is currently playing (vs. most recently played). */
  nowPlaying: boolean
  /**
   * Album-art accent, extracted server-side and clamped into the site's warm
   * palette. Drives the cover glow + progress/equalizer tint. Null when no art
   * or extraction failed — the UI falls back to the default accent.
   */
  color?: string | null
  /** ISO timestamp this track was played (recently-played items only). */
  playedAt?: string
}

export type Listening = {
  current: Track | null
  recent: Track[]
  topTrack: Track | null
  /**
   * Playback progress for the currently-playing track, in milliseconds.
   * Both null unless something is actively playing (drives the progress bar).
   */
  progressMs: number | null
  durationMs: number | null
}

/**
 * Lightweight live-playback snapshot, polled by the client every few seconds
 * (Spotify has no webhooks/push — polling + local ticking is the only option).
 */
export type NowPlaying = {
  isPlaying: boolean
  track: Track | null
  /** Playback position + length in ms, when actively playing. */
  progressMs: number | null
  durationMs: number | null
}

export type Commit = {
  repo: string
  message: string
  sha: string
  url: string
  /** ISO timestamp of the push. */
  date: string
}

/** One day of GitHub contribution activity, for the heatmap. */
export type ContributionDay = {
  /** ISO date (YYYY-MM-DD). */
  date: string
  count: number
}

export type Building = {
  commits: Commit[]
  /**
   * Commits authored in the trailing 7 days (GraphQL `totalCommitContributions`,
   * with a public commit-search fallback). Counts commits specifically — not all
   * contributions — so private/restricted activity doesn't inflate the number.
   */
  commitsThisWeek: number
  /**
   * Recent contribution calendar, as weeks of days (Sun→Sat). Sourced from the
   * GitHub GraphQL contributions API; empty when no token is configured.
   */
  contributions: ContributionDay[][]
}

export type Weather = {
  temperatureF: number
  condition: string
  /** US AQI value + category label, when the air-quality feed responds. */
  aqi: number | null
  aqiLabel: string | null
  /** Local "h:mm a" sunset, and minutes of daylight remaining (≥0). */
  sunset: string
  goldenHour: string
  daylightLeftMin: number
  isDaytime: boolean
  /**
   * Sun's position through the day as a 0→1 fraction between sunrise and
   * sunset (drives the sun-arc dot); null before sunrise / after sunset.
   */
  dayFraction: number | null
}

export type Deploy = {
  /** First line of the deployed commit message, when available. */
  message: string
  /** Deploy environment / target, e.g. "production". */
  env: string
  /** Git branch the deploy shipped from. */
  ref: string
  /** Short commit SHA. */
  sha: string
  /** ISO timestamp the running build shipped (build time on Vercel). */
  createdAt: string
  url: string
}

export type Ping = {
  ok: boolean
  ms: number
}

export type SiteStatus = {
  deploy: Deploy | null
  ping: Ping | null
}
