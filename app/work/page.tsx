import { work, workDateRange } from 'content/work'
import { pageMetadata } from 'lib/seo'
import { IndexRow } from 'app/components/index-row'

export const metadata = pageMetadata({
  title: 'Work',
  description:
    'A running history of the companies, systems, and products I have worked on.',
  path: '/work',
})

export default function WorkPage() {
  return (
    <section>
      <h1 className="font-serif text-2xl tracking-tight">Work</h1>
      <p className="mt-2 max-w-prose text-muted">
        A running history of the companies, systems, and products I have worked
        on. The thread that connects them is context: customer context,
        engineering context, graph context, and the systems that make it usable.
      </p>

      <div className="mt-8">
        {work.map((item) => (
          <IndexRow
            key={`${item.company}-${item.role}`}
            title={`${item.company}, ${item.role}`}
            kicker={[workDateRange(item), item.location]
              .filter(Boolean)
              .join(' · ')}
            description={item.summary}
            tags={item.tags}
          />
        ))}
      </div>
    </section>
  )
}
