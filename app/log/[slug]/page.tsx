import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getAsset,
  getLogBySlug,
  getLogWithDetailPages,
  hasDetailPage,
} from 'lib/content/queries'
import { formatDate } from 'lib/dates'
import { baseUrl } from 'lib/site'
import { inlineLink } from 'lib/ui'
import {
  articleGraph,
  breadcrumbGraph,
  mediaObjectGraph,
  ogImageUrl,
} from 'lib/seo'
import { CustomMDX } from 'app/components/mdx'
import { JsonLd } from 'app/components/json-ld'
import { RatingBadge } from 'app/components/rating-badge'
import { TagList } from 'app/components/tag-pill'
import { MediaEmbed } from 'app/components/media-embed'
import { ExternalLink } from 'app/components/external-link'
import { PersonalMediaGallery } from 'app/components/personal-media'
import { cloudinaryImageUrl } from 'lib/media/cloudinary'
import { muxPosterUrl } from 'lib/media/mux'
import { typeStyles } from 'lib/typography'

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
  const cover = getAsset(entry.cover)
  const coverImage = cover
    ? cover.kind === 'image'
      ? cover.fixturePath
        ? `${baseUrl}${cover.fixturePath}`
        : cloudinaryImageUrl(cover.sourceId, 1200)
      : cover.fixturePosterPath
        ? `${baseUrl}${cover.fixturePosterPath}`
        : muxPosterUrl(cover, 1200)
    : undefined
  const images = [coverImage ?? ogImageUrl(title)]
  return {
    title,
    description: entry.summary,
    alternates: { canonical: `/log/${entry.slug}` },
    openGraph: {
      title,
      description: entry.summary,
      type: 'article',
      url: `${baseUrl}/log/${entry.slug}`,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: entry.summary,
      images,
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
  const gallery = entry.gallery
    .map((id) => getAsset(id))
    .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset))
  const cover = getAsset(entry.cover)
  const schemaImage = cover
    ? cover.kind === 'image'
      ? cover.fixturePath
        ? `${baseUrl}${cover.fixturePath}`
        : (cloudinaryImageUrl(cover.sourceId, 1200) ?? ogImageUrl(title))
      : cover.fixturePosterPath
        ? `${baseUrl}${cover.fixturePosterPath}`
        : muxPosterUrl(cover, 1200)
    : ogImageUrl(title)

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
          image: schemaImage,
        })}
      />
      {cover ? (
        <JsonLd
          data={mediaObjectGraph({
            asset: cover,
            name: title,
            url: schemaImage,
            date: entry.date,
          })}
        />
      ) : null}
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

      <h1 className={`${typeStyles.detailTitle} mt-2`}>{title}</h1>

      <div className="mt-2 flex flex-wrap items-center gap-x-3">
        <RatingBadge rating={entry.rating} />
        {location ? (
          <span className="font-mono text-xs text-subtle">{location}</span>
        ) : null}
      </div>

      {entry.summary ? (
        <p className="mt-4 text-lg text-muted">{entry.summary}</p>
      ) : null}

      {gallery.length > 0 ? (
        <div className="mt-6">
          <PersonalMediaGallery assets={gallery} layout={entry.layout} />
        </div>
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
          <ExternalLink href={entry.url}>
            {entry.source ?? 'Source'}
          </ExternalLink>
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
