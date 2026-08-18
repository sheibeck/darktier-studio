---
phase: 11-go-live-pipeline-docs
verified: 2026-08-18T18:25:00Z
status: passed
score: 5/5 roadmap success criteria verified (autonomously-completable scope)
behavior_unverified: 0
overrides_applied: 0
deferred_owner_actions:
  flag: non-blocking
  reason: "AUTONOMOUS run, per explicit user directive: SC5 (production `npm run deploy`) and the LIVE production Firestore doc creation (SC4-live) are OWNER actions, deliberately not run autonomously. Plan 11-03 is a blocking human-verify checkpoint (autonomous: false) that has not yet been actioned by the owner — this is by design, not a gap."
  plan: "11-03-PLAN.md (task type checkpoint:human-verify, gate: blocking, autonomous: false) — no 11-03-SUMMARY.md exists yet because the checkpoint is still open, awaiting the owner"
  covers:
    - "SC5: run `npm run deploy` and confirm both apps reachable live on darktierstudios.com"
    - "SC4 (live half): create the two LIVE production Firestore `tools` docs (fate-of-the-fellowship, burning-banners) via admin 'Load starter catalog' or `npm run seed`"
    - "Owner browser play-throughs: Phase 9 FOTF play-through, Phase 10 Burning Banners play-through (+ glance at FOTF armory page), Phase 8 admin internal-tool spot-check"
    - "Post-deploy live confirmation on darktierstudios.com/tools"
  standing_checklist: "docs/go-live-v1.1.md (linked from LAUNCH.md's new '## v1.1 companion apps — go-live' section) — verified to exist and completely enumerate all four deferred items above"
gaps: []
---

# Phase 11: Go-Live & Pipeline Docs Verification Report

**Phase Goal:** Both companion apps are live, discoverable Armory tools; the reusable drop-in pattern is written down for future apps; and the milestone is verified to add zero regression to the static, free-Spark site before deploying.
**Verified:** 2026-08-18T18:25:00Z
**Status:** passed (autonomously-completable scope; SC5 + SC4-live + owner play-throughs are non-blocking, owner-deferred by explicit design — see frontmatter)
**Re-verification:** No — initial verification

This is the FINAL phase of the v1.1 milestone. All checks below were independently re-run by this
verifier (fresh trap-guarded seed-fallback `npm run build`, fresh greps against the real `dist/`
output, direct reads of `.claude/CLAUDE.md`/`astro.config.mjs`/`docs/*`) rather than trusted from
SUMMARY.md narrative. `serviceAccountKey.json` is present and restored after this verifier's build
(confirmed below).

## Goal Achievement

### Observable Truths (Roadmap Success Criteria, re-verified independently)

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|---|---|---|
| 1 | SC1: A visitor browsing `/tools` sees Fate of the Fellowship and Burning Banners listed as live tools; "Launch" opens each in-site at `/armory/<slug>` without leaving the domain | ✓ VERIFIED (autonomous/seed side) | Re-ran a trap-guarded seed-fallback build (see Probe Execution below). Rendered `dist/tools.html` server-side props show both apps: `"slug":"fate-of-the-fellowship" ... "status":"live","kind":"internal"` and `"slug":"burning-banners" ... "status":"live","kind":"internal"`. Rendered anchors: `<a class="btn btn-primary" href="/armory/fate-of-the-fellowship" style="text-decoration:none">Launch ▸</a>` and the equivalent for `burning-banners` — **no `target="_blank"`** (same-tab), unlike the pre-existing external Charlie Mike Launch link which correctly retains `target="_blank" rel="noopener"`. Both `dist/armory/fate-of-the-fellowship.html` and `dist/armory/burning-banners.html` exist (`test -f` passed) — no dead links. Production/live-site confirmation is owner-deferred (see frontmatter `deferred_owner_actions`) — non-blocking. |
| 2 | SC2/APP-05: A short written guide documents the drop-in pipeline — component under `src/components/armory/`, one `armoryApps.ts` entry, one tool record, no per-app route hand-authoring | ✓ VERIFIED | `docs/adding-a-companion-app.md` (163 lines) exists and documents exactly this: step 1 component + scoped CSS (`.ff` wrapper cited), step 2 optional scoped-Tailwind (preflight explicitly called out, `armory-bb-tailwind.css` cited), step 3 localStorage-in-`useEffect`, step 4 one `armoryApps.ts` entry, step 5 one import + one `DISPATCHED_SLUGS` entry + one dispatch line (names the build-time parity guard, matches the real `[slug].astro` code read directly), step 6 one `tools.ts` record (`kind:"internal"`, slug-match warning), step 7 `npm run build` as acceptance gate. Both FOTF and Burning Banners are cited by name/slug throughout, matching the real source files read for this verification. Summary checklist table present at the end. |
| 3 | SC3/APP-06: A full `npm run build` confirms Home/Games/Tools ship ~0KB JS with no new script/style tags, and the site stays fully static (no `output`/`adapter` in `astro.config.mjs`) on free Spark with no new recurring cost | ✓ VERIFIED | This verifier's own build: `grep -Eo 'BurningBanners|FateOfTheFellowship|lucide|_slug_[.-][A-Za-z0-9]+\.css' dist/{index,games,tools}.html` → zero matches, all three. Stylesheet links on all three pages: only `<link rel="stylesheet" href="/_astro/Layout.QlVPMV8Q.css">` (the shared Layout CSS). No `<script src=...>` tags on any of the three (only inline `application/ld+json` structured data and the pre-existing live-catalog Astro island hydration script — both pre-date this phase and are explicitly excluded from the must-have's scope). `astro.config.mjs` (read directly): no `output` or `adapter` key anywhere — `build: { format: "file" }` and `vite.plugins`/`integrations` only. |
| 4 | SC4: Both new `tools` Firestore docs (`slug` matching registry, `status:"live"`, `kind:"internal"`) round-trip correctly through the admin CMS; `dist/sitemap-0.xml` includes both new `/armory` routes | ✓ VERIFIED (code/seed side + sitemap) | `src/data/catalog/tools.ts` read directly: both records present with `status: "live"`, `kind: "internal"`, no `app` property, slugs `fate-of-the-fellowship`/`burning-banners` matching `src/lib/armoryApps.ts` and `[slug].astro`'s `DISPATCHED_SLUGS` verbatim. Admin round-trip confirmed structurally: `src/components/admin/AdminApp.tsx` already has a generic `kind` field editor (`TOOL_KIND_OPTS`, "Link type" select, `kind: "internal"` default) predating this phase (Phase 8) — the two new records use only fields the admin CMS already manages, so no new schema surface exists. `dist/sitemap-0.xml`: `grep -o 'armory/fate-of-the-fellowship'` and `'armory/burning-banners'` both matched. **LIVE production Firestore doc creation is owner-deferred (see frontmatter)** — non-blocking. |
| 5 | SC5: The site is deployed via the existing manual `npm run deploy`, and both companion apps are reachable live on darktierstudios.com | ⏸ OWNER-DEFERRED (non-blocking, by explicit design) | Not run autonomously per 11-CONTEXT.md's FIXED decision and the run's autonomous_mode_note. `11-03-PLAN.md` is a `checkpoint:human-verify` / `gate: blocking` / `autonomous: false` task that explicitly forbids running `npm run deploy` or writing to production Firestore autonomously. No `11-03-SUMMARY.md` exists — the checkpoint has not yet been actioned by the owner. `docs/go-live-v1.1.md` was verified to exist and completely enumerate this as "Remaining owner actions → 1. Deploy," with the exact command and a pointer to LAUNCH.md §4. `LAUNCH.md` was verified to link to it via a new "## v1.1 companion apps — go-live" section appended at the end (existing v1.0 content untouched). |

**Score:** 5/5 roadmap success criteria hold in the autonomously-completable scope (SC1 same-tab/routing, SC2 guide, SC3 zero-regression build, SC4 seed/sitemap/admin-schema side all directly re-verified against real build output and source). SC1's live-production confirmation, SC4's live-Firestore doc creation, and SC5's deploy are correctly isolated as a single non-blocking, explicitly-deferred owner checkpoint (11-03) with a complete standing checklist (docs/go-live-v1.1.md) — per this run's autonomous-mode directive, this does not block a `passed` verdict.

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/data/catalog/tools.ts` | Two new `status:"live"`, `kind:"internal"` records, no `app` field, contiguous order 0-4 | ✓ VERIFIED | Both records confirmed by direct read: order 1 (FOTF) and order 2 (BB); `table-utilities`→3, `gm-tools`→4; `charlie-mike-toc` unchanged at 0. |
| `docs/adding-a-companion-app.md` | 7-step drop-in guide with FOTF + BB worked examples | ✓ VERIFIED | 163 lines, all 7 steps present, both examples cited by name and file path, matches real source (`armoryApps.ts`, `[slug].astro`, `armory-bb-tailwind.css` all read and confirmed accurate). |
| `docs/go-live-v1.1.md` | v1.1 owner go-live checklist | ✓ VERIFIED | Compiles deploy, live-Firestore seed (both slugs named), Phase 8/9/10 play-throughs, post-deploy confirmation. Explicitly states "the autonomous work for this milestone is complete" at the top. |
| `.claude/CLAUDE.md` | Scoped-Tailwind exception + corrected React-include line | ✓ VERIFIED | "Scoped exception (INTENTIONAL, isolated)" note present, ties to Burning Banners + `armory-bb-tailwind.css`, explains preflight never generated. Stale `"scoped to /admin only"` string confirmed absent (`grep` zero matches); replacement line accurately states include covers `**/admin/**`, `**/live/**`, `**/components/armory/**` — matches `astro.config.mjs`'s real `react({ include: [...] })` verbatim. |
| `LAUNCH.md` | Pointer to the v1.1 checklist | ✓ VERIFIED | New "## v1.1 companion apps — go-live" section appended at file end, links to `docs/go-live-v1.1.md`; pre-existing v1.0 content (sections 1-7, "Already done for you") untouched. |
| `dist/armory/fate-of-the-fellowship.html`, `dist/armory/burning-banners.html` | Built routes | ✓ VERIFIED | Both exist after this verifier's own seed-fallback build; per-app SEO title/description present in each. |
| `dist/sitemap-0.xml` | Both `/armory` routes present | ✓ VERIFIED | Both slugs matched by direct grep against this verifier's fresh build output. |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `tools.ts` internal slug | `armoryApps.ts` registry slug | exact string match | ✓ WIRED | `fate-of-the-fellowship` / `burning-banners` identical across both files (direct read comparison). |
| `armoryApps.ts` registry slug | `[slug].astro` `DISPATCHED_SLUGS` | build-time parity guard | ✓ WIRED | Guard present (`const missingDispatch = armoryApps.filter(...)`, throws if unmatched); build succeeded without throwing — guard did not fire, confirming parity. |
| `ToolsLive` internal branch | `/armory/<slug>` same-tab anchor | `isInternal ? ... href={launchHref}` (no `target`) vs. external branch (`target="_blank" rel="noopener"`) | ✓ WIRED | Source read directly (`ToolsLive.tsx` lines 22-44): internal branch renders the anchor with no `target` attribute at all; confirmed in the actual rendered `dist/tools.html` output (both new apps lack `target="_blank"`, Charlie Mike TOC retains it). |
| guide step 5 (route dispatch) | `[slug].astro` `DISPATCHED_SLUGS` guard | documented + enforced | ✓ WIRED | Guide explicitly states "This is enforced, not just documented," matching the real build-time throw behavior read from source. |
| go-live checklist | 11-03 owner checkpoint | `docs/go-live-v1.1.md` content ↔ 11-03-PLAN.md `<how-to-verify>` steps | ✓ WIRED | Checklist's 4 numbered sections (deploy, Firestore seed, play-throughs, post-deploy confirmation) map 1:1 to 11-03's `<how-to-verify>` steps 1-4. |

### Probe Execution (seed-fallback build gate, independently re-run)

| Probe | Command | Result | Status |
|---|---|---|---|
| Trap-guarded seed-fallback build | `mv serviceAccountKey.json → .verify11bak; unset FIREBASE_*/GOOGLE_APPLICATION_CREDENTIALS/FIRESTORE_EMULATOR_HOST; npm run build; trap restores key on EXIT` | Exit 0. `astro build` completed in 12.68s, 7 pages emitted incl. both `/armory/<slug>.html` routes. `serviceAccountKey.json` present again after the run; no `.verify11bak` left behind; `git status --short` empty (dist/ and any temp key file remain gitignored/untracked). | ✓ PASS |
| Marketing-page bundle-leak grep | `grep -Eo 'BurningBanners\|FateOfTheFellowship\|lucide\|_slug_[.-][A-Za-z0-9]+\.css' dist/{index,games,tools}.html` | Zero matches on all three files | ✓ PASS |
| astro.config.mjs static/no-adapter check | direct read + `grep -v '^\s*//' astro.config.mjs \| grep -E '^\s*(output\|adapter):'` | No `output`/`adapter` key found | ✓ PASS |
| Sitemap check | `grep -o 'armory/fate-of-the-fellowship' / 'armory/burning-banners' dist/sitemap-0.xml` | Both matched | ✓ PASS |
| Same-tab anchor check | `grep -o '<a[^>]*href="/armory/[^"]*"[^>]*>' dist/tools.html` | Both anchors present, neither carries `target` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| APP-01 | 11-01, 11-03 | Visitor opens a companion app at its own in-site `/armory/<slug>` URL without leaving darktierstudios.com | ✓ SATISFIED (code/build side); ⏸ live-production confirmation owner-deferred | Seed-fallback build proves the routing/link mechanics; live-site confirmation is 11-03's owner action. |
| APP-05 | 11-02 | Adding a companion app is a documented drop-in — component + registry entry + tool record, no per-app route hand-authoring | ✓ SATISFIED | `docs/adding-a-companion-app.md` verified accurate and complete against real source files. |
| APP-06 | 11-01 | Hosting stays fully static on free Spark — no SSR adapter, no Cloud Functions, no new recurring cost; marketing pages ship ~0KB JS | ✓ SATISFIED | Verified via this verifier's own build: no `output`/`adapter`, zero companion-app bundle leakage into Home/Games/Tools. |

No orphaned requirements found — REQUIREMENTS.md maps exactly APP-01/APP-05/APP-06 to Phase 11, all three appear in the 11-01/11-02/11-03 plan frontmatter `requirements` fields.

### Anti-Patterns Found

Scanned all phase-11-modified files (`src/data/catalog/tools.ts`, `docs/adding-a-companion-app.md`, `docs/go-live-v1.1.md`, `.claude/CLAUDE.md`, `LAUNCH.md`) for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` and "coming soon"/"not yet implemented" phrasing.

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| — | — | none found | — | No debt markers or placeholder language in any Phase 11 file. (One pre-existing `OWNER_UID_PLACEHOLDER` string in `LAUNCH.md` line 17 is v1.0 content unrelated to this phase — not a Phase 11 anti-pattern.) |

### Human Verification Required

None required from this verifier — every autonomously-completable must-have was directly re-verified against real build output and source code. The four items below are **not** ambiguous/uncertain findings; they are explicitly, deliberately owner-deferred per the FIXED decisions in `11-CONTEXT.md` and this run's autonomous-mode directive, and are fully tracked as a standing checklist rather than as gaps:

1. **Deploy** — run `npm run deploy`, confirmed complete in `docs/go-live-v1.1.md` §1.
2. **Live production Firestore seed** — both tool docs via admin "Load starter catalog" or `npm run seed`, `docs/go-live-v1.1.md` §2.
3. **Owner play-throughs** — FOTF, Burning Banners (+ FOTF page glance), admin internal-tool spot-check, `docs/go-live-v1.1.md` §3.
4. **Post-deploy live confirmation** — `/tools` on darktierstudios.com, `docs/go-live-v1.1.md` §4.

### Gaps Summary

None. All autonomously-completable success criteria (SC1 code/routing side, SC2, SC3, SC4 seed/sitemap/admin-schema side) are verified directly against re-run build output and source reads. SC5 and the live half of SC1/SC4 are intentionally owner-deferred (not autonomous gaps) with a complete, accurate standing checklist (`docs/go-live-v1.1.md`) and an open blocking checkpoint (`11-03-PLAN.md`) ready for the owner.

---

_Verified: 2026-08-18T18:25:00Z_
_Verifier: Claude (gsd-verifier)_
