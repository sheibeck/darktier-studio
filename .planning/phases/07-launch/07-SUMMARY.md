# Phase 7: Launch & Cutover — Summary

**Built:** 2026-08-17 · **Deployed to staging:** 2026-08-17
**Mode:** mvp
**Requirements:** PUB-03 (PUB-04 dropped — no live old site)

## What was built

- Custom-domain-ready Hosting config (`firebase.json` `cleanUrls`, cache headers), `.firebaserc`.
- **`LAUNCH.md`** — full go-live checklist.
- PUB-04 (301 redirects from old-site URLs) dropped: there is no live old site — only a Facebook page and a non-live archived repo, so there are no inbound URLs to preserve.

## Live deployment (this session)

The site is **deployed and live** at **https://darktierstudios-b846f.web.app** (Firebase project `darktierstudios-b846f`, free Spark plan). Verified live: home renders, `/games` 200, `/pdfs/dark.pdf` 200 `application/pdf`, OG image 200, `robots.txt` correct.

Deployed: **Hosting** (public site + admin island) and **Firestore rules** (locked to the owner's real UID).

### Fixes made during launch

1. **Project id** — configs used the placeholder `darktier-studio` (the repo name); corrected to the real Firebase project **`darktierstudios-b846f`** in `.firebaserc`, `docs/environment.md`, `LAUNCH.md`.
2. **Env var names** — owner's `.env.local` keys didn't match; standardized on the `PUBLIC_FIREBASE_*` names (owner renamed) so the config inlines into the admin bundle.
3. **Client init crash** — `firebase.client.ts` called `getAuth()` at module load unconditionally → `auth/invalid-api-key` broke hydration when unconfigured. Guarded init on `firebaseConfigured` (shows the setup notice gracefully instead).
4. **Owner UID** — `firestore.rules` hardcoded to the owner's real UID `0z17…KFb2` (confirmed not a security concern — a UID is an identifier, not a credential; rules are enforced server-side against a verified token). `PUBLIC_ADMIN_UID` inlined at build for the UI gate.
5. **Seeding without a service account** — added a client-side **"Load starter catalog"** button to the admin so the owner (authenticated) can populate Firestore in one click, avoiding a service-account key for initial content.

## Verification

1. ⏳ **PUB-03 custom domain** — Hosting is live on the `*.web.app` URL; `darktierstudios.com` DNS cutover is the remaining owner step (`LAUNCH.md` §5).
2. ✅ Firestore rules deployed and **emulator-tested 8/8** (with the real owner UID).

## Remaining owner steps (see LAUNCH.md)

- Enable **Google** sign-in provider (Firebase Console → Authentication).
- Sign in to `/admin` → click **Load starter catalog** to populate Firestore.
- Custom domain `darktierstudios.com` DNS (A/TXT records).
- Cloudflare analytics token (`PUBLIC_CF_ANALYTICS_TOKEN`).
- Service-account secret for CI so admin edits publish to the live site (build-time Firestore read); until then the public site serves the committed seed (current catalog).
