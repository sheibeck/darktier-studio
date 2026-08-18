# Roadmap: Darktier Studios Website

## Milestones

- ✅ **v1.0 Public Launch** — Phases 1-7 (shipped 2026-08-17; custom domain live 2026-08-18)
- 🚧 **v1.1 In-Site Companion Apps** — Phases 8-11 (in progress)

Full detail archived at [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md).

## Phases

<details>
<summary>✅ v1.0 Public Launch (Phases 1-7) — SHIPPED 2026-08-17 · live on darktierstudios.com 2026-08-18</summary>

- [x] Phase 1: Foundation — completed 2026-08-17
- [x] Phase 2: Content & Data — completed 2026-08-17
- [x] Phase 3: Public Pages — completed 2026-08-17
- [x] Phase 4: SEO & Social — completed 2026-08-17
- [x] Phase 5: Auth & Admin CMS — completed 2026-08-17
- [x] Phase 6: Publish Pipeline & Deploy — completed 2026-08-17
- [x] Phase 7: Launch & Cutover — completed 2026-08-17

Delivered: a fast, SEO/share-optimized public site (Home, The Vault, The Armory, Dispatches) + owner-only admin CMS on a hybrid live catalog (SSR for SEO, live Firestore reads so admin edits reach customers with no deploy), on Firebase's free Spark plan, live at https://darktierstudios.com.

</details>

### 🚧 v1.1 In-Site Companion Apps (In Progress)

**Milestone Goal:** Host self-contained React companion apps directly inside the existing Darktier Studios Firebase app — no separate domains or Firebase projects — and ship the first two (Fate of the Fellowship, Burning Banners) as live, admin-managed entries in The Armory, leaving behind a documented, reusable drop-in pattern. State is localStorage-only for MVP (no login, no Firestore for game state). All v1.0 constraints hold: free Spark plan, $0/month, no Cloud Functions, static output, manual `npm run deploy`.

- [x] **Phase 8: Tool Data Model & Admin Wiring** - Additive `Tool.kind` field lets the admin CMS and Armory listing support internal in-site routes alongside external links, with zero regression to existing tools (completed 2026-08-18)
- [x] **Phase 9: Fate of the Fellowship** - Establishes the reusable app-hosting pattern (dynamic route, registry, `client:only` island, per-app SEO, scoped localStorage) and ships the reference companion app live (completed 2026-08-18)
- [x] **Phase 10: Burning Banners** - Extends the pattern to a Tailwind v4 + lucide-react app, scoped so no Nocturne page is visually affected — the milestone's real risk (completed 2026-08-18)
- [ ] **Phase 11: Go-Live & Pipeline Docs** - Flips both apps live as discoverable Armory tools, documents the drop-in pipeline, verifies zero regression, and deploys

## Phase Details

### Phase 8: Tool Data Model & Admin Wiring

**Goal**: The Armory's tool data model and admin CMS support in-site (internal-route) apps alongside external links, fully backward-compatible with every existing tool record.
**Depends on**: Phase 7 (v1.0 — Launch & Cutover)
**Requirements**: TOOL-03, TOOL-04, TOOL-05
**Success Criteria** (what must be TRUE):

  1. In the admin CMS, the owner can create or edit a Tool and choose "Internal route (Armory app)" or "External URL" as its link type, saved to Firestore as an optional `kind` field.
  2. On `/tools`, a tool with `kind: "internal"` shows a "Launch" button that opens `/armory/<slug>` in the same tab (no `target="_blank"`); existing external tools continue opening in a new tab exactly as today.
  3. Existing live tools that predate the `kind` field (Charlie Mike TOC, "docking soon" placeholders) render and behave identically to before the change — no code path assumes `kind` is present.
  4. The owner can reorder and show/hide an internal-kind tool exactly like any other tool in the admin CMS.
  5. `npm run build` and `npm run test:rules` both pass with the schema change in place.

**Plans**: 1/1 plans executed

- [x] 08-01-PLAN.md — Additive Tool.kind field: type + Armory same-tab/new-tab Launch branch, admin "Link type" select, backward-compat + build/rules gate

### Phase 9: Fate of the Fellowship

**Goal**: The reusable in-site app-hosting pattern (dynamic route + registry + `client:only` React island + per-app SEO + SSR-safe localStorage) is established and proven end-to-end by shipping Fate of the Fellowship live as the reference "clean drop-in" case.
**Depends on**: Phase 8
**Requirements**: FOTF-01, APP-02, APP-03, APP-04
**Success Criteria** (what must be TRUE):

  1. A visitor can play Fate of the Fellowship at `/armory/fate-of-the-fellowship`, with game setup, step/objective tracking, and hope/army trackers all working as they did standalone.
  2. The app renders full-screen inside the Nocturne nav/footer shell while keeping its own internal visual look untouched (no restyle) — every selector in its CSS-in-JS block (including the previously-unscoped `.body` rule) is scoped under the app's wrapper class, so no Nocturne page is affected.
  3. A visitor's game progress persists in `localStorage` across reloads with an explicit reset available, with no login required, and all `localStorage` access happens post-mount (no build-time read).
  4. Viewing page source on `/armory/fate-of-the-fellowship` shows a real per-app `<title>`, description, and OG/Twitter tags in the initial HTML (not the site defaults), even though the app body hydrates client-side.
  5. `npm run build` (not just `astro dev`) succeeds and produces `dist/armory/fate-of-the-fellowship.html` with static, crawlable content outside the island.

**Plans**: 1/2 plans executed

- [x] 09-01-PLAN.md — Establish the reusable app-hosting pattern (armoryApps registry + `[slug].astro` route + `client:only` island + per-app SEO); relocate, scope CSS under `.ff`, migrate to real localStorage, and wire Fate of the Fellowship so the build emits `dist/armory/fate-of-the-fellowship.html`
- [x] 09-02-PLAN.md — Acceptance gates (build, per-app SEO head, fully-scoped CSS, sitemap crawlability, no marketing-page regression) + blocking human play-through (playable, shell intact, persistence + reset)

**UI hint**: yes

### Phase 10: Burning Banners

**Goal**: The app-hosting pattern extends cleanly to a second, heavier app — Burning Banners ships live with Tailwind v4 + lucide-react scoped entirely to its own route, with no visual or bundle impact on any Nocturne marketing page.
**Depends on**: Phase 9
**Requirements**: BB-01, BB-02
**Success Criteria** (what must be TRUE):

  1. A visitor can play Burning Banners at `/armory/burning-banners`, with basic/advanced mode switching and trackers all working as they did standalone, and `localStorage` save + reset preserved.
  2. Home, Games (The Vault), and Tools (The Armory) pages are visually and structurally unchanged after Tailwind + lucide-react are added — diffing `dist/index.html`, `dist/games.html`, `dist/tools.html` shows zero new `<script>`/`<link>` tags on those pages.
  3. Burning Banners' Tailwind stylesheet is imported only from its own component (theme + utilities layers only, preflight omitted) and its icons are imported by name (no barrel import), so no Nocturne nav/footer/button styling is reset or altered anywhere on the site.
  4. Any bare-button chrome gap found in QA is either accepted as-is or fixed with a scoped fallback (e.g. `tailwindcss-scoped-preflight` or hand-written `.bb-app` overrides) — never a global preflight import.
  5. `npm run build` succeeds and `npm install` reports no `ERESOLVE` peer-dependency conflicts for lucide-react/tailwindcss against React 19.

**Plans**: 2/3 plans executed

- [x] 10-01-PLAN.md
- [x] 10-02-PLAN.md
- [ ] 10-03-PLAN.md

**UI hint**: yes

### Phase 11: Go-Live & Pipeline Docs

**Goal**: Both companion apps are live, discoverable Armory tools; the reusable drop-in pattern is written down for future apps; and the milestone is verified to add zero regression to the static, free-Spark site before deploying.
**Depends on**: Phase 10
**Requirements**: APP-01, APP-05, APP-06
**Success Criteria** (what must be TRUE):

  1. A visitor browsing The Armory (`/tools`) sees Fate of the Fellowship and Burning Banners listed as live tools, and clicking "Launch" opens each app in-site at `/armory/<slug>` without ever leaving darktierstudios.com.
  2. A short written guide documents the drop-in pipeline: add a component under `src/components/armory/`, register one entry in `src/lib/armoryApps.ts`, create one Armory tool record — with no per-app route hand-authoring required.
  3. A full `npm run build` confirms the public marketing pages (Home, Games, Tools) still ship ~0KB JS with no new script/style tags, and the site stays fully static (no `output`/`adapter` key in `astro.config.mjs`) on the free Spark plan with no new recurring cost.
  4. Both new `tools` Firestore docs (`slug` matching the registry exactly, `status: "live"`, `kind: "internal"`) round-trip correctly through the admin CMS, and `dist/sitemap-0.xml` includes both new `/armory` routes.
  5. The site is deployed via the existing manual `npm run deploy`, and both companion apps are reachable live on darktierstudios.com.

**Plans**: 3 plans

- [ ] 11-01-PLAN.md — Seed both apps as live internal Armory tools + zero-regression seed-fallback build gate (APP-01, APP-06)
- [ ] 11-02-PLAN.md — Drop-in pipeline guide + CLAUDE.md scoped-Tailwind exception + v1.1 go-live checklist (APP-05)
- [ ] 11-03-PLAN.md — [owner checkpoint] deploy + live Firestore seed + play-through handoff (APP-01, deferred)

## Progress

| Phase                              | Milestone | Status      | Completed  |
| ----------------------------------- | --------- | ----------- | ---------- |
| 1. Foundation                       | v1.0      | Complete    | 2026-08-17 |
| 2. Content & Data                   | v1.0      | Complete    | 2026-08-17 |
| 3. Public Pages                     | v1.0      | Complete    | 2026-08-17 |
| 4. SEO & Social                     | v1.0      | Complete    | 2026-08-17 |
| 5. Auth & Admin CMS                 | v1.0      | Complete    | 2026-08-17 |
| 6. Publish Pipeline & Deploy        | v1.0      | Complete    | 2026-08-17 |
| 7. Launch & Cutover                 | v1.0      | Complete    | 2026-08-17 |
| 8. Tool Data Model & Admin Wiring   | v1.1      | Complete    | 2026-08-18 |
| 9. Fate of the Fellowship           | v1.1      | Complete    | 2026-08-18 |
| 10. Burning Banners                 | v1.1      | Complete    | 2026-08-18 |
| 11. Go-Live & Pipeline Docs         | v1.1      | Not started | -          |

## Future Milestones

Deferred beyond v1.1 (see REQUIREMENTS.md "Future Requirements"):

- **APPSYNC-01** — Cross-device/shared saved-game sync for companion apps (requires a backend + sign-in)
- **APPOG-01** — Per-app custom Open Graph share images (1200×630 per app, vs. today's site-default image)

Also carried from v1.0 (not yet scoped): RSS feed, per-game detail routes, press kit, catalog search, instant publish, email capture — see [milestones/v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md).
