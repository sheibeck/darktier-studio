---
quick_id: 260818-nhc
title: "Mobile-friendly: hamburger nav + mobile-friendly admin modals"
status: planned
date: 2026-08-18
---

# Quick Task 260818-nhc — Mobile-friendly site nav + admin modals

## Goal

Make the site usable on small screens:
1. The primary site navigation collapses to a hamburger menu at small widths.
2. The admin edit modals (games/tools/news managers) are comfortable to use on a phone.

## Constraints (from CLAUDE.md)

- Reuse Nocturne tokens/`styles.css`; no new colors, no utility framework. Add page/site CSS
  in `src/styles/site.css` using existing custom properties only.
- Public pages ship ~0KB app JS. The hamburger toggle uses a tiny `is:inline` script in
  `Nav.astro` (not bundled), keeping the zero-JS-by-default posture.
- Admin is a React island — modal fixes are CSS-first; the one JSX change (table scroll
  wrapper) adds no new dependency.

## Tasks

### Task 1 — Hamburger navigation
- **Files:** `src/components/Nav.astro`, `src/styles/site.css`
- **Action:**
  - Restructure `Nav.astro`: keep `.nav-brand`, add a `.nav-toggle` hamburger `<button>`
    (`aria-expanded`, `aria-controls`, `aria-label`) and wrap the nav links + "Shop our games"
    button in `<div id="nav-menu" class="nav-menu">`.
  - Add a small `is:inline` script that toggles `data-open` on the menu + `aria-expanded` on
    the button; closes on link click, Escape, and on resize back to desktop.
  - In `site.css`: `.nav-toggle` hidden on desktop; at `max-width: 720px` show the toggle and
    turn `.nav-menu` into an absolutely-positioned dropdown panel (`display:none` → shown via
    `[data-open]`), using `--color-surface`, `--color-divider`, `--shadow-lg`, spacing tokens.
    Animate the three bars into an X on `[aria-expanded="true"]`.
- **Verify:** `npm run build` succeeds; desktop nav unchanged; below 720px only the hamburger
  shows and toggles the menu.
- **Done:** Links reachable via hamburger on mobile; keyboard/Escape works; no bundled JS added.

### Task 2 — Mobile-friendly admin modals
- **Files:** `src/styles/site.css`, `src/components/admin/Manager.tsx`
- **Action:**
  - In `site.css`, extend the admin-modal block: at `max-width: 560px` make the modal a
    bottom-sheet (full width, rounded top corners, `max-height` in `dvh`), keep the grid at one
    column, make `.dialog-actions` sticky to the bottom of the scroll area with a surface
    background + top divider, and bump modal inputs to `16px` to stop iOS focus-zoom.
  - In `Manager.tsx`, wrap the `<table>` in a `div` with `overflow-x:auto` so the admin list
    scrolls instead of overflowing the viewport on phones.
- **Verify:** `npm run build` / `astro check` clean; open an edit modal at 375px wide — form is
  one column, Save/Cancel stay reachable (sticky), table scrolls horizontally.
- **Done:** Admin edit modal is fully usable on a narrow phone screen.

## Out of scope
- Redesigning the admin table into cards; deeper armory in-app menus. Focus is the two
  explicit asks (site hamburger nav + admin modals) plus the low-risk table scroll wrapper.
