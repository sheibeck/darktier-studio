/**
 * Seed / re-seed Firestore with the committed catalog (games, tools, news).
 * Each document is keyed by its `slug`. Idempotent — safe to run repeatedly.
 *
 * Usage:
 *   Emulator:    FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=demo-darktier npm run seed
 *   Production:  GOOGLE_APPLICATION_CREDENTIALS=./service-account.json FIREBASE_PROJECT_ID=<project-id> npm run seed
 *
 * Requires Node ≥22 (run via `npm run seed`, which passes --experimental-strip-types).
 */
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { games } from "../src/data/catalog/games.ts";
import { tools } from "../src/data/catalog/tools.ts";
import { news } from "../src/data/catalog/news.ts";

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

async function seedCollection(name: string, items: Array<{ slug: string }>): Promise<void> {
  const batch = db.batch();
  for (const item of items) {
    // Firestore rejects `undefined`; strip any undefined-valued keys.
    const clean = Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined));
    batch.set(db.collection(name).doc(item.slug), clean);
  }
  await batch.commit();
  console.log(`  ✓ seeded ${items.length} → ${name}`);
}

async function main(): Promise<void> {
  console.log(`Seeding Firestore (${usingEmulator ? "emulator" : "production"}${projectId ? `, project ${projectId}` : ""})…`);
  await seedCollection("games", games);
  await seedCollection("tools", tools);
  await seedCollection("news", news);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
