"use client";
import { useState, useRef, useEffect } from "react";
import { Snippet } from "@/lib/types";

const CATS = ["AI Prompts", "Snippets", "Config", "UI", "Machines", "Ideeën"];

interface Props {
  snip: Snippet | null;
  theme: "dark" | "light";
  onSave: (data: Omit<Snippet, "id">) => void;
  onCancel: () => void;
}

type Field = "title" | "description" | "code" | "tags" | "notes" | null;

export default function EditView({ snip, theme, onSave, onCancel }: Props) {
  const isNew = !snip;
  const [form, setForm] = useState({
    title: snip?.title || "",
    description: snip?.description || "",
    code: snip?.code || "",
    notes: snip?.notes || "",
    category: snip?.category || CATS[0],
    tags: snip?.tags?.join(", ") || "",
    favorite: snip?.favorite || false,
  });
  const [activeField, setActiveField] = useState<Field>(null);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title.trim()) { alert("Titel is verplicht"); return; }
    onSave({
      ...form,
      tags: form.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
    });
  };

  if (activeField) {
    return (
      <FullScreenField
        label={activeField.toUpperCase()}
        value={form[activeField] as string}
        isCode={activeField === "code"}
        onDone={(val) => { set(activeField, val); setActiveField(null); }}
        onCancel={() => setActiveField(null)}
      />
    );
  }

  const fieldRow = (label: string, field: Field, preview: string) => (
    <button
      key={field}
      style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start",
        gap: 4, background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "14px 16px", width: "100%",
        cursor: "pointer", marginBottom: 12, boxSizing: "border-box",
      }}
      onClick={() => setActiveField(field)}
    >
      <span style={{
        fontSize: 11, color: "var(--text3)",
        fontWeight: 700, letterSpacing: "0.08em",
      }}>
        {label} ›
      </span>
      <span style={{
        fontSize: 15, textAlign: "left", lineHeight: 1.4,
        color: preview ? "var(--text)" : "var(--text3)",
        fontFamily: field === "code" ? "monospace" : "inherit",
        wordBreak: "break-all",
      }}>
        {preview || `Tik om ${label.toLowerCase()} in te voeren...`}
      </span>
    </button>
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "52px 16px 12px", background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 17, cursor: "pointer" }} onClick={onCancel}>Cancel</button>
        <span style={{ fontSize: 17, fontWeight: 600, color: "var(--text)" }}>
          {isNew ? "Add Snippet" : "Edit Snippet"}
        </span>
        <button style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 17, fontWeight: 700, cursor: "pointer" }} onClick={save}>Save</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 60px" }}>
        {fieldRow("TITEL", "title", form.title)}
        {fieldRow("BESCHRIJVING", "description", form.description)}
        {fieldRow(
          "CODE", "code",
          form.code ? form.code.slice(0, 80) + (form.code.length > 80 ? "..." : "") : ""
        )}
        {fieldRow(
          "NOTITIES", "notes",
          form.notes ? form.notes.slice(0, 80) + (form.notes.length > 80 ? "..." : "") : ""
        )}

        {/* Categorie */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 11, color: "var(--text3)", fontWeight: 700,
            letterSpacing: "0.08em", marginBottom: 6, paddingLeft: 2,
          }}>
            CATEGORIE
          </div>
          <select
            style={{
              width: "100%", boxSizing: "border-box",
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 12, color: "var(--text)",
              fontSize: 16, padding: 14, outline: "none",
            }}
            value={form.category}
            onChange={e => set("category", e.target.value)}
          >
            {CATS.map(c => (
              <option key={c} value={c} style={{ background: "var(--bg2)" }}>{c}</option>
            ))}
          </select>
        </div>

        {fieldRow("TAGS", "tags", form.tags)}

        {/* Favoriet */}
        <button
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--bg2)", borderRadius: 14,
            padding: "14px 16px", border: "1px solid var(--border)",
            width: "100%", cursor: "pointer", marginBottom: 20,
            boxSizing: "border-box",
          }}
          onClick={() => set("favorite", !form.favorite)}
        >
          <span style={{ color: "var(--text2)", fontSize: 15 }}>
            Markeer als favoriet
          </span>
          <div style={{
            width: 46, height: 26, borderRadius: 13, position: "relative",
            background: form.favorite ? "var(--accent)" : "var(--bg3)",
            transition: "background 0.25s", flexShrink: 0,
          }}>
            <div style={{
              position: "absolute", top: 3, width: 20, height: 20,
              borderRadius: "50%", background: "#fff",
              transition: "transform 0.25s",
              transform: form.favorite ? "translateX(22px)" : "translateX(2px)",
            }} />
          </div>
        </button>

        <button
          style={{
            width: "100%", padding: 16, background: "var(--accent)",
            borderRadius: 14, border: "none", color: "#000",
            fontSize: 17, fontWeight: 700, cursor: "pointer",
          }}
          onClick={save}
        >
          {isNew ? "Snippet Opslaan" : "Wijzigingen Opslaan"}
        </button>
      </div>
    </div>
  );
}

function FullScreenField({ label, value, isCode, onDone, onCancel }: {
  label: string; value: string; isCode: boolean;
  onDone: (val: string) => void; onCancel: () => void;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => ref.current?.focus(), 100);
  }, []);

  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setText(prev => prev + t);
    } catch {
      alert("Klembord niet beschikbaar -- plak handmatig met lang indrukken");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg)",
      zIndex: 500, display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "52px 16px 12px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}>
        <button style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 17, cursor: "pointer" }} onClick={onCancel}>Annuleer</button>
        <span style={{ fontSize: 17, fontWeight: 600, color: "var(--text)" }}>{label}</span>
        <button style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 17, fontWeight: 700, cursor: "pointer" }} onClick={() => onDone(text)}>Klaar</button>
      </div>

      <textarea
        ref={ref}
        style={{
          flex: 1, padding: 20,
          fontSize: isCode ? 14 : 17,
          lineHeight: isCode ? 1.7 : 1.6,
          background: isCode ? "#1e1e1e" : "var(--bg)",
          border: "none", outline: "none",
          color: isCode ? "#d4d4d4" : "var(--text)",
          fontFamily: isCode ? "'Fira Code','JetBrains Mono',monospace" : "inherit",
          resize: "none",
        }}
        placeholder={isCode ? "Plak hier je code..." : `Voer ${label.toLowerCase()} in...`}
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <div style={{
        padding: "10px 16px 34px",
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 12, color: "var(--text3)" }}>
          {text.split("\n").length} regels · {text.length} tekens
        </span>
        <button
          style={{
            background: "var(--accent)", border: "none",
            borderRadius: 10, padding: "8px 16px",
            color: "#000", fontSize: 14, fontWeight: 700,
            cursor: "pointer",
          }}
          onClick={pasteFromClipboard}
        >
          ⎘ Plak van klembord
        </button>
      </div>
    </div>
  );
}
