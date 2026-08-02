'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import type { VideoAsset } from 'lib/content/schemas/media'
import { muxPosterUrl } from 'lib/media/mux'

export function MuxVideo({ asset }: { asset: VideoAsset }) {
  const [active, setActive] = useState(false)
  const poster = asset.fixturePosterPath ?? muxPosterUrl(asset)
  if (!active) {
    return (
      <button
        type="button"
        className="group relative block h-full w-full cursor-pointer border-0 bg-ink p-0"
        onClick={() => setActive(true)}
        aria-label={`Play ${asset.alt}`}
      >
        <Image
          src={poster}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          sizes="(max-width: 760px) 100vw, 760px"
          unoptimized={!asset.fixturePosterPath}
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 grid place-items-center">
          <span
            className="grid h-14 w-14 place-items-center rounded-full bg-bg/90 text-xl text-accent shadow-tile transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            ▶
          </span>
        </span>
      </button>
    )
  }
  return <ActiveMuxPlayer asset={asset} poster={poster} />
}

const ActiveMuxPlayer = dynamic(() => import('./mux-player-active'), {
  ssr: false,
})
