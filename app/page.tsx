"use client";

import { useState, useEffect } from "react";
import { Snippet } from "@/lib/types";
import {
  listenSnippets, addSnippet, updateSnippet,
  deleteSnippet, archiveSnippet, restoreSnippet,
} from "@/lib/db";
import dynamic from "next/dynamic";

const HomeView     = dynamic(() => import("@/components/HomeView"),     { ssr: false });
const CategoryView = dynamic(() => import("@/components/CategoryView"), { ssr: false });
const DetailView   = dynamic(() => import("@/components/DetailView"),   { ssr: false });
const EditView     = dynamic(() => import("@/components/EditView"),     { ssr: false });
const SearchView   = dynamic(() => import("@/components/SearchView"),   { ssr: false });

const VERSION = "10.06";

type View = "home" | "category" | "search" | "detail" | "edit" | "new";

export default function Page() {
  const [snips, setSnips] = useState<Snippet[]>([]);
  const [view, setView] = useState<View>("home");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [returnTo, setReturnTo] = useState<View>("home");

  const active     = snips.find(s => s.id === activeId);
  const lastOpened = snips.find(s => s.id === lastOpenedId);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const unsub = listenSnippets(setSnips);
    return () => unsub();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("lastOpenedId");
    if (saved) setLastOpenedId(saved);
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleAdd = async (data: Omit<Snippet, "id">) => {
    await addSnippet(data);
    flash("Snippet opgeslagen");
    setView(returnTo);
  };

  const handleUpdate = async (id: string, data: Partial<Snippet>) => {
    await updateSnippet(id, data);
    flash("Opgeslagen");
  };

  const handleDelete = async (id: string) => {
    await deleteSnippet(id);
    flash("Verwijderd");
    setView(returnTo);
    setActiveId(null);
  };

  const handleArchive = async (id: string) => {
    await archiveSnippet(id);
    flash("Gearchiveerd");
    setView(returnTo);
    setActiveId(null);
  };

  const handleRestore = async (id: string) => {
    await restoreSnippet(id);
    flash("Teruggezet");
  };

  const handleToggleFav = async (id: string, current: boolean) => {
    await updateSnippet(id, { favorite: !current });
  };

  const shareSnippet = (snip: Snippet) => {
    const text = snip.title + "\n\n" + snip.code;
    if (navigator.share) navigator.share({ title: snip.title, text });
    else { navigator.clipboard.writeText(text); flash("Gekopieerd"); }
  };

  const exportSnippet = (snip: Snippet) => {
    const text = "# " + snip.title + "\n\n" + snip.description;
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = snip.title.replace(/\s+/g, "-") + ".txt";
    a.click();
    flash("Geexporteerd");
  };

  const openSnippet = (id: string, from: View) => {
    setReturnTo(from);
    setActiveId(id);
    setLastOpenedId(id);
    localStorage.setItem("lastOpenedId", id);
    setView("detail");
  };

  const openCategory = (cat: string) => {
    setActiveCategory(cat);
    setView("category");
  };

  const goHome = () => {
    setView("home");
    setActiveId(null);
    setActiveCategory(null);
    setShowSheet(false);
  };

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <main style={{ minHeight: "100vh", background: "#0B1020", maxWidth: 430, margin: "0 auto", position: "relative" }}>

      {view === "home" && (
        <HomeView
          allSnips={snips}
          lastOpened={lastOpened || null}
          onOpenCategory={openCategory}
          onOpenSnippet={(id) => openSnippet(id, "home")}
          onSearch={() => setView("search")}
          onFav={(id, current) => handleToggleFav(id, current)}
          onAdd={() => { setReturnTo("home"); setView("new"); }}
        />
      )}

      {view === "category" && activeCategory && (
        <CategoryView
          category={activeCategory}
          allSnips={snips}
          onBack={goHome}
          onOpenSnippet={(id) => openSnippet(id, "category")}
          onFav={(id, current) => handleToggleFav(id, current)}
        />
      )}

      {view === "search" && (
        <SearchView
          allSnips={snips}
          onBack={goHome}
          onOpenSnippet={(id) => openSnippet(id, "search")}
          onFav={(id, current) => handleToggleFav(id, current)}
        />
      )}

      {view === "new" && (
        <EditView snip={null} theme={theme} onSave={handleAdd} onCancel={() => setView(returnTo)} />
      )}

      {view === "edit" && active && (
        <EditView
          snip={active} theme={theme}
          onSave={(data) => { handleUpdate(active.id!, data); setView("detail"); }}
          onCancel={() => setView("detail")}
        />
      )}

      {view === "detail" && active && (
        <DetailView
          snip={active} copied={copied} showSheet={showSheet} theme={theme}
          onBack={() => { setView(returnTo); setActiveId(null); setShowSheet(false); }}
          onDots={() => setShowSheet(true)}
          onEdit={() => { setShowSheet(false); setView("edit"); }}
          onDelete={() => { if (window.confirm("Verwijderen?")) handleDelete(active.id!); }}
          onArchive={() => { setShowSheet(false); handleArchive(active.id!); }}
          onCopy={() => { navigator.clipboard.writeText(active.code); setCopied(true); setTimeout(() => setCopied(false), 2200); }}
          onFav={() => handleToggleFav(active.id!, active.favorite)}
          onShare={() => shareSnippet(active)}
          onExport={() => exportSnippet(active)}
          onCloseSheet={() => setShowSheet(false)}
          onAdd={() => { setReturnTo("detail"); setView("new"); }}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
          background: toast.includes("Verwijderd") ? "#ef4444" : toast.includes("Gearchiveerd") ? "#6366f1" : "#10b981",
          color: "#fff", padding: "9px 20px", borderRadius: 20, fontSize: 14,
          fontWeight: 600, zIndex: 300, whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {toast}
        </div>
      )}
    </main>
  );
}
