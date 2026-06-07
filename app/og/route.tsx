import { readFileSync } from 'fs'
import { join } from 'path'
import { ImageResponse } from 'next/og'
import { site, person, brand } from 'lib/site'

const OG_WIDTH = 1200
const OG_HEIGHT = 630

const BG = brand.bg
const INK = brand.ink
const MUTED = brand.muted
const ACCENT = brand.accent
const DOMAIN = 'arjunaggarwal.dev'

const LONG_TITLE_THRESHOLD = 40

// Read once at cold start. Satori supports woff (not woff2). Newsreader is the
// site's headline serif, so the OG title matches the on-page identity.
// The file is kept in the function bundle via outputFileTracingIncludes.
const newsreaderFont = readFileSync(
  join(process.cwd(), 'app/og/fonts/newsreader-600.woff')
)

export function GET(request: Request) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || site.name
  const isHome = title === site.name

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          justifyContent: 'space-between',
          backgroundColor: BG,
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, color: ACCENT, letterSpacing: 1 }}>
          {isHome ? `${person.jobTitle} at ${person.company}` : person.name}
        </div>

        <div
          style={{
            display: 'flex',
            fontFamily: 'Newsreader',
            fontSize: title.length > LONG_TITLE_THRESHOLD ? 64 : 84,
            lineHeight: 1.05,
            color: INK,
            fontWeight: 600,
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 30,
            color: MUTED,
          }}
        >
          <div style={{ display: 'flex' }}>{person.location}</div>
          <div style={{ display: 'flex', color: INK }}>{DOMAIN}</div>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: [
        { name: 'Newsreader', data: newsreaderFont, weight: 600, style: 'normal' },
      ],
    }
  )
}
