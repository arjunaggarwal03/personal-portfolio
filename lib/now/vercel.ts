import { execSync } from 'node:child_process'
import { baseUrl } from 'lib/site'
import type { Deploy, Ping, SiteStatus, SourceResult } from './types'

/**
 * "This site" source. Two independent signals, both token-free:
 *   - The running deploy's git info. On Vercel these come from the
 *     automatically-exposed system env vars (VERCEL_GIT_COMMIT_*), with the
 *     build timestamp baked in via next.config (BUILD_TIME). Locally we fall
 *     back to reading the current git HEAD so the tile still works in dev.
 *   - A live response check: a server-side GET of the homepage, timed, to show
 *     the site is actually responding right now.
 *
 * Deliberately avoids the Vercel API so no privileged token lives in the
 * runtime env. Vercel exposes deploy metadata but not uptime, so we don't fake
 * an uptime number — the ping is the liveness signal.
 */

const PING_TIMEOUT_MS = 5000

const now = () => new Date().toISOString()

function fromVercelEnv(): Deploy | null {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
  const message = process.env.VERCEL_GIT_COMMIT_MESSAGE
  if (!sha && !message) return null
  return {
    message: (message ?? 'Deploy').split('\n')[0],
    env:
      process.env.VERCEL_TARGET_ENV ?? process.env.VERCEL_ENV ?? 'production',
    ref: process.env.VERCEL_GIT_COMMIT_REF ?? '',
    sha: sha ? sha.slice(0, 7) : '',
    createdAt: process.env.BUILD_TIME ?? now(),
    url: baseUrl,
  }
}

/** Dev fallback: read the local git HEAD so the tile isn't empty locally. */
function fromLocalGit(): Deploy | null {
  try {
    const git = (args: string) =>
      execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim()
    const sha = git('rev-parse --short HEAD')
    const message = git('log -1 --pretty=%s')
    const ref = git('rev-parse --abbrev-ref HEAD')
    const isoDate = git('log -1 --pretty=%cI')
    return {
      message,
      env: 'local',
      ref,
      sha,
      createdAt: isoDate || now(),
      url: baseUrl,
    }
  } catch {
    return null
  }
}

async function pingSite(): Promise<Ping | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)
  const start = Date.now()
  try {
    const res = await fetch(baseUrl, {
      signal: controller.signal,
      cache: 'no-store',
    })
    return { ok: res.ok, ms: Date.now() - start }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function getSite(): Promise<SourceResult<SiteStatus>> {
  const deploy = fromVercelEnv() ?? fromLocalGit()
  const ping = await pingSite()

  if (!deploy && !ping) {
    return { state: 'empty', data: null, fetchedAt: now() }
  }

  return { state: 'ok', data: { deploy, ping }, fetchedAt: now() }
}
