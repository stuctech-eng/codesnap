"use client";

import { useMemo } from "react";
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

function getRelativeTime(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "zojuist";
  if (diffMin < 60) return diffMin + " min geleden";
  if (diffHour < 24) return diffHour + " uur geleden";
  if (diffDay === 1) return "gisteren";
  return diffDay + " dagen geleden";
}

function getLangFromSnippet(snip: Snippet): string {
  const block = snip.codeBlocks?.[0];
  if (!block) return "";
  const ext = block.filename.split(".").pop()?.toLowerCase() || "";
  return ext;
}

interface Props {
  allSnips: Snippet[];
  lastOpened: Snippet | null;
  onOpenCategory: (cat: string) => void;
  onOpenSnippet: (id: string) => void;
  onSearch: (v: string) => void;
  onFav: (id: string, cur: boolean) => void;
  onAdd: () => void;
  onOpenBibliotheek: () => void;
  onOpenProfiel: () => void;
}

export default function HomeView({
  allSnips, lastOpened, onOpenCategory, onOpenSnippet, onSearch, onFav, onAdd,
  onOpenBibliotheek, onOpenProfiel,
}: Props) {
  const activeSnips = useMemo(() => allSnips.filter(s => !s.archived), [allSnips]);
  const favorites = useMemo(() => activeSnips.filter(s => s.favorite), [activeSnips]);
  const categories = useMemo(() => Array.from(new Set(activeSnips.map(s => s.category))).filter(Boolean), [activeSnips]);
  const isEmpty = activeSnips.length === 0;
  const greeting = getGreeting();

  const catIndexMap: Record<string, number> = {};
  categories.forEach((cat, i) => { catIndexMap[cat] = i; });

  return (
    <div style={{ minHeight: "100vh", background: "#0B1020", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "56px 20px 100px" }}>

        {/* GROET + PROFIEL */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500, marginBottom: 2 }}>{greeting} 👋</div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em" }}>CodeSnap</h1>
          </div>
          <button onClick={onOpenProfiel} style={{ width: 38, height: 38, borderRadius: "50%", background: "#151D31", border: "1px solid #202A44", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginTop: 4 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>

        {/* ZOEKBALK */}
        <button
          onClick={() => onSearch("")}
          style={{ width: "100%", background: "#151D31", borderRadius: 18, padding: "17px 18px", color: "#64748B", fontSize: 16, marginBottom: 28, display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(79,140,255,0.12)", cursor: "pointer" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span>Zoek snippets...</span>
        </button>

        {/* CONTINUE WORKING */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Verder waar je gebleven was
        </div>

        {lastOpened && !isEmpty ? (
          <div
            onClick={() => onOpenSnippet(lastOpened.id!)}
            style={{ background: "linear-gradient(135deg, #202A44 0%, #151D31 100%)", borderRadius: 20, padding: 20, marginBottom: 26, border: "1px solid rgba(79,140,255,0.15)", position: "relative", overflow: "hidden", cursor: "pointer" }}
          >
            <div style={{ fontSize: 11, color: "#4F8CFF", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Laatst geopend</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em" }}>{lastOpened.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>
              {getLangFromSnippet(lastOpened) && (
                <span style={{ background: "rgba(79,140,255,0.15)", color: "#4F8CFF", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>
                  {getLangFromSnippet(lastOpened)}
                </span>
              )}
              {getLangFromSnippet(lastOpened) && <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#94A3B8" }} />}
              <span>{getRelativeTime(lastOpened.updatedAt || lastOpened.createdAt)}</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#4F8CFF", color: "#fff", padding: "10px 18px", borderRadius: 12, fontSize: 14, fontWeight: 700 }}>
              Doorgaan
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        ) : (
          <div style={{ background: "linear-gradient(135deg, #202A44 0%, #151D31 100%)", borderRadius: 20, padding: "28px 16px", marginBottom: 26, border: "1px solid rgba(79,140,255,0.15)", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, margin: "0 auto 14px", background: "rgba(79,140,255,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F8CFF" strokeWidth="2" strokeLinecap="round"><path d="M12 3v18M3 12h18"/><path d="m8 8 8 8M16 8l-8 8"/></svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Begin met je eerste snippet</div>
            <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>Bewaar code, prompts en ideeën<br/>zodat je ze later direct terugvindt.</div>
          </div>
        )}

        {/* FAVORIETEN */}
        {favorites.length > 0 ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Favorieten</div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", marginBottom: 26, paddingBottom: 2 }}>
              {favorites.map((snip, i) => {
                const cfg = getCatConfig(snip.category, catIndexMap[snip.category] || 0);
                return (
                  <div key={snip.id} onClick={() => onOpenSnippet(snip.id!)}
                    style={{ flexShrink: 0, width: 130, background: "#0B1020", borderRadius: 16, padding: 14, border: "1px solid #202A44", cursor: "pointer" }}>
                    <div style={{ width: 20, height: 20, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CatIcon iconKey={cfg.iconKey} color="#94A3B8" size={18} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.title}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{snip.category}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : !isEmpty && (
          <div style={{ background: "#151D31", borderRadius: 16, padding: "16px 18px", marginBottom: 26, border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Nog geen favorieten</div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>Markeer snippets met ☆ om ze hier te zien</div>
            </div>
          </div>
        )}

        {/* BIBLIOTHEEK */}
        {!isEmpty && (
          <div onClick={onOpenBibliotheek} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 2px 22px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Bibliotheek</span>
              <span style={{ fontSize: 12, color: "#4F8CFF", fontWeight: 600 }}>Bekijk alles →</span>
            </div>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>
              <b style={{ color: "#4F8CFF" }}>{activeSnips.length}</b> snippets · <b style={{ color: "#4F8CFF" }}>{favorites.length}</b> favorieten · <b style={{ color: "#4F8CFF" }}>{categories.length}</b> categorieën
            </span>
          </div>
        )}
        {isEmpty && (
          <div style={{ padding: "4px 2px 22px" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Bibliotheek</span>
            <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: 10 }}><b style={{ color: "#4F8CFF" }}>0</b> snippets</span>
          </div>
        )}

        {/* CATEGORIEËN — alleen tonen als er snippets zijn */}
        {!isEmpty && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Categorieën</div>
            {categories.map((cat, index) => {
              const cfg = getCatConfig(cat, index);
              const count = activeSnips.filter(s => s.category === cat).length;
              return (
                <div key={cat} onClick={() => onOpenCategory(cat)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 4px", borderBottom: "1px solid #151D31", cursor: "pointer" }}>
                  <div style={{ width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CatIcon iconKey={cfg.iconKey} color="#94A3B8" size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{cat}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{count} {count === 1 ? "snippet" : "snippets"}</div>
                  </div>
                  <span style={{ color: "#4A5568", fontSize: 14 }}>›</span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* STICKY BOTTOM */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, padding: "16px 20px 34px", borderTop: "1px solid rgba(255,255,255,0.03)", background: "#0B1020" }}>
        <button onClick={onAdd} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#4F8CFF", border: "none", borderRadius: 18, padding: 16, width: "100%", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(79,140,255,0.35)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nieuwe Snippet
        </button>
      </div>
    </div>
  );
}
