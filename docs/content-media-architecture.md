# Content and media architecture

The site has four layers:

1. Sources in `content/`, plus the structured site, work, and experiment data.
2. Zod schemas, normalization, cross-reference validation, and the read-only site model in `lib/content/`.
3. Small provider adapters in `lib/media/` and `lib/now/`.
4. Routes, feeds, metadata, and components in `app/`.

There are no barrel or compatibility modules. Import the schema, query, or adapter that owns the behavior you need.

## Content rules

- Zod schemas define editable input and infer application types.
- Schemas are strict. Unknown frontmatter fields fail validation instead of disappearing silently.
- Normalization adds derived values such as IDs, slugs, reading time, and detail-page state.
- Personal media uses catalog asset IDs. Provider IDs do not belong in Log MDX.
- A visual Log entry must declare a cover, and that cover must appear in its gallery.
- Public entries cannot reference private assets.
- Unlisted Log entries resolve by URL but stay out of indexes, feeds, and the sitemap. Private entries are hidden in production.
- Writing drafts have preview pages only outside production. Forthcoming writing can appear on the index without a detail route.

## Personal media

`content/media/catalog.json` stores validated metadata for published Cloudinary images and Mux videos. It does not store media bytes. A Log entry references an ordered gallery:

```yaml
cover: "2026-sf-evening-01"
gallery: ["2026-sf-evening-01", "2026-sf-evening-02"]
layout: "pair"
```

Cloudinary images use direct responsive delivery URLs, so the image is transformed once. Mux videos are poster-first and load the player only after a visitor chooses to play. Log index pages never mount a video player.

The media fixtures under `tests/fixtures/` are available only when `MEDIA_TEST_FIXTURES=1`. They are not catalog content and their route returns 404 in normal deployments.

## Validation

Run `npm run content:validate` after editing content. Run `npm run check:fast` for the normal local gate and `npm run check` before publishing a code change.
