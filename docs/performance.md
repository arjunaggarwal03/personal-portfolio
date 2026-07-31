# Performance contracts

Performance checks protect behavior that is easy to regress during content and media work.

## Deterministic checks

Pull requests enforce these contracts with the production build and Playwright:

- At most 20 Log entries render on one index page.
- The Log index mounts no personal video player and requests no video bytes.
- Image details preserve dimensions, responsive sources, eager cover loading, and lazy gallery loading.
- Cloudinary delivery is not nested inside the Next.js image optimizer.
- Mux details render a bounded poster before interaction and request no stream bytes until play.
- Text routes make no Cloudinary or Mux requests.
- Authoring scripts and local workspace paths do not enter browser bundles.
- Initial transferred JavaScript, CSS, and total bytes remain within the limits encoded in `tests/performance.spec.ts`.

The transfer checks use Chrome DevTools Protocol encoded byte counts. This measures network transfer instead of recompressing decoded response bodies.

## Lighthouse

The pull request gate runs one representative Lighthouse audit. The full route matrix runs on the default branch and on the scheduled workflow. Thresholds live with the audit script so changes are reviewed beside the measurement code.

## Production monitoring

Vercel Analytics and Speed Insights provide field measurements. Provider availability is observed separately from pull request tests, so a third-party outage cannot block an unrelated code change.
