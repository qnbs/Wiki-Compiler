# Product Requirements Document (PRD)

**Produkt:** Wiki Compiler  
**Repository:** Offline-first PWA zur Recherche, Kuratierung und Kompilation von Wikipedia-Wissen mit Lexical-Editor, Gemini-KI und Mehrformat-Export.  
**Letzte inhaltliche Abstimmung mit Codebasis:** 2026-05-04  
**Verwandte Dokumente:** [`instructions.md`](instructions.md) (Umsetzung & Agentenplaybook), [`README.md`](README.md) (Nutzer- und Marketingdarstellung)

---

## 1. Executive Summary

Wiki Compiler unterstützt Studierende, Forschende und autodidaktisch Lernende dabei, Wikipedia-Inhalte zu **suchen**, **lokal zu archivieren**, **projektbezogen zu bearbeiten** und als **DOCX, ODT, Markdown oder JSON** zu exportieren — mit optionaler **KI-Unterstützung** (Google Gemini) und **Zitationsstilen** (APA, MLA, Chicago). Alle Nutzerdaten liegen **standardmäßig lokal** im Browser (IndexedDB); es gibt keinen vom Projekt mitgelieferten Backend-Server.

---

## 2. Produktvision & Prinzipien

| Prinzip | Beschreibung |
|--------|----------------|
| Offline-First | Netzwerk ist optional; Archiv und Kernfunktionen sollen ohne Verbindung nutzbar sein, sobald Daten einmal geladen wurden. |
| Datenschutz auf Gerät | Keine zentrale Nutzerdatenbank durch die App; KI-Anfragen gehen nur bei aktiviertem Schlüssel an Google. |
| Nicht-destruktive Bearbeitung | Globales Archiv bleibt die „Quelle der Wahrheit“ für Rohartikel; projektbezogene Änderungen werden separat gespeichert. |
| Publikationsreife Artefakte | Exporte sollen für Studium und Austausch nutzbar sein (Struktur, Bibliografie, Bilder wo unterstützt). |

---

## 3. Zielgruppen & Personas (Kurz)

- **Student/in:** Literaturrecherche, Komplieren von Leselisten, Export für Arbeiten.  
- **Forschende Person:** Schnelle Exploration, Notizen pro Projekt, strukturierte Literaturhinweise.  
- **Power-User:** Große Archive, Virtualisierung, Tastatursteuerung (Command Palette), Themes.

---

## 4. Ziele & explizite Nicht-Ziele

### 4.1 Ziele (Muss/unterstützt durch aktuellen Stand)

- Lokale Speicherung von Projekten, Artikelcache, Einstellungen und importierten Bildern.
- Wikipedia-Suche und -Import; Archiv durchsuchbar und sortierbar.
- Lexical-basierte Bearbeitung innerhalb von Projekten; Projektnotizen.
- Gemini-gestützte Einblicke (Zusammenfassung, Konzepte, Forschungsfragen) und Textbearbeitung bei vorhandenem API-Key.
- Export in mehrere Formate inkl. Bibliografie nach konfigurierbarem Stil.
- Internationalisierte UI (`i18next`); installierbare PWA — Artefakte unter `public/` (`manifest.json`, `sw.js`, `offline.html`, `icons/`).

### 4.2 Nicht-Ziele (außerhalb des aktuellen Kernprodukts)

- Eigenes Hosting von Wikipedia-Inhalten oder MediaWiki-Backend.
- Multi-User-Echtzeit-Kollaboration oder Cloud-Sync als Kernfeature (Backup nur über JSON-Export/Import laut Produktstory).
- Produktionsreifer Schutz von Gemini-API-Schlüsseln **ohne** separates Backend (Client-Bundle bleibt einsehbar).

---

## 5. Informationsarchitektur & Hauptansichten

Die App strukturiert sich in Ansichten (`types.ts` → `View`):

| Ansicht | Zweck |
|---------|--------|
| **Library** | Wikipedia durchsuchen, Artikel laden, KI-Einblicke (optional). |
| **Archive** | Lokaler Artikelcache, Virtualisierung für große Mengen. |
| **Compiler** | Projekt zusammenstellen, Reihenfolge, Lexical-Editor, Export. |
| **Importer** | Artikel in Projekte übernehmen. |
| **Image Importer** | Bilder aus Artikeln extrahieren und Bibliothek pflegen. |
| **Settings** | Sprache, Theme, Akzent, Bibliothek/KI, Zitationen, Speicher/PWA. |
| **Help** | Hilfe und Orientierung. |

Deep-Linking: URL-Parameter `?view=<name>` (z. B. aus Manifest-Shortcuts) wird beim Start ausgewertet und bereinigt (`App.tsx`).

---

## 6. Funktionale Anforderungen

### 6.1 Recherche & Archiv

| ID | Anforderung |
|----|-------------|
| FR-R01 | Nutzer können Wikipedia durchsuchen und Artikelinhalt abrufen (Service-Schicht `services/wikipediaService.ts`). |
| FR-R02 | Angesehene/geöffnete Artikel werden im Archiv (IndexedDB `articles`) vorgehalten; Nutzer können Cache-Limits und -Verwaltung über Einstellungen beeinflussen (soweit implementiert). |
| FR-R03 | Listen in Bibliothek und Archiv sollen große Datenmengen performant darstellen (Virtualisierung). |

### 6.2 Projekte & Kompilation

| ID | Anforderung |
|----|-------------|
| FR-P01 | Projekte haben Namen, Artikelliste (Reihenfolge), Notizen und gespeicherte projektbezogene HTML-Inhalte (`project-articles`). |
| FR-P02 | Bearbeitungen am Artikeltext wirken **pro Projekt**; Originalcache bleibt für andere Nutzung erhalten. |
| FR-P03 | Drag-and-Drop oder gleichwertige Reihenfolgeänderung der Artikel in einer Kompilation (gemäß UI). |

### 6.3 KI (Gemini)

| ID | Anforderung |
|----|-------------|
| FR-A01 | Ohne gültigen API-Key sind keine kostenpflichtigen/kontingentierten KI-Aufrufe möglich; UI kommuniziert das klar. |
| FR-A02 | Einblicke strukturiert (Zusammenfassung, Schlüsselkonzepte, Forschungsfragen) — siehe `ArticleInsights` in `types.ts`. |
| FR-A03 | Fehler aus API (Quota, Safety, Key) werden nutzerfreundlich gemappt (`services/ai/mapAiError.ts`; Aufruf über Fassade `services/geminiService.ts`). |

### 6.4 Medien

| ID | Anforderung |
|----|-------------|
| FR-M01 | Importierte Bilder mit Metadaten (u. a. Caption, Tags, Herkunftsartikel) in `importedImages`. |
| FR-M02 | Filterung irrelevant kleiner/dekorativer Bilder soweit in der Implementierung vorgesehen. |

### 6.5 Export & Zitation

| ID | Anforderung |
|----|-------------|
| FR-E01 | Export mindestens nach DOCX, ODT, Markdown, JSON (`services/exportService.ts` und zugehörige Logik). |
| FR-E02 | Bibliografie im gewählten Stil (APA / MLA / Chicago); Einbindung Wikipedia + benutzerdefinierte Zitate (`AppSettings.citations`). |
| FR-E03 | DOCX-Bilder: `docx` v9 erwartet Rasterformate (`jpg`, `png`, `gif`, `bmp`); andere MIME-Typen dürfen nicht zu fehlerhaften Binärkonvertierungen führen — Platzhalter oder dokumentierte Degradation. |

### 6.6 UX, A11y, Internationalisierung

| ID | Anforderung |
|----|-------------|
| FR-U01 | Command Palette (z. B. Strg/Cmd+K) für Navigation und Aktionen. |
| FR-U02 | Theme Hell/Dunkel/System und Akzentfarben; Persistenz in Einstellungen. |
| FR-U03 | Modale Dialoge mit Fokus-Management (z. B. Focus Trap), wo zutreffend. |
| FR-U04 | UI-Strings über i18n; neue sichtbare Strings nicht hardcoden ohne Übersetzungskeys. |

### 6.7 Datenportabilität

| ID | Anforderung |
|----|-------------|
| FR-D01 | Backup/Wiederherstellung über JSON-Export/Import; Import validiert mit **Zod** (`services/backupSchema.ts`), bevor IndexedDB überschrieben wird. |

---

## 7. Nicht-funktionale Anforderungen

| Bereich | Anforderung |
|---------|-------------|
| **Performance** | Kein unnötiges Rendern großer Listen; Debouncing bei Suche; Lazy-Loading für Bilder wo möglich. |
| **Zuverlässigkeit** | IndexedDB-Operationen dürfen UI nicht dauerhaft blockieren; Fehler abfangen und Nutzer informieren. |
| **Sicherheit** | Keine Secrets im Repo; Gemini nur über `.env` → Vite `define`. Für öffentliches Deployment BFF/Proxy vorsehen (siehe README). XSS: React-Escaping nutzen; HTML aus Wikipedia kontrolliert einbinden. |
| **CI** | `npm run typecheck`, `npm test` und `npm run build` müssen auf Node 22 grün sein (`.github/workflows/ci.yml`). |
| **Kompatibilität** | Moderne Browser mit Service Worker & IndexedDB; Node ≥22 für Builds (`package.json` → `engines`). |

---

## 8. Datenmodell & lokale Speicherung

**Datenbankname:** `WikiCompilerDB` (`services/dbService.ts`), Version wird bei Schemaänderungen erhöht.

| Store | Inhalt (überblickt) |
|-------|---------------------|
| `projects` | `Project` — Projekte mit Artikelliste und Metadaten. |
| `articles` | `ArticleContent` — globaler Artikelcache (Key: `title`). |
| `settings` | App-Einstellungen unter festem Key `app-settings`. |
| `project-articles` | `ProjectArticleContent` — projektbezogene bearbeitete HTML-Inhalte. |
| `importedImages` | `ImportedImage` — Bildbibliothek. |

Zusätzlich kann `localStorage` für leichte Flags genutzt werden (z. B. Onboarding `wiki-compiler-onboarded` in `App.tsx`).

---

## 9. Externe Schnittstellen

| Schnittstelle | Nutzung |
|---------------|---------|
| **Wikipedia / MediaWiki API** | Suche und Abruf von Artikelinhalten (`wikipediaService.ts`). |
| **Google Gemini** | `@google/genai` über Adapter `services/ai/geminiProvider.ts` — nur mit Schlüssel; strukturierte Ausgaben für Insights; siehe `docs/AI_PROVIDERS.md`. |
| **statisches Hosting** | Build-Artefakte aus `npm run build`; keine Laufzeit-Server-Anforderung der App selbst. |

---

## 10. Messbare Akzeptanzkriterien (Beispiele)

- **AC-KI:** Bei fehlendem Key zeigt die App keine erfolgreichen Gemini-Anfragen; bei ungültigem Key eine verständliche Fehlermeldung ohne Rohstacktrace für Endnutzer.  
- **AC-Export:** Ein Projekt mit mindestens zwei Artikeln exportiert zu DOCX/MD ohne Build-Fehler; Bibliografie enthält Einträge entsprechend gewähltem Stil.  
- **AC-PWA:** Manifest und Service Worker registrierbar; statische PWA-Dateien unter `public/`; Same-Origin-Caching gemäß `public/sw.js`-Strategie; Offline-Fallback für Navigation wo implementiert.  

---

## 11. Roadmap (Backlog, mit README abgestimmt)

Priorisierung erfolgt produktseitig; technische Umsetzung iterativ.

- Erweiterte Suchfilter (Archiv/Bibliothek): Datum, Größe, Tags.  
- Inter-Artikel-Links (`[[wiki-links]]`) innerhalb einer Kompilation.  
- Bildbibliothek: Tagging/Kategorien erweitern.  
- PDF-Export.  
- Plugin-/Erweiterungsschnittstelle (Zitations-Plugins, Importer).

---

## 12. Risiken & Annahmen

| Risiko | Mitigation |
|--------|------------|
| API-Kosten / Kontingente Gemini | Nutzer konfiguriert Key; Hinweise in UI; rate-limit-Fehler abfangen. |
| Browser-Speicherlimits (IndexedDB) | Export/Backup; Nutzerhinweise in Settings/Help; Cache-Größenanzeige wo vorhanden. |
| XSS durch eingebettetes HTML | Strikte Nutzung bestehender Sanitize-/Render-Pfade bei Änderungen. |

**Annahme:** Hauptnutzung ist Einzelnutzer auf eigenem Gerät; kein mandantenfähiges Hosting durch dieses Repo.

---

## 13. Glossar

| Begriff | Bedeutung |
|---------|-----------|
| **Archiv** | Lokaler Cache der Wikipedia-Artikel (Store `articles`). |
| **Projekt / Kompilation** | Sammlung ordneter Artikel + Notizen + projektbezogene Editor-Inhalte. |
| **Compiler-Ansicht** | UI zum Zusammenstellen und Exportieren einer Kompilation. |
| **BFF** | Backend-for-Frontend — empfohlen für geschützte API-Keys in Produktion. |

---

## 14. Änderungsprotokoll (Dokument)

| Datum | Änderung |
|-------|----------|
| 2026-05-02 | Erstversion aus README, `types.ts`, Services und CI abgeleitet. |
| 2026-05-04 | Abgleich: `public/`-PWA, Vitest-CI, `services/ai/`, `backupSchema`, Tailwind-PostCSS; NFR CI um `npm test` ergänzt. |

Bei featurespezifischen Änderungen: PRD Abschnitt anpassen und kurz unter §14 oder in [`.notes/meeting_notes.md`](.notes/meeting_notes.md) begründen.
