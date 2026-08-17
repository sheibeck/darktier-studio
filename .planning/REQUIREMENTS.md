# Requirements: Darktier Studios Website

**Defined:** 2026-08-17
**Core Value:** A fast, great-looking, search- and share-optimized public site that becomes the studio's canonical home — so links shared anywhere (formerly Facebook) drive traffic here and every game is discoverable with its cover, blurb, and download/buy link.

## v1 Requirements

Initial release. Owner chose "everything before launch" — public site, admin CMS, auth, and custom domain all ship in v1.

### Site Shell & Navigation

- [ ] **SITE-01**: Visitor sees a consistent header (logo/brand link, Home, The Vault, The Armory, "Shop our games" link) on every public page
- [ ] **SITE-02**: Home page presents the designed sections — hero, Charlie Mike sitrep, vault preview, category cards, studio blurb, and dispatches feed — matching the Nocturne design
- [ ] **SITE-03**: All public pages reuse the Nocturne `styles.css` design system (dark theme, design tokens) with no ad-hoc restyling
- [ ] **SITE-04**: Public pages are responsive and legible across mobile, tablet, and desktop
- [ ] **SITE-05**: Site serves a custom 404 page styled in the design system
- [ ] **SITE-06**: Public pages meet baseline accessibility — sufficient text contrast, visible keyboard focus states, and alt text on cover/hero imagery

### Games — The Vault

- [ ] **GAME-01**: Visitor can view the full games catalog with cover art, title, type, publication status, and synopsis
- [ ] **GAME-02**: Games flagged NEW show a NEW badge, and showcased games appear as featured on the home page
- [ ] **GAME-03**: Each archive game exposes a working "Download PDF" link to its hosted rulebook (and character sheet where one exists)
- [ ] **GAME-04**: Each print-and-play board game exposes a "Shop at The Game Crafter" link to the correct storefront/designer page
- [ ] **GAME-05**: Charlie Mike is presented as in-development and links to its live TOC companion app
- [ ] **GAME-06**: Each game is directly linkable via a stable anchor/URL so it can be shared

### Tools — The Armory

- [ ] **TOOL-01**: Visitor can view the tools/armory hub listing the studio's companion apps
- [ ] **TOOL-02**: Live tools show a "Launch" link to the app; "docking soon" tools show a reserved-slot state

### News — Dispatches

- [ ] **NEWS-01**: Visitor sees the dispatches feed, newest first, on the home page
- [ ] **NEWS-02**: Each dispatch shows its tag, date, title, body, and an optional "read more" link

### SEO & Social

- [ ] **SEO-01**: Every public page renders a unique `<title>` and meta description in the server HTML
- [ ] **SEO-02**: Every public page renders Open Graph + Twitter Card tags (title, description, absolute image URL, canonical url, type) so shared links preview correctly on Facebook/Discord/Twitter
- [ ] **SEO-03**: Public page content is present in crawlable static HTML without executing JavaScript
- [ ] **SEO-04**: Site serves canonical URLs, a `sitemap.xml`, and a `robots.txt` that disallows `/admin`
- [ ] **SEO-05**: Site serves favicon/app icons and a default social share image at the correct dimensions
- [ ] **SEO-06**: Site emits Organization JSON-LD (and per-game structured data) validated against a rich-results checker

### Content & Data

- [ ] **DATA-01**: Games, tools, and news are stored in Firestore collections (`games`, `tools`, `news`) keyed by slug, with `visible`, `order`, and `showcase`/`isNew` fields
- [ ] **DATA-02**: Public pages read catalog data from Firestore at build time (not client-side at runtime)
- [ ] **DATA-03**: The initial catalog (13 games, tools, and news posts) is seeded from verified content, with an owner-reviewable game↔PDF filename mapping
- [ ] **DATA-04**: Cover images and rulebook/character PDFs are migrated from the archived repo and served as static hosted assets with cache headers

### Authentication & Admin

- [ ] **AUTH-01**: Owner can sign in to the admin area with Google sign-in
- [ ] **AUTH-02**: Only the owner's account can access the admin and write data; all other users are denied, enforced by Firestore security rules keyed to the owner UID and verified with emulator tests
- [ ] **AUTH-03**: Owner can sign out of the admin
- [ ] **ADMIN-01**: Owner can create, edit, and delete games with all catalog fields (type, publication, cover, synopsis, PDF/app/site links, NEW/AI flags, release date)
- [ ] **ADMIN-02**: Owner can create, edit, and delete tools (name, status, app link, description)
- [ ] **ADMIN-03**: Owner can create, edit, and delete news/dispatch posts (title, date, tag, body, link)
- [ ] **ADMIN-04**: Owner can reorder items and toggle visibility (show/hide) and showcase/NEW flags
- [ ] **ADMIN-05**: Admin changes persist to Firestore and survive reload
- [ ] **ADMIN-06**: The `/admin` area is excluded from indexing and is not linked from public navigation

### Publishing & Deploy

- [ ] **PUB-01**: The site builds and deploys to Firebase Hosting
- [ ] **PUB-02**: An admin edit propagates to the public site via a free rebuild-on-publish mechanism — GitHub Actions or an explicit "Publish" action, **no Cloud Functions** — with a visible last-published indicator
- [ ] **PUB-03**: The site is live on the custom domain `darktierstudios.com` over HTTPS (Firebase Hosting Advanced Setup)
- [x] ~~**PUB-04**: Known old-site URLs 301-redirect~~ — **N/A**: there is no live old site (only a Facebook page + a non-live archived repo), so there are no inbound URLs to preserve. Dropped 2026-08-17.

### Analytics

- [ ] **ANALYTICS-01**: Free, privacy-friendly, cookie-free analytics (Cloudflare Web Analytics) is installed and records visits and referrers (to measure the Facebook→site migration)

## v2 Requirements

Deferred — acknowledged but not in the current roadmap.

### Content & Reach

- **RSS-01**: RSS/Atom feed for Dispatches (low-cost interim substitute for the deferred newsletter)
- **GAMED-01**: Dedicated per-game detail routes (`/games/[slug]`) if analytics show demand
- **PRESS-01**: Press kit / media assets page
- **SEARCH-01**: Catalog search/filter (unnecessary at ~13 items today)

### Publishing

- **PUB2-01**: Instant Cloud Function → GitHub `repository_dispatch` rebuild (if launching with a manual/cron publish, upgrade to automatic)

### Audience

- **EMAIL-01**: Email newsletter / audience-capture signup (owner deferred; revisit)

## Out of Scope

Explicitly excluded to prevent scope creep.

| Feature | Reason |
|---------|--------|
| On-site e-commerce / cart / payments | Sales handled at The Game Crafter; link out instead |
| Multi-user accounts, player logins, comments, community | Single admin only; not the goal |
| Facebook link or embed on the site | The explicit goal is to move away from Facebook |
| Rebuilding companion apps (Charlie Mike TOC, etc.) | They stay as separate Firebase apps, linked not absorbed |
| Migrating the old .NET/archived CMS or blog engine | Only assets and content are carried forward |
| Shipping the design prototype's DC React runtime / localStorage admin | Replaced by Astro SSG + Firestore + Firebase Auth |
| Client-side runtime Firestore reads on public pages | Breaks SEO/social previews — public data is fetched at build time |
| Firebase Storage for assets | Fixed public asset set; Hosting `public/` is simpler and sufficient |
| Firebase Blaze plan / Cloud Functions | Personal site must stay $0 on the free Spark plan; publish uses GitHub Actions or a manual action instead |
| Paid analytics (Plausible ~$9/mo) | Free Cloudflare Web Analytics covers the need at $0 |

## Traceability

Each v1 requirement maps to exactly one phase in .planning/ROADMAP.md.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SITE-01 | Phase 1 — Foundation | Pending |
| SITE-03 | Phase 1 — Foundation | Pending |
| SITE-04 | Phase 1 — Foundation | Pending |
| DATA-01 | Phase 2 — Content & Data | Pending |
| DATA-02 | Phase 2 — Content & Data | Pending |
| DATA-03 | Phase 2 — Content & Data | Pending |
| DATA-04 | Phase 2 — Content & Data | Pending |
| SITE-02 | Phase 3 — Public Pages | Pending |
| SITE-05 | Phase 3 — Public Pages | Pending |
| SITE-06 | Phase 3 — Public Pages | Pending |
| GAME-01 | Phase 3 — Public Pages | Pending |
| GAME-02 | Phase 3 — Public Pages | Pending |
| GAME-03 | Phase 3 — Public Pages | Pending |
| GAME-04 | Phase 3 — Public Pages | Pending |
| GAME-05 | Phase 3 — Public Pages | Pending |
| GAME-06 | Phase 3 — Public Pages | Pending |
| TOOL-01 | Phase 3 — Public Pages | Pending |
| TOOL-02 | Phase 3 — Public Pages | Pending |
| NEWS-01 | Phase 3 — Public Pages | Pending |
| NEWS-02 | Phase 3 — Public Pages | Pending |
| SEO-01 | Phase 4 — SEO & Social | Pending |
| SEO-02 | Phase 4 — SEO & Social | Pending |
| SEO-03 | Phase 4 — SEO & Social | Pending |
| SEO-04 | Phase 4 — SEO & Social | Pending |
| SEO-05 | Phase 4 — SEO & Social | Pending |
| SEO-06 | Phase 4 — SEO & Social | Pending |
| AUTH-01 | Phase 5 — Auth & Admin CMS | Pending |
| AUTH-02 | Phase 5 — Auth & Admin CMS | Pending |
| AUTH-03 | Phase 5 — Auth & Admin CMS | Pending |
| ADMIN-01 | Phase 5 — Auth & Admin CMS | Pending |
| ADMIN-02 | Phase 5 — Auth & Admin CMS | Pending |
| ADMIN-03 | Phase 5 — Auth & Admin CMS | Pending |
| ADMIN-04 | Phase 5 — Auth & Admin CMS | Pending |
| ADMIN-05 | Phase 5 — Auth & Admin CMS | Pending |
| ADMIN-06 | Phase 5 — Auth & Admin CMS | Pending |
| PUB-01 | Phase 6 — Publish Pipeline & Deploy | Pending |
| PUB-02 | Phase 6 — Publish Pipeline & Deploy | Pending |
| ANALYTICS-01 | Phase 6 — Publish Pipeline & Deploy | Pending |
| PUB-03 | Phase 7 — Launch & Cutover | Pending |
| PUB-04 | Phase 7 — Launch & Cutover | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 40
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-17*
*Last updated: 2026-08-17 after roadmap creation (all 40 v1 requirements mapped to 7 phases)*
