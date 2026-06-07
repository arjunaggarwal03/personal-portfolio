import Link from 'next/link'

export type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  hrefLabel?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  hrefLabel,
}: SectionHeaderProps) {
  return (
    <div className="mb-5">
      {eyebrow ? (
        <p className="mb-1 font-mono text-xs uppercase tracking-wider text-subtle">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-xl tracking-tight">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="shrink-0 font-mono text-xs text-muted no-underline hover:text-accent"
          >
            {hrefLabel ?? 'view all'}
          </Link>
        ) : null}
      </div>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
    </div>
  )
}
