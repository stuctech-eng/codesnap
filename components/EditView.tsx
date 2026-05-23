"use client";
import { useState, useRef, useEffect } from "react";
import { Snippet, SnippetType, CodeBlock } from "@/lib/types";
import { loadCustomCats, saveCustomCats } from "@/lib/db";

const ALL_CATS = ["AI Prompts","Snippets","Config","UI","Machines","Ideeën"];

const ALL_TAGS = [
  "react","next.js","typescript","javascript",
  "html","css","tailwind","python",
  "firebase","supabase","api","sql",
  "prompt","claude","gpt","config",
  "ui","setup","auth","pwa",
  "debug","node","bash","json",
];

const FILE_TEMPLATES = [
  "index.html","style.css","script.js",
  "app.tsx","page.tsx","layout.tsx","component.tsx",
  "package.json",".env","README.md",
  "next.config.js","tsconfig.json","tailwind.config.js",
  "globals.css","middleware.ts",
  "firebase.ts","supabase.ts",
  "schema.sql","queries.sql",
  ".gitignore",".eslintrc.json",
  "Dockerfile","requirements.txt",
];

const LANG_COLORS: Record<string,string> = {
  html:"#e34c26", css:"#264de4", js:"#f7df1e",
  ts:"#3178c6", tsx:"#3178c6", jsx:"#61dafb",
  json:"#10b981", sql:"#336791", py:"#3572A5",
  md:"#6b7280", env:"#ef4444", sh:"#89e051",
  code:"#8b949e",
};

function getLang(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const map: Record<string,string> = {
    html:"html", css:"css", js:"js", ts:"ts",
    tsx:"tsx", jsx:"jsx", json:"json", sql:"sql",
    py:"python", md:"md", env:"env", sh:"bash",
    code:"code",
  };
  return map[ext] || ext || "code";
}

function detectType(codeBlocks: CodeBlock[], description: string): SnippetType {
  if (codeBlocks.length === 0 && description.trim()) return "prompt";
  if (codeBlocks.length > 0 && description.trim()) return "instructie";
  return "code";
}

const uid = () => Math.random().toString(36).slice(2, 8);

interface Props {
  snip: Snippet | null;
  theme: "dark"|"light";
  onSave: (data: Omit<Snippet,"id">) => void;
  onCancel: () => void;
}

type Field = "title"|"description"|"notes"|null;
type PopupType = "categorie"|"tags"|"bestand"|null;

export default function EditView({ snip, theme, onSave, onCancel }: Props) {
  const isNew = !snip;
  const [form, setForm] = useState({
    title: snip?.title || "",
    description: snip?.description || "",
    code: snip?.code || "",
    notes: snip?.notes || "",
    snippetType: (snip?.snippetType || "code") as SnippetType,
    category: snip?.category || ALL_CATS[0],
    tags: snip?.tags || [] as string[],
    favorite: snip?.favorite || false,
    codeBlocks: snip?.codeBlocks || [] as CodeBlock[],
  });

  const [activeField, setActiveField] = useState<Field>(null);
  const [editingBlockId, setEditingBlockId] = useState<string|null>(null);
  const [renamingBlock, setRenamingBlock] = useState<{ id: string; name: string }|null>(null);
  const [showPopup, setShowPopup] = useState<PopupType>(null);
  const [newTag, setNewTag] = useState("");
  const [newCat, setNewCat] = useState("");
  const [newFilename, setNewFilename] = useState("");
  const [customCats, setCustomCats] = useState<string[]>([]);

  useEffect(() => {
    loadCustomCats().then(cats => setCustomCats(cats));
  }, []);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleTag = (tag: string) => {
    const cur = form.tags;
    if (cur.includes(tag)) set("tags", cur.filter(t => t !== tag));
    else set("tags", [...cur, tag]);
  };

  const addCustomTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setNewTag("");
  };

  const addCustomCat = async () => {
    const c = newCat.trim();
    if (!c) return;
    const updated = customCats.includes(c) ? customCats : [...customCats, c];
    setCustomCats(updated);
    await saveCustomCats(updated);
    set("category", c);
    setNewCat("");
    setShowPopup(null);
  };

  const deleteCustomCat = async (cat: string) => {
    const updated = customCats.filter(c => c !== cat);
    setCustomCats(updated);
    await saveCustomCats(updated);
    if (form.category === cat) set("category", ALL_CATS[0]);
  };

  const addCodeBlock = (filename: string) => {
    const block: CodeBlock = { id: uid(), filename, code: "" };
    setForm(f => ({ ...f, codeBlocks: [...f.codeBlocks, block] }));
    setShowPopup(null);
    setNewFilename("");
    setEditingBlockId(block.id);
  };

  const updateBlock = (id: string, code: string) => {
    setForm(f => ({ ...f, codeBlocks: f.codeBlocks.map(b => b.id === id ? { ...b, code } : b) }));
  };

  const renameBlock = (id: string, filename: string) => {
    setForm(f => ({ ...f, codeBlocks: f.codeBlocks.map(b => b.id === id ? { ...b, filename } : b) }));
    setRenamingBlock(null);
  };

  const deleteBlock = (id: string) => {
    setForm(f => ({ ...f, codeBlocks: f.codeBlocks.filter(b => b.id !== id) }));
  };

  const save = () => {
    if (!form.title.trim()) { alert("Titel is verplicht"); return; }
    const autoType = detectType(form.codeBlocks, form.description);
    onSave({ ...form, snippetType: autoType });
  };

  if (activeField) {
    return (
      <FullScreenField
        label={activeField === "title" ? "TITEL" : activeField === "description" ? "BESCHRIJVING" : "NOTITIES"}
        value={form[activeField] as string}
        isCode={false}
        onDone={(val) => { set(activeField, val); setActiveField(null); }}
        onCancel={() => setActiveField(null)}
        onNextBestand={null}
      />
    );
  }

  if (editingBlockId) {
    const block = form.codeBlocks.find(b => b.id === editingBlockId);
    if (block) {
      return (
        <FullScreenField
          label={block.filename.toUpperCase()}
          value={block.code}
          isCode={true}
          onDone={(val) => { updateBlock(block.id, val); setEditingBlockId(null); }}
          onCancel={() => setEditingBlockId(null)}
          onNextBestand={(currentText) => {
            updateBlock(block.id, currentText);
            setEditingBlockId(null);
            setTimeout(() => setShowPopup("bestand"), 100);
          }}
        />
      );
    }
  }

  const allCats = [...ALL_CATS, ...customCats];

  const FieldRow = ({ label, field, preview }: { label: string; field: Field; preview: string; }) => (
    <button
      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"13px 14px", width:"100%", cursor:"pointer", marginBottom:12, boxSizing:"border-box", textAlign:"left" }}
      onClick={() => setActiveField(field)}
    >
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:5 }}>{label}</div>
        <div style={{ fontSize:15, color: preview ? "var(--text)" : "var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight: preview ? 500 : 400 }}>
          {preview || "Tik om in te voeren..."}
        </div>
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginLeft:10 }}>
        <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--bg)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 16px 12px", background:"var(--bg)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:10 }}>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer", minWidth:60 }} onClick={onCancel}>Cancel</button>
        <span style={{ fontSize:17, fontWeight:600, color:"var(--text)" }}>{isNew ? "Add Snippet" : "Edit Snippet"}</span>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, fontWeight:700, cursor:"pointer", minWidth:60, textAlign:"right" }} onClick={save}>Save</button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 60px" }}>
        <FieldRow label="TITEL" field="title" preview={form.title} />
        <FieldRow label="BESCHRIJVING" field="description" preview={form.description} />
        <FieldRow label="NOTITIES" field="notes" preview={form.notes ? form.notes.slice(0,60) + (form.notes.length > 60 ? "..." : "") : ""} />

        {/* CODE BLOKKEN */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:8, paddingLeft:2 }}>
            CODE {form.codeBlocks.length > 0 && <span style={{ color:"var(--accent)" }}>· {form.codeBlocks.length} {form.codeBlocks.length === 1 ? "bestand" : "bestanden"}</span>}
          </div>
          {form.codeBlocks.length === 0 ? (
            <button style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, width:"100%", padding:"20px", borderRadius:12, border:"1px dashed var(--border2)", background:"transparent", cursor:"pointer" }}
              onClick={() => setShowPopup("bestand")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:15, color:"var(--accent)", fontWeight:700 }}>Bestand toevoegen</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Tik om code blok te starten</div>
              </div>
            </button>
          ) : (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:8 }}>
                {form.codeBlocks.map((block, index) => {
                  const lang = getLang(block.filename);
                  const langColor = LANG_COLORS[lang] || "#8b949e";
                  return (
                    <div key={block.id} style={{ display:"flex", gap:8, alignItems:"stretch" }}>
                      <button style={{ flex:1, display:"flex", alignItems:"center", gap:10, background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"12px 14px", cursor:"pointer", textAlign:"left" }}
                        onClick={() => setEditingBlockId(block.id)}>
                        <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, flexShrink:0, width:16 }}>{index + 1}</div>
                        <div style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20, background: langColor + "22", color: langColor, flexShrink:0, fontFamily:"monospace" }}>{lang}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, color:"var(--accent)", fontWeight:700, fontFamily:"monospace", marginBottom:2 }}>{block.filename}</div>
                          <div style={{ fontSize:12, color:"var(--text3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {block.code ? block.code.split("\n").length + " regels · " + block.code.length + " tekens" : "Leeg — tik om te bewerken"}
                          </div>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0 }}><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                      <button style={{ width:40, borderRadius:12, background:"var(--bg2)", border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
                        onClick={() => setRenamingBlock({ id: block.id, name: block.filename })}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button style={{ width:40, borderRadius:12, background:"var(--red)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
                        onClick={() => deleteBlock(block.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
              <button style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"11px", borderRadius:12, border:"1px dashed var(--border2)", background:"transparent", color:"var(--accent)", fontSize:13, fontWeight:700, cursor:"pointer" }}
                onClick={() => setShowPopup("bestand")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Bestand toevoegen
              </button>
            </>
          )}
        </div>

        {/* CATEGORIE */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:6, paddingLeft:2 }}>CATEGORIE</div>
          <button style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"13px 14px", width:"100%", cursor:"pointer", boxSizing:"border-box" }}
            onClick={() => setShowPopup("categorie")}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--accent)", flexShrink:0 }} />
              <span style={{ fontSize:15, color:"var(--text)", fontWeight:600 }}>{form.category}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        {/* TAGS */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:6, paddingLeft:2 }}>TAGS</div>
          <button style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"12px 14px", width:"100%", cursor:"pointer", boxSizing:"border-box", minHeight:48 }}
            onClick={() => setShowPopup("tags")}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, flex:1 }}>
              {form.tags.length === 0
                ? <span style={{ fontSize:15, color:"var(--text3)", lineHeight:"24px" }}>Tik om tags te kiezen...</span>
                : form.tags.map(t => <span key={t} style={{ background:"var(--accent)", color:"#000", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700 }}>#{t}</span>)
              }
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:6, marginLeft:8 }}><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        {/* FAVORIET */}
        <button style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--bg2)", borderRadius:14, padding:"14px 16px", border:"1px solid var(--border2)", width:"100%", cursor:"pointer", marginBottom:20, boxSizing:"border-box" }}
          onClick={() => set("favorite", !form.favorite)}>
          <span style={{ color:"var(--text)", fontSize:15, fontWeight:500 }}>Markeer als favoriet</span>
          <div style={{ width:46, height:26, borderRadius:13, position:"relative", background: form.favorite ? "var(--accent)" : "var(--bg3)", transition:"background 0.25s", flexShrink:0 }}>
            <div style={{ position:"absolute", top:3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"transform 0.25s", transform: form.favorite ? "translateX(22px)" : "translateX(2px)" }} />
          </div>
        </button>

        <button style={{ width:"100%", padding:16, background:"var(--accent)", borderRadius:14, border:"none", color:"#000", fontSize:17, fontWeight:700, cursor:"pointer" }} onClick={save}>
          {isNew ? "Snippet Opslaan" : "Wijzigingen Opslaan"}
        </button>
      </div>

      {/* HERNOEM POPUP */}
      {renamingBlock && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:400, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8px 34px" }}
          onClick={() => setRenamingBlock(null)}>
          <div style={{ background:"var(--bg2)", borderRadius:16, overflow:"hidden", border:"1px solid var(--border2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border2)" }}>
              <span style={{ fontSize:16, fontWeight:700, color:"var(--text)" }}>Bestand hernoemen</span>
              <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"6px 14px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
                onClick={() => renameBlock(renamingBlock.id, renamingBlock.name)}>Opslaan</button>
            </div>
            <div style={{ padding:"16px" }}>
              <input autoFocus
                style={{ width:"100%", boxSizing:"border-box", background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:10, color:"var(--text)", fontSize:16, padding:"12px 14px", outline:"none", fontFamily:"monospace" }}
                value={renamingBlock.name}
                onChange={e => setRenamingBlock({ ...renamingBlock, name: e.target.value })}
                onKeyDown={e => { if (e.key === "Enter") renameBlock(renamingBlock.id, renamingBlock.name); }}
              />
              <p style={{ fontSize:12, color:"var(--text3)", margin:"8px 0 0" }}>Bijv: index.html, style.css, app.tsx</p>
            </div>
          </div>
        </div>
      )}

      {/* BESTAND POPUP */}
      {showPopup === "bestand" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8px 34px" }}
          onClick={() => setShowPopup(null)}>
          <div style={{ background:"var(--bg2)", borderRadius:16, overflow:"hidden", border:"1px solid var(--border2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border2)" }}>
              <span style={{ fontSize:16, fontWeight:700, color:"var(--text)" }}>Bestand kiezen</span>
              <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"6px 14px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
                onClick={() => setShowPopup(null)}>Annuleer</button>
            </div>
            <div style={{ maxHeight:320, overflowY:"auto" }}>
              {FILE_TEMPLATES.map(file => {
                const lang = getLang(file);
                const langColor = LANG_COLORS[lang] || "#8b949e";
                const alreadyAdded = form.codeBlocks.some(b => b.filename === file);
                return (
                  <button key={file}
                    style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"12px 16px", background: alreadyAdded ? "var(--bg3)" : "transparent", border:"none", cursor: alreadyAdded ? "default" : "pointer", borderBottom:"1px solid var(--border)", opacity: alreadyAdded ? 0.5 : 1 }}
                    onClick={() => { if (!alreadyAdded) addCodeBlock(file); }}>
                    <div style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20, background: langColor + "22", color: langColor, flexShrink:0, fontFamily:"monospace", minWidth:36, textAlign:"center" }}>{lang}</div>
                    <span style={{ fontSize:15, color:"var(--text)", fontFamily:"monospace", fontWeight:500, flex:1, textAlign:"left" }}>{file}</span>
                    {alreadyAdded && <span style={{ fontSize:11, color:"var(--text3)" }}>✓</span>}
                  </button>
                );
              })}
            </div>
            <div style={{ padding:"10px 14px 14px", borderTop:"1px solid var(--border2)" }}>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{ flex:1, background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:10, color:"var(--text)", fontSize:16, padding:"10px 12px", outline:"none", fontFamily:"monospace" }}
                  placeholder="Eigen bestandsnaam..." value={newFilename}
                  onChange={e => setNewFilename(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && newFilename.trim()) addCodeBlock(newFilename.trim()); }}
                />
                <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"10px 16px", color:"#000", fontSize:18, fontWeight:700, cursor:"pointer" }}
                  onClick={() => { if (newFilename.trim()) addCodeBlock(newFilename.trim()); }}>+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIE POPUP */}
      {showPopup === "categorie" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8px 34px" }}
          onClick={() => setShowPopup(null)}>
          <div style={{ background:"var(--bg2)", borderRadius:16, overflow:"hidden", border:"1px solid var(--border2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border2)" }}>
              <span style={{ fontSize:16, fontWeight:700, color:"var(--text)" }}>Categorie kiezen</span>
              <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"6px 14px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
                onClick={() => setShowPopup(null)}>Klaar</button>
            </div>
            <div style={{ maxHeight:300, overflowY:"auto" }}>
              {allCats.map(cat => (
                <button key={cat}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"14px 16px", background: form.category===cat ? "var(--bg3)" : "transparent", border:"none", cursor:"pointer", borderBottom:"1px solid var(--border)" }}
                  onClick={() => { set("category", cat); setShowPopup(null); }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background: form.category===cat ? "var(--accent)" : "var(--border2)", flexShrink:0 }} />
                    <span style={{ fontSize:15, color:"var(--text)", fontWeight: form.category===cat ? 700 : 400 }}>{cat}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {form.category===cat && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {customCats.includes(cat) && (
                      <button style={{ background:"var(--red)", border:"none", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
                        onClick={e => { e.stopPropagation(); deleteCustomCat(cat); }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ padding:"10px 14px 14px", borderTop:"1px solid var(--border2)" }}>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{ flex:1, background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:10, color:"var(--text)", fontSize:16, padding:"10px 12px", outline:"none" }}
                  placeholder="Nieuwe categorie..." value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addCustomCat(); }}
                />
                <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"10px 16px", color:"#000", fontSize:18, fontWeight:700, cursor:"pointer" }}
                  onClick={addCustomCat}>+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAGS POPUP */}
      {showPopup === "tags" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8px 34px" }}
          onClick={() => setShowPopup(null)}>
          <div style={{ background:"var(--bg2)", borderRadius:16, overflow:"hidden", border:"1px solid var(--border2)", maxHeight:"70vh", display:"flex", flexDirection:"column" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border2)", flexShrink:0 }}>
              <span style={{ fontSize:16, fontWeight:700, color:"var(--text)" }}>Tags kiezen</span>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {form.tags.length > 0 && <span style={{ fontSize:12, color:"var(--accent)", fontWeight:600 }}>{form.tags.length} geselecteerd</span>}
                <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"6px 14px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
                  onClick={() => setShowPopup(null)}>Klaar</button>
              </div>
            </div>
            <div style={{ flex:1, overflowY:"auto" }}>
              {form.tags.length > 0 && (
                <>
                  {form.tags.map(tag => (
                    <button key={tag}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"12px 16px", background:"var(--bg3)", border:"none", cursor:"pointer", borderBottom:"1px solid var(--border)" }}
                      onClick={() => toggleTag(tag)}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--accent)", flexShrink:0 }} />
                        <span style={{ fontSize:15, color:"var(--text)", fontWeight:700 }}>#{tag}</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  ))}
                  <div style={{ height:1, background:"var(--border2)" }} />
                </>
              )}
              {ALL_TAGS.filter(t => !form.tags.includes(t)).map(tag => (
                <button key={tag}
                  style={{ display:"flex", alignItems:"center", width:"100%", padding:"12px 16px", background:"transparent", border:"none", cursor:"pointer", borderBottom:"1px solid var(--border)" }}
                  onClick={() => toggleTag(tag)}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--border2)", flexShrink:0 }} />
                    <span style={{ fontSize:15, color:"var(--text)", fontWeight:400 }}>#{tag}</span>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ padding:"10px 14px 14px", borderTop:"1px solid var(--border2)", flexShrink:0, background:"var(--bg2)" }}>
              <div style={{ display:"flex", gap:8 }}>
                <input style={{ flex:1, background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:10, color:"var(--text)", fontSize:16, padding:"10px 12px", outline:"none" }}
                  placeholder="Eigen tag typen..." value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addCustomTag(); }}
                />
                <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"10px 16px", color:"#000", fontSize:18, fontWeight:700, cursor:"pointer", flexShrink:0 }}
                  onClick={addCustomTag}>+</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FullScreenField({ label, value, isCode, onDone, onCancel, onNextBestand }: {
  label:string; value:string; isCode:boolean;
  onDone:(val:string)=>void; onCancel:()=>void;
  onNextBestand: ((text: string) => void) | null;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);

  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setText(prev => prev + t);
    } catch { alert("Plak handmatig met lang indrukken"); }
  };

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background: isCode ? "#0d1117" : "var(--bg)", zIndex:500, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 8px 12px", borderBottom:"1px solid " + (isCode ? "#21262d" : "var(--border)"), background: isCode ? "#161b22" : "var(--bg)", flexShrink:0 }}>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:15, cursor:"pointer", minWidth:55, textAlign:"left", paddingLeft:8 }} onClick={onCancel}>Terug</button>
        <span style={{ fontSize:14, fontWeight:600, color: isCode ? "#e6edf3" : "var(--text)", fontFamily: isCode ? "monospace" : "inherit", flex:1, textAlign:"center", padding:"0 4px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{label}</span>
        <button style={{ background:"var(--accent)", border:"none", borderRadius:8, padding:"6px 10px", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer", marginRight:4, flexShrink:0 }} onClick={() => onDone(text)}>✓</button>
      </div>
      <textarea ref={ref}
        style={{ flex:1, padding:20, fontSize:16, lineHeight: isCode ? 1.7 : 1.6, background: isCode ? "#0d1117" : "var(--bg)", border:"none", outline:"none", color: isCode ? "#d4d4d4" : "var(--text)", fontFamily: isCode ? "'Fira Code','JetBrains Mono',monospace" : "inherit", resize:"none" }}
        placeholder={isCode ? "Plak hier je code..." : "Voer " + label.toLowerCase() + " in..."}
        value={text} onChange={e => setText(e.target.value)}
      />
      <div style={{ padding:"10px 16px 34px", background: isCode ? "#0d1117" : "var(--bg)", borderTop:"1px solid " + (isCode ? "#21262d" : "var(--border)"), display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexShrink:0 }}>
        <span style={{ fontSize:12, color: isCode ? "#484f58" : "var(--text3)", flexShrink:0 }}>{text.split("\n").length} regels · {text.length} tekens</span>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:10, padding:"8px 14px", color:"var(--text2)", fontSize:13, fontWeight:700, cursor:"pointer" }}
            onClick={pasteFromClipboard}>⎘ Plak</button>
          {isCode && onNextBestand && (
            <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"8px 14px", color:"#000", fontSize:13, fontWeight:700, cursor:"pointer" }}
              onClick={() => onNextBestand(text)}>+ Volgend</button>
          )}
        </div>
      </div>
    </div>
  );
}
