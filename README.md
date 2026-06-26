# CodeSnap

> Persoonlijke snippet bibliotheek — iPhone-first webapp

**Live:** https://codesnap-mu.vercel.app
**Repo:** https://github.com/stuctech-eng/codesnap
**Versie:** v09.06

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
10. [Roadmap](#10-roadmap)
11. [Changelog](#11-changelog)
12. [Development Guidelines](#12-development-guidelines)

---

## 1. Project Overview

CodeSnap is een persoonlijke snippet bibliotheek webapp gebouwd voor iPhone-first gebruik.

**Doel:**
- Code snippets, AI prompts en instructies opslaan
- Snel terugvinden via categorieen en tags
- Kopieren naar klembord voor gebruik in andere apps
- Automatisch importeren via URL parameters

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
│   ├── globals.css          CSS variabelen, thema
│   ├── layout.tsx           HTML wrapper, viewport meta
│   ├── page.tsx             Routing en view state
│   └── add/
│       └── page.tsx         URL auto-fill route
│
├── components/
│   ├── ListView.tsx         Snippet lijst met categorieen
│   ├── DetailView.tsx       Snippet bekijken
│   └── EditView.tsx         Snippet aanmaken/bewerken
│
├── lib/
│   ├── types.ts             TypeScript interfaces
│   ├── firebase.ts          Firebase initialisatie
│   └── db.ts                Firestore CRUD functies
│
└── public/
    └── apple-touch-icon.png PWA icoon
```

---

## 4. Architectuur

### View routing

`app/page.tsx` beheert de volledige view state:

```
view = "list"   ListView
view = "detail" DetailView
view = "edit"   EditView (bestaande snippet)
view = "new"    EditView (leeg formulier)
```

### Data flow

```
Firebase Firestore
    listenSnippets() realtime listener
app/page.tsx state management
    props
ListView / DetailView / EditView
```

### Navigatie bewaring

Bij openen van een snippet wordt bewaard:
- Scroll positie van de lijst
- Welke categorieen open stonden

Bij terugkeren wordt exact dezelfde staat hersteld.

---

## 5. Snippet Data Model

```typescript
interface Snippet {
  id?: string
  title: string
  description: string
  code: string
  codeBlocks: [{
    id: string
    filename: string
    code: string
  }]
  notes?: string
  snippetType: "code" | "prompt" | "instructie"
  category: string
  tags: string[]
  favorite: boolean
  archived: boolean
  createdAt?: string
  updatedAt?: string
}
```

---

## 6. Categorie Systeem

Categorieen zijn hardcoded in `components/ListView.tsx` via `CAT_CONFIG`.

| Icoon | Naam | Kleur | Beschrijving |
|-------|------|-------|--------------|
| AI Prompts | #a78bfa | Prompts en templates |
| Apps | #818cf8 | Applicaties en projecten |
| Documentatie | #fbbf24 | Uitleg en handleidingen |
| Bug Fix | #f87171 | Oplossingen en fixes |
| Ideeen | #c084fc | Concepten en brainstorms |
| Config | #34d399 | Instellingen en configuratie |
| Games | #2dd4bf | Game logica en scripts |
| Scripts | #60a5fa | Automatisering en tools |
| UI | #f472b6 | Interface en design |
| Code | #fb923c | Herbruikbare code |

### Custom categorieen

Opgeslagen in Firebase: `settings/categories`

---

## 7. URL Auto-fill Systeem

Route: `/add`

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
- Code langer dan 1200 tekens: weglaten uit URL
- CodeSnap toont dan clipboard knop
- Gebruiker kopieert code uit chat en plakt in CodeSnap

### Workflow met AI

```
1. AI genereert code + uitleg
2. AI bouwt CodeSnap URL
3. Gebruiker tikt op URL
4. CodeSnap opent met alles ingevuld
5. Tik clipboard knop
6. Tik code veld, plak
7. Snippet Opslaan
```

---

## 8. iPhone-First Workflow

### Development cycle

```
iPhone (Working Copy)
    commit + push
GitHub (stuctech-eng/codesnap)
    auto deploy
Vercel (codesnap-mu.vercel.app)
    live
iPhone (Safari PWA)
```

### ZIP bestanden

Zip met mapstructuur via Python:

```python
import zipfile

def make_zip(file_map, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for local_path, repo_path in file_map.items():
            zf.write(local_path, repo_path)

make_zip({
    '/home/claude/out/ListView.tsx': 'components/ListView.tsx',
    '/home/claude/out/page.tsx':     'app/page.tsx',
    '/home/claude/out/globals.css':  'app/globals.css',
}, 'update.zip')
```

**Regels:**
- Geen prefix map
- Paden beginnen direct bij repo root
- Correct: `app/page.tsx`
- Fout: `codesnap/app/page.tsx`

### iOS Safari beperkingen

- `fontSize` in textarea altijd 16px (anders zoom)
- `position:fixed` + `overflow:hidden` voor fullscreen views
- Clipboard API werkt alleen na gebruikersactie

---

## 9. Bekende Problemen en Oplossingen

| Probleem | Oorzaak | Oplossing |
|----------|---------|-----------|
| iOS zoom bij typen | fontSize < 16px | fontSize: 16 |
| Viewport verschuift | position:fixed iOS | overflow:hidden |
| Categorie verdwijnt | State verloren | Firebase opslag |
| Zip pakt niet uit | Mappen in zip | Python zip met mapstructuur |
| Vercel build faalt | Bash heredoc encoding | Python UTF-8 schrijven |
| Cold start Vercel | App slaapt | PWA eerst openen |
| Russian doll /add | EditView laadt vorige | forceNew prop |

---

## 10. Roadmap

### Gepland

- [ ] Help pagina (Snelgids / Functies / Nieuw / Over)
- [ ] Zoeken ook in code blokken
- [ ] Offline werken (PWA cache)
- [ ] iPhone Share Sheet integratie
- [ ] Snippet dupliceren

---

## 11. Changelog

### v09.06
- UI redesign met stats balk
- Iconen per categorie
- Beschrijving onder categorienaam
- Donkerblauwe achtergrond (#0f172a)
- Witte rand ingeklapt, gekleurde rand uitgeklapt
- Categorieen hardcoded in CAT_CONFIG
- Python UTF-8 zip methode
- Zip met mapstructuur (geen prefix)

### v08.06
- Blauw accent thema (#3b82f6)
- Archief systeem
- Filter en sorteer
- Tag filter chips
- Notities popup in lijst
- Datum in About tab
- Scroll positie bewaard
- URL auto-fill /add route
- Clipboard knop bij /add
- Russian doll bug gefixed

### v07.05
- Firebase custom categorieen
- Bestand hernoemen
- Horizontale code tabs
- TYPE selector verwijderd
- iOS Safari zoom fix

---

## 12. Development Guidelines

### Volledige bestanden

Altijd complete bestanden — nooit losse stukjes.

### Stijl

- Inline styles (geen Tailwind)
- CSS variabelen: var(--bg), var(--accent)
- Geen externe UI libraries
- fontSize minimaal 16px in textareas

### Firebase

- Single source of truth
- Realtime listeners via onSnapshot
- serverTimestamp() voor tijdstempels

### Versienummer

Handmatig in `app/page.tsx`:
```typescript
const VERSION = "DD.MM";
```

### Bestanden schrijven

Altijd via Python met UTF-8 encoding:
```python
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
```

---

*Laatste update: juni 2026*
