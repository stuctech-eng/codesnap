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
    })) as Snippet[];
    callback(data);
  });
}

export async function addSnippet(data: Omit<Snippet, "id">) {
  return await addDoc(collection(db, COL), {
    ...data,
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
