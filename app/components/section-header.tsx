import Link from 'next/link'
import { inlineLink } from 'lib/ui'
import { typeStyles } from 'lib/typography'

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
        <p className={`${typeStyles.metadata} mb-1 text-subtle`}>{eyebrow}</p>
      ) : null}
      <div className="flex items-baseline justify-between gap-4">
        <h2 className={typeStyles.sectionTitle}>{title}</h2>
        {href ? (
          <Link
            href={href}
            className={`${typeStyles.caption} shrink-0 text-muted ${inlineLink}`}
          >
            {hrefLabel ?? 'view all'}
          </Link>
        ) : null}
      </div>
      {description ? (
        <p className={`${typeStyles.smallBody} mt-1 text-muted`}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
