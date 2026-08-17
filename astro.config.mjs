// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

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
  ],
});
