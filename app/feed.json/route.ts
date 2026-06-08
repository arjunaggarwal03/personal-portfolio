import { buildWritingFeed } from 'lib/feed'

export async function GET() {
  return new Response(buildWritingFeed().json1(), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  })
}
