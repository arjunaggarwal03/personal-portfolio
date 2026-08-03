import { getWritingIndex } from 'lib/content/queries'
import { pageMetadata } from 'lib/seo'
import { IndexRow } from 'app/components/index-row'
import { PageIntroduction } from 'app/components/editorial'

export const metadata = pageMetadata({
  title: 'Writing',
  description:
    'Essays about software, AI products, technical decisions, and what changes while building them.',
  path: '/writing',
})

export default function WritingPage() {
  const posts = getWritingIndex().filter((p) => p.status === 'published')

  return (
    <section>
      <PageIntroduction title="Writing">
        <p>
          I mostly write when building something changes my mind or makes an
          idea harder to explain. I&rsquo;d rather publish a few finished pieces
          than a long list of drafts.
        </p>
      </PageIntroduction>

      {posts.length === 0 ? (
        <p className="mt-8 text-muted">
          Nothing published yet. I&rsquo;m still working through a few things in
          Now.
        </p>
      ) : null}

      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
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
