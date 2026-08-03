import type { Metadata } from 'next'
import Link from 'next/link'
import { work, workDateRange } from 'content/work'
import { getFeaturedWriting, getFeaturedLog } from 'lib/content/queries'
import { formatDateShort } from 'lib/dates'
import { externalLinks, site } from 'lib/site'
import { homeGraph, ogImageUrl } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'
import { JsonLd } from 'app/components/json-ld'
import { MetadataLine } from 'app/components/editorial'
import { typeStyles } from 'lib/typography'
import { inlineLink, titleLink } from 'lib/ui'

export const metadata: Metadata = {
  description: site.homeDescription,
  alternates: { canonical: '/' },
  openGraph: {
    description: site.homeDescription,
    images: [ogImageUrl(site.name)],
  },
  twitter: {
    description: site.homeDescription,
    images: [ogImageUrl(site.name)],
  },
}

export default function HomePage() {
  const currentWork = work.find((item) => item.current)
  const featuredWriting = getFeaturedWriting(1).filter(
    (post) => post.status === 'published',
  )
  const observations = getFeaturedLog(12)
    .filter(
      (entry, index, entries) =>
        entries.findIndex((candidate) => candidate.type === entry.type) ===
        index,
    )
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-14">
      <JsonLd data={homeGraph()} />
      <section>
        <h1 className={typeStyles.displayTitle}>Arjun Aggarwal</h1>
        <p className={`${typeStyles.proseBody} mt-4 max-w-prose`}>
          I&rsquo;m a founding engineer at{' '}
          <ExternalLink href={externalLinks.lightfield}>
            Lightfield
          </ExternalLink>{' '}
          in San Francisco. I build across product and systems where ambiguous
          requests have to become changes people can understand and trust.
        </p>
        <p className={`${typeStyles.uiBody} mt-4 max-w-prose text-muted`}>
          This is a working record of the decisions, arguments, and observations
          that shape that work.
        </p>
      </section>

      <section>
        <h2 className={typeStyles.sectionTitle}>Current work</h2>
        {currentWork ? (
          <div className="mt-4 border-t border-border py-5">
            <h3 className={typeStyles.cardTitle}>{currentWork.company}</h3>
            <MetadataLine>
              {currentWork.role} · {workDateRange(currentWork)}
            </MetadataLine>
            <p className={`${typeStyles.uiBody} mt-2 max-w-2xl text-muted`}>
              {currentWork.homeSummary ?? currentWork.summary}
            </p>
          </div>
        ) : null}
        <p className={`${typeStyles.smallBody} mt-2`}>
          <Link href="/work" className={inlineLink}>
            More about my work →
          </Link>
        </p>
      </section>

      <section>
        <h2 className={typeStyles.sectionTitle}>Writing</h2>
        {featuredWriting.length > 0 ? (
          <div className="mt-4 border-t border-border py-5">
            {featuredWriting.map((post) => (
              <article key={post.slug}>
                <h3 className={typeStyles.cardTitle}>
                  <Link href={`/writing/${post.slug}`} className={titleLink}>
                    {post.title}
                  </Link>
                </h3>
                <p className={`${typeStyles.uiBody} mt-2 max-w-2xl text-muted`}>
                  {post.summary}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="max-w-prose text-muted">
            Published arguments will appear here when they are ready.{' '}
            <Link href="/writing" className={inlineLink}>
              Visit Writing
            </Link>
          </p>
        )}
        <p className={`${typeStyles.smallBody} mt-2`}>
          <Link href="/writing" className={inlineLink}>
            Read all writing →
          </Link>
        </p>
      </section>

      <section>
        <h2 className={typeStyles.sectionTitle}>Recent from the log</h2>
        {observations.length > 0 ? (
          <div className="mt-4 grid border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-border-soft">
            {observations.map((entry) => (
              <div
                key={entry.id}
                className="border-b border-border-soft py-4 last:border-b-0 sm:border-b-0 sm:px-4 sm:first:pl-0 sm:last:pr-0"
              >
                <MetadataLine>
                  {formatDateShort(entry.date)} · {entry.type}
                </MetadataLine>
                <p className={`${typeStyles.smallBody} mt-2`}>
                  <Link
                    href={
                      entry.hasDetailPage
                        ? `/log/${entry.slug}`
                        : `/log#entry-${entry.slug}`
                    }
                    className={inlineLink}
                  >
                    {entry.title ?? entry.summary}
                  </Link>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="max-w-prose text-muted">
            The Log holds observations that are not yet arguments.
          </p>
        )}
        <p className={`${typeStyles.smallBody} mt-3`}>
          <Link href="/log" className={inlineLink}>
            Browse the log →
          </Link>
        </p>
      </section>
    </div>
  )
}
