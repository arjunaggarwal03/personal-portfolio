import { z } from 'zod'

const publishingSchema = z
  .object({
    cloudinaryCloudName: z.string().trim().min(1).optional(),
    cloudinaryApiKey: z.string().trim().min(1).optional(),
    cloudinaryApiSecret: z.string().trim().min(1).optional(),
    muxTokenId: z.string().trim().min(1).optional(),
    muxTokenSecret: z.string().trim().min(1).optional(),
  })
  .strict()

export function publishingEnv() {
  return publishingSchema.parse({
    cloudinaryCloudName:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || undefined,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || undefined,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || undefined,
    muxTokenId: process.env.MUX_TOKEN_ID || undefined,
    muxTokenSecret: process.env.MUX_TOKEN_SECRET || undefined,
  })
}
