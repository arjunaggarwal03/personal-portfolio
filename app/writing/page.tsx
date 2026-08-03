import { getWritingIndex } from 'lib/content/queries'
import { pageMetadata } from 'lib/seo'
import { IndexRow } from 'app/components/index-row'
import { typeStyles } from 'lib/typography'
import { PageIntroduction } from 'app/components/editorial'

export const metadata = pageMetadata({
  title: 'Writing',
  description:
    'Essays and working questions about software, AI products, technical decisions, startups, and the beliefs that change while building them.',
  path: '/writing',
})

export default function WritingPage() {
  const posts = getWritingIndex().filter((p) => p.status === 'published')
  const featured = posts.filter((p) => p.featured)
  const rest = posts.filter((p) => !p.featured)

  return (
    <section>
      <PageIntroduction title="Writing" eyebrow="Published arguments">
        <p>
          I write when implementation makes the clean explanation stop working.
          Only positions I am ready to defend belong here.
        </p>
      </PageIntroduction>

      {posts.length === 0 ? (
        <p className="mt-8 text-muted">
          Nothing published yet. Current questions live in Now until they become
          arguments.
        </p>
      ) : null}

      {featured.length > 0 ? (
        <div className="mt-8">
          <p className={`${typeStyles.metadata} mb-1 text-subtle`}>Featured</p>
          {featured.map((post) => (
            <WritingRow key={post.slug} post={post} />
          ))}
        </div>
      ) : null}

      {rest.length > 0 ? (
        <div className={featured.length > 0 ? 'mt-10' : 'mt-8'}>
          {featured.length > 0 ? (
            <p className={`${typeStyles.metadata} mb-1 text-subtle`}>More</p>
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
  return (
    <IndexRow
      title={post.title}
      href={`/writing/${post.slug}`}
      description={post.subtitle ?? post.summary}
      meta={post.readingTime}
    />
  )
}
