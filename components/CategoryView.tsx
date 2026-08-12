"use client";

import { useState, useMemo } from "react";
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

function getCatConfig(cat: string, index: number): { color: string; iconKey: IconKey } {
  return CAT_CONFIG[cat] || { color: DEFAULT_COLORS[index % DEFAULT_COLORS.length], iconKey: "default" };
}

function CatIcon({ iconKey, color, size }: { iconKey: IconKey; color: string; size: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const };
  switch (iconKey) {
    case "prompt":  return <svg {...props}><path d="M12 3v18M3 12h18M8 8l8 8M16 8l-8 8"/></svg>;
    case "apps":    return <svg {...props}><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;
    case "doc":     return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
    case "bug":     return <svg {...props}><rect x="8" y="6" width="8" height="14" rx="4"/><path d="M19 8h-2M19 12h-2M19 16h-2M5 8h2M5 12h2M5 16h2M9 4v2M15 4v2"/></svg>;
    case "idea":    return <svg {...props}><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>;
    case "config":  return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case "games":   return <svg {...props}><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="13" r="1"/><circle cx="18" cy="11" r="1"/><rect x="2" y="6" width="20" height="12" rx="6"/></svg>;
    case "scripts": return <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    case "ui":      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>;
    case "code":    return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
    default:        return <svg {...props}><circle cx="12" cy="12" r="9"/></svg>;
  }
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

type SortType = "nieuwste" | "oudste" | "az";

interface Props {
  category: string;
  allSnips: Snippet[];
  onBack: () => void;
  onOpenSnippet: (id: string) => void;
  onFav: (id: string, cur: boolean) => void;
}

export default function CategoryView({ category, allSnips, onBack, onOpenSnippet, onFav }: Props) {
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState<SortType>("nieuwste");

  const cfg = getCatConfig(category, 0);

  const snips = useMemo(() => {
    let list = allSnips.filter(s => !s.archived && s.category === category);
    if (search) {
      list = list.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.tags?.some(t => t.includes(search.toLowerCase()))
      );
    }
    if (sort === "nieuwste") list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    else if (sort === "oudste") list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    else if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [allSnips, category, search, sort]);

  return (
    <div style={{ minHeight: "100vh", background: "#0B1020", color: "#fff", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ padding: "52px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#0B1020", zIndex: 10 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", marginBottom: 14, padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          <span style={{ color: "#4F8CFF", fontSize: 16 }}>Home</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: cfg.color + "1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CatIcon iconKey={cfg.iconKey} color={cfg.color} size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{category}</h1>
            <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>{snips.length} {snips.length === 1 ? "snippet" : "snippets"}</div>
          </div>
        </div>

        {/* ZOEKBALK */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, background: "#151D31", borderRadius: 14, display: "flex", alignItems: "center", padding: "0 14px", gap: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 15, padding: "12px 0" }}
              placeholder={"Zoek in " + category + "..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button style={{ background: "none", border: "none", color: "#64748B", fontSize: 14, cursor: "pointer" }} onClick={() => setSearch("")}>x</button>}
          </div>
          <button
            style={{ width: 46, height: 46, borderRadius: 14, background: showFilter ? "#4F8CFF" : "#151D31", border: "1px solid " + (showFilter ? "#4F8CFF" : "rgba(255,255,255,0.06)"), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            onClick={() => setShowFilter(!showFilter)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showFilter ? "#fff" : "#94A3B8"} strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
        </div>

        {showFilter && (
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {(["nieuwste", "oudste", "az"] as SortType[]).map(s => (
              <button key={s}
                style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "1px solid " + (sort === s ? "#4F8CFF" : "rgba(255,255,255,0.08)"), background: sort === s ? "#4F8CFF" : "#151D31", color: sort === s ? "#fff" : "#94A3B8", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                onClick={() => setSort(s)}
              >
                {s === "nieuwste" ? "Nieuwste" : s === "oudste" ? "Oudste" : "A-Z"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LIJST */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 40px" }}>
        {snips.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#94A3B8" }}>
              {search ? "Geen resultaten voor \"" + search + "\"" : "Geen snippets in deze categorie"}
            </div>
          </div>
        ) : (
          snips.map((snip, i) => {
            const avatarColor = darken(cfg.color, i * 10);
            return (
              <div key={snip.id}
                onClick={() => onOpenSnippet(snip.id!)}
                style={{ display: "flex", alignItems: "center", padding: "13px 14px", background: "#151D31", borderRadius: 14, marginBottom: 8, cursor: "pointer", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", background: avatarColor, flexShrink: 0, marginRight: 12 }}>
                  {initials(snip.title)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.title}</div>
                  {snip.description && <div style={{ fontSize: 12, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.description}</div>}
                </div>
                <button
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, flexShrink: 0 }}
                  onClick={e => { e.stopPropagation(); onFav(snip.id!, snip.favorite); }}
                >
                  {snip.favorite
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill={cfg.color} stroke={cfg.color} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  }
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
