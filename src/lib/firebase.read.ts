// Lightweight, PUBLIC, read-only Firestore access for the live public pages.
// Only pulls firebase/app + firebase/firestore (no auth). Reads VISIBLE docs
// only (hidden === false) so drafts / in-dev games stay private — this matches
// the security rules, which reject an unfiltered list.
import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";

const config: FirebaseOptions = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

const configured = Boolean(config.projectId && config.apiKey);
const app = configured ? (getApps().length ? getApp() : initializeApp(config)) : undefined;
const db = app ? getFirestore(app) : undefined;

/**
 * Read visible docs from a collection, ordered by `order`. Returns null if
 * Firebase isn't configured or the read fails — callers keep their static data.
 * Sort is done client-side to avoid needing a composite index.
 */
export async function readVisible<T extends { order?: number }>(name: string): Promise<T[] | null> {
  if (!db) return null;
  try {
    const snap = await getDocs(query(collection(db, name), where("hidden", "==", false)));
    return snap.docs.map((d) => d.data() as T).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (err) {
    console.warn(`[live] read "${name}" failed:`, (err as Error).message);
    return null;
  }
}
