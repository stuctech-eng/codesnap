"use client";

import { useMemo } from "react";
import { Snippet } from "@/lib/types";
import Breadcrumb, { BreadcrumbSegment } from "./Breadcrumb";

// Generiek component voor de hiërarchie-niveaus Project en
// Onderdeel (Component). Zie docs/audit-hierarchie.md sectie 4.4:
// bewust één component met een "level"-prop i.p.v. twee bijna-
// identieke bestanden, om de bestaande CAT_CONFIG/ALL_CATS-
// duplicatie-valkuil (audit sectie 3) niet te herhalen.

type Level = "project" | "component";

interface Props {
  level: Level;
  category: string;
  project?: string; // alleen relevant/gezet wanneer level === "component"
  allSnips: Snippet[];
  onBack: () => void;
  onOpenSnippet: (id: string) => void;
  onOpenNext: (value: string) => void; // drill verder naar component-niveau
  onFav: (id: string, cur: boolean) => void;
  breadcrumb?: BreadcrumbSegment[]; // Fase H5 — optioneel, alleen tonen als er >1 segment is
}

const initials = (t = "") => t.slice(0, 2).toUpperCase();

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

export default function DrillDownView({
  level, category, project, allSnips, onBack, onOpenSnippet, onOpenNext, onFav, breadcrumb,
}: Props) {
  // Basisverzameling: snippets binnen deze categorie (en, op
  // component-niveau, binnen dit specifieke project).
  const scoped = useMemo(() => {
    let base = allSnips.filter(s => !s.deletedAt && s.category === category);
    if (level === "component" && project) {
      base = base.filter(s => s.project === project);
    }
    return base;
  }, [allSnips, category, project, level]);

  // Groepen op dit niveau (projecten, of onderdelen binnen het project)
  const groups = useMemo(() => {
    const field = level === "project" ? "project" : "component";
    const names = new Set<string>();
    scoped.forEach(s => {
      const v = s[field as "project" | "component"];
      if (v) names.add(v);
    });
    return Array.from(names).sort();
  }, [scoped, level]);

  // Platte snippets zonder een waarde op dit niveau — die horen hier
  // gewoon in de lijst thuis, geen los "leeg"-niveau ervoor nodig.
  const ungrouped = useMemo(() => {
    const field = level === "project" ? "project" : "component";
    return scoped.filter(s => !s[field as "project" | "component"]);
  }, [scoped, level]);

  const title = level === "project" ? category : project!;
  const subtitle = level === "project" ? "Projecten" : "Onderdelen";
  const backLabel = level === "project" ? "Bibliotheek" : category;

  return (
    <div style={{ minHeight: "100vh", background: "#0B1020", color: "#fff", display: "flex", flexDirection: "column" }}>

      <div style={{ padding: "52px 18px 16px", position: "sticky", top: 0, background: "#0B1020", zIndex: 10, borderBottom: "1px solid #202A44" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", marginBottom: 12, padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          <span style={{ color: "#4F8CFF", fontSize: 16 }}>{backLabel}</span>
        </button>

        {breadcrumb && <Breadcrumb segments={breadcrumb} />}

        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>{title}</h1>
        <div style={{ fontSize: 13, color: "#94A3B8" }}>{scoped.length} {scoped.length === 1 ? "snippet" : "snippets"}</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 40px" }}>

        {groups.length === 0 && ungrouped.length === 0 && (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
            Geen snippets
          </div>
        )}

        {groups.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              {subtitle}
            </div>
            {groups.map(name => {
              const field = level === "project" ? "project" : "component";
              const count = scoped.filter(s => s[field as "project" | "component"] === name).length;
              return (
                <div key={name} onClick={() => onOpenNext(name)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 4px", borderBottom: "1px solid #151D31", cursor: "pointer" }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{count} {count === 1 ? "snippet" : "snippets"}</div>
                  </div>
                  <span style={{ color: "#4A5568", fontSize: 14 }}>›</span>
                </div>
              );
            })}
          </>
        )}

        {ungrouped.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: groups.length > 0 ? 20 : 0, marginBottom: 8 }}>
              {level === "project" ? "Overig binnen " + category : "Overig binnen " + project}
            </div>
            {ungrouped.map(snip => {
              const lang = getLang(snip);
              return (
                <div key={snip.id}
                  onClick={() => onOpenSnippet(snip.id!)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 14, border: "1px solid " + (snip.favorite ? "rgba(79,140,255,0.35)" : "#202A44"), marginBottom: 8, background: "#0B1020", cursor: "pointer" }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#E2E8F0", border: "1px solid #2A3654", flexShrink: 0 }}>
                    {initials(snip.title)}
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
            })}
          </>
        )}
      </div>
    </div>
  );
}
