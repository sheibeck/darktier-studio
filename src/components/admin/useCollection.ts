import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../lib/firebase.client";

export interface Row {
  slug: string;
  order?: number;
  hidden?: boolean;
  [key: string]: unknown;
}

function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Live-subscribed Firestore collection with CRUD + reorder helpers. */
export function useCollection<T extends Row>(name: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, name),
      (snap) => {
        const rows = snap.docs.map((d) => d.data() as T);
        rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setItems(rows);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [name]);

  const save = useCallback(
    async (item: T) => {
      await setDoc(doc(db, name, item.slug), stripUndefined(item));
    },
    [name],
  );

  const remove = useCallback(
    async (slug: string) => {
      await deleteDoc(doc(db, name, slug));
    },
    [name],
  );

  const toggle = useCallback(
    async (slug: string, field: string, value: boolean) => {
      await updateDoc(doc(db, name, slug), { [field]: value });
    },
    [name],
  );

  const reorder = useCallback(
    async (slug: string, dir: -1 | 1) => {
      const idx = items.findIndex((i) => i.slug === slug);
      const j = idx + dir;
      if (idx < 0 || j < 0 || j >= items.length) return;
      const a = items[idx];
      const b = items[j];
      const batch = writeBatch(db);
      batch.update(doc(db, name, a.slug), { order: b.order ?? j });
      batch.update(doc(db, name, b.slug), { order: a.order ?? idx });
      await batch.commit();
    },
    [items, name],
  );

  return { items, loading, error, save, remove, toggle, reorder };
}
