import { getLogFeed, paginateLogEntries } from 'lib/content/queries'
import { getSiteModel } from 'lib/content/model'
import { applyLogFilter, activeFilterLabel, type LogQuery } from 'lib/filters'
import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from 'lib/seo'
import { FilterBar } from 'app/components/filter-bar'
import { LogEntryCard } from 'app/components/log-entry-card'
import { PageIntroduction } from 'app/components/editorial'
import { typeStyles } from 'lib/typography'

const description =
  "A working index of what I'm noticing: work, cities, meals, music, films, links, clips, and half-formed thoughts."

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
      <PageIntroduction title="Log">
        <p>
          A chronological record of restaurants, cities, films, music, links,
          work, and things I want to remember.
        </p>
      </PageIntroduction>

      <div>
        <FilterBar query={query} />
      </div>

      {label !== 'All' ? (
        <p className={`${typeStyles.caption} mt-4 text-subtle`}>
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} ·{' '}
          {label}
        </p>
      ) : null}

      <div className="mt-3">
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
          className={`${typeStyles.caption} mt-8 flex items-center justify-between border-t border-border pt-4`}
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
