---
slug: admin-live-copy
created: 2026-08-18
type: quick
---

# Quick Task: Update admin copy for the live catalog

## Description

Remove the now-inaccurate "changes reach the public site on the next Publish"
messaging throughout the admin. Since the hybrid live catalog shipped, admin
edits appear on the public site immediately on save — no Publish/deploy needed.
A deploy now only refreshes the static SSR baseline that crawlers and social
link-previews read.

## Scope

Update every admin string that claims edits require a Publish/deploy to go live:

1. `src/components/admin/AdminApp.tsx` — the explanatory `<p>` under the signed-in header
2. `src/components/admin/AdminApp.tsx` — seed-complete message ("Remember to Publish")
3. `src/components/admin/AdminApp.tsx` — games Manager description ("after Publish")
4. `src/components/admin/Manager.tsx` — save-status toast ("live on the site after Publish")
5. `src/pages/admin.astro` — footer note

## Acceptance

- No remaining "after Publish" / "next Publish" / "Remember to Publish" copy in `src/`.
- New copy accurately states edits are live immediately, and that a deploy only
  refreshes the static preview (SEO/link-previews).
- `npm run build` succeeds.
