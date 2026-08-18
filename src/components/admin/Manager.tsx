import { type ReactNode, useEffect, useState } from "react";
import { useCollection, type Row } from "./useCollection";

export type FieldType = "text" | "textarea" | "url" | "select" | "month" | "date" | "checkbox";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  full?: boolean;
}

export interface ColumnApi {
  toggle: (slug: string, field: string, value: boolean) => Promise<void>;
}

export interface ColumnDef<T> {
  header: string;
  width?: string;
  render: (item: T, api: ColumnApi) => ReactNode;
}

interface ManagerProps<T extends Row> {
  kicker: string;
  title: string;
  singular: string;
  description: ReactNode;
  name: string;
  fields: FieldDef[];
  columns: ColumnDef<T>[];
  newItem: () => T;
  requiredKey: string;
  slugFrom: (draft: T) => string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 48) || "item";
}

function ensureUnique(base: string, existing: string[]): string {
  let slug = base;
  let n = 2;
  while (existing.includes(slug)) slug = `${base}-${n++}`;
  return slug;
}

const chkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  cursor: "pointer",
  fontSize: "13px",
};

export function Manager<T extends Row>(props: ManagerProps<T>) {
  const { items, loading, error, save, remove, toggle, reorder } = useCollection<T>(props.name);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<T | null>(null);
  const [status, setStatus] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const setField = (key: string, value: unknown) =>
    setDraft((d) => (d ? ({ ...d, [key]: value } as T) : d));

  const startNew = () => {
    setEditing("__new");
    setDraft(props.newItem());
    setStatus("");
    setConfirmingDelete(false);
  };
  const startEdit = (item: T) => {
    setEditing(item.slug);
    setDraft({ ...item });
    setStatus("");
    setConfirmingDelete(false);
  };
  const cancel = () => {
    setEditing(null);
    setDraft(null);
    setConfirmingDelete(false);
  };

  // While the edit modal is open: close on Escape and lock background scroll.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancel();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [editing]);

  const doSave = async () => {
    if (!draft) return;
    const req = String((draft as Record<string, unknown>)[props.requiredKey] ?? "").trim();
    if (!req) {
      setStatus(`A ${props.requiredKey} is required`);
      return;
    }
    let toWrite = draft;
    if (editing === "__new") {
      const slug = ensureUnique(slugify(props.slugFrom(draft)), items.map((i) => i.slug));
      toWrite = { ...draft, slug, order: items.length } as T;
    }
    try {
      await save(toWrite);
      setStatus("Saved — live on the site after Publish");
      cancel();
    } catch (e) {
      setStatus(`Error: ${(e as Error).message}`);
    }
  };

  const doDelete = async () => {
    if (!draft || editing === "__new") return cancel();
    try {
      await remove(draft.slug);
      setStatus("Deleted");
      cancel();
    } catch (e) {
      setStatus(`Error: ${(e as Error).message}`);
    }
  };

  const renderField = (f: FieldDef) => {
    const val = (draft as Record<string, unknown> | null)?.[f.key];
    if (f.type === "checkbox") {
      return (
        <label style={{ ...chkStyle, fontSize: "13.5px" }}>
          <input type="checkbox" checked={Boolean(val)} onChange={(e) => setField(f.key, e.target.checked)} />
          {f.label}
        </label>
      );
    }
    if (f.type === "select") {
      return (
        <select className="input" value={(val as string) ?? ""} onChange={(e) => setField(f.key, e.target.value)}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    if (f.type === "textarea") {
      return (
        <textarea
          className="input"
          rows={3}
          value={(val as string) ?? ""}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
    }
    return (
      <input
        className="input"
        type={f.type === "url" ? "url" : f.type === "month" ? "month" : f.type === "date" ? "date" : "text"}
        value={(val as string) ?? ""}
        placeholder={f.placeholder}
        onChange={(e) => setField(f.key, e.target.value)}
      />
    );
  };

  return (
    <section style={{ padding: "24px 0 0" }}>
      <p style={{ fontSize: "13px", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--color-accent)", margin: "0 0 14px" }}>
        {props.kicker}
      </p>
      <h2 style={{ fontSize: "clamp(26px,2.8vw,36px)", lineHeight: 1.11, letterSpacing: "-0.015em", margin: "0 0 0 -0.06em" }}>
        {props.title}
      </h2>
      <p style={{ fontSize: "15.5px", lineHeight: "28px", color: "color-mix(in srgb, var(--color-text) 78%, transparent)", maxWidth: "62ch", margin: "16px 0 0" }}>
        {props.description}
      </p>
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center", margin: "24px 0" }}>
        <button type="button" className="btn btn-primary" onClick={startNew}>
          Add {props.singular}
        </button>
        <span style={{ fontSize: "13px", color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>{status}</span>
      </div>

      {error && <p style={{ color: "var(--color-accent-300)" }}>Couldn't load: {error}</p>}
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <table className="table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: "90px" }}>Order</th>
              {props.columns.map((c) => (
                <th key={c.header} style={c.width ? { width: c.width } : undefined}>
                  {c.header}
                </th>
              ))}
              <th style={{ width: "90px" }}>Visible</th>
              <th style={{ width: "70px" }} />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.slug}>
                <td>
                  <span style={{ display: "inline-flex", gap: "4px" }}>
                    <button type="button" className="btn btn-icon btn-ghost" aria-label="Move up" onClick={() => reorder(item.slug, -1)}>
                      ↑
                    </button>
                    <button type="button" className="btn btn-icon btn-ghost" aria-label="Move down" onClick={() => reorder(item.slug, 1)}>
                      ↓
                    </button>
                  </span>
                </td>
                {props.columns.map((c) => (
                  <td key={c.header}>{c.render(item, { toggle })}</td>
                ))}
                <td>
                  <label style={chkStyle}>
                    <input
                      type="checkbox"
                      checked={!item.hidden}
                      onChange={(e) => toggle(item.slug, "hidden", !e.target.checked)}
                    />
                    Shown
                  </label>
                </td>
                <td>
                  <button type="button" className="btn btn-secondary" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && draft && (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={editing === "__new" ? `New ${props.singular}` : `Edit ${props.singular}`}
          onClick={cancel}
        >
          <div className="card elev-lg admin-modal" onClick={(e) => e.stopPropagation()}>
            <p className="card-kicker" style={{ color: "var(--color-accent)" }}>
              {editing === "__new" ? `New ${props.singular}` : `Editing — ${String((draft as Record<string, unknown>)[props.requiredKey] ?? "")}`}
            </p>
            <div className="admin-modal-grid">
              {props.fields.map((f) => (
                <div key={f.key} className="field" style={f.full ? { gridColumn: "1 / -1" } : undefined}>
                  {f.type !== "checkbox" && <label>{f.label}</label>}
                  {renderField(f)}
                </div>
              ))}
            </div>
            <div className="dialog-actions" style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)", flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" className="btn btn-primary" onClick={doSave}>
              Save
            </button>
            <button type="button" className="btn btn-ghost" onClick={cancel}>
              Cancel
            </button>
            {editing !== "__new" &&
              (confirmingDelete ? (
                <span style={{ marginLeft: "auto", display: "inline-flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
                    Delete this {props.singular}? This can't be undone.
                  </span>
                  <button type="button" className="btn btn-ghost" style={{ color: "var(--color-accent-300)" }} onClick={doDelete}>
                    Yes, delete
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setConfirmingDelete(false)}>
                    Keep
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ marginLeft: "auto", color: "var(--color-accent-300)" }}
                  onClick={() => setConfirmingDelete(true)}
                >
                  Delete {props.singular}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
