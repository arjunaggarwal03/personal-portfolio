import Link from 'next/link'
import { LOG_FILTERS, isFilterActive, type LogQuery } from 'lib/filters'

export function FilterBar({ query }: { query: LogQuery }) {
  return (
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-y border-border-soft py-3 font-mono text-xs">
      {LOG_FILTERS.map((filter) => {
        const href = filter.query ? `/log?${filter.query}` : '/log'
        const active = isFilterActive(filter, query)
        return (
          <Link
            key={filter.label}
            href={href}
            className={
              active
                ? 'text-accent no-underline'
                : 'text-muted no-underline hover:text-accent'
            }
          >
            {filter.label}
          </Link>
        )
      })}
    </nav>
  )
}
