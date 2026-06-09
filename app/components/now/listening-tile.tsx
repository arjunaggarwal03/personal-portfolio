import Image from 'next/image'
import { getListening } from 'lib/now/spotify'
import { relativeTime } from 'lib/now/format'
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

  // Recently-played feed beneath the hero — skip whatever track is already the
  // headline so the top of the feed never duplicates the now-playing cover.
  const feed = data.recent.filter((t) => t.url !== headline.url).slice(0, 3)

  return (
    <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
      <div className="flex flex-col gap-4">
        <NowPlaying initial={initial} />

        {feed.length > 0 ? (
          <div className="flex flex-col gap-2.5 border-t border-border-soft pt-3">
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-subtle">
              recently played
            </p>
            <ul className="flex flex-col gap-2.5">
              {feed.map((t) => (
                <li
                  key={`${t.url}-${t.playedAt}`}
                  className="flex items-center gap-3"
                >
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded border border-border-soft bg-surface-muted">
                    {t.image ? (
                      <Image
                        src={t.image}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm leading-tight text-ink">
                      {t.title}
                    </p>
                    <p className="truncate text-xs leading-tight text-subtle">
                      {t.artist}
                    </p>
                  </div>
                  {t.playedAt ? (
                    <span className="shrink-0 font-mono text-[0.7rem] text-subtle">
                      {relativeTime(t.playedAt)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </NowTile>
  )
}
