import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLogBySlug, getLogWithDetailPages, hasDetailPage } from 'lib/content'
import { formatDate } from 'lib/dates'
import { baseUrl } from 'lib/site'
import { inlineLink } from 'lib/ui'
import { articleGraph, breadcrumbGraph, ogImageUrl } from 'lib/seo'
import { CustomMDX } from 'app/components/mdx'
import { JsonLd } from 'app/components/json-ld'
import { RatingBadge } from 'app/components/rating-badge'
import { TagList } from 'app/components/tag-pill'
import { MediaEmbed } from 'app/components/media-embed'

export async function generateStaticParams() {
  return getLogWithDetailPages().map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = getLogBySlug(slug)
  if (!entry) return {}
  const title = entry.title ?? `Log: ${formatDate(entry.date)}`
  return {
    title,
    description: entry.summary,
    alternates: { canonical: `/log/${entry.slug}` },
    openGraph: {
      title,
      description: entry.summary,
      type: 'article',
      url: `${baseUrl}/log/${entry.slug}`,
      images: [ogImageUrl(title)],
    },
  }
}

export default async function LogDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = getLogBySlug(slug)
  if (!entry || !hasDetailPage(entry)) notFound()

  const title = entry.title ?? `Log: ${formatDate(entry.date)}`
  const entryUrl = `${baseUrl}/log/${entry.slug}`

  const location = [
    entry.location?.venue,
    entry.location?.neighborhood,
    entry.location?.city,
    entry.location?.country,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <article className="max-w-prose">
      <JsonLd
        data={articleGraph({
          title,
          description: entry.summary,
          url: entryUrl,
          datePublished: entry.date,
          dateModified: entry.updated ?? entry.date,
          image: ogImageUrl(title),
        })}
      />
      <JsonLd
        data={breadcrumbGraph([
          { name: 'Home', path: '' },
          { name: 'Log', path: '/log' },
          { name: title, path: `/log/${entry.slug}` },
        ])}
      />

      <p className="font-mono text-xs text-subtle">
        <Link href="/log" className={inlineLink}>
          Log
        </Link>{' '}
        · {formatDate(entry.date)} · {entry.type}
      </p>

      <h1 className="mt-2 font-serif text-3xl leading-tight tracking-tight">
        {title}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-x-3">
        <RatingBadge rating={entry.rating} />
        {location ? (
          <span className="font-mono text-xs text-subtle">{location}</span>
        ) : null}
      </div>

      {entry.summary ? (
        <p className="mt-4 text-lg text-muted">{entry.summary}</p>
      ) : null}

      {entry.media && entry.media.length > 0 ? (
        <div className="mt-5">
          {entry.media.map((m, i) => (
            <MediaEmbed key={i} item={m} />
          ))}
        </div>
      ) : null}

      {entry.body ? (
        <div className="article mt-5">
          <CustomMDX source={entry.body} />
        </div>
      ) : null}

      {entry.url ? (
        <p className="mt-5">
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            {entry.source ?? 'Source'} →
          </a>
        </p>
      ) : null}

      {entry.tags && entry.tags.length > 0 ? (
        <div className="mt-6">
          <TagList tags={entry.tags} hrefBase="/log?tag=" />
        </div>
      ) : null}
    </article>
  )
}
