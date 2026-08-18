# Launch checklist — darktierstudios.com

The site is **built and verified**; it currently runs from the committed seed catalog and needs
**your Firebase project + domain** to go fully live. Everything below stays on the **free Spark plan**.
None of it requires a credit card (no Blaze, no Cloud Functions).

## 1. Firebase project

- [x] Firebase project already exists: **`darktierstudios-b846f`** (free **Spark** plan). `.firebaserc` points at it.
- [ ] **Web app**: Project settings → *Your apps* → add a Web app → copy the config values into `PUBLIC_FIREBASE_*` (see [`docs/environment.md`](./docs/environment.md)).
- [ ] Update `.firebaserc` `default` to your real project id, or run `firebase use <project-id>`.

## 2. Auth (Google, single admin = you)

- [ ] Authentication → Sign-in method → enable **Google**.
- [ ] Authentication → Settings → Authorized domains → add `darktierstudios.com`, your `*.web.app` domain, and `localhost`.
- [ ] After your first sign-in (step 5), copy **your UID** (Authentication → Users) into `PUBLIC_ADMIN_UID`, and replace `OWNER_UID_PLACEHOLDER` in [`firestore.rules`](./firestore.rules) with it.

## 3. Firestore

- [ ] Firestore Database → create (production mode).
- [ ] Deploy rules: `npm run deploy:rules` (after replacing the owner UID above).
- [ ] Seed production data once: Project settings → *Service accounts* → Generate new private key, then
      `GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json FIREBASE_PROJECT_ID=<id> npm run seed`.
      *(Keep the key file out of git — it matches `*-service-account*.json` in `.gitignore`.)*

## 4. Deploy

- [ ] `firebase login`, then `npm run deploy` — the site goes live at `https://<project-id>.web.app`.
- [ ] Or set GitHub Actions secrets/vars and push to `main` (the `Deploy` workflow builds + deploys).
      Secrets: `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT` (the JSON), `PUBLIC_FIREBASE_API_KEY`,
      `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `PUBLIC_FIREBASE_APP_ID`, `PUBLIC_ADMIN_UID`.
      Vars: `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_STORAGE_BUCKET`, `PUBLIC_CF_ANALYTICS_TOKEN`.

## 5. Custom domain (PUB-03)

- [ ] Hosting → Add custom domain → `darktierstudios.com` → follow **Advanced setup**.
- [ ] At your DNS registrar, add the **A records** Firebase shows (and the **TXT** record to verify ownership).
- [ ] Add `www.darktierstudios.com` too (Firebase can redirect it to the apex).
- [ ] Wait for SSL to provision (minutes–hours). Firebase issues the certificate automatically.

## 6. Analytics (free)

- [ ] Cloudflare → Web Analytics → add `darktierstudios.com` (JS beacon, no DNS change needed) → copy the token.
- [ ] Set `PUBLIC_CF_ANALYTICS_TOKEN` (GitHub Actions var) and redeploy. The beacon then loads on public pages only.

## 7. Post-launch verification

- [ ] **Facebook Sharing Debugger** (<https://developers.facebook.com/tools/debug/>) → scrape the URL → confirm the OG image/title render (this is the whole point of moving off Facebook — shared links look good).
- [ ] **X/Twitter Card Validator** → confirm the summary_large_image card.
- [ ] **Google Rich Results Test** → confirm Organization + Game structured data.
- [ ] **Google Search Console** → add the property → submit `https://darktierstudios.com/sitemap-index.xml`.
- [ ] Sign in to `/admin` with your Google account (confirm no other account can edit).
- [ ] **Publish test**: edit a game in `/admin` → Actions → *Deploy* → *Run workflow* → confirm the change appears live and the admin's "Last published" updates.

## Ongoing: how to publish

Edit in `/admin` (saves to Firestore) → **Publish** = run the *Deploy* workflow (Actions → Deploy → Run workflow)
or `npm run deploy` locally. The rebuild reads the latest Firestore data into the static site.

---

### Already done for you

Astro site + Nocturne design · all pages (Home / Vault / Armory / 404) from real catalog data ·
23 assets migrated (11 covers, 8 rulebooks, 4 character sheets) · SEO (meta/OG/Twitter/sitemap/robots/JSON-LD)
+ a 1200×630 share image · admin CMS (Google sign-in, owner-only CRUD) with **emulator-verified** Firestore
rules (8/8) · GitHub Actions deploy + manual Publish · Cloudflare-analytics wiring. Build is green.

## v1.1 companion apps — go-live

The Armory companion apps (Fate of the Fellowship, Burning Banners) are built, wired in, and
verified with a zero-regression build. The remaining steps — deploy, seeding the two live
production Firestore tool docs, owner play-throughs, and post-deploy confirmation — are compiled
in [`docs/go-live-v1.1.md`](./docs/go-live-v1.1.md).
