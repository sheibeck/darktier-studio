/**
 * Seed / re-seed ONLY the `tools` collection from the committed catalog.
 * Each document is keyed by its `slug`. Idempotent — safe to run repeatedly.
 *
 * Use this (instead of the full `npm run seed`) when you only need to sync The
 * Armory — e.g. to publish the v1.1 in-site companion apps
 * (fate-of-the-fellowship, burning-banners) to production Firestore. It writes
 * the tool docs to their committed values and does NOT touch `games` or `news`,
 * and does NOT delete any tool docs that aren't in the seed.
 *
 * Usage:
 *   Emulator:    FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=demo-darktier npm run seed:tools
 *   Production:  GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json FIREBASE_PROJECT_ID=darktierstudios-b846f npm run seed:tools
 *
 * Requires Node ≥22 (run via `npm run seed:tools`, which passes --experimental-strip-types).
 */
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { tools } from "../src/data/catalog/tools.ts";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

if (!usingEmulator && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error(
    "Refusing to seed: no Firestore target configured.\n" +
      "Set FIRESTORE_EMULATOR_HOST (emulator) or GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT (production).",
  );
  process.exit(1);
}

if (!getApps().length) {
  if (usingEmulator) {
    initializeApp({ projectId: projectId ?? "demo-darktier" });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)), projectId });
  } else {
    initializeApp({ credential: applicationDefault(), projectId });
  }
}

const db = getFirestore();

async function main(): Promise<void> {
  console.log(
    `Seeding ONLY the "tools" collection (${usingEmulator ? "emulator" : "production"}${projectId ? `, project ${projectId}` : ""})…`,
  );
  const batch = db.batch();
  for (const item of tools) {
    // `hidden: false` default (public live-read query filters on it); strip undefined.
    const clean = Object.fromEntries(
      Object.entries({ hidden: false, ...item }).filter(([, v]) => v !== undefined),
    );
    batch.set(db.collection("tools").doc(item.slug), clean);
  }
  await batch.commit();
  console.log(`  ✓ seeded ${tools.length} → tools (${tools.map((t) => t.slug).join(", ")})`);
  console.log("Done. games / news left untouched.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
