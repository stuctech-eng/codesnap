"use client";
import { useState } from "react";
import { Snippet } from "@/lib/types";
import BottomNav from "./BottomNav";

const initials = (t = "") => t.slice(0, 2).toUpperCase();
const AV = ["#f59e0b", "#d97706", "#b45309", "#78350f"];
const avColor = (t = "") => AV[t.charCodeAt(0) % AV.length];

interface Props {
  snip: Snippet; copied: boolean; showSheet: boolean;
  onBack: () => void; onDots: () => void; onEdit: () => void;
  onDelete: () => void; onCopy: () => void; onFav: () => void;
  onCloseSheet: () => void; onAdd: () => void;
}

export default function DetailView({
  snip, copied, showSheet,
  onBack, onDots, onEdit, onDelete,
  onCopy, onFav, onCloseSheet, onAdd
}: Props) {
  const [tab, setTab] = useState<"about" | "code">("about");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 12px 10px", borderBottom: "1px solid #111", background: "#000", position: "sticky", top: 0, zIndex: 10 }}>
        <button style={{ display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          <span style={{ color: "#f59e0b", fontSize: 17 }}>Snippets</span>
        </button>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{snip.title}</span>
        <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={onDots}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1c1c1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#9ca3af"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </div>
        </button>
      </div>

      <div style={{ padding: "10px 16px 0", background: "#000" }}>
        <div style={{ background: "#1c1c1e", borderRadius: 10, padding: 2, display: "flex" }}>
          {(["about", "code"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 15, fontWeight: tab === t ? 600 : 500, background: tab === t ? "#3a3a3c" : "transparent", color: tab === t ? "#fff" : "#9ca3af" }}>
              {t === "about" ? "About" : "Code"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 110 }}>
        {tab === "about" ? (
          <div style={{ padding: "24px 20px" }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#000", background: avColor(snip.title), marginBottom: 20 }}>
              {initials(snip.title)}
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.02em" }}>{snip.title}</h1>
            {snip.category && (
              <div style={{ display: "inline-block", background: "#1c1c1e", color: "#f59e0b", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                {snip.category}
              </div>
            )}
            {snip.description && (
              <p style={{ fontSize: 16, color: "#9ca3af", lineHeight: 1.6, margin: "0 0 18px" }}>{snip.description}</p>
            )}
            {snip.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {snip.tags.map(t => (
                  <span key={t} style={{ background: "#1c1c1e", color: "#6b7280", padding: "4px 10px", borderRadius: 20, fontSize: 13 }}>#{t}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "16px" }}>
            <button
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: 16, borderRadius: 14, border: "none", fontSize: 17, fontWeight: 700, cursor: "pointer", marginBottom: 16, background: copied ? "#10b981" : "#f59e0b", color: copied ? "#fff" : "#000", transition: "background 0.2s" }}
              onClick={onCopy}>
              {copied ? "✓ Gekopieerd!" : "⎘ Kopieer Code"}
            </button>
            <div style={{ background: "#0d1117", borderRadius: 14, border: "1px solid #1c1c1e", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid #1c1c1e", background: "#161b22" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#6b7280", letterSpacing: "0.12em" }}>CODE</span>
              </div>
              <pre style={{ margin: 0, padding: "16px 14px", overflowX: "auto" }}>
                <code style={{ fontSize: 12.5, color: "#7dd3fc", lineHeight: 1.75, fontFamily: "'Fira Code','JetBrains Mono',monospace", whiteSpace: "pre" }}>
                  {snip.code}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>

      <BottomNav onAdd={onAdd} />

      {showSheet && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 200, padding: "0 8px 34px" }}
          onClick={onCloseSheet}>
          <div onClick={e => e.stopPropagation()}>
            <div style={{ background: "#1c1c1e", borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "#f59e0b", fontSize: 17, cursor: "pointer" }} onClick={onEdit}>Edit</button>
              <div style={{ height: 1, background: "#2d2d2f" }} />
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "#ef4444", fontSize: 17, cursor: "pointer" }} onClick={onDelete}>Verwijderen</button>
            </div>
            <button style={{ width: "100%", padding: 18, background: "#1c1c1e", border: "none", color: "#f59e0b", fontSize: 17, fontWeight: 700, cursor: "pointer", borderRadius: 14 }} onClick={onCloseSheet}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
