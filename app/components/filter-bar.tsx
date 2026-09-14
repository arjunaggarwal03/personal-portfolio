import Link from 'next/link'
import { availableLogFilters, isFilterActive, type LogQuery } from 'lib/filters'
import type { LogEntry } from 'lib/content/schemas/log'

export function FilterBar({
  entries,
  query,
}: {
  entries: readonly LogEntry[]
  query: LogQuery
}) {
  return (
    <nav
      aria-label="Filter log entries"
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-y border-border-soft py-3 text-sm"
    >
      {availableLogFilters(entries).map((filter) => {
        const href = filter.query ? `/log?${filter.query}` : '/log'
        const active = isFilterActive(filter, query)
        return (
          <Link
            key={filter.label}
            href={href}
            aria-current={active ? 'true' : undefined}
            // py-1.5 lifts each filter to a >=24px-tall tap target (WCAG 2.5.8
            // Target Size, AA); the narrow labels clear the floor via the
            // spacing exception thanks to the nav's gap.
            className={`py-1.5 ${
              active
                ? 'text-accent underline decoration-accent underline-offset-4'
                : 'text-muted no-underline hover:text-accent'
            }`}
          >
            {filter.label}
          </Link>
        )
      })}
    </nav>
  )
}
