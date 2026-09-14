import { getLogFeed } from 'lib/content/queries'
import { getSiteModel } from 'lib/content/model'
import { buildLogIndex, type LogSearchParams } from 'lib/log-index'
import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from 'lib/seo'
import { FilterBar } from 'app/components/filter-bar'
import { LogEntryCard } from 'app/components/log-entry-card'
import { PageIntroduction } from 'app/components/editorial'
import { typeStyles } from 'lib/typography'

const description =
  'Notes from Arjun Aggarwal on what he is building, thinking about, watching, and listening to.'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<LogSearchParams>
}): Promise<Metadata> {
  const model = getSiteModel()
  const index = buildLogIndex({
    entries: getLogFeed(),
    inNowSlugs: model.now.rotation.selections.map(({ slug }) => slug),
    searchParams: await searchParams,
  })
  return {
    ...pageMetadata({
      title: index.seo.title,
      description,
      path: index.seo.canonicalPath,
    }),
    robots: index.seo.allowIndexing
      ? undefined
      : { index: false, follow: true },
  }
}

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<LogSearchParams>
}) {
  const model = getSiteModel()
  const index = buildLogIndex({
    entries: getLogFeed(),
    inNowSlugs: model.now.rotation.selections.map(({ slug }) => slug),
    searchParams: await searchParams,
  })

  return (
    <section>
      <PageIntroduction title="Log">
        <p>
          A running list of what I&rsquo;ve been working on, thinking about,
          watching, and listening to.
        </p>
      </PageIntroduction>

      <div>
        <FilterBar filters={index.filters} />
      </div>

      {index.resultSummary ? (
        <p className={`${typeStyles.caption} mt-4 text-subtle`}>
          {index.resultSummary.count}{' '}
          {index.resultSummary.count === 1 ? 'entry' : 'entries'} ·{' '}
          {index.resultSummary.label}
        </p>
      ) : null}

      <div className="mt-3">
        {index.entries.length > 0 ? (
          index.entries.map(({ entry, inNow }) => (
            <LogEntryCard key={entry.id} entry={entry} inNow={inNow} />
          ))
        ) : (
          <p className="mt-6 text-muted">Nothing here yet.</p>
        )}
      </div>

      {index.pagination.totalPages > 1 ? (
        <nav
          aria-label="Log pagination"
          className={`${typeStyles.caption} mt-8 flex items-center justify-between border-t border-border pt-4`}
        >
          {index.pagination.newerHref ? (
            <Link href={index.pagination.newerHref}>← Newer</Link>
          ) : (
            <span />
          )}
          <span className="text-subtle">
            Page {index.pagination.page} of {index.pagination.totalPages}
          </span>
          {index.pagination.olderHref ? (
            <Link href={index.pagination.olderHref}>Older →</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </section>
  )
}
