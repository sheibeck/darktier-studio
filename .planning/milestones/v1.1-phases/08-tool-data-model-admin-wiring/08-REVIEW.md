---
phase: 08-tool-data-model-admin-wiring
reviewed: 2026-08-18T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/lib/types.ts
  - src/components/live/ToolsLive.tsx
  - src/components/admin/AdminApp.tsx
findings:
  critical: 0
  warning: 1
  info: 2
  total: 3
status: fixed
fixed_at: 2026-08-18T00:00:00Z
fix_summary:
  fixed:
    - WR-01
    - IN-01
  accepted_deferred:
    - IN-02
---

# Phase 8: Code Review Report

**Reviewed:** 2026-08-18
**Depth:** standard
**Files Reviewed:** 3
**Status:** fixed — WR-01 and IN-01 resolved (commits a3584ac, 4b8d1d6); IN-02 accepted/deferred as out of scope (no blockers, findings were quality/robustness nits)

## Summary

Reviewed the three files changed for Phase 8: the additive `Tool.kind?: "external" | "internal"` type, the `ToolsLive.tsx` Launch-anchor branch, and the `AdminApp.tsx` "Link type" select wiring.

Core correctness holds up under adversarial reading:

- **Strict-equality backward compat is sound.** `isInternal = t.kind === "internal"` (`ToolsLive.tsx:22`) means `undefined`, absent, `"external"`, or any garbage/malformed value all fall through to the external branch — verified against the three kind-absent seed docs in `src/data/catalog/tools.ts`, none of which were touched.
- **Same-tab vs. new-tab is correct and not a tabnabbing regression.** The internal anchor (`ToolsLive.tsx:37`) carries no `target`/`rel` (same-tab, no `window.opener` exposure); the external anchor (`ToolsLive.tsx:41`) keeps `target="_blank" rel="noopener"` exactly as before. These are two genuinely separate `<a>` elements (not a conditional-spread), which is even easier to audit than the plan's suggested `{...(isInternal ? {} : {...})}` pattern.
- **The derived `/armory/${t.slug}` href carries no injection risk.** `t.slug` is owner-only, written through `Manager.tsx`'s `slugify()` (lowercased, `[^\w\s-]` stripped, hyphen-joined) before it ever reaches Firestore; the href is always prefixed `/armory/` (same-origin, never attacker-controllable to a `javascript:`/`data:` scheme), and React escapes the attribute value regardless. No path-traversal or scheme-injection vector.
- **`Manager<Tool>` / `useCollection` need zero changes**, confirmed by tracing `save()`'s `stripUndefined()` (`useCollection.ts:20-22`) and the generic `select` field renderer (`Manager.tsx:148-157`) — both operate on `kind` exactly like any other string-keyed field, with no special-casing required and no accidental `kind: undefined` writes when editing a kind-absent doc without touching the new field (the spread `{...item}` never introduces a `kind` key that isn't already there).
- `firestore.rules` has no per-field schema validation, so the additive field can't be rejected by the rules layer; confirmed by direct read.

Two minor, non-blocking gaps found below — one warning (type-safety looseness that's self-mitigating by design but silently non-functional if triggered), one usability info item. A second info item documents a pre-existing (not introduced by this phase) XSS-adjacent observation on the admin `app` field, included only because the review brief explicitly asked about admin-field injection risk — it predates Phase 8 and is not a regression.

## Warnings

### WR-01: `TOOL_KIND_OPTS` values are not type-linked to `Tool["kind"]` — RESOLVED (commit a3584ac)

**File:** `src/components/admin/AdminApp.tsx:33-36`
**Issue:** `TOOL_KIND_OPTS` is declared as a plain `{ value: string; label: string }[]` (via `FieldDef.options`), with no compile-time relationship to the `Tool["kind"]` union (`"external" | "internal"`) defined in `src/lib/types.ts:48`. The string literal `"internal"` that drives the entire backward-compat branch in `ToolsLive.tsx:22` is duplicated here with nothing to catch a future typo (e.g. `"interal"` or `"Internal"`). Because `isInternal` uses strict `===`, a typo wouldn't crash — but it also wouldn't be caught by `npm run check`. It would silently produce tools where the owner has selected "Internal route" in the CMS, yet the Launch button always falls through to the external branch with an `undefined`/broken `t.app` href and no error surfaced anywhere. This is exactly the kind of drift the strict-equality "linchpin" comment in `ToolsLive.tsx:20-21` is meant to guard against, but the guard only protects the render side, not the two independent literal-string declarations that must stay in sync.
**Fix:** Constrain the options list to the actual union so a typo becomes a type error:
```ts
const TOOL_KIND_OPTS: { value: NonNullable<Tool["kind"]>; label: string }[] = [
  { value: "external", label: "External URL" },
  { value: "internal", label: "Internal route (Armory app)" },
];
```

## Info

### IN-01: Admin tools table has no "Link type" column — RESOLVED (commit 4b8d1d6)

**File:** `src/components/admin/AdminApp.tsx:99-105`
**Issue:** `toolColumns` only renders "Name" and "Status"; there's no at-a-glance indicator of whether a given tool is `internal` or `external`. As the tool count grows past the current three seed entries, the owner has to open each row's Edit modal to check its link type, which works against the point of adding a first-class `kind` field to the CMS.
**Fix:** Add a lightweight column, e.g.:
```tsx
{ header: "Link", width: "90px", render: (t) => <span className="tag tag-neutral">{t.kind === "internal" ? "Internal" : "External"}</span> },
```

### IN-02 (pre-existing, not a Phase 8 regression): `app` field admits arbitrary URI schemes — ACCEPTED / DEFERRED (out of scope)

**Disposition:** Accepted per this phase's threat model (`T-08-04`, ASVS L1, single trusted owner). Predates Phase 8 and is not a regression introduced by it. Not fixed in this pass — left as documented, optional future hardening.

**File:** `src/components/admin/AdminApp.tsx:110` (relabeled this phase; logic unchanged), rendered at `src/components/live/ToolsLive.tsx:41`
**Issue:** Raised only because the review brief explicitly asks about injection risk on "the admin field." The `app` field uses `type: "url"` purely as an input-mode hint (`Manager.tsx:172`) — there's no native `<form>` submission and thus no browser-enforced URL-scheme validation, so a value like `javascript:alert(document.cookie)` can be typed/pasted and saved as-is. It would then render as `href` on a public, unauthenticated-visitor-facing anchor. This is pre-existing behavior (the `app` field and its render path were not changed by this phase beyond a label string), and per this phase's own threat model (`T-08-04`, ASVS L1, single trusted owner) it's accepted risk, not a regression. Flagging only as a documentation note since Phase 8 touches the same field's label and the same anchor's render path.
**Fix (optional, out of this phase's scope):** If ever hardened, validate/allowlist the `http:`/`https:` scheme client-side before `save()`, e.g. `/^https?:\/\//i.test(value)`.

---

_Reviewed: 2026-08-18_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

## Fix Log

- **WR-01** — Fixed. `TOOL_KIND_OPTS` in `src/components/admin/AdminApp.tsx` is now typed `{ value: NonNullable<Tool["kind"]>; label: string }[]`. Commit `a3584ac`.
- **IN-01** — Fixed. Added a "Link" column to `toolColumns` in `src/components/admin/AdminApp.tsx` showing Internal vs External per tool. Commit `4b8d1d6`.
- **IN-02** — Accepted / deferred, out of scope for this fix pass (pre-existing, accepted per phase threat model `T-08-04`, ASVS L1).

_Fixed: 2026-08-18_
_Fixer: Claude (gsd-code-fixer)_
