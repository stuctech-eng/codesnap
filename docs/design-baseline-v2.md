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

*Vastgelegd: augustus 2026 — dit document is leidend voor Fase 1 t/m 6*
