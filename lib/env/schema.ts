import { z } from 'zod'

const optionalValue = z.string().trim().min(1).optional()

export const spotifyEnvironmentSchema = z
  .object({
    clientId: optionalValue,
    clientSecret: optionalValue,
    refreshToken: optionalValue,
  })
  .strict()
  .refine(
    (value) =>
      Object.values(value).every(Boolean) ||
      Object.values(value).every((item) => !item),
    'Spotify variables must be configured together',
  )

export const publishingEnvironmentSchema = z
  .object({
    cloudinaryCloudName: optionalValue,
    cloudinaryApiKey: optionalValue,
    cloudinaryApiSecret: optionalValue,
    muxTokenId: optionalValue,
    muxTokenSecret: optionalValue,
  })
  .strict()
