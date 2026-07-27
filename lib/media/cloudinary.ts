import type { ImageAsset } from 'lib/content/schemas/media'

const CLOUDINARY_HOST = 'res.cloudinary.com'

export function cloudinaryImageUrl(
  sourceId: string,
  width: number,
  cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
): string | undefined {
  if (!cloudName) return undefined
  const safeWidth = Math.max(16, Math.min(3840, Math.round(width)))
  const encodedId = sourceId.split('/').map(encodeURIComponent).join('/')
  return `https://${CLOUDINARY_HOST}/${encodeURIComponent(cloudName)}/image/upload/f_auto,q_auto,w_${safeWidth}/${encodedId}`
}

export function cloudinaryBaseUrl(asset: ImageAsset): string | undefined {
  return cloudinaryImageUrl(asset.sourceId, asset.width)
}

export const cloudinaryRemotePattern = {
  protocol: 'https' as const,
  hostname: CLOUDINARY_HOST,
  pathname: '/**',
}
