import { NextResponse } from 'next/server'
import { getNowPlaying } from 'lib/now/spotify'

/**
 * Live-playback proxy for the /now "Listening" tile. Spotify has no webhooks or
 * push, so the client polls this every few seconds; the secret refresh token
 * stays server-side, and `getNowPlaying` collapses bursts into one upstream
 * call per window. Never cached at the edge — always reflects the latest poll.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await getNowPlaying()
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
