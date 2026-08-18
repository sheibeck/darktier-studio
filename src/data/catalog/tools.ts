import type { Tool } from "../../lib/types";

// Canonical seed for the `tools` collection (The Armory).
// Mirrors the owner-maintained production catalog so `npm run seed[:tools]` is
// non-destructive. External tools link out (`app`); internal tools (`kind:"internal"`)
// are hosted in-site at /armory/<slug>.
export const tools: Tool[] = [
  {
    slug: "charlie-mike-toc", name: "Charlie Mike — TOC", status: "live",
    app: "https://charlie-mike-428f0.web.app/", kicker: "Companion app",
    description:
      "The Tactical Operations Center for Charlie Mike, our military TTRPG in development. Run your unit, track the op, continue mission.",
    order: 0,
  },
  {
    slug: "dungeon-world-companion", name: "Dungeon World Companion", status: "live",
    app: "https://dungeon-world-companion.com/", kicker: "Docking soon",
    description:
      "A companion app for Dungeon World TTRPG. Track your characters and campaigns. Build your world through the map tracker, steadings and fronts.",
    order: 1,
  },
  {
    slug: "5x-companion", name: "5x Companion", status: "live",
    app: "https://www.5x-companion.com/", kicker: "Docking soon",
    description:
      "A campaign and character manager built for solo and co-op skirmish wargames in the Five X From X family of games, including: Five Parsecs from Home, Five Leagues from the Borderlands, and Forgotten Ruin: The Adventure Wargame.",
    order: 2,
  },
  {
    slug: "fate-character-sheet", name: "Fate Character Sheet", status: "live",
    app: "https://fatecharactersheet.com/", kicker: "",
    description:
      "A companion app for Fate TTRPG. Create characters and adversaries, and campaigns. Includes a custom virtual table tailored for running you Fate games, and integration with Roll20.",
    order: 3,
  },
  {
    slug: "fate-of-the-fellowship", name: "Fate of the Fellowship", status: "live", kind: "internal",
    kicker: "Companion app",
    description:
      "The table companion for Fate of the Fellowship — guided setup, turn and step tracking, hope and army trackers, a dice reference, and a searchable rules index.",
    order: 4,
  },
  {
    slug: "burning-banners", name: "Burning Banners", status: "live", kind: "internal",
    kicker: "Companion app",
    description:
      "The table companion for Burning Banners — basic and advanced setup, turn/income/revolt/coven/collapse trackers, a combat helper, and a rules reference.",
    order: 5,
  },
];
