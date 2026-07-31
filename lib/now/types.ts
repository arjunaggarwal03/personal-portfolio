type SourceState = 'ok' | 'empty' | 'unconfigured'

export type SourceResult<T> = {
  state: SourceState
  data: T | null
  fetchedAt: string
}

export type Track = {
  title: string
  artist: string
  url: string
  image: string | null
  nowPlaying: boolean
  playedAt?: string
}

export type Listening = {
  current: Track | null
  recent: Track[]
  topTrack: Track | null
}
