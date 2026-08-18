# Pitfalls Research — In-Site React Companion Apps (v1.1)

**Domain:** Adding prebuilt single-file React apps (localStorage-only, no login) as Astro islands at internal `/armory/<slug>` routes inside an existing Astro 7 SSG + Firebase Hosting (free Spark) marketing/SEO site that has zero Tailwind today and React scoped only to `/admin` and `/live`.
**Researched:** 2026-08-18
**Confidence:** MEDIUM (codebase facts read directly = HIGH; external technical claims verified against npm registry and cross-checked web search = MEDIUM; a few claims LOW — flagged inline)

This file is scoped to **integration** pitfalls — mistakes specific to grafting these two apps onto *this* system. Generic React/Tailwind advice is omitted unless it changes behavior in this codebase.

---

## Critical Pitfalls

### Pitfall 1: Tailwind's global preflight/reset silently restyles Nocturne

**What goes wrong:**
Installing Tailwind for `bb-companion.tsx` and importing it the default way (`@import "tailwindcss";` in one global CSS file, loaded from `Layout.astro` or any file that ends up in the site-wide bundle) ships Tailwind's **preflight** — a CSS reset applied to bare selectors (`*`, `html`, `body`, `button`, `h1`–`h6`, `a`, `p`, borders, margins). Nocturne's `nocturne.css`/`site.css` also style those same bare elements (`.btn`, headings, borders, 8px radii, `#9184d9` accent). Preflight loads after or alongside Nocturne and wins on specificity/order, stripping button padding/backgrounds, resetting heading margins/font sizes, and killing default borders across **every page on the site**, not just the two Armory routes.

**Why it happens:**
The natural/easy path — `npx tailwindcss init`, one `@import "tailwindcss"` in a stylesheet the Astro build bundles globally, or adding a `tailwind.config` with no `content`/scope restriction — is exactly what every Tailwind quick-start recommends, and it is correct *only* for sites that are 100% Tailwind. This site is 0% Tailwind everywhere except one component. Astro also happily merges all imported CSS into shared chunks unless you deliberately keep the Tailwind stylesheet's import graph isolated to the `bb-companion` island.

**How to avoid:**
1. **Never** put a bare `@import "tailwindcss";` in any file `Layout.astro`, `Nav.astro`, `Footer.astro`, or any `/games`, `/tools`, `/` page imports, directly or transitively.
2. Import Tailwind's CSS **only** from a stylesheet that is itself only ever imported by `bb-companion.tsx` (or a wrapper Astro page that renders *only* that island) — never from `Layout.astro`.
3. Skip preflight entirely: use Tailwind's granular entry points instead of the bundled one — `@import "tailwindcss/theme";` + `@import "tailwindcss/utilities";` (no `@import "tailwindcss/preflight";`). This gives you the ~231 utility classes bb-companion needs with **no reset at all**, which is the simplest fix and removes the entire risk class in one move. (MEDIUM confidence — verified via Tailwind v4 docs/community threads; confirm exact import path against the Tailwind version actually installed.)
4. If any base-layer normalization is still wanted for the island itself, scope it with the `tailwindcss-scoped-preflight` plugin (Tailwind v4-compatible, CSS-first `@plugin` API) constrained to a wrapper class (e.g. `.tw-scope`), not applied document-wide. (LOW confidence — third-party plugin, verify current maintenance status before adopting.)
5. Confirm Tailwind's `content`/scan glob only includes `apps/bb-companion.tsx` (or its dedicated island directory) — an overly broad glob won't leak CSS by itself, but keeping it narrow avoids Tailwind classes accidentally matching text in unrelated `.astro` files and bloating the generated utility set.

**Warning signs:**
- After adding Tailwind, `npm run build` output CSS file(s) for pages *other than* `/armory/burning-banners` grow or change hash.
- Visually: Nocturne buttons on Home/Games/Tools lose their filled background/border-radius, or headings lose their accent underline/spacing — check `/`, `/games`, `/tools` in a preview build immediately after adding Tailwind, before touching anything else.
- `grep -r "tailwindcss" dist/**/*.html` (or inspect network tab) shows the Tailwind-generated stylesheet `<link>` on pages that never render `bb-companion`.
- Browser DevTools "Computed" panel on a Nocturne `.btn` shows `all: revert` or reset margin/padding values with a Tailwind-preflight-looking source.

**Phase to address:**
The phase that first introduces the in-site app-hosting pattern / infra (before Burning Banners specifically, since Fate of the Fellowship needs no Tailwind and can validate the hosting pattern in isolation first). Decide and lock the Tailwind isolation strategy (granular imports, no preflight) as an explicit acceptance check on the Burning Banners phase, with a "visually diff the three existing pages before/after" verification step.

---

### Pitfall 2: `client:load` on a localStorage-reading island throws at hydration or during SSR

**What goes wrong:**
Both companion apps read `localStorage` (`"fotf:v2"`, and bb's own key) to initialize state. Astro's `client:load`/`client:idle`/`client:visible` directives still **server-render the component once during `astro build`** (Node context, no `window`/`localStorage`) to produce the initial static HTML, then hydrate it in the browser. Any `localStorage` access that happens at module top-level, in the function body during initial render (e.g. `useState(() => JSON.parse(localStorage.getItem(...)))`), or outside a `useEffect`, throws `ReferenceError: localStorage is not defined` and **fails `astro build`** entirely — not a runtime warning, a hard build break. Even if it's guarded enough to survive the build, mismatched server-rendered (empty/default state) vs. client-hydrated (localStorage-populated) markup produces a React hydration-mismatch warning/flash on every page load.

**Why it happens:**
Both source apps were written as standalone client-only React apps (no SSR-awareness) — this is exactly the "clean drop-in" assumption the PROJECT.md flags as risky for `bb`. Reading `localStorage` synchronously during render is idiomatic in a Vite/CRA SPA and invisible as a problem until it meets Astro's static-build prerender step.

**How to avoid:**
- Initialize all state with static/default values only (no `localStorage` read) during first render; move every `localStorage.getItem`/`setItem` call inside `useEffect(() => { ... }, [])` so it only runs post-mount, client-side.
- Guard any remaining direct browser-API access with `typeof window !== "undefined"` as a second line of defense, but prefer restructuring over guard-littering — a `useEffect`-only pattern is cleaner for a ~2600-line app than sprinkling guards through it.
- Accept one client-side re-render after mount that swaps in the localStorage-restored state (brief flash of default/empty state) — this is the standard, correct tradeoff for `client:load`, not a bug to "fix away."
- Do **not** reach for `client:only="react"` just to dodge this — see Pitfall 2b below; it trades a build error for an SEO/no-JS regression.

**Warning signs:**
- `npm run build` fails with `ReferenceError: localStorage is not defined` (or `window is not defined`) pointing into `apps/fotf-companion.tsx` / `apps/bb-companion.tsx`.
- Browser console shows React hydration warnings ("Text content did not match", "Hydration failed") on `/armory/*` pages even when the build succeeds.
- Visible flash: saved character/roster data briefly shows empty/default before populating on load.

**Phase to address:**
Fate of the Fellowship phase (first app onboarded, React-only) — this is where the SSR/localStorage boundary pattern should be established and documented once, then reused unchanged for Burning Banners.

---

### Pitfall 2b: `client:only` blanks the page for crawlers and no-JS/slow-JS visitors

**What goes wrong:**
Using `client:only="react"` (the tempting quick fix for Pitfall 2, since it skips server rendering entirely) means Astro emits **no markup at all** for that island in the built HTML — just an empty mount `<div>`. Any visitor or bot that doesn't execute JS (or fails to execute it) sees a blank page body. Modern search-engine crawlers mostly do execute JS on a second pass, but **link-preview/OG scrapers largely do not** — and per this project's `Layout.astro`, every page already emits a full OG/Twitter meta block, so the page-level share preview is fine, but the in-page content itself is invisible to anything that doesn't run JS (accessibility tools, text-only readers, slow/failed script loads).

**Why it happens:**
`client:only` looks like the "safe" choice because it sidesteps the whole SSR/localStorage class of errors (Pitfall 2) — it's a real fix for that problem, but it silently reintroduces a different one this project explicitly cares about (crawlable, share-optimized routes per PROJECT.md's "Fate of the Fellowship companion live at its own crawlable, share-optimized route").

**How to avoid:**
- Prefer `client:load` (or `client:visible` if the island isn't in the initial viewport) with the SSR-safe pattern from Pitfall 2, so real HTML (headings, static UI chrome, at minimum the app's title/instructions) renders in the initial response.
- If `client:only` is used anywhere (e.g. as an interim shortcut), make sure the **page shell** (Astro-rendered heading, short description paragraph, `<title>`/meta) carries enough real content outside the island for the route to not be a blank page to a non-JS visitor — the OG/title meta already covers share cards; the concern is the visible page body and basic crawlability of what the tool *is*.

**Warning signs:**
- `curl` (or "view source") on `/armory/<slug>` shows an essentially empty `<body>` apart from `<script>` tags and one empty `<div id="root">`.
- Lighthouse/axe accessibility or SEO audit flags "no content without JavaScript" on the route.

**Phase to address:**
Same phase as Pitfall 2 (Fate of the Fellowship) — decide the directive (`client:load`, SSR-safe) once as the standard pattern documented for future artifact apps, per PROJECT.md's stated goal of a reusable pattern.

---

### Pitfall 3: Unscoped CSS-in-JS `<style>` block leaks into the shared Layout/other app

**What goes wrong:**
`fotf-companion.tsx`'s `const CSS` string is injected as a plain, unscoped `<style>` block (e.g. via `dangerouslySetInnerHTML` or a rendered `<style>{CSS}</style>`) containing bare selectors like `button`, `.pad`. Because the companion renders inside the shared `Layout.astro` (same `<body>` as `Nav`/`Footer`), and because `<style>` tags injected into the DOM are **global to the document**, not scoped to the component — these selectors apply document-wide: Nocturne's nav buttons, footer links, or any element the site happens to also use `.pad` on get restyled. Worse, if a future page ever renders *both* companion apps' shells near each other (unlikely per-route here, but shared layout classes like `.pad` are a common generic name), bb's and fotf's styles can collide with each other too.

**Why it happens:**
This is exactly how the source app worked standalone (its own `index.html`, nothing else on the page to collide with) — the CSS-in-JS block was never designed to coexist with a host page's chrome. Porting it verbatim into an Astro page that also renders `Nav`/`Footer` inside the same document is the "clean drop-in" assumption that breaks first.

**How to avoid:**
- Wrap the companion's root render in a single, unique container class (e.g. `.fotf-companion-root`) and rewrite the `CSS` template string's selectors to be prefixed/scoped under it (`.fotf-companion-root button { ... }`, `.fotf-companion-root .pad { ... }`) — a one-time mechanical find-replace on the `const CSS` string, not a rewrite of the app's logic.
- Alternative with less manual rewriting: render the companion inside a **Shadow DOM** host (a small wrapper component that attaches a `shadowRoot` and injects the `<style>` + app tree inside it) — CSS-in-JS then can't leak out or be leaked into, by construction. Heavier to set up but zero risk of missing a selector during a manual scoping pass; worth it if `CSS` is large/hard to safely prefix mechanically.
- Do the same scoping for Burning Banners' inline-style color object where relevant, and keep both apps' root wrapper class names distinct so a future page that (accidentally or intentionally) renders both doesn't collide.
- Verify the Nocturne `Nav`/`Footer` do **not** use bare `button` or a class named exactly `.pad` today (quick grep) — if they already do, the prefixing is non-negotiable, not just best practice.

**Warning signs:**
- After deploying `/armory/fate-of-the-fellowship`, the site Nav/Footer buttons elsewhere on that same page render subtly differently than the same components on `/`, `/games`, `/tools`.
- Grep the source `CSS` string for bare-tag or short/generic class selectors (`button`, `.pad`, `.card`, `.row`) before porting — any of these are leak candidates without scoping.

**Phase to address:**
Fate of the Fellowship phase (owns the CSS-in-JS port). Document the scoping convention there so the Burning Banners phase reuses the same wrapper-prefix pattern for its own inline styles/Tailwind scope.

---

### Pitfall 4: lucide-react barrel import bloats the bundle (and check the installed version's React 19 support)

**What goes wrong:**
Importing the whole icon set (`import * as Icons from "lucide-react"` or any pattern that doesn't tree-shake) pulls hundreds of unused icon components into the Burning Banners island's JS bundle. Separately, **older lucide-react versions pinned a peer-dependency range that excluded React 19** (`react@^16.5.1 || ^17.0.0 || ^18.0.0`), which — combined with this project's `react@19.2.8` — would produce an `npm install` `ERESOLVE` peer-conflict error.

**Why it happens:**
Barrel-style `import * as X` or copy-pasting icon usage from docs/examples that don't emphasize named imports is common; the React-19-peer-range issue is a version-pinning problem that resolves itself once you install current lucide-react but bites if a lockfile/cached install pulls an older version.

**How to avoid:**
- Install current `lucide-react` (verified via npm registry 2026-08-18: **v1.32.0**, `peerDependencies.react: "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"` — React 19 is supported; no peer conflict expected at this version). Confidence: HIGH (direct registry lookup).
- Always import icons individually and by name: `import { Sword, Shield } from "lucide-react";` — never a namespace/barrel import. Vite's tree-shaking (which Astro uses) then only bundles the icons actually referenced.
- After the first build with lucide-react wired in, spot-check the built JS chunk for the Burning Banners route size — a reasonable icon set (a few dozen icons) should add only tens of KB, not hundreds.

**Warning signs:**
- `npm install` reports an `ERESOLVE` peer dependency conflict mentioning `react` and `lucide-react` — sign the installed lucide-react version is stale; bump it.
- Bundle/route-size inspection (`astro build` output or a bundle-analyzer) shows the Burning Banners JS chunk far larger than "app logic + ~30-50 small icon components" would suggest.

**Phase to address:**
Burning Banners phase (the only app using lucide-react). Pin/verify the lucide-react version during initial dependency setup, before writing the icon-heavy UI.

---

### Pitfall 5: Marketing pages silently gain JS/CSS weight from the new islands

**What goes wrong:**
The project's `astro.config.mjs` currently scopes the React integration to `include: ["**/admin/**", "**/live/**"]`. Companion-app island component files placed anywhere else (e.g. `src/components/armory/*.tsx` or `apps/*.tsx` used directly as an Astro component) **will not be picked up by the React integration's JSX/compile step** unless that glob is widened — and widening it carelessly (e.g. to `**/*`) risks Astro trying to process `.tsx` files it shouldn't, or, more relevantly, risks a shared bundle/chunk being generated that Home/Games/Tools accidentally reference. Separately, even with correct scoping, if the Tailwind stylesheet (Pitfall 1) or the CSS-in-JS `<style>` (Pitfall 3) end up in a shared Astro CSS chunk instead of a route-specific one, marketing pages pay a byte cost for zero benefit — directly undermining the "fast, great-looking" Core Value and the project's established "public pages ship ~0KB JS" pattern (per `.claude/CLAUDE.md`: "Public pages never import `firebase/*` client code... keeping public-page JS at ~0KB").

**Why it happens:**
Astro's per-route code-splitting is automatic and correctly isolates island JS to the routes that render it *as long as the import graph is actually route-scoped* — the risk is entirely self-inflicted by importing the companion app (or its CSS) from a shared file like `Layout.astro`, `Nav.astro`, or a barrel `index.ts` that other pages also import from.

**How to avoid:**
- Widen `astrojs/react`'s `include` glob only as far as necessary — e.g. `**/armory/**` alongside the existing `**/admin/**`, `**/live/**` — and keep the companion `.tsx` files under a dedicated directory that glob matches, not scattered.
- Render each companion app from its **own** `/armory/<slug>.astro` page, importing the island directly in that page only — never through `Layout.astro`, `Nav.astro`, or any component all pages share.
- After adding both apps, run `npm run build` and diff the generated `dist/_astro/*.js` / `*.css` file list + the `<script>`/`<link>` tags emitted in `dist/index.html`, `dist/games.html`, `dist/tools.html` against a pre-change build — those three should show **zero new script/style tags**.

**Warning signs:**
- View-source on `/`, `/games`, or `/tools` shows a new `<script type="module" src="/_astro/....js">` or `<link rel="stylesheet">` that wasn't there before adding the companion apps.
- Total transferred bytes for the homepage (DevTools Network tab, or a Lighthouse run) increases after this milestone ships, even though nothing on the homepage changed functionally.

**Phase to address:**
Both app phases individually (verify no regression each time an app ships) plus a final milestone-level QA pass explicitly diffing marketing-page bundle output before/after, per the project's existing "no regression to Nocturne" constraint.

---

### Pitfall 6: SEO regression — either the new routes are invisible to search, or they pollute the sitemap/robots story for the rest of the site

**What goes wrong:**
Two opposite failure modes:
1. **New routes under-optimized:** `/armory/<slug>` ships with generic/missing `title`/`description`/OG image (falls back to `site.ogImage`/`site.description` defaults from `Layout.astro`), making shared links to the companion apps look identical to every other page and defeating the "share-optimized route" goal explicitly named in PROJECT.md for Fate of the Fellowship.
2. **Existing pages regress:** the sitemap filter in `astro.config.mjs` (`filter: (page) => !page.includes("/admin")`) only excludes `/admin` — it does **not** exclude anything else by default, so if a companion-app route is meant to be excluded from search (unlikely here, since PROJECT.md wants it crawlable) it would need its own filter addition; conversely, forgetting to give the new routes a `<canonical>` or reusing another page's canonical (e.g. copy-pasting `/tools.astro`'s frontmatter without updating `title`/`current`) could produce duplicate-content or wrong-canonical signals that confuse indexing of the *existing* `/tools` page.

**Why it happens:**
The two new routes are genuinely new page types (interactive tool UI, not catalog-listing content) — it's easy to either forget to give them proper per-page SEO props (since `Layout.astro`'s defaults silently paper over a missing `title`/`description`), or to accidentally set `noindex`/wrong `current` nav-highlight by copy-pasting an existing page's frontmatter without adjusting it.

**How to avoid:**
- Give each `/armory/<slug>.astro` page explicit `title`, `description`, and a **dedicated OG image** (even a simple static per-app share graphic) passed to `Layout` — do not rely on the site-wide default `site.ogImage`, since generic/duplicate OG images across pages weakens the "good-looking shared links" goal.
- Set `current="/tools"` (or whatever nav key matches how these routes should highlight in `Nav.astro`) so the site nav state is consistent, but keep the page's own `title`/canonical unique to the route (Astro's `Layout.astro` already derives `canonical` from `Astro.url.pathname`, so this is automatic as long as `noindex` is left `false`/default — verify it is NOT accidentally set `true` on these routes, since that IS wanted for `/admin` but NOT for `/armory/*`).
- Confirm the sitemap: since the filter only excludes `/admin`, `/armory/<slug>` routes will be included automatically — verify this is the desired outcome (per PROJECT.md, yes) by checking `dist/sitemap-index.xml`/`dist/sitemap-0.xml` after build contains the new routes.
- For "thin crawlable content" concern: because these are interactive local-state tools, make sure the **static, server-rendered** portion of the page (title, one-paragraph description of what the tool does, maybe a static screenshot) gives crawlers/scrapers real indexable text even before/without the island hydrating — this doubles as the Pitfall 2b mitigation.

**Warning signs:**
- View-source on an `/armory/<slug>` page shows the generic site description/OG image instead of app-specific copy.
- `dist/sitemap-0.xml` (post-build) is missing the new routes, or unexpectedly includes something under `/admin`.
- Google Search Console (once available) or a manual `robots.txt`/meta-robots check shows `noindex` on an armory route that should be indexed.

**Phase to address:**
Each app's own phase (per-app SEO props are part of "done" for that app), with the app-hosting-pattern phase establishing the reusable page template (props for title/description/OG image) so it isn't reinvented per app.

---

### Pitfall 7: Tools data-model change breaks existing `ToolsLive` rendering or the public Firestore read filter

**What goes wrong:**
`Tool.app` (in `src/lib/types.ts`) is currently typed `app?: string | null` and `ToolsLive.tsx` renders it unconditionally as an **external** link: `<a ... href={t.app} target="_blank" rel="noopener">Launch ▸</a>`. Making these two new companion apps "editable Armory Tools" per PROJECT.md requires the admin to set an internal route (`/armory/fate-of-the-fellowship`) as this same field's value — which technically "works" (it's just a URL string, `target="_blank"` on an internal route still functions, just opens a new tab unnecessarily for an in-site page) but is semantically wrong and forecloses future per-tool behavior differences (e.g. wanting internal links to open in the same tab, or wanting different styling/icon for "in-site" vs "external" tools). If a schema change *is* made (e.g. adding a new field like `internal?: boolean` or an `appType: "internal" | "external"`), it must be additive and optional — existing `Tool` docs in Firestore (the "docking soon" slots, Charlie Mike TOC's external `app` entry) have no such field and must continue to render exactly as before with no code path requiring the new field to be present.
Separately, **Firestore security rules and the public read filter are unaffected by this field addition** — `isPublic()` checks `resource.data.hidden == false` only, so adding a new optional field to some `tools/{slug}` docs doesn't touch security; the risk is purely in application code assuming the field exists.

**Why it happens:**
It's tempting to reuse `app` as-is (zero schema change, ships faster) without noticing the semantic mismatch (`target="_blank"` on same-origin internal routes, no "Launch" vs. "Open" distinction), or, in the other direction, to make a schema change without auditing every existing `Tool`-typed render path (`ToolsLive.tsx`, and the admin `Manager.tsx`/`AdminApp.tsx` editor forms) for whether they assume the new field's presence.

**How to avoid:**
- Prefer the additive approach: add an optional field (e.g. `internal?: boolean`, defaulting falsy/undefined = current external behavior) to the `Tool` interface in `src/lib/types.ts`, and branch on it in `ToolsLive.tsx` only for `target`/`rel` (internal → no `target="_blank"`, or keep it if new-tab is actually desired — confirm with the owner) — do not remove or repurpose the existing `app` field's meaning for old rows.
- Grep every place `Tool` is read/written (`ToolsLive.tsx`, `src/components/admin/*.tsx`, the seed script, `firestore.rules` comments) before changing the type, to confirm nothing destructures `t.app` assuming it's always an external absolute URL.
- Since Firestore has no schema enforcement, manually verify (via the admin UI or emulator) that existing `tools` docs (Charlie Mike TOC, "docking soon" placeholders) still render correctly with the new optional field simply absent — this is a real regression risk given Firestore's schemaless nature, not just a type-level concern.
- No `firestore.rules` change is needed for an additive optional field — confirm this explicitly (i.e., don't "just in case" touch `firestore.rules`, since that's a separate deploy step (`npm run deploy:rules`) with its own risk).

**Warning signs:**
- After the schema change, existing non-companion tool cards in `/tools` render a broken/missing "Launch" button, or throw a runtime error reading `t.internal` on old docs that predate the field.
- Admin editor form for tools doesn't save/round-trip the new field correctly (check Firestore console after an edit).

**Phase to address:**
The phase that wires "each app is an editable Armory Tool" (likely the same phase or a dedicated small phase after both apps' routes exist) — explicitly listed in PROJECT.md as "a small tools data-model addition." Should be its own reviewable unit since it touches shared/production data (existing live tools).

---

### Pitfall 8: Free-Spark and static-build traps — accidental SSR adapter, Cloud Function, or build-breaking browser-API access

**What goes wrong:**
Several ways this milestone could silently violate the project's hard `$0`/no-Blaze/no-Cloud-Functions/static-only constraints:
- Adding a UI library, icon package, or "just to preview" a dev server integration that pulls in `@astrojs/node` or any Astro **SSR adapter** — Astro's `output` mode would need to stay `static` (the default, and what's implied by the current all-static config with no `output`/`adapter` key). Some npm install flows (a copy-pasted "getting started" doc for a framework feature) can suggest adding an adapter without the developer realizing it changes the build/deploy model. This project's `firebase.json` hosting config (`"public": "dist"`, no `functions`/rewrites) assumes a fully static `dist/`; any SSR adapter breaks that assumption and would require Cloud Functions (paid Blaze) to actually serve.
- Top-level or render-time `localStorage`/`window` access (Pitfall 2) breaking `astro build` outright — this is the most likely and most immediate "free-tier trap" in practice, since it's a **build failure**, not a runtime cost issue, but it blocks the manual `npm run deploy` pipeline entirely.
- Introducing any dependency that assumes a Node server process at runtime (rather than at build time) — e.g. a library that wants to open a persistent connection, read env vars only available server-side, or expects an API route — none of which exist in this static-hosting setup.

**Why it happens:**
Companion apps ported from a different hosting context (their own standalone dev setup) may carry incidental dependencies or config assumptions (a `vite.config` plugin, a server-only import) that don't match this project's static-Astro/Firebase-Hosting-only model. Framework docs also default to showing SSR-capable setups since that's the more commonly demonstrated Astro use case in 2026 tutorials.

**How to avoid:**
- Do not add `@astrojs/node`, `@astrojs/vercel`, `@astrojs/cloudflare`, or any `output: "server"`/`output: "hybrid"` config to `astro.config.mjs` — verify after each dependency addition that `astro.config.mjs` still has no `output`/`adapter` key (i.e., stays implicitly `static`).
- After wiring each companion app, run a full `npm run build` locally (not just `astro dev`) before considering the phase done — `astro dev` runs in a browser-like dev server context and can mask build-time-only errors (like `localStorage is not defined`) that only surface in the actual static prerender step. This is the single most effective, cheap verification gate for both Pitfall 2 and this pitfall.
- Keep `firebase.json`'s hosting config unchanged (`public: dist`, no `functions` section) as an implicit assertion that nothing in this milestone requires a Cloud Function — if a future need arises (e.g. server-side state sync), that's explicitly out of scope for v1.1 per PROJECT.md ("cross-device sync deferred").
- Audit any new dependency's own dependency tree once (`npm ls` / lockfile diff) for anything unexpected pulling in a server runtime package (e.g. `express`, an adapter package) — unlikely for these two apps (React + lucide-react + Tailwind are all client/build-time-safe) but cheap to check once.

**Warning signs:**
- `astro.config.mjs` gains an `output` or `adapter` key you didn't intend to add (diff review on any PR touching this file).
- `npm run build` succeeds but `firebase deploy --only hosting` behaves unexpectedly, or the Firebase console shows a "Functions" section appearing that wasn't there before.
- `astro dev` works fine but `npm run build` fails — a strong signal of a dev-vs-build-time environment mismatch (usually the `localStorage` issue).

**Phase to address:**
Cross-cutting — enforce via a build-verification step (`npm run build` must pass locally, not just `astro dev`) as an explicit acceptance criterion on **every** phase in this milestone, not a single dedicated phase. Worth calling out once in the app-hosting-pattern phase's documentation as "the one command that must pass before any companion-app phase is considered done."

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|--------------------|-----------------|------------------|
| Reusing `Tool.app` as-is for internal routes (no schema change) | Ships faster, zero type/rule changes | Wrong `target="_blank"` semantics on same-origin routes; no future room for internal-vs-external behavior differences | Acceptable only as a throwaway spike/preview; not for the shipped admin-managed entry — do the additive field (Pitfall 7) for the real thing |
| Porting `fotf`'s CSS-in-JS without scoping, "just to see it render" locally | Fast first look at the app in-site | Real leakage risk into Nocturne the moment it's checked into a page rendered inside `Layout.astro` (Pitfall 3) | Only in an isolated local scratch page never merged/deployed |
| Using `client:only` to sidestep SSR/localStorage errors quickly | Unblocks development immediately | Silent SEO/crawlability regression that's easy to forget to revisit (Pitfall 2b) | Never for the shipped route; fine as a 5-minute local dev check, must be swapped before merge |
| Skipping the `npm run build` check and only using `astro dev` during development | Faster iteration loop | Masks build-breaking `localStorage`/SSR errors until deploy time (Pitfall 8) | Never right before considering a phase "done"; fine minute-to-minute during active editing |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|------------------|--------------------|
| `@astrojs/react` `include` glob | Widening it to `**/*` "to be safe" instead of a narrow `**/armory/**` addition | Add only the specific directory glob the companion apps live under, alongside the existing `**/admin/**`, `**/live/**` |
| Tailwind v4 install | Default `@import "tailwindcss"` in a globally-loaded stylesheet | Granular `@import "tailwindcss/theme"` + `@import "tailwindcss/utilities"` (no preflight) scoped to the bb-companion's own CSS file only |
| Firestore `tools` collection | Changing/removing the `app` field's meaning for existing docs | Additive optional field only; verify old docs still render via emulator/admin UI before shipping |
| Firebase Hosting (`firebase.json`) | Assuming a schema/rewrite change is needed for new static routes | New Astro static pages need zero `firebase.json` changes — `public: dist`, cleanUrls already handles new `.html` output automatically |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Tailwind/CSS-in-JS leaking into a shared chunk | Home/Games/Tools grow new `<script>`/`<link>` tags after this milestone | Route-scoped imports only (Pitfall 5); diff `dist/*.html` before/after | Immediately on first build with the leak present — not a "scale" issue, a correctness issue |
| lucide-react barrel import | Burning Banners route JS chunk far larger than expected | Named imports only, verify current lucide-react version (Pitfall 4) | Immediately, proportional to icon-set size (hundreds of KB if the whole set is pulled in) |
| Shipping the full ~2600-line app to a route unconditionally | Slightly slower `/armory/<slug>` route load than a pure-content page — expected and acceptable | Per-route code-splitting (already Astro's default per route/page) keeps this cost isolated to the two Armory routes only, not the marketing pages | Not a real "break" point at this project's scale (two tools, low traffic); would matter if dozens of heavy apps were added to one route |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Assuming client-side `localStorage` state needs Firestore security rules considerations | None — wasted effort touching `firestore.rules` for a feature with no Firestore writes | Confirm state is 100% `localStorage`/no Firestore calls in both companion apps' code before considering rules; leave `firestore.rules` untouched by this milestone unless the `tools` schema change (Pitfall 7) is made |
| Adding an internal-route field to `tools` docs without checking `isPublic()` still gates correctly | Low — the rule already only depends on `hidden`, unaffected by new fields, but worth a one-time confirmation | Re-run `scripts/rules.test.ts` (`npm run test:rules`) after any `Tool` schema change, even though the rule text itself isn't touched |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|--------------|-------------------|
| Companion app's own internal look visually clashes with the Nocturne shell around it (nav/footer) | Feels like two different products stapled together, undermining "own internal look — no restyle" *and* site cohesion | Accept the intentional contrast (per PROJECT.md, the app keeps its own look) but make sure the Nocturne chrome (nav/footer) is unmistakably still present and un-broken (Pitfalls 1 & 3 are what actually break this) |
| "Launch ▸" button opens an internal `/armory/<slug>` route in a new tab (`target="_blank"`) via unmodified `ToolsLive.tsx` | Confusing/wasteful new-tab for an in-site page a visitor could just navigate to | Branch `target`/`rel` on the new internal-vs-external distinction (Pitfall 7) |
| First paint of the companion app shows default/empty state before localStorage restores saved data | Brief flash may look like data was lost | Acceptable and expected per Pitfall 2's SSR-safe pattern; keep the flash brief (restore in the first `useEffect`, not gated behind other async work) |

## "Looks Done But Isn't" Checklist

- [ ] **Tailwind added for Burning Banners:** Often missing a check that the *other* three existing pages (Home/Games/Tools) are visually unchanged — verify by diffing `dist/*.html` `<link>`/`<script>` tags and eyeballing a preview build of all three before merging.
- [ ] **Companion app "works locally":** Often only verified via `astro dev`, never a real `npm run build` — verify the static build succeeds and `dist/armory/<slug>.html` contains real server-rendered content (not an empty shell), per Pitfall 8.
- [ ] **CSS-in-JS ported:** Often missing a check for whether its selectors are scoped — verify by grepping the ported `CSS` string for bare/generic selectors and confirming each is prefixed under a unique wrapper class.
- [ ] **Tool marked `status: live` with an internal route:** Often missing a check that *existing* live tools (Charlie Mike TOC, "docking soon" placeholders) still render identically in `/tools` after the schema change — verify in the admin UI/emulator, not just the new entry.
- [ ] **New `/armory/<slug>` route "looks right":** Often missing per-page OG/title (falls back to generic site defaults silently) — verify by viewing page source, not just the rendered page, and check `dist/sitemap-0.xml` includes the route.
- [ ] **lucide-react wired in:** Often not checked for peer-dependency warnings on `npm install` — verify a clean install with no `ERESOLVE` warnings, and confirm the installed version's `peerDependencies.react` range.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|-----------------|------------------|
| Tailwind preflight leaked into Nocturne pages (Pitfall 1) — discovered post-deploy | LOW–MEDIUM | Switch the Tailwind import to the granular no-preflight entry points (or add scoped-preflight plugin), rebuild, redeploy via `npm run deploy` — no data/schema involved, purely a CSS fix, safe to ship immediately once corrected |
| CSS-in-JS leaked selectors (Pitfall 3) — discovered post-deploy | LOW | Prefix the `CSS` string's selectors under the wrapper class, rebuild, redeploy — same low-risk profile as Pitfall 1's fix |
| `astro build` breaks on `localStorage` access mid-development (Pitfall 2) | LOW | Not a production incident (build never shipped) — restructure the offending code into `useEffect`, rebuild locally before ever attempting deploy |
| Tools schema change broke an existing live tool's card (Pitfall 7) — discovered post-deploy | MEDIUM | Revert the `ToolsLive.tsx`/type change via git, redeploy the last-known-good `dist/`, or hot-fix the branch guard in `ToolsLive.tsx` to tolerate the missing/present field correctly, then redeploy — no Firestore data is lost since the underlying docs are untouched by a code-only bug |
| Accidental SSR adapter added (Pitfall 8) — caught before deploy | LOW | Remove the `output`/`adapter` config from `astro.config.mjs`, remove the adapter package, rebuild — caught at build-verification time, never reaches Firebase |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|--------------------|----------------|
| 1. Tailwind global preflight leakage | Burning Banners phase (decision: no-preflight granular import, locked in app-hosting-pattern phase's documented convention) | Diff `dist/index.html`, `dist/games.html`, `dist/tools.html` `<link>`/`<script>` tags before/after; visual check of the three pages in a preview build |
| 2. SSR/localStorage build break | Fate of the Fellowship phase (establishes the `useEffect`-gated pattern first) | `npm run build` succeeds locally; no hydration warnings in browser console on `/armory/<slug>` |
| 2b. `client:only` blanking content | Fate of the Fellowship phase | View-source on `/armory/<slug>` shows real static markup, not an empty mount div |
| 3. CSS-in-JS selector leakage | Fate of the Fellowship phase (pattern reused by Burning Banners) | Grep ported `CSS` string for unscoped selectors; visual diff of Nav/Footer rendering on the armory route vs. other routes |
| 4. lucide-react bloat/peer mismatch | Burning Banners phase | Clean `npm install` with no `ERESOLVE`; named-import-only grep; bundle size sanity check on the built route chunk |
| 5. Marketing-page bundle regression | Every app phase + a milestone-level final QA pass | `dist/*.html` diff on Home/Games/Tools shows zero new script/style tags after each app ships |
| 6. SEO regression (new routes under-optimized or existing routes affected) | Each app phase (per-page SEO props) + app-hosting-pattern phase (reusable template) | View-source per-page title/description/OG on each armory route; `sitemap-0.xml` contains new routes and nothing unwanted |
| 7. Tools data-model change risk | Dedicated small phase wiring "editable Armory Tool" status for both apps | `npm run test:rules` passes; admin UI round-trips the new field; existing live tools render unchanged in `/tools` |
| 8. Free-Spark/static-build traps | Cross-cutting acceptance criterion on every phase (`npm run build` must pass, not just `astro dev`) | `astro.config.mjs` diff shows no `output`/`adapter` key added; `firebase.json` unchanged; local `npm run build` passes before any deploy |

## Sources

- Direct codebase reads (HIGH confidence): `astro.config.mjs`, `src/layouts/Layout.astro`, `src/lib/types.ts`, `src/components/live/ToolsLive.tsx`, `src/lib/firebase.read.ts`, `firestore.rules`, `firebase.json`, `package.json`, `.planning/PROJECT.md`, `.claude/CLAUDE.md`.
- npm registry direct lookup, `lucide-react@1.32.0` `peerDependencies` (2026-08-18) — HIGH confidence.
- Web search (LOW–MEDIUM confidence, cross-checked against multiple results but not a primary/official source for every claim):
  - Tailwind v4 preflight scoping — [tailwindcss-scoped-preflight (npm)](https://www.npmjs.com/package/tailwindcss-scoped-preflight), [Tailwind v4 global reset discussion #16597](https://github.com/tailwindlabs/tailwindcss/discussions/16597), [Scoping Normalized Preflight CSS (DEV)](https://dev.to/ajscommunications/scoping-normalized-preflight-css-c29), [How to Scope Tailwind CSS Styles](https://ryanschiang.com/how-to-scope-tailwind-css-styles).
  - Astro `client:only` crawlability — [Astro Docs: Islands architecture](https://docs.astro.build/en/concepts/islands/), [Astro SEO Guide 2026](https://nodeascend.com/blog/astro-js-seo-guide-2026/).
  - lucide-react React 19 peer-dep history — [lucide-icons/lucide #2951](https://github.com/lucide-icons/lucide/issues/2951), [#2134](https://github.com/lucide-icons/lucide/issues/2134), [#2216](https://github.com/lucide-icons/lucide/issues/2216), [Lucide for React docs](https://lucide.dev/guide/packages/lucide-react).
  - `localStorage is not defined` during SSR prerender — general React/Next.js SSR pattern discussions ([Rollbar](https://rollbar.com/blog/how-to-handle-localstorage-is-not-defined-error-javascript/), [Sentry](https://sentry.io/answers/referenceerror-localstorage-is-not-defined-in-next-js/)) — the underlying SSR-boundary mechanism is framework-agnostic and applies equally to Astro's prerender step.

---
*Pitfalls research for: In-site React companion apps (Astro islands) on an existing Astro/Firebase marketing site*
*Researched: 2026-08-18*
