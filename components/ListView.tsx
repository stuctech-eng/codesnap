"use client";

import { useState } from "react";
import { Snippet } from "@/lib/types";

const CAT_COLORS: Record<string, string> = {
  "AI Prompts": "#6366f1",
  "Snippets":   "#f59e0b",
  "Config":     "#10b981",
  "UI":         "#ec4899",
  "Machines":   "#3b82f6",
  "Ideeën":     "#8b5cf6",
};

const DEFAULT_COLORS = [
  "#f59e0b","#6366f1","#10b981","#ec4899",
  "#3b82f6","#8b5cf6","#ef4444","#06b6d4",
];

function getCatColor(cat: string, index: number): string {
  return CAT_COLORS[cat] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

const initials = (t = "") => t.slice(0, 2).toUpperCase();
const avColor  = (t = "") => {
  const c = ["#f59e0b","#d97706","#b45309","#78350f"];
  return c[t.charCodeAt(0) % c.length];
};

interface Props {
  allSnips: Snippet[];
  lastOpened: Snippet | null;
  search: string;
  theme: "dark"|"light";
  version: string;
  onSearch: (v:string) => void;
  onOpen: (id:string) => void;
  onFav: (id:string, cur:boolean) => void;
  onAdd: () => void;
  onEdit: (id:string) => void;
  onDelete: (id:string) => void;
  onToggleTheme: () => void;
}

export default function ListView({
  allSnips, lastOpened, search, theme, version,
  onSearch, onOpen, onFav, onAdd, onToggleTheme,
}: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = search
    ? allSnips.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.tags?.some(t => t.includes(search.toLowerCase()))
      )
    : [];

  const favorites = allSnips.filter(s => s.favorite);
  const categories = Array.from(new Set(allSnips.map(s => s.category))).filter(Boolean);

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--bg)" }}>

      <div style={{ padding:"52px 20px 14px", background:"var(--bg)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
            <h1 style={{ fontSize:28, fontWeight:800, margin:0, letterSpacing:"-0.04em", color:"var(--text)" }}>CodeSnap</h1>
            <span style={{ fontSize:12, color:"var(--text3)", fontWeight:600 }}>v{version}</span>
          </div>
          <button onClick={onToggleTheme} style={{ width:36, height:36, borderRadius:"50%", background:"var(--bg2)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            {theme === "dark"
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>

        <div style={{ background:"var(--bg2)", borderRadius:10, display:"flex", alignItems:"center", padding:"0 12px", gap:8, border:"1px solid var(--border2)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"var(--text)", fontSize:15, padding:"10px 0" }}
            placeholder="Zoek snippets..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
          {search && (
            <button style={{ background:"none", border:"none", color:"var(--text3)", fontSize:14, cursor:"pointer" }}
              onClick={() => onSearch("")}>✕</button>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", paddingBottom:110, padding:"0 12px 110px" }}>

        {search && (
          <div style={{ paddingTop:12 }}>
            <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>
              Resultaten ({filtered.length})
            </div>
            {filtered.length === 0
              ? <div style={{ padding:"20px", textAlign:"center", color:"var(--text3)", fontSize:14 }}>Geen resultaten</div>
              : filtered.map(s => (
                <SnapRow key={s.id} snip={s} onOpen={() => onOpen(s.id!)} onFav={() => onFav(s.id!, s.favorite)} />
              ))
            }
          </div>
        )}

        {!search && (
          <div style={{ paddingTop:12 }}>

            {lastOpened && (
              <>
                <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8, paddingLeft:4, display:"flex", alignItems:"center", gap:6 }}>
                  🕐 Laatst geopend
                </div>
                <SnapRow snip={lastOpened} onOpen={() => onOpen(lastOpened.id!)} onFav={() => onFav(lastOpened.id!, lastOpened.favorite)} />
                <div style={{ height:16 }} />
              </>
            )}

            {favorites.length > 0 && (
              <>
                <CategoryCard
                  label="Favorieten"
                  count={favorites.length}
                  color="#f59e0b"
                  icon="⭐"
                  isOpen={!!openSections["favorieten"]}
                  onToggle={() => toggleSection("favorieten")}
                />
                {openSections["favorieten"] && (
                  <div style={{ marginBottom:8 }}>
                    {favorites.map(s => (
                      <SnapRow key={s.id} snip={s} onOpen={() => onOpen(s.id!)} onFav={() => onFav(s.id!, s.favorite)} />
                    ))}
                  </div>
                )}
              </>
            )}

            {categories.map((cat, index) => {
              const catSnips = allSnips.filter(s => s.category === cat);
              const color = getCatColor(cat, index);
              const isOpen = !!openSections[cat];
              return (
                <div key={cat}>
                  <CategoryCard
                    label={cat}
                    count={catSnips.length}
                    color={color}
                    isOpen={isOpen}
                    onToggle={() => toggleSection(cat)}
                  />
                  {isOpen && (
                    <div style={{ marginBottom:8 }}>
                      {catSnips.map(s => (
                        <SnapRow key={s.id} snip={s} onOpen={() => onOpen(s.id!)} onFav={() => onFav(s.id!, s.favorite)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {allSnips.length === 0 && (
              <div style={{ padding:"48px 20px", textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>✂️</div>
                <p style={{ color:"var(--text2)", fontSize:16, fontWeight:600, margin:"0 0 6px" }}>Nog geen snippets</p>
                <p style={{ color:"var(--text3)", fontSize:13, margin:"0 0 20px" }}>Tik op + om je eerste snippet toe te voegen</p>
                <button onClick={onAdd} style={{ background:"var(--accent)", color:"#000", border:"none", padding:"10px 20px", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer" }}>
                  + Eerste snippet
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"var(--bg)", borderTop:"1px solid var(--border)", padding:"10px 20px 34px", zIndex:50 }}>
        <button onClick={onAdd} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"var(--accent)", border:"none", borderRadius:14, padding:"14px", width:"100%", color:"#000", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(245,158,11,0.3)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nieuwe Snippet
        </button>
      </div>
    </div>
  );
}

function CategoryCard({ label, count, color, icon, isOpen, onToggle }: {
  label: string; count: number; color: string; icon?: string;
  isOpen: boolean; onToggle: () => void;
}) {
  return (
    <button
      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"14px 16px", cursor:"pointer", marginBottom: isOpen ? 0 : 8, boxSizing:"border-box", borderBottomLeftRadius: isOpen ? 0 : 12, borderBottomRightRadius: isOpen ? 0 : 12 }}
      onClick={onToggle}
    >
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {icon
          ? <span style={{ fontSize:16 }}>{icon}</span>
          : <div style={{ width:10, height:10, borderRadius:"50%", background:color, flexShrink:0 }} />
        }
        <span style={{ fontSize:15, fontWeight:600, color:"var(--text)" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:12, color:"var(--text3)", background:"var(--bg3)", padding:"2px 10px", borderRadius:20, fontWeight:600, border:"1px solid var(--border2)" }}>
          {count}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
          <path d={isOpen ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}/>
        </svg>
      </div>
    </button>
  );
}

function SnapRow({ snip, onOpen, onFav }: {
  snip: Snippet; onOpen: () => void; onFav: () => void;
}) {
  const catColor = CAT_COLORS[snip.category] || "var(--accent)";
  return (
    <div
      style={{ display:"flex", alignItems:"center", padding:"12px 16px", marginBottom:4, background:"var(--bg2)", borderRadius:12, border:"1px solid var(--border2)", cursor:"pointer" }}
      onClick={onOpen}
    >
      <div style={{ position:"relative", flexShrink:0, marginRight:12 }}>
        <div style={{ width:42, height:42, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#000", background:avColor(snip.title) }}>
          {initials(snip.title)}
        </div>
        <div style={{ position:"absolute", bottom:-1, right:-1, width:10, height:10, borderRadius:"50%", background:catColor, border:"2px solid var(--bg2)" }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {snip.title}
        </div>
        {snip.description && (
          <div style={{ fontSize:12, color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {snip.description}
          </div>
        )}
      </div>
      <button
        style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 0 4px 8px", flexShrink:0 }}
        onClick={e => { e.stopPropagation(); onFav(); }}
      >
        {snip.favorite
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        }
      </button>
    </div>
  );
}
