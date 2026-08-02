import 'server-only'
import { spotifyEnvironmentSchema } from './schema'

export function spotifyEnv() {
  const value = spotifyEnvironmentSchema.parse({
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
