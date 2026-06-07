/**
 * Indicator appended to links that open in a new tab. Pairs a visible arrow icon
 * (hidden from assistive tech, since it's decorative) with visually-hidden text
 * so screen-reader and sighted users both learn the link opens a new tab
 * (WCAG best practice G201). Use this directly when an <a> can't be swapped for
 * <ExternalLink> (e.g. mailto stays a plain link; MDX links keep their props).
 */
export function NewTabIndicator() {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-0.5 inline-block size-[0.7em] align-[0.02em]"
      >
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
      </svg>
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
