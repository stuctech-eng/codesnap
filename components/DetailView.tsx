"use client";
import { useState } from "react";
import { Snippet } from "@/lib/types";

const initials = (t = "") => t.slice(0, 2).toUpperCase();
const AV = ["#f59e0b","#d97706","#b45309","#78350f"];
const avColor = (t = "") => AV[t.charCodeAt(0) % AV.length];
const CAT_COLORS: Record<string,string> = {
  "AI Prompts":"#6366f1","Snippets":"#f59e0b",
  "Config":"#10b981","UI":"#ec4899",
  "Machines":"#3b82f6","Ideeën":"#8b5cf6",
};

// ── SYNTAX HIGHLIGHTER ────────────────────────────────────
function highlight(code: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, i) => (
    <div key={i} style={{ display:"flex", minHeight:22 }}>
      <span style={{
        width:38, textAlign:"right", paddingRight:14,
        fontSize:12, color:"#484f58", flexShrink:0,
        fontFamily:"monospace", lineHeight:"22px",
        userSelect:"none", borderRight:"1px solid #21262d",
        marginRight:14,
      }}>
        {i + 1}
      </span>
      <span
        style={{ fontSize:13, lineHeight:"22px", whiteSpace:"pre", paddingRight:16, fontFamily:"'Fira Code','JetBrains Mono','Courier New',monospace" }}
        dangerouslySetInnerHTML={{ __html: colorize(line) }}
      />
    </div>
  ));
}

function colorize(line: string): string {
  const esc = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  // HTML tags
  if (line.trim().startsWith("<") || line.includes("</")) {
    return line.replace(/(<\/?[\w\s="'.:#-]*\/?>)/g, (m) =>
      `<span style="color:#7ee787">${esc(m)}</span>`
    ).replace(/("[^"]*")/g, (m) =>
      `<span style="color:#a5d6ff">${esc(m)}</span>`
    );
  }

  let result = esc(line);

  // Comments
  result = result.replace(/(\/\/.*$|#.*$)/g,
    `<span style="color:#8b949e;font-style:italic">$1</span>`);

  // Strings
  result = result.replace(/(&quot;[^&]*&quot;|'[^']*'|`[^`]*`)/g,
    `<span style="color:#a5d6ff">$1</span>`);

  // Keywords
  const keywords = ["import","export","from","const","let","var","function","return","if","else","for","while","class","new","async","await","try","catch","throw","typeof","instanceof","default","null","undefined","true","false","this","super","extends","interface","type","enum"];
  keywords.forEach(kw => {
    result = result.replace(new RegExp(`\\b(${kw})\\b`, "g"),
      `<span style="color:#ff7b72">$1</span>`);
  });

  // Numbers
  result = result.replace(/\b(\d+\.?\d*)\b/g,
    `<span style="color:#79c0ff">$1</span>`);

  // Function calls
  result = result.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
    `<span style="color:#d2a8ff">$1</span>`);

  return result;
}

interface Props {
  snip: Snippet; copied: boolean; showSheet: boolean; theme: "dark"|"light";
  onBack:()=>void; onDots:()=>void; onEdit:()=>void; onDelete:()=>void;
  onCopy:()=>void; onFav:()=>void; onShare:()=>void; onExport:()=>void;
  onCloseSheet:()=>void; onAdd:()=>void;
}

type FullField = "description"|"code"|null;
type Tab = "about"|"code";

export default function DetailView({
  snip, copied, showSheet, theme,
  onBack, onDots, onEdit, onDelete,
  onCopy, onFav, onShare, onExport,
  onCloseSheet, onAdd,
}: Props) {
  const [tab, setTab] = useState<Tab>("about");
  const [fullField, setFullField] = useState<FullField>(null);
  const [copyAllDone, setCopyAllDone] = useState(false);
  const catColor = CAT_COLORS[snip.category] || "var(--accent)";

  const copyAll = () => {
    const text = `# ${snip.title}\n\n**Categorie:** ${snip.category}\n\n## Beschrijving\n${snip.description}\n\n## Code\n\`\`\`\n${snip.code}\n\`\`\`\n\n**Tags:** ${snip.tags?.join(", ")}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyAllDone(true);
      setTimeout(() => setCopyAllDone(false), 2200);
    });
  };

  if (fullField) {
    return (
      <FullScreenRead
        label={fullField === "code" ? "CODE" : "BESCHRIJVING"}
        value={fullField === "code" ? snip.code : snip.description}
        isCode={fullField === "code"}
        copied={copied}
        onCopy={onCopy}
        onClose={() => setFullField(null)}
      />
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--bg)" }}>

      {/* ── NAV ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"52px 14px 12px",
        borderBottom:"1px solid var(--border)",
        background:"var(--bg)",
      }}>
        <button style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer" }} onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          <span style={{ color:"var(--accent)", fontSize:16 }}>Snippets</span>
        </button>
        <span style={{ fontSize:15, fontWeight:700, color:"var(--text)", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {snip.title}
        </span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onAdd} style={{
            width:32, height:32, borderRadius:"50%", background:"var(--accent)",
            border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button onClick={onDots} style={{ background:"none", border:"none", cursor:"pointer" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--bg2)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text2)">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ padding:"10px 14px 0", background:"var(--bg)" }}>
        <div style={{ background:"var(--bg2)", borderRadius:10, padding:3, display:"flex", border:"1px solid var(--border2)" }}>
          {(["about","code"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:"7px 0", borderRadius:8, border:"none", cursor:"pointer",
              fontSize:14, fontWeight: tab===t ? 700 : 500,
              background: tab===t ? "var(--accent)" : "transparent",
              color: tab===t ? "#000" : "var(--text2)",
              transition:"background 0.2s",
            }}>
              {t === "about" ? "About" : "Code"}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:40 }}>

        {/* ABOUT */}
        {tab === "about" && (
          <div style={{ padding:"20px 16px" }}>

            {/* Header kaart */}
            <div style={{ background:"var(--bg2)", borderRadius:14, padding:16, marginBottom:12, border:"1px solid var(--border2)", display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:52, height:52, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"#000", background:avColor(snip.title), flexShrink:0 }}>
                {initials(snip.title)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <h1 style={{ fontSize:20, fontWeight:800, margin:"0 0 6px", color:"var(--text)", letterSpacing:"-0.02em" }}>
                  {snip.title}
                </h1>
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:catColor+"22", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, color:catColor }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:catColor }} />
                  {snip.category}
                </div>
              </div>
            </div>

            {/* Beschrijving */}
            {snip.description && (
              <button onClick={() => setFullField("description")} style={{
                display:"block", width:"100%", textAlign:"left",
                background:"var(--bg2)", border:"1px solid var(--border2)",
                borderRadius:12, padding:"12px 14px", cursor:"pointer", marginBottom:12,
              }}>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, marginBottom:6, letterSpacing:"0.1em" }}>
                  BESCHRIJVING › volledig scherm
                </div>
                <p style={{
                  fontSize:14, color:"var(--text2)", lineHeight:1.6, margin:0,
                  display:"-webkit-box", overflow:"hidden",
                  WebkitLineClamp:3, WebkitBoxOrient:"vertical",
                } as React.CSSProperties}>
                  {snip.description}
                </p>
              </button>
            )}

            {/* Tags */}
            {snip.tags?.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                {snip.tags.map(t => (
                  <span key={t} style={{ background:"var(--bg3)", color:"var(--text3)", padding:"3px 10px", borderRadius:20, fontSize:12, border:"1px solid var(--border2)" }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Kopieer alles */}
            <button onClick={copyAll} style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              width:"100%", padding:"12px", borderRadius:12, border:"1px solid var(--border2)",
              background: copyAllDone ? "var(--green)" : "var(--bg2)",
              color: copyAllDone ? "#fff" : "var(--text2)",
              fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:10,
              transition:"background 0.2s",
            }}>
              {copyAllDone ? "✓ Alles gekopieerd!" : "⎘ Kopieer Alles (markdown)"}
            </button>

            {/* Acties */}
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={onFav} style={{
                flex:1, padding:"11px 8px", borderRadius:12,
                background: snip.favorite ? "var(--accent)" : "var(--bg2)",
                border:"1px solid var(--border2)", cursor:"pointer",
                fontSize:13, fontWeight:700,
                color: snip.favorite ? "#000" : "var(--text2)",
              }}>
                {snip.favorite ? "★ Favoriet" : "☆ Favoriet"}
              </button>
              <button onClick={onShare} style={{ flex:1, padding:"11px 8px", borderRadius:12, background:"var(--bg2)", border:"1px solid var(--border2)", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--text2)" }}>
                ↗ Delen
              </button>
              <button onClick={onExport} style={{ flex:1, padding:"11px 8px", borderRadius:12, background:"var(--bg2)", border:"1px solid var(--border2)", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--text2)" }}>
                ↓ Export
              </button>
            </div>
          </div>
        )}

        {/* CODE */}
        {tab === "code" && (
          <div style={{ padding:"14px" }}>
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <button onClick={onCopy} style={{
                flex:2, display:"flex", alignItems:"center", justifyContent:"center",
                gap:8, padding:"12px", borderRadius:12, border:"none",
                fontSize:14, fontWeight:700, cursor:"pointer",
                background: copied ? "var(--green)" : "var(--accent)",
                color: copied ? "#fff" : "#000",
                transition:"background 0.2s",
              }}>
                {copied ? "✓ Gekopieerd!" : "⎘ Kopieer Code"}
              </button>
              <button onClick={() => setFullField("code")} style={{
                flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                gap:6, padding:"12px", borderRadius:12,
                border:"1px solid var(--border2)", background:"var(--bg2)",
                fontSize:13, fontWeight:600, cursor:"pointer", color:"var(--text2)",
              }}>
                ⛶ Volledig
              </button>
            </div>

            {/* VS Code blok met syntax highlighting */}
            <div style={{ background:"#0d1117", borderRadius:12, overflow:"hidden", border:"1px solid #30363d" }}>
              <div style={{ background:"#161b22", padding:"8px 14px", display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid #21262d" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff5f57" }} />
                <div style={{ width:10, height:10, borderRadius:"50%", background:"#febc2e" }} />
                <div style={{ width:10, height:10, borderRadius:"50%", background:"#28c840" }} />
                <span style={{ marginLeft:8, fontSize:11, color:"#484f58", fontFamily:"monospace" }}>
                  {snip.code.split("\n").length} regels
                </span>
              </div>
              <div style={{ overflowX:"auto", padding:"12px 0" }}>
                {highlight(snip.code)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTION SHEET ── */}
      {showSheet && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", flexDirection:"column", justifyContent:"flex-end", zIndex:200, padding:"0 8px 34px" }}
          onClick={onCloseSheet}>
          <div onClick={e => e.stopPropagation()}>
            <div style={{ background:"var(--bg2)", borderRadius:14, overflow:"hidden", marginBottom:8, border:"1px solid var(--border2)" }}>
              <button style={{ width:"100%", padding:18, background:"transparent", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer" }} onClick={onEdit}>✏️ Bewerken</button>
              <div style={{ height:1, background:"var(--border2)" }} />
              <button style={{ width:"100%", padding:18, background:"transparent", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer" }} onClick={onShare}>↗ Delen</button>
              <div style={{ height:1, background:"var(--border2)" }} />
              <button style={{ width:"100%", padding:18, background:"transparent", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer" }} onClick={onExport}>↓ Exporteren</button>
              <div style={{ height:1, background:"var(--border2)" }} />
              <button style={{ width:"100%", padding:18, background:"transparent", border:"none", color:"var(--red)", fontSize:17, cursor:"pointer" }} onClick={onDelete}>🗑 Verwijderen</button>
            </div>
            <button style={{ width:"100%", padding:18, background:"var(--bg2)", border:"1px solid var(--border2)", color:"var(--accent)", fontSize:17, fontWeight:700, cursor:"pointer", borderRadius:14 }} onClick={onCloseSheet}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FullScreenRead({ label, value, isCode, copied, onCopy, onClose }: {
  label:string; value:string; isCode:boolean;
  copied:boolean; onCopy:()=>void; onClose:()=>void;
}) {
  return (
    <div style={{ position:"fixed", inset:0, background: isCode ? "#0d1117" : "var(--bg)", zIndex:500, display:"flex", flexDirection:"column" }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"52px 16px 12px",
        borderBottom:"1px solid var(--border)",
        background: isCode ? "#161b22" : "var(--bg)",
        flexShrink:0,
      }}>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer" }} onClick={onClose}>← Terug</button>
        <span style={{ fontSize:15, fontWeight:600, color: isCode ? "#e6edf3" : "var(--text)" }}>{label}</span>
        {isCode
          ? <button onClick={onCopy} style={{ background: copied ? "#10b981" : "var(--accent)", border:"none", borderRadius:10, padding:"6px 14px", color: copied ? "#fff" : "#000", fontSize:14, fontWeight:700, cursor:"pointer" }}>
              {copied ? "✓" : "Copy"}
            </button>
          : <div style={{ width:60 }} />
        }
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
        {isCode
          ? <div style={{ background:"#0d1117", minHeight:"100%" }}>
              <div style={{ padding:"12px 0" }}>{highlight(value)}</div>
            </div>
          : <div style={{ padding:"20px" }}>
              <p style={{ fontSize:17, color:"var(--text)", lineHeight:1.7, margin:0, whiteSpace:"pre-wrap" }}>{value}</p>
            </div>
        }
      </div>
    </div>
  );
}
