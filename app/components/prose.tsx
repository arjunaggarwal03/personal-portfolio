import Image from 'next/image'

export function Callout({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <aside className="my-5 rounded-lg border border-border-soft bg-surface px-4 py-3">
      {title ? (
        <p className="mb-1 font-mono text-xs uppercase tracking-wider text-subtle">
          {title}
        </p>
      ) : null}
      <div className="text-[0.95rem] leading-relaxed text-ink">{children}</div>
    </aside>
  )
}

export function Aside({ children }: { children: React.ReactNode }) {
  return (
    <p className="my-4 border-l-2 border-border pl-4 text-sm text-muted">
      {children}
    </p>
  )
}

export function Quote({
  children,
  cite,
}: {
  children: React.ReactNode
  cite?: string
}) {
  return (
    <blockquote className="my-5 border-l-2 border-accent pl-4">
      <div className="font-serif text-lg italic leading-relaxed text-ink">
        {children}
      </div>
      {cite ? (
        <cite className="mt-1 block font-mono text-xs not-italic text-subtle">
          — {cite}
        </cite>
      ) : null}
    </blockquote>
  )
}

export function ImageWithCaption({
  src,
  alt,
  caption,
}: {
  src: string
  alt?: string
  caption?: string
}) {
  return (
    <figure className="my-5">
      <Image
        src={src}
        alt={alt ?? caption ?? ''}
        width={0}
        height={0}
        sizes="(max-width: 760px) 100vw, 760px"
        className="h-auto w-full rounded-lg border border-border-soft"
      />
      {caption ? (
        <figcaption className="mt-1.5 font-mono text-xs text-subtle">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
