import { NextResponse } from 'next/server'
import { getNowPlaying } from 'lib/now/spotify'

/**
 * Live-playback proxy for the /now "Listening" tile. Spotify has no webhooks or
 * push, so the client polls this every ~10s via SWR; the secret refresh token
 * stays server-side.
 *
 * Cached at the Vercel CDN with `s-maxage` + `stale-while-revalidate` (the
 * standard now-playing pattern). The snapshot is identical for every visitor
 * (it's the owner's playback), so a shared edge cache is correct: nearly all
 * polls are served from the CDN in ~tens of ms, the function (and the upstream
 * Spotify call) runs ~once per 10s window globally, and the client's local
 * progress tick hides the staleness between refreshes. The SWR window is 5×
 * s-maxage so most hits stay full-speed while the edge revalidates in the
 * background.
 */
export async function GET() {
  const result = await getNowPlaying()
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=50',
    },
  })
}
