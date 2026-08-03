import type { MediaAsset } from 'lib/content/schemas/media'
import { PersonalImage } from './personal-image'
import { MuxVideo } from './mux-video'
import { typeStyles } from 'lib/typography'

const sizes = '(max-width: 760px) 100vw, 760px'

function caption(asset: MediaAsset) {
  return asset.caption ? (
    <figcaption className={`${typeStyles.caption} mt-1.5 text-subtle`}>
      {asset.caption}
    </figcaption>
  ) : null
}

export function PersonalMediaGallery({
  assets,
  layout,
}: {
  assets: MediaAsset[]
  layout: 'wide' | 'standard' | 'portrait' | 'pair'
}) {
  const grid =
    layout === 'pair' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'space-y-5'
  return (
    <div className={grid} data-gallery-layout={layout}>
      {assets.map((asset, index) => (
        <figure key={asset.id} className="m-0 break-inside-avoid">
          <div
            className="overflow-hidden rounded-lg border border-border-soft bg-surface-muted"
            style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
          >
            {asset.kind === 'image' ? (
              <PersonalImage
                asset={asset}
                priority={index === 0}
                sizes={
                  layout === 'pair' ? '(max-width: 640px) 100vw, 380px' : sizes
                }
              />
            ) : (
              <MuxVideo asset={asset} />
            )}
          </div>
          {caption(asset)}
        </figure>
      ))}
    </div>
  )
}
