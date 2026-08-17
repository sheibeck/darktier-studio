# Stack Research

**Domain:** Static/prerendered marketing site + single-admin Firestore-backed CMS, deployed to Firebase Hosting on a custom domain
**Researched:** 2026-08-17
**Confidence:** HIGH (Firebase/npm versions verified directly against npm registry; architectural pattern choices MEDIUM — synthesized from current docs/community practice, no single authoritative source dictates the exact "auto-rebuild" wiring)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Astro** | 7.2.2 | Static site generator / build tool for all public pages | Ships **zero JS by default** and outputs plain, fully-formed HTML per route — exactly what "prerendered multipage HTML that reuses a plain `styles.css`" needs. No virtual DOM, no hydration tax for pages that are just content (Home, Vault, Armory). It is the current (2026) default choice for content-first sites specifically because of this HTML-first model. It reads a global CSS file with zero opinion (`import "../styles/nocturne.css"` in a shared `Layout.astro`) — nothing rewrites or scopes your classes unless you opt into `<style>` blocks, so the approved Nocturne `styles.css` can be dropped in verbatim. Verified current version via npm registry (2026-08-17). |
| **Firebase Hosting** | firebase-tools 15.27.0 (CLI) | Static hosting + CDN + custom domain (darktierstudios.com) | Already the owner's platform (Charlie Mike app); serving Astro's static `dist/` output requires **no extra configuration** — it's a plain static-file host. Firebase App Hosting (the newer SSR-oriented product) is unnecessary here since nothing needs to render per-request. |
| **Firebase JS SDK (modular)** | firebase 12.17.1 | Firestore reads (admin editor + build-time data loader), Auth (Google sign-in), optional Storage | Verified current version directly against the npm registry. Use the **modular v9+ API only** (`import { getFirestore } from "firebase/firestore"`) — it tree-shakes, so the admin bundle only pulls in what it uses. Never use the legacy namespaced/compat `firebase/compat/*` API for new code. |
| **firebase-admin** | 14.2.0 | Server-side Firestore reads during the Astro build (the build-time content loader) and in any Cloud Function used for the publish/rebuild trigger | The client SDK is for browsers; the *build process* (Node, trusted environment) should read Firestore with the Admin SDK, which bypasses security rules and is the correct tool for a trusted build-time script. |
| **Node.js** | 22.x LTS | Runtime for Astro build, Firebase CLI, and any Cloud Functions | Firebase Functions Gen 2 and Astro 7 both target current Node LTS; pin `engines.node` in `package.json` and the Functions runtime to match. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/sitemap` | 3.7.3 | Auto-generates `sitemap.xml` at build time from your routes | Always — one line in `astro.config.mjs`, directly serves the SEO requirement. |
| `@astrojs/check` | 0.9.10 | Type-checking `astro check` CLI | Dev-time only; run in CI before deploy to catch template errors before they ship. |
| `astro-icon` | 1.1.5 | Renders SVG icon sets as inline, zero-JS `<Icon>` components | Use with `@iconify-json/ph` (below) to consume Phosphor icons the Nocturne design already specifies — avoids shipping Phosphor's JS web-component runtime. |
| `@iconify-json/ph` | 1.2.2 | Phosphor icon SVG data for `astro-icon` | Matches the design system's existing icon choice without a JS dependency. |
| `sharp` | 0.35.3 | Image optimization for Astro's built-in `<Image />`/`astro:assets` | Use for game cover PNGs so the Vault/Armory pages ship responsive, compressed images automatically; Astro uses `sharp` as its default image service. |
| `@astrojs/react` | 6.0.2 | React island integration, scoped to `/admin` only | See "Stack Patterns by Variant" below — do **not** apply this globally. |
| `react` / `react-dom` | 19.2.8 | Admin editor UI only | The source Design project's "DC" prototypes are React; reusing React *only* for the authenticated, non-indexed `/admin` route lets you carry over interaction patterns from those prototypes without shipping React (or the DC runtime) to any public/crawled page. |
| `firebase` (client SDK, Firestore/Auth modules) | 12.17.1 | Admin editor CRUD + Google sign-in, loaded only on `/admin` | Public pages never import `firebase/*` client code — they get data from the build-time Firestore fetch (see Q2 pattern below), keeping public-page JS at ~0KB. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Firebase CLI (`firebase-tools`) 15.27.0 | `firebase emulators:start`, `firebase deploy`, `firebase init` | Install as a devDependency (`npm i -D firebase-tools`) rather than only globally, so CI uses the same pinned version as local dev. |
| Firebase Local Emulator Suite | Local Firestore + Auth + Hosting emulation | Requires a local JDK. Run `firebase init emulators` selecting **Firestore, Auth, Hosting**; point the admin editor and the build-time loader at `localhost:8080`/`localhost:9099` via `connectFirestoreEmulator`/`connectAuthEmulator` when `import.meta.env.DEV`. Lets you test security rules and the Google sign-in flow with zero production risk or billing impact. |
| GitHub Actions | CI: type-check, build, deploy on push to `main`; also the "publish" rebuild hook (see Q2) | Use `FirebaseExtended/action-hosting-deploy@v0.11.0` (well past the very stale `@v0` cached in most tutorials — pin the specific tag). |
| npm | Package manager | See rationale below — no reason to add pnpm/yarn/bun overhead for a solo, single-package repo. |

## Installation

```bash
# Core
npm create astro@latest darktier-studio -- --template minimal --no-install
cd darktier-studio
npm install astro@7.2.2 firebase@12.17.1

# Supporting (public build)
npm install @astrojs/sitemap@3.7.3 astro-icon@1.1.5 @iconify-json/ph@1.2.2 sharp@0.35.3

# Admin-only island
npm install @astrojs/react@6.0.2 react@19.2.8 react-dom@19.2.8

# Build-time Firestore loader / Cloud Functions
npm install firebase-admin@14.2.0

# Dev dependencies
npm install -D firebase-tools@15.27.0 @astrojs/check@0.9.10 typescript
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Astro (SSG, static output) | Plain hand-written multipage HTML, zero build | Only if the catalog were truly hardcoded and never changed. It fails the moment Firestore-driven content and a shared Nocturne layout/partial (nav, footer, OG meta) need to be reused across pages without copy-pasting — Astro's component/layout model buys you DRY templating for the cost of `npm run build`, which is trivial for a solo dev already comfortable with `npm` from the Charlie Mike app. |
| Astro (SSG, static output) | Client-rendered SPA (React + Vite) with a prerender step (e.g. `vite-plugin-prerender`, Puppeteer-based prerendering) | Never for this project. Prerender-bolted-onto-SPA approaches are fragile (headless-browser build steps, JS-dependent hydration mismatches, larger bundles) and solve a problem Astro solves natively. The source "DC" React prototypes are explicitly *not* to ship — an SPA approach re-introduces exactly the runtime the project constraints say to remove. |
| Astro (SSG, static output) | Next.js / SvelteKit with SSG export | Valid alternatives with similar zero-JS-by-default potential (Next `output: 'export'`), but both carry more framework surface area (routing conventions, RSC concepts in Next's case) than a mostly-static marketing site needs. Astro is the narrower, purpose-built tool for this job. |
| Firebase Hosting serving static Astro `dist/` | Firebase App Hosting / Cloud Functions SSR (`@astrojs/node` adapter) | Only if a page genuinely needs per-request personalization or real-time data newer than "last rebuild." Nothing in this project's requirements needs that — Firebase App Hosting's Astro support is also still an experimental, best-effort community adapter, not a GA Google product, which is the wrong foundation for a solo maintainer's only production site. |
| Explicit "Publish" rebuild hook (GitHub Actions `repository_dispatch`) | Cloud Function `onWrite` trigger firing a rebuild on every single Firestore write | Fine as a variant, but auto-triggering on every keystroke-adjacent write (e.g. a debounced autosave) risks rebuild storms/cost while the admin is mid-edit. An explicit "Publish" action in the admin UI gives the single admin an obvious, debounced, intentional moment to go live — closer to how they'd expect a CMS to behave. |
| Plausible Analytics (hosted) | Cloudflare Web Analytics | If the ongoing ~$9/mo Plausible cost is unwanted, Cloudflare Web Analytics is free, cookieless, and adequate for basic pageview/referrer counts — but its reporting is thinner (weaker campaign/referrer-source breakdown), which matters here because "measure Facebook→site migration" is a named success metric that leans on referrer data. |
| npm | pnpm | If this becomes a multi-package/monorepo project (e.g. sharing code with the Charlie Mike app) or CI minutes/disk become a real cost, pnpm's content-addressable store pays off. For one solo-maintained single-package repo, that benefit doesn't materialize and adds a small tooling-consistency cost across the owner's projects. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| The prototype's "DC" client React runtime + `support.js` + localStorage data modules | Explicitly out of scope per project constraints; it's a design-prototyping format, not SEO-crawlable, and has no real datastore | Astro static templates for public pages; a small React island (or plain vanilla JS/TS) for `/admin` backed by real Firestore |
| Firebase namespaced/compat SDK (`firebase/compat/*`, or `firebase@8` patterns) | Deprecated API shape, no tree-shaking, larger bundles, and Google's own docs push all new code to the modular API | Modular v9+ imports (`firebase/app`, `firebase/firestore`, `firebase/auth`) on `firebase@12.17.1` |
| Client-side-only Firestore fetch on public pages with no prerendering (a plain React/Vue SPA calling `getDocs()` in the browser and rendering into an empty `<div id="root">`) | Most crawlers execute JS today, but link-preview/OG scrapers (Facebook, Slack, Discord, iMessage, X) generally do **not** — they read static `<meta>` tags from the initial HTML response. An empty-shell SPA produces broken/generic share previews, which directly undermines the "good-looking shared links" goal that is the whole reason for this migration off Facebook | Build-time Firestore fetch baked into static HTML (see Q2 pattern) so every page's `<title>`, description, and OG/Twitter tags are present in the raw HTML Firebase Hosting serves |
| Google Analytics 4 as the primary/only analytics | Sets cookies and typically requires a consent banner in the EU; an independent comparison study found GA4 captured only ~55% of real traffic on a comparable site due to consent declines — bad fit for a small studio site whose owner wants a simple, honest traffic signal without a cookie-consent UI cluttering the approved Nocturne design | Plausible (primary) or Cloudflare Web Analytics (free fallback) |
| A general-purpose CSS framework (Tailwind, Bootstrap) or CSS-in-JS layered on top of Nocturne | The design is already approved as a single hand-authored `styles.css` of CSS custom properties + component classes; layering a utility framework on top invites token/spec drift and fights the "reuse verbatim" constraint | Import `styles.css` as-is as a global stylesheet in Astro's base layout; add page-specific `<style>` blocks (scoped, Astro-native) only for truly one-off layout needs, using existing CSS variables |
| Self-hosted Plausible / Umami (running your own analytics server) | Adds a second service for a solo maintainer to patch, monitor, and pay hosting for — not worth it below meaningful traffic volume | Plausible Cloud (hosted) — the $9/mo tier is cheap relative to the ops burden it removes |
| `pnpm`/`yarn`/`bun` chosen "because it's 2026" | Switching package managers has near-zero performance benefit at this project's size and adds a small but real consistency cost against the owner's other npm-based Firebase project | Plain `npm` |

## Stack Patterns by Variant

**Resolving the "SEO-static vs. live-Firestore-editing" tension (this is the central architectural decision for this stack):**

The project wants both (a) fully static, crawlable HTML for SEO/OG, and (b) admin edits that go live "without redeploys." A pure build-time-only SSG and a pure client-fetch SPA each satisfy only one side. The 2026 standard resolution — the same pattern JAMstack CMSs (Netlify/Vercel "build hooks") use — is:

1. **Public pages (`/`, `/vault`, `/armory`) are 100% static Astro output**, generated by a **custom build-time content loader** (Astro content-collections loader, or a simple top-level `await` in each page/layout) that calls **`firebase-admin`** to pull `games`, `tools`, and `news` collections from Firestore during `astro build`. This produces plain HTML with real `<title>`/OG/Twitter tags per game/tool — fully crawlable, zero client JS needed to see content.
2. **The admin editor (`/admin`) is a small authenticated React island** (`@astrojs/react`, `client:only="react"`) that talks to Firestore live via the **client-side modular SDK** — full CRUD, reordering, show/hide, exactly like the "DC" prototype's interactions, just against real Firestore instead of localStorage.
3. **"Live without redeploy" is delivered as a one-click "Publish" action**, not literal real-time propagation to public pages: after saving changes, the admin clicks Publish, which calls a small Cloud Function (or directly hits the GitHub API) to fire a `repository_dispatch` event that runs the existing GitHub Actions build+deploy workflow. Public HTML is regenerated and live within roughly a minute — no manual `firebase deploy` from a terminal, no waiting for a scheduled rebuild. This is the right trade for a solo admin who edits in occasional sessions (not a live blog needing instant propagation), and it keeps every public page 100% static for SEO.

*(Confidence: MEDIUM — this is a synthesized best-practice pattern rather than a single documented Firebase/Astro tutorial; flag the exact Cloud Function↔GitHub Actions wiring for phase-specific research when the admin/publish phase is planned.)*

**If future requirements demand true real-time public content** (e.g., a live event ticker) — add a narrowly-scoped Cloud Functions/Cloud Run SSR route via a Firebase Hosting rewrite for *just* that one dynamic fragment, while everything else stays static. Do not convert the whole site to SSR for one dynamic widget.

**If PDF/cover assets ever need to be uploaded from the admin UI** (not just the current one-time migration from the archived site) — add **Firebase Storage** with security rules restricted to the admin UID for writes and public read, and reference download URLs from Firestore docs. For v1, since all PDFs/covers are a known, one-time migrated set, it is simpler to commit them into the Astro `public/` directory and let Firebase Hosting serve them directly as static files — no Storage bucket, no extra security rules to write, one less service to reason about. *(Confidence: MEDIUM — a project-specific judgment call given the "single admin, low-volume, static assets" framing, not a universal rule.)*

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `astro@7.2.2` | `@astrojs/react@6.0.2`, `react@19.2.8` | Astro 7's integration API targets React 19; do not pin an older React 18 alongside Astro 7 — the integration expects React 19's root APIs. |
| `firebase@12.17.1` (client) | `firebase-admin@14.2.0` (server/build) | These are separate packages with independent version lines by design (client vs. Admin SDK) — do not try to align their version numbers; just keep both current. |
| `firebase-tools@15.27.0` | `firebase@12.17.1` | Current CLI major (15.x) targets current SDK majors; if you ever pin an older `firebase-tools`, check its emulator support matches your SDK's Firestore/Auth features before assuming emulator parity. |
| `astro-icon@1.1.5` | `@iconify-json/ph@1.2.2` | `astro-icon` consumes any `@iconify-json/*` icon-set package; Phosphor's is the one matching the Nocturne design's stated icon choice. |
| Node 22.x LTS | `astro@7.2.2`, `firebase-tools@15.27.0`, Cloud Functions Gen 2 | Keep local dev, CI, and the Cloud Functions runtime on the same Node major to avoid subtle build/runtime discrepancies. |

## Sources

- npm registry (`registry.npmjs.org`), queried directly 2026-08-17 — `astro@7.2.2`, `firebase@12.17.1`, `firebase-tools@15.27.0`, `astro-icon@1.1.5`, `@iconify-json/ph@1.2.2`, `sharp@0.35.3`, `firebase-admin@14.2.0`, `@astrojs/react@6.0.2`, `react@19.2.8`, `@astrojs/sitemap@3.7.3` (published ~3 months prior), `@astrojs/check@0.9.10`. Confidence: HIGH (primary source, direct registry lookup).
- [Astro Blog — "What's new in Astro" (June 2026)](https://astro.build/blog/whats-new-june-2026/) and 2026 static-site-generator roundups (naturaily.com, talos.tools, thesoftwarescout.com) — Astro's zero-JS/islands positioning and 2026 market-default status. Confidence: MEDIUM.
- [Astro Docs — Deploy to Firebase](https://docs.astro.build/en/guides/deploy/firebase/) and [firebase-tools/src/frameworks/docs/astro.md](https://github.com/firebase/firebase-tools/blob/main/src/frameworks/docs/astro.md) — static Astro needs no extra Firebase Hosting config; SSR needs `@astrojs/node`; Firebase App Hosting's Astro adapter is an experimental community project. Confidence: MEDIUM.
- [Firebase — Upgrade to the modular JS SDK](https://firebase.google.com/docs/web/modular-upgrade), [Firebase JS SDK release notes](https://firebase.google.com/support/release-notes/js) — modular v9+ API recommendation over namespaced/compat. Confidence: MEDIUM–HIGH (official Google docs, confirmed via search snippet rather than direct fetch).
- [Firebase — Authenticate using Google with JavaScript](https://firebase.google.com/docs/auth/web/google-signin), [Best practices for signInWithRedirect](https://firebase.google.com/docs/auth/web/redirect-best-practices) — popup vs redirect trade-offs for Google sign-in. Confidence: MEDIUM.
- [Firebase Local Emulator Suite docs](https://firebase.google.com/docs/emulator-suite), [Connect to Auth emulator](https://firebase.google.com/docs/emulator-suite/connect_auth) — emulator setup for Firestore/Auth/Hosting. Confidence: MEDIUM.
- [Astro Docs — Content collections](https://docs.astro.build/en/guides/content-collections/), [Astro — Live Content Collections deep dive](https://astro.build/blog/live-content-collections-deep-dive/) — custom build-time loaders for remote/DB data, and the build-time-vs-live-collection split in current Astro. Confidence: MEDIUM.
- [Plausible — Privacy-focused web analytics](https://plausible.io/privacy-focused-web-analytics), [Humblytics — Cookie-Free Website Analytics 2026](https://humblytics.com/blog/website-analytics-without-cookies-complete-guide-for-2025) — GA4 vs. cookieless analytics comparison, including the ~55% GA4 undercount data point. Confidence: MEDIUM (secondary aggregator sources; directionally consistent across multiple independent write-ups).
- [FirebaseExtended/action-hosting-deploy](https://github.com/FirebaseExtended/action-hosting-deploy) — GitHub Actions Firebase Hosting deploy action, current tag `v0.11.0`. Confidence: MEDIUM.
- General 2026 package-manager comparison roundups (reintech.io, nareshit.com, hirenodejs.com) — npm vs. pnpm trade-offs at small-project scale. Confidence: LOW–MEDIUM (opinion/aggregator content; used only for a low-stakes tooling call, cross-checked across multiple sources).

---
*Stack research for: Firebase-hosted static marketing site + single-admin Firestore CMS (Darktier Studios)*
*Researched: 2026-08-17*
