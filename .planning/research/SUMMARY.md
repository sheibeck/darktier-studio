# Project Research Summary

**Project:** Darktier Studios Website — v1.1 In-Site Companion Apps
**Domain:** Hosting two prebuilt, single-file React "artifact" apps (Fate of the Fellowship, Burning Banners) as Astro islands at internal `/armory/<slug>` routes inside the existing static Astro 7 + Firebase Hosting site, without disturbing the Nocturne marketing pages.
**Researched:** 2026-08-18
**Confidence:** HIGH

## Executive Summary

This milestone grafts two standalone, browser-only React apps onto a static Astro/Firebase site that today ships ~0KB JS on public pages and has zero Tailwind. The correct build is a single dynamic Astro route (`src/pages/armory/[slug].astro`) driven by a small code registry (`src/lib/armoryApps.ts`), with each app moved into `src/components/armory/` and mounted with `client:only="react"`. Both apps are read-only, localStorage-only state machines with no Firestore/auth involvement — this keeps the milestone entirely inside Firebase's free Spark plan with zero SSR adapter, zero Cloud Functions.

The recommended approach sequences work by risk: land the `Tool.kind` data-model change first (pure additive, zero visible behavior change), then admin + `ToolsLive` rendering, then the simpler Fate of the Fellowship app (plain CSS, no new dependencies) as the reference "clean drop-in" case, then Burning Banners (Tailwind v4 + lucide-react) as the deliberate stress test of the pattern, and finally the Firestore tool docs that flip both apps live. The reusable "app-hosting pipeline" this milestone is meant to produce is explicitly a documentation artifact extracted from building the first app — not a system designed in the abstract before any app exists.

The two headline risks are both CSS/build-boundary problems specific to grafting standalone SPA code onto an SSG: (1) Tailwind's preflight reset silently restyling the entire Nocturne site if imported globally instead of scoped per-component with preflight omitted, and (2) `localStorage` reads during initial render breaking `astro build` outright (a hard build failure, not a runtime bug) unless moved into `useEffect`. Both are structurally avoidable with patterns already used elsewhere in this codebase (`AdminApp.tsx` already uses `client:only="react"` as precedent) and both fixes are cheap even if caught late.

## Key Findings

### Recommended Stack

The existing v1.0 stack (Astro 7.2.2, `@astrojs/react` 6.0.2, React 19.2.8, Firebase 12.17.1/firebase-admin 14.2.0) is unchanged. This milestone adds exactly two new dependencies, both scoped to Burning Banners only — Fate of the Fellowship needs zero new packages.

**Core technologies:**
- **lucide-react 1.32.0** — icon set for Burning Banners (~29 named imports) — verified React 19-compatible peer range; island-only dependency, tree-shaken by Vite so it never reaches other routes' bundles.
- **tailwindcss 4.3.3 + @tailwindcss/vite 4.3.3** — utility classes for Burning Banners' ~231 Tailwind classes — v4's CSS-first, layer-based `@import` model is what makes route-scoping without global pollution structurally possible. `@astrojs/tailwind` (legacy, targets v3) is explicitly rejected.
- **No new package for Fate of the Fellowship** — it injects its own CSS via a `const CSS` template string; ships as a plain React island.
- **`react({ include: [...] })` glob widened** in `astro.config.mjs` to add `**/armory/**` alongside the existing `**/admin/**`, `**/live/**` — additive only, does not itself hydrate anything.

### Expected Features

**Must have (table stakes):**
- Own crawlable, shareable, deep-linkable URL per app (`/armory/<slug>`) with per-app OG/meta
- localStorage state persists across reload/tab close, namespaced key per app
- Explicit in-app reset/"start new session" affordance (confirm-before-wipe)
- Nocturne nav/footer shell wraps each app; clear way back to the main site
- Mobile-first responsive layout verified per app (not assumed)
- Zero further network calls once the page has loaded
- Discoverable from The Armory catalog like any other Tool

**Should have (differentiators):**
- Consistent Nocturne shell around otherwise-freeform app internals (already decided)
- Documented, reusable "drop a `.tsx` app in, register one entry, it's a route" pipeline — the milestone's second explicit deliverable
- Small additive `Tool.kind` schema extension so SEO/OG coverage stays consistent without hand-writing `<head>` tags

**Defer (v2+):**
- Login/account-gated sync, cross-device or multiplayer shared state — contradicts no-login MVP and free-tier constraints
- Full offline-first PWA with service worker — unnecessary; localStorage + no-further-fetches already covers the realistic "spotty wifi at the table" case
- A generic runtime plugin/loader system — over-engineering at this app count; static registry + explicit registration is the correct scale
- iframe-embedding — fights SEO/deep-linking/shell-consistency table stakes

### Architecture Approach

One dynamic `getStaticPaths()`-driven route resolves the entire "registry" pattern at build time — it is not a runtime dynamic route, it generates N static HTML files exactly like `tools.astro` does today, so Firebase Hosting's free Spark plan is untouched. Each app moves from `apps/*.tsx` into `src/components/armory/*.tsx` (matching the codebase's one existing convention: React islands live under `src/components/{admin,live}/`), registered in `src/lib/armoryApps.ts` (slug → title/description/Component), and mounted via `client:only="react"` inside `Layout.astro` with zero props passed in.

**Major components:**
1. `src/pages/armory/[slug].astro` — per-app page shell; the only file that knows about routing; resolves registry entry, renders `Layout`, mounts the matching island
2. `src/lib/armoryApps.ts` — single source of truth (slug → metadata + component reference); this file *is* the entire "reusable pipeline"
3. `src/components/armory/*.tsx` — the apps themselves, moved not rewritten, own CSS/state untouched
4. `src/lib/types.ts` + `ToolsLive.tsx` + `AdminApp.tsx` — small additive `Tool.kind: "external" | "internal"` field, one new admin select field, one conditional in the Launch-button href/target logic

### Critical Pitfalls

1. **Tailwind's global preflight silently restyles Nocturne site-wide** — avoid by importing Tailwind's granular `theme`/`utilities` entry points (no `preflight`) from a stylesheet imported ONLY by `BurningBanners.tsx`, never from `Layout.astro`/`nocturne.css`/`site.css`. Verify by diffing `dist/index.html`/`dist/games.html`/`dist/tools.html` `<link>`/`<script>` tags before/after.
2. **`localStorage` read during initial render breaks `astro build` outright** — a hard build failure (`ReferenceError: localStorage is not defined`), not a runtime warning. Fix: initialize state with static defaults only, move all `localStorage.getItem`/`setItem` calls inside `useEffect`. Establish this pattern once on Fate of the Fellowship (simpler app), reuse unchanged for Burning Banners. Verification: `npm run build` (not just `astro dev`) must pass — `astro dev` can mask this class of error entirely.
3. **Unscoped CSS-in-JS `<style>` block leaks into the shared Layout** — `fotf-companion.tsx`'s `const CSS` string uses bare selectors (`button`, `.pad`) that, injected into the shared `<body>` alongside Nav/Footer, apply document-wide. Fix: prefix every selector under a unique wrapper class (`.fotf-companion-root button`) — a mechanical find-replace, not a logic rewrite. Includes one already-identified latent bug: an unscoped `.body{...}` rule around line ~243 of the fotf CSS that must be nested under `.ff` before wiring the component in.
4. **lucide-react barrel imports / stale peer-dep range** — always import icons by name (`import { Sword } from "lucide-react"`), never `import * as Icons`; verified `1.32.0`'s peer range explicitly covers React 19, no `ERESOLVE` expected at that version.
5. **Tools data-model change breaking existing live tool cards** — the `Tool.kind` field must be additive/optional so `charlie-mike-toc` and "docking soon" placeholder docs (with no `kind` field) continue rendering exactly as before. Verify via admin UI/emulator, not just the two new entries.

## Implications for Roadmap

Based on combined research, the dependency-ordered build sequence should be:

### Phase 1: Tool data model + admin/catalog wiring
**Rationale:** Everything downstream (admin form, `ToolsLive` rendering) depends on `Tool.kind` existing; this is a pure additive, backward-compatible change that can land and deploy standalone with zero visible behavior change, and can be verified end-to-end against a manually-created `kind: "internal"` Firestore doc even before any armory page exists.
**Delivers:** `Tool.kind?: "external" | "internal"` in `src/lib/types.ts`; `ToolsLive.tsx` branches href/target on `kind`; `AdminApp.tsx` gets one new `select` field (`TOOL_KIND_OPTS`), `newItem` default updated.
**Addresses:** Table-stakes "editable Armory Tool" + differentiator "small structured Tool extension."
**Avoids:** Pitfall 7 (data-model regression on existing live tools) — grep every `Tool` read/write site first; verify old docs render unchanged.

### Phase 2: Fate of the Fellowship (reference clean case)
**Rationale:** React-only, self-contained CSS, zero new dependencies — the lowest-risk app, chosen deliberately to prove out the routing/hydration/SSR-boundary patterns before the harder Tailwind case. This is also where the reusable pipeline gets its first draft, extracted from what was actually built (not designed abstractly beforehand).
**Delivers:** `src/components/armory/FateOfTheFellowship.tsx` (moved, `.body` CSS scoping bug fixed, all selectors prefixed under a wrapper class), `src/lib/armoryApps.ts` (first entry), `src/pages/armory/[slug].astro` (the dynamic route + `getStaticPaths()`), `astro.config.mjs` `react({ include })` glob widened to `**/armory/**`.
**Addresses:** Per-app crawlable route, OG/meta, localStorage persistence + reset, mobile-responsive verification.
**Avoids:** Pitfall 2 (SSR/localStorage build break — establish `useEffect`-gated pattern here), Pitfall 2b (`client:only` blanking content — pair with static Astro-rendered title/description outside the island), Pitfall 3 (CSS-in-JS leakage — scope the `const CSS` selectors under a wrapper class here, document the convention for reuse).

### Phase 3: Burning Banners (Tailwind/lucide-react stress test)
**Rationale:** Deliberately sequenced second so the registry/route plumbing from Phase 2 is already validated and only needs additive changes — this phase isolates all remaining risk to the styling path.
**Delivers:** `npm install lucide-react tailwindcss @tailwindcss/vite`; `astro.config.mjs` gets `vite.plugins: [tailwindcss()]`; `src/styles/armory-tailwind.css` (theme + utilities only, no preflight, `@source` pointed at the one component file); `src/components/armory/BurningBanners.tsx` (moved, imports the scoped stylesheet, localStorage reads moved to `useEffect`); second `armoryApps.ts` entry.
**Uses:** `tailwindcss@4.3.3` / `@tailwindcss/vite@4.3.3` / `lucide-react@1.32.0` per STACK.md; skip-preflight CSS-first pattern per ARCHITECTURE.md Pattern 3.
**Implements:** Pattern 3 (scoped, non-global Tailwind for one heavyweight island).
**Avoids:** Pitfall 1 (global preflight leakage — the milestone's single biggest risk), Pitfall 4 (lucide-react bundle bloat/peer mismatch), Pitfall 5 (marketing-page bundle regression — diff `dist/*.html` before/after).

### Phase 4: Publish + pipeline documentation + deploy
**Rationale:** Both apps' routes and registry entries must exist before the Firestore tool docs can be flipped to `status: live` / `kind: internal`; the reusable pipeline should be written down last, once it reflects lessons from both the easy and the hard app, not just the first.
**Delivers:** Create/edit two `tools` Firestore docs (owner via `/admin`) with `slug` matching the registry exactly, `status: "live"`, `kind: "internal"`; documented app-hosting pipeline (route/naming convention, registration steps, metadata requirements); full verification pass (`npm run build`, `npm run test:rules`, sitemap check, marketing-page bundle diff); `npm run deploy`.
**Addresses:** The milestone's explicit "documented, reusable pipeline" deliverable; PROJECT.md's crawlability/share-optimization goals via sitemap + OG verification.
**Avoids:** Pitfall 6 (SEO regression — missing per-page OG/title, or sitemap surprises), Pitfall 8 (Free-Spark/static-build traps — `npm run build` as the cross-cutting acceptance gate on every phase, not just this one).

### Phase Ordering Rationale

- Data-model-first ordering lets admin/catalog wiring be verified independently of any app existing yet (a `kind: internal` doc just 404s harmlessly until routes exist).
- Fate of the Fellowship before Burning Banners is a deliberate risk-ordering choice from both FEATURES.md and ARCHITECTURE.md: prove the routing/hydration/SEO pattern on the app with zero new dependencies, then apply it to the app carrying the milestone's actual technical risk (Tailwind scoping).
- The reusable pipeline is documentation extracted after both apps ship (per FEATURES.md's explicit "Feature Dependencies" note), not a separate system built first — this avoids over-engineering a plugin/registry architecture nobody has validated yet.
- `npm run build` (not `astro dev`) as a gate on every phase is the cheapest, single most effective defense against Pitfall 2 and Pitfall 8 — both are silent in dev mode and only surface at the actual static prerender step.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Burning Banners):** Tailwind v4 preflight-scoping is well-documented but genuinely novel to this codebase (zero prior Tailwind usage) — worth a `--research-phase` pass to nail the exact `@import`/`@source` syntax and confirm the skip-preflight approach fully resolves before falling back to `tailwindcss-scoped-preflight`.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Purely additive TypeScript/Firestore field change following an existing, already-established `Manager<T>`/`FieldDef` CRUD pattern in this codebase.
- **Phase 2:** `client:only="react"` for a no-SSR-value component already has a direct precedent in this repo (`AdminApp.tsx`); the `getStaticPaths()` registry pattern is standard Astro.
- **Phase 4:** Deploy pipeline is unchanged from v1.0 (`npm run build` → `npm run deploy`); no new infrastructure.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified live against the npm registry same-day; Tailwind v4/Astro integration cross-checked against Astro's and Tailwind's own docs. |
| Features | MEDIUM | General web/PWA/localStorage/Astro-islands practice is well-established; direct precedent for "solo tabletop studio hosts in-site companion tools" is thin/inferred from adjacent patterns (native companion apps, game-dev tool hubs). |
| Architecture | HIGH | Grounded directly in this repo's actual source files (`astro.config.mjs`, `Layout.astro`, `types.ts`, `ToolsLive.tsx`, `AdminApp.tsx`, both `apps/*.tsx`); framework-mechanics claims (hydration semantics, Tailwind scoping) cross-checked as MEDIUM within an overall HIGH-confidence file. |
| Pitfalls | MEDIUM | Codebase facts read directly (HIGH); external technical claims (Tailwind preflight behavior, lucide-react peer-dep history, SSR/localStorage boundary) verified via npm registry + cross-checked web search (MEDIUM); a few third-party-plugin claims flagged LOW inline. |

**Overall confidence:** HIGH

### Gaps to Address

- **Exact app slugs are not yet finalized as product decisions** — STACK/ARCHITECTURE research used `fate-of-the-fellowship` and `burning-banners` as working defaults (matching the apps' names), but the owner should confirm these are the actual desired public URL slugs before Phase 1/2 lock them into the `Tool.slug`/registry contract (renaming later means a breaking URL change).
- **Internal-link tab behavior (same-tab vs. new-tab) is an open product question**, not yet decided by research — PITFALLS.md flags the current `ToolsLive.tsx` unconditionally uses `target="_blank"`, which is semantically wrong for an internal route. Recommendation carried into requirements: internal/`kind: "internal"` links should open same-tab (no `target="_blank"`), since these are in-site routes with a clear nav-back path via the shared Nocturne shell — reserve `target="_blank"` for `external` tools only. This should be confirmed with the owner, not silently assumed.
- **Whether QA surfaces a real "unstyled native button chrome" gap on Burning Banners** cannot be known until the live route exists — STACK.md's fallback (`tailwindcss-scoped-preflight` or a few hand-written `.bb-app button {...}` overrides) is documented but should only be reached for if Phase 3's visual QA actually finds a gap, not installed preemptively.
- **Whether any currently-published Tool docs in Firestore lack the new `kind` field in a way that surfaces unexpected UI** should be spot-checked against the live/emulator data in Phase 1, since Firestore's schemaless nature means this is a real (if low) regression risk, not just a type-level concern.

## Sources

### Primary (HIGH confidence)
- npm registry (`registry.npmjs.org`), direct queries 2026-08-18 — `lucide-react@1.32.0`, `tailwindcss@4.3.3`, `@tailwindcss/vite@4.3.3`, `@astrojs/tailwind@6.0.2`, `tailwindcss-scoped-preflight@4.0.6`.
- Direct repository source reads: `astro.config.mjs`, `firebase.json`, `firestore.rules`, `src/layouts/Layout.astro`, `src/lib/types.ts`, `src/components/live/ToolsLive.tsx`, `src/components/admin/AdminApp.tsx`, `src/components/admin/Manager.tsx`, `apps/fotf-companion.tsx`, `apps/bb-companion.tsx`, `.planning/PROJECT.md`, `.claude/CLAUDE.md`.
- Astro Docs — Tailwind integration guide, Tailwind CSS — Astro framework guide, Tailwind CSS — Functions and directives, Detecting classes in source files.

### Secondary (MEDIUM confidence)
- Astro Docs — Islands architecture and third-party explainers (OpenReplay, SoftwareMill) on islands/hydration semantics.
- Web search on Astro `client:only` vs `client:load` SEO/hydration-mismatch behavior (community explainers, GitHub issue discussions).
- lucide-icons/lucide GitHub issues on historical React 19 peer-dependency gaps.
- React/localStorage persistence pattern articles (Felix Gerschau, UXPin) and PWA/service-worker tradeoff articles (DEV Community, Educative).
- Board-game companion-app roundups (AppleInsider, BoardGameGeek geeklist) — used only for the thin feature-landscape comparison.

### Tertiary (LOW confidence)
- tailwindcss-scoped-preflight (npm) — third-party fallback plugin, documented but not recommended by default.
- Auth redirect-vs-embedded UX articles (Okta, Auth0) — used only for a loose "consistent chrome signals trust" inference, not authoritative for this domain.
- Game-dev tool hub aggregator sites / studio website templates — weak, indirect precedent only.

---
*Research completed: 2026-08-18*
*Ready for roadmap: yes*
