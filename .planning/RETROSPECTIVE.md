# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Public Launch

**Shipped:** 2026-08-17 (custom domain live 2026-08-18)
**Phases:** 7 | **Plans:** executed directly (autonomous) | **Sessions:** 1 (single-day build)

### What Was Built
- A fast, SEO/share-optimized public site (Home, The Vault, The Armory, Dispatches) on Astro 7 SSG + Firebase Hosting, wearing the Nocturne design system ported verbatim.
- An owner-only admin CMS (Google sign-in, single-UID Firestore rules verified 8/8 by emulator tests) with full CRUD, reorder, show/hide, and showcase/NEW flags for games/tools/news.
- A **hybrid live catalog**: pages SSR the catalog at build (SEO/OG intact) and live-refresh from Firestore in the browser — so admin edits reach visitors with no deploy, while drafts stay private.
- Full SEO/social layer (OG/Twitter cards, canonical, sitemap, robots, favicons, share image, JSON-LD), migrated covers + rulebook PDFs, and free (Spark-plan, no Cloud Functions) manual deploy.
- Live on the custom domain darktierstudios.com over HTTPS.

### What Worked
- **Zero-JS-by-default Astro** kept public pages crawlable and shareable — the core goal (traffic/link previews off Facebook) was structurally guaranteed, not bolted on.
- **Scoping React to `/admin` + live-catalog islands only** kept the public bundle tiny while reusing the prototype's React interaction patterns for the editor.
- **Emulator rules-unit tests** caught the public-read/owner-write boundary precisely (8/8) before any production exposure.
- **Deferring verification to the end** (owner's request) let the autonomous build run uninterrupted, then reconcile in one pass.

### What Was Inefficient
- **Two data sources drifted** (build-time seed vs. live Firestore) — admin thumbnails and the Charlie Mike PDF mismatched until the build was pointed at Firestore. A single source of truth from the start would have avoided the rework.
- **Asset renames left a dangling reference** (`woe.png` → `woe.jpg`) that shipped as a live 404 — no build-time check for missing referenced assets.
- **CI auto-deploy on every commit** fought the GSD commit cadence and produced failing runs until switched to manual-only; should have been manual from the first pipeline design given GSD's commit frequency.
- **Requirements traceability wasn't re-checked after execution** — the table still read "Pending" at milestone close despite everything shipping, requiring a reconciliation pass.

### Patterns Established
- **Hybrid SSR + client live-read** as the default for "SEO-critical but owner-editable without deploy" content.
- **Manual-only deploy** (`npm run deploy`; CI is `workflow_dispatch`) as the rule for GSD projects that commit frequently — content stays live via Firestore, code/design ships on intent.
- **Public read rule mirrors the client query** (`hidden == false`) so the visible-list read is provably safe.
- **Post-DNS "Not Secure" triage**: verify with `curl -I` (cert/HSTS/redirect) + in-browser network inspection (all-HTTPS subresources) before assuming a page defect — it's usually stale browser cache, not mixed content.

### Key Lessons
1. Pick one source of truth for content on day one; if build reads a DB, have it read the *same* DB the admin writes.
2. For frequent-commit workflows (GSD), make deploy an explicit action, never a push side-effect.
3. Add a build-time check (or at least a grep) for referenced-but-missing static assets before deploy.
4. Re-check the requirements traceability table at phase/milestone transitions, not just at definition.

### Cost Observations
- Model mix: predominantly Opus (single operator, interactive build).
- Sessions: 1 primary build day + a follow-up for the domain cutover.
- Notable: autonomous multi-phase execution with end-of-run verification was efficient for a solo greenfield site; the main cost was reconciling the two-data-source drift.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 1 | 7 | Autonomous build; switched CI to manual-only deploy; adopted hybrid live catalog |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 8 rules-unit tests (8/8) | Security rules (games/tools/news read+write) | — |

### Top Lessons (Verified Across Milestones)

1. (Pending a second milestone to cross-validate.)
