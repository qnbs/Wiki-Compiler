# instructions.md — Umsetzungsanleitung & Agentenplaybook

**Zweck dieses Dokuments:** Operative Leitlinien für Menschen und KI-Agenten, die **Wiki Compiler** erweitern, debuggen oder deployen. Produktanforderungen und Scope stehen im **[PRD.md](PRD.md)**; Nutzerface und Marketing im **[README.md](README.md)**.

**Pflicht vor großen Architekturänderungen:** [PRD.md](PRD.md) §4–8 lesen; bei projektbezogenen Beschlüssen kurz [.notes/meeting_notes.md](.notes/meeting_notes.md) ergänzen.

---

## 1. Schnellstart

```bash
# Node.js ≥ 22 (siehe package.json → engines)
npm install
cp .env.example .env   # optional: GEMINI_API_KEY für KI
npm run dev            # http://localhost:3000 (Vite)
npm run typecheck
npm test
npm run build
```

CI entspricht: `npm ci` → `typecheck` → `test` → `build` (`.github/workflows/ci.yml`, Node 22).

---

## 2. Repository-Karte

| Bereich | Rolle |
|---------|--------|
| `index.tsx` | Mount, Provider-Hülle (Settings, Projects, Toast, Importer, ImageImporter, ArticleCache), Service Worker Registrierung. |
| `App.tsx` | Routing zwischen Views, Theme/Accent, Command Palette, Welcome Modal. |
| `components/` | UI nach Feature (z. B. `CompilerView`, `LibraryView`, `lexical/`). |
| `contexts/` | React Context + globale Zustände. |
| `hooks/` | Wiederverwendbare Logik (`useSettingsContext`, `useDebounce`, …). |
| `services/` | Grenzen zur Außenwelt und Persistenz: `dbService`, `wikipediaService`, **`geminiService`** (Fassade), **`ai/`** (KI-Adapter), **`backupSchema`**, `exportService`, `citationService`, … |
| `types.ts` | Gemeinsame Typen und `View`-Enum. |
| `i18n.ts` | Übersetzungen — neue UI-Strings hier integrieren. |
| `public/` | Unveränderte statische Auslieferung: **`sw.js`**, **`manifest.json`**, **`offline.html`**, **`icons/`** (Vite → `dist/`). |
| `vite.config.ts` | Alias `@/` → Repo-Root; `define` für `GEMINI_API_KEY`, `AI_PROVIDER` → `process.env`. |
| `index.css` | Tailwind-Direktiven + globale Custom-Styles (PostCSS). |
| `tailwind.config.js`, `postcss.config.js` | Tailwind v3 + Typography-Plugin. |
| `vitest.config.ts` | Unit-Tests (`npm test`). |
| `.cursor/index.mdc` | Kurzmanifest für Cursor (always-on). |
| `.cursor/rules/*.mdc` | Kontextabhängige Agentenregeln (Security, Gemini/IDB, UI, Tests). |

---

## 3. Umgebungsvariablen

| Variable | Bedeutung |
|----------|-----------|
| `GEMINI_API_KEY` | In `.env`; von Vite eingebunden als `process.env.API_KEY` / `process.env.GEMINI_API_KEY`. Niemals committen. |
| `AI_PROVIDER` | Optional: leer/`gemini` = Gemini; `none` = KI im Client deaktiviert (Build-Zeit). Siehe `docs/AI_PROVIDERS.md`. |

Nach Änderungen an `.env` Dev-Server neu starten.

---

## 4. Architekturregeln (Kurzfassung)

- **DRY:** Geschäftslogik in `services/`, nicht dupliziert in Views.  
- **IndexedDB:** Nur über `services/dbService.ts` versionieren; `DB_VERSION` bei Schemaänderung erhöhen.  
- **Gemini / KI:** Nur über **`services/geminiService.ts`** (Fassade) und Implementierungen unter **`services/ai/`**; Keys nie hardcoden.  
- **Dateigröße:** Ziel ca. 200–700 Zeilen pro Datei; bei Wachstum splitten (siehe `.cursor/rules/200-architecture-limits.mdc`).  
- **Tests:** **Vitest** — Dateien `*.test.ts` / `*.test.tsx`; deterministisch; Gemini/Wikipedia/IDB gemockt (`.cursor/rules/800-testing-standards.mdc`).

---

## 5. Typische Aufgaben & wo anfangen

| Aufgabe | Einstieg |
|---------|----------|
| Neue Compiler-Funktion | `components/Compiler*.tsx`, `services/exportService.ts`, `types.ts`. |
| Wikipedia-Verhalten | `services/wikipediaService.ts`. |
| KI-Prompts / Insights | `services/geminiService.ts` → `services/ai/geminiProvider.ts`; Einstellungen in `AppSettings.library.aiAssistant`. |
| Speicher / Migration / Backup-Import | `services/dbService.ts`, **`services/backupSchema.ts`** (Import-Validierung), PRD §8. |
| Neue Ansicht | `types.ts` (`View`), `App.tsx` Switch, Navigation/Header/BottomNav. |
| Übersetzung | `i18n`/Locale-Dateien je nach Struktur in `i18n.ts`. |

---

## 6. Export & DOCX-Besonderheiten

- Bibliografie: `citationService` / Einstellungen `citations.citationStyle`.  
- DOCX Bilder: `docx` v9 — `ImageRun` nur mit Rasterformaten (`jpg`, `png`, `gif`, `bmp`); andere MIME-Typen nicht blind konvertieren (siehe PRD FR-E03 und README).

---

## 7. Qualitätssicherung vor Merge

1. `npm run typecheck`  
2. `npm test`  
3. `npm run build`  
4. Manuell: kritische Flows (Artikel laden, Projekt speichern, Export ein Format, optional KI mit Test-Key).  
5. Keine Secrets im Diff.

---

## 8. Deployment (Orientierung)

- Build: `npm run build` → statische Auslieferung (beliebiges statisches Hosting).  
- **Produktion:** API-Keys nicht im Client — Backend-Proxy (BFF) oder äquivalent; siehe README Security-Abschnitt.

---

## 9. Graphify (optional, lokales Projekt)

Nach substanziellen Codeänderungen kann der Knowledge Graph aktualisiert werden (Team-Konvention):

```bash
graphify update .
```

Ausgabe unter `graphify-out/` — nicht als einzige Quelle für Produktentscheidungen verwenden.

---

## 10. Eskalation & Dokumentation

| Frage | Wo nachschlagen |
|-------|------------------|
| Was soll das Produkt leisten? | [PRD.md](PRD.md) |
| Wie bediene ich die App als Nutzer? | [README.md](README.md) |
| KI-Modi & Deployment | [docs/AI_PROVIDERS.md](docs/AI_PROVIDERS.md) |
| Entscheidungen & Sessions | [.notes/meeting_notes.md](.notes/meeting_notes.md) |
| Cursor-Verhalten | `.cursor/index.mdc`, `.cursor/rules/` |

---

## 11. Änderungsprotokoll

| Datum | Inhalt |
|-------|--------|
| 2026-05-02 | Erstfassung für Repo-Wiki-Compiler. |
| 2026-05-04 | Abgleich mit `public/`-PWA, Vitest, `services/ai/`, Tailwind-PostCSS, `backupSchema`, CI-Schritten. |
