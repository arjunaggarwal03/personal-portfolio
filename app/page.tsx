import Link from 'next/link'
import { work, workDateRange } from 'content/work'
import { getFeaturedWriting, getFeaturedLog } from 'lib/content'
import { formatDateShort } from 'lib/dates'
import { externalLinks } from 'lib/site'
import { SectionHeader } from 'app/components/section-header'
import { SystemDiagram } from 'app/components/system-diagram'
import { IndexRow } from 'app/components/index-row'

const SELECTED_COMPANIES = ['Lightfield', 'Amazon Web Services', 'Capital One']
const HERO_STEPS = ['context', 'tools', 'workflow state', 'review', 'action']
const FEATURED_WRITING_COUNT = 4
const LATEST_LOG_COUNT = 5

export default function HomePage() {
  const selectedWork = SELECTED_COMPANIES.map((name) =>
    work.find((w) => w.company === name)
  ).filter((w): w is NonNullable<typeof w> => Boolean(w))

  const featuredWriting = getFeaturedWriting(FEATURED_WRITING_COUNT)
  const latestLog = getFeaturedLog(LATEST_LOG_COUNT)

  return (
    <div className="flex flex-col gap-14">
      <section>
        <h1 className="font-serif text-3xl leading-tight tracking-tight">
          Arjun Aggarwal
        </h1>
        <p className="mt-4 max-w-prose text-md leading-relaxed">
          Founding engineer at{' '}
          <a href={externalLinks.lightfield} target="_blank" rel="noopener noreferrer">
            Lightfield
          </a>
          , building agentic CRM and customer-context infrastructure in San
          Francisco.
        </p>
        <p className="mt-4 max-w-prose text-muted">
          I&rsquo;m interested in systems that turn scattered context into useful
          work: agents, APIs, workflow automation, developer tools, and the
          infrastructure around customer-facing teams.
        </p>
        <SystemDiagram steps={HERO_STEPS} />
      </section>

      <section>
        <SectionHeader
          eyebrow="Selected work"
          title="Where I've worked"
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
              description={item.summary}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Selected writing"
          title="What I'm thinking about"
          href="/writing"
          hrefLabel="all writing"
        />
        {featuredWriting.length > 0 ? (
          <div>
            {featuredWriting.map((post) => (
              <IndexRow
                key={post.slug}
                title={post.title}
                href={post.status === 'published' ? `/writing/${post.slug}` : undefined}
                description={post.summary}
                meta={post.status === 'published' ? undefined : 'forthcoming'}
              />
            ))}
          </div>
        ) : (
          <p className="max-w-prose text-muted">
            Essays in progress on agents, customer context, workflow systems, and
            startup engineering. <Link href="/writing">See what&rsquo;s coming →</Link>
          </p>
        )}
      </section>

      <section>
        <SectionHeader
          eyebrow="From the log"
          title="Lately"
          href="/log"
          hrefLabel="full log"
        />
        {latestLog.length > 0 ? (
          <div className="flex flex-col">
            {latestLog.map((entry) => (
              <div key={entry.id} className="border-t border-border py-3 first:border-t-0">
                <p className="font-mono text-xs text-subtle">
                  {formatDateShort(entry.date)} · {entry.type}
                </p>
                <p className="mt-1 text-[0.95rem] leading-relaxed">
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
            A running index of what I&rsquo;m noticing: work, cities, meals, music,
            films, links, and half-formed thoughts. <Link href="/log">Open the log →</Link>
          </p>
        )}
      </section>
    </div>
  )
}
