---
type: quick
slug: delete-confirm
created: 2026-08-17
---

# Quick task: Confirm before deleting in admin

**Ask:** The admin's "Delete {game/tool/post}" button deletes instantly — add a
verification step so it can't happen by accident.

**Approach:** In the shared `Manager` component (covers all three managers), make
Delete a two-step, in-modal confirm ("Delete this X? This can't be undone" →
Yes, delete / Keep) rather than a native dialog. Reset the confirming state when
the modal opens/closes or switches items.

**Scope:** `src/components/admin/Manager.tsx`. No new deps.
