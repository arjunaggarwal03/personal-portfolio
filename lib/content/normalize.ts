import readingTime from 'reading-time'
import { logFrontmatterSchema, type LogEntry } from './schemas/log'
import { writingFrontmatterSchema, type WritingPost } from './schemas/writing'
import { parseSource, type RawContentEntry } from './load'

const DETAIL_PAGE_MIN_PLAINTEXT = 280

export function plainTextLength(body?: string): number {
  if (!body) return 0
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim().length
}

export function normalizeWriting(entry: RawContentEntry): WritingPost {
  const source = parseSource(writingFrontmatterSchema, entry.data, entry.source)
  return {
    ...source,
    id: entry.id,
    slug: source.slug ?? entry.id,
    body: entry.body,
    readingTime: entry.body ? readingTime(entry.body).text : undefined,
    hasDetailPage: source.status !== 'forthcoming',
  }
}

export function normalizeLog(entry: RawContentEntry): LogEntry {
  const source = parseSource(logFrontmatterSchema, entry.data, entry.source)
  const body = entry.body || undefined
  const hasDetailPage = Boolean(
    source.flags.detail ||
      source.type === 'essay' ||
      source.cover ||
      source.gallery.length ||
      source.media?.length ||
      plainTextLength(body) > DETAIL_PAGE_MIN_PLAINTEXT,
  )
  return {
    ...source,
    id: entry.id,
    slug: source.slug ?? entry.id,
    body,
    hasDetailPage,
  }
}
