import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="max-w-prose">
      <h1 className="font-serif text-2xl tracking-tight">
        I couldn&rsquo;t find that page
      </h1>
      <p className="mt-3 text-muted">
        It may have moved, or the link may be wrong. Go{' '}
        <Link href="/">home</Link>, browse <Link href="/work">Work</Link>, or
        read <Link href="/writing">Writing</Link>.
      </p>
    </section>
  )
}
