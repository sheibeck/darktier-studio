# Architecture Research

**Domain:** Firebase-hosted marketing site + single-admin CMS (solo game studio)
**Researched:** 2026-08-17
**Confidence:** MEDIUM-HIGH (Firebase/Astro official docs + cross-checked community patterns; no single authoritative "recipe" source for the exact combination, so the synthesis itself is this project's judgment call, clearly reasoned below)

## The Core Tension, and the Recommendation

The public site must be crawlable (raw HTML with correct `<title>`/OG tags present on first response, no JS execution required) *and* the catalog must be editable live by the admin without a developer redeploying code. A pure client-side SPA that reads Firestore on mount fails the first requirement — most social-card unfurlers (Facebook, Discord, Slack, iMessage) and many crawlers do not execute JavaScript, so they'd see an empty shell. A hand-authored static HTML site fails the second — every catalog edit would require a code change and redeploy.

**Recommendation: build-time Static Site Generation (SSG) that fetches Firestore at build time, plus an automated "rebuild on publish" hook.**

- Use **Astro** as the site generator. It renders to plain HTML/CSS by default (zero client JS unless you opt in), which is exactly what the Nocturne `styles.css` (a plain CSS-variable/class system, no framework runtime) wants, and it fetches data at build time via `firebase-admin` inside `.astro` files/`getStaticPaths()`.
- At build time, `astro build` uses the Firebase Admin SDK (service-account credentials, no security-rules restriction) to pull all `visible: true` docs from `games`, `tools`, `news` and prerenders every page (Home, Vault list + one page per game slug, Armory, Dispatches feed) to static HTML with correct `<title>`, meta description, canonical URL, and Open Graph/Twitter tags baked directly into the response.
- The **admin CMS is not part of this static build.** It lives at `/admin`, is a separate, small client-rendered (CSR) bundle that talks to Firestore live through the client SDK (behind Firebase Auth). SEO doesn't apply there — freshness and interactivity do, so CSR is the right tool for that one surface.
- When the admin publishes a change, a **Firestore `onWrite` Cloud Function** fires a `repository_dispatch` event to GitHub Actions, which reruns `astro build` + `firebase deploy`. Typical rebuild-to-live latency: 1–3 minutes.

This reconciles the conflict by **not solving it in one runtime** — public pages get pure static HTML (perfect crawlability, fastest possible TTFB, no runtime Firestore read cost), and the admin surface gets a normal live CSR app (perfect freshness for the one person who needs it), joined by an automated rebuild pipeline instead of a shared rendering layer.

### Alternatives considered and rejected

| Approach | Staleness | Crawlability | Redeploy cost / complexity | Verdict |
|---|---|---|---|---|
| **SSG + rebuild-on-publish (recommended)** | 1–3 min after publish (bounded, predictable) | Perfect — real HTML, no JS needed | One Cloud Function + one GH Actions job; runs a few times/week, effectively free on Blaze | **Chosen** — best fit for a low-frequency, SEO-critical, single-admin site |
| **Pure client SPA reading Firestore on load** | Zero (live) | Poor — most social unfurlers and many crawlers never execute JS; empty `<head>`/body on first paint | None (no build pipeline) | Rejected — directly fails the hard SEO/OG requirement in PROJECT.md |
| **SPA + dynamic rendering for bots** (Cloud Function detects bot user-agent, serves server-rendered HTML only to bots, SPA to humans) | Zero (live) | Good for bots, but adds a second, divergent rendering path that must be kept in sync; Google has moved away from recommending "dynamic rendering" as a long-term SEO strategy in favor of true SSR/SSG | Requires Blaze plan, a bot-detection library, and ongoing maintenance of two render paths for one page | Rejected — more moving parts than SSG for a worse guarantee, and this project has no traffic scale that needs live-freshness badly enough to justify it |
| **Firebase App Hosting + Next.js SSR/ISR** | Near-zero, with ISR revalidation windows | Perfect (server-rendered per request) | Full SSR runtime billed per request (Blaze required); Next.js is materially heavier than this project needs (13 games, no interactivity on public pages) | Rejected — overkill for a ~15-page static catalog site; SSR compute cost and operational surface aren't justified when content changes a few times a week, not per-request |

**Why not "just" use ISR/ on-demand revalidation instead of a rebuild pipeline?** ISR needs a server runtime (Next.js on App Hosting or similar) running continuously and billed per request; SSG only "runs" at build time. Given this site's traffic and update cadence, paying for standing server compute buys nothing over a build that finishes in ~60–90 seconds and then serves free, CDN-cached static files.

## System Overview

```
┌───────────────────────────────────────────────────────────────────────┐
│                         BUILD TIME (CI, on publish/push)                │
│  ┌────────────┐   Admin SDK    ┌─────────────┐   astro build  ┌──────┐ │
│  │  Firestore  │──── reads ───▶│ Astro build  │────renders────▶│ dist/│ │
│  │ games/tools/ │  (all visible │  process     │   static HTML   │      │ │
│  │    news      │   docs)      │ (.astro pages│                 └──┬───┘ │
│  └────────────┘                │  + layouts)  │                    │     │
└─────────────────────────────────────────────────────────────────────┼────┘
                                                                        │ firebase deploy
┌───────────────────────────────────────────────────────────────────────┼────┐
│                          RUNTIME (Firebase Hosting CDN)                │     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐◀───┘     │
│  │  Home (/)    │  │ Vault (/vault│  │ Armory       │  │ Admin   │           │
│  │  static HTML │  │  /[slug])    │  │ /dispatches  │  │ /admin  │           │
│  │              │  │  static HTML │  │ static HTML  │  │ CSR SPA │           │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────┬────┘           │
│       ▲ crawlers / users (no JS needed to read content)      │ live reads/    │
│                                                                │ writes, auth  │
└────────────────────────────────────────────────────────────────┼─────────────┘
                                                                   ▼
                                                          ┌──────────────────┐
                                                          │ Firestore (prod)  │
                                                          │ + Firebase Auth   │
                                                          │ (Google sign-in)  │
                                                          └────────┬─────────┘
                                                                   │ onWrite trigger
                                                                   ▼
                                                          ┌──────────────────┐
                                                          │ Cloud Function    │
                                                          │ (rebuild relay)   │──▶ GitHub Actions
                                                          └──────────────────┘   repository_dispatch
                                                                                 → rebuild → redeploy
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|-----------------|
| Public site (Home/Vault/Armory/Dispatches) | Crawlable, fast, styled with Nocturne; zero runtime Firestore dependency | Astro pages/layouts, plain HTML+CSS, `styles.css` imported verbatim |
| Build-time data layer | Pull current `visible` catalog content into the static build | `firebase-admin` (service account) invoked from Astro's build/`getStaticPaths` |
| Admin app (`/admin`) | Auth gate + live CRUD editor for games/tools/news | Separate small CSR bundle (own JS entry), Firebase client SDK (Auth + Firestore) |
| Firestore | Source of truth for catalog content | 3 collections: `games`, `tools`, `news` |
| Firebase Auth | Identity for the one admin | Google provider only |
| Security Rules | Enforce public-read-published / owner-only-write | `firestore.rules`, owner UID check |
| Rebuild relay (Cloud Function) | Bridge "content changed" → "site rebuilt" | Firestore `onWrite` trigger → GitHub `repository_dispatch` |
| CI/CD (GitHub Actions) | Build + deploy on both code pushes and content publishes | Two triggers into one build+deploy job |
| Static assets (covers, PDFs, logo) | Downloadable/displayable files | Firebase Hosting (see §4), referenced by path from Firestore fields |

## Recommended Project Structure

```
darktier-studio/
├── src/                          # Astro site source (public, prerendered)
│   ├── pages/
│   │   ├── index.astro           # Home: showcase + latest dispatches
│   │   ├── vault/
│   │   │   ├── index.astro       # Games list ("The Vault")
│   │   │   └── [slug].astro      # One page per game, getStaticPaths() from Firestore
│   │   ├── armory/index.astro    # Tools hub ("The Armory")
│   │   ├── dispatches/index.astro# News feed
│   │   ├── sitemap.xml.ts        # generated from same catalog data
│   │   └── robots.txt.ts
│   ├── layouts/
│   │   └── BaseLayout.astro      # <head>: title/description/OG/Twitter/canonical
│   ├── components/                # .astro components wrapping Nocturne classes
│   ├── lib/
│   │   ├── firestore-admin.ts    # build-time fetch via firebase-admin
│   │   └── seo.ts                # OG/meta/canonical helpers
│   └── styles/
│       └── styles.css            # Nocturne stylesheet, imported verbatim, untouched
├── admin/                         # Separate CSR admin app (own bundle, not prerendered)
│   ├── src/                      # auth gate, CRUD forms, reorder/show-hide UI
│   └── (bundler config, output copied into dist/admin/ pre-deploy)
├── functions/                     # Cloud Functions (2nd gen)
│   └── src/
│       └── rebuild-on-publish.ts # Firestore onWrite → GitHub repository_dispatch
├── scripts/
│   └── seed-firestore.ts         # idempotent: seeds games/tools/news from archived content
├── public/                        # static, unprocessed passthrough assets
│   ├── assets/covers/*.png       # 12 game covers, migrated from archived site
│   ├── assets/pdfs/*.pdf         # rulebooks + character sheets
│   ├── logo.png
│   └── favicon.ico
├── dist/                          # build output (Astro default) — Hosting "public" dir
├── firebase.json                  # Hosting rewrites/headers, Firestore, Functions, emulators
├── firestore.rules
├── firestore.indexes.json
├── .firebaserc
├── .github/workflows/
│   ├── deploy.yml                 # build+deploy on push to main
│   └── rebuild-on-publish.yml     # repository_dispatch-triggered rebuild+deploy
└── package.json
```

### Structure Rationale

- **`src/` vs `admin/` are separate build targets.** Public pages must ship zero unnecessary JS (SEO + speed); the admin app is JS-heavy by nature (forms, auth, live Firestore listeners) and never needs to be crawlable. Keeping them as separate bundles that both land under one `dist/` (`dist/` for public, `dist/admin/` for the SPA shell) means one Firebase Hosting deploy serves both, but neither build pollutes the other's output.
- **`functions/` is intentionally small** (one rebuild-relay function, not a general API layer) — everything else the public site needs is resolved at build time, so there's no ongoing per-request Cloud Functions cost.
- **`scripts/seed-firestore.ts` is reusable** for both the initial content migration (archived site → Firestore) and Emulator Suite local dev seeding — same script, different `FIRESTORE_EMULATOR_HOST` target.
- **`public/assets/`** holds the 12 covers + ~12 PDFs directly in the repo (see §4) rather than in Cloud Storage, since these are small, static, version-controlled, and rarely change.

## Firestore Data Model

Three top-level collections, one per content type, all following the same shape family (visibility, ordering, slugs):

### `games/{slug}` (document ID = slug, e.g. `charlie-mike`)

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Duplicated as a field for query convenience (e.g. sitemap generation); must match doc ID |
| `title` | string | |
| `type` | string enum | `"ttrpg"` \| `"boardgame"` |
| `status` | string enum | `"in-development"` \| `"live"` \| `"archived"` — drives publication-status badge |
| `synopsis` | string | Short blurb for list/card view |
| `description` | string (markdown or plain) | Longer copy for detail page, optional |
| `coverImage` | string (path) | e.g. `/assets/covers/charlie-mike_cover.png` |
| `links` | map | `{ gameCrafter: url\|null, appUrl: url\|null, rulebookPdf: url\|null, characterSheetPdf: url\|null }` |
| `isNew` | boolean | Admin-controlled "NEW" flag (explicit toggle, not auto-computed — gives the admin control over how long something reads as new) |
| `showcase` | boolean | Featured on Home (e.g. Charlie Mike) |
| `order` | number | Manual sort position within the Vault (drag-reorder writes new integers) |
| `visible` | boolean | Public build only includes `visible == true` docs |
| `publishedAt` | timestamp \| null | Set when first made visible; used for "recently added" logic if ever needed |
| `createdAt` / `updatedAt` | server timestamp | Audit trail |

### `tools/{slug}`

Same family: `slug`, `title`, `description`, `status` (`"live"` \| `"docking-soon"`), `appUrl`, `icon` (optional), `order`, `visible`, `showcase`, `createdAt`/`updatedAt`.

### `news/{id}` (auto-ID or slug)

`title`, `body` (markdown), `relatedGameSlug` (optional, links a dispatch to a game), `publishedAt` (timestamp — primary sort key, newest first), `pinned` (boolean, optional override to keep an item at top), `visible`, `createdAt`/`updatedAt`.

### Ordering

- **Vault/Armory:** explicit `order` integer, admin-controlled via drag-reorder (batched multi-doc write on drop).
- **Dispatches:** sorted by `publishedAt desc`; no manual `order` needed since news is inherently chronological. `pinned` is an escape hatch, not the default mechanism.

### Visibility

- `visible: boolean` is the single gate. Public build query: `where('visible', '==', true)`. The admin app queries without that filter (reading everything, draft included) since its Firestore reads run through the client SDK as the authenticated owner, whose rules-granted read scope is unrestricted (see §3).
- No separate "draft" collection — one field, one source of truth, simplest mental model for a single editor.

### Admin edit → data mapping

| Admin action | Firestore effect |
|---|---|
| Create game/tool/dispatch | New doc, `visible: false` by default (draft), `createdAt` set |
| Edit fields | Field-level update, `updatedAt` refreshed |
| Reorder (drag list) | Batched write updating `order` on all affected docs in one transaction |
| Show/Hide toggle | Single-field update: `visible` flips; if flipping to `true` for the first time, also set `publishedAt: serverTimestamp()` |
| **Publish** (explicit action, distinct from a raw save) | Same as show/hide-to-visible, and is the event the rebuild relay listens for |

## Auth + Security Rules (single admin)

**Pattern: public read of published docs, write restricted to one hardcoded owner UID.** For a single admin that will not change, a hardcoded UID check in rules is simpler and just as secure as custom claims, and requires zero extra provisioning step (no Admin SDK script to set a custom claim). Document the tradeoff: if a second admin/collaborator is ever added, migrate to Firebase custom claims (`request.auth.token.admin == true`) set via a one-time Admin SDK call — do not scale the hardcoded-UID pattern past one user.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isOwner() {
      return request.auth != null
        && request.auth.uid == "OWNER_UID_HERE"; // Sterling's Google UID
    }

    match /games/{gameId} {
      allow read: if resource.data.visible == true || isOwner();
      allow write: if isOwner();
    }
    match /tools/{toolId} {
      allow read: if resource.data.visible == true || isOwner();
      allow write: if isOwner();
    }
    match /news/{newsId} {
      allow read: if resource.data.visible == true || isOwner();
      allow write: if isOwner();
    }
  }
}
```

Notes:
- This is safe for `list` (collection) queries too: Firestore evaluates the rule per returned document, so a public query `where('visible','==',true)` only ever returns docs that individually satisfy `resource.data.visible == true`, and the admin's unfiltered query is separately authorized because `isOwner()` short-circuits true for every doc.
- Auth itself has no "allowed users" restriction beyond the rules — anyone can Google sign-in to the app, but only the owner's UID can write anything, and the admin UI's own gate (`if currentUser.uid !== OWNER_UID → show "not authorized"`) is a UX nicety, not the security boundary. The rules are the actual enforcement; never rely on the client-side check alone.
- Keep `OWNER_UID_HERE` as a literal in `firestore.rules` (not an env var — rules don't support them) and note it in a comment for future reference.

**Where the admin app lives:** same Firebase project, same Hosting deploy, path-based (`/admin`) — not a separate subdomain or separate Firebase project. Reasoning: one admin, one project, no need for the operational overhead of a second Hosting target/domain; a Hosting rewrite (`"source": "/admin/**", "destination": "/admin/index.html"`) serves the SPA shell for all `/admin/*` client-routed paths while every other path is served by the prerendered static files. If isolation is ever needed later (e.g., a separate custom domain for admin), Firebase Hosting supports multiple deploy targets within one project without restructuring the data model or rules.

## Static Asset Strategy (covers, PDFs, logo)

**Recommendation: Firebase Hosting, not Cloud Storage**, for all 12 covers + ~12 PDFs + logo + favicon.

Why Hosting over Storage here:
- Volume is small and fixed (~25 files total, static, checked into the repo from the archived-site migration) — no ongoing upload workflow to support.
- Assets are meant to be fully public and permanent (rulebooks are download-and-share by design) — Storage would require public bucket rules for zero benefit over Hosting's built-in CDN.
- Hosting serves everything from the same CDN/domain as the HTML (`darktierstudios.com/assets/...`), avoiding CORS and a second origin to manage.
- No signed URLs, no per-file access control needed — Storage's actual differentiators don't apply to this content.

Storage would be the right call if assets were user-uploaded, access-controlled per file, or large/high-volume enough to want separate lifecycle/versioning — none of which is true here.

**Paths (referenced by Firestore fields, physically stored in `public/assets/`):**
- `/assets/covers/<slug>_cover.png`
- `/assets/pdfs/<slug>.pdf` (rulebook) and `/assets/pdfs/<slug>-char.pdf` (character sheet, where applicable)
- `/logo.png`, `/favicon.ico`

**Caching headers (`firebase.json` → `hosting.headers`):**

```json
{
  "hosting": {
    "public": "dist",
    "headers": [
      {
        "source": "**/*.@(pdf)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=604800" }]
      },
      {
        "source": "**/*.@(png|jpg|jpeg|webp|ico)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=604800" }]
      },
      {
        "source": "**/*.html",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=300, must-revalidate" }]
      }
    ]
  }
}
```

- Images/PDFs: 1 week (`604800s`) — they change rarely (only on re-upload/asset replacement), and Firebase Hosting deploys are versioned so a redeploy still serves the new file immediately at the edge regardless of client cache age for anyone who re-requests it after the deploy.
- HTML: short cache (5 min) rather than Firebase's 1-hour default, since the whole point of the rebuild-on-publish pipeline is that published changes should be visible promptly; a 1-hour default cache would silently undercut that.
- If an asset is ever replaced in place (same filename, new content), bump the filename (e.g. add a version suffix) rather than relying on cache invalidation — simplest way to guarantee correctness with a 1-week cache.

## Repo/Project Structure, Local Dev, Deploy — Summary

(Full tree in "Recommended Project Structure" above.)

**Local dev:** Firebase **Emulator Suite** (Firestore + Auth + Hosting emulators) via `firebase emulators:start`. Astro dev server (`astro dev`) and the admin app both point their SDK initialization at `FIRESTORE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST` when `NODE_ENV=development`, so the whole stack — including build-time Firestore fetch — can be exercised locally without touching production data. `scripts/seed-firestore.ts` seeds the emulator (and, once, production) with the migrated archived-site content.

**Deploy/CI flow (two triggers into one job):**
1. **Code push to `main`:** GitHub Actions installs deps → `astro build` (fetches current *production* Firestore via Admin SDK service-account secret) → builds the admin bundle → `firebase deploy --only hosting,firestore:rules,functions`.
2. **Content publish:** Admin publishes in `/admin` → Firestore write → `onWrite` Cloud Function fires → calls GitHub's `repository_dispatch` API (PAT held in Secret Manager/Functions config, never client-side) → same build+deploy job reruns via the `repository_dispatch`-triggered workflow → live in ~1–3 minutes.

**Simpler fallback (if avoiding Blaze/Cloud Functions for launch):** a GitHub Actions `schedule:` cron (e.g. every 15–30 min) rerunning the same build+deploy job with no Cloud Function involved at all. Zero extra Firebase billing surface, bounded staleness of up to 30 minutes. Given the owner already runs a Blaze-tier Firebase project for the Charlie Mike app, and this project's Cloud Function usage is a handful of invocations per week (well within Blaze's free tier), the Cloud Function relay is the recommended default — but the cron fallback is a legitimate, even simpler, Phase-1 substitute if minimizing new infrastructure at launch matters more than sub-3-minute publish latency.

## Suggested Build Order

Ordered by dependency, not by calendar phases — informs how ROADMAP.md phases should sequence:

1. **Repo + Firebase project scaffold.** `firebase.json`, `.firebaserc`, Hosting target, Emulator Suite config, a bare-minimum GitHub Actions `deploy.yml` that builds and deploys on push (even before there's real content) — this baseline CI is what step 9 later extends, so standing it up first avoids retrofitting.
2. **Nocturne design system integration.** Port `styles.css` verbatim, build `BaseLayout.astro` and shared components, verify visual parity with the approved designs using dummy/placeholder content. No Firestore dependency yet.
3. **Firestore data model + seed script** (`games`/`tools`/`news`, `scripts/seed-firestore.ts`, migrated content from the archived site). Can run in parallel with step 2; must land before step 4.
4. **Public static pages fetching real seeded Firestore data at build time** (Home, Vault list + `[slug]` detail, Armory, Dispatches) — depends on 2 and 3.
5. **Static assets wiring** (covers/PDFs/logo into `public/assets/`, Firestore fields pointing at correct paths, `firebase.json` caching headers) — depends on 3 and 4 (need real slugs/fields to wire links against).
6. **SEO/OG layer**: per-page title/description, canonical URLs, Open Graph + Twitter cards, `sitemap.xml`, `robots.txt`, favicon — depends on 4 (needs real routes/slugs to generate correct per-page metadata).
7. **Firebase Auth (Google sign-in) + security rules** (owner-UID pattern) — can start in parallel with 4–6; must be in place before step 8.
8. **Admin SPA** (`/admin`: create/edit/reorder/show-hide for games/tools/news) — depends on 3 (data model) and 7 (auth/rules).
9. **Rebuild-on-publish automation** (Cloud Function relay + `repository_dispatch` workflow, or the cron fallback) — depends on 8 existing (needs a real publish action to trigger against) and the baseline CI from step 1.
10. **Privacy-friendly analytics** — independent once the layout exists (step 2); low risk, safe to slot in anytime, commonly done late as polish.
11. **Custom domain (darktierstudios.com) DNS cutover** — last, after everything above is verified on the default `*.web.app` URL; DNS propagation and SSL provisioning take time and you want the full stack validated before pointing the real domain at it.

**Research flags for phase planning:** step 9 (rebuild automation) and step 7/3 combined (security rules correctness, especially the public-list-query behavior) are the two areas most likely to need deeper phase-specific research or careful UAT — everything else in this stack (Astro static builds, Firebase Hosting headers, Emulator Suite) is well-trodden, low-risk territory.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Reading Firestore client-side on public pages "for freshness"
**What people do:** Ship the public Vault/Armory pages as client components that call Firestore on mount, reasoning that it keeps content perfectly live.
**Why it's wrong:** Directly breaks the SEO/OG requirement — most link-unfurlers and many crawlers never execute JS, so shared links show an empty preview, and this is the single most important requirement in PROJECT.md.
**Instead:** Build-time fetch + rebuild-on-publish (see recommendation above). If sub-minute freshness is ever truly needed, reach for real SSR (Firebase App Hosting/Next.js), not a client-side patch on top of static pages.

### Anti-Pattern 2: One Firestore ruleset that treats admin and public reads identically
**What people do:** `allow read: if true;` on every collection because "it's just a catalog, why lock down reads."
**Why it's wrong:** Draft/unpublished content (`visible: false`) becomes readable by anyone who queries Firestore directly (trivial via browser devtools), defeating the purpose of a draft state and potentially leaking unannounced content.
**Instead:** Gate read on `resource.data.visible == true || isOwner()` per collection, as shown in §3.

### Anti-Pattern 3: Storing binary assets (PDFs/covers) *inside* Firestore documents or as base64 fields
**What people do:** Convenience shortcut — put a base64-encoded PDF or image directly on the doc to avoid a separate asset pipeline.
**Why it's wrong:** Firestore has a 1 MiB document size limit, bloats reads/writes, defeats CDN caching, and makes the admin UI slow to load/save.
**Instead:** Store only a path/URL string on the Firestore doc; keep the actual file in `public/assets/` served by Firebase Hosting (§4).

## Sources

- [Firebase Hosting: Deploy your Astro Site](https://docs.astro.build/en/guides/deploy/firebase/) — Astro prerenders to static files by default; deploys to Hosting with no config changes (MEDIUM confidence, official Astro docs, cross-checked)
- [Firebase & Astro backend guide](https://docs.astro.build/en/guides/backend/firebase/) — using `firebase-admin` service-account credentials to fetch Firestore data during Astro's build process (MEDIUM confidence, official docs)
- [firebase-tools astro framework docs](https://github.com/firebase/firebase-tools/blob/main/src/frameworks/docs/astro.md) — Firebase CLI's native Astro integration (MEDIUM confidence, official repo)
- [Firebase Hosting: Manage cache behavior](https://firebase.google.com/docs/hosting/manage-cache) — `firebase.json` `headers` glob patterns, Cache-Control semantics, default 1-hour cache (MEDIUM confidence, official docs)
- [Firebase Hosting: Configure Hosting behavior (full config)](https://firebase.google.com/docs/hosting/full-config) — headers array structure (MEDIUM confidence, official docs)
- [Firebase: Extend Cloud Firestore with Cloud Functions](https://firebase.google.com/docs/firestore/extend-with-functions) — `onWrite`/`onCreate`/`onUpdate` triggers (MEDIUM confidence, official docs)
- [Firebase: Cloud Firestore triggers](https://firebase.google.com/docs/functions/firestore-events) — 2nd-gen trigger event types (MEDIUM confidence, official docs)
- [Firebase Security Rules and Firebase Authentication](https://firebase.google.com/docs/rules/rules-and-auth) — `request.auth.uid` patterns for owner-only write (MEDIUM confidence, official docs)
- [Writing conditions for Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions) — per-document rule evaluation for list/query reads (MEDIUM confidence, official docs)
- [Firebase App Hosting overview / Next.js integration](https://firebase.google.com/docs/hosting/frameworks/nextjs) — SSR/ISR option considered and rejected for this project's scale (MEDIUM confidence, official docs; LOW confidence on 2026-specific ISR cache-purge behavior — community threads note it's an evolving area)
- Dynamic Open-Graph-via-Cloud-Function pattern (bot-detection + server-rendered meta tags on a Hosting rewrite) — synthesized from multiple community write-ups (Medium/HackerNoon/GitHub examples); LOW confidence individually, presented here only as a rejected alternative, not a recommendation

---
*Architecture research for: Firebase-hosted marketing site + single-admin CMS*
*Researched: 2026-08-17*
