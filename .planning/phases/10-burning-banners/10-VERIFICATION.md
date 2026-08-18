---
phase: 10-burning-banners
verified: 2026-08-18T17:10:00Z
status: passed
score: 5/5 roadmap success criteria verified (machine-verifiable scope)
behavior_unverified: 1 # SC1's interactive play/persistence + SC4's chrome check are behavior-dependent (real-browser only); code/wiring/persistence-shape fully verified, runtime interaction deferred
overrides_applied: 0
deferred_human_verification:
  flag: non-blocking
  reason: "AUTONOMOUS run, human_verify_mode=end-of-phase, per explicit user directive: plan 10-03's blocking browser play-through is deferred to an end-of-milestone owner pass, not executed by this verifier."
  plan: "10-03-PLAN.md (task type checkpoint:human-verify, gate: blocking, autonomous: false)"
  covers: ["SC1 interactive play (basic/advanced switch, trackers, combat/reference tabs)", "SC1 persistence round-trip in a real browser (reload restores, Abandon clears)", "SC2/SC3 visual confirmation that Nocturne nav/footer/buttons render unchanged", "SC4 bare-button chrome gap check"]
additional_findings:
  - finding: "Tailwind CSS chunk (BurningBanners.CtGY44TS.css + _slug_.CtGY44TS.css) is also emitted as a <link> on dist/armory/fate-of-the-fellowship.html, not just dist/armory/burning-banners.html — an Astro per-page-template CSS bundling quirk (both armory apps are statically imported in the same [slug].astro frontmatter, so Vite groups their CSS into the shared page chunk)."
    severity: warning
    blocking: false
    verification: "Checked FateOfTheFellowship.tsx / Layout.astro / nocturne.css / site.css for bare .flex/.grid/.hidden/.container selectors that could collide with the Tailwind utility classes (flex, grid, hidden) BurningBanners.tsx actually uses — no collision found. No visual regression is evidenced. Not in scope of the 5 literal roadmap success criteria (which name index/games/tools, not the sibling armory app page), so not scored as a gap. Recommend the deferred 10-03 play-through also glance at /armory/fate-of-the-fellowship for visual sanity, and Phase 11 consider this as a known limitation of the shared-route CSS bundling if a 3rd Tailwind-using app is ever added."
gaps: []
---

# Phase 10: Burning Banners Verification Report

**Phase Goal:** The app-hosting pattern extends cleanly to a second, heavier app — Burning Banners ships live with Tailwind v4 + lucide-react scoped entirely to its own route, with no visual or bundle impact on any Nocturne marketing page.
**Verified:** 2026-08-18T17:10:00Z
**Status:** passed (machine-verifiable scope; one non-blocking deferred human item — see below)
**Re-verification:** No — initial verification

All checks below were independently re-run by this verifier (fresh `git status`, fresh `rm -rf dist && npm run build`, fresh `npm ls`, fresh greps against dist/ and src/) rather than trusted from SUMMARY.md narrative.

## Goal Achievement

### Observable Truths (Roadmap Success Criteria, re-verified independently)

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|---|---|---|
| 1 | A visitor can play Burning Banners at `/armory/burning-banners` — basic/advanced switching, trackers, localStorage save+reset | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED (code/wiring/persistence-shape ✓ VERIFIED; interactive runtime deferred, non-blocking) | Route builds (`dist/armory/burning-banners.html` emitted); registry entry + dispatch line wired (armoryApps.ts:39-46, `[slug].astro`:56); all 3 storage call sites use real `window.localStorage.getItem/setItem/removeItem("bb:campaign")` inside `useEffect`/handler bodies (lines 2517, 2526, 2635), zero `window.storage` shim remnants; app content (basic/advanced toggle, trackers, combat/reference tabs, ~2648 lines) unchanged from the original artifact except transport. Real-browser interaction/reload persistence is the deferred plan-10-03 human play-through (non-blocking per run directive). |
| 2 | Home/Games/Tools show **zero new `<script>`/`<link>` tags** vs pre-phase baseline | ✓ VERIFIED | Re-ran the byte-diff myself: `grep -oE '<(script|link)\b[^>]*>' dist/{index,games,tools}.html \| sort` vs `.planning/phases/10-burning-banners/.bb02-baseline/*.tags.txt` — all 3 pages **IDENTICAL**, zero diff output. |
| 3 | BB Tailwind stylesheet imported only from its own component (theme+utilities only, preflight omitted), icons named-imported (no barrel) — no Nocturne nav/footer/button styling reset/altered anywhere | ✓ VERIFIED | Source: `grep -rl 'armory-bb-tailwind' src/` → only `BurningBanners.tsx`; absent from `Layout.astro`/`site.css`/`nocturne.css`. Stylesheet: `@layer theme, utilities;` + `@import "tailwindcss/theme.css" layer(theme);` + `@import "tailwindcss/utilities.css" layer(utilities);` + `@source` line; no bare `@import "tailwindcss";`. Build output: no `@layer base` anywhere in `dist/**/*.css`, no `text-size-adjust` anywhere, no real `box-sizing:border-box`+margin:0 preflight reset in any BB CSS chunk (the one `*,:before,:after` regex hit inside `BurningBanners.CtGY44TS.css` is Tailwind v4's unrelated `@layer properties` `@property`-fallback initializer for `--tw-rotate-x` etc., not preflight — confirmed via `@layer` enumeration: only `properties, theme, utilities` present, and 0 occurrences of the literal string `box-sizing:border-box` in that file). lucide: named-destructured import block only; `grep -rlE 'import * as X from "lucide-react"' src/` → 0 matches anywhere in src/. **Additional finding (non-blocking, see frontmatter):** the BB Tailwind CSS chunk is also linked from `dist/armory/fate-of-the-fellowship.html` (Astro per-page-template CSS bundling), but no class-name collision with Nocturne/FOTF chrome was found. |
| 4 | Bare-button chrome gap accepted or fixed with scoped fallback — never global preflight | ✓ VERIFIED (machine-checkable half) | No global preflight exists anywhere in the build (see #3 evidence) — the precondition for "never global preflight" holds. Whether a chrome gap exists/was found is the deferred 10-03 human check (non-blocking); no `.bb-app` override was added to the stylesheet (none needed per SUMMARY, unconfirmed by human eyes yet). |
| 5 | `npm run build` succeeds; `npm install` reports no ERESOLVE for lucide-react/tailwindcss vs React 19 | ✓ VERIFIED | Fresh `rm -rf dist && npm run build` completed successfully, emitted 7 pages including `dist/armory/burning-banners.html`. `npm ls lucide-react tailwindcss @tailwindcss/vite` exits 0, clean deduped tree (`lucide-react@1.32.0`, `tailwindcss@4.3.3` x2 deduped, `@tailwindcss/vite@4.3.3`). Full `npm ls` shows no `invalid`/`missing`/`ERESOLVE`/`UNMET` anywhere. `astro.config.mjs` has no `output`/`adapter` key (grep for `^\s*(output|adapter)\s*:` → 0 matches; the one `output` hit is inside a prose comment, not a config key).

**Score:** 5/5 roadmap success criteria hold in the machine-verifiable scope; 1 truth (interactive play + persistence round-trip in a real browser) is present-and-wired but its runtime behavior is exercised only by the deferred, non-autonomous plan 10-03 checkpoint.

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/components/armory/BurningBanners.tsx` | Relocated app, stylesheet import, real localStorage, named lucide imports | ✓ VERIFIED | 2648 lines; `apps/bb-companion.tsx` confirmed gone (pure `git mv`); imports stylesheet at line 1; all storage sites migrated; default export `App()` at line 2505. |
| `src/styles/armory-bb-tailwind.css` | Skip-preflight scoped stylesheet | ✓ VERIFIED | 4-line shape exactly as specified: layer decl, theme import, utilities import, `@source`. |
| `dist/armory/burning-banners.html` | Route emitted with per-app SEO | ✓ VERIFIED | `<title>Burning Banners — Table Companion · Darktier Studios</title>`, meta description present, in `dist/sitemap-0.xml`. |
| `src/lib/armoryApps.ts` | Registry entry, slug `burning-banners` | ✓ VERIFIED | Entry present with matching title/description; `Component: BurningBanners`. |
| `src/pages/armory/[slug].astro` | Dispatch line + parity guard | ✓ VERIFIED | `DISPATCHED_SLUGS` includes `burning-banners`; dispatch line `{slug === "burning-banners" && <BurningBanners client:only="react" />}` present; parity guard throws if mismatched (did not throw — build succeeded). |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `armoryApps.ts` entry | `[slug].astro` dispatch | slug match + parity guard | ✓ WIRED | Build succeeded (guard did not throw); both files reference `burning-banners` consistently. |
| `BurningBanners.tsx` | `armory-bb-tailwind.css` | direct import, line 1 | ✓ WIRED | Confirmed sole importer via source-wide grep. |
| `astro.config.mjs` | `@tailwindcss/vite` | `vite.plugins` | ✓ WIRED | Plugin registered; BB route's CSS chunk contains real Tailwind utility classes (positive control: `min-h-screen`, `max-w-4xl` present in `BurningBanners.CtGY44TS.css`). |

### Data-Flow / Build-Output Trace (Level 4)

| Check | Result |
|---|---|
| Home/Games/Tools direct HTML asset refs | Only `Layout.QlVPMV8Q.css` (pre-existing, no Tailwind/lucide bytes). |
| Home/Games/Tools transitive island chunks (`VaultLive.js`, `ToolsLive.js`, `FeaturedLive.js`, `DispatchesLive.js` → `display.js`, `firebase.read.js`, `jsx-runtime.js`, `react.js`) | All 4 leaf chunks individually grepped for `min-h-screen`/`max-w-4xl`/`lucide` — 0 hits in all. |
| BB route positive control | `BurningBanners.CtGY44TS.css` and `_slug_.CtGY44TS.css` both contain Tailwind utility classes; `BurningBanners.DqxNtzwy.js` (island JS, carries lucide) is referenced **only** by `burning-banners.html` (not by any marketing page). |
| Cross-app CSS chunk sharing (new finding) | `fate-of-the-fellowship.html` also links `BurningBanners.CtGY44TS.css`/`_slug_.CtGY44TS.css` (Astro bundles CSS per shared page-template file, not per rendered slug). No class-name collision found against Nocturne/FOTF chrome. Non-blocking — see frontmatter `additional_findings`. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Build succeeds and emits BB route | `rm -rf dist && npm run build` | 7 pages built incl. `dist/armory/burning-banners.html`, exit 0 | ✓ PASS |
| Marketing-page tag byte-diff | `diff` baseline vs fresh build for index/games/tools | 3/3 identical | ✓ PASS |
| Dependency resolution | `npm ls lucide-react tailwindcss @tailwindcss/vite` | exit 0, clean tree | ✓ PASS |
| Real-browser interactive play (basic/advanced switch, trackers, reload persistence, Abandon reset, visual chrome) | `npm run preview` + manual browser walkthrough | Not run by this verifier | ? SKIP → deferred to plan 10-03 (non-blocking per run directive) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| BB-01 | 10-01, 10-02 | Playable live, basic/advanced switch, trackers, localStorage save+reset | ✓ SATISFIED (code/wiring); interactive confirmation deferred, non-blocking | Route emits, storage migrated to real localStorage under identical key/shape, registry+dispatch wired, per-app SEO+sitemap present. |
| BB-02 | 10-01, 10-02 | Tailwind+lucide scoped to own route, no Nocturne marketing-page reset/impact | ✓ SATISFIED | Zero new tags on index/games/tools (re-verified); no preflight anywhere in build; stylesheet single-importer; lucide named-only; clean `npm ls`; no SSR adapter. |

No orphaned requirements found — REQUIREMENTS.md maps only BB-01/BB-02 to Phase 10, both covered.

### Anti-Patterns Found

None. Scanned all phase-modified files (`BurningBanners.tsx`, `armory-bb-tailwind.css`, `armoryApps.ts`, `[slug].astro`, `astro.config.mjs`) for `TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER` — zero matches.

### Human Verification Required (non-blocking, deferred per run directive)

1. **Interactive play-through of Burning Banners**
   **Test:** `npm run build && npm run preview`, open `/armory/burning-banners`, toggle Basic/Advanced, run Setup, exercise Turn/Combat/Reference tabs.
   **Expected:** App renders with its own dark look; mode toggle and trackers work as they did standalone.
   **Why human:** Requires a real browser DOM/interaction; no test harness exists in this repo to exercise it headlessly.

2. **Persistence round-trip**
   **Test:** Start a campaign, reload the page, confirm it restores; click "Abandon this campaign," reload again, confirm it stays cleared.
   **Expected:** `bb:campaign` localStorage save/load/clear all function correctly at runtime.
   **Why human:** Code-level wiring is confirmed (real `localStorage` calls in the right effects/handlers), but the actual browser round-trip needs a live check.

3. **Visual chrome check on BB page and Home/Games/Tools/FOTF**
   **Test:** Compare Nocturne nav/footer/button rendering on `/armory/burning-banners` against Home/Games/Tools and (per this verifier's additional finding) `/armory/fate-of-the-fellowship`.
   **Expected:** Identical nav/footer/button styling everywhere; no visible reset leak.
   **Why human:** Automated checks confirm no preflight exists and no colliding class names were found, but final visual confirmation is inherently human judgment.

4. **Bare-button chrome gap (SC4)**
   **Test:** Look for any bare `<button>` inside the BB app showing default browser chrome.
   **Expected:** None found, or fixed/accepted with a scoped `.bb-app` override (never global preflight).
   **Why human:** Visual-only defect class the automated gates can't detect.

This is the deferred, non-autonomous `10-03-PLAN.md` checkpoint (`type: checkpoint:human-verify`, `gate: blocking`, `autonomous: false`) — per the explicit run directive (AUTONOMOUS run, `human_verify_mode=end-of-phase`), it is batched to an end-of-milestone owner pass rather than blocking this phase's completion.

### Gaps Summary

No gaps found in the machine-verifiable scope. All 5 ROADMAP success criteria for Phase 10 hold under independent re-verification (fresh build, fresh diffs, fresh greps — not trusted from SUMMARY.md). One additional, non-blocking finding was surfaced beyond what the phase's own plans checked (Tailwind CSS chunk also reaches the sibling `fate-of-the-fellowship.html` page via Astro's shared-page-template CSS bundling) — investigated and confirmed harmless (no class-name collision), documented for awareness rather than treated as a gap since it is outside the literal scope of any of the 5 roadmap success criteria. The sole outstanding item is the deliberately-deferred, non-autonomous human play-through (plan 10-03), flagged non-blocking per the explicit run directive.

---
*Verified: 2026-08-18T17:10:00Z*
*Verifier: Claude (gsd-verifier)*
