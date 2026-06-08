/** Compact relative time for live stamps, e.g. "just now", "4m ago", "2h ago". */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return ''
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000))
  if (secs < 45) return 'just now'
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

/** Render a 0–5 (half-step) rating as filled/half/empty stars, or null. */
export function stars(rating: number | null): string | null {
  if (rating === null || !Number.isFinite(rating)) return null
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return '★'.repeat(full) + (half ? '½' : '')
}
