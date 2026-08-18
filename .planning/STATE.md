---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: In-Site Companion Apps
current_phase: 11
current_phase_name: Go-Live & Pipeline Docs
status: executing
stopped_at: Completed 11-01-PLAN.md
last_updated: "2026-08-18T18:10:04.978Z"
last_activity: 2026-08-18
last_activity_desc: Phase 11 execution started
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 9
  completed_plans: 6
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-18)

**Core value:** A fast, great-looking, search- and share-optimized public site that becomes the studio's canonical home — so links shared anywhere drive traffic here and every game is discoverable with its cover, blurb, and download/buy link.
**Current focus:** Phase 11 — Go-Live & Pipeline Docs

## Current Position

Phase: 11 (Go-Live & Pipeline Docs) — EXECUTING
Plan: 2 of 3
Status: Ready to execute
Last activity: 2026-08-18 — Phase 11 execution started

Progress: [███████░░░] 67%

## Performance Metrics

**Velocity:**

- Total plans completed: 5
- Average duration: - min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 08 | 1 | - | - |
| 09 | 2 | - | - |
| 10 | 2 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 08 P01 | 6min | 3 tasks | 3 files |
| Phase 09 P01 | 15min | 3 tasks | 5 files |
| Phase 10 P01 | 14min | 3 tasks | 8 files |
| Phase 10-burning-banners P02 | 12min | 2 tasks | 0 files |
| Phase 11-go-live-pipeline-docs P01 | 12min | 2 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap v1.1]: 4 phases (8-11) derived from 12 v1.1 requirements, sequenced by risk — data model (8) → Fate of the Fellowship reference build (9) → Burning Banners Tailwind stress test (10) → go-live + pipeline docs + deploy (11).
- [Research]: `Tool.kind?: "external"|"internal"` is additive-only; internal `href` is always derived as `/armory/${slug}` from `Tool.slug`, never hand-typed, so the Firestore doc and the `armoryApps.ts` registry can't drift apart.
- [Research]: Burning Banners' Tailwind stylesheet is imported only from its own component (theme + utilities layers, preflight omitted) — never from `Layout.astro`/global CSS — to keep every Nocturne page untouched.
- [Phase ?]: Two-branch conditional JSX (not attribute-spread) for the Launch anchor keeps literal target=/rel attributes for byte-identical external behavior and satisfies the plan's own grep-based verify step
- [Phase ?]: Component dispatch in [slug].astro uses a direct per-slug conditional (not props-threading or a Record lookup) because Astro's client:only hydration requires a statically-analyzable local import binding in the JSX tag itself
- [Phase ?]: Tailwind v4 skip-preflight (theme+utilities layers only, no bare tailwindcss import) scoped to BurningBanners.tsx via @tailwindcss/vite — preflight never exists in the build, making Nocturne reset-leakage structurally impossible
- [Phase ?]: Retained .bb02-baseline/ tag-capture directory in git as auditable evidence for the BB-02 zero-marketing-regression proof
- [Phase ?]: 10-02: Literal Task-1 verify one-liner has a ';' vs '&&' control-flow defect and a ::backdrop false-positive fingerprint (Tailwind's @property fallback layer, not preflight) — both investigated and confirmed harmless via substantive re-checks; BB-02 holds.
- [Phase ?]: Both new tool records use armoryApps.ts registry metadata for name/kicker/description copy consistency
- [Phase ?]: Both new records use kicker "Companion app" matching charlie-mike-toc's existing live kicker style

### Pending Todos

None yet.

### Blockers/Concerns

- [OPEN — cosmetic, v1.0] Home hero references `/assets/covers/woe.png` (renamed to `woe.jpg`) → 404 on live; fix on next deploy.
- [OPEN — owner, v1.0] ANALYTICS-01: add `PUBLIC_CF_ANALYTICS_TOKEN` to activate Cloudflare Web Analytics.
- [Phase 10 — Burning Banners]: Milestone's primary risk — Tailwind v4's global preflight could leak into Nocturne pages if imported from a shared stylesheet; must diff `dist/*.html` script/link tags and visually check Home/Games/Tools before considering the phase done (PITFALLS.md Pitfall 1).

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| v2 | RSS-01, GAMED-01, PRESS-01, SEARCH-01, PUB2-01, EMAIL-01 | Deferred to v2 | Requirements definition, 2026-08-17 |
| v1.1 future | APPSYNC-01, APPOG-01 | Deferred to v2 | Requirements definition, 2026-08-18 |

## Session Continuity

Last session: 2026-08-18T18:10:04.935Z
Stopped at: Completed 11-01-PLAN.md
Resume file: None

## Operator Next Steps

- Approve the v1.1 roadmap, then run `/gsd-plan-phase 8` to start planning Phase 8: Tool Data Model & Admin Wiring.
