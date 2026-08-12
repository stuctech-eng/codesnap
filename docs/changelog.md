# CodeSnap — Changelog

> Chronologisch overzicht van alle wijzigingen.
> Voor actieve planning zie docs/roadmap.md.

---

## Ongepland / In behandeling

- Fase 5 (responsive/PWA polish) uit docs/roadmap.md — doorlopend
- Autocomplete voor Project/Onderdeel-velden in EditView — nog niet
  gebouwd, bewuste beperking (zie docs/audit-hierarchie.md sectie 11)

---

## v12.15

- **Structurele correctie — Onderdeel werkte niet als submap.**
  Sinds Fase H4 was het diepste niveau van de hiërarchie
  (Categorie → Project → Onderdeel → Snippet) altijd een platte
  lijst, ongeacht ingevulde Onderdeel-waarden — "Ideeën" of
  "Auth/Toegang" verscheen dus nooit als eigen, tikbare submap,
  in tegenspraak met de oorspronkelijke specificatie
  (docs/audit-hierarchie.md sectie 4.2, die dit al vanaf het begin
  zo beschreef)
- `components/DrillDownView.tsx`: nieuw derde niveau `"snippets"`
  toegevoegd — `"component"` groepeert nu net als `"project"` op
  zijn eigen veld; alleen `"snippets"` is nog het echte eindpunt
- `app/page.tsx`: nieuwe view `snippets`, state `activeComponent`,
  functies `openComponent()` en `jumpToComponentList()`
- Breadcrumb op het diepste niveau toont nu vier segmenten:
  Bibliotheek / Categorie / Project / Onderdeel
- Categorieën/projecten zonder Onderdeel-gebruik blijven exact
  zoals voorheen — direct platte lijst, geen regressie
- Zie docs/audit-hierarchie.md sectie 13 voor volledige analyse van
  wat er mis ging en waarom

## v12.14

- **Bugfix — categorieën met projecten gingen vanuit Home niet naar
  het Project-niveau.** Fase H6 had de contextuele drill-down-logica
  ("heeft deze categorie snippets met een project-waarde? toon dan
  eerst Project-niveau") alleen gebouwd in `BibliotheekView.tsx`.
  `HomeView.tsx` heeft echter zijn eigen, losse categorieën-lijst en
  miste deze logica — tikken op "Apps" vanuit Home ging daardoor
  altijd direct naar de platte snippet-lijst, ook als er (bijv.)
  een snippet met project "CodeSnap" tussen zat
- `components/HomeView.tsx`: dezelfde `categoriesWithProjects`-
  berekening en contextuele click-handler toegevoegd die
  `BibliotheekView.tsx` al had sinds Fase H6
- `app/page.tsx`: nieuwe `onOpenProjectList`-prop doorgegeven aan
  `HomeView` (de onderliggende `openProjectList`-functie bestond
  al sinds Fase H4)
- Nu consistent: categorie met projecten gaat naar Project-niveau
  vanuit ZOWEL Home als Bibliotheek; categorie zonder projecten
  blijft in beide gevallen plat, zoals altijd

## v12.13

- **Bugfix — verwijderde snippet bleef staan in "Verder waar je
  gebleven was".** Als de laatst-geopende snippet daarna verwijderd
  werd (naar Archief), bleef hij toch zichtbaar in de Continue
  Working-hero op Home, inclusief werkende "Doorgaan"-knop naar een
  inmiddels verwijderde snippet
- `app/page.tsx`: `lastOpened` filtert nu ook op `!s.deletedAt` —
  een verwijderde snippet verdwijnt hierdoor correct uit de
  Continue Working-sectie; Home valt dan terug op de lege staat
  ("Begin met je eerste snippet") als er geen andere geldige
  laatst-geopende snippet is
- `active` (de snippet in DetailView zelf) is bewust NIET gewijzigd
  — die moet nog zichtbaar blijven op het moment van verwijderen
  zelf, vlak vóór de gebruiker teruggestuurd wordt

## v12.12

- **Bugfix — korte "0 snippets" flits direct na app-start.** Na de
  anonieme-authenticatie fix (v12.07) toonde de app soms even de
  lege staat ("Begin met je eerste snippet", "0 snippets") vlak na
  openen, ook met bestaande data — deze verdween vanzelf na een
  herlaad. Oorzaak: de app wachtte alleen op `authReady`, niet op de
  eerste daadwerkelijke Firestore-callback, waardoor `snips=[]`
  (de initiële state) heel even zichtbaar was
- `app/page.tsx`: nieuwe `dataReady`-state, wordt pas `true` bij de
  eerste `onSnapshot`-callback (ongeacht of die leeg of gevuld is).
  Laadscherm ("Laden...") blijft nu zichtbaar tot beide `authReady`
  én `dataReady` waar zijn
- Voor een écht nieuwe gebruiker (0 snippets) blijft de empty state
  gewoon correct verschijnen — het verschil is alleen dat de app nu
  wacht tot zeker is dat "leeg" ook echt "leeg" betekent, niet
  "nog niet geladen"

## v12.11

- **Standaard Onderdelen-patroon** — zie docs/audit-hierarchie.md
  sectie 12. Vast, herbruikbaar setje van zes Onderdeel-namen
  (Auth/Toegang, Core, UI, API, Bugs, Ideeën), toepasbaar binnen
  elk Project, i.p.v. steeds opnieuw verzonnen namen per project
- `components/EditView.tsx`: "Onderdeel" is nu een popup-keuzelijst
  (zelfde patroon als de bestaande Categorie-popup) met de zes
  vaste namen + "Eigen invoeren" voor afwijkende gevallen
- "Project" blijft een vrij tekstveld, maar toont nu
  autocomplete-suggesties (tikbare chips) op basis van Project-namen
  die al eerder gebruikt zijn binnen dezelfde categorie — voorkomt
  spelfout-varianten van dezelfde projectnaam
- `EditView` kreeg een nieuwe, optionele `allSnips`-prop om deze
  suggesties te kunnen berekenen; beide aanroepen in `app/page.tsx`
  bijgewerkt

## v12.10

- **Bugfix — Component-niveau toonde snippets als tikbare groep
  i.p.v. te openen.** Op het diepste niveau van de hiërarchie
  (Bibliotheek → Categorie → Project → Onderdeel) verscheen een
  snippet met een ingevulde Onderdeel-waarde onterecht als eigen
  tikbare "map" i.p.v. als openbare snippet — tikken deed niets
  (`onOpenNext` was daar terecht een lege functie, want er bestaat
  geen niveau na Component, maar de groepeerlogica probeerde daar
  toch nog op te groeperen)
- `components/DrillDownView.tsx`: op `level === "component"` worden
  nooit meer groepen gevormd — alle snippets in scope verschijnen nu
  altijd als platte, direct openbare lijst op dat niveau
- Sectie-labels aangepast: "Overig binnen X" alleen nog zichtbaar op
  Project-niveau wanneer er daadwerkelijk groepen zijn; Component-
  niveau toont voortaan simpelweg "Snippets" boven de lijst

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
