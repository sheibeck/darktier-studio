# Milestones

## v1.1 In-Site Companion Apps (Shipped: 2026-08-18 · live on darktierstudios.com)

**Delivered:** Two React companion apps hosted **directly inside the existing Firebase app** — no new domain, no new project — as code-split Astro islands in The Armory, plus a reusable drop-in pattern for future apps. Live at `darktierstudios.com/armory/fate-of-the-fellowship` and `.../burning-banners`.

**Scope:** 4 phases · 12 requirements (all delivered) · built autonomously, then deployed + seeded live by the owner. Free Spark plan, $0, still fully static.

**Key accomplishments:**

- **Phase 8 — Tool data model:** additive `Tool.kind?: "external" | "internal"` with a same-tab (internal) vs new-tab (external) Launch branch in ToolsLive and a "Link type" select in the admin editor — zero regression to existing tool docs; Firestore rules untouched.
- **Phase 9 — Fate of the Fellowship + the reusable pattern:** a registry-driven `getStaticPaths()` route (`armory/[slug].astro` + `armoryApps.ts` + a build-time dispatch parity guard) mounts the app as a `client:only` island with per-app SEO; migrated the app off the artifact `window.storage` shim to real `localStorage`, and scoped all ~111 CSS selectors under `.ff`.
- **Phase 10 — Burning Banners (the risk phase):** Tailwind v4 (`@tailwindcss/vite`, skip-preflight, `@source`-scoped) + lucide-react isolated to the one route — Home/Games/Tools ship byte-identical `<script>`/`<link>` tags vs the pre-phase baseline; zero preflight anywhere in the build.
- **Phase 11 — Go-live & docs:** seeded both apps as live internal Armory tools, wrote `docs/adding-a-companion-app.md` (the drop-in guide), corrected stale CLAUDE.md stack notes, and compiled `docs/go-live-v1.1.md`.
- **Go-live (owner):** deployed via `npm run deploy`; both routes serve HTTP 200 with per-app titles; both apps list in The Armory (same-tab launch) and appear in the sitemap.

### Post-ship fixes (2026-08-18)

- **Catalog seed synced to production.** An initial tools reseed overwrote two owner-added external tools (Dungeon World Companion, 5x Companion) that shared the placeholder slugs; recovered from the pre-seed deploy snapshot, renamed the slugs to `dungeon-world-companion` / `5x-companion`, and synced the committed seed to production so `seed`/`seed:tools` is non-destructive going forward. Added a tools-only seeder (`npm run seed:tools`).
- **Quick task 260818-l22:** Fate of the Fellowship's main tab menu converted from a fixed bottom bar (overlapping the footer) to a sticky top bar matching Burning Banners.

### Deferred (owner, optional)

- Full browser play-throughs of Burning Banners and the admin internal-tool spot-check (FOTF confirmed live). Per-app OG images (APPOG-01) and cross-device sync (APPSYNC-01) deferred to a future milestone. See `docs/go-live-v1.1.md`.

---

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
