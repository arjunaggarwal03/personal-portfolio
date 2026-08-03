import Link from 'next/link'
import { ExternalLink } from 'app/components/external-link'
import { PageIntroduction } from 'app/components/editorial'
import { getSiteModel } from 'lib/content/model'
import { getLogBySlugs } from 'lib/content/queries'
import { formatDate } from 'lib/dates'
import { pageMetadata } from 'lib/seo'
import { typeStyles } from 'lib/typography'
import { inlineLink, titleLink } from 'lib/ui'

export const metadata = pageMetadata({
  title: 'Now',
  description:
    'The current question, selected observations, revised belief, and work context that have Arjun’s attention now.',
  path: '/now',
})

export default function NowPage() {
  const current = getSiteModel().now
  const selections = new Map(
    current.rotation.selections.map((selection) => [selection.slug, selection]),
  )
  const rotation = getLogBySlugs(
    current.rotation.selections.map(({ slug }) => slug),
  )

  return (
    <article>
      <PageIntroduction
        title="Now"
        meta={`Updated ${formatDate(current.lastUpdated)}`}
      >
        <p>
          A short list of what I&rsquo;m working on, thinking about, and coming
          back to lately.
        </p>
      </PageIntroduction>

      <section className="border-t border-border py-8 sm:py-9">
        <h2 className={`${typeStyles.sectionTitle} max-w-2xl`}>
          {current.question.prompt}
        </h2>
        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className={`${typeStyles.smallBody} font-medium`}>My take</h3>
            <p className={`${typeStyles.uiBody} mt-2 text-muted`}>
              {current.question.currentView}
            </p>
          </div>
          <div>
            <h3 className={`${typeStyles.smallBody} font-medium`}>
              The case against it
            </h3>
            <p className={`${typeStyles.uiBody} mt-2 text-muted`}>
              {current.question.counterargument}
            </p>
          </div>
        </div>
        <div className="mt-6 max-w-2xl">
          <h3 className={`${typeStyles.smallBody} font-medium`}>
            What I&rsquo;m watching for
          </h3>
          <p className={`${typeStyles.uiBody} mt-2 text-muted`}>
            {current.question.wouldChange}
          </p>
        </div>
      </section>

      <section className="border-t border-border py-8 sm:py-9">
        <h2 className={typeStyles.sectionTitle}>
          Things I keep coming back to
        </h2>
        <div className="mt-5 divide-y divide-border-soft">
          {rotation.map((entry) => {
            const detail = entry.hasDetailPage
              ? `/log/${entry.slug}`
              : `/log#entry-${entry.slug}`
            return (
              <article key={entry.id} className="py-4 first:pt-0 last:pb-0">
                <h3 className={typeStyles.cardTitle}>
                  <Link href={detail} className={titleLink}>
                    {entry.title ?? entry.summary}
                  </Link>
                </h3>
                <p className={`${typeStyles.smallBody} mt-2 text-muted`}>
                  {selections.get(entry.slug)?.whyNow}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-t border-border py-8 sm:py-9">
        <h2 className={typeStyles.sectionTitle}>Changed my mind</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className={`${typeStyles.smallBody} font-medium`}>Earlier</h3>
            <p className={`${typeStyles.smallBody} mt-2 text-muted`}>
              {current.changedMyMind.previous}
            </p>
          </div>
          <div>
            <h3 className={`${typeStyles.smallBody} font-medium`}>Now</h3>
            <p className={`${typeStyles.smallBody} mt-2`}>
              {current.changedMyMind.current}
            </p>
          </div>
        </div>
        <p className={`${typeStyles.smallBody} mt-5 text-muted`}>
          <span className="font-medium text-ink">What changed:</span>{' '}
          {current.changedMyMind.changed}
        </p>
        <p className={`${typeStyles.caption} mt-2 text-subtle`}>
          Revised {formatDate(current.changedMyMind.revised)}
        </p>
      </section>

      <section className="border-t border-border py-8 sm:py-9">
        <h2 className={typeStyles.sectionTitle}>Working on</h2>
        <h3 className={`${typeStyles.cardTitle} mt-4`}>
          {current.workingOn.title}
        </h3>
        <p className={`${typeStyles.uiBody} mt-2 max-w-2xl text-muted`}>
          {current.workingOn.summary}
        </p>
        {current.workingOn.href ? (
          <p className={`${typeStyles.smallBody} mt-4`}>
            <ExternalLink className={inlineLink} href={current.workingOn.href}>
              See the current work
            </ExternalLink>
          </p>
        ) : null}
      </section>
    </article>
  )
}
