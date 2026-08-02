import { publishingEnvironmentSchema } from './schema'

export function publishingEnv() {
  return publishingEnvironmentSchema.parse({
    cloudinaryCloudName:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || undefined,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || undefined,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || undefined,
    muxTokenId: process.env.MUX_TOKEN_ID || undefined,
    muxTokenSecret: process.env.MUX_TOKEN_SECRET || undefined,
  })
}
