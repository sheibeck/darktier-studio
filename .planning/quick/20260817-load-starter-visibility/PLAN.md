---
type: quick
slug: load-starter-visibility
created: 2026-08-17
---

# Quick task: Hide "Load starter catalog" unless empty

**Ask:** The "Load starter catalog" helper isn't needed once there's content.
Only show it when the catalog is empty; hide it otherwise.

**Approach:** In `AdminApp`, subscribe (live) to the games/tools/news collection
sizes and render the seed section only when all three are empty. It disappears
automatically right after seeding.

**Scope:** `src/components/admin/AdminApp.tsx`. No new deps.
