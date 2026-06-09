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

// One round-trip for both signals: `week` scopes a fresh collection to the
// trailing 7 days and reads *commits only* (the headline number), while
// `calendar` pulls the full trailing-year calendar for the heatmap. Counting
// commits — not total contributions — keeps the number honest: the all-in
// contribution total is dominated by private/restricted activity the visitor
// can't see, so it reads as implausibly high for a public commit count.
const CONTRIB_QUERY = `query($login:String!,$from:DateTime!){
  user(login:$login){
    week: contributionsCollection(from:$from){ totalCommitContributions }
    calendar: contributionsCollection{
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
      week?: { totalCommitContributions?: number }
      calendar?: { contributionCalendar?: { weeks?: GqlWeek[] } }
    }
  }
}

type ContributionData = {
  /** Heatmap weeks (Sun→Sat); empty when no token / on failure. */
  weeks: ContributionDay[][]
  /** Commits authored in the trailing 7 days; null when unavailable. */
  commitsThisWeek: number | null
}

/**
 * Trailing contribution calendar + 7-day commit count via the GraphQL API.
 * GraphQL requires a token (any classic PAT works, no scopes needed for public
 * contributions); returns empty/null when none is set or on any failure, so the
 * rest of the tile still renders.
 */
async function fetchContributions(user: string): Promise<ContributionData> {
  if (!process.env.GITHUB_TOKEN) return { weeks: [], commitsThisWeek: null }
  try {
    const from = new Date(Date.now() - WEEK_MS).toISOString()
    const res = await fetch(`${API}/graphql`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CONTRIB_QUERY,
        variables: { login: user, from },
      }),
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return { weeks: [], commitsThisWeek: null }
    const json = (await res.json()) as GqlResponse
    const rawWeeks =
      json.data?.user?.calendar?.contributionCalendar?.weeks ?? []
    const weeks = rawWeeks.slice(-HEATMAP_WEEKS).map((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
      })),
    )
    return {
      weeks,
      commitsThisWeek: json.data?.user?.week?.totalCommitContributions ?? null,
    }
  } catch {
    return { weeks: [], commitsThisWeek: null }
  }
}

export async function getBuilding(): Promise<SourceResult<Building>> {
  const user = username()
  if (!user) return { state: 'unconfigured', data: null, fetchedAt: now() }

  const [recent, contrib] = await Promise.all([
    searchCommits(`author:${user}`, COMMIT_LIMIT),
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

  // Prefer the GraphQL commit count (reliable, private+public). Fall back to a
  // public commit search only when no token is configured.
  let commitsThisWeek = contrib.commitsThisWeek
  if (commitsThisWeek === null) {
    const weekAgo = new Date(Date.now() - WEEK_MS).toISOString().split('T')[0]
    const week = await searchCommits(
      `author:${user} author-date:>=${weekAgo}`,
      1,
    )
    commitsThisWeek = week?.total_count ?? 0
  }

  return {
    state: 'ok',
    data: { commits, commitsThisWeek, contributions: contrib.weeks },
    fetchedAt: now(),
  }
}
