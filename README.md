# Wiki Compiler

_Your Private, AI-Powered Research and Knowledge Compilation Environment._

![Status](https://img.shields.io/badge/status-active-brightgreen) ![Version](https://img.shields.io/badge/version-1.2.0-blue) ![Platform](https://img.shields.io/badge/platform-web-orange)

Wiki Compiler transforms passive reading into an active, creative act of knowledge assembly. It is a premium, offline-first Progressive Web App (PWA) designed for students, researchers, and lifelong learners to curate, customize, and compile knowledge from Wikipedia into beautifully formatted, portable documents.

---

## Core Philosophy

> In an age of information overload, focused work is a superpower. Wiki Compiler provides a dedicated, distraction-free sanctuary for deep research. By seamlessly integrating a powerful Wikipedia client, an AI research assistant, and a project-based compiler, it streamlines the entire workflow from initial curiosity to a polished, publishable artifact. Our mission is to empower a more deliberate and effective way to build and share knowledge.

---

## ✨ Key Features

| Feature Category                  | Details                                                                                                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
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

4.  **Reactive State Management:** Global state (e.g., projects, settings, importers) is managed through the React Context API. This provides a clean, reactive data flow where components automatically update in response to state changes without prop-drilling. Custom hooks (`useProjects`, `useSettings`) encapsulate context consumption for a clean and simple API.

5.  **Accessibility (A11y) by Design:** The application incorporates accessibility best practices, including semantic HTML, ARIA attributes, keyboard navigability (e.g., Command Palette, focus trapping in modals), and sufficient color contrast, ensuring a usable experience for all users.

---

## 🚀 Performance & Optimization

Performance is a critical feature. Several strategies are employed to ensure a fast and fluid user experience:

*   **Service Worker Caching:** Provides instant loading of the app shell and offline access.
*   **Lazy Loading of Images:** Wikipedia article images are rendered with `loading="lazy"` to defer off-screen image loading, speeding up initial article paint times.
*   **Debouncing:** User input in search fields and text areas is debounced to prevent excessive API calls and re-renders, conserving resources.
*   **React Memoization:** Critical and complex components are wrapped in `React.memo` to prevent unnecessary re-renders when their props have not changed.
*   **Efficient Data Storage:** IndexedDB is used for its superior performance and storage capacity compared to `localStorage`, allowing for a large offline article archive without degrading browser performance.
*   **Virtualization (Future consideration):** For views with potentially thousands of items (e.g., Archive), list virtualization can be implemented to render only the visible items.

---

## 🛠️ Technology Deep Dive

The tech stack was strategically chosen to meet the demands of a modern, offline-first, feature-rich web application without requiring a complex build pipeline.

| Technology                                   | Rationale                                                                                                                                                                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React & TypeScript**                       | Provides a robust, type-safe foundation for building a complex, component-based UI. TypeScript ensures maintainability and reduces runtime errors.                                                                                                                   |
| **Lexical (Rich Text Editor)**               | Chosen over other editors for its high degree of extensibility, reliability, and framework-agnostic core. Developed by Meta, it provides a solid foundation for advanced features like AI integration and custom formatting.                                             |
| **IndexedDB (`idb` library)**                | The cornerstone of the offline architecture. Chosen for its large storage capacity, asynchronous API (preventing UI blocking), and powerful querying capabilities, making it ideal for storing full articles, projects, and user settings.                            |
| **Google Gemini API (`@google/genai`)**      | The core of the application's AI features. Gemini models provide state-of-the-art performance for summarization and text editing. The API's support for JSON schema mode is critical for reliably parsing AI-generated insights.                                        |
| **Tailwind CSS (via CDN)**                   | Enables rapid, utility-first styling directly in the HTML, perfectly suited for a no-build-step development environment. It allows for a consistent design system and easy implementation of features like Dark Mode and dynamic accent colors.                           |
| **`docx` & Custom ODT Generation**           | These libraries run entirely in the browser, allowing for client-side generation of professional documents. This enhances privacy and eliminates the need for a server-side rendering engine.                                                                      |
| **`i18next` & `react-i18next`**                | Provides a comprehensive framework for internationalization (i18n), enabling full localization of the UI into multiple languages.                                                                                                                                     |

---

## 🚀 Getting Started

This project is configured to run without a build step, leveraging modern browser features like import maps.

### Prerequisites

*   A modern web browser with support for ES modules and import maps (e.g., Chrome, Firefox, Edge).
*   A local web server to serve the files. The **Live Server** extension for VS Code is highly recommended.

### Local Development Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/wiki-compiler.git
    cd wiki-compiler
    ```

2.  **Launch with a Web Server:**
    *   **Using VS Code & Live Server:** Right-click on `index.html` and select "Open with Live Server".
    *   **Using Python:** Run `python -m http.server` in the project directory and navigate to `http://localhost:8000`.

### Setting up the Gemini API Key

To enable the AI Research Assistant, a valid Google Gemini API key is required.

1.  **Get Your API Key:**
    *   Visit **[Google AI Studio](https://aistudio.google.com/)**.
    *   Click **"Get API key"** and create a new key.

2.  **Provide the API Key:**
    The application is designed to access the key from a pre-configured `process.env.API_KEY` environment variable.

    > **Security Warning:** This is a client-side application. Exposing an API key directly in browser-run code is insecure for a public production application. For a real-world public deployment, the recommended pattern is to create a secure backend proxy (a "Backend-for-Frontend") that holds the key and forwards requests to the Google API. The following method is suitable for personal use, local development, or protected deployments only.

    For local development, create a temporary script in `index.html` to simulate the environment variable. **This file should not be committed to version control.**

    ```html
    <!-- Add this inside the <head> tag in index.html for local development -->
    <script>
      // FOR LOCAL DEVELOPMENT ONLY - DO NOT COMMIT
      window.process = { env: { API_KEY: 'YOUR_API_KEY_HERE' } };
    </script>
    ```

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

_Ihre Private, KI-gestützte Forschungs- und Wissenskompilierungsumgebung._

![Status](https://img.shields.io/badge/status-active-brightgreen) ![Version](https://img.shields.io/badge/version-1.2.0-blue) ![Plattform](https://img.shields.io/badge/platform-web-orange)

Wiki Compiler verwandelt passives Lesen in einen aktiven, kreativen Akt der Wissenszusammenstellung. Es ist eine hochwertige, offline-fähige Progressive Web App (PWA), die für Studierende, Forschende und lebenslang Lernende entwickelt wurde, um Wissen aus Wikipedia zu kuratieren, anzupassen und in ansprechend formatierte, portable Dokumente zu kompilieren.

---

## Kernphilosophie

> Im Zeitalter der Informationsüberflutung ist konzentriertes Arbeiten eine Superkraft. Wiki Compiler bietet einen dedizierten, ablenkungsfreien Zufluchtsort für intensive Recherche. Durch die nahtlose Integration eines leistungsstarken Wikipedia-Clients, eines KI-Forschungsassistenten und eines projektbasierten Compilers wird der gesamte Arbeitsablauf von der anfänglichen Neugier bis zum fertigen Artefakt optimiert. Unsere Mission ist es, eine bewusstere und effektivere Methode zum Aufbauen und Teilen von Wissen zu ermöglichen.

---

## ✨ Hauptfunktionen

| Funktionskategorie                | Details                                                                                                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 🧠 **Intelligente Recherche**     | **KI-Forschungsassistent (Gemini):** Erhalten Sie sofortige Zusammenfassungen, Schlüsselkonzepte und potenzielle Forschungsfragen für jeden Artikel. <br/> **Offline-First-Archiv:** Jeder angesehene Artikel wird automatisch in IndexedDB zwischengespeichert, um eine robuste, durchsuchbare, persönliche Wissensdatenbank zu schaffen, die überall funktioniert. <br/> **Erweiterte Suche:** Sortieren Sie Ergebnisse nach Relevanz, Datum oder Titel. |
| ✍️ **Fortgeschrittene Kompilation** | **Nicht-destruktive Bearbeitung:** Bearbeiten Sie Artikel innerhalb eines Projekts mit einem leistungsstarken, auf Lexical basierenden Editor. Ihre Änderungen werden pro Projekt gespeichert, während der Originalartikel im Archiv unangetastet bleibt. <br/> **Projektnotizen:** Ein dedizierter Notizbereich für jede Kompilation, ideal für Gliederungen oder ein Forschungstagebuch. <br/> **Drag & Drop-Sortierung:** Strukturieren Sie Ihre Kompilation intuitiv. <br/> **KI-Inhaltseditor:** Fassen Sie ausgewählten Text zusammen, formulieren Sie ihn um, korrigieren Sie die Grammatik oder führen Sie benutzerdefinierte Bearbeitungen durch. |
| 🖼️ **Medienverwaltung**            | **Intelligenter Bild-Importer:** Extrahiert automatisch aussagekräftige Bilder aus Artikeln (filtert Symbole heraus) in einen Staging-Bereich. <br/> **Zentrale Bildbibliothek:** Kuratieren und verwalten Sie eine zentrale, wiederverwendbare Bibliothek importierter Bilder mit benutzerdefinierten Untertiteln und Metadaten. |
| 📚 **Professionelles Publizieren** | **Multi-Format-Export:** Erzeugen Sie professionelle **DOCX**-, standardkonforme **ODT**-, portable **Markdown**- oder datenorientierte **JSON**-Dateien. <br/> **Automatische Bibliografie:** Erzeugen Sie eine formatierte Bibliografie im **APA-, MLA- oder Chicago**-Stil, die sowohl Wikipedia-Artikel als auch benutzerdefinierte externe Zitate enthält. |
| 🎨 **Personalisierter Workflow**   | **Befehlspalette (Strg/Cmd+K):** Eine tastaturgesteuerte Oberfläche für sofortige Navigation und Aktionen. <br/> **Anpassbares Erscheinungsbild:** Wechseln Sie zwischen Hellen/Dunklen/System-Themes und wählen Sie aus mehreren Akzentfarben. <br/> **Installierbare PWA:** Installieren Sie die App auf Ihrem Desktop oder Mobilgerät für eine native Benutzererfahrung. <br/> **Volle Datenportabilität:** Sichern und Wiederherstellen Sie Ihren gesamten Arbeitsbereich über JSON-Import/Export. |

---

## 🏛️ Architekturprinzipien

Wiki Compiler wurde nach einer Reihe moderner Architekturprinzipien entwickelt, um Robustheit, Leistung und Wartbarkeit zu gewährleisten.

1.  **Offline-First & PWA:** Die Anwendung ist von Grund auf als Progressive Web App konzipiert. Ein hochentwickelter Service Worker speichert die Anwendungshülle und Assets aggressiv zwischen, was sofortige Ladezeiten bei wiederholten Besuchen und volle Funktionalität ohne Internetverbindung gewährleistet. Alle Benutzerdaten (Projekte, Artikel, Einstellungen) werden lokal in IndexedDB gespeichert, wodurch das Netzwerk zu einer Verbesserung und nicht zu einer Abhängigkeit wird.

2.  **Client-zentrierte Architektur:** Die gesamte Kernlogik – von der Darstellung über die Zustandsverwaltung bis hin zur Dokumentenerstellung und den KI-API-Aufrufen – wird auf der Client-Seite abgewickelt. Dies vereinfacht die Bereitstellung (statisches Hosting) und erhöht die Privatsphäre, da die Benutzerdaten auf dem Gerät verbleiben, bis eine explizite Aktion (wie eine KI-Anfrage) ausgeführt wird.

3.  **Komponentenbasiertes & modulares UI:** Die mit React erstellte Benutzeroberfläche ist eine Komposition aus granularen, wiederverwendbaren Komponenten. Dies fördert die Trennung von Belangen und die Wartbarkeit. Ansichten sind durch ein System von benutzerdefinierten Hooks und Contexts von der Zustandsverwaltungslogik entkoppelt.

4.  **Reaktive Zustandsverwaltung:** Der globale Zustand (z. B. Projekte, Einstellungen, Importer) wird über die React Context API verwaltet. Dies ermöglicht einen sauberen, reaktiven Datenfluss, bei dem sich Komponenten automatisch als Reaktion auf Zustandsänderungen aktualisieren, ohne "Prop-Drilling". Benutzerdefinierte Hooks (`useProjects`, `useSettings`) kapseln die Nutzung des Contexts für eine saubere und einfache API.

5.  **Barrierefreiheit (A11y) by Design:** Die Anwendung berücksichtigt Best Practices für die Barrierefreiheit, einschließlich semantischem HTML, ARIA-Attributen, Tastaturnavigation (z. B. Befehlspalette, Fokus-Trapping in Modals) und ausreichendem Farbkontrast, um eine nutzbare Erfahrung für alle Benutzer zu gewährleisten.

---

## 🚀 Leistung & Optimierung

Leistung ist ein kritisches Merkmal. Es werden mehrere Strategien angewendet, um eine schnelle und flüssige Benutzererfahrung zu gewährleisten:

*   **Service Worker Caching:** Ermöglicht sofortiges Laden der App-Hülle und Offline-Zugriff.
*   **Lazy Loading von Bildern:** Bilder in Wikipedia-Artikeln werden mit `loading="lazy"` gerendert, um das Laden von Bildern außerhalb des sichtbaren Bereichs zu verzögern und die anfänglichen Ladezeiten der Artikel zu beschleunigen.
*   **Debouncing:** Benutzereingaben in Suchfeldern und Textbereichen werden verzögert verarbeitet (debounced), um übermäßige API-Aufrufe und Neu-Renderings zu vermeiden und Ressourcen zu schonen.
*   **React Memoization:** Kritische und komplexe Komponenten werden in `React.memo` verpackt, um unnötige Neu-Renderings zu verhindern, wenn sich ihre Props nicht geändert haben.
*   **Effiziente Datenspeicherung:** IndexedDB wird aufgrund seiner überlegenen Leistung und Speicherkapazität im Vergleich zu `localStorage` verwendet, was ein großes Offline-Artikelarchiv ohne Beeinträchtigung der Browserleistung ermöglicht.

---

## 🛠️ Technologie im Detail

Der Tech-Stack wurde strategisch ausgewählt, um die Anforderungen einer modernen, offline-fähigen und funktionsreichen Webanwendung zu erfüllen, ohne eine komplexe Build-Pipeline zu benötigen.

| Technologie                                   | Begründung                                                                                                                                                                                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React & TypeScript**                       | Bietet eine robuste, typsichere Grundlage für die Erstellung einer komplexen, komponentenbasierten Benutzeroberfläche. TypeScript gewährleistet Wartbarkeit und reduziert Laufzeitfehler.                                                                          |
| **Lexical (Rich Text Editor)**               | Wurde aufgrund seiner hohen Erweiterbarkeit, Zuverlässigkeit und seines Framework-agnostischen Kerns gegenüber anderen Editoren gewählt. Von Meta entwickelt, bietet es eine solide Grundlage für erweiterte Funktionen wie KI-Integration und benutzerdefinierte Formatierungen. |
| **IndexedDB (`idb`-Bibliothek)**             | Der Grundpfeiler der Offline-Architektur. Ausgewählt wegen seiner großen Speicherkapazität, der asynchronen API (verhindert das Blockieren der Benutzeroberfläche) und der leistungsstarken Abfragefunktionen, was es ideal für die Speicherung vollständiger Artikel, Projekte und Benutzereinstellungen macht. |
| **Google Gemini API (`@google/genai`)**      | Der Kern der KI-Funktionen der Anwendung. Gemini-Modelle bieten modernste Leistung für Zusammenfassungen und Textbearbeitung. Die Unterstützung des JSON-Schema-Modus durch die API ist entscheidend für das zuverlässige Parsen von KI-generierten Einblicken. |
| **Tailwind CSS (über CDN)**                  | Ermöglicht schnelles, Utility-First-Styling direkt im HTML, perfekt geeignet für eine Entwicklungsumgebung ohne Build-Schritt. Es ermöglicht ein konsistentes Designsystem und eine einfache Implementierung von Funktionen wie Dark Mode und dynamischen Akzentfarben. |
| **`docx` & benutzerdefinierte ODT-Erzeugung**| Diese Bibliotheken laufen vollständig im Browser und ermöglichen die clientseitige Erzeugung professioneller Dokumente. Dies erhöht die Privatsphäre und eliminiert die Notwendigkeit einer serverseitigen Rendering-Engine.                                       |
| **`i18next` & `react-i18next`**                | Bietet ein umfassendes Framework für die Internationalisierung (i18n), das eine vollständige Lokalisierung der Benutzeroberfläche in mehrere Sprachen ermöglicht.                                                                                            |

---

## 🚀 Erste Schritte

Dieses Projekt ist so konfiguriert, dass es ohne Build-Schritt ausgeführt werden kann und moderne Browserfunktionen wie Import-Maps nutzt.

### Voraussetzungen

*   Ein moderner Webbrowser mit Unterstützung für ES-Module und Import-Maps (z. B. Chrome, Firefox, Edge).
*   Ein lokaler Webserver zum Bereitstellen der Dateien. Die **Live Server**-Erweiterung für VS Code wird dringend empfohlen.

### Lokales Entwicklungs-Setup

1.  **Repository klonen:**
    ```bash
    git clone https://github.com/ihr-benutzername/wiki-compiler.git
    cd wiki-compiler
    ```

2.  **Mit einem Webserver starten:**
    *   **Mit VS Code & Live Server:** Rechtsklick auf `index.html` und "Open with Live Server" auswählen.
    *   **Mit Python:** Führen Sie `python -m http.server` im Projektverzeichnis aus und navigieren Sie zu `http://localhost:8000`.

### Einrichten des Gemini API-Schlüssels

Um den KI-Forschungsassistenten zu aktivieren, ist ein gültiger Google Gemini API-Schlüssel erforderlich.

1.  **API-Schlüssel erhalten:**
    *   Besuchen Sie **[Google AI Studio](https://aistudio.google.com/)**.
    *   Klicken Sie auf **"Get API key"** und erstellen Sie einen neuen Schlüssel.

2.  **API-Schlüssel bereitstellen:**
    Die Anwendung ist so konzipiert, dass sie auf den Schlüssel aus einer vorkonfigurierten `process.env.API_KEY`-Umgebungsvariable zugreift.

    > **Sicherheitswarnung:** Dies ist eine clientseitige Anwendung. Das direkte Offenlegen eines API-Schlüssels in im Browser ausgeführtem Code ist für eine öffentliche Produktionsanwendung unsicher. Für eine reale öffentliche Bereitstellung ist das empfohlene Muster die Erstellung eines sicheren Backend-Proxys (ein "Backend-for-Frontend"), der den Schlüssel aufbewahrt und Anfragen an die Google-API weiterleitet. Die folgende Methode ist nur für den persönlichen Gebrauch, die lokale Entwicklung oder geschützte Bereitstellungen geeignet.

    Fügen Sie für die lokale Entwicklung ein temporäres Skript in `index.html` hinzu, um die Umgebungsvariable zu simulieren. **Diese Datei sollte nicht in die Versionskontrolle eingecheckt werden.**

    ```html
    <!-- Fügen Sie dies für die lokale Entwicklung in den <head>-Tag in index.html ein -->
    <script>
      // NUR FÜR LOKALE ENTWICKLUNG - NICHT COMMITEN
      window.process = { env: { API_KEY: 'IHR_API_SCHLÜSSEL_HIER' } };
    </script>
    ```
---
## 🔐 Sicherheitsüberlegungen

*   **API-Schlüssel-Management:** Wie oben beschrieben, wird der API-Schlüssel der Einfachheit halber clientseitig gehandhabt. In einer Produktionsumgebung sollte dies auf einen sicheren Backend-Proxy migriert werden, um die Offenlegung des Schlüssels zu verhindern.
*   **Cross-Site Scripting (XSS):** Abgerufene Wikipedia-Inhalte werden bereinigt oder in sandboxed Kontexten gerendert (z.B. `dangerouslySetInnerHTML` in React, was ein bekanntes und kontrolliertes Risiko darstellt). Alle benutzergenerierten Inhalte (wie Notizen) werden von React verarbeitet, das Inhalte automatisch escaped, um XSS zu verhindern.
*   **Content Security Policy (CSP):** Für eine Produktionsbereitstellung sollte ein strenger CSP-Header implementiert werden, um die Quellen einzuschränken, aus denen Skripte, Stile und andere Ressourcen geladen werden können, um das Risiko von Injektionsangriffen zu mindern.

---

## 🗺️ Zukünftige Roadmap

*   **Erweiterte Suchfilter:** Implementierung von Filtern im Archiv und in der Bibliothek für Datumsbereiche, Artikelgröße und Inhalts-Tags.
*   **Verknüpfung zwischen Artikeln:** Möglichkeit, `[[Wiki-Links]]` zwischen Artikeln und Notizen innerhalb einer Kompilation zu erstellen.
*   **Verbesserte Bildverwaltung:** Hinzufügen von Tagging und Kategorisierung zur zentralen Bildbibliothek.
*   **PDF-Export:** Hinzufügen einer Option zum Exportieren von Kompilationen als professionell formatierte PDF-Dokumente.
*   **Plugin-Architektur:** Entwicklung eines Systems, das Plugins von Drittanbietern ermöglicht, wie z.B. verschiedene Zitationsformatierer oder Datenimporter.

---

## Erstellt mit Google AI Studio

Diese Anwendung wurde mit **[Google AI Studio](https://ai.studio.google.com/)** entwickelt. AI Studio ist eine webbasierte IDE, die es Entwicklern ermöglicht, generative KI-Anwendungen schnell zu prototypisieren und zu erstellen. Es bietet einen optimierten Arbeitsablauf zum Iterieren von Prompts, zum Abstimmen von Modellen und zur Integration in den Anwendungscode.

Die Entwicklung von Wiki Compiler wurde durch die Funktionen von AI Studio erheblich beschleunigt, was die nahtlose Integration des Google Gemini-Modells für seine zentralen KI-Funktionen ermöglichte.
