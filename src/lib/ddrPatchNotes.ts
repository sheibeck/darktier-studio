// Build-time loader for the Delve, Die, Repeat patch notes.
//
// One Markdown file per released version lives in src/data/ddr-patch-notes/,
// named by the game's exact versionName (e.g. 2.1.0.md). The game repo
// (mazeworld: tools/patch-notes.mjs --site) writes these on each release; the
// format is documented in mazeworld's docs/patch-notes/README.md. Every file
// opens with "# Delve, Die, Repeat <version>". The pages render that title
// once, as the page heading, and strip it from the body so it never shows twice.

interface MarkdownModule {
  compiledContent: () => Promise<string>;
  getHeadings: () => { depth: number; slug: string; text: string }[];
}

export interface PatchNotes {
  version: string;
  /** The file's own h1 text, e.g. "Delve, Die, Repeat 2.1.0". */
  title: string;
  /** Rendered HTML of the notes, minus the leading h1. */
  html: string;
}

const modules = import.meta.glob<MarkdownModule>("../data/ddr-patch-notes/*.md", { eager: true });

/** Semver-ish compare: numeric major.minor.patch, then a release beats its pre-releases. */
function compareVersions(a: string, b: string): number {
  const [aCore, aPre = ""] = a.split("-", 2);
  const [bCore, bPre = ""] = b.split("-", 2);
  const aParts = aCore.split(".").map((n) => Number.parseInt(n, 10) || 0);
  const bParts = bCore.split(".").map((n) => Number.parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const d = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (d !== 0) return d;
  }
  if (aPre === bPre) return 0;
  if (!aPre) return 1;
  if (!bPre) return -1;
  return aPre.localeCompare(bPre, "en", { numeric: true });
}

/** Every version's notes, newest first. */
export async function getPatchNotes(): Promise<PatchNotes[]> {
  const notes = await Promise.all(
    Object.entries(modules).map(async ([path, mod]) => {
      const version = path.split("/").pop()!.replace(/\.md$/, "");
      const h1 = mod.getHeadings().find((h) => h.depth === 1);
      const html = (await mod.compiledContent()).replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/, "");
      return { version, title: h1?.text ?? `Delve, Die, Repeat ${version}`, html };
    }),
  );
  return notes.sort((a, b) => compareVersions(b.version, a.version));
}
