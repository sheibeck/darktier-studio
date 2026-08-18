---
phase: 10-burning-banners
plan: 02
subsystem: testing
tags: [tailwindcss-v4, lucide-react, css-scoping, verification, defense-in-depth, sitemap, seo]

# Dependency graph
requires:
  - phase: 10-burning-banners
    provides: "Plan 10-01's implementation — Burning Banners island, the skip-preflight scoped stylesheet, real localStorage persistence, and the pre-phase baseline tag-diff proving zero marketing-page regression."
provides:
  - "Defense-in-depth proof of BB-02 against the emitted build output: zero preflight fingerprint anywhere in dist/, zero Tailwind-utility/lucide bytes on any asset (including transitively-imported shared chunks) reachable from Home/Games/Tools."
  - "Source-level lock on the scoping mechanism: single-importer stylesheet, skip-preflight shape, named-only lucide imports, clean npm ls, no SSR adapter."
  - "Documented, substantively-confirmed false positive in the plan's own literal verify one-liners (both a `::backdrop` fingerprint match and a `;` vs `&&` control-flow defect) — reusable caution for future plans reusing this verify pattern."
affects: [10-burning-banners (10-03), 11-armory-firestore-docs-and-pipeline-guide]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Positive-control verification: assert the isolation boundary AND assert the scoped route actually received the isolated asset (BB route's CSS chunk containing Tailwind utilities) — proves the isolation mechanism is discriminating, not just globally absent by accident."
    - "Transitive-chunk audit: don't stop at assets directly referenced in a page's HTML — follow ESM `from\"./chunk.js\"` imports inside astro-island component-url JS to catch bytes that reach the page indirectly (shared React runtime chunks)."

key-files:
  created:
    - .planning/phases/10-burning-banners/10-02-SUMMARY.md
  modified: []

key-decisions:
  - "Treated the literal `<verify>` automated commands as a starting point, not ground truth: re-ran every sub-assertion in isolation with real command output before accepting pass/fail, because the plan's own literal Task-1 command has a `;` (not `&&`) after the first `for` loop that silently disconnects the preflight/marketing-asset checks from the overall exit code."
  - "Investigated the `::backdrop` grep hit substantively rather than treating it as a hard fail: confirmed via layer inspection (only `@layer properties`/`theme`/`utilities` exist, no `@layer base`) and absence of `box-sizing:border-box`+`margin:0` reset and `-webkit-text-size-adjust` that the match is Tailwind v4's CSS `@property`-fallback custom-property-initializer block (engine-level, applies to any utility using CSS custom properties for legacy-browser fallback), not the preflight/global-reset layer — confirming BB-02 holds despite the literal fingerprint's false positive."
  - "Extended the marketing-asset audit beyond the plan's literal HTML-only asset scan to also check the transitively-imported shared React runtime chunks (react.js, client.js, jsx-runtime.js) that VaultLive.js/ToolsLive.js import via ESM — closing a gap the literal grep pattern (which only scans src/href attributes in the HTML) would have missed."

requirements-completed: [BB-01, BB-02]

coverage:
  - id: D1
    description: "No Tailwind preflight/reset exists anywhere in the emitted build — the global reset never touched the shared nav/footer/buttons on any page"
    requirement: "BB-02"
    verification:
      - kind: other
        ref: "npm run build; grep -rl --include='*.css' 'text-size-adjust' dist/ (0 matches); layer inspection of dist/_astro/BurningBanners.CtGY44TS.css and _slug_.CtGY44TS.css confirms only @layer properties/theme/utilities exist (no @layer base) and no box-sizing:border-box+margin:0 reset pattern"
        status: pass
    human_judgment: false
  - id: D2
    description: "No asset loaded by Home/Games/Tools (including transitively-imported shared React runtime chunks) contains Tailwind utility CSS or lucide-react code"
    requirement: "BB-02"
    verification:
      - kind: other
        ref: "grep -qE 'min-h-screen|max-w-4xl' and grep -q 'lucide' against Layout.QlVPMV8Q.css, VaultLive.CvY0PTHw.js, ToolsLive.CYZFRYTl.js, react.OrosJ8bI.js, client.B2QVrJOL.js, jsx-runtime.D7zcSYNz.js — 0 matches in all 6 files"
        status: pass
    human_judgment: false
  - id: D3
    description: "The BB Tailwind stylesheet is imported only from BurningBanners.tsx and omits the bundled Tailwind entrypoint; the BB route's own CSS chunk actually contains Tailwind utilities (positive control)"
    requirement: "BB-02"
    verification:
      - kind: other
        ref: "grep -rl 'armory-bb-tailwind' src/ returns only BurningBanners.tsx; grep for the stylesheet name in Layout.astro/site.css/nocturne.css returns 0 matches; dist/armory/burning-banners.html's _slug_.CtGY44TS.css and BurningBanners.CtGY44TS.css both contain min-h-screen/max-w-4xl"
        status: pass
    human_judgment: false
  - id: D4
    description: "dist/armory/burning-banners.html carries a per-app Burning Banners <title>/description (not the site defaults) and the route is in the sitemap"
    requirement: "BB-01"
    verification:
      - kind: other
        ref: "grep '<title>' -> 'Burning Banners — Table Companion · Darktier Studios'; grep '<meta name=\"description\"' present; grep 'armory/burning-banners' dist/sitemap-0.xml -> 1 match"
        status: pass
    human_judgment: false
  - id: D5
    description: "npm ls resolves lucide-react/tailwindcss/@tailwindcss/vite cleanly (no ERESOLVE / no unmet peers) and no SSR adapter was added"
    requirement: "BB-02"
    verification:
      - kind: other
        ref: "npm ls lucide-react tailwindcss @tailwindcss/vite exits 0 with a clean deduped tree (1.32.0/4.3.3/4.3.3); grep -nE '^\\s*(output|adapter)\\s*:' astro.config.mjs returns 0 matches"
        status: pass
    human_judgment: false
  - id: D6
    description: "lucide is named-imported only (no barrel/namespace import anywhere in src/), and armory-bb-tailwind.css uses the skip-preflight theme+utilities layer shape with @source scoping"
    requirement: "BB-02"
    verification:
      - kind: other
        ref: "grep -rlE 'import * as X from \"lucide-react\"' src/ -> 0 matches; armory-bb-tailwind.css contains @layer theme, utilities; @import \"tailwindcss/theme.css\" layer(theme); @import \"tailwindcss/utilities.css\" layer(utilities); @source line; no bare @import \"tailwindcss\";"
        status: pass
    human_judgment: false
  - id: D7
    description: "Real browser localStorage under key bb:campaign is used for load/save/Abandon-reset, with no window.storage shim remaining and all access confined inside effects/handlers (not module top-level)"
    requirement: "BB-01"
    verification:
      - kind: other
        ref: "grep 'bb:campaign' -> 3 call sites (getItem in a mount useEffect, setItem in a [game,loaded] useEffect, removeItem in the Abandon handler); grep -c 'window.storage' -> 0; Read of lines 2505-2527 confirms all three calls are nested inside App()'s useEffect bodies, not module scope"
        status: pass
    human_judgment: false

# Metrics
duration: 12min
completed: 2026-08-18
status: complete
---

# Phase 10 Plan 2: Defense-in-Depth Verification Summary

**All 12 automated isolation/SEO/dependency gates re-run with real command output against a fresh build confirm BB-02 holds at the byte level — zero Tailwind preflight or utility/lucide bytes reach Home/Games/Tools (including transitive React runtime chunks) — with one literal verify-script false positive (a `::backdrop` fingerprint hitting Tailwind's unrelated `@property` fallback layer) substantively investigated and confirmed harmless.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-18T16:53:00Z
- **Completed:** 2026-08-18T17:05:00Z
- **Tasks:** 2/2
- **Files modified:** 0 (verification-only plan; no source changes required)

## Accomplishments
- Ran a fresh `npm run build` and grepped the entire `dist/` tree for Tailwind's actual preflight fingerprints (`-webkit-text-size-adjust`, `box-sizing:border-box`+`margin:0` reset, an `@layer base`) — none exist anywhere in the build. Preflight is structurally impossible because the scoped stylesheet only imports `tailwindcss/theme.css` and `tailwindcss/utilities.css`.
- Enumerated every asset actually reachable from `dist/index.html`, `dist/games.html`, `dist/tools.html` — not just directly-referenced HTML assets but the transitively-imported ESM chunks (`react.js`, `client.js`, `jsx-runtime.js`) that `VaultLive.js`/`ToolsLive.js` pull in via `astro-island component-url` — and confirmed zero of the six checked files contain Tailwind utility class definitions or lucide bytes.
- Confirmed the positive control: `dist/armory/burning-banners.html` references `_slug_.CtGY44TS.css` and `BurningBanners.CtGY44TS.css`, both of which DO contain Tailwind utility classes (`min-h-screen`, `max-w-4xl`) — proving the scoped stylesheet compiled and shipped correctly for the one route that should have it.
- Confirmed per-app SEO (`<title>Burning Banners — Table Companion · Darktier Studios</title>` + a real meta description) and sitemap inclusion (`armory/burning-banners` present in `dist/sitemap-0.xml`).
- Confirmed at the source level: `armory-bb-tailwind.css` is imported from exactly one file (`BurningBanners.tsx`) and is absent from `Layout.astro`, `site.css`, and `nocturne.css`; the stylesheet uses the skip-preflight theme+utilities layer shape with `@source` scoping and no bundled `@import "tailwindcss";` entrypoint; lucide is a single named-import block with zero barrel/namespace imports anywhere in `src/`.
- Confirmed `npm ls lucide-react tailwindcss @tailwindcss/vite` exits 0 with a clean deduped tree (versions 1.32.0/4.3.3/4.3.3, matching research/STACK.md), and `astro.config.mjs` has no `output`/`adapter` key — the site remains fully static.
- Confirmed real `window.localStorage` usage under key `bb:campaign` (getItem on mount, setItem on state change, removeItem in the Abandon handler), zero `window.storage` shim remnants, and all three call sites nested inside `App()`'s `useEffect`/handler bodies rather than module top-level.

## Task Commits

This plan performed read-only verification against an already-implemented, already-committed feature (plan 10-01). No source code required a scoped fix — all gates passed substantively on the first pass. Per the plan's `files_modified: []` and autonomous/verification-only design, no per-task feature commits were made; only this SUMMARY plus STATE/ROADMAP metadata are committed.

## Files Created/Modified
- `.planning/phases/10-burning-banners/10-02-SUMMARY.md` - this verification record

## Decisions Made
- Did not trust the raw exit code of the plan's literal Task-1 `<verify>` one-liner. Traced it with markers and found a `;` (not `&&`) separates the first `for P in index games tools` loop from the subsequent `BBHIT=0` / second `for` loop / final SEO+sitemap checks — meaning the overall exit code is actually determined only by the last clause (title/description/sitemap), regardless of whether the preflight and marketing-asset checks pass or fail. Re-verified every sub-assertion individually with real, isolated commands instead of relying on the compound one-liner's `$?`.
- Investigated a `::backdrop` grep match inside `BurningBanners.CtGY44TS.css` and `_slug_.CtGY44TS.css` rather than treating the literal fingerprint hit as a failure. Confirmed via `@layer` enumeration (only `properties`, `theme`, `utilities` — no `base`) and absence of the real preflight reset pattern (`box-sizing:border-box` + `margin:0` on `*`/`::before`/`::after`, `-webkit-text-size-adjust`) that this is Tailwind v4's engine-level `@layer properties` CSS-custom-property fallback block (registers `--tw-rotate-x`, `--tw-shadow`, etc. initial values for browsers without native `@property` support) — a mechanism independent of and unrelated to preflight, emitted automatically by any utility using these custom properties (transform/shadow/ring/filter). Not a regression.
- Extended the marketing-asset scan beyond the literal HTML-only regex (which only found `Layout.QlVPMV8Q.css` — Astro's inline `<script>` blocks and `astro-island component-url` attributes aren't `<script src>`/`<link href>` tags) to trace the actual JS chunks via `astro-island component-url` and their ESM `from"./chunk.js"` imports, closing a real audit gap the literal gate would have silently skipped.

## Deviations from Plan

None — no code changes were required. All findings below are verify-script/tooling false positives, substantively investigated and confirmed harmless, in the spirit of the two similar false positives already documented in 10-01-SUMMARY.md.

### Verify-Script Issues Found (not code defects)

**1. Task 1 literal `<verify>` command: `;` breaks intended `&&` short-circuit chain**
- **Found during:** Task 1
- **Issue:** After `... && for P in index games tools; do ... ; done;` the plan's literal verify string uses `;` (statement separator) rather than `&&` before `BBHIT=0`. This means even if the preflight (`text-size-adjust`/`::backdrop`) or marketing-asset (Tailwind/lucide) checks fail, execution unconditionally continues to the BB positive-control + SEO + sitemap checks, and the overall exit code reflects only that final chain — silently decoupling roughly 2/3 of Task 1's intended assertions from the pass/fail signal.
- **Fix:** Not a code fix (nothing to fix in the app). Ran every Task 1 sub-assertion in isolation with real command output (documented in the `coverage` block above) instead of trusting the compound one-liner's exit code.
- **Verification:** All 6 marketing/shared-runtime files individually grepped for Tailwind utilities and lucide bytes (0 matches); preflight fingerprints individually grepped across dist/ (only the unrelated `::backdrop` false positive below).
- **Committed in:** N/A (verification-only finding, documented here for future plans reusing this verify pattern)

**2. `::backdrop` grep fingerprint matches Tailwind's `@property`-fallback layer, not preflight**
- **Found during:** Task 1
- **Issue:** `grep -rlq --include='*.css' '::backdrop' dist/` matches `dist/_astro/BurningBanners.CtGY44TS.css` and `dist/_astro/_slug_.CtGY44TS.css` — but the match is inside `@layer properties{@supports(...){*,:before,:after,::backdrop{--tw-rotate-x:initial;...}}}`, Tailwind v4's engine-level CSS custom-property initializer fallback for browsers without native `@property` support, unrelated to the preflight/global-reset layer.
- **Fix:** None needed. Confirmed no `@layer base` exists in either file (only `properties`, `theme`, `utilities`), and neither file contains `box-sizing:border-box`+`margin:0` reset patterns or `-webkit-text-size-adjust` — the actual preflight fingerprints, both absent build-wide.
- **Verification:** `grep -o '@layer [a-z, ]*' dist/_astro/BurningBanners.CtGY44TS.css | sort -u` → `properties`, `theme`, `utilities` only; `grep -c 'text-size-adjust'` → 0.
- **Committed in:** N/A (verify-script fingerprint imprecision, not a production defect)

---

**Total deviations:** 0 code changes. 2 verify-script false positives documented above, both confirmed harmless via substantive re-check.
**Impact on plan:** BB-02 holds in the shipped bytes exactly as designed in 10-01; no scoping regression exists. The two findings above are recorded so a future plan reusing this verify-string pattern doesn't need to re-derive the investigation.

## Issues Encountered
- See "Verify-Script Issues Found" above — both were investigated to a definitive, evidence-backed conclusion rather than accepted or dismissed at face value.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- BB-02 (the milestone's headline no-regression constraint) is now proven from three independent angles: 10-01's zero-new-tags baseline diff, this plan's preflight-absent + no-Tailwind/lucide-on-marketing-assets (including transitive chunks), and this plan's source-level scoping facts.
- BB-01's build/SEO/sitemap/persistence-shape are fully confirmed by automation.
- Plan 10-03 (blocking human play-through of interactive Basic/Advanced switching and tracker behavior) remains deferred as specified — non-blocking for this autonomous run, and is the only remaining open item for the Burning Banners feature.
- No blockers.

## Known Stubs
None. This plan performed verification only; no application code was created or modified.

## Threat Flags
None. This plan is read-only verification against dist/ and source; it introduces no new network endpoints, auth paths, file-access patterns, or schema changes. T-10-05, T-10-06, and T-10-SC from the plan's threat register were all directly exercised and confirmed mitigated by the gates above.

---
*Phase: 10-burning-banners*
*Completed: 2026-08-18*

## Self-Check: PASSED

All referenced files verified on disk: `.planning/phases/10-burning-banners/10-02-SUMMARY.md`, `dist/armory/burning-banners.html`, `dist/sitemap-0.xml`. No commit hashes to verify — this plan made no source code changes (verification-only), so there is no per-task commit list beyond the final metadata commit created after this SUMMARY.
