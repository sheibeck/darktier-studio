# Stack Research — v1.1 In-Site Companion Apps

**Domain:** Hosting two prebuilt, single-file React "artifact" apps (Fate of the Fellowship, Burning Banners) as Astro islands at internal `/armory/<slug>` routes inside an existing static Astro 7 + Firebase Hosting site, without touching the Nocturne marketing pages.
**Researched:** 2026-08-18
**Confidence:** HIGH (all versions verified live against the npm registry 2026-08-18; Tailwind v4/Astro integration guidance cross-checked against Astro's own docs/blog and Tailwind's docs)

**Scope note:** This file covers ONLY the *new* packages/config this milestone needs. The existing v1.0 stack (Astro 7.2.2, `@astrojs/react` 6.0.2, React 19.2.8, Firebase 12.17.1/firebase-admin 14.2.0, astro-icon 1.1.5 + `@iconify-json/ph`, Firebase Hosting free Spark plan) is fixed and unchanged — see `.claude/CLAUDE.md` → Technology Stack for that baseline. Nothing below replaces it.

## Recommended Stack Additions

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **lucide-react** | 1.32.0 | Icon set consumed by `bb-companion.tsx` (`Swords, Coins, Flame, Crown, Landmark, ChevronRight, …` — 29 named imports) | Verified directly against the npm registry (2026-08-18; latest published same day). Peer range `react: "^16.5.1 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0"` — explicitly compatible with the project's React 19.2.8. Ships as per-icon ESM modules; named imports (`import { Swords } from "lucide-react"`) are what `bb-companion.tsx` already uses, so Vite/Rollup tree-shakes to only the ~29 icons actually referenced — the other 1000+ icons in the package never enter the island's JS bundle. This is a **separate, island-only dependency** — see "What NOT to Use" below for why it does not replace or integrate with `astro-icon`/Phosphor. |
| **tailwindcss** | 4.3.3 | Utility-class engine for `bb-companion.tsx`'s ~231 Tailwind classes (`flex`, `grid`, `gap-*`, `rounded-*`, `px-*`/`py-*`, `uppercase`, `font-mono`, etc.) | Verified against npm registry (2026-08-18; latest published 2026-07-16). v4's CSS-first engine (no `tailwind.config.js` needed) and its layer-based `@import` model are what make **route-scoping without global pollution** possible (see Q2 decision below). Sampled the file's actual classes (`px-2.5`, `py-1`, `gap-1.5`, etc.) — all are Tailwind's *default* spacing-scale tokens (0.5-increment values like 2.5/3.5 are built into Tailwind's default theme), so **no custom `tailwind.config` theme extension is needed**. |
| **@tailwindcss/vite** | 4.3.3 | Vite plugin that compiles Tailwind CSS during `astro build` | This — **not** `@astrojs/tailwind` — is the current, Tailwind-Labs-maintained way to use Tailwind v4 in Astro. Confirmed via Astro's own Tailwind integration docs and the `@astrojs/tailwind` changelog: `@astrojs/tailwind` is now legacy/deprecated, targets Tailwind v3's PostCSS-config model only, and using it against `tailwindcss@4` either fails or silently misbehaves. Peer range `vite: "^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8"` — Astro 7.2.2's bundled Vite major is inside this range. |

### Supporting Libraries / Approach (no new package)

| Item | Purpose | When to Use |
|------|---------|-------------|
| Tailwind v4 CSS-first `@layer`/`@import` skip-preflight pattern (built into `tailwindcss@4.3.3`, zero extra dependency) | Loads Tailwind's theme tokens + utility classes for the Burning Banners island **without** loading `preflight.css` (Tailwind's global browser-reset layer) | Always, for this milestone — see "Stack Patterns by Variant" below. This is the mechanism that keeps Tailwind's reset from ever touching the Nocturne Nav/Footer. |
| `@source` directive (Tailwind v4 core feature, no package) | Explicitly registers `apps/bb-companion.tsx` as a class-name scan source | Belt-and-suspenders: v4's automatic content detection should already find `apps/` (it's inside the repo, not gitignored), but `apps/` sits outside `src/` (Astro's conventional scan root), so declare it explicitly to guarantee the ~231 classes are found and nothing more is scanned. |

### Optional Fallback (only if QA finds a gap)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `tailwindcss-scoped-preflight` | 4.0.6 | Scopes Tailwind's preflight reset to a CSS selector instead of the whole document | **Do not install by default.** Only reach for this if manual QA on the live `/armory/burning-banners` page shows unstyled native browser chrome (e.g., a default button border/background bleeding through) that the skip-preflight approach leaves visible. Peer deps `postcss: "^8"`, `tailwindcss: "^4"` — compatible with the recommended `tailwindcss@4.3.3`. Third-party (not Tailwind Labs), so it's a real dependency-maintenance cost for a one-person site — prefer a handful of explicit override rules scoped under a `.bb-app` wrapper class first. |

## Installation

```bash
# Island-only icon set (Burning Banners)
npm install lucide-react

# Tailwind v4, used ONLY by the Burning Banners route's own stylesheet
npm install -D tailwindcss @tailwindcss/vite
```

Nothing else changes in `package.json`. Fate of the Fellowship needs **no new dependency at all** — it imports only `react` (already installed) and injects its own CSS via a `const CSS = \`...\`` template string, so it drops in as a plain React island with zero stack additions.

## Q1 — lucide-react: is it a drop-in for astro-icon/Phosphor?

**No — and it shouldn't be.** They solve different problems for different rendering models:

- `astro-icon` + `@iconify-json/ph` render **zero-JS, build-time SVG** as native Astro components (`<Icon name="ph:sword" />`) — correct for the Nocturne marketing pages, which ship no JS.
- `lucide-react` renders **React components at runtime** inside a hydrated island — `bb-companion.tsx` already imports icons this way (`import { Swords, Coins, … } from "lucide-react"`), because it's a self-contained artifact written against lucide's API and icon set (Phosphor's icon shapes/names don't match lucide's 1:1, so swapping would mean re-touching ~29 call sites in a 2649-line file for no benefit).

Keep them as two independent, non-overlapping dependencies: `astro-icon`/Phosphor stays scoped to the zero-JS marketing pages (unchanged), `lucide-react` is added purely as a dependency of the Burning Banners island. Because `@astrojs/react` code-splits per entry point, `/admin` and the marketing pages' JS bundles never pull in `lucide-react` at all — it only ships to visitors of `/armory/burning-banners`.

## Q2 — Tailwind scoping: comparison and recommendation

**The core risk this milestone introduces.** Tailwind's `@import "tailwindcss"` shorthand pulls in three layers: `theme.css` (design tokens), `preflight.css` (a global CSS reset — `*, ::before, ::after { margin: 0; box-sizing: border-box; }`, normalizes headings/buttons/forms, etc.), and `utilities.css` (the class generator). Preflight is a **document-wide reset**, not something CSS scoping (nesting, `<style>` blocks, Shadow DOM) can contain after the fact — it has to simply not load where you don't want it.

| Approach | Versions | How it works | Risk to Nocturne | Verdict |
|----------|----------|---------------|-------------------|---------|
| **`@astrojs/tailwind` (Astro integration)** | 6.0.2 (npm current, but flagged legacy) | PostCSS-config-driven, wraps `tailwindcss@3` semantics | N/A — **wrong tool.** Confirmed via Astro's docs/blog and the package's own changelog: it's deprecated, targets Tailwind v3, and silently misbehaves or fails against `tailwindcss@4`. | ❌ Rejected |
| **`@tailwindcss/vite` + global `@import "tailwindcss"` in a site-wide stylesheet** | tailwindcss 4.3.3, @tailwindcss/vite 4.3.3 | Standard "just add Tailwind" setup, imported from `Layout.astro`/`site.css` | Preflight resets margin/box-sizing/typography on **every** Nocturne page immediately — breaks the hand-authored `styles.css` component classes site-wide. | ❌ Rejected — this is the "polluting the marketing pages" failure mode the milestone explicitly rules out |
| **`@tailwindcss/vite` + page-scoped CSS import, full `@import "tailwindcss"` (preflight included)** | same | Tailwind entry stylesheet imported only from `src/pages/armory/burning-banners.astro`'s frontmatter, not `Layout.astro` | Astro's per-page static output means this CSS chunk is emitted only into that one page's `<head>` — other pages are unaffected. **But** the shared `Layout.astro` Nav/Footer render *inside that same page*, so preflight still resets their box-model/typography on the Burning Banners page itself. | ⚠️ Partial fix — solves cross-page leakage, not same-page leakage |
| **`@tailwindcss/vite` + page-scoped CSS import + CSS-first "skip preflight" (`@import "tailwindcss/theme.css" layer(theme); @import "tailwindcss/utilities.css" layer(utilities);`)** | same, zero extra dependency | Same page-scoped import, but the entry stylesheet never imports `preflight.css` at all — only theme tokens + utility classes generate | Preflight literally never exists anywhere in the build. Zero possibility of leaking into Nav/Footer on that page or any other. Nocturne's own CSS is completely undisturbed. | ✅ **Recommended** |
| **`tailwindcss-scoped-preflight` plugin, preflight scoped to `.bb-app`** | tailwindcss-scoped-preflight 4.0.6 (peers `postcss@^8`, `tailwindcss@^4`) | CSS-first `@plugin` that rewrites preflight's selectors to be prefixed under a chosen wrapper class | Full Tailwind parity (incl. reset) but genuinely contained to the wrapped subtree — safe for Nav/Footer even on the same page. Adds a third-party dependency + one more moving part in the build. | ✅ Solid fallback if QA needs true preflight behavior |
| **Prebuilt CLI stylesheet (`@tailwindcss/cli` compiled once into a static `.css`, linked only on that page)** | @tailwindcss/cli 4.3.3 | A small prebuild script (`npx @tailwindcss/cli -i apps/bb-companion.entry.css -o src/styles/armory-bb.generated.css --minify`) run outside the Vite/Astro pipeline entirely, wired into the existing `prebuild` npm script alongside `scripts/stamp-build.mjs` | Maximum isolation — `@tailwindcss/vite` is never registered as a Vite plugin at all, so there's zero chance of it touching any other build output. Costs an extra generated-file step and no Vite HMR for Tailwind classes during `astro dev` (acceptable since `bb-companion.tsx` is a frozen drop-in artifact, not actively iterated). | ✅ Viable low-risk alternative if you'd rather avoid a Vite plugin touching `astro.config.mjs` at all |

**Recommendation:** Use `@tailwindcss/vite` + the CSS-first **skip-preflight** pattern, imported only from the Burning Banners page. It is the least risky option that ships as an official, zero-extra-dependency Tailwind v4 pattern (no third-party scoping plugin, no bespoke build script) while making cross-page AND same-page pollution structurally impossible — preflight simply never exists in the build, so there is nothing to leak.

Concretely, `src/styles/armory-bb-tailwind.css`:

```css
@layer theme, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

@source "../../apps/bb-companion.tsx";
```

...imported only in `src/pages/armory/burning-banners.astro`'s frontmatter (`import "../../styles/armory-bb-tailwind.css";`) — never in `Layout.astro`, `nocturne.css`, or `site.css`.

**Why skipping preflight is safe here, not just convenient:** sampling `bb-companion.tsx`'s actual `className` usage shows it's overwhelmingly layout/spacing/typography-scale utilities (`flex`, `gap-*`, `rounded-sm`, `px-*`/`py-*`, `uppercase`, `font-mono`) composed with an explicit inline-style color/border system (the `C` token object + `style={{ background: C.panel, border: \`1px solid ${C.line}\` }}` on primitives like `Card`) — the component already carries its own visual "reset" for the things preflight would otherwise provide (border, background, box-sizing intent is implicit in the fixed pixel values used throughout). The one residual risk is default browser chrome on bare `<button>` elements that don't set an explicit `style` (a few exist, e.g. line 1052's icon-row button) — flag this for a quick visual QA pass on the live route; if native button styling shows through, fix it with 2–3 explicit CSS rules scoped under a `.bb-app` wrapper class rather than reaching for the scoped-preflight plugin.

**Fate of the Fellowship needs none of this** — it has zero Tailwind classes and ships its own complete CSS via the `const CSS` template string already in the file, injected as a `<style>` tag at render time. No Tailwind, no lucide-react, no new stack surface for that route at all.

## Q3 — Astro/Vite config: widening the react() island include

Current `astro.config.mjs`:

```js
react({ include: ["**/admin/**", "**/live/**"] }),
```

`@astrojs/react`'s `include`/`exclude` is a **compiler scope** (which files are allowed to contain JSX/be treated as React components), not a hydration directive — widening it does not hydrate anything by itself. Hydration is controlled per-usage by `client:*` directives on each component invocation, so adding new matched paths cannot "hydrate the whole site."

The two companion `.tsx` files live at `apps/` (repo root, outside `src/`), and the milestone's routes are `/armory/<slug>` — the actual JSX files need to be reachable from thin Astro page wrappers under `src/pages/armory/`. Add both patterns so the glob matches regardless of whether the JSX lives in `apps/` or gets referenced through a `src/components/armory/` wrapper:

```js
react({ include: ["**/admin/**", "**/live/**", "**/apps/**", "**/armory/**"] }),
```

Pattern:
- `src/pages/armory/fate-of-the-fellowship.astro` and `src/pages/armory/burning-banners.astro` each import their companion's default export from `../../../apps/{fotf,bb}-companion` and render it with `client:load` (or `client:visible` if you want to defer hydration until the island scrolls into view — reasonable here since these are single, full-page tools with no above-the-fold competing content).
- With `build.format: "file"` already set, these routes emit as `dist/armory/fate-of-the-fellowship.html` / `dist/armory/burning-banners.html` — no additional build config needed.
- No `astro.config.mjs` changes are needed beyond the one `include` array edit above. No new Vite plugin registration is required for `@astrojs/react` itself (only for `@tailwindcss/vite`, per Q2).

## Q4 — Cloud Functions / Blaze / static-output confirmation

Confirmed clean: everything above is either (a) a client-side JS dependency bundled into a static island's output (`lucide-react`), or (b) a build-time CSS compiler that runs during `astro build` on the developer's/CI's machine (`@tailwindcss/vite` / `@tailwindcss/cli`), producing plain `.css`/`.js` files under `dist/`. None of it requires an SSR adapter (`@astrojs/node`), a server runtime, or Cloud Functions — `astro build` still emits a fully static site, deployed exactly as today via `npm run deploy` → `firebase deploy --only hosting` on the free Spark plan. No new Firebase products, no Blaze upgrade, no change to the deploy command.

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| `@astrojs/tailwind` | Deprecated/legacy; built for Tailwind v3's PostCSS-config model; fails or silently misbehaves against `tailwindcss@4` | `@tailwindcss/vite` (registered directly in `vite.plugins`) |
| A global `@import "tailwindcss"` in `nocturne.css`, `site.css`, or `Layout.astro` | Loads preflight's document-wide reset onto every marketing page, breaking the hand-authored Nocturne component classes — exactly the "polluting the marketing pages" outcome this milestone rules out | A dedicated, page-scoped stylesheet imported only from `burning-banners.astro`, using the skip-preflight CSS-first pattern |
| Swapping `bb-companion.tsx`'s `lucide-react` icons for Phosphor (`astro-icon`) to "unify" the icon story | Different rendering models (build-time zero-JS SVG vs. runtime React components); Phosphor's icon set/props don't map 1:1 to lucide's, so this would mean re-touching ~29 call sites in a 2649-line file for no functional gain | Keep `lucide-react` as a separate, island-only dependency; leave `astro-icon`+Phosphor untouched for the marketing pages |
| Installing `tailwindcss-scoped-preflight` (or any preflight-scoping plugin) up front, "just in case" | Third-party dependency-maintenance cost for a one-person, low-maintenance site, for a problem (native-element chrome) that may not even manifest given the component's existing inline-style system | Skip preflight entirely first; add scoped-preflight (or a few explicit override rules) only if live QA shows a real gap |
| Widening `react({ include: [...] })` to something broad like `"**/*"` or `"src/**"` | Would allow JSX anywhere in the project and is unnecessary — only `apps/` (companion source) and `armory` (route wrappers) need it | The two explicit, narrow glob additions in Q3 |
| Adding a `tailwind.config.js` / `tailwind.config.ts` (v3-style JS config) | Tailwind v4 is CSS-first; a JS config file is optional legacy compatibility surface, not needed here since no custom theme values are required (all of `bb-companion.tsx`'s classes use Tailwind's default spacing/scale tokens) | The `@source`/`@import`/`@layer` directives directly in `armory-bb-tailwind.css` |

## Stack Patterns by Variant

**If QA finds unstyled native `<button>`/`<input>` chrome on the live Burning Banners route:**
- Add 2–3 explicit CSS rules scoped under a `.bb-app` wrapper class (e.g. `.bb-app button { border: 0; background: transparent; font: inherit; }`) in that page's own `<style>` block, rather than reintroducing global preflight.
- If the gaps are numerous enough that hand-patching becomes tedious, install `tailwindcss-scoped-preflight@4.0.6` and scope preflight to `.bb-app` — still zero risk to the rest of the site since it's a selector-prefixed reset, not a document-wide one.

**If a future third companion app needs Tailwind too:**
- Repeat the Q2 pattern with its own page-scoped stylesheet (e.g. `armory-<slug>-tailwind.css`) and its own `@source` line — do not consolidate multiple companion apps' Tailwind classes into one shared global stylesheet, or you reintroduce the cross-page-leak risk this research avoided.

**If a future companion app is React-only with self-contained CSS (like Fate of the Fellowship):**
- No Tailwind, no lucide-react — just a thin Astro page wrapper matched by the widened `react()` include glob and a `client:load`/`client:visible` directive. This is the "minimal drop-in" path the milestone's reusable-pattern goal is aiming for.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `lucide-react@1.32.0` | `react@19.2.8`, `react-dom@19.2.8` | Peer range `^16.5.1 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` explicitly covers React 19. |
| `@tailwindcss/vite@4.3.3` | `tailwindcss@4.3.3` (must match), `astro@7.2.2` | Peer range `vite: "^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8"`; Astro 7.2.2's bundled Vite major falls inside this range. Keep `tailwindcss` and `@tailwindcss/vite` on the same version — Tailwind ships them as a matched pair (both `4.3.3` at time of writing). |
| `tailwindcss-scoped-preflight@4.0.6` (fallback only) | `tailwindcss@^4`, `postcss@^8` | Only install if the Q2 fallback is triggered; not needed for the recommended path. |
| `@astrojs/react@6.0.2` `include` glob widening | Existing `admin`/`live` islands | Purely additive — widening the glob array does not change behavior for files that already matched `**/admin/**`/`**/live/**`; it only makes `apps/` and `armory` paths eligible to contain JSX. No React version change needed. |

## Sources

- npm registry (`registry.npmjs.org`), queried directly 2026-08-18 — `lucide-react@1.32.0` (peer deps, published 2026-08-18), `tailwindcss@4.3.3` (published 2026-07-16), `@tailwindcss/vite@4.3.3` (peer deps), `@tailwindcss/postcss@4.3.3`, `@tailwindcss/cli@4.3.3`, `@astrojs/tailwind@6.0.2` (not flagged `deprecated` in registry metadata, but confirmed legacy via docs below), `tailwindcss-scoped-preflight@4.0.6` (peer deps). Confidence: HIGH (primary source, direct registry lookup, dated same day as this research).
- [Astro Docs — @astrojs/tailwind integration guide](https://docs.astro.build/en/guides/integrations-guide/tailwind/) and [Install Tailwind CSS with Astro (tailwindcss.com)](https://tailwindcss.com/docs/installation/framework-guides/astro) — confirms `@tailwindcss/vite` as the current recommended Astro+Tailwind v4 setup (`vite.plugins`, not the `integrations` array) and that `@astrojs/tailwind` targets Tailwind v3 and is now legacy. Confidence: HIGH.
- [Astro Blog — Astro 5.2](https://astro.build/blog/astro-520/) — context on the Tailwind v4/Astro integration transition. Confidence: MEDIUM.
- [Tailwind CSS — Functions and directives](https://tailwindcss.com/docs/functions-and-directives) and [Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files) — confirms the `@layer`/`@import "tailwindcss/theme.css" layer(theme)` / `@import "tailwindcss/utilities.css" layer(utilities)` skip-preflight pattern, and the `@source` directive's role/syntax for explicit content-source registration beyond automatic (gitignore-aware) detection. Confidence: HIGH (official docs, corroborated across multiple independent write-ups).
- [tailwindcss-scoped-preflight — npm](https://www.npmjs.com/package/tailwindcss-scoped-preflight) — v4-compatible selector-scoped preflight plugin, used here only as a documented fallback. Confidence: MEDIUM.
- Direct inspection of `apps/bb-companion.tsx` (imports, `className` usage sample, `C` inline-style token object, `<button>` usage) and `apps/fotf-companion.tsx` (imports, `const CSS` template-string pattern) in this repo — grounds the "which classes/tokens are actually used" and "does it need preflight" analysis in the real source files rather than assumption. Confidence: HIGH (primary source, the actual code being shipped).
- Existing project stack baseline: `astro.config.mjs`, `package.json`, `.claude/CLAUDE.md` Technology Stack section — confirms current `react({ include: [...] })` glob, Astro 7.2.2 / React 19.2.8 / `@astrojs/react@6.0.2` versions this research builds on top of. Confidence: HIGH (primary source, repo state as of 2026-08-18).

---
*Stack research for: Astro island hosting of two prebuilt React companion apps (v1.1 In-Site Companion Apps milestone)*
*Researched: 2026-08-18*
