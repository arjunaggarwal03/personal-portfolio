import { getLogFeed, paginateLogEntries } from 'lib/content/queries'
import { applyLogFilter, activeFilterLabel, type LogQuery } from 'lib/filters'
import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from 'lib/seo'
import { FilterBar } from 'app/components/filter-bar'
import { LogEntryCard } from 'app/components/log-entry-card'
import { typeStyles } from 'lib/typography'

const description =
  "A messy index of what I'm noticing: work, cities, meals, music, films, links, clips, and half-formed thoughts."

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
  const filtered = applyLogFilter(getLogFeed(), query)
  const requestedPage = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1)
  const { entries, page, totalPages } = paginateLogEntries(
    filtered,
    requestedPage,
  )
  const label = activeFilterLabel(query)

  return (
    <section>
      <h1 className={typeStyles.indexTitle}>Log</h1>
      <p className="mt-2 max-w-prose text-muted">
        A messy index of what I&rsquo;m noticing: work, cities, meals, music,
        films, links, clips, and half-formed thoughts.
      </p>

      <div className="mt-6">
        <FilterBar query={query} />
      </div>

      {label !== 'All' ? (
        <p className="mt-4 font-mono text-xs text-subtle">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} ·{' '}
          {label}
        </p>
      ) : null}

      <div className="mt-2">
        {entries.length > 0 ? (
          entries.map((entry) => <LogEntryCard key={entry.id} entry={entry} />)
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
