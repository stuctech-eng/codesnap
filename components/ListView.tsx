"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Snippet } from "@/lib/types";

const CAT_COLORS: Record<string, string> = {
  "AI Prompts":"#6366f1","Snippets":"#f59e0b",
  "Config":"#10b981","UI":"#ec4899",
  "Machines":"#3b82f6","Ideeën":"#8b5cf6",
};
const DEFAULT_COLORS = ["#3b82f6","#6366f1","#10b981","#ec4899","#8b5cf6","#ef4444","#06b6d4","#f59e0b"];
function getCatColor(cat: string, index: number): string {
  return CAT_COLORS[cat] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}
const initials = (t = "") => t.slice(0, 2).toUpperCase();
const avColor  = (t = "") => { const c = ["#1d4ed8","#2563eb","#1e40af","#1e3a8a"]; return c[t.charCodeAt(0) % c.length]; };

type SortType = "nieuwste"|"oudste"|"az";

interface Props {
  allSnips: Snippet[];
  lastOpened: Snippet | null;
  search: string;
  theme: "dark"|"light";
  version: string;
  savedScrollY: number;
  savedOpenSections: Record<string, boolean>;
  onSearch: (v:string) => void;
  onOpen: (id:string, scrollY:number, openSections:Record<string,boolean>) => void;
  onFav: (id:string, cur:boolean) => void;
  onAdd: () => void;
  onEdit: (id:string) => void;
  onDelete: (id:string) => void;
  onArchive: (id:string) => void;
  onRestore: (id:string) => void;
  onToggleTheme: () => void;
}

export default function ListView({
  allSnips, lastOpened, search, theme, version,
  savedScrollY, savedOpenSections,
  onSearch, onOpen, onFav, onAdd, onArchive, onRestore, onToggleTheme,
}: Props) {
  const [openSections, setOpenSections] = useState<Record<string,boolean>>(savedOpenSections || {});
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState<SortType>("nieuwste");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Herstel scroll positie
  useEffect(() => {
    if (savedScrollY && scrollRef.current) {
      scrollRef.current.scrollTop = savedScrollY;
    }
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allSnips.filter(s => !s.archived).forEach(s => s.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [allSnips]);

  const activeSnips = useMemo(() => allSnips.filter(s => !s.archived), [allSnips]);
  const archivedSnips = useMemo(() => allSnips.filter(s => s.archived), [allSnips]);

  const processed = useMemo(() => {
    let snips = [...activeSnips];
    if (activeTags.length > 0) snips = snips.filter(s => activeTags.every(tag => s.tags?.includes(tag)));
    if (search) snips = snips.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.some(t => t.includes(search.toLowerCase()))
    );
    if (sort === "nieuwste") snips.sort((a, b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime());
    else if (sort === "oudste") snips.sort((a, b) => new Date(a.createdAt||0).getTime() - new Date(b.createdAt||0).getTime());
    else if (sort === "az") snips.sort((a, b) => a.title.localeCompare(b.title));
    return snips;
  }, [activeSnips, search, sort, activeTags]);

  const favorites   = processed.filter(s => s.favorite);
  const categories  = Array.from(new Set(processed.map(s => s.category))).filter(Boolean);
  const isFiltering = activeTags.length > 0 || sort !== "nieuwste";

  const handleOpen = (id: string) => {
    const scrollY = scrollRef.current?.scrollTop || 0;
    onOpen(id, scrollY, openSections);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--bg)" }}>

      {/* HEADER */}
      <div style={{ padding:"52px 20px 14px", background:"var(--bg)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
            <h1 style={{ fontSize:28, fontWeight:800, margin:0, letterSpacing:"-0.04em", color:"var(--text)" }}>CodeSnap</h1>
            <span style={{ fontSize:12, color:"var(--text3)", fontWeight:600 }}>v{version}</span>
          </div>
          <button onClick={onToggleTheme} style={{ width:36, height:36, borderRadius:"50%", background:"var(--bg2)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            {theme==="dark"
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>

        {/* ZOEKBALK + FILTER */}
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ flex:1, background:"var(--bg2)", borderRadius:10, display:"flex", alignItems:"center", padding:"0 12px", gap:8, border:"1px solid var(--border2)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"var(--text)", fontSize:15, padding:"10px 0" }}
              placeholder="Zoek snippets..."
              value={search}
              onChange={e => onSearch(e.target.value)}
            />
            {search && <button style={{ background:"none", border:"none", color:"var(--text3)", fontSize:14, cursor:"pointer" }} onClick={() => onSearch("")}>✕</button>}
          </div>
          <button
            style={{ width:42, height:42, borderRadius:10, background: isFiltering ? "var(--accent)" : "var(--bg2)", border:"1px solid " + (isFiltering ? "var(--accent)" : "var(--border2)"), display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
            onClick={() => setShowFilter(!showFilter)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isFiltering ? "#fff" : "var(--text2)"} strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
        </div>

        {/* FILTER BALK */}
        {showFilter && (
          <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", gap:6 }}>
              {(["nieuwste","oudste","az"] as SortType[]).map(s => (
                <button key={s}
                  style={{ flex:1, padding:"7px 0", borderRadius:8, border:"1px solid " + (sort===s ? "var(--accent)" : "var(--border2)"), background: sort===s ? "var(--accent)" : "var(--bg2)", color: sort===s ? "#fff" : "var(--text2)", fontSize:12, fontWeight:700, cursor:"pointer" }}
                  onClick={() => setSort(s)}
                >
                  {s==="nieuwste" ? "↓ Nieuwste" : s==="oudste" ? "↑ Oudste" : "A→Z"}
                </button>
              ))}
            </div>
            {allTags.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {allTags.map(tag => (
                  <button key={tag}
                    style={{ padding:"4px 10px", borderRadius:20, border:"1px solid " + (activeTags.includes(tag) ? "var(--accent)" : "var(--border2)"), background: activeTags.includes(tag) ? "var(--accent)" : "var(--bg2)", color: activeTags.includes(tag) ? "#fff" : "var(--text2)", fontSize:12, fontWeight:600, cursor:"pointer" }}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
                {activeTags.length > 0 && (
                  <button style={{ padding:"4px 10px", borderRadius:20, border:"1px solid var(--red)", background:"transparent", color:"var(--red)", fontSize:12, fontWeight:600, cursor:"pointer" }}
                    onClick={() => setActiveTags([])}>Wis filters</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIJST */}
      <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"0 12px 110px" }}>
        <div style={{ paddingTop:12 }}>

          {/* ZOEKRESULTATEN */}
          {search && (
            <>
              <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>
                Resultaten ({processed.length})
              </div>
              {processed.length === 0
                ? <div style={{ padding:"20px", textAlign:"center", color:"var(--text3)", fontSize:14 }}>Geen resultaten</div>
                : processed.map(s => <SnapRow key={s.id} snip={s} onOpen={() => handleOpen(s.id!)} onFav={() => onFav(s.id!, s.favorite)} />)
              }
            </>
          )}

          {!search && (
            <>
              {/* TAG FILTER ACTIEF */}
              {activeTags.length > 0 ? (
                <>
                  <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>
                    Gefilterd ({processed.length})
                  </div>
                  {processed.map(s => <SnapRow key={s.id} snip={s} onOpen={() => handleOpen(s.id!)} onFav={() => onFav(s.id!, s.favorite)} />)}
                </>
              ) : (
                <>
                  {/* LAATST GEOPEND */}
                  {lastOpened && !lastOpened.archived && (
                    <>
                      <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8, paddingLeft:4 }}>
                        🕐 Laatst geopend
                      </div>
                      <SnapRow snip={lastOpened} onOpen={() => handleOpen(lastOpened.id!)} onFav={() => onFav(lastOpened.id!, lastOpened.favorite)} />
                      <div style={{ height:16 }} />
                    </>
                  )}

                  {/* FAVORIETEN */}
                  {favorites.length > 0 && (
                    <>
                      <CategoryCard label="Favorieten" count={favorites.length} color="#3b82f6" icon="⭐" isOpen={!!openSections["favorieten"]} onToggle={() => toggleSection("favorieten")} />
                      {openSections["favorieten"] && (
                        <div style={{ marginBottom:8 }}>
                          {favorites.map(s => <SnapRow key={s.id} snip={s} onOpen={() => handleOpen(s.id!)} onFav={() => onFav(s.id!, s.favorite)} />)}
                        </div>
                      )}
                    </>
                  )}

                  {/* CATEGORIEËN */}
                  {categories.map((cat, index) => {
                    const catSnips = processed.filter(s => s.category === cat);
                    const color = getCatColor(cat, index);
                    const isOpen = !!openSections[cat];
                    return (
                      <div key={cat}>
                        <CategoryCard label={cat} count={catSnips.length} color={color} isOpen={isOpen} onToggle={() => toggleSection(cat)} />
                        {isOpen && (
                          <div style={{ marginBottom:8 }}>
                            {catSnips.map(s => <SnapRow key={s.id} snip={s} onOpen={() => handleOpen(s.id!)} onFav={() => onFav(s.id!, s.favorite)} />)}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ARCHIEF */}
                  {archivedSnips.length > 0 && (
                    <>
                      <CategoryCard label="Archief" count={archivedSnips.length} color="#484f58" icon="📦" isOpen={!!openSections["archief"]} onToggle={() => toggleSection("archief")} />
                      {openSections["archief"] && (
                        <div style={{ marginBottom:8 }}>
                          {archivedSnips.map(s => (
                            <ArchivedRow key={s.id} snip={s}
                              onRestore={() => onRestore(s.id!)}
                              onOpen={() => handleOpen(s.id!)}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* LEEG */}
                  {activeSnips.length === 0 && (
                    <div style={{ padding:"48px 20px", textAlign:"center" }}>
                      <div style={{ fontSize:40, marginBottom:12 }}>✂️</div>
                      <p style={{ color:"var(--text2)", fontSize:16, fontWeight:600, margin:"0 0 6px" }}>Nog geen snippets</p>
                      <p style={{ color:"var(--text3)", fontSize:13, margin:"0 0 20px" }}>Tik op + om je eerste snippet toe te voegen</p>
                      <button onClick={onAdd} style={{ background:"var(--accent)", color:"#fff", border:"none", padding:"10px 20px", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer" }}>
                        + Eerste snippet
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"var(--bg)", borderTop:"1px solid var(--border)", padding:"10px 20px 34px", zIndex:50 }}>
        <button onClick={onAdd} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, background:"var(--accent)", border:"none", borderRadius:14, padding:"14px", width:"100%", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(59,130,246,0.3)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nieuwe Snippet
        </button>
      </div>
    </div>
  );
}

function CategoryCard({ label, count, color, icon, isOpen, onToggle }: {
  label:string; count:number; color:string; icon?:string; isOpen:boolean; onToggle:()=>void;
}) {
  return (
    <button
      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"14px 16px", cursor:"pointer", marginBottom: isOpen ? 0 : 8, boxSizing:"border-box", borderBottomLeftRadius: isOpen ? 0 : 12, borderBottomRightRadius: isOpen ? 0 : 12 }}
      onClick={onToggle}
    >
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {icon ? <span style={{ fontSize:16 }}>{icon}</span> : <div style={{ width:10, height:10, borderRadius:"50%", background:color, flexShrink:0 }} />}
        <span style={{ fontSize:15, fontWeight:600, color:"var(--text)" }}>{label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:12, color:"var(--text3)", background:"var(--bg3)", padding:"2px 10px", borderRadius:20, fontWeight:600, border:"1px solid var(--border2)" }}>{count}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
          <path d={isOpen ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}/>
        </svg>
      </div>
    </button>
  );
}

function SnapRow({ snip, onOpen, onFav }: { snip:Snippet; onOpen:()=>void; onFav:()=>void; }) {
  const [showNotes, setShowNotes] = useState(false);
  const catColor = CAT_COLORS[snip.category] || "var(--accent)";
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px", marginBottom:4, background:"var(--bg2)", borderRadius:12, border:"1px solid var(--border2)", cursor:"pointer" }} onClick={onOpen}>
        <div style={{ position:"relative", flexShrink:0, marginRight:12 }}>
          <div style={{ width:42, height:42, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", background:avColor(snip.title) }}>
            {initials(snip.title)}
          </div>
          <div style={{ position:"absolute", bottom:-1, right:-1, width:10, height:10, borderRadius:"50%", background:catColor, border:"2px solid var(--bg2)" }} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{snip.title}</div>
          {snip.description && <div style={{ fontSize:12, color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{snip.description}</div>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
          {snip.notes && (
            <button style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", fontSize:14, opacity:0.6 }}
              onClick={e => { e.stopPropagation(); setShowNotes(true); }}>📝</button>
          )}
          <button style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 0 4px 4px" }}
            onClick={e => { e.stopPropagation(); onFav(); }}>
            {snip.favorite
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
          </button>
        </div>
      </div>

      {/* NOTITIES POPUP */}
      {showNotes && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8px 34px" }}
          onClick={() => setShowNotes(false)}>
          <div style={{ background:"var(--bg2)", borderRadius:16, overflow:"hidden", border:"1px solid var(--border2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border2)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:16 }}>📝</span>
                <span style={{ fontSize:16, fontWeight:700, color:"var(--text)" }}>Notities</span>
              </div>
              <button style={{ background:"none", border:"none", color:"var(--text3)", fontSize:20, cursor:"pointer" }} onClick={() => setShowNotes(false)}>✕</button>
            </div>
            <div style={{ padding:"16px", maxHeight:300, overflowY:"auto" }}>
              <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, margin:0, whiteSpace:"pre-wrap" }}>{snip.notes}</p>
            </div>
            <div style={{ padding:"10px 16px 14px", borderTop:"1px solid var(--border2)" }}>
              <button style={{ width:"100%", padding:"11px", borderRadius:10, background:"var(--accent)", border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }} onClick={onOpen}>
                Open snippet →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ArchivedRow({ snip, onOpen, onRestore }: { snip:Snippet; onOpen:()=>void; onRestore:()=>void; }) {
  return (
    <div style={{ display:"flex", alignItems:"center", padding:"12px 16px", marginBottom:4, background:"var(--bg2)", borderRadius:12, border:"1px solid var(--border2)", opacity:0.6 }}>
      <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={onOpen}>
        <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{snip.title}</div>
        {snip.description && <div style={{ fontSize:12, color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{snip.description}</div>}
      </div>
      <button
        style={{ background:"var(--accent)", border:"none", borderRadius:8, padding:"6px 12px", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0, marginLeft:8 }}
        onClick={onRestore}
      >
        Terugzetten
      </button>
    </div>
  );
}
