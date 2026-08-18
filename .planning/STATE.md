---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: In-Site Companion Apps
status: planning
last_updated: "2026-08-18T15:30:00.000Z"
last_activity: 2026-08-18
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-18)

**Core value:** A fast, great-looking, search- and share-optimized public site that becomes the studio's canonical home — so links shared anywhere drive traffic here and every game is discoverable with its cover, blurb, and download/buy link.
**Current focus:** v1.1 In-Site Companion Apps — ROADMAP.md created (Phases 8-11, continuing numbering from v1.0's Phase 7). Ready to plan Phase 8.

## Current Position

Phase: 8 of 11 (Tool Data Model & Admin Wiring) — first phase of v1.1
Plan: — (not yet planned)
Status: Roadmap created; ready for `/gsd-plan-phase 8`
Last activity: 2026-08-18 — v1.1 ROADMAP.md created; REQUIREMENTS.md traceability filled (12/12 mapped)

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: - min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap v1.1]: 4 phases (8-11) derived from 12 v1.1 requirements, sequenced by risk — data model (8) → Fate of the Fellowship reference build (9) → Burning Banners Tailwind stress test (10) → go-live + pipeline docs + deploy (11).
- [Research]: `Tool.kind?: "external"|"internal"` is additive-only; internal `href` is always derived as `/armory/${slug}` from `Tool.slug`, never hand-typed, so the Firestore doc and the `armoryApps.ts` registry can't drift apart.
- [Research]: Burning Banners' Tailwind stylesheet is imported only from its own component (theme + utilities layers, preflight omitted) — never from `Layout.astro`/global CSS — to keep every Nocturne page untouched.

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

Last session: 2026-08-18
Stopped at: v1.1 ROADMAP.md created (Phases 8-11); REQUIREMENTS.md traceability filled
Resume file: None

## Operator Next Steps

- Approve the v1.1 roadmap, then run `/gsd-plan-phase 8` to start planning Phase 8: Tool Data Model & Admin Wiring.
