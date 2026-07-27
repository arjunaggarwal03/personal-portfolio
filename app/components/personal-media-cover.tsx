import Image from 'next/image'
import Link from 'next/link'
import type { MediaAsset } from 'lib/content/schemas/media'
import { muxPosterUrl } from 'lib/media/mux'
import { PersonalImage } from './personal-image'

const sizes = '(max-width: 760px) 100vw, 760px'

export function PersonalMediaCover({
  asset,
  href,
}: {
  asset: MediaAsset
  href: string
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="block overflow-hidden rounded-lg border border-border-soft bg-surface-muted"
      aria-label={`Open ${asset.alt}`}
    >
      {asset.kind === 'image' ? (
        <PersonalImage asset={asset} sizes={sizes} />
      ) : (
        <Image
          src={asset.fixturePosterPath ?? muxPosterUrl(asset)}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          sizes={sizes}
          unoptimized={!asset.fixturePosterPath}
          className="h-auto w-full"
        />
      )}
    </Link>
  )
}
