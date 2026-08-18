# Phase 8: Tool Data Model & Admin Wiring - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning
**Mode:** Auto-generated (discuss skipped via workflow.skip_discuss)

<domain>
## Phase Boundary

The Armory's tool data model and admin CMS support in-site (internal-route) apps alongside external links, fully backward-compatible with every existing tool record.

Requirements: TOOL-03, TOOL-04, TOOL-05.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — discuss phase was skipped per user setting. Use the ROADMAP phase goal, success criteria, codebase conventions, and the committed research (`.planning/research/ARCHITECTURE.md`, `SUMMARY.md`, `PITFALLS.md`) to guide decisions.

### Pre-decided (from milestone scoping + research — treat as fixed)
- Add an OPTIONAL `Tool.kind?: "external" | "internal"` field to `src/lib/types.ts`. Absent = current external behavior (no migration; existing docs untouched).
- For an internal tool, the launch href is DERIVED as `/armory/${slug}` — not stored as free text — so `Tool.slug` and the (future) armory registry slug stay in sync by construction.
- `ToolsLive.tsx` renders an internal tool's "Launch" as a same-tab in-site link (NO `target="_blank"`); external tools keep opening in a new tab exactly as today.
- Admin form (`src/components/admin/*`) gains a link-type choice (Internal route (Armory app) / External URL) that sets `kind`; reorder / show-hide behavior is unchanged for all tools.
- `firestore.rules` needs NO change (no per-field schema validation; public read stays `hidden == false`).
- No code path may assume `kind` is present — guard for `undefined` (Charlie Mike TOC + "docking soon" placeholders predate the field).
- The armory routes themselves do NOT exist yet (Phase 9+). This phase may reference `/armory/<slug>` but must not depend on those pages existing to build/pass.

</decisions>

<code_context>
## Existing Code Insights

- `src/lib/types.ts` — `Tool` interface: `{ slug, name, status:"live"|"soon", hidden?, app?:string (external URL), kicker?, description, order }`.
- `src/data/catalog/tools.ts` — seed for the `tools` collection (Charlie Mike TOC live external; two "soon" placeholders).
- `src/components/live/ToolsLive.tsx` — live Firestore rendering of The Armory; branches on `status` and `app`.
- `src/components/admin/AdminApp.tsx` / `Manager.tsx` / `useCollection.ts` — admin CRUD (modals, reorder, show/hide).
- `src/pages/tools.astro` — static intro + `<ToolsLive>` island.
- `firestore.rules` — public read = `hidden == false`; writes locked to owner UID.
- Rules unit tests: `npm run test:rules` (emulator, `scripts/rules.test.ts`).

Full codebase context will be deepened during plan-phase research.

</code_context>

<specifics>
## Specific Ideas

Success criteria (from ROADMAP):
1. Admin can choose "Internal route (Armory app)" or "External URL" per tool, saved as optional `kind`.
2. `/tools` internal tool shows a "Launch" opening `/armory/<slug>` same-tab; external tools unchanged (new tab).
3. Pre-existing tool docs (no `kind`) render/behave identically.
4. Reorder + show/hide work for internal-kind tools like any other.
5. `npm run build` AND `npm run test:rules` both pass.

</specifics>

<deferred>
## Deferred Ideas

- The actual `/armory/<slug>` route + app hosting → Phase 9 (FOTF) / Phase 10 (BB).
- Creating the two live Firestore tool docs for the apps → Phase 11 (go-live).
- Per-app OG images, cross-device sync → future milestone (out of scope here).

</deferred>
