// Client-side Firebase, loaded ONLY by the /admin React island (never by
// public pages). The web config values are public by design; the real security
// boundary is Firestore rules + the owner-UID check. Values come from
// PUBLIC_* env vars (inlined at build) so the deploy sets the real project.
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

/** The owner's Google UID. Only this account may use the admin (UI gate; the
 *  hard gate is Firestore rules). Set PUBLIC_ADMIN_UID at build time. */
export const ADMIN_UID: string | undefined = import.meta.env.PUBLIC_ADMIN_UID;

/** True when the Firebase project is configured (otherwise the admin shows a setup notice). */
export const firebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);

// In local dev, talk to the Emulator Suite instead of production.
let emulatorsConnected = false;
export function connectEmulatorsOnce(): void {
  if (emulatorsConnected || !import.meta.env.DEV || typeof window === "undefined") return;
  emulatorsConnected = true;
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
  } catch {
    /* already connected */
  }
}
