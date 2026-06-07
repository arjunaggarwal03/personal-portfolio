import Link from 'next/link'
import { footerLinks, isExternal, site } from 'lib/site'
import { inlineLink } from 'lib/ui'
import { ExternalLink } from 'app/components/external-link'

export function Footer() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-[760px] px-6 pb-16">
      <div className="border-t border-border pt-6">
        <p className="font-mono text-xs text-subtle">
          currently thinking about: {site.currentlyThinking}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>Built in {site.location}.</span>
          <span className="flex flex-wrap items-center gap-x-2">
            {footerLinks.map((link, i) => (
              <span key={link.label} className="flex items-center gap-2">
                {link.href.startsWith('http') ? (
                  <ExternalLink href={link.href} className={inlineLink}>
                    {link.label}
                  </ExternalLink>
                ) : isExternal(link.href) ? (
                  <a href={link.href} className={inlineLink}>
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className={inlineLink}>
                    {link.label}
                  </Link>
                )}
                {i < footerLinks.length - 1 ? (
                  <span aria-hidden="true" className="text-subtle">
                    ·
                  </span>
                ) : null}
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  )
}
