---
phase: 09-fate-of-the-fellowship
verified: 2026-08-18T15:34:33Z
status: passed
score: 5/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
deferred_human_checks:
  - item: "Blocking browser play-through (09-02-PLAN.md Task 2: checkpoint:human-verify, gate=blocking)"
    reason: "Autonomous run with human_verify_mode=end-of-phase; per explicit user directive all human-only checks are deferred to end-of-milestone. Non-blocking flag only — does not gate this phase's passed status."
    scope: "Playability feel (setup/step/objective/hope/army trackers behaving correctly when clicked in a live browser), pixel-level Nocturne nav/footer/button visual comparison against / and /tools, and a real link-preview render in Slack/Discord/iMessage."
    machine_evidence_already_covers: "Route exists and builds; game logic/state code is unchanged and intact (git mv, full feature grep); localStorage read/write wired correctly in useEffect with try/catch; CSS is 100% .ff-scoped with zero leak into any built stylesheet; SEO tags present and app-specific in raw HTML."
    action_required: "Project owner should run `npm run preview`, open /armory/fate-of-the-fellowship, and complete the 5-step checklist in 09-02-SUMMARY.md before milestone close."
---

# Phase 9: Fate of the Fellowship Verification Report

**Phase Goal:** The reusable in-site app-hosting pattern (dynamic route + registry + `client:only` React island + per-app SEO + SSR-safe localStorage) is established and proven end-to-end by shipping Fate of the Fellowship live as the reference "clean drop-in" case.
**Verified:** 2026-08-18T15:34:33Z
**Status:** passed
**Re-verification:** No — initial verification

**Autonomous-mode note:** Per explicit run directive, the blocking human browser play-through (09-02-PLAN.md Task 2) is deferred to end-of-milestone and recorded as a non-blocking flag in frontmatter (`deferred_human_checks`). All five ROADMAP success criteria that are machine-verifiable were independently re-run against the actual codebase and production build (not trusted from SUMMARY.md) and all pass — no automated/code gap was found, so `gaps_found` does not apply.

## Goal Achievement

### Observable Truths (mapped to ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SC1/FOTF-01 — App is wired and playable at `/armory/fate-of-the-fellowship`; setup, step/objective tracking, hope/army trackers all present and unmodified | ✓ VERIFIED (code-level; interactive play deferred, non-blocking) | `dist/armory/fate-of-the-fellowship.html` built with `<astro-island component-url="/_astro/FateOfTheFellowship.Hia_Pv3s.js" ... client="only">`; re-ran `npm run build` myself (exit 0, 6 pages built incl. armory route). Component body (1025 lines) verified intact post-relocation: `export default function FateOfTheFellowship()` at line 875, full game state (`tab`/`players`/`diff`/`hope`/`threat`/`drawn`/`turn`/`active`/`phase`/`idx`/`checks`), objective data (`ring`/`prepare`), turn/army/card tables all present — confirms the `git mv` did not truncate or stub logic. |
| 2 | SC2/APP-02 — App renders full-screen inside Nocturne shell, own look untouched; every CSS-in-JS selector (incl. previously-unscoped `.body`) scoped under `.ff`; no Nocturne page affected | ✓ VERIFIED | Re-ran the per-rule CSS-scope gate myself: `awk`-extracted `const CSS` block (lines 226–394), split on every `}` (catching packed 2nd selectors), stripped at-rules — **0 of 111 top-level selectors are non-`.ff`**. Manually confirmed the 5 documented packed lines (`.rdgv.hope`/`.rdgv.low`, `.ends .a`/`.ends .b`, `.ctrll`/`.ctrll small`, `.accb ul`/`.accb li`, `.face b`/`.face span`) each have both selectors `.ff`-prefixed. Confirmed line 243: `.ff .body{...}` — the previously-unscoped rule is now nested. Built-output check: `dist/_astro/` contains only `Layout.QlVPMV8Q.css` (the shared Nocturne stylesheet) — the app's CSS-in-JS is injected client-side only and never emitted as a static build stylesheet, so no built-CSS leak surface exists at all. `dist/index.html` and `dist/tools.html` contain 0 occurrences of `FateOfTheFellowship`, 0 `<script src>` tags, and load only `Layout.QlVPMV8Q.css` — no marketing-page regression. |
| 3 | SC3/APP-03 — Progress persists via real `localStorage` across reloads, explicit reset available, no login, all access post-mount | ✓ VERIFIED | `grep` confirms real `window.localStorage.getItem/setItem` under key `STORE_KEY = "fotf:v2"` at lines 894/919 — zero occurrences of `window.storage` (the artifact shim) remain. Both calls are inside `useEffect` hooks (mount-read effect lines 891–913 with try/catch + `setReady(true)` in `finally`; debounced write effect lines 915–925 with try/catch), never at module top level — confirmed safe for the build-time server-side registry import (`npm run build` succeeded with no `ReferenceError`). `newGame` reset callback exists (line 937) wired to a "Start a new game" button (line 986); the debounced save effect re-persists post-reset state. No auth/login code path exists anywhere in the component. |
| 4 | SC4/APP-04 — Initial HTML carries real per-app `<title>`/description/OG/Twitter tags, not site defaults | ✓ VERIFIED | Grepped the built `dist/armory/fate-of-the-fellowship.html` myself: `<title>Fate of the Fellowship — Companion · Darktier Studios</title>`, `<meta name="description" content="A table companion for Fate of the Fellowship — ...">`, matching `og:title`/`og:description`/`twitter:title`/`twitter:description` all present in raw HTML `<head>`. Compared against `dist/index.html`'s `<title>Darktier Studios</title>` — confirms genuinely app-specific, not a site-default fallback. Static crawlable intro (`<h1>Fate of the Fellowship</h1>` + full description paragraph) confirmed present in the HTML body **before** the `<astro-island>` tag — real content exists without JS execution. |
| 5 | SC5 — `npm run build` succeeds and emits `dist/armory/fate-of-the-fellowship.html` with static crawlable content outside the island; no SSR adapter | ✓ VERIFIED | Re-ran `npm run build` myself from a clean invocation: exit 0, log shows `output: "static"`, `mode: "static"`, `/armory/fate-of-the-fellowship.html` listed among 6 generated static routes. `astro.config.mjs` confirmed to have no `output`/`adapter` key (`grep -E '"(output|adapter)"|output:|adapter:'` → no match). `dist/sitemap-0.xml` contains exactly 4 `<loc>` entries (`/`, `/games`, `/tools`, `/armory/fate-of-the-fellowship`) — `/admin` correctly excluded, armory route correctly included and not `noindex`ed. |

**Score:** 5/5 truths verified (0 present-but-behavior-unverified)

### Generic Pattern Check (Phase 10 readiness)

The plan's must-haves required the route/registry to contain "zero FOTF-specific logic" so Phase 10 (Burning Banners) can drop in a second app with minimal ceremony. The actual implementation deviates from the plan's two suggested dispatch mechanisms (threading `Component` through `getStaticPaths()` props, or a `Record<string, ComponentType>` lookup) — both failed at build time with Astro's `NoMatchingImport`, because `client:only` hydration-script generation requires a statically-analyzable local import binding in the JSX tag itself, not a runtime-resolved reference. The working fallback is a direct per-slug conditional: `{slug === "fate-of-the-fellowship" && <FateOfTheFellowship client:only="react" />}` in `src/pages/armory/[slug].astro`.

**Assessment:** Per the verification task's explicit instruction, this documented deviation is **acceptable**. It is disclosed in both the route file's frontmatter comment and 09-01-SUMMARY.md's Deviations section, keeps the registry (`src/lib/armoryApps.ts`) itself fully generic (SEO/name/Component fields, one entry per app, zero FOTF-specific fields), and constrains the per-app cost to exactly the documented "~3 mechanical lines" (one component file + one registry entry + one dispatch line) rather than new routing/SEO/build logic. Re-verified: `getStaticPaths()` still drives entirely off `armoryApps` with no hardcoded slug list, and `Layout`/SEO/static-intro rendering in `[slug].astro` reference only `Astro.props` fields, not FOTF specifics.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `astro.config.mjs` | `react({ include })` widened to a narrow 3-item allowlist incl. `**/components/armory/**` | ✓ VERIFIED | Line 28: `react({ include: ["**/admin/**", "**/live/**", "**/components/armory/**"] })` — exactly 3 entries, not widened to `**/*`. |
| `src/components/armory/FateOfTheFellowship.tsx` | Relocated component, real localStorage, fully-`.ff`-scoped CSS | ✓ VERIFIED | 1025 lines, `git mv` history confirmed in log (`19a4de9`), default export unchanged, localStorage + CSS scoping both verified above. |
| `src/lib/armoryApps.ts` | Generic `ArmoryApp` registry, one FOTF entry | ✓ VERIFIED | Exports `ArmoryApp` interface (slug/name/title/description/Component) and `armoryApps: ArmoryApp[]` with exactly one entry, `Component: FateOfTheFellowship` imported from the relocated file. |
| `src/pages/armory/[slug].astro` | Generic `getStaticPaths()` route, no app-specific logic beyond the documented dispatch line | ✓ VERIFIED | `getStaticPaths()` maps `armoryApps` directly; `Layout` receives `title`/`description` from props; static intro renders `name`/`description` from props; only the mount line references `FateOfTheFellowship` by name (documented, acceptable deviation above). |
| `dist/armory/fate-of-the-fellowship.html` | Build output, per-app SEO, static intro, sitemap-included | ✓ VERIFIED | File exists after fresh `npm run build`; SEO/intro/sitemap all confirmed above. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `src/pages/armory/[slug].astro` `getStaticPaths()` | `src/lib/armoryApps.ts` | `import { armoryApps } from "../../lib/armoryApps"` | ✓ WIRED | Confirmed by successful build generating exactly the routes derived from the registry array (1 entry → 1 static route). |
| `src/lib/armoryApps.ts` | `src/components/armory/FateOfTheFellowship.tsx` | `import FateOfTheFellowship from "../components/armory/FateOfTheFellowship"` | ✓ WIRED | Confirmed by successful build (registry statically imports the component server-side; a broken import path would fail `npm run build`). |
| `astro.config.mjs` react `include` glob | `src/components/armory/**` JSX compile | `react({ include: [...] })` | ✓ WIRED | Confirmed — build compiled the `.tsx` file's JSX without error (esbuild transform applied). |
| Component `useEffect` | Browser `localStorage` | `window.localStorage.getItem/setItem(STORE_KEY)` | ✓ WIRED | Confirmed both calls are inside effects, not module scope; build succeeded (no top-level `ReferenceError`). |

### Data-Flow Trace (Level 4)

Not applicable in the strict "renders DB-backed dynamic data" sense — this is a `client:only` island whose data source is the user's own browser `localStorage`, not a build-time/server data feed. Traced anyway: `useState` initial values are static defaults (game state), overwritten post-mount by the load effect's `JSON.parse(localStorage.getItem(...))` when a prior save exists — this is the expected/correct "static-default-then-restore" pattern for a client:only, no-SSR-value app, not a hollow-data anti-pattern.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Production build succeeds | `npm run build` | Exit 0; 6 pages built incl. `/armory/fate-of-the-fellowship.html` (~10.5s) | ✓ PASS |
| CSS-scope gate (per-rule, packed-line-safe) | `awk`/`tr`/`grep` pipeline over `const CSS` | `0` non-`.ff` selectors out of 111 total | ✓ PASS |
| Per-app SEO differs from site default | `grep` built `<title>` vs `dist/index.html` `<title>` | `Fate of the Fellowship — Companion · Darktier Studios` vs `Darktier Studios` | ✓ PASS |
| Sitemap inclusion | `grep -oE '<loc>...' dist/sitemap-0.xml` | 4 URLs incl. `/armory/fate-of-the-fellowship`; `/admin` absent | ✓ PASS |
| No marketing-page regression | `grep -c FateOfTheFellowship dist/index.html dist/tools.html` + script-tag count | `0` matches in both; 0 `<script src>` tags in both | ✓ PASS |
| No SSR adapter | `grep -E '"(output|adapter)"\|output:\|adapter:' astro.config.mjs` | No match | ✓ PASS |
| localStorage shim fully removed | `grep window.storage` on component | No match (0 occurrences) | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| FOTF-01 | 09-01, 09-02 | Fate of the Fellowship playable live at `/armory/fate-of-the-fellowship`, preserving existing behavior | ✓ SATISFIED (code-level; interactive play deferred, non-blocking) | Route builds, component logic intact, island mounts `client:only`. |
| APP-02 | 09-01, 09-02 | Companion app runs full-screen inside Nocturne shell, own look preserved, no restyle | ✓ SATISFIED | CSS-scope gate 0/111 non-`.ff`; no built-CSS leak; no marketing-page regression. |
| APP-03 | 09-01, 09-02 | Progress persists via `localStorage`, no login required | ✓ SATISFIED | Real `localStorage` under `fotf:v2`, post-mount only, reset preserved, no auth code. |
| APP-04 | 09-01, 09-02 | Route crawlable and share-optimized with real per-app title/description/OG | ✓ SATISFIED | Built HTML head confirmed app-specific and distinct from site defaults; sitemap-included, not noindexed. |

No orphaned requirements found — REQUIREMENTS.md maps exactly FOTF-01/APP-02/APP-03/APP-04 to Phase 9 and all four were claimed by 09-01-PLAN.md's frontmatter.

### Anti-Patterns Found

None. Grepped all four phase-modified files (`FateOfTheFellowship.tsx`, `armoryApps.ts`, `[slug].astro`, `astro.config.mjs`) for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/"not yet implemented"/"coming soon" — zero matches. No empty handlers, no hardcoded-empty stub returns, no debt markers.

### Deferred / Non-Blocking Human Verification

Per the autonomous run's explicit directive (`human_verify_mode=end-of-phase`, human-only checks deferred to end-of-milestone), the following is recorded as a **non-blocking flag**, not a status-gating item:

**1. Blocking browser play-through (09-02-PLAN.md Task 2)**
- **What:** `npm run preview` → open `/armory/fate-of-the-fellowship` → complete game setup, exercise step/objective and hope/army trackers, compare Nocturne nav/footer/buttons against `/` and `/tools` in a second tab, change trackers + reload to confirm persistence, use reset + reload to confirm defaults restore, and view-source/paste-into-chat-app to spot-check the real link-preview render.
- **Why human:** Interactive correctness (does clicking actually feel right, does the visual chrome genuinely match pixel-for-pixel, does a real Slack/Discord/iMessage unfurl render the OG tags correctly) requires a live browser and human judgment — grep/build checks can only prove the code paths and markup are present and wired, not that they behave correctly when a person uses them.
- **Machine evidence already in place:** covers everything checkable without a browser — route/build/SEO/sitemap/CSS-scope/localStorage-wiring/reset-code-path/no-regression, all independently re-verified above.
- **Action required before milestone close:** project owner completes the 5-step checklist already documented in `09-02-SUMMARY.md`.

This does not block Phase 9's `passed` status per the run's explicit directive, and does not block Phase 10 from proceeding (Phase 10 depends on the proven pattern, not on this play-through).

### Gaps Summary

None. All five ROADMAP Success Criteria for Phase 9 were independently re-verified against the actual codebase and a freshly-run `npm run build` (not trusted from SUMMARY.md claims), and all pass. The only outstanding item is the deferred human browser play-through, which is explicitly non-blocking per this run's directive and does not constitute a code/automated gap.

---

_Verified: 2026-08-18T15:34:33Z_
_Verifier: Claude (gsd-verifier)_
