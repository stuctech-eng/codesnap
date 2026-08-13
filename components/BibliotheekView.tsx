"use client";

import { useState, useMemo } from "react";
import { Snippet } from "@/lib/types";

type FilterTab = "alle" | "favorieten" | "categorieen";
type SortType = "nieuwste" | "oudste" | "az";

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

function getLang(snip: Snippet): string {
  const block = snip.codeBlocks?.[0];
  if (!block) return "";
  return block.filename.split(".").pop()?.toLowerCase() || "";
}


interface Props {
  allSnips: Snippet[];
  onBack: () => void;
  onOpenSnippet: (id: string) => void;
  onOpenCategory: (cat: string) => void;
  onOpenProjectList: (cat: string) => void; // Fase H6 — nieuw
  onFav: (id: string, cur: boolean) => void;
}

export default function BibliotheekView({ allSnips, onBack, onOpenSnippet, onOpenCategory, onOpenProjectList, onFav }: Props) {
  const [tab, setTab] = useState<FilterTab>("alle");
  const [sort, setSort] = useState<SortType>("nieuwste");
  const [showSort, setShowSort] = useState(false);
  const [notesSnip, setNotesSnip] = useState<Snippet | null>(null); // welke notitie-popup open staat

  const activeSnips = useMemo(() => allSnips.filter(s => !s.deletedAt), [allSnips]);
  const favorites = useMemo(() => activeSnips.filter(s => s.favorite), [activeSnips]);
  const categories = useMemo(() => Array.from(new Set(activeSnips.map(s => s.category))).filter(Boolean).sort(), [activeSnips]);

  // Fase H6 — per categorie bepalen of drill-down naar Project-niveau
  // relevant is. Alleen als er minstens één snippet in die categorie
  // een project-waarde heeft; anders gedraagt de categorie zich
  // exact zoals voorheen (direct naar CategoryView).
  const categoriesWithProjects = useMemo(() => {
    const set = new Set<string>();
    activeSnips.forEach(s => { if (s.project) set.add(s.category); });
    return set;
  }, [activeSnips]);

  const list = useMemo(() => {
    let items = tab === "favorieten" ? favorites : activeSnips;
    items = [...items];
    if (sort === "nieuwste") items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    else if (sort === "oudste") items.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    else if (sort === "az") items.sort((a, b) => a.title.localeCompare(b.title));
    return items;
  }, [activeSnips, favorites, tab, sort]);

  return (
    <div style={{ minHeight: "100vh", background: "#0B1020", color: "#fff", display: "flex", flexDirection: "column" }}>

      <div style={{ padding: "52px 18px 16px", position: "sticky", top: 0, background: "#0B1020", zIndex: 10, borderBottom: "1px solid #202A44" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", marginBottom: 12, padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          <span style={{ color: "#4F8CFF", fontSize: 16 }}>Home</span>
        </button>

        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 18 }}>Bibliotheek</h1>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto" }}>
          {([
            { key: "alle" as FilterTab, label: "Alle" },
            { key: "favorieten" as FilterTab, label: "Favorieten" },
            { key: "categorieen" as FilterTab, label: "Categorieën" },
          ]).map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", border: tab === t.key ? "none" : "1px solid #202A44", background: tab === t.key ? "#4F8CFF" : "#151D31", color: tab === t.key ? "#fff" : "#94A3B8" }}
            >
              {t.label}{t.key === "categorieen" ? " ▾" : ""}
            </button>
          ))}
        </div>

        {/* TOOLBAR */}
        {tab !== "categorieen" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#64748B" }}>{list.length} {list.length === 1 ? "snippet" : "snippets"}</span>
            <button onClick={() => setShowSort(!showSort)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer" }}>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{sort === "nieuwste" ? "Recent" : sort === "oudste" ? "Oudste" : "A-Z"} ▾</span>
            </button>
          </div>
        )}

        {showSort && tab !== "categorieen" && (
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {(["nieuwste", "oudste", "az"] as SortType[]).map(s => (
              <button key={s}
                onClick={() => { setSort(s); setShowSort(false); }}
                style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid " + (sort === s ? "#4F8CFF" : "#202A44"), background: sort === s ? "#4F8CFF" : "#151D31", color: sort === s ? "#fff" : "#94A3B8", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                {s === "nieuwste" ? "Nieuwste" : s === "oudste" ? "Oudste" : "A-Z"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 40px" }}>

        {tab === "categorieen" ? (
          categories.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Geen categorieën</div>
          ) : (
            categories.map(cat => {
              const count = activeSnips.filter(s => s.category === cat).length;
              const hasProjects = categoriesWithProjects.has(cat);
              return (
                <div key={cat} onClick={() => hasProjects ? onOpenProjectList(cat) : onOpenCategory(cat)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 4px", borderBottom: "1px solid #151D31", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{cat}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{count} {count === 1 ? "snippet" : "snippets"}</div>
                  </div>
                  <span style={{ color: "#4A5568", fontSize: 14 }}>›</span>
                </div>
              );
            })
          )
        ) : list.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
            {tab === "favorieten" ? "Nog geen favorieten" : "Nog geen snippets"}
          </div>
        ) : (
          list.map(snip => {
            const lang = getLang(snip);
            return (
              <div key={snip.id}
                onClick={() => onOpenSnippet(snip.id!)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 14, border: "1px solid " + (snip.favorite ? "rgba(79,140,255,0.35)" : "#202A44"), marginBottom: 8, background: "#0B1020", cursor: "pointer" }}
              >
                <div
                  style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "1px solid " + (snip.notes ? "rgba(79,140,255,0.35)" : "#202A44"), background: snip.notes ? "rgba(79,140,255,0.08)" : "transparent", flexShrink: 0, cursor: snip.notes ? "pointer" : "default" }}
                  onClick={e => { if (snip.notes) { e.stopPropagation(); setNotesSnip(snip); } }}
                >
                  {snip.notes ? "📝" : ""}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.title}</div>
                  {snip.description && <div style={{ fontSize: 12, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{snip.description}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748B" }}>
                    {lang && <span style={{ background: "rgba(79,140,255,0.12)", color: "#4F8CFF", padding: "1px 7px", borderRadius: 5, fontSize: 10, fontWeight: 700, fontFamily: "monospace" }}>{lang}</span>}
                    <span>{getRelativeTime(snip.updatedAt || snip.createdAt)}</span>
                  </div>
                </div>
                <button
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, flexShrink: 0 }}
                  onClick={e => { e.stopPropagation(); onFav(snip.id!, snip.favorite); }}
                >
                  {snip.favorite
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="#4F8CFF" stroke="#4F8CFF" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  }
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* NOTITIE POPUP */}
      {notesSnip && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 8px 34px" }}
          onClick={() => setNotesSnip(null)}>
          <div style={{ background: "#151D31", borderRadius: 16, overflow: "hidden", border: "1px solid #202A44" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #202A44" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>📝</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{notesSnip.title}</span>
              </div>
              <button style={{ background: "none", border: "none", color: "#64748B", fontSize: 20, cursor: "pointer" }} onClick={() => setNotesSnip(null)}>×</button>
            </div>
            <div style={{ padding: "16px", maxHeight: 300, overflowY: "auto" }}>
              <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{notesSnip.notes}</p>
            </div>
            <div style={{ padding: "10px 16px 14px", borderTop: "1px solid #202A44" }}>
              <button style={{ width: "100%", padding: "11px", borderRadius: 10, background: "#4F8CFF", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                onClick={() => { const id = notesSnip.id; setNotesSnip(null); onOpenSnippet(id!); }}>
                Open snippet →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
