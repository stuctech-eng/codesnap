"use client";

import { useState, useMemo } from "react";
import { Snippet } from "@/lib/types";
import { daysUntilPermanentDelete } from "@/lib/db";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}

const initials = (t = "") => t.slice(0, 2).toUpperCase();

type Screen = "profiel" | "archief";

interface Props {
  allSnips: Snippet[];
  onBack: () => void;
  onRestore: (id: string) => void;
  onDeletePermanent: (id: string) => void;
}

export default function ProfielView({ allSnips, onBack, onRestore, onDeletePermanent }: Props) {
  const [screen, setScreen] = useState<Screen>("profiel");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const deletedSnips = useMemo(() => {
    return allSnips
      .filter(s => s.deletedAt)
      .sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  }, [allSnips]);

  if (screen === "archief") {
    return (
      <div style={{ minHeight: "100vh", background: "#0B1020", color: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "52px 18px 16px", position: "sticky", top: 0, background: "#0B1020", zIndex: 10, borderBottom: "1px solid #202A44" }}>
          <button onClick={() => setScreen("profiel")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", marginBottom: 12, padding: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
            <span style={{ color: "#4F8CFF", fontSize: 16 }}>Profiel</span>
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 4 }}>Archief</h1>
          <div style={{ fontSize: 13, color: "#94A3B8" }}>{deletedSnips.length} {deletedSnips.length === 1 ? "item" : "items"} · 30 dagen bewaartermijn</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 40px" }}>
          {deletedSnips.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
              Geen verwijderde snippets
            </div>
          ) : (
            deletedSnips.map(snip => {
              const daysLeft = daysUntilPermanentDelete(snip.deletedAt);
              return (
                <div key={snip.id} style={{ padding: "13px 14px", borderRadius: 14, border: "1px solid #202A44", marginBottom: 8, background: "#151D31" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#94A3B8", border: "1px solid #2A3654", flexShrink: 0 }}>
                      {initials(snip.title)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{snip.title}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>Verwijderd op {formatDate(snip.deletedAt)}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: daysLeft <= 5 ? "#f87171" : "#94A3B8", marginBottom: 10 }}>
                    {daysLeft === 0 ? "Wordt binnenkort definitief verwijderd" : daysLeft + " dagen resterend"}
                  </div>

                  {confirmId === snip.id ? (
                    <div>
                      <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>Definitief verwijderen? Dit kan niet ongedaan gemaakt worden.</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setConfirmId(null)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid #202A44", background: "transparent", color: "#94A3B8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Annuleer</button>
                        <button onClick={() => { onDeletePermanent(snip.id!); setConfirmId(null); }} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "#f87171", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Definitief verwijderen</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => onRestore(snip.id!)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: "#4F8CFF", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Herstellen</button>
                      <button onClick={() => setConfirmId(snip.id!)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid rgba(248,113,113,0.3)", background: "transparent", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Verwijder nu</button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B1020", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 18px 16px", borderBottom: "1px solid #202A44" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", marginBottom: 12, padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          <span style={{ color: "#4F8CFF", fontSize: 16 }}>Home</span>
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Profiel</h1>
      </div>

      <div style={{ flex: 1, padding: "16px 18px 40px" }}>
        <div style={{ padding: "14px 4px", borderBottom: "1px solid #151D31", opacity: 0.5 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Account</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>Binnenkort beschikbaar</div>
        </div>
        <div style={{ padding: "14px 4px", borderBottom: "1px solid #151D31", opacity: 0.5 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Instellingen</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>Binnenkort beschikbaar</div>
        </div>
        <div onClick={() => setScreen("archief")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 4px", borderBottom: "1px solid #151D31", cursor: "pointer" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Archief</div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{deletedSnips.length} {deletedSnips.length === 1 ? "item" : "items"}</div>
          </div>
          <span style={{ color: "#4A5568", fontSize: 14 }}>›</span>
        </div>
      </div>
    </div>
  );
}
