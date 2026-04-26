"use client";

interface Props {
  onAdd: () => void;
  onToggleTheme: () => void;
  theme: "dark" | "light";
}

export default function BottomNav({ onAdd, onToggleTheme, theme }: Props) {
  const nav: React.CSSProperties = {
    position: "fixed", bottom: 0, left: "50%",
    transform: "translateX(-50%)",
    width: "100%", maxWidth: 430,
    background: "var(--bg)",
    borderTop: "1px solid var(--border)",
    display: "flex", justifyContent: "space-around",
    alignItems: "flex-start",
    padding: "10px 0 34px", zIndex: 50,
  };
  const item: React.CSSProperties = {
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 4,
    background: "none", border: "none", cursor: "pointer",
  };
  const lbl: React.CSSProperties = {
    fontSize: 10, color: "var(--text3)", fontWeight: 500,
  };

  return (
    <div style={nav}>
      {/* Snippets */}
      <button style={item}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/>
          <line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
        <span style={{ ...lbl, color: "var(--accent)" }}>Snippets</span>
      </button>

      {/* Add */}
      <button style={item} onClick={onAdd}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#000" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span style={lbl}>Add snippet</span>
      </button>

      {/* Theme toggle */}
      <button style={item} onClick={onToggleTheme}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "var(--bg2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--border)",
        }}>
          {theme === "dark"
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </div>
        <span style={lbl}>{theme === "dark" ? "Licht" : "Donker"}</span>
      </button>
    </div>
  );
}
