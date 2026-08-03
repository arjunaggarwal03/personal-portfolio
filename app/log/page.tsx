import { getLogFeed, paginateLogEntries } from 'lib/content/queries'
import { getSiteModel } from 'lib/content/model'
import { applyLogFilter, activeFilterLabel, type LogQuery } from 'lib/filters'
import { selectLogPair, utcDayKey } from 'lib/log/pairing'
import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from 'lib/seo'
import { FilterBar } from 'app/components/filter-bar'
import { LogEntryCard } from 'app/components/log-entry-card'
import { MetadataLine, PageIntroduction } from 'app/components/editorial'
import { inlineLink } from 'lib/ui'

const description =
  "A working index of what I'm noticing: work, cities, meals, music, films, links, clips, and half-formed thoughts."

export const revalidate = 3600

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<LogQuery>
}): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1)
  const path = page > 1 ? `/log?page=${page}` : '/log'
  return pageMetadata({
    title: page > 1 ? `Log · Page ${page}` : 'Log',
    description,
    path,
  })
}

function pageHref(query: LogQuery, page: number): string {
  const params = new URLSearchParams()
  if (query.type) params.set('type', query.type)
  if (query.view) params.set('view', query.view)
  if (query.tag) params.set('tag', query.tag)
  if (query.pair) params.set('pair', query.pair)
  if (page > 1) params.set('page', String(page))
  const value = params.toString()
  return value ? `/log?${value}` : '/log'
}

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<LogQuery>
}) {
  const query = await searchParams
  const model = getSiteModel()
  const filtered = applyLogFilter(getLogFeed(), query)
  const requestedPage = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1)
  const pairIteration = Math.max(0, Number.parseInt(query.pair ?? '0', 10) || 0)
  const pair = selectLogPair(model.log, utcDayKey(new Date()), pairIteration)
  const onView = new Set(
    model.now.rotation.selections.map((selection) => selection.slug),
  )
  const { entries, page, totalPages } = paginateLogEntries(
    filtered,
    requestedPage,
  )
  const label = activeFilterLabel(query)

  return (
    <section>
      <PageIntroduction title="The Field Index" eyebrow="Log">
        <p>
          A working archive of what crosses my attention. Chronology preserves
          the record; tags and occasional pairings create paths back through it.
        </p>
      </PageIntroduction>

      {pair ? (
        <section className="border-y border-border py-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <MetadataLine>Place two things beside each other</MetadataLine>
              <h2 className="sr-only">Today&rsquo;s pairing</h2>
            </div>
            <Link
              href={`/log?pair=${pairIteration + 1}`}
              className={inlineLink}
            >
              Another pair
            </Link>
          </div>
          <div className="mt-3 grid gap-6 sm:grid-cols-2 sm:divide-x sm:divide-border-soft">
            {pair.map((entry) => (
              <div key={entry.id} className="sm:pr-6 sm:last:pr-0 sm:last:pl-6">
                <LogEntryCard
                  entry={entry}
                  onView={onView.has(entry.slug)}
                  anchor={false}
                  paired
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-9">
        <FilterBar query={query} />
      </div>

      {label !== 'All' ? (
        <p className="mt-4 font-mono text-xs text-subtle">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} ·{' '}
          {label}
        </p>
      ) : null}

      <div className="archive-grid mt-3">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <LogEntryCard
              key={entry.id}
              entry={entry}
              onView={onView.has(entry.slug)}
            />
          ))
        ) : (
          <p className="mt-6 text-muted">Nothing here yet.</p>
        )}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Log pagination"
          className="mt-8 flex items-center justify-between border-t border-border pt-4 font-mono text-xs"
        >
          {page > 1 ? (
            <Link href={pageHref(query, page - 1)}>← Newer</Link>
          ) : (
            <span />
          )}
          <span className="text-subtle">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(query, page + 1)}>Older →</Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </section>
  )
}
