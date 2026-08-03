import Link from 'next/link'
import { ExternalLink } from 'app/components/external-link'
import {
  CuratorialAnnotation,
  EditorialSection,
  MetadataLine,
  RevisionMark,
} from 'app/components/editorial'
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
      <header className="page-introduction">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <MetadataLine>Current edit</MetadataLine>
            <h1 className={`${typeStyles.indexTitle} mt-1`}>Now</h1>
          </div>
          <MetadataLine>Updated {formatDate(current.lastUpdated)}</MetadataLine>
        </div>
        <p className={`${typeStyles.uiBody} mt-3 max-w-xl text-muted`}>
          What survived my attention long enough to organize the present. Edited
          when the answer changes.
        </p>
      </header>

      <EditorialSection label="The question holding the room" prominent>
        <h2 className="type-detail-title max-w-3xl">
          {current.question.prompt}
        </h2>
        <div className="mt-9 grid gap-7 sm:grid-cols-2">
          <div>
            <h3 className={`${typeStyles.metadata} text-accent`}>
              Current view
            </h3>
            <p className={`${typeStyles.uiBody} mt-2 text-muted`}>
              {current.question.currentView}
            </p>
          </div>
          <div>
            <h3 className={`${typeStyles.metadata} text-subtle`}>
              Strongest counterargument
            </h3>
            <p className={`${typeStyles.uiBody} mt-2 text-muted`}>
              {current.question.counterargument}
            </p>
          </div>
        </div>
        <div className="mt-8">
          <RevisionMark label="What would change my mind">
            <p className="max-w-2xl text-muted">
              {current.question.wouldChange}
            </p>
          </RevisionMark>
        </div>
      </EditorialSection>

      <EditorialSection
        label="Four things that stayed"
        title="Selected from the Field Index"
      >
        <ol className="divide-y divide-border-soft">
          {rotation.map((entry, index) => {
            const detail = entry.hasDetailPage
              ? `/log/${entry.slug}`
              : `/log#entry-${entry.slug}`
            return (
              <li key={entry.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-3">
                  <span className={`${typeStyles.metadata} text-subtle`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className={typeStyles.cardTitle}>
                    <Link href={detail} className={titleLink}>
                      {entry.title ?? entry.summary}
                    </Link>
                  </h3>
                </div>
                <div className="ml-8">
                  <CuratorialAnnotation>
                    {selections.get(entry.slug)?.whyNow}
                  </CuratorialAnnotation>
                </div>
              </li>
            )
          })}
        </ol>
      </EditorialSection>

      <EditorialSection label="Revision" title="Changed my mind">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
          <div>
            <h3 className={`${typeStyles.metadata} text-subtle`}>Earlier</h3>
            <p className={`${typeStyles.smallBody} mt-2 text-muted`}>
              {current.changedMyMind.previous}
            </p>
          </div>
          <span aria-hidden="true" className="hidden text-accent sm:block">
            →
          </span>
          <div>
            <h3 className={`${typeStyles.metadata} text-accent`}>Now</h3>
            <p className={`${typeStyles.smallBody} mt-2`}>
              {current.changedMyMind.current}
            </p>
          </div>
        </div>
        <p className={`${typeStyles.smallBody} mt-6 text-muted`}>
          <span className="text-ink">What changed:</span>{' '}
          {current.changedMyMind.changed}
        </p>
        <p className={`${typeStyles.caption} mt-3 text-subtle`}>
          Revised {formatDate(current.changedMyMind.revised)}
        </p>
      </EditorialSection>

      <EditorialSection label="From the studio" title={current.workingOn.title}>
        <p className={`${typeStyles.uiBody} max-w-2xl text-muted`}>
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
    </article>
  )
}
