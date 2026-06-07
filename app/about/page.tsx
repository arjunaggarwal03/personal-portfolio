import Image from 'next/image'
import Link from 'next/link'
import { externalLinks, person, site, socialLinks } from 'lib/site'
import { pageMetadata } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'

export const metadata = pageMetadata({
  title: 'About',
  description:
    'Founding engineer at Lightfield in San Francisco. Interested in systems that turn scattered context into useful work.',
  path: '/about',
})

const threads = [
  'context becoming infrastructure',
  'agents as workflow systems',
  'customer-facing teams becoming more technical',
  'internal knowledge becoming queryable',
  'cities, restaurants, films, and music as taste inputs',
]

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
          <h1 className="font-serif text-2xl tracking-tight">About</h1>
          <p className="mt-1 font-mono text-xs text-subtle">
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
          in San Francisco, where we&rsquo;re building an agentic CRM for
          companies built with their customers.
        </p>

        <p>
          The old CRM was designed for the layer between builders and customers.
          In AI-native companies, that line is starting to blur: sales, product,
          engineering, delivery, and agents all need the same live picture of
          the customer. My work sits underneath that shift: public APIs,
          workflow automation, agent tools, human-in-the-loop review,
          notifications, and core CRM surfaces.
        </p>

        <p>
          Before Lightfield, I worked on payments infrastructure at AWS,
          enterprise workflow automation at Bank of America, graph ML at Capital
          One, and co-founded Plato, an intelligent service catalog for internal
          engineering knowledge. Earlier, I worked at Mindgrasp before ChatGPT
          made AI study tools obvious, and worked on applied ML research at UMD.
        </p>

        <p>
          The common thread is context: customer context, engineering context,
          graph context, and the systems that make it usable.
        </p>

        <h2>Threads I keep returning to</h2>
        <ul>
          {threads.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <h2>Outside work</h2>
        <p>
          I keep loose notes on cities, restaurants, films, music, and things I
          want to remember. Most of that lives in the{' '}
          <Link href="/log">Log</Link>.
        </p>

        <h2>Elsewhere</h2>
        <p className="flex flex-wrap gap-x-2 font-mono text-sm">
          {socialLinks.map((link, i) => (
            <span key={link.label}>
              {link.href.startsWith('http') ? (
                <ExternalLink href={link.href}>{link.label}</ExternalLink>
              ) : (
                <a href={link.href}>{link.label}</a>
              )}
              {i < socialLinks.length - 1 ? (
                <span aria-hidden="true" className="px-1 text-subtle">
                  ·
                </span>
              ) : null}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
