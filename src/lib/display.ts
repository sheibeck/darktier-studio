// Pure presentation helpers shared by the public pages. Mirrors the display
// logic in the approved prototypes (games/tools/news rendering).

import type { NewsTag, Pub } from "./types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Vault tag text per publication status. */
export function pubVaultLabel(pub: Pub): string {
  switch (pub) {
    case "tgc": return "Print & play · The Game Crafter";
    case "dev": return "In development";
    default: return "PDF archive";
  }
}

/** Nocturne tag class per publication status. */
export function pubTagClass(pub: Pub): string {
  return pub === "pdf" ? "tag tag-neutral" : "tag tag-outline";
}

/** "YYYY-MM"/"YYYY" → "August 2020" / "2020". */
export function releasedLabel(r?: string | null): string | null {
  if (!r) return null;
  const [y, m] = String(r).split("-");
  return m ? `${MONTHS[parseInt(m, 10) - 1]} ${y}` : y;
}

/** "YYYY-MM-DD" → "August 17, 2026". */
export function newsDateLabel(d: string): string {
  if (!d) return "";
  const [y, m, day] = String(d).split("-").map(Number);
  if (!m) return String(y);
  return day ? `${MONTHS[m - 1]} ${day}, ${y}` : `${MONTHS[m - 1]} ${y}`;
}

export function newsTagClass(tag: NewsTag): string {
  return tag === "Playtest call" ? "tag tag-accent" : "tag tag-neutral";
}

/** First sentence of a synopsis, for the home featured cards. */
export function heroBlurb(synopsis: string): string {
  const first = (synopsis || "").split(". ")[0].replace(/\.$/, "");
  return first ? `${first}.` : "";
}
