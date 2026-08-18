# Architecture Research: In-Site Companion Apps as Astro Islands

**Domain:** Integrating prebuilt single-file React apps into an existing Astro 7 SSG + Firebase Hosting site
**Researched:** 2026-08-18
**Confidence:** HIGH (grounded directly in the actual codebase: `astro.config.mjs`, `Layout.astro`, `types.ts`, `ToolsLive.tsx`, `AdminApp.tsx`, `Manager.tsx`, `firestore.rules`, `firebase.json`, and both `apps/*.tsx` source files) with MEDIUM-confidence framework mechanics (Astro `client:only` hydration behavior, Tailwind v4 scoping) cross-checked against current docs/community sources.

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  npm run build  (Astro SSG — unchanged: static output, no SSR)       │
├──────────────────────────────────────────────────────────────────────┤
│  src/pages/armory/[slug].astro   (NEW — one dynamic route)           │
│    ├─ getStaticPaths() → reads src/lib/armoryApps.ts registry        │
│    ├─ generates 2 static HTML files at build time:                   │
│    │     dist/armory/fate-of-the-fellowship.html                     │
│    │     dist/armory/burning-banners.html                            │
│    └─ each wraps <Layout> (per-app title/description/OG) + one       │
│       React island: <Component client:only="react" />                │
├──────────────────────────────────────────────────────────────────────┤
│  src/lib/armoryApps.ts  (NEW — the registry / manifest)              │
│    slug → { title, description, Component }                          │
│    Component imported from src/components/armory/*.tsx (moved from   │
│    apps/*.tsx, unchanged internals)                                   │
├──────────────────────────────────────────────────────────────────────┤
│  src/components/armory/                                               │
│    FateOfTheFellowship.tsx  (moved from apps/fotf-companion.tsx)     │
│    BurningBanners.tsx       (moved from apps/bb-companion.tsx)       │
├──────────────────────────────────────────────────────────────────────┤
│  react({ include: [..., "**/armory/**"] })  ← astro.config.mjs edit  │
├──────────────────────────────────────────────────────────────────────┤
│  Data model: Tool.kind: "external" | "internal" (NEW optional field) │
│    ToolsLive.tsx: internal → href = `/armory/${slug}`, no target=_blank │
│  Admin: AdminApp.tsx toolFields[] gets one new "kind" select field    │
├──────────────────────────────────────────────────────────────────────┤
│  Firebase Hosting: dist/ served as-is, cleanUrls:true (unchanged)    │
│  → /armory/fate-of-the-fellowship, /armory/burning-banners resolve   │
│    cleanly with zero firebase.json changes                            │
└──────────────────────────────────────────────────────────────────────┘
```

Nothing here introduces SSR, a server, or a Cloud Function. The dynamic route (`[slug].astro`) is resolved entirely at `astro build` time via `getStaticPaths()` — it is **not** a runtime dynamic route, it just tells the SSG "generate these N static pages from one template." The output is exactly as static as `tools.astro` → `tools.html` is today. Free Spark plan is unaffected.

### Component Responsibilities

| Component | Responsibility | Notes |
|-----------|----------------|-------|
| `src/pages/armory/[slug].astro` | Per-app page shell: resolves the registry entry for the requested slug, renders `Layout` with that app's title/description/OG, mounts the one matching React island | New file. Only file that needs to know about routing. |
| `src/lib/armoryApps.ts` | Single source of truth: slug → metadata + component reference | New file. This is the entire "reusable pipeline" — adding an app means editing only this file plus dropping the component. |
| `src/components/armory/*.tsx` | The apps themselves — untouched internal logic, own CSS/state | Moved, not rewritten. Each keeps its own default-export function, own styling approach, own `localStorage` key. |
| `src/layouts/Layout.astro` | Site chrome (Nav/Footer), `<head>` meta/OG/canonical/JSON-LD | **Unchanged.** Already accepts `title`/`description`/`image`/`current`/`page`/`hideChrome` — exactly what each armory page needs, no Layout edits required. |
| `src/lib/types.ts` | `Tool` interface | One new optional field: `kind`. |
| `src/components/live/ToolsLive.tsx` | Renders the Armory grid, computes the Launch button `href` and whether it's external/internal | Small conditional added. |
| `src/components/admin/AdminApp.tsx` | Tool CRUD form (`toolFields`) | One new `FieldDef` (a `select`) added to `toolFields`. |

## Recommended Project Structure

```
src/
├── pages/
│   ├── armory/
│   │   └── [slug].astro         # NEW — dynamic route, getStaticPaths() over the registry
│   ├── tools.astro               # unchanged — still the /tools index/grid page
│   └── ...
├── components/
│   ├── armory/                   # NEW folder
│   │   ├── FateOfTheFellowship.tsx   # moved from apps/fotf-companion.tsx, unchanged body
│   │   └── BurningBanners.tsx        # moved from apps/bb-companion.tsx, unchanged body
│   ├── live/                     # unchanged (ToolsLive.tsx gets a small edit, not moved)
│   └── admin/                    # unchanged (AdminApp.tsx gets a small edit)
├── lib/
│   ├── armoryApps.ts             # NEW — the registry/manifest (title/description/Component per slug)
│   └── types.ts                  # Tool.kind field added
├── styles/
│   ├── nocturne.css              # unchanged, still global via Layout
│   ├── site.css                  # unchanged
│   └── armory-tailwind.css       # NEW — scoped Tailwind build, imported ONLY by BurningBanners.tsx
apps/                              # retire as the wiring location; keep only as an optional
                                    # "drop zone" for a new app's raw single-file source before
                                    # it's moved into src/components/armory/ and registered
```

### Structure Rationale

- **`src/components/armory/` (not `apps/` in place):** Astro/Vite only apply the React/JSX transform pipeline to files matched by `@astrojs/react`'s `include` glob, and every other React island in this codebase already lives under `src/components/{admin,live}/`. Keeping `apps/*.tsx` as the *live* import source works technically (Vite's root is the project root, so a sibling `apps/` folder is still servable), but it breaks the one established convention this codebase has (`react({ include: ["**/admin/**", "**/live/**"] })` is a two-item allowlist, not a general "anything under src/") and forces a third, inconsistent import path. Moving the file is a pure copy — no changes to the exported function or its logic.
- **One dynamic route, not two `.astro` files:** The milestone's own stated pipeline goal is "adding an app = drop component + **one registry entry** + one Firestore tool doc" — that is literally describing `getStaticPaths()` fed by a registry array, not N hand-authored page files. A third app in the future costs one new component file + a two-line edit to `armoryApps.ts`; it costs zero new routing files.
- **Registry lives in `src/lib/`, not `src/pages/`:** keeps the manifest importable from both the `.astro` route and (later, if ever needed) `ToolsLive.tsx`/admin, without pages importing pages.
- **`armory-tailwind.css` imported by the component, not by `Layout.astro`:** this is the mechanism that keeps Burning Banners' ~231 Tailwind utility classes from ever reaching the Vault, Home, or Armory-index pages' bundles (see Pattern 3 below).

## Architectural Patterns

### Pattern 1: Registry-driven `getStaticPaths()` route (the reusable pipeline)

**What:** A single `src/pages/armory/[slug].astro` template generates one static HTML file per entry in `src/lib/armoryApps.ts` at build time.

**When to use:** Any time you have a small, hand-curated, code-defined set of "one page per named entity" routes where each entity needs distinct SEO metadata but shares layout/mounting logic. This is the correct pattern here specifically because the entity list changes rarely (a manual `npm run build` + `npm run deploy` event, not live Firestore data) — contrast with `games`/`tools`/`news`, which are Firestore-driven and change without a redeploy.

**Trade-offs:** Adding an app requires a rebuild+redeploy (acceptable — it already requires shipping new code, since the component itself is new). In exchange you get zero routing boilerplate per app and one obvious place (`armoryApps.ts`) to see the full list.

**Example:**
```ts
// src/lib/armoryApps.ts
import type { ComponentType } from "react";
import FateOfTheFellowship from "../components/armory/FateOfTheFellowship";
import BurningBanners from "../components/armory/BurningBanners";

export interface ArmoryApp {
  slug: string;            // MUST match the corresponding Firestore `tools/{slug}` doc
  title: string;           // <title> / og:title
  description: string;     // <meta description> / og:description
  Component: ComponentType;
}

export const armoryApps: ArmoryApp[] = [
  {
    slug: "fate-of-the-fellowship",
    title: "Fate of the Fellowship — Companion",
    description: "Track Hope, cards, and armies for Fate of the Fellowship at the table.",
    Component: FateOfTheFellowship,
  },
  {
    slug: "burning-banners",
    title: "Burning Banners — Table Companion",
    description: "Season tracker, kingdom rules reference, and setup helper for Burning Banners.",
    Component: BurningBanners,
  },
];
```

```astro
---
// src/pages/armory/[slug].astro
import Layout from "../../layouts/Layout.astro";
import { armoryApps } from "../../lib/armoryApps";

export function getStaticPaths() {
  return armoryApps.map((a) => ({ params: { slug: a.slug }, props: a }));
}

const { title, description, Component } = Astro.props;
---
<Layout title={title} description={description} current="/tools">
  <div class="armory-app-shell">
    <p class="kicker" style="padding:24px 24px 0">Darktier Studios · Armory companion</p>
    <Component client:only="react" />
  </div>
</Layout>
```

Passing `Component` (a live function reference) through `getStaticPaths()`'s `props` works because Astro's SSG render loop runs entirely in one Node process at build time — `Astro.props` there are plain in-memory JS values, not JSON-serialized across a network/process boundary (unlike, e.g., Astro DB/content-layer remote loaders, which do impose serializability constraints). If this ever causes friction, the safe fallback is a `Record<string, ComponentType>` lookup keyed by `Astro.params.slug` inside the same file instead of threading the component through props — still a one-file, one-entry edit.

### Pattern 2: `client:only="react"` for stateful, localStorage-only islands

**What:** Mount each companion app with `client:only="react"` rather than `client:load` or `client:visible`.

**When to use:** Whenever a component's *entire* meaningful output depends on browser-only state (here: `localStorage.getItem(STORE_KEY)` inside `FateOfTheFellowship`/`App`) and there is no server-computable "initial" render worth shipping.

**Why this one, concretely, for this codebase:**
- **This is already the established pattern here.** `AdminApp.tsx` — the one other component in this repo with no server-derivable state — is already mounted with `client:only="react"` in `admin.astro`. `ToolsLive`/`VaultLive`/etc. use `client:load` specifically *because* they're seeded with a real build-time value (`initial={tools}` from a build-time Firestore read). The companion apps have no such seed — they read `localStorage` on mount, so they belong in the same bucket as `AdminApp`, not `ToolsLive`.
- **`client:load` would either mismatch or waste the SSR pass.** With `client:load`, Astro renders the component to HTML on the server first, then hydrates in the browser. If the component's initial React state differs from what a fresh client eventually computes from `localStorage` (e.g., a returning player's saved Hope/round state), React 19 will detect a hydration mismatch between server-rendered markup and the post-mount DOM. Even in the *best* case (no saved data yet, so server and first-load client state happen to match), the SSR pass produces work and markup with zero SEO value, since none of it is meaningfully different from a blank shell — pure waste.
- **`client:visible` is the wrong axis of optimization here.** It defers hydration until the island scrolls into the viewport — useful for a *secondary*, below-the-fold widget on a content-heavy page. Each companion app *is* the entire point of its own page and is above the fold on load; deferring hydration would only delay first interactivity for a visitor who came specifically to use the tool, for no SEO or performance benefit.
- **SEO cost of `client:only`, concretely:** Astro emits a `<astro-island>` custom element with **no light-DOM content** for `client:only` — a crawler or link-preview scraper that doesn't execute JS sees an empty node where the app will be. Everything else on the page is unaffected: `Layout.astro`'s `<head>` (title, `<meta description>`, canonical, OG/Twitter tags, Organization/WebSite JSON-LD) is always static/SSR'd regardless of the island's directive, and the shared `Nav`/`Footer` render normally. **Mitigation (mirrors the existing `tools.astro` pattern of static intro copy above `<ToolsLive>`):** add a short static paragraph/heading *outside* the island in `[slug].astro` (app name, one-line description, maybe a linked cover/screenshot) so the page has real crawlable content beyond the `<head>` tags, even though the interactive tool body itself is JS-only. This is enough for both search indexing (title/description/OG already do the heavy lifting) and human link-preview scrapers (Slack/Discord/iMessage read `<head>` tags, not page body).

**Example:**
```astro
<Layout title={title} description={description} current="/tools">
  <div class="container" style="padding:56px 0 24px">
    <p class="kicker">Darktier Studios · Armory companion</p>
    <h1 style="margin:0 0 12px">{title}</h1>
    <p style="max-width:60ch">{description}</p>
  </div>
  <div class="armory-app-shell">
    <FateOfTheFellowship client:only="react" />
  </div>
</Layout>
```

### Pattern 3: Scoped, non-global Tailwind for one heavyweight island (Burning Banners)

**What:** Add Tailwind v4 via `@tailwindcss/vite`, but scope both *content scanning* and *CSS delivery* to exactly the one component that needs it, so the rest of the Nocturne-styled site never sees a byte of Tailwind CSS or its Preflight reset.

**When to use:** When exactly one component in an otherwise hand-authored-CSS codebase needs a utility framework, and global integration would leak a CSS reset (Tailwind Preflight resets margins/headings/etc.) into every other page sharing the same `Layout.astro`.

**Trade-offs:** Slightly more setup than the "just add the integration" happy path in Tailwind's own Astro guide, but it is what keeps this addition invisible to Home/Vault/Armory-index/Admin, which all still run on hand-authored Nocturne CSS only.

**Example:**
```bash
npm install lucide-react
npm install -D tailwindcss @tailwindcss/vite
```
```js
// astro.config.mjs
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  // ...unchanged...
  vite: { plugins: [tailwindcss()] },
});
```
```css
/* src/styles/armory-tailwind.css — scoped: no Preflight, one @source */
@import "tailwindcss/theme" layer(theme);
@import "tailwindcss/utilities" layer(utilities);
@source "../components/armory/BurningBanners.tsx";
```
```tsx
// src/components/armory/BurningBanners.tsx — top of file
import "../../styles/armory-tailwind.css";
```
Because the stylesheet is imported by the component itself (not by `Layout.astro`), Astro/Vite's per-page bundling only emits that CSS asset for `dist/armory/burning-banners.html` — no other generated page references it. Omitting `tailwindcss/preflight` (the third of Tailwind v4's three split imports — `theme`, `preflight`, `utilities`) is what prevents Tailwind's base reset from touching the shared `Nav`/`Footer` markup that renders on the *same* page, outside the island, under Nocturne's own CSS. `@source` narrows Tailwind's class-scanner to just this one file instead of the whole `src/` tree, keeping the generated utility CSS to only the ~231 classes actually used.

### Pattern 4: Backward-compatible `Tool.kind` for internal routes

**What:** Add one optional field to the existing `Tool` type instead of introducing a parallel `route`/`href` field.

**When to use:** Any time an existing "external link" field needs to sometimes mean "internal path" and you want zero migration for existing documents.

```ts
// src/lib/types.ts
export interface Tool {
  slug: string;
  name: string;
  status: ToolStatus;
  hidden?: boolean;
  /** "internal" → Launch button routes to `/armory/${slug}` in-site.
   *  Absent or "external" (default) → existing behavior: `app` is opened
   *  in a new tab. Optional/absent preserves every existing Firestore doc
   *  (e.g. charlie-mike-toc) unchanged. */
  kind?: "external" | "internal";
  app?: string | null;
  kicker?: string;
  description: string;
  order: number;
}
```

```tsx
// src/components/live/ToolsLive.tsx — inside the .map(), replace the existing
// `isLive && t.app && (...)` block:
const isInternal = t.kind === "internal";
const href = isInternal ? `/armory/${t.slug}` : t.app;
{isLive && (isInternal || t.app) && (
  <a
    className="btn btn-primary"
    href={href}
    {...(isInternal ? {} : { target: "_blank", rel: "noopener" })}
    style={{ textDecoration: "none" }}
  >
    Launch ▸
  </a>
)}
```

Deriving the internal `href` from `slug` (rather than asking the admin to type a path into `app`) means the `Tool.slug` and the `armoryApps.ts` registry `slug` **must match** — document this as the one hard convention of the pipeline. It removes an entire class of admin data-entry mistakes (typo'd path, missing leading slash, stale path after a rename) and keeps `app` doing exactly one job (external URL) rather than double-duty.

**Admin form (`AdminApp.tsx`) — one new field, no new field types needed in `Manager.tsx`:**
```ts
// AdminApp.tsx
const TOOL_KIND_OPTS = [
  { value: "external", label: "External URL" },
  { value: "internal", label: "Internal route (Armory app)" },
];

const toolFields: FieldDef[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "status", label: "Status", type: "select", options: STATUS_OPTS },
  { key: "kind", label: "Link type", type: "select", options: TOOL_KIND_OPTS },   // NEW
  { key: "app", label: "App link (external only)", type: "url", placeholder: "https://…", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];
```
Also update the `newItem` default passed to `<Manager<Tool>>` (currently `{ slug: "", name: "", status: "soon", hidden: false, app: "", kicker: "", description: "", order: 0 }`) to include `kind: "external"`, so newly-created tools default to today's behavior. `Manager.tsx`'s `FieldType` union (`"text" | "textarea" | "url" | "select" | "month" | "date" | "checkbox"`) already supports `"select"` — no changes to `Manager.tsx` itself. `firestore.rules` needs **no change**: the `tools/{slug}` rule only checks `hidden`/owner-UID, with no per-field schema validation, so an added `kind` field is automatically permitted for the owner and automatically included in the public read once `hidden == false`.

## Data Flow

### Build-time (unchanged shape, new inputs)

```
npm run build
  → astro build reads src/pages/**/*.astro
  → armory/[slug].astro: getStaticPaths() iterates armoryApps.ts (static, code-defined)
      → 2 static HTML files emitted, each with its own Layout-rendered <head>
  → tools.astro: unchanged build-time Firestore read (getTools()) for SSR seed,
      ToolsLive re-reads Firestore live in the browser (unchanged)
  → dist/ contains: armory/fate-of-the-fellowship.html, armory/burning-banners.html,
      tools.html, plus everything else, exactly as today
```

### Runtime (browser)

```
Visitor lands on /armory/fate-of-the-fellowship
  → static <head> (title/description/OG/canonical/JSON-LD) + Nav/Footer render immediately (SSR)
  → <astro-island> placeholder for the app is empty in the initial HTML
  → browser downloads + executes the island's JS chunk (client:only)
  → React mounts FateOfTheFellowship(), reads localStorage["fotf:v2"] in its own
    useEffect/useState init, renders the full app client-side
  → all subsequent state changes persist back to localStorage only — no network call,
    no Firestore, no server round-trip
```

### Key Data Flows

1. **Armory index (`/tools`) → app page:** `ToolsLive` reads the `tools` Firestore collection (as it does today), computes `href` per Pattern 4, and either opens the app inline (`/armory/<slug>`, internal) or in a new tab (external). No new Firestore reads are added by the companion apps themselves.
2. **Admin (`/admin`) → Firestore → public:** Owner flips a Tool's `kind` to `internal` and sets `status: "live"` via the existing generic `Manager<Tool>` CRUD form — same live-write-then-live-read path every other catalog edit uses today. The companion app's own React state never touches Firestore.

## Scaling Considerations

| Scale | Approach |
|-------|----------|
| 2 apps (this milestone) | Exactly as designed above — one dynamic route, one registry file, two component files. |
| 5-10 apps | Same pattern holds without change; `armoryApps.ts` just grows. If per-app OG images are wanted, add an optional `image` field to `ArmoryApp` and thread it into `Layout`'s `image` prop (already supported). |
| State beyond localStorage (deferred, per PROJECT.md) | Out of scope for this milestone by explicit constraint ("no login, no Firestore for game state"). If ever added, it would attach to a *specific* app component (e.g., an optional Firebase Auth + Firestore doc keyed by UID) without touching the routing/registry pattern documented here — the pipeline doesn't need to anticipate this. |

This stays entirely within Firebase Spark: no new Cloud Functions, no SSR adapter, no server. `dist/` grows by two static HTML files plus their JS/CSS chunks — Firebase Hosting's free static-hosting tier is unaffected by page count at this scale.

## Anti-Patterns

### Anti-Pattern 1: Global Tailwind integration for one component

**What people do:** Run `astro add tailwind` (or add `@tailwindcss/vite` with a default global `global.css` imported from `Layout.astro`) because that's the documented happy path.
**Why it's wrong:** This site has exactly one component that needs Tailwind. A global integration ships Tailwind's Preflight CSS reset to every page — including ones styled entirely by hand-authored Nocturne CSS — and risks silently altering Nav/Footer/button spacing or typography sitewide.
**Do this instead:** Pattern 3 above — component-scoped `@source`, Preflight omitted, imported only from the one `.tsx` file that needs it.

### Anti-Pattern 2: `client:load` "just to be safe" for SEO

**What people do:** Default to `client:load` on any React island because "SSR is always better for SEO."
**Why it's wrong:** For a component with genuinely no server-computable output (reads `localStorage` for all meaningful state), `client:load` produces SSR output with no SEO value while still paying the hydration-mismatch risk if server/client initial state ever diverges (e.g. a returning visitor with saved progress). It also, per Astro's own hydration-directive semantics, still ships the same client JS bundle as `client:only` — so there's no bundle-size win either.
**Do this instead:** `client:only="react"` for the app body, paired with static Astro-rendered copy around it for SEO (Pattern 2). This is also literally the pattern this codebase already chose for its other no-SSR-value island (`AdminApp.tsx`).

### Anti-Pattern 3: A second "route" field that duplicates `slug`

**What people do:** Add a free-text `route` or `href` field to `Tool` for the admin to type `/armory/fate-of-the-fellowship` into.
**Why it's wrong:** Introduces a second identifier that can drift from both the Firestore doc's own `slug` and the `armoryApps.ts` registry `slug` — a typo or a later rename breaks the Launch button silently with no compile-time or rule-level check.
**Do this instead:** Pattern 4 — a `kind: "internal"` flag plus a *derived* `href = \`/armory/${slug}\`*, enforcing that the Tool doc's `slug` and the armory registry's `slug` are the same string by construction.

### One concrete pre-existing gotcha to fix during the move

`apps/fotf-companion.tsx`'s injected `<style>{CSS}</style>` block scopes almost every selector under a `.ff` root class (`.ff{...}`, `.ff *{...}`, `.ff button{...}`) — good practice for dropping into a shared-chrome page. **One rule breaks that scoping:** `.body{position:relative;z-index:1;max-width:640px;...}` (line ~243) is a bare, unscoped `.body` selector, not `.ff .body`. No collision exists in the current Nocturne stylesheets (verified — no `.body` class defined there today), but it's a latent leak: nest it under `.ff` (`.ff .body{...}`) before wiring the component in, so a future Nocturne class addition can't silently collide with it.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Firebase Hosting | Static `dist/` output, `cleanUrls: true` (`firebase.json`, unchanged) | `format: "file"` in `astro.config.mjs` already makes every route emit `<path>.html`; nested routes like `armory/fate-of-the-fellowship.astro`-equivalent already emit `dist/armory/fate-of-the-fellowship.html` under this setting — no `firebase.json` change needed, confirmed by the existing `tools.astro` → `tools.html` → `/tools` precedent. |
| Firestore `tools` collection | `Tool.kind` field read/written through the existing generic `Manager<Tool>` CRUD + `ToolsLive`/`getTools()` read paths | No schema change enforced by `firestore.rules` (only `hidden`/owner-UID gated) — the new field needs no rules deploy. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `armory/[slug].astro` ↔ `armoryApps.ts` | Direct import, build-time only | The only file that needs to know the full list of apps. |
| `armory/[slug].astro` ↔ `src/components/armory/*.tsx` | `<Component client:only="react" />`, no props | Apps are fully self-contained; the wrapper page passes zero data in. |
| `ToolsLive.tsx` ↔ `armory/[slug].astro` | Indirect, via the shared string contract `Tool.slug === armoryApps[i].slug` | Not a code import — a naming convention that must be kept true by whoever adds a new Tool doc + registry entry. Worth a one-line comment in both files pointing at each other. |
| `AdminApp.tsx` ↔ `types.ts` | `Tool.kind` typed field consumed by the generic `Manager<T>`/`FieldDef` system | No changes needed in `Manager.tsx` itself — `"select"` field type already exists. |

## Suggested Build Order

1. **Data model first** (`src/lib/types.ts`: add `Tool.kind`) — everything else (admin form, `ToolsLive`) depends on the type existing, and this is a pure additive/backward-compatible change that can land and deploy on its own with zero visible behavior change.
2. **Admin + ToolsLive rendering** (`AdminApp.tsx` new field + default; `ToolsLive.tsx` internal-href branch) — depends on step 1's type; can be verified end-to-end against a manually-created `kind: "internal"` Firestore doc even before any armory page exists (the Launch button will 404 until step 4, which is fine to verify incrementally).
3. **Move + wire Fate of the Fellowship** (simpler app — React-only, no Tailwind): create `src/components/armory/FateOfTheFellowship.tsx` (moved from `apps/fotf-companion.tsx`, fix the `.body` scoping gotcha), create `src/lib/armoryApps.ts` with one entry, create `src/pages/armory/[slug].astro`, update `react({ include })` in `astro.config.mjs`. This proves out Patterns 1 and 2 end-to-end on the lower-risk app first.
4. **Move + wire Burning Banners** (adds Tailwind + `lucide-react`): install deps, add the scoped `armory-tailwind.css` (Pattern 3), create `src/components/armory/BurningBanners.tsx`, add its `armoryApps.ts` entry (registry now has 2 entries — the route/registry plumbing from step 3 needs no further changes, only additive).
5. **Wire both live in Firestore** via `/admin`: create/edit the two `tools` docs with `status: "live"`, `kind: "internal"`, `slug` matching the registry exactly.
6. **Verify + deploy**: `npm run build` locally, confirm `dist/armory/*.html` exist with correct per-app `<title>`/OG tags and that Nocturne CSS on Nav/Footer is untouched on the Burning Banners page (Preflight-leak check), then `npm run deploy`.

This order front-loads the shared, low-risk plumbing (data model, admin, routing pattern) before the two app-specific integrations, and does the styling-riskier app (Burning Banners/Tailwind) second so the scoping pattern is validated once already on a simpler app.

## Sources

- Direct read of this repository's own source (HIGH confidence, primary source): `astro.config.mjs`, `firebase.json`, `firestore.rules`, `src/layouts/Layout.astro`, `src/lib/types.ts`, `src/data/catalog/tools.ts`, `src/components/live/ToolsLive.tsx`, `src/components/admin/AdminApp.tsx`, `src/components/admin/Manager.tsx`, `src/pages/tools.astro`, `src/pages/admin.astro`, `apps/fotf-companion.tsx`, `apps/bb-companion.tsx`.
- [Astro Docs — `@astrojs/tailwind` / Tailwind CSS v4 setup](https://docs.astro.build/en/guides/integrations-guide/tailwind/) and [Tailwind CSS — Astro framework guide](https://tailwindcss.com/docs/installation/framework-guides/astro) — confirms `@tailwindcss/vite` as the current (v4) recommended integration path, with Astro 5.2+ native support. Confidence: MEDIUM (web search, cross-checked across multiple current sources).
- Web search on Astro `client:only` vs `client:load` hydration/SEO semantics (multiple sources including Astro's own GitHub issue discussions and community explainers) — confirms `client:only` components render no server HTML and thus avoid hydration mismatches entirely, at the cost of not being present in the crawler-visible initial HTML. Confidence: MEDIUM (web search, verified/cross-checked → per this project's `classify-confidence` seam).
- This project's own existing precedent (`AdminApp.tsx` using `client:only="react"` for its own no-SSR-value, localStorage-adjacent-pattern component) — HIGH confidence, primary source, used as the controlling precedent over generic web guidance.

---
*Architecture research for: In-site Astro-island hosting of prebuilt React companion apps*
*Researched: 2026-08-18*
