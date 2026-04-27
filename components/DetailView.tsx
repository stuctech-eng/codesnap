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
// Kleuren gebaseerd op Working Copy / GitHub Dark thema
const KEYWORDS = ["import","export","from","const","let","var","function","return","if","else","for","while","class","new","async","await","try","catch","throw","typeof","instanceof","default","null","undefined","true","false","this","super","extends","interface","type","enum","void","in","of","do","switch","case","break","continue"];

function tokenize(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  const push = (text: string, color: string) => {
    parts.push(<span key={key++} style={{ color }}>{text}</span>);
  };

  while (remaining.length > 0) {
    // Comment //
    const commentMatch = remaining.match(/^(\/\/.*)/);
    if (commentMatch) { push(commentMatch[1], "#8b949e"); break; }

    // Comment #
    const hashMatch = remaining.match(/^(#.*)/);
    if (hashMatch) { push(hashMatch[1], "#8b949e"); break; }

    // String dubbel
    const dblMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/);
    if (dblMatch) { push(dblMatch[1], "#a5d6ff"); remaining = remaining.slice(dblMatch[1].length); continue; }

    // String enkel
    const sglMatch = remaining.match(/^('(?:[^'\\]|\\.)*')/);
    if (sglMatch) { push(sglMatch[1], "#a5d6ff"); remaining = remaining.slice(sglMatch[1].length); continue; }

    // Template literal
    const tplMatch = remaining.match(/^(`(?:[^`\\]|\\.)*`)/);
    if (tplMatch) { push(tplMatch[1], "#a5d6ff"); remaining = remaining.slice(tplMatch[1].length); continue; }

    // HTML tag
    const tagMatch = remaining.match(/^(<\/?[a-zA-Z][a-zA-Z0-9-]*)/);
    if (tagMatch) { push(tagMatch[1], "#7ee787"); remaining = remaining.slice(tagMatch[1].length); continue; }

    // HTML attribuut =
    const attrMatch = remaining.match(/^([a-zA-Z-]+=)/);
    if (attrMatch && parts.length > 0) { push(attrMatch[1], "#79c0ff"); remaining = remaining.slice(attrMatch[1].length); continue; }

    // Number
    const numMatch = remaining.match(/^(\b\d+\.?\d*\b)/);
    if (numMatch) { push(numMatch[1], "#79c0ff"); remaining = remaining.slice(numMatch[1].length); continue; }

    // Keyword
    const wordMatch = remaining.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (wordMatch) {
      const word = wordMatch[1];
      if (KEYWORDS.includes(word)) {
        push(word, "#ff7b72");
      } else if (remaining[word.length] === "(") {
        push(word, "#d2a8ff");
      } else if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
        push(word, "#ffa657");
      } else {
        push(word, "#e6edf3");
      }
      remaining = remaining.slice(word.length);
      continue;
    }

    // Overige tekens
    push(remaining[0], "#e6edf3");
    remaining = remaining.slice(1);
  }

  return <>{parts}</>;
}

function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  const lineNumWidth = String(lines.length).length * 10 + 16;

  return (
    <div style={{ background:"#0d1117", borderRadius:12, overflow:"hidden", border:"1px solid #30363d" }}>
      {/* Mac-stijl toolbar */}
      <div style={{ background:"#161b22", padding:"8px 14px", display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid #21262d", flexShrink:0 }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff5f57" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#febc2e" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#28c840" }} />
        <span style={{ marginLeft:8, fontSize:11, color:"#484f58", fontFamily:"monospace" }}>
          {lines.length} regels · {code.length} tekens
        </span>
      </div>

      {/* Code inhoud -- horizontaal scrollbaar */}
      <div style={{ overflowX:"auto", overflowY:"visible", WebkitOverflowScrolling:"touch" } as React.CSSProperties}>
        <div style={{ padding:"10px 0", minWidth:"max-content" }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display:"flex", minHeight:21, alignItems:"flex-start" }}>
              {/* Regelnummer */}
              <span style={{
                width:lineNumWidth, textAlign:"right", paddingRight:14,
                fontSize:12, color:"#484f58", flexShrink:0,
                fontFamily:"'Fira Code','JetBrains Mono',monospace",
                lineHeight:"21px", userSelect:"none",
                position:"sticky", left:0,
                background:"#0d1117",
              }}>
                {i + 1}
              </span>
              {/* Code regel */}
              <span style={{
                fontSize:13, lineHeight:"21px", paddingRight:24,
                fontFamily:"'Fira Code','JetBrains Mono','Courier New',monospace",
                whiteSpace:"pre",
              }}>
                {tokenize(line || " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
      <FullScreenView
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
        position:"sticky", top:0, zIndex:10,
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

        {/* ABOUT TAB */}
        {tab === "about" && (
          <div style={{ padding:"16px" }}>
            {/* Header kaart */}
            <div style={{ background:"var(--bg2)", borderRadius:14, padding:14, marginBottom:12, border:"1px solid var(--border2)", display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:48, height:48, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#000", background:avColor(snip.title), flexShrink:0 }}>
                {initials(snip.title)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <h1 style={{ fontSize:19, fontWeight:800, margin:"0 0 5px", color:"var(--text)", letterSpacing:"-0.02em" }}>
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

        {/* CODE TAB */}
        {tab === "code" && (
          <div style={{ padding:"12px" }}>
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
                flex:1, padding:"12px", borderRadius:12,
                border:"1px solid var(--border2)", background:"var(--bg2)",
                fontSize:13, fontWeight:600, cursor:"pointer", color:"var(--text2)",
              }}>
                ⛶ Volledig
              </button>
            </div>

            <CodeBlock code={snip.code} />
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

// ── VOLLEDIG SCHERM ───────────────────────────────────────
function FullScreenView({ label, value, isCode, copied, onCopy, onClose }: {
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
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer" }} onClick={onClose}>
          ← Terug
        </button>
        <span style={{ fontSize:15, fontWeight:600, color: isCode ? "#e6edf3" : "var(--text)" }}>
          {label}
        </span>
        {isCode
          ? <button onClick={onCopy} style={{
              background: copied ? "#10b981" : "var(--accent)",
              border:"none", borderRadius:10, padding:"6px 14px",
              color: copied ? "#fff" : "#000",
              fontSize:14, fontWeight:700, cursor:"pointer",
            }}>
              {copied ? "✓" : "Copy"}
            </button>
          : <div style={{ width:60 }} />
        }
      </div>
      <div style={{ flex:1, overflow:"auto" }}>
        {isCode
          ? <div style={{ padding:"12px", minHeight:"100%" }}>
              <CodeBlock code={value} />
            </div>
          : <div style={{ padding:"20px" }}>
              <p style={{ fontSize:17, color:"var(--text)", lineHeight:1.7, margin:0, whiteSpace:"pre-wrap" }}>
                {value}
              </p>
            </div>
        }
      </div>
    </div>
  );
}
