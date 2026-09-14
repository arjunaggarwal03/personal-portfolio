import Link from 'next/link'
import type { LogFilterLink } from 'lib/log-index'

export function FilterBar({ filters }: { filters: readonly LogFilterLink[] }) {
  return (
    <nav
      aria-label="Filter log entries"
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-y border-border-soft py-3 text-sm"
    >
      {filters.map((filter) => (
        <Link
          key={filter.label}
          href={filter.href}
          prefetch={false}
          aria-current={filter.active ? 'true' : undefined}
          // py-1.5 lifts each filter to a >=24px-tall tap target (WCAG 2.5.8
          // Target Size, AA); the narrow labels clear the floor via the
          // spacing exception thanks to the nav's gap.
          className={`py-1.5 ${
            filter.active
              ? 'text-accent underline decoration-accent underline-offset-4'
              : 'text-muted no-underline hover:text-accent'
          }`}
        >
          {filter.label}
        </Link>
      ))}
    </nav>
  )
}
