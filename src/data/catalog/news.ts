import type { NewsPost } from "../../lib/types";

// Canonical seed for the `news` collection (Dispatches). Newest first is
// enforced by the loader/pages, not by array order.
export const news: NewsPost[] = [
  {
    slug: "new-site",
    title: "Welcome to the new darktierstudios.com",
    date: "2026-08-17",
    tag: "News",
    link: null,
    body:
      "The studio has a new home. The vault holds every game we've made, the armory gathers our companion apps under one roof, and this feed is where news and playtest calls will land from now on.",
  },
  {
    slug: "charlie-mike-toc",
    title: "Charlie Mike TOC is live",
    date: "2026-08-17",
    tag: "News",
    link: "https://charlie-mike-428f0.web.app/",
    body:
      "The Tactical Operations Center — the companion app for our military TTRPG in development — is live now. Run your unit, track the op, continue mission.",
  },
];
