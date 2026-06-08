'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import useSWR from 'swr'
import type { NowPlaying as NowPlayingData, Track } from 'lib/now/types'
import { ExternalLink } from '../external-link'

/**
 * Live "Listening" hero. Spotify exposes no push/webhook API, so we poll a
 * server proxy and tick the progress bar locally between polls — the pattern
 * Spotify's own engineers recommend (poll every few seconds, advance the
 * player every second, reconcile on each response).
 *
 * - SWR drives the polling: `refreshInterval` schedules the polls, pauses while
 *   the tab is hidden, revalidates on focus/reconnect, and dedupes — so we
 *   don't hand-roll interval + visibility plumbing.
 * - Hydrates from server-rendered `initial` data via `fallbackData`, so it
 *   shows real content on first paint and degrades gracefully without JS.
 * - The per-second progress tick lives in <TrackProgress>, which mutates the
 *   bar's width via a ref instead of setState — so the parent (album art,
 *   equalizer, text) never re-renders between polls (react best-practices 5.15
 *   "useRef for Transient Values").
 */

const POLL_MS = 10_000
const TICK_MS = 1_000

const perfNow = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now()

const fetcher = async (url: string): Promise<NowPlayingData | null> => {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`now-playing: ${res.status}`)
  const json = (await res.json()) as { data: NowPlayingData | null }
  return json.data ?? null
}

type Playback = {
  track: Track | null
  isPlaying: boolean
  /** Server-reported position at the moment we anchored, in ms. */
  baseMs: number
  durationMs: number | null
  /** perfNow() when baseMs was captured; 0 until the first client anchor. */
  anchor: number
}

function Equalizer() {
  return (
    <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
      {[0, 180, 360].map((delay) => (
        <span
          key={delay}
          className="now-eq-bar h-full w-[3px] rounded-sm bg-accent"
          style={{ '--eq-delay': `${delay}ms` } as CSSProperties}
        />
      ))}
    </span>
  )
}

function Cover({ track }: { track: Track | null }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border-soft bg-surface-muted">
      {track?.image ? (
        <Image
          key={track.image}
          src={track.image}
          alt=""
          fill
          sizes="(min-width: 768px) 20rem, 100vw"
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center font-serif text-3xl text-subtle/60"
        >
          ♪
        </span>
      )}
    </div>
  )
}

/**
 * Progress bar that advances once a second while playing. Updates happen by
 * mutating the fill element's width through a ref (no state → no re-render);
 * the CSS width transition smooths the steps. Calls `onEnded` once when the
 * track runs out so the parent can reconcile with a fresh poll.
 */
function TrackProgress({
  isPlaying,
  baseMs,
  durationMs,
  anchor,
  onEnded,
}: {
  isPlaying: boolean
  baseMs: number
  durationMs: number | null
  anchor: number
  onEnded: () => void
}) {
  const barRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded

  useEffect(() => {
    if (!isPlaying || durationMs === null) return
    let fired = false
    const update = () => {
      const displayMs = Math.min(durationMs, baseMs + (perfNow() - anchor))
      const pct = Math.min(100, (displayMs / durationMs) * 100)
      if (fillRef.current) fillRef.current.style.width = `${pct}%`
      barRef.current?.setAttribute('aria-valuenow', String(Math.round(pct)))
      if (!fired && displayMs >= durationMs) {
        fired = true
        onEndedRef.current()
      }
    }
    update()
    const id = setInterval(update, TICK_MS)
    return () => clearInterval(id)
  }, [isPlaying, baseMs, durationMs, anchor])

  if (durationMs === null) return null

  const startPct = Math.min(
    100,
    (Math.min(durationMs, baseMs) / durationMs) * 100,
  )
  return (
    <div
      ref={barRef}
      // A ref-animated fill (smooth per-second width transition) needs a plain
      // div; <progress>'s fill is only themeable via inconsistent browser
      // pseudo-elements. role + full aria-value* is an equally accessible bar.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(startPct)}
      aria-label="Track progress"
      className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border-soft"
    >
      <div
        ref={fillRef}
        className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
        style={{ width: `${startPct}%` }}
      />
    </div>
  )
}

export function NowPlaying({ initial }: { initial: NowPlayingData }) {
  const { data: snap, mutate } = useSWR<NowPlayingData | null>(
    '/api/now-playing',
    fetcher,
    {
      refreshInterval: POLL_MS,
      fallbackData: initial,
      keepPreviousData: true,
    },
  )

  // Project each poll into displayable playback, re-anchoring the clock so the
  // tick interpolates from the freshly reported position. A response with no
  // track means nothing is playing — keep the last track but drop the bar.
  const [state, setState] = useState<Playback>({
    track: initial.track,
    isPlaying: initial.isPlaying,
    baseMs: initial.progressMs ?? 0,
    durationMs: initial.durationMs,
    anchor: 0,
  })

  useEffect(() => {
    setState((prev) =>
      snap?.track
        ? {
            track: snap.track,
            isPlaying: snap.isPlaying,
            baseMs: snap.progressMs ?? 0,
            durationMs: snap.durationMs,
            anchor: perfNow(),
          }
        : { ...prev, isPlaying: false, durationMs: null },
    )
  }, [snap])

  const { track, isPlaying, baseMs, durationMs, anchor } = state
  const status = isPlaying
    ? 'now playing'
    : durationMs !== null
      ? 'paused'
      : 'last played'

  return (
    <div className="flex flex-col gap-4">
      <Cover track={track} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {isPlaying ? <Equalizer /> : null}
          <span className="font-mono text-[0.7rem] uppercase tracking-wider text-subtle">
            {status}
          </span>
        </div>

        {track ? (
          <ExternalLink
            href={track.url}
            className="font-serif text-xl leading-tight tracking-tight text-ink no-underline hover:text-accent"
          >
            {track.title}
          </ExternalLink>
        ) : (
          <span className="font-serif text-xl text-subtle">
            Nothing playing
          </span>
        )}
        {track ? (
          <p className="text-sm leading-snug text-muted">{track.artist}</p>
        ) : null}

        <TrackProgress
          isPlaying={isPlaying}
          baseMs={baseMs}
          durationMs={durationMs}
          anchor={anchor}
          onEnded={() => {
            void mutate()
          }}
        />
      </div>
    </div>
  )
}
