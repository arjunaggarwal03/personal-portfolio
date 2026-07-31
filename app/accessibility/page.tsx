import { pageMetadata } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'
import { typeStyles } from 'lib/typography'

export const metadata = pageMetadata({
  title: 'Accessibility',
  description:
    'Accessibility practices, testing, known limitations, and contact information for arjunaggarwal.dev.',
  path: '/accessibility',
})

const feedbackEmail = 'arjun@arjunaggarwal.dev'

export default function AccessibilityPage() {
  return (
    <section className="max-w-prose">
      <h1 className={typeStyles.indexTitle}>Accessibility</h1>

      <div className="article mt-8">
        <p>
          I want this site to be usable by as many people as possible, including
          people navigating with a keyboard, screen reader, zoom, or
          reduced-motion preference.
        </p>

        <h2>What the site supports</h2>
        <ul>
          <li>Semantic HTML and descriptive page structure</li>
          <li>A visible keyboard focus indicator and skip-to-content link</li>
          <li>
            Text and interface contrast designed to meet WCAG 2.2 Level AA
          </li>
          <li>Reduced motion when requested by the operating system</li>
          <li>Alternative text for meaningful images</li>
          <li>Automated accessibility checks on each change</li>
        </ul>

        <h2>Current status</h2>
        <p>
          The site is self-assessed and designed to be substantially conformant
          with{' '}
          <ExternalLink href="https://www.w3.org/WAI/standards-guidelines/wcag/">
            WCAG 2.2 Level AA
          </ExternalLink>
          . Third-party media embeds and newly published content may introduce
          issues I have not identified yet.
        </p>
        <p>
          I test with automated tools, keyboard navigation, focus checks, and
          current versions of major browsers. Automated tests help catch
          regressions, but they are not a substitute for feedback from people
          using assistive technology.
        </p>

        <h2>Feedback</h2>
        <p>
          If something prevents you from using the site, email{' '}
          <a href={`mailto:${feedbackEmail}`}>{feedbackEmail}</a>. Please
          include the page and, if you are comfortable sharing it, the browser
          or assistive technology you were using.
        </p>
        <p>
          I will try to acknowledge the report within five business days and fix
          confirmed barriers as quickly as I can.
        </p>

        <h2>Compatibility</h2>
        <p>
          The site is designed for current versions of Chrome, Firefox, Safari,
          and Edge. It relies on HTML, CSS, JavaScript, SVG, and limited
          WAI-ARIA where native HTML does not provide enough meaning.
        </p>

        <h2>Assessment</h2>
        <p>
          Accessibility is checked with axe-core and Playwright in continuous
          integration, along with manual keyboard and focus testing. I also use
          Lighthouse and browser accessibility inspectors during development.
        </p>
        <p>
          <strong>Last reviewed:</strong> July 2026
        </p>
      </div>
    </section>
  )
}
