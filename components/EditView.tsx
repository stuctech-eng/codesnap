"use client";
import { useState, useRef, useEffect } from "react";
import { Snippet, SnippetType } from "@/lib/types";

const CATS = ["AI Prompts","Snippets","Config","UI","Machines","Ideeën"];

const TYPES: { value: SnippetType; label: string; icon: string; desc: string }[] = [
  { value:"code",       icon:"🔧", label:"Code Snippet",      desc:"Pure code om te gebruiken" },
  { value:"prompt",     icon:"🤖", label:"AI Prompt",         desc:"Prompt voor Claude/GPT/Gemini" },
  { value:"instructie", icon:"📋", label:"Instructie + Code", desc:"Uitleg met bijbehorende code" },
];

const ALL_TAGS = [
  "react","next.js","typescript","javascript","html","css",
  "firebase","supabase","api","sql","python","bash",
  "prompt","claude","gpt","gemini","ui","config",
  "setup","auth","database","deployment","mobile","pwa",
  "debug","performance","animation","tailwind","node",
];

interface Props {
  snip: Snippet | null;
  theme: "dark"|"light";
  onSave: (data: Omit<Snippet,"id">) => void;
  onCancel: () => void;
}

type Field = "title"|"description"|"code"|"tags"|"notes"|null;

export default function EditView({ snip, theme, onSave, onCancel }: Props) {
  const isNew = !snip;
  const [form, setForm] = useState({
    title: snip?.title || "",
    description: snip?.description || "",
    code: snip?.code || "",
    notes: snip?.notes || "",
    snippetType: (snip?.snippetType || "code") as SnippetType,
    category: snip?.category || CATS[0],
    tags: snip?.tags || [] as string[],
    favorite: snip?.favorite || false,
  });
  const [activeField, setActiveField] = useState<Field>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const toggleTag = (tag: string) => {
    const current = form.tags;
    if (current.includes(tag)) {
      set("tags", current.filter(t => t !== tag));
    } else {
      set("tags", [...current, tag]);
    }
  };

  const save = () => {
    if (!form.title.trim()) { alert("Titel is verplicht"); return; }
    onSave({ ...form });
  };

  if (activeField && activeField !== "tags") {
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
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"52px 16px 12px", background:"var(--bg)", borderBottom:"1px solid var(--border)", position:"sticky", top:0, zIndex:10 }}>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, cursor:"pointer" }} onClick={onCancel}>Cancel</button>
        <span style={{ fontSize:17, fontWeight:600, color:"var(--text)" }}>{isNew ? "Add Snippet" : "Edit Snippet"}</span>
        <button style={{ background:"none", border:"none", color:"var(--accent)", fontSize:17, fontWeight:700, cursor:"pointer" }} onClick={save}>Save</button>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 60px" }}>

        {/* Type */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:8, paddingLeft:2 }}>TYPE</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {TYPES.map(t => (
              <button key={t.value}
                style={{ display:"flex", alignItems:"center", gap:12, background: form.snippetType===t.value ? "var(--accent)" : "var(--bg2)", border:"1px solid " + (form.snippetType===t.value ? "var(--accent)" : "var(--border2)"), borderRadius:12, padding:"12px 14px", cursor:"pointer", textAlign:"left" }}
                onClick={() => set("snippetType", t.value)}
              >
                <span style={{ fontSize:22 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color: form.snippetType===t.value ? "#000" : "var(--text)" }}>{t.label}</div>
                  <div style={{ fontSize:12, color: form.snippetType===t.value ? "#000" : "var(--text3)", marginTop:2 }}>{t.desc}</div>
                </div>
                {form.snippetType===t.value && (
                  <svg style={{ marginLeft:"auto" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
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

        {/* Categorie */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:6, paddingLeft:2 }}>CATEGORIE</div>
          <select style={{ width:"100%", boxSizing:"border-box", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, color:"var(--text)", fontSize:16, padding:14, outline:"none" }}
            value={form.category} onChange={e => set("category", e.target.value)}>
            {CATS.map(c => <option key={c} value={c} style={{ background:"var(--bg2)" }}>{c}</option>)}
          </select>
        </div>

        {/* Tags -- popup */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", marginBottom:6, paddingLeft:2 }}>TAGS</div>
          <button
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"12px 14px", width:"100%", cursor:"pointer", boxSizing:"border-box" }}
            onClick={() => setShowTagMenu(true)}
          >
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, flex:1 }}>
              {form.tags.length === 0
                ? <span style={{ fontSize:15, color:"var(--text3)" }}>Tik om tags te kiezen...</span>
                : form.tags.map(t => (
                  <span key={t} style={{ background:"var(--bg3)", color:"var(--accent)", padding:"2px 10px", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid var(--border2)" }}>
                    #{t}
                  </span>
                ))
              }
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginLeft:8 }}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Favoriet */}
        <button style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"var(--bg2)", borderRadius:14, padding:"14px 16px", border:"1px solid var(--border2)", width:"100%", cursor:"pointer", marginBottom:20, boxSizing:"border-box" }}
          onClick={() => set("favorite", !form.favorite)}>
          <span style={{ color:"var(--text2)", fontSize:15 }}>Markeer als favoriet</span>
          <div style={{ width:46, height:26, borderRadius:13, position:"relative", background: form.favorite ? "var(--accent)" : "var(--bg3)", transition:"background 0.25s", flexShrink:0 }}>
            <div style={{ position:"absolute", top:3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"transform 0.25s", transform: form.favorite ? "translateX(22px)" : "translateX(2px)" }} />
          </div>
        </button>

        <button style={{ width:"100%", padding:16, background:"var(--accent)", borderRadius:14, border:"none", color:"#000", fontSize:17, fontWeight:700, cursor:"pointer" }} onClick={save}>
          {isNew ? "Snippet Opslaan" : "Wijzigingen Opslaan"}
        </button>
      </div>

      {/* TAG POPUP */}
      {showTagMenu && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 8px 34px" }}
          onClick={() => setShowTagMenu(false)}>
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
                  onClick={() => setShowTagMenu(false)}>
                  Klaar
                </button>
              </div>
            </div>
            {/* Tags grid */}
            <div style={{ padding:14, display:"flex", flexWrap:"wrap", gap:8, maxHeight:300, overflowY:"auto" }}>
              {ALL_TAGS.map(tag => (
                <button key={tag}
                  style={{ padding:"7px 14px", borderRadius:20, border:"1px solid " + (form.tags.includes(tag) ? "var(--accent)" : "var(--border2)"), background: form.tags.includes(tag) ? "var(--accent)" : "var(--bg3)", color: form.tags.includes(tag) ? "#000" : "var(--text2)", fontSize:13, fontWeight:600, cursor:"pointer" }}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
            {/* Eigen tag typen */}
            <div style={{ padding:"0 14px 14px" }}>
              <input
                style={{ width:"100%", boxSizing:"border-box", background:"var(--bg3)", border:"1px solid var(--border2)", borderRadius:10, color:"var(--text)", fontSize:14, padding:"10px 12px", outline:"none" }}
                placeholder="Eigen tag typen + Enter"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim().toLowerCase();
                    if (val && !form.tags.includes(val)) {
                      set("tags", [...form.tags, val]);
                    }
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
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
