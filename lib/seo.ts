import type { Metadata } from 'next'
import type {
  Person,
  ProfilePage,
  WebSite,
  BlogPosting,
  BreadcrumbList,
  WithContext,
  Graph,
} from 'schema-dts'
import { baseUrl, site, person, social } from 'lib/site'

type SchemaGraph = Graph & { '@context': 'https://schema.org' }

/** URL of the generated OG card for a given page title. */
export function ogImageUrl(title: string): string {
  return `${baseUrl}/og?title=${encodeURIComponent(title)}`
}

/**
 * Standard metadata for a static page: title, description, self-canonical, and
 * matching Open Graph + Twitter cards. Centralizes the per-page SEO fields so
 * pages don't silently inherit the homepage's OG title/type.
 */
export function pageMetadata(input: {
  title: string
  description: string
  path: string
}): Metadata {
  const url = `${baseUrl}${input.path}`
  const ogTitle = `${input.title} · ${site.name}`
  const images = [ogImageUrl(input.title)]
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: ogTitle,
      description: input.description,
      type: 'website',
      url,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: input.description,
      images,
    },
  }
}

/**
 * Stable schema.org @id anchors. Using shared @id values lets every node in
 * every page's graph point back to one canonical Person/WebSite entity, which
 * is what search and AI engines use to merge signals into a single profile.
 */
export const PERSON_ID = `${baseUrl}/#person`
export const WEBSITE_ID = `${baseUrl}/#website`
const PROFILE_ID = `${baseUrl}/#profilepage`

/** Profiles that prove this site and the person are the same entity. */
const SAME_AS: string[] = [social.linkedin, social.github, social.x]

const personNode: Person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: person.name,
  alternateName: person.alternateName,
  url: baseUrl,
  image: `${baseUrl}${person.image}`,
  jobTitle: person.jobTitle,
  description: person.bio,
  worksFor: {
    '@type': 'Organization',
    name: person.company,
    url: person.companyUrl,
  },
  homeLocation: {
    '@type': 'Place',
    name: person.location,
  },
  knowsAbout: [...person.knowsAbout],
  sameAs: SAME_AS,
}

const webSiteNode: WebSite = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: baseUrl,
  name: person.name,
  alternateName: `${person.name} personal site`,
  inLanguage: 'en-US',
  publisher: { '@id': PERSON_ID },
}

/**
 * Homepage graph: a ProfilePage whose main entity is the Person, plus the
 * WebSite node. This is the single strongest on-page signal for ranking the
 * name and earning a knowledge panel.
 */
export function homeGraph(): SchemaGraph {
  const profilePage: ProfilePage = {
    '@type': 'ProfilePage',
    '@id': PROFILE_ID,
    url: baseUrl,
    name: person.name,
    mainEntity: { '@id': PERSON_ID },
    isPartOf: { '@id': WEBSITE_ID },
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [personNode, webSiteNode, profilePage],
  }
}

/** Article (BlogPosting) graph for an individual writing post. */
export function articleGraph(input: {
  title: string
  description?: string
  url: string
  datePublished: string
  dateModified?: string
  image: string
}): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    image: input.image,
    inLanguage: 'en-US',
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    author: { '@id': PERSON_ID, '@type': 'Person', name: person.name, url: baseUrl },
    publisher: { '@id': PERSON_ID },
    isPartOf: { '@id': WEBSITE_ID },
  }
}

/** Breadcrumb trail for an inner page (helps SERP presentation + entity graph). */
export function breadcrumbGraph(
  trail: { name: string; path: string }[]
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.path}`,
    })),
  }
}
