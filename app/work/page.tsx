import { work, workDateRange } from 'content/work'
import { pageMetadata } from 'lib/seo'
import { IndexRow } from 'app/components/index-row'
import { MetadataLine, PageIntroduction } from 'app/components/editorial'
import { typeStyles } from 'lib/typography'

export const metadata = pageMetadata({
  title: 'Work',
  description:
    'A selection of the products and systems Arjun Aggarwal has worked on.',
  path: '/work',
})

export default function WorkPage() {
  const [current, google, plato, ...earlier] = work

  return (
    <div>
      <PageIntroduction title="Work">
        <p>
          A few roles and projects that shaped how I build. This is the context
          behind the r&eacute;sum&eacute; bullets.
        </p>
      </PageIntroduction>

      <section className="border-t border-border py-9">
        <h2 className={typeStyles.sectionTitle}>
          {current.company}, {current.role}
        </h2>
        <div className="mt-1">
          <MetadataLine>{workDateRange(current)}</MetadataLine>
        </div>
        {current.context ? (
          <p className={`${typeStyles.proseBody} mt-4 max-w-2xl text-muted`}>
            {current.context}
          </p>
        ) : null}
        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          {[
            ['What I work on', current.ownership],
            ['What makes it hard', current.constraint],
            ['What changed', current.change],
          ].map(([label, value]) =>
            value ? (
              <div key={label}>
                <dt className={`${typeStyles.smallBody} font-medium text-ink`}>
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
        <h2 className={typeStyles.sectionTitle}>Two choices</h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {[google, plato].map((item) => (
            <article key={item.company}>
              <h3 className={typeStyles.cardTitle}>
                {item.company}, {item.role}
              </h3>
              <div className="mt-1">
                <MetadataLine>{workDateRange(item)}</MetadataLine>
              </div>
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
        <h2 className={typeStyles.sectionTitle}>Earlier work</h2>
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
