import { getBuilding } from 'lib/now/github'
import { relativeTime } from 'lib/now/format'
import type { ContributionDay } from 'lib/now/types'
import { inlineLink } from 'lib/ui'
import { ExternalLink } from '../external-link'
import { NowEmpty, NowTile } from './now-tile'

const EYEBROW = 'Building'

// Warm ramp from "no activity" through deepening accent — five buckets.
const LEVELS = [
  'bg-border-soft',
  'bg-accent/30',
  'bg-accent/55',
  'bg-accent/80',
  'bg-accent',
]

function levelFor(count: number, max: number): number {
  if (count <= 0) return 0
  const r = count / max
  if (r <= 0.25) return 1
  if (r <= 0.5) return 2
  if (r <= 0.75) return 3
  return 4
}

/** GitHub-style contribution strip: one column per week, one cell per day. */
function Heatmap({ weeks }: { weeks: ContributionDay[][] }) {
  const days = weeks.flat()
  const max = Math.max(1, ...days.map((d) => d.count))
  return (
    <div
      className="grid grid-flow-col grid-rows-7 gap-[3px]"
      aria-hidden="true"
    >
      {days.map((d) => (
        <span
          key={d.date}
          className={`h-2.5 w-2.5 rounded-[2px] ${LEVELS[levelFor(d.count, max)]}`}
        />
      ))}
    </div>
  )
}

export async function BuildingTile() {
  const { state, data, fetchedAt } = await getBuilding()

  if (state !== 'ok' || !data) {
    return (
      <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
        <NowEmpty state={state} label="GitHub" />
      </NowTile>
    )
  }

  const latest = data.commits[0]
  const hasHeatmap = data.contributions.some((w) => w.length > 0)

  return (
    <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-serif text-5xl leading-none tracking-tight text-ink">
              {data.commitsThisWeek}
            </p>
            <p className="mt-2 text-sm text-muted">
              commit{data.commitsThisWeek === 1 ? '' : 's'} this week
            </p>
          </div>
          {hasHeatmap ? (
            <div className="shrink-0">
              <Heatmap weeks={data.contributions} />
              <p className="mt-2 text-right font-mono text-[0.65rem] uppercase tracking-wider text-subtle">
                last {data.contributions.length} weeks
              </p>
            </div>
          ) : null}
        </div>

        {latest ? (
          <div className="mt-auto flex flex-col gap-1 border-t border-border-soft pt-3">
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-subtle">
              {latest.repo} · {relativeTime(latest.date)}
            </p>
            <p className="text-sm leading-snug">
              <ExternalLink
                href={latest.url}
                className={`text-muted ${inlineLink}`}
              >
                {latest.message}
              </ExternalLink>
            </p>
          </div>
        ) : null}
      </div>
    </NowTile>
  )
}
