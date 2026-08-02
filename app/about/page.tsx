import Image from 'next/image'
import Link from 'next/link'
import { externalLinks, person, site, social } from 'lib/site'
import { pageMetadata } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'
import { typeStyles } from 'lib/typography'

export const metadata = pageMetadata({
  title: 'About',
  description:
    'About Arjun Aggarwal, a founding engineer at Lightfield in San Francisco working across AI products, APIs, workflows, and CRM systems.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <section className="max-w-prose">
      <header className="flex items-center gap-4">
        <Image
          src={person.image}
          alt={`${person.name}, ${person.jobTitle} at ${person.company}`}
          width={84}
          height={84}
          priority
          className="rounded-lg border border-border object-cover"
        />
        <div>
          <h1 className={typeStyles.indexTitle}>About</h1>
          <p className={`${typeStyles.caption} mt-1 text-subtle`}>
            {person.jobTitle} at {person.company} · {site.location}
          </p>
        </div>
      </header>

      <div className="article mt-8">
        <p>
          I&rsquo;m a founding engineer at{' '}
          <ExternalLink href={externalLinks.lightfield}>
            Lightfield
          </ExternalLink>{' '}
          in San Francisco. We are building a CRM for companies where sales,
          product, engineering, and delivery all participate in the customer
          relationship.
        </p>

        <p>
          My work moves between product and systems. I&rsquo;ve helped turn
          product operations into a public API and Python SDK used by our own
          agent, built tools for creating and editing CRM tasks, and worked on
          workflow automation, human review, notifications, and core product
          surfaces.
        </p>

        <p>
          I&rsquo;m interested in what changes when software is operated by a
          model as well as a person. Human-facing products contain years of
          implicit assumptions: people resolve ambiguous names, notice stale
          records, recover from unclear errors, and understand when a
          technically valid action would be socially wrong. When a model becomes
          another operator, those assumptions become product and systems
          decisions.
        </p>

        <p>
          Before Lightfield, I briefly joined YouTube&rsquo;s Living Room team
          at Google. I left after a week because I wanted more ownership and a
          shorter distance between the work and the customer. The decision was
          not as inevitable as a retrospective career narrative can make it
          sound. It was a bet on what I would learn, made with limited
          information.
        </p>

        <p>
          Earlier, I built financial-event infrastructure at AWS, worked with a
          roughly 900-million-edge graph at Capital One, automated risk testing
          at Bank of America, joined Mindgrasp before it had traction, and
          co-founded Plato, a service catalog for internal engineering
          knowledge.
        </p>

        <p>
          Looking backward, I can see a recurring attraction to systems that
          make complicated domains easier to understand and operate. The path
          was not as deliberate as that pattern sounds: some choices came from
          intellectual interest, some from opportunity, and some from wanting to
          move faster.
        </p>

        <p>
          Outside work, I spend a lot of time on restaurants, films, music,
          cities, soccer, and travel. Those interests live mostly in the{' '}
          <Link href="/log">Log</Link>, where they are allowed to remain
          interests rather than become metaphors for software.
        </p>

        <p>
          The best way to reach me is <a href={social.email}>email</a>. You can
          also find me on{' '}
          <ExternalLink href={social.linkedin}>LinkedIn</ExternalLink>,{' '}
          <ExternalLink href={social.github}>GitHub</ExternalLink>, and{' '}
          <ExternalLink href={social.x}>X</ExternalLink>.
        </p>
      </div>
    </section>
  )
}
