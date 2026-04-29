"use client";
import { useState, useRef, useEffect } from "react";
import { Snippet, SnippetType } from "@/lib/types";

const TYPES: { value: SnippetType; label: string; icon: string; desc: string }[] = [
  { value:"code",       icon:"🔧", label:"Code Snippet",      desc:"Pure code om te gebruiken" },
  { value:"prompt",     icon:"🤖", label:"AI Prompt",         desc:"Prompt voor Claude/GPT/Gemini" },
  { value:"instructie", icon:"📋", label:"Instructie + Code", desc:"Uitleg met bijbehorende code" },
];

const ALL_CATS = ["AI Prompts","Snippets","Config","UI","Machines","Ideeën"];

const ALL_TAGS = [
  "react","next.js","typescript","javascript",
  "html","css","tailwind","python",
  "firebase","supabase","api","sql",
  "prompt","claude","gpt","config",
  "ui","setup","auth","pwa",
  "debug","node","bash","json",
];

interface Props {
  snip: Snippet | null;
  theme: "dark"|"light";
  onSave: (data: Omit<Snippet,"id">) => void;
  onCancel: () => void;
}

type Field = "title"|"description"|"code"|"notes"|null;
type PopupType = "categorie"|"tags"|null;

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
  });
  const [activeField, setActiveField] = useState<Field>(null);
  const [showPopup, setShowPopup] = useState<PopupType>(null);
  const [newTag, setNewTag] = useState("");
  const [newCat, setNewCat] = useState("");
  const [customCats, setCustomCats] = useState<string[]>([]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleTag = (tag: string) => {
    const cur = form.tags;
    if (cur.includes(tag)) {
      set("tags", cur.filter(t => t !== tag));
    } else {
      set("tags", [...cur, tag]);
    }
  };

  const addCustomTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      set("tags", [...form.tags, t]);
    }
    setNewTag("");
  };

  const addCustomCat = () => {
    const c = newCat.trim();
    if (c && !ALL_CATS.includes(c) && !customCats.includes(c)) {
      setCustomCats(prev => [...prev, c]);
      set("category", c);
    }
    setNewCat("");
  };

  const save = () => {
    if (!form.title.trim()) { alert("Titel is verplicht"); return; }
    onSave({ ...form });
  };

  if (activeField) {
    return (
      <FullScreenField
        label={activeField.toUpperCase()}
        value={form[activeField] as string}
        isCode={activeField === "code"}
        onDone={(val) => { set(activeField, val); setActiveField(null); }}
        onCancel={() => setActiveField(null)}
      />
    );
  }

  const allCats = [...ALL_CATS, ...customCats];

  const fieldRow = (label: string, field: Field, preview: string) => (
    <button key={field}
      style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:4, background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:14, padding:"14px 16px", width:"100%", cursor:"pointer", marginBottom:12, boxSizing:"border-box" }}
      onClick={() => setActiveField(field)}
    >
      <span style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em" }}>{label} ›</span>
      <span style={{ fontSize:15, textAlign:"left", lineHeight:1.4, color: preview ? "var(--text)" : "var(--text3)", fontFamily: field === "code" ? "monospace" : "inherit", wordBreak:"break-all" }}>
        {preview || "Tik om " + label.toLowerCase() + " in te voeren..."}
      </span>
    </button>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--bg)" }}>

      {/* NAV */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 16px 12px", background:"var(--bg)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:10 }}>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer" }} onClick={onCancel}>Cancel</button>
        <span style={{ fontSize:17, fontWeight:600, color:"var(--text)" }}>{isNew ? "Add Snippet" : "Edit Snippet"}</span>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, fontWeight:700, cursor:"pointer" }} onClick={save}>Save</button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 60px" }}>

        {/* TYPE */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:8, paddingLeft:2 }}>TYPE</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TYPES.map(t => (
              <button key={t.value}
                style={{ display:"flex", alignItems:"center", gap:12, background: form.snippetType===t.value ? "var(--accent)" : "var(--bg2)", border:"1px solid " + (form.snippetType===t.value ? "var(--accent)" : "var(--border2)"), borderRadius:12, padding:"12px 14px", cursor:"pointer", textAlign:"left" }}
                onClick={() => set("snippetType", t.value)}
              >
                <span style={{ fontSize:22 }}>{t.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color: form.snippetType===t.value ? "#000" : "var(--text)" }}>{t.label}</div>
                  <div style={{ fontSize:12, color: form.snippetType===t.value ? "#000" : "var(--text3)", marginTop:2 }}>{t.desc}</div>
                </div>
                {form.snippetType===t.value && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {fieldRow("TITEL", "title", form.title)}
        {fieldRow("BESCHRIJVING", "description", form.description)}
        {fieldRow("CODE", "code", form.code ? form.code.slice(0,80) + (form.code.length > 80 ? "..." : "") : "")}
        {fieldRow("NOTITIES", "notes", form.notes ? form.notes.slice(0,80) + (form.notes.length > 80 ? "..." : "") : "")}

        {/* CATEGORIE */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:6, paddingLeft:2 }}>CATEGORIE</div>
          <button
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"13px 14px", width:"100%", cursor:"pointer", boxSizing:"border-box" }}
            onClick={() => setShowPopup("categorie")}
          >
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--accent)" }} />
              <span style={{ fontSize:15, color:"var(--text)", fontWeight:600 }}>{form.category}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>

        {/* TAGS */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:6, paddingLeft:2 }}>TAGS</div>
          <button
            style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"12px 14px", width:"100%", cursor:"pointer", boxSizing:"border-box", minHeight:48 }}
            onClick={() => setShowPopup("tags")}
          >
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, flex:1 }}>
              {form.tags.length === 0
                ? <span style={{ fontSize:15, color:"var(--text3)", lineHeight:"24px" }}>Tik om tags te kiezen...</span>
                : form.tags.map(t => (
                  <span key={t} style={{ background:"var(--accent)", color:"#000", padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700 }}>
                    #{t}
                  </span>
                ))
              }
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:6, marginLeft:8 }}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>

        {/* FAVORIET */}
        <button
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--bg2)", borderRadius:14, padding:"14px 16px", border:"1px solid var(--border2)", width:"100%", cursor:"pointer", marginBottom:20, boxSizing:"border-box" }}
          onClick={() => set("favorite", !form.favorite)}
        >
          <span style={{ color:"var(--text2)", fontSize:15 }}>Markeer als favoriet</span>
          <div style={{ width:46, height:26, borderRadius:13, position:"relative", background: form.favorite ? "var(--accent)" : "var(--bg3)", transition:"background 0.25s", flexShrink:0 }}>
            <div style={{ position:"absolute", top:3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"transform 0.25s", transform: form.favorite ? "translateX(22px)" : "translateX(2px)" }} />
          </div>
        </button>

        <button
          style={{ width:"100%", padding:16, background:"var(--accent)", borderRadius:14, border:"none", color:"#000", fontSize:17, fontWeight:700, cursor:"pointer" }}
          onClick={save}
        >
          {isNew ? "Snippet Opslaan" : "Wijzigingen Opslaan"}
        </button>
      </div>

      {/* CATEGORIE POPUP */}
      {showPopup === "categorie" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8px 34px" }}
          onClick={() => setShowPopup(null)}>
          <div style={{ background:"var(--bg2)", borderRadius:16, overflow:"hidden", border:"1px solid var(--border2)" }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border2)" }}>
              <span style={{ fontSize:16, fontWeight:700, color:"var(--text)" }}>Categorie kiezen</span>
              <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"6px 14px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
                onClick={() => setShowPopup(null)}>
                Klaar
              </button>
            </div>

            {/* Lijst */}
            <div style={{ maxHeight:300, overflowY:"auto" }}>
              {allCats.map(cat => (
                <button key={cat}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"14px 16px", background: form.category===cat ? "var(--bg3)" : "transparent", border:"none", cursor:"pointer", borderBottom:"1px solid var(--border)" }}
                  onClick={() => { set("category", cat); setShowPopup(null); }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background: form.category===cat ? "var(--accent)" : "var(--border2)" }} />
                    <span style={{ fontSize:15, color:"var(--text)", fontWeight: form.category===cat ? 700 : 400 }}>{cat}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {form.category===cat && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {/* Verwijder custom categorie */}
                    {customCats.includes(cat) && (
                      <button
                        style={{ background:"var(--red)", border:"none", borderRadius:20, width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
                        onClick={e => {
                          e.stopPropagation();
                          setCustomCats(prev => prev.filter(c => c !== cat));
                          if (form.category === cat) set("category", ALL_CATS[0]);
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Eigen categorie */}
            <div style={{ padding:"10px 14px 14px", borderTop:"1px solid var(--border2)" }}>
              <div style={{ display:"flex", gap:8 }}>
                <input
                  style={{ flex:1, background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:10, color:"var(--text)", fontSize:14, padding:"10px 12px", outline:"none" }}
                  placeholder="Nieuwe categorie..."
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addCustomCat(); }}
                />
                <button
                  style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"10px 16px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
                  onClick={addCustomCat}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAGS POPUP */}
      {showPopup === "tags" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:300, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8px 34px" }}
          onClick={() => setShowPopup(null)}>
          <div style={{ background:"var(--bg2)", borderRadius:16, overflow:"hidden", border:"1px solid var(--border2)" }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid var(--border2)" }}>
              <span style={{ fontSize:16, fontWeight:700, color:"var(--text)" }}>Tags kiezen</span>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {form.tags.length > 0 && (
                  <span style={{ fontSize:12, color:"var(--accent)", fontWeight:600 }}>
                    {form.tags.length} geselecteerd
                  </span>
                )}
                <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"6px 14px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
                  onClick={() => setShowPopup(null)}>
                  Klaar
                </button>
              </div>
            </div>

            {/* Geselecteerde tags met × */}
            {form.tags.length > 0 && (
              <div style={{ padding:"10px 14px", borderBottom:"1px solid var(--border2)", display:"flex", flexWrap:"wrap", gap:6 }}>
                {form.tags.map(t => (
                  <button key={t}
                    style={{ display:"flex", alignItems:"center", gap:5, background:"var(--accent)", border:"none", borderRadius:20, padding:"4px 10px", cursor:"pointer" }}
                    onClick={() => toggleTag(t)}
                  >
                    <span style={{ fontSize:12, fontWeight:700, color:"#000" }}>#{t}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Alle tags */}
            <div style={{ padding:14, display:"flex", flexWrap:"wrap", gap:8, maxHeight:220, overflowY:"auto" }}>
              {ALL_TAGS.filter(t => !form.tags.includes(t)).map(tag => (
                <button key={tag}
                  style={{ padding:"7px 14px", borderRadius:20, border:"1px solid var(--border2)", background:"var(--bg3)", color:"var(--text2)", fontSize:13, fontWeight:600, cursor:"pointer" }}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* Eigen tag */}
            <div style={{ padding:"0 14px 14px", borderTop:"1px solid var(--border2)" }}>
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <input
                  style={{ flex:1, background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:10, color:"var(--text)", fontSize:14, padding:"10px 12px", outline:"none" }}
                  placeholder="Eigen tag typen..."
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addCustomTag(); }}
                />
                <button
                  style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"10px 16px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
                  onClick={addCustomTag}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FullScreenField({ label, value, isCode, onDone, onCancel }: {
  label:string; value:string; isCode:boolean;
  onDone:(val:string)=>void; onCancel:()=>void;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);

  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setText(prev => prev + t);
    } catch {
      alert("Plak handmatig met lang indrukken");
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:500, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 16px 12px", borderBottom:"1px solid var(--border)", background:"var(--bg)" }}>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer" }} onClick={onCancel}>Annuleer</button>
        <span style={{ fontSize:17, fontWeight:600, color:"var(--text)" }}>{label}</span>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, fontWeight:700, cursor:"pointer" }} onClick={() => onDone(text)}>Klaar</button>
      </div>
      <textarea ref={ref}
        style={{ flex:1, padding:20, fontSize: isCode ? 14 : 17, lineHeight: isCode ? 1.7 : 1.6, background: isCode ? "#0d1117" : "var(--bg)", border:"none", outline:"none", color: isCode ? "#d4d4d4" : "var(--text)", fontFamily: isCode ? "'Fira Code','JetBrains Mono',monospace" : "inherit", resize:"none" }}
        placeholder={isCode ? "Plak hier je code..." : "Voer " + label.toLowerCase() + " in..."}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div style={{ padding:"10px 16px 34px", background:"var(--bg)", borderTop:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"var(--text3)" }}>
          {text.split("\n").length} regels · {text.length} tekens
        </span>
        <button style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"8px 16px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}
          onClick={pasteFromClipboard}>
          ⎘ Plak van klembord
        </button>
      </div>
    </div>
  );
}
