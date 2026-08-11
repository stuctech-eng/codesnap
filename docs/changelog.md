# CodeSnap — Changelog

> Chronologisch overzicht van alle wijzigingen.
> Voor actieve planning zie docs/roadmap.md.

---

## Ongepland / In behandeling

### Design Baseline v2.0 — vastgelegd, implementatie nog niet gestart
- Zie docs/design-baseline-v2.md voor volledige specificatie
- Zie docs/roadmap.md voor fasering (Fase 1 t/m 6)
- Status: Fase 0 (baseline) afgerond, Fase 1 (Home Screen) nog niet gestart

---

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
