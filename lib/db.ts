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
import { Snippet } from "./types";

const COL = "snippets";

export function listenSnippets(callback: (snips: Snippet[]) => void) {
  const q = query(
    collection(db, COL),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      codeBlocks: d.data().codeBlocks || [],
      notes: d.data().notes || "",
    })) as Snippet[];
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
