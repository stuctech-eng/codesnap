"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { addSnippet } from "@/lib/db";
import { Snippet } from "@/lib/types";
import dynamic from "next/dynamic";

const EditView = dynamic(() => import("@/components/EditView"), { ssr: false });

function AddSnippetParamsWrapper() {
 const searchParams = useSearchParams();
 const [theme] = useState<"dark"|"light">("dark");
 const [saved, setSaved] = useState(false);
 const [codeCopied, setCodeCopied] = useState(false);

 const rawTags = searchParams.get("tags") || "";
 const tags = rawTags ? rawTags.split(",").map(t => t.trim()).filter(Boolean) : [];
 const code = searchParams.get("code") || "";
 const bestand = searchParams.get("bestand") || "snippet.tsx";

 const prefillSnip: Snippet = {
   title:       searchParams.get("titel") || "",
   description: searchParams.get("beschrijving") || "",
   category:    searchParams.get("categorie") || "Snippets",
   tags,
   code,
   codeBlocks: code ? [{ id: "prefill", filename: bestand, code }] : [],
   notes:       searchParams.get("notities") || "",
   favorite:    false,
 };

 useEffect(() => {
   document.documentElement.setAttribute("data-theme", theme);
 }, [theme]);

 const copyCodeToClipboard = async () => {
   try {
     await navigator.clipboard.writeText(code);
     setCodeCopied(true);
     setTimeout(() => setCodeCopied(false), 2000);
   } catch {
     alert("Kon niet kopiëren -- plak handmatig");
   }
 };

 if (saved) {
   return (
     <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"var(--bg)", gap:16 }}>
       <div style={{ fontSize:48 }}>✅</div>
       <p style={{ fontSize:20, fontWeight:700, color:"var(--text)" }}>Snippet opgeslagen!</p>
       <a href="/" style={{ color:"var(--accent)", fontSize:16, fontWeight:600 }}>← Terug naar CodeSnap</a>
     </div>
   );
 }

 return (
   <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:"var(--bg)" }}>

     {/* CLIPBOARD KNOP */}
     {code && (
       <div style={{ padding:"60px 16px 0" }}>
         <button
           style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, width:"100%", padding:"14px", borderRadius:14, background: codeCopied ? "var(--green)" : "var(--accent)", border:"none", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", transition:"background 0.2s" }}
           onClick={copyCodeToClipboard}
         >
           {codeCopied ? "✓ Code gekopieerd!" : "📋 Kopieer code naar klembord"}
         </button>
         <p style={{ fontSize:12, color:"var(--text3)", textAlign:"center", margin:"8px 0 0" }}>
           Tik eerst hierop -- dan invullen en opslaan
         </p>
       </div>
     )}

     <EditView
       snip={prefillSnip}
       theme={theme}
       onSave={async (data) => {
         await addSnippet(data);
         setSaved(true);
       }}
       onCancel={() => { window.location.href = "/"; }}
     />
   </div>
 );
}

export default function AddPage() {
 return (
   <Suspense fallback={
     <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#0d1117", color:"#e6edf3", fontSize:16 }}>
       Laden...
     </div>
   }>
     <AddSnippetParamsWrapper />
   </Suspense>
 );
}
