import { ImageResponse } from 'next/og'
import { brand } from 'lib/site'
import { SPARKLE_PATH } from 'app/components/icons'

export const size = { width: 48, height: 48 }
export const contentType = 'image/png'

/** Brand favicon: cream editorial sparkle on the warm accent tile. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: brand.accentBright,
        }}
      >
        {/* Raw path + explicit fill, not <SparkleIcon>: this is rendered by
            Satori (next/og), which ignores Tailwind classes and currentColor,
            so the component's class-based coloring wouldn't apply. */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill={brand.bg}>
          <path d={SPARKLE_PATH} />
        </svg>
      </div>
    ),
    size
  )
}
