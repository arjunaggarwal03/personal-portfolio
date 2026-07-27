# Content and media architecture

## Data flow

Before this change, pages called independent helpers in `lib/content.ts`. That file walked MDX folders, interpreted frontmatter, derived fields, and filtered visibility. Structured work and site identity bypassed validation; Log media was a list of provider URLs rendered directly by both index and detail pages. Feeds, sitemap, SEO, and pages shared helper names but not one validated model boundary.

The current flow has four explicit layers:

1. **Sources** — site identity and structured work data; Writing and Log MDX; `content/media/catalog.json`; and the manually edited `content/now.json`.
2. **Content kernel** — source schemas under `lib/content/schemas`; filesystem reads in `load.ts`; derived fields in `normalize.ts`; cross-reference rules in `validate.ts`; the deeply frozen `SiteModel` in `model.ts`; and visibility-aware access in `queries.ts`.
3. **Integrations** — Cloudinary/Mux URL and player adapters in `lib/media`; Spotify and Open-Meteo adapters in `lib/now`.
4. **Presentation** — App Router pages, feeds, sitemap, SEO/JSON-LD, and AI-facing text endpoints.

There are intentionally no barrel or compatibility modules. Consumers import the precise schema, model, query, or integration module they use.

## Source-of-truth rules

- Zod source/frontmatter schemas define editable input. Application types are inferred from them.
- Normalized schemas add `id`, resolved `slug`, `body`, reading time, and `hasDetailPage`; source files must not hand-author those fields.
- `SiteModel` is built once per render scope, cross-validated, and deeply frozen.
- Personal media relationships use branded, lowercase asset IDs. Provider IDs never appear in Log MDX.
- Spotify, YouTube, tweets, and link previews remain embeds because they are not personal-media assets.
- Builds never fetch Cloudinary or Mux. Provider credentials are authoring-only.

## Visibility

- Production hides Writing drafts and Log entries marked draft/private.
- Forthcoming Writing can appear on its index only when `showOnIndex` is true and never receives a production detail route.
- Unlisted Log entries resolve directly but are omitted from indexes, feeds, and sitemap.
- Public Log entries cannot reference private assets.
- Orphaned catalog assets warn; malformed records, duplicate IDs/slugs, missing references, invalid pair layouts, missing dimensions/alt text, and incomplete videos fail validation.

## Editing content

Writing frontmatter remains compatible with the examples in the main README. Log entries can retain legacy `media` embeds and can add personal media:

```yaml
cover: "2026-sf-evening-01"
gallery: ["2026-sf-evening-01", "2026-sf-evening-02"]
layout: "pair" # wide | standard | portrait | pair
```

The cover is the only personal visual rendered on the Log index. Detail pages render the ordered gallery without a carousel. Pair layouts require an even number of gallery assets.

Run `npm run content:validate` after every source change. `npm run check:fast` is the normal copy-only pre-push command; `npm run check` includes production browser and performance suites.

## Delivery and SEO

Cloudinary images use direct `f_auto,q_auto,w_*` URLs through a `next/image` loader, so Vercel never performs a second remote transformation. Real dimensions and optional focal points preserve layout. Mux detail players use public playback IDs, an explicit poster, and `preload="none"`; index pages render only a poster and never mount a player. YouTube/Spotify compatibility remains.

Visual detail pages use their cover for Open Graph, Twitter, BlogPosting, and valid ImageObject/VideoObject data. Generated text cards remain the fallback.
