import Link from 'next/link'
import { footerLinks, isExternal, site } from 'lib/site'

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
                {isExternal(link.href) ? (
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      link.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    className="no-underline hover:text-accent"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className="no-underline hover:text-accent">
                    {link.label}
                  </Link>
                )}
                {i < footerLinks.length - 1 ? (
                  <span className="text-subtle">·</span>
                ) : null}
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  )
}
