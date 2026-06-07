import type React from 'react'
import { forwardRef } from 'react'

export type SvgProps = {
  alt?: string
  style?: React.CSSProperties
  title?: string
  viewBox?: string
  size?: number
  className?: string
}

type Props = SvgProps &
  React.SVGAttributes<SVGSVGElement> & {
    children?: React.ReactNode
  }

/**
 * Shared base for all icons. Renders an <svg> that inherits the current text
 * color via `fill-current`, so icons are colored with Tailwind text utilities
 * (e.g. `text-accent`). Individual icons live alongside this file and wrap it.
 */
const SvgIcon = forwardRef<SVGSVGElement, Props>(
  (
    { alt, children, style, title, viewBox = '0 0 24 24', size, className, ...props },
    ref
  ) => (
    <svg
      ref={ref}
      aria-label={alt}
      role={title ? 'img' : undefined}
      viewBox={viewBox}
      width={size}
      height={size}
      shapeRendering="geometricPrecision"
      style={size ? { width: size, height: size, ...style } : style}
      {...props}
      className={['shrink-0 fill-current', className].filter(Boolean).join(' ')}
    >
      {children}
      {title ? <title>{title}</title> : null}
    </svg>
  )
)

SvgIcon.displayName = 'SvgIcon'

export default SvgIcon
