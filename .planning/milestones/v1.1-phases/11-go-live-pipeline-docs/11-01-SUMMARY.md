---
phase: 11-go-live-pipeline-docs
plan: 01
subsystem: catalog
tags: [astro, firestore, armory, tools-catalog, static-build]

# Dependency graph
requires:
  - phase: 09-fate-of-the-fellowship
    provides: registered fate-of-the-fellowship in armoryApps.ts + [slug].astro dispatch
  - phase: 10-burning-banners
    provides: registered burning-banners in armoryApps.ts + [slug].astro dispatch
provides:
  - Two live, kind:"internal" tool records in the canonical seed catalog (src/data/catalog/tools.ts)
  - Verified zero-regression seed-fallback build proving SC1/SC3/SC4-sitemap against real dist/ output
affects: [11-02, 11-03, go-live checklist]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seed-fallback build gate: relocate serviceAccountKey.json + unset Firestore env vars (trap-guarded) to force getTools() to render the committed seed instead of live Firestore, so PR/CI-style verification can assert against the exact seed just written."

key-files:
  created: []
  modified:
    - src/data/catalog/tools.ts

key-decisions:
  - "Copy for both new tool records (name/kicker/description) drawn from armoryApps.ts registry metadata for consistency between the /armory page intro and the /tools card."
  - "Both new records use kicker \"Companion app\" (matching charlie-mike-toc's existing live kicker style) rather than inventing new copy conventions."

patterns-established: []

requirements-completed: [APP-01, APP-06]

coverage:
  - id: D1
    description: "Fate of the Fellowship and Burning Banners are seeded as status:live, kind:internal tool records with slugs matching the armoryApps/[slug].astro registry exactly"
    requirement: "APP-01"
    verification:
      - kind: unit
        ref: "node seed-shape check (regex assertion: both records live+internal, no `app` field) — see Verification Evidence"
        status: pass
    human_judgment: false
  - id: D2
    description: "Built /tools page lists both apps as live with same-tab /armory/<slug> Launch links (no target=_blank), and both dist/armory/<slug>.html routes exist — no dead links"
    requirement: "APP-01"
    verification:
      - kind: integration
        ref: "grep against dist/tools.html for href=\"/armory/fate-of-the-fellowship\" and href=\"/armory/burning-banners\"; test -f on both dist/armory/*.html routes"
        status: pass
    human_judgment: false
  - id: D3
    description: "Marketing pages (Home/Games/Tools) ship no companion-app JS/CSS bundle; site stays fully static (no output/adapter); both /armory routes appear in dist/sitemap-0.xml"
    requirement: "APP-06"
    verification:
      - kind: integration
        ref: "grep dist/index.html, dist/games.html, dist/tools.html for BurningBanners|FateOfTheFellowship|lucide|_slug_*.css (none found); grep astro.config.mjs for output/adapter (none found); grep dist/sitemap-0.xml for both /armory routes"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-08-18
status: complete
---

# Phase 11 Plan 01: Seed Companion Apps as Live Armory Tools Summary

**Seeded Fate of the Fellowship and Burning Banners as live, internal-kind Armory tool records and proved zero regression against a real seed-fallback `npm run build`.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-18T17:56:00Z
- **Completed:** 2026-08-18T18:08:10Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added `fate-of-the-fellowship` and `burning-banners` to `src/data/catalog/tools.ts` as `status:"live"`, `kind:"internal"`, ordered 1 and 2 among the live tools (renumbered `table-utilities`→3 and `gm-tools`→4 to stay contiguous), with no `app` field (internal tools derive their href from `slug`).
- Ran a trap-guarded seed-fallback `npm run build` (serviceAccountKey.json relocated + Firestore env vars unset for the build only, restored unconditionally afterward) to force `getTools()` to render the exact seed just written instead of live Firestore.
- Verified against the real `dist/` output: both apps appear as live tools on `/tools` with same-tab `/armory/<slug>` Launch links; both `dist/armory/<slug>.html` routes exist (no dead links); Home/Games/Tools carry zero companion-app JS/CSS; `astro.config.mjs` has no `output`/`adapter` key; both `/armory` routes are present in `dist/sitemap-0.xml`.

## Task Commits

1. **Task 1: Seed Fate of the Fellowship and Burning Banners as live internal Armory tools** - `2a8e017` (feat)
2. **Task 2: Zero-regression seed-fallback build gate (SC1 + SC3 + SC4 sitemap/parity)** - verification-only task, no file changes to commit (asserts against Task 1's seed via the build)

**Plan metadata:** (final docs commit, see below)

## Files Created/Modified
- `src/data/catalog/tools.ts` - Added `fate-of-the-fellowship` (order 1) and `burning-banners` (order 2) live/internal records; renumbered `table-utilities` (order 3) and `gm-tools` (order 4)

## Decisions Made
- Tool copy (name/kicker/description) for both new records drawn from `src/lib/armoryApps.ts` registry metadata to stay consistent between the `/armory/<slug>` page intro and the `/tools` card blurb.
- Used the existing `kicker: "Companion app"` convention (matching `charlie-mike-toc`) rather than inventing new kicker copy for the two new live tools.

## Deviations from Plan

None - plan executed exactly as written. The plan's provided `node -e` inline verify command failed to match under this environment's shell escaping (Git Bash on Windows re-interpreted the backslash-escaped regex differently than intended); the identical regex logic was re-run as a standalone `.cjs` script in the scratchpad directory and passed cleanly (`seed shape OK`), confirming this was a shell-quoting artifact of the inline `-e` string, not a defect in the seed. No plan files or logic were changed as a result — this is noted for transparency, not tracked as a Rule 1-3 deviation since no code/behavior was altered.

## Issues Encountered
None beyond the shell-escaping note above.

## Verification Evidence

**Task 1 seed-shape check** (equivalent logic to the plan's verify command, run via scratchpad `.cjs` due to inline shell-escaping):
```
seed shape OK
```

**Task 2 seed-fallback build gate** (serviceAccountKey.json relocated + Firestore env vars unset, trap-restored on exit):
```
[build] Building static entrypoints...
[build] generating static routes
  ├─ /404.html
  ├─ /admin.html
  ├─ /armory/fate-of-the-fellowship.html
  ├─ /armory/burning-banners.html
  ├─ /games.html
  ├─ /tools.html
  ├─ /index.html
[build] 7 page(s) built in 15.09s
[build] Complete!
ZERO-REGRESSION BUILD OK
```

Individual assertion evidence:
- `dist/tools.html` Launch anchors: `href="/armory/fate-of-the-fellowship"` and `href="/armory/burning-banners"`, both `<a class="btn btn-primary" ... style="text-decoration:none">` with **no `target="_blank"`** — confirms same-tab in-site navigation.
- `dist/armory/fate-of-the-fellowship.html` and `dist/armory/burning-banners.html` both exist — no dead links.
- `dist/index.html`, `dist/games.html`, `dist/tools.html` — zero matches for `BurningBanners|FateOfTheFellowship|lucide|_slug_*.css` — marketing pages carry no companion-app bundle.
- `astro.config.mjs` — no active (non-comment) `output:`/`adapter:` line — site stays fully static.
- `dist/sitemap-0.xml` — contains both `armory/fate-of-the-fellowship` and `armory/burning-banners`.

**Key restoration confirmed:** `serviceAccountKey.json` present again after the build (trap fired on exit); no `.plan11bak` file left behind; `git status --short` shows neither `dist/` nor `serviceAccountKey.json` staged (both gitignored, as required).

## User Setup Required

None - no external service configuration required. The LIVE production Firestore tool docs (SC4's production round-trip) and the production `npm run deploy` remain deferred owner actions per 11-CONTEXT.md, to be compiled into the go-live checklist in 11-03.

## Next Phase Readiness
- The code/seed side of APP-01 and APP-06 is complete and build-verified; 11-02 (reusable pipeline guide) and 11-03 (CLAUDE.md exception note + go-live checklist/handoff) can proceed.
- No blockers. The two new tool records are ready for the owner to load into production Firestore via the admin "Load starter catalog" flow or `npm run seed` when they choose to go live.

---
*Phase: 11-go-live-pipeline-docs*
*Completed: 2026-08-18*

## Self-Check: PASSED
- FOUND: src/data/catalog/tools.ts
- FOUND: .planning/phases/11-go-live-pipeline-docs/11-01-SUMMARY.md
- FOUND: 2a8e017
