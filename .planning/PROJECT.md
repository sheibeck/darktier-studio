# Darktier Studios Website

## What This Is

The public website for Darktier Studios, LLC — a one-person TTRPG and tabletop/board game design studio (Sterling Heibeck, est. 2013, Grand Rapids, MI). It showcases the studio's catalog of games (with downloadable rulebook PDFs for archive titles and print-and-play links for boxed games), a hub for the studio's companion apps/online tools, and a news/"dispatches" feed. A private admin area lets the owner sign in and edit the catalog (games, tools, news) live. The site replaces the studio's Facebook presence as the canonical home and traffic destination.

## Core Value

A fast, great-looking, search- and share-optimized public site that becomes the studio's canonical home — so links shared anywhere (formerly Facebook) drive traffic here and every game is discoverable with its cover, blurb, and download/buy link.

## Current Milestone: v1.1 In-Site Companion Apps

**Goal:** Host self-contained React companion apps directly inside the Darktier Studios Firebase app — no separate domains or Firebase projects — and ship the first two (Fate of the Fellowship, Burning Banners) as live, admin-managed entries in The Armory.

**Target features:**
- A reusable in-site app-hosting pattern: a `.tsx` companion app becomes an Astro React island at an internal route (e.g. `/armory/<slug>`), built into the same `dist/` and served from existing Firebase Hosting — documented so future artifact apps drop in with minimal work.
- Fate of the Fellowship companion live at its own crawlable, share-optimized route (React-only, self-contained CSS, localStorage — clean drop-in).
- Burning Banners companion live at its own route (adds `lucide-react` + a scoped Tailwind/styling path for its ~231 utility classes — heavier lift).
- Each app runs inside a Nocturne page shell (nav/footer) while keeping its own internal look — no restyle.
- Each app is an editable Armory Tool in the existing admin CMS — `status: live` with an internal-route target (small tools data-model addition), reorderable/hideable like the others.

**Key context:** State is local-only for MVP (browser `localStorage`, no login, no Firestore for game state; cross-device sync deferred). All v1.0 constraints hold — free Spark plan, $0/month, no Cloud Functions, manual `npm run deploy`. These are companions for third-party board games, presented as Armory tools rather than Darktier catalog games. Phase numbering continues from v1.0 (last phase 7 → v1.1 starts at Phase 8).

## Business Context

- **Customer**: Tabletop/TTRPG players and fans of Darktier Studios; the owner (Sterling) as sole admin/publisher.
- **Revenue model**: Indirect — drives sales of print-and-play games at The Game Crafter and adoption of the studio's apps; no on-site commerce in v1.
- **Success metric**: Site traffic and referral migration off Facebook (measured via privacy-friendly analytics); games/PDFs discoverable and downloaded.
- **Strategy notes**: Move the studio's presence off Facebook; the site is the destination all future promotion points to.

## Requirements

### Validated

- ✓ Public marketing site: Home, Games ("The Vault"), Tools ("The Armory"), matching the Nocturne design — v1.0
- ✓ Games catalog rendering all titles with cover art, type, publication status, synopsis, and NEW flag — v1.0
- ✓ Downloadable rulebook PDFs for archive games (AIGE, Barony, Cardomancer, Impact, Amaranthine, Baneful, Dark, Mazeworld) — v1.0
- ✓ "Shop at The Game Crafter" / print-and-play links for boxed games (EXFIL, Woe, Fate of Wæteria, Euangelion) — v1.0
- ✓ Charlie Mike showcased as in-development TTRPG linking to its live TOC companion app — v1.0
- ✓ Tools/Armory hub listing companion apps (Charlie Mike TOC live; "docking soon" slots) — v1.0
- ✓ News/Dispatches feed on the homepage (newest first) — v1.0
- ✓ Admin login (Google sign-in, single admin = owner) gating a private editor — v1.0
- ✓ Admin can create/edit/reorder/show-hide games, tools, and news, persisted to Firestore — v1.0
- ✓ Public pages read catalog data from Firestore — v1.0 (hybrid: SSR at build for SEO + live browser reads so edits show with no deploy)
- ✓ SEO + social: per-page title/description, OG + Twitter cards, canonical URLs, sitemap, favicon, JSON-LD — v1.0
- ✓ Deployed to Firebase Hosting on the custom domain darktierstudios.com over HTTPS — v1.0 (DNS cutover 2026-08-18)
- ✓ Reuse the Nocturne design system stylesheet; dark, compact, accent-as-line aesthetic preserved — v1.0

### Active

- [ ] Privacy-friendly web analytics — code shipped (Cloudflare Web Analytics); awaits owner's `PUBLIC_CF_ANALYTICS_TOKEN` to activate
- [ ] **v1.1** — In-site React companion apps hosted as Astro islands at internal Armory routes (reusable pattern + Fate of the Fellowship + Burning Banners), admin-managed, localStorage-only for MVP — see REQUIREMENTS.md

### Out of Scope

- On-site e-commerce / cart / payments — sales happen at The Game Crafter; out of scope for v1
- Multi-user accounts, player logins, or community features — single admin only; not the goal
- Email newsletter / audience-capture signup — deferred (owner chose "not yet"); may revisit
- Facebook link or embed on the site — deliberately omitted; the goal is to move away from Facebook
- Rebuilding the companion apps (Charlie Mike TOC etc.) — they remain separate Firebase apps, linked not absorbed
- Migrating the old .NET/archived site's CMS/blog engine — only assets (covers, logo, PDFs) and content are carried forward
- The design prototype's client-side "DC" React runtime + localStorage admin — replaced by a production stack

## Context

- **v1.0 shipped and live (2026-08-18).** The full site is live at https://darktierstudios.com (Firebase project `darktierstudios-b846f`, free Spark plan) with a valid SSL cert, HSTS, and http→https redirect. Stack: Astro 7 SSG + Firebase Hosting/Firestore/Auth, React islands scoped to `/admin` and the live-catalog components only. Hybrid catalog: pages SSR from build-time Firestore reads (SEO/OG) and live-refresh from Firestore in the browser, so admin edits reach visitors with no deploy. Deploy is manual-only (`npm run deploy`); CI does not deploy on push. Remaining owner steps: add the Cloudflare analytics token (ANALYTICS-01). Known minor bug: home hero references `woe.png` (now `woe.jpg`) → 404, cosmetically harmless.
- **Design is done.** A complete Claude Design project ("Darktier Studios website redesign", id `0053e32c-f354-49e3-a52c-d25ec4c88a98`) provides four page designs (Home, Games, Tools, Admin) built on the **Nocturne** design system (single `styles.css` of CSS variables + component classes; dark blue-grey ground, Inter, `#9184d9` accent used as line/glow, 8px radii, `.lighten` image wrapper). Design guidance: reuse `styles.css` verbatim, take all color/spacing/type from its tokens, Phosphor icons.
- The design prototypes render via a custom client-side "DC" React runtime (`support.js`) with data modules `games-data.js` / `tools-data.js` / `news-data.js` (localStorage-backed). This is a prototyping format and must be converted to a real, SEO-friendly production site.
- **Content & assets** come from the archived old site repo `github.com/sheibeck/darktierstudios` (read-only): 12 game cover PNGs (`darktierstudios/Content/images/projects/*_cover.png`), logo (`darktierstudios/images/logo.png`), favicon, and rulebook/character PDFs — `AIGE.pdf` (+`Aigechar.pdf`), `Barony.pdf`, `Cardomancer.pdf`, `Impact.pdf` (+`Impchar.pdf`), `amaranth.pdf` (Amaranthine), `banefulsigns_corerules.pdf` (+`banefulsigns_char.pdf`), `dark.pdf` (+`darkchar.pdf`), `mazeworld.pdf`.
- **Catalog (13 games):** charlie-mike (TTRPG, in dev, live TOC app), exfil, woe, fow (Fate of Wæteria), euangelion, cardomancer, barony, amaranthine, baneful, mazeworld, impact, aige, dark. Board games EXFIL/Woe/Fate of Wæteria/Euangelion sell print-and-play at The Game Crafter (designer page `thegamecrafter.com/designers/sterling-heibeck`).
- **Existing ecosystem:** The owner already runs the Charlie Mike TOC app on Firebase (`charlie-mike-428f0.web.app`), so a Firebase stack is familiar and consistent.
- **Owner:** Sterling Heibeck — GitHub `sheibeck`, email `sheibeck@gmail.com`. Sole developer/admin. New empty repo: `github.com/sheibeck/darktier-studio`.

## Constraints

- **Cost**: **Free tier only — $0/month.** Firebase **Spark** plan; NO Blaze/billing, NO Cloud Functions (they require Blaze). Any paid third-party service is excluded unless it has a free tier — Why: this is a personal site at low volume; the owner explicitly wants zero recurring cost.
- **Hosting**: Firebase Hosting on the free Spark plan (owner's existing platform) — Why: consistency with the Charlie Mike app; owner familiarity; static output + build-time Firestore reads stay comfortably within Spark's free limits.
- **Domain**: Custom domain `darktierstudios.com` (already owned) — Why: branding and the canonical destination for all traffic; requires DNS setup + OG/canonical URLs baked to this origin.
- **Auth**: Firebase Authentication, Google sign-in, single admin (owner's Google account) — Why: no passwords to manage; admin writes locked to the owner's UID via security rules.
- **Datastore**: Firestore for catalog data (games/tools/news); PDFs + covers served as static assets (Firebase Hosting or Storage) — Why: live editing from the admin without redeploys; simple, low-volume.
- **Design system**: Must reuse the Nocturne `styles.css` and match the approved page designs; no ad-hoc restyling — Why: design is already approved and coherent.
- **SEO**: Public pages must be crawlable and produce rich link previews (title/description/OG/Twitter) — Why: the core goal is driving discoverable traffic and good-looking shared links.
- **Launch**: Ship the full experience (public site + admin CMS + auth) before going live — Why: owner's chosen strategy ("everything before launch").

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Firebase Hosting + custom domain darktierstudios.com | Matches owner's existing Charlie Mike app; owns the domain | ✓ Good — live on darktierstudios.com over HTTPS (DNS cutover 2026-08-18; valid SSL, HSTS, http→https redirect verified) |
| Firestore as the catalog datastore (games/tools/news) | Live admin edits without redeploys; low volume | ✓ Done |
| Firebase Auth, Google sign-in, single admin (owner UID) | Simplest secure admin; no password management | ✓ Done |
| Convert design prototypes off the DC/localStorage runtime to a real SEO-friendly stack | Prototype format isn't production/SEO-suitable | ✓ Done |
| Reuse Nocturne `styles.css` verbatim; match approved designs | Design already approved and coherent | ✓ Done |
| Free tier only — Firebase Spark, no Blaze/Cloud Functions | Personal low-volume site; owner wants $0/month | ✓ Done |
| Rebuild-on-publish via GitHub Actions or a manual Publish button (NOT a Cloud Function) | Cloud Functions require the paid Blaze plan; GitHub Actions/manual keep it free | ✓ Done |
| Cloudflare Web Analytics (free, cookie-free) — not Plausible | Same privacy-friendly visits/referrers at $0 (Plausible is ~$9/mo) | ✓ Done |
| No on-site commerce; link out to The Game Crafter | Sales already handled there; keeps v1 lean | ✓ Done |
| No email capture / no Facebook link in v1 | Owner deferred email; goal is to leave Facebook | ✓ Done |
| Firebase project id is `darktierstudios-b846f` | Owner's actual project (repo is `darktier-studio`) | ✓ Done |
| Deploy manually (`npm run deploy`) + GitHub Actions; first ship to the `*.web.app` staging URL before the custom domain | Free, no Cloud Functions; verify before DNS cutover | ✓ Done |
| Client-side "Load starter catalog" button seeds Firestore as the owner | Avoids a service-account key for initial content | ✓ Done |
| Owner UID hardcoded in `firestore.rules` (not abstracted) | A UID is an identifier, not a credential; rules enforced server-side — safe. Owner chose simplicity | ✓ Done |
| **Hybrid live catalog**: public pages SSR from build-time data (SEO) AND live-read Firestore in the browser | Owner wants /admin edits visible to customers with NO deploy, while keeping SEO/OG. Reverses the earlier build-time-only decision | ✓ Done |
| Deploy is MANUAL only (no deploy on push); content is live via Firestore | GSD commits frequently — commits must not deploy. Code/design ships when the owner chooses (`npm run deploy`) | ✓ Done |
| Public read rule = `hidden == false`; live query filters on it | Keeps drafts/in-dev games private while allowing the public visible-list read | ✓ Done |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-18 — v1.1 Phase 8 (Tool Data Model & Admin Wiring) complete; Armory tools now support internal-route apps (TOOL-03/04/05 validated)*
