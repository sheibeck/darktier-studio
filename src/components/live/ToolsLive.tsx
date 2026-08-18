import { useEffect, useState } from "react";
import type { Tool } from "../../lib/types";
import { readVisible } from "../../lib/firebase.read";

// The Armory tools grid. SSR from `initial`, live-refreshed from Firestore.
export default function ToolsLive({ initial }: { initial: Tool[] }) {
  const [tools, setTools] = useState<Tool[]>(initial);

  useEffect(() => {
    readVisible<Tool>("tools").then((live) => {
      if (live && live.length) setTools(live);
    });
  }, []);

  return (
    <div className="armory">
      {tools.map((t, i) => {
        const isLive = t.status === "live";
        const kickerLine = (isLive ? "Live now · " : "") + (t.kicker || (isLive ? "Companion app" : "Docking soon"));
        // Strict equality is the backward-compat linchpin: undefined/absent/"external"
        // all fall through to the external (new-tab) path unchanged.
        const isInternal = t.kind === "internal";
        const launchHref = isInternal ? `/armory/${t.slug}` : (t.app ?? undefined);
        return (
          <div className={`tool-card${isLive ? " tool-card-live" : ""}`} key={t.slug}>
            <p
              className="tool-kicker"
              style={{ color: isLive ? "var(--color-accent)" : "color-mix(in srgb, var(--color-text) 55%, transparent)" }}
            >
              {String(i + 1).padStart(2, "0")} / {kickerLine}
            </p>
            <p className="tool-name">{t.name}</p>
            <p className="tool-desc">{t.description}</p>
            {isLive && (isInternal || t.app) && (
              <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "21px" }}>
                {isInternal ? (
                  <a className="btn btn-primary" href={launchHref} style={{ textDecoration: "none" }}>
                    Launch ▸
                  </a>
                ) : (
                  <a className="btn btn-primary" href={launchHref} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
                    Launch ▸
                  </a>
                )}
              </div>
            )}
            {!isLive && <p className="tool-reserved">Slot reserved</p>}
          </div>
        );
      })}
    </div>
  );
}
