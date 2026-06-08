import { buildWritingFeed } from 'lib/feed'

export async function GET() {
  return new Response(buildWritingFeed().rss2(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
