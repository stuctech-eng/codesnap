# CodeSnap — Audit: Bibliotheek Hiërarchische Structuur

<!-- update: H2 voortgang toegevoegd -->

> Audit uitgevoerd naar aanleiding van extern voorstel voor
> Categorie → Project/App → Onderdeel → Snippet navigatie.
> Status: AUDIT VOLTOOID + VOORSTEL DEFINITIEF VASTGESTELD.
> Nog GEEN code gebouwd — implementatie is de volgende stap.

---

## 1. Bevindingen — huidige situatie

### 1.1 Snippet interface (`lib/types.ts`)

```typescript
export interface Snippet {
  id?: string;
  title: string;
  description: string;
  code: string;
  codeBlocks: CodeBlock[];
  notes?: string;
  snippetType?: SnippetType;
  category: string;        // ← één plat categorie-veld
  tags: string[];
  favorite: boolean;
  archived?: boolean;      // legacy
  deletedAt?: string;      // soft-delete
  createdAt?: string;
  updatedAt?: string;
}
```

**Bevinding:** er bestaat geen `project` of `component` veld
(in het oorspronkelijke externe voorstel nog "section" genoemd,
zie sectie 4.0 voor de terminologie-beslissing). De gevraagde
hiërarchie (Categorie → Project → Onderdeel) heeft vandaag alleen
het `category` veld tot z'n beschikking — plat, géén tweede of
derde niveau.

### 1.2 Categorie-implementatie (`components/HomeView.tsx`)

`CAT_CONFIG` is een **hardcoded object** met 10 vaste categorieën
(AI Prompts, Apps, Documentatie, Bug Fix, Ideeën, Config, Games,
Scripts, UI, Code), elk met kleur + icoon. Onbekende categorieën
vallen terug op `DEFAULT_COLORS` + een generiek icoon.

**Bevinding:** categorieën zijn nu een gesloten, hardcoded lijst
in de UI-laag — niet dynamisch uit de database opgebouwd (op
`customCats` na, zie 1.5). Een nieuw niveau ("welke app binnen
Apps") bestaat nergens in deze structuur.

### 1.3 Bibliotheek-scherm (`components/BibliotheekView.tsx`)

```typescript
type FilterTab = "alle" | "favorieten" | "categorieen";
```

Drie platte tabs. Bij tab "categorieen" wordt een simpele lijst
getoond van `Array.from(new Set(activeSnips.map(s => s.category)))`
— één druk op een categorie stuurt direct door naar `CategoryView`
met alle snippets van die categorie in een platte lijst.

**Bevinding:** er is precies één navigatie-sprong tussen
Bibliotheek en een lijst snippets. Geen tussenniveau aanwezig of
voorbereid.

### 1.4 Filtering, favorieten, sortering

- Favorieten: `Snippet.favorite: boolean`, simpele filter
- Sortering: nieuwste/oudste/A-Z, werkt op `createdAt`/`title`
- Filtering: uitsluitend op `category` (exacte match) en vrije
  tekst-zoekopdracht (titel/beschrijving/tags) in `SearchView.tsx`

**Bevinding:** geen van deze mechanismen is voorbereid op een
tweede filterdimensie (project) — zou overal een extra laag
filtering moeten krijgen.

### 1.5 Opslag/database (`lib/db.ts`)

Relevante functies:
```
listenSnippets()     — realtime listener, geen niveau-logica
addSnippet()          — schrijft plat document
updateSnippet()       — partial update
softDeleteSnippet()   — zet deletedAt
restoreSnippet()      — wist deletedAt
loadCustomCats() / saveCustomCats()
                       — aparte Firestore document `settings/categories`
                         met array van strings — géén structuur,
                         géén relatie tot projecten
```

**Bevinding:** Firestore-structuur is één platte `snippets`
collectie. Er is precedent voor een aparte settings-collectie
(`settings/categories`), wat aangeeft dat een vergelijkbare
aanpak (`settings/projects` ofzo) zou passen bij de bestaande
architectuur — maar dit bestaat nog niet.

### 1.6 Delete-functionaliteit

Volledig soft-delete via `deletedAt`, met Archief-scherm en
30-dagen Vercel Cron cleanup (v11.09, al afgerond). Geen
aanpassing nodig hiervoor — dit blijft ongewijzigd bij een
hiërarchie-uitbreiding.

### 1.7 Routing (`app/page.tsx`)

```typescript
type View = "home" | "category" | "search" | "bibliotheek" |
            "profiel" | "detail" | "edit" | "new";
```

**Bevinding:** platte view-state, geen stack/breadcrumb-mechanisme.
Elke view kent maar één "vorig scherm" via de losse `returnTo`
state. Een 3-niveaus-diepe navigatie (Apps → CoachOS → Recovery)
vereist ofwel meerdere nieuwe view-types, ofwel een generieke
"drill-down" state die het huidige patroon niet heeft.

### 1.8 Categorie-invoer in EditView (`components/EditView.tsx`)

`ALL_CATS` is een tweede, losse hardcoded lijst (moet in sync
blijven met `CAT_CONFIG` in HomeView — dit is al een bestaande
technische schuld, zie sectie 3). Custom categorieën kunnen
worden toegevoegd via een tekstveld, opgeslagen in
`settings/categories`.

**Bevinding:** er is geen equivalent veld/invoer voor "project"
of "onderdeel" — dat zou volledig nieuw moeten worden toegevoegd
aan het formulier.

---

## 2. Samenvatting — wat ontbreekt volledig

| Onderdeel gevraagd in voorstel | Bestaat vandaag? |
|---|---|
| `project` veld op Snippet | ❌ Nee |
| `section` veld op Snippet | ❌ Nee |
| Meerdere navigatie-niveaus (drill-down) | ❌ Nee — max 1 sprong |
| Breadcrumb / "waar ben ik"-indicator | ❌ Nee |
| Dynamische projecten-lijst per categorie | ❌ Nee |
| Formuliervelden voor project/onderdeel | ❌ Nee |
| Filtering op project (naast categorie) | ❌ Nee |

---

## 3. Bijkomende observatie — bestaande technische schuld

Onafhankelijk van dit voorstel: `CAT_CONFIG` (HomeView.tsx) en
`ALL_CATS` (EditView.tsx) zijn **twee aparte hardcoded lijsten**
die handmatig synchroon gehouden moeten worden. Bij het toevoegen
van een hiërarchie-niveau zou een vergelijkbare valkuil ontstaan
tenzij er nu bewust voor een centrale bron gekozen wordt.

---

## 4. Voorstel — DEFINITIEF (bijgewerkt na gebruikersreview)

> Deze sectie vervangt het eerdere, voorzichtigere voorstel.
> Kernbeslissing: **generiek datamodel, contextuele UI.**

### 4.0 Twee correcties op het oorspronkelijke voorstel

**Correctie 1 — terminologie:** `section` is te algemeen. Het
gaat om een onderdeel/module binnen een app/project. Definitief
gekozen veldnaam: **`component`**.

Reden voor `component` boven `subCategory`: het woord beschrijft
directer wat het is (een bouwsteen binnen een app), en botst niet
met het bestaande `category`-concept — `subCategory` zou suggereren
dat het een verfijning van categorie is, terwijl het eigenlijk een
verfijning van *project* is.

**Correctie 2 — UX bij invoer:** geen "veld verschijnt pas als er
al een project bestaat"-logica. In plaats daarvan: bij het kiezen
van categorie "Apps" (of elke categorie waar de gebruiker ze wil
gebruiken) zijn **Project** en **Onderdeel** gewoon direct
zichtbare, optionele velden in het formulier — vanaf de eerste
snippet. De structuur ontstaat organisch doordat de gebruiker ze
invult, niet doordat het systeem wacht tot er al iets bestaat.

### 4.1 Datamodel (definitief)

```typescript
export interface Snippet {
  // ...bestaande velden ongewijzigd...
  category: string;
  project?: string;    // NIEUW — optioneel, geen breaking change
  component?: string;  // NIEUW — optioneel, geen breaking change
                        // (was "section" in eerste versie van dit voorstel)
}
```

Beide nieuwe velden optioneel. Bestaande snippets zonder
`project`/`component` blijven plat onder hun categorie vallen —
geen migratie nodig.

### 4.2 Navigatie — generiek mechanisme, contextueel resultaat

Het navigatie-mechanisme zelf is **niet categorie-specifiek** —
elke categorie kan in principe drie niveaus diep gaan. Maar het
niveau dat daadwerkelijk verschijnt, hangt af van wat er is
ingevuld:

```
Bibliotheek → Categorieën → Apps
  → snippets hebben project ingevuld → toon projecten-lijst
      → CoachOS → snippets hebben component ingevuld → toon lijst
          → Recovery → platte snippet-lijst

Bibliotheek → Categorieën → Bug Fix
  → geen enkele snippet heeft project ingevuld → direct platte lijst
      (identiek aan huidig CategoryView-gedrag, geen wijziging zichtbaar)

Bibliotheek → Categorieën → Ideeën
  → zelfde als Bug Fix — blijft plat
```

Het onderscheid zit dus niet in "welke categorie mag dit", maar in
"heeft de gebruiker het voor déze categorie gebruikt". Dat is
precies het "generiek datamodel, contextuele UI"-principe.

### 4.3 EditView — velden altijd zichtbaar, niet voorwaardelijk

Na het Categorie-veld komen direct twee nieuwe, optionele velden:

```
Categorie
[ Apps                    ▾ ]

Project
[ Tik om in te voeren...     ]

Onderdeel
[ Tik om in te voeren...     ]
```

Beide leeg laten is toegestaan — dan gedraagt de snippet zich
zoals nu (plat onder de categorie). Autocomplete/suggesties op
basis van al bestaande `project`-waarden binnen dezelfde categorie
is een logische toevoeging (zelfde patroon als `customCats` nu al
werkt), maar geen blokkerende vereiste voor de eerste versie.

### 4.4 Nieuwe componenten (schatting, ongewijzigd t.o.v. vorige versie)

- `ProjectListView.tsx` — toont projecten binnen een categorie
- `ComponentListView.tsx` — toont onderdelen binnen een project
  (hernoemd van `SectionListView.tsx`)
- Breadcrumb-component — toont bijv. `Apps / CoachOS / Recovery`
  met tik-navigatie terug naar elk niveau

Beide lijst-componenten zijn structureel vrijwel identiek — te
overwegen als één generiek component met een `level`-prop, om de
`CAT_CONFIG`/`ALL_CATS`-duplicatie-valkuil (zie audit sectie 3)
niet te herhalen op dit nieuwe niveau.

### 4.5 Routing

`View` type uitbreiden met `"project"` en `"component"`. De
huidige enkele `returnTo`-waarde wordt een simpele stack
(bijv. `returnStack: View[]`) zodat terugnavigatie door meerdere
niveaus correct werkt — kleine, gerichte wijziging op de
bestaande routing, geen herbouw.

---

## 5. Wat dit NIET wordt (expliciet, ter voorkoming van scope creep)

- Geen fysieke bestandsstructuur — blijft één platte Firestore
  `snippets` collectie, `project`/`component` zijn gewoon extra
  string-velden op het document
- Geen verplichte migratie van bestaande snippets
- Geen aparte database/tabel voor projecten — projecten worden
  net als categorieën afgeleid uit de daadwerkelijk gebruikte
  waarden in snippets (zelfde patroon als nu al voor categorieën)
- Geen wijziging aan Archief, soft-delete, of de Cron-cleanup

---

## 6. Beantwoorde ontwerpvraag (was open, nu vastgelegd)

**Antwoord:** niet beperken tot Apps. Het mechanisme is generiek
en technisch beschikbaar voor elke categorie — maar de UI toont
alleen extra niveaus waar de gebruiker ze daadwerkelijk gebruikt.
Categorieën als "Bug Fix" of "Ideeën" blijven dus plat zonder dat
daar een aparte regel voor nodig is; het is een natuurlijk gevolg
van "geen ingevulde project-waarde → geen extra niveau te tonen".

---

*Audit uitgevoerd: augustus 2026. Geen productiecode aangepast.
Volgende stap: gebruiker beoordeelt dit voorstel voordat bouwen
begint — zie ook de instructie in het oorspronkelijke document:
"Audit → voorstel → minimale wijziging → implementatie → testen."*

---

## 7. Codebase-verificatie (uitgevoerd vóór implementatie)

> Uitgevoerd: opnieuw alle relevante bronbestanden opgehaald van
> GitHub (niet vertrouwd op eerdere sessie-kennis) en vergeleken
> met de aannames in dit document.

| Bestand | Verwacht (dit document) | Werkelijk aangetroffen | Conflict? |
|---|---|---|---|
| `lib/types.ts` | `Snippet` zonder `project`/`component` | Exact zo, ongewijzigd | ✅ Geen |
| `app/page.tsx` | `type View = "home" \| "category" \| ...` (8 varianten) | Exact zo, `VERSION = "11.09"` | ✅ Geen |
| `components/BibliotheekView.tsx` | Bestaat, met `FilterTab` | Bevestigd aanwezig (HTTP 200) | ✅ Geen |
| `components/CategoryView.tsx` | Bestaat, platte snippet-lijst per categorie | Bevestigd aanwezig (HTTP 200) | ✅ Geen |
| `lib/db.ts` | 10 export-functies, incl. soft-delete | Exact dezelfde 10 functies aangetroffen | ✅ Geen |

**Conclusie: geen conflicten.** De codebase is sinds de oorspronkelijke
audit niet gewijzigd op een manier die dit document beïnvloedt.
Het plan hieronder kan worden uitgevoerd zoals beschreven.

---

## 8. Implementatieplan per fase

> De hiërarchie-uitbreiding is **geen nieuw los redesign** — het is
> een uitbreiding van de al vastgelegde Bibliotheek-architectuur uit
> Design Baseline v2.0 sectie 9-10. Versienummering gaat door op de
> bestaande reeks (huidige stand: v11.09).

### Fase H1 — Datamodel (kleinste, meest risicoloze stap eerst)

**Bestanden:** `lib/types.ts`

```typescript
project?: string;
component?: string;
```

Geen migratie-script nodig — bestaande documenten missen deze
velden gewoon, wat `undefined` oplevert, wat overal al correct
wordt afgehandeld door optionele-veld-logica elders in de app.

**Test:** app moet na deze wijziging identiek functioneren aan
v11.09 — er verandert nog niets zichtbaars.

### Fase H2 — EditView: invoervelden

**Bestanden:** `components/EditView.tsx`

Twee nieuwe optionele tekstvelden na Categorie: "Project" en
"Onderdeel" — altijd zichtbaar, zoals vastgelegd in sectie 4.3.
Geen voorwaardelijke logica.

**Test:** nieuwe snippet aanmaken met project+component ingevuld,
en één zonder — beide moeten correct opslaan. Bestaande snippets
bewerken mag niet breken.

### Fase H3 — Routing: stack i.p.v. enkele returnTo

**Bestanden:** `app/page.tsx`

`returnTo: View` wordt `returnStack: View[]`. Kleine, geïsoleerde
wijziging — de bestaande `goHome()`/`openSnippet()`-functies
krijgen een `push`/`pop` in plaats van een directe toewijzing.

**Test:** alle bestaande navigatie (Home → Category → Detail →
terug, Home → Bibliotheek → Detail → terug, etc.) moet identiek
blijven werken vóórdat er ook maar één nieuw scherm bestaat.
Dit is de fase met het hoogste risico op regressie — apart en
eerst getest vóórdat H4/H5 beginnen.

### Fase H4 — ProjectListView + ComponentListView

**Bestanden (nieuw):** `components/ProjectListView.tsx`,
`components/ComponentListView.tsx`

Beide herbruiken de visuele stijl van `BibliotheekView.tsx`
(categorieën-tab) — geen nieuwe stijl-taal nodig. Te overwegen:
één generiek component met een `level`-prop in plaats van twee
bijna-identieke bestanden (voorkomt de CAT_CONFIG/ALL_CATS-valkuil
die al in sectie 3 als bestaande schuld is benoemd).

**Test:** navigeren Apps → CoachOS → Recovery → snippet-lijst,
en terug omhoog door elk niveau.

### Fase H5 — Breadcrumb-component

**Bestanden (nieuw):** klein herbruikbaar component, ingezet in
H4's schermen. Toont bijv. `Apps / CoachOS / Recovery`, elk
segment tikbaar om direct naar dat niveau te springen (niet alleen
één stap terug).

### Fase H6 — Contextuele drill-down in Bibliotheek

**Bestanden:** `components/BibliotheekView.tsx`

De categorieën-tab krijgt de "heeft deze categorie snippets met
een project-waarde?"-check uit sectie 4.2. Zo ja: tik opent
`ProjectListView` in plaats van direct `CategoryView`. Zo nee:
huidig gedrag blijft exact behouden.

**Test:** categorie zonder projectgebruik (bijv. "Bug Fix") moet
zich identiek gedragen aan vóór deze hele uitbreiding — dit is de
belangrijkste regressietest van het hele plan.

---

## 9. Volgorde-advies

```
H1 (datamodel) → H2 (invoer) → H3 (routing-stack, apart getest)
    → H4 (nieuwe schermen) → H5 (breadcrumb) → H6 (koppeling in Bibliotheek)
```

H3 is bewust apart en vóór H4/H5/H6 geplaatst: een routing-wijziging
die de bestaande navigatie breekt is het duurste type fout om achteraf
te debuggen. Eerst bewijzen dat de stack-gebaseerde navigatie voor
*bestaande* schermen blijft werken, dan pas nieuwe schermen toevoegen
die er gebruik van maken.

---

## 10. Voortgang

| Fase | Status |
|---|---|
| H1 — Datamodel (`project`/`component` velden) | ✅ Afgerond (v12.02) |
| H2 — EditView invoervelden | ✅ Afgerond (v12.03) |
| H3 — Routing: returnStack | ✅ Afgerond (v12.04) |
| H4 — ProjectListView + ComponentListView | ✅ Afgerond (v12.05) |
| H5 — Breadcrumb-component | ✅ Afgerond (v12.06) |
| H6 — Contextuele drill-down in Bibliotheek | ✅ Afgerond (v12.08) |

**Fase H1 details:**
- `lib/types.ts` — `project?: string` en `component?: string`
  toegevoegd aan `Snippet` interface
- `lib/db.ts` — `migrateSnippet()` uitgebreid om beide velden uit
  Firestore te lezen
- Geen migratie nodig — bestaande snippets krijgen `undefined` voor
  beide velden
- App-gedrag na deze fase: onveranderd zichtbaar — nog geen UI om
  deze velden in te vullen of te gebruiken

**Fase H6 details — LAATSTE FASE, plan H1-H6 hiermee compleet:**
- `components/BibliotheekView.tsx` — nieuwe `onOpenProjectList`-prop,
  plus `categoriesWithProjects`: een Set die per categorie bepaalt of
  er minstens één snippet met een `project`-waarde in zit
- Categorieën-tab: tik op categorie gaat nu naar `onOpenProjectList`
  ALLEEN als die categorie projecten heeft; anders (zoals altijd)
  naar `onOpenCategory` — de exacte contextuele regel uit
  sectie 4.2, nu daadwerkelijk gekoppeld
- `app/page.tsx` — bestaande `openProjectList`-functie (al gebouwd
  in Fase H4, tot nu toe ongebruikt) wordt nu doorgegeven
- Gesimuleerd vóór levering: categorie zonder projectgebruik (bijv.
  "Bug Fix") gedraagt zich exact als voorheen; categorie met
  projectgebruik (bijv. "Apps") gaat nu naar het Project-niveau

**Hiermee is de volledige hiërarchische Bibliotheek-uitbreiding
(Categorie → Project → Onderdeel → Snippet) functioneel compleet:**
```
Bibliotheek → Categorieën-tab → tik "Apps" (heeft projecten)
  → Project-niveau: CoachOS, CodeSync, ORBIT
    → tik "CoachOS" → Component-niveau: Recovery, Home, ...
      → tik "Recovery" → platte snippet-lijst
        → tik snippet → Detail

Bibliotheek → Categorieën-tab → tik "Bug Fix" (geen projecten)
  → direct naar CategoryView, zoals altijd — ongewijzigd
```

**Fase H5 details:**
- `components/Breadcrumb.tsx` (nieuw) — kleine, herbruikbare
  component. Toont segmenten gescheiden door `/`; laatste segment
  is de huidige positie (niet tikbaar, grijs), overige segmenten
  zijn blauw en tikbaar
- `DrillDownView.tsx` kreeg een optionele `breadcrumb`-prop —
  alleen het Component-niveau (diepste, waar het meeste waarde
  zit) geeft nu segmenten mee: `Bibliotheek / [Categorie] / [Project]`
- **Belangrijk technisch verschil met gewone navigatie:** de
  breadcrumb gebruikt NIET `popView()` (die gaat altijd precies één
  stap terug). In plaats daarvan zijn er specifieke "jump"-functies
  (`jumpToBibliotheek`, `jumpToProjectList`) die de `returnStack`
  EXPLICIET instellen op wat die correct zou moeten zijn na de
  sprong. Reden: meerdere `popView()`-aanroepen na elkaar afvuren
  zou onbetrouwbaar kunnen worden door React's asynchrone
  state-updates — expliciet instellen is voorspelbaarder.
- Gesimuleerd vóór levering: normaal drillen naar Component, dan via
  breadcrumb terugspringen naar een tussenniveau, en gecontroleerd
  of een daarop volgende `popView()` nog steeds correct gedrag geeft
  (dus niet alleen "springt de breadcrumb goed", maar ook "blijft de
  stack daarna kloppen voor gewone terug-navigatie").

**Fase H5 — wat nog NIET is gedaan (bewust, hoort bij H6):**
- Project-niveau (`level="project"`) krijgt nog geen breadcrumb-prop
  mee — pas zinvol zodra H6 het Project-niveau daadwerkelijk
  bereikbaar maakt vanuit Bibliotheek

**Fase H4 details:**
- `components/DrillDownView.tsx` (nieuw) — één generiek component
  voor zowel het Project- als het Component-niveau, aangestuurd via
  een `level`-prop, zoals vastgelegd in sectie 4.4 (voorkomt de
  CAT_CONFIG/ALL_CATS-duplicatie-valkuil op dit nieuwe niveau)
- Snippets zonder project- of component-waarde verschijnen gewoon
  als platte lijst onderaan hetzelfde scherm ("Overig binnen X") —
  geen aparte lege staat nodig, ze gaan simpelweg niet verloren
- `app/page.tsx`: nieuwe view-types `"project"` en `"component"`,
  plus `activeProject`-state naast het bestaande `activeCategory`
- **Bijkomende, noodzakelijke correctie tijdens H4:** `CategoryView`
  gebruikte nog `onBack={goHome}` direct, net als `openCategory` nog
  `setView("category")` direct gebruikte i.p.v. de stack. Dit was in
  H3 onopgemerkt gebleven omdat Categorie destijds alleen vanuit Home
  bereikbaar was — toevallig identiek gedrag. Zodra Categorie ook
  vanuit Bibliotheek bereikbaar wordt (H6), zou dit dezelfde bug
  hebben veroorzaakt als eerder bij Bibliotheek/Profiel in H3. Nu
  vooraf gecorrigeerd: beide gebruiken `pushView`/`popView`.
- Alle navigatiepaden opnieuw gesimuleerd vóór levering, inclusief
  het diepste pad (Bibliotheek → Project → Component → Detail →
  meerdere keren terug) — zie tabel.

| Scenario | Resultaat |
|---|---|
| Home → Categorie → Detail → terug | ✅ Categorie |
| Home → Categorie → terug | ✅ Home |
| Bibliotheek → Project → Component → terug | ✅ Project |
| ...nog een keer terug | ✅ Bibliotheek |
| ...nog een keer terug | ✅ Home |
| Component → Detail → terug | ✅ Component |

**Fase H4 — wat nog NIET is gedaan (bewust, hoort bij H6):**
- `BibliotheekView.tsx` roept `openProjectList`/`openProject` nog
  nergens aan — de categorieën-tab gaat nog altijd direct naar
  `CategoryView`, ongeacht of er projecten zijn ingevuld. De
  contextuele beslissing ("heeft deze categorie projecten? toon dan
  Project-niveau, anders direct CategoryView") is expliciet Fase H6.
- Breadcrumb met tikbare tussensegmenten (Apps / CoachOS / Recovery)
  is Fase H5 — `DrillDownView` heeft nu alleen een simpele
  1-stap-terug knop, consistent met de rest van de app.

**Fase H3 — belangrijke correctie tijdens implementatie:**

De eerste versie van `pushView(from, next)` nam een handmatig
`from`-argument aan de aanroepzijde. Handmatige simulatie van alle
navigatiepaden (vóór levering, dus vóór dit ooit live kwam) toonde
een echte bug: `HomeView.onOpenBibliotheek` en `onOpenProfiel`
gingen nog via het oude `setView(...)` direct, niet via `pushView`.
Gevolg: Bibliotheek → snippet → Detail → terug bracht de gebruiker
naar Home in plaats van terug naar Bibliotheek.

**Fix:** het mechanisme is herontworpen zodat `pushView(next)` de
**huidige `view`-state** zelf op de stack zet, in plaats van een
door de aanroeper handmatig opgegeven `from`-waarde. Dit maakt de
aanroep simpeler (`pushView("detail")` i.p.v.
`pushView("home", "detail")`) én voorkomt structureel dat een
vergeten `pushView`-aanroep ergens tot een foute terugkeer leidt —
er is nu nog maar één plek (de `view`-state zelf) die ooit "waar
ben ik nu" hoeft bij te houden.

Alle navigatiepaden zijn opnieuw handmatig gesimuleerd tegen de
gecorrigeerde code vóór levering, inclusief het scenario dat eerder
faalde. Zie onderstaande tabel.

| Scenario | Resultaat |
|---|---|
| Home → Detail → terug | ✅ Home |
| Home → Bibliotheek → Detail → terug | ✅ Bibliotheek |
| ...en daarna nog een keer terug | ✅ Home |
| Home → Categorie → Detail → terug | ✅ Categorie |
| Home → Zoeken → Detail → terug | ✅ Zoeken |
| Home → Detail → Nieuw → annuleer | ✅ Detail |
| Home → Nieuw → opslaan | ✅ Home |
| Home → Profiel → terug | ✅ Home |

**Fase H3 details:**
- `app/page.tsx` — `returnTo: View` (enkele waarde) vervangen door
  `returnStack: View[]` met `pushView(from, next)` en `popView()`
  helper-functies
- Gedrag exact behouden voor alle bestaande navigatie: elke plek
  die voorheen `setReturnTo(x)` + `setView(y)` deed, doet nu
  `pushView(x, y)`; elke plek die `setView(returnTo)` deed, doet nu
  `popView()`
- `goHome()` reset de stack naar `["home"]` — voorkomt dat een oude,
  diepe stack blijft hangen als de gebruiker via Home-knop terugkeert
- Edit-flow (`detail ↔ edit`) bewust NIET via de stack gerouteerd —
  dat gebruikte `returnTo` ook nooit, blijft directe `setView()`
  zoals voorheen
- Dit is de laatste fase vóór nieuwe schermen worden toegevoegd
  (H4) — de stack is nu bewezen te werken met de bestaande navigatie
  vóórdat er iets nieuws op wordt gebouwd

**Fase H2 details:**
- `components/EditView.tsx` — twee nieuwe velden "Project" en
  "Onderdeel" toegevoegd, direct zichtbaar na Categorie (geen
  voorwaardelijke logica, zoals vastgelegd in sectie 4.3)
- Beide zijn simpele tekstvelden via het bestaande FieldRow/
  FullScreenField-patroon (zelfde als Titel/Beschrijving/Notities)
  — geen aparte popup-selector, geen autocomplete in deze fase
- `save()` gebruikt al `{ ...form }`, dus de nieuwe velden werden
  automatisch meegenomen zonder die functie te hoeven wijzigen
- App-gedrag na deze fase: velden zijn zichtbaar en werkend, maar
  worden nog nergens in Bibliotheek/CategoryView gebruikt voor
  navigatie — dat komt in H4/H6

---

## 11. Plan afgerond

Alle zes fasen (H1 t/m H6) zijn voltooid en gesimuleerd/getest
vóór levering. De hiërarchische Bibliotheek-structuur uit dit
document is nu volledig geïmplementeerd in productie (v12.08).

**Bekende, bewuste beperkingen (geen bugs, ontwerpkeuzes):**
- Geen autocomplete op Project/Onderdeel-velden in EditView —
  gebruiker typt vrij, geen suggesties uit bestaande waarden
  (zie sectie 4.3: "geen blokkerende vereiste voor de eerste versie")
- `DrillDownView`'s eigen terugknop is 1-staps (via `popView`); de
  volledige tikbare breadcrumb zit alleen op het Component-niveau

Vervolgstappen (indien gewenst, niet gepland als aparte fase):
- Autocomplete/suggesties voor Project/Onderdeel op basis van al
  gebruikte waarden binnen dezelfde categorie (zelfde patroon als
  bestaande `customCats`)
- Breadcrumb ook op Project-niveau tonen

---

## 12. Standaard Onderdelen-patroon (toegevoegd na gebruik, augustus 2026)

> Status: VASTGESTELD EN GEBOUWD (v12.11)

### 12.1 Aanleiding

Na oplevering van Fase H1-H6 bleek het invullen van "Onderdeel" als
vrij tekstveld te fragmentarisch — elk project kreeg willekeurige,
niet-herbruikbare namen. Behoefte aan één klein, generiek patroon
dat voor elk project (bestaand of toekomstig) hetzelfde blijft.

### 12.2 Het vastgestelde patroon

Zes vaste Onderdeel-namen, van toepassing binnen élk Project:

```
Auth/Toegang   → logins, wachtwoorden, API keys
Core           → hoofdfunctionaliteit, business logica
UI             → schermen, componenten, styling
API            → integraties, webhooks, sync
Bugs           → project-specifieke fixes
Ideeën         → project-specifieke brainstorms
```

Dit is bewust **niet** hardcoded als beperking — de gebruiker kan
alsnog een eigen, afwijkende waarde intypen via "+ Eigen invoeren".
De zes namen zijn een snelkeuze, geen dwingend schema.

### 12.3 Twee losse features, beide gebouwd

**A — Onderdeel als keuzelijst (i.p.v. vrij tekstveld)**
- `components/EditView.tsx`: het "Onderdeel"-veld wordt een popup
  met de zes vaste namen + een invoerveld voor eigen tekst — zelfde
  UI-patroon als de bestaande Categorie-popup (`ALL_CATS` +
  `customCats`), voor consistentie geen nieuw interactiepatroon
- Voorkomt spelfout-varianten van dezelfde naam ("Core" vs "core"
  vs "Kern") die anders als aparte, foutieve onderdelen zouden
  verschijnen in de Bibliotheek-navigatie

**B — Project-autocomplete**
- Bij het typen in het "Project"-veld: suggesties op basis van
  Project-namen die al bij eerdere snippets (in dezelfde categorie)
  gebruikt zijn — voorkomt bijv. "CoachOS" vs "Coachos" vs "coach os"
- Simpeler dan A: geen aparte popup, gewoon een suggestielijst onder
  het bestaande tekstveld terwijl je typt

### 12.4 Wat NIET verandert

- Datamodel (`project?: string`, `component?: string`) blijft
  ongewijzigd — dit is een UI-verbetering, geen schema-wijziging
- Bestaande snippets met afwijkende, vrij ingetypte Onderdeel-namen
  blijven gewoon werken — geen migratie, geen dwingende herindeling

---

---

## 13. Structurele correctie — vierde niveau (Onderdeel als submap)
    toegevoegd (v12.15)

> Status: GECORRIGEERD EN GEBOUWD

### 13.1 Wat er fout was — eerlijke analyse

Bij Fase H4 (`DrillDownView.tsx`) is `level="component"` altijd
geïmplementeerd als eindpunt: een platte snippet-lijst, ongeacht of
er Onderdeel-waarden waren ingevuld. Dit was een **verkeerde lezing**
van de eigen, al vastgelegde specificatie in sectie 4.2:

```
CoachOS → snippets hebben component ingevuld → toon lijst
    → Recovery → platte snippet-lijst
```

Deze regel stond er al sinds het allereerste, door de gebruiker
goedgekeurde ontwerpvoorstel — "toon lijst" betekent een groeperende
tussenstap, net als bij Project, niet een directe sprong naar
snippets. Ook de testcase bij Fase H4 zelf ("navigeren Apps →
CoachOS → Recovery → snippet-lijst") beschrijft expliciet vier
stappen, niet drie. Dit is bij implementatie gemist en bleef
onopgemerkt totdat een gebruiker een Onderdeel invulde en merkte dat
het nergens als eigen, tikbare submap verscheen.

### 13.2 De correctie

`DrillDownView.tsx` kreeg een derde, symmetrisch niveau:

```
level="project"    → groepeert op project-veld (ongewijzigd)
level="component"  → groepeert NU op component-veld (was: platte lijst)
level="snippets"    → NIEUW — het echte eindpunt, platte lijst
```

Navigatie is nu, waar Onderdeel-waarden gebruikt worden:

```
Bibliotheek → Apps → CodeSnap → Auth/Toegang → CRON_SECRET
              (project)  (component-groep)  (snippet)
```

En blijft, waar geen Onderdeel-waarden gebruikt worden (bijv.
CoachOS met alleen platte snippets zonder component-veld), exact
zoals voorheen — direct de platte lijst, geen extra lege stap.

### 13.3 Wijzigingen

- `components/DrillDownView.tsx`: `Level`-type uitgebreid met
  `"snippets"`; groepeer- en ongegroepeerd-logica generiek gemaakt
  voor alle drie niveaus i.p.v. component-niveau als speciaal geval
- `app/page.tsx`: nieuwe view `"snippets"`, nieuwe state
  `activeComponent`, nieuwe functies `openComponent()` en
  `jumpToComponentList()` (laatste volgt hetzelfde "expliciete
  stack instellen"-patroon als de bestaande jump-functies uit Fase
  H5, niet een simpele extra `pushView`)
- `openProject()` navigeert nu naar het Component-niveau (dat zelf
  beslist of het groepeert of doorschiet naar snippets), in plaats
  van rechtstreeks naar het eindpunt
- Breadcrumb op het diepste niveau toont nu vier segmenten:
  Bibliotheek / Categorie / Project / Onderdeel

### 13.4 Verificatie vóór levering

Alle navigatiepaden gesimuleerd, inclusief het volledige vier-
niveaus-diepe pad en de breadcrumb-sprong terug naar het
Component-niveau (niet alleen terug-knop, ook het "spring naar
tussenliggend segment"-mechanisme uit Fase H5):

| Scenario | Resultaat |
|---|---|
| Home→Bibliotheek→Project→Component→Snippets→terug | ✅ Component |
| ...nog een keer terug | ✅ Project |
| ...nog een keer terug | ✅ Bibliotheek |
| ...nog een keer terug | ✅ Home |
| Breadcrumb-sprong van Snippets naar Component-lijst | ✅ Component |
| Project MET component-waarden (bijv. CodeSnap) | ✅ toont groep |
| Project ZONDER component-waarden (bijv. CoachOS) | ✅ blijft plat, geen regressie |

### 13.5 Belangrijke les — vastgelegd voor toekomstige fases

Bij het lezen van een eigen, eerder geschreven specificatie:
letterlijke voorbeelden en testcases (zoals "Apps → CoachOS →
Recovery → snippet-lijst" — vier stappen) wegen zwaarder dan een
eigen samenvattende aanname over hoeveel niveaus er "zouden moeten
zijn". Deze fout is ontdekt doordat de gebruiker het systeem
daadwerkelijk gebruikte met echte Onderdeel-waarden — een test die
niet in eerdere gesimuleerde scenario's zat, omdat die zich altijd
beperkten tot lege/platte projecten.

---

*Codebase-verificatie en implementatieplan toegevoegd: augustus 2026.
Fase H1 t/m H6 volledig afgerond (v12.08). Standaard Onderdelen-
patroon (sectie 12) toegevoegd en gebouwd (v12.11). Structurele
correctie vierde niveau (sectie 13) toegevoegd en gebouwd (v12.15).
Plan definitief gesloten — geverifieerd tegen eigen specificatie.*
