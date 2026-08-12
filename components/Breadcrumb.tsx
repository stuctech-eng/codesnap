"use client";

// Kleine, herbruikbare breadcrumb. Toont bijv. "Apps / CoachOS /
// Recovery" met elk segment los tikbaar om DIRECT naar dat niveau
// te springen — dit is iets anders dan de bestaande popView()
// stack-navigatie (die altijd maar één stap terug gaat). Zie
// docs/audit-hierarchie.md Fase H5.

export interface BreadcrumbSegment {
  label: string;
  onTap: () => void;
}

interface Props {
  segments: BreadcrumbSegment[]; // laatste segment = huidige positie, niet tikbaar
}

export default function Breadcrumb({ segments }: Props) {
  if (segments.length <= 1) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 10, fontSize: 13 }}>
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {isLast ? (
              <span style={{ color: "#94A3B8", fontWeight: 600 }}>{seg.label}</span>
            ) : (
              <button
                onClick={seg.onTap}
                style={{ background: "none", border: "none", padding: 0, color: "#4F8CFF", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
              >
                {seg.label}
              </button>
            )}
            {!isLast && <span style={{ color: "#4A5568" }}>/</span>}
          </span>
        );
      })}
    </div>
  );
}
