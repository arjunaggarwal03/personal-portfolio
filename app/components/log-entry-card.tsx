import Link from 'next/link'
import type { LogEntry } from 'lib/types'
import { formatDateShort } from 'lib/dates'
import { hasDetailPage } from 'lib/content'
import { RatingBadge } from './rating-badge'
import { TagList } from './tag-pill'
import { MediaEmbed } from './media-embed'

function metaLine(entry: LogEntry): string {
  const parts = [formatDateShort(entry.date), entry.type]
  if (entry.location?.city) parts.push(entry.location.city)
  return parts.join(' · ')
}

export function LogEntryCard({ entry }: { entry: LogEntry }) {
  const detail = entry.slug && hasDetailPage(entry) ? `/log/${entry.slug}` : null
  const media = entry.media ?? []

  const titleNode = entry.title ? (
    detail ? (
      <Link href={detail} className="no-underline hover:text-accent">
        {entry.title}
      </Link>
    ) : (
      entry.title
    )
  ) : null

  return (
    <article className="border-t border-border py-5 first:border-t-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-xs text-subtle">{metaLine(entry)}</p>
        <RatingBadge rating={entry.rating} />
      </div>

      {titleNode ? (
        <h3 className="mt-1.5 font-serif text-lg tracking-tight">{titleNode}</h3>
      ) : null}

      {entry.summary ? (
        <p
          className={`${
            titleNode ? 'mt-1' : 'mt-1.5'
          } text-[0.95rem] leading-relaxed text-ink`}
        >
          {entry.summary}
        </p>
      ) : null}

      {entry.url ? (
        <p className="mt-1.5">
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-muted hover:text-accent"
          >
            {entry.source ?? new URL(entry.url).hostname.replace('www.', '')} →
          </a>
        </p>
      ) : null}

      {media.length > 0 ? (
        <div className="mt-3">
          {media.map((m, i) => (
            <MediaEmbed key={i} item={m} />
          ))}
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
