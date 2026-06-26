"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Snippet } from "@/lib/types";

const CAT_CONFIG: Record<string, { color: string; icon: string; desc: string }> = {
  "AI Prompts":   { color: "#a78bfa", icon: "✨", desc: "Prompts en templates" },
  "Config":       { color: "#34d399", icon: "⚙️", desc: "Instellingen en configuratie" },
  "Bug Fix":      { color: "#f87171", icon: "🐛", desc: "Oplossingen en fixes" },
  "Ideeën":       { color: "#c084fc", icon: "💡", desc: "Concepten en brainstorms" },
  "UI":           { color: "#f472b6", icon: "🎨", desc: "Interface en design" },
  "Apps":         { color: "#818cf8", icon: "📱", desc: "Applicaties en projecten" },
  "Code":         { color: "#fb923c", icon: "💻", desc: "Herbruikbare code" },
  "Scripts":      { color: "#60a5fa", icon: "🖥️", desc: "Automatisering en tools" },
  "Documentatie": { color: "#fbbf24", icon: "📚", desc: "Uitleg en handleidingen" },
  "Games":        { color: "#2dd4bf", icon: "🎮", desc: "Game logica en scripts" },
  "Snippets":     { color: "#fb923c", icon: "🔧", desc: "Herbruikbare code" },
  "Machines":     { color: "#60a5fa", icon: "🖥️", desc: "Scripts en automatisering" },
  "Proggie":      { color: "#818cf8", icon: "📱", desc: "Applicaties en projecten" },
  "Les":          { color: "#fbbf24", icon: "📚", desc: "Uitleg en handleidingen" },
  "Game":         { color: "#2dd4bf", icon: "🎮", desc: "Game logica en scripts" },
};

const DEFAULT_COLORS = ["#60a5fa","#a78bfa","#34d399","#f472b6","#c084fc","#f87171","#2dd4bf","#fb923c","#fbbf24","#818cf8"];

function getCatConfig(cat: string, index: number) {
  return CAT_CONFIG[cat] || { color: DEFAULT_COLORS[index % DEFAULT_COLORS.length], icon: "📁", desc: "" };
}

function darken(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
  } catch { return hex; }
}

const initials = (t = "") => t.slice(0, 2).toUpperCase();

type SortType = "nieuwste" | "oudste" | "az";

interface Props {
  allSnips: Snippet[];
  lastOpened: Snippet | null;
  search: string;
  theme: "dark" | "light";
  version: string;
  savedScrollY: number;
  savedOpenSections: Record<string, boolean>;
  onSearch: (v: string) => void;
  onOpen: (id: string, scrollY: number, openSections: Record<string, boolean>) => void;
  onFav: (id: string, cur: boolean) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onToggleTheme: () => void;
}

export default function ListView({
  allSnips, lastOpened, search, theme, version,
  savedScrollY, savedOpenSections,
  onSearch, onOpen, onFav, onAdd, onArchive, onRestore, onToggleTheme,
}: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(savedOpenSections || {});
  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState<SortType>("nieuwste");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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
  const favorites = useMemo(() => activeSnips.filter(s => s.favorite), [activeSnips]);

  const processed = useMemo(() => {
    let snips = [...activeSnips];
    if (activeFilter === "favorieten") snips = snips.filter(s => s.favorite);
    if (activeTags.length > 0) snips = snips.filter(s => activeTags.every(tag => s.tags?.includes(tag)));
    if (search) snips = snips.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.some(t => t.includes(search.toLowerCase()))
    );
    if (sort === "nieuwste") snips.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    else if (sort === "oudste") snips.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    else if (sort === "az") snips.sort((a, b) => a.title.localeCompare(b.title));
    return snips;
  }, [activeSnips, search, sort, activeTags, activeFilter]);

  const categories = Array.from(new Set(processed.map(s => s.category))).filter(Boolean);
  const isFiltering = activeTags.length > 0 || sort !== "nieuwste" || activeFilter !== null;

  const catIndexMap: Record<string, number> = {};
  categories.forEach((cat, i) => { catIndexMap[cat] = i; });

  const handleOpen = (id: string) => {
    const sy = scrollRef.current?.scrollTop || 0;
    onOpen(id, sy, openSections);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* HEADER */}
      <div style={{ padding: "52px 16px 14px", background: "var(--bg)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.04em", color: "var(--text)" }}>CodeSnap</h1>
            <span style={{ fontSize: 11, color: "var(--accent)", background: "var(--accent)15", padding: "2px 8px", borderRadius: 20, fontWeight: 700, marginLeft: 4 }}>v{version}</span>
          </div>
          <button onClick={onToggleTheme} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg2)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>

        {/* ZOEKBALK */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, background: "var(--bg2)", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 12px", gap: 8, border: "1px solid var(--border2)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 15, padding: "11px 0" }}
              placeholder="Zoek snippets..."
              value={search}
              onChange={e => onSearch(e.target.value)}
            />
            {search && <button style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 14, cursor: "pointer" }} onClick={() => onSearch("")}>x</button>}
          </div>
          <button
            style={{ width: 44, height: 44, borderRadius: 12, background: isFiltering ? "var(--accent)" : "var(--bg2)", border: "1px solid " + (isFiltering ? "var(--accent)" : "var(--border2)"), display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            onClick={() => setShowFilter(!showFilter)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isFiltering ? "#fff" : "var(--text2)"} strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
          </button>
        </div>

        {/* STATS — horizontaal scrollbaar */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {[
            { key: null, icon: "📁", num: activeSnips.length, label: "Totaal" },
            { key: "favorieten", icon: "⭐", num: favorites.length, label: "Favorieten" },
          ].map(stat => (
            <button key={stat.label}
              style={{ flexShrink: 0, background: activeFilter === stat.key ? "var(--accent)20" : "var(--bg2)", border: "1px solid " + (activeFilter === stat.key ? "var(--accent)40" : "var(--border2)"), borderRadius: 14, padding: "10px 14px", cursor: "pointer", textAlign: "center", minWidth: 80 }}
              onClick={() => setActiveFilter(prev => prev === stat.key ? null : stat.key)}
            >
              <div style={{ fontSize: 18, marginBottom: 3 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: activeFilter === stat.key ? "var(--accent)" : "var(--text)", lineHeight: 1 }}>{stat.num}</div>
              <div style={{ fontSize: 10, color: activeFilter === stat.key ? "var(--accent)" : "var(--text3)", marginTop: 3, fontWeight: 600 }}>{stat.label}</div>
            </button>
          ))}
          {categories.map((cat, i) => {
            const cfg = getCatConfig(cat, i);
            const count = activeSnips.filter(s => s.category === cat).length;
            return (
              <button key={cat}
                style={{ flexShrink: 0, background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 14, padding: "10px 14px", cursor: "pointer", textAlign: "center", minWidth: 80 }}
                onClick={() => { setOpenSections(prev => ({ ...prev, [cat]: true })); if (scrollRef.current) scrollRef.current.scrollTop = 0; }}
              >
                <div style={{ fontSize: 18, marginBottom: 3 }}>{cfg.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3, fontWeight: 600 }}>{cat}</div>
              </button>
            );
          })}
        </div>

        {/* FILTER BALK */}
        {showFilter && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {(["nieuwste", "oudste", "az"] as SortType[]).map(s => (
                <button key={s}
                  style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid " + (sort === s ? "var(--accent)" : "var(--border2)"), background: sort === s ? "var(--accent)" : "var(--bg2)", color: sort === s ? "#fff" : "var(--text2)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  onClick={() => setSort(s)}
                >
                  {s === "nieuwste" ? "Nieuwste" : s === "oudste" ? "Oudste" : "A-Z"}
                </button>
              ))}
            </div>
            {allTags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {allTags.map(tag => (
                  <button key={tag}
                    style={{ padding: "4px 10px", borderRadius: 20, border: "1px solid " + (activeTags.includes(tag) ? "var(--accent)" : "var(--border2)"), background: activeTags.includes(tag) ? "var(--accent)" : "var(--bg2)", color: activeTags.includes(tag) ? "#fff" : "var(--text2)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
                {activeTags.length > 0 && (
                  <button style={{ padding: "4px 10px", borderRadius: 20, border: "1px solid var(--red)", background: "transparent", color: "var(--red)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    onClick={() => setActiveTags([])}>Wis</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIJST */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 12px 110px" }}>

        {/* ZOEKRESULTATEN */}
        {(search || activeFilter) && (
          <>
            <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
              {activeFilter === "favorieten" ? "Favorieten" : "Resultaten"} ({processed.length})
            </div>
            {processed.length === 0
              ? <div style={{ padding: "20px", textAlign: "center", color: "var(--text3)", fontSize: 14 }}>Geen resultaten</div>
              : processed.map((s, i) => {
                const cfg = getCatConfig(s.category, catIndexMap[s.category] || 0);
                return <SnapRow key={s.id} snip={s} color={cfg.color} index={i} onOpen={() => handleOpen(s.id!)} onFav={() => onFav(s.id!, s.favorite)} />;
              })
            }
          </>
        )}

        {!search && !activeFilter && (
          <>
            {/* LAATSTE GEOPEND */}
            {lastOpened && !lastOpened.archived && (
              <>
                <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
                  Laatst geopend
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg2)", borderRadius: 12, marginBottom: 14, border: "1px solid var(--border2)", cursor: "pointer" }}
                  onClick={() => handleOpen(lastOpened.id!)}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", background: getCatConfig(lastOpened.category, 0).color, flexShrink: 0 }}>
                    {initials(lastOpened.title)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastOpened.title}</div>
                    {lastOpened.description && <div style={{ fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastOpened.description}</div>}
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </>
            )}

            {/* CATEGORIEËN */}
            {categories.map((cat, index) => {
              const catSnips = processed.filter(s => s.category === cat);
              const cfg = getCatConfig(cat, index);
              const isOpen = !!openSections[cat];
              return (
                <CatGroup key={cat} label={cat} desc={cfg.desc} count={catSnips.length} color={cfg.color} icon={cfg.icon} isOpen={isOpen} onToggle={() => toggleSection(cat)}>
                  {catSnips.map((s, i) => (
                    <SnapRow key={s.id} snip={s} color={cfg.color} index={i} isLast={i === catSnips.length - 1} onOpen={() => handleOpen(s.id!)} onFav={() => onFav(s.id!, s.favorite)} />
                  ))}
                </CatGroup>
              );
            })}

            {/* ARCHIEF */}
            {archivedSnips.length > 0 && (
              <CatGroup label="Archief" desc="Gearchiveerde snippets" count={archivedSnips.length} color="#484f58" icon="📦" isOpen={!!openSections["archief"]} onToggle={() => toggleSection("archief")}>
                {archivedSnips.map((s, i) => (
                  <ArchivedRow key={s.id} snip={s} isLast={i === archivedSnips.length - 1} onOpen={() => handleOpen(s.id!)} onRestore={() => onRestore(s.id!)} />
                ))}
              </CatGroup>
            )}

            {/* LEEG */}
            {activeSnips.length === 0 && (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✂️</div>
                <p style={{ color: "var(--text2)", fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>Nog geen snippets</p>
                <button onClick={onAdd} style={{ background: "var(--accent)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  + Eerste snippet
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* BOTTOM */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "10px 16px 34px", zIndex: 50 }}>
        <button onClick={onAdd} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--accent)", border: "none", borderRadius: 14, padding: "14px", width: "100%", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nieuwe Snippet
        </button>
      </div>
    </div>
  );
}

function CatGroup({ label, desc, count, color, icon, isOpen, onToggle, children }: {
  label: string; desc: string; count: number; color: string; icon: string;
  isOpen: boolean; onToggle: () => void; children?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 6, borderRadius: 12, overflow: "hidden", border: isOpen ? "2px solid " + color + "50" : "1px solid " + color + "25" }}>
      <button
        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: isOpen ? color + "12" : color + "06", padding: "11px 14px", cursor: "pointer", border: "none", borderBottom: isOpen ? "1px solid " + color + "20" : "none" }}
        onClick={onToggle}
      >
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color }}>{label}</div>
          {desc && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{desc}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: color + "22", color }}>{count}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
            <path d={isOpen ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}/>
          </svg>
        </div>
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

function SnapRow({ snip, color, index, isLast, onOpen, onFav }: {
  snip: Snippet; color: string; index: number; isLast?: boolean; onOpen: () => void; onFav: () => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const avatarColor = darken(color, index * 12);

  return (
    <>
      <div
        style={{ display: "flex", alignItems: "center", padding: "10px 14px", background: color + "06", borderBottom: isLast ? "none" : "1px solid " + color + "15", cursor: "pointer" }}
        onClick={onOpen}
      >
        <div style={{ width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", background: avatarColor, flexShrink: 0, marginRight: 10 }}>
          {initials(snip.title)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.title}</div>
          {snip.description && <div style={{ fontSize: 11, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.description}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {snip.notes && (
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", fontSize: 12, opacity: 0.5 }}
              onClick={e => { e.stopPropagation(); setShowNotes(true); }}>📝</button>
          )}
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0 4px 4px" }}
            onClick={e => { e.stopPropagation(); onFav(); }}>
            {snip.favorite
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
          </button>
        </div>
      </div>

      {showNotes && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 8px 34px" }}
          onClick={() => setShowNotes(false)}>
          <div style={{ background: "var(--bg2)", borderRadius: 16, overflow: "hidden", border: "1px solid var(--border2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--border2)" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>📝 Notities</span>
              <button style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 20, cursor: "pointer" }} onClick={() => setShowNotes(false)}>x</button>
            </div>
            <div style={{ padding: "16px", maxHeight: 300, overflowY: "auto" }}>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{snip.notes}</p>
            </div>
            <div style={{ padding: "10px 16px 14px", borderTop: "1px solid var(--border2)" }}>
              <button style={{ width: "100%", padding: "11px", borderRadius: 10, background: "var(--accent)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }} onClick={onOpen}>
                Open snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ArchivedRow({ snip, isLast, onOpen, onRestore }: { snip: Snippet; isLast?: boolean; onOpen: () => void; onRestore: () => void; }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", background: "var(--bg2)", borderBottom: isLast ? "none" : "1px solid var(--border)", opacity: 0.6 }}>
      <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={onOpen}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.title}</div>
        {snip.description && <div style={{ fontSize: 11, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.description}</div>}
      </div>
      <button style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginLeft: 8 }} onClick={onRestore}>
        Terugzetten
      </button>
    </div>
  );
}
