"use client";
import { useState } from "react";
import { Snippet } from "@/lib/types";

const initials = (t = "") => t.slice(0, 2).toUpperCase();
const AV = ["#f59e0b", "#d97706", "#b45309", "#78350f"];
const avColor = (t = "") => AV[t.charCodeAt(0) % AV.length];
const CAT_COLORS: Record<string, string> = {
  "AI Prompts": "#6366f1", "Snippets": "#f59e0b",
  "Config": "#10b981", "UI": "#ec4899",
  "Machines": "#3b82f6", "Ideeën": "#8b5cf6",
};

const VS = {
  bg: "#1e1e1e", bar: "#252526",
  lineNum: "#858585", default: "#d4d4d4",
};

interface Props {
  snip: Snippet; copied: boolean; showSheet: boolean; theme: "dark" | "light";
  onBack: () => void; onDots: () => void; onEdit: () => void;
  onDelete: () => void; onCopy: () => void; onFav: () => void;
  onShare: () => void; onExport: () => void;
  onCloseSheet: () => void; onAdd: () => void;
}

type FullField = "title" | "description" | "code" | "notes" | null;
type Tab = "about" | "code" | "notes";

export default function DetailView({
  snip, copied, showSheet, theme,
  onBack, onDots, onEdit, onDelete,
  onCopy, onFav, onShare, onExport,
  onCloseSheet, onAdd,
}: Props) {
  const [tab, setTab] = useState<Tab>("about");
  const [fullField, setFullField] = useState<FullField>(null);
  const [copyAllDone, setCopyAllDone] = useState(false);
  const [formatDone, setFormatDone] = useState(false);
  const catColor = CAT_COLORS[snip.category] || "var(--accent)";

  const copyAll = () => {
    const text = `# ${snip.title}\n\n**Categorie:** ${snip.category}\n\n## Beschrijving\n${snip.description}\n\n## Code\n\`\`\`\n${snip.code}\n\`\`\`${snip.notes ? `\n\n## Notities\n${snip.notes}` : ""}\n\n**Tags:** ${snip.tags?.join(", ")}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyAllDone(true);
      setTimeout(() => setCopyAllDone(false), 2200);
    });
  };

  const formatCode = () => {
    try {
      // Probeer JSON te formatteren
      const parsed = JSON.parse(snip.code);
      const formatted = JSON.stringify(parsed, null, 2);
      navigator.clipboard.writeText(formatted).then(() => {
        setFormatDone(true);
        setTimeout(() => setFormatDone(false), 2200);
      });
    } catch {
      // Basis JS/TS formatting
      let code = snip.code;
      code = code.replace(/;(\S)/g, ";\n$1");
      code = code.replace(/\{(\S)/g, "{\n  $1");
      code = code.replace(/(\S)\}/g, "\n$1\n}");
      navigator.clipboard.writeText(code).then(() => {
        setFormatDone(true);
        setTimeout(() => setFormatDone(false), 2200);
      });
    }
  };

  if (fullField) {
    return (
      <FullScreenRead
        label={fullField.toUpperCase()}
        value={
          fullField === "title" ? snip.title
          : fullField === "description" ? snip.description
          : fullField === "notes" ? (snip.notes || "")
          : snip.code
        }
        isCode={fullField === "code"}
        copied={copied}
        onCopy={onCopy}
        onClose={() => setFullField(null)}
      />
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      {/* Nav */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "52px 12px 10px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}>
        <button
          style={{ display: "flex", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}
          onClick={onBack}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span style={{ color: "var(--accent)", fontSize: 17 }}>Snippets</span>
        </button>
        <span style={{
          fontSize: 16, fontWeight: 600, color: "var(--text)",
          maxWidth: 160, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {snip.title}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={onAdd}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "var(--accent)", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={onDots}
          >
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "var(--bg2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text2)">
                <circle cx="12" cy="5" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="12" cy="19" r="2"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "10px 16px 0", background: "var(--bg)" }}>
        <div style={{ background: "var(--bg2)", borderRadius: 10, padding: 2, display: "flex" }}>
          {(["about", "code", "notes"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 8,
                border: "none", cursor: "pointer", fontSize: 14,
                fontWeight: tab === t ? 600 : 500,
                background: tab === t ? "var(--bg3)" : "transparent",
                color: tab === t ? "var(--text)" : "var(--text2)",
              }}>
              {t === "about" ? "About" : t === "code" ? "Code" : "Notes"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>

        {/* ABOUT TAB */}
        {tab === "about" && (
          <div style={{ padding: "24px 20px" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 800, color: "#000",
              background: avColor(snip.title), marginBottom: 20,
            }}>
              {initials(snip.title)}
            </div>

            <h1 style={{
              fontSize: 28, fontWeight: 700, margin: "0 0 10px",
              letterSpacing: "-0.02em", color: "var(--text)",
            }}>
              {snip.title}
            </h1>

            {snip.category && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: catColor + "22", padding: "4px 12px",
                borderRadius: 20, fontSize: 13, fontWeight: 600,
                marginBottom: 16, color: catColor,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: catColor }} />
                {snip.category}
              </div>
            )}

            {snip.description && (
              <button
                onClick={() => setFullField("description")}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: "var(--bg2)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: "12px 14px",
                  cursor: "pointer", marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, marginBottom: 6, letterSpacing: "0.06em" }}>
                  BESCHRIJVING › volledig scherm
                </div>
                <p style={{
                  fontSize: 15, color: "var(--text2)",
                  lineHeight: 1.5, margin: 0,
                  display: "-webkit-box", overflow: "hidden",
                  WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                } as React.CSSProperties}>
                  {snip.description}
                </p>
              </button>
            )}

            {snip.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {snip.tags.map(t => (
                  <span key={t} style={{
                    background: "var(--bg2)", color: "var(--text3)",
                    padding: "4px 10px", borderRadius: 20,
                    fontSize: 13, border: "1px solid var(--border)",
                  }}>#{t}</span>
                ))}
              </div>
            )}

            {/* Kopieer Alles */}
            <button
              onClick={copyAll}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, width: "100%", padding: "13px",
                background: copyAllDone ? "var(--green)" : "var(--bg2)",
                border: "1px solid var(--border)", borderRadius: 14,
                cursor: "pointer", fontSize: 15, fontWeight: 700,
                color: copyAllDone ? "#fff" : "var(--text2)",
                marginBottom: 10, transition: "background 0.2s",
              }}
            >
              {copyAllDone ? "✓ Alles gekopieerd!" : "⎘ Kopieer Alles (markdown)"}
            </button>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onFav} style={{
                flex: 1, padding: "12px",
                background: snip.favorite ? "var(--accent)" : "var(--bg2)",
                border: "1px solid var(--border)", borderRadius: 14,
                cursor: "pointer", fontSize: 14, fontWeight: 700,
                color: snip.favorite ? "#000" : "var(--text2)",
              }}>
                {snip.favorite ? "★ Favoriet" : "☆ Favoriet"}
              </button>
              <button onClick={onShare} style={{
                flex: 1, padding: "12px", background: "var(--bg2)",
                border: "1px solid var(--border)", borderRadius: 14,
                cursor: "pointer", fontSize: 14, fontWeight: 700,
                color: "var(--text2)",
              }}>↗ Delen</button>
              <button onClick={onExport} style={{
                flex: 1, padding: "12px", background: "var(--bg2)",
                border: "1px solid var(--border)", borderRadius: 14,
                cursor: "pointer", fontSize: 14, fontWeight: 700,
                color: "var(--text2)",
              }}>↓ Export</button>
            </div>
          </div>
        )}

        {/* CODE TAB */}
        {tab === "code" && (
          <div style={{ padding: "16px" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button
                style={{
                  flex: 2, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8, padding: "13px",
                  borderRadius: 14, border: "none", fontSize: 15,
                  fontWeight: 700, cursor: "pointer",
                  background: copied ? "var(--green)" : "var(--accent)",
                  color: copied ? "#fff" : "#000",
                  transition: "background 0.2s",
                }}
                onClick={onCopy}
              >
                {copied ? "✓ Gekopieerd!" : "⎘ Kopieer Code"}
              </button>
              <button
                style={{
                  flex: 1, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6, padding: "13px",
                  borderRadius: 14, border: "1px solid var(--border)",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: formatDone ? "var(--green)" : "var(--bg2)",
                  color: formatDone ? "#fff" : "var(--text2)",
                  transition: "background 0.2s",
                }}
                onClick={formatCode}
              >
                {formatDone ? "✓ Klaar" : "⚡ Format"}
              </button>
            </div>

            <button
              onClick={() => setFullField("code")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, width: "100%", padding: "10px",
                background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 12, cursor: "pointer",
                color: "var(--text2)", fontSize: 14,
                fontWeight: 600, marginBottom: 12,
              }}
            >
              ⛶ Volledig scherm
            </button>

            <VSCodeBlock code={snip.code} />
          </div>
        )}

        {/* NOTES TAB */}
        {tab === "notes" && (
          <div style={{ padding: "20px" }}>
            {snip.notes ? (
              <button
                onClick={() => setFullField("notes")}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: "var(--bg2)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "16px",
                  cursor: "pointer", marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, marginBottom: 8, letterSpacing: "0.06em" }}>
                  NOTITIES › volledig scherm
                </div>
                <p style={{
                  fontSize: 15, color: "var(--text)",
                  lineHeight: 1.6, margin: 0,
                  whiteSpace: "pre-wrap",
                }}>
                  {snip.notes}
                </p>
              </button>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <p style={{ color: "var(--text2)", fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>
                  Geen notities
                </p>
                <p style={{ color: "var(--text3)", fontSize: 14, margin: "0 0 20px" }}>
                  Voeg notities toe via bewerken
                </p>
                <button
                  onClick={onEdit}
                  style={{
                    background: "var(--accent)", color: "#000",
                    border: "none", padding: "10px 20px",
                    borderRadius: 12, fontSize: 15,
                    fontWeight: 700, cursor: "pointer",
                  }}
                >
                  ✏️ Bewerken
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action sheet */}
      {showSheet && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            zIndex: 200, padding: "0 8px 34px",
          }}
          onClick={onCloseSheet}
        >
          <div onClick={e => e.stopPropagation()}>
            <div style={{ background: "var(--bg2)", borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "var(--accent)", fontSize: 17, cursor: "pointer" }} onClick={onEdit}>✏️ Bewerken</button>
              <div style={{ height: 1, background: "var(--border2)" }} />
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "var(--accent)", fontSize: 17, cursor: "pointer" }} onClick={onShare}>↗ Delen</button>
              <div style={{ height: 1, background: "var(--border2)" }} />
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "var(--accent)", fontSize: 17, cursor: "pointer" }} onClick={onExport}>↓ Exporteren</button>
              <div style={{ height: 1, background: "var(--border2)" }} />
              <button style={{ width: "100%", padding: 18, background: "transparent", border: "none", color: "var(--red)", fontSize: 17, cursor: "pointer" }} onClick={onDelete}>🗑 Verwijderen</button>
            </div>
            <button style={{ width: "100%", padding: 18, background: "var(--bg2)", border: "none", color: "var(--accent)", fontSize: 17, fontWeight: 700, cursor: "pointer", borderRadius: 14 }} onClick={onCloseSheet}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function VSCodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div style={{
      background: VS.bg, borderRadius: 14,
      overflow: "hidden", border: "1px solid #3c3c3c",
    }}>
      <div style={{
        background: VS.bar, padding: "8px 14px",
        display: "flex", alignItems: "center", gap: 8,
        borderBottom: "1px solid #3c3c3c",
      }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, fontSize: 11, color: VS.lineNum, fontFamily: "monospace" }}>
          {lines.length} regels
        </span>
      </div>
      <div style={{ overflowX: "auto", padding: "12px 0" }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex", minHeight: 22 }}>
            <span style={{
              width: 40, textAlign: "right", paddingRight: 16,
              fontSize: 12, color: VS.lineNum, flexShrink: 0,
              fontFamily: "'Fira Code','JetBrains Mono',monospace",
              lineHeight: "22px", userSelect: "none",
            }}>
              {i + 1}
            </span>
            <span style={{
              fontSize: 12.5, color: VS.default, lineHeight: "22px",
              fontFamily: "'Fira Code','JetBrains Mono',monospace",
              whiteSpace: "pre", paddingRight: 16,
            }}>
              {line || " "}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FullScreenRead({ label, value, isCode, copied, onCopy, onClose }: {
  label: string; value: string; isCode: boolean;
  copied: boolean; onCopy: () => void; onClose: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: isCode ? VS.bg : "var(--bg)",
      zIndex: 500, display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "52px 16px 12px",
        borderBottom: "1px solid var(--border)",
        background: isCode ? VS.bar : "var(--bg)",
        flexShrink: 0,
      }}>
        <button
          style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 17, cursor: "pointer" }}
          onClick={onClose}
        >
          ← Terug
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: isCode ? VS.default : "var(--text)" }}>
          {label}
        </span>
        {isCode ? (
          <button
            style={{
              background: copied ? "#10b981" : "var(--accent)",
              border: "none", borderRadius: 10,
              padding: "6px 14px",
              color: copied ? "#fff" : "#000",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
            onClick={onCopy}
          >
            {copied ? "✓" : "Copy"}
          </button>
        ) : (
          <div style={{ width: 60 }} />
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {isCode ? (
          <VSCodeBlock code={value} />
        ) : (
          <div style={{ padding: "20px" }}>
            <p style={{
              fontSize: 18, color: "var(--text)",
              lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap",
            }}>
              {value}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
