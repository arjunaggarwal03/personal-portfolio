/**
 * Indicator appended to links that open in a new tab. Pairs a visible ↗ glyph
 * (hidden from assistive tech, since it's decorative) with visually-hidden text
 * so screen-reader and sighted users both learn the link opens a new tab
 * (WCAG best practice G201). Use this directly when an <a> can't be swapped for
 * <ExternalLink> (e.g. mailto stays a plain link; MDX links keep their props).
 */
export function NewTabIndicator() {
  return (
    <>
      <span aria-hidden="true" className="ml-0.5 inline-block text-[0.8em]">
        &#8599;
      </span>
      <span className="sr-only"> (opens in new tab)</span>
    </>
  )
}

/**
 * Anchor for external links that open in a new tab. Sets the safe rel and
 * appends a NewTabIndicator so the new-tab behavior is announced consistently
 * across the site.
 */
export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <NewTabIndicator />
    </a>
  )
}
