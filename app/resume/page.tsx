import Link from 'next/link'
import { social } from 'lib/site'
import { pageMetadata } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'
import { typeStyles } from 'lib/typography'

export const metadata = pageMetadata({
  title: 'Resume',
  description: "Where to find Arjun Aggarwal's résumé and full work history.",
  path: '/resume',
})

export default function ResumePage() {
  return (
    <section className="max-w-prose">
      <h1 className={typeStyles.indexTitle}>Resume</h1>
      <p className="mt-3 text-muted">
        I don&rsquo;t host a PDF here yet.{' '}
        <ExternalLink href={social.linkedin}>LinkedIn</ExternalLink> has the
        concise résumé; <Link href="/work">Work</Link> has the decisions and
        systems behind each role.
      </p>
    </section>
  )
}
