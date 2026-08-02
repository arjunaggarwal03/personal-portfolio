import { notFound } from 'next/navigation'
import { PersonalImage } from 'app/components/personal-image'
import { MuxVideo } from 'app/components/mux-video'
import { imageAssetSchema, videoAssetSchema } from 'lib/content/schemas/media'

const image = imageAssetSchema.parse({
  id: 'test-image',
  kind: 'image',
  provider: 'cloudinary',
  sourceId: 'test-only',
  width: 1200,
  height: 800,
  alt: 'Minimal warm landscape test fixture',
  visibility: 'public',
  fixturePath: '/test-media-fixture/files/image.svg',
})

const video = videoAssetSchema.parse({
  id: 'test-video',
  kind: 'video',
  provider: 'mux',
  sourceId: 'test-only',
  playbackId: 'EcHgOK9coz5K4rjSwOkoE7Y7O01201YMIC200RI6lNxnhs',
  width: 1280,
  height: 720,
  duration: 12,
  alt: 'Minimal warm video test fixture',
  visibility: 'public',
  fixturePosterPath: '/test-media-fixture/files/video-poster.svg',
})

export const dynamic = 'force-dynamic'

export default async function TestMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string }>
}) {
  if (process.env.MEDIA_TEST_FIXTURES !== '1') notFound()
  const fixtureCase = (await searchParams).case
  return (
    <main className="mx-auto max-w-3xl p-8">
      {fixtureCase === 'video' ? (
        <MuxVideo asset={video} />
      ) : (
        <div data-gallery-layout>
          <PersonalImage asset={image} priority />
          <PersonalImage asset={image} />
        </div>
      )}
    </main>
  )
}
