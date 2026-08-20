# v1.1 go-live checklist — companion apps (Armory)

**Status: the autonomous work for this milestone is complete.** Both companion apps (Fate of the
Fellowship, Burning Banners) are built, wired into The Armory, added to the canonical seed
catalog, documented, and verified with a zero-regression `npm run build`. Everything below is the
**owner's** remaining go-live steps — deliberately deferred, since they touch production
deploy/data and are outward-facing, owner-authorized actions (see
[`.planning/phases/11-go-live-pipeline-docs/11-CONTEXT.md`](../.planning/phases/11-go-live-pipeline-docs/11-CONTEXT.md)).

## Already done (no action needed)

- Both apps built, code-split to `/armory/fate-of-the-fellowship` and `/armory/burning-banners`.
- Both registered in `src/lib/armoryApps.ts` and dispatched in `src/pages/armory/[slug].astro`
  (build-time `DISPATCHED_SLUGS` guard verified).
- Both added to the committed seed catalog `src/data/catalog/tools.ts` as
  `status:"live"`, `kind:"internal"`, slugs matching the registry exactly.
- The reusable drop-in guide: [`docs/adding-a-companion-app.md`](./adding-a-companion-app.md).
- `.claude/CLAUDE.md` stack notes corrected (Tailwind scoped exception, React include scope).
- `npm run build` verified: marketing pages ship ~0KB app JS, no `output`/`adapter` (fully
  static, free Spark plan), both `/armory/<slug>` routes emit and appear in the sitemap, both
  apps listed as live tools on the built `/tools` page.

## Remaining owner actions

### 1. Deploy

Run the existing `npm run deploy` (build + `firebase deploy --only hosting`) when you're ready to
publish. This is the owner-authorized, outward-facing step — see [`LAUNCH.md`](../LAUNCH.md) §4
for the deploy details. The code and seed side are already done and verified; this step just ships
the built `dist/` to `darktierstudios.com`.

### 2. Seed the two live production Firestore `tools` docs

The built site reads the catalog from Firestore at build time (with the committed seed as a
fallback), so the two new tool records need to exist in **production Firestore** — not just the
seed file — before or at deploy:

- Add `fate-of-the-fellowship` and `burning-banners` via either:
  - The admin CMS's **"Load starter catalog"** action (Firebase Console-authenticated `/admin`
    UI), or
  - The seed script: `GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json FIREBASE_PROJECT_ID=<id>
    npm run seed` (see [`docs/environment.md`](./environment.md) and [`LAUNCH.md`](../LAUNCH.md)
    §3 for the credential/env details).
- For each: slug must match the registry exactly (`fate-of-the-fellowship`,
  `burning-banners`), `status: "live"`, `kind: "internal"`.

### 3. Owner browser play-throughs

Accumulated across Phases 8–10 — quick manual spot-checks, not full QA passes:

- **Phase 9 — Fate of the Fellowship** (`/armory/fate-of-the-fellowship`): confirm it's playable,
  the Nocturne shell/header stays intact around it, and state persists across a reload and
  survives a reset.
- **Phase 10 — Burning Banners** (`/armory/burning-banners`): confirm basic and advanced modes,
  the turn/income/revolt/coven/collapse trackers, save, and reset all work. Also glance at the
  FOTF armory page (`/armory/fate-of-the-fellowship`) while you're there — both apps share the
  same `[slug].astro` route template, so this confirms per-app CSS stays scoped and neither app's
  styles bleed into the other's page.
- **Phase 8 — admin internal-tool spot-check**: in `/admin`, create or edit an internal-kind
  tool, reorder it, toggle it hidden/visible, and confirm its Launch link opens same-tab at
  `/armory/<slug>` rather than a new tab.

### 4. Post-deploy confirmation

Once deployed, on the live `darktierstudios.com`:

- `/tools` shows both Fate of the Fellowship and Burning Banners as live tools.
- Each Launch opens in-site at `/armory/<slug>` without leaving the domain (same-tab).

---

Once all four items above are checked off, the v1.1 companion-apps milestone is fully live.
