"use client";
import { useState, useRef, useEffect } from "react";
import { Snippet } from "@/lib/types";

const CATS = ["AI Prompts", "Snippets", "Config", "UI", "Machines", "Ideeën"];

interface Props {
  snip: Snippet | null;
  onSave: (data: Omit<Snippet, "id">) => void;
  onCancel: () => void;
}

export default function EditView({ snip, onSave, onCancel }: Props) {
  const isNew = !snip;
  const [form, setForm] = useState({
    title: snip?.title || "",
    description: snip?.description || "",
    code: snip?.code || "",
    category: snip?.category || CATS[0],
    tags: snip?.tags?.join(", ") || "",
    favorite: snip?.favorite || false,
  });
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.style.height = "auto";
      codeRef.current.style.height = codeRef.current.scrollHeight + "px";
    }
  }, [form.code]);

  const save = () => {
    if (!form.title.trim()) { alert("Titel is verplicht"); return; }
    onSave({
      ...form,
      tags: form.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
    });
  };

  const F: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "#1c1c1e", border: "none",
    borderRadius: 12, color: "#f9fafb",
    fontSize: 16, padding: 14, outline: "none",
  };
  const L: React.CSSProperties = {
    fontSize: 12, color: "#6b7280", fontWeight: 600,
    marginBottom: 6, paddingLeft: 2,
    letterSpacing: "0.05em", display: "block",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 16px 12px", background: "#000", borderBottom: "1px solid #111", position: "sticky", top: 0, zIndex: 10 }}>
        <button style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 17, cursor: "pointer" }} onClick={onCancel}>Cancel</button>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{isNew ? "Add Snippet" : "Edit Snippet"}</span>
        <button style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 17, fontWeight: 700, cursor: "pointer" }} onClick={save}>Save</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 60px" }}>
        <div style={{ marginBottom: 12 }}>
          <label style={L}>TITEL</label>
          <input style={F} placeholder="Naam van de snippet"
            value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={L}>BESCHRIJVING</label>
          <textarea style={{ ...F, minHeight: 80, resize: "none", lineHeight: 1.5 }}
            placeholder="Wat doet deze snippet?"
            value={form.description} onChange={e => set("description", e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={L}>CODE</label>
          <textarea ref={codeRef}
            style={{ ...F, fontFamily: "'Fira Code',monospace", fontSize: 13, color: "#fbbf24", minHeight: 130, resize: "none", lineHeight: 1.7 }}
            placeholder="Plak hier je code..."
            value={form.code} onChange={e => set("code", e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={L}>CATEGORIE</label>
          <select style={{ ...F }} value={form.category} onChange={e => set("category", e.target.value)}>
            {CATS.map(c => <option key={c} value={c} style={{ background: "#1c1c1e" }}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={L}>TAGS</label>
          <input style={F} placeholder="react, api, prompt"
            value={form.tags} onChange={e => set("tags", e.target.value)} />
        </div>

        <button style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1c1c1e", borderRadius: 12, padding: 14, border: "none", width: "100%", cursor: "pointer", marginBottom: 16 }}
          onClick={() => set("favorite", !form.favorite)}>
          <span style={{ color: "#9ca3af", fontSize: 15 }}>Markeer als favoriet</span>
          <div style={{ width: 46, height: 26, borderRadius: 13, position: "relative", background: form.favorite ? "#f59e0b" : "#3a3a3c", transition: "background 0.25s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "transform 0.25s", transform: form.favorite ? "translateX(22px)" : "translateX(2px)" }} />
          </div>
        </button>

        <button style={{ width: "100%", padding: 16, background: "#f59e0b", borderRadius: 14, border: "none", color: "#000", fontSize: 17, fontWeight: 700, cursor: "pointer" }}
          onClick={save}>
          {isNew ? "Snippet Opslaan" : "Wijzigingen Opslaan"}
        </button>
      </div>
    </div>
  );
}
