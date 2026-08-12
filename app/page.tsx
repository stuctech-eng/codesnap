"use client";

import { useState, useEffect } from "react";
import { Snippet } from "@/lib/types";
import {
  listenSnippets, addSnippet, updateSnippet,
  softDeleteSnippet, deleteSnippet, restoreSnippet,
} from "@/lib/db";
import dynamic from "next/dynamic";

const HomeView        = dynamic(() => import("@/components/HomeView"),        { ssr: false });
const CategoryView    = dynamic(() => import("@/components/CategoryView"),    { ssr: false });
const SearchView      = dynamic(() => import("@/components/SearchView"),      { ssr: false });
const BibliotheekView = dynamic(() => import("@/components/BibliotheekView"), { ssr: false });
const ProfielView     = dynamic(() => import("@/components/ProfielView"),     { ssr: false });
const DetailView      = dynamic(() => import("@/components/DetailView"),      { ssr: false });
const EditView        = dynamic(() => import("@/components/EditView"),        { ssr: false });

const VERSION = "12.04";

type View = "home" | "category" | "search" | "bibliotheek" | "profiel" | "detail" | "edit" | "new";

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
  // Fase H3 — stack i.p.v. enkele waarde, zodat meerdere niveaus
  // diep (H4: Project/Component) correct terug kunnen navigeren.
  // Zie docs/audit-hierarchie.md sectie 8, Fase H3.
  const [returnStack, setReturnStack] = useState<View[]>(["home"]);
  const pushView = (from: View, next: View) => {
    setReturnStack(prev => [...prev, from]);
    setView(next);
  };
  const popView = () => {
    setReturnStack(prev => {
      if (prev.length <= 1) return ["home"];
      const next = prev.slice(0, -1);
      setView(next[next.length - 1]);
      return next;
    });
  };

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
    popView();
  };

  const handleUpdate = async (id: string, data: Partial<Snippet>) => {
    await updateSnippet(id, data);
    flash("Opgeslagen");
  };

  // Zachte verwijdering — snippet gaat naar Archief (Profiel), 30 dagen bewaartermijn.
  // Zie docs/design-baseline-v2.md sectie 10.3.
  const handleDelete = async (id: string) => {
    await softDeleteSnippet(id);
    flash("Naar archief verplaatst");
    setActiveId(null);
    popView();
  };

  const handleRestore = async (id: string) => {
    await restoreSnippet(id);
    flash("Teruggezet");
  };

  const handleDeletePermanent = async (id: string) => {
    await deleteSnippet(id);
    flash("Definitief verwijderd");
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
    setActiveId(id);
    setLastOpenedId(id);
    localStorage.setItem("lastOpenedId", id);
    pushView(from, "detail");
  };

  const openCategory = (cat: string) => {
    setActiveCategory(cat);
    setView("category");
  };

  const goHome = () => {
    setView("home");
    setReturnStack(["home"]);
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
          onAdd={() => pushView("home", "new")}
          onOpenBibliotheek={() => setView("bibliotheek")}
          onOpenProfiel={() => setView("profiel")}
        />
      )}

      {view === "bibliotheek" && (
        <BibliotheekView
          allSnips={snips}
          onBack={goHome}
          onOpenSnippet={(id) => openSnippet(id, "bibliotheek")}
          onOpenCategory={openCategory}
          onFav={(id, current) => handleToggleFav(id, current)}
        />
      )}

      {view === "profiel" && (
        <ProfielView
          allSnips={snips}
          onBack={goHome}
          onRestore={handleRestore}
          onDeletePermanent={handleDeletePermanent}
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
        <EditView snip={null} theme={theme} onSave={handleAdd} onCancel={popView} />
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
          onBack={() => { setActiveId(null); setShowSheet(false); popView(); }}
          onDots={() => setShowSheet(true)}
          onEdit={() => { setShowSheet(false); setView("edit"); }}
          onDelete={() => { setShowSheet(false); if (window.confirm("Naar archief verplaatsen?")) handleDelete(active.id!); }}
          onCopy={() => { navigator.clipboard.writeText(active.code); setCopied(true); setTimeout(() => setCopied(false), 2200); }}
          onFav={() => handleToggleFav(active.id!, active.favorite)}
          onShare={() => shareSnippet(active)}
          onExport={() => exportSnippet(active)}
          onCloseSheet={() => setShowSheet(false)}
          onAdd={() => pushView("detail", "new")}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)",
          background: toast.includes("archief") ? "#6366f1" : toast.includes("Definitief") ? "#ef4444" : "#10b981",
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
