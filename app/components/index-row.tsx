import Link from 'next/link'
import { titleLink } from 'lib/ui'
import { typeStyles } from 'lib/typography'
import { TagList } from './tag-pill'

export type IndexRowProps = {
  title: string
  href?: string
  kicker?: string
  description?: string
  meta?: string
  metaSlot?: React.ReactNode
  tags?: string[]
  tagHrefBase?: string
  /** Heading level for the row title. Use 2 at the top of a page (directly
   *  under the h1) and 3 when nested under an h2 section header. */
  headingLevel?: 2 | 3
}

export function IndexRow({
  title,
  href,
  kicker,
  description,
  meta,
  metaSlot,
  tags,
  tagHrefBase,
  headingLevel = 2,
}: IndexRowProps) {
  const titleNode = href ? (
    <Link href={href} className={titleLink}>
      {title}
    </Link>
  ) : (
    title
  )

  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <div className="border-t border-border py-5 first:border-t-0">
      <div className="flex items-baseline justify-between gap-4">
        <Heading className={typeStyles.cardTitle}>{titleNode}</Heading>
        {metaSlot ??
          (meta ? (
            <span className={`${typeStyles.caption} shrink-0 text-subtle`}>
              {meta}
            </span>
          ) : null)}
      </div>
      {kicker ? (
        <p className={`${typeStyles.caption} mt-0.5 text-subtle`}>{kicker}</p>
      ) : null}
      {description ? (
        <p className={`${typeStyles.smallBody} mt-2 text-muted`}>
          {description}
        </p>
      ) : null}
      {tags && tags.length > 0 ? (
        <div className="mt-3">
          <TagList tags={tags} hrefBase={tagHrefBase} />
        </div>
      ) : null}
    </div>
  )
}
