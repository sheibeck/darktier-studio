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
    slug: "table-utilities", name: "Table utilities", status: "soon", kicker: "Docking soon",
    description:
      "The general-purpose kit: trackers, timers and references that work with any game on the table.",
    order: 1,
  },
  {
    slug: "gm-tools", name: "GM tools", status: "soon", kicker: "Docking soon",
    description:
      "Running the game from behind the screen — prep, rolls and secrets where players can't see them.",
    order: 2,
  },
];
