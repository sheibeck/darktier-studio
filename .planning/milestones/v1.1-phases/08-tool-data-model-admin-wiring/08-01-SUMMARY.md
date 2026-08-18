---
phase: 08-tool-data-model-admin-wiring
plan: 01
subsystem: catalog-data-model
tags: [astro, react, firestore, typescript, armory]

# Dependency graph
requires: []
provides:
  - "Optional Tool.kind?: 'external' | 'internal' field (additive, no migration)"
  - "ToolsLive same-tab-vs-new-tab Launch branch derived from t.kind and t.slug"
  - "Admin 'Link type' select (TOOL_KIND_OPTS) wired into the tools editor"
affects: [09-fotf-armory-app, 10-bb-armory-app, 11-go-live]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Additive optional schema fields with strict === equality checks for backward compat (undefined/absent falls through to legacy behavior)"
    - "Derived-not-stored routing: internal href computed from slug, never persisted as free text"

key-files:
  created: []
  modified:
    - src/lib/types.ts
    - src/components/live/ToolsLive.tsx
    - src/components/admin/AdminApp.tsx

key-decisions:
  - "Implemented the internal/external Launch anchor as two explicit conditional JSX branches (isInternal ? <a external-free> : <a with target/rel>) rather than the plan's suggested attribute-spread pattern, because the spread produces `rel: \"noopener\"` (object literal) not the literal `rel=\"noopener\"` JSX-attribute substring the plan's own verify step greps for. Behavior is identical; this satisfies both the hard constraint (external links byte-identical) and the automated verification."

patterns-established:
  - "Tool.kind strict equality (=== \"internal\") as the backward-compat linchpin for future optional enum fields on shared catalog types"

requirements-completed: [TOOL-03, TOOL-04, TOOL-05]

coverage:
  - id: D1
    description: "Tool.kind?: 'external' | 'internal' added as an optional, additive field to the shared Tool interface; no migration needed"
    requirement: TOOL-03
    verification:
      - kind: unit
        ref: "npm run check (type-check across all Tool consumers: types.ts, catalog.ts, ToolsLive.tsx, AdminApp.tsx) — 351 errors before and after (pre-existing baseline, zero new errors introduced)"
        status: pass
    human_judgment: false
  - id: D2
    description: "ToolsLive Launch branches on strict t.kind === \"internal\": internal tools link to /armory/<slug> same-tab (no target/rel); external or kind-absent tools keep target=\"_blank\" rel=\"noopener\" exactly as before"
    requirement: TOOL-05
    verification:
      - kind: unit
        ref: "grep -c 'kind === \"internal\"' src/components/live/ToolsLive.tsx == 1; grep -c 'rel=\"noopener\"' src/components/live/ToolsLive.tsx == 1"
        status: pass
      - kind: integration
        ref: "dist/tools.html backward-compat grep: Charlie Mike TOC card present (count 2) with target=\"_blank\" external Launch anchor (count 1) after npm run build"
        status: pass
    human_judgment: false
  - id: D3
    description: "Admin tools editor gains a 'Link type' select (External URL / Internal route (Armory app)) that sets kind; new tools default to kind: \"external\"; Manager.tsx reorder/show-hide path untouched"
    requirement: TOOL-04
    verification:
      - kind: unit
        ref: "grep -c 'TOOL_KIND_OPTS' src/components/admin/AdminApp.tsx == 2 (definition + field usage); grep -c 'kind: \"external\"' src/components/admin/AdminApp.tsx == 1"
        status: pass
    human_judgment: true
    rationale: "Interactive owner spot-check of the admin UI (creating an internal tool, reordering it, toggling Shown, confirming same-tab Launch on /tools) is called out as an optional non-blocking human-check in the plan's <verification> section — it exercises live Firestore + browser interaction that automated grep/type-check cannot observe."
  - id: D4
    description: "Full acceptance gate: npm run check, npm run build (static, no adapter), npm run test:rules all pass; firestore.rules and src/data/catalog/tools.ts left untouched"
    requirement: TOOL-05
    verification:
      - kind: integration
        ref: "npm run build — static Astro build succeeded, 5 pages built, no SSR adapter/output introduced"
        status: pass
      - kind: integration
        ref: "npm run test:rules — scripts/rules.test.ts, 8/8 tests pass (unauthenticated write denied, non-owner write denied, owner write allowed, public read of visible doc allowed, hidden-doc reads gated to owner, unknown-collection writes denied)"
        status: pass
      - kind: other
        ref: "git status --short / git diff --stat on firestore.rules and src/data/catalog/tools.ts — no output (files unchanged)"
        status: pass
    human_judgment: false

# Metrics
duration: 6min
completed: 2026-08-18
status: complete
---

# Phase 8 Plan 1: Tool Data Model & Admin Wiring Summary

**Optional `Tool.kind?: "external" | "internal"` field added to the shared catalog type, with a strict-equality same-tab-vs-new-tab Launch branch in ToolsLive and a "Link type" select wired into the admin tools editor — zero regression to existing kind-absent tool docs.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-18T14:07:40Z (approx, first edit)
- **Completed:** 2026-08-18T14:13:40Z
- **Tasks:** 3 (2 code tasks + 1 verification-only acceptance gate)
- **Files modified:** 3

## Accomplishments
- Added `Tool.kind?: "external" | "internal"` as a fully optional, additive field on the shared `Tool` interface (`src/lib/types.ts`), documented with backward-compat semantics in a doc comment.
- `ToolsLive.tsx` now derives `isInternal` via strict `t.kind === "internal"` and a `launchHref` (`/armory/${t.slug}` for internal, `t.app` for external) — internal tools render a same-tab Launch anchor with no `target`/`rel`; external or kind-absent tools keep the exact `target="_blank" rel="noopener"` behavior.
- Admin tools editor (`AdminApp.tsx`) gained a "Link type" select (`TOOL_KIND_OPTS`: External URL / Internal route (Armory app)) positioned before the "App link" field (relabeled "App link (external only)"), and new tools default to `kind: "external"`.
- Full acceptance gate passed: `npm run check` (no new type errors vs. pre-existing 351-error baseline), `npm run build` (static output, no adapter), `npm run test:rules` (8/8 pass), and `dist/tools.html` backward-compat grep (Charlie Mike TOC card + `target="_blank"` external anchor present).
- `firestore.rules` and `src/data/catalog/tools.ts` confirmed untouched via `git status`/`git diff --stat`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add optional Tool.kind and branch the Armory Launch on it** - `1e241f9` (feat)
2. **Task 2: Add the admin "Link type" select to the tools editor** - `a6e04f0` (feat)
3. **Task 3: Backward-compat regression + build/rules acceptance gate** - no source files modified (verification-only task); results folded into this SUMMARY

**Plan metadata:** committed separately after this SUMMARY (see final commit)

## Files Created/Modified
- `src/lib/types.ts` - Added `kind?: "external" | "internal"` optional field to `Tool` interface with backward-compat doc comment
- `src/components/live/ToolsLive.tsx` - Derived `isInternal`/`launchHref`; two-branch conditional Launch anchor (internal: no target/rel, same-tab; external: `target="_blank" rel="noopener"` unchanged)
- `src/components/admin/AdminApp.tsx` - Added `TOOL_KIND_OPTS`, inserted "Link type" `kind` field into `toolFields` before `app`, relabeled `app` field, defaulted new tools to `kind: "external"`

## Decisions Made
- **Two-branch conditional JSX instead of attribute spread for the Launch anchor.** The plan's action text suggested `{...(isInternal ? {} : { target: "_blank", rel: "noopener" })}`, but the plan's own `<verify>` block greps for the literal JSX-attribute substring `rel="noopener"` — which an object-literal spread (`rel: "noopener"` with a colon) does not contain. Implemented instead as two explicit `<a>` branches: the internal branch omits `target`/`rel` entirely; the external branch keeps `target="_blank" rel="noopener"` as literal JSX attributes, byte-identical to the pre-change code. This satisfies the hard constraint ("External links keep their current behavior EXACTLY") and both automated verify greps, with no behavioral difference from the plan's intent. Documented here as a Rule 1-adjacent correctness fix to the plan's own action/verify mismatch — no scope change, no architectural impact.
- No other deviations — `Tool.kind` semantics, derived-href pattern, and admin field wiring implemented exactly as specified in `08-CONTEXT.md`'s pre-decided section.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Launch-anchor implementation approach to satisfy the plan's own verify grep**
- **Found during:** Task 1 (ToolsLive Launch branch)
- **Issue:** The plan's action text describes an attribute-spread pattern (`{...(isInternal ? {} : { target: "_blank", rel: "noopener" })}`) that produces the JS object-literal text `rel: "noopener"`, but the plan's `<verify>` block runs `grep -c 'rel="noopener"'` (JSX-attribute literal form), which would return 0 against a spread implementation — failing the plan's own gate despite correct behavior.
- **Fix:** Implemented as two explicit conditional `<a>` JSX branches (internal: bare anchor with no `target`/`rel`; external: anchor with literal `target="_blank" rel="noopener"` attributes) instead of the spread pattern. Functionally identical output; satisfies both the hard constraint and the automated grep.
- **Files modified:** src/components/live/ToolsLive.tsx
- **Verification:** `grep -c 'rel="noopener"' src/components/live/ToolsLive.tsx` returns 1; `npm run check` shows zero new type errors vs. baseline; `dist/tools.html` after build contains a `target="_blank"` external Launch anchor.
- **Committed in:** `1e241f9` (Task 1 commit)

**2. [Rule 1 - Bug] Fixed `href` type mismatch on the internal/external ternary**
- **Found during:** Task 1 (ToolsLive Launch branch)
- **Issue:** `launchHref = isInternal ? \`/armory/${t.slug}\` : t.app` typed as `string | null | undefined` because `Tool.app` is `string | null | undefined`, which is not assignable to the JSX `href` attribute's `string | undefined` type — `npm run check` flagged a new type error not present in the pre-change baseline.
- **Fix:** Coerced `t.app` with `?? undefined` in the external branch (`t.app ?? undefined`), which the two-branch JSX implementation (fix #1 above) made a non-issue in the final code — the external branch's `<a>` only ever receives `t.app ?? undefined` as `href`, keeping the type sound.
- **Files modified:** src/components/live/ToolsLive.tsx
- **Verification:** `npm run check` returns to the 351-error pre-existing baseline (zero new errors) after the fix.
- **Committed in:** `1e241f9` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1, both resolved within Task 1 before its commit — no separate follow-up commit needed since the plan's own task-level `<verify>` block wasn't satisfied until these fixes landed)
**Impact on plan:** Both fixes are implementation-detail corrections that preserve the plan's stated behavior and hard constraints exactly (external links byte-identical, internal same-tab). No scope creep, no architectural change, no impact on Task 2 or Task 3.

## Issues Encountered
None beyond the two auto-fixed items above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The `Tool.kind` field, derived `/armory/<slug>` href pattern, and admin "Link type" select are in place and backward-compatible — Phases 9 (FOTF Armory app) and 10 (BB Armory app) can now create `kind: "internal"` tool docs whose Launch buttons already route correctly, once the `/armory/<slug>` route itself is built.
- No blockers. The `/armory/<slug>` route does not exist yet (expected, out of scope this phase per `08-CONTEXT.md`) — an internal-kind tool's Launch will 404 until Phase 9/10 land, which is the explicitly accepted state per the plan's success criteria.
- Optional owner spot-check (non-blocking, per plan's `<human-check>`) remains open: creating an internal-kind tool in `/admin`, reordering it, toggling Shown, and confirming same-tab Launch on `/tools` in a live browser session. Automated coverage (type-check, build, rules tests, greps) all pass; this human-check exercises the live Firestore + browser path that automation doesn't reach.

---
*Phase: 08-tool-data-model-admin-wiring*
*Completed: 2026-08-18*

## Self-Check: PASSED
