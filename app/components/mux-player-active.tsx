'use client'

import MuxPlayer from '@mux/mux-player-react'
import type { VideoAsset } from 'lib/content/schemas/media'

export default function ActiveMuxPlayer({
  asset,
  poster,
}: {
  asset: VideoAsset
  poster: string
}) {
  return (
    <MuxPlayer
      playbackId={asset.playbackId}
      streamType="on-demand"
      preload="none"
      poster={poster}
      autoPlay="muted"
      playsInline
      accentColor="#7c4a32"
      metadata={{ video_id: asset.id, video_title: asset.alt }}
      aria-label={asset.alt}
      className="block aspect-video w-full"
    />
  )
}
