/**
 * Tiny liveness probe for the /now "This site" tile. The client fetches this
 * every few seconds and times the round-trip with the Resource Timing API to
 * show the visitor's real latency to the site.
 *
 * Deliberately a dynamic Node (not Edge) function and never cached. Returns 204
 * (no body) to keep the payload minimal, so the measured time is dominated by
 * the network, not bytes.
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export function GET() {
  return new Response(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  })
}
