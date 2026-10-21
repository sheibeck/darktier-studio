/**
 * One-time go-live catalog change for Delve, Die, Repeat 2.7.0, applied to LIVE
 * Firestore without touching any other game or any admin edit:
 *   1. games/delve-die-repeat is CREATED from the committed seed entry (skipped, not
 *      overwritten, if it already exists).
 *   2. games/fow and games/exfil get ONLY `showcase: false` if currently featured (partial
 *      updates, nothing else changes) so the 3 home cards are DDR, Charlie Mike, Woe.
 * Nothing else is read or written, unlike `npm run seed`, which overwrites every doc.
 *
 * Run BEFORE `npm run deploy`: the build reads live Firestore, so the deploy bakes this in.
 *
 * Usage:
 *   Dry run (default, no writes):  npm run feature-ddr
 *   Apply:  GOOGLE_APPLICATION_CREDENTIALS=./service-account.json FIREBASE_PROJECT_ID=<project-id> npm run feature-ddr -- --apply
 *   Emulator: add FIRESTORE_EMULATOR_HOST=localhost:8080 (no credentials needed)
 */
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { games } from "../src/data/catalog/games.ts";

const apply = process.argv.includes("--apply");
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

if (!usingEmulator && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("Refusing to run: no Firestore target configured (set FIRESTORE_EMULATOR_HOST, GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT).");
  process.exit(1);
}

if (!getApps().length) {
  if (usingEmulator) initializeApp({ projectId: projectId ?? "demo-darktier" });
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)), projectId });
  else initializeApp({ credential: applicationDefault(), projectId });
}

const db = getFirestore();
const ddr = games.find((g) => g.slug === "delve-die-repeat");
if (!ddr) throw new Error("delve-die-repeat is missing from src/data/catalog/games.ts");
const ddrDoc = Object.fromEntries(Object.entries({ hidden: false, ...ddr }).filter(([, v]) => v !== undefined));

async function main(): Promise<void> {
  console.log(`${apply ? "APPLYING" : "DRY RUN"} (${usingEmulator ? "emulator" : "production"}${projectId ? `, project ${projectId}` : ""})`);

  const ddrRef = db.collection("games").doc("delve-die-repeat");
  const ddrSnap = await ddrRef.get();

  if (ddrSnap.exists) console.log("  - delve-die-repeat already exists: leaving it untouched");
  else {
    console.log("  - create games/delve-die-repeat");
    if (apply) await ddrRef.create(ddrDoc);
  }

  // The home page shows the first 3 showcased games by order. DDR takes slot 1 and
  // Charlie Mike + Woe keep theirs, so every other showcased game must step off.
  // fow is the ruled one; exfil is included because the live catalog showed it
  // featured on the 2026-10-21 build even though the seed says showcase:false.
  for (const slug of ["fow", "exfil"]) {
    const ref = db.collection("games").doc(slug);
    const snap = await ref.get();
    if (!snap.exists) console.log(`  - games/${slug} not found: nothing to un-feature`);
    else if (snap.get("showcase") !== true) console.log(`  - ${slug} is not featured (showcase=${snap.get("showcase")}): leaving it`);
    else {
      console.log(`  - set games/${slug} showcase:false`);
      if (apply) await ref.update({ showcase: false });
    }
  }

  console.log(apply ? "Done." : "Dry run only. Re-run with --apply to write.");
}

main().catch((err) => {
  console.error("feature-ddr failed:", err);
  process.exit(1);
});
