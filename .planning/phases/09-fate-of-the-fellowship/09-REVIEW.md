---
phase: 09-fate-of-the-fellowship
reviewed: 2026-08-18T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/lib/armoryApps.ts
  - src/pages/armory/[slug].astro
  - astro.config.mjs
  - src/components/armory/FateOfTheFellowship.tsx
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: fixed
fixed_at: 2026-08-18T15:52:00Z
fix_commits:
  WR-01: 7350cf8
  WR-02: 30ea189
  IN-01: b92f8d9
  IN-02: deferred (APPOG-01)
---

# Phase 9: Code Review Report

**Reviewed:** 2026-08-18
**Depth:** standard
**Files Reviewed:** 4 (commits 19a4de9, 542b98c, f047380)
**Status:** issues_found (no blockers — findings are maintainability/completeness only)

## Summary

Reviewed the Phase 9 integration surface: the new `armoryApps.ts` registry, the new `[slug].astro` dynamic route, the widened `astro.config.mjs` React `include` glob, and the two Phase-9 changes to `FateOfTheFellowship.tsx` (localStorage migration, CSS `.ff`-scoping). Pre-existing game logic in the component was not reviewed per scope.

**Storage migration:** Solid. Both `localStorage.getItem` and `localStorage.setItem` calls are inside `useEffect` (never at module top level, so the server-side build-time import of the registry is safe), each wrapped in its own `try/catch` with a graceful no-op fallback (private-mode/quota-exceeded on write; "nothing saved yet" on read). No SSR/build crash risk, no unhandled throw path. One small leftover: the `alive`/cleanup-guard pattern from the previous async `window.storage.get()` version is now dead weight since the read effect is fully synchronous — noted as Info only, not a functional issue.

**CSS scoping:** Verified by hand against the full current file (not just the diff) — every selector in the `const CSS` block, including all previously-unscoped/packed-selector lines called out in the commit message, is prefixed with `.ff`. The `<style>{CSS}</style>` tag is rendered inside the `.ff` root div and mounts client-side only (`client:only="react"`), so it never appears in any built static stylesheet (`dist/_astro/*.css` stays Nocturne-only). No leak risk into `.nav`/`.btn`/Nocturne globals confirmed by cross-checking `Nav.astro`'s own `.nav`/`.btn` usage sits outside the `.ff` tree entirely.

**Route/registry:** `getStaticPaths()` in `[slug].astro` is driven entirely by `armoryApps` with zero hardcoded slugs, so it will correctly extend to N static routes as more entries are added, and an unregistered slug naturally 404s (Astro's static-route model — no path is ever generated for it, no crash). `client:only="react"` is used correctly for the mount (no SSR of the game component, no hydration-mismatch risk since Astro never server-renders a `client:only` island). SEO title/description flow from registry through `Layout` correctly and produce genuinely per-app `<title>`/OG tags distinct from the site default.

The two real gaps are both about **Phase-10 extensibility**, called out below.

## Warnings

### WR-01: `Component` field in the registry is never consumed — three manual, unenforced touch-points per new app, with no safety net for a forgotten one

**Status: RESOLVED** (commit `7350cf8`) — Added a module-scope build-time guard in `[slug].astro` (`DISPATCHED_SLUGS` set + assertion) that throws a clear `Error` naming any `armoryApps` slug missing its `client:only` dispatch line. Verified locally: with a temporary registry entry lacking a dispatch line, `npm run build` failed (exit code 1) with `armoryApps entry missing a dispatch line in [slug].astro: temp-guard-test-slug`; after removing the temp entry, `npm run build` succeeded again and `dist/armory/fate-of-the-fellowship.html` was emitted correctly.

**File:** `src/lib/armoryApps.ts:26` and `src/pages/armory/[slug].astro:16-18,38`
**Issue:** `ArmoryApp.Component` is documented as "The app's root React component, mounted client:only" and the registry's header comment calls it "the single source of truth" for which apps exist — but `[slug].astro` never reads `app.Component`. Confirmed via search: the only reference to `armoryApps` in the codebase is the `getStaticPaths()` import; `.Component` is not accessed anywhere. Instead, mounting requires two additional, separately-maintained lines in `[slug].astro`: a direct `import` of the component and a `{slug === "..." && <Component client:only="react" />}` conditional. This is a documented, unavoidable Astro limitation (client:only needs a statically-analyzable local import binding), and it's disclosed in comments — but there is no compile-time or build-time check that these three touch-points (registry entry, direct import, conditional line) stay in sync. If a Phase-10 author adds a new `armoryApps` entry (with a `Component` field that *looks* like it should be sufficient) but forgets the corresponding import + conditional line in `[slug].astro`, the result is a **silent partial failure**: `getStaticPaths()` still generates the route, `Layout` still renders the correct per-app title/description/OG in the raw HTML, the static intro (`<h1>{name}</h1>` etc.) still renders — but `.armory-app-shell` renders empty. No build error, no type error, no 404 — just a page that looks complete in view-source and in search-preview but has no actual app content for a real visitor. This is exactly the class of bug that's easy to ship and hard to notice, because everything *except* the actual product is present and correct.
**Fix:** Add a lightweight build-time guard in `[slug].astro`'s frontmatter that asserts the registry and the dispatch lines are the same length/set, e.g.:
```ts
// Every armoryApps entry MUST have a matching dispatch line below.
// This assertion catches a forgotten dispatch line at build time instead
// of shipping a page with correct SEO but an empty app shell.
const DISPATCHED_SLUGS = ["fate-of-the-fellowship"]; // keep in sync with the JSX below
const missing = armoryApps.filter((a) => !DISPATCHED_SLUGS.includes(a.slug));
if (missing.length) {
  throw new Error(
    `armoryApps entr${missing.length === 1 ? "y" : "ies"} missing a dispatch line in [slug].astro: ${missing.map((a) => a.slug).join(", ")}`
  );
}
```
Alternatively/additionally, drop the unused `Component` field from `ArmoryApp` (or rename/comment it clearly as "documentation only, not wired — see dispatch-line note below") so a future reader doesn't reasonably assume adding it to the registry is sufficient to mount the app.

### WR-02: `Astro.props` in `[slug].astro` has no declared `Props` interface, so per-app SEO fields are effectively untyped despite the project's strict TS config

**Status: RESOLVED** (commit `30ea189`) — Added `interface Props extends ArmoryApp {}` reusing the exported `ArmoryApp` type from `armoryApps.ts`. `npx astro check` reports zero errors attributable to `[slug].astro` (349 pre-existing errors remain across other, unrelated files — out of scope for this fix).

**File:** `src/pages/armory/[slug].astro:24`
**Issue:** `tsconfig.json` extends `astro/tsconfigs/strict`, and every other typed surface in this codebase (e.g. `Nav.astro`, `Layout.astro`) declares an explicit `interface Props`. `[slug].astro` does not — `const { slug, name, title, description } = Astro.props;` destructures from an implicitly-`any`-typed `Astro.props`, even though `armoryApps.ts` already exports a well-typed `ArmoryApp` interface with exactly these fields. `astro check` will not catch a typo'd field name, a removed/renamed registry field, or a caller passing the wrong shape through `props` in `getStaticPaths()`.
**Fix:**
```ts
import type { ArmoryApp } from "../../lib/armoryApps";
interface Props extends ArmoryApp {}
const { slug, name, title, description } = Astro.props;
```

## Info

### IN-01: Dead `alive`/cleanup-guard pattern left over from the async→sync storage-read migration

**Status: RESOLVED** (commit `b92f8d9`) — Removed the `alive` variable, the `if (alive && ...)` check, and the `return () => { alive = false; }` cleanup from the storage-read effect. Write effect and game logic untouched.

**File:** `src/components/armory/FateOfTheFellowship.tsx:891-913`
**Issue:** The pre-migration version awaited `window.storage.get(...)` inside an IIFE, so the `let alive = true` / `if (alive && ...)` / `return () => { alive = false; }` guard was needed to avoid calling `setState` after unmount if the async call resolved late. The migrated version reads `window.localStorage.getItem(...)` synchronously — the entire effect body now runs to completion in one tick, so `alive` can never be `false` when it's checked, and the cleanup function that flips it is now a no-op. Not a bug (no incorrect behavior results), just dead defensive code that no longer defends against anything and could confuse a future reader into thinking there's still an async gap here.
**Fix:** Drop the `alive` variable and its cleanup return, or leave a one-line comment noting the guard is now vestigial if you want to keep the shape symmetric with the write effect.

### IN-02: Registry has no per-app `image` field, so every Armory app shares the site-default OG image

**Status: DEFERRED** — Out of scope for this fix pass; tracked as future-milestone item APPOG-01 (per-app OG images). No action taken.

**File:** `src/lib/armoryApps.ts:16-27`, `src/pages/armory/[slug].astro:26`
**Issue:** `ArmoryApp` defines `title`/`description` (both correctly flow into `og:title`/`og:description` via `Layout`'s `title`/`description` props) but no `image` field, so `Layout`'s `image` prop falls back to `site.ogImage` for every armory app. That may be an intentional MVP scope cut (share previews still work, just with a generic image), but since the review focus explicitly asks about "OG wired correctly from the registry," flagging that OG *image* is not currently registry-driven while title/description are — worth a deliberate call so it isn't mistaken for full per-app OG coverage.
**Fix:** If per-app share images are wanted later, add an optional `image?: string` to `ArmoryApp` and pass it through as `<Layout ... image={image}>`; otherwise no action needed, just confirm the generic fallback is the intended behavior for Phase 10+ apps too.

---

_Reviewed: 2026-08-18_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
