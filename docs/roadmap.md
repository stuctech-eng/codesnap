# CodeSnap — Roadmap

> Actieve fasering voor Design Baseline v2.0 implementatie.
> Zie docs/design-baseline-v2.md voor het volledige ontwerp.

---

## Status overzicht

| Fase | Naam | Status |
|------|------|--------|
| 0 | Design Baseline v2.0 vastgelegd | ✅ Klaar |
| 1 | Nieuwe Home Screen | ✅ Klaar |
| 2 | Categorie-detailpagina | ✅ Klaar |
| 3 | Bestaande features aankoppelen | ✅ Klaar |
| 4 | Continue Working — echte data | ✅ Klaar |
| 5 | Responsive + iPhone/PWA polish | ⏳ Doorlopend |
| 6 | Oude ListView opruimen | ⚠️ Handmatige stap vereist |

---

## v10.06 — Complete v2.0 implementatie

In één sessie afgerond (Fase 1 t/m 4), HomeView als default view:

- **HomeView.tsx** — dynamische groet, Continue Working (met echte
  relatieve tijd), favorieten, bibliotheek-regel, categorieën-lijst
- **CategoryView.tsx** (nieuw) — detailscherm per categorie met eigen
  zoeken/sorteren, hergebruikt SnapRow-stijl uit legacy ListView
- **SearchView.tsx** (nieuw) — volledig scherm zoeken vanuit Home,
  doorzoekt titel/beschrijving/tags/categorie
- **app/page.tsx** — volledig herschreven routing:
  `home → category / search → detail → edit/new`, met `returnTo`
  state zodat "terug" altijd naar het juiste scherm gaat
- Favorieten, archiveren, verwijderen, bewerken — allemaal werkend
  vanuit de nieuwe navigatiestructuur
- HomeView is nu de **standaard view** bij openen van de app

---

## Fase 6 — Opruimen (nog te doen, handmatig)

`components/ListView.tsx` wordt niet meer aangeroepen vanuit
`app/page.tsx` maar staat nog in de repo. Dit is bewust:

- Geen enkele import verwijst er nog naar — veilig te verwijderen
  zodra je zelf hebt gecontroleerd dat alles werkt
- Verwijderen kan via Working Copy: bestand selecteren → verwijderen
  → committen
- Dit is bewust niet automatisch gedaan, om een fallback te hebben
  als er iets in de nieuwe flow niet blijkt te werken

**Aanbevolen actie:** test de app een paar dagen, verwijder dan
`components/ListView.tsx` in een aparte commit.

---

## Fase 5 — Polish (doorlopend, geen blokkerende actie)

Blijft aandachtspunt bij toekomstige wijzigingen:

- Test met 0 / 1 / 10 / 100+ snippets
- Test met zeer lange titels/categorienamen
- Test op verschillende iPhone schermgroottes

---

*Bijgewerkt: augustus 2026 — v10.06 complete implementatie*
