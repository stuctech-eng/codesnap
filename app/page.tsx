"use client";

import { useState, useEffect, useMemo } from "react";
import { Snippet } from "@/lib/types";
import {
  listenSnippets,
  addSnippet,
  updateSnippet,
  deleteSnippet,
} from "@/lib/db";
import dynamic from "next/dynamic";

const ListView = dynamic(() => import("@/components/ListView"), { ssr: false });
const DetailView = dynamic(() => import("@/components/DetailView"), { ssr: false });
const EditView = dynamic(() => import("@/components/EditView"), { ssr: false });

const VERSION = "30.04";



type View = "list" | "detail" | "edit" | "new";

export default function Page() {
  const [snips, setSnips] = useState<Snippet[]>([]);
  const [view, setView] = useState<View>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Alles");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const active = snips.find((s) => s.id === activeId);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const unsub = listenSnippets(setSnips);
    return () => unsub();
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleAdd = async (data: Omit<Snippet, "id">) => {
    await addSnippet(data);
    flash("✓ Snippet opgeslagen");
    setView("list");
  };

  const handleUpdate = async (id: string, data: Partial<Snippet>) => {
    await updateSnippet(id, data);
    flash("✓ Opgeslagen");
  };

  const handleDelete = async (id: string) => {
    await deleteSnippet(id);
    flash("🗑 Verwijderd");
    goList();
  };

  const handleToggleFav = async (id: string, current: boolean) => {
    await updateSnippet(id, { favorite: !current });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const shareSnippet = (snip: Snippet) => {
    const text = snip.title + "\n\n" + snip.code;
    if (navigator.share) {
      navigator.share({ title: snip.title, text });
    } else {
      navigator.clipboard.writeText(text);
      flash("✓ Gekopieerd naar klembord");
    }
  };

  const exportSnippet = (snip: Snippet) => {
    const text = "# " + snip.title + "\n\n" + snip.description + "\n\n```\n" + snip.code + "\n```\n\nTags: " + snip.tags?.join(", ");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = snip.title.replace(/\s+/g, "-") + ".txt";
    a.click();
    flash("✓ Geëxporteerd");
  };

  const goList = () => {
    setView("list");
    setActiveId(null);
    setShowSheet(false);
  };

  const filtered = useMemo(() =>
    snips
      .filter((s) => filterCat === "Alles" || s.category === filterCat)
      .filter((s) =>
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.tags?.some((t) => t.includes(search.toLowerCase()))
      ),
    [snips, search, filterCat]);

  const featured = useMemo(() =>
    snips.filter((s) => s.favorite),
    [snips]);

  const toggleTheme = () =>
    setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg)",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
    }}>
      {view === "new" && (
        <EditView
          snip={null}
          theme={theme}
          onSave={handleAdd}
          onCancel={goList}
        />
      )}
      {view === "edit" && active && (
        <EditView
          snip={active}
          theme={theme}
          onSave={(data) => {
            handleUpdate(active.id!, data);
            setView("detail");
          }}
          onCancel={() => setView("detail")}
        />
      )}
      {view === "detail" && active && (
        <DetailView
          snip={active}
          copied={copied}
          showSheet={showSheet}
          theme={theme}
          onBack={goList}
          onDots={() => setShowSheet(true)}
          onEdit={() => { setShowSheet(false); setView("edit"); }}
          onDelete={() => {
            if (window.confirm("Verwijderen?")) handleDelete(active.id!);
          }}
          onCopy={() => copyCode(active.code)}
          onFav={() => handleToggleFav(active.id!, active.favorite)}
          onShare={() => shareSnippet(active)}
          onExport={() => exportSnippet(active)}
          onCloseSheet={() => setShowSheet(false)}
          onAdd={() => setView("new")}
        />
      )}
      {view === "list" && (
        <ListView
          mySnips={filtered}
          featured={featured}
          allSnips={snips}
          search={search}
          filterCat={filterCat}
          theme={theme}
          onSearch={setSearch}
          onFilterCat={setFilterCat}
          onOpen={(id) => { setActiveId(id); setView("detail"); }}
          onFav={(id, current) => handleToggleFav(id, current)}
          onAdd={() => setView("new")}
          onEdit={(id) => { setActiveId(id); setView("edit"); }}
          onDelete={(id) => handleDelete(id)}
          onToggleTheme={toggleTheme}
          version={VERSION}
        />
      )}
      {toast && (
        <div style={{
          position: "fixed", bottom: 96,
          left: "50%", transform: "translateX(-50%)",
          background: toast.startsWith("🗑") ? "#ef4444" : "#10b981",
          color: "#fff", padding: "9px 20px",
          borderRadius: 20, fontSize: 14,
          fontWeight: 600, zIndex: 300,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {toast}
        </div>
      )}
    </main>
  );
}
