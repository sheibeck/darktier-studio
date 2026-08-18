# Phase 2: Content & Data — Summary

**Completed:** 2026-08-17
**Mode:** mvp
**Requirements:** DATA-01, DATA-02, DATA-03, DATA-04

## What was built

- **Asset migration** — 11 game covers → `public/assets/covers/<slug>.png` and 8 rulebook PDFs + 4 character sheets → `public/pdfs/`, pulled from the archived repo (`sheibeck/darktierstudios`). EXFIL has no archive cover (renders coverless); `tpn_cover.png` correctly ignored (no matching game).
- **Data model** — `src/lib/types.ts`: `Game` / `Tool` / `NewsPost` with `slug`, `pub` (tgc|pdf|dev), `visible`(via `hidden`), `order`, `showcase`/`isNew`, plus `pdf`/`charSheet`/`app`/`site`/`img` paths.
- **Seed data (source of truth)** — `src/data/catalog/{games,tools,news}.ts`: all 13 games with production asset paths and the owner-reviewed game↔PDF mapping baked in, 3 tools, 2 dispatches.
- **Build-time loader** — `src/lib/catalog.ts`: reads Firestore via the Admin SDK when configured (CI/production), else falls back to the committed seed (local/first deploy); empty collection also falls back. `getGames/getTools/getNews/getFeaturedGames/getLatestNews` return visible, ordered items. **No client-side Firestore reads** — build-time only (SEO-safe). Display helpers in `src/lib/display.ts`.
- **Seed script** — `scripts/seed-firestore.ts` (`npm run seed`): pushes the catalog to Firestore (emulator or production), keyed by slug, idempotent.
- **Firebase config** — `firebase.json` (Firestore rules+indexes, Hosting `public: dist` + `cleanUrls` + asset cache headers, emulators for auth/firestore/hosting), `.firebaserc` (placeholder project `darktier-studio` — owner sets real id), interim `firestore.rules` (public read of non-hidden, all writes denied — Phase 5 hardens), `firestore.indexes.json`.

## Verification (Success Criteria)

1. ✅ **Firestore collections modelled** — games/tools/news, doc id = slug, `visible`/`order`/`showcase`/`isNew` fields (types + seed).
2. ✅ **Reusable seed script** — `scripts/seed-firestore.ts` populates emulator or production from the committed catalog (all 13 games, 3 tools, 2 dispatches).
3. ✅ **Owner-reviewed PDF↔game mapping** — verified: `amaranth.pdf`→Amaranthine, `banefulsigns_corerules.pdf`→Baneful, etc.; runtime check confirms all 8 rulebook PDFs + covers referenced by the data exist on disk (0 missing).
4. ✅ **Covers/PDFs as static hosted assets w/ cache headers** — under `public/`, `Cache-Control` set in `firebase.json` (`/assets/**`, `/pdfs/**` = 1 week; hashed `/_astro/**` = 1 yr immutable).
5. ✅ **Build-time Admin-SDK loader, no client reads** — `src/lib/catalog.ts` fetches server-side at build; falls back to seed with zero config. `npm run build` passes.

**Deferred to verification:** live emulator seed run + Firestore read path exercised in Phase 5 (needs Java/emulator); locally the seed-fallback path is proven and the build is green.
