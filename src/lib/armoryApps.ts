// Registry of in-site "Armory" companion apps hosted at /armory/{slug}.
//
// This is the single source of truth for which apps exist and their per-app
// SEO. src/pages/armory/[slug].astro drives its getStaticPaths() from this
// array and contains zero app-specific logic — adding a new app means
// dropping a component under src/components/armory/ and adding one entry
// here.
//
// `slug` MUST match the corresponding Firestore `tools/{slug}` document by
// convention (see src/components/live/ToolsLive.tsx, which derives the
// public Launch button's href as `/armory/${tool.slug}` for internal tools).

import type { ComponentType } from "react";
import FateOfTheFellowship from "../components/armory/FateOfTheFellowship";

export interface ArmoryApp {
  /** URL slug — matches tools/{slug} in Firestore by convention. */
  slug: string;
  /** Short display name for the static intro heading. */
  name: string;
  /** Page <title> / og:title. */
  title: string;
  /** Meta description / og:description. */
  description: string;
  /** The app's root React component, mounted client:only. */
  Component: ComponentType;
}

export const armoryApps: ArmoryApp[] = [
  {
    slug: "fate-of-the-fellowship",
    name: "Fate of the Fellowship",
    title: "Fate of the Fellowship — Companion",
    description:
      "A table companion for Fate of the Fellowship — guided setup, turn and step tracking, hope and army trackers, dice reference, and a searchable rules index.",
    Component: FateOfTheFellowship,
  },
];
