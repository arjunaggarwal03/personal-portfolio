import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { notFound } from 'next/navigation'

const allowed = new Set(['image.svg', 'video-poster.svg'])

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  if (process.env.MEDIA_TEST_FIXTURES !== '1') notFound()
  const { name } = await params
  if (!allowed.has(name)) notFound()
  const file = await readFile(
    path.join(process.cwd(), 'tests/fixtures/media', name),
  )
  return new Response(file, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
