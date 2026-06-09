const WIDTHS = ['82%', '64%', '72%']

/** Streaming placeholder shown while a tile's source is being fetched. */
export function TileSkeleton({
  eyebrow,
  lines = 3,
}: {
  eyebrow: string
  lines?: number
}) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-tile">
      <div className="font-mono text-xs uppercase tracking-wider text-subtle">
        {eyebrow}
      </div>
      <div className="mt-4 flex flex-col gap-2.5" aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-border-soft"
            style={{ width: WIDTHS[i % WIDTHS.length] }}
          />
        ))}
      </div>
      <span className="sr-only">Loading {eyebrow.toLowerCase()}…</span>
    </section>
  )
}
