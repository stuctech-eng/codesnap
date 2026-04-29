import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { Snippet, CodeBlock } from "./types";

const COL = "snippets";

function migrateSnippet(id: string, data: Record<string, unknown>): Snippet {
  const codeBlocks = (data.codeBlocks as CodeBlock[]) || [];

  // Migreer oude code naar eerste codeBlock
  if (data.code && typeof data.code === "string" && data.code.trim() && codeBlocks.length === 0) {
    codeBlocks.push({
      id: "migrated",
      filename: "main.code",
      code: data.code as string,
    });
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
    tags: (data.tags as string[]) || [],
    favorite: (data.favorite as boolean) || false,
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

export async function deleteSnippet(id: string) {
  return await deleteDoc(doc(db, COL, id));
}
