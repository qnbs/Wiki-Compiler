# Wiki Compiler

_Your Private, AI-Powered Research and Knowledge Compilation Environment._

[![CI](https://github.com/qnbs/Wiki-Compiler/actions/workflows/ci.yml/badge.svg)](https://github.com/qnbs/Wiki-Compiler/actions/workflows/ci.yml) ![Status](https://img.shields.io/badge/status-active-brightgreen) ![Version](https://img.shields.io/badge/version-1.2.0-blue) ![Platform](https://img.shields.io/badge/platform-web-orange)

Wiki Compiler transforms passive reading into an active, creative act of knowledge assembly. It is a premium, offline-first Progressive Web App (PWA) designed for students, researchers, and lifelong learners to curate, customize, and compile knowledge from Wikipedia into beautifully formatted, portable documents.

---

## Core Philosophy

> In an age of information overload, focused work is a superpower. Wiki Compiler provides a dedicated, distraction-free sanctuary for deep research. By seamlessly integrating a powerful Wikipedia client, an AI research assistant, and a project-based compiler, it streamlines the entire workflow from initial curiosity to a polished, publishable artifact. Our mission is to empower a more deliberate and effective way to build and share knowledge.

---

## ✨ Key Features

| Feature Category                  | Details                                                                                                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🚀 **High-Performance UI**        | **List Virtualization:** Both the Library and Archive views use virtualization to effortlessly handle thousands of articles, ensuring a consistently smooth and responsive experience without UI lag.                 |
| 🧠 **Intelligent Research**       | **AI Research Assistant (Gemini):** Get instant summaries, key concepts, and potential research questions for any article. <br/> **Offline-First Archive:** Every viewed article is automatically cached in IndexedDB for a robust, searchable, personal knowledge base that works anywhere. <br/> **Advanced Search:** Sort results by relevance, date, or title. |
| ✍️ **Advanced Compilation**       | **Non-Destructive Editing:** Edit articles within a project using a powerful Lexical-based editor. Your changes are saved per-project, leaving the original article untouched in the archive. <br/> **Project Notes:** A dedicated scratchpad for each compilation, perfect for outlines or a research diary. <br/> **Drag & Drop Reordering:** Intuitively structure your compilation's narrative. <br/> **AI Content Editor:** Summarize, rephrase, fix grammar, or perform custom edits on any selected text. |
| 🖼️ **Media Management**            | **Intelligent Image Importer:** Automatically extracts meaningful images from articles (filtering out icons) into a staging area. <br/> **Central Image Library:** Curate and manage a central, reusable library of imported images with custom captions and metadata. |
| 📚 **Professional Publishing**    | **Multi-Format Export:** Generate professional **DOCX**, open-standard **ODT**, portable **Markdown**, or data-centric **JSON** files. <br/> **Automatic Bibliography:** Generate a formatted bibliography in **APA, MLA, or Chicago** style, including both Wikipedia articles and custom external citations. |
| 🎨 **Personalized Workflow**      | **Command Palette (Ctrl/Cmd+K):** A keyboard-driven interface for instant navigation and actions. <br/> **Customizable Appearance:** Switch between Light/Dark/System themes and choose from multiple accent colors. <br/> **Installable PWA:** Install the app on your desktop or mobile device for a native-like experience. <br/> **Full Data Portability:** Backup and restore your entire workspace via JSON import/export. |

---

## 🏛️ Architectural Principles

Wiki Compiler is engineered with a set of modern architectural principles to ensure it is robust, performant, and maintainable.

1.  **Offline-First & PWA:** The application is built as a Progressive Web App from the ground up. A sophisticated service worker aggressively caches the application shell and assets, ensuring instant loads on repeat visits and full functionality without an internet connection. All user data (projects, articles, settings) is stored locally in IndexedDB, making the network an enhancement, not a dependency.

2.  **Client-Centric Architecture:** All core logic—from rendering and state management to document generation and AI API calls—is handled on the client side. This simplifies deployment (static hosting) and enhances privacy, as user data remains on their device until an explicit action (like an AI request) is made.

3.  **Component-Based & Modular UI:** Built with React, the UI is a composition of granular, reusable components. This promotes separation of concerns and maintainability. Views are decoupled from state management logic through a system of custom hooks and contexts.

4.  **Reactive State Management:** Global state (e.g., projects, settings, importers) is managed through the React Context API, encapsulated within custom hooks (`useProjectsContext`, `useSettingsContext`, `useLibraryContext`). This provides a clean, reactive data flow where components automatically update in response to state changes without prop-drilling.

5.  **Accessibility (A11y) by Design:** The application incorporates accessibility best practices, including semantic HTML, ARIA attributes, keyboard navigability (e.g., Command Palette, focus trapping in modals), and sufficient color contrast, ensuring a usable experience for all users.

---

## 🚀 Performance & Optimization

Performance is a critical feature. Several strategies are employed to ensure a fast and fluid user experience:

*   **List Virtualization:** The Library and Archive views use a custom virtualization component to render only the visible items in long lists, preventing DOM bloat and ensuring smooth scrolling even with thousands of articles.
*   **Service Worker Caching:** Provides instant loading of the app shell and offline access using a stale-while-revalidate strategy.
*   **Lazy Loading of Images:** Wikipedia article images are rendered with `loading="lazy"` to defer off-screen image loading, speeding up initial article paint times.
*   **Debouncing:** User input in search fields is debounced to prevent excessive API calls and re-renders, conserving resources.
*   **React Memoization:** Critical and complex components are wrapped in `React.memo` to prevent unnecessary re-renders when their props have not changed.
*   **Efficient Data Storage:** IndexedDB is used for its superior performance and storage capacity compared to `localStorage`, allowing for a large offline article archive without degrading browser performance.

---

## 🛠️ Technology Deep Dive

The tech stack targets a modern, offline-first, feature-rich web application: **Vite** bundles the TypeScript/React source for development and production, while **Tailwind CSS** is still loaded from a CDN in `index.html` for rapid styling.

| Technology                                   | Rationale                                                                                                                                                                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React & TypeScript**                       | Provides a robust, type-safe foundation for building a complex, component-based UI. TypeScript ensures maintainability and reduces runtime errors.                                                                                                                   |
| **Lexical (Rich Text Editor)**               | Chosen over other editors for its high degree of extensibility, reliability, and framework-agnostic core. Developed by Meta, it provides a solid foundation for advanced features like AI integration and custom formatting.                                             |
| **IndexedDB (`idb` library)**                | The cornerstone of the offline architecture. Chosen for its large storage capacity, asynchronous API (preventing UI blocking), and powerful querying capabilities, making it ideal for storing full articles, projects, and user settings.                            |
| **Google Gemini API (`@google/genai`)**      | The core of the application's AI features. Gemini models provide state-of-the-art performance for summarization and text editing. The API's support for JSON schema mode is critical for reliably parsing AI-generated insights.                                        |
| **Tailwind CSS (via CDN)**                   | Utility-first styling loaded from CDN in `index.html`, complementing the Vite bundle. Supports Dark Mode and accent colors without a separate Tailwind build step in this repo.                           |
| **`docx` & Custom ODT Generation**           | These libraries run entirely in the browser, allowing for client-side generation of professional documents. This enhances privacy and eliminates the need for a server-side rendering engine.                                                                      |
| **`i18next` & `react-i18next`**                | Provides a comprehensive framework for internationalization (i18n), enabling full localization of the UI into multiple languages.                                                                                                                                     |

---

## 🚀 Getting Started

Development uses **Node.js**, **npm**, and **Vite** (see `package.json`). Continuous integration runs `npm run typecheck` and `npm run build` on every push and pull request.

### Prerequisites

*   **Node.js** 22 or newer (see `engines` in `package.json`).
*   A modern browser for manual testing (Chrome, Firefox, Edge, or Safari).

### Local development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/qnbs/Wiki-Compiler.git
    cd Wiki-Compiler
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the dev server**
    ```bash
    npm run dev
    ```
    Open the URL printed in the terminal (default: `http://localhost:3000`).

4.  **Production build & preview**
    ```bash
    npm run build
    npm run preview
    ```

5.  **Typecheck** (same checks as CI)
    ```bash
    npm run typecheck
    ```

### Cursor / VS Code

*   Recommended extensions are listed under `.vscode/extensions.json`.
*   Workspace notes for agents and editors live in `.cursorrules`.
*   Optional: open the repo in a Dev Container (`.devcontainer/`); after `postCreateCommand`, run `npm run dev`.

### Gemini API key (optional)

To enable the AI Research Assistant, use a Google Gemini API key.

1.  Obtain a key from **[Google AI Studio](https://aistudio.google.com/)** (“Get API key”).
2.  Copy `.env.example` to `.env` and set `GEMINI_API_KEY=your_key_here`.
3.  Restart `npm run dev` after changing `.env`.

Vite injects this value at dev/build time as `process.env.API_KEY` (see `vite.config.ts`).

> **Security:** Client-side keys are unsafe for public production deployments. Use a backend proxy (“BFF”) for real-world hosting. The `.env` approach is intended for local development and personal use.

**Note:** `index.html` still contains an **import map** (AI Studio CDN) for historical/static experiments. The supported workflow for this repository is **Vite**; opening only `index.html` without the bundler does not compile TypeScript.

---
## 🔐 Security Considerations

*   **API Key Management:** As detailed above, the API key is handled client-side for simplicity. In a production environment, this should be migrated to a secure backend proxy to prevent key exposure.
*   **Cross-Site Scripting (XSS):** Fetched Wikipedia content is sanitized or rendered within sandboxed contexts (e.g., `dangerouslySetInnerHTML` in React, which is a known and controlled risk). All user-generated content (like notes) is handled by React, which automatically escapes content to prevent XSS.
*   **Content Security Policy (CSP):** For a production deployment, a strict CSP header should be implemented to restrict the sources from which scripts, styles, and other resources can be loaded, mitigating the risk of injection attacks.

---

## 🗺️ Future Roadmap

*   **Advanced Search Filters:** Implement filters in the Archive and Library for date ranges, article size, and content tags.
*   **Inter-Article Linking:** Ability to create `[[wiki-links]]` between articles and notes within a compilation.
*   **Enhanced Image Management:** Add tagging and categorization to the central Image Library.
*   **PDF Export:** Add an option to export compilations as professionally formatted PDF documents.
*   **Plugin Architecture:** Develop a system to allow for third-party plugins, such as different citation formatters or data importers.

---

## Created with Google AI Studio

This application was developed using **[Google AI Studio](https://ai.studio.google.com/)**. AI Studio is a web-based IDE that allows developers to quickly prototype and build generative AI applications. It provides a streamlined workflow for iterating on prompts, tuning models, and integrating with application code.

The development of Wiki Compiler was significantly accelerated by the capabilities of AI Studio, enabling the seamless integration of the Google Gemini model for its core AI features.

---
<br>

# Wiki Compiler (Deutsch)

_Ihre private, KI-gestützte Forschungs- und Wissenskompilierungsumgebung._

[![CI](https://github.com/qnbs/Wiki-Compiler/actions/workflows/ci.yml/badge.svg)](https://github.com/qnbs/Wiki-Compiler/actions/workflows/ci.yml) ![Status](https://img.shields.io/badge/status-aktiv-brightgreen) ![Version](https://img.shields.io/badge/version-1.2.0-blue) ![Plattform](https://img.shields.io/badge/plattform-web-orange)

Wiki Compiler verwandelt passives Lesen in einen aktiven, kreativen Akt der Wissenszusammenstellung. Es ist eine erstklassige, offline-fähige Progressive Web App (PWA), die für Studierende, Forschende und lebenslang Lernende entwickelt wurde, um Wissen aus Wikipedia zu kuratieren, anzupassen und in ansprechend formatierte, portable Dokumente zu kompilieren.

---

## Kernphilosophie

> Im Zeitalter der Informationsüberflutung ist fokussiertes Arbeiten eine Superkraft. Wiki Compiler bietet einen dedizierten, ablenkungsfreien Zufluchtsort für tiefgehende Recherchen. Durch die nahtlose Integration eines leistungsstarken Wikipedia-Clients, eines KI-Forschungsassistenten und eines projektbasierten Compilers wird der gesamte Arbeitsablauf von der anfänglichen Neugier bis zum fertigen, veröffentlichungsreifen Artefakt optimiert. Unsere Mission ist es, eine bewusstere und effektivere Art des Wissensaufbaus und -austauschs zu ermöglichen.

---

## ✨ Hauptfunktionen

| Funktionskategorie                | Details                                                                                                                                                                                                         |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🚀 **Hochleistungs-UI**           | **Listen-Virtualisierung:** Sowohl die Bibliotheks- als auch die Archivansicht verwenden Virtualisierung, um mühelos Tausende von Artikeln zu verwalten und eine durchgehend flüssige und reaktionsschnelle Erfahrung ohne UI-Verzögerungen zu gewährleisten. |
| 🧠 **Intelligente Recherche**     | **KI-Forschungsassistent (Gemini):** Erhalten Sie sofortige Zusammenfassungen, Schlüsselkonzepte und potenzielle Forschungsfragen für jeden Artikel. <br/> **Offline-First-Archiv:** Jeder angesehene Artikel wird automatisch in IndexedDB zwischengespeichert, um eine robuste, durchsuchbare, persönliche Wissensdatenbank zu schaffen, die überall funktioniert. <br/> **Erweiterte Suche:** Sortieren Sie Ergebnisse nach Relevanz, Datum oder Titel. |
| ✍️ **Fortgeschrittene Kompilation**| **Nicht-destruktive Bearbeitung:** Bearbeiten Sie Artikel innerhalb eines Projekts mit einem leistungsstarken Lexical-basierten Editor. Ihre Änderungen werden pro Projekt gespeichert, wobei der Originalartikel im Archiv unberührt bleibt. <br/> **Projektnotizen:** Ein dedizierter Notizblock für jede Kompilation, perfekt für Gliederungen oder ein Forschungstagebuch. <br/> **Drag & Drop-Neuordnung:** Strukturieren Sie die Erzählung Ihrer Kompilation intuitiv. <br/> **KI-Inhaltseditor:** Fassen Sie Texte zusammen, formulieren Sie sie um, korrigieren Sie die Grammatik oder führen Sie benutzerdefinierte Bearbeitungen an ausgewähltem Text durch. |
| 🖼️ **Medienverwaltung**            | **Intelligenter Bild-Importer:** Extrahiert automatisch aussagekräftige Bilder aus Artikeln (filtert Symbole heraus) in einen Staging-Bereich. <br/> **Zentrale Bildbibliothek:** Kuratieren und verwalten Sie eine zentrale, wiederverwendbare Bibliothek importierter Bilder mit benutzerdefinierten Bildunterschriften und Metadaten. |
| 📚 **Professionelles Publizieren**  | **Multi-Format-Export:** Erstellen Sie professionelle **DOCX**-, quelloffene **ODT**-, portable **Markdown**- oder datenorientierte **JSON**-Dateien. <br/> **Automatische Bibliografie:** Generieren Sie eine formatierte Bibliografie im **APA-, MLA- oder Chicago**-Stil, die sowohl Wikipedia-Artikel als auch benutzerdefinierte externe Zitate enthält. |
| 🎨 **Personalisierter Workflow**   | **Befehlspalette (Strg/Cmd+K):** Eine tastaturgesteuerte Oberfläche für sofortige Navigation und Aktionen. <br/> **Anpassbares Erscheinungsbild:** Wechseln Sie zwischen Hellen/Dunklen/System-Themen und wählen Sie aus mehreren Akzentfarben. <br/> **Installierbare PWA:** Installieren Sie die App auf Ihrem Desktop oder Mobilgerät für ein natives Erlebnis. <br/> **Vollständige Datenportabilität:** Sichern und Wiederherstellen Sie Ihren gesamten Arbeitsbereich über JSON-Import/Export. |

---

## 🏛️ Architekturprinzipien

Wiki Compiler wurde nach einer Reihe moderner Architekturprinzipien entwickelt, um Robustheit, Leistung und Wartbarkeit zu gewährleisten.

1.  **Offline-First & PWA:** Die Anwendung ist von Grund auf als Progressive Web App konzipiert. Ein ausgeklügelter Service Worker speichert die Anwendungshülle und die Assets aggressiv zwischen, was bei wiederholten Besuchen zu sofortigen Ladezeiten und voller Funktionalität ohne Internetverbindung führt. Alle Benutzerdaten (Projekte, Artikel, Einstellungen) werden lokal in IndexedDB gespeichert, wodurch das Netzwerk zu einer Verbesserung und nicht zu einer Abhängigkeit wird.

2.  **Client-zentrierte Architektur:** Die gesamte Kernlogik – von der Darstellung und Zustandsverwaltung bis zur Dokumentenerstellung und den KI-API-Aufrufen – wird auf der Client-Seite abgewickelt. Dies vereinfacht die Bereitstellung (statisches Hosting) und erhöht die Privatsphäre, da die Benutzerdaten auf ihrem Gerät verbleiben, bis eine explizite Aktion (wie eine KI-Anfrage) erfolgt.

3.  **Komponentenbasiertes & modulares UI:** Mit React erstellt, ist die Benutzeroberfläche eine Komposition aus granularen, wiederverwendbaren Komponenten. Dies fördert die Trennung der Belange und die Wartbarkeit. Die Ansichten sind durch ein System von benutzerdefinierten Hooks und Kontexten von der Logik der Zustandsverwaltung entkoppelt.

4.  **Reaktives Zustandsmanagement:** Der globale Zustand (z. B. Projekte, Einstellungen, Importer) wird über die React Context API verwaltet, die in benutzerdefinierten Hooks (`useProjectsContext`, `useSettingsContext`, `useLibraryContext`) gekapselt ist. Dies sorgt für einen sauberen, reaktiven Datenfluss, bei dem sich Komponenten automatisch als Reaktion auf Zustandsänderungen aktualisieren, ohne Prop-Drilling.

5.  **Barrierefreiheit (A11y) by Design:** Die Anwendung berücksichtigt Best Practices für die Barrierefreiheit, einschließlich semantischem HTML, ARIA-Attributen, Tastaturnavigation (z. B. Befehlspalette, Fokus-Trapping in Modalen) und ausreichendem Farbkontrast, um eine nutzbare Erfahrung für alle Benutzer zu gewährleisten.

---

## 🚀 Leistung & Optimierung

Leistung ist ein kritisches Merkmal. Es werden mehrere Strategien angewendet, um eine schnelle und flüssige Benutzererfahrung zu gewährleisten:

*   **Listen-Virtualisierung:** Die Bibliotheks- und Archivansichten verwenden eine benutzerdefinierte Virtualisierungskomponente, um nur die sichtbaren Elemente in langen Listen zu rendern, was ein Aufblähen des DOM verhindert und ein flüssiges Scrollen selbst bei Tausenden von Artikeln sicherstellt.
*   **Service Worker Caching:** Ermöglicht das sofortige Laden der App-Hülle und den Offline-Zugriff mithilfe einer Stale-While-Revalidate-Strategie.
*   **Lazy Loading von Bildern:** Bilder aus Wikipedia-Artikeln werden mit `loading="lazy"` gerendert, um das Laden von Bildern außerhalb des sichtbaren Bereichs zu verzögern und die anfänglichen Ladezeiten der Artikel zu beschleunigen.
*   **Debouncing:** Benutzereingaben in Suchfeldern werden entprellt, um übermäßige API-Aufrufe und Neu-Renderings zu verhindern und Ressourcen zu schonen.
*   **React-Memoization:** Kritische und komplexe Komponenten werden in `React.memo` verpackt, um unnötige Neu-Renderings zu verhindern, wenn sich ihre Props nicht geändert haben.
*   **Effiziente Datenspeicherung:** IndexedDB wird aufgrund seiner überlegenen Leistung und Speicherkapazität im Vergleich zu `localStorage` verwendet, was ein großes Offline-Artikelarchiv ermöglicht, ohne die Browserleistung zu beeinträchtigen.

---

## 🛠️ Technischer Einblick

Der Technologiestapel zielt auf eine moderne, offlinefähige Webanwendung: **Vite** bündelt TypeScript/React für Entwicklung und Produktion; **Tailwind CSS** wird weiterhin per CDN in `index.html` geladen.

| Technologie                                 | Begründung                                                                                                                                                                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React & TypeScript**                      | Bietet eine robuste, typsichere Grundlage für die Erstellung einer komplexen, komponentenbasierten Benutzeroberfläche. TypeScript gewährleistet die Wartbarkeit und reduziert Laufzeitfehler.                                                                      |
| **Lexical (Rich-Text-Editor)**              | Wurde aufgrund seiner hohen Erweiterbarkeit, Zuverlässigkeit und seines Framework-unabhängigen Kerns anderen Editoren vorgezogen. Entwickelt von Meta, bietet es eine solide Grundlage für erweiterte Funktionen wie KI-Integration und benutzerdefinierte Formatierungen. |
| **IndexedDB (`idb`-Bibliothek)**            | Der Eckpfeiler der Offline-Architektur. Ausgewählt wegen seiner großen Speicherkapazität, seiner asynchronen API (verhindert das Blockieren der Benutzeroberfläche) und seiner leistungsstarken Abfragemöglichkeiten, was es ideal für die Speicherung vollständiger Artikel, Projekte und Benutzereinstellungen macht. |
| **Google Gemini API (`@google/genai`)**     | Der Kern der KI-Funktionen der Anwendung. Gemini-Modelle bieten modernste Leistung für Zusammenfassungen und Textbearbeitung. Die Unterstützung des JSON-Schema-Modus durch die API ist entscheidend für das zuverlässige Parsen von KI-generierten Erkenntnissen. |
| **Tailwind CSS (über CDN)**                 | Utility-First-Styling per CDN in `index.html`, ergänzend zum Vite-Bundle. Dunkelmodus und Akzentfarben ohne separate Tailwind-Build-Pipeline in diesem Repository. |
| **`docx` & benutzerdefinierte ODT-Generierung** | Diese Bibliotheken laufen vollständig im Browser und ermöglichen die clientseitige Erstellung professioneller Dokumente. Dies erhöht die Privatsphäre und macht eine serverseitige Rendering-Engine überflüssig. |
| **`i18next` & `react-i18next`**               | Bietet ein umfassendes Framework für die Internationalisierung (i18n) und ermöglicht die vollständige Lokalisierung der Benutzeroberfläche in mehrere Sprachen. |

---

## 🚀 Erste Schritte

Die Entwicklung läuft mit **Node.js**, **npm** und **Vite** (siehe `package.json`). Die CI-Pipeline führt bei jedem Push und Pull Request `npm run typecheck` und `npm run build` aus.

### Voraussetzungen

*   **Node.js** 22 oder neuer (siehe `engines` in `package.json`).
*   Ein aktueller Browser zum manuellen Testen.

### Lokale Entwicklung

1.  **Repository klonen**
    ```bash
    git clone https://github.com/qnbs/Wiki-Compiler.git
    cd Wiki-Compiler
    ```

2.  **Abhängigkeiten installieren**
    ```bash
    npm install
    ```

3.  **Entwicklungsserver starten**
    ```bash
    npm run dev
    ```
    Die App erreichen Sie unter der im Terminal angezeigten URL (Standard: `http://localhost:3000`).

4.  **Produktions-Build und Vorschau**
    ```bash
    npm run build
    npm run preview
    ```

5.  **Typprüfung** (wie in der CI)
    ```bash
    npm run typecheck
    ```

### Cursor / VS Code

*   Empfohlene Erweiterungen: `.vscode/extensions.json`.
*   Projekthinweise für Editoren und Agenten: `.cursorrules`.
*   Optional: Dev Container (`.devcontainer/`); nach der Einrichtung `npm run dev` ausführen.

### Gemini-API-Schlüssel (optional)

1.  Schlüssel in **[Google AI Studio](https://aistudio.google.com/)** erstellen („Get API key“).
2.  `.env.example` nach `.env` kopieren und `GEMINI_API_KEY=` setzen.
3.  Nach Änderungen an `.env` den Dev-Server neu starten.

Vite setzt den Wert zur Laufzeit von Dev/Build als `process.env.API_KEY` (siehe `vite.config.ts`).

> **Sicherheit:** Öffentliche Produktionsdeployments sollten den Schlüssel nicht im Client halten; ein Backend-Proxy ist das empfohlene Muster. `.env` ist für lokale und persönliche Nutzung gedacht.

**Hinweis:** Die **Import-Map** in `index.html` (AI-Studio-CDN) dient historischen/statischen Versuchen. Der unterstützte Weg in diesem Repo ist **Vite**; ohne Bundler wird kein TypeScript kompiliert.

---
## 🔐 Sicherheitsaspekte

*   **API-Schlüsselverwaltung:** Wie oben beschrieben, wird der API-Schlüssel der Einfachheit halber clientseitig gehandhabt. In einer Produktionsumgebung sollte dies auf einen sicheren Backend-Proxy migriert werden, um die Offenlegung des Schlüssels zu verhindern.
*   **Cross-Site Scripting (XSS):** Abgerufene Wikipedia-Inhalte werden bereinigt oder in sandboxed Kontexten gerendert (z. B. `dangerouslySetInnerHTML` in React, was ein bekanntes und kontrolliertes Risiko ist). Alle benutzergenerierten Inhalte (wie Notizen) werden von React verarbeitet, das Inhalte automatisch escaped, um XSS zu verhindern.
*   **Content Security Policy (CSP):** Für eine Produktionsbereitstellung sollte ein strenger CSP-Header implementiert werden, um die Quellen einzuschränken, aus denen Skripte, Stile und andere Ressourcen geladen werden können, wodurch das Risiko von Injektionsangriffen gemindert wird.

---

## 🗺️ Zukünftige Roadmap

*   **Erweiterte Suchfilter:** Implementierung von Filtern im Archiv und in der Bibliothek für Datumsbereiche, Artikelgröße und Inhalts-Tags.
*   **Verknüpfung zwischen Artikeln:** Möglichkeit, `[[Wiki-Links]]` zwischen Artikeln und Notizen innerhalb einer Kompilation zu erstellen.
*   **Verbesserte Bildverwaltung:** Hinzufügen von Tagging und Kategorisierung zur zentralen Bildbibliothek.
*   **PDF-Export:** Hinzufügen einer Option zum Exportieren von Kompilationen als professionell formatierte PDF-Dokumente.
*   **Plugin-Architektur:** Entwicklung eines Systems, das Plugins von Drittanbietern ermöglicht, wie z. B. verschiedene Zitationsformatierer oder Datenimporter.

---

## Erstellt mit Google AI Studio

Diese Anwendung wurde mit **[Google AI Studio](https://ai.studio.google.com/)** entwickelt. AI Studio ist eine webbasierte IDE, die es Entwicklern ermöglicht, generative KI-Anwendungen schnell zu prototypisieren und zu erstellen. Es bietet einen optimierten Arbeitsablauf zum Iterieren von Prompts, zum Abstimmen von Modellen und zur Integration in den Anwendungscode.

Die Entwicklung von Wiki Compiler wurde durch die Funktionen von AI Studio erheblich beschleunigt, was die nahtlose Integration des Google Gemini-Modells für seine zentralen KI-Funktionen ermöglichte.
