import Link from 'next/link'
import { inlineLink, titleLink } from 'lib/ui'
import { ExternalLink } from './external-link'
import type { LogEntry } from 'lib/content/schemas/log'
import { formatDateShort } from 'lib/dates'
import { getAsset, hasDetailPage } from 'lib/content/queries'
import { PersonalMediaCover } from './personal-media-cover'
import { typeStyles } from 'lib/typography'

function metaLine(entry: LogEntry): string {
  const parts = [formatDateShort(entry.date), entry.type]
  if (entry.location?.city) parts.push(entry.location.city)
  return parts.join(' · ')
}

export function LogEntryCard({
  entry,
  onView = false,
}: {
  entry: LogEntry
  onView?: boolean
}) {
  const detail = hasDetailPage(entry) ? `/log/${entry.slug}` : null
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
    <article
      id={`entry-${entry.slug}`}
      className="scroll-mt-8 border-t border-border py-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className={`${typeStyles.caption} text-subtle`}>{metaLine(entry)}</p>
        <div className={`${typeStyles.caption} flex items-center gap-3`}>
          {entry.rating?.label ? (
            <span className="text-subtle">{entry.rating.label}</span>
          ) : null}
          {onView ? (
            <Link href="/now" className={`text-accent ${inlineLink}`}>
              in Now
            </Link>
          ) : null}
        </div>
      </div>

      {titleNode ? (
        <h2 className={`${typeStyles.cardTitle} mt-1.5`}>{titleNode}</h2>
      ) : null}

      {entry.summary ? (
        <p
          className={`${titleNode ? 'mt-1.5' : 'mt-2'} ${typeStyles.smallBody} max-w-2xl text-ink`}
        >
          {entry.summary}
        </p>
      ) : null}

      {entry.url ? (
        <p className="mt-2">
          <ExternalLink
            href={entry.url}
            className={`${typeStyles.caption} text-muted ${inlineLink}`}
          >
            {entry.source ?? new URL(entry.url).hostname.replace('www.', '')}
          </ExternalLink>
        </p>
      ) : null}

      {cover && detail ? (
        <div className="mt-4">
          <PersonalMediaCover asset={cover} href={detail} />
        </div>
      ) : null}
    </article>
  )
}
