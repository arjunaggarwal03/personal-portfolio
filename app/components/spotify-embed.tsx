import { spotifyEmbed } from 'lib/media/embed-urls'

export function SpotifyEmbed({ url }: { url: string }) {
  const embed = spotifyEmbed(url)
  if (!embed) return null

  return (
    <div className="my-3 overflow-hidden rounded-lg">
      <iframe
        src={embed.url}
        title={embed.title}
        height={embed.height}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="block w-full border-0"
      />
    </div>
  )
}
