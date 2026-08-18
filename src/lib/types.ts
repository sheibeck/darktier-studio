// Shared catalog types — the shape of the Firestore documents and the local
// seed. `order` drives manual sorting; `hidden` gates public visibility.

/** Publication status. tgc = print-and-play at The Game Crafter; pdf = downloadable archive; dev = in development. */
export type Pub = "tgc" | "pdf" | "dev";

export interface Game {
  slug: string;
  name: string;
  type: string; // "TTRPG" | "Board game" | "Card game" | "Game system" | "Game engine"
  pub: Pub;
  /** ISO month "YYYY-MM" or full date; shown as a released label. */
  released?: string | null;
  /** Absolute site path to the rulebook PDF, e.g. "/pdfs/dark.pdf". */
  pdf?: string | null;
  /** Optional character-sheet PDF path. */
  charSheet?: string | null;
  /** External companion-app URL ("Launch the app"). */
  app?: string | null;
  /** External website URL ("Visit the website"). */
  site?: string | null;
  isNew?: boolean;
  /** Made with AI-assisted generation — shows an "AI-assisted" tag. */
  ai?: boolean;
  /** Featured on the home page. */
  showcase?: boolean;
  /** Hidden from the public site. */
  hidden?: boolean;
  /** Cover image site path, e.g. "/assets/covers/woe.jpg", or null. */
  img?: string | null;
  synopsis: string;
  order: number;
}

export type ToolStatus = "live" | "soon";

export interface Tool {
  slug: string;
  name: string;
  status: ToolStatus;
  hidden?: boolean;
  /**
   * Link type. Absent or "external" = today's behavior (open the external
   * `app` URL in a new tab). "internal" = launch the in-site route derived
   * from `slug` (`/armory/<slug>`) in the same tab. Optional — no migration
   * required; existing docs predate this field and behave as "external".
   */
  kind?: "external" | "internal";
  app?: string | null;
  kicker?: string;
  description: string;
  order: number;
}

export type NewsTag = "News" | "Playtest call" | "Release";

export interface NewsPost {
  slug: string;
  title: string;
  /** ISO date "YYYY-MM-DD". */
  date: string;
  tag: NewsTag;
  link?: string | null;
  hidden?: boolean;
  body: string;
}

export const COLLECTIONS = {
  games: "games",
  tools: "tools",
  news: "news",
} as const;
