import { work, workDateRange } from 'content/work'
import { pageMetadata } from 'lib/seo'
import { IndexRow } from 'app/components/index-row'
import { MetadataLine, PageIntroduction } from 'app/components/editorial'
import { typeStyles } from 'lib/typography'

export const metadata = pageMetadata({
  title: 'Work',
  description:
    'A history of the products and systems Arjun Aggarwal has worked on, organized around ownership, constraints, decisions, and consequences.',
  path: '/work',
})

export default function WorkPage() {
  const [current, google, plato, ...earlier] = work

  return (
    <div>
      <PageIntroduction title="Work">
        <p>
          A record of what I owned, what made the work difficult, and what
          changed—not a complete resume.
        </p>
      </PageIntroduction>

      <section className="border-t border-border py-9">
        <MetadataLine>Current work · {workDateRange(current)}</MetadataLine>
        <h2 className={`${typeStyles.indexTitle} mt-2`}>
          {current.company}, {current.role}
        </h2>
        {current.context ? (
          <p className={`${typeStyles.proseBody} mt-4 max-w-2xl text-muted`}>
            {current.context}
          </p>
        ) : null}
        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          {[
            ['Ownership', current.ownership],
            ['Constraint', current.constraint],
            ['Change', current.change],
          ].map(([label, value]) =>
            value ? (
              <div key={label}>
                <dt className={`${typeStyles.metadata} text-subtle`}>
                  {label}
                </dt>
                <dd className={`${typeStyles.smallBody} mt-2 text-muted`}>
                  {value}
                </dd>
              </div>
            ) : null,
          )}
        </dl>
      </section>

      <section className="border-t border-border py-9">
        <MetadataLine>Defining decisions</MetadataLine>
        <h2 className={`${typeStyles.sectionTitle} mt-2`}>
          Choosing agency without pretending the outcome was certain
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {[google, plato].map((item) => (
            <article key={item.company}>
              <MetadataLine>{workDateRange(item)}</MetadataLine>
              <h3 className={`${typeStyles.cardTitle} mt-1`}>
                {item.company}, {item.role}
              </h3>
              <p className={`${typeStyles.smallBody} mt-3 text-muted`}>
                {item.change ?? item.summary}
              </p>
              {item.reflection ? (
                <p className={`${typeStyles.smallBody} mt-3 text-ink`}>
                  {item.reflection}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-9">
        <MetadataLine>Earlier trajectory</MetadataLine>
        <div className="mt-3">
          {earlier.map((item) => (
            <IndexRow
              key={`${item.company}-${item.role}`}
              title={`${item.company}, ${item.role}`}
              kicker={[workDateRange(item), item.location]
                .filter(Boolean)
                .join(' · ')}
              description={item.summary}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
