/**
 * Vercel edge/region geography for the /now "This site" tile.
 *
 * A request's `x-vercel-id` response header encodes the regions it traversed,
 * e.g. `bom1::iad1::<request-id>` — it entered at the edge nearest the visitor
 * (bom1, Mumbai) and was served from the origin region (iad1, Washington). We
 * parse those region codes, map them to cities + coordinates, and compute the
 * great-circle distance so the tile can narrate the request's actual journey.
 *
 * Codes/locations mirror Vercel's published region list.
 */

export type RegionInfo = {
  code: string
  city: string
  lat: number
  lon: number
}

const REGIONS: Record<string, Omit<RegionInfo, 'code'>> = {
  arn1: { city: 'Stockholm', lat: 59.33, lon: 18.07 },
  bom1: { city: 'Mumbai', lat: 19.08, lon: 72.88 },
  bru1: { city: 'Brussels', lat: 50.85, lon: 4.35 },
  cdg1: { city: 'Paris', lat: 48.86, lon: 2.35 },
  cle1: { city: 'Cleveland', lat: 41.5, lon: -81.69 },
  cpt1: { city: 'Cape Town', lat: -33.92, lon: 18.42 },
  dub1: { city: 'Dublin', lat: 53.35, lon: -6.26 },
  dxb1: { city: 'Dubai', lat: 25.2, lon: 55.27 },
  fra1: { city: 'Frankfurt', lat: 50.11, lon: 8.68 },
  gru1: { city: 'São Paulo', lat: -23.55, lon: -46.63 },
  hkg1: { city: 'Hong Kong', lat: 22.32, lon: 114.17 },
  hnd1: { city: 'Tokyo', lat: 35.68, lon: 139.69 },
  iad1: { city: 'Washington', lat: 38.9, lon: -77.04 },
  icn1: { city: 'Seoul', lat: 37.57, lon: 126.98 },
  kix1: { city: 'Osaka', lat: 34.69, lon: 135.5 },
  lhr1: { city: 'London', lat: 51.51, lon: -0.13 },
  pdx1: { city: 'Portland', lat: 45.52, lon: -122.68 },
  sfo1: { city: 'San Francisco', lat: 37.77, lon: -122.42 },
  sin1: { city: 'Singapore', lat: 1.35, lon: 103.82 },
  syd1: { city: 'Sydney', lat: -33.87, lon: 151.21 },
  yul1: { city: 'Montréal', lat: 45.5, lon: -73.57 },
  dev1: { city: 'localhost', lat: 0, lon: 0 },
}

export function regionInfo(code: string): RegionInfo | null {
  const info = REGIONS[code]
  return info ? { code, ...info } : null
}

export type Route = {
  /** Edge nearest the visitor (first hop). */
  edge: RegionInfo | null
  /** Region the response was served from (last hop). */
  origin: RegionInfo | null
  /** True when the request was served entirely at the edge (single region). */
  edgeOnly: boolean
  /** Great-circle distance between edge and origin in km, when both known. */
  distanceKm: number | null
}

const REGION_CODE = /^[a-z]{3}\d$/

/**
 * Parse an `x-vercel-id` value into a route. The value is a `::`-separated
 * (sometimes `:`-separated) list of region codes followed by a request-id
 * token; we keep the known region codes in order — first = edge, last = origin.
 */
export function parseRoute(vercelId: string | null): Route | null {
  if (!vercelId) return null
  const codes = vercelId
    .split(/[:]+/)
    .filter((part) => REGION_CODE.test(part))
    .filter((code) => code in REGIONS)
  if (codes.length === 0) return null

  const edge = regionInfo(codes[0])
  const origin = regionInfo(codes[codes.length - 1])
  const edgeOnly = codes.length === 1 || codes[0] === codes[codes.length - 1]
  const distanceKm =
    edge && origin && !edgeOnly ? haversineKm(edge, origin) : null

  return { edge, origin, edgeOnly, distanceKm }
}

const EARTH_RADIUS_KM = 6371
const toRad = (deg: number) => (deg * Math.PI) / 180

/** Great-circle distance between two points, in kilometers. */
export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}
