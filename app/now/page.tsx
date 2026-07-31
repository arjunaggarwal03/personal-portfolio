import { Suspense, type ReactNode } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'app/components/external-link'
import { ListeningNote } from 'app/components/now/listening-tile'
import { getSiteModel } from 'lib/content/model'
import { getLogBySlugs } from 'lib/content/queries'
import { formatDate } from 'lib/dates'
import { pageMetadata } from 'lib/seo'
import { typeStyles } from 'lib/typography'
import { inlineLink } from 'lib/ui'

export const metadata = pageMetadata({
  title: 'Now',
  description:
    'What Arjun is working on, questioning, revising, and returning to right now.',
  path: '/now',
})

export const revalidate = 300

function EditorialSection({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-4 border-t border-border py-7 sm:grid-cols-[9rem_1fr] sm:gap-8 sm:py-9">
      <h2 className={`${typeStyles.metadata} text-accent`}>{label}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export default function NowPage() {
  const current = getSiteModel().now
  const rotation = getLogBySlugs(current.rotation.logSlugs)

  return (
    <article>
      <header className="pb-9 sm:pb-12">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className={typeStyles.indexTitle}>Now</h1>
          <p className={`${typeStyles.metadata} text-subtle`}>
            Updated {formatDate(current.lastUpdated)}
          </p>
        </div>
        <p className={`${typeStyles.uiBody} mt-3 max-w-xl text-muted`}>
          A short record of what has my attention. Edited when the answer
          changes.
        </p>
      </header>

      <EditorialSection label="Working on">
        <h3 className={typeStyles.sectionTitle}>{current.workingOn.title}</h3>
        <p className={`${typeStyles.proseBody} mt-3 max-w-2xl text-muted`}>
          {current.workingOn.summary}
        </p>
        {current.workingOn.href ? (
          <p className={`${typeStyles.smallBody} mt-4`}>
            <ExternalLink className={inlineLink} href={current.workingOn.href}>
              See the current work
            </ExternalLink>
          </p>
        ) : null}
      </EditorialSection>

      <EditorialSection label="Question">
        <h3 className={`${typeStyles.sectionTitle} max-w-2xl`}>
          {current.question.prompt}
        </h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h4 className={`${typeStyles.metadata} text-accent`}>
              Current view
            </h4>
            <p className={`${typeStyles.uiBody} mt-2 text-muted`}>
              {current.question.currentView}
            </p>
          </div>
          <div>
            <h4 className={`${typeStyles.metadata} text-accent`}>
              Strongest counterargument
            </h4>
            <p className={`${typeStyles.uiBody} mt-2 text-muted`}>
              {current.question.counterargument}
            </p>
          </div>
        </div>
        <div className="mt-6 border-l-2 border-accent/40 pl-4">
          <h4 className={`${typeStyles.metadata} text-subtle`}>
            What would change my mind
          </h4>
          <p className={`${typeStyles.smallBody} mt-2 max-w-2xl text-muted`}>
            {current.question.wouldChange}
          </p>
        </div>
      </EditorialSection>

      <EditorialSection label="Changed my mind">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <h3 className={`${typeStyles.metadata} text-subtle`}>Earlier</h3>
            <p className={`${typeStyles.smallBody} mt-2 text-muted`}>
              {current.changedMyMind.previous}
            </p>
          </div>
          <div>
            <h3 className={`${typeStyles.metadata} text-subtle`}>
              What changed
            </h3>
            <p className={`${typeStyles.smallBody} mt-2 text-muted`}>
              {current.changedMyMind.changed}
            </p>
          </div>
          <div>
            <h3 className={`${typeStyles.metadata} text-accent`}>Now</h3>
            <p className={`${typeStyles.smallBody} mt-2 text-ink`}>
              {current.changedMyMind.current}
            </p>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection label="Current rotation">
        <ul className="divide-y divide-border-soft">
          {rotation.map((entry) => (
            <li
              key={entry.id}
              className="flex items-baseline justify-between gap-4 py-3 first:pt-0"
            >
              {entry.hasDetailPage ? (
                <Link href={`/log/${entry.slug}`} className={inlineLink}>
                  {entry.title ?? entry.summary}
                </Link>
              ) : (
                <span className={typeStyles.uiBody}>
                  {entry.title ?? entry.summary}
                </span>
              )}
              <span className={`${typeStyles.caption} shrink-0 text-subtle`}>
                {entry.type}
              </span>
            </li>
          ))}
        </ul>
        <Suspense fallback={null}>
          <ListeningNote />
        </Suspense>
      </EditorialSection>
    </article>
  )
}
