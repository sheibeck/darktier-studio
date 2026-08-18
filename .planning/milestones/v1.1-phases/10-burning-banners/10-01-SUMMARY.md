---
phase: 10-burning-banners
plan: 01
subsystem: infra
tags: [astro, react, tailwindcss-v4, lucide-react, skip-preflight, client-only-island, localstorage, css-scoping]

# Dependency graph
requires:
  - phase: 09-fate-of-the-fellowship
    provides: Reusable in-site app-hosting pattern (registry + [slug].astro dynamic route + client:only island + build-time parity guard + per-app SEO) — extended here to a second, heavier app.
provides:
  - Burning Banners served at /armory/burning-banners as a client:only React island
  - Tailwind v4 skip-preflight scoping pattern (theme+utilities layers only, no preflight, @source-scoped, imported only from the island component) — reusable for any future Tailwind-using armory app
  - Proven BB-02 no-regression methodology: pre-phase baseline tag capture + post-build byte-diff of marketing pages' <script>/<link> tags
affects: [10-burning-banners (10-02, 10-03), 11-armory-firestore-docs-and-pipeline-guide]

# Tech tracking
tech-stack:
  added: ["lucide-react@1.32.0", "tailwindcss@4.3.3", "@tailwindcss/vite@4.3.3"]
  patterns:
    - "Tailwind v4 CSS-first skip-preflight import (@layer theme, utilities; @import \"tailwindcss/theme.css\" layer(theme); @import \"tailwindcss/utilities.css\" layer(utilities); @source \"...\") — never the bundled @import \"tailwindcss\" entrypoint — keeps a global reset structurally impossible to introduce"
    - "@tailwindcss/vite registered as a Vite plugin (astro.config.mjs vite.plugins), not the deprecated @astrojs/tailwind integration"
    - "Component-scoped stylesheet import (only inside the island .tsx, never Layout/site/nocturne) for per-route CSS isolation"
    - "Pre-phase baseline capture (grep -oE '<(script|link)\\b[^>]*>' | sort) as the byte-diff gate for proving zero marketing-page regression when adding build-time dependencies"

key-files:
  created:
    - src/styles/armory-bb-tailwind.css
    - src/components/armory/BurningBanners.tsx (git mv from apps/bb-companion.tsx)
    - .planning/phases/10-burning-banners/.bb02-baseline/{index,games,tools}.tags.txt (throwaway verification artifacts)
  modified:
    - package.json
    - package-lock.json
    - astro.config.mjs
    - src/lib/armoryApps.ts
    - src/pages/armory/[slug].astro

key-decisions:
  - "Kept the Task-1 baseline capture directory (.planning/phases/10-burning-banners/.bb02-baseline/) committed rather than deleting it post-verification — it's the auditable evidence for the BB-02 no-regression claim and costs nothing to retain."
  - "Placed the armory-bb-tailwind.css import as the very first line of BurningBanners.tsx (before the React import) rather than after it — functionally equivalent, keeps CSS imports conventionally first."

requirements-completed: [BB-01, BB-02]

coverage:
  - id: D1
    description: "Burning Banners served at /armory/burning-banners as a client:only React island, keeping its own dark look, with npm run build succeeding and emitting dist/armory/burning-banners.html"
    requirement: "BB-01"
    verification:
      - kind: other
        ref: "npm run build && test -f dist/armory/burning-banners.html"
        status: pass
    human_judgment: true
    rationale: "Build/file-existence proves the route emits; visual fidelity to the app's own look and correct basic/advanced switching + tracker interactivity require a human play-through (deferred per phase context to plan 10-03 / end-of-milestone manual check, non-blocking for this autonomous run)."
  - id: D2
    description: "Campaign state persists in real browser localStorage under key bb:campaign (load/save/Abandon-reset), with the artifact window.storage shim fully removed and all access confined to effects/handlers"
    requirement: "BB-01"
    verification:
      - kind: unit
        ref: "grep gate: localStorage.getItem/setItem/removeItem(\"bb:campaign\") all present; grep -c 'window\\.storage' == 0"
        status: pass
    human_judgment: true
    rationale: "Grep proves the shim is gone and the correct localStorage calls exist with the same key/shape; a real browser round-trip (save, reload, Abandon-clears) needs a manual UAT pass to confirm runtime correctness."
  - id: D3
    description: "Tailwind v4 + lucide-react added to the build with npm install reporting no ERESOLVE peer conflict against React 19, and @tailwindcss/vite registered as a Vite plugin (not the deprecated @astrojs/tailwind integration, no output/adapter key added)"
    requirement: "BB-02"
    verification:
      - kind: other
        ref: "npm ls lucide-react tailwindcss @tailwindcss/vite (exit 0, clean tree, versions 1.32.0/4.3.3/4.3.3 matching research/STACK.md exactly)"
        status: pass
    human_judgment: false
  - id: D4
    description: "armory-bb-tailwind.css imports ONLY the theme + utilities layers (no preflight, no bundled/bare tailwindcss entrypoint) with an @source line, and is imported ONLY from BurningBanners.tsx — never Layout.astro/site.css/nocturne.css"
    requirement: "BB-02"
    verification:
      - kind: unit
        ref: "grep gate: theme.css + utilities.css layer imports present, @source present, no bare '@import \"tailwindcss\";'; grep -rl 'armory-bb-tailwind.css' src/ returns only BurningBanners.tsx"
        status: pass
    human_judgment: false
  - id: D5
    description: "Home/Games/Tools marketing pages emit zero new or changed <script>/<link> tags after adding Tailwind v4 + lucide-react to the build — the BB-02 headline no-regression proof"
    requirement: "BB-02"
    verification:
      - kind: integration
        ref: "diff of grep -oE '<(script|link)\\b[^>]*>' | sort for dist/index.html, dist/games.html, dist/tools.html against the Task-1 pre-phase baseline — all three IDENTICAL"
        status: pass
    human_judgment: false

# Metrics
duration: 14min
completed: 2026-08-18
status: complete
---

# Phase 10 Plan 1: Burning Banners Implementation Summary

**Burning Banners live at /armory/burning-banners as a client:only React island with Tailwind v4 skip-preflight CSS scoped entirely to its own route (zero preflight anywhere in the build) and real localStorage persistence — Home/Games/Tools ship byte-identical `<script>`/`<link>` tags versus the pre-phase baseline.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-08-18T16:35:20Z
- **Completed:** 2026-08-18T16:49:57Z
- **Tasks:** 3/3
- **Files modified:** 8 (2 created — stylesheet + 3 baseline files, 1 relocated, 5 modified)

## Accomplishments
- Captured the pre-phase BB-02 baseline (script/link tag lists for dist/index.html, dist/games.html, dist/tools.html) on the untouched tree, before installing any dependency — the byte-diff comparison target used in Task 3.
- Installed lucide-react@1.32.0 (runtime) and tailwindcss@4.3.3 + @tailwindcss/vite@4.3.3 (dev), matching research/STACK.md exactly; `npm ls` confirms a clean dependency tree with no ERESOLVE peer conflict against React 19.
- Registered `@tailwindcss/vite` as a Vite plugin in `astro.config.mjs` (`vite.plugins`), not the deprecated `@astrojs/tailwind` integration; no `output`/`adapter` key added — the build stays fully static.
- Created `src/styles/armory-bb-tailwind.css` importing only `tailwindcss/theme.css` (layer theme) and `tailwindcss/utilities.css` (layer utilities), with an `@source` line scoping class-name scanning to `BurningBanners.tsx` — the preflight/global-reset layer never exists anywhere in the build.
- Relocated `apps/bb-companion.tsx` → `src/components/armory/BurningBanners.tsx` via pure `git mv`, mirroring the Phase-9 Fate of the Fellowship precedent; migrated all three storage call sites from the non-functional Claude-artifact `window.storage` shim to real `window.localStorage` (`getItem`/`setItem`/`removeItem`) under the identical key `bb:campaign` and identical `JSON.stringify(game)` shape, keeping all access inside effects/handlers.
- Registered Burning Banners in the pipeline: one import + one registry entry in `src/lib/armoryApps.ts`, one import + one `DISPATCHED_SLUGS` entry + one `client:only="react"` dispatch line in `src/pages/armory/[slug].astro`, satisfying the build-time parity guard.
- `npm run build` succeeds and emits `dist/armory/burning-banners.html`; the BB-02 headline no-regression check passes — `dist/index.html`, `dist/games.html`, `dist/tools.html` all show byte-identical `<script>`/`<link>` tag lists versus the Task-1 baseline (zero new or changed tags). The BB route's own CSS chunk (`BurningBanners.CtGY44TS.css`) is confirmed present only on `burning-banners.html`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Capture BB-02 baseline, add deps, wire @tailwindcss/vite, create scoped stylesheet** - `ea2b556` (feat)
2. **Task 2a: Relocate the app (git mv)** - `ac7c8af` (feat)
2. **Task 2b: Wire BB stylesheet import + migrate storage to real localStorage** - `37af3c0` (feat)
3. **Task 3: Register in pipeline, build, prove zero marketing-page regression** - `6667bdc` (feat)

**Plan metadata:** (this commit, follows)

## Files Created/Modified
- `package.json` / `package-lock.json` - added lucide-react (dependency), tailwindcss + @tailwindcss/vite (devDependencies)
- `astro.config.mjs` - added `@tailwindcss/vite` import + `vite: { plugins: [tailwindcss()] }`; no other keys touched
- `src/styles/armory-bb-tailwind.css` - new skip-preflight stylesheet (theme + utilities layers only, `@source` scoped to BurningBanners.tsx)
- `src/components/armory/BurningBanners.tsx` - relocated from `apps/bb-companion.tsx`; stylesheet import added; storage migrated to real `localStorage`
- `src/lib/armoryApps.ts` - added `BurningBanners` import + registry entry (slug `burning-banners`)
- `src/pages/armory/[slug].astro` - added `BurningBanners` import, `DISPATCHED_SLUGS` entry, and dispatch line
- `.planning/phases/10-burning-banners/.bb02-baseline/{index,games,tools}.tags.txt` - pre-phase baseline tag captures (throwaway verification artifact, retained for audit trail)

## Decisions Made
- Retained the `.bb02-baseline/` directory in the commit rather than deleting it after verification — it's the concrete evidence backing the BB-02 no-regression claim and has negligible cost to keep.
- Placed the `armory-bb-tailwind.css` import as line 1 of `BurningBanners.tsx` (before the `react`/`lucide-react` imports) — a minor, functionally-inert ordering choice (CSS imports conventionally first).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed my own incomplete `git add` staging in Task 2**
- **Found during:** Task 2 (relocate + migrate storage)
- **Issue:** After `git mv apps/bb-companion.tsx src/components/armory/BurningBanners.tsx`, I made the content edits (stylesheet import + localStorage migration) directly on disk, then ran `git add -A -- src/components/armory/BurningBanners.tsx apps/bb-companion.tsx`. The second pathspec (`apps/bb-companion.tsx`) no longer existed, so the whole `git add` command aborted with `fatal: pathspec ... did not match any files` before staging the content edits — the resulting commit (`ac7c8af`) captured only the pure rename (0 insertions/deletions), leaving the actual storage-migration diff unstaged.
- **Fix:** Re-staged `src/components/armory/BurningBanners.tsx` alone and created a follow-up commit (`37af3c0`) carrying the stylesheet-import and localStorage-migration changes. Re-ran Task 2's full verification gate against the final committed state — all checks pass.
- **Files modified:** `src/components/armory/BurningBanners.tsx` (no additional files)
- **Verification:** `git status --short` clean for this file after both commits; all Task 2 grep gates pass against the committed tree.
- **Committed in:** `37af3c0`

---

**Total deviations:** 1 auto-fixed (1 tooling/bug, self-caused staging error — not a plan defect)
**Impact on plan:** No scope creep; Task 2's intended end-state was reached with one extra atomic commit instead of one. All plan content and file targets are unchanged from what was specified.

## Issues Encountered
- Two of the plan's literal automated `<verify>` grep commands produced false-negative signal against correct implementation state, both confirmed harmless via substantive re-checks:
  - Task 1's `! grep -q 'output' astro.config.mjs` flags the pre-existing prose comment `// ...Firebase Hosting serves the static \`dist/\` output.` — not an actual `output:`/`adapter:` config key. Confirmed via `grep -nE '^\s*(output|adapter)\s*:' astro.config.mjs` → no match.
  - Task 2's `grep -Eq 'import[[:space:]]*\{[^}]*Swords' ...` is single-line-only (plain `grep`, no `-z`/multiline), so it doesn't match the lucide-react import's pre-existing multi-line wrap (`import {\n  Swords, Coins, ...\n} from "lucide-react";` — unchanged from the original artifact). Confirmed via a multiline-aware Node regex that the import is a named/destructured block containing `Swords` with no namespace/barrel import present.
  - Neither indicates a real defect; both are documented here for traceability rather than silently ignored.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 10-02 (deeper isolation/SEO/sitemap verification gates, per this plan's `<verification>` section) can proceed — the build-time artifacts (dist/armory/burning-banners.html, the isolated BB CSS/JS chunks, the sitemap entry) are all in place.
- Plan 10-03 (blocking human play-through / manual QA of basic-advanced switching, trackers, and any bare-`<button>` chrome gap per research/STACK.md's documented fallback) remains deferred, as specified — non-blocking for this autonomous run.
- No blockers. The Tailwind v4 skip-preflight pattern and the pre-phase-baseline-diff methodology are both now proven and reusable for any future Tailwind-using armory app (per research/STACK.md's "Stack Patterns by Variant").

## Known Stubs
None. The app's full logic, layout, and state (basic/advanced mode switching, setup wizard, turn/income/revolt/coven/collapse trackers, combat helper, rules reference) are unchanged from the original artifact; only persistence transport, CSS scoping, and file location were touched.

## Threat Flags
None beyond what the plan's own `<threat_model>` already anticipated and dispositioned (T-10-01 through T-10-04, T-10-SC) — all mitigations were implemented exactly as planned: skip-preflight scoped stylesheet (T-10-01), component-scoped CSS/JS import graph verified isolated to burning-banners.html's own chunk (T-10-02), versions verified against STACK.md with clean `npm ls` resolution (T-10-SC), all localStorage access confined to effects/handlers (T-10-03). No new network endpoints, auth paths, or schema changes were introduced.

---
*Phase: 10-burning-banners*
*Completed: 2026-08-18*

## Self-Check: PASSED

All created/relocated files verified on disk (src/styles/armory-bb-tailwind.css, src/components/armory/BurningBanners.tsx, .planning/phases/10-burning-banners/.bb02-baseline/*.tags.txt, dist/armory/burning-banners.html, this SUMMARY). All four task commits (ea2b556, ac7c8af, 37af3c0, 6667bdc) verified present in git log.
