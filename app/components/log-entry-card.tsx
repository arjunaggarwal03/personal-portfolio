import Link from 'next/link'
import { inlineLink, titleLink } from 'lib/ui'
import { ExternalLink } from './external-link'
import type { LogEntry } from 'lib/content/schemas/log'
import { formatDateShort } from 'lib/dates'
import { getAsset, hasDetailPage } from 'lib/content/queries'
import { RatingBadge } from './rating-badge'
import { TagList } from './tag-pill'
import { PersonalMediaCover } from './personal-media-cover'
import { typeStyles } from 'lib/typography'

function metaLine(entry: LogEntry): string {
  const parts = [formatDateShort(entry.date), entry.type]
  if (entry.location?.city) parts.push(entry.location.city)
  return parts.join(' · ')
}

export function LogEntryCard({ entry }: { entry: LogEntry }) {
  const detail =
    entry.slug && hasDetailPage(entry) ? `/log/${entry.slug}` : null
  const cover = getAsset(entry.cover)

  const titleNode = entry.title ? (
    detail ? (
      <Link href={detail} prefetch={false} className={titleLink}>
        {entry.title}
      </Link>
    ) : (
      entry.title
    )
  ) : null

  return (
    <article className="border-t border-border py-5 first:border-t-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className={`${typeStyles.caption} text-subtle`}>{metaLine(entry)}</p>
        <RatingBadge rating={entry.rating} />
      </div>

      {titleNode ? (
        <h2 className={`${typeStyles.cardTitle} mt-1.5`}>{titleNode}</h2>
      ) : null}

      {entry.summary ? (
        <p
          className={`${
            titleNode ? 'mt-1' : 'mt-1.5'
          } ${typeStyles.smallBody} text-ink`}
        >
          {entry.summary}
        </p>
      ) : null}

      {entry.url ? (
        <p className="mt-1.5">
          <ExternalLink
            href={entry.url}
            className={`${typeStyles.caption} text-muted ${inlineLink}`}
          >
            {entry.source ?? new URL(entry.url).hostname.replace('www.', '')}
          </ExternalLink>
        </p>
      ) : null}

      {cover && detail ? (
        <div className="mt-3">
          <PersonalMediaCover asset={cover} href={detail} />
        </div>
      ) : null}

      {entry.tags && entry.tags.length > 0 ? (
        <div className="mt-3">
          <TagList tags={entry.tags} hrefBase="/log?tag=" />
        </div>
      ) : null}
    </article>
  )
}
