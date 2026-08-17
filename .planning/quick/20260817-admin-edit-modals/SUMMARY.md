---
type: quick
slug: admin-edit-modals
status: complete
completed: 2026-08-17
---

# Summary: Admin edit forms as modals

Converted the admin edit/add form from an inline section (that required scrolling)
into a centered modal, in the shared `Manager` component so all three managers
(games / tools / news) get it.

- Wrapped the form in Nocturne's `.dialog-backdrop` overlay + a `.card elev-lg`
  dialog (`.admin-modal`: `min(720px,100%)` wide, `max-height:90vh`, scrolls
  internally on tall forms).
- Close on **click-outside** (backdrop `onClick`) and **Escape**; clicks inside
  the dialog don't close it (`stopPropagation`).
- **Background scroll locked** while open (`body overflow:hidden`), restored on close.
- Field grid moved to a responsive `.admin-modal-grid` (2-col → 1-col ≤560px).
- Save / Cancel / Delete behavior unchanged; `role="dialog"` + `aria-modal` for a11y.

**Files:** `src/components/admin/Manager.tsx`, `src/styles/site.css`.
**Verify:** `npm run build` green; modal wired into the admin bundle. Deployed.
