---
type: quick
slug: load-starter-visibility
status: complete
completed: 2026-08-17
---

# Summary: Hide "Load starter catalog" unless empty

The "Load starter catalog" seed helper now only appears on a fresh, empty project.

- `AdminApp` subscribes live (`onSnapshot`) to the `games` / `tools` / `news`
  collection sizes and sets `catalogEmpty` when all three are empty.
- The seed section (now prefixed "Your catalog is empty.") renders only when
  `catalogEmpty === true`; it disappears automatically once seeded (or whenever
  any collection has content).

**Files:** `src/components/admin/AdminApp.tsx`.
**Verify:** build green; gate wired into the admin bundle; deployed.
