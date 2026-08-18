import { useEffect, useState } from "react";
import type { Game } from "../../lib/types";
import { heroBlurb } from "../../lib/display";
import { readVisible } from "../../lib/firebase.read";

// Home "featured" vault cards (top showcased games). SSR from `initial`,
// live-refreshed from Firestore on the client.
export default function FeaturedLive({ initial }: { initial: Game[] }) {
  const [featured, setFeatured] = useState<Game[]>(initial);

  useEffect(() => {
    readVisible<Game>("games").then((live) => {
      if (live) setFeatured(live.filter((g) => g.showcase).slice(0, 3));
    });
  }, []);

  return (
    <div className="feat-grid">
      {featured.map((g) => (
        <a href={`/games#${g.slug}`} className="feat-card" key={g.slug}>
          <div className="feat-cover">
            {g.img ? (
              <img src={g.img} alt={`${g.name} cover art`} loading="lazy" decoding="async" />
            ) : (
              <div className="feat-cover-empty" aria-hidden="true" />
            )}
          </div>
          <div className="feat-scrim" aria-hidden="true" />
          {g.isNew && <span className="tag tag-accent feat-new">NEW</span>}
          <div className="feat-body">
            <p className="feat-type">{g.type}</p>
            <p className="feat-name">{g.name}</p>
            <p className="feat-blurb">{heroBlurb(g.synopsis)}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
