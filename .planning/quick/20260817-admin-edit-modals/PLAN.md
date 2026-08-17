---
type: quick
slug: admin-edit-modals
created: 2026-08-17
---

# Quick task: Admin edit forms as modals

**Ask:** On `/admin`, clicking Edit (or Add) reveals the edit form as an inline
section below the table — the user must scroll down to reach it. Make it a real
centered modal instead (more user-friendly).

**Approach:** The edit form lives in the shared `Manager` component, so one change
covers all three managers (games/tools/news). Wrap the form in the Nocturne
`.dialog-backdrop` overlay + a `.card elev-lg` dialog; add click-outside +
Escape to close and background scroll-lock. No behavior change to save/delete.

**Scope:** `src/components/admin/Manager.tsx`, `src/styles/site.css`. No new deps.
