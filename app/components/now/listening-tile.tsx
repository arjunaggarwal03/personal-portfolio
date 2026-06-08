import { getListening } from 'lib/now/spotify'
import type { NowPlaying as NowPlayingData } from 'lib/now/types'
import { NowEmpty, NowTile } from './now-tile'
import { NowPlaying } from './now-playing'

const EYEBROW = 'Listening'

export async function ListeningTile() {
  const { state, data, fetchedAt } = await getListening()

  if (state !== 'ok' || !data) {
    return (
      <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
        <NowEmpty state={state} label="Spotify" />
      </NowTile>
    )
  }

  const headline = data.current ?? data.recent[0] ?? data.topTrack
  if (!headline) {
    return (
      <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
        <NowEmpty state="empty" label="Spotify" />
      </NowTile>
    )
  }

  // Seed the live client poller with the server's first read so there's real
  // content on first paint (and without JS); it takes over ticking from here.
  const initial: NowPlayingData = {
    isPlaying: Boolean(data.current),
    track: headline,
    progressMs: data.progressMs,
    durationMs: data.durationMs,
  }

  return (
    <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
      <div className="flex flex-col gap-4">
        <NowPlaying initial={initial} />

        {data.topArtists.length > 0 ? (
          <div className="flex flex-col gap-1.5 border-t border-border-soft pt-3">
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-subtle">
              top artists this month
            </p>
            <p className="text-sm leading-snug text-muted">
              {data.topArtists.slice(0, 4).join(', ')}
            </p>
          </div>
        ) : null}
      </div>
    </NowTile>
  )
}
