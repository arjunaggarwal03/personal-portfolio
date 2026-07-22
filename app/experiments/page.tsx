import { experiments, experimentGroupOrder } from 'content/experiments'
import { pageMetadata } from 'lib/seo'
import { inlineLink } from 'lib/ui'
import { ExternalLink } from 'app/components/external-link'

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
    <section className="text-sm">
      <h1 className="font-serif text-2xl tracking-tight">Early Experiments</h1>
      <p className="mt-2 max-w-prose text-muted">
        These are old school, weekend, and hackathon projects. Some were useful;
        some were mainly excuses to learn a model or system by building the
        smallest thing that made it concrete.
      </p>
      <p className="mt-3 max-w-prose text-muted">
        I keep them because they show the path, not because they represent my
        best work.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {groups.map((group) => (
          <div key={group}>
            <h2 className="mb-3 font-mono text-xs font-normal uppercase tracking-wider text-subtle">
              {group}
            </h2>
            <div className="flex flex-col gap-4">
              {experiments
                .filter((e) => e.group === group)
                .map((exp) => (
                  <div key={exp.title}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[0.95rem] font-medium text-ink">
                        {exp.title}
                      </h3>
                      {exp.year ? (
                        <span className="shrink-0 font-mono text-xs text-subtle">
                          {exp.year}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 max-w-prose leading-relaxed text-muted">
                      {exp.summary}
                    </p>
                    {exp.links && exp.links.length > 0 ? (
                      <p className="mt-1 flex gap-3 font-mono text-xs">
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
