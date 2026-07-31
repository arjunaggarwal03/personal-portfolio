const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()

export const publicEnv = {
  cloudinaryCloudName:
    cloudName && /^[a-z0-9_-]+$/i.test(cloudName) ? cloudName : undefined,
} as const
