import type { MetadataRoute } from 'next'
import { site, person, brand } from 'lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${person.name} · ${person.jobTitle} at ${person.company}`,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'browser',
    background_color: brand.bg,
    theme_color: brand.accent,
    icons: [
      { src: '/icon', sizes: '48x48', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
