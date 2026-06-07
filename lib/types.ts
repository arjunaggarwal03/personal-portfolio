export type LogType =
  | 'thought'
  | 'link'
  | 'tweet'
  | 'article'
  | 'playlist'
  | 'album'
  | 'song'
  | 'film'
  | 'meal'
  | 'restaurant'
  | 'city'
  | 'travel'
  | 'photo'
  | 'clip'
  | 'essay'
  | 'build'
  | 'quote'
  | 'book'
  | 'note'

export type RatingLabel =
  | 'canon'
  | 'revisit'
  | 'liked'
  | 'skip'
  | 'in rotation'
  | 'still thinking'

export type Rating = {
  value?: number
  max?: number
  label?: RatingLabel
}

export type MediaKind =
  | 'image'
  | 'video'
  | 'spotify'
  | 'tweet'
  | 'youtube'
  | 'link-preview'

export type MediaItem = {
  kind: MediaKind
  url: string
  alt?: string
  caption?: string
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4' | 'auto'
}

export type LocationRef = {
  city?: string
  country?: string
  venue?: string
  neighborhood?: string
}

export type LogVisibility = 'public' | 'unlisted' | 'private'

export type LogFlags = {
  featured?: boolean
  canonical?: boolean
  inRotation?: boolean
  private?: boolean
  draft?: boolean
  /** Manual override to force a standalone detail page. */
  detail?: boolean
}

export type LogEntry = {
  id: string
  slug?: string
  title?: string
  date: string
  updated?: string
  type: LogType
  summary?: string
  body?: string
  url?: string
  source?: string
  author?: string
  rating?: Rating
  media?: MediaItem[]
  location?: LocationRef
  tags?: string[]
  visibility?: LogVisibility
  flags?: LogFlags
}

export type WritingStatus = 'published' | 'draft' | 'forthcoming'

export type WritingPost = {
  slug: string
  title: string
  subtitle?: string
  date: string
  updated?: string
  status: WritingStatus
  summary: string
  tags: string[]
  readingTime?: string
  featured?: boolean
  canonical?: boolean
  /** Allow a non-published (forthcoming) post to appear on the index. */
  showOnIndex?: boolean
  body?: string
}

export type WorkItem = {
  company: string
  role: string
  location?: string
  startDate: string
  endDate?: string
  current?: boolean
  summary: string
  details?: string[]
  tags?: string[]
  links?: {
    label: string
    url: string
  }[]
}

export type ExperimentGroup =
  | 'AI / Search'
  | 'Systems'
  | 'Computer Vision'
  | 'Other'

export type Experiment = {
  title: string
  year?: string
  group: ExperimentGroup
  summary: string
  tags?: string[]
  links?: {
    label: string
    url: string
  }[]
}
