import { experiments, experimentGroupOrder } from 'content/experiments'
import { pageMetadata } from 'lib/seo'
import { inlineLink } from 'lib/ui'
import { ExternalLink } from 'app/components/external-link'
import { PageIntroduction } from 'app/components/editorial'
import { typeStyles } from 'lib/typography'

export const metadata = pageMetadata({
  title: 'Early Experiments',
  description:
    'Older projects through which Arjun learned AI, search, systems, computer vision, and data science by building small working artifacts.',
  path: '/experiments',
})

export default function ExperimentsPage() {
  const groups = experimentGroupOrder.filter((g) =>
    experiments.some((e) => e.group === g),
  )

  return (
    <section>
      <PageIntroduction title="Early Experiments">
        <p>
          Old school, weekend, and hackathon projects. Some are rough, but I
          still like having them around.
        </p>
      </PageIntroduction>

      <div className="flex flex-col gap-10">
        {groups.map((group) => (
          <div key={group}>
            <h2 className={typeStyles.sectionTitle}>{group}</h2>
            <div className="mt-4 flex flex-col gap-5 border-t border-border pt-5">
              {experiments
                .filter((e) => e.group === group)
                .map((exp) => (
                  <div key={exp.title} id={exp.id} className="scroll-mt-8">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3
                        className={`${typeStyles.uiBody} font-medium text-ink`}
                      >
                        {exp.title}
                      </h3>
                      {exp.year ? (
                        <span
                          className={`${typeStyles.caption} shrink-0 text-subtle`}
                        >
                          {exp.year}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={`${typeStyles.smallBody} mt-1 max-w-prose text-muted`}
                    >
                      {exp.summary}
                    </p>
                    {exp.links && exp.links.length > 0 ? (
                      <p className={`${typeStyles.caption} mt-2 flex gap-3`}>
                        {exp.links.map((link) => (
                          <ExternalLink
                            key={link.url}
                            href={link.url}
                            className={`text-muted ${inlineLink}`}
                          >
                            {link.label}
                          </ExternalLink>
                        ))}
                      </p>
                    ) : null}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
