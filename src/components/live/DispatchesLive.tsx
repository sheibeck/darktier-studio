import { useEffect, useState } from "react";
import type { NewsPost } from "../../lib/types";
import { newsDateLabel, newsTagClass } from "../../lib/display";
import { readVisible } from "../../lib/firebase.read";

// Home "Dispatches" feed (latest news, newest first). SSR from `initial`,
// live-refreshed from Firestore on the client.
export default function DispatchesLive({ initial }: { initial: NewsPost[] }) {
  const [posts, setPosts] = useState<NewsPost[]>(initial);

  useEffect(() => {
    readVisible<NewsPost>("news").then((live) => {
      if (live) {
        setPosts(
          live.sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5),
        );
      }
    });
  }, []);

  return (
    <div className="dispatch-feed">
      {posts.map((n) => (
        <article className="dispatch" key={n.slug}>
          <div className="dispatch-meta">
            <span className={newsTagClass(n.tag)}>{n.tag}</span>
            <span className="dispatch-date">{newsDateLabel(n.date)}</span>
          </div>
          <h3 className="dispatch-title">{n.title}</h3>
          <p className="dispatch-body">{n.body}</p>
          {n.link && (
            <div style={{ marginTop: "14px" }}>
              <a href={n.link} target="_blank" rel="noopener" style={{ fontSize: "14px" }}>
                Read more ▸
              </a>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
