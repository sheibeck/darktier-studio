// Site-wide constants. Single source for brand strings, external links, and
// SEO defaults. Used by the layout, nav, footer, and structured data.

export const site = {
  name: "Darktier Studios",
  legalName: "Darktier Studios, LLC",
  url: "https://darktierstudios.com",
  tagline: "Roll initiative. The dark tier awaits.",
  description:
    "Darktier Studios is Sterling Heibeck's one-person tabletop game studio — board games that punish greed, TTRPGs that leave marks, and the digital tools to run them all.",
  location: "Grand Rapids, MI",
  since: 2013,
  founder: "Sterling Heibeck",
  // External destinations
  gameCrafter: "https://www.thegamecrafter.com/designers/sterling-heibeck",
  charlieMike: "https://charlie-mike-428f0.web.app/",
  // Default social share image (1200x630), added in the SEO phase.
  ogImage: "/assets/og-default.png",
} as const;

export type NavItem = { label: string; href: string };

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "The Vault", href: "/games" },
  { label: "The Armory", href: "/tools" },
];
