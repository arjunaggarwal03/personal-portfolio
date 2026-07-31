import 'server-only'
import { z } from 'zod'

const optionalSecret = z.string().trim().min(1).optional()

const spotifySchema = z
  .object({
    clientId: optionalSecret,
    clientSecret: optionalSecret,
    refreshToken: optionalSecret,
  })
  .strict()
  .refine(
    (value) =>
      Object.values(value).every(Boolean) ||
      Object.values(value).every((item) => !item),
    'Spotify variables must be configured together',
  )

export function spotifyEnv() {
  const value = spotifySchema.parse({
    clientId: process.env.SPOTIFY_CLIENT_ID || undefined,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || undefined,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN || undefined,
  })
  return value.clientId && value.clientSecret && value.refreshToken
    ? {
        clientId: value.clientId,
        clientSecret: value.clientSecret,
        refreshToken: value.refreshToken,
      }
    : null
}
