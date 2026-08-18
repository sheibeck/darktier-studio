---
phase: 08-tool-data-model-admin-wiring
verified: 2026-08-18T14:20:00Z
status: passed
score: 5/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "In /admin, create a tool with Link type = 'Internal route (Armory app)' and status = Live, reorder it with ↑/↓, toggle Shown, and confirm /tools Launch opens /armory/<slug> in the same tab."
    expected: "Behaves exactly like any external tool for reorder/show-hide; Launch navigates same-tab (route may 404 until Phase 9/10 — expected)."
    why_human: "Exercises live Firestore writes + real browser tab-navigation behavior that static analysis/grep cannot observe. Explicitly marked 'Optional owner spot-check (non-blocking)' in the plan's own <verification> block — not a gating must-have. Flagged here per autonomous end-of-phase human_verify_mode; does not block phase completion."
---

# Phase 8: Tool Data Model & Admin Wiring Verification Report

**Phase Goal:** The Armory's tool data model and admin CMS support in-site (internal-route) apps alongside external links, fully backward-compatible with every existing tool record.
**Verified:** 2026-08-18T14:20:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Owner can choose "Internal route (Armory app)" vs "External URL" per tool in the admin CMS, persisted as optional `Tool.kind` (TOOL-04) | ✓ VERIFIED | `src/components/admin/AdminApp.tsx:33-36` defines `TOOL_KIND_OPTS` (external/internal); `:109` inserts `{ key: "kind", label: "Link type", type: "select", options: TOOL_KIND_OPTS }` into `toolFields` before the `app` field; `:301` `newItem` factory defaults new tools to `kind: "external"`. `src/lib/types.ts:48` declares `kind?: "external" \| "internal"` as an optional field on `Tool`. |
| 2 | A live internal-kind tool's Launch opens `/armory/<slug>` in the SAME tab, no `target=_blank` (TOOL-05) | ✓ VERIFIED | `src/components/live/ToolsLive.tsx:22-23` derives `isInternal = t.kind === "internal"` and `launchHref = isInternal ? \`/armory/${t.slug}\` : (t.app ?? undefined)`; `:36-38` renders the internal branch as a bare `<a href={launchHref}>` with no `target`/`rel` attributes at all. |
| 3 | A live external-kind or kind-absent tool's Launch opens its app URL in a NEW tab exactly as today (TOOL-05) | ✓ VERIFIED | `ToolsLive.tsx:40-43` external branch renders `<a href={launchHref} target="_blank" rel="noopener">`, byte-identical to pre-change behavior. Confirmed via built output: `dist/tools.html` contains `target="_blank"` (count 1) and `rel="noopener"` (count 1) after a fresh `npm run build`. |
| 4 | Existing kind-absent docs (Charlie Mike TOC, two "docking soon" placeholders) render and behave identically (TOOL-03) | ✓ VERIFIED | `src/data/catalog/tools.ts` confirmed unmodified (`git diff --stat` empty vs. current branch history). Strict `===` equality in `ToolsLive.tsx:22` means `undefined`/absent `kind` always falls to the external branch — no throw, no different render path. Build re-run: `dist/tools.html` contains "Charlie Mike" (count 2) with a `target="_blank"` Launch anchor, proving the kind-absent seed renders through the new branch unchanged. |
| 5 | Reorder and show/hide work for an internal-kind tool exactly like any other tool (TOOL-04) | ✓ VERIFIED | `src/components/admin/Manager.tsx` (unmodified) — the reorder buttons (`:220-225`) call `reorder(item.slug, ±1)` and the "Shown" checkbox (`:231-240`) calls `toggle(item.slug, "hidden", …)`; both come from `useCollection<T>(props.name)` and operate purely on `slug`/`order`/`hidden`, with zero references to `kind` anywhere in the file. This is a structural (code-path) guarantee independent of which `kind` value a tool has. Live-browser confirmation is optional/non-blocking per the plan's own `<human-check>` (see Human Verification below). |
| 6 | `npm run build` AND `npm run test:rules` both pass with the schema change in place | ✓ VERIFIED | Both re-run independently by the verifier (not taken from SUMMARY): `npm run build` → static Astro build succeeded, 5 pages built, no adapter/SSR output. `npm run test:rules` → 8/8 tests passed (unauthenticated write denied, non-owner write denied, owner write allowed, public read allowed, hidden-doc reads gated, unknown-collection writes denied). `firestore.rules` confirmed unmodified (`git diff --stat` empty). |

**Score:** 5/5 roadmap success criteria verified (6 supporting truths, all VERIFIED; 0 behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/types.ts` | `Tool.kind?: "external" \| "internal"` optional field | ✓ VERIFIED | Line 48, additive, documented with backward-compat doc comment (lines 42-47) |
| `src/components/live/ToolsLive.tsx` | internal/external Launch branch (derived href, conditional target) | ✓ VERIFIED | Lines 22-23 (derivation), 34-46 (two-branch JSX render) |
| `src/components/admin/AdminApp.tsx` | `TOOL_KIND_OPTS` + "Link type" select + `newItem` kind default | ✓ VERIFIED | Lines 33-36 (options), 109 (field), 301 (default) |

All three artifacts exist, are substantive (real logic, not stubs), and are wired (imported/used by their consuming components — `ToolsLive` is rendered from `src/pages/tools.astro`; `AdminApp`'s `Manager<Tool>` instance at line 291-302 consumes `toolFields`/`newItem`).

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `Tool.slug` | derived `/armory/${slug}` internal href | `ToolsLive.tsx:23` | ✓ WIRED | Href is template-literal derived from `t.slug`, never read from a stored free-text field |
| `t.kind` | branch selection | `ToolsLive.tsx:22` strict `t.kind === "internal"` | ✓ WIRED | Strict equality confirmed by source read; any non-`"internal"` value (undefined, `"external"`, garbage) falls to the external branch |
| Admin "Link type" select | Firestore `tools/{slug}.kind` | `Manager.tsx` generic `save()` → `useCollection` `setDoc` | ✓ WIRED | `renderField` (Manager.tsx:148-157) handles `type: "select"` generically via `setField(f.key, e.target.value)`; no tool-specific logic needed since `kind` is just another field in `toolFields` |
| `firestore.rules` | unchanged | git diff | ✓ CONFIRMED UNCHANGED | `git diff --stat firestore.rules` returns empty; `npm run test:rules` (8/8) re-confirms the owner-UID write gate and `hidden==false` public-read gate still hold with no per-field schema validation added |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Static build succeeds with schema change | `npm run build` (re-run by verifier) | 5 pages built, static output, no adapter | ✓ PASS |
| Kind-absent seed renders through new branch, byte-identical external behavior | `grep -c "Charlie Mike" dist/tools.html` → 2; `grep -c 'target="_blank"' dist/tools.html` → 1; `grep -c 'rel="noopener"' dist/tools.html` → 1 | Matches expected pre-change output | ✓ PASS |
| Firestore rules unit tests pass, rules unchanged | `npm run test:rules` (re-run by verifier) | 8/8 tests pass (owner-write, non-owner-denied, public-read, hidden-doc gating, unknown-collection-denied) | ✓ PASS |
| `Tool.kind === "internal"` and `rel="noopener"` present in source | `grep -c 'kind === "internal"' ToolsLive.tsx` → 1; `grep -c 'rel="noopener"' ToolsLive.tsx` → 1 | Present | ✓ PASS |
| `TOOL_KIND_OPTS` and default `kind: "external"` present in admin source | `grep -c 'TOOL_KIND_OPTS' AdminApp.tsx` → 2 (const definition + field usage); `grep -c 'kind: "external"' AdminApp.tsx` → 1 | Present | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|--------------|--------|----------|
| TOOL-03 | 08-01-PLAN.md | Tools data model supports internal-route launch target, backward-compatible | ✓ SATISFIED | `Tool.kind` optional field + strict `===` branch + unmodified seed fixture + build regression proof |
| TOOL-04 | 08-01-PLAN.md | Owner can add/edit a tool choosing internal vs external target, reorder/show-hide unchanged | ✓ SATISFIED | Admin "Link type" select wired; `Manager.tsx` generic reorder/toggle path confirmed to reference only `slug`/`order`/`hidden` |
| TOOL-05 | 08-01-PLAN.md | Armory lists in-site apps with same-tab Launch; external tools unchanged | ✓ SATISFIED | `ToolsLive.tsx` two-branch conditional confirmed: internal = no target/rel (same tab), external = `target="_blank" rel="noopener"` (new tab, unchanged) |

No orphaned requirements — REQUIREMENTS.md maps only TOOL-03/04/05 to Phase 8, and all three are claimed in the plan's `requirements` frontmatter and satisfied above.

### Anti-Patterns Found

None. Scanned all three modified files (`src/lib/types.ts`, `src/components/live/ToolsLive.tsx`, `src/components/admin/AdminApp.tsx`) for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/stub-language patterns. The only matches were legitimate HTML `placeholder="..."` input attributes (unrelated to the "placeholder implementation" anti-pattern) — not flagged.

### Human Verification Required (Non-Blocking Flag)

This item is explicitly marked "Optional owner spot-check (non-blocking)" in the plan's own `<verification>` section — it is not a gating must-have (reorder/show-hide is verified structurally above as a generic, `kind`-independent code path). Flagged here per autonomous end-of-phase `human_verify_mode` rather than halting the phase:

1. **Live admin/browser confirmation of internal-tool CRUD + navigation**
   - **Test:** In `/admin`, create a tool with Link type = "Internal route (Armory app)" and status = Live, reorder it with ↑/↓, toggle Shown, then on `/tools` confirm Launch opens `/armory/<slug>` in the same tab (the route may 404 until Phase 9/10 — expected and acceptable this phase). Confirm an existing external tool still opens in a new tab.
   - **Expected:** Behaves exactly like any external tool for reorder/show-hide; internal Launch navigates same-tab.
   - **Why human:** Exercises live Firestore writes and real browser tab-navigation semantics that static analysis cannot observe.

### Gaps Summary

No gaps found. All 5 ROADMAP success criteria are structurally verified against the actual codebase (not SUMMARY claims): the `Tool.kind` field is additive and optional; the admin CMS exposes the Link-type select with a safe default; the Armory Launch branch correctly derives same-tab vs. new-tab behavior from strict equality; the kind-absent seed fixture is untouched and its rendered output was independently re-verified through a fresh `npm run build`; reorder/show-hide is structurally generic and `kind`-independent; and both `npm run build` and `npm run test:rules` were re-run by the verifier (not trusted from SUMMARY) and passed (8/8 rules tests, 5/5 pages built). `firestore.rules` and `src/data/catalog/tools.ts` are both confirmed unmodified via `git diff --stat`. The only outstanding item is an explicitly optional, non-blocking live-browser owner spot-check, which does not gate phase completion.

---

_Verified: 2026-08-18T14:20:00Z_
_Verifier: Claude (gsd-verifier)_
