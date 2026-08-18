---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: In-Site Companion Apps
status: planning
last_updated: "2026-08-18T13:15:50.176Z"
last_activity: 2026-08-18
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-18)

**Core value:** A fast, great-looking, search- and share-optimized public site that becomes the studio's canonical home — so links shared anywhere drive traffic here and every game is discoverable with its cover, blurb, and download/buy link.
**Current focus:** v1.0 shipped and live on darktierstudios.com. Awaiting next milestone. One owner step left: add the Cloudflare analytics token (ANALYTICS-01).

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-08-18 — Milestone v1.1 started

## Quick Tasks Completed

| Date | Task | Slug |
|------|------|------|
| 2026-08-17 | Admin edit forms → centered modals (click-outside/Escape/scroll-lock) | admin-edit-modals |
| 2026-08-17 | Confirm step before deleting items in admin | delete-confirm |
| 2026-08-17 | Hide "Load starter catalog" unless catalog is empty | load-starter-visibility |
| 2026-08-18 | Update admin copy for the live catalog (drop "after Publish" messaging) | admin-live-copy |

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

- [Research]: Split-runtime architecture — Astro SSG (build-time Firestore reads via firebase-admin) for all public pages, separate CSR admin app at `/admin` behind Firebase Auth; bridged by a rebuild-on-publish trigger.
- [Research]: Firestore data model is 3 collections (`games`, `tools`, `news`), doc id = slug, `visible`/`order`/`showcase`/`isNew` fields; security rules default-deny writes except one hardcoded owner-UID exception.
- [Roadmap]: 7 phases derived from 40 v1 requirements, following the dependency order: Foundation → Content & Data → Public Pages → SEO & Social → Auth & Admin CMS → Publish Pipeline & Deploy → Launch & Cutover.

### Pending Todos

None yet.

### Blockers/Concerns

- [RESOLVED] Firestore rules: emulator rules-unit tests pass 8/8 (with the real owner UID); rules deployed to production.
- [RESOLVED] Publish wiring: shipped as manual `npm run deploy` (no Cloud Functions, free tier). CI deploy is manual-only (workflow_dispatch), not on push.
- [RESOLVED] Custom domain cutover: darktierstudios.com is live over HTTPS (valid SSL cert, HSTS, http→https redirect verified). "Not Secure" reports after the cutover were stale browser cache, not mixed content — every subresource loads over HTTPS.
- [OPEN — cosmetic] Home hero references `/assets/covers/woe.png` (renamed to `woe.jpg`) → 404 on live; fix on next deploy.
- [OPEN — owner] ANALYTICS-01: add `PUBLIC_CF_ANALYTICS_TOKEN` to activate Cloudflare Web Analytics.
- [Phase 2 — Content & Data]: Archive-reconstructed game synopses and the PDF↔game filename mapping (e.g. `amaranth.pdf` → Amaranthine) still warrant an owner review pass before being presented as fact.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| v2 | RSS-01, GAMED-01, PRESS-01, SEARCH-01, PUB2-01, EMAIL-01 | Deferred to v2 | Requirements definition, 2026-08-17 |

## Session Continuity

Last session: 2026-08-18
Stopped at: v1.0 Public Launch milestone archived; site live on darktierstudios.com
Resume file: None

## Operator Next Steps

- Start the next milestone with /gsd-new-milestone
