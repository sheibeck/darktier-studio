---
quick_id: 260818-nhc
title: "Mobile-friendly: hamburger nav + mobile-friendly admin modals"
status: complete
date: 2026-08-18
commit: 61caea7
---

# Summary — 260818-nhc

Made the site usable on phones by collapsing the primary nav to a hamburger and
reworking the admin edit modals for small screens.

## Changes

- **`src/components/Nav.astro`** — Added a `.nav-toggle` hamburger button
  (`aria-expanded` / `aria-controls`) and wrapped the links + "Shop our games"
  button in `#nav-menu`. A small `is:inline` script toggles the panel and closes
  it on link click, Escape, and resize back to desktop. No JS is bundled — the
  zero-JS-by-default posture of the public pages is preserved.
- **`src/styles/site.css`** —
  - Nav: `.nav-toggle` hidden on desktop; at `max-width: 720px` the toggle shows
    and `.nav-menu` becomes an absolutely-positioned dropdown panel
    (`--color-surface`, `--color-divider`, `--shadow-lg`). The three bars fold
    into an X when open.
  - Admin modal: at `max-width: 560px` the modal is a full-width bottom sheet
    (`92dvh`, rounded top), the grid stays one column, `.dialog-actions` is
    sticky to the bottom with a surface background + top divider, and modal
    inputs are `16px` to stop iOS focus-zoom.
  - Added `.admin-table-scroll` (`overflow-x:auto`) helper.
- **`src/components/admin/Manager.tsx`** — Wrapped the list `<table>` in
  `.admin-table-scroll` (with `min-width: 520px`) so the wide admin table scrolls
  horizontally instead of overflowing the viewport.

## Verification

- `npm run build` — clean (7 pages built, no type errors).
- Browser at 657px CSS width: `.nav-toggle` renders, `.nav-menu` collapsed;
  clicking the toggle sets `aria-expanded=true` + `data-open` and reveals the
  panel with all 4 links (screenshot confirmed the X icon + dropdown).
- Admin-modal `@media (max-width: 560px)` rules confirmed present and parsed via
  the CSSOM (one-column grid, `100%`/`92dvh` bottom sheet, sticky actions, 16px
  inputs). The <=560px viewport could not be exercised live (Chrome enforces a
  ~657px minimum window width), so the modal was verified at the stylesheet level
  plus the pre-existing one-column grid rule.

## Notes / out of scope

- Did not redesign the admin table into cards or touch the in-app armory menus —
  scope was the two explicit asks (site hamburger nav + admin modals) plus the
  low-risk table scroll wrapper.
