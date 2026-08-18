# Phase 5: Auth & Admin CMS — Summary

**Completed:** 2026-08-17
**Mode:** mvp · risk-flagged (Firestore rules) — **VERIFIED via emulator, not deferred**
**Requirements:** AUTH-01..03, ADMIN-01..06

## What was built

- **React island at `/admin`** — `@astrojs/react` added, scoped to `**/admin/**` so public pages ship zero React. `admin.astro` mounts `<AdminApp client:only="react">` with `noindex` + its own minimal header (not linked from public nav → ADMIN-06).
- **Firebase client** — `src/lib/firebase.client.ts`: app/auth/Firestore from `PUBLIC_*` env, `GoogleAuthProvider`, `ADMIN_UID` gate, `firebaseConfigured` flag, dev emulator auto-connect. Loaded only by the admin island.
- **Auth flow** — `AdminApp.tsx`: not-configured notice → "Sign in with Google" (`signInWithPopup`) → owner check (`uid === PUBLIC_ADMIN_UID`) → "not authorized" (shows UID, sign-out) for anyone else → full editor for the owner, with sign-out.
- **CRUD** — generic `Manager` (`useCollection` hook: live `onSnapshot`, `setDoc`/`deleteDoc`/`updateDoc`, batched reorder) drives three managers (games/tools/news). Each: add / edit (schema-driven form) / delete / reorder (↑↓) / show-hide toggle; games also toggle showcase + NEW. All Nocturne classes (`.table`, `.card`, `.btn`, `.input`, `.tag`) — matches the Admin prototype. New docs get a slugified, de-duplicated id.
- **Security rules (hardened)** — `firestore.rules`: public read of non-hidden docs; writes + hidden-doc reads restricted to a single owner UID (`OWNER_UID_PLACEHOLDER`, owner replaces at launch). Catch-all denies everything else.
- **Rules unit tests** — `scripts/rules.test.ts` (`@firebase/rules-unit-testing` + `node --test`), run via `npm run test:rules` (spins up the Firestore emulator with `firebase.test.json` on port 8085 to avoid conflicts).
- **Docs** — `docs/environment.md` lists all `PUBLIC_FIREBASE_*` / `PUBLIC_ADMIN_UID` / service-account vars (`.env.example` is permission-blocked in this environment).

## Verification (Success Criteria)

1. ⏳ **Owner sign-in/out via Google** — implemented; interactive Google sign-in needs the owner's real Firebase project + account → **deferred to launch checklist**.
2. ✅ **Emulator rules-unit tests** — `npm run test:rules` → **8/8 pass**: unauthenticated write denied, non-owner write denied, owner write allowed, public read of visible allowed, unauthenticated & non-owner read of hidden denied, owner read of hidden allowed, unknown-collection write denied even for owner.
3. ✅ **Full CRUD for games/tools/news** — three managers with all fields; build clean; admin island hydrates (`/_astro/AdminApp.js`).
4. ✅ **Reorder + visibility/showcase/NEW toggles persist** — `updateDoc`/batched-`writeBatch` against Firestore; live `onSnapshot` reflects changes.
5. ✅ **`/admin` unindexed + unlinked** — `noindex` meta, excluded from sitemap, no public nav/footer link.

**Bonus:** end-to-end data path verified — `npm run seed` wrote 13/3/2 docs to the emulator and the Admin SDK read them back with field integrity (closes DATA-02 live).

**Deferred (needs owner credentials):** live Google sign-in; setting `PUBLIC_ADMIN_UID` + replacing `OWNER_UID_PLACEHOLDER` with the real UID.
