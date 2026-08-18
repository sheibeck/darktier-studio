# Phase 10: Burning Banners - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning
**Mode:** Auto-generated (discuss skipped via workflow.skip_discuss); design pre-decided (keep the app's own look — no UI-SPEC)

<domain>
## Phase Boundary

Extend the Phase-9 in-site app-hosting pattern to a SECOND, heavier app — **Burning Banners** — shipping it live at `/armory/burning-banners` with Tailwind v4 + `lucide-react` scoped ENTIRELY to its own route, with zero visual or bundle impact on any Nocturne marketing page. Requirements: BB-01, BB-02.

This is the milestone's real risk (Tailwind global-reset leakage). The Phase-9 pattern (registry + `[slug].astro` + `client:only` island + build-time parity guard + per-app SEO) is reused; this phase adds the styling/deps dimension.

</domain>

<decisions>
## Implementation Decisions

### Pre-decided (from milestone scoping + research/STACK.md + ARCHITECTURE.md — treat as FIXED)
- **Reuse the Phase-9 pattern:** add Burning Banners with ONE registry entry in `src/lib/armoryApps.ts`, ONE `client:only` dispatch line in `src/pages/armory/[slug].astro` (the build-time parity guard added in Phase 9 will FAIL the build if the registry entry lacks a dispatch line — satisfy it), ONE static import, and `git mv apps/bb-companion.tsx` → `src/components/armory/BurningBanners.tsx`. The `react({ include })` glob already covers `**/components/armory/**` (Phase 9) — no config change needed there.
- **New dependencies (STACK.md, versions verified 2026-08-18):** `lucide-react@1.32.0` (React-19 compatible), `tailwindcss@4.x` + `@tailwindcss/vite@4.x`. Add `@tailwindcss/vite` as a Vite plugin in `astro.config.mjs` (NOT the deprecated `@astrojs/tailwind` integration). Run `npm install` and confirm NO `ERESOLVE` peer conflicts against React 19.
- **Tailwind SKIP-PREFLIGHT scoping (THE critical decision — STACK.md):** create a Burning-Banners-only stylesheet that imports ONLY Tailwind's theme + utilities layers, NOT preflight:
  `@import "tailwindcss/theme.css" layer(theme);`
  `@import "tailwindcss/utilities.css" layer(utilities);`
  (plus a `@source` directive scoping content scanning to `BurningBanners.tsx`). Do NOT use a bare `@import "tailwindcss"` (that pulls in preflight/global reset). Import this stylesheet ONLY from the Burning Banners component/route — NEVER from `Layout.astro`, `site.css`, or `nocturne.css`. This makes global/cross-page reset leakage structurally impossible.
- **lucide-react:** import icons BY NAME (named ESM imports — the app already does: `Swords, Coins, ...` from `lucide-react`), never a barrel/namespace import, so only the ~29 used icons ship in the BB island bundle. It is island-only (BB is `client:only`), so it never touches marketing-page JS.
- **Storage migration (same as FOTF):** `bb-companion.tsx` persists via the Claude-artifact `window.storage` shim (`.get`/`.set`/`.delete`, key `bb:campaign`, ~lines 2517/2527/2636) which is UNDEFINED in a real browser. Migrate to real `localStorage` (`getItem`/`setItem`/`removeItem`, SAME key `bb:campaign`, same serialized shape). Keep all access inside effects/handlers — NO module-top-level `window`/`localStorage`/`document` access (the registry imports the component at build time in Node).
- **Hydration:** `client:only="react"`. **Own look:** keep the app's own dark palette (`C` object) + inline styles + Tailwind utilities — NO restyle to Nocturne. **Launch:** same-tab (already handled by Phase 8 Tool.kind for the tool card in Phase 11). **Per-app SEO:** registry entry provides title/description; static crawlable intro outside the island; route crawlable (not in sitemap `/admin` exclusion).
- **Slug:** `burning-banners`.

### Claude's Discretion
The scoped stylesheet's filename/location, the `@source` glob specifics, the intro copy, and whether a bare-`<button>` chrome gap needs the documented scoped-preflight fallback (`tailwindcss-scoped-preflight` or hand `.bb-app` overrides) — decide during QA. Preflight must NEVER be imported globally.

</decisions>

<code_context>
## Existing Code Insights

- `apps/bb-companion.tsx` — React + `lucide-react` (named icon imports), a JS `C` color object + inline styles, ~231 Tailwind utility classes, `window.storage` shim (key `bb:campaign`), `export default function App()`, ~2649 lines.
- `src/lib/armoryApps.ts` — registry (Phase 9); `src/pages/armory/[slug].astro` — generic route with `getStaticPaths` + build-time `DISPATCHED_SLUGS` parity guard (Phase 9). Add BB here.
- `src/components/armory/FateOfTheFellowship.tsx` — Phase-9 reference (relocation + storage migration + client:only mount) — mirror its integration approach.
- `astro.config.mjs` — `react({ include: ["**/admin/**","**/live/**","**/components/armory/**"] })`; `build.format:"file"`; NO Tailwind today. Add `@tailwindcss/vite` to Vite plugins.
- `src/layouts/Layout.astro`, `src/styles/nocturne.css`, `src/styles/site.css` — Nocturne shell + global CSS that must NOT be touched by Tailwind's reset.
- Firebase Hosting `dist/` static, free Spark, manual deploy. Rules unit tests: `npm run test:rules`.

</code_context>

<specifics>
## Specific Ideas

Success criteria (from ROADMAP):
1. Playable at `/armory/burning-banners` (basic/advanced switching, trackers), localStorage save + reset preserved.
2. Home / Games / Tools visually + structurally unchanged after Tailwind + lucide-react added — diffing `dist/index.html`, `dist/games.html`, `dist/tools.html` shows ZERO new `<script>`/`<link>` tags on those pages.
3. BB Tailwind stylesheet imported only from its own component (theme + utilities only, preflight omitted); icons imported by name (no barrel) — no Nocturne nav/footer/button styling reset anywhere.
4. Any bare-button chrome gap found in QA is accepted or fixed with a SCOPED fallback — never a global preflight import.
5. `npm run build` succeeds and `npm install` reports no `ERESOLVE` peer conflicts for lucide-react/tailwindcss vs React 19.

</specifics>

<deferred>
## Deferred Ideas

- Creating the live Firestore Armory tool docs for BOTH apps + writing the reusable pipeline guide → Phase 11.
- Per-app OG images (APPOG-01), cross-device sync (APPSYNC-01) → future milestone.
- Owner browser play-through of BB → deferred end-of-milestone manual check (non-blocking, per autonomous directive).

</deferred>
