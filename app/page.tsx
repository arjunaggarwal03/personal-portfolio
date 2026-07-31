import type { Metadata } from 'next'
import Link from 'next/link'
import { work, workDateRange } from 'content/work'
import { getFeaturedWriting, getFeaturedLog } from 'lib/content/queries'
import { formatDateShort } from 'lib/dates'
import { externalLinks, site } from 'lib/site'
import { homeGraph, ogImageUrl } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'
import { SectionHeader } from 'app/components/section-header'
import { IndexRow } from 'app/components/index-row'
import { JsonLd } from 'app/components/json-ld'
import { typeStyles } from 'lib/typography'

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

const SELECTED_COMPANIES = ['Lightfield', 'Amazon Web Services', 'Capital One']
const FEATURED_WRITING_COUNT = 4
const LATEST_LOG_COUNT = 5

export default function HomePage() {
  const selectedWork = SELECTED_COMPANIES.map((name) =>
    work.find((w) => w.company === name),
  ).filter((w): w is NonNullable<typeof w> => Boolean(w))

  const featuredWriting = getFeaturedWriting(FEATURED_WRITING_COUNT).filter(
    (post) => post.status === 'published',
  )
  const latestLog = getFeaturedLog(LATEST_LOG_COUNT)

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
          in San Francisco, where I work across the APIs, agent tools,
          workflows, and product surfaces behind our CRM.
        </p>
        <p className={`${typeStyles.uiBody} mt-4 max-w-prose text-muted`}>
          This site is where I explain what I&rsquo;m learning and keep track of
          restaurants, cities, films, music, and things I don&rsquo;t want to
          forget.
        </p>
      </section>

      <section>
        <SectionHeader
          eyebrow="Selected work"
          title="A few things I've worked on"
          href="/work"
          hrefLabel="all work"
        />
        <div>
          {selectedWork.map((item) => (
            <IndexRow
              key={item.company}
              title={item.company}
              kicker={item.role}
              meta={workDateRange(item)}
              description={item.homeSummary ?? item.summary}
              headingLevel={3}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Selected writing"
          title="Recent writing"
          href="/writing"
          hrefLabel="all writing"
        />
        {featuredWriting.length > 0 ? (
          <div>
            {featuredWriting.map((post) => (
              <IndexRow
                key={post.slug}
                title={post.title}
                href={`/writing/${post.slug}`}
                description={post.summary}
                headingLevel={3}
              />
            ))}
          </div>
        ) : (
          <p className="max-w-prose text-muted">
            I&rsquo;m working on the first few pieces. I&rsquo;d rather leave
            this sparse than publish an argument before I understand it.{' '}
            <Link href="/writing">all writing →</Link>
          </p>
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="Log"
          title="From the log"
          href="/log"
          hrefLabel="full log"
        />
        {latestLog.length > 0 ? (
          <div className="flex flex-col">
            {latestLog.map((entry) => (
              <div
                key={entry.id}
                className="border-t border-border py-3 first:border-t-0"
              >
                <p className={`${typeStyles.caption} text-subtle`}>
                  {formatDateShort(entry.date)} · {entry.type}
                </p>
                <p className={`${typeStyles.smallBody} mt-1`}>
                  {entry.title ? (
                    <span className="text-ink">{entry.title}</span>
                  ) : null}
                  {entry.title && entry.summary ? (
                    <span className="text-muted">: {entry.summary}</span>
                  ) : (
                    <span className="text-ink">{entry.summary}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="max-w-prose text-muted">
            A running record of restaurants, cities, films, music, links, and
            things I want to remember. <Link href="/log">full log →</Link>
          </p>
        )}
      </section>
    </div>
  )
}
