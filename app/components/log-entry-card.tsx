import Link from 'next/link'
import { inlineLink, titleLink } from 'lib/ui'
import { ExternalLink } from './external-link'
import type { LogEntry, LogType } from 'lib/content/schemas/log'
import { formatDateShort } from 'lib/dates'
import { getAsset, hasDetailPage } from 'lib/content/queries'
import { TagLinks } from './tag-links'
import { PersonalMediaCover } from './personal-media-cover'
import { typeStyles } from 'lib/typography'

type Treatment = 'wide' | 'compact' | 'marginalia' | 'visual'

const COMPACT_TYPES = new Set<LogType>([
  'album',
  'song',
  'playlist',
  'film',
  'restaurant',
  'meal',
  'city',
  'travel',
  'link',
  'article',
])

function treatmentFor(entry: LogEntry): Treatment {
  if (entry.cover || entry.type === 'clip' || entry.type === 'photo') {
    return 'visual'
  }
  if (entry.type === 'quote') return 'marginalia'
  if (COMPACT_TYPES.has(entry.type)) return 'compact'
  return 'wide'
}

function metaLine(entry: LogEntry): string {
  const parts = [formatDateShort(entry.date), entry.type]
  if (entry.location?.city) parts.push(entry.location.city)
  return parts.join(' · ')
}

export function LogEntryCard({
  entry,
  onView = false,
  anchor = true,
  paired = false,
}: {
  entry: LogEntry
  onView?: boolean
  anchor?: boolean
  paired?: boolean
}) {
  const detail = hasDetailPage(entry) ? `/log/${entry.slug}` : null
  const cover = getAsset(entry.cover)
  const treatment = treatmentFor(entry)
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
      id={anchor ? `entry-${entry.slug}` : undefined}
      data-treatment={treatment}
      className={`${paired ? '' : 'archive-entry border-t border-border'} scroll-mt-8 py-6`}
    >
      <div className={paired ? '' : 'border-l border-border-soft pl-4 sm:pl-5'}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className={`${typeStyles.caption} text-subtle`}>
            {metaLine(entry)}
          </p>
          <div className="flex items-center gap-3">
            {entry.rating?.label ? (
              <span className={`${typeStyles.metadata} text-subtle`}>
                {entry.rating.label}
              </span>
            ) : null}
            {onView ? (
              <Link
                href="/now"
                className={`${typeStyles.metadata} text-accent ${inlineLink}`}
              >
                on view
              </Link>
            ) : null}
          </div>
        </div>

        {titleNode ? (
          <h2 className={`${typeStyles.cardTitle} mt-2`}>{titleNode}</h2>
        ) : null}

        {entry.summary ? (
          <p
            className={`${titleNode ? 'mt-1.5' : 'mt-2'} ${
              treatment === 'marginalia'
                ? `${typeStyles.proseBody} font-serif italic`
                : typeStyles.smallBody
            } text-ink`}
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

        {entry.tags.length > 0 ? (
          <div className="mt-3">
            <TagLinks tags={entry.tags} />
          </div>
        ) : null}
      </div>
    </article>
  )
}
