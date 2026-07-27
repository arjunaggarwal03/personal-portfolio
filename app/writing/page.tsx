import { getWritingIndex } from 'lib/content/queries'
import { pageMetadata } from 'lib/seo'
import { IndexRow } from 'app/components/index-row'

export const metadata = pageMetadata({
  title: 'Writing',
  description:
    'Essays and working questions about software, AI products, technical decisions, startups, and the beliefs that change while building them.',
  path: '/writing',
})

const QUESTIONS = [
  "When software is operated by a model, which assumptions that used to live in the user's head have to move into the product?",
  'When is it better to make an action reversible than to require approval first?',
  'What should a CRM treat as fact, interpretation, or memory?',
  'How should a product distinguish a successful API call from a successful customer outcome?',
  'Which parts of ambiguous work can be formalized, and which still require judgment?',
]

export default function WritingPage() {
  const posts = getWritingIndex().filter((p) => p.status === 'published')
  const featured = posts.filter((p) => p.featured)
  const rest = posts.filter((p) => !p.featured)

  return (
    <section>
      <h1 className="font-serif text-2xl tracking-tight">Writing</h1>
      <p className="mt-2 max-w-prose text-muted">
        I write to clarify what I think, especially when implementation makes
        the clean explanation stop working. Most pieces begin with something I
        built, a decision I&rsquo;m unsure about, or a belief that changed.
      </p>
      <p className="mt-3 max-w-prose text-muted">
        I&rsquo;d rather publish a few finished arguments than a list of things
        I intend to write.
      </p>

      {posts.length === 0 ? (
        <p className="mt-8 text-muted">
          Nothing published yet. The questions below are where I&rsquo;m
          starting.
        </p>
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

      <div className="mt-12 max-w-prose">
        <h2 className="font-serif text-xl tracking-tight">
          Questions I&rsquo;m working through
        </h2>
        <p className="mt-2 text-muted">
          These are open questions, not promised essays. If I reach an answer
          worth defending, it will become one.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
          {QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </div>
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
      tags={post.tags}
    />
  )
}
