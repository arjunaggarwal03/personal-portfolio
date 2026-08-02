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

The transfer checks use Chrome DevTools Protocol encoded byte counts. This measures network transfer instead of recompressing decoded response bodies. JavaScript, CSS, and total-route budgets count responses from the application origin. Separate request assertions cover provider activity, while credential-free fixture tests measure initial image and poster bytes served by the test origin. Real Cloudinary and Mux transfer trends begin only after real catalog assets exist.

## Lighthouse

The pull request gate runs one representative Lighthouse audit. The default branch and scheduled workflow run five representative routes three times and enforce the median. Thresholds live with the audit script so changes are reviewed beside the measurement code.

## Production monitoring

Vercel Analytics and Speed Insights provide field measurements. The targets are mobile p75 LCP at or below 1.8 seconds, desktop p75 LCP at or below 1.3 seconds, INP at or below 100 milliseconds, CLS at or below 0.03, and static-route TTFB at or below 400 milliseconds. These are field targets, not claims derived from Lighthouse.

Provider availability is observed separately from pull request tests, so a third-party outage cannot block an unrelated code change.
