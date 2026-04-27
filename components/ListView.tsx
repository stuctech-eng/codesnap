"use client";

import { useState, useRef } from "react";
import { Snippet } from "@/lib/types";

const CATEGORIES = ["Alles", "AI Prompts", "Snippets", "Config", "UI", "Machines", "Ideeën"];
const CAT_COLORS: Record<string, string> = {
  "AI Prompts": "#6366f1",
  "Snippets": "#f59e0b",
  "Config": "#10b981",
  "UI": "#ec4899",
  "Machines": "#3b82f6",
  "Ideeën": "#8b5cf6",
  "Alles": "#6b7280",
};

const initials = (t = "") => t.slice(0, 2).toUpperCase();
const avColor = (t = "") => {
  const colors = ["#f59e0b", "#d97706", "#b45309", "#78350f"];
  return colors[t.charCodeAt(0) % colors.length];
};

interface Props {
  mySnips: Snippet[];
  featured: Snippet[];
  allSnips: Snippet[];
  search: string;
  filterCat: string;
  theme: "dark" | "light";
  onSearch: (v: string) => void;
  onFilterCat: (v: string) => void;
  onOpen: (id: string) => void;
  onFav: (id: string, current: boolean) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleTheme: () => void;
  version: string;
}

export default function ListView({
  mySnips, featured, allSnips, search, filterCat,
  theme, onSearch, onFilterCat, onOpen, onFav,
  onAdd, onEdit, onDelete, onToggleTheme, version,
}: Props) {
  const [showCatMenu, setShowCatMenu] = useState(false);

  const catCount = (cat: string) => {
    if (cat === "Alles") return allSnips.length;
    return allSnips.filter(s => s.category === cat).length;
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 12px", background: "var(--bg)" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 14,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h1 style={{
              fontSize: 34, fontWeight: 700, margin: 0,
              letterSpacing: "-0.03em", color: "var(--text)",
            }}>
              Snippets
            </h1>
            <span style={{ fontSize: 13, color: "var(--text3)", fontWeight: 600 }}>
              v{version}
            </span>
          </div>
          <button
            onClick={onToggleTheme}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--bg2)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {theme === "dark"
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>

        {/* Search */}
        <div style={{
          background: "var(--bg2)", borderRadius: 12,
          display: "flex", alignItems: "center",
          padding: "0 12px", gap: 8, marginBottom: 10,
          border: "1px solid var(--border)",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", color: "var(--text)",
              fontSize: 16, padding: "11px 0",
            }}
            placeholder="Zoek in titels, beschrijving en code..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
          {search && (
            <button
              style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 16, cursor: "pointer" }}
              onClick={() => onSearch("")}
            >✕</button>
          )}
        </div>

        {/* Categorie dropdown */}
        <div style={{ position: "relative" }}>
          <button
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "10px 14px",
              cursor: "pointer", width: "100%",
            }}
            onClick={() => setShowCatMenu(!showCatMenu)}
          >
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: CAT_COLORS[filterCat] || "var(--accent)",
              flexShrink: 0,
            }} />
            <span style={{
              flex: 1, textAlign: "left",
              color: "var(--text)", fontSize: 15, fontWeight: 600,
            }}>
              {filterCat}
            </span>
            <span style={{ color: "var(--text3)", fontSize: 12 }}>
              {catCount(filterCat)} snippets
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
              <path d={showCatMenu ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"}/>
            </svg>
          </button>

          {showCatMenu && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)",
              left: 0, right: 0, background: "var(--bg2)",
              border: "1px solid var(--border)", borderRadius: 14,
              overflow: "hidden", zIndex: 100,
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            }}>
              {CATEGORIES.map(cat => (
                <button key={cat}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "13px 16px",
                    background: filterCat === cat ? "var(--bg3)" : "transparent",
                    border: "none", cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                  }}
                  onClick={() => { onFilterCat(cat); setShowCatMenu(false); }}
                >
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: CAT_COLORS[cat] || "#6b7280", flexShrink: 0,
                  }} />
                  <span style={{
                    flex: 1, textAlign: "left", color: "var(--text)",
                    fontSize: 15, fontWeight: filterCat === cat ? 700 : 400,
                  }}>
                    {cat}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text3)", fontWeight: 600 }}>
                    {catCount(cat)}
                  </span>
                  {filterCat === cat && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div
        style={{ flex: 1, overflowY: "auto", paddingBottom: 110 }}
        onClick={() => setShowCatMenu(false)}
      >
        <Section title="My snippets" count={mySnips.length}>
          {mySnips.length === 0
            ? <EmptyState onAdd={onAdd} />
            : mySnips.map((s, i) => (
              <LongPressRow key={s.id} snip={s} delay={i * 35}
                onOpen={() => onOpen(s.id!)}
                onFav={() => onFav(s.id!, s.favorite)}
                onEdit={() => onEdit(s.id!)}
                onDelete={() => {
                  if (window.confirm(`"${s.title}" verwijderen?`)) onDelete(s.id!);
                }}
              />
            ))
          }
        </Section>

        {featured.length > 0 && (
          <Section title="Featured" count={featured.length}>
            {featured.map((s, i) => (
              <LongPressRow key={s.id} snip={s} delay={i * 35}
                onOpen={() => onOpen(s.id!)}
                onFav={() => onFav(s.id!, s.favorite)}
                onEdit={() => onEdit(s.id!)}
                onDelete={() => {
                  if (window.confirm(`"${s.title}" verwijderen?`)) onDelete(s.id!);
                }}
              />
            ))}
          </Section>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
        display: "flex", justifyContent: "center",
        alignItems: "center",
        padding: "12px 0 34px", zIndex: 50,
      }}>
        <button
          onClick={onAdd}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--accent)", border: "none",
            borderRadius: 16, padding: "14px 32px",
            color: "#000", fontSize: 17, fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(245,158,11,0.4)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nieuwe Snippet
        </button>
      </div>
    </div>
  );
}

function Section({ title, count, children }: {
  title: string; count: number; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "16px 20px 8px",
      }}>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
          {title}
        </p>
        <span style={{ fontSize: 13, color: "var(--text3)", fontWeight: 600 }}>
          {count}
        </span>
      </div>
      <div style={{ height: 1, background: "var(--border)" }} />
      {children}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ padding: "48px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✂️</div>
      <p style={{ color: "var(--text2)", fontSize: 17, fontWeight: 600, margin: "0 0 8px" }}>
        Nog geen snippets
      </p>
      <p style={{ color: "var(--text3)", fontSize: 14, margin: "0 0 24px" }}>
        Tik op de knop om je eerste snippet toe te voegen
      </p>
      <button
        style={{
          background: "var(--accent)", color: "#000", border: "none",
          padding: "12px 24px", borderRadius: 14,
          fontSize: 16, fontWeight: 700, cursor: "pointer",
        }}
        onClick={onAdd}
      >
        + Eerste snippet
      </button>
    </div>
  );
}

function LongPressRow({ snip, onOpen, onFav, onEdit, onDelete, delay }: {
  snip: Snippet;
  onOpen: () => void;
  onFav: () => void;
  onEdit: () => void;
  onDelete: () => void;
  delay: number;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catColor = CAT_COLORS[snip.category] || "var(--accent)";

  const startPress = () => {
    pressTimer.current = setTimeout(() => setShowMenu(true), 500);
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    return date;
  };

  return (
    <>
      <div
        style={{
          display: "flex", alignItems: "flex-start",
          padding: "14px 20px", cursor: "pointer",
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          animation: `snapIn 0.25s ease ${delay}ms both`,
          userSelect: "none",
          WebkitUserSelect: "none",
        } as React.CSSProperties}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
        onContextMenu={e => e.preventDefault()}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onClick={() => { if (!showMenu) onOpen(); }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, color: "#000",
            background: avColor(snip.title),
          }}>
            {initials(snip.title)}
          </div>
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            width: 12, height: 12, borderRadius: "50%",
            background: catColor, border: "2px solid var(--bg)",
          }} />
        </div>

        <div style={{ flex: 1, paddingLeft: 14, paddingRight: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 3, color: "var(--text)" }}>
            {snip.title}
          </div>
          {snip.description && (
            <div style={{
              fontSize: 14, color: "var(--text2)", lineHeight: 1.4,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            } as React.CSSProperties}>
              {snip.description}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColor }} />
            <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>
              {snip.category}
            </span>
            {snip.createdAt && (
              <>
                <span style={{ fontSize: 11, color: "var(--border2)" }}>·</span>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>
                  {formatDate(snip.createdAt)}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            background: "none", border: "none", cursor: "pointer",
            padding: "2px 0", flexShrink: 0,
          }}
          onClick={e => { e.stopPropagation(); onFav(); }}
        >
          {snip.favorite
            ? <svg width="21" height="21" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            : <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--border2)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          }
          <span style={{
            fontSize: 11, marginTop: 2, fontWeight: 600,
            color: snip.favorite ? "var(--accent)" : "var(--border2)",
          }}>
            {snip.favorite ? "1" : "0"}
          </span>
        </button>
      </div>

      {/* Lang indrukken menu */}
      {showMenu && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 200, display: "flex",
            flexDirection: "column", justifyContent: "flex-end",
            padding: "0 8px 34px",
          }}
          onClick={() => setShowMenu(false)}
        >
          <div onClick={e => e.stopPropagation()}>
            <div style={{
              background: "var(--bg2)", borderRadius: 14,
              overflow: "hidden", marginBottom: 8,
            }}>
              <div style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border2)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  {snip.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                  {snip.category}
                </div>
              </div>
              <button
                style={{
                  width: "100%", padding: 18, background: "transparent",
                  border: "none", color: "var(--accent)", fontSize: 17,
                  fontWeight: 500, cursor: "pointer",
                }}
                onClick={() => { setShowMenu(false); onEdit(); }}
              >
                ✏️ Bewerken
              </button>
              <div style={{ height: 1, background: "var(--border2)" }} />
              <button
                style={{
                  width: "100%", padding: 18, background: "transparent",
                  border: "none", color: "var(--red)", fontSize: 17,
                  fontWeight: 500, cursor: "pointer",
                }}
                onClick={() => {
                  setShowMenu(false);
                  setTimeout(() => {
                    if (window.confirm(`"${snip.title}" verwijderen?`)) onDelete();
                  }, 100);
                }}
              >
                🗑 Verwijderen
              </button>
            </div>
            <button
              style={{
                width: "100%", padding: 18, background: "var(--bg2)",
                border: "none", color: "var(--accent)", fontSize: 17,
                fontWeight: 700, cursor: "pointer", borderRadius: 14,
              }}
              onClick={() => setShowMenu(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
