'use client'

import { useEffect, useRef } from 'react'

type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: Record<string, unknown>,
    callback: (controller: { destroy: () => void }) => void,
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void
    __spotifyIframeApi?: SpotifyIframeApi
  }
}

const SPOTIFY_IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'
const SPOTIFY_URL_PATTERN =
  /open\.spotify\.com\/(?:embed\/)?(track|album|playlist|artist|show|episode)\/([a-zA-Z0-9]+)/

let apiPromise: Promise<SpotifyIframeApi> | null = null

function loadSpotifyApi(): Promise<SpotifyIframeApi> {
  if (window.__spotifyIframeApi)
    return Promise.resolve(window.__spotifyIframeApi)
  if (!apiPromise) {
    apiPromise = new Promise<SpotifyIframeApi>((resolve) => {
      window.onSpotifyIframeApiReady = (api) => {
        window.__spotifyIframeApi = api
        resolve(api)
      }
      const script = document.createElement('script')
      script.src = SPOTIFY_IFRAME_API_SRC
      script.async = true
      document.body.appendChild(script)
    })
  }
  return apiPromise
}

/** Convert an open.spotify.com URL to a `spotify:type:id` URI. */
function toSpotifyUri(url: string): string {
  const match = url.match(SPOTIFY_URL_PATTERN)
  return match ? `spotify:${match[1]}:${match[2]}` : url
}

export function SpotifyEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let controller: { destroy: () => void } | undefined
    let cancelled = false
    const placeholder = ref.current
    // The IFrame API *replaces* the placeholder node with its <iframe>, so the
    // frame lands in this surviving wrapper — observe/query it, not the
    // placeholder (which gets detached).
    const container = placeholder?.parentElement
    let observer: MutationObserver | undefined

    loadSpotifyApi().then((api) => {
      if (cancelled || !placeholder || !container) return
      // The injected <iframe> ships without a title, which fails WCAG 4.1.2 /
      // "frames must have an accessible name". Give it one (it's a music player).
      observer = new MutationObserver(() => {
        const iframe = container.querySelector('iframe')
        if (iframe) {
          if (!iframe.getAttribute('title')) {
            iframe.setAttribute('title', 'Spotify player')
          }
          observer?.disconnect()
        }
      })
      observer.observe(container, { childList: true, subtree: true })
      // Let the IFrame API own sizing: it auto-resizes the iframe to fit content,
      // so playlists/albums render full-height with no empty gap.
      api.createController(placeholder, { uri: toSpotifyUri(url) }, (c) => {
        controller = c
      })
    })

    return () => {
      cancelled = true
      observer?.disconnect()
      controller?.destroy()
    }
  }, [url])

  return (
    <div className="my-3 overflow-hidden rounded-lg">
      <div ref={ref} />
    </div>
  )
}
