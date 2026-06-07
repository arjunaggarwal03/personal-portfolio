import type { Metadata } from 'next'
import Link from 'next/link'
import { social } from 'lib/site'

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Resume available on request.',
}

export default function ResumePage() {
  return (
    <section className="max-w-prose">
      <h1 className="font-serif text-2xl tracking-tight">Resume</h1>
      <p className="mt-3 text-muted">
        Resume available on request. For current work history, see{' '}
        <Link href="/work">Work</Link> or{' '}
        <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        .
      </p>
    </section>
  )
}
