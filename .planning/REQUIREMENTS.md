# Requirements: Darktier Studios Website — v1.1 In-Site Companion Apps

**Defined:** 2026-08-18
**Core Value:** A fast, great-looking, search- and share-optimized public site that becomes the studio's canonical home — extended so the studio's companion apps live *inside* that same home instead of on separate domains.

**Milestone goal:** Host self-contained React companion apps directly inside the existing Firebase app as Astro islands at internal Armory routes, ship the first two (Fate of the Fellowship, Burning Banners), and leave behind a reusable drop-in pattern. State is localStorage-only for MVP (no login, no Firestore for game state). All v1.0 constraints hold — free Spark plan, $0/month, no Cloud Functions, static output, manual deploy.

## Milestone v1.1 Requirements

Requirements for this milestone. Each maps to exactly one roadmap phase.

### In-Site App Hosting (APP)

- [ ] **APP-01**: A visitor can open a companion app at its own in-site URL under The Armory (e.g. `/armory/fate-of-the-fellowship`) without leaving darktierstudios.com
- [ ] **APP-02**: Each companion app runs full-screen inside the site's Nocturne nav/footer shell while keeping its own internal visual look (no restyle)
- [ ] **APP-03**: A visitor's in-app progress persists in their own browser across reloads via `localStorage`, with no login required (MVP scope)
- [ ] **APP-04**: Each app route is crawlable and share-optimized — it renders a real `<title>`/description and social-share preview in the initial HTML and is individually shareable, even though the app itself hydrates client-side
- [ ] **APP-05**: Adding a new companion app is a documented drop-in — a new app requires only its component plus one registry entry plus one Armory tool record, with no per-app route hand-authoring; the pattern is captured as a short written guide
- [ ] **APP-06**: Hosting the apps keeps the site fully static on the free Spark plan — no SSR adapter, no Cloud Functions, no new recurring cost — and the public marketing pages continue to ship ~0KB JS (app JS is code-split to its own route only)

### Armory Tool Integration (TOOL)

- [ ] **TOOL-03**: The tools data model supports an in-site (internal-route) launch target in addition to external links, in a way that is backward-compatible with existing tool records (absent field = today's external behavior; no migration required)
- [ ] **TOOL-04**: The owner can, in the admin CMS, add and edit an Armory tool that launches an in-site app — choosing internal vs external target — and reorder / show-hide it exactly like any other tool
- [ ] **TOOL-05**: The Armory lists in-site apps as live tools whose "Launch" opens the app in the **same tab** (in-site navigation), while existing external tools continue to open as they do today

### Fate of the Fellowship (FOTF)

- [ ] **FOTF-01**: The Fate of the Fellowship companion is playable live at `/armory/fate-of-the-fellowship`, preserving its existing behavior (game setup, step/objective tracking, hope/army trackers, and `localStorage` save + reset)

### Burning Banners (BB)

- [ ] **BB-01**: The Burning Banners companion is playable live at `/armory/burning-banners`, preserving its existing behavior (basic/advanced modes switchable, trackers, and `localStorage` save + reset)
- [ ] **BB-02**: Burning Banners' Tailwind + `lucide-react` styling is scoped to its own route so that no Nocturne marketing page is visually affected — Tailwind's global reset/preflight never reaches the shared nav, footer, or any other page

## Future Requirements

Deferred to a future milestone. Tracked but not in this roadmap.

### Companion App Enhancements

- **APPSYNC-01**: Cross-device / shared saved-game sync for companion apps (requires a backend + sign-in) — explicitly deferred; MVP is localStorage-only per owner decision
- **APPOG-01**: Per-app custom Open Graph share images (each app gets its own 1200×630 preview) — deferred; MVP uses the site's default share image

## Out of Scope

Explicitly excluded. Documented to prevent scope creep. Anti-features surfaced by research are recorded here.

| Feature | Reason |
|---------|--------|
| Login / accounts for companion-app users | Anti-feature for an at-the-table utility; adds friction and cost for no MVP value. localStorage covers realistic use |
| Offline-first PWA / service worker | The apps make no further network calls after load, so localStorage already survives the table's flaky connectivity; a service worker is over-engineering here |
| Dynamic plugin runtime / app marketplace / discovery system | Over-engineered at two apps; the reusable pattern is documentation + a small code registry, not a runtime |
| Restyling the apps to the Nocturne design system | Owner chose to keep each app's own finished look; a full restyle (esp. the Tailwind-based BB app) is significant rework for no functional gain |
| Rebuilding the apps' game logic | The apps are hosted as-is; only integration-required fixes (e.g. scoping the fotf `.body` CSS rule under its wrapper) are in scope |
| iframe-embedding the apps | A native Astro island route gives clean URLs, shared nav/footer, and proper SEO; an iframe would break all three |
| Firestore/auth involvement in app state | MVP is localStorage-only; keeps the milestone inside the free Spark plan with no rules/security surface |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOOL-03 | Phase 8 | Pending |
| TOOL-04 | Phase 8 | Pending |
| TOOL-05 | Phase 8 | Pending |
| FOTF-01 | Phase 9 | Pending |
| APP-02 | Phase 9 | Pending |
| APP-03 | Phase 9 | Pending |
| APP-04 | Phase 9 | Pending |
| BB-01 | Phase 10 | Pending |
| BB-02 | Phase 10 | Pending |
| APP-01 | Phase 11 | Pending |
| APP-05 | Phase 11 | Pending |
| APP-06 | Phase 11 | Pending |

**Coverage:**
- Milestone v1.1 requirements: 12 total
- Mapped to phases: 12 (100%)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-18*
*Last updated: 2026-08-18 after v1.1 ROADMAP.md created — 12/12 requirements mapped to Phases 8-11*
