"use client";

import { useState, useRef } from "react";
import { Snippet } from "@/lib/types";

const CATEGORIES = ["Alles", "AI Prompts", "Snippets", "Config", "UI", "Machines", "Ideeën"];
const CAT_COLORS: Record<string, string> = {
  "AI Prompts": "#6366f1",
  "Snippets":   "#f59e0b",
  "Config":     "#10b981",
  "UI":         "#ec4899",
  "Machines":   "#3b82f6",
  "Ideeën":     "#8b5cf6",
  "Alles":      "#6b7280",
};

const initials = (t = "") => t.slice(0, 2).toUpperCase();
const avColor  = (t = "") => {
  const c = ["#f59e0b","#d97706","#b45309","#78350f"];
  return c[t.charCodeAt(0) % c.length];
};

interface Props {
  mySnips: Snippet[]; featured: Snippet[]; allSnips: Snippet[];
  search: string; filterCat: string; theme: "dark"|"light"; version: string;
  onSearch: (v:string)=>void; onFilterCat: (v:string)=>void;
  onOpen: (id:string)=>void; onFav: (id:string,cur:boolean)=>void;
  onAdd: ()=>void; onEdit: (id:string)=>void;
  onDelete: (id:string)=>void; onToggleTheme: ()=>void;
}

export default function ListView({
  mySnips, featured, allSnips, search, filterCat,
  theme, version, onSearch, onFilterCat, onOpen, onFav,
  onAdd, onEdit, onDelete, onToggleTheme,
}: Props) {
  const [showCatMenu, setShowCatMenu] = useState(false);

  const catCount = (cat: string) =>
    cat === "Alles" ? allSnips.length : allSnips.filter(s => s.category === cat).length;

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--bg)" }}>

      {/* ── HEADER ── */}
      <div style={{ padding:"52px 20px 14px", background:"var(--bg)", borderBottom:"1px solid var(--border)" }}>

        {/* Titel + thema */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
            <h1 style={{ fontSize:28, fontWeight:800, margin:0, letterSpacing:"-0.04em", color:"var(--text)" }}>
              CodeSnap
            </h1>
            <span style={{ fontSize:12, color:"var(--text3)", fontWeight:600, letterSpacing:"0.05em" }}>
              v{version}
            </span>
          </div>
          <button onClick={onToggleTheme} style={{
            width:36, height:36, borderRadius:"50%",
            background:"var(--bg2)", border:"1px solid var(--border2)",
            display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
          }}>
            {theme === "dark"
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>

        {/* Zoekbalk */}
        <div style={{
          background:"var(--bg2)", borderRadius:10,
          display:"flex", alignItems:"center",
          padding:"0 12px", gap:8, marginBottom:10,
          border:"1px solid var(--border2)",
        }}>
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

        {/* Categorie dropdown */}
        <div style={{ position:"relative" }}>
          <button
            style={{
              display:"flex", alignItems:"center", gap:8,
              background:"var(--bg2)", border:"1px solid var(--border2)",
              borderRadius:10, padding:"9px 12px",
              cursor:"pointer", width:"100%",
            }}
            onClick={() => setShowCatMenu(!showCatMenu)}
          >
            <div style={{ width:8, height:8, borderRadius:"50%", background:CAT_COLORS[filterCat]||"var(--accent)", flexShrink:0 }} />
            <span style={{ flex:1, textAlign:"left", color:"var(--text)", fontSize:14, fontWeight:600 }}>
              {filterCat}
            </span>
            <span style={{ fontSize:12, color:"var(--text3)", fontWeight:500 }}>
              {catCount(filterCat)}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
              <path d={showCatMenu ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}/>
            </svg>
          </button>

          {showCatMenu && (
            <div style={{
              position:"absolute", top:"calc(100% + 4px)", left:0, right:0,
              background:"var(--bg2)", border:"1px solid var(--border2)",
              borderRadius:12, overflow:"hidden", zIndex:100,
              boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
            }}>
              {CATEGORIES.map(cat => (
                <button key={cat}
                  style={{
                    display:"flex", alignItems:"center", gap:10,
                    width:"100%", padding:"12px 14px",
                    background: filterCat === cat ? "var(--bg3)" : "transparent",
                    border:"none", cursor:"pointer",
                    borderBottom:"1px solid var(--border)",
                  }}
                  onClick={() => { onFilterCat(cat); setShowCatMenu(false); }}
                >
                  <div style={{ width:8, height:8, borderRadius:"50%", background:CAT_COLORS[cat]||"#6b7280", flexShrink:0 }} />
                  <span style={{ flex:1, textAlign:"left", color:"var(--text)", fontSize:14, fontWeight: filterCat===cat ? 700 : 400 }}>
                    {cat}
                  </span>
                  <span style={{ fontSize:12, color:"var(--text3)" }}>{catCount(cat)}</span>
                  {filterCat === cat && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── LIJST ── */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:110 }} onClick={() => setShowCatMenu(false)}>

        <Section title="Mijn snippets" count={mySnips.length}>
          {mySnips.length === 0
            ? <EmptyState onAdd={onAdd} />
            : mySnips.map((s,i) => (
              <SnapCard key={s.id} snip={s} delay={i*30}
                onOpen={() => onOpen(s.id!)}
                onFav={() => onFav(s.id!, s.favorite)}
                onEdit={() => onEdit(s.id!)}
                onDelete={() => { if(window.confirm(`"${s.title}" verwijderen?`)) onDelete(s.id!); }}
              />
            ))
          }
        </Section>

        {featured.length > 0 && (
          <Section title="Favorieten" count={featured.length}>
            {featured.map((s,i) => (
              <SnapCard key={s.id} snip={s} delay={i*30}
                onOpen={() => onOpen(s.id!)}
                onFav={() => onFav(s.id!, s.favorite)}
                onEdit={() => onEdit(s.id!)}
                onDelete={() => { if(window.confirm(`"${s.title}" verwijderen?`)) onDelete(s.id!); }}
              />
            ))}
          </Section>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:430, background:"var(--bg)",
        borderTop:"1px solid var(--border)",
        padding:"10px 20px 34px", zIndex:50,
      }}>
        <button onClick={onAdd} style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
          background:"var(--accent)", border:"none", borderRadius:14,
          padding:"14px", width:"100%",
          color:"#000", fontSize:16, fontWeight:700, cursor:"pointer",
          boxShadow:"0 4px 16px rgba(245,158,11,0.3)",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nieuwe Snippet
        </button>
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title:string; count:number; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px 8px" }}>
        <p style={{ margin:0, fontSize:13, fontWeight:700, color:"var(--text3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
          {title}
        </p>
        <span style={{ fontSize:12, color:"var(--text3)", fontWeight:600,
          background:"var(--bg2)", padding:"2px 8px", borderRadius:20,
          border:"1px solid var(--border2)",
        }}>
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd:()=>void }) {
  return (
    <div style={{ padding:"48px 20px", textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>✂️</div>
      <p style={{ color:"var(--text2)", fontSize:16, fontWeight:600, margin:"0 0 6px" }}>Nog geen snippets</p>
      <p style={{ color:"var(--text3)", fontSize:13, margin:"0 0 20px" }}>Tik op + om je eerste snippet toe te voegen</p>
      <button onClick={onAdd} style={{
        background:"var(--accent)", color:"#000", border:"none",
        padding:"10px 20px", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer",
      }}>
        + Eerste snippet
      </button>
    </div>
  );
}

function SnapCard({ snip, onOpen, onFav, onEdit, onDelete, delay }: {
  snip:Snippet; onOpen:()=>void; onFav:()=>void;
  onEdit:()=>void; onDelete:()=>void; delay:number;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const catColor = CAT_COLORS[snip.category] || "var(--accent)";

  const startPress = () => { pressTimer.current = setTimeout(() => setShowMenu(true), 500); };
  const cancelPress = () => { if(pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current=null; } };

  return (
    <>
      <div
        style={{
          display:"flex", alignItems:"center",
          padding:"12px 16px", margin:"4px 12px",
          background:"var(--bg2)", borderRadius:12,
          border:"1px solid var(--border2)",
          cursor:"pointer", userSelect:"none",
          animation:`snapIn 0.25s ease ${delay}ms both`,
        } as React.CSSProperties}
        onTouchStart={startPress} onTouchEnd={cancelPress} onTouchMove={cancelPress}
        onMouseDown={startPress} onMouseUp={cancelPress} onMouseLeave={cancelPress}
        onContextMenu={e => e.preventDefault()}
        onClick={() => { if(!showMenu) onOpen(); }}
      >
        {/* Avatar */}
        <div style={{ position:"relative", flexShrink:0, marginRight:12 }}>
          <div style={{
            width:42, height:42, borderRadius:10,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:800, color:"#000",
            background:avColor(snip.title),
          }}>
            {initials(snip.title)}
          </div>
          <div style={{
            position:"absolute", bottom:-1, right:-1,
            width:10, height:10, borderRadius:"50%",
            background:catColor, border:"2px solid var(--bg2)",
          }} />
        </div>

        {/* Content */}
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

        {/* Favoriet */}
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

      {/* Lang indrukken menu */}
      {showMenu && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8px 34px" }}
          onClick={() => setShowMenu(false)}>
          <div onClick={e => e.stopPropagation()}>
            <div style={{ background:"var(--bg2)", borderRadius:14, overflow:"hidden", marginBottom:8, border:"1px solid var(--border2)" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border2)" }}>
                <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>{snip.title}</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{snip.category}</div>
              </div>
              <button style={{ width:"100%", padding:18, background:"transparent", border:"none", color:"var(--accent)", fontSize:17, fontWeight:500, cursor:"pointer" }}
                onClick={() => { setShowMenu(false); onEdit(); }}>
                ✏️ Bewerken
              </button>
              <div style={{ height:1, background:"var(--border2)" }} />
              <button style={{ width:"100%", padding:18, background:"transparent", border:"none", color:"var(--red)", fontSize:17, fontWeight:500, cursor:"pointer" }}
                onClick={() => { setShowMenu(false); setTimeout(() => { if(window.confirm(`"${snip.title}" verwijderen?`)) onDelete(); }, 100); }}>
                🗑 Verwijderen
              </button>
            </div>
            <button style={{ width:"100%", padding:18, background:"var(--bg2)", border:"1px solid var(--border2)", color:"var(--text2)", fontSize:17, fontWeight:700, cursor:"pointer", borderRadius:14 }}
              onClick={() => setShowMenu(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
