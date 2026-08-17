# Phase 3: Public Pages — Summary

**Completed:** 2026-08-17
**Mode:** mvp
**Requirements:** SITE-02, SITE-05, SITE-06, GAME-01..06, TOOL-01/02, NEWS-01/02

## What was built

- **Home** (`index.astro`) — featured vault (3 showcased games from `getFeaturedGames`, cover art + NEW badge + type + blurb) and the dispatches feed (`getLatestNews`, newest first, tag/date/title/body/optional read-more) now render from real data; static hero, sitrep, category cards and studio blurb retained.
- **The Vault** (`games.astro`) — one row per visible game from `getGames`: `.lighten` cover (`<img>` with alt, or an accent placeholder), type kicker, name, tag row (NEW / publication tag / AI-assisted / released label), synopsis, and action buttons. Each row carries `id={slug}` with `scroll-margin-top` for deep links (`/games#woe`).
- **Per-game action logic** — Charlie Mike → "Launch the app" (+ "In development" tag); tgc games (EXFIL, Woe, Fate of Wæteria, Euangelion) → "Shop at The Game Crafter"; pdf games → "Download PDF" + "Character sheet" where present.
- **The Armory** (`tools.astro`) — tool cards from `getTools`: numbered kicker, live/soon state, description, "Launch" for live (accent border) / "Slot reserved" for docking-soon.
- **404** (`404.astro`) — on-brand not-found page, `noindex`, with routes back to Home/Vault/Armory.
- Page-specific layout lives in scoped `<style>` blocks using Nocturne tokens only.

## Verification (Success Criteria) — all confirmed in built `dist/` HTML

1. ✅ Home shows hero, sitrep, vault preview (Charlie Mike / Woe / Fate of Wæteria), category cards, studio, dispatches (both posts, "August 17, 2026").
2. ✅ Vault lists 13 games with cover/type/pub/synopsis; 1 NEW badge (Charlie Mike); showcased games featured on Home.
3. ✅ 8 "Download PDF" links (aige, amaranthine, baneful, barony, cardomancer, dark, impact, mazeworld) + 4 character-sheet links; 4 "Shop at The Game Crafter" buttons (EXFIL/Woe/Fate of Wæteria/Euangelion); Charlie Mike reads "In development" and links to the live TOC app.
4. ✅ Every game row has `id={slug}` (deep-linkable); Armory shows "Launch" (live) and "Slot reserved" (soon).
5. ✅ Content present in raw HTML with no JS (grep on static files); 11 covers carry `alt="… cover art"`; custom 404 renders ("Off the map").

**Build:** `npm run build` → 4 pages + sitemap, 0 errors.
