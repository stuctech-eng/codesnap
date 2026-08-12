# CodeSnap — Design Baseline v2.0

> Vastgelegd na gezamenlijke review (Claude + GPT + gebruiker)
> Status: GOEDGEKEURD — klaar voor gefaseerde implementatie

---

## 1. Aanleiding

De bestaande UI (v09.06) werkte functioneel goed maar had geen duidelijke
informatiehierarchie. Alles concurreerde om aandacht: zoekbalk, stats,
categorieën stonden allemaal op hetzelfde visuele niveau.

Een extern MASTER UI/UX REDESIGN document (zie sectie 8) vroeg om een
volledige redesign naar Apple-kwaliteit niveau. Dit is behandeld als
input, niet als blind te volgen opdracht — beoordeeld en verfijnd in
meerdere iteraties voordat productiecode werd aangeraakt.

---

## 2. Design filosofie

CodeSnap is geen CRUD-lijst van snippets. Het is een persoonlijke
bibliotheek die moet aanvoelen als "verder werken", niet als
"database doorzoeken".

Elke schermweergave beantwoordt primair de vraag:

> "Waar wil je mee verdergaan?"

## 3. Informatiehiërarchie (vastgelegd)

```
1. Groet + titel        (context, rustig)
2. Zoekbalk              (primaire actie)
3. Verder waar je was    (hero — belangrijkste sectie)
4. Favorieten            (conditioneel, alleen indien aanwezig)
5. Bibliotheek overzicht (één rustige regel, geen dashboard)
6. Categorieën           (simpele lijst, navigeert naar detail)
7. Nieuwe Snippet        (sticky onderaan, enige primaire CTA)
```

## 4. Vastgelegde ontwerpbeslissingen

### 4.1 Groet
- Dynamisch op tijdstip: Goedemorgen / Goedemiddag / Goedenavond
- Geen hardcoded naam — later evt. via bestaande auth, niet nu

### 4.2 Continue Working (hero)
- Toont: laatst geopende snippet, taal-badge, relatieve tijd
- Relatieve tijd: zojuist / X min geleden / X uur geleden / gisteren / X dagen geleden
- Moet ECHTE data zijn — laatst geopende snippet uit bestaande state,
  niet gesimuleerd
- Knop "Doorgaan" alleen als er een laatst-geopende snippet bestaat

### 4.3 Empty states (kritiek — vaak vergeten)
- **0 snippets totaal:**
  - Continue Working hero toont uitleg-tekst, GEEN eigen knop
    (voorkomt dubbele CTA naast sticky knop onderaan)
  - Favorieten sectie: niet tonen
  - Categorieën sectie: niet tonen (er zijn er nog geen)
  - Bibliotheek regel: "0 snippets"
- **0 favorieten (maar wel snippets):**
  - Toon rustige empty state: "Nog geen favorieten — markeer
    snippets met ☆ om ze hier te zien"
- **Categorieën verschijnen automatisch** zodra eerste snippet met
  die categorie wordt aangemaakt — geen handmatige stap nodig

### 4.4 Iconen
- Geen emoji's — lijn-iconen (SVG, stroke-based, consistente
  visuele weging), zelfde stijl als bestaande UI-iconen (pijltjes etc.)

### 4.5 Bibliotheek (was "Kennisbank" was "stats cards")
- Eén regel: "36 snippets · 7 favorieten · 9 categorieën"
- Geen losse dashboard-kaarten meer

### 4.6 Categorieën
- Worden op home getoond als simpele lijst (icoon, naam, aantal)
- Tik op categorie → navigeert naar apart categorie-detail scherm
  (niet meer inline uitklappend zoals in v09.06)

### 4.7 Sticky CTA
- "+ Nieuwe Snippet" blijft de enige primaire actie, sticky onderaan,
  op elk scherm waar dat relevant is

---

## 5. Kleurensysteem v2.0

```
Achtergrond primair    #0B1020
Surface primair        #151D31
Surface secundair      #202A44
Accent primair         #4F8CFF
Accent secundair       #8B5CF6
Tekst primair          #FFFFFF
Tekst secundair        #94A3B8
```

Kleurverdeling: 80% neutraal, 15% surface-diepte, 5% accent.
Categorie-kleuren (uit v09.06 CAT_CONFIG) blijven behouden voor
iconen en badges — die geven juist herkenbaarheid per categorie.

---

## 6. Wat NIET verandert (belangrijk!)

- Firebase datastructuur — geen migratie, geen schema-wijziging
- `lib/types.ts` — Snippet interface blijft ongewijzigd
- `lib/db.ts` — alle CRUD functies blijven ongewijzigd
- Bestaande functionaliteit: zoeken, filteren, sorteren, tags,
  favorieten, archiveren, edit, delete — alles blijft werken
- URL auto-fill systeem (`/add` route) — ongewijzigd
- DetailView.tsx en EditView.tsx — ongewijzigd tot expliciet
  aangegeven

De redesign is een nieuwe **presentatie- en navigatielaag** op
bestaande data, geen nieuwe architectuur.

---

## 7. Implementatie fasering

```
FASE 1  Nieuwe Home Screen (HomeView.tsx)
        → nieuwe component, bestaat naast oude ListView
        → gebruikt bestaande listenSnippets() data
        → nog geen categorie-detail scherm

FASE 2  Categorie-detailpagina
        → apart scherm per categorie
        → hergebruikt bestaande snippet-rij logica

FASE 3  Bestaande features aankoppelen
        → zoeken, filteren, sorteren
        → favorieten, edit, delete, archief

FASE 4  Continue Working — echte data
        → laatst-geopend tracking (bestaat al via lastOpenedId)
        → relatieve tijd berekening

FASE 5  Responsive + iPhone/PWA polish
        → veiligheidsmarges, edge cases, lange titels
        → 0 / 1 / 10 / 100+ categorieën testen

FASE 6  Opruimen
        → oude ListView.tsx verwijderen
        → app/page.tsx routing bijwerken naar HomeView
```

**Regel: elke fase moet de app in werkende staat opleveren.**
Geen fase mag de app tijdelijk breken.

---

## 8. Bronvermelding

- Extern MASTER UI/UX REDESIGN document (GPT-geassisteerd), gebruikt
  als inspiratiebron — niet 1-op-1 geïmplementeerd
- Twee preview-iteraties gemaakt en beoordeeld voordat baseline werd
  vastgesteld (preview-v2-master.html, preview-v2-refined.html,
  preview-v2-baseline.html)
- Beoordeling gedaan door gebruiker + Claude + GPT gezamenlijk

---

## 9. Bibliotheek-scherm (toegevoegd — status: GOEDGEKEURD)

> Preview beoordeeld en akkoord bevonden: preview-bibliotheek.html
> (twee varianten: "Alle" en "Filter: Favorieten actief")

### 9.1 Architectuur

Het Bibliotheek-scherm is een **nieuw, apart scherm** — het vervangt
`CategoryView.tsx` niet. Onderscheid:

```
Home
├── Continue Working
├── Favorieten
├── Bibliotheek-overzicht (regel met totalen)
│     → tik "Bekijk alles" → NIEUW Bibliotheek-scherm
└── Categorieën
      → tik specifieke categorie → bestaande CategoryView.tsx
```

- **Bibliotheek-scherm:** alle snippets, met filtering (Alle/
  Favorieten/Categorieën) en sortering — het algemene overzicht
- **CategoryView.tsx:** blijft ongewijzigd, voor navigatie vanuit
  een specifieke categorie op Home

### 9.2 Visuele regel — belangrijkste wijziging t.o.v. eerdere iteratie

**Geen gekleurde vierkante vlakken meer achter initialen of iconen.**
De categorie-kleursysteem (CAT_CONFIG) blijft bestaan voor
CategoryView en Home-categorieënlijst, maar wordt in het
Bibliotheek-scherm NIET gebruikt als achtergrondkleur per rij.

In plaats daarvan:
- Snippet-rij: 1px rand `#202A44` (donkerblauw, subtiel)
- Favoriete snippet-rij: iets duidelijkere rand
  `rgba(79,140,255,0.35)` (blauw accent, nog steeds subtiel)
- Initialen: wit/lichtgrijs tekst, dunne outline-border
  (`1px solid #2A3654`), GEEN gevulde kleurachtergrond
- Favoriet-indicator: altijd blauw hart/ster (`#4F8CFF`),
  nooit categorie-kleur
- Achtergrond van de rij zelf: `#0B1020` (zelfde als scherm-bg,
  niet `#151D31` — het onderscheid komt van de rand, niet van vlakken)

**Designregel:** minder kleur, meer structuur. Structuur komt uit
typografie, spacing en subtiele borders — niet uit gekleurde
vlakken per item.

### 9.3 Layout Bibliotheek-scherm

```
Bibliotheek                          ← paginatitel

[Alle] [Favorieten] [Categorieën ▾]  ← filter tabs

42 snippets          Recent ▾  ☷     ← toolbar: teller, sort, view

┌─────────────────────────────────┐
│ CO  CodeSync — Master Architect. │
│     Ja. Hieronder staat één...  ★│
│     md · 2 uur geleden           │
└─────────────────────────────────┘
```

Elke rij toont: initialen, titel, beschrijving (1 regel, ellipsis),
taal-badge + relatieve tijd, favoriet-indicator rechts.

---

## 10. Profiel-scherm (toegevoegd — status: VASTGELEGD, bouwen in
    zelfde ronde als Bibliotheek)

### 10.1 Aanleiding

Archief is een **account-/beheerfunctie**, geen primaire
Bibliotheek-functie. Een tijdelijke Archief-knop los in de
navigatie zetten is een tussenstap die we meteen overslaan —
Profiel wordt in dezelfde bouwronde meegenomen.

### 10.2 Structuur

```
Profiel
├── Account / persoonlijke gegevens (placeholder voor nu)
├── Instellingen (placeholder voor nu)
├── Archief
│     ├── Lijst van gewiste snippets
│     ├── Per item: verwijderdatum + "X dagen resterend"
│     ├── Actie: Herstellen
│     └── Actie: Nu permanent verwijderen (met bevestiging)
└── (later: overige beheeropties)
```

Geen tijdelijke Archief-knop ergens anders in de navigatie — Archief
leeft uitsluitend onder Profiel.

### 10.3 Soft-delete architectuur (vervangt huidige `archived: boolean`)

**Huidig systeem (v09.06 en eerder):**
```typescript
archived: boolean   // true/false, geen tijdsregistratie
```

**Nieuw systeem — vereist wijziging in `lib/types.ts`:**
```typescript
deletedAt?: string   // ISO timestamp, undefined = niet verwijderd
```

Migratie-opmerking: bestaande snippets met `archived: true` moeten
bij implementatie omgezet worden naar `deletedAt: <huidige datum>`
zodat ze niet per ongeluk meteen als "30 dagen verlopen" gelden.
Dit is een eenmalige data-migratie, geen structurele wijziging aan
hoe nieuwe verwijderingen werken.

**Gedrag:**
- "Verwijderen" in DetailView zet `deletedAt = nu()` — geen
  Firestore `deleteDoc` meer voor de gebruikers-actie
- Snippet verdwijnt uit Home/Bibliotheek/CategoryView (filter op
  `!deletedAt`, net zoals nu gefilterd wordt op `!archived`)
- Archief-scherm (onder Profiel) toont snippets waar `deletedAt`
  gezet is, gesorteerd op meest recent verwijderd
- Per item: "X dagen resterend" = 30 − (vandaag − deletedAt)
- Herstellen: `deletedAt` terug naar `undefined`
- Nu permanent verwijderen: echte `deleteDoc()` uit Firestore,
  met bevestigingsdialoog (zelfde patroon als huidige delete-confirm)

### 10.4 30-dagen automatische cleanup — infrastructuurtaak

**Dit is expliciet GEEN client-side taak.** De app zelf mag nooit
op basis van "de gebruiker heeft de app geopend" bepalen of iets
verwijderd moet worden — dat is onbetrouwbaar (als iemand de app
weken niet opent, cleant er niets op, of erger: opent hij hem net
op dag 31 en verwijdert de app in de UI-thread te veel tegelijk).

**Status: GEÏMPLEMENTEERD (v11.09) — keuze: Vercel Cron.**

Reden voor Vercel Cron boven Firebase Cloud Functions: geen nieuwe
dienst/kosten nodig (Firebase Functions vereist Blaze-plan), en de
implementatie blijft binnen de bestaande Next.js/Vercel-structuur
van dit project.

Implementatie:
- `app/api/cleanup-archief/route.ts` — GET-route die alle snippets
  met `deletedAt` ouder dan 30 dagen definitief verwijdert
- `vercel.json` — cron-configuratie, draait dagelijks om 03:00 UTC
- Beveiligd met `CRON_SECRET` environment variable (Bearer token) —
  voorkomt dat de route door derden aangeroepen kan worden
- Bekende beperking: query haalt alle `deletedAt != null` documenten
  op en filtert in code op datum, i.p.v. een samengestelde Firestore
  query. Ruim voldoende snel voor een persoonlijk archief van
  tientallen items; zou bij duizenden items een Firestore composite
  index vereisen.

### 10.5 Wat NIET verandert

- `lib/db.ts` functienamen `archiveSnippet`/`restoreSnippet` kunnen
  blijven bestaan als naam, maar hun implementatie verandert van
  `archived: true` naar `deletedAt: <timestamp>`
- Geen wijziging aan hoe CategoryView, Home of Bibliotheek
  niet-verwijderde snippets tonen — alleen het filter-veld verandert
  van `archived` naar `deletedAt`

---

*Vastgelegd: augustus 2026 — dit document is leidend voor Fase 1 t/m 6,
inclusief de in secties 9 en 10 toegevoegde Bibliotheek- en
Profiel/Archief-specificaties*
