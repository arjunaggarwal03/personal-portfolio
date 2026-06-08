import { getSite } from 'lib/now/vercel'
import { relativeTime } from 'lib/now/format'
import { ExternalLink } from '../external-link'
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
  const up = Boolean(ping?.ok)

  return (
    <NowTile eyebrow={EYEBROW} fetchedAt={fetchedAt}>
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              up ? 'animate-pulse bg-accent' : 'bg-subtle'
            }`}
            aria-hidden="true"
          />
          <span className="text-[0.95rem] text-ink">
            {up ? 'Operational' : 'No response'}
          </span>
        </div>

        {up && ping ? (
          <p className="leading-none">
            <span className="font-serif text-4xl tracking-tight text-ink">
              {ping.ms}
            </span>
            <span className="text-sm text-muted">ms</span>
            <span className="ml-2 font-mono text-[0.7rem] uppercase tracking-wider text-subtle">
              live ping
            </span>
          </p>
        ) : null}

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
