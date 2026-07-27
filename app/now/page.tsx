import { Suspense } from 'react'
import Link from 'next/link'
import { pageMetadata } from 'lib/seo'
import { ListeningTile } from 'app/components/now/listening-tile'
import { SfTile } from 'app/components/now/sf-tile'
import { TileSkeleton } from 'app/components/now/tile-skeleton'
import { NowTile } from 'app/components/now/now-tile'
import { getSiteModel } from 'lib/content/model'
import { getRecentLogByTypes } from 'lib/content/queries'
import { formatDate } from 'lib/dates'
import { inlineLink } from 'lib/ui'
import { ExternalLink } from 'app/components/external-link'

export const metadata = pageMetadata({
  title: 'Now',
  description:
    "Arjun's current operating context: what he is building, thinking about, listening to, and noticing in San Francisco.",
  path: '/now',
})

// Re-fetch the underlying sources at most once a minute (each source also sets
// its own cadence); keeps the page static-fast while staying current.
export const revalidate = 60

function sanFranciscoTime() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
}

export default function NowPage() {
  const current = getSiteModel().now
  const recent = getRecentLogByTypes(
    [
      'film',
      'meal',
      'restaurant',
      'city',
      'travel',
      'album',
      'song',
      'playlist',
      'photo',
    ],
    5,
  )
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-3xl leading-tight tracking-tight">
          Now
        </h1>
        <span className="font-mono text-xs text-subtle">
          Updated {formatDate(current.lastUpdated)}
        </span>
      </div>
      <p className="mt-3 max-w-prose text-muted">
        A current operating context: the work, questions, music, and places
        closest to me right now. Deliberately edited, not a productivity
        dashboard.
      </p>
      <p className="mt-1">
        <span className="font-mono text-xs text-subtle">
          {sanFranciscoTime()} · San Francisco
        </span>
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <NowTile eyebrow="Building" fetchedAt={current.building.revised}>
            <h2 className="font-serif text-2xl tracking-tight">
              {current.building.title}
            </h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-muted">
              {current.building.summary}
            </p>
            {current.building.href ? (
              <p className="mt-3">
                <ExternalLink
                  className={inlineLink}
                  href={current.building.href}
                >
                  Current work
                </ExternalLink>
              </p>
            ) : null}
          </NowTile>
        </div>
        <div className="md:col-span-2">
          <NowTile eyebrow="Thinking">
            <h2 className="font-serif text-2xl leading-snug tracking-tight">
              {current.thinking.question}
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {current.thinking.perspectives.map((perspective) => (
                <div
                  key={perspective.label}
                  className="border-t border-border-soft pt-3"
                >
                  <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
                    {perspective.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {perspective.view}
                  </p>
                </div>
              ))}
            </div>
            {current.thinking.evidence ? (
              <p className="mt-5 border-t border-border-soft pt-3 text-sm text-subtle">
                <span className="font-mono text-xs uppercase tracking-wider">
                  What would change the view:
                </span>{' '}
                {current.thinking.evidence}
              </p>
            ) : null}
          </NowTile>
        </div>
        <div>
          <Suspense fallback={<TileSkeleton eyebrow="Listening" lines={6} />}>
            <ListeningTile />
          </Suspense>
        </div>
        <div>
          <Suspense
            fallback={<TileSkeleton eyebrow="In San Francisco" lines={3} />}
          >
            <SfTile />
          </Suspense>
        </div>
        <NowTile
          eyebrow="Changed my mind"
          fetchedAt={current.changedMyMind.revised}
        >
          <p className="text-sm text-subtle">
            <span className="font-mono text-[0.7rem] uppercase tracking-wider">
              Before
            </span>
            <br />
            {current.changedMyMind.previous}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink">
            <span className="font-mono text-[0.7rem] uppercase tracking-wider text-accent">
              Now
            </span>
            <br />
            {current.changedMyMind.current}
          </p>
        </NowTile>
        <NowTile eyebrow="Recently">
          {recent.length ? (
            <ul className="divide-y divide-border-soft">
              {recent.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
                >
                  {entry.hasDetailPage ? (
                    <Link href={`/log/${entry.slug}`} className={inlineLink}>
                      {entry.title ?? entry.summary}
                    </Link>
                  ) : (
                    <span>{entry.title ?? entry.summary}</span>
                  )}
                  <span className="shrink-0 font-mono text-[0.7rem] text-subtle">
                    {entry.type}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              Recent film, food, travel, and music notes will appear here from
              the Log.
            </p>
          )}
        </NowTile>
      </div>

      <p className="mt-6 font-mono text-[0.7rem] text-subtle">
        Curated by hand; listening and local conditions come from Spotify and
        Open-Meteo.
      </p>
    </section>
  )
}
