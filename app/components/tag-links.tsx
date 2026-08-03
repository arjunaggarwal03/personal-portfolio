import Link from 'next/link'

export function TagLinks({ tags }: { tags: readonly string[] }) {
  if (tags.length === 0) return null

  return (
    <nav
      aria-label="Related Log tags"
      className="flex flex-wrap gap-x-3 gap-y-1"
    >
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/log?tag=${encodeURIComponent(tag)}`}
          className="font-mono text-xs text-muted underline decoration-border underline-offset-4 hover:text-accent hover:decoration-accent"
        >
          #{tag}
        </Link>
      ))}
    </nav>
  )
}
