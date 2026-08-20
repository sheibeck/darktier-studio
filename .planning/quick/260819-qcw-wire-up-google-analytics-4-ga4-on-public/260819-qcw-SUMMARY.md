---
quick_id: 260819-qcw
description: Wire up Google Analytics 4 (GA4) on public pages
date: 2026-08-19
status: complete
---

# Quick Task 260819-qcw — Summary

## What changed

- **`src/layouts/Layout.astro`** — added GA4 (`gtag.js`) injection. Reads
  `PUBLIC_FIREBASE_MEASUREMENT_ID`; gated on `Boolean(gaId) && !noindex`, mirroring
  the existing Cloudflare Web Analytics beacon. Emits the standard async loader +
  inline `gtag('config', …)` snippet. Absent on `/admin` and any `noindex` page,
  and absent entirely when the env var is unset.
- **`docs/environment.md`** — new "Analytics (optional — public pages only)"
  section documenting `PUBLIC_FIREBASE_MEASUREMENT_ID` (GA4, cookie-setting)
  alongside `PUBLIC_CF_ANALYTICS_TOKEN` (Cloudflare, cookie-free), with the
  Astro `PUBLIC_` vs Vite `VITE_` prefix gotcha called out explicitly.

## Root cause of "GA not working"

1. Nothing read the measurement ID or loaded `gtag.js` — only Cloudflare was wired.
2. The var was `VITE_FIREBASE_MEASUREMENT_ID`; Astro only exposes `PUBLIC_`-prefixed
   vars to the browser, so a `VITE_` prefix silently no-ops. Owner renamed it to
   `PUBLIC_FIREBASE_MEASUREMENT_ID` in `.env.local`.

## Verification

- `npm run build` succeeds; static output in `dist/`.
- GA snippet is env-gated and skipped on `noindex`/admin pages.

## Follow-ups (not done)

- GA4 sets cookies; consider a cookie/consent disclosure in the footer if desired
  (this is why the project originally chose cookie-free Cloudflare — see CLAUDE.md
  "What NOT to Use").
- For production, set `PUBLIC_FIREBASE_MEASUREMENT_ID` as a GitHub Actions var so
  CI deploys include it (a local `npm run deploy` picks it up from `.env.local`).
