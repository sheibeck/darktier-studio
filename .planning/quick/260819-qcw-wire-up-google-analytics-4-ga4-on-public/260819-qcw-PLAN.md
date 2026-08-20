---
quick_id: 260819-qcw
description: Wire up Google Analytics 4 (GA4) on public pages
date: 2026-08-19
status: complete
---

# Quick Task 260819-qcw: Wire up Google Analytics 4 (GA4) on public pages

## Problem

The owner had a GA4 measurement ID (`G-MRCZECCCLW`) in `.env.local` but analytics
never fired. Two reasons: (1) nothing in the codebase read the value or loaded
`gtag.js` — only Cloudflare Web Analytics was wired; (2) the var used a `VITE_`
prefix, which Astro does not expose to the browser (Astro uses `PUBLIC_`).

## Tasks

1. **Add GA4 gtag injection to `src/layouts/Layout.astro`** — read
   `PUBLIC_FIREBASE_MEASUREMENT_ID`, gate on `Boolean(gaId) && !noindex` (mirroring
   the existing Cloudflare beacon), and emit the standard async `gtag.js` +
   inline `gtag('config', …)` snippet in the body. Skips `/admin` and any
   `noindex` page.
   - files: `src/layouts/Layout.astro`
   - verify: `npm run check` passes; built HTML contains the gtag script only
     when the env var is set.
   - done: GA4 loads on public pages when `PUBLIC_FIREBASE_MEASUREMENT_ID` is set.

2. **Document `PUBLIC_FIREBASE_MEASUREMENT_ID` in `docs/environment.md`** — new
   "Analytics (optional)" section covering both GA4 (cookie-setting) and the
   existing Cloudflare token (cookie-free), with the `PUBLIC_` vs `VITE_` prefix
   gotcha called out.
   - files: `docs/environment.md`
   - done: var is documented with example and source.

## Out of scope

- Renaming the var in `.env.local` (owner did this manually).
- Consent banner / cookie disclosure (GA4 sets cookies — noted as a follow-up).

## Notes

`.env.local` is git-ignored and not readable in this environment; the owner
renamed `VITE_FIREBASE_MEASUREMENT_ID` → `PUBLIC_FIREBASE_MEASUREMENT_ID` locally.
For production, set `PUBLIC_FIREBASE_MEASUREMENT_ID` as a GitHub Actions var.
