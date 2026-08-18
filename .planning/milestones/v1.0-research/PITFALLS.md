# Pitfalls Research

**Domain:** Firebase-hosted marketing site + single-admin CMS (solo game studio, design-system reuse, SEO-first)
**Researched:** 2026-08-17
**Confidence:** MEDIUM-HIGH (Firebase/Firestore/Hosting mechanics are well-documented and cross-checked against official docs; project-specific content risks are inferred from PROJECT.md)

## Critical Pitfalls

### Pitfall 1: Client-rendered SPA is invisible to social share scrapers (OG tags never seen)

**What goes wrong:**
The site is built as a JS-rendered SPA (React/whatever) with a single `index.html` and client-side routing. Facebook's, Twitter/X's, Discord's, and Slack's link-preview scrapers do **not** execute JavaScript. They fetch the raw HTML once and read whatever `<meta property="og:*">` tags are already in the document `<head>`. If those tags are set by a JS `useEffect`/router-change after mount, every shared link — `/games/aige`, `/games/barony`, the homepage — shows the same generic (or blank) title/image, or nothing at all. This directly defeats the project's stated core goal: driving traffic off Facebook via good-looking shared links.

**Why it happens:**
Standard SPA architecture assumes browsers, not bots, are the only client. Meta tags get set via `react-helmet`-style client code because that's the natural pattern for a React app, and it works fine when testing in a real browser (which does run JS) — so the bug is invisible during normal development and only shows up when someone actually pastes a link into Facebook/Discord.

**How to avoid:**
Per-route OG/Twitter tags must be present in the **initial HTML response**, before any JS runs. For this project's scale (13 games + tools + news, low write volume), the pragmatic options in order of simplicity:
1. **Static Site Generation (SSG) at build time** — since Firestore content changes infrequently (single admin, manual edits), generate static HTML per route (home, each game, each tool, news list) at build/deploy time with the correct meta tags baked in. This is the simplest option that fully sidesteps the crawler problem and keeps hosting 100% static (cheap, fast, no cold starts).
2. **Cloud Function/Cloud Run rewrite with bot detection** — if true SSR/live data is wanted, add a `firebase.json` rewrite that routes requests to a Cloud Function, which detects the User-Agent (Facebook/Twitter/Discord/Slack/Googlebot patterns) and injects per-route meta tags server-side into `index.html`, serving the plain SPA shell to real browsers. More moving parts, cold-start latency, added cost — only worth it if content must be live-fresh in previews within seconds of an admin edit.
Given "no rebuild-on-content-change" is explicitly a named risk in this same domain (see Pitfall 7), prefer SSG **triggered by a rebuild on every admin save** (webhook/Cloud Function calls a rebuild+redeploy, or the admin write directly regenerates the static HTML for that one route) rather than a per-request SSR function — it's cheaper to run and operate for a single admin's edit cadence.

**Warning signs:**
- Pasting a game's URL into the Facebook Sharing Debugger, Twitter Card Validator, or `curl -A "facebookexternalhit"` shows generic/missing title, description, or image.
- View-source (not DevTools "Elements" — that shows the post-JS DOM) shows no per-page `<meta property="og:*">` tags in the raw response.
- All shared links produce the identical preview regardless of which game/page was shared.

**Phase to address:**
Foundational rendering-strategy phase (before any content/page-building work) — the SSG-vs-SPA decision determines the entire frontend architecture and cannot be retrofitted cheaply later. Verify with Facebook Sharing Debugger + `curl` as part of that phase's acceptance criteria, and again in a final pre-launch SEO/social QA phase across every game/tool page.

---

### Pitfall 2: Firestore security rules default-open or admin-check done wrong

**What goes wrong:**
Two common failure modes: (a) rules left in test-mode defaults (`allow read, write: if true`) after prototyping, making the entire catalog world-writable — anyone can deface game listings, delete news, or run up read/write costs; (b) admin check implemented against `request.auth.token.email == 'sterling@...'` instead of UID. Email-based checks are riskier: Google account email can theoretically change, email string comparison is easy to get wrong (case sensitivity, verified-email flag not checked), and if a second Google Workspace/alias account is ever added, the rule silently fails or silently over-grants.

**Why it happens:**
Firebase's "Start in test mode" default is deliberately permissive to unblock prototyping, and it's easy to ship it un-hardened, especially on a solo project with no code review. Email-based rules feel more "readable" than a UID string, so they get chosen without realizing UID is the actually-stable identifier bound to the Google sign-in.

**How to avoid:**
- Ship rules that default-deny: `allow write: if false;` at the top, with an explicit exception `allow write: if request.auth != null && request.auth.uid == '<owner's Google UID>';` scoped to the admin-editable collections (`games`, `tools`, `news`).
- Public reads of catalog collections can be `allow read: if true` (content is meant to be public), **except** any `draft`/`hidden`/`published: false` documents — those need `allow read: if resource.data.published == true || (request.auth != null && request.auth.uid == '<UID>')` so hidden/draft content isn't readable by unauthenticated scraping of Firestore directly (Firestore is queryable client-side; "hide" in the UI is not "hide" in the database unless rules enforce it).
- Hardcode the UID as a rules constant (not the email) since this is a genuine single-admin app — get the UID once from the Firebase Auth console after first sign-in, not from `request.auth.token.email`.
- Never confuse Firestore security rules with authorization in application code — rules are the actual security boundary; anything the client can see, an attacker can read directly via the Firestore REST/SDK regardless of what the UI hides.

**Warning signs:**
- `firestore.rules` still contains `if true` anywhere after leaving Firebase's default test-mode template.
- Rules reference `request.auth.token.email` for privileged writes.
- Draft/hidden content collections don't have a `published`/`visible` field gated in rules — only filtered client-side in a query.
- Firebase console shows the "insecure rules" warning banner.

**Phase to address:**
Datastore/backend setup phase, before any admin CMS UI is built. Verify with the Firebase Emulator Suite's rules unit tests (simulate unauthenticated write attempt, non-admin UID write attempt, draft-doc read attempt) — write these as an actual test file, not manual console checks, so they run every deploy.

---

### Pitfall 3: No open sign-up path accidentally left reachable

**What goes wrong:**
Firebase Authentication has no native "allow sign-in, deny sign-up" toggle — any Google account that completes the OAuth flow via the Firebase SDK/FirebaseUI is a valid authenticated user by default. If the admin login button/route is reachable by anyone (e.g., `/admin` is a public route with a "Sign in with Google" button and no further check), any random Google account can sign in and, if Firestore rules aren't airtight (Pitfall 2), start reading/writing admin-only data or at minimum landing inside the admin UI shell.

**Why it happens:**
Developers assume "Google sign-in" implies "only pre-approved users can get in," conflating *authentication* (proving who you are) with *authorization* (being allowed to do something). Firebase only handles the former out of the box.

**How to avoid:**
- Treat every successful Firebase Auth sign-in as untrusted until checked against the single allowed UID.
- After sign-in, immediately compare `auth.currentUser.uid` to the hardcoded owner UID; if it doesn't match, sign the user out and show "not authorized" — do this in the admin route guard, not just by hiding a nav link.
- This is a UX nicety only — the real boundary is Firestore rules (Pitfall 2), which must independently reject non-owner UIDs regardless of what the client does.
- In the Firebase Console, restrict the Google sign-in provider's **Authorized Domains** to just `darktierstudios.com` (+ the `*.web.app`/`*.firebaseapp.com` default and `localhost` for dev) so the OAuth consent screen can't be triggered from an unexpected origin.
- Do not use FirebaseUI's default "create account" flows meant for email/password multi-user apps; Google-provider-only sign-in doesn't have a separate "sign-up" step to disable, but keep the surface minimal (one button, one provider).

**Warning signs:**
- `/admin` (or wherever the CMS lives) renders any UI at all before the UID check resolves, even briefly (flash of admin content).
- No explicit "not you" / sign-out-and-reject path exists for a non-owner Google account that completes sign-in.
- Authorized Domains list in Firebase Console still has extra/unused entries.

**Phase to address:**
Auth/admin-shell phase. Verify by manually signing in with a second, non-owner Google account during that phase's acceptance testing and confirming it's rejected both in the UI and (via emulator rules test) at the data layer.

---

### Pitfall 4: Stale content after admin edits if using a rebuild-based (SSG) approach

**What goes wrong:**
If Pitfall 1 is solved via SSG (recommended), there's a new failure mode: the admin edits a game's synopsis or adds a news post in Firestore, but the publicly served static HTML doesn't change until the next build+deploy runs. For a solo maintainer without CI/CD wired to Firestore writes, this means "I updated it and it's still showing the old text" — a confusing, easy-to-ship gap, especially since the *admin preview* (if it reads live Firestore) will look correct while the *public* site doesn't.

**Why it happens:**
SSG's whole performance/SEO benefit comes from pre-baking HTML, which inherently decouples "data changed" from "page changed." Solo projects often don't invest in a rebuild pipeline because it feels like "just a website," and the gap only becomes visible after the first real content edit post-launch.

**How to avoid:**
- Wire content mutation to rebuild automatically: either (a) a Cloud Function Firestore trigger (`onWrite` on `games`/`tools`/`news`) that calls a rebuild+redeploy (e.g., triggers a Cloud Build/GitHub Actions workflow via a repository-dispatch or a deploy webhook), or (b) skip SSG-at-build-time for content pages and instead statically regenerate *only the affected route's* HTML file and re-upload it to Hosting directly from the Cloud Function (cheaper than a full rebuild for a 13-game catalog).
- At minimum, make the rebuild trigger a one-click "Publish" button in the admin UI that the owner presses after edits, with a visible "last published: [timestamp]" indicator, rather than assuming edits go live invisibly. Given single-admin, solo-maintainer, "no rebuild-on-content-change" is explicitly a known risk — an explicit, visible publish step is more honest than trying to fully automate a trigger pipeline the owner won't monitor.
- If full automation is chosen, add a status indicator in the admin UI (last successful deploy time) so a failed rebuild doesn't silently leave content stale with no signal.

**Warning signs:**
- Editing content in the admin panel and refreshing the public page shows old data.
- No deploy/build log or timestamp visible anywhere in the admin UI.
- The only way to "know" a rebuild happened is checking the Firebase Hosting console manually.

**Phase to address:**
Same phase that decides the SSG rendering strategy (Pitfall 1) — the publish/rebuild mechanism is part of that architectural decision, not an afterthought. Should be explicitly designed alongside the admin CMS write-path phase.

---

### Pitfall 5: Custom domain cutover breaks inbound links and stalls indexing

**What goes wrong:**
Moving from the old .NET archived site to `darktierstudios.com` on Firebase Hosting, without mapping old URL paths to new ones, means every inbound link (search results, forum posts, old Facebook shares, bookmarks) that pointed at the old site's paths (e.g., `/Games/AIGE`, `/Content/...`, whatever the old .NET routing used) now 404s. Search engines see a wave of 404s and demote/deindex those pages; real users hit dead ends and bounce, which is the opposite of the project's stated goal (recapturing traffic).

**Why it happens:**
"Rebuild the site" projects naturally focus on the new site's structure and treat the old one as dead/archived, forgetting that any existing backlinks, bookmarks, and search index entries still point at old paths that need to keep resolving.

**How to avoid:**
- Before cutover, catalog every meaningfully-indexed old URL path (check Google Search Console on the old property if accessible, or crawl the archived `github.com/sheibeck/darktierstudios` site structure) and add a `redirects` array in `firebase.json` mapping old paths → new equivalent paths with `"type": 301`.
- Decide apex vs `www` up front and pick one canonical form (`darktierstudios.com` is more likely the "brand" choice); use Firebase Hosting's built-in redirect checkbox when connecting the second domain so the non-canonical form 301s to the canonical one, rather than serving duplicate content on both.
- Use Firebase Hosting's Advanced Setup flow for the domain connection specifically because the old site may still be receiving DNS traffic during cutover — Advanced Setup is built for zero-downtime migration (establishes SSL/ownership before flipping DNS), avoiding an SSL-provisioning gap that would otherwise show visitors a broken/insecure-site warning mid-migration.
- After cutover, submit the updated sitemap in Google Search Console and use the URL Removal / Change of Address tooling if the property is verified, to accelerate reindexing under the new domain.

**Warning signs:**
- No inventory exists of old site URLs before DNS is flipped.
- `firebase.json` has no `redirects` section at launch.
- Search Console (if set up) shows a spike in 404/"not found" crawl errors post-launch.
- SSL certificate shows "provisioning" or a browser warning right after the domain is first connected (sign the Quick Setup path was used on a domain still serving live traffic).

**Phase to address:**
A dedicated launch/cutover phase, late in the roadmap, gated on the SEO phase being complete (sitemap, canonical URLs must exist before this matters). Old-URL inventory should be pulled during initial research/content-migration work, not invented at cutover time.

---

### Pitfall 6: Missing or malformed OG image requirements break the actual preview render

**What goes wrong:**
Even when OG tags are present (Pitfall 1 solved), previews still fail to render correctly if: the `og:image` URL is relative instead of absolute (crawlers require a fully-qualified `https://darktierstudios.com/...` URL — relative paths are silently dropped by Facebook's scraper); the image is below Facebook's practical minimum (recommended ~1200×630, and images under ~200×200 are rejected entirely for the large-preview format); the image is served with an incorrect/missing `Content-Type`; or the cover art PNGs pulled from the old archived site are the wrong aspect ratio (game cover art is typically portrait, e.g., ~2:3 for a rulebook cover — very wrong for an OG image, which wants landscape ~1.91:1) and get stretched/cropped badly in the share preview.

**Why it happens:**
The existing 12 game cover PNGs were designed for use as small in-page thumbnails/cards (per the Nocturne design, `.lighten`-wrapped cover art on game cards), not as social preview images — nobody generated a dedicated 1200×630 OG image per game as part of the original asset set. It's tempting to just reuse the cover PNG directly in `og:image` since "we already have an image."

**How to avoid:**
- Generate a dedicated OG image per game/page (1200×630, landscape) — a templated composite of the cover art on a branded dark background using Nocturne's palette/wordmark is cheap to script (e.g., a small script using the cover PNGs + logo, or even a manually-produced batch of 13 images) rather than trying to force portrait cover art into a landscape OG slot.
- Always emit `og:image` (and `twitter:image`) as absolute URLs (`https://darktierstudios.com/og/aige.png`), never `/og/aige.png`.
- Set explicit `og:image:width` / `og:image:height` tags matching the actual file dimensions — Facebook uses these to pre-allocate the preview layout and skips images where the declared/actual size mismatches badly.
- Verify every page's final render (not just presence of tags) with Facebook's Sharing Debugger and Twitter's Card Validator, per page type (home, one game, one tool, one news post) — not just spot-checked once.

**Warning signs:**
- `og:image` value starts with `/` instead of `https://`.
- OG image files are literally the same file as the in-page cover-art PNG (portrait aspect ratio).
- Sharing Debugger shows "image could not be downloaded" or a badly cropped preview.

**Phase to address:**
SEO/social phase, after page templates exist but before launch — needs a small asset-generation task (produce 13+ OG images) that should be scoped as its own checklist item, not assumed to fall out of "add meta tags."

---

### Pitfall 7: PDF hosting choices hurt both cost/bandwidth and the download UX

**What goes wrong:**
Rulebook PDFs (AIGE, Barony, Cardomancer, Impact, Amaranthine, Baneful, Dark, Mazeworld — several with companion character-sheet PDFs) are meaningful-sized static files. Two common mistakes: (a) serving them from Firebase Hosting without cache headers, so every download re-transfers the full file and every repeat visitor re-downloads instead of hitting browser/CDN cache, needlessly running up Hosting bandwidth (billed) for a free/no-revenue download; (b) not setting `Content-Disposition` deliberately, so PDFs either force-download when a user would rather preview in-browser, or open inline when the intent was "download the rulebook" — inconsistent behavior across the 8+ PDFs if some were uploaded via Hosting (which serves as static-with-default-headers) and others via Storage (different default behavior/URL signing).

**Why it happens:**
PDFs get treated as an afterthought — "just drop them in the public folder" — without configuring `firebase.json` `headers` rules for cache-control, and without deciding up front whether the studio wants "view in browser" (better for casual browsing, keeps users on-domain longer) or "force download" (clearer intent, matches "Download PDF" button copy) behavior.

**How to avoid:**
- Add explicit `headers` entries in `firebase.json` for the PDF path(s) (or Storage metadata if using Cloud Storage) setting long `Cache-Control: public, max-age=31536000, immutable` (safe because rulebook PDFs are rarely revised in place — if one is updated, ship it as a new filename/version rather than overwriting, to avoid stale-cache issues).
- Pick one consistent behavior across all PDFs: recommend inline-viewable (`Content-Disposition: inline`, default browser PDF viewer) with a separate explicit "Download" affordance if desired, since letting people preview a rulebook before committing to download is friendlier and keeps them on-site longer — but whichever is chosen, apply it uniformly to all 8+ PDFs, not per-file inconsistently.
- Serving from Firebase Hosting (not Storage) is fine and simpler for this project's scale (low volume, no need for per-user signed URLs) — Hosting's global CDN caching plus the explicit cache headers above handles bandwidth/cost fine at solo-studio traffic levels; Storage would only be worth the added complexity if per-download access control or signed URLs mattered, which they don't (PDFs are meant to be freely downloadable).

**Warning signs:**
- `firebase.json` has no `headers` section covering `**/*.pdf`.
- Network tab shows PDFs re-downloading in full on repeat visits within the cache window.
- Some PDFs open inline in-browser and others trigger a download dialog with no evident reason why.

**Phase to address:**
Asset/content-migration phase (when PDFs are pulled from the archived repo and placed into the new site), verified again in a pre-launch performance pass.

---

### Pitfall 8: Reusing Nocturne's `styles.css` incorrectly — hardcoded values instead of tokens

**What goes wrong:**
Nocturne is a CSS-custom-property-driven design system (dark blue-grey ground, `#9184d9` accent-as-line/glow, 8px radii, `.lighten` image wrapper). Two failure modes when converting the design prototype (which ran on a client-side "DC" React runtime) into production markup/components: (a) developers eyeball the rendered prototype and hardcode literal hex/px values into new component CSS/inline styles instead of referencing the existing CSS variables, so the site visually matches at launch but silently drifts the moment any token is adjusted (spacing, accent color, radius) — defeating the entire point of reusing a design system; (b) the `.lighten` treatment (a specific image-wrapper effect used for cover art) gets dropped or reimplemented slightly differently when game cards are rebuilt as real components, because it's easy to miss "just a wrapper class" when translating a prototype's DOM structure into a new component tree.

**Why it happens:**
Converting a design-prototype (localStorage/DC-runtime demo) into a real app naturally involves rewriting every component from scratch; it's much faster during that rewrite to copy a computed pixel value or observed hex from DevTools than to trace back which CSS variable governs it, especially under time pressure as a solo developer.

**How to avoid:**
- Import `styles.css` verbatim, unmodified, as the single source of design tokens — treat it as a dependency, not a starting point to fork.
- When building new components, grep the design prototype's markup for every class name used on a given element (card, button, nav) and reuse those exact classes rather than reinventing equivalent-looking CSS; only write new CSS for genuinely new structural needs, and when doing so, reference `var(--token-name)` exclusively for color/spacing/radius — never a literal hex or px copied from the rendered prototype.
- Explicitly preserve the `.lighten` wrapper class on every cover-art `<img>` in the new game-card components; add this to the phase's acceptance checklist by name since it's a small, easy-to-drop detail (not a red flag that shows up in casual visual review — it's a subtle brightness/treatment effect, not a big enough loss to be obviously "broken").
- Audit dark-theme contrast (WCAG AA, 4.5:1 body text / 3:1 large text/UI) specifically where the design uses low-opacity or muted-tone text on the dark-blue-grey ground — dark themes commonly under-shoot contrast on secondary/meta text (synopsis snippets, publication-status labels, timestamps) even when the primary text passes, and this is invisible unless explicitly checked with a contrast tool.
- Verify visible `:focus` states exist on every interactive element (nav links, admin form fields, "Download PDF" / "Shop at The Game Crafter" buttons) — dark, accent-as-line aesthetics often rely on subtle border/glow effects for hover that don't automatically produce a keyboard-visible focus ring; this needs an explicit check, not an assumption that "hover style = focus style."

**Warning signs:**
- New component CSS/inline styles contain literal `#` hex colors or raw `px` values instead of `var(--...)`.
- Cover-art images in the rebuilt game cards look flatter/more saturated than the original design prototype (missing `.lighten`).
- Tabbing through the site with keyboard-only navigation shows no visible focus indicator on links/buttons.
- Running a contrast checker against the dark theme's secondary/muted text colors shows failures.

**Phase to address:**
The page-building/component phase where the design prototype is converted to production markup; verify with a side-by-side visual diff against the original design prototype and a keyboard-navigation/contrast pass before that phase is marked done, plus a final pre-launch accessibility spot-check.

---

### Pitfall 9: Archive-reconstructed content is presented as fact without a correction path

**What goes wrong:**
Per PROJECT.md, several game synopses are reconstructed from the archived old site and may not be fully accurate (details lost or garbled in migration from the old .NET CMS). If this content ships as authoritative catalog copy with no easy way to flag/fix it, wrong game descriptions go live and stay live indefinitely (nobody but the owner would ever notice a factual error in his own game's description, and he has no workflow reminder to double check). Related: PDF↔game mapping mistakes are easy to make silently — e.g., `banefulsigns_corerules.pdf` mapped to the wrong catalog entry, or a companion character-sheet PDF (`Aigechar.pdf`, `Impchar.pdf`, `darkchar.pdf`, `banefulsigns_char.pdf`) accidentally presented as *the* rulebook instead of a supplement — and print-and-play vs. hosted-PDF classification errors (a boxed/Game-Crafter title like EXFIL or Woe incorrectly given a direct PDF download link on-site instead of routing to the Game Crafter store, or vice versa for an archive title).

**Why it happens:**
Content migration from a legacy archive is treated as a mechanical copy/seed task rather than a content-review task; with 13 games and 8+ PDF files (several with a paired character-sheet variant), it's easy to seed the Firestore catalog from a script/spreadsheet without a human re-reading each synopsis against the actual archived rulebook, and pairing/classification mistakes don't produce any error — the page just renders with wrong-but-plausible content.

**How to avoid:**
- Treat initial content seeding as a review task, not a data-migration task: for each of the 13 games, have the owner (who's the actual domain authority) explicitly confirm/edit the synopsis before the seed data is finalized, rather than trusting the archive text as-is; flag archive-derived synopses in the admin UI (e.g., a "needs review" badge) until the owner has touched each one.
- Build an explicit game→PDF(s) mapping table as part of content prep (game slug → rulebook PDF filename → optional character-sheet PDF filename) and cross-check it against the archived repo's actual file list (`AIGE.pdf`+`Aigechar.pdf`, `Barony.pdf`, `Cardomancer.pdf`, `Impact.pdf`+`Impchar.pdf`, `amaranth.pdf`, `banefulsigns_corerules.pdf`+`banefulsigns_char.pdf`, `dark.pdf`+`darkchar.pdf`, `mazeworld.pdf`) before wiring any download links, rather than inferring mapping from filename similarity alone (several filenames don't obviously match their game's display name — `amaranth.pdf`→Amaranthine, `dark.pdf`→likely "Dark" but confirm it isn't a different title, `banefulsigns_corerules.pdf`→likely "Baneful").
- Classify each of the 13 catalog entries explicitly as either "archive/PDF download" or "boxed/print-and-play (Game Crafter link)" in the seed data itself (an enum field, not inferred at render time), matching PROJECT.md's stated split (AIGE, Barony, Cardomancer, Impact, Amaranthine, Baneful, Dark, Mazeworld = PDF; EXFIL, Woe, Fate of Wæteria, Euangelion = Game Crafter; Charlie Mike = in-dev/TOC-app-linked), so a future admin edit can't accidentally mix the two link types for the same title without an explicit field change.

**Warning signs:**
- Seed data / initial Firestore import was generated by an automated script against the archive with no human sign-off step logged anywhere.
- No explicit game→PDF mapping document/table exists separate from "whatever the seeding script guessed."
- A game's detail page shows both a PDF download link and a Game Crafter link, or neither, when it should show exactly one per its classification.

**Phase to address:**
Content-migration/seeding phase, explicitly scoped as including an owner content-review pass (not just data transformation) — should be a checklist gate before that phase is marked complete, and the "needs review" flag mechanism should ship as part of the admin CMS so any remaining review debt is visible post-launch, not just at seed time.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Hardcoding admin UID directly in Firestore rules instead of a `users/{uid}.admin` doc | Simpler rules, one less collection | Rules edit + redeploy needed if admin account ever changes | Acceptable indefinitely for a genuinely single, permanent admin — this project's stated model |
| SSG with manual "Publish" trigger instead of full Firestore-onWrite auto-rebuild pipeline | Much less infra to build/maintain solo | Owner must remember to click Publish after edits | Acceptable for solo/low-frequency content changes; revisit only if edit frequency grows |
| Serving PDFs from Hosting's public dir instead of Cloud Storage | No extra service, simpler URLs, free tier friendly at this volume | No access control, no per-file analytics, manual cache-header config required | Never acceptable to skip the cache-header config; Storage migration only needed if access control is ever required (not planned) |
| Reusing archived cover-art PNGs as OG images directly (skip generating dedicated OG images) | Saves an asset-production step | Broken/ugly share previews (wrong aspect ratio) — directly undermines the project's core goal | Never acceptable — this is the one shortcut most directly opposed to the stated priority (share-driven traffic) |
| Client-only admin gating (hide nav link) without matching Firestore rules | Faster to build the admin shell | Full data-layer vulnerability — any signed-in Google account could write/delete catalog data | Never acceptable, even temporarily in a dev branch that could be deployed accidentally |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Firebase Hosting + custom domain | Using Quick Setup on a domain that's still serving live traffic on the old host, causing an SSL-provisioning gap/downtime | Use Advanced Setup for the darktierstudios.com cutover so DNS flips only after SSL/ownership is already established |
| Facebook/Twitter link scrapers | Assuming "it looks right in Chrome DevTools" means it works — DevTools shows the post-JS DOM, not what crawlers see | Always verify with Facebook Sharing Debugger + `curl -A "facebookexternalhit/1.1"` against the raw response, per page type |
| Firestore + Firebase Auth | Assuming Firebase Auth's Google sign-in has a "restrict to this user" setting somewhere in the console | There is no native allowlist for sign-in; authorization must be enforced explicitly in Firestore rules (UID check) and app logic |
| Firebase Hosting `firebase.json` redirects | Adding new-site routing (`rewrites`) but forgetting old-site path `redirects` entirely at cutover | Inventory old site paths before cutover and add explicit 301 `redirects` entries for anything indexed/linked |
| Google Search Console | Not verifying the new domain in Search Console until after launch, delaying reindexing signal and sitemap submission | Verify darktierstudios.com in Search Console and submit sitemap.xml as part of the launch phase, same day as DNS cutover |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| No cache headers on PDFs/images | Repeat visitors re-download full assets every visit; Hosting bandwidth usage climbs | Set `Cache-Control` headers in `firebase.json` for `/pdfs/**`, `/images/**` with long max-age | Noticeable on Firebase's free/Spark tier bandwidth cap first; not a real risk at this project's expected low traffic but cheap to fix upfront |
| Cover-art PNGs served at original/archive resolution instead of web-optimized sizes | Slow first paint on Games page (13 cover images), poor Lighthouse score, worse SEO ranking signal (Core Web Vitals) | Re-export/compress cover art (WebP with PNG fallback or just optimized PNG) and serve appropriately sized images for card vs. detail-page use, not one large master file everywhere | Immediately noticeable even at low traffic — this is a UX/SEO issue from day one, not a scale issue |
| SSR/Cloud Function-per-request approach (if chosen over SSG) for bot-tag injection | Added cold-start latency on first crawler hit after idle; added per-invocation cost | Prefer build-time SSG per Pitfall 1's recommendation; only use a live function if content freshness truly requires per-request rendering | Cost/latency becomes relevant only if traffic/crawl frequency grows significantly beyond a solo-studio site's expected volume |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Leaving Firestore in "test mode" rules past initial prototyping | Public catalog data fully writable/deletable by anyone with the project's client config (which is not secret — it's embedded in every page load) | Ship locked-down rules (default-deny + explicit admin-UID exception) before first production deploy, not "later" |
| Treating the Firebase client config (apiKey, projectId, etc.) as a secret to hide | Wasted effort trying to keep it out of the client bundle; it's meant to be public — real security is rules + auth, not config secrecy | Don't add `.env`-style hiding for Firebase client config; instead focus effort entirely on Firestore/Storage security rules |
| Any Storage bucket rules left at default-open if PDFs/covers move to Cloud Storage instead of Hosting | Public write access to overwrite/delete official rulebook PDFs or replace cover art | If Storage is used for any asset, mirror the same default-deny + admin-UID-write pattern as Firestore rules |
| No rate-limiting/validation on Firestore writes from the admin client | A buggy admin-UI save (e.g., an infinite retry loop) could spam writes and inflate Firestore billing | Add basic write-count sanity (debounce saves in the admin UI) — low risk at solo-admin scale, but cheap insurance |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Inconsistent PDF open-vs-download behavior across the 8+ rulebook files | Confusing/inconsistent experience per game, erodes trust in the site's polish | Standardize `Content-Disposition` behavior across all PDFs (see Pitfall 7) |
| "NEW" flag / news feed with no dates or stale entries after launch settles | Visitors can't tell how active the studio still is; a static-looking "news" feed undercuts the "canonical home" positioning | Timestamp every news entry visibly; consider auto-expiring the "NEW" flag on games after a set window |
| Broken/missing focus states on dark theme (see Pitfall 8) | Keyboard/screen-reader users can't navigate the admin panel or public nav reliably | Explicit focus-state QA pass as part of the design-system-reuse phase |
| Admin edits with no "last published" / no confirmation of what's actually live | Owner second-guesses whether an edit succeeded, especially in an SSG model with a publish step | Visible "last published" timestamp + save confirmation in the admin UI |

## "Looks Done But Isn't" Checklist

- [ ] **OG/social tags:** Present in DevTools ≠ present in raw HTML response — verify with `curl` or Sharing Debugger, not just browser inspection.
- [ ] **Sitemap.xml:** Exists ≠ correct — verify it lists every actual public route (13 game pages, tools, news, home) and excludes the admin route; verify it's referenced in `robots.txt`.
- [ ] **Admin locked down:** Login screen exists and rejects the wrong UID in the UI ≠ actually secure — verify Firestore rules independently reject a non-owner UID write attempt via the emulator, since UI gating alone is bypassable.
- [ ] **Custom domain live:** DNS resolves to darktierstudios.com ≠ fully cut over — verify SSL certificate is valid (not "provisioning"), both apex and www resolve as intended, and old-URL redirects actually 301 (not 404).
- [ ] **PDF downloads work:** Link exists and file opens ≠ correctly mapped — verify each of the 13 games' PDF (and character-sheet, where applicable) link points at the *correct* file, not just *a* file.
- [ ] **Design system reused:** Site visually resembles the Nocturne mockup ≠ actually reusing tokens — verify no hardcoded hex/px values exist in new component CSS, and `.lighten` is applied to every cover-art image.
- [ ] **Content accuracy:** Catalog seeded from archive ≠ content verified — verify the owner has reviewed/confirmed each synopsis, not just that data exists in Firestore.
- [ ] **Analytics wired:** Analytics script is loaded ≠ privacy-friendly and non-blocking — verify it doesn't set third-party cookies, doesn't block/delay page render, and is disclosed if any privacy policy/footer text references data collection.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|-----------------|-----------------|
| Shipped without per-page OG tags (Pitfall 1) | MEDIUM | Add SSG or Cloud Function bot-injection retroactively; re-scrape every previously-shared URL via Sharing Debugger's "Scrape Again" to bust Facebook's cached preview |
| Firestore rules shipped too open (Pitfall 2) | LOW | Rules are redeployed instantly (`firebase deploy --only firestore:rules`); audit Firestore data for any unauthorized writes/deletions since launch and restore from a backup/export if needed |
| Old URLs 404ing post-cutover (Pitfall 5) | LOW–MEDIUM | Add `redirects` entries retroactively for any 404s surfaced in Search Console's Coverage report; resubmit sitemap; recovery time depends on reindexing lag (days–weeks) |
| Wrong PDF↔game mapping discovered post-launch (Pitfall 9) | LOW | Fix the mapping field in Firestore via the admin UI directly; no redeploy needed since this is data, not code (assuming SSG rebuild-on-publish is wired, per Pitfall 4) |
| Contrast/focus-state accessibility gaps found late (Pitfall 8) | LOW–MEDIUM | Targeted CSS fixes referencing existing tokens; low cost if caught before launch, higher (reputational) cost if a visitor/reviewer flags it publicly first |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| SPA invisible to social crawlers (no OG in raw HTML) | Rendering-strategy/foundation phase (SSG decision) | `curl -A "facebookexternalhit/1.1"` + Facebook Sharing Debugger on every page type |
| Firestore rules default-open / wrong admin check | Datastore/backend setup phase | Emulator Suite rules unit tests: unauthenticated write, non-admin UID write, draft-doc read all denied |
| Open sign-up / unauthorized UID reaches admin UI | Auth/admin-shell phase | Manual sign-in attempt with a second, non-owner Google account; confirm UI rejection + rules rejection |
| Stale content after admin edits (SSG rebuild gap) | Same phase as SSG decision + admin write-path phase | Edit content in admin, confirm public page updates only after intended publish action, with a visible timestamp |
| Custom domain cutover breaks old links | Launch/cutover phase (near end of roadmap) | Old-URL inventory checked against `firebase.json` `redirects`; Search Console Coverage report clean post-launch |
| OG images wrong format/aspect/relative URL | SEO/social phase | Facebook Sharing Debugger + Twitter Card Validator render check per page type, not just tag presence |
| PDF caching/Content-Disposition inconsistency | Asset/content-migration phase | Network tab cache-hit check on repeat visit; consistent open/download behavior across all 8+ PDFs |
| Design tokens hardcoded / `.lighten` dropped / focus states missing | Page-building/component-conversion phase | Side-by-side visual diff vs. design prototype; keyboard-only nav pass; contrast checker on dark-theme secondary text |
| Archive-reconstructed content wrong / PDF↔game mismap / P&P vs PDF misclassification | Content-migration/seeding phase | Owner sign-off checklist per game; explicit game→PDF mapping table cross-checked against archived repo file list |

## Sources

- [Facebook Open Graph, Share Button, and Prerendering (firebase-talk)](https://groups.google.com/g/firebase-talk/c/8zg6ePs8CKI) — MEDIUM confidence (community, cross-checked pattern)
- [Dynamic meta tags for bots and crawlers using Firebase (Medium)](https://richard-0094.medium.com/dynamic-meta-tags-for-bots-and-crawlers-using-firebase-and-cloudflare-workers-b351cd7045db) — MEDIUM confidence
- [meta-seo-helper — Firebase Cloud Functions SEO meta tag helper (GitHub)](https://github.com/itsTeknas/meta-seo-helper) — MEDIUM confidence
- [Firebase: Basic Security Rules (official docs)](https://firebase.google.com/docs/rules/basics) — HIGH confidence (official)
- [Firebase: Security Rules and Firebase Authentication (official docs)](https://firebase.google.com/docs/rules/rules-and-auth) — HIGH confidence (official)
- [Firebase: Secure data access for users and groups / role-based access (official docs)](https://firebase.google.com/docs/firestore/solutions/role-based-access) — HIGH confidence (official)
- [Firebase: Connect a custom domain (Hosting, official docs)](https://firebase.google.com/docs/hosting/custom-domain) — HIGH confidence (official)
- [Firebase: Configure Hosting behavior — redirects/rewrites (official docs)](https://firebase.google.com/docs/hosting/full-config) — HIGH confidence (official)
- [Setting up redirects on Firebase Hosting (DEV Community)](https://dev.to/iggredible/setting-up-redirect-on-firebase-5cfj) — MEDIUM confidence
- [Firebase Authorization control, block signup based on rules (firebase-talk)](https://groups.google.com/g/firebase-talk/c/vmAhNeMj_VU) — MEDIUM confidence
- [Restrict Google Auth to specific users (firebase-talk)](https://groups.google.com/g/firebase-talk/c/rRLWoWXJuEY) — MEDIUM confidence
- Project-specific content risks (archive-reconstructed synopses, PDF filenames, catalog classification) — sourced directly from `.planning/PROJECT.md`, HIGH confidence as project facts

---
*Pitfalls research for: Firebase-hosted marketing site + single-admin CMS (Darktier Studios)*
*Researched: 2026-08-17*
