---
phase: 10-burning-banners
reviewed: 2026-08-18T17:25:31Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - astro.config.mjs
  - src/styles/armory-bb-tailwind.css
  - src/lib/armoryApps.ts
  - src/pages/armory/[slug].astro
  - package.json
  - package-lock.json
  - src/components/armory/BurningBanners.tsx (phase-10 changes only: CSS import line, localStorage migration effects/handler)
findings:
  critical: 0
  warning: 0
  info: 1
  total: 1
status: resolved
---

# Phase 10: Code Review Report — Burning Banners (INTEGRATION)

**Reviewed:** 2026-08-18T17:25:31Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found (info-only)

## Summary

Reviewed the Phase 10 integration surface across commits ea2b556, ac7c8af, 37af3c0, and 6667bdc: the new `@tailwindcss/vite` wiring, the scoped skip-preflight `armory-bb-tailwind.css` stylesheet, the `armoryApps.ts` registry entry, the `[slug].astro` dispatch wiring, and the `window.storage` → `localStorage` migration in `BurningBanners.tsx`. Per scope, the pre-existing ~2600-line artifact game logic in `BurningBanners.tsx` was not reviewed except where it was actually touched by this phase's diff.

Verification performed beyond static reading:
- Confirmed `armory-bb-tailwind.css` is imported from exactly one place (`BurningBanners.tsx` line 1) — `grep -r` across `src/` found no other import site.
- Confirmed the `@source "../components/armory/BurningBanners.tsx"` path resolves to a single file, not a directory glob — no over-scan risk.
- Built the site and diffed `<link rel="stylesheet">` tags across `dist/index.html`, `dist/games.html`, and `dist/armory/burning-banners.html` — marketing pages emit only `Layout.*.css`; the Tailwind chunk (`BurningBanners.*.css`, 11.6KB) appears only on armory pages that reference the component. This matches the commit's stated BB-02 gate result.
- Confirmed the known cross-bundle behavior (the `[slug].astro` template links BB's Tailwind CSS chunk onto the FOTF armory page too, since both components are statically imported into the shared template) is real, but extracted every `className` token from both `BurningBanners.tsx` (all are genuine Tailwind utility tokens, e.g. `flex`, `gap-2.5`, `rounded-sm`) and `FateOfTheFellowship.tsx` (all are short custom tokens — `a`, `card`, `nav`, `btn`, `sheet`, etc. — driven by an inline `<style>{CSS}</style>` tag, not a bundled stylesheet) and cross-checked both lists against `nocturne.css`/`site.css` selectors. No overlapping class names found — no actual collision, consistent with the "already verified non-regressing" note.
- Grepped `BurningBanners.tsx` for dynamically-constructed partial class names (e.g. `` `p-${size}` ``-style interpolation) that Tailwind's text-based `@source` scanner couldn't statically pick up. None found — the two `className={\`...${x}...\`}` template-literal usages (`Panel`, `Btn` helper components) only interpolate complete literal class strings or a passthrough `className` prop whose call-site values are themselves complete literals present elsewhere in the same file, so nothing is silently un-styled.
- Ran `npx astro check` and filtered for the specific lines touched by this phase's diff (the CSS import line, the two `localStorage` effects, and the abandon-campaign handler) — zero new type errors on those lines. All 352 pre-existing errors in the file are in the untouched game-logic body (driven by an untyped `useState(null)` for `game`), out of this review's scope per instructions.
- Confirmed `lucide-react@1.32.0` is installed and resolves cleanly (`node_modules/lucide-react/package.json`), matches `package.json`'s declared range, and is imported via a single named-import destructure (no barrel/namespace import).
- Confirmed no leftover `window.storage` references remain anywhere in the file after the migration.

No Critical or Warning findings. One Info-level code-quality note below.

## Info

### IN-01: Vestigial `cancelled`-flag guard is dead code after the async→sync storage migration — RESOLVED

**File:** `src/components/armory/BurningBanners.tsx:2514-2522`
**Issue:** The original `window.storage` version wrapped the load in an `async` IIFE, so the `cancelled` flag (set by the effect's cleanup function) guarded against a real race: the component could unmount while the `await` was still pending, and the flag prevented a `setState` call on an unmounted component. The migration to synchronous `localStorage.getItem` (commit 37af3c0) removed the `await`, so the entire effect body — including the `if (!cancelled && raw)` check and the `if (!cancelled) setLoaded(true)` call — now runs synchronously to completion before the cleanup function could ever set `cancelled = true`. The guard is a no-op: `cancelled` is always `false` at both check sites. This isn't a bug (no incorrect behavior results), but it's misleading — a future reader will reasonably assume there's still an async race being guarded against, and the pattern is unnecessary complexity left over from the shim-based implementation.
**Fix:** Drop the now-unused race-guard scaffolding, since the effect is fully synchronous:
```tsx
useEffect(() => {
  try {
    const raw = window.localStorage.getItem("bb:campaign");
    if (raw) { setGame(JSON.parse(raw)); setView("turn"); }
  } catch (e) { /* nothing saved — start fresh */ }
  setLoaded(true);
}, []);
```

**Resolution:** Applied exactly as suggested. The `cancelled` flag and its cleanup return were removed; the write effect, abandon handler, error handling, and `bb:campaign` key were untouched. `npm run build` re-run post-fix — succeeded, emitted `dist/armory/burning-banners.html`; marketing pages (`index.html`) still emit only `Layout.*.css`, confirming no bundling regression.

---

_Reviewed: 2026-08-18T17:25:31Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
