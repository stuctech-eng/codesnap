"use client";
import { Snippet } from "@/lib/types";
import BottomNav from "./BottomNav";

const initials = (t = "") => t.slice(0, 2).toUpperCase();
const AV = ["#f59e0b", "#d97706", "#b45309", "#78350f"];
const avColor = (t = "") => AV[t.charCodeAt(0) % AV.length];

interface Props {
  mySnips: Snippet[];
  featured: Snippet[];
  search: string;
  onSearch: (v: string) => void;
  onOpen: (id: string) => void;
  onFav: (id: string, current: boolean) => void;
  onAdd: () => void;
}

export default function ListView({
  mySnips, featured, search, onSearch, onOpen, onFav, onAdd
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ padding: "52px 20px 12px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, margin: "0 0 14px", letterSpacing: "-0.03em" }}>
          Snippets
        </h1>
        <div style={{ background: "#1c1c1e", borderRadius: 12, display: "flex", alignItems: "center", padding: "0 12px", gap: 8 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 16, padding: "11px 0" }}
            placeholder="Search"
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
          {search && (
            <button style={{ background: "none", border: "none", color: "#6b7280", fontSize: 16, cursor: "pointer" }}
              onClick={() => onSearch("")}>✕</button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 110 }}>
        <Section title="My snippets">
          {mySnips.length === 0
            ? <p style={{ padding: "30px 20px", color: "#4b5563", textAlign: "center" }}>
                Geen snippets gevonden
              </p>
            : mySnips.map((s, i) => (
              <Row key={s.id} snip={s} delay={i * 35}
                onOpen={() => onOpen(s.id!)}
                onFav={() => onFav(s.id!, s.favorite)}
              />
            ))
          }
        </Section>

        {featured.length > 0 && (
          <Section title="Featured">
            {featured.map((s, i) => (
              <Row key={s.id} snip={s} delay={i * 35}
                onOpen={() => onOpen(s.id!)}
                onFav={() => onFav(s.id!, s.favorite)}
              />
            ))}
          </Section>
        )}
      </div>

      <BottomNav onAdd={onAdd} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <p style={{ margin: "16px 20px 8px", fontSize: 20, fontWeight: 700 }}>{title}</p>
      <div style={{ height: 1, background: "#1c1c1e" }} />
      {children}
    </div>
  );
}

function Row({ snip, onOpen, onFav, delay }: {
  snip: Snippet; onOpen: () => void; onFav: () => void; delay: number;
}) {
  return (
    <div
      style={{ display: "flex", alignItems: "flex-start", padding: "14px 20px", borderBottom: "1px solid #111", cursor: "pointer", animation: `snapIn 0.25s ease ${delay}ms both` }}
      onClick={onOpen}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#000", background: avColor(snip.title) }}>
        {initials(snip.title)}
      </div>
      <div style={{ flex: 1, paddingLeft: 14, paddingRight: 8 }}>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 3 }}>{snip.title}</div>
        {snip.description && (
          <div style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
            {snip.description}
          </div>
        )}
      </div>
      <button
        style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "2px 0", flexShrink: 0 }}
        onClick={e => { e.stopPropagation(); onFav(); }}
      >
        {snip.favorite
          ? <svg width="21" height="21" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          : <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        }
        <span style={{ fontSize: 11, color: snip.favorite ? "#f59e0b" : "#374151", marginTop: 2, fontWeight: 600 }}>
          {snip.favorite ? "1" : "0"}
        </span>
      </button>
    </div>
  );
}
