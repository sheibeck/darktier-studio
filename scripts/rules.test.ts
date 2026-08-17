/**
 * Firestore security-rules unit tests. Proves the owner-UID boundary.
 * Run against the emulator:
 *   npx firebase emulators:exec --only firestore --project demo-darktier-rules \
 *     "node --experimental-strip-types --test scripts/rules.test.ts"
 */
import { after, before, test } from "node:test";
import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Load the real rules and read the owner UID straight from them, so the test
// works whether the file holds OWNER_UID_PLACEHOLDER or the real deployed UID.
const rules = readFileSync("firestore.rules", "utf8");
const ownerMatch = rules.match(/request\.auth\.uid == '([^']+)'/);
if (!ownerMatch) throw new Error("Could not find the owner UID in firestore.rules");
const OWNER = ownerMatch[1];
const OTHER = OWNER === "other-uid-456" ? "someone-else-789" : "other-uid-456";

let env: RulesTestEnvironment;

// Use the emulator the runner started (FIRESTORE_EMULATOR_HOST), else default.
const [emuHost, emuPort] = (process.env.FIRESTORE_EMULATOR_HOST ?? "127.0.0.1:8080").split(":");

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-darktier-rules",
    firestore: { rules, host: emuHost, port: Number(emuPort) },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "games", "visible-game"), { slug: "visible-game", name: "Visible", hidden: false, order: 0 });
    await setDoc(doc(db, "games", "hidden-game"), { slug: "hidden-game", name: "Hidden", hidden: true, order: 1 });
  });
});

after(async () => {
  if (env) await env.cleanup();
});

test("unauthenticated write is denied", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(setDoc(doc(db, "games", "x"), { slug: "x", name: "X" }));
});

test("non-owner authenticated write is denied", async () => {
  const db = env.authenticatedContext(OTHER).firestore();
  await assertFails(setDoc(doc(db, "games", "y"), { slug: "y", name: "Y" }));
});

test("owner write is allowed", async () => {
  const db = env.authenticatedContext(OWNER).firestore();
  await assertSucceeds(setDoc(doc(db, "games", "z"), { slug: "z", name: "Z", hidden: false, order: 9 }));
});

test("public read of a visible doc is allowed", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(db, "games", "visible-game")));
});

test("unauthenticated read of a hidden doc is denied", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, "games", "hidden-game")));
});

test("non-owner read of a hidden doc is denied", async () => {
  const db = env.authenticatedContext(OTHER).firestore();
  await assertFails(getDoc(doc(db, "games", "hidden-game")));
});

test("owner read of a hidden doc is allowed", async () => {
  const db = env.authenticatedContext(OWNER).firestore();
  await assertSucceeds(getDoc(doc(db, "games", "hidden-game")));
});

test("writes to an unknown collection are denied even for the owner", async () => {
  const db = env.authenticatedContext(OWNER).firestore();
  await assertFails(setDoc(doc(db, "secrets", "a"), { x: 1 }));
});
