# `_design/` — Imported design source of truth

This folder is the **reference** for building the production site. It is imported from the Claude Design project
*"Darktier Studios website redesign"* (`0053e32c-f354-49e3-a52c-d25ec4c88a98`) and the archived old site
(`github.com/sheibeck/darktierstudios`). It is **not shipped as-is** — the Astro build reimplements these designs.

## Contents

| Path | What it is | How it's used |
|------|------------|---------------|
| `nocturne/styles.css` | The Nocturne design system (tokens + component classes). **The only stylesheet.** | Copied verbatim to `src/styles/nocturne.css`; imported globally in the base layout. Take every color/space/radius/shadow from its `var(--*)` tokens — never hardcode. |
| `prototypes/Home.dc.html` | Home page design (hero, Charlie Mike sitrep, vault preview, category cards, studio blurb, dispatches) | Reimplement as `src/pages/index.astro` + components. The `<x-dc>` template + `<script type="text/x-dc">` logic is the *DC prototype runtime* — DO NOT ship it. Read it as the visual/structural spec only. |
| `prototypes/Games.dc.html` | The Vault — full games catalog with cover, type, pub status, synopsis, PDF/shop/app buttons | Reimplement as `src/pages/games.astro`. |
| `prototypes/Tools.dc.html` | The Armory — companion apps hub | Reimplement as `src/pages/tools.astro`. |
| `prototypes/Admin.dc.html` | Admin catalog editor (games/tools/news CRUD, reorder, show/hide) | Reimplement as the React admin island at `/admin` backed by Firestore (NOT localStorage). |
| `data/games-data.js` | Canonical 13-game catalog (slug, name, type, pub, released, pdf, app, site, isNew, showcase, hidden, img, synopsis) | Source for the Firestore `games` seed. |
| `data/tools-data.js` | Tools/armory roster | Source for the Firestore `tools` seed. |
| `data/news-data.js` | Dispatches / news feed | Source for the Firestore `news` seed. |

## Design contract (from the prototypes)

- **Shell**: `.nav` header — brand logo (invert filter for the dark ground) linking Home; links `Home`, `The Vault` (games), `The Armory` (tools); a primary "Shop our games" button → `https://www.thegamecrafter.com/designers/sterling-heibeck`. Page body max-width **1240px**, side padding `clamp(20px,5vw,72px)`. Radial-gradient page background using `--color-accent-900` / `--color-bg`.
- **Aesthetic**: dark, compact, accent `#9184d9` used as line/glow (never flooded). Inter font. `.lighten` wrapper on every content photograph (cover art) so dark imagery blends into the ground. Phosphor icons.
- **Home sections** (in order): hero (woe cover as `.lighten` bg, headline "Roll initiative. / The dark tier awaits."); "Sitrep" band (Charlie Mike TOC live, `--color-section` ground); "The vault" featured grid (showcased games, 4/5 aspect cards); 3 category cards (Board & card / Roleplaying / Companions & tools); studio blurb (`#studio`); Dispatches feed (`#dispatches`, newest first, latest 5); footer.
- **The Vault**: hero, then one row per visible game — `minmax(0,300px) 1fr` grid: `.lighten` cover (460/300) + details (type kicker, name, tags [NEW / "Print & play · The Game Crafter" / "PDF archive" / AI-assisted], released label, synopsis, action buttons: "Launch the app ▸" / "Download PDF ↓" / "Visit the website ▸").
- **The Armory**: hero, then tool cards grid — number kicker, name, description, "Launch ▸" for live / "Slot reserved" for docking-soon.
- **Publication tag logic**: `pub==="tgc"` → "Print & play · The Game Crafter" (accent tag) + shop link; else → "PDF archive" (neutral tag) + PDF download when a PDF exists. `charlie-mike` is in-dev with a live app link.

## Asset manifest

All assets are pulled from the archived repo **`sheibeck/darktierstudios`** (branch `master`). Fetch via
`gh api "repos/sheibeck/darktierstudios/contents/<path>?ref=master" --jq .download_url` then download, or raw:
`https://raw.githubusercontent.com/sheibeck/darktierstudios/master/<path>`.

### Brand / covers → `public/assets/` (served by Firebase Hosting)

| Source (archive path) | Target |
|-----------------------|--------|
| `darktierstudios/images/logo.png` | `public/assets/logo.png` |
| `darktierstudios/Content/images/favicon.png` | `public/favicon.png` (+ derive `favicon.ico`) |
| `darktierstudios/Content/images/projects/AIGE_cover.png` | `public/assets/covers/aige.png` |
| `darktierstudios/Content/images/projects/amaranthine_cover.png` | `public/assets/covers/amaranthine.png` |
| `darktierstudios/Content/images/projects/baneful_cover.png` | `public/assets/covers/baneful.png` |
| `darktierstudios/Content/images/projects/barony_cover.png` | `public/assets/covers/barony.png` |
| `darktierstudios/Content/images/projects/cardomancer_cover.png` | `public/assets/covers/cardomancer.png` |
| `darktierstudios/Content/images/projects/dark_cover.png` | `public/assets/covers/dark.png` |
| `darktierstudios/Content/images/projects/euangelion_cover.png` | `public/assets/covers/euangelion.png` |
| `darktierstudios/Content/images/projects/fow_cover.png` | `public/assets/covers/fow.png` |
| `darktierstudios/Content/images/projects/impact_cover.png` | `public/assets/covers/impact.png` |
| `darktierstudios/Content/images/projects/mazeworld_cover.png` | `public/assets/covers/mazeworld.png` |
| `darktierstudios/Content/images/projects/woe_cover.png` | `public/assets/covers/woe.png` |

Note: EXFIL has no cover in the archive (it's a newer TGC title) — no cover image; render its card with the neutral placeholder. `tpn_cover.png` exists in the archive but has no matching catalog game — ignore.

### Rulebook / character-sheet PDFs → `public/pdfs/`  (game ↔ file mapping — OWNER-REVIEWABLE)

| Game (slug) | Rulebook PDF (archive `darktierstudios/Content/documents/…`) | Target | Character sheet (optional) |
|-------------|--------------------------------------------------------------|--------|----------------------------|
| aige | `AIGE.pdf` | `public/pdfs/aige.pdf` | `Aigechar.pdf` → `public/pdfs/aige-character-sheet.pdf` |
| barony | `Barony.pdf` | `public/pdfs/barony.pdf` | — |
| cardomancer | `Cardomancer.pdf` | `public/pdfs/cardomancer.pdf` | — |
| impact | `Impact.pdf` | `public/pdfs/impact.pdf` | `Impchar.pdf` → `public/pdfs/impact-character-sheet.pdf` |
| amaranthine | `amaranth.pdf` | `public/pdfs/amaranthine.pdf` | — |
| baneful | `banefulsigns_corerules.pdf` | `public/pdfs/baneful.pdf` | `banefulsigns_char.pdf` → `public/pdfs/baneful-character-sheet.pdf` |
| dark | `dark.pdf` | `public/pdfs/dark.pdf` | `darkchar.pdf` → `public/pdfs/dark-character-sheet.pdf` |
| mazeworld | `mazeworld.pdf` | `public/pdfs/mazeworld.pdf` | — |

**No PDF (do not add a Download button):** charlie-mike (in dev; links to TOC app), exfil / woe / fow / euangelion (TGC print-and-play; link to The Game Crafter).

## External links

- The Game Crafter designer storefront: `https://www.thegamecrafter.com/designers/sterling-heibeck`
- Charlie Mike TOC companion app (live): `https://charlie-mike-428f0.web.app/`
- Production domain: `https://darktierstudios.com`
