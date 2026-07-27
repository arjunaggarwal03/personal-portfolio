import type { VideoAsset } from 'lib/content/schemas/media'

export function muxPosterUrl(asset: VideoAsset, width = asset.width): string {
  const time = asset.posterTime ?? 0
  return `https://image.mux.com/${encodeURIComponent(asset.playbackId)}/thumbnail.webp?width=${Math.min(1920, Math.round(width))}&time=${time}`
}
