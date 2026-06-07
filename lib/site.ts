/**
 * Single source of truth for site-wide identity, navigation, and links.
 * Update copy, nav, and social links here rather than in individual components.
 */

export const baseUrl = 'https://www.arjunaggarwal.dev'

/**
 * Brand colors, mirrored from the @theme tokens in app/global.css. Generated
 * images (favicon, OG) and platform metadata (manifest, theme-color) run
 * outside CSS and can't read those tokens, so this is their single source of
 * truth. Keep in sync with global.css.
 */
export const brand = {
  bg: '#f4ecd9',
  surface: '#fffdf8',
  ink: '#181713',
  muted: '#6f6a60',
  accent: '#7c4a32',
  /** Brighter terracotta for solid brand marks (favicon tile), where the
   *  text-tuned `accent` reads too dark/muddy at small sizes. */
  accentBright: '#b86a45',
} as const

export const site = {
  name: 'Arjun Aggarwal',
  role: 'Founding engineer at Lightfield',
  location: 'San Francisco',
  description:
    'Founding engineer at Lightfield, building agentic CRM and customer-context infrastructure in San Francisco.',
  /** Small rotating-feel line shown in the footer. */
  currentlyThinking: 'agents, workflow state, customer context',
} as const

/**
 * Structured identity used for SEO/GEO: schema.org Person, OG metadata, and
 * the llms.txt feed. These are the signals that tie the site to a single
 * real-world entity ("Arjun Aggarwal") across search and AI engines.
 */
export const person = {
  name: 'Arjun Aggarwal',
  alternateName: 'Arjun',
  jobTitle: 'Founding Engineer',
  company: 'Lightfield',
  companyUrl: 'https://lightfield.app',
  location: 'San Francisco, California',
  /** Headshot in /public. Square; used for the Person schema image. */
  image: '/arjun-aggarwal.jpg',
  /** One-sentence, third-person bio that LLMs and rich results can quote. */
  bio: 'Arjun Aggarwal is a founding engineer at Lightfield in San Francisco, where he builds agentic CRM and customer-context infrastructure: public APIs, workflow automation, agent tools, and human-in-the-loop systems.',
  knowsAbout: [
    'AI agents',
    'agentic CRM',
    'customer context infrastructure',
    'workflow automation',
    'developer tools',
    'graph machine learning',
    'startup engineering',
  ],
  /** Prior affiliations, for entity disambiguation. */
  affiliations: [
    'Lightfield',
    'Google',
    'Amazon Web Services',
    'Capital One',
    'Bank of America',
    'University of Maryland',
  ],
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

/** Footer links: social profiles plus internal Resume and Accessibility links. */
export const footerLinks: SiteLink[] = [
  { label: 'LinkedIn', href: social.linkedin },
  { label: 'GitHub', href: social.github },
  { label: 'X', href: social.x },
  { label: 'Resume', href: '/resume' },
  { label: 'Email', href: social.email },
  { label: 'Accessibility', href: '/accessibility' },
]

export function isExternal(href: string): boolean {
  return /^https?:|^mailto:/.test(href)
}
