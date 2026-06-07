import Link from 'next/link'
import { social } from 'lib/site'
import { pageMetadata } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'

export const metadata = pageMetadata({
  title: 'Resume',
  description: 'Resume available on request.',
  path: '/resume',
})

export default function ResumePage() {
  return (
    <section className="max-w-prose">
      <h1 className="font-serif text-2xl tracking-tight">Resume</h1>
      <p className="mt-3 text-muted">
        Resume available on request. For current work history, see{' '}
        <Link href="/work">Work</Link> or{' '}
        <ExternalLink href={social.linkedin}>LinkedIn</ExternalLink>.
      </p>
    </section>
  )
}
