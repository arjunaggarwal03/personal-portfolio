import type { Metadata } from 'next'
import { getWritingIndex } from 'lib/content'
import { IndexRow } from 'app/components/index-row'

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Essays on agents, customer context, workflow systems, startup engineering, and the infrastructure around AI-native teams.',
}

export default function WritingPage() {
  const posts = getWritingIndex()
  const featured = posts.filter((p) => p.featured)
  const rest = posts.filter((p) => !p.featured)

  return (
    <section>
      <h1 className="font-serif text-2xl tracking-tight">Writing</h1>
      <p className="mt-2 max-w-prose text-muted">
        Essays on agents, customer context, workflow systems, startup
        engineering, and the infrastructure around AI-native teams.
      </p>

      {posts.length === 0 ? (
        <p className="mt-8 text-muted">Essays in progress. Check back soon.</p>
      ) : null}

      {featured.length > 0 ? (
        <div className="mt-8">
          <p className="mb-1 font-mono text-xs uppercase tracking-wider text-subtle">
            Featured
          </p>
          {featured.map((post) => (
            <WritingRow key={post.slug} post={post} />
          ))}
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className={featured.length > 0 ? 'mt-10' : 'mt-8'}>
          {featured.length > 0 ? (
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-subtle">
              More
            </p>
          ) : null}
          {rest.map((post) => (
            <WritingRow key={post.slug} post={post} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function WritingRow({
  post,
}: {
  post: ReturnType<typeof getWritingIndex>[number]
}) {
  const published = post.status === 'published'
  return (
    <IndexRow
      title={post.title}
      href={published ? `/writing/${post.slug}` : undefined}
      description={post.subtitle ?? post.summary}
      meta={published ? post.readingTime : 'forthcoming'}
      tags={post.tags}
    />
  )
}
