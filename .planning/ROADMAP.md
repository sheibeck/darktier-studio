# Roadmap: Darktier Studios Website

## Overview

The site is built in dependency order: stand up the Astro + Firebase shell wearing the approved Nocturne design (Phase 1), then build the Firestore catalog — schema, seeded and owner-reviewed content, migrated covers/PDFs (Phase 2) — before any page can render real data. With data in place, every public page (Home, The Vault, The Armory, Dispatches, 404) is built from that catalog as crawlable static HTML (Phase 3), which unlocks the SEO/social metadata layer that depends on real routes and slugs (Phase 4). In parallel dependency terms, the data model from Phase 2 also unblocks Firebase Auth and the owner-only admin CMS, with Firestore security rules verified by emulator tests (Phase 5). Once the admin has a real "Publish" action to trigger against, the build+deploy pipeline, rebuild-on-publish wiring, and analytics go live (Phase 6). Only after the full stack is verified on a throwaway `*.web.app` URL does the project cut over to the custom domain with an old-URL redirect inventory (Phase 7) — closing the loop on the core goal: every shared link drives traffic to a fast, discoverable, canonical home.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Astro + Firebase scaffold wearing the ported Nocturne design system, with a navigable static shell ✓ 2026-08-17
- [ ] **Phase 2: Content & Data** - Firestore catalog schema seeded with the verified, owner-reviewed game/tool/news content and migrated static assets
- [ ] **Phase 3: Public Pages** - Home, The Vault, The Armory, and Dispatches render real catalog data as crawlable static HTML, plus a custom 404
- [ ] **Phase 4: SEO & Social** - Per-page metadata, Open Graph/Twitter cards, sitemap, robots.txt, favicons, and structured data
- [ ] **Phase 5: Auth & Admin CMS** - Owner-only Google sign-in and a full CRUD editor for games/tools/news, backed by emulator-verified security rules
- [ ] **Phase 6: Publish Pipeline & Deploy** - Build+deploy to Firebase Hosting, a publish action with visible last-published status, and analytics
- [ ] **Phase 7: Launch & Cutover** - Custom domain darktierstudios.com over HTTPS with 301 redirects from known old-site URLs

## Phase Details

### Phase 1: Foundation
**Goal**: A deployable Astro + Firebase project exists with the Nocturne design system ported verbatim and a consistent, responsive navigation shell across placeholder public pages
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: SITE-01, SITE-03, SITE-04
**Success Criteria** (what must be TRUE):
  1. Visitor sees a consistent header (logo/brand link, Home, The Vault, The Armory, "Shop our games" link) with working navigation on every shell page
  2. Every shell page renders through the ported Nocturne `styles.css` tokens (dark theme, accent-as-line, 8px radii, `.lighten` wrapper) with no hardcoded colors/spacing overriding the design tokens
  3. The shell layout stays legible and usable across mobile, tablet, and desktop widths
**Plans**: TBD
**UI hint**: yes

### Phase 2: Content & Data
**Goal**: The full, owner-reviewed game/tool/news catalog exists in Firestore with correctly mapped static assets, ready to drive every public page
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. Firestore contains `games`, `tools`, and `news` collections, each doc keyed by slug with `visible`, `order`, and `showcase`/`isNew` fields populated
  2. A single, reusable seed script populates the emulator (and production) with all 13 games, the tools roster, and initial dispatches from reviewed content
  3. Each archive game's rulebook PDF (and character sheet where one exists) is mapped to the correct game via an owner-reviewed mapping table, with no filename mismatches (e.g. `amaranth.pdf` correctly tied to Amaranthine)
  4. Cover images and PDFs are committed as static hosted assets, fetchable directly by URL with cache headers set
  5. A build-time script pulls all `visible` catalog docs from Firestore via the Admin SDK and produces data consumable by the site build, with no client-side Firestore reads involved
**Plans**: TBD

### Phase 3: Public Pages
**Goal**: Every public page renders real, seeded catalog content as crawlable static HTML — the rendering decision the project's core SEO goal hinges on
**Mode:** mvp
**Depends on**: Phase 1, Phase 2
**Requirements**: SITE-02, SITE-05, SITE-06, GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, TOOL-01, TOOL-02, NEWS-01, NEWS-02
**Success Criteria** (what must be TRUE):
  1. Home page shows hero, Charlie Mike sitrep, vault preview, category cards, studio blurb, and the dispatches feed (newest first, each entry showing tag, date, title, body, and optional read-more link) — matching the Nocturne design and sourced from real seeded content
  2. The Vault lists every catalog game with cover art, title, type, publication status, and synopsis; NEW-flagged games show a NEW badge and showcased games appear as featured on Home
  3. Each archive game (AIGE, Barony, Cardomancer, Impact, Amaranthine, Baneful, Dark, Mazeworld) exposes a working "Download PDF" link; each boxed game (EXFIL, Woe, Fate of Wæteria, Euangelion) exposes a working "Shop at The Game Crafter" link; Charlie Mike reads as in-development and links to its live TOC app
  4. Every game has a stable, directly linkable anchor/URL, and The Armory lists tools with a "Launch" link for live tools and a reserved "docking soon" state for unreleased ones
  5. Viewing page source with JavaScript disabled shows the real page content, cover/hero images carry descriptive alt text, and a custom 404 page renders in the design system for unknown routes
**Plans**: TBD
**UI hint**: yes

### Phase 4: SEO & Social
**Goal**: Every public page produces correct, verifiable search and social metadata so shared links preview richly and pages are indexable
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06
**Success Criteria** (what must be TRUE):
  1. Every public page's raw HTML response contains a unique `<title>` and meta description, visible via view-source with no JavaScript execution required
  2. Every public page emits Open Graph and Twitter Card tags (title, description, absolute image URL, canonical url, type) that render a correct preview in the Facebook Sharing Debugger and Twitter Card Validator
  3. `curl -A "facebookexternalhit/1.1"` against any public page returns the full page content and meta tags, confirming crawlability without JS execution
  4. Site serves a valid `sitemap.xml` listing all public routes and a `robots.txt` disallowing `/admin`; every page declares a canonical URL
  5. Site serves favicon/app icons and a default 1200x630 social share image at the correct dimensions, and Organization JSON-LD (plus per-game structured data) validates in a rich-results checker
**Plans**: TBD

### Phase 5: Auth & Admin CMS
**Goal**: The owner can securely sign in and fully manage the live catalog; everyone else is denied read access to drafts and all write access, enforced at the data layer
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05, ADMIN-06
**Success Criteria** (what must be TRUE):
  1. Owner can sign in to `/admin` with Google sign-in and sign out again from the admin area
  2. Firebase Emulator Suite rules-unit tests prove an unauthenticated write is denied, a non-owner authenticated write is denied, and a non-owner read of a hidden (`visible: false`) doc is denied — while the owner's UID can read and write freely
  3. Owner can create, edit, and delete games (all catalog fields: type, publication status, cover, synopsis, PDF/app/site links, NEW/AI flags, release date), tools, and news/dispatch posts from the admin editor
  4. Owner can reorder items within a list and toggle visibility and showcase/NEW flags; every change persists to Firestore and survives a page reload
  5. `/admin` is disallowed from indexing and carries no link from public navigation
**Plans**: TBD
**UI hint**: yes

**Risk flag**: Firestore security-rules correctness is the highest-risk item in this phase per research (Pitfall: default-open or email-based rules leave the catalog world-writable). Rules must be verified with automated Firebase Emulator Suite unit tests — unauthenticated write, non-owner UID write, and draft-doc read all denied — not manual console checks alone.

### Phase 6: Publish Pipeline & Deploy
**Goal**: Code and content changes reliably and visibly reach the live site, and traffic/referrer data is captured without cookies
**Mode:** mvp
**Depends on**: Phase 1, Phase 5
**Requirements**: PUB-01, PUB-02, ANALYTICS-01
**Success Criteria** (what must be TRUE):
  1. Running the deploy pipeline builds the Astro site and deploys it live to Firebase Hosting at the project's `*.web.app` URL
  2. Publishing an admin edit (via an automated rebuild trigger or an explicit "Publish" action) causes the public site to reflect the change within a bounded, predictable time, and the admin shows a visible "last published" timestamp
  3. Visiting and navigating the public site records a page view with referrer in the free Cloudflare Web Analytics dashboard, with no cookie-consent banner required
**Plans**: TBD

**Cost constraint (hard)**: This project stays on the Firebase **free Spark plan — $0/month, no Blaze, no Cloud Functions**. The rebuild-on-publish MUST use a free mechanism: **GitHub Actions** (rebuild+deploy triggered from the admin, or on push) or an explicit **manual "Publish"/deploy action** — NOT a Firestore `onWrite` Cloud Function (that requires paid Blaze). Analytics is **Cloudflare Web Analytics** (free, cookie-free), not Plausible. The SUMMARY.md/STACK.md research suggestions of a Cloud Function and Plausible are explicitly overridden here.

**Risk flag**: The GitHub Actions rebuild-on-publish wiring is a synthesized pattern without a single authoritative tutorial per research — flag for deeper research during planning. A manual "Publish" button with a visible last-published indicator is an acceptable, lower-risk v1 fallback.

### Phase 7: Launch & Cutover
**Goal**: darktierstudios.com is the live, canonical home of the studio, and existing inbound links from the old site keep working
**Mode:** mvp
**Depends on**: Phase 4, Phase 6
**Requirements**: PUB-03, PUB-04
**Success Criteria** (what must be TRUE):
  1. `https://darktierstudios.com` serves the site over valid HTTPS via Firebase Hosting's Advanced Setup custom domain
  2. Visiting a known old-site URL (from the archived-site inventory) 301-redirects to its correct new-site equivalent rather than returning a 404
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | ✓ Complete | 2026-08-17 |
| 2. Content & Data | 0/TBD | Not started | - |
| 3. Public Pages | 0/TBD | Not started | - |
| 4. SEO & Social | 0/TBD | Not started | - |
| 5. Auth & Admin CMS | 0/TBD | Not started | - |
| 6. Publish Pipeline & Deploy | 0/TBD | Not started | - |
| 7. Launch & Cutover | 0/TBD | Not started | - |
