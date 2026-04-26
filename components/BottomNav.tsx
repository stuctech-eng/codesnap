"use client";

export default function BottomNav({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%",
      transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "#000", borderTop: "1px solid #1c1c1e",
      display: "flex", justifyContent: "space-around",
      alignItems: "flex-start", padding: "10px 0 34px", zIndex: 50,
    }}>
      <button style={navItem}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/>
          <line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
        <span style={{ ...label, color: "#f59e0b" }}>Snippets</span>
      </button>

      <button style={navItem} onClick={onAdd}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "#1c1c1e", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span style={label}>Add snippet</span>
      </button>

      <button style={navItem}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span style={label}>Profile</span>
      </button>
    </div>
  );
}

const navItem: React.CSSProperties = {
  display: "flex", flexDirection: "column",
  alignItems: "center", gap: 4,
  background: "none", border: "none", cursor: "pointer",
};
const label: React.CSSProperties = {
  fontSize: 10, color: "#6b7280", fontWeight: 500,
};
