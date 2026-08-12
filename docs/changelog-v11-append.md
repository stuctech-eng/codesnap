
## v11.06

- **Bibliotheek-scherm** toegevoegd (BibliotheekView.tsx) — algeheel
  overzicht van alle snippets, los van CategoryView. Tabs: Alle /
  Favorieten / Categorieën, met sortering. Bereikbaar via "Bekijk
  alles" op Home
- Snippet-rijen in Bibliotheek: geen gekleurde vlakken meer, subtiele
  1px donkerblauwe rand, favoriet = blauwe rand + blauw hart
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
- **Let op — infrastructuur nog niet gebouwd:** automatische
  cleanup na 30 dagen vereist een Firebase Cloud Function of Vercel
  Cron Job. Dit is bewust nog niet geïmplementeerd — zie
  docs/design-baseline-v2.md sectie 10.4. Tot die tijd blijven
  verlopen items zichtbaar in Archief totdat ze handmatig verwijderd
  worden
