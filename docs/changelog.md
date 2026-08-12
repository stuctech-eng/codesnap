# CodeSnap — Changelog

> Chronologisch overzicht van alle wijzigingen.
> Voor actieve planning zie docs/roadmap.md.

---

## Ongepland / In behandeling

- Fase 5 (responsive/PWA polish) uit docs/roadmap.md — doorlopend
- Autocomplete voor Project/Onderdeel-velden in EditView — nog niet
  gebouwd, bewuste beperking (zie docs/audit-hierarchie.md sectie 11)

---

## v12.09

- **Bugfix — verwijderde snippets bleven zichtbaar.** `HomeView`,
  `CategoryView` en `SearchView` filterden nog op het verlaten
  `archived`-veld in plaats van `deletedAt`. Sinds de soft-delete
  architectuur (v11.06) zet `softDeleteSnippet()` alleen `deletedAt`,
  niet meer `archived: true` — daardoor bleven snippets na
  verwijderen gewoon zichtbaar in drie van de vijf schermen, terwijl
  ze wel al correct in het Archief verschenen
- Alle vijf lijst-schermen (Home, Bibliotheek, CategoryView,
  DrillDownView, SearchView) filteren nu consistent op
  `!s.deletedAt`
- `ProfielView` (het Archief-scherm zelf) was al correct en is
  ongewijzigd — die toont juist snippets WAAR `deletedAt` gezet is

## v12.08

- Fase H6 (laatste fase hiërarchie-plan): contextuele drill-down in
  Bibliotheek. Categorieën met minstens één snippet met een
  `project`-waarde tonen nu het Project-niveau bij tikken; overige
  categorieën blijven direct naar CategoryView gaan, ongewijzigd
- Hiermee is de hiërarchische Bibliotheek-structuur (Categorie →
  Project → Onderdeel → Snippet) volledig geïmplementeerd —
  zie docs/audit-hierarchie.md

## v12.07

- **Beveiligingsfix.** Firestore Rules stonden open voor iedereen
  (`allow read, write: if true`) — .env.local bleek ook per ongeluk
  gecommit in de repo geweest te zijn
- Anonieme Firebase Authentication toegevoegd — app en de
  cleanup-cron-route loggen nu automatisch en onzichtbaar anoniem in
- Firestore Rules aangescherpt naar `if request.auth != null`
- `.env.local` verwijderd uit de repo

## v12.01 t/m v12.06

- Fase H1 t/m H5 van de hiërarchische Bibliotheek-uitbreiding
  (Categorie → Project → Onderdeel → Snippet): datamodel,
  EditView-velden, routing naar een stack-gebaseerd systeem
  (`returnStack` i.p.v. losse `returnTo`-waarde), DrillDownView
  (generiek component voor Project- en Onderdeel-niveau),
  Breadcrumb-component — zie docs/audit-hierarchie.md voor de
  volledige details en gevonden/opgeloste navigatie-bugs per fase

## v11.09

- 30-dagen automatische Archief-cleanup via Vercel Cron
  (`app/api/cleanup-archief/route.ts` + `vercel.json`) —
  zie docs/design-baseline-v2.md sectie 10.4

## v11.06

- **Bibliotheek-scherm** toegevoegd (BibliotheekView.tsx) — algeheel
  overzicht van alle snippets, los van CategoryView. Tabs: Alle /
  Favorieten / Categorieën, met sortering. Bereikbaar via "Bekijk
  alles" op Home
- Snippet-rijen in Bibliotheek: geen gekleurde vlakken meer, subtiele
  1px donkerblauwe rand, favoriet = blauwe rand + blauw hart
  (volgens goedgekeurde preview-bibliotheek.html)
- **Profiel-scherm** toegevoegd (ProfielView.tsx) — bereikbaar via
  icoon rechtsboven op Home. Bevat Account/Instellingen (placeholders)
  en Archief
- **Archief** verplaatst naar Profiel — geen losse navigatie-knop.
  Toont verwijderde snippets met verwijderdatum en dagen resterend
- **Soft-delete systeem**: `archived: boolean` vervangen door
  `deletedAt?: string` in lib/types.ts. "Verwijderen" in DetailView
  verplaatst nu naar Archief (30 dagen) i.p.v. direct te wissen
- lib/db.ts: nieuwe functies `softDeleteSnippet()`,
  `daysUntilPermanentDelete()`. `deleteSnippet()` nu alleen gebruikt
  voor definitieve verwijdering vanuit Archief
- Automatische migratie: bestaande snippets met `archived: true`
  krijgen bij eerste keer laden een `deletedAt` timestamp

## v10.06

- **Design Baseline v2.0 volledig geïmplementeerd** (Fase 1 t/m 4 in
  één sessie afgerond)
- HomeView.tsx nu de standaard startscherm (was: ListView)
- CategoryView.tsx toegevoegd — categorieën zijn nu losse schermen
  ipv inline uitklappende lijst
- SearchView.tsx toegevoegd — volledig scherm zoeken vanuit Home
- Continue Working toont echte laatst-geopende snippet met relatieve
  tijd (zojuist/min/uur/dagen geleden) en taal-badge
- Empty states: nieuwe gebruiker (0 snippets), geen favorieten
- Lijn-iconen (SVG) vervangen emoji's in categorie-weergave
- Kleurensysteem v2.0 toegepast (#0B1020 basis, #4F8CFF accent)
- Nieuwe routing in app/page.tsx: home/category/search/detail/edit/new
  met `returnTo` state voor correcte terug-navigatie
- `components/ListView.tsx` niet meer actief gebruikt — nog wel in
  repo aanwezig als fallback, verwijderen is Fase 6 (handmatig)

## v09.06

- UI redesign: stats balk, iconen per categorie, beschrijving onder naam
- Donkerblauwe achtergrond (#0f172a)
- Witte rand (rgba 0.07) bij ingeklapte categorieën
- Gekleurde rand (2px) bij uitgeklapte categorieën
- CAT_CONFIG hardcoded in ListView.tsx — 10 vaste categorieën
  (AI Prompts, Config, Bug Fix, Ideeën, UI, Apps, Code, Scripts,
  Documentatie, Games)
- Categorieën herstructureerd: Proggie→Apps, Machines→Scripts,
  Game+Games→Games, Les→Documentatie
- EditView ALL_CATS bijgewerkt naar nieuwe lijst
- Wegtikken van popups gefixed (tik buiten popup sluit hem)
- Python UTF-8 zip methode ingevoerd (ipv bash zip -j)
- Zip met correcte mapstructuur (geen prefix-map, paden vanaf repo root)
- README.md volledig herschreven en uitgebreid

## v08.06

- Blauw accent thema (#3b82f6)
- Archief systeem (archiveren + terugzetten)
- Filter en sorteer (nieuwste/oudste/A-Z)
- Tag filter chips
- Notities popup in lijst (📝 icoon)
- Datum tonen in About tab (aangemaakt/bijgewerkt)
- Scroll positie bewaard bij terugkeren naar lijst
- Categorie blijft open bij terugkeren
- Kopieer Alles knop bovenaan DetailView
- URL auto-fill `/add` route geïntroduceerd
- Clipboard knop bij `/add` (voor lange code >1200 tekens)
- Russian doll bug gefixed — `forceNew` prop op EditView voorkomt
  dat oude snippet-data wordt meegesleept naar nieuw formulier

## v07.05

- Firebase custom categorieën (settings/categories document)
- Bestand hernoemen in EditView (potlood-knop)
- Horizontale code-tabs in DetailView bij meerdere bestanden
- TYPE handmatige selector verwijderd — automatische detectie
  (prompt/instructie/code) op basis van codeBlocks + description
- iOS Safari zoom-fix: fontSize 16 in alle textareas
- Viewport-fix: overflow:hidden op fullscreen containers

## v30.04 (vroege versie)

- Stijl B lijst-layout (kaart per categorie)
- "Laatst geopend" sectie bovenaan
- Favorieten ingeklapt tonen
- Scroll-naar-top bij openen van snippet

---

*Voor de volledige technische reden achter elke fix, zie
README.md sectie 9 "Bekende Problemen en Oplossingen".*
