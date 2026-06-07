import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublishedWriting, getWritingBySlug } from 'lib/content'
import { formatDate } from 'lib/dates'
import { baseUrl, site } from 'lib/site'
import { CustomMDX } from 'app/components/mdx'
import { TagList } from 'app/components/tag-pill'

export async function generateStaticParams() {
  return getPublishedWriting().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getWritingBySlug(slug)
  if (!post) return {}

  const ogImage = `${baseUrl}/og?title=${encodeURIComponent(post.title)}`
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      url: `${baseUrl}/writing/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },
  }
}

export default async function WritingDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getWritingBySlug(slug)
  if (!post) notFound()

  const all = getPublishedWriting()
  const index = all.findIndex((p) => p.slug === post.slug)
  const newer = index > 0 ? all[index - 1] : undefined
  const older = index < all.length - 1 ? all[index + 1] : undefined

  return (
    <article className="max-w-prose">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            datePublished: post.date,
            dateModified: post.updated ?? post.date,
            description: post.summary,
            url: `${baseUrl}/writing/${post.slug}`,
            author: { '@type': 'Person', name: site.name },
          }),
        }}
      />

      <header>
        <h1 className="font-serif text-3xl leading-tight tracking-tight">
          {post.title}
        </h1>
        {post.subtitle ? (
          <p className="mt-2 text-lg text-muted">{post.subtitle}</p>
        ) : null}
        <p className="mt-3 font-mono text-xs text-subtle">
          {formatDate(post.date)}
          {post.readingTime ? ` · ${post.readingTime}` : ''}
        </p>
        {post.tags.length > 0 ? (
          <div className="mt-3">
            <TagList tags={post.tags} />
          </div>
        ) : null}
      </header>

      <div className="article mt-8">
        <CustomMDX source={post.body ?? ''} />
      </div>

      <nav className="mt-16 flex justify-between gap-4 border-t border-border pt-6 font-mono text-xs">
        {older ? (
          <Link href={`/writing/${older.slug}`} className="text-muted no-underline hover:text-accent">
            ← {older.title}
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link
            href={`/writing/${newer.slug}`}
            className="text-right text-muted no-underline hover:text-accent"
          >
            {newer.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
