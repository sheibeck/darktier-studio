# Environment variables

The site builds and runs from the committed seed catalog with **no configuration**.
These variables activate the live Firestore admin and production builds. Set them
in a local `.env` file — it's loaded by both `npm run dev` and `npm run deploy`
(the deploy path).

## Admin (client — inlined into the `/admin` bundle at build)

The `PUBLIC_*` Firebase web config is safe to expose; the real security boundary
is Firestore rules + the owner-UID check. Get the values from
**Firebase Console → Project settings → Your apps → Web app config**.

| Variable | Example | Notes |
|----------|---------|-------|
| `PUBLIC_FIREBASE_API_KEY` | `AIza…` | Web API key (public) |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | `darktierstudios-b846f.firebaseapp.com` | |
| `PUBLIC_FIREBASE_PROJECT_ID` | `darktierstudios-b846f` | |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | `darktierstudios-b846f.firebasestorage.app` | copy the exact value from the console (may be `.appspot.com`) |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1234567890` | |
| `PUBLIC_FIREBASE_APP_ID` | `1:123…:web:abc…` | |
| `PUBLIC_ADMIN_UID` | `a1b2c3…` | **Your Google account UID.** Only this account may edit. Find it in Firebase Console → Authentication → Users after your first sign-in. Also paste it into `firestore.rules` (replace `OWNER_UID_PLACEHOLDER`). |

## Analytics (optional — public pages only)

Both are injected by `Layout.astro` only when set, and never on `noindex`/admin
pages. Leave unset to ship no analytics. Set them in your local `.env` so
`npm run deploy` bakes them into the build. Use `PUBLIC_` (Astro's client prefix)
— a `VITE_` prefix is **not** exposed to the browser in Astro and will silently no-op.

| Variable | Example | Notes |
|----------|---------|-------|
| `PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics 4 measurement ID. From Firebase Console → Project settings → Your apps → Web app config (`measurementId`), or GA4 Admin → Data Streams. Loads the `gtag.js` snippet; **sets cookies** (unlike the cookie-free Cloudflare option below). |
| `PUBLIC_CF_ANALYTICS_TOKEN` | `abc123…` | Cloudflare Web Analytics beacon token (cookie-free). From Cloudflare → Web Analytics. |

## Build-time Firestore read (production rebuild / CI only)

The Astro build reads the live catalog from Firestore via the Admin SDK when a
service account is available. Locally this is unset and the build uses the
committed seed. In CI, set a service account secret.

| Variable | Notes |
|----------|-------|
| `FIREBASE_PROJECT_ID` | `darktierstudios-b846f` |
| `FIREBASE_SERVICE_ACCOUNT` | The service-account JSON, as a single-line secret. (Or `GOOGLE_APPLICATION_CREDENTIALS` pointing at a file.) |

## Local emulator (dev)

`npm run emulators` starts Auth + Firestore + Hosting emulators. `astro dev`
auto-connects the admin to them (`import.meta.env.DEV`). Seed the emulator with:

```
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=demo-darktier npm run seed
```
