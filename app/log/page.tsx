import { getLogFeed } from 'lib/content'
import { applyLogFilter, activeFilterLabel, type LogQuery } from 'lib/filters'
import { pageMetadata } from 'lib/seo'
import { FilterBar } from 'app/components/filter-bar'
import { LogEntryCard } from 'app/components/log-entry-card'

export const metadata = pageMetadata({
  title: 'Log',
  description:
    "A messy index of what I'm noticing: work, cities, meals, music, films, links, clips, and half-formed thoughts.",
  path: '/log',
})

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<LogQuery>
}) {
  const query = await searchParams
  const entries = applyLogFilter(getLogFeed(), query)
  const label = activeFilterLabel(query)

  return (
    <section>
      <h1 className="font-serif text-2xl tracking-tight">Log</h1>
      <p className="mt-2 max-w-prose text-muted">
        A messy index of what I&rsquo;m noticing: work, cities, meals, music,
        films, links, clips, and half-formed thoughts.
      </p>

      <div className="mt-6">
        <FilterBar query={query} />
      </div>

      {label !== 'All' ? (
        <p className="mt-4 font-mono text-xs text-subtle">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} ·{' '}
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
    </section>
  )
}
