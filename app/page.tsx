"use client";

import { useState, useEffect, useMemo } from "react";
import { Snippet } from "@/lib/types";
import {
  listenSnippets,
  addSnippet,
  updateSnippet,
  deleteSnippet,
} from "@/lib/db";
import ListView from "@/components/ListView";
import DetailView from "@/components/DetailView";
import EditView from "@/components/EditView";

type View = "list" | "detail" | "edit" | "new";

export default function Page() {
  const [snips, setSnips] = useState<Snippet[]>([]);
  const [view, setView] = useState<View>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const active = snips.find((s) => s.id === activeId);

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

  const goList = () => {
    setView("list");
    setActiveId(null);
    setShowSheet(false);
  };

  const filtered = useMemo(() =>
    snips.filter((s) =>
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.some((t) => t.includes(search.toLowerCase()))
    ), [snips, search]);

  const featured = useMemo(
    () => snips.filter((s) => s.favorite),
    [snips]
  );

  return (
    <main style={{
      minHeight: "100vh",
      background: "#000",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
    }}>
      {view === "new" && (
        <EditView
          snip={null}
          onSave={handleAdd}
          onCancel={goList}
        />
      )}
      {view === "edit" && active && (
        <EditView
          snip={active}
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
          onBack={goList}
          onDots={() => setShowSheet(true)}
          onEdit={() => { setShowSheet(false); setView("edit"); }}
          onDelete={() => {
            if (window.confirm("Verwijderen?")) handleDelete(active.id!);
          }}
          onCopy={() => copyCode(active.code)}
          onFav={() => handleToggleFav(active.id!, active.favorite)}
          onCloseSheet={() => setShowSheet(false)}
          onAdd={() => setView("new")}
        />
      )}
      {view === "list" && (
        <ListView
          mySnips={filtered}
          featured={featured}
          search={search}
          onSearch={setSearch}
          onOpen={(id) => { setActiveId(id); setView("detail"); }}
          onFav={(id, current) => handleToggleFav(id, current)}
          onAdd={() => setView("new")}
        />
      )}
      {toast && (
        <div style={{
          position: "fixed", bottom: 96,
          left: "50%", transform: "translateX(-50%)",
          background: "#10b981", color: "#fff",
          padding: "9px 20px", borderRadius: 20,
          fontSize: 14, fontWeight: 600, zIndex: 300,
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </main>
  );
}
