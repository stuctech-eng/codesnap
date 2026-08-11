# CodeSnap — Architectuur

> Technisch naslagwerk. Voor productbeslissingen zie
> docs/design-baseline-v2.md. Voor planning zie docs/roadmap.md.

---

## 1. Lagen-overzicht

```
┌─────────────────────────────────────┐
│  PRESENTATIE LAAG                    │
│  components/HomeView.tsx    (nieuw)  │
│  components/CategoryView.tsx (Fase2) │
│  components/ListView.tsx    (legacy) │
│  components/DetailView.tsx           │
│  components/EditView.tsx             │
├─────────────────────────────────────┤
│  ROUTING / STATE LAAG                │
│  app/page.tsx                        │
│  app/add/page.tsx                    │
├─────────────────────────────────────┤
│  DATA LAAG                           │
│  lib/db.ts       (CRUD functies)     │
│  lib/types.ts    (interfaces)        │
│  lib/firebase.ts (connectie)         │
├─────────────────────────────────────┤
│  FIREBASE FIRESTORE                  │
│  collection: snippets                │
│  doc: settings/categories            │
└─────────────────────────────────────┘
```

**Kernregel:** de presentatielaag mag meerdere componenten hebben
die dezelfde databronnen gebruiken. HomeView, CategoryView en het
legacy ListView draaien tijdelijk naast elkaar (zie roadmap Fase 1-6).

---

## 2. Data flow (ongewijzigd door redesign)

```
Firebase Firestore
    │ onSnapshot (realtime listener)
    ▼
listenSnippets() — lib/db.ts
    │
    ▼
app/page.tsx — useState<Snippet[]>
    │ props
    ▼
HomeView / ListView / DetailView / EditView
```

De redesign (Design Baseline v2.0) verandert alléén welk component
de data ontvangt en hoe het wordt weergegeven — niet hoe de data
wordt opgehaald of opgeslagen.

---

## 3. State management — app/page.tsx

Centrale state, ongewijzigd:

```typescript
view: "list" | "detail" | "edit" | "new"
     // Fase 2 voegt toe: "home" | "category"
activeId: string | null
lastOpenedId: string | null     // gebruikt in Fase 4 (Continue Working)
search: string
theme: "dark" | "light"
openSections: Record<string, boolean>
scrollY: number
```

---

## 4. Componenten — verantwoordelijkheden

### HomeView.tsx (Fase 1, nieuw)
- Toont: groet, zoekbalk, Continue Working hero, favorieten,
  bibliotheek-regel, categorieën-lijst
- Ontvangt: `allSnips`, `lastOpened`
- Geeft door: `onOpenCategory(cat)`, `onOpenSnippet(id)`, `onAdd()`

### CategoryView.tsx (Fase 2, nog te bouwen)
- Toont: snippets binnen één categorie
- Ontvangt: `category`, `snips` (gefilterd)
- Hergebruikt: snippet-rij render logica uit ListView.tsx (SnapRow)

### ListView.tsx (legacy — verwijderd in Fase 6)
- Huidige v09.06 implementatie
- Blijft actief tot HomeView + CategoryView feature-compleet zijn

### DetailView.tsx / EditView.tsx
- Ongewijzigd door redesign
- Werken met elk van bovenstaande lijst-componenten

---

## 5. Firebase schema (ongewijzigd)

```
snippets/ (collection)
  {id}/
    title: string
    description: string
    code: string              // legacy veld
    codeBlocks: CodeBlock[]
    notes: string
    snippetType: string
    category: string
    tags: string[]
    favorite: boolean
    archived: boolean
    createdAt: timestamp
    updatedAt: timestamp

settings/categories (document)
    customCats: string[]
```

**Geen migratie nodig voor Design Baseline v2.0** — de redesign is
een presentatielaag-wijziging, geen datamodel-wijziging.

---

## 6. Styling architectuur

### Bestaand systeem (v09.06)
CSS variabelen in `app/globals.css`, inline styles per component.

### Nieuw kleurensysteem (v2.0, vanaf Fase 1)
Toegevoegd naast bestaande variabelen — niet vervangend, om
DetailView/EditView niet te breken tijdens de overgangsperiode:

```css
--v2-bg: #0B1020;
--v2-surface: #151D31;
--v2-surface2: #202A44;
--v2-accent: #4F8CFF;
--v2-accent2: #8B5CF6;
--v2-text: #FFFFFF;
--v2-text2: #94A3B8;
```

Categorie-kleuren (CAT_CONFIG uit ListView.tsx) worden hergebruikt
in HomeView en CategoryView — niet opnieuw gedefinieerd.

---

## 7. Iconen

Vanaf Fase 1: inline SVG, stroke-based, 18-20px, strokeWidth 2.
Geen icon-library dependency — zelfde aanpak als bestaande UI
(chevrons, checkmarks etc. in EditView.tsx zijn al zo opgebouwd).

---

## 8. Belangrijke technische afspraken

- **ZIP levering:** Python `zipfile` met expliciete repo-paden
  (geen prefix-map), UTF-8 encoding via `open(path, 'w', encoding='utf-8')`
- **Geen bash heredoc** voor bestanden die naar productie gaan —
  risico op NEL-terminators en encoding-fouten (zie changelog v09.06)
- **iOS Safari:** fontSize ≥16px in inputs, clipboard API alleen na
  gebruikersactie, position:fixed + overflow:hidden voor fullscreen views

---

*Dit document wordt bijgewerkt bij elke architectuur-wijziging,
niet bij elke feature. Voor changelog zie README.md sectie 11.*
