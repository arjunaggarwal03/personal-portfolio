import Image from 'next/image'
import type { MediaItem } from 'lib/types'
import { SpotifyEmbed } from './spotify-embed'
import { NewTabIndicator } from './external-link'

const IMAGE_SIZES = '(max-width: 760px) 100vw, 760px'
const DEFAULT_ASPECT_RATIO = '16:9'

const aspectClass: Record<string, string> = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '3:4': 'aspect-[3/4]',
  auto: '',
}

const FALLBACK_ASPECT_CLASS = 'aspect-video'

const YOUTUBE_URL_PATTERN =
  /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
const YOUTUBE_EMBED_BASE = 'https://www.youtube.com/embed/'
const YOUTUBE_IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'

function youtubeEmbedUrl(url: string): string {
  const match = url.match(YOUTUBE_URL_PATTERN)
  return match ? `${YOUTUBE_EMBED_BASE}${match[1]}` : url
}


function Frame({
  children,
  ratio = DEFAULT_ASPECT_RATIO,
}: {
  children: React.ReactNode
  ratio?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-border-soft bg-surface-muted ${
        aspectClass[ratio] ?? FALLBACK_ASPECT_CLASS
      }`}
    >
      {children}
    </div>
  )
}

export function MediaEmbed({ item }: { item: MediaItem }) {
  const ratio = item.aspectRatio ?? DEFAULT_ASPECT_RATIO

  let content: React.ReactNode

  switch (item.kind) {
    case 'image':
      content = (
        <figure className="m-0">
          {ratio !== 'auto' ? (
            <div
              className={`relative w-full overflow-hidden rounded-lg border border-border-soft ${aspectClass[ratio]}`}
            >
              <Image
                src={item.url}
                alt={item.alt ?? ''}
                fill
                sizes={IMAGE_SIZES}
                className="object-cover"
              />
            </div>
          ) : (
            <Image
              src={item.url}
              alt={item.alt ?? ''}
              width={0}
              height={0}
              sizes={IMAGE_SIZES}
              className="h-auto w-full rounded-lg border border-border-soft"
            />
          )}
          {item.caption ? (
            <figcaption className="mt-1.5 font-mono text-xs text-subtle">
              {item.caption}
            </figcaption>
          ) : null}
        </figure>
      )
      break

    case 'video':
      content = (
        <figure className="m-0">
          <video
            src={item.url}
            controls
            playsInline
            preload="metadata"
            className={`w-full rounded-lg border border-border-soft ${
              ratio !== 'auto' ? `object-cover ${aspectClass[ratio]}` : ''
            }`}
          />
          {item.caption ? (
            <figcaption className="mt-1.5 font-mono text-xs text-subtle">
              {item.caption}
            </figcaption>
          ) : null}
        </figure>
      )
      break

    case 'youtube':
      content = (
        <Frame ratio={ratio}>
          <iframe
            src={youtubeEmbedUrl(item.url)}
            title={item.alt ?? 'YouTube video'}
            allow={YOUTUBE_IFRAME_ALLOW}
            allowFullScreen
            loading="lazy"
            className="h-full w-full border-0"
          />
        </Frame>
      )
      break

    case 'spotify':
      return <SpotifyEmbed url={item.url} />

    case 'tweet':
    case 'link-preview':
    default:
      // Rich tweet/link-preview embeds are deferred: render a quoted fallback.
      content = (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg border border-border-soft bg-surface px-4 py-3 no-underline hover:border-accent"
        >
          <span className="font-mono text-xs text-subtle">
            {item.url}
            <NewTabIndicator />
          </span>
          {item.caption ? (
            <span className="mt-1 block text-sm text-muted">{item.caption}</span>
          ) : null}
        </a>
      )
      break
  }

  return <div className="my-3">{content}</div>
}
