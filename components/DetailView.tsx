"use client";
import { useState } from "react";
import { Snippet } from "@/lib/types";
import BottomNav from "./BottomNav";

const initials = (t = "") => t.slice(0, 2).toUpperCase();
const AV = ["#f59e0b", "#d97706", "#b45309", "#78350f"];
const avColor = (t = "") => AV[t.charCodeAt(0) % AV.length];
const CAT_COLORS: Record<string, string> = {
  "AI Prompts": "#6366f1", "Snippets": "#f59e0b",
  "Config": "#10b981", "UI": "#ec4899",
  "Machines": "#3b82f6", "Ideeën": "#8b5cf6",
};

interface Props {
  snip: Snippet; copied: boolean; showSheet: boolean; theme: "dark" | "light";
  onBack: () => void; onDots: () => void; onEdit: () => void;
  onDelete: () => void; onCopy: () => void; onFav: () => void;
  onShare: () => void; onExport: () => void;
  onCloseSheet: () => void; onAdd: () => void;
}

export default function DetailView({
  snip, copied, showSheet, theme,
  onBack, onDots, onEdit, onDelete,
  onCopy, onFav, onShare, onExport,
  onCloseSheet, onAdd,
}: Props) {
  const [tab, setTab] = useState<"about" | "code">("about");
  const catColor = CAT_COLORS[snip.category] || "var(--accent)";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 12px 10px", borderBottom: "1px solid var(--border)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 10 }}>
        <button style={{ display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          <span style={{ color: "var(--accent)", fontSize: 17 }}>Snippets</span>
        </button>
        <span style={{ fontSize: 17, fontWeight: 600, color: "var(--text)" }}>{snip.title}</span>
        <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={onDots}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text2)"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </div>
        </button>
      </div>

      {/* Segment */}
      <div style={{ padding: "10px 16px 0", background: "var(--bg)" }}>
        <div style={{ background: "var(--bg2)", borderRadius: 10, padding: 2, display: "flex" }}>
          {(["about", "code"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 15, fontWeight: tab === t ? 600 : 500, background: tab === t ? "var(--bg3)" : "transparent", color: tab === t ? "var(--text)" : "var(--text2)" }}>
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
            <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 10px", letterSpacing: "-0.02em", color: "var(--text)" }}>{snip.title}</h1>

            {snip.category && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: catColor + "22", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 14, color: catColor }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColor }} />
                {snip.category}
              </div>
            )}

            {snip.description && (
              <p style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.6, margin: "0 0 18px" }}>{snip.description}</p>
            )}

            {snip.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {snip.tags.map(t => (
                  <span key={t} style={{ background: "var(--bg2)", color: "var(--text3)", padding: "4px 10px", borderRadius: 20, fontSize: 13, border: "1px solid var(--border)" }}>#{t}</span>
                ))}
              </div>
            )}

            {/* Acties */}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={onFav}
                style={{ flex: 1, padding: "12px", background: snip.favorite ? "var(--accent)" : "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 700, color: snip.favorite ? "#000" : "var(--text2)" }}>
                {snip.favorite ? "★ Favoriet" : "☆ Favoriet"}
              </button>
              <button onClick={onShare}
                style={{ flex: 1, padding: "12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--text2)" }}>
                ↗ Delen
              </button>
              <button onClick={onExport}
                style={{ flex: 1, padding: "12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "var(--text2)" }}>
                ↓ Export
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "16px" }}>
            <button
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: 16, borderRadius: 14, border: "none", fontSize: 17, fontWeight: 700, cursor: "pointer", marginBottom: 16, background: copied ? "var(--green)" : "var(--accent)", color: copied ? "#fff" : "#000", transition: "background 0.2s" }}
              onClick={onCopy}>
              {copied ? "✓ Gekopieerd!" : "⎘ Kopieer Code"}
            </button>
            <div style={{ background: "var(--code-bg)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--code-bar)" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "var(--text3)", letterSpacing: "0.12em" }}>CODE</span>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>{snip.tags?.[0] || ""}</span>
              </div>
              <pre style={{ margin: 0, padding: "16px 14px", overflowX: "auto" }}>
                <code style={{ fontSize: 12.5, color: "var(--code-text)", lineHeight: 1.75, fontFamily: "'Fira Code','JetBrains Mono',monospace", whiteSpace: "pre" }}>
                  {snip.code}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>

      <BottomNav onAdd={onAdd} onToggleTheme={() => {}} theme={theme} />

      {/* Action sheet */}
      {showSheet && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 200, padding: "0 8px 34px" }}
          onClick={onCloseSheet}>
          <div onClick={e => e.stopPropagation()}>
            <div style={{ background: "var(--bg2)", borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "var(--accent)", fontSize: 17, cursor: "pointer" }} onClick={onEdit}>Edit</button>
              <div style={{ height: 1, background: "var(--border2)" }} />
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "var(--accent)", fontSize: 17, cursor: "pointer" }} onClick={onShare}>Delen</button>
              <div style={{ height: 1, background: "var(--border2)" }} />
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "var(--accent)", fontSize: 17, cursor: "pointer" }} onClick={onExport}>Exporteren</button>
              <div style={{ height: 1, background: "var(--border2)" }} />
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "var(--red)", fontSize: 17, cursor: "pointer" }} onClick={onDelete}>Verwijderen</button>
            </div>
            <button style={{ width: "100%", padding: 18, background: "var(--bg2)", border: "none", color: "var(--accent)", fontSize: 17, fontWeight: 700, cursor: "pointer", borderRadius: 14 }} onClick={onCloseSheet}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
