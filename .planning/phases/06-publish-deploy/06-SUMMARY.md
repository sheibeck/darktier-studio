# Phase 6: Publish Pipeline & Deploy — Summary

**Completed:** 2026-08-17
**Mode:** mvp · risk-flagged (rebuild wiring) — resolved to the free, no-Cloud-Functions path
**Requirements:** PUB-01, PUB-02, ANALYTICS-01

## What was built

- **Deploy pipeline** — `.github/workflows/deploy.yml`: on push to `main`, `workflow_dispatch` (the manual **Publish**), and `repository_dispatch {publish}` (future button hook). It `npm ci` → `npm run build` (with a `FIREBASE_SERVICE_ACCOUNT` secret so the build reads the **live** Firestore catalog + `PUBLIC_*` for the admin bundle) → deploys to Firebase Hosting (`FirebaseExtended/action-hosting-deploy@v0.11.0`, `channelId: live`). Concurrency-guarded. **No Cloud Functions** → stays on the free Spark plan.
- **Local deploy** — `npm run deploy` (build + `firebase deploy --only hosting`), `npm run deploy:rules`.
- **Last-published indicator** — `scripts/stamp-build.mjs` runs on `prebuild`, writing `public/build-info.json` with the build timestamp; the admin fetches it and shows "Last published <time>", plus a note explaining the Publish flow.
- **Analytics** — Cloudflare Web Analytics (free, cookie-free) injected by `Layout.astro` only when `PUBLIC_CF_ANALYTICS_TOKEN` is set and never on `noindex`/admin pages.
- **README.md** — stack, how-it-works, local dev, emulator + rules tests, build, deploy, Publish flow, config, structure.

## Verification (Success Criteria)

1. ⏳ **Build + deploy to Firebase Hosting** — `npm run build` green (5 pages); deploy pipeline (Action + `npm run deploy`) complete. **Actual live deploy needs the owner's Firebase project + login → launch checklist.**
2. ✅ **Publish propagates + visible last-published** — Publish = a rebuild (push / manual `workflow_dispatch` / `npm run deploy`) that re-reads Firestore; `build-info.json` timestamp shown in the admin. Verified `build-info.json` is generated into `dist/`.
3. ✅ **Analytics records visits/referrers, no cookie banner** — Cloudflare beacon wired, env-gated (verified: absent without a token, so no accidental tracking in dev). **Activates when the owner adds the token → launch checklist.**

## Free-tier compliance

No Blaze, no Cloud Functions. Publish is GitHub Actions (free minutes) or a local command. Analytics is Cloudflare (free). Confirmed against the project's hard cost constraint.

**Deferred (needs owner):** first real deploy + Firebase project/login; Cloudflare token.
