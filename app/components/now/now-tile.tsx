import { relativeTime } from 'lib/now/format'
import type { SourceState } from 'lib/now/types'

/** Card shell for a live tile: mono eyebrow + "updated" stamp + content. */
export function NowTile({
  eyebrow,
  fetchedAt,
  children,
}: {
  eyebrow: string
  fetchedAt?: string
  children: React.ReactNode
}) {
  const stamp = fetchedAt ? relativeTime(fetchedAt) : null
  return (
    <section className="flex h-full flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-tile">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-mono text-xs uppercase tracking-wider text-subtle">
          {eyebrow}
        </h2>
        {stamp ? (
          <span className="shrink-0 font-mono text-[0.7rem] text-subtle">
            {stamp}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex-1">{children}</div>
    </section>
  )
}

/** Quiet fallback body when a source is unreachable or not yet configured. */
export function NowEmpty({
  state,
  label,
}: {
  state: SourceState
  label: string
}) {
  const text =
    state === 'unconfigured'
      ? `${label} — not connected yet`
      : `${label} — nothing to show right now`
  return <p className="font-mono text-xs text-subtle">{text}</p>
}
