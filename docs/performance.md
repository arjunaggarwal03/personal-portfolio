# Performance contracts

## Baseline

Baseline was recorded from `origin/main` on 2026-07-26 in the local macOS worktree:

- production build: passed; 29 routes, with `/log` and `/now` dynamically rendered;
- typecheck and format: passed;
- largest compressed shared JavaScript chunk: 70,996 bytes;
- compressed initial CSS: 7,400 bytes;
- lint could not execute under the local Node 20.18 x64/Rosetta runtime because npm omitted Oxlint's optional native binding; CI uses the repository-required Node 24;
- the pre-change Log index mounted every embed, including video; `/now` continuously self-pinged; no pagination, media behavior tests, Lighthouse gate, or transfer budget existed.

The production route/build measurements after this change are recorded by Playwright and Lighthouse in CI and in the draft PR. Lighthouse runs each representative route three times; LHCI evaluates the median run.

## Enforced lab budgets

- Lighthouse: Performance ≥ 95, Accessibility = 100, Best Practices ≥ 95, SEO = 100.
- Simulated mobile: LCP ≤ 3.0 s, CLS ≤ 0.03, TBT ≤ 100 ms, Speed Index ≤ 2.0 s. The 3.0 s lab exception is backed by a 2.63 s median text-only floor, a 2.854 s responsive lead-image median, and a repeatable 2.926 s `/now` result under Lighthouse simulation; the 1.8 s field target remains unchanged.
- Initial compressed CSS ≤ 35 KiB.
- Initial compressed transfer: text detail ≤ 300 KiB; Log index ≤ 500 KiB.
- Zero video/HLS bytes before interaction; no player on the Log index.
- At most 20 rendered Log entries per page.
- Compressed initial JavaScript is gated at 175 KiB, not the desired 130 KiB. The production browser measurement for a text-only Writing detail route is 170,430 bytes (166.4 KiB), establishing the current Next 16 shared-runtime floor. This explicit exception must not be raised without new evidence; route-owned client JavaScript remains expected to stay within 20 KiB where measurable.

Fixture SVGs are non-personal, deterministic, and exercise image/video detail behavior without provider credentials or build-time network access.

## Field targets

Vercel Analytics and Speed Insights remain enabled. Targets are p75 mobile LCP ≤ 1.8 s, desktop LCP ≤ 1.3 s, INP ≤ 100 ms, CLS ≤ 0.03, and static-route TTFB ≤ 400 ms.

## CI

The fast job validates content, types, lint, formatting, and unit/schema behavior. The browser job builds production once and runs smoke, link, media, and axe tests. Its build artifact feeds the separate performance job. Scheduled remote health checks vendor assets and external links without making ordinary PRs depend on provider availability.
