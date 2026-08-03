import Image from 'next/image'
import Link from 'next/link'
import { externalLinks, person, site, social } from 'lib/site'
import { pageMetadata } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'
import { MetadataLine, PageIntroduction } from 'app/components/editorial'
import { typeStyles } from 'lib/typography'

export const metadata = pageMetadata({
  title: 'About',
  description:
    'About Arjun Aggarwal, the choices behind his path, and the interests that sit outside his professional record.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <article>
      <PageIntroduction title="About" eyebrow="Person, path, present tense">
        <p>
          I&rsquo;m Arjun, a software engineer in San Francisco. The
          professional record is in Work; this page is about the choices around
          it.
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
          <MetadataLine>{site.location}</MetadataLine>
          <p>
            I&rsquo;m a founding engineer at{' '}
            <ExternalLink href={externalLinks.lightfield}>
              Lightfield
            </ExternalLink>{' '}
            in San Francisco. I like work where the product and the underlying
            system cannot be understood separately.
          </p>
        </div>
      </div>

      <section className="grid gap-5 border-t border-border py-9 sm:grid-cols-[11rem_1fr] sm:gap-8">
        <div>
          <MetadataLine>One week · 2025</MetadataLine>
          <h2 className={`${typeStyles.sectionTitle} mt-1`}>
            Choosing uncertainty
          </h2>
        </div>
        <div className="article mt-0">
          <p>
            Before Lightfield, I briefly joined YouTube&rsquo;s Living Room team
            at Google. I left after a week because I wanted more ownership and a
            shorter distance between the work and the customer. The decision was
            not as inevitable as a retrospective career narrative can make it
            sound. It was a bet on what I would learn, made with limited
            information.
          </p>
          <p>
            Plato was an earlier attempt to choose the problem as well as the
            implementation. We did not turn it into a lasting company. It
            remains part of the record because it was my first attempt to choose
            the problem, build the product, and convince other people it should
            exist.
          </p>
          <p>
            Looking backward makes the path seem more deliberate than it was.
            Some choices came from intellectual interest, some from opportunity,
            and some from wanting to move faster.
          </p>
        </div>
      </section>

      <section className="grid gap-5 border-t border-border py-9 sm:grid-cols-[11rem_1fr] sm:gap-8">
        <h2 className={typeStyles.sectionTitle}>Outside the work</h2>
        <div className="article mt-0">
          <p>
            Outside work, I spend a lot of time on restaurants, films, music,
            cities, soccer, and travel. Those interests live mostly in the{' '}
            <Link href="/log">Log</Link>, where they are allowed to remain
            interests rather than become metaphors for software.
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
