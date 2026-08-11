# CodeSnap — Roadmap

> Actieve fasering voor Design Baseline v2.0 implementatie.
> Zie docs/design-baseline-v2.md voor het volledige ontwerp.

---

## Status overzicht

| Fase | Naam | Status |
|------|------|--------|
| 0 | Design Baseline v2.0 vastgelegd | ✅ Klaar |
| 1 | Nieuwe Home Screen | ⏳ Volgende |
| 2 | Categorie-detailpagina | ⬜ Gepland |
| 3 | Bestaande features aankoppelen | ⬜ Gepland |
| 4 | Continue Working — echte data | ⬜ Gepland |
| 5 | Responsive + iPhone/PWA polish | ⬜ Gepland |
| 6 | Oude ListView opruimen | ⬜ Gepland |

---

## Fase 1 — Nieuwe Home Screen

**Doel:** HomeView.tsx bouwen als nieuw, apart component.

**Bevat:**
- Dynamische groet (Goedemorgen/middag/avond)
- Prominente zoekbalk
- Continue Working hero (met empty state)
- Favorieten rij (conditioneel, met empty state)
- Bibliotheek overzichtsregel
- Categorieën als simpele lijst (nog geen navigatie naar detail)
- Sticky "Nieuwe Snippet" knop

**Randvoorwaarden:**
- Bestaat naast huidige ListView.tsx — vervangt niets nog
- Gebruikt bestaande `listenSnippets()` uit lib/db.ts
- Geen wijziging aan Firebase structuur
- Lijn-iconen (SVG), geen emoji's
- Kleurensysteem v2.0 (zie design-baseline-v2.md sectie 5)

**Niet in scope:**
- Categorie-detail navigatie (dat is Fase 2)
- Zoekfunctionaliteit echt laten werken (Fase 3)
- Filters/sorteren (Fase 3)

---

## Fase 2 — Categorie-detailpagina

**Doel:** Apart scherm per categorie, bereikbaar via tik op home.

**Bevat:**
- Terug-navigatie naar home
- Lijst van snippets binnen die categorie
- Hergebruik van bestaande snippet-rij weergave

---

## Fase 3 — Bestaande features aankoppelen

**Doel:** Alle functionaliteit uit v09.06 weer beschikbaar maken
in de nieuwe navigatiestructuur.

**Bevat:**
- Zoeken (werkend maken op nieuwe home)
- Sorteren (nieuwste/oudste/A-Z)
- Tag filters
- Favorieten toggle
- Edit/delete/archiveren
- Archief sectie

---

## Fase 4 — Continue Working met echte data

**Doel:** Hero sectie op home toont daadwerkelijk laatst geopende
snippet, niet gesimuleerd.

**Bevat:**
- Hergebruik bestaande `lastOpenedId` uit localStorage
- Relatieve tijd berekening (zojuist/min/uur/dagen geleden)
- Taal-badge gebaseerd op eerste codeBlock filename
- Empty state als er nog nooit iets geopend is

---

## Fase 5 — Responsive + PWA polish

**Doel:** Edge cases afvangen voordat oude UI verwijderd wordt.

**Test:**
- 0 snippets (nieuwe gebruiker)
- 1 snippet
- 10 snippets, 3 categorieën
- 100+ snippets, 10+ categorieën
- Zeer lange snippet titels / categorienamen
- iPhone SE (klein scherm) tot iPhone Pro Max

---

## Fase 6 — Opruimen

**Doel:** Oude code verwijderen zodra nieuwe flow bewezen stabiel is.

**Bevat:**
- `components/ListView.tsx` verwijderen
- `app/page.tsx` routing bijwerken naar HomeView + CategoryView
- README.md bijwerken — v08/v09 sectie naar changelog, nieuwe
  architectuur beschrijven

**Regel:** Deze fase gebeurt pas na expliciete goedkeuring, niet
automatisch na Fase 5.

---

*Dit document wordt bijgewerkt na elke afgeronde fase.*
