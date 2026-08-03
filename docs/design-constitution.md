# Design constitution

## Thesis

This website is **a working record of judgment**. It should show how work creates questions, how attention is recorded, how a few concerns remain active, how observations become arguments, and how later experience changes the record.

The site is not a resume with personality, a complete archive, an AI-founder brand, or an exhibition built around interface novelty.

## Qualities

### Precise

Use fewer labels, stronger hierarchy, and metadata only when it changes interpretation. Claims should be specific, sourced in public evidence, and located on the one route that owns them.

### Warm

Let human prose, cultural attention, photographs, uncertainty, and humor remain visible. Do not turn every interest into a professional metaphor.

### Unfinished

Make change over time legible. Questions can remain open, beliefs can be revised, and earlier work can stay visible without implying that the present is a final identity.

## Decision hierarchy

1. Truthfulness
2. Clear thinking
3. Editorial coherence
4. Reader value
5. Accessibility and performance
6. Maintainability
7. Visual novelty

## Route contracts

| Route | Owns | Must not become |
| --- | --- | --- |
| `/` | The current trajectory and strongest evidence | A miniature copy of every route |
| `/work` | Professional judgment under real constraints | A resume with longer bullets |
| `/writing` | Finished arguments | A backlog of intended thought |
| `/log` | What crossed Arjun's attention | A quantified media diary |
| `/now` | What currently survives that attention | A status report or live dashboard |
| `/about` | Biography, choices, and personal context | Repeated professional positioning |
| `/experiments` | Honest evidence of earlier learning | A polished student-project showcase |
| `/resume` | A direct utility artifact | A second narrative Work page |

The footer owns contact, location, accessibility, and provenance only.

## Canonical claims

| Idea | Canonical location | Remove or compress elsewhere |
| --- | --- | --- |
| Present role and concise professional introduction | Home | About, Now, footer |
| Work ownership, constraints, and results | Work | Home, About |
| Current unresolved question | Now | Writing, footer |
| Published positions | Writing | Now and route introductions |
| Career choices and contradiction | About | Work introduction |
| Cultural and incomplete observations | Log | Home beyond a small selection |

## Visual rules

- Serif type names arguments, entries, and page-level ideas.
- Sans-serif type carries prose and interface copy.
- Sans-serif type carries metadata as well as prose so dates, places, sources, and entry types remain legible without becoming a competing visual system.
- Monospaced type is reserved for code and system diagrams.
- Accent indicates selection or change: active navigation, `on view`, and revision. It is not decoration.
- Routes share type, color, measure, and spacing without sharing one universal page template.
- Images are evidence or artifacts, never atmosphere.
- Motion is unnecessary unless it explains a state change.

## Content constraints

- Do not invent outcomes, chronology, customer stories, technical details, or biographical scenes.
- Preserve meaningful uncertainty.
- Numeric cultural ratings are not part of the public vocabulary; use expressive states where a state adds meaning.
- A `/now` selection must originate in the public Log and explain why it remains relevant.
- About still needs user-supplied biographical artifacts or scenes before its narrative can be considered complete.

## Baseline

The redesign starts from `origin/main` at `66e11f3`. The most recent verified merged implementation reported 49 browser/accessibility checks, five performance checks, Lighthouse performance `0.97`, and accessibility, best-practices, and SEO scores of `1.00`. This branch must meet or improve the repository's automated thresholds; current results are recorded at handoff rather than treated as guaranteed by the historical baseline.

## Current verification

The redesign branch passes the complete repository gate: content validation, type checking, linting, formatting, 22 unit tests, a production build, 53 browser tests, and five performance contracts. The browser suite includes accessibility checks across 13 routes. Lighthouse reports `0.98` performance and `1.00` accessibility, best practices, and SEO. `knip` and `npm audit` are run separately at handoff.
