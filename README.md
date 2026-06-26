# CodeSnap

> Persoonlijke snippet bibliotheek — iPhone-first webapp

**Live:** https://codesnap-mu.vercel.app  
**Repo:** https://github.com/stuctech-eng/codesnap  
**Versie:** v08.06

---

## Inhoudsopgave

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Bestandsstructuur](#3-bestandsstructuur)
4. [Architectuur](#4-architectuur)
5. [Snippet Data Model](#5-snippet-data-model)
6. [Categorie Systeem](#6-categorie-systeem)
7. [URL Auto-fill Systeem](#7-url-auto-fill-systeem)
8. [iPhone-First Workflow](#8-iphone-first-workflow)
9. [Bekende Problemen en Oplossingen](#9-bekende-problemen-en-oplossingen)
10. [UI Redesign Plan v2](#10-ui-redesign-plan-v2)
11. [Roadmap](#11-roadmap)
12. [Changelog](#12-changelog)
13. [Development Guidelines](#13-development-guidelines)

---

## 1. Project Overview

CodeSnap is een persoonlijke snippet bibliotheek webapp gebouwd voor iPhone-first gebruik.

**Doel:**
- Code snippets, AI prompts en instructies opslaan
- Snel terugvinden via categorieën en tags
- Kopiëren naar klembord voor gebruik in andere apps
- Automatisch importeren via URL parameters

**Niet bedoeld voor:**
- Publiek delen van snippets
- Samenwerking met anderen
- Code uitvoeren of testen

---

## 2. Tech Stack

| Laag | Technologie |
|------|-------------|
| Framework | Next.js 14 (App Router) |
| Database | Firebase Firestore (realtime) |
| Hosting | Vercel |
| Git client | Working Copy (iPhone) |
| Taal | TypeScript |
| Styling | Inline styles + CSS variabelen |
| Auth | Geen (privé gebruik) |

**Firebase config:** `.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

---

## 3. Bestandsstructuur

```
codesnap/
├── app/
│   ├── globals.css          → CSS variabelen, thema
│   ├── layout.tsx           → HTML wrapper, viewport meta
│   ├── page.tsx             → Routing en view state
│   └── add/
│       └── page.tsx         → URL auto-fill route
│
├── components/
│   ├── ListView.tsx         → Snippet lijst met categorieën
│   ├── DetailView.tsx       → Snippet bekijken
│   └── EditView.tsx         → Snippet aanmaken/bewerken
│
├── lib/
│   ├── types.ts             → TypeScript interfaces
│   ├── firebase.ts          → Firebase initialisatie
│   └── db.ts                → Firestore CRUD functies
│
└── public/
    └── apple-touch-icon.png → PWA icoon
```

---

## 4. Architectuur

### View routing

`app/page.tsx` beheert de volledige view state:

```
view = "list"   → ListView
view = "detail" → DetailView
view = "edit"   → EditView (bestaande snippet)
view = "new"    → EditView (leeg formulier)
```

### Data flow

```
Firebase Firestore
    ↓ listenSnippets() — realtime listener
app/page.tsx — state management
    ↓ props
ListView / DetailView / EditView
```

### Navigatie bewaring

Bij openen van een snippet wordt bewaard:
- Scroll positie van de lijst
- Welke categorieën open stonden

Bij terugkeren wordt exact dezelfde staat hersteld.

### Thema

CSS variabelen via `data-theme` attribuut op `<html>`:
- `data-theme="dark"` → donker thema (standaard)
- `data-theme="light"` → licht thema

---

## 5. Snippet Data Model

```typescript
interface Snippet {
  id?: string           // Firebase document ID
  title: string         // Naam van de snippet
  description: string   // Uitleg wat het doet
  code: string          // Legacy veld (oud)
  codeBlocks: [{        // Meerdere bestanden
    id: string
    filename: string    // bijv. index.html
    code: string
  }]
  notes?: string        // Extra context
  snippetType:          // Auto-gedetecteerd
    "code" |            // → heeft code blokken
    "prompt" |          // → alleen beschrijving
    "instructie"        // → beschrijving + code
  category: string      // Één categorie
  tags: string[]        // Meerdere tags
  favorite: boolean     // Gemarkeerd als favoriet
  archived: boolean     // Gearchiveerd (niet verwijderd)
  createdAt?: string    // Firebase timestamp
  updatedAt?: string    // Firebase timestamp
}
```

### Type detectie (automatisch)

```
Geen code + beschrijving  → prompt
Code + beschrijving       → instructie
Alleen code               → code
```

---

## 6. Categorie Systeem

### Standaard categorieën

| Icoon | Naam | Kleur | Beschrijving |
|-------|------|-------|--------------|
| ✨ | AI Prompts | #a78bfa | Prompts en templates |
| ⚙️ | Config | #34d399 | Instellingen en configuratie |
| 🐛 | Bug Fix | #f87171 | Oplossingen en fixes |
| 💡 | Ideeën | #c084fc | Concepten en brainstorms |
| 🎨 | UI | #f472b6 | Interface en design |
| 📱 | Apps | #818cf8 | Applicaties en projecten |
| 🔧 | Snippets | #fb923c | Herbruikbare code |
| 🖥️ | Scripts | #60a5fa | Automatisering en tools |
| 📚 | Documentatie | #fbbf24 | Uitleg en handleidingen |
| 🎮 | Games | #2dd4bf | Game logica en scripts |

### Custom categorieën

Opgeslagen in Firebase: `settings/categories` document
```
{ customCats: ["MijnCategorie", ...] }
```

---

## 7. URL Auto-fill Systeem

Route: `/add`

Wanneer je de URL opent vult CodeSnap automatisch het formulier in.

### URL formaat

```
https://codesnap-mu.vercel.app/add
  ?titel=[encodeURIComponent]
  &beschrijving=[encodeURIComponent]
  &categorie=[encodeURIComponent]
  &tags=[komma gescheiden]
  &bestand=[encodeURIComponent]
  &code=[encodeURIComponent, max 1200 tekens]
```

### Regels

- Alle waarden `encodeURIComponent()` encoded
- `&code=` is optioneel — max 1200 tekens
- Als code langer is → weglaten uit URL
- CodeSnap toont dan `📋 Kopieer code naar klembord` knop
- Gebruiker kopieert code uit chat → plakt in CodeSnap

### Workflow met AI

```
1. AI genereert code + uitleg
2. AI bouwt CodeSnap URL
3. Gebruiker tikt op URL
4. CodeSnap opent met alles ingevuld
5. Tik 📋 knop → code naar klembord
6. Tik code veld → Plak
7. Snippet Opslaan ✅
```

### System prompt voor AI

Sla op in CodeSnap als `CodeSnap System Specificatie`:

```
CodeSnap is mijn persoonlijke snippet webapp op:
https://codesnap-mu.vercel.app

Genereer altijd een CodeSnap URL onderaan je antwoord.
Gebruik encodeURIComponent() voor alle waarden.
Code > 1200 tekens → laat &code= weg.
```

---

## 8. iPhone-First Workflow

### Development cycle

```
iPhone (Working Copy)
    ↓ commit + push
GitHub (stuctech-eng/codesnap)
    ↓ auto deploy
Vercel (codesnap-mu.vercel.app)
    ↓ live
iPhone (Safari PWA)
```

### PWA installatie

1. Open `codesnap-mu.vercel.app` in Safari
2. Tik op Delen → Zet op beginscherm
3. App opent als native PWA

### ZIP bestanden

Altijd platte zip met `-j` vlag:

```bash
zip -j update.zip bestand1.tsx bestand2.tsx
```

Geen mappen in de zip — iPhone pakt anders niet goed uit.

### iOS Safari beperkingen

- `fontSize` in textarea altijd ≥ 16px (anders zoom)
- `position:fixed` + `overflow:hidden` voor fullscreen views
- Clipboard API werkt alleen na gebruikersactie
- `navigator.clipboard.writeText()` niet automatisch bij pagina laden

---

## 9. Bekende Problemen en Oplossingen

| Probleem | Oorzaak | Oplossing |
|----------|---------|-----------|
| iOS zoom bij typen | `fontSize < 16px` in textarea | `fontSize: 16` instellen |
| Viewport verschuift bij toetsenbord | `position:fixed` + iOS Safari | `overflow:hidden` op container |
| Categorie verdwijnt na aanmaken | State verloren bij herrender | Opgeslagen in Firebase |
| Zip pakt niet uit op iPhone | Mappen in zip | `zip -j` platte zip gebruiken |
| Vercel cold start | App slaapt na inactiviteit | PWA eerst openen voor URL |
| Russian doll effect bij /add | EditView laadt vorige snippet | `forceNew={true}` prop + `code: ""` |
| Kopieer knop afgesneden | Nav te smal | Kortere tekst + kleinere padding |

---

## 10. UI Redesign Plan v2

### Huidige status (v08.06)

Functioneel maar visueel verbetering nodig:
- Categoriekleuren te gelijk aan elkaar
- Geen iconen per categorie
- Geen beschrijving onder categorienaam
- Stats niet zichtbaar op hoofdscherm

### Geplande UI v2

**Stats balk (horizontaal scrollbaar):**
```
[📁 35] [⭐ 7] [🕐 12] [🐛 5]
← swipe voor meer →
```

**Categorie kaarten:**
```
┌────────────────────────────┐
│ ✨ AI Prompts          12 › │
│    Prompts en templates     │
└────────────────────────────┘
```

**Uitgeklapt met kader:**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ⚙️ Config              5 ∨ ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ [AU] Auto Clipboard        ┃
┃ [BA] BassFlow PRO          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Nieuwe categorie structuur

| Oud | Nieuw |
|-----|-------|
| Proggie | Apps |
| Machines | Scripts |
| Game + Games | Games |
| Les | Documentatie |

### Implementatie stappen

```
Stap 1 → Categorieën opschonen in Firebase
Stap 2 → ListView.tsx rebuild met nieuwe UI
Stap 3 → Iconen + beschrijvingen per categorie
Stap 4 → Stats balk implementeren
Stap 5 → Testen + deployen
```

---

## 11. Roadmap

### Nu bezig

- [ ] UI Redesign v2 (zie sectie 10)
- [ ] Categorie herstructurering

### Gepland

- [ ] Help pagina (Snelgids / Functies / Nieuw / Over)
- [ ] Zoeken ook in code blokken
- [ ] Offline werken (PWA cache)
- [ ] iPhone Share Sheet integratie

### Ideeën

- [ ] Export naar Markdown bestand
- [ ] Import vanuit bestand
- [ ] Snippet dupliceren

---

## 12. Changelog

### v08.06
- Blauw accent thema (#3b82f6)
- Archief systeem (archiveren + terugzetten)
- Filter en sorteer (nieuwste/oudste/A-Z)
- Tag filter chips
- Notities popup in lijst (📝)
- Datum tonen in About tab
- Scroll positie bewaard bij terugkeren
- Categorie blijft open bij terugkeren
- Kopieer Alles bovenaan DetailView
- URL auto-fill /add route
- Clipboard knop bij /add
- Russian doll bug gefixed (forceNew prop)

### v07.05
- Firebase custom categorieën
- Bestand hernoemen (potlood knop)
- Horizontale code tabs in DetailView
- TYPE selector verwijderd (auto-detectie)
- iOS Safari zoom fix (fontSize: 16)
- Viewport fix (overflow:hidden)

### v30.04
- Stijl B lijst (kaart layout per categorie)
- Laatst geopend bovenaan
- Favorieten ingeklapt
- Scroll naar top bij openen snippet

---

## 13. Development Guidelines

### Volledige bestanden

Altijd complete bestanden leveren — nooit losse stukjes.

### Stijl

- Inline styles (geen Tailwind, geen CSS modules)
- CSS variabelen: `var(--bg)`, `var(--accent)`, etc.
- Geen externe UI libraries
- `fontSize` minimaal 16px in textareas (iOS zoom fix)

### Firebase

- Single source of truth
- Realtime listeners via `onSnapshot`
- Custom settings in `settings/` collectie
- `serverTimestamp()` voor tijdstempels

### Versienummer

Handmatig in `app/page.tsx`:
```typescript
const VERSION = "DD.MM";
```

Bij elke commit datum aanpassen.

### ZIP output

```bash
# Platte zip — geen mappen
zip -j naam-update.zip bestand1.tsx bestand2.tsx
```

### Commit stijl

```
"Fix iOS zoom textarea"
"v08.06 blauw archief filter"
"URL auto-fill add route"
```

---

*README bijgehouden door Claude — laatste update: juni 2026*
