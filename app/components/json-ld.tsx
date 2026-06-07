import type { Thing, Graph, WithContext } from 'schema-dts'

/** A top-level schema.org payload: either a single node or an @graph. */
export type JsonLdData =
  | WithContext<Thing>
  | (Graph & { '@context': 'https://schema.org' })

/**
 * Renders a schema.org JSON-LD block. Server-rendered into the static HTML so
 * crawlers and AI engines read it without executing JavaScript.
 */
export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
