---
type: quick
slug: delete-confirm
status: complete
completed: 2026-08-17
---

# Summary: Confirm before deleting in admin

Deleting in the admin now requires a second confirmation, in the shared
`Manager` component so games / tools / news all get it.

- Clicking **Delete {singular}** swaps the button for an inline confirm:
  "Delete this {singular}? This can't be undone." → **Yes, delete** / **Keep**.
- Two-step, in-modal (no native browser dialog); on-brand Nocturne buttons.
- The confirming state resets when the modal opens (new/edit) or closes/cancels,
  so it never carries over between items.

**Files:** `src/components/admin/Manager.tsx`.
**Verify:** `npm run build` green; confirm flow wired into the admin bundle. Deployed.
