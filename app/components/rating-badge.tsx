import type { Rating } from 'lib/types'

export function RatingBadge({ rating }: { rating?: Rating }) {
  if (!rating) return null
  const parts: string[] = []
  if (typeof rating.value === 'number') {
    parts.push(rating.max ? `${rating.value}/${rating.max}` : `${rating.value}`)
  }
  if (rating.label) parts.push(rating.label)
  if (parts.length === 0) return null

  return (
    <span className="font-mono text-xs text-accent">{parts.join(' · ')}</span>
  )
}
