const LOCALE = 'en-US'

const FULL_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}

const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
}

/** Parse a YYYY-MM-DD (or full ISO) string at local midnight. */
function parseDate(date: string): Date {
  return new Date(date.includes('T') ? date : `${date}T00:00:00`)
}

export function formatDate(date: string, includeRelative = false): string {
  const target = parseDate(date)
  const full = target.toLocaleString(LOCALE, FULL_DATE_OPTIONS)

  if (!includeRelative) return full

  const now = new Date()
  const yearsAgo = now.getFullYear() - target.getFullYear()
  const monthsAgo = now.getMonth() - target.getMonth()
  const daysAgo = now.getDate() - target.getDate()

  let relative = 'Today'
  if (yearsAgo > 0) relative = `${yearsAgo}y ago`
  else if (monthsAgo > 0) relative = `${monthsAgo}mo ago`
  else if (daysAgo > 0) relative = `${daysAgo}d ago`

  return `${full} (${relative})`
}

/** Compact date for dense feeds, e.g. "Jun 7". */
export function formatDateShort(date: string): string {
  return parseDate(date).toLocaleString(LOCALE, SHORT_DATE_OPTIONS)
}

export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    new Date(a.date) > new Date(b.date) ? -1 : 1,
  )
}
