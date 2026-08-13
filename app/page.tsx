"use client";

import { useState, useEffect } from "react";
import { Snippet } from "@/lib/types";
import { ensureAuth } from "@/lib/firebase";
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
const DrillDownView   = dynamic(() => import("@/components/DrillDownView"),   { ssr: false });
const Breadcrumb       = dynamic(() => import("@/components/Breadcrumb"),      { ssr: false });
const EditView        = dynamic(() => import("@/components/EditView"),        { ssr: false });

const VERSION = "12.16";

type View = "home" | "category" | "search" | "bibliotheek" | "profiel" | "project" | "component" | "snippets" | "detail" | "edit" | "new";

export default function Page() {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [snips, setSnips] = useState<Snippet[]>([]);
  const [view, setView] = useState<View>("home");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  // Fase H3 — stack i.p.v. enkele waarde, zodat meerdere niveaus
  // diep (H4: Project/Component) correct terug kunnen navigeren.
  // pushView legt de HUIDIGE view vast als terugkeerpunt, dus er
  // is geen handmatig "from"-argument nodig bij de aanroeper.
  // Zie docs/audit-hierarchie.md sectie 8, Fase H3.
  const [returnStack, setReturnStack] = useState<View[]>([]);
  const pushView = (next: View) => {
    setReturnStack(prev => [...prev, view]);
    setView(next);
  };
  const popView = () => {
    setReturnStack(prev => {
      if (prev.length === 0) { setView("home"); return []; }
      const last = prev[prev.length - 1];
      setView(last);
      return prev.slice(0, -1);
    });
  };

  const active     = snips.find(s => s.id === activeId);
  // BUGFIX: lastOpened moet niet meer verschijnen als de snippet
  // inmiddels verwijderd is (deletedAt gezet) — anders blijft een
  // net verwijderde snippet zichtbaar in "Verder waar je gebleven
  // was" op Home. Zie melding via screenshot, augustus 2026.
  const lastOpened = snips.find(s => s.id === lastOpenedId && !s.deletedAt);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Beveiligingslaag — anonieme Firebase-login, vereist sinds
  // Firestore Rules zijn aangescherpt naar "if request.auth != null".
  // Zie docs/architecture.md voor de beveiligingscontext.
  useEffect(() => {
    ensureAuth()
      .then(() => setAuthReady(true))
      .catch((err) => {
        console.error("Auth error:", err);
        setAuthError(true);
      });
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const unsub = listenSnippets((data) => {
      setSnips(data);
      setDataReady(true); // pas na de EERSTE callback, voorkomt korte
                            // "0 snippets" flits tussen inloggen en de
                            // eerste Firestore-data (zie meldingen mbt
                            // lege staat direct na app-start)
    });
    return () => unsub();
  }, [authReady]);

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

  const openSnippet = (id: string) => {
    setActiveId(id);
    setLastOpenedId(id);
    localStorage.setItem("lastOpenedId", id);
    pushView("detail");
  };

  const openCategory = (cat: string) => {
    setActiveCategory(cat);
    pushView("category");
  };

  const openProjectList = (cat: string) => {
    setActiveCategory(cat);
    setActiveProject(null);
    setActiveComponent(null);
    pushView("project");
  };

  // BUGFIX (augustus 2026) — dit ging voorheen direct naar het
  // eindpunt (platte snippet-lijst). Volgens de oorspronkelijke
  // specificatie (docs/audit-hierarchie.md sectie 4.2) moet dit
  // niveau ZELF eerst nog kunnen groeperen op Onderdeel, als die
  // waarden zijn ingevuld. DrillDownView regelt die beslissing nu
  // zelf (toont groepen OF platte lijst, afhankelijk van de data) —
  // hier hoeven we alleen naar het juiste niveau te navigeren.
  const openProject = (cat: string, project: string) => {
    setActiveCategory(cat);
    setActiveProject(project);
    setActiveComponent(null);
    pushView("component");
  };

  const openComponent = (cat: string, project: string, comp: string) => {
    setActiveCategory(cat);
    setActiveProject(project);
    setActiveComponent(comp);
    pushView("snippets");
  };

  const goHome = () => {
    setView("home");
    setReturnStack([]);
    setActiveId(null);
    setActiveCategory(null);
    setActiveProject(null);
    setShowSheet(false);
  };

  // Fase H5 — breadcrumb "spring naar" functies. Zetten de stack
  // EXPLICIET voor het doelniveau, i.p.v. popView() herhaaldelijk
  // aan te roepen (dat zou door React's asynchrone state-updates
  // onbetrouwbaar kunnen worden bij snel na elkaar meerdere pops).
  const jumpToBibliotheek = () => {
    setReturnStack(["home"]);
    setActiveProject(null);
    setView("bibliotheek");
  };

  const jumpToProjectList = () => {
    setReturnStack(["home", "bibliotheek"]);
    setActiveProject(null);
    setView("project");
  };

  const jumpToComponentList = () => {
    setReturnStack(["home", "bibliotheek", "project"]);
    setActiveComponent(null);
    setView("component");
  };

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  if (authError) {
    return (
      <main style={{ minHeight: "100vh", background: "#0B1020", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <p style={{ color: "#f87171", fontSize: 14, textAlign: "center" }}>
          Kon niet verbinden. Controleer je internetverbinding en probeer het opnieuw.
        </p>
      </main>
    );
  }

  if (!authReady || !dataReady) {
    return (
      <main style={{ minHeight: "100vh", background: "#0B1020", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94A3B8", fontSize: 14 }}>Laden...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0B1020", maxWidth: 430, margin: "0 auto", position: "relative" }}>

      {view === "home" && (
        <HomeView
          allSnips={snips}
          lastOpened={lastOpened || null}
          onOpenCategory={openCategory}
          onOpenProjectList={openProjectList}
          onOpenSnippet={openSnippet}
          onSearch={() => setView("search")}
          onFav={(id, current) => handleToggleFav(id, current)}
          onAdd={() => pushView("new")}
          onOpenBibliotheek={() => pushView("bibliotheek")}
          onOpenProfiel={() => pushView("profiel")}
        />
      )}

      {view === "bibliotheek" && (
        <BibliotheekView
          allSnips={snips}
          onBack={goHome}
          onOpenSnippet={openSnippet}
          onOpenCategory={openCategory}
          onOpenProjectList={openProjectList}
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
          onBack={popView}
          onOpenSnippet={openSnippet}
          onFav={(id, current) => handleToggleFav(id, current)}
        />
      )}

      {view === "project" && activeCategory && (
        <DrillDownView
          level="project"
          category={activeCategory}
          allSnips={snips}
          onBack={popView}
          onOpenSnippet={openSnippet}
          onOpenNext={(proj) => openProject(activeCategory, proj)}
          onFav={(id, current) => handleToggleFav(id, current)}
        />
      )}

      {view === "component" && activeCategory && activeProject && (
        <DrillDownView
          level="component"
          category={activeCategory}
          project={activeProject}
          allSnips={snips}
          onBack={popView}
          onOpenSnippet={openSnippet}
          onOpenNext={(comp) => openComponent(activeCategory, activeProject, comp)}
          onFav={(id, current) => handleToggleFav(id, current)}
          breadcrumb={[
            { label: "Bibliotheek", onTap: jumpToBibliotheek },
            { label: activeCategory, onTap: jumpToProjectList },
            { label: activeProject, onTap: () => {} },
          ]}
        />
      )}

      {view === "snippets" && activeCategory && activeProject && activeComponent && (
        <DrillDownView
          level="snippets"
          category={activeCategory}
          project={activeProject}
          component={activeComponent}
          allSnips={snips}
          onBack={popView}
          onOpenSnippet={openSnippet}
          onOpenNext={() => {}}
          onFav={(id, current) => handleToggleFav(id, current)}
          breadcrumb={[
            { label: "Bibliotheek", onTap: jumpToBibliotheek },
            { label: activeCategory, onTap: jumpToProjectList },
            { label: activeProject, onTap: jumpToComponentList },
            { label: activeComponent, onTap: () => {} },
          ]}
        />
      )}

      {view === "search" && (
        <SearchView
          allSnips={snips}
          onBack={goHome}
          onOpenSnippet={openSnippet}
          onFav={(id, current) => handleToggleFav(id, current)}
        />
      )}

      {view === "new" && (
        <EditView snip={null} allSnips={snips} theme={theme} onSave={handleAdd} onCancel={popView} />
      )}

      {view === "edit" && active && (
        <EditView
          snip={active} allSnips={snips} theme={theme}
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
          onAdd={() => pushView("new")}
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
