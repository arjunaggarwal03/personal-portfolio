import Image from 'next/image'
import Link from 'next/link'
import { externalLinks, person, social } from 'lib/site'
import { pageMetadata } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'
import { MetadataLine, PageIntroduction } from 'app/components/editorial'
import { typeStyles } from 'lib/typography'

export const metadata = pageMetadata({
  title: 'About',
  description:
    'About Arjun Aggarwal, how he got here, and what he likes outside work.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <article>
      <PageIntroduction title="About">
        <p>
          I&rsquo;m Arjun, a software engineer in San Francisco. Work has the
          r&eacute;sum&eacute;-ish version; here&rsquo;s a little more about how
          I got here and what I like outside it.
        </p>
      </PageIntroduction>

      <div className="grid gap-8 border-t border-border py-9 sm:grid-cols-[14rem_1fr]">
        <Image
          src={person.image}
          alt={person.name}
          width={224}
          height={224}
          priority
          className="aspect-square w-full max-w-56 rounded-lg border border-border object-cover"
        />
        <div className="article mt-0">
          <p>
            I&rsquo;m a founding engineer at{' '}
            <ExternalLink href={externalLinks.lightfield}>
              Lightfield
            </ExternalLink>{' '}
            in San Francisco. I like working close enough to the problem that I
            can move between the code, the product, and the people using it.
          </p>
        </div>
      </div>

      <section className="grid gap-5 border-t border-border py-9 sm:grid-cols-[11rem_1fr] sm:gap-8">
        <div>
          <h2 className={typeStyles.sectionTitle}>One week at Google</h2>
          <div className="mt-1">
            <MetadataLine>2025</MetadataLine>
          </div>
        </div>
        <div className="article mt-0">
          <p>
            Before Lightfield, I joined YouTube&rsquo;s Living Room team at
            Google. A week later, I left to join Lightfield. I wanted more
            ownership and a shorter path between what I built and the people
            using it. It was a real gamble; I only knew that it felt worth
            taking.
          </p>
          <p>
            Before that, I co-founded Plato, a service catalog for internal
            engineering knowledge. It did not become a lasting company, but it
            taught me what it feels like to pick the problem, build the product,
            and try to convince people it should exist.
          </p>
          <p>
            None of this followed a grand plan. Some choices came from
            curiosity, some from opportunity, and some from wanting to move
            faster.
          </p>
        </div>
      </section>

      <section className="grid gap-5 border-t border-border py-9 sm:grid-cols-[11rem_1fr] sm:gap-8">
        <h2 className={typeStyles.sectionTitle}>Away from the laptop</h2>
        <div className="article mt-0">
          <p>
            Outside work, I spend a lot of time on restaurants, films, music,
            cities, soccer, and travel. That&rsquo;s mostly what the{' '}
            <Link href="/log">Log</Link> is for.
          </p>
          <p>
            The best way to reach me is <a href={social.email}>email</a>. You
            can also find me on{' '}
            <ExternalLink href={social.linkedin}>LinkedIn</ExternalLink>,{' '}
            <ExternalLink href={social.github}>GitHub</ExternalLink>, and{' '}
            <ExternalLink href={social.x}>X</ExternalLink>.
          </p>
        </div>
      </section>
    </article>
  )
}
