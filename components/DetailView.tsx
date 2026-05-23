"use client";
import { useState, useEffect } from "react";
import { Snippet } from "@/lib/types";

const initials = (t = "") => t.slice(0, 2).toUpperCase();
const AV = ["#f59e0b","#d97706","#b45309","#78350f"];
const avColor = (t = "") => AV[t.charCodeAt(0) % AV.length];
const CAT_COLORS: Record<string,string> = {
  "AI Prompts":"#6366f1","Snippets":"#f59e0b",
  "Config":"#10b981","UI":"#ec4899",
  "Machines":"#3b82f6","Ideeën":"#8b5cf6",
};
const LANG_COLORS: Record<string,string> = {
  html:"#e34c26", css:"#264de4", js:"#f7df1e",
  ts:"#3178c6", tsx:"#3178c6", jsx:"#61dafb",
  json:"#10b981", sql:"#336791", python:"#3572A5",
  md:"#6b7280", env:"#ef4444", bash:"#89e051",
  code:"#8b949e",
};

function getLang(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string,string> = {
    html:"html", css:"css", js:"js", ts:"ts",
    tsx:"tsx", jsx:"jsx", json:"json", sql:"sql",
    py:"python", md:"md", env:"env", sh:"bash", code:"code",
  };
  return map[ext] || ext || "code";
}

function detectLanguage(code: string): string {
  const c = code.toLowerCase();
  if (c.includes("<meta") || c.includes("<html")) return "html";
  if (c.includes("import") && c.includes("from")) return "typescript";
  if (c.includes("export default") || c.includes("const ")) return "javascript";
  if (c.includes("select ") && c.includes("from ")) return "sql";
  if (c.includes("def ") && c.includes("print(")) return "python";
  if (c.trim().startsWith("{") || c.trim().startsWith("[")) return "json";
  if (c.includes("body {") || c.includes("margin:")) return "css";
  if (c.includes("npm ") || c.includes("cd ")) return "bash";
  return "code";
}

function buildCopyText(snip: Snippet, action: string, blockId?: string): string {
  const fence = "```";
  if (blockId) {
    const block = snip.codeBlocks?.find(b => b.id === blockId);
    if (block) return fence + getLang(block.filename) + "\n" + block.code + "\n" + fence;
  }
  const firstBlock = snip.codeBlocks?.[0];
  const mainCode = firstBlock?.code || snip.code || "";
  const lang = firstBlock ? getLang(firstBlock.filename) : detectLanguage(mainCode);
  const type = snip.snippetType || "code";
  if (action === "code") return mainCode;
  if (action === "alles") {
    const tags = snip.tags?.length ? "\n**Tags:** " + snip.tags.join(", ") : "";
    const label = type === "instructie" ? "Instructie" : "Beschrijving";
    const descPart = snip.description ? "\n\n---\n\n### " + label + "\n" + snip.description : "";
    let allCode = "";
    if (snip.codeBlocks && snip.codeBlocks.length > 0) {
      snip.codeBlocks.forEach((b, i) => {
        if (i > 0) allCode += "\n\n";
        allCode += "### " + b.filename + "\n" + fence + getLang(b.filename) + "\n" + b.code + "\n" + fence;
      });
    } else {
      allCode = "### Code\n" + fence + lang + "\n" + mainCode + "\n" + fence;
    }
    return "## CodeSnap — " + snip.title + "\n\n**Categorie:** " + snip.category + tags + descPart + "\n\n---\n\n" + allCode;
  }
  return fence + lang + "\n" + mainCode + "\n" + fence;
}

const KEYWORDS = ["import","export","from","const","let","var","function","return","if","else","for","while","class","new","async","await","try","catch","throw","typeof","instanceof","default","null","undefined","true","false","this","super","extends","interface","type","enum","void","in","of","do","switch","case","break","continue"];

function tokenize(line: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;
  const push = (text: string, color: string) => parts.push(<span key={key++} style={{ color }}>{text}</span>);
  while (remaining.length > 0) {
    const c1 = remaining.match(/^(\/\/.*)/); if (c1) { push(c1[1], "#8b949e"); break; }
    const c2 = remaining.match(/^(#.*)/); if (c2) { push(c2[1], "#8b949e"); break; }
    const s1 = remaining.match(/^("(?:[^"\\]|\\.)*")/); if (s1) { push(s1[1], "#a5d6ff"); remaining = remaining.slice(s1[1].length); continue; }
    const s2 = remaining.match(/^('(?:[^'\\]|\\.)*')/); if (s2) { push(s2[1], "#a5d6ff"); remaining = remaining.slice(s2[1].length); continue; }
    const s3 = remaining.match(/^(`(?:[^`\\]|\\.)*`)/); if (s3) { push(s3[1], "#a5d6ff"); remaining = remaining.slice(s3[1].length); continue; }
    const t1 = remaining.match(/^(<\/?[a-zA-Z][a-zA-Z0-9-]*)/); if (t1) { push(t1[1], "#7ee787"); remaining = remaining.slice(t1[1].length); continue; }
    const n1 = remaining.match(/^(\b\d+\.?\d*\b)/); if (n1) { push(n1[1], "#79c0ff"); remaining = remaining.slice(n1[1].length); continue; }
    const w1 = remaining.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (w1) {
      const word = w1[1];
      if (KEYWORDS.includes(word)) push(word, "#ff7b72");
      else if (remaining[word.length] === "(") push(word, "#d2a8ff");
      else if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) push(word, "#ffa657");
      else push(word, "#e6edf3");
      remaining = remaining.slice(word.length); continue;
    }
    push(remaining[0], "#e6edf3"); remaining = remaining.slice(1);
  }
  return <>{parts}</>;
}

function CodeViewer({ code, filename }: { code: string; filename: string }) {
  const lines = code.split("\n");
  const lineNumWidth = String(lines.length).length * 10 + 16;
  const lang = getLang(filename);
  const langColor = LANG_COLORS[lang] || "#8b949e";
  return (
    <div style={{ background:"#0d1117", borderRadius:12, overflow:"hidden", border:"1px solid #30363d" }}>
      <div style={{ background:"#161b22", padding:"8px 14px", display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid #21262d" }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff5f57" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#febc2e" }} />
        <div style={{ width:10, height:10, borderRadius:"50%", background:"#28c840" }} />
        <div style={{ marginLeft:8, display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ fontSize:11, fontWeight:700, padding:"1px 7px", borderRadius:20, background: langColor + "22", color: langColor, fontFamily:"monospace" }}>{lang}</div>
          <span style={{ fontSize:11, color:"#484f58", fontFamily:"monospace" }}>{filename} · {lines.length} regels</span>
        </div>
      </div>
      <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" } as React.CSSProperties}>
        <div style={{ padding:"10px 0", minWidth:"max-content" }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display:"flex", minHeight:21 }}>
              <span style={{ width:lineNumWidth, textAlign:"right", paddingRight:14, fontSize:12, color:"#484f58", flexShrink:0, fontFamily:"monospace", lineHeight:"21px", userSelect:"none", position:"sticky", left:0, background:"#0d1117" }}>{i + 1}</span>
              <span style={{ fontSize:13, lineHeight:"21px", paddingRight:24, fontFamily:"'Fira Code','JetBrains Mono','Courier New',monospace", whiteSpace:"pre" }}>{tokenize(line || " ")}</span>
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

type MainTab = "about"|"code";

export default function DetailView({
  snip, copied, showSheet, theme,
  onBack, onDots, onEdit, onDelete,
  onCopy, onFav, onShare, onExport,
  onCloseSheet, onAdd,
}: Props) {
  const [tab, setTab] = useState<MainTab>("about");
  const [activeBlockId, setActiveBlockId] = useState<string|null>(snip.codeBlocks?.[0]?.id || null);
  const [fullScreen, setFullScreen] = useState(false);
  const [copyState, setCopyState] = useState<string|null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const catColor = CAT_COLORS[snip.category] || "var(--accent)";
  const snippetType = snip.snippetType || "code";
  const blocks = snip.codeBlocks || [];
  const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0];

  const typeInfo = snippetType === "prompt"
    ? { icon:"🤖", label:"AI Prompt", color:"#6366f1" }
    : snippetType === "instructie"
    ? { icon:"📋", label:"Instructie + Code", color:"#f59e0b" }
    : { icon:"🔧", label:"Code Snippet", color:"#10b981" };

  const copyAction = (action: string, blockId?: string) => {
    const text = buildCopyText(snip, action, blockId);
    navigator.clipboard.writeText(text).then(() => {
      setCopyState(blockId || action);
      setTimeout(() => setCopyState(null), 2200);
    });
  };

  if (fullScreen && activeBlock) {
    return (
      <div style={{ position:"fixed", inset:0, background:"#0d1117", zIndex:500, display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 16px 12px", borderBottom:"1px solid #21262d", background:"#161b22", flexShrink:0 }}>
          <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer" }} onClick={() => setFullScreen(false)}>← Terug</button>
          <span style={{ fontSize:13, fontWeight:600, color:"#e6edf3", fontFamily:"monospace" }}>{activeBlock.filename}</span>
          <button style={{ background: copyState === activeBlock.id ? "#10b981" : "var(--accent)", border:"none", borderRadius:10, padding:"6px 14px", color: copyState === activeBlock.id ? "#fff" : "#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
            onClick={() => copyAction("code", activeBlock.id)}>
            {copyState === activeBlock.id ? "✓" : "Copy"}
          </button>
        </div>
        <div style={{ flex:1, overflow:"auto", padding:"12px" }}>
          <CodeViewer code={activeBlock.code} filename={activeBlock.filename} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--bg)" }}>

      {/* NAV */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 14px 12px", borderBottom:"1px solid var(--border)", background:"var(--bg)", position:"sticky", top:0, zIndex:10 }}>
        <button style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer" }} onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
          <span style={{ color:"var(--accent)", fontSize:16 }}>Snippets</span>
        </button>
        <span style={{ fontSize:15, fontWeight:700, color:"var(--text)", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{snip.title}</span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onAdd} style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button onClick={onDots} style={{ background:"none", border:"none", cursor:"pointer" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--bg2)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text2)"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </div>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ padding:"10px 14px 0", background:"var(--bg)" }}>
        <div style={{ background:"var(--bg2)", borderRadius:10, padding:3, display:"flex", border:"1px solid var(--border2)" }}>
          {(["about","code"] as MainTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:"7px 0", borderRadius:8, border:"none", cursor:"pointer",
              fontSize:14, fontWeight: tab===t ? 700 : 500,
              background: tab===t ? "var(--accent)" : "transparent",
              color: tab===t ? "#000" : "var(--text2)",
              transition:"background 0.2s",
            }}>
              {t === "about" ? "About" : "Code" + (blocks.length > 1 ? " (" + blocks.length + ")" : "")}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", paddingBottom:40 }}>

        {/* ABOUT TAB */}
        {tab === "about" && (
          <div style={{ padding:"16px" }}>
            <div style={{ background:"var(--bg2)", borderRadius:14, padding:14, marginBottom:12, border:"1px solid var(--border2)", display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ width:48, height:48, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#000", background:avColor(snip.title), flexShrink:0 }}>
                {initials(snip.title)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <h1 style={{ fontSize:19, fontWeight:800, margin:"0 0 6px", color:"var(--text)", letterSpacing:"-0.02em" }}>{snip.title}</h1>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:catColor+"22", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, color:catColor }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:catColor }} />{snip.category}
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:typeInfo.color+"22", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, color:typeInfo.color }}>
                    {typeInfo.icon} {typeInfo.label}
                  </div>
                </div>
              </div>
            </div>

            {snip.description && (
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"12px 14px", marginBottom:12 }}>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, marginBottom:6, letterSpacing:"0.1em" }}>
                  {snippetType === "instructie" ? "INSTRUCTIE" : "BESCHRIJVING"}
                </div>
                <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.6, margin:0, whiteSpace:"pre-wrap" }}>{snip.description}</p>
              </div>
            )}

            {snip.tags?.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                {snip.tags.map(t => (
                  <span key={t} style={{ background:"var(--bg3)", color:"var(--text3)", padding:"3px 10px", borderRadius:20, fontSize:12, border:"1px solid var(--border2)" }}>#{t}</span>
                ))}
              </div>
            )}

            <button onClick={() => copyAction("alles")} style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              width:"100%", padding:"12px", borderRadius:12, border:"1px solid var(--border2)",
              background: copyState === "alles" ? "var(--green)" : "var(--bg2)",
              color: copyState === "alles" ? "#fff" : "var(--text2)",
              fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:10, transition:"background 0.2s",
            }}>
              {copyState === "alles" ? "✓ Gekopieerd!" : "⎘ Kopieer Alles (markdown)"}
            </button>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={onFav} style={{ flex:1, padding:"11px 8px", borderRadius:12, background: snip.favorite ? "var(--accent)" : "var(--bg2)", border:"1px solid var(--border2)", cursor:"pointer", fontSize:13, fontWeight:700, color: snip.favorite ? "#000" : "var(--text2)" }}>
                {snip.favorite ? "★ Favoriet" : "☆ Favoriet"}
              </button>
              <button onClick={onShare} style={{ flex:1, padding:"11px 8px", borderRadius:12, background:"var(--bg2)", border:"1px solid var(--border2)", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--text2)" }}>↗ Delen</button>
              <button onClick={onExport} style={{ flex:1, padding:"11px 8px", borderRadius:12, background:"var(--bg2)", border:"1px solid var(--border2)", cursor:"pointer", fontSize:13, fontWeight:700, color:"var(--text2)" }}>↓ Export</button>
            </div>
          </div>
        )}

        {/* CODE TAB */}
        {tab === "code" && (
          <div style={{ padding:"0 0 12px" }}>

            {/* Horizontale file tabs */}
            {blocks.length > 1 && (
              <div style={{ display:"flex", gap:6, padding:"10px 12px 0", overflowX:"auto", WebkitOverflowScrolling:"touch" } as React.CSSProperties}>
                {blocks.map(block => {
                  const lang = getLang(block.filename);
                  const langColor = LANG_COLORS[lang] || "#8b949e";
                  const isActive = activeBlock?.id === block.id;
                  return (
                    <button key={block.id}
                      style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:8, border:"1px solid " + (isActive ? "var(--accent)" : "var(--border2)"), background: isActive ? "var(--accent)" + "22" : "var(--bg2)", color: isActive ? "var(--accent)" : "var(--text2)", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}
                      onClick={() => setActiveBlockId(block.id)}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:8, background: langColor + "22", color: langColor, fontFamily:"monospace" }}>{lang}</span>
                      {block.filename.length > 14 ? block.filename.slice(0, 14) + "..." : block.filename}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ padding:"10px 12px 0" }}>
              {activeBlock ? (
                <>
                  <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                    <button onClick={() => copyAction("code", activeBlock.id)} style={{
                      flex:2, display:"flex", alignItems:"center", justifyContent:"center",
                      gap:8, padding:"12px", borderRadius:12, border:"none",
                      background: copyState === activeBlock.id ? "var(--green)" : "var(--accent)",
                      color: copyState === activeBlock.id ? "#fff" : "#000",
                      fontSize:14, fontWeight:700, cursor:"pointer", transition:"background 0.2s",
                    }}>
                      {copyState === activeBlock.id ? "✓ Gekopieerd!" : "⎘ Kopieer " + (activeBlock.filename.length > 16 ? activeBlock.filename.slice(0,16) + "..." : activeBlock.filename)}
                    </button>
                    <button onClick={() => setFullScreen(true)} style={{ flex:1, padding:"12px", borderRadius:12, border:"1px solid var(--border2)", background:"var(--bg2)", fontSize:13, fontWeight:600, cursor:"pointer", color:"var(--text2)" }}>
                      ⛶ Volledig
                    </button>
                  </div>
                  <CodeViewer code={activeBlock.code} filename={activeBlock.filename} />
                </>
              ) : (
                <div style={{ padding:"40px 20px", textAlign:"center", color:"var(--text3)" }}>Geen code blokken</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ACTION SHEET */}
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
            <button style={{ width:"100%", padding:18, background:"var(--bg2)", border:"1px solid var(--border2)", color:"var(--accent)", fontSize:17, fontWeight:700, cursor:"pointer", borderRadius:14 }} onClick={onCloseSheet}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
