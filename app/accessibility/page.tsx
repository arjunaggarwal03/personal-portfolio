import { pageMetadata } from 'lib/seo'
import { ExternalLink } from 'app/components/external-link'

export const metadata = pageMetadata({
  title: 'Accessibility',
  description:
    'Accessibility statement for arjunaggarwal.dev: conformance status, feedback, technical specifications, and assessment approach.',
  path: '/accessibility',
})

const feedbackEmail = 'arjunaggarwal173@gmail.com'

export default function AccessibilityPage() {
  return (
    <section className="max-w-prose">
      <header>
        <h1 className="font-serif text-2xl tracking-tight">
          Accessibility statement
        </h1>
        <p className="mt-1 font-mono text-xs text-subtle">
          For arjunaggarwal.dev
        </p>
      </header>

      <div className="article mt-8">
        <p>
          I am committed to ensuring digital accessibility for people with
          disabilities. I continually improve the user experience for everyone
          and apply the relevant accessibility standards.
        </p>

        <h2>Measures to support accessibility</h2>
        <p>
          I consider accessibility throughout the design and build of this site.
          In particular, this site:
        </p>
        <ul>
          <li>uses semantic HTML and WAI-ARIA only where it adds meaning;</li>
          <li>
            provides a visible keyboard focus indicator and a skip-to-content
            link;
          </li>
          <li>
            aims for text and non-text contrast that meets WCAG 2.2 Level AA;
          </li>
          <li>respects the operating system&rsquo;s reduced-motion setting.</li>
        </ul>

        <h2>Conformance status</h2>
        <p>
          The{' '}
          <ExternalLink href="https://www.w3.org/WAI/standards-guidelines/wcag/">
            Web Content Accessibility Guidelines (WCAG)
          </ExternalLink>{' '}
          define requirements for designers and developers to improve
          accessibility for people with disabilities. They have three levels of
          conformance: Level A, Level AA, and Level AAA.
        </p>
        <p>
          arjunaggarwal.dev is <strong>fully conformant</strong> with WCAG 2.2
          Level AA. Fully conformant means that the content fully conforms to the
          accessibility standard without any exceptions.
        </p>

        <h2>Feedback</h2>
        <p>
          I welcome your feedback on the accessibility of arjunaggarwal.dev.
          Please let me know if you encounter accessibility barriers:
        </p>
        <ul>
          <li>
            Email: <a href={`mailto:${feedbackEmail}`}>{feedbackEmail}</a>
          </li>
        </ul>
        <p>I try to respond to feedback within 5 business days.</p>

        <h2>Technical specifications</h2>
        <p>
          Accessibility of arjunaggarwal.dev relies on the following
          technologies to work with the particular combination of web browser
          and any assistive technologies or plugins installed on your computer:
        </p>
        <ul>
          <li>HTML</li>
          <li>WAI-ARIA</li>
          <li>CSS</li>
          <li>JavaScript</li>
          <li>SVG</li>
        </ul>
        <p>
          These technologies are relied upon for conformance with the
          accessibility standards used.
        </p>

        <h2>Limitations and alternatives</h2>
        <p>
          I am not aware of any accessibility limitations on arjunaggarwal.dev at
          this time. The site is self-assessed rather than independently audited,
          so if you encounter a barrier that is not covered here, please contact
          me using the details above and I will address it.
        </p>

        <h2>Assessment approach</h2>
        <p>
          I assessed the accessibility of arjunaggarwal.dev by self-evaluation,
          using the following tools and methods:
        </p>
        <ul>
          <li>Lighthouse</li>
          <li>axe DevTools</li>
          <li>WAVE</li>
          <li>W3C Nu HTML Checker</li>
          <li>Manual keyboard and focus testing across the site</li>
        </ul>

        <h2>Compatibility with browsers and assistive technology</h2>
        <p>
          arjunaggarwal.dev is designed to be compatible with current versions
          of major web browsers, including Chrome, Firefox, Safari, and Edge.
        </p>

        <h2>Date</h2>
        <p>
          This statement was created on June 7, 2026 using the{' '}
          <ExternalLink href="https://www.w3.org/WAI/planning/statements/">
            W3C Accessibility Statement Generator
          </ExternalLink>
          .
        </p>
      </div>
    </section>
  )
}
