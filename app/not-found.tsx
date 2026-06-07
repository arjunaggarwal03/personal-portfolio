import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="max-w-prose">
      <h1 className="font-serif text-2xl tracking-tight">Not found</h1>
      <p className="mt-3 text-muted">
        That page doesn&rsquo;t exist. Head back <Link href="/">home</Link> or
        to the <Link href="/log">log</Link>.
      </p>
    </section>
  )
}
