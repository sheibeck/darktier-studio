import type { Game } from "../../lib/types";

// Canonical seed for the `games` collection. This is BOTH the source the seed
// script pushes to Firestore AND the fallback the build-time loader uses when
// Firestore isn't configured (local dev / first deploy). Firestore, once
// populated and edited via /admin, becomes the live override.
//
// Paths point at migrated static assets: covers in /assets/covers, rulebooks
// (and character sheets) in /pdfs — see _design/README.md for the archive map.
// Synopses are reconstructions from the archive and are owner-reviewable.

export const games: Game[] = [
  {
    slug: "charlie-mike", name: "Charlie Mike", type: "TTRPG", pub: "dev",
    app: "https://charlie-mike-428f0.web.app/", isNew: true, showcase: true, img: "/assets/covers/charlie-mike.png",
    synopsis:
      "Continue mission. A military TTRPG in development — run your unit through ops with the Charlie Mike TOC companion app. Rulebook coming as a PDF.",
    order: 0,
  },
  {
    slug: "exfil", name: "EXFIL", type: "Board game", pub: "tgc", released: "2020-06",
    img: "/assets/covers/exfil.png", showcase: false,
    synopsis:
      "Get in, get out, get paid. A tactical extraction game with sitrep-driven missions and a spoiler-laden campaign guide — published at The Game Crafter with a print-and-play edition.",
    order: 1,
  },
  {
    slug: "woe", name: "Woe", type: "Board game", pub: "tgc", img: "/assets/covers/woe.jpg", showcase: true,
    synopsis:
      "Build your kingdom, destroy theirs. A grim engine of expansion and ruin where every gain is carved out of a rival's map.",
    order: 2,
  },
  {
    slug: "fow", name: "Fate of Wæteria", type: "Board game", pub: "tgc", img: "/assets/covers/fow.png", showcase: true,
    synopsis:
      "The tide already won. Scavenge, bargain and sail the drowned world of Wæteria before the rising water takes what's left.",
    order: 3,
  },
  {
    slug: "euangelion", name: "Euangelion", type: "TTRPG", pub: "tgc", img: "/assets/covers/euangelion.png", showcase: false,
    synopsis:
      "Good news travels slowly through a painted world. A setting of shrines, ruins and the long roads between them.",
    order: 4,
  },
  {
    slug: "cardomancer", name: "Cardomancer", type: "Card game", pub: "pdf",
    img: "/assets/covers/cardomancer.png", pdf: "/pdfs/cardomancer.pdf", showcase: false,
    synopsis:
      "Every deck hides a spellbook. Duel with cards that are the magic — sleights, hexes and gambits played straight from the hand.",
    order: 5,
  },
  {
    slug: "barony", name: "Barony", type: "Board game", pub: "pdf",
    img: "/assets/covers/barony.png", pdf: "/pdfs/barony.pdf", showcase: false,
    synopsis:
      "Court intrigue on a checkered field. Maneuver your house into power while the old king's board crumbles beneath it.",
    order: 6,
  },
  {
    slug: "amaranthine", name: "Amaranthine", type: "TTRPG", pub: "pdf",
    img: "/assets/covers/amaranthine.png", pdf: "/pdfs/amaranthine.pdf", showcase: false,
    synopsis:
      "Roleplaying beneath a red and undying sun — dynasties that will not stay buried, and the ones who dig anyway.",
    order: 7,
  },
  {
    slug: "baneful", name: "Baneful", type: "TTRPG", pub: "pdf",
    img: "/assets/covers/baneful.png", pdf: "/pdfs/baneful.pdf", charSheet: "/pdfs/baneful-character-sheet.pdf", showcase: false,
    synopsis:
      "The runes glow in the dark for a reason. Dark-fantasy roleplaying where every working leaves a mark on the caster.",
    order: 8,
  },
  {
    slug: "mazeworld", name: "Mazeworld", type: "Board game", pub: "pdf",
    img: "/assets/covers/mazeworld.png", pdf: "/pdfs/mazeworld.pdf", showcase: false,
    synopsis:
      "The world is the maze. Race, trap and rewire the hedgerows to reach the light at the center first.",
    order: 9,
  },
  {
    slug: "impact", name: "Impact", type: "Game system", pub: "pdf",
    img: "/assets/covers/impact.png", pdf: "/pdfs/impact.pdf", charSheet: "/pdfs/impact-character-sheet.pdf", showcase: false,
    synopsis:
      "Hit locations that matter. A combat framework where where you strike is as important as how hard.",
    order: 10,
  },
  {
    slug: "aige", name: "AIGE", type: "Game engine", pub: "pdf",
    img: "/assets/covers/aige.png", pdf: "/pdfs/aige.pdf", charSheet: "/pdfs/aige-character-sheet.pdf", showcase: false,
    synopsis:
      "The Anti-Ivory-tower Game Engine: no dice required. A diceless engine for running fast, fiction-first tables.",
    order: 11,
  },
  {
    slug: "dark", name: "Dark", type: "TTRPG", pub: "pdf",
    img: "/assets/covers/dark.png", pdf: "/pdfs/dark.pdf", charSheet: "/pdfs/dark-character-sheet.pdf", showcase: false,
    synopsis:
      "Where every campaign at Darktier begins. The house d20 — heavier, older and luckier than it should be.",
    order: 12,
  },
];
