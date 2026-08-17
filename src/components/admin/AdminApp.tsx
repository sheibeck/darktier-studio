import { type CSSProperties, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import {
  ADMIN_UID,
  auth,
  connectEmulatorsOnce,
  firebaseConfigured,
  googleProvider,
} from "../../lib/firebase.client";
import { Manager, type ColumnDef, type FieldDef } from "./Manager";
import type { Game, NewsPost, Tool } from "../../lib/types";

connectEmulatorsOnce();

const PUB_SHORT: Record<string, string> = { tgc: "The Game Crafter", pdf: "PDF archive", dev: "In development" };
const PUB_TAG: Record<string, string> = { tgc: "tag tag-accent", pdf: "tag tag-neutral", dev: "tag tag-outline" };

const TYPE_OPTS = ["Board game", "Card game", "TTRPG", "Game system", "Game engine"].map((v) => ({ value: v, label: v }));
const PUB_OPTS = [
  { value: "tgc", label: "The Game Crafter (print & play)" },
  { value: "pdf", label: "PDF archive" },
  { value: "dev", label: "In development" },
];
const STATUS_OPTS = [
  { value: "live", label: "Live (Launch button)" },
  { value: "soon", label: "Docking soon (slot reserved)" },
];
const TAG_OPTS = ["News", "Playtest call", "Release"].map((v) => ({ value: v, label: v }));

const chk: CSSProperties = { display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px" };

// --- Games ---
const gameColumns: ColumnDef<Game>[] = [
  {
    header: "Cover",
    width: "76px",
    render: (g) => (
      <div
        style={{
          width: "56px",
          height: "36px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--color-neutral-800)",
          backgroundImage: g.img ? `url("${g.img}")` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    ),
  },
  {
    header: "Title",
    render: (g) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 500 }}>
        {g.name}
        {g.isNew && <span className="tag tag-accent">NEW</span>}
      </span>
    ),
  },
  { header: "Type", render: (g) => <span className="tag tag-neutral">{g.type}</span> },
  { header: "Publication", render: (g) => <span className={PUB_TAG[g.pub] ?? "tag tag-outline"}>{PUB_SHORT[g.pub] ?? "—"}</span> },
  {
    header: "Showcase",
    width: "110px",
    render: (g, api) => (
      <label style={chk}>
        <input type="checkbox" checked={Boolean(g.showcase)} onChange={(e) => api.toggle(g.slug, "showcase", e.target.checked)} />
        Featured
      </label>
    ),
  },
];

const gameFields: FieldDef[] = [
  { key: "name", label: "Title", type: "text" },
  { key: "type", label: "Type", type: "select", options: TYPE_OPTS },
  { key: "pub", label: "Publication", type: "select", options: PUB_OPTS },
  { key: "img", label: "Cover image path", type: "text", placeholder: "/assets/covers/name.png" },
  { key: "released", label: "Release date", type: "month" },
  { key: "pdf", label: 'PDF link ("Download PDF")', type: "text", placeholder: "/pdfs/name.pdf" },
  { key: "charSheet", label: "Character sheet PDF (optional)", type: "text", placeholder: "/pdfs/name-character-sheet.pdf" },
  { key: "app", label: 'App link ("Launch the app")', type: "url", placeholder: "https://…" },
  { key: "site", label: 'Website link ("Visit the website")', type: "url", placeholder: "https://…" },
  { key: "isNew", label: "Flag as NEW — highlights across the site", type: "checkbox" },
  { key: "ai", label: "AI-assisted generation — shows an 'AI-assisted' tag", type: "checkbox", full: true },
  { key: "synopsis", label: "Synopsis", type: "textarea", full: true },
];

// --- Tools ---
const toolColumns: ColumnDef<Tool>[] = [
  { header: "Name", render: (t) => <span style={{ fontWeight: 500 }}>{t.name}</span> },
  {
    header: "Status",
    render: (t) => <span className={t.status === "live" ? "tag tag-accent" : "tag tag-neutral"}>{t.status === "live" ? "Live" : "Docking soon"}</span>,
  },
];
const toolFields: FieldDef[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "status", label: "Status", type: "select", options: STATUS_OPTS },
  { key: "app", label: "App link", type: "url", placeholder: "https://…", full: true },
  { key: "description", label: "Description", type: "textarea", full: true },
];

// --- News ---
const newsColumns: ColumnDef<NewsPost>[] = [
  { header: "Date", width: "130px", render: (n) => <span style={{ fontFeatureSettings: "'tnum' 1" }}>{n.date}</span> },
  { header: "Title", render: (n) => <span style={{ fontWeight: 500 }}>{n.title}</span> },
  { header: "Tag", render: (n) => <span className={n.tag === "Playtest call" ? "tag tag-accent" : "tag tag-neutral"}>{n.tag}</span> },
];
const newsFields: FieldDef[] = [
  { key: "title", label: "Title", type: "text", full: true },
  { key: "date", label: "Date", type: "date" },
  { key: "tag", label: "Tag", type: "select", options: TAG_OPTS },
  { key: "body", label: "Body", type: "textarea", full: true },
  { key: "link", label: 'Link (optional "Read more")', type: "url", placeholder: "https://…", full: true },
];

function todayISO(): string {
  // Client-side only; fine to use Date here.
  return new Date().toISOString().slice(0, 10);
}

export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [authErr, setAuthErr] = useState<string | null>(null);
  const [builtAt, setBuiltAt] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    fetch("/build-info.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.builtAt && setBuiltAt(d.builtAt))
      .catch(() => {});
  }, []);

  if (!firebaseConfigured) {
    return (
      <div className="card elev-md" style={{ maxWidth: "620px", marginTop: "24px" }}>
        <p className="card-kicker" style={{ color: "var(--color-accent)" }}>Setup required</p>
        <p style={{ margin: "8px 0 0", lineHeight: "26px" }}>
          The admin isn't connected to a Firebase project yet. Set the <code>PUBLIC_FIREBASE_*</code> and{" "}
          <code>PUBLIC_ADMIN_UID</code> environment variables at build time (see <code>.env.example</code>), then rebuild.
          Until then the public site runs from the committed seed catalog.
        </p>
      </div>
    );
  }

  if (!ready) return <p className="text-muted" style={{ marginTop: "24px" }}>Checking sign-in…</p>;

  if (!user) {
    return (
      <div className="card elev-md" style={{ maxWidth: "460px", marginTop: "24px" }}>
        <p className="card-kicker" style={{ color: "var(--color-accent)" }}>Admin sign-in</p>
        <p style={{ margin: "8px 0 16px", lineHeight: "26px" }}>Sign in with the studio's Google account to manage the catalog.</p>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={async () => {
            setAuthErr(null);
            try {
              await signInWithPopup(auth, googleProvider);
            } catch (e) {
              setAuthErr((e as Error).message);
            }
          }}
        >
          Sign in with Google
        </button>
        {authErr && <p style={{ color: "var(--color-accent-300)", marginTop: "12px", fontSize: "13px" }}>{authErr}</p>}
      </div>
    );
  }

  const isOwner = Boolean(ADMIN_UID) && user.uid === ADMIN_UID;
  if (!isOwner) {
    return (
      <div className="card elev-md" style={{ maxWidth: "560px", marginTop: "24px" }}>
        <p className="card-kicker" style={{ color: "var(--color-accent-300)" }}>Not authorized</p>
        <p style={{ margin: "8px 0 16px", lineHeight: "26px" }}>
          Signed in as <strong>{user.email}</strong>, but this account can't edit the catalog.
          {!ADMIN_UID && <> (No <code>PUBLIC_ADMIN_UID</code> is configured — set it to this UID to grant access.)</>}
        </p>
        <p style={{ fontSize: "12px", color: "color-mix(in srgb, var(--color-text) 55%, transparent)", fontFeatureSettings: "'tnum' 1" }}>
          Your UID: {user.uid}
        </p>
        <button type="button" className="btn btn-secondary" style={{ marginTop: "16px" }} onClick={() => signOut(auth)}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap", marginTop: "8px" }}>
        <span className="tag tag-accent">Signed in</span>
        <span style={{ fontSize: "13px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>{user.email}</span>
        {builtAt && (
          <span style={{ fontSize: "12px", color: "color-mix(in srgb, var(--color-text) 50%, transparent)", fontFeatureSettings: "'tnum' 1" }}>
            Last published {new Date(builtAt).toLocaleString()}
          </span>
        )}
        <button type="button" className="btn btn-ghost" style={{ marginLeft: "auto" }} onClick={() => signOut(auth)}>
          Sign out
        </button>
      </div>
      <p style={{ fontSize: "13px", lineHeight: "22px", color: "color-mix(in srgb, var(--color-text) 60%, transparent)", maxWidth: "62ch", marginTop: "12px" }}>
        Edits save to Firestore immediately. They reach the public site on the next <strong>Publish</strong> — trigger a rebuild from
        the repo's GitHub Actions ("Deploy" → "Run workflow"), or run <code>npm run deploy</code> locally.
      </p>

      <Manager<Game>
        name="games"
        kicker="Darktier Studios · catalog manager"
        title="Manage the games"
        singular="game"
        description="Classify, reorder, showcase or hide any title — changes drive the public Vault after Publish."
        columns={gameColumns}
        fields={gameFields}
        requiredKey="name"
        slugFrom={(d) => d.name}
        newItem={() => ({ slug: "", name: "", type: "Board game", pub: "dev", showcase: false, hidden: false, img: "", synopsis: "", order: 0 }) as Game}
      />

      <Manager<Tool>
        name="tools"
        kicker="Armory manager"
        title="Manage the tools"
        singular="tool"
        description="Companion apps and utilities on the Armory page. Live tools get a Launch button; 'docking soon' slots hold the space."
        columns={toolColumns}
        fields={toolFields}
        requiredKey="name"
        slugFrom={(d) => d.name}
        newItem={() => ({ slug: "", name: "", status: "soon", hidden: false, app: "", kicker: "", description: "", order: 0 }) as Tool}
      />

      <Manager<NewsPost>
        name="news"
        kicker="Dispatches"
        title="Post news & playtest calls"
        singular="post"
        description="Posts appear in the Dispatches feed on the homepage, newest first (the feed shows the latest five)."
        columns={newsColumns}
        fields={newsFields}
        requiredKey="title"
        slugFrom={(d) => d.title}
        newItem={() => ({ slug: "", title: "", date: todayISO(), tag: "News", link: "", hidden: false, body: "", order: 0 }) as unknown as NewsPost}
      />
    </>
  );
}
