import { NextResponse } from "next/server";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, ensureAuth } from "@/lib/firebase";

// Vercel Cron roept deze route dagelijks aan (zie vercel.json).
// Verwijdert definitief alle snippets waarvan deletedAt ouder is
// dan 30 dagen. Zie docs/design-baseline-v2.md sectie 10.4.
//
// Handmatig testen: GET https://codesnap-mu.vercel.app/api/cleanup-archief
// (met CRON_SECRET header, zie onderaan)
//
// LET OP: sinds Firestore Rules "if request.auth != null" vereisen
// (beveiligingsfix, zie docs/architecture.md), moet ook deze
// server-side route eerst anoniem inloggen — anders faalt elke
// aanroep stilletjes met een permission-denied fout.

// beveiligingsfix
const RETENTION_DAYS = 30;
const COL = "snippets";

export async function GET(request: Request) {
  // Simpele beveiliging: alleen Vercel Cron (of iemand met de secret)
  // mag deze route aanroepen — voorkomt dat iemand anders hem per
  // ongeluk of moedwillig aanroept.
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureAuth();

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
    const cutoffISO = cutoff.toISOString();

    // Firestore kan niet direct "deletedAt < X AND deletedAt is not null"
    // combineren met de bestaande index-structuur van dit project,
    // dus we halen alle verwijderde items op en filteren in code.
    // Bij een klein persoonlijk archief (tientallen items) is dit
    // ruim snel genoeg; niet geschikt voor duizenden items.
    const q = query(collection(db, COL), where("deletedAt", "!=", null));
    const snap = await getDocs(q);

    const toDelete: string[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const deletedAt = data.deletedAt as string | null;
      if (deletedAt && deletedAt < cutoffISO) {
        toDelete.push(docSnap.id);
      }
    });

    await Promise.all(toDelete.map((id) => deleteDoc(doc(db, COL, id))));

    return NextResponse.json({
      success: true,
      checked: snap.size,
      deleted: toDelete.length,
      deletedIds: toDelete,
      cutoffDate: cutoffISO,
    });
  } catch (error) {
    console.error("Cleanup-archief error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
