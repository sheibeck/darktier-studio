# Project Research Summary

**Project:** Darktier Studios Website
**Domain:** Static/prerendered marketing site + single-admin Firestore-backed CMS, deployed to Firebase Hosting on a custom domain
**Researched:** 2026-08-17
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a solo-studio marketing/catalog site with a hard SEO requirement (rich Open Graph/Twitter previews for every shared link) sitting right next to a live-editing requirement (owner edits the catalog without redeploying code). Those two requirements pull in opposite directions — pure SSG can't self-update, a pure client-rendered SPA can't be crawled by link-preview scrapers that don't execute JS — and all four research passes independently converged on the same resolution: **split the runtime**. Public pages (Home, Vault, Armory, Dispatches/news) are built as Astro static output that fetches Firestore at *build time* via `firebase-admin`, producing plain HTML with real per-page `<title>`/OG/Twitter tags baked into the first response. A separate, small client-rendered admin app at `/admin` talks to Firestore live via the client SDK, gated by Firebase Auth (Google sign-in) and Firestore rules hardcoded to the owner's UID. The gap between "admin saved a change" and "public site reflects it" is bridged by an explicit rebuild trigger — recommended default is a Firestore `onWrite` Cloud Function firing a GitHub Actions `repository_dispatch` rebuild+deploy (~1–3 min latency), with a simpler scheduled cron rebuild or a manual "Publish" button as a lower-risk fallback for a solo maintainer who doesn't want to operate a Cloud Function.

The recommended stack is Astro 7 + Firebase Hosting + Firestore + firebase-admin (build-time reads) + Firebase client SDK (admin-only) + a small React island scoped to `/admin`, reusing the approved Nocturne `styles.css` verbatim as the only styling layer. Firestore holds three collections (`games`, `tools`, `news`), each doc keyed by slug with `visible`/`order`/`showcase`/`isNew` fields; security rules default-deny writes except a single hardcoded owner-UID exception, with public reads gated on `visible == true` — this must be verified with Firestore Emulator Suite rules-unit tests (unauthenticated write, non-owner UID write, draft-doc read all denied), not just UI-level gating, since Firestore is directly queryable by anyone with the client config. The 12 game covers and ~12 rulebook/character-sheet PDFs are committed as static files under `public/assets/` and served by Firebase Hosting (not Cloud Storage) — simpler, no access control needed, but requires explicit `Cache-Control` headers and correct game↔filename mapping (several filenames don't obviously match their game title, e.g. `amaranth.pdf` → Amaranthine).

The most consequential risks, all converging from Pitfalls/Architecture research: (1) shipping a client-only SPA for public pages would silently break every shared link's preview — the single biggest threat to the project's stated core goal, so the SSG decision must be made and verified (via `curl -A facebookexternalhit` / Sharing Debugger) before content pages are built, not retrofitted; (2) Firestore rules that default-open or check email instead of UID would leave the whole catalog world-writable; (3) the rebuild-on-publish wiring is real infrastructure work with a genuine "silently stale" failure mode if skipped or half-built; (4) the custom-domain cutover needs an old-URL inventory and 301 redirects or inbound/indexed links will 404; (5) archive-reconstructed game synopses and the PDF↔game filename mapping need an explicit owner review pass before they're presented as fact. Two areas are flagged as needing deeper phase-specific research rather than being fully documented patterns: the exact Cloud Function↔GitHub Actions rebuild wiring, and Firestore security-rules correctness (verified via emulator, not manual testing).

## Key Findings

### Recommended Stack

Astro 7.2.2 is the core SSG for all public routes because it ships zero client JS by default and imports the existing Nocturne `styles.css` with no opinionated rewriting — a direct fit for "reuse the approved stylesheet verbatim." Firebase Hosting serves the static `dist/` output with no special configuration (it's already the owner's platform via the Charlie Mike app). `firebase-admin` (server-side, trusted) does the build-time Firestore reads; the client `firebase` SDK (modular v9+ only, never the deprecated compat API) is scoped exclusively to the `/admin` route for live CRUD + Google sign-in. A small `@astrojs/react` + React 19 island carries over the admin interaction patterns from the source design prototypes, but only inside `/admin` — public pages never import client Firebase code, keeping their JS payload at ~0KB. Supporting libraries: `@astrojs/sitemap` (auto sitemap.xml), `astro-icon` + `@iconify-json/ph` (Phosphor icons with no JS runtime), `sharp` (image optimization for the 12 covers). Analytics: Plausible (hosted, ~$9/mo) recommended for real referrer/campaign breakdown given "measure Facebook→site migration" is a named success metric; Cloudflare Web Analytics is the free fallback if that cost is unwanted. GA4 explicitly rejected (cookie/consent overhead, documented undercounting).

**Core technologies:**
- Astro 7.2.2 — static-site generator for all public pages — zero-JS-by-default HTML output is exactly what crawlable, share-optimized pages need
- Firebase Hosting + Firestore + firebase-admin/firebase (modular) — hosting, catalog datastore, build-time and admin-time data access — matches owner's existing Firebase familiarity and requires no new hosting platform
- Firebase Auth (Google sign-in only) — single-admin authentication — no password management, UID-based authorization enforced in Firestore rules
- Plausible (or Cloudflare Web Analytics fallback) — privacy-friendly analytics — serves the explicit "measure Facebook migration" success metric without a cookie-consent UI

### Expected Features

**Must have (table stakes, v1/P1):**
- Games catalog listing (cover, type, status, synopsis, NEW flag) — the core reason the site exists
- Downloadable rulebook PDFs (8 archive titles) and "Buy at The Game Crafter" links (4 boxed titles)
- Charlie Mike showcase linking to its live companion app; Tools/Armory hub
- News/Dispatches feed (newest-first) — the direct Facebook-replacement mechanism
- Per-page `<title>`/meta description, Open Graph + Twitter Card tags, canonical URLs, sitemap.xml, robots.txt, favicon — this IS the stated core value and is gated entirely by the rendering-architecture decision
- Admin: Google sign-in, full CRUD for games/tools/news, show/hide toggle, reorder, image handling, sign-out
- Privacy-friendly analytics; responsive layout; baseline accessibility (contrast, focus states, alt text)

**Should have (differentiators, v1.x fast-follow):**
- RSS/Atom feed for Dispatches — cheap, reuses news data, directly substitutes for the deferred newsletter
- Client-side catalog filtering/sorting — add once the catalog grows or feedback demands it
- JSON-LD structured data (Organization + per-game) — add once base OG/meta is verified working

**Defer (v2+, no trigger yet):**
- Email newsletter (owner explicitly deferred), press-kit page, dedicated per-game detail pages (only if cards prove insufficient), any on-site commerce, full-text search, draft/publish workflow beyond a single `visible` boolean — all explicitly identified as anti-features/over-engineering for a solo-admin, ~13-item catalog.

### Architecture Approach

Split-runtime architecture: public pages are 100% static Astro output built from a build-time Firestore read (`firebase-admin`), while `/admin` is a separate client-rendered bundle authenticated via Firebase Auth and reading/writing Firestore live via the client SDK. A rebuild relay (Firestore `onWrite` Cloud Function → GitHub `repository_dispatch` → CI rebuild+deploy) bridges the two, giving bounded (~1–3 min) staleness on publish rather than requiring a standing SSR server — rejected alternatives include a pure client SPA (fails crawlability), bot-detection dynamic rendering (two divergent render paths to maintain), and full SSR/ISR via Firebase App Hosting + Next.js (overkill compute/ops cost for a ~15-page, low-traffic catalog site).

**Major components:**
1. **Public Astro site** (Home, Vault list + `[slug]` pages, Armory, Dispatches) — crawlable static HTML, zero runtime Firestore dependency, Nocturne `styles.css` imported verbatim
2. **Build-time data layer** (`firebase-admin` inside Astro build/`getStaticPaths`) — pulls all `visible: true` docs from `games`/`tools`/`news` into the static build
3. **Admin app (`/admin`)** — small CSR React island behind Firebase Auth, full live CRUD/reorder/show-hide against Firestore via the client SDK
4. **Firestore + security rules** — 3 collections (`games`, `tools`, `news`), doc id = slug, `visible`/`order`/`showcase`/`isNew` fields; default-deny writes except one hardcoded owner-UID exception; public read gated on `visible == true`
5. **Rebuild relay (Cloud Function) + CI/CD (GitHub Actions)** — bridges "content changed" to "site rebuilt and redeployed"; scheduled-cron or manual "Publish" button is the accepted lower-risk fallback
6. **Static assets** (covers, PDFs, logo) — committed to `public/assets/`, served by Firebase Hosting with explicit long-lived `Cache-Control` headers, not Cloud Storage

### Critical Pitfalls

1. **Client-rendered SPA invisible to social share scrapers** — Facebook/Discord/Slack/X don't execute JS, so OG tags set after mount never get seen; every shared link shows a blank/generic preview. Avoid by baking meta tags into the raw build-time HTML (the Astro SSG decision) and verifying with `curl -A "facebookexternalhit/1.1"` + Facebook Sharing Debugger per page type, not just DevTools inspection.
2. **Firestore rules default-open or admin-check by email instead of UID** — leftover test-mode rules or an email-based admin check leaves the catalog world-writable or silently over/under-grants. Avoid with default-deny + hardcoded owner-UID exception, verified via Firebase Emulator Suite rules unit tests (unauthenticated write, non-admin UID write, draft-doc read all denied) as an automated test file, not manual console checks.
3. **Stale public content after admin edits (SSG rebuild gap)** — editing Firestore doesn't change already-built HTML until a rebuild runs; without a wired trigger this reads as "I updated it and nothing changed." Avoid with an automated rebuild relay or, at minimum, an explicit "Publish" button with a visible "last published" timestamp in the admin UI.
4. **Custom-domain cutover breaks inbound/indexed links** — moving to darktierstudios.com without inventorying the old archived-site's URL paths and adding 301 redirects causes indexed/bookmarked/shared links to 404 and search engines to demote them. Avoid with an old-URL inventory + `firebase.json` `redirects` + Firebase Hosting's Advanced Setup (not Quick Setup) for zero-downtime SSL provisioning.
5. **OG image and content mapping errors** — reusing portrait cover art directly as `og:image` (wrong aspect ratio for previews), relative instead of absolute image URLs, and archive-reconstructed synopses / PDF↔game filename mismatches (e.g. `amaranth.pdf` → Amaranthine) shipped without an owner review pass. Avoid by generating dedicated 1200×630 OG images, always using absolute URLs, and treating content seeding as a review task with an explicit game→PDF mapping table cross-checked against the archived repo.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation — repo, Firebase project, Nocturne design system integration
**Rationale:** Baseline CI and the design-system port have no Firestore dependency and unblock everything else; standing up CI now avoids retrofitting it later when the rebuild-on-publish trigger is added.
**Delivers:** `firebase.json`/`.firebaserc`, Emulator Suite config, a bare-minimum GitHub Actions build+deploy workflow, `BaseLayout.astro` + shared components with `styles.css` imported verbatim and visual parity verified against dummy content.
**Addresses:** Design-system-reuse requirement (Nocturne verbatim, `.lighten` wrapper preserved, contrast/focus-state QA).
**Avoids:** Pitfall 8 (hardcoded hex/px values instead of CSS tokens; dropped `.lighten` treatment; missing focus states).

### Phase 2: Firestore data model, security rules, and content migration
**Rationale:** The datastore schema, rules, and seeded content are prerequisites for every public page and the admin app; rules must be correct before any write-capable UI exists.
**Delivers:** `games`/`tools`/`news` collections with `visible`/`order`/`showcase`/`isNew` fields, default-deny + owner-UID Firestore rules with emulator unit tests, a reusable `scripts/seed-firestore.ts`, and an explicit game→PDF/cover mapping table cross-checked against the archived repo with an owner sign-off pass on each synopsis.
**Uses:** Firestore, firebase-admin, Firebase Emulator Suite (from STACK.md).
**Implements:** Firestore Data Model and Auth/Security Rules components (from ARCHITECTURE.md).
**Avoids:** Pitfall 2 (default-open/email-based rules), Pitfall 9 (unreviewed archive content, PDF↔game mismapping).

### Phase 3: Public static pages + build-time Firestore fetch
**Rationale:** This is the rendering-strategy decision the project's core SEO goal hinges on — it must land before any real page-building continues, per both Architecture and Pitfalls research ("cannot be retrofitted cheaply later").
**Delivers:** Home, Vault (list + per-game pages), Armory, Dispatches, all built via `astro build` reading Firestore through `firebase-admin`, producing static HTML with real per-page content.
**Addresses:** Games catalog listing, Tools/Armory hub, News/Dispatches feed (table-stakes features from FEATURES.md).
**Avoids:** Pitfall 1 (client-rendered SPA invisible to scrapers) — verify with `curl -A facebookexternalhit` as an explicit acceptance check.

### Phase 4: Static assets wiring (covers, PDFs, caching)
**Rationale:** Needs real slugs/fields from Phase 2–3 to wire download/cover links correctly; asset caching and Content-Disposition consistency are cheap to get right now and expensive to fix inconsistently later.
**Delivers:** 12 covers + ~12 PDFs in `public/assets/`, `firebase.json` `headers` for long-lived caching, consistent inline-vs-download behavior across all PDFs.
**Addresses:** Downloadable rulebook PDFs, cover imagery (table-stakes features).
**Avoids:** Pitfall 7 (no cache headers, inconsistent PDF open/download behavior).

### Phase 5: SEO/OG layer
**Rationale:** Needs real routes/slugs from Phase 3 to generate correct per-page metadata; this is the phase that actually delivers the project's stated core value once the rendering foundation exists.
**Delivers:** Per-page title/description, Open Graph + Twitter cards with dedicated 1200×630 OG images, canonical URLs, `sitemap.xml`, `robots.txt` (disallowing `/admin`), JSON-LD (stretch).
**Addresses:** SEO + social requirements (table stakes, FEATURES.md).
**Avoids:** Pitfall 6 (relative/mismatched OG image URLs, wrong aspect ratio from reused cover art).

### Phase 6: Auth + Admin CMS
**Rationale:** Depends on the Firestore schema (Phase 2) and can build in parallel with Phases 3–5 up through the auth/rules gate, but the CRUD UI itself needs the data model finalized.
**Delivers:** Firebase Auth (Google sign-in) with owner-UID gating, `/admin` CSR React island with create/edit/reorder/show-hide for games/tools/news, form validation, sign-out.
**Uses:** `@astrojs/react`, React 19, Firebase client SDK (STACK.md).
**Implements:** Admin app component (ARCHITECTURE.md).
**Avoids:** Pitfall 3 (open sign-in path with no UID rejection reaching admin UI).

### Phase 7: Rebuild-on-publish automation
**Rationale:** Depends on Phase 6 (needs a real publish action to trigger against) and the baseline CI from Phase 1; this is explicitly the piece most likely to need extra research/design time.
**Delivers:** Either a Firestore `onWrite` Cloud Function → GitHub `repository_dispatch` relay, or the simpler scheduled-cron/manual-"Publish"-button fallback, plus a "last published" indicator in the admin UI.
**Avoids:** Pitfall 4 (stale content after admin edits with no visible signal).

### Phase 8: Analytics
**Rationale:** Independent once the layout exists; low risk, safe to slot in anytime, commonly done as polish.
**Delivers:** Plausible or Cloudflare Web Analytics wired site-wide, no cookies/consent banner.
**Addresses:** Privacy-friendly analytics (explicit success-metric requirement).

### Phase 9: Launch/cutover — custom domain
**Rationale:** Must come last, after the full stack is verified on the default `*.web.app` URL, since DNS propagation/SSL provisioning takes time and depends on the SEO phase (sitemap, canonical URLs) already being correct.
**Delivers:** darktierstudios.com connected via Firebase Hosting Advanced Setup, old-URL inventory + 301 `redirects` in `firebase.json`, Google Search Console verification + sitemap submission.
**Avoids:** Pitfall 5 (broken inbound links, stalled reindexing from an uninventoried cutover).

### Phase Ordering Rationale

- The rendering-strategy decision (SSG vs. SPA) is the single most consequential sequencing constraint identified by every research file — it must land before or alongside public page-building, not be retrofitted, so it anchors the early-middle of the roadmap (Phase 3) directly after the data model it depends on (Phase 2).
- Security rules must exist before any write-capable UI (admin CRUD) is built, and must be verified with automated emulator tests, not manual checks — this pushes rules work earlier than the admin UI itself (Phase 2 before Phase 6).
- Static assets and SEO/OG work both need real slugs/routes to exist first, so they sequence after the public-pages phase (Phases 4–5 follow Phase 3).
- The rebuild-on-publish trigger needs a real "Publish" action to fire against, so it necessarily follows the admin CMS (Phase 7 follows Phase 6), even though architecturally it's part of the same "how does content go live" decision as the SSG choice.
- Domain cutover is deliberately last — it's irreversible-feeling (DNS, SSL, indexed URLs) and should only happen once everything else is verified on a throwaway `*.web.app` URL.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 7 (Rebuild-on-publish automation):** the exact Cloud Function↔GitHub Actions `repository_dispatch` wiring is a synthesized best-practice pattern, not a single documented tutorial (MEDIUM confidence per STACK.md/ARCHITECTURE.md) — flag for `/gsd-plan-phase --research-phase` when this phase is planned.
- **Phase 2 (Firestore rules correctness):** security-rules correctness, especially public list-query behavior under `visible == true` gating, should get explicit emulator-test-writing research/verification during planning, not just a copy of the rules pattern shown here.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation), Phase 3 (public Astro pages), Phase 4 (static assets), Phase 5 (SEO/OG), Phase 8 (analytics):** Astro static builds, Firebase Hosting headers/caching, OG/Twitter tag mechanics, and Emulator Suite setup are all well-trodden, officially documented territory (HIGH/MEDIUM confidence, cross-checked official docs).
- **Phase 9 (Launch/cutover):** Firebase Hosting custom-domain Advanced Setup and redirects are officially documented (HIGH confidence) — the work is inventory/execution, not novel research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Package versions verified directly against the npm registry (2026-08-17); the SSG+rebuild architectural pattern itself is MEDIUM (synthesized, no single authoritative tutorial) |
| Features | MEDIUM | Feature landscape is well-established web/CMS category knowledge cross-checked against PROJECT.md (HIGH-confidence source); a few differentiator claims (JSON-LD value, press-kit norms) rest on LOW-confidence general web searches |
| Architecture | MEDIUM-HIGH | Firebase/Astro official docs for each individual piece (Hosting, Firestore rules, Cloud Functions triggers) are HIGH confidence; the specific combination/sequencing is this research's own reasoned synthesis, not a documented recipe |
| Pitfalls | MEDIUM-HIGH | Firestore/Hosting/Auth security and caching mechanics are cross-checked against official Firebase docs (HIGH); project-specific content risks (archive synopsis accuracy, PDF filename mapping) are inferred directly from PROJECT.md (HIGH as project facts) |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Rebuild-on-publish exact wiring** (Cloud Function → GitHub Actions `repository_dispatch` vs. scheduled cron vs. manual Publish button): no single authoritative source dictates this; resolve with a deliberate build-vs-cost tradeoff discussion when Phase 7 is planned, and default to the simpler manual-Publish-button fallback if minimizing new infrastructure at launch outweighs sub-3-minute freshness.
- **Firestore security-rules verification**: the rules pattern shown (default-deny + hardcoded owner-UID) is correct in principle, but must be backed by actual Emulator Suite unit tests (unauthenticated write, non-owner UID write, draft-doc read) written and run in CI — treat "rules exist" and "rules are verified" as two separate gates.
- **OG/JSON-LD value for a small, niche catalog** was informed by LOW-confidence general web searches (no formal competitor audit performed) — validate JSON-LD's actual payoff with Google's Rich Results Test post-launch rather than over-investing before real data exists.
- **Exact old-site URL structure** (the archived .NET site's routing) isn't fully known from research alone — must be inventoried directly from the archived repo/Search Console during Phase 2 content migration and Phase 9 cutover prep, not assumed.

## Sources

### Primary (HIGH confidence)
- npm registry (`registry.npmjs.org`), direct lookup 2026-08-17 — Astro 7.2.2, firebase 12.17.1, firebase-tools 15.27.0, firebase-admin 14.2.0, and all supporting library versions
- Firebase official docs — Basic Security Rules, Security Rules and Firebase Authentication, Role-based access, Connect a custom domain, Configure Hosting behavior (redirects/rewrites/headers), Extend Firestore with Cloud Functions, Firestore triggers
- .planning/PROJECT.md — authoritative project scope, constraints, catalog data, out-of-scope decisions

### Secondary (MEDIUM confidence)
- Astro official docs — Deploy to Firebase, Firebase & Astro backend guide, Content collections/Live Content Collections
- firebase-tools GitHub repo — Astro framework integration docs
- FirebaseExtended/action-hosting-deploy — GitHub Actions deploy tooling
- Plausible / Humblytics — cookieless analytics and GA4 undercount comparison
- Various community write-ups (firebase-talk, Medium, DEV Community) on dynamic meta-tag injection and Firebase Auth allowlisting — used only to corroborate/reject alternative approaches, not as the primary recommendation

### Tertiary (LOW confidence)
- General 2026 SSG/package-manager comparison roundups — used only for the low-stakes npm-vs-pnpm call
- Web searches on JSON-LD for tabletop games and indie-studio site feature norms — informed differentiator/deferral calls, flagged for post-launch validation rather than treated as settled

---
*Research completed: 2026-08-17*
*Ready for roadmap: yes*
