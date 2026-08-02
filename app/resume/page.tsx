import Link from 'next/link'
import { social } from 'lib/site'
import { pageMetadata } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'
import { typeStyles } from 'lib/typography'

export const metadata = pageMetadata({
  title: 'Resume',
  description:
    "Résumé links and the fuller work history behind Arjun Aggarwal's roles.",
  path: '/resume',
})

export default function ResumePage() {
  return (
    <section className="max-w-prose">
      <h1 className={typeStyles.indexTitle}>Resume</h1>
      <p className="mt-3 text-muted">
        A concise version of my work and education. For the decisions and
        systems behind each role, see <Link href="/work">Work</Link>.
      </p>
      <p className="mt-4 text-muted">
        I don&rsquo;t host a downloadable PDF on this site yet. The fuller
        narrative is on <Link href="/work">Work</Link>; the résumé format lives
        on <ExternalLink href={social.linkedin}>LinkedIn</ExternalLink>.
      </p>
    </section>
  )
}
