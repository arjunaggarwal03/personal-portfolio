import { z } from 'zod'

const optionalValue = z.string().trim().min(1).optional()

export const publishingEnvironmentSchema = z
  .object({
    cloudinaryCloudName: optionalValue,
    cloudinaryApiKey: optionalValue,
    cloudinaryApiSecret: optionalValue,
    muxTokenId: optionalValue,
    muxTokenSecret: optionalValue,
  })
  .strict()
