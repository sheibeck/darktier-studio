# Environment variables

The site builds and runs from the committed seed catalog with **no configuration**.
These variables activate the live Firestore admin and production builds. Set them
in a local `.env` file for dev, and as GitHub Actions secrets/vars for deploys.

## Admin (client — inlined into the `/admin` bundle at build)

The `PUBLIC_*` Firebase web config is safe to expose; the real security boundary
is Firestore rules + the owner-UID check. Get the values from
**Firebase Console → Project settings → Your apps → Web app config**.

| Variable | Example | Notes |
|----------|---------|-------|
| `PUBLIC_FIREBASE_API_KEY` | `AIza…` | Web API key (public) |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | `darktier-studio.firebaseapp.com` | |
| `PUBLIC_FIREBASE_PROJECT_ID` | `darktier-studio` | |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | `darktier-studio.appspot.com` | |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1234567890` | |
| `PUBLIC_FIREBASE_APP_ID` | `1:123…:web:abc…` | |
| `PUBLIC_ADMIN_UID` | `a1b2c3…` | **Your Google account UID.** Only this account may edit. Find it in Firebase Console → Authentication → Users after your first sign-in. Also paste it into `firestore.rules` (replace `OWNER_UID_PLACEHOLDER`). |

## Build-time Firestore read (production rebuild / CI only)

The Astro build reads the live catalog from Firestore via the Admin SDK when a
service account is available. Locally this is unset and the build uses the
committed seed. In CI, set a service account secret.

| Variable | Notes |
|----------|-------|
| `FIREBASE_PROJECT_ID` | e.g. `darktier-studio` |
| `FIREBASE_SERVICE_ACCOUNT` | The service-account JSON, as a single-line secret. (Or `GOOGLE_APPLICATION_CREDENTIALS` pointing at a file.) |

## Local emulator (dev)

`npm run emulators` starts Auth + Firestore + Hosting emulators. `astro dev`
auto-connects the admin to them (`import.meta.env.DEV`). Seed the emulator with:

```
FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=demo-darktier npm run seed
```
