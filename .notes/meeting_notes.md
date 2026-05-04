# Meeting Notes & Consciousness Stream

**Zweck:** Chronik für **projektbezogene Entscheidungen**, offene Fragen und Kurzprotokolle — ergänzend zu **PRD.md** und **instructions.md**. Keine Secrets, keine API-Keys, keine personenbezogenen Daten.

**Nutzen für Agenten & Maintainer:** Vor größeren Refactors oder Produktänderungen kurz den letzten relevanten Eintrag und das PRD lesen; nach abgeschlossenen Milestones hier **ein bis zwei Sätze** dokumentieren.

---

## Nutzungskonvention

1. **Neuer Eintrag oben** unter „Chronik“ (neuestes Datum zuerst), oder klare Überschriften mit ISO-Datum.  
2. **Entscheidungen:** Was wurde festgelegt, **Warum** kurz, optional Alternativen die verworfen wurden.  
3. **Open Questions:** Bullet-Liste; beim Klären entweder löschen oder mit Datum „gelöst“ verlinken.  
4. **Sessions:** Optional Meeting-Titel, Teilnehmer nur wenn nötig (Datenschutz).

---

## Offene Fragen (Backlog)

*(Leer — hier eintragen, wenn Klärung aussteht.)*

- [ ] *(Beispiel)* Soll ein zukünftiger PDF-Export serverseitig oder rein clientseitig erfolgen?

---

## Festgetroffene Entscheidungen (persistent)

| Datum | Thema | Entscheidung | Referenz |
|-------|--------|--------------|----------|
| 2026-05-04 | Docs & Cursor-Regeln | Cursor-Rules, CI-Workflow, PRD/instructions und Hilfs-Doks mit Ist-Stack synchronisiert (`public/`-PWA, Vitest, `services/ai/`, Tailwind-PostCSS, Zod-Backup). | `.cursor/`, `.github/workflows/ci.yml`, PRD, instructions |
| 2026-05-02 | Dokumentation | PRD.md, instructions.md und diese Datei als Kanon für Scope und Umsetzung etabliert; README bleibt nutzerorientiert. | PRD.md, instructions.md |

---

## Chronik

### 2026-05-04 — Vollständiger Doku- und Regelabgleich

- **Kontext:** Einheitliche Betriebs- und Architektur-Hinweise für Agenten und Maintainer.  
- **Aktualisiert:** `.cursor/index.mdc` und Regeln (Security, Gemini/IDB, UI, neues `310-tailwind-styling`, Testing); `ci.yml` mit Concurrency, benannten Schritten und `npm test`; PRD/instructions/AI-Dok; VS Code-Empfehlung Vitest-Extension.  
- **Hinweis:** PWA-Dateien liegen unter `public/`; `graphify update .` nach Codeänderungen laut Projektregel.

### 2026-05-02 — Dokumentationsbaseline

- **Kontext:** Aufbau vollständiger PRD- und instructions-Dokumente sowie Bewusstseinsstrom für Cursor/ Maintainer.  
- **Festgestellt:** Stack = React 19, Vite 6, TS, Lexical, IndexedDB (`idb`), Gemini optional, PWA; CI = typecheck + build auf Node 22; keine Backend-Pipeline im Repo.  
- **Nächste sinnvolle Schritte (optional):** Vitest einführen für `services/` (Gemini/Wikipedia gemockt); PDF-Export als separates Epic im PRD-Roadmap-Abschnitt verfeinern.

---

## Vorlage für zukünftige Einträge

```markdown
### YYYY-MM-DD — Kurztitel

- **Teilnehmer / Kontext:** …
- **Ziel:** …
- **Besprochen:** …
- **Entscheidung:** …
- **Follow-up:** …
```

---

## Verknüpfungen

- **PRD:** [/PRD.md](../PRD.md)  
- **instructions:** [/instructions.md](../instructions.md)  
- **README:** [/README.md](../README.md)  
- **Cursor-Regeln:** [/.cursor/index.mdc](../.cursor/index.mdc)
