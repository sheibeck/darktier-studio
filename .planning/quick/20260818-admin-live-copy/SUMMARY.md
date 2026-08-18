---
slug: admin-live-copy
status: complete
completed: 2026-08-18
type: quick
---

# Summary: Update admin copy for the live catalog

## What changed

Replaced all 5 admin strings that claimed edits only reach the public site
after a Publish/deploy — inaccurate since the hybrid live catalog shipped
(edits are live on save).

- `AdminApp.tsx` signed-in note → "Edits go live on the public site immediately — no deploy needed. A `npm run deploy` only refreshes the static preview that search engines and social link-previews read."
- `AdminApp.tsx` seed message → "Loaded … — live on the site now." (was "Remember to Publish.")
- `AdminApp.tsx` games Manager description → "changes appear on the public Vault immediately." (was "after Publish")
- `Manager.tsx` save toast → "Saved — live on the site now" (was "after Publish")
- `admin.astro` footer → "changes save to Firestore and go live on the public site immediately."

## Verification

- Grep for `after Publish` / `next Publish` / `Remember to Publish` / `Run workflow` in `src/` → no matches.
- `npm run build` → 5 pages built, complete.
- Pre-existing `astro check` type errors (Manager<T> Row constraint, readVisible<NewsPost>) are unrelated to this text-only change and do not block the build.

## Notes

Copy-only change; ships to visitors on the next `npm run deploy` (the admin UI
text lives in the deployed bundle, not in Firestore).
