"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, ensureAuth } from "@/lib/firebase";

// Deeplink-route: opent (en maakt indien nodig aan) de "Mijn Plannen"
// map voor een gegeven project, binnen de vaste categorie "Apps".
//
// Gebruik: https://codesnap-mu.vercel.app/plannen?project=CoachOS
//
// Gedrag:
// 1. Checkt of er al een snippet bestaat met category="Apps",
//    project=<param>, component="Mijn Plannen"
// 2. Zo nee: maakt een starter-snippet aan met die waarden
// 3. Stuurt door naar de hoofd-app (/) -- de gebruiker komt op Home
//    terecht; navigeren naar de map zelf (Bibliotheek > Apps >
//    project > Mijn Plannen) gebeurt daar zoals gebruikelijk, de
//    map bestaat nu gegarandeerd.
//
// Zie docs/audit-hierarchie.md voor de bredere hiërarchie-architectuur.

const ONDERDEEL_NAAM = "Mijn Plannen";
const CATEGORIE = "Apps";
const COL = "snippets";

function PlannenParamsWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"laden" | "fout" | "klaar">("laden");
  const [errorMsg, setErrorMsg] = useState("");

  const project = searchParams.get("project");

  useEffect(() => {
    if (!project) {
      setStatus("fout");
      setErrorMsg("Geen project opgegeven. Gebruik ?project=NaamVanJeProject in de URL.");
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        await ensureAuth();

        const q = query(
          collection(db, COL),
          where("category", "==", CATEGORIE),
          where("project", "==", project),
          where("component", "==", ONDERDEEL_NAAM)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          await addDoc(collection(db, COL), {
            title: ONDERDEEL_NAAM,
            description: "Startpunt voor " + project + " — " + ONDERDEEL_NAAM,
            code: "",
            codeBlocks: [],
            notes: "",
            snippetType: "prompt",
            category: CATEGORIE,
            project: project,
            component: ONDERDEEL_NAAM,
            tags: [],
            favorite: false,
            archived: false,
            deletedAt: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        if (!cancelled) {
          setStatus("klaar");
          setTimeout(() => {
            router.push("/?openProject=" + encodeURIComponent(project!) + "&openComponent=" + encodeURIComponent(ONDERDEEL_NAAM));
          }, 600);
        }
      } catch (err) {
        console.error("Plannen-route error:", err);
        if (!cancelled) {
          setStatus("fout");
          setErrorMsg("Er ging iets mis. Controleer je internetverbinding en probeer opnieuw.");
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [project, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#0B1020", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      {status === "laden" && (
        <>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          <p style={{ color: "#94A3B8", fontSize: 15 }}>
            "{ONDERDEEL_NAAM}" voorbereiden voor <strong style={{ color: "#fff" }}>{project}</strong>...
          </p>
        </>
      )}
      {status === "klaar" && (
        <>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Klaar!</p>
          <p style={{ color: "#94A3B8", fontSize: 13 }}>
            Je wordt doorgestuurd naar {ONDERDEEL_NAAM}...
          </p>
        </>
      )}
      {status === "fout" && (
        <>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <p style={{ color: "#f87171", fontSize: 14, marginBottom: 16 }}>{errorMsg}</p>
          <a href="/" style={{ color: "#4F8CFF", fontSize: 15, fontWeight: 600 }}>← Terug naar CodeSnap</a>
        </>
      )}
    </div>
  );
}

export default function PlannenPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0B1020", color: "#94A3B8", fontSize: 14 }}>
        Laden...
      </div>
    }>
      <PlannenParamsWrapper />
    </Suspense>
  );
}
