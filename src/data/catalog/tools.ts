import type { Tool } from "../../lib/types";

// Canonical seed for the `tools` collection (The Armory).
export const tools: Tool[] = [
  {
    slug: "charlie-mike-toc", name: "Charlie Mike — TOC", status: "live",
    app: "https://charlie-mike-428f0.web.app/", kicker: "Companion app",
    description:
      "The Tactical Operations Center for Charlie Mike, our military TTRPG in development. Run your unit, track the op, continue mission.",
    order: 0,
  },
  {
    slug: "fate-of-the-fellowship", name: "Fate of the Fellowship", status: "live", kind: "internal",
    kicker: "Companion app",
    description:
      "The table companion for Fate of the Fellowship — guided setup, turn and step tracking, hope and army trackers, a dice reference, and a searchable rules index.",
    order: 1,
  },
  {
    slug: "burning-banners", name: "Burning Banners", status: "live", kind: "internal",
    kicker: "Companion app",
    description:
      "The table companion for Burning Banners — basic and advanced setup, turn/income/revolt/coven/collapse trackers, a combat helper, and a rules reference.",
    order: 2,
  },
  {
    slug: "table-utilities", name: "Table utilities", status: "soon", kicker: "Docking soon",
    description:
      "The general-purpose kit: trackers, timers and references that work with any game on the table.",
    order: 3,
  },
  {
    slug: "gm-tools", name: "GM tools", status: "soon", kicker: "Docking soon",
    description:
      "Running the game from behind the screen — prep, rolls and secrets where players can't see them.",
    order: 4,
  },
];
