# Phase 11: Go-Live & Pipeline Docs - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning
**Mode:** Auto-generated (discuss skipped via workflow.skip_discuss)

<domain>
## Phase Boundary

Make both companion apps discoverable Armory tools, write down the reusable drop-in pipeline, verify the milestone adds zero regression to the static free-Spark site, and prepare a deploy-ready go-live handoff. Requirements: APP-01, APP-05, APP-06.

</domain>

<decisions>
## Implementation Decisions

### Pre-decided (treat as FIXED)
- **Armory tool records (APP-01):** add the two companion apps to the CANONICAL seed catalog `src/data/catalog/tools.ts` as `status:"live"`, `kind:"internal"`, with `slug` EXACTLY matching the registry / route slug (`fate-of-the-fellowship`, `burning-banners`). Order them among the live tools (after `charlie-mike-toc`, before the "docking soon" placeholders). Because `kind:"internal"` + Phase-8 wiring, The Armory renders their "Launch" as a same-tab `/armory/<slug>` link. This makes them appear on the built site via the seed fallback and becomes the seed the owner loads into production Firestore.
- **Reusable pipeline guide (APP-05):** write a concise guide at `docs/adding-a-companion-app.md` documenting the drop-in steps: (1) add the app component under `src/components/armory/`; (2) if the app needs deps/Tailwind, follow the Burning Banners scoped skip-preflight pattern; (3) migrate any `window.storage` shim to real `localStorage`; (4) register ONE entry in `src/lib/armoryApps.ts`; (5) add ONE static import + ONE `DISPATCHED_SLUGS` entry + ONE `client:only` dispatch line in `src/pages/armory/[slug].astro` (the build-time parity guard enforces this); (6) add ONE `tools.ts` record (`kind:"internal"`, matching slug); (7) `npm run build`. Reference the FOTF (clean) and BB (deps/Tailwind) examples.
- **CLAUDE.md exception note:** update `.claude/CLAUDE.md`'s stack/"What NOT to Use" area to document that Tailwind v4 is an INTENTIONAL, isolated exception — scoped to the Burning Banners armory route only, preflight never generated, never touching the Nocturne stylesheet — so future contributors don't flag it as a violation. Also note the react `include` glob now covers `**/components/armory/**` (the stale "/admin only" line).
- **Final verification (APP-06):** `npm run build` succeeds; marketing pages (Home/Games/Tools) ship ~0KB app JS (only the shared Layout CSS; no armory/Tailwind/lucide script or link tags); site stays fully static (no `output`/`adapter` in astro.config.mjs); both `/armory/<slug>` routes emit and appear in `dist/sitemap-0.xml`; both apps listed as live tools in the built `/tools` page.
- **DEPLOY IS DEFERRED TO THE OWNER (SC5):** do NOT run `npm run deploy` / push to production darktierstudios.com in this autonomous run — production deploy is an outward-facing, owner-authorized action. Deliver the deploy-READY state and a go-live checklist instead. Likewise, creating the LIVE production Firestore tool docs (SC4) is an owner action (seed via the app's "Load starter catalog"/admin or the seed script) — the code/seed side is done here; document it in the checklist.
- **Compile the deferred owner manual-verification handoff:** consolidate the non-blocking items accumulated this milestone — Phase 8 admin internal-tool browser spot-check; Phase 9 FOTF play-through; Phase 10 BB play-through (incl. a glance at the FOTF armory page re: the shared-template CSS bundling note) — into the go-live checklist / a handoff doc.

### Claude's Discretion
Exact tool `name`/`kicker`/`description` copy, tool ordering specifics, the guide's structure, and where the go-live checklist lives (extend `LAUNCH.md` or a new phase doc) are at Claude's discretion.

</decisions>

<code_context>
## Existing Code Insights

- `src/data/catalog/tools.ts` — seed for the `tools` collection; current orders 0 (charlie-mike-toc, live external), 1 (table-utilities, soon), 2 (gm-tools, soon). `Tool` type now has optional `kind` (Phase 8).
- `src/components/live/ToolsLive.tsx` — renders internal tools' Launch as same-tab `/armory/<slug>` (Phase 8).
- `src/lib/armoryApps.ts` + `src/pages/armory/[slug].astro` — registry + route + `DISPATCHED_SLUGS` build-time parity guard (Phase 9); both apps wired (Phases 9-10).
- `src/lib/catalog.ts` — `getTools()` build-time Firestore read with seed fallback (hybrid live catalog).
- `docs/environment.md` exists; `LAUNCH.md` is the v1.0 go-live checklist. `npm run deploy` = build + `firebase deploy --only hosting` (manual, owner-run). `npm run seed` = seed Firestore.
- `.claude/CLAUDE.md` — stack doc says "no Tailwind project-wide" and react include "scoped to /admin only" (both now stale re: this milestone).

</code_context>

<specifics>
## Specific Ideas

Success criteria (from ROADMAP):
1. Visitor on /tools sees FOTF + Burning Banners as live tools; Launch opens each in-site at /armory/<slug> same-tab.
2. Written guide documents the drop-in pipeline (component + registry entry + tool record; no per-app route hand-authoring).
3. `npm run build` confirms marketing pages ~0KB JS, no new script/style tags, fully static (no output/adapter), free Spark.
4. Both `tools` docs (slug matches registry, status:"live", kind:"internal") round-trip through admin; sitemap includes both /armory routes. [Code/seed done here; live production Firestore docs = owner action.]
5. Deployed via manual `npm run deploy`, apps reachable live on darktierstudios.com. [OWNER ACTION — deferred; deliver deploy-ready state + checklist.]

</specifics>

<deferred>
## Deferred Ideas (owner actions — non-blocking, compiled into the go-live handoff)

- `npm run deploy` to production darktierstudios.com (SC5) — owner runs when ready.
- Create/seed the two live production Firestore tool docs (SC4) — owner via admin "Load starter catalog" / seed script.
- Owner browser play-throughs: FOTF (/armory/fate-of-the-fellowship), Burning Banners (/armory/burning-banners incl. a glance at the FOTF page re: shared-template CSS), and the Phase-8 admin internal-tool spot-check.
- Per-app OG images (APPOG-01), cross-device sync (APPSYNC-01) — future milestone.

</deferred>
