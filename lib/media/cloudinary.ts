const CLOUDINARY_HOST = 'res.cloudinary.com'

import { publicEnv } from 'lib/env/public'

export function cloudinaryImageUrl(
  sourceId: string,
  width: number,
  cloudName = publicEnv.cloudinaryCloudName,
): string | undefined {
  if (!cloudName) return undefined
  const safeWidth = Math.max(16, Math.min(3840, Math.round(width)))
  const encodedId = sourceId.split('/').map(encodeURIComponent).join('/')
  return `https://${CLOUDINARY_HOST}/${encodeURIComponent(cloudName)}/image/upload/f_auto,q_auto,w_${safeWidth}/${encodedId}`
}

export function isCloudinaryDeliveryUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === CLOUDINARY_HOST
  } catch {
    return false
  }
}
