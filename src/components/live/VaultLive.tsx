import { useEffect, useState } from "react";
import type { Game } from "../../lib/types";
import { site } from "../../data/site";
import { pubTagClass, pubVaultLabel, releasedLabel } from "../../lib/display";
import { readVisible } from "../../lib/firebase.read";

function primaryHref(g: Game): string | undefined {
  return g.pdf || g.app || (g.pub === "tgc" ? site.gameCrafter : g.site) || undefined;
}

// Renders the full Vault. SSR'd from `initial` (build-time data → SEO), then
// live-refreshed from Firestore on the client so admin edits appear with no deploy.
export default function VaultLive({ initial }: { initial: Game[] }) {
  const [games, setGames] = useState<Game[]>(initial);

  useEffect(() => {
    readVisible<Game>("games").then((live) => {
      if (live && live.length) setGames(live);
    });
  }, []);

  return (
    <div className="vault">
      {games.map((g) => {
        const href = primaryHref(g);
        return (
          <article id={g.slug} className="vault-row" key={g.slug}>
            <a className="vault-cover-link" href={href} target="_blank" rel="noopener" aria-label={`Open ${g.name}`}>
              <div className="vault-cover">
                {g.img ? (
                  <img src={g.img} alt={`${g.name} cover art`} loading="lazy" decoding="async" />
                ) : (
                  <div className="vault-cover-empty" aria-hidden="true" />
                )}
              </div>
            </a>
            <div>
              <p className="vault-type">{g.type}</p>
              <div className="vault-title-row">
                <h2 className="vault-name">
                  <a className="vault-name-link" href={href} target="_blank" rel="noopener">
                    {g.name}
                  </a>
                </h2>
                {g.isNew && <span className="tag tag-accent">NEW</span>}
                <span className={pubTagClass(g.pub)}>{pubVaultLabel(g.pub)}</span>
                {g.ai && (
                  <span className="tag tag-neutral" title="This game was made with AI-assisted generation">
                    AI-assisted
                  </span>
                )}
                {releasedLabel(g.released) && <span className="vault-released">Released {releasedLabel(g.released)}</span>}
              </div>
              <p className="vault-synopsis">{g.synopsis}</p>
              <div className="vault-actions">
                {g.app && (
                  <a className="btn btn-primary" href={g.app} target="_blank" rel="noopener">
                    Launch the app ▸
                  </a>
                )}
                {g.pub === "tgc" && (
                  <a className="btn btn-primary" href={site.gameCrafter} target="_blank" rel="noopener">
                    Shop at The Game Crafter ▸
                  </a>
                )}
                {g.pdf && (
                  <a className="btn btn-secondary" href={g.pdf} download>
                    Download PDF ↓
                  </a>
                )}
                {g.charSheet && (
                  <a className="btn btn-ghost" href={g.charSheet} download>
                    Character sheet ↓
                  </a>
                )}
                {g.site && (
                  <a className="btn btn-ghost" href={g.site} target="_blank" rel="noopener">
                    Visit the website ▸
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
