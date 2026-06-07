/**
 * Shared className for inline / utility text links that live outside prose
 * (e.g. the "all work" section action, footer links, prev/next + back nav).
 *
 * These sit among plain text, so without an underline they're indistinguishable
 * from non-interactive copy. A persistent, offset underline in `subtle` gives a
 * clear link affordance that darkens to `accent` on hover. (decoration-subtle
 * #6b6456 on --color-bg is well above the 3:1 non-text-contrast floor.)
 */
export const inlineLink =
  'underline decoration-subtle underline-offset-4 hover:text-accent hover:decoration-accent'

/**
 * Shared className for large serif title links (index rows, log cards). These
 * are visually prominent, so they get a softer resting underline in `border`
 * (matching the understated article-link convention) rather than the stronger
 * `subtle` line used for small inline links. It darkens to `accent` on hover
 * alongside the text.
 */
export const titleLink =
  'underline decoration-border underline-offset-4 hover:text-accent hover:decoration-accent'
