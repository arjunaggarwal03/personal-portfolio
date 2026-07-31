import type { LogEntry } from './schemas/log'
import type { WritingPost } from './schemas/writing'
import { getSiteModel } from './model'

const isProd = process.env.NODE_ENV === 'production'
const visibleLog = (): readonly LogEntry[] =>
  getSiteModel().log.filter(
    (entry) => !isProd || entry.visibility !== 'private',
  )

export const getWritingIndex = (): WritingPost[] =>
  getSiteModel().writing.filter(
    (post) =>
      post.status === 'published' ||
      (post.status === 'forthcoming' && post.showOnIndex),
  )
export const getPublishedWriting = (): WritingPost[] =>
  getSiteModel().writing.filter((post) =>
    isProd ? post.status === 'published' : post.status !== 'forthcoming',
  )
export const getWritingBySlug = (slug: string): WritingPost | undefined =>
  getPublishedWriting().find((post) => post.slug === slug)
export const getFeaturedWriting = (limit = 5): WritingPost[] => {
  const posts = getWritingIndex()
  const featured = posts.filter((post) => post.featured)
  return (featured.length ? featured : posts).slice(0, limit)
}
export const getLogFeed = (): LogEntry[] =>
  visibleLog().filter((entry) => entry.visibility !== 'unlisted')
export const getLogBySlug = (slug: string): LogEntry | undefined =>
  visibleLog().find((entry) => entry.slug === slug)
export const hasDetailPage = (entry: LogEntry): boolean => entry.hasDetailPage
export const getLogWithDetailPages = (): LogEntry[] =>
  visibleLog().filter((entry) => entry.hasDetailPage)
export const getFeaturedLog = (limit = 6): LogEntry[] =>
  getLogFeed().slice(0, limit)
export const getAsset = (id?: string) =>
  id ? getSiteModel().assets[id] : undefined
export const getLogBySlugs = (slugs: readonly string[]): LogEntry[] => {
  const entries = new Map(getLogFeed().map((entry) => [entry.slug, entry]))
  return slugs.flatMap((slug) => {
    const entry = entries.get(slug)
    return entry ? [entry] : []
  })
}

const LOG_PAGE_SIZE = 20

export function paginateLogEntries<T>(
  entries: readonly T[],
  requestedPage: number,
) {
  const totalPages = Math.max(1, Math.ceil(entries.length / LOG_PAGE_SIZE))
  const page = Math.min(Math.max(1, requestedPage), totalPages)
  return {
    entries: entries.slice((page - 1) * LOG_PAGE_SIZE, page * LOG_PAGE_SIZE),
    page,
    totalPages,
  }
}
