/**
 * Tiny liveness probe for the /now "This site" tile. The client fetches this
 * every few seconds and times the round-trip with the Resource Timing API to
 * show the visitor's real latency to the site.
 *
 * Deliberately a dynamic Node (not Edge) function and never cached, so every
 * request is forwarded from the edge nearest the visitor to the origin region.
 * That two-hop path is what makes the response's `x-vercel-id` carry both the
 * edge and origin regions (e.g. `bom1::iad1::…`), which the client parses into
 * the "Mumbai → Washington" route narrative. Returns 204 (no body) to keep the
 * payload minimal, so the measured time is dominated by the network, not bytes.
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
