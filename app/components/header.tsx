'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems, site } from 'lib/site'

export function Header() {
  const pathname = usePathname()

  return (
    <header className="mx-auto w-full max-w-[760px] px-6 pt-8 md:pt-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
        <Link
          href="/"
          className="font-serif text-lg tracking-tight no-underline hover:text-accent"
        >
          {site.name}
        </Link>
        <nav className="flex items-center gap-5 font-mono text-sm">
          {navItems.map(({ path, label }) => {
            const active = pathname === path || pathname.startsWith(`${path}/`)
            return (
              <Link
                key={path}
                href={path}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'text-ink no-underline decoration-accent underline underline-offset-4'
                    : 'text-muted no-underline hover:text-accent'
                }
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
