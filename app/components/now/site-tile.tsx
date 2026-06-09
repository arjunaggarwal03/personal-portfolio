import { getSite } from 'lib/now/vercel'
import { relativeTime } from 'lib/now/format'
import { ExternalLink } from '../external-link'
import { LivePing } from './live-ping'
import { NowEmpty, NowTile } from './now-tile'

const EYEBROW = 'This site'

export async function SiteTile() {
  const { state, data, fetchedAt } = await getSite()

  if (state !== 'ok' || !data) {
    return (
      <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
        <NowEmpty state={state} label="Site" />
      </NowTile>
    )
  }

  const { deploy, ping } = data
  const initial = ping ? { ms: ping.ms, ok: ping.ok } : null

  return (
    <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
      <div className="flex h-full flex-col gap-2">
        <LivePing initial={initial} />

        {deploy ? (
          <div className="mt-auto flex flex-col gap-1 border-t border-border-soft pt-3">
            <div className="flex items-baseline justify-between gap-3">
              <ExternalLink
                href={deploy.url}
                className="truncate font-mono text-[0.7rem] text-subtle no-underline hover:text-accent"
              >
                {deploy.ref || 'deploy'}
                {deploy.sha ? `@${deploy.sha}` : ''}
              </ExternalLink>
              <span className="shrink-0 font-mono text-[0.7rem] text-subtle">
                {relativeTime(deploy.createdAt)}
              </span>
            </div>
            <p className="truncate text-sm text-muted">{deploy.message}</p>
          </div>
        ) : (
          <p className="mt-auto border-t border-border-soft pt-3 font-mono text-xs text-subtle">
            Deploy info appears in production
          </p>
        )}
      </div>
    </NowTile>
  )
}
