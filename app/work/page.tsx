import { work, workDateRange } from 'content/work'
import { pageMetadata } from 'lib/seo'
import { IndexRow } from 'app/components/index-row'

export const metadata = pageMetadata({
  title: 'Work',
  description:
    'A history of the products and systems Arjun Aggarwal has worked on, from graph data and financial events to developer tools and AI-operated software.',
  path: '/work',
})

export default function WorkPage() {
  return (
    <section>
      <h1 className="font-serif text-2xl tracking-tight">Work</h1>
      <p className="mt-2 max-w-prose text-muted">
        I&rsquo;ve spent most of my career moving between product and systems
        work: graph data, financial event processing, developer tools, and now
        software operated by both people and models.
      </p>
      <p className="mt-3 max-w-prose text-muted">
        The path was less planned than that sentence makes it sound. I followed
        the places where I could learn quickly, work close to the problem, and
        own more of the result.
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
