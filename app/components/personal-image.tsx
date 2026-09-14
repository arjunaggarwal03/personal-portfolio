import type { ImageLoader } from 'next/image'
import type { ImageAsset } from 'lib/content/schemas/media'
import { cloudinaryImageUrl } from 'lib/media/cloudinary'
import { publicEnv } from 'lib/env/public'
import { OptimizedImage } from './optimized-image'

const loader: ImageLoader = ({ src, width }) =>
  cloudinaryImageUrl(src, width) ?? '/media/unavailable.svg'
const fixtureLoader: ImageLoader = ({ src, width }) =>
  `${src}?fixture-width=${width}`

export function PersonalImage({
  asset,
  priority = false,
  sizes = '(max-width: 760px) 100vw, 760px',
}: {
  asset: ImageAsset
  priority?: boolean
  sizes?: string
}) {
  if (asset.fixturePath) {
    return (
      <OptimizedImage
        src={asset.fixturePath}
        loader={fixtureLoader}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        sizes={sizes}
        preload={priority}
        className="h-auto w-full"
      />
    )
  }
  if (!publicEnv.cloudinaryCloudName) {
    return (
      <OptimizedImage
        src="/media/unavailable.svg"
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        sizes={sizes}
        className="h-auto w-full"
      />
    )
  }
  const focal = asset.focalPoint
    ? `${asset.focalPoint.x * 100}% ${asset.focalPoint.y * 100}%`
    : undefined
  return (
    <OptimizedImage
      loader={loader}
      src={asset.sourceId}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      sizes={sizes}
      preload={priority}
      unoptimized={false}
      className="h-auto w-full object-cover"
      style={{ objectPosition: focal }}
    />
  )
}
