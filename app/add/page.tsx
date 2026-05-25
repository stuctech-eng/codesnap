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
    <EditView
      snip={prefillSnip}
      theme={theme}
      onSave={async (data) => {
        await addSnippet(data);
        setSaved(true);
      }}
      onCancel={() => { window.location.href = "/"; }}
    />
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
