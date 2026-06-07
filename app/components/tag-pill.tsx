import Link from 'next/link'

const TAG_BASE_CLASS =
  'inline-block rounded-full border border-border-soft px-2 py-0.5 font-mono text-xs text-muted no-underline'
const TAG_HOVER_CLASS = 'hover:border-accent hover:text-accent'

export function TagPill({ tag, href }: { tag: string; href?: string }) {
  if (href) {
    return (
      <Link href={href} className={`${TAG_BASE_CLASS} ${TAG_HOVER_CLASS}`}>
        {tag}
      </Link>
    )
  }
  return <span className={TAG_BASE_CLASS}>{tag}</span>
}

export function TagList({
  tags,
  hrefBase,
}: {
  tags?: string[]
  hrefBase?: string
}) {
  if (!tags || tags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <TagPill
          key={tag}
          tag={tag}
          href={hrefBase ? `${hrefBase}${encodeURIComponent(tag)}` : undefined}
        />
      ))}
    </div>
  )
}
