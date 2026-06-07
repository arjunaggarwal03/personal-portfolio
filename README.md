# arjunaggarwal.dev

My personal site: a builder profile, a writing index, and a living log of what
I'm noticing. Warm-editorial, text-first, and driven entirely by local MDX and
typed data files (no CMS, no database).

**Live:** [www.arjunaggarwal.dev](https://www.arjunaggarwal.dev)

## Quick start

Requires **Node 20+** and npm.

```bash
git clone https://github.com/arjunaggarwal03/personal-portfolio.git
cd personal-portfolio
npm install
npm run dev          # http://localhost:3000
```

To add or edit content, see [Editing content](#editing-content). Most changes
are just MDX or TypeScript files under `content/`.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS v4** (design tokens via `@theme` in `app/global.css`)
- **MDX** content via `next-mdx-remote/rsc` (v6) + `gray-matter` frontmatter,
  with `remark-gfm` (tables/strikethrough/autolinks) and `rehype-slug` +
  `rehype-autolink-headings` (deep-linkable headings)
- **Frontmatter validation** via `zod` schemas (`lib/schemas.ts`): malformed
  content fails the build with a file-scoped error
- Images via `next/image`; fonts: Newsreader (serif), Inter (sans), IBM Plex
  Mono (mono) via `next/font`
- ESLint **flat config** (`eslint.config.mjs`), ready for Next 16

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build (also typechecks + lints)
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Project structure

```text
app/                 routes + UI
  page.tsx           Home
  work/              Work
  writing/           Writing index + [slug] detail
  log/               Log index (filterable) + [slug] detail
  about/ experiments/ resume/
  components/        presentational components (text-first primitives)
  layout.tsx         SiteShell: fonts, header, page wrapper, footer
  global.css         Tailwind v4 + design tokens
  sitemap.ts robots.ts rss/ og/   SEO + feeds (public content only)
content/             all editable content
  writing/*.mdx      essays
  log/*.mdx          log entries
  work.ts            work history (structured data)
  experiments.ts     early projects (structured data)
lib/                 framework-agnostic logic
  site.ts            site identity, nav, social links, baseUrl  <-- edit copy here
  types.ts           content types (single source of truth)
  content.ts         MDX readers + production visibility filtering
  filters.ts         /log filter definitions
  dates.ts           date formatting + sorting
```

## Editing content

### Site copy, nav, links

Edit [`lib/site.ts`](lib/site.ts). Name, role, description, nav items, and
social links all live there and are consumed by the header, footer, About page,
and metadata.

### Add an essay

Create `content/writing/<slug>.mdx`:

```yaml
---
title: "Agent Harnesses, Not Chatbots"
subtitle: "One-line subtitle."
date: "2026-06-07"
status: "published"   # published | draft | forthcoming
summary: "Shown on the index and in metadata."
tags: ["agents", "workflow"]
featured: true        # surfaces on the homepage
showOnIndex: true     # let a forthcoming post appear on the index (title only)
---

Body MDX. Components available: <Callout>, <Aside>, <Quote>, <SystemDiagram>,
<ImageWithCaption>.
```

### Add a log entry

Create `content/log/<YYYY-MM-DD-slug>.mdx`. Content can be anything; the form
stays consistent. A standalone `/log/[slug]` page is generated only when the
entry has media, is an `essay`, has a body longer than ~280 chars, or sets
`flags.detail: true`. Everything else is feed-only.

```yaml
---
type: "album"         # thought | link | album | film | restaurant | clip | ...
date: "2026-06-07"
title: "Mk.gee, Two Star & The Dream Police"
summary: "A one-line opinion."
rating: { value: 8.8, max: 10, label: "in rotation" }
media:
  - { kind: "spotify", url: "https://open.spotify.com/playlist/..." }
location: { city: "Dubai", country: "UAE" }
tags: ["music"]
visibility: "public"  # public | unlisted | private
flags: { featured: true, canonical: true, inRotation: true }
---
```

### Work / Experiments

Edit the typed arrays in [`content/work.ts`](content/work.ts) and
[`content/experiments.ts`](content/experiments.ts).

## Content visibility (production)

`lib/content.ts` filters content for production builds:

- **draft** writing and `flags.draft` log entries are hidden everywhere.
- **forthcoming** essays appear on the Writing index (if `showOnIndex`) but have
  no detail page.
- **private** log entries are hidden; **unlisted** render at their slug but are
  excluded from indexes and feeds.
- `sitemap.xml` and `rss` include public, published content only.

In dev (`npm run dev`) drafts are visible so you can preview them.

## License

Code is licensed under the MIT License. Site content (writing, log entries,
copy, and images) is © 2026 Arjun Aggarwal, all rights reserved.
