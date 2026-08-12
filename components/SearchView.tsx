"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Snippet } from "@/lib/types";

type IconKey = "prompt" | "apps" | "doc" | "bug" | "idea" | "config" | "games" | "scripts" | "ui" | "code" | "default";

const CAT_CONFIG: Record<string, { color: string; iconKey: IconKey }> = {
  "AI Prompts":   { color: "#a78bfa", iconKey: "prompt" },
  "Apps":         { color: "#818cf8", iconKey: "apps" },
  "Documentatie": { color: "#fbbf24", iconKey: "doc" },
  "Bug Fix":      { color: "#f87171", iconKey: "bug" },
  "Ideeën":       { color: "#c084fc", iconKey: "idea" },
  "Config":       { color: "#34d399", iconKey: "config" },
  "Games":        { color: "#2dd4bf", iconKey: "games" },
  "Scripts":      { color: "#60a5fa", iconKey: "scripts" },
  "UI":           { color: "#f472b6", iconKey: "ui" },
  "Code":         { color: "#fb923c", iconKey: "code" },
};
const DEFAULT_COLORS = ["#60a5fa","#a78bfa","#34d399","#f472b6","#c084fc","#f87171","#2dd4bf","#fb923c"];
function getCatConfig(cat: string, index: number) {
  return CAT_CONFIG[cat] || { color: DEFAULT_COLORS[index % DEFAULT_COLORS.length], iconKey: "default" as IconKey };
}

const initials = (t = "") => t.slice(0, 2).toUpperCase();
function darken(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
  } catch { return hex; }
}

interface Props {
  allSnips: Snippet[];
  onBack: () => void;
  onOpenSnippet: (id: string) => void;
  onFav: (id: string, cur: boolean) => void;
}

export default function SearchView({ allSnips, onBack, onOpenSnippet, onFav }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 150); }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const active = allSnips.filter(s => !s.deletedAt);
    return active.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description?.toLowerCase().includes(query.toLowerCase()) ||
      s.tags?.some(t => t.includes(query.toLowerCase())) ||
      s.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [allSnips, query]);

  return (
    <div style={{ minHeight: "100vh", background: "#0B1020", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 20px 16px", position: "sticky", top: 0, background: "#0B1020", zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, background: "#151D31", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(79,140,255,0.15)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              ref={inputRef}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 16 }}
              placeholder="Zoek snippets..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer" }} onClick={() => setQuery("")}>x</button>}
          </div>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#4F8CFF", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Annuleer</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 40px" }}>
        {!query && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#4A5568", fontSize: 14 }}>
            Typ om te zoeken in titels, beschrijvingen, tags en categorieën
          </div>
        )}
        {query && results.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
            Geen resultaten voor &quot;{query}&quot;
          </div>
        )}
        {results.map((snip, i) => {
          const cfg = getCatConfig(snip.category, i);
          const avatarColor = darken(cfg.color, (i % 5) * 10);
          return (
            <div key={snip.id}
              onClick={() => onOpenSnippet(snip.id!)}
              style={{ display: "flex", alignItems: "center", padding: "13px 14px", background: "#151D31", borderRadius: 14, marginBottom: 8, cursor: "pointer", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", background: avatarColor, flexShrink: 0, marginRight: 12 }}>
                {initials(snip.title)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.title}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.category}{snip.description ? " · " + snip.description : ""}</div>
              </div>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", padding: 6, flexShrink: 0 }}
                onClick={e => { e.stopPropagation(); onFav(snip.id!, snip.favorite); }}
              >
                {snip.favorite
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill={cfg.color} stroke={cfg.color} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                }
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
