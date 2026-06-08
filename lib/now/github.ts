import { social } from 'lib/site'
import type { Building, Commit, ContributionDay, SourceResult } from './types'

/**
 * GitHub "Building" source. Uses the commit search API (`/search/commits`),
 * which surfaces a user's authored commits across all public repos — unlike
 * the public *events* feed, which is sparse and frequently returns nothing even
 * right after a push. Works unauthenticated; setting GITHUB_TOKEN (classic PAT,
 * no scopes needed for public data) raises the rate limit. Username is derived
 * from the GitHub profile link in lib/site, overridable via GITHUB_USERNAME.
 */

const API = 'https://api.github.com'
const COMMIT_LIMIT = 4
const REVALIDATE = 300
const WEEK_MS = 7 * 24 * 60 * 60 * 1000
/** How many trailing calendar weeks of contributions to show in the heatmap. */
const HEATMAP_WEEKS = 16

const now = () => new Date().toISOString()

function username(): string {
  if (process.env.GITHUB_USERNAME) return process.env.GITHUB_USERNAME
  const match = social.github.match(/github\.com\/([^/]+)/)
  return match?.[1] ?? ''
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

type SearchItem = {
  sha: string
  html_url: string
  commit: { message: string; author?: { date?: string } }
  repository?: { name?: string }
}
type SearchResponse = { total_count: number; items: SearchItem[] }

async function searchCommits(
  q: string,
  perPage: number,
): Promise<SearchResponse | null> {
  const url =
    `${API}/search/commits?q=${encodeURIComponent(q)}` +
    `&sort=author-date&order=desc&per_page=${perPage}`
  try {
    const res = await fetch(url, {
      headers: headers(),
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return null
    return (await res.json()) as SearchResponse
  } catch {
    return null
  }
}

const CONTRIB_QUERY = `query($login:String!){
  user(login:$login){
    contributionsCollection{
      contributionCalendar{
        weeks{ contributionDays{ date contributionCount } }
      }
    }
  }
}`

type GqlWeek = {
  contributionDays: { date: string; contributionCount: number }[]
}
type GqlResponse = {
  data?: {
    user?: {
      contributionsCollection?: { contributionCalendar?: { weeks?: GqlWeek[] } }
    }
  }
}

/**
 * Trailing contribution calendar via the GraphQL API, grouped as weeks of days
 * (Sun→Sat) for the heatmap. GraphQL requires a token (any classic PAT works,
 * no scopes needed for public contributions); returns [] when none is set or on
 * any failure, so the rest of the tile still renders.
 */
async function fetchContributions(user: string): Promise<ContributionDay[][]> {
  if (!process.env.GITHUB_TOKEN) return []
  try {
    const res = await fetch(`${API}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CONTRIB_QUERY,
        variables: { login: user },
      }),
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return []
    const json = (await res.json()) as GqlResponse
    const weeks =
      json.data?.user?.contributionsCollection?.contributionCalendar?.weeks ??
      []
    return weeks.slice(-HEATMAP_WEEKS).map((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
      })),
    )
  } catch {
    return []
  }
}

export async function getBuilding(): Promise<SourceResult<Building>> {
  const user = username()
  if (!user) return { state: 'unconfigured', data: null, fetchedAt: now() }

  const weekAgoDate = new Date(Date.now() - WEEK_MS).toISOString().split('T')[0]

  const [recent, week, contributions] = await Promise.all([
    searchCommits(`author:${user}`, COMMIT_LIMIT),
    searchCommits(`author:${user} author-date:>=${weekAgoDate}`, 1),
    fetchContributions(user),
  ])

  if (!recent) return { state: 'empty', data: null, fetchedAt: now() }

  const commits: Commit[] = recent.items.slice(0, COMMIT_LIMIT).map((item) => ({
    repo: item.repository?.name ?? 'repo',
    message: item.commit.message.split('\n')[0],
    sha: item.sha.slice(0, 7),
    url: item.html_url,
    date: item.commit.author?.date ?? now(),
  }))

  if (commits.length === 0) {
    return { state: 'empty', data: null, fetchedAt: now() }
  }

  return {
    state: 'ok',
    data: { commits, commitsThisWeek: week?.total_count ?? 0, contributions },
    fetchedAt: now(),
  }
}
