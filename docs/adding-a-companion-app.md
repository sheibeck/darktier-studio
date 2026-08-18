# Adding a companion app to the Armory

The Armory (`/armory/<slug>`) hosts in-site "companion apps" — one-page React tools that live
inside the Nocturne site but render as isolated, client-only islands. The routing and registry
plumbing is generic and has **zero app-specific logic**; dropping in a new app is a fixed,
mechanical checklist, not a new route or page.

Two apps already ship this way and are the two worked examples referenced throughout this guide:

- **Fate of the Fellowship** (`src/components/armory/FateOfTheFellowship.tsx`) — the **clean**
  case: zero new dependencies, no Tailwind.
- **Burning Banners** (`src/components/armory/BurningBanners.tsx`) — the **deps + scoped
  Tailwind** case.

## The seven steps

### 1. Add the app component

Create one `.tsx` file under `src/components/armory/`. Scope all of the component's own CSS
under a unique wrapper class so nothing leaks into the shared Nocturne shell (or vice versa) —
Fate of the Fellowship injects a `const CSS` template string with every selector scoped under a
`.ff` wrapper (`.ff{ … } .ff button{ … }`), then renders `<div className="ff">` as its root. Give
your app its own short, unique wrapper class the same way.

### 2. If the app needs dependencies or Tailwind, follow the Burning Banners pattern

Burning Banners needs npm packages (`lucide-react` icons) and Tailwind utility classes, so it
follows a **scoped, skip-preflight** pattern instead of adding Tailwind globally:

- A per-app stylesheet (see `src/styles/armory-bb-tailwind.css`) that imports **only** the
  Tailwind `theme` and `utilities` layers — never the bundled `tailwindcss` entrypoint, which
  would also emit `preflight` (a document-wide CSS reset):

  ```css
  @layer theme, utilities;
  @import "tailwindcss/theme.css" layer(theme);
  @import "tailwindcss/utilities.css" layer(utilities);

  @source "../components/armory/BurningBanners.tsx";
  ```

- The `@source` directive is pointed at that **one** component file, so Tailwind only scans that
  file for utility classes to generate.
- This stylesheet is imported **only** from the component itself (`import
  "../../styles/armory-bb-tailwind.css";` at the top of `BurningBanners.tsx`) — never from
  `Layout.astro`, `nocturne.css`, or `site.css`. No Nocturne page is affected.
- Import icons **by name** (`import { Swords, Coins, … } from "lucide-react"`), never a barrel
  import — this keeps the bundle scoped to what's actually used.
- `astro.config.mjs` already has the Vite Tailwind plugin (`@tailwindcss/vite`) wired in; it
  compiles only whatever scoped stylesheet(s) your components import. You do not need to touch
  `astro.config.mjs` to add another Tailwind-using app — just add another scoped stylesheet
  following the same pattern (new file, own `@source` line, imported only from your component).

If your app needs neither Tailwind nor new dependencies (the FOTF case), skip this step entirely.

### 3. Migrate any storage shim to real `localStorage`

Any prototype `window.storage` shim needs to become real `localStorage`, with **all reads and
writes inside `useEffect`** — never at module scope or during render. A build-time or
render-time `localStorage` read breaks `astro build` outright, since `localStorage` does not
exist in the Node build environment. Both existing apps follow this:

```ts
useEffect(() => {
  const raw = window.localStorage.getItem(STORE_KEY);
  // ...restore state
}, []);

useEffect(() => {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
}, [state]);
```

Namespace the storage key per app (e.g. `"fotf:v2"`, `"bb:campaign"`) so apps never collide.

### 4. Register ONE entry in `src/lib/armoryApps.ts`

This is the single source of truth for which apps exist and their per-app SEO. Add one object to
the `armoryApps` array:

```ts
{
  slug: "your-app-slug",
  name: "Your App Name",
  title: "Your App Name — Companion",
  description: "One or two sentences for <meta description> / og:description.",
  Component: YourAppComponent,
},
```

`getStaticPaths()` in `src/pages/armory/[slug].astro` derives its routes from this array, so this
entry alone is what makes `/armory/your-app-slug` exist.

### 5. Add the route dispatch line in `src/pages/armory/[slug].astro`

Astro's `client:only` hydration-script generation statically scans the template for component
tags matched to a local import binding — it cannot resolve a runtime variable (a component
looked up from the registry array) into that binding. So each app needs exactly three additions
to `[slug].astro`:

1. One static import: `import YourApp from "../../components/armory/YourApp";`
2. One entry in the `DISPATCHED_SLUGS` set: `new Set(["fate-of-the-fellowship",
   "burning-banners", "your-app-slug"])`
3. One dispatch line in the JSX: `{slug === "your-app-slug" && <YourApp client:only="react" />}`

**This is enforced, not just documented.** `[slug].astro` contains a build-time assertion that
diffs `armoryApps` against `DISPATCHED_SLUGS` and throws if any registry entry lacks a matching
dispatch line — a forgotten dispatch line would otherwise build a page with correct SEO but an
empty app shell and no error. If you add step 4 and forget step 5, `npm run build` fails loudly
with the missing slug named in the error.

### 6. Add ONE record to `src/data/catalog/tools.ts`

Add a `Tool` record with `kind: "internal"` and a `slug` matching the registry slug **exactly**:

```ts
{
  slug: "your-app-slug", name: "Your App Name", status: "live", kind: "internal",
  kicker: "Companion app",
  description: "Same tone as the other tool blurbs, one sentence.",
  order: 3,
},
```

`kind: "internal"` tells the live `/tools` page to render this tool's "Launch" as a same-tab
`/armory/<slug>` link rather than an external URL. Set `status: "live"` when the app is ready to
ship, or `"soon"` to list it without a live link yet.

**The slug must match verbatim** across the registry entry (step 4), the route dispatch (step
5), and this tool record — the Launch button derives its href as `/armory/${tool.slug}`. A
mismatch here doesn't fail the build; it silently points the Launch link at a dead route.

### 7. Run `npm run build`

Always verify with a real build, not just `astro dev`. `npm run build` is the acceptance gate
that catches the classes of error dev mode hides or is lenient about:

- A `localStorage` read outside `useEffect` (SSR-safe in dev, fatal at build time).
- A CSS-leak — a selector that isn't actually scoped under your wrapper class, verified by
  confirming other pages' rendered styles are unaffected.
- A missing `DISPATCHED_SLUGS` entry (see step 5) — the build throws immediately with the
  offending slug.

Also confirm marketing pages still ship no companion-app JS: the React `include` glob in
`astro.config.mjs` (`**/admin/**`, `**/live/**`, `**/components/armory/**`) code-splits each
`client:only` app to its own `/armory/<slug>` route, so Home/Games/Tools stay effectively 0KB of
app JS even as more apps are added.

## Summary checklist

| # | Step | File(s) |
|---|------|---------|
| 1 | Add the component, scoped CSS wrapper | `src/components/armory/<App>.tsx` |
| 2 | (If needed) scoped Tailwind stylesheet, skip preflight | `src/styles/armory-<app>-tailwind.css` |
| 3 | `localStorage` in `useEffect`, namespaced key | same component file |
| 4 | One registry entry | `src/lib/armoryApps.ts` |
| 5 | One import + one `DISPATCHED_SLUGS` entry + one dispatch line | `src/pages/armory/[slug].astro` |
| 6 | One tool record, matching slug, `kind: "internal"` | `src/data/catalog/tools.ts` |
| 7 | `npm run build` | — |

No per-app route needs to be hand-authored — the route, SEO, and hydration are entirely driven
by steps 4–6.
