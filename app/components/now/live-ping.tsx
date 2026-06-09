'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { parseRoute, type Route } from 'lib/now/regions'

/**
 * Live, browser-measured latency for the "This site" tile.
 *
 * Unlike a server-side check, this pings from the *visitor's* browser, so the
 * number is their real round-trip to the site. We time it with the Resource
 * Timing API (responseStart − requestStart = TTFB) — the honest network number,
 * free of JS/main-thread jitter — and read the response's `x-vercel-id` to
 * reconstruct the request's edge → origin route. SWR drives the polling: it
 * pauses on hidden tabs, revalidates on focus, and dedupes.
 *
 * Server-rendered `initial` latency hydrates the first paint and is the no-JS
 * fallback; once mounted, real visitor samples take over and feed the sparkline.
 */

const POLL_MS = 4000
/** Width of the sparkline in slots; also the history we keep. */
const SLOTS = 32

type Sample = {
  ms: number
  ok: boolean
  route: Route | null
  /** 0 for the server-rendered seed; a real client probe otherwise. */
  at: number
}

const perfNow = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now()

/** Fire one probe, preferring Resource Timing TTFB over wall-clock round-trip. */
async function probe(): Promise<Sample> {
  const url = `/api/ping?t=${Date.now()}-${Math.random().toString(36).slice(2)}`
  const t0 = perfNow()
  let ok = false
  let vercelId: string | null = null
  try {
    const res = await fetch(url, { cache: 'no-store' })
    ok = res.ok || res.status === 204
    vercelId = res.headers.get('x-vercel-id')
    await res.arrayBuffer().catch(() => {})
  } catch {
    ok = false
  }
  let ms = Math.round(perfNow() - t0)

  // Same-origin + no-store ⇒ Resource Timing exposes real TTFB. The unique URL
  // guarantees exactly one matching entry.
  try {
    const abs = new URL(url, location.href).href
    const entries = performance.getEntriesByName(
      abs,
    ) as PerformanceResourceTiming[]
    const entry = entries[entries.length - 1]
    if (entry && entry.responseStart > 0 && entry.requestStart > 0) {
      ms = Math.round(entry.responseStart - entry.requestStart)
    }
    // Each probe uses a unique URL, so entries accumulate and would eventually
    // hit the resource-timing buffer cap (~250) — after which the browser stops
    // recording and we'd silently fall back to the noisier wall-clock number.
    // Clearing after each read keeps it bounded; Vercel Analytics/Speed Insights
    // read entries via PerformanceObserver (push), so they're unaffected.
    performance.clearResourceTimings()
  } catch {
    // keep wall-clock fallback
  }

  let route = parseRoute(vercelId)
  // Local dev has no Vercel edge network, so responses carry no `x-vercel-id`
  // and the route can't be real. Show a representative edge→origin route so the
  // full tile is previewable in dev. Production always has a real id and never
  // takes this branch (NODE_ENV is "production" there).
  if (!route && process.env.NODE_ENV === 'development') {
    route = parseRoute('sfo1::iad1::dev')
  }

  return { ms, ok, route, at: Date.now() }
}

type Band = 'fast' | 'ok' | 'slow'

function bandOf(ms: number): Band {
  if (ms < 100) return 'fast'
  if (ms < 300) return 'ok'
  return 'slow'
}

// Muted, palette-friendly latency bands (warm theme — no harsh primaries).
const BAND_COLOR: Record<Band, string> = {
  fast: '#4f8a5b',
  ok: '#b8843a',
  slow: '#b5503c',
}

function formatDistance(km: number): string {
  const rounded =
    km >= 1000 ? Math.round(km / 100) * 100 : Math.round(km / 10) * 10
  return `${rounded.toLocaleString('en-US')} km`
}

const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * Full-width latency chart: a smooth area+line over recent samples with a live
 * dot at the latest point. Built in a 0–100 viewBox with a non-scaling stroke
 * so it stretches edge-to-edge while staying crisp. The line is tinted by the
 * current latency band, giving the tile its own signature graphic (a curve,
 * distinct from the heatmap's cells and the equalizer's bars).
 */
function Sparkline({ samples }: { samples: Sample[] }) {
  const recent = samples.slice(-SLOTS)
  const band = recent.length ? bandOf(recent[recent.length - 1].ms) : 'ok'
  const color = BAND_COLOR[band]
  const max = Math.max(...recent.map((s) => s.ms), 1)
  const n = recent.length

  const pts = recent.map((s, i) => {
    const x = n === 1 ? 100 : (i / (n - 1)) * 100
    const y = 100 - Math.min(96, Math.max(4, (s.ms / max) * 96))
    return [round1(x), round1(y)] as const
  })

  const line = pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ')
  const area = pts.length > 1 ? `${line} L 100 100 L 0 100 Z` : ''
  const last = pts[pts.length - 1]

  return (
    <div className="relative h-10 w-full" title="recent latency">
      <svg
        className="h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="99"
          x2="100"
          y2="99"
          stroke="var(--color-border-soft)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {pts.length > 1 ? (
          <>
            <path d={area} fill={color} fillOpacity={0.12} />
            <path
              d={line}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}
      </svg>
      {last ? (
        <span
          className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${last[0]}%`,
            top: `${last[1]}%`,
            backgroundColor: color,
          }}
        />
      ) : null}
    </div>
  )
}

/** Region code (e.g. `sfo1`) → IATA airport code (e.g. `SFO`). */
const iata = (code: string) => code.slice(0, 3).toUpperCase()

/**
 * Route as a single tidy row: airport codes on the left, distance pushed to the
 * right (mirroring the deploy sha/time footer below it). Codes are short and
 * fixed-width, so the line never wraps or clips like full city names did.
 */
function RouteCaption({ route }: { route: Route }) {
  const { edge, origin, edgeOnly, distanceKm } = route
  if (!edge) return null

  if (edgeOnly || !origin) {
    return (
      <p className="font-mono text-[0.7rem] uppercase tracking-wider text-subtle">
        edge · {iata(edge.code)}
      </p>
    )
  }

  return (
    <div className="flex items-baseline justify-between gap-3 font-mono text-[0.7rem] uppercase tracking-wider text-subtle">
      <span>
        {iata(edge.code)} → {iata(origin.code)}
      </span>
      {distanceKm ? (
        <span className="shrink-0 opacity-70">
          {formatDistance(distanceKm)}
        </span>
      ) : null}
    </div>
  )
}

export function LivePing({
  initial,
}: {
  initial: { ms: number; ok: boolean } | null
}) {
  const seed: Sample = {
    ms: initial?.ms ?? 0,
    ok: initial?.ok ?? false,
    route: null,
    at: 0,
  }

  const { data } = useSWR<Sample>('now-ping', probe, {
    refreshInterval: POLL_MS,
    fallbackData: seed,
    revalidateOnFocus: true,
  })

  const [history, setHistory] = useState<Sample[]>([])
  useEffect(() => {
    // Only real client probes (at > 0) feed the visitor sparkline; the
    // server-rendered seed is just the first-paint number.
    if (!data || data.at === 0) return
    setHistory((prev) => [...prev.slice(-(SLOTS - 1)), data])
  }, [data])

  const latest = data ?? seed
  const up = latest.ok
  const dotColor = up ? BAND_COLOR[bandOf(latest.ms)] : undefined

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="leading-none">
          {up ? (
            <>
              <span className="font-serif text-4xl tracking-tight text-ink">
                {latest.ms}
              </span>
              <span className="text-sm text-muted"> ms</span>
            </>
          ) : (
            <span className="font-serif text-4xl tracking-tight text-subtle">
              —
            </span>
          )}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${up ? 'animate-pulse' : 'bg-subtle'}`}
            style={dotColor ? { backgroundColor: dotColor } : undefined}
            aria-hidden="true"
          />
          {up ? 'Operational · live ping' : 'No response'}
        </p>
      </div>

      <Sparkline samples={history} />

      {latest.route ? <RouteCaption route={latest.route} /> : null}
    </div>
  )
}
