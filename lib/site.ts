/**
 * Single source of truth for site-wide identity, navigation, and links.
 * Update copy, nav, and social links here rather than in individual components.
 */

export const baseUrl = 'https://www.arjunaggarwal.dev'

export const site = {
  name: 'Arjun Aggarwal',
  role: 'Founding engineer at Lightfield',
  location: 'San Francisco',
  description:
    'Founding engineer at Lightfield, building agentic CRM and customer-context infrastructure in San Francisco.',
  /** Small rotating-feel line shown in the footer. */
  currentlyThinking: 'agents, workflow state, customer context',
} as const

export type NavItem = { path: string; label: string }

export const navItems: NavItem[] = [
  { path: '/work', label: 'Work' },
  { path: '/writing', label: 'Writing' },
  { path: '/log', label: 'Log' },
  { path: '/about', label: 'About' },
]

export type SiteLink = { label: string; href: string }

/** Named social/contact URLs, so copy can reference them by name. */
export const social = {
  linkedin: 'https://www.linkedin.com/in/arjunaggarwal1/',
  github: 'https://github.com/arjunaggarwal03',
  x: 'https://x.com/arjunaggarwal1',
  email: 'mailto:arjun@arjunaggarwal.dev',
} as const

/** External product/company links referenced in page copy. */
export const externalLinks = {
  lightfield: 'https://lightfield.app',
} as const

/** External profiles, reused by the footer and the About page. */
export const socialLinks: SiteLink[] = [
  { label: 'LinkedIn', href: social.linkedin },
  { label: 'GitHub', href: social.github },
  { label: 'X', href: social.x },
  { label: 'Email', href: social.email },
]

/** Footer links: social profiles plus an internal Resume link. */
export const footerLinks: SiteLink[] = [
  { label: 'LinkedIn', href: social.linkedin },
  { label: 'GitHub', href: social.github },
  { label: 'X', href: social.x },
  { label: 'Resume', href: '/resume' },
  { label: 'Email', href: social.email },
]

export function isExternal(href: string): boolean {
  return /^https?:|^mailto:/.test(href)
}
