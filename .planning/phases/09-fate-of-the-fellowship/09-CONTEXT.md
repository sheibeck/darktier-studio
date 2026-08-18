# Phase 9: Fate of the Fellowship - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning
**Mode:** Auto-generated (discuss skipped via workflow.skip_discuss); design pre-decided (keep the app's own look — no UI-SPEC)

<domain>
## Phase Boundary

Establish and prove the reusable in-site app-hosting pattern end-to-end by shipping **Fate of the Fellowship** live at `/armory/fate-of-the-fellowship` as the reference "clean drop-in" case. Requirements: FOTF-01, APP-02, APP-03, APP-04.

This phase builds the pattern the whole milestone reuses; Phase 10 stress-tests it (Burning Banners / Tailwind), Phase 11 documents + ships it.

</domain>

<decisions>
## Implementation Decisions

### Pre-decided (from milestone scoping + research/ARCHITECTURE.md — treat as FIXED)
- **Route:** ONE dynamic `src/pages/armory/[slug].astro` driven by `getStaticPaths()` from a small code registry `src/lib/armoryApps.ts`. Do NOT hand-author one `.astro` per app. With `build.format:"file"` + `cleanUrls:true` this emits `dist/armory/fate-of-the-fellowship.html`; no `firebase.json` change needed.
- **Registry (`src/lib/armoryApps.ts`):** an array of `{ slug, name, title, description, component }` (add optional `image` later — NOT this phase). This is the single source of truth for which apps exist and their per-app SEO. Keep `slug` in sync with the (future) Firestore Tool slug by convention.
- **Component location:** MOVE `apps/fotf-companion.tsx` → `src/components/armory/FateOfTheFellowship.tsx` (git mv). Fixes the `react({ include })` glob mismatch cleanly. Keep its default export.
- **Hydration:** mount `client:only="react"` (matches existing `AdminApp.tsx` precedent). This is REQUIRED — the app reads `localStorage` and has no SSR value; `client:load` would SSR-mismatch or break the build; `client:visible` is wrong (the app IS the page's main content).
- **astro.config.mjs:** widen `react({ include: [...] })` to add `"**/components/armory/**"` (alongside existing `admin`/`live`). Only expands where JSX is allowed; does not hydrate anything by itself.
- **Nocturne shell + per-app SEO (APP-04):** the `[slug].astro` page uses the existing `Layout.astro`, passing the registry entry's `title`/`description` so the initial HTML has a real per-app `<title>`, meta description, and OG/Twitter tags (NOT site defaults). Render a short STATIC crawlable intro paragraph OUTSIDE the island (mirrors `tools.astro`'s pattern above `<ToolsLive>`), then mount the app island below it, full-height inside the shell.
- **CSS scoping (APP-02) — CRITICAL:** `fotf-companion.tsx` injects a `const CSS` block; ALL its selectors must be scoped under the app's wrapper class (it mostly uses `.ff`, but the `.body {…}` rule near ~line 243 is UNSCOPED — nest it under `.ff` / the wrapper). No selector may leak to Nocturne pages. Verify no bare element selectors (`body`, `button`, `a`, `h1`…) escape the wrapper.
- **localStorage (APP-03):** keep the app's existing `localStorage` save + reset (key `fotf:v2`). Because the island is `client:only`, all `localStorage` access is inherently post-mount — but confirm no module-top-level `localStorage`/`window` read that would break `astro build`.
- **Slug:** `fate-of-the-fellowship`.

### Claude's Discretion
Exact registry field names, the wrapper class name, the intro copy, and file/export naming are at Claude's discretion, guided by ARCHITECTURE.md and existing codebase conventions.

</decisions>

<code_context>
## Existing Code Insights

- `src/layouts/Layout.astro` — shared shell; already accepts per-page SEO (title/description/OG). Reuse verbatim.
- `src/pages/tools.astro` — precedent: static intro content + a hydrated island below it.
- `src/components/admin/AdminApp.tsx` — precedent for `client:only="react"` on a no-SSR-value app.
- `astro.config.mjs` — `react({ include: ["**/admin/**","**/live/**"] })`; `build.format:"file"`; sitemap filters `/admin`.
- `apps/fotf-companion.tsx` — React-only (no extra deps), `const CSS` style block, `localStorage "fotf:v2"`, `export default function FateOfTheFellowship()`, ~1023 lines. Has the unscoped `.body` rule to fix.
- Firebase Hosting `dist/` static, `cleanUrls:true`, manual deploy, free Spark.

</code_context>

<specifics>
## Specific Ideas

Success criteria (from ROADMAP):
1. Playable at `/armory/fate-of-the-fellowship` (setup, step/objective tracking, hope/army trackers).
2. Full-screen inside Nocturne shell, own look untouched; EVERY CSS selector (incl. `.body`) scoped under the wrapper — no Nocturne page affected.
3. localStorage persistence + reset, no login, all localStorage access post-mount (no build-time read).
4. Page source shows real per-app title/description/OG in initial HTML (not site defaults).
5. `npm run build` succeeds and emits `dist/armory/fate-of-the-fellowship.html` with static crawlable content outside the island.

Sitemap: the new armory route SHOULD be crawlable (do not add to the `/admin` exclusion).

</specifics>

<deferred>
## Deferred Ideas

- Burning Banners + Tailwind/lucide-react scoping → Phase 10.
- Creating the live Firestore Armory tool doc for FOTF + writing the reusable pipeline guide → Phase 11.
- Per-app OG images, cross-device sync → future milestone (out of scope).

</deferred>
