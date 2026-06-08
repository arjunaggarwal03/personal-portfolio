import { buildWritingFeed } from 'lib/feed'

export async function GET() {
  return new Response(buildWritingFeed().atom1(), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
}
