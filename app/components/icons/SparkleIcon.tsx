import { forwardRef } from 'react'
import SvgIcon, { type SvgProps } from './SvgIcon'

/**
 * Four-point editorial sparkle (concave star) on a 24x24 grid. The brand mark.
 * Exported as a raw path too, for the favicon/Apple-icon generators that draw
 * SVG to PNG (Satori) and can't render a React component with Tailwind classes.
 */
export const SPARKLE_PATH =
  'M12 1.5 C12 7 17 12 22.5 12 C17 12 12 17 12 22.5 C12 17 7 12 1.5 12 C7 12 12 7 12 1.5 Z'

const SparkleIcon = forwardRef<SVGSVGElement, SvgProps>((props, ref) => (
  <SvgIcon ref={ref} viewBox="0 0 24 24" {...props}>
    <path d={SPARKLE_PATH} />
  </SvgIcon>
))

SparkleIcon.displayName = 'SparkleIcon'

export default SparkleIcon
