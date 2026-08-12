import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, serverTimestamp,
  query, orderBy, getDoc, setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Snippet, CodeBlock } from "./types";

const COL = "snippets";
const SETTINGS_DOC = "settings/categories";
const RETENTION_DAYS = 30;

function migrateSnippet(id: string, data: Record<string, unknown>): Snippet {
  const codeBlocks = (data.codeBlocks as CodeBlock[]) || [];
  if (data.code && typeof data.code === "string" && data.code.trim() && codeBlocks.length === 0) {
    codeBlocks.push({ id: "migrated", filename: "main.code", code: data.code as string });
  }

  // Migratie: oude "archived: true" snippets krijgen bij eerste keer lezen
  // een deletedAt zodat ze in het nieuwe Archief-systeem passen.
  // Zie docs/design-baseline-v2.md sectie 10.3 — migratie-opmerking.
  let deletedAt = data.deletedAt as string | undefined;
  if (!deletedAt && data.archived === true) {
    deletedAt = data.updatedAt
      ? new Date((data.updatedAt as { toDate(): Date }).toDate()).toISOString()
      : new Date().toISOString();
  }

  return {
    id,
    title: (data.title as string) || "",
    description: (data.description as string) || "",
    code: (data.code as string) || "",
    codeBlocks,
    notes: (data.notes as string) || "",
    snippetType: (data.snippetType as Snippet["snippetType"]) || "code",
    category: (data.category as string) || "",
    project: (data.project as string) || undefined,
    component: (data.component as string) || undefined,
    tags: (data.tags as string[]) || [],
    favorite: (data.favorite as boolean) || false,
    archived: (data.archived as boolean) || false,
    deletedAt,
    createdAt: data.createdAt ? new Date((data.createdAt as { toDate(): Date }).toDate()).toISOString() : undefined,
    updatedAt: data.updatedAt ? new Date((data.updatedAt as { toDate(): Date }).toDate()).toISOString() : undefined,
  };
}

export function listenSnippets(callback: (snips: Snippet[]) => void) {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => migrateSnippet(d.id, d.data()));
    callback(data);
  }, (error) => {
    console.error("Firestore error:", error);
    callback([]);
  });
}

export async function addSnippet(data: Omit<Snippet, "id">) {
  return await addDoc(collection(db, COL), {
    ...data,
    codeBlocks: data.codeBlocks || [],
    notes: data.notes || "",
    archived: false,
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateSnippet(id: string, data: Partial<Snippet>) {
  return await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Hard delete — alleen gebruikt vanuit Archief "Nu permanent verwijderen".
// NIET meer gebruikt voor de normale "Verwijderen" actie in DetailView.
export async function deleteSnippet(id: string) {
  return await deleteDoc(doc(db, COL, id));
}

// Soft-delete — dit is wat "Verwijderen" in DetailView nu aanroept.
// Zet deletedAt, snippet verdwijnt uit Home/Bibliotheek/CategoryView
// maar blijft 30 dagen bereikbaar via Profiel > Archief.
export async function softDeleteSnippet(id: string) {
  return await updateDoc(doc(db, COL, id), {
    deletedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });
}

export async function restoreSnippet(id: string) {
  return await updateDoc(doc(db, COL, id), {
    deletedAt: null,
    archived: false,
    updatedAt: serverTimestamp(),
  });
}

// Legacy — blijven bestaan zodat oude imports niet breken,
// maar wijzen nu naar het nieuwe soft-delete systeem.
export async function archiveSnippet(id: string) {
  return await softDeleteSnippet(id);
}

export function daysUntilPermanentDelete(deletedAt?: string): number {
  if (!deletedAt) return RETENTION_DAYS;
  const deleted = new Date(deletedAt).getTime();
  const now = Date.now();
  const elapsedDays = (now - deleted) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(RETENTION_DAYS - elapsedDays));
}

export async function loadCustomCats(): Promise<string[]> {
  try {
    const snap = await getDoc(doc(db, SETTINGS_DOC));
    if (snap.exists()) return (snap.data().customCats as string[]) || [];
    return [];
  } catch { return []; }
}

export async function saveCustomCats(cats: string[]): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC), { customCats: cats });
  } catch (e) { console.error("saveCustomCats error:", e); }
}
