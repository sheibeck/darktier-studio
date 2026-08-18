// Build-time catalog loader. Public pages call these during `astro build`.
//
// Strategy (free-tier, no per-request server): read Firestore via the Admin SDK
// when credentials are configured (production rebuild in CI reads the owner's
// live edits); otherwise fall back to the committed seed so the site always
// builds locally and on first deploy with zero configuration. An empty
// collection also falls back to the seed (not-yet-seeded project).
//
// No client-side Firestore reads happen on public pages — this runs in Node at
// build time only, satisfying the SEO/crawlability requirement.

import { existsSync, readFileSync } from "node:fs";
import { games as seedGames } from "../data/catalog/games";
import { tools as seedTools } from "../data/catalog/tools";
import { news as seedNews } from "../data/catalog/news";
import type { Game, Tool, NewsPost } from "./types";

const KEY_FILE = "serviceAccountKey.json";

type Db = { collection: (name: string) => { get: () => Promise<{ docs: { data: () => unknown }[] }> } };

let _dbPromise: Promise<Db | null> | undefined;

function firestoreConfigured(): boolean {
  return Boolean(
    process.env.FIRESTORE_EMULATOR_HOST ||
      process.env.FIREBASE_SERVICE_ACCOUNT ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.FIREBASE_PROJECT_ID ||
      existsSync(KEY_FILE),
  );
}

async function getDb(): Promise<Db | null> {
  if (_dbPromise !== undefined) return _dbPromise;
  _dbPromise = (async () => {
    if (!firestoreConfigured()) return null;
    try {
      const { initializeApp, getApps, cert, applicationDefault } = await import("firebase-admin/app");
      const { getFirestore } = await import("firebase-admin/firestore");
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || undefined;
      if (!getApps().length) {
        if (process.env.FIRESTORE_EMULATOR_HOST) {
          initializeApp({ projectId: projectId ?? "demo-darktier" });
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)), projectId });
        } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          initializeApp({ credential: applicationDefault(), projectId });
        } else if (existsSync(KEY_FILE)) {
          const sa = JSON.parse(readFileSync(KEY_FILE, "utf8"));
          initializeApp({ credential: cert(sa), projectId: projectId ?? sa.project_id });
        } else {
          initializeApp({ projectId });
        }
      }
      return getFirestore() as unknown as Db;
    } catch (err) {
      console.warn("[catalog] Firestore unavailable — using committed seed:", (err as Error).message);
      return null;
    }
  })();
  return _dbPromise;
}

async function fetchCollection<T>(name: string, seed: T[]): Promise<T[]> {
  const db = await getDb();
  if (!db) return seed;
  try {
    const snap = await db.collection(name).get();
    const docs = snap.docs.map((d) => d.data() as T);
    return docs.length ? docs : seed;
  } catch (err) {
    console.warn(`[catalog] read "${name}" failed — using seed:`, (err as Error).message);
    return seed;
  }
}

const visible = <T extends { hidden?: boolean }>(arr: T[]): T[] => arr.filter((x) => !x.hidden);
const byOrder = (a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0);

export async function getGames(): Promise<Game[]> {
  return visible(await fetchCollection<Game>("games", seedGames)).sort(byOrder);
}

export async function getTools(): Promise<Tool[]> {
  return visible(await fetchCollection<Tool>("tools", seedTools)).sort(byOrder);
}

export async function getNews(): Promise<NewsPost[]> {
  return visible(await fetchCollection<NewsPost>("news", seedNews)).sort((a, b) =>
    String(b.date).localeCompare(String(a.date)),
  );
}

export async function getFeaturedGames(n = 3): Promise<Game[]> {
  return (await getGames()).filter((g) => g.showcase).slice(0, n);
}

export async function getLatestNews(n = 5): Promise<NewsPost[]> {
  return (await getNews()).slice(0, n);
}
