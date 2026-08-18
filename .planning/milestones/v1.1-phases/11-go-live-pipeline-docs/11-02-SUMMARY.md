---
phase: 11-go-live-pipeline-docs
plan: 02
subsystem: docs
tags: [docs, armory, tailwind, react, go-live, launch-checklist]

# Dependency graph
requires:
  - phase: 09-fate-of-the-fellowship
    provides: FOTF as the clean/zero-dependency worked example
  - phase: 10-burning-banners
    provides: Burning Banners as the deps + scoped-Tailwind worked example
  - phase: 11-go-live-pipeline-docs
    plan: "01"
    provides: both apps seeded live/internal in src/data/catalog/tools.ts
provides:
  - "docs/adding-a-companion-app.md — the reusable APP-05 drop-in pipeline guide"
  - "docs/go-live-v1.1.md — the consolidated v1.1 owner go-live checklist"
  - "Corrected .claude/CLAUDE.md stack notes (Tailwind scoped exception, React include scope)"
affects: [11-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Documented (not new): scoped-Tailwind skip-preflight pattern for future companion apps needing deps/utility CSS"

key-files:
  created:
    - docs/adding-a-companion-app.md
    - docs/go-live-v1.1.md
  modified:
    - .claude/CLAUDE.md
    - LAUNCH.md

key-decisions:
  - "Guide framed around the two existing worked examples (FOTF clean, Burning Banners deps/Tailwind) rather than a generic abstract template, per the plan's explicit worked-example requirement."
  - "CLAUDE.md edits kept surgical (2 table-row edits) rather than restructuring the doc, to avoid unrelated diff noise."
  - "go-live-v1.1.md kept as a new focused doc (not folded into LAUNCH.md directly) with a short pointer appended to LAUNCH.md's end, per Claude's-discretion guidance in 11-CONTEXT.md."

patterns-established: []

requirements-completed: [APP-05]

coverage:
  - id: D1
    description: "docs/adding-a-companion-app.md documents all 7 drop-in steps (component, scoped CSS, scoped Tailwind, localStorage-in-useEffect, registry entry, route dispatch, tool record, build) and cites both FOTF and Burning Banners as worked examples"
    requirement: "APP-05"
    verification:
      - kind: unit
        ref: "bash grep assertions for components/armory, armoryApps, DISPATCHED_SLUGS, tools.ts, npm run build, Fate of the Fellowship/fate-of-the-fellowship, Burning Banners/burning-banners, preflight"
        status: pass
    human_judgment: false
  - id: D2
    description: ".claude/CLAUDE.md documents Tailwind v4 as an intentional scoped exception and no longer claims the React include is /admin-only"
    requirement: "APP-05"
    verification:
      - kind: unit
        ref: "bash grep assertions for intentional/exception/scoped + Burning Banners + components/armory, and absence of the stale 'scoped to /admin only' string"
        status: pass
    human_judgment: false
  - id: D3
    description: "docs/go-live-v1.1.md compiles every deferred owner action (deploy, live-Firestore seed for both slugs, Phase 8/9/10 play-throughs + admin spot-check, post-deploy confirmation); LAUNCH.md links to it"
    requirement: "APP-05"
    verification:
      - kind: unit
        ref: "bash grep assertions for npm run deploy, Firestore, both slugs, play-through/spot-check wording, and the LAUNCH.md pointer"
        status: pass
    human_judgment: false

duration: 18min
completed: 2026-08-18
status: complete
---

# Phase 11 Plan 02: Reusable Pipeline Guide, CLAUDE.md Fixes & Go-Live Checklist Summary

**Wrote the docs/adding-a-companion-app.md drop-in guide (APP-05), corrected two stale CLAUDE.md stack notes (Tailwind scoping, React include scope), and compiled docs/go-live-v1.1.md consolidating every deferred owner go-live action.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-08-18T18:12:00Z
- **Completed:** 2026-08-18T18:30:00Z
- **Tasks:** 3
- **Files modified:** 4 (2 created, 2 edited)

## Accomplishments
- Wrote `docs/adding-a-companion-app.md`: a 7-step guide (component + scoped CSS wrapper, optional scoped-Tailwind skip-preflight stylesheet, localStorage-in-useEffect migration, one `armoryApps.ts` registry entry, one import + `DISPATCHED_SLUGS` entry + dispatch line in `[slug].astro`, one `tools.ts` record with matching slug, `npm run build` as the acceptance gate), grounded in the real Fate of the Fellowship (clean) and Burning Banners (deps/Tailwind) source files rather than invented APIs, plus a summary checklist table.
- Made two targeted edits to `.claude/CLAUDE.md`: (a) appended a "Scoped exception (INTENTIONAL, isolated)" note to the "avoid a CSS framework" row explaining Tailwind v4 is compiled only for the Burning Banners island, preflight never generated, never imported by Layout.astro/nocturne.css/site.css; (b) corrected the `@astrojs/react`/`react` rows, which claimed React was "scoped to `/admin` only," to reflect the include glob also covers `**/live/**` and `**/components/armory/**`, while still noting marketing pages ship ~0KB app JS via code-splitting.
- Created `docs/go-live-v1.1.md` consolidating the deferred owner actions: run `npm run deploy`; seed the two live production Firestore `tools` docs (via admin "Load starter catalog" or `npm run seed`); the Phase 8/9/10 browser play-throughs (FOTF, Burning Banners incl. a glance at the FOTF armory page re: shared-template CSS, admin internal-tool spot-check); and post-deploy live confirmation. Appended a short "## v1.1 companion apps — go-live" pointer section to the end of `LAUNCH.md` without restructuring its existing content.

## Task Commits

1. **Task 1: Write the drop-in pipeline guide (docs/adding-a-companion-app.md)** - `444bd0a` (docs)
2. **Task 2: Correct the two stale stack notes in .claude/CLAUDE.md** - `f5b3b3f` (docs)
3. **Task 3: Compile the v1.1 go-live checklist (docs/go-live-v1.1.md + LAUNCH.md pointer)** - `f30681e` (docs)

**Plan metadata:** (final docs commit, see below)

## Files Created/Modified
- `docs/adding-a-companion-app.md` - New: the 7-step APP-05 drop-in pipeline guide with FOTF/Burning Banners worked examples and a summary checklist table.
- `.claude/CLAUDE.md` - Edited: 2 targeted table-row edits (Tailwind scoped-exception note; React include-scope correction). No other sections touched.
- `docs/go-live-v1.1.md` - New: the v1.1 owner go-live checklist (deploy, Firestore seed, play-throughs, post-deploy confirmation).
- `LAUNCH.md` - Edited: appended a short pointer section at the end linking to `docs/go-live-v1.1.md`; existing content untouched.

## Decisions Made
- Framed the guide around the two real worked examples (FOTF, Burning Banners) rather than an abstract template, matching the plan's explicit citation requirement.
- Kept CLAUDE.md edits surgical (2 rows only) rather than rewriting sections, per the plan's "do not touch unrelated sections" instruction.
- Left the go-live checklist as its own focused doc with a LAUNCH.md pointer (rather than inlining into LAUNCH.md), per Claude's-discretion guidance in 11-CONTEXT.md — keeps LAUNCH.md's existing v1.0 structure intact while giving the v1.1 owner steps their own scannable doc.

## Deviations from Plan

None - plan executed exactly as written. All three tasks' automated verify commands passed on the first attempt after the content was written; no Rule 1-3 auto-fixes were needed.

## Issues Encountered
None.

## Verification Evidence

**Task 1** (`GUIDE_OK`): confirmed presence of `components/armory`, `armoryApps`, `DISPATCHED_SLUGS`, `tools.ts`, `npm run build`, both example names/slugs, and `preflight`.

**Task 2** (`CLAUDEMD_OK`): confirmed presence of intentional/exception/scoped wording + "Burning Banners" + `components/armory`, and confirmed the stale `"scoped to /admin only"` string is gone.

**Task 3** (`CHECKLIST_OK`): confirmed presence of `npm run deploy`, `Firestore`, both slugs, play-through/spot-check wording in `docs/go-live-v1.1.md`, and the `go-live-v1.1.md` pointer string in `LAUNCH.md`.

No source code, `src/data`, or seed data was touched — this plan was strictly docs/config as scoped (`docs/`, `.claude/CLAUDE.md`, `LAUNCH.md`).

## User Setup Required

None for this plan itself. `docs/go-live-v1.1.md` documents the remaining owner actions (deploy, live-Firestore seed, play-throughs, post-deploy confirmation) that were already deferred per 11-CONTEXT.md and are handed off at the 11-03 checkpoint.

## Next Phase Readiness
- APP-05 is complete: the drop-in pipeline is documented, grounded in real code, and cites both worked examples.
- CLAUDE.md no longer misrepresents the Tailwind exception or the React include scope for future contributors.
- The go-live checklist is ready for 11-03 to surface to the owner as the final phase checkpoint.
- No blockers.

---
*Phase: 11-go-live-pipeline-docs*
*Completed: 2026-08-18*

## Self-Check: PASSED
- FOUND: docs/adding-a-companion-app.md
- FOUND: docs/go-live-v1.1.md
- FOUND: .planning/phases/11-go-live-pipeline-docs/11-02-SUMMARY.md
- FOUND: 444bd0a
- FOUND: f5b3b3f
- FOUND: f30681e
