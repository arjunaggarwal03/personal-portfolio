import Image from 'next/image'
import { typeStyles } from 'lib/typography'
import { isAllowedImageSource } from 'lib/media/image-sources'

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
        <p className={`${typeStyles.metadata} mb-1 text-subtle`}>{title}</p>
      ) : null}
      <div className={`${typeStyles.smallBody} text-ink`}>{children}</div>
    </aside>
  )
}

export function Aside({ children }: { children: React.ReactNode }) {
  return (
    <p
      className={`${typeStyles.smallBody} my-4 border-l-2 border-border pl-4 text-muted`}
    >
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
      <div className={`${typeStyles.proseBody} text-ink`}>{children}</div>
      {cite ? (
        <cite className={`${typeStyles.caption} mt-1 block text-subtle`}>
          {cite}
        </cite>
      ) : null}
    </blockquote>
  )
}

export function ImageWithCaption({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string
  alt?: string
  caption?: string
  width: number
  height: number
}) {
  if (!isAllowedImageSource(src)) {
    throw new Error(`Image source is not configured: ${src}`)
  }
  return (
    <figure className="my-5">
      <Image
        src={src}
        alt={alt ?? caption ?? ''}
        width={width}
        height={height}
        sizes="(max-width: 760px) 100vw, 760px"
        className="h-auto w-full rounded-lg border border-border-soft"
      />
      {caption ? (
        <figcaption className={`${typeStyles.caption} mt-1.5 text-subtle`}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
