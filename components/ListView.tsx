"use client";

import { useState, useRef } from "react";
import { Snippet } from "@/lib/types";
import BottomNav from "./BottomNav";

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
          display: "flex", alignItems: "baseline",
          gap: 10, marginBottom: 14,
        }}>
          <h1 style={{
            fontSize: 34, fontWeight: 700, margin: 0,
            letterSpacing: "-0.03em", color: "var(--text)",
          }}>
            Snippets
          </h1>
          <span style={{
            fontSize: 13, color: "var(--text3)", fontWeight: 600,
          }}>
            v{version}
          </span>
        </div>

        {/* Search */}
        <div style={{
          background: "var(--bg2)", borderRadius: 12,
          display: "flex", alignItems: "center",
          padding: "0 12px", gap: 8, marginBottom: 10,
          border: "1px solid var(--border)",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            style={{
              flex: 1, background: "transparent", border: "none",
              outline: "none", color: "var(--text)",
              fontSize: 16, padding: "11px 0",
            }}
            placeholder="Search"
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
          {search && (
            <button style={{
              background: "none", border: "none",
              color: "var(--text3)", fontSize: 16, cursor: "pointer",
            }}
              onClick={() => onSearch("")}>✕</button>
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
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
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
                  <span style={{
                    fontSize: 13, color: "var(--text3)", fontWeight: 600,
                  }}>
                    {catCount(cat)}
                  </span>
                  {filterCat === cat && (
                    <svg width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
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
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 110 }}
        onClick={() => setShowCatMenu(false)}>

        <Section title="My snippets" count={mySnips.length}>
          {mySnips.length === 0
            ? <EmptyState onAdd={onAdd} />
            : mySnips.map((s, i) => (
              <SwipeRow key={s.id} snip={s} delay={i * 35}
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
              <SwipeRow key={s.id} snip={s} delay={i * 35}
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

      <BottomNav onAdd={onAdd} onToggleTheme={onToggleTheme} theme={theme} />
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
      <p style={{
        color: "var(--text2)", fontSize: 17,
        fontWeight: 600, margin: "0 0 8px",
      }}>
        Nog geen snippets
      </p>
      <p style={{
        color: "var(--text3)", fontSize: 14, margin: "0 0 24px",
      }}>
        Tik op + om je eerste snippet toe te voegen
      </p>
      <button style={{
        background: "var(--accent)", color: "#000", border: "none",
        padding: "12px 24px", borderRadius: 14,
        fontSize: 16, fontWeight: 700, cursor: "pointer",
      }}
        onClick={onAdd}>
        + Eerste snippet
      </button>
    </div>
  );
}

function SwipeRow({ snip, onOpen, onFav, onEdit, onDelete, delay }: {
  snip: Snippet;
  onOpen: () => void;
  onFav: () => void;
  onEdit: () => void;
  onDelete: () => void;
  delay: number;
}) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const THRESHOLD = 60;

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.touches[0].clientX - startX.current;
    setOffset(Math.max(-120, Math.min(80, diff)));
  };

  const onTouchEnd = () => {
    isDragging.current = false;
    if (offset < -THRESHOLD) {
      setOffset(-120);
    } else if (offset > THRESHOLD) {
      setOffset(0);
      onEdit();
    } else {
      setOffset(0);
    }
  };

  const catColor = CAT_COLORS[snip.category] || "var(--accent)";

  return (
    <div style={{
      position: "relative", overflow: "hidden",
      borderBottom: "1px solid var(--border)",
    }}>
      {/* Achter links -- Edit */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 80,
        background: "var(--accent)",
        display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer",
      }}
        onClick={onEdit}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20 }}>✏️</div>
          <div style={{
            fontSize: 10, fontWeight: 700,
            color: "#000", marginTop: 2,
          }}>EDIT</div>
        </div>
      </div>

      {/* Achter rechts -- Delete */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 120,
        background: "var(--red)",
        display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer",
      }}
        onClick={() => { setOffset(0); onDelete(); }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20 }}>🗑</div>
          <div style={{
            fontSize: 10, fontWeight: 700,
            color: "#fff", marginTop: 2,
          }}>VERWIJDER</div>
        </div>
      </div>

      {/* Row */}
      <div
        style={{
          display: "flex", alignItems: "flex-start",
          padding: "14px 20px", cursor: "pointer",
          background: "var(--bg)",
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? "none" : "transform 0.3s ease",
          animation: `snapIn 0.25s ease ${delay}ms both`,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={offset === 0 ? onOpen : () => setOffset(0)}
      >
        <div style={{ position: "relative" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
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
          <div style={{
            fontSize: 17, fontWeight: 600,
            marginBottom: 3, color: "var(--text)",
          }}>
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
          <div style={{
            display: "flex", alignItems: "center",
            gap: 6, marginTop: 6,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: catColor,
            }} />
            <span style={{
              fontSize: 11, color: "var(--text3)", fontWeight: 500,
            }}>
              {snip.category}
            </span>
          </div>
        </div>

        <button
          style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", background: "none",
            border: "none", cursor: "pointer",
            padding: "2px 0", flexShrink: 0,
          }}
          onClick={e => { e.stopPropagation(); onFav(); }}
        >
          {snip.favorite
            ? <svg width="21" height="21" viewBox="0 0 24 24"
                fill="var(--accent)" stroke="var(--accent)" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            : <svg width="21" height="21" viewBox="0 0 24 24"
                fill="none" stroke="var(--border2)" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
          }
          <span style={{
            fontSize: 11, marginTop: 2, fontWeight: 600,
            color: snip.favorite ? "var(--accent)" : "var(--border2)",
          }}>
            {snip.favorite ? "1" : "0"}
          </span>
        </button>
      </div>
    </div>
  );
}
