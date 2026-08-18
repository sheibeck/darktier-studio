---
phase: 09-fate-of-the-fellowship
plan: 01
subsystem: infra
tags: [astro, react, client-only-island, getStaticPaths, localstorage, css-scoping, seo]

# Dependency graph
requires:
  - phase: 08-tool-data-model-and-admin-wiring
    provides: Tool.kind field + admin wiring convention this pattern will plug into (not consumed directly by this plan)
provides:
  - Reusable in-site app-hosting pattern (registry + dynamic route + client:only island + per-app SEO)
  - Fate of the Fellowship served at /armory/fate-of-the-fellowship
  - src/components/armory/ as the established location for future companion apps
affects: [10-burning-banners, 11-armory-firestore-docs-and-pipeline-guide]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getStaticPaths()-driven dynamic route (src/pages/armory/[slug].astro) fed by a small code registry (src/lib/armoryApps.ts) — one new app = one component file + one registry entry + one dispatch line"
    - "client:only=\"react\" for no-SSR-value, localStorage-only islands (mirrors AdminApp.tsx precedent)"
    - "CSS-in-JS component styles scoped under a wrapper class (.ff) to coexist safely with the shared Nocturne stylesheet"
    - "Per-app SEO: registry entry's title/description flow into Layout.astro's title/description props, with a static crawlable intro rendered outside the client:only island"

key-files:
  created:
    - src/lib/armoryApps.ts
    - src/pages/armory/[slug].astro
  modified:
    - astro.config.mjs
    - src/components/armory/FateOfTheFellowship.tsx (git mv from apps/fotf-companion.tsx)

key-decisions:
  - "Component dispatch in [slug].astro uses a direct per-slug conditional (`{slug === \"fate-of-the-fellowship\" && <FateOfTheFellowship client:only=\"react\" />}`) rather than threading the component through getStaticPaths() props or a Record<string,ComponentType> lookup — both of those failed at build time with Astro's NoMatchingImport because client:only hydration-script generation needs a statically-analyzable local import binding in the JSX tag itself, not a runtime-resolved reference. Documented in the route file; still a fixed ~3-line-per-app cost (component file + registry entry + dispatch line)."
  - "Persistence key kept as fotf:v2 with the identical serialized object shape (tab, players, diff, hope, threat, drawn, turn, active, phase, idx, checks) so any latent saved state round-trips unchanged."

requirements-completed: [FOTF-01, APP-02, APP-03, APP-04]

coverage:
  - id: D1
    description: "Fate of the Fellowship served at /armory/fate-of-the-fellowship inside the Nocturne shell after npm run build, with its own look intact"
    requirement: "FOTF-01"
    verification:
      - kind: other
        ref: "npm run build && test -f dist/armory/fate-of-the-fellowship.html"
        status: pass
    human_judgment: true
    rationale: "Visual fidelity ('own look intact') and correct interactive behavior in-browser require human eyes; build/file-existence checks only prove the route emits, not that it renders/plays correctly."
  - id: D2
    description: "Every CSS selector in the app's CSS-in-JS block scoped under .ff — no leak into Nocturne Nav/Footer"
    requirement: "APP-02"
    verification:
      - kind: unit
        ref: "per-rule CSS-scope gate: awk/tr/grep pipeline over const CSS extracting every top-level selector (including 2nd selectors packed after '}') and asserting zero non-.ff matches"
        status: pass
    human_judgment: false
  - id: D3
    description: "Persistence migrated from the artifact window.storage shim to real browser localStorage (key fotf:v2, same shape), all access confined to useEffect, reset preserved"
    requirement: "APP-03"
    verification:
      - kind: unit
        ref: "grep gate: localStorage present, fotf:v2 key present, window.storage absent"
        status: pass
    human_judgment: true
    rationale: "Grep proves the shim is gone and localStorage calls exist; round-trip save/reload/reset correctness in a real browser needs a manual UAT pass."
  - id: D4
    description: "Route's initial HTML carries per-app title/description/OG from the registry (not site defaults), with a static crawlable intro outside the island; route stays in the sitemap"
    requirement: "APP-04"
    verification:
      - kind: integration
        ref: "grep of dist/armory/fate-of-the-fellowship.html for <title>, meta description, and dist/sitemap-0.xml for the armory URL"
        status: pass
    human_judgment: false

duration: ~15min
completed: 2026-08-18
status: complete
---

# Phase 9 Plan 1: Armory App-Hosting Pattern + Fate of the Fellowship Summary

**Registry-driven getStaticPaths() route hosts Fate of the Fellowship as a client:only React island at /armory/fate-of-the-fellowship, with real localStorage persistence and a fully-.ff-scoped CSS-in-JS block.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-08-18T11:10:00-04:00 (approx)
- **Completed:** 2026-08-18T11:18:35-04:00
- **Tasks:** 3/3
- **Files modified:** 5 (2 created, 1 relocated, 2 modified)

## Accomplishments
- Established the reusable "drop-in" pipeline: `src/lib/armoryApps.ts` registry + generic `src/pages/armory/[slug].astro` dynamic route with zero FOTF-specific routing logic beyond the documented per-app dispatch line.
- Relocated `apps/fotf-companion.tsx` to `src/components/armory/FateOfTheFellowship.tsx` (pure `git mv`, default export unchanged) and widened `react({ include })` to a narrow three-item allowlist (admin/live/armory).
- Migrated persistence from the non-functional Claude-artifact `window.storage` shim to real browser `localStorage` under the same `fotf:v2` key and serialized shape, with both reads and writes confined to `useEffect`.
- Scoped all ~90 top-level selectors in the component's `const CSS` block under the `.ff` wrapper, including the previously-unscoped `.body` rule and the second selector on each of the five lines that packed two rules per physical line.
- `npm run build` succeeds and emits `dist/armory/fate-of-the-fellowship.html` with per-app `<title>`/description/OG in the initial HTML, a static crawlable intro paragraph outside the island, and the route present in `sitemap-0.xml`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Relocate the app and open the JSX compile path** - `19a4de9` (feat)
2. **Task 2: Harden the app for in-shell hosting — real localStorage + fully-scoped CSS** - `542b98c` (feat)
3. **Task 3: Build the reusable registry + dynamic route, wire FOTF, prove the build** - `f047380` (feat)

**Plan metadata:** (this commit, follows)

## Files Created/Modified
- `astro.config.mjs` - widened `react({ include })` glob with `"**/components/armory/**"`
- `src/components/armory/FateOfTheFellowship.tsx` - relocated from `apps/fotf-companion.tsx`; real localStorage persistence; every CSS selector scoped under `.ff`
- `src/lib/armoryApps.ts` - new generic `ArmoryApp` registry, one entry for Fate of the Fellowship
- `src/pages/armory/[slug].astro` - new generic dynamic route: `getStaticPaths()` over the registry, `Layout` with per-app SEO, static intro + `client:only="react"` island

## Decisions Made
- **Component dispatch pattern:** Neither of the plan's two suggested approaches (threading the component through `getStaticPaths()` props, or a `Record<string, ComponentType>` lookup keyed by slug) actually worked — both produced `NoMatchingImport` at build time, because Astro's `client:only` hydration-script generator statically scans the template for a JSX tag matched to a *local import binding*, and cannot resolve a runtime-computed variable (even one ultimately assigned from a static import) into that binding. The working fallback is a direct per-slug conditional referencing the import by name in the JSX itself: `{slug === "fate-of-the-fellowship" && <FateOfTheFellowship client:only="react" />}`. This is documented in the route file's frontmatter comment. It preserves the "one new app = one component + one registry entry + a short mechanical addition" cost model — Phase 10 (Burning Banners) will add one more line of this same shape, not new routing logic.
- Kept the storage key (`fotf:v2`) and serialized object shape identical to the original artifact version so any pre-existing saved state round-trips.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Component-dispatch mechanism changed from plan's suggested patterns**
- **Found during:** Task 3 (registry + route + build)
- **Issue:** The plan's primary pattern (thread `Component` through `getStaticPaths()` props) and its documented fallback (`Record<string, ComponentType>` lookup) both failed `npm run build` with `NoMatchingImport: Could not render 'Component'` — Astro's static template analysis for `client:only` hydration requires the JSX tag to be a direct, statically-visible import reference, not a variable populated at runtime from props or a lookup table.
- **Fix:** Replaced with a direct per-slug conditional in the template (`{slug === "fate-of-the-fellowship" && <FateOfTheFellowship client:only="react" />}`), referencing the imported component by its literal name. Documented the reasoning in a frontmatter comment in `[slug].astro` so future app additions follow the same working pattern instead of re-discovering the failure.
- **Files modified:** `src/pages/armory/[slug].astro`
- **Verification:** `npm run build` succeeds; `dist/armory/fate-of-the-fellowship.html` exists with the `astro-island` for `FateOfTheFellowship` mounted `client="only"`.
- **Committed in:** `f047380` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to make `npm run build` pass at all — the plan's own fallback clause anticipated needing a different dispatch mechanism if props-threading failed; this went one step further than the suggested `Record` lookup once that also failed, staying within the same "no per-app routing logic, ~3 mechanical lines per app" intent. No scope creep — route and registry remain otherwise exactly as specified.

## Issues Encountered
- Astro's `client:only` hydration-script generation does not perform any dataflow analysis on frontmatter — this was learned empirically via two failed build attempts (props-threading, then a `Record` lookup) before landing on the direct-conditional pattern that Astro's compiler can statically resolve. No further issues.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None. The app's full logic, layout, and state (setup wizard, turn tracker, dice reference, rules search) are unchanged from the original artifact; only persistence transport and CSS scoping were touched.

## Threat Flags
None. No new network endpoints, auth paths, or schema changes were introduced — see the plan's own `<threat_model>` (T-09-01 through T-09-04, T-09-SC), all of which remain accurately dispositioned by this implementation (fixed code-defined slug allowlist via `getStaticPaths()`, `.ff`-scoped CSS, try/catch-guarded `JSON.parse` of a user's own localStorage value, all browser-API access confined to `useEffect`, zero new dependencies).

## Next Phase Readiness
- The registry/route pattern is proven end-to-end and ready for Phase 10 (Burning Banners) to reuse: drop a component under `src/components/armory/`, add one `armoryApps.ts` entry, add one dispatch line in `[slug].astro`.
- Phase 11 (Firestore Armory tool doc + pipeline documentation) can now document the working dispatch pattern discovered here, superseding the plan's original props-threading suggestion.
- No blockers.

---
*Phase: 09-fate-of-the-fellowship*
*Completed: 2026-08-18*

## Self-Check: PASSED

All created files verified on disk (src/lib/armoryApps.ts, src/pages/armory/[slug].astro, src/components/armory/FateOfTheFellowship.tsx, astro.config.mjs, this SUMMARY). All three task commits (19a4de9, 542b98c, f047380) verified present in git log.
