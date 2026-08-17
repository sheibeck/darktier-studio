# Feature Research

**Domain:** Studio/portfolio marketing website with a lightweight single-admin headless CMS (TTRPG/board-game catalog)
**Researched:** 2026-08-17
**Confidence:** MEDIUM (well-established web/CMS patterns from general knowledge, cross-checked against PROJECT.md constraints which are HIGH confidence; a few LOW-confidence web-search points noted inline)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = the site feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Games catalog listing (grid/list) | Core purpose of the site — "what has this studio made" | MEDIUM | Needs cover art, type badge (TTRPG/board game), status (archive/in-dev/live), synopsis, NEW flag. Data comes from Firestore per PROJECT.md. |
| Per-game detail treatment (or rich card) | Fans need enough info to decide "download this" or "buy this" | LOW–MEDIUM | PROJECT.md's design has a catalog page, not necessarily separate detail pages — decide in architecture phase whether cards suffice or dedicated `/games/[slug]` pages are needed for SEO (see ARCHITECTURE.md). |
| Cover imagery for every catalog item | Visual-first medium; a game without cover art reads as unfinished/abandoned | LOW | 12 cover PNGs already exist in the archived repo; migrate as static assets. |
| Downloadable rulebook PDFs (archive titles) | Explicit requirement — fans of discontinued titles still want the rules | LOW | Static asset hosting (Firebase Hosting or Storage); direct `<a href download>` links. No auth needed — public files. |
| External "buy at The Game Crafter" links (boxed games) | Explicit requirement — sales happen off-site | LOW | Plain outbound links with `rel="noopener"`; optionally `target="_blank"`. |
| Tools/Armory hub (companion apps) | Owner has live apps (Charlie Mike TOC) that need discoverability | LOW | Simple list/grid linking out to separate Firebase apps; "docking soon" placeholder slots for unreleased ones. |
| News/Dispatches feed | Explicit requirement; replaces Facebook's role for updates | MEDIUM | Newest-first list on homepage; needs title, date, body (short-form), maybe a link to a full post view if content warrants it. |
| About/Studio page or section | Users expect to know who's behind the games (solo creator) | LOW | Can be a homepage section rather than a full separate route — keep scope small. |
| Contact method | Baseline expectation for any professional site | LOW | Simple mailto or contact link; no on-site form needed (avoids backend complexity) unless owner wants spam-filtered form later. |
| Footer (legal/nav/social-minus-Facebook) | Standard site convention; also a natural home for links to Discord/Twitter/BGG/Game Crafter designer page if desired | LOW | Explicitly exclude Facebook link per PROJECT.md. |
| 404 page | Prevents dead-end/broken-looking experience, especially since PDFs and old-site content are being migrated (stale links likely) | LOW | Standard static page matching Nocturne theme. |
| Responsive layout | Majority of social-referral traffic (the whole point of this rebuild) arrives on mobile | MEDIUM | Design is already done (Nocturne), but responsive behavior must be verified per breakpoint during build. |
| Basic accessibility (semantic HTML, alt text, contrast, focus states) | Baseline professional quality bar; also helps SEO | MEDIUM | Nocturne's dark theme + accent-as-line aesthetic must be checked for contrast ratios; all cover images need alt text sourced from game titles. |
| Reasonable performance (fast load, optimized images) | Directly serves the "fast, great-looking" core value; also an SEO ranking factor | MEDIUM | Cover PNGs from the old site are likely unoptimized — plan a re-export/compress step (WebP/AVIF + PNG fallback). |
| Per-page `<title>` and meta description | Non-negotiable minimum SEO; without it every shared link and search result looks identical/generic | LOW | Straightforward once rendering architecture (SSG vs SSR) is chosen — see ARCHITECTURE.md dependency below. |
| Open Graph + Twitter Card tags per page | Explicit requirement — "share- and share-optimized" is the core value; without OG tags, links pasted into Discord/Twitter/iMessage show no preview | MEDIUM | **Depends on rendering architecture** — a pure client-side SPA reading Firestore at runtime will NOT produce correct previews because social crawlers don't execute JS (LOW-confidence web finding, but well-established industry fact). Needs build-time HTML generation or SSR. |
| Favicon + app icons | Table stakes for a "real" site; browser tabs, bookmarks, iOS/Android home-screen icons | LOW | Favicon asset already exists in the archived repo. |
| `sitemap.xml` | Explicit requirement; helps search engines discover all catalog/news pages | LOW | Can be generated at build time from the same Firestore catalog data. |
| `robots.txt` | Standard expectation; also used to explicitly allow crawling (this site *wants* to be indexed, unlike the private admin) | LOW | Must disallow the `/admin` route from crawling. |
| Canonical URLs | Prevents duplicate-content SEO issues, especially if any query-string filtering is added later | LOW | Bake into every page's `<head>` once rendering architecture supports per-page meta. |
| Admin: Google sign-in gating | Explicit requirement — single admin, no password management | LOW–MEDIUM | Firebase Auth; Firestore security rules must lock writes to the owner's UID, not just hide the UI route. |
| Admin: CRUD for games/tools/news | Explicit requirement — this is the entire point of having a CMS instead of hardcoded content | MEDIUM–HIGH | Three collections, each needs create/edit/delete forms; games has the most fields (cover, PDF link, buy link, status, synopsis, type, NEW flag). |
| Admin: show/hide (publish toggle) per item | Owner needs to stage content (e.g., "docking soon" tools, draft news) without deleting it | LOW–MEDIUM | Simple boolean field (`published`/`visible`) filtered on public reads. |
| Admin: reorder items | Catalog and news have an implied natural order (chronological / curated); owner will want to control display order, not rely on doc-creation order | MEDIUM | Needs an explicit `order`/`sortIndex` field and drag-reorder or up/down controls — don't rely on Firestore's default (unordered) query behavior. |
| Admin: image handling (upload or URL) | Every game/tool needs a cover image; owner must be able to add new ones without redeploying | MEDIUM | Firebase Storage upload UI, or at minimum a URL field pointing at pre-uploaded assets. Upload UI is nicer UX but adds complexity (file size/type validation, storage rules). |
| Admin: form validation | Prevents publishing broken cards (missing title, broken image link, invalid PDF URL) to the public site | LOW–MEDIUM | Client-side validation is sufficient for a single trusted user; still worth basic required-field + URL-format checks. |
| Admin: sign-out | Baseline auth UX expectation | LOW | Trivial with Firebase Auth SDK. |
| Privacy-friendly analytics | Explicit requirement — measuring Facebook→site migration is a named success metric | LOW–MEDIUM | Needs a provider decision (covered in STACK.md), not a feature-design question. |

### Differentiators (Competitive Advantage)

Features that set the site apart from a generic "portfolio template" site. Not required for launch credibility, but valuable for the stated goal (discoverable, shareable, canonical home).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Structured data (JSON-LD) for Organization + per-game CreativeWork/Game | Rich search results (and some AI answer engines) surface structured data; strengthens the "canonical home" SEO goal beyond basic meta tags | MEDIUM | Add `Organization` schema site-wide and a `CreativeWork`/`Game`-flavored block per catalog item (no `Offers`/price since there's no on-site commerce — that would misrepresent the page). LOW-confidence source; validate with Google's Rich Results Test before relying on it. |
| Filtering/sorting the catalog (by type, status, "new") | Genuine usability win once the catalog grows past ~13 titles across TTRPG/board-game/archive/live categories | LOW–MEDIUM | Client-side filter over the already-fetched catalog data is cheap since the dataset is small (no need for server-side search infra). Good candidate for a fast-follow rather than launch-blocking. |
| NEW flag / recency badge | Signals freshness to returning visitors, reinforces that the studio is active (directly supports "replace Facebook" goal — Facebook's value was showing recent activity) | LOW | Already an explicit requirement; listing it here because it's a differentiator relative to a static, never-updated portfolio, not a generic expectation. |
| "In development" status + live companion-app link (Charlie Mike) | Builds anticipation and cross-promotes the studio's app ecosystem; unusual for a static portfolio to link to a *live interactive tool* | LOW | Already largely covered by existing requirements; worth calling out because it's what makes this site more than a brochure. |
| RSS/Atom feed for Dispatches | Lets fans (and aggregators) follow news without visiting or without a newsletter — directly substitutes for the deferred email newsletter and the removed Facebook feed | LOW–MEDIUM | Cheap to generate from the same news collection used for the homepage feed and sitemap; strong fit given newsletter was explicitly deferred, not rejected. Recommend for v1 or fast-follow. |
| Dedicated press/media assets note | Journalists/reviewers and TGC community members occasionally want hi-res logo/cover art; even a lightweight "media assets" mention lowers friction for coverage | LOW | Full press-kit tooling (presskit()-style structured page) is overkill for a solo studio's v1, but a simple "logo + hi-res covers available on request" line on About/Contact is a cheap differentiator. Defer full press kit page to v1.x+. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create disproportionate complexity or actively conflict with PROJECT.md's stated scope for a solo-owner v1.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| On-site e-commerce / cart / payments | "Just sell it here" is the obvious next thought once you have a catalog | Explicitly out of scope in PROJECT.md; adds PCI/payment-processor complexity, inventory/fulfillment questions, and duplicates what The Game Crafter already does well | Link out to The Game Crafter designer page per title (already planned) |
| Multi-user accounts / player logins / community features (comments, forums, ratings) | "Fans want to discuss/rate games" feels natural for a game studio site | Explicitly out of scope; single-admin CMS has no user-management layer, and community features invite moderation burden with zero staffing to handle it | If community is ever wanted, point to an existing platform (Discord, BGG) rather than building one |
| Email newsletter / audience capture signup | Common marketing-site default; "capture leads" is standard advice | Explicitly deferred by the owner ("not yet") — adds an email-service dependency, consent/CAN-SPAM handling, and a second content-authoring surface for v1 | RSS/Atom feed (see Differentiators) covers "follow updates" without the audience-capture machinery; revisit newsletter post-launch if traffic data supports it |
| Facebook link/embed/share-to-Facebook widget | Natural instinct to cross-link the old presence during transition | Explicitly excluded — the entire point of the rebuild is to stop depending on Facebook as the canonical home | OG/Twitter card tags make the site itself share beautifully wherever links are pasted, Facebook included, without needing an on-site FB integration |
| Rebuilding companion apps inside this site (absorbing Charlie Mike TOC etc.) | "One unified app" is tempting once you're building a CMS anyway | Explicitly out of scope — apps are separate Firebase projects with their own release cadence; absorbing them couples unrelated deploys and rewrites working software for no user benefit | Link out to the existing app URLs from the Tools/Armory hub (already planned) |
| Full CMS generality (custom content types, roles/permissions, workflow/approval states) | Feels like "doing it right" since you're building a CMS anyway | Solo admin = no role model to enforce, no approval workflow to route through; generic CMS abstraction is pure YAGNI complexity for 3 known content types (games, tools, news) | Model exactly 3 typed Firestore collections with fixed schemas; skip content-type builders, custom fields, and permission systems entirely |
| Client-side-only SPA reading Firestore directly for public pages | Simplest possible architecture to build, and matches the existing design-prototype pattern (DC runtime + localStorage) | Breaks the stated core value: social crawlers (Discord, Twitter/X, iMessage, Slack) don't execute JavaScript, so link previews would be blank or generic, undermining the "share-optimized" goal and the whole "replace Facebook, drive discoverable traffic" strategy | Generate real per-page HTML with baked-in meta tags — either build-time static generation from Firestore data, or SSR that injects meta tags per route (architecture decision, not a feature decision — see ARCHITECTURE.md) |
| Full-text/faceted search engine for the catalog | Feels like a "real CMS" feature | Catalog is ~13 items today and will grow slowly (solo studio, hand-authored games); a search index (Algolia, etc.) is infrastructure for a scale this site will never reach | Simple client-side filter/sort over the small, already-loaded catalog list (see Differentiators) |
| Draft/publish workflow with separate draft storage/versioning | Standard CMS pattern, feels professional | With one admin and no review step, a full draft-vs-published document model with version history is unused complexity | A single `visible`/`published` boolean per item gives the owner "stage before showing" without a parallel draft data model |
| Optimistic UI with conflict resolution/offline sync in the admin | Feels "modern" for a CRUD admin | Single user, single device at a time in practice — there's no concurrent-edit conflict to resolve; optimistic UI implies handling rollback-on-failure logic that's pure overhead here | Straightforward request → wait → confirm UI (show a loading state, then success/error) is sufficient; skip optimistic updates and conflict merging |

## Feature Dependencies

```
Per-page meta tags (title/description)
    └──requires──> Rendering architecture supporting per-page <head> content
                       (build-time SSG from Firestore, or SSR/Cloud Function meta injection)
                       └──conflicts with──> Pure client-side SPA reading Firestore at runtime

Open Graph + Twitter Card tags
    └──requires──> Per-page meta tags (same rendering-architecture dependency)
    └──requires──> Cover imagery (OG image needs a real, absolute image URL per item)

JSON-LD structured data (Organization + per-game)
    └──requires──> Per-page meta tags infrastructure (same head-injection mechanism)
    └──enhances──> Public catalog/detail pages (adds machine-readable context, doesn't gate them)

sitemap.xml
    └──requires──> Firestore catalog data (games/tools/news) to enumerate URLs
    └──enhances──> robots.txt (robots.txt should reference the sitemap)

RSS/Atom feed
    └──requires──> News/Dispatches feed data model (same news collection, different serialization)

Admin: reorder items
    └──requires──> Admin: CRUD for games/tools/news (must exist before order can be edited)
    └──requires──> explicit `order`/`sortIndex` field in Firestore schema

Admin: show/hide (publish toggle)
    └──requires──> Admin: CRUD (toggle lives on the same edit form)
    └──enhances──> Public catalog rendering (public queries filter on `visible == true`)

Admin: image handling (upload)
    └──requires──> Admin: sign-in (Storage security rules gate writes to the owner UID)
    └──enhances──> Admin: CRUD for games/tools (cover image is a required field on those forms)

Filtering/sorting catalog (differentiator)
    └──enhances──> Games catalog listing (table stakes) — additive, not blocking
    └──conflicts with──> nothing; pure client-side enhancement over already-fetched data

Full-text search (anti-feature)
    └──would require──> a search index/service — explicitly rejected; do not build
```

### Dependency Notes

- **Per-page meta/OG/JSON-LD all share one root dependency:** the rendering architecture. This is the single most important sequencing decision for the roadmap — it must be resolved (and likely built) *before* or *alongside* the public catalog pages, not bolted on afterward, because retrofitting SSG/SSR onto an already-built client-only SPA typically means rebuilding the routing/data-fetching layer. Treat "choose and stand up the rendering approach" as an early-phase, foundational task.
- **Admin CRUD is the prerequisite for almost every admin sub-feature** (reorder, show/hide, image handling, validation) — build baseline create/edit/delete first, then layer the refinements as the same forms grow fields.
- **Cover imagery is a cross-cutting dependency**: it's required by the catalog listing (table stakes), by OG tags (differentiator... actually table stakes per PROJECT.md), and by admin image handling. Migrating/optimizing the 12 existing cover PNGs early unblocks multiple downstream features at once.
- **RSS feed conflicts with nothing and reuses existing data** — cheap enough that it's worth pulling into v1 rather than v1.x, especially since it functionally substitutes for the newsletter the owner deferred.
- **Full-text search and draft/publish workflow are true anti-features here**, not just "later" features — building them would actively work against the "keep it simple for one admin, small catalog" reality; don't schedule them for any version without a concrete trigger (e.g., catalog grows past ~50 items).

## MVP Definition

### Launch With (v1)

Everything the owner already committed to in PROJECT.md, organized by necessity:

- [ ] Games catalog listing with cover, type, status, synopsis, NEW flag — the core reason the site exists
- [ ] Downloadable rulebook PDFs for the 8 archive titles — explicit, low-complexity, high fan value
- [ ] "Buy at The Game Crafter" outbound links for the 4 boxed games — explicit, trivial
- [ ] Charlie Mike showcase with link to its live companion app — explicit, differentiates the studio as active
- [ ] Tools/Armory hub — explicit requirement, low complexity
- [ ] News/Dispatches feed (homepage, newest-first) — explicit, and it's the Facebook-replacement mechanism
- [ ] About/Contact (can be homepage sections, not necessarily separate routes) — baseline credibility
- [ ] Footer, 404, responsive layout, accessibility basics — non-negotiable quality bar
- [ ] Per-page meta tags + OG/Twitter cards + canonical URLs — this IS the stated core value ("share-optimized")
- [ ] sitemap.xml + robots.txt + favicon — explicit, cheap, high SEO leverage
- [ ] Admin: Google sign-in, CRUD for games/tools/news, show/hide, reorder, image handling, validation, sign-out — explicit, and the site has no other way to get content in without it
- [ ] Privacy-friendly analytics — explicit success-metric dependency

### Add After Validation (v1.x)

Features to add once the core site is live and traffic data starts coming in:

- [ ] Filtering/sorting the catalog — add once the catalog grows enough (or user feedback shows it's wanted) to justify the UI
- [ ] JSON-LD structured data — genuinely valuable but not blocking; add once base meta/OG is verified working via Rich Results Test and real social-share testing
- [ ] RSS/Atom feed — cheap, high-value substitute for the deferred newsletter; strong candidate to actually pull into v1 if roadmap capacity allows, otherwise first thing in v1.x
- [ ] Dedicated per-game detail pages (if cards-only proves insufficient for SEO or fan requests to link a single title) — trigger: analytics show people trying to deep-link individual games, or a title needs more content than a card supports

### Future Consideration (v2+)

Deliberately deferred — no trigger yet, revisit only if concrete evidence demands it:

- [ ] Email newsletter — owner explicitly said "not yet"; revisit only if RSS/site traffic shows real repeat-visitor demand for push-style updates
- [ ] Press kit page (presskit()-style structured media page) — defer until the studio has actual press interest to serve; a one-line "assets available on request" note covers v1
- [ ] Any form of on-site commerce — no trigger should ever move this into scope while The Game Crafter relationship stands; would require a full business-model change, not a feature decision

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Games catalog listing | HIGH | MEDIUM | P1 |
| Downloadable PDFs (archive) | HIGH | LOW | P1 |
| Buy-at-TGC links (boxed games) | HIGH | LOW | P1 |
| Tools/Armory hub | MEDIUM | LOW | P1 |
| News/Dispatches feed | HIGH | MEDIUM | P1 |
| Per-page meta + OG/Twitter cards | HIGH | MEDIUM (gated by rendering-architecture choice) | P1 |
| sitemap.xml / robots.txt / favicon | MEDIUM | LOW | P1 |
| Admin sign-in + CRUD + show/hide + reorder | HIGH | MEDIUM–HIGH | P1 |
| Privacy-friendly analytics | HIGH (success metric) | LOW | P1 |
| Responsive + accessibility + performance | HIGH | MEDIUM | P1 |
| RSS/Atom feed | MEDIUM | LOW | P2 |
| Filtering/sorting catalog | MEDIUM | LOW | P2 |
| JSON-LD structured data | MEDIUM | MEDIUM | P2 |
| Dedicated per-game detail pages | MEDIUM (conditional) | MEDIUM | P2/P3 (trigger-based) |
| Press kit page | LOW | LOW | P3 |
| Email newsletter | LOW (deferred by owner) | MEDIUM | P3 (do not build without new trigger) |
| On-site e-commerce | N/A (out of scope) | HIGH | Rejected |

**Priority key:**
- P1: Must have for launch (matches PROJECT.md Active requirements)
- P2: Should have, add when possible / first fast-follow
- P3: Nice to have, future consideration — needs a concrete trigger before scheduling

## Competitor Feature Analysis

No formal competitor audit was performed for this research pass (out of scope for a features-dimension request focused on category norms). General category patterns synthesized from indie-game/studio marketing sites and press-kit conventions (LOW-confidence web source, consistent with common knowledge):

| Feature | Typical indie studio site | Typical hobbyist/TTRPG creator page | Our Approach |
|---------|---------------------------|--------------------------------------|--------------|
| Catalog presentation | Grid of cards with cover + one-line pitch | Often a flat list, minimal metadata | Card grid with cover, type, status, synopsis, NEW flag — richer than the hobbyist baseline, simpler than a full storefront |
| Downloads | Often gated behind press-kit tools or itch.io | Frequently just a PDF link | Direct PDF links on-site — no third-party gate, matches this studio's existing content |
| Commerce | Increasingly on-site (Steam/itch embeds) for digital games | Rare for physical print-and-play | Deliberately link out to The Game Crafter — correct choice for a physical/print-and-play catalog with no digital storefront |
| Social presence | Usually deep Twitter/Discord/Facebook integration | Often just a Linktree | Deliberately excludes Facebook; relies on strong OG/Twitter cards so the site itself is the shareable unit |
| Updates/news | Blog or dev-log, sometimes with newsletter | Often just social posts (no dedicated feed) | Dispatches feed + RSS fills the gap left by dropping Facebook and deferring newsletter |

## Sources

- .planning/PROJECT.md (HIGH confidence — authoritative scope, out-of-scope, and constraints for this project)
- Web search: "schema.org JSON-LD structured data for board game or tabletop game product pages" (LOW confidence, general web) — informed the JSON-LD differentiator recommendation
- Web search: "Firebase Firestore SPA SEO meta tags social preview server rendering prerender" (LOW confidence, general web) — informed the rendering-architecture dependency called out for per-page meta/OG/JSON-LD
- Web search: "indie game studio website essential features catalog downloads press kit best practices" (LOW confidence, general web) — informed press-kit differentiator/deferral and catalog-presentation baseline
- General domain knowledge of marketing-site and lightweight headless-CMS conventions (MEDIUM confidence — well-established, stable patterns not requiring per-project verification)

---
*Feature research for: studio/portfolio marketing site + single-admin catalog CMS (TTRPG/board-game publisher)*
*Researched: 2026-08-17*
