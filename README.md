# Darktier Studios — website

The public site for **Darktier Studios, LLC** — a one-person tabletop/TTRPG game studio.
Showcases the game catalog (with downloadable rulebook PDFs and print-and-play links),
a hub for companion apps, and a news/"dispatches" feed, with a private admin to edit it all.

- **Live:** https://darktierstudios.com (after DNS cutover — see the launch checklist)
- **Stack:** [Astro](https://astro.build) static site (zero-JS public pages) · [Firebase](https://firebase.google.com) Hosting + Firestore + Auth · a React island only at `/admin`
- **Design:** the [Nocturne](./_design) design system, reused verbatim (`src/styles/nocturne.css`)
- **Cost:** runs entirely on Firebase's **free Spark plan** — no Blaze, no Cloud Functions

## How it works

Public pages are **statically generated**: the build reads the catalog from Firestore
via the Admin SDK (`src/lib/catalog.ts`) and bakes it into crawlable HTML with full
Open Graph tags — so shared links preview correctly. With no Firebase configured, it
falls back to the committed seed (`src/data/catalog/*.ts`), so it always builds.

The **admin** (`/admin`) is a client-rendered React app: sign in with Google (owner only),
edit games/tools/news live in Firestore. Edits reach the public site on the next
**Publish** (a rebuild) — via GitHub Actions or `npm run deploy`. No Cloud Functions.

## Quick start

```bash
npm install
npm run dev            # http://localhost:4321  (uses the seed catalog)
```

### Local admin + emulators

```bash
npm run emulators      # Auth + Firestore + Hosting emulators (needs Java)
# in another shell, seed the emulator:
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=demo-darktier npm run seed
npm run dev            # /admin talks to the emulators in dev
```

### Security-rules tests

```bash
npm run test:rules     # spins up the Firestore emulator and runs the rules unit tests
```

## Build & deploy

```bash
npm run build          # → dist/ (static)
npm run deploy         # build + firebase deploy --only hosting
npm run deploy:rules   # deploy firestore.rules
```

Automated deploys run via **GitHub Actions** (`.github/workflows/deploy.yml`) on push to
`main`, or manually ("Actions → Deploy → Run workflow") — that manual run is the **Publish**
button: it rebuilds so the latest admin edits go live.

## Configuration

Copy the variables in [`docs/environment.md`](./docs/environment.md) into a local `.env`
(and into GitHub Actions secrets/vars for deploys): the `PUBLIC_FIREBASE_*` web config,
`PUBLIC_ADMIN_UID` (your Google UID — the only account that can edit), an optional
`PUBLIC_CF_ANALYTICS_TOKEN` (Cloudflare Web Analytics), and a `FIREBASE_SERVICE_ACCOUNT`
for the build-time Firestore read. Also replace `OWNER_UID_PLACEHOLDER` in
[`firestore.rules`](./firestore.rules) with your UID.

See [`LAUNCH.md`](./LAUNCH.md) for the full go-live checklist.

## Project structure

```
src/
  pages/            index, games, tools, admin, 404
  layouts/          Layout.astro (SEO head, OG, JSON-LD)
  components/       Nav, Footer, admin/ (React island)
  lib/              catalog (build-time loader), types, display, firebase.client
  data/             site.ts, catalog/*.ts (seed source of truth)
  styles/           nocturne.css (design system), site.css
scripts/            seed-firestore, rules.test, gen-assets, stamp-build
public/             covers, pdfs, icons, robots.txt, manifest
_design/            imported design source (Nocturne + prototypes) — reference only
.planning/          GSD roadmap, requirements, phase summaries
```
