import { Suspense } from 'react'
import { pageMetadata } from 'lib/seo'
import { ListeningTile } from 'app/components/now/listening-tile'
import { BuildingTile } from 'app/components/now/building-tile'
import { SfTile } from 'app/components/now/sf-tile'
import { SiteTile } from 'app/components/now/site-tile'
import { TileSkeleton } from 'app/components/now/tile-skeleton'
import { LiveClock } from 'app/components/now/live-clock'

export const metadata = pageMetadata({
  title: 'Now',
  description:
    'A live snapshot of what Arjun is listening to, recent public GitHub activity, San Francisco weather, and the status of this site.',
  path: '/now',
})

// Re-fetch the underlying sources at most once a minute (each source also sets
// its own cadence); keeps the page static-fast while staying current.
export const revalidate = 60

export default function NowPage() {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-3xl leading-tight tracking-tight">
          Now
        </h1>
        <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-subtle">
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
            aria-hidden="true"
          />
          Live
        </span>
      </div>
      <p className="mt-3 max-w-prose text-muted">
        A small, live snapshot: what I&rsquo;m listening to, what has changed on
        my public GitHub, and the weather in San Francisco.
      </p>
      <p className="mt-2 max-w-prose text-muted">
        It is more ambient than comprehensive. Most of my current work happens
        in private repositories.
      </p>
      <p className="mt-1">
        <LiveClock />
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:row-span-2">
          <Suspense fallback={<TileSkeleton eyebrow="Listening" lines={6} />}>
            <ListeningTile />
          </Suspense>
        </div>
        <div className="md:col-span-2">
          <Suspense
            fallback={<TileSkeleton eyebrow="Public GitHub" lines={4} />}
          >
            <BuildingTile />
          </Suspense>
        </div>
        <Suspense
          fallback={<TileSkeleton eyebrow="In San Francisco" lines={3} />}
        >
          <SfTile />
        </Suspense>
        <Suspense fallback={<TileSkeleton eyebrow="Site status" lines={3} />}>
          <SiteTile />
        </Suspense>
      </div>

      <p className="mt-6 font-mono text-[0.7rem] text-subtle">
        Updated from Spotify, public GitHub activity, Open-Meteo, and Vercel.
      </p>
    </section>
  )
}
