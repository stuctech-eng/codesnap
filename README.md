# CodeSnap

> Persoonlijke snippet bibliotheek — iPhone-first webapp

**Live:** https://codesnap-mu.vercel.app
**Repo:** https://github.com/stuctech-eng/codesnap
**Versie:** v12.06
**Actief ontwerp:** Design Baseline v2.0 — volledig geïmplementeerd
**Actieve uitbreiding:** Hiërarchische Bibliotheek (Categorie → Project
→ Onderdeel), Fase H1-H5 afgerond, Fase H6 volgende — zie
docs/audit-hierarchie.md

---

## Documentatie-overzicht

Dit project houdt documentatie in `docs/` bij, volgens vaste
prioriteitsvolgorde (zie ook standing rule "Volgorde van waarheid"):

1. **README.md** (dit bestand) — actuele status, snelstart, changelog-samenvatting
2. **docs/design-baseline-v2.md** — vastgelegde productbeslissingen voor de UI-redesign
3. **docs/audit-hierarchie.md** — hiërarchische Bibliotheek-structuur
   (Categorie → Project → Onderdeel → Snippet): audit, ontwerp,
   implementatieplan Fase H1-H6, en actuele voortgang per fase.
   **Dit is een actief lopende uitbreiding — check dit bestand altijd
   voor de huidige stand voordat je verder bouwt aan de Bibliotheek.**
4. **docs/architecture.md** — technische structuur, data flow, componenten
5. **docs/roadmap.md** — actieve fasering, wat nu/volgende/later
6. **docs/changelog.md** — volledige chronologische geschiedenis
7. Bestaande broncode

Bij twijfel over "hoe hoort dit te werken" gaat deze volgorde voor
op aannames uit de code.

---

## Inhoudsopgave (dit bestand)

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Bestandsstructuur](#3-bestandsstructuur)
4. [Snippet Data Model](#4-snippet-data-model)
5. [Categorie Systeem (huidig, v09.06)](#5-categorie-systeem-huidig-v0906)
6. [URL Auto-fill Systeem](#6-url-auto-fill-systeem)
7. [iPhone-First Workflow](#7-iphone-first-workflow)
8. [ZIP methode](#8-zip-methode)
9. [Bekende Problemen en Oplossingen](#9-bekende-problemen-en-oplossingen)
10. [Design Baseline v2.0 — status](#10-design-baseline-v20--status)
11. [Changelog (samenvatting)](#11-changelog-samenvatting)
12. [Development Guidelines](#12-development-guidelines)

---

## 1. Project Overview

CodeSnap is een persoonlijke snippet bibliotheek webapp gebouwd voor
iPhone-first gebruik.

**Doel:**
- Code snippets, AI prompts en instructies opslaan
- Snel terugvinden via categorieën en tags
- Kopiëren naar klembord voor gebruik in andere apps/AI-tools
- Automatisch importeren via URL parameters (`/add` route)

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

---

## 3. Bestandsstructuur

```
codesnap/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── add/page.tsx          URL auto-fill route
│
├── components/
│   ├── ListView.tsx          Huidige lijst-UI (v09.06, wordt Fase 6 vervangen)
│   ├── DetailView.tsx
│   └── EditView.tsx
│
├── lib/
│   ├── types.ts
│   ├── firebase.ts
│   └── db.ts
│
├── docs/
│   ├── design-baseline-v2.md Vastgelegde UI-redesign beslissingen
│   ├── architecture.md       Technische structuur
│   ├── roadmap.md            Actieve fasering
│   └── changelog.md          Volledige geschiedenis
│
└── public/apple-touch-icon.png
```

Zie `docs/architecture.md` voor de volledige lagen-uitleg en data flow.

---

## 4. Snippet Data Model

```typescript
interface Snippet {
  id?: string
  title: string
  description: string
  code: string              // legacy veld
  codeBlocks: CodeBlock[]   // { id, filename, code }[]
  notes?: string
  snippetType: "code" | "prompt" | "instructie"  // auto-gedetecteerd
  category: string
  tags: string[]
  favorite: boolean
  archived: boolean
  createdAt?: string
  updatedAt?: string
}
```

Dit model verandert **niet** door de Design Baseline v2.0 redesign —
zie docs/architecture.md sectie 5.

---

## 5. Categorie Systeem (huidig, v09.06)

Hardcoded in `components/ListView.tsx` via `CAT_CONFIG`:

| Naam | Kleur |
|------|-------|
| AI Prompts | #a78bfa |
| Apps | #818cf8 |
| Documentatie | #fbbf24 |
| Bug Fix | #f87171 |
| Ideeën | #c084fc |
| Config | #34d399 |
| Games | #2dd4bf |
| Scripts | #60a5fa |
| UI | #f472b6 |
| Code | #fb923c |

Custom categorieën (indien nog aangemaakt) staan in Firebase:
`settings/categories`.

---

## 6. URL Auto-fill Systeem

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

Code >1200 tekens: weglaten uit URL, gebruiker plakt handmatig via
de "Kopieer code" knop op de `/add` pagina.

AI-instructie hiervoor staat opgeslagen als CodeSnap-snippet zelf:
"CodeSnap System Specificatie v2" (categorie AI Prompts).

---

## 7. iPhone-First Workflow

```
iPhone (Working Copy) → commit + push
GitHub (stuctech-eng/codesnap) → auto deploy
Vercel (codesnap-mu.vercel.app) → live
iPhone (Safari PWA)
```

iOS Safari beperkingen: fontSize ≥16px in inputs, clipboard API
alleen na gebruikersactie, position:fixed + overflow:hidden voor
fullscreen views.

---

## 8. ZIP methode

**Altijd Python, nooit bash heredoc** (voorkomt encoding-fouten,
zie sectie 9).

```python
import zipfile

def make_zip(file_map, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for local_path, repo_path in file_map.items():
            zf.write(local_path, repo_path)

make_zip({
    '/home/claude/out/ListView.tsx': 'components/ListView.tsx',
    '/home/claude/out/page.tsx':     'app/page.tsx',
}, 'update.zip')
```

**Regels:**
- Geen prefix-map — paden beginnen direct bij repo root
- Correct: `app/page.tsx` — Fout: `codesnap/app/page.tsx`
- Bestanden schrijven met `open(path, 'w', encoding='utf-8')`

---

## 9. Bekende Problemen en Oplossingen

| Probleem | Oorzaak | Oplossing |
|----------|---------|-----------|
| iOS zoom bij typen | fontSize <16px | fontSize: 16 |
| Viewport verschuift | position:fixed + iOS | overflow:hidden |
| Categorie verdwijnt | State verloren | Firebase opslag |
| Zip pakt niet uit | Platte zip zonder mappen | Python zip met mapstructuur |
| Vercel build faalt (UTF-8) | Bash heredoc → NEL terminators | Python UTF-8 schrijven |
| Cold start Vercel | App slaapt | PWA eerst openen |
| Russian doll /add | EditView laadt vorige snippet | `forceNew` prop + `code: ""` |
| Categorie-popup toonde oude lijst | EditView had eigen oude ALL_CATS | Gesynchroniseerd met CAT_CONFIG |

---

## 10. Design Baseline v2.0 — status

Een complete UI-redesign is uitgewerkt, beoordeeld (samen met een
tweede AI als sparring-partner) en vastgelegd in
**docs/design-baseline-v2.md**. Kernpunten:

- Nieuwe informatiehiërarchie: groet → zoeken → Continue Working →
  favorieten → bibliotheek → categorieën
- Categorieën worden losse detailschermen ipv inline uitklappen
- Nieuw kleurensysteem (#0B1020 basis)
- Lijn-iconen ipv emoji's
- Empty states expliciet ontworpen (0 snippets, 0 favorieten)

**Implementatie volgt gefaseerd — zie docs/roadmap.md.**
Bestaande functionaliteit en databasestructuur blijven ongewijzigd;
dit is een nieuwe presentatielaag, geen herbouw.

Status: Fase 0 (baseline vastleggen) ✅ afgerond.
Fase 1 (Home Screen bouwen) nog niet gestart.

---

## 11. Changelog (samenvatting)

Zie **docs/changelog.md** voor het volledige overzicht.

- **v09.06** — UI verfijning, categorieën hardcoded, Python zip-methode
- **v08.06** — Archief, filters, URL auto-fill, Russian doll fix
- **v07.05** — Custom categorieën, code-tabs, auto type-detectie

---

## 12. Development Guidelines

- Altijd complete bestanden — nooit losse code-fragmenten
- Inline styles, geen Tailwind, geen externe UI libraries
- CSS variabelen: `var(--bg)`, `var(--accent)`, etc.
- fontSize minimaal 16px in alle textareas/inputs
- Versienummer handmatig in `app/page.tsx`: `const VERSION = "DD.MM"`
- Bestanden altijd via Python schrijven met UTF-8 encoding
- Zip altijd met correcte repo-mapstructuur (zie sectie 8)
- Bij grote UI-wijzigingen: eerst preview (HTML-artifact), pas na
  goedkeuring productiecode aanpassen

---

*README bijgehouden door Claude. Voor diepgaande achtergrond zie de
docs/ map. Laatste update: augustus 2026.*
