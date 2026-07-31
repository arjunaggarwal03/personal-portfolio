import Image from 'next/image'
import { ExternalLink } from 'app/components/external-link'
import { getListening } from 'lib/now/spotify'
import { typeStyles } from 'lib/typography'
import { inlineLink } from 'lib/ui'

export async function ListeningNote() {
  const result = await getListening()
  if (result.state !== 'ok' || !result.data) return null

  const track =
    result.data.current ?? result.data.recent[0] ?? result.data.topTrack
  if (!track) return null

  return (
    <div className="mt-7 flex items-center gap-4 border-t border-border-soft pt-5">
      {track.image ? (
        <Image
          src={track.image}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 rounded object-cover"
        />
      ) : null}
      <div className="min-w-0">
        <p className={`${typeStyles.caption} text-subtle`}>
          {result.data.current ? 'Listening now' : 'Recently played'}
        </p>
        <p className={`${typeStyles.smallBody} truncate`}>
          <ExternalLink className={inlineLink} href={track.url}>
            {track.title}
          </ExternalLink>
          <span className="text-muted"> by {track.artist}</span>
        </p>
      </div>
    </div>
  )
}
