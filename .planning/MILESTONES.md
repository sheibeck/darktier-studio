# Milestones

## v1.0 Public Launch (Shipped: 2026-08-17 · custom domain live: 2026-08-18)

**Delivered:** The complete Darktier Studios website — a fast, SEO/share-optimized public site (Home, The Vault, The Armory, Dispatches) with a private owner-only admin CMS, built, deployed, and **live on the custom domain over HTTPS**.

**Scope:** 7 phases · 28 commits · built and deployed in one day (2026-08-17)
**Closeout:** verified_closeout (open-artifact audit clear) with minor owner-activation gaps (below)
**Live:** https://darktierstudios.com (custom domain — valid SSL, HSTS, http→https redirect verified) · staging mirror https://darktierstudios-b846f.web.app · Firebase project `darktierstudios-b846f` (free Spark plan)

**Key accomplishments:**

- **Phase 1 — Foundation:** Astro 7 SSG scaffold on Firebase, Nocturne design system ported verbatim, shared SEO-ready layout + responsive nav/footer shell.
- **Phase 2 — Content & Data:** Firestore data model (`games`/`tools`/`news`), 13-game seed catalog with owner-reviewed game↔PDF mapping, migrated covers + rulebook/character PDFs, build-time Admin-SDK loader with seed fallback.
- **Phase 3 — Public Pages:** Home, The Vault, The Armory, and Dispatches render real catalog data as crawlable static HTML with per-game action logic (download PDF / shop at The Game Crafter / launch app), plus an on-brand 404.
- **Phase 4 — SEO & Social:** Per-page title/description, Open Graph + Twitter cards, canonical URLs, sitemap, robots.txt (disallows `/admin`), generated favicons + 1200×630 share image, Organization/WebSite/ItemList JSON-LD.
- **Phase 5 — Auth & Admin CMS:** Owner-only Google sign-in, full CRUD editor for games/tools/news (reorder, show/hide, showcase/NEW), hardened owner-UID Firestore security rules verified 8/8 by emulator unit tests.
- **Phase 6 — Publish Pipeline & Deploy:** Free (no Cloud Functions) build+deploy via GitHub Actions + `npm run deploy`, last-published indicator, cookie-free Cloudflare Web Analytics injection.
- **Phase 7 — Launch & Cutover:** Custom-domain-ready Hosting config, deployed live to the staging URL, `LAUNCH.md` go-live checklist. (PUB-04 old-URL redirects dropped — no live old site exists.)

**Post-phase enhancements (quick tasks + hybrid live catalog):**

- **Hybrid live catalog:** public pages SSR the catalog at build (SEO/OG intact) then live-refresh from Firestore in the browser via React islands — so `/admin` edits reach customers with **no deploy**, while drafts stay private (`hidden == false` public read rule).
- Admin edit forms → modals; two-step delete confirmation across games/tools/news; "Load starter catalog" hidden unless the catalog is empty; deploy switched to **manual-only** (CI no longer deploys on every commit); CI bumped to Node 22 LTS.

- **PUB-03** — Live on custom domain `darktierstudios.com` over HTTPS: ✅ **done 2026-08-18** (owner migrated DNS to Firebase; valid SSL cert, HSTS, and http→https redirect verified via curl and in-browser network inspection — every subresource loads over HTTPS, no mixed content).

### Known Gaps (owner-activation steps — code shipped, pending console actions; see LAUNCH.md)

- **ANALYTICS-01** — Cloudflare Web Analytics: injection code shipped; awaits owner's `PUBLIC_CF_ANALYTICS_TOKEN` (not yet present in the served HTML beacon).
- **AUTH-01** activation — Google sign-in provider enabled in the Firebase console and catalog seeded (the live site is already reading real Firestore data, so this is effectively exercised).

Both are console/config actions, not development work.

### Known minor bug (deferred)

- Home hero references `/assets/covers/woe.png` (renamed to `woe.jpg` in later work) → 404 on the live site. Cosmetically harmless (CSS background falls through) but a dead request; fix on next deploy.

### Requirement outcomes

- 40 v1 requirements: 39 delivered (incl. PUB-03 custom domain now live), 1 dropped (PUB-04, N/A — no live old site). ANALYTICS-01 is code-complete but gated on the owner's analytics token.

---
