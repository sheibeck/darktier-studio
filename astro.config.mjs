// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import react from "@astrojs/react";

// The canonical production origin. All absolute URLs (canonical, OG image,
// sitemap) derive from this. Firebase Hosting serves the static `dist/` output.
export default defineConfig({
  site: "https://darktierstudios.com",
  trailingSlash: "ignore",
  build: {
    // Emit `about.html` rather than `about/index.html` — cleaner on Firebase Hosting.
    format: "file",
  },
  integrations: [
    sitemap({
      // /admin is a private editor — keep it out of the sitemap and out of search.
      filter: (page) => !page.includes("/admin"),
    }),
    icon({
      include: {
        ph: ["*"],
      },
    }),
    // React powers the /admin island, the live public catalog components,
    // and the /armory in-site companion apps.
    react({ include: ["**/admin/**", "**/live/**", "**/components/armory/**"] }),
  ],
});
