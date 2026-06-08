---
name: vercel-react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
  source: https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices
---

# Vercel React Best Practices

Performance optimization guide for React and Next.js, maintained by Vercel.
70 rules across 8 categories, prioritized by impact.

## When to Apply

- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)
- Check cheap sync conditions before awaiting; move `await` into branches that use it
- Use `Promise.all()` for independent operations; start promises early, await late
- Use `<Suspense>` to stream content

### 2. Bundle Size Optimization (CRITICAL)
- Import directly, avoid barrel files; prefer statically analyzable paths
- `next/dynamic` for heavy components; defer analytics/third-party until after hydration
- Load modules only when a feature activates; preload on hover/focus

### 3. Server-Side Performance (HIGH)
- Authenticate server actions like API routes
- `React.cache()` for per-request dedup; LRU for cross-request caching
- Avoid module-level mutable *request* state (shared caches keyed correctly are OK)
- Minimize data serialized into client components; hoist static I/O to module scope
- Parallelize fetches; use `after()` for non-blocking work

### 4. Client-Side Data Fetching (MEDIUM-HIGH)
- Use SWR for automatic request dedup/caching/revalidation
- Deduplicate global event listeners; use passive listeners for scroll
- Version and minimize localStorage data

### 5. Re-render Optimization (MEDIUM)
- Don't subscribe to state only used in callbacks; derive state during render, not in effects
- Subscribe to derived booleans, not raw values; use functional `setState`
- `useRef` for transient/high-frequency values; lazy `useState` init for expensive values
- Don't define components inside components; use `startTransition`/`useDeferredValue` for non-urgent work

### 6. Rendering Performance (MEDIUM)
- Animate a wrapping `div`, not the SVG element; reduce SVG coordinate precision
- Hoist static JSX; avoid hydration flicker; use ternary (not `&&`) for conditionals
- Resource hints for preloading; `defer`/`async` on scripts

### 7. JavaScript Performance (LOW-MEDIUM)
- Build `Map`/`Set` for repeated lookups; cache property access and results
- Combine iterations; early-exit; hoist `RegExp`; `toSorted()` for immutability

### 8. Advanced Patterns (LOW)
- Store event handlers in refs; `useLatest` for stable callback refs; init once per app load

## Full Compiled Document

The complete guide with every rule expanded (incorrect/correct examples and
rationale) is vendored alongside this file: read [AGENTS.md](AGENTS.md) and
jump to the relevant numbered section (e.g. `3.3 Avoid Shared Module State`,
`5.15 Use useRef for Transient Values`, `6.4 Optimize SVG Precision`).
