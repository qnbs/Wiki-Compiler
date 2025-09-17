# Wiki Compiler: Quellcode-Dokumentation (Teil 1: Projektübersicht & Kerndateien)

Dieses Dokument enthält die Projektübersicht, die Verzeichnisstruktur und den Quellcode der zentralen Anwendungsdateien.

---

## Verzeichnisstruktur

```
.
├── App.tsx
├── README.md
├── components/
│   ├── AIEditorModal.tsx
│   ├── ArchiveView.tsx
│   ├── ArticleEditor.tsx
│   ├── ArticleInsightsView.tsx
│   ├── BottomNavBar.tsx
│   ├── CommandPalette.tsx
│   ├── CompilerExportSettings.tsx
│   ├── CompilerLeftPanel.tsx
│   ├── CompilerRightPanel.tsx
│   ├── CompilerView.tsx
│   ├── EditorBubbleMenu.tsx
│   ├── Header.tsx
│   ├── HelpView.tsx
│   ├── Icon.tsx
│   ├── ImageImporterView.tsx
│   ├── ImporterView.tsx
│   ├── LibraryView.tsx
│   ├── Modal.tsx
│   ├── SettingsView.tsx
│   ├── SkeletonLoader.tsx
│   ├── SlideOverPanel.tsx
│   ├── Spinner.tsx
│   ├── Toast.tsx
│   ├── ToastContainer.tsx
│   ├── WelcomeModal.tsx
│   ├── lexical/
│   │   ├── EditorTheme.ts
│   │   └── nodes.ts
│   └── settings/
│       ├── AboutSettings.tsx
│       ├── CitationSettings.tsx
│       ├── GeneralSettings.tsx
│       ├── LibrarySettings.tsx
│       └── StorageSettings.tsx
├── contexts/
│   ├── ImageImporterContext.tsx
│   ├── ImporterContext.tsx
│   ├── ProjectsContext.tsx
│   ├── SettingsContext.tsx
│   └── ToastContext.tsx
├── hooks/
│   ├── useArticleAnalysis.ts
│   ├── useClickOutside.ts
│   ├── useDarkMode.ts
│   ├── useDebounce.ts
│   ├── useFocusTrap.ts
│   ├── useImageImporterContext.ts
│   ├── useImporterContext.ts
│   ├── useProjectsContext.ts
│   ├── useSettingsContext.ts
│   └── useToasts.ts
├── i18n.ts
├── index.html
├── index.tsx
├── metadata.json
├── services/
│   ├── citationService.ts
│   ├── dbService.ts
│   ├── exportService.ts
│   ├── geminiService.ts
│   └── wikipediaService.ts
└── types.ts
```
---

## `README.md`

```markdown
# Wiki Compiler

*A premium knowledge management and research environment to curate, customize, and compile knowledge from Wikipedia.*

Transform passive reading into an active, creative act of knowledge assembly. Wiki Compiler is your dedicated space to research topics, collect articles, gain AI-powered insights, and publish beautifully formatted documents for study, presentation, or distribution.

---

## Core Philosophy

In the age of information overload, Wiki Compiler offers a focused sanctuary for deep work. By combining a powerful Wikipedia client with a project-based compiler, it streamlines the entire workflow from research to publication. Our goal is to empower students, researchers, and lifelong learners to build and share knowledge more effectively.

---

## The Workflow: From Idea to Publication

Wiki Compiler is designed around a clear, four-step workflow that guides you from initial curiosity to a finished product.

1.  **① Research in the Library**: Discover articles using the powerful Wikipedia search. Use the AI Research Assistant to get instant summaries and key concepts, helping you quickly identify relevant sources.
2.  **② Curate in the Importers**: Send articles and images to dedicated "staging areas." Here, you can review, edit metadata, and deliberately select what to include in your permanent collection, ensuring your library remains organized and relevant.
3.  **③ Assemble in the Compiler**: This is your workshop. Drag-and-drop articles to structure your narrative, edit content with a powerful rich-text editor, enhance your writing with AI, manage citations, and add project-specific notes.
4.  **④ Publish Your Work**: Export your final compilation into professional formats like DOCX and ODT, or portable ones like Markdown and JSON, ready for submission, sharing, or personal archiving.

---

## Key Features

### 🧠 Research & Curation
*   **Powerful Search**: Instantly search Wikipedia with advanced sorting options (relevance, date, title).
*   **AI Research Assistant**: Leverage Google's Gemini API for an intelligent breakdown of any article, generating summaries, key concepts, and potential research questions.
*   **Offline Article Archive**: Every article you view is automatically cached locally, creating a personal, searchable knowledge base that works anytime, anywhere.
*   **Article Importer**: A dedicated staging area to collect articles before adding them to a project, keeping your compilations clean and focused.

### 🖼️ Content Creation & Compilation
*   **Project-Based Organization**: Group related articles into "Compilations" to structure your research projects.
*   **Robust Rich-Text Editing**: Modify article text directly within the compiler using a powerful Lexical-based editor. Changes are saved on a per-project basis, preserving the original in the archive.
*   **AI Content Editor**: Select any text (or the whole article) and prompt the AI to summarize, rephrase, fix grammar, or perform custom edits.
*   **Image Importer & Library**: Extract images from articles or add them manually. Curate them in a staging area before importing them into a central, searchable image library.
*   **Project Notes**: Each compilation includes a dedicated notes panel, perfect for jotting down ideas, creating an outline, or keeping a research diary.

### 📚 Professional Publishing & Export
*   **Advanced Citation Management**: Add and manage custom external sources (books, websites, etc.) for your bibliographies.
*   **Automatic Bibliography**: Automatically generate a formatted bibliography in **APA** or **MLA** style, including both Wikipedia articles and your custom citations.
*   **Multiple Export Formats**:
    *   **DOCX**: Export your compilation to a professional Microsoft Word document.
    *   **ODT**: Export to the OpenDocument format for use with LibreOffice, OpenOffice, and other suites.
    *   **Markdown**: Export your entire compilation as a clean, portable single Markdown file.
    *   **JSON**: Export project data for portability, backup, or integration.

### 🎨 Personalized & Efficient Workflow
*   **Command Palette**: A keyboard-driven interface (**Ctrl/Cmd + K**) to instantly navigate views and execute commands.
*   **Focused Dark Mode**: A beautiful dark mode for focused, late-night research sessions.
*   **Multilingual Support**: Fully localized in English and German.
*   **Data Portability**: Backup and restore your entire workspace (projects, articles, images, settings) with a simple JSON import/export.
*   **Non-Blocking Notifications**: A sleek toast notification system provides feedback without interrupting your workflow.

---

## Tech Stack

This application is built with a modern, client-centric tech stack designed for performance, offline capability, and a rich user experience.

*   **Framework**: **React with TypeScript** for a robust, type-safe, and component-based UI.
*   **State Management**: **React Context API** provides global, scalable state management for settings, projects, and importers.
*   **Rich-Text Editor**: **Lexical** (from Meta) provides a highly extensible and reliable framework for the article editor.
*   **Styling**: **Tailwind CSS** (via CDN) for rapid, utility-first styling, enabling a consistent and modern design system.
*   **Client-Side Storage**: **IndexedDB** (using the `idb` library) provides a large, asynchronous, and persistent local database. This is crucial for the offline article archive, project storage, and user settings.
*   **AI Integration**: **Google Gemini API** (`@google/genai`) is the core of the AI Research Assistant, providing powerful generative capabilities for content analysis and editing.
*   **Document Generation**: The **`docx`** library is used to generate professional Word documents, and a custom implementation generates ODT files, all on the client-side.
*   **Internationalization**: **`i18next`** and **`react-i18next`** are used to provide full localization support.

---

## Local Development & Setup

This project uses modern web features like import maps, so it requires no `npm install` or build step to run. You can run it by serving the files with any local web server.

### Setting up the Gemini API Key

To enable the AI Research Assistant, a valid Google Gemini API key is required.

**1. Get Your API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/).
   - Click **"Get API key"** and create a new key.

**2. Provide the API Key:**
   The application is designed to securely access the key from a pre-configured environment variable named `API_KEY`. **Do not hardcode your key in the source code.**

   **Security Warning**: This is a client-side application. Exposing an API key in the browser is unsafe for a production application, as it can be easily copied. For a real public-facing website, you should create a backend proxy that holds the key securely and forwards requests to the Google API. The following methods are suitable for personal use, portfolio projects, or protected deployments.

   **For Local Development (VS Code):**
   - The easiest way is to use an extension like **Live Server**.
   - Since Live Server cannot inject environment variables, you can temporarily add a script tag in `index.html` for local testing only. **Remember to remove it before committing!**
     ```html
     <!-- In index.html, inside the <head> tag -->
     <script>
       // FOR LOCAL DEVELOPMENT ONLY - DO NOT COMMIT
       window.process = { env: { API_KEY: 'YOUR_API_KEY_HERE' } };
     </script>
     ```

   **For Deployment (Vercel, Netlify, etc.):**
   - These platforms provide a secure way to manage environment variables.
   - Go to your project's settings on the platform (e.g., Vercel Dashboard > Project > Settings > Environment Variables).
   - Add a new environment variable:
     - **Name**: `API_KEY`
     - **Value**: Paste your Gemini API key.
   - The platform will make this variable available to the application during the build and deployment process, and the app will function correctly.

---

## Created with Google AI Studio

This application was developed using **[Google AI Studio](https://ai.studio.google.com/)**. AI Studio is a web-based IDE that allows developers to quickly prototype and build generative AI applications. It provides a streamlined workflow for iterating on prompts, tuning models, and integrating with application code.

The development of Wiki Compiler was significantly accelerated by the capabilities of AI Studio, enabling the seamless integration of the Google Gemini model for its core AI features.

---
<br>

# Wiki Compiler (Deutsch)

*Eine Premium-Wissensmanagement- und Forschungsumgebung, um Wissen aus Wikipedia zu kuratieren, anzupassen und zu kompilieren.*

Verwandeln Sie passives Lesen in einen aktiven, kreativen Akt der Wissenszusammenstellung. Wiki Compiler ist Ihr dedizierter Raum, um Themen zu recherchieren, Artikel zu sammeln, KI-gestützte Einblicke zu gewinnen und wunderschön formatierte Dokumente für Studium, Präsentation oder Verteilung zu veröffentlichen.

---

## Kernphilosophie

Im Zeitalter der Informationsüberflutung bietet Wiki Compiler einen fokussierten Zufluchtsort für konzentriertes Arbeiten. Durch die Kombination eines leistungsstarken Wikipedia-Clients mit einem projektbasierten Compiler wird der gesamte Arbeitsablauf von der Forschung bis zur Veröffentlichung optimiert. Unser Ziel ist es, Studierende, Forschende und lebenslang Lernende zu befähigen, Wissen effektiver aufzubauen und zu teilen.

---

## Der Workflow: Von der Idee zur Publikation

Wiki Compiler ist um einen klaren, vierstufigen Arbeitsablauf herum konzipiert, der Sie von der anfänglichen Neugier bis zum fertigen Produkt führt.

1.  **① Recherchieren in der Bibliothek**: Entdecken Sie Artikel mit der leistungsstarken Wikipedia-Suche. Nutzen Sie den KI-Forschungsassistenten, um sofortige Zusammenfassungen und Schlüsselkonzepte zu erhalten, die Ihnen helfen, relevante Quellen schnell zu identifizieren.
2.  **② Kuratieren in den Importern**: Senden Sie Artikel und Bilder an dedizierte "Staging-Bereiche". Hier können Sie Metadaten überprüfen, bearbeiten und gezielt auswählen, was Sie in Ihre permanente Sammlung aufnehmen möchten, um Ihre Bibliothek organisiert und relevant zu halten.
3.  **③ Zusammenstellen im Compiler**: Dies ist Ihre Werkstatt. Ordnen Sie Artikel per Drag-and-Drop an, um Ihre Erzählung zu strukturieren, bearbeiten Sie Inhalte mit einem leistungsstarken Rich-Text-Editor, verbessern Sie Ihr Schreiben mit KI, verwalten Sie Zitate und fügen Sie projektspezifische Notizen hinzu.
4.  **④ Veröffentlichen Sie Ihre Arbeit**: Exportieren Sie Ihre endgültige Kompilation in professionelle Formate wie DOCX und ODT oder portable Formate wie Markdown und JSON, bereit zur Einreichung, zum Teilen oder zur persönlichen Archivierung.

---

## Hauptfunktionen

### 🧠 Recherche & Kuration
*   **Leistungsstarke Suche**: Durchsuchen Sie Wikipedia sofort mit erweiterten Sortieroptionen (Relevanz, Datum, Titel).
*   **KI-Forschungsassistent**: Nutzen Sie die Gemini-API von Google für eine intelligente Analyse jedes Artikels und generieren Sie Zusammenfassungen, Schlüsselkonzepte und potenzielle Forschungsfragen.
*   **Offline-Artikelarchiv**: Jeder Artikel, den Sie ansehen, wird automatisch lokal zwischengespeichert und schafft so eine persönliche, durchsuchbare Wissensdatenbank, die jederzeit und überall funktioniert.
*   **Artikel-Importer**: Ein dedizierter Staging-Bereich, um Artikel zu sammeln, bevor Sie sie einem Projekt hinzufügen, um Ihre Kompilationen sauber und fokussiert zu halten.

### 🖼️ Inhaltserstellung & Kompilation
*   **Projektbasierte Organisation**: Gruppieren Sie zusammengehörige Artikel in "Kompilationen", um Ihre Forschungsprojekte zu strukturieren.
*   **Robustes Rich-Text-Editing**: Ändern Sie den Artikeltext direkt im Compiler mit einem leistungsstarken, auf Lexical basierenden Editor. Änderungen werden pro Projekt gespeichert, wobei das Original im Archiv erhalten bleibt.
*   **KI-Inhaltseditor**: Wählen Sie einen beliebigen Text (oder den ganzen Artikel) aus und fordern Sie die KI auf, zusammenzufassen, umzuformulieren, die Grammatik zu korrigieren oder benutzerdefinierte Bearbeitungen durchzuführen.
*   **Bild-Importer & Bibliothek**: Extrahieren Sie Bilder aus Artikeln oder fügen Sie sie manuell hinzu. Kuratieren Sie sie in einem Staging-Bereich, bevor Sie sie in eine zentrale, durchsuchbare Bildbibliothek importieren.
*   **Projektnotizen**: Jede Kompilation enthält ein eigenes Notizfeld, ideal zum Festhalten von Ideen, Erstellen einer Gliederung oder Führen eines Forschungstagebuchs.

### 📚 Professionelles Publizieren & Export
*   **Erweitertes Zitatmanagement**: Fügen Sie benutzerdefinierte externe Quellen (Bücher, Websites usw.) für Ihre Bibliografien hinzu und verwalten Sie diese.
*   **Automatische Bibliografie**: Generieren Sie automatisch eine formatierte Bibliografie im **APA**- oder **MLA**-Stil, die sowohl Wikipedia-Artikel als auch Ihre benutzerdefinierten Zitate enthält.
*   **Mehrere Exportformate**:
    *   **DOCX**: Exportieren Sie Ihre Kompilation in ein professionelles Microsoft Word-Dokument.
    *   **ODT**: Exportieren Sie in das OpenDocument-Format zur Verwendung mit LibreOffice, OpenOffice und anderen Suiten.
    *   **Markdown**: Exportieren Sie Ihre gesamte Kompilation als saubere, portable einzelne Markdown-Datei.
    *   **JSON**: Exportieren Sie Projektdaten zur Portabilität, Sicherung oder Integration.

### 🎨 Personalisierter & effizienter Workflow
*   **Befehlspalette**: Eine tastaturgesteuerte Oberfläche (**Ctrl/Cmd + K**), um sofort zwischen Ansichten zu navigieren und Befehle auszuführen.
*   **Fokussierter Dunkelmodus**: Ein schöner Dunkelmodus für konzentrierte, nächtliche Forschungssitzungen.
*   **Mehrsprachige Unterstützung**: Vollständig lokalisiert in Englisch und Deutsch.
*   **Datentransportierbarkeit**: Sichern und Wiederherstellen Sie Ihren gesamten Arbeitsbereich (Projekte, Artikel, Bilder, Einstellungen) mit einem einfachen JSON-Import/Export.
*   **Nicht-blockierende Benachrichtigungen**: Ein elegantes Toast-Benachrichtigungssystem gibt Feedback, ohne Ihren Arbeitsablauf zu unterbrechen.

---

## Technischer Stack

Diese Anwendung wurde mit einem modernen, client-zentrierten Technologie-Stack erstellt, der auf Leistung, Offline-Fähigkeit und eine reichhaltige Benutzererfahrung ausgelegt ist.

*   **Framework**: **React mit TypeScript** für eine robuste, typsichere und komponentenbasierte Benutzeroberfläche.
*   **State Management**: Die **React Context API** sorgt für ein globales, skalierbares Zustandsmanagement für Einstellungen, Projekte und Importer.
*   **Rich-Text-Editor**: **Lexical** (von Meta) bietet ein hoch erweiterbares und zuverlässiges Framework für den Artikeleditor.
*   **Styling**: **Tailwind CSS** (über CDN) für schnelles, Utility-First-Styling, das ein konsistentes und modernes Designsystem ermöglicht.
*   **Client-seitiger Speicher**: **IndexedDB** (unter Verwendung der `idb`-Bibliothek) bietet eine große, asynchrone und persistente lokale Datenbank. Dies ist entscheidend für das Offline-Artikelarchiv, die Projektspeicherung und die Benutzereinstellungen.
*   **KI-Integration**: **Google Gemini API** (`@google/genai`) ist der Kern des KI-Forschungsassistenten und bietet leistungsstarke generative Fähigkeiten zur Inhaltsanalyse und -bearbeitung.
*   **Dokumentenerstellung**: Die **`docx`**-Bibliothek wird verwendet, um professionelle Word-Dokumente zu erstellen, und eine benutzerdefinierte Implementierung generiert ODT-Dateien, alles auf der Client-Seite.
*   **Internationalisierung**: **`i18next`** und **`react-i18next`** werden verwendet, um vollständige Lokalisierungsunterstützung zu bieten.

---

## Lokale Entwicklung & Setup

Dieses Projekt verwendet moderne Webfunktionen wie Import-Maps, sodass zum Ausführen kein `npm install` oder Build-Schritt erforderlich ist. Sie können es ausführen, indem Sie die Dateien mit einem beliebigen lokalen Webserver bereitstellen.

### Einrichten des Gemini API-Schlüssels

Um den KI-Forschungsassistenten zu aktivieren, ist ein gültiger Google Gemini API-Schlüssel erforderlich.

**1. Holen Sie sich Ihren API-Schlüssel:**
   - Besuchen Sie [Google AI Studio](https://aistudio.google.com/).
   - Klicken Sie auf **"Get API key"** und erstellen Sie einen neuen Schlüssel.

**2. Stellen Sie den API-Schlüssel bereit:**
   Die Anwendung ist so konzipiert, dass sie sicher auf den Schlüssel aus einer vorkonfigurierten Umgebungsvariable namens `API_KEY` zugreift. **Hardcodieren Sie Ihren Schlüssel nicht im Quellcode.**

   **Sicherheitswarnung**: Dies ist eine clientseitige Anwendung. Das Offenlegen eines API-Schlüssels im Browser ist für eine Produktionsanwendung unsicher, da er leicht kopiert werden kann. Für eine echte öffentliche Website sollten Sie einen Backend-Proxy erstellen, der den Schlüssel sicher aufbewahrt und Anfragen an die Google-API weiterleitet. Die folgenden Methoden eignen sich für den persönlichen Gebrauch, Portfolio-Projekte oder geschützte Deployments.

   **Für die lokale Entwicklung (VS Code):**
   - Der einfachste Weg ist die Verwendung einer Erweiterung wie **Live Server**.
   - Da Live Server keine Umgebungsvariablen injizieren kann, können Sie vorübergehend ein Skript-Tag in `index.html` nur für lokale Tests hinzufügen. **Denken Sie daran, es vor dem Commit zu entfernen!**
     ```html
     <!-- In index.html, innerhalb des <head>-Tags -->
     <script>
       // NUR FÜR LOKALE ENTWICKLUNG - NICHT COMMITEN
       window.process = { env: { API_KEY: 'IHR_API_SCHLÜSSEL_HIER' } };
     </script>
     ```

   **Für das Deployment (Vercel, Netlify, etc.):**
   - Diese Plattformen bieten eine sichere Möglichkeit, Umgebungsvariablen zu verwalten.
   - Gehen Sie zu den Einstellungen Ihres Projekts auf der Plattform (z.B. Vercel Dashboard > Project > Settings > Environment Variables).
   - Fügen Sie eine neue Umgebungsvariable hinzu:
     - **Name**: `API_KEY`
     - **Wert**: Fügen Sie Ihren Gemini-API-Schlüssel ein.
   - Die Plattform stellt diese Variable der Anwendung während des Build- und Bereitstellungsprozesses zur Verfügung, und die App wird korrekt funktionieren.

---

## Erstellt mit Google AI Studio

Diese Anwendung wurde mit **[Google AI Studio](https://ai.studio.google.com/)** entwickelt. AI Studio ist eine webbasierte IDE, die es Entwicklern ermöglicht, generative KI-Anwendungen schnell zu prototypisieren und zu erstellen. Es bietet einen optimierten Arbeitsablauf zum Iterieren von Prompts, zum Abstimmen von Modellen und zur Integration in den Anwendungscode.

Die Entwicklung von Wiki Compiler wurde durch die Funktionen von AI Studio erheblich beschleunigt, was die nahtlose Integration des Google Gemini-Modells für seine zentralen KI-Funktionen ermöglichte.
```

---

## `metadata.json`

```json
{
  "name": "Wiki Compiler",
  "description": "A premium knowledge management and research environment designed to curate, customize, and consume knowledge from Wikipedia. Transform passive reading into an active, creative act of knowledge assembly.",
  "requestFramePermissions": []
}
```

---

## `index.html`

```html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wiki Compiler</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --accent-color: 39 110 241; /* Blue */
            font-family: 'Inter', sans-serif;
        }

        /* Basic Reset & Font Smoothing */
        *, *::before, *::after {
            box-sizing: border-box;
        }
        body, h1, h2, h3, h4, p, figure, blockquote, dl, dd {
            margin: 0;
        }
        body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* TailwindCSS Prose styles for rendered Wikipedia articles */
        .prose a { color: rgb(var(--accent-color)); }
        .prose a:hover { text-decoration: underline; }
        .prose img { border-radius: 0.5rem; }
        .prose .infobox {
            border: 1px solid #a2a9b1;
            margin: 0.5em 0 0.5em 1em;
            padding: 0.2em;
            float: right;
            clear: right;
            font-size: 88%;
            line-height: 1.5em;
        }

        /* Responsive Infobox */
        .prose .infobox {
            max-width: 22em; /* Keep max-width for large screens */
            width: auto;     /* Allow it to shrink */
            float: none;     /* Disable float on small screens */
            margin: 1em 0; /* Center it with vertical margin */
        }
        @media (min-width: 640px) { /* sm breakpoint */
            .prose .infobox {
                float: right;
                clear: right;
                margin: 0.5em 0 0.5em 1em;
            }
        }
        
        .dark .prose .infobox {
            border-color: #72777d;
            background-color: #202122;
        }
        
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            font-weight: 700;
        }
        .dark .prose {
          --tw-prose-body: #d1d5db;
          --tw-prose-headings: #f9fafb;
          --tw-prose-lead: #e5e7eb;
          --tw-prose-links: #93c5fd;
          --tw-prose-bold: #f9fafb;
          --tw-prose-counters: #9ca3af;
          --tw-prose-bullets: #6b7280;
          --tw-prose-hr: #4b5563;
          --tw-prose-quotes: #f3f4f6;
          --tw-prose-quote-borders: #4b5563;
          --tw-prose-captions: #9ca3af;
          --tw-prose-code: #f9fafb;
          --tw-prose-pre-code: #e5e7eb;
          --tw-prose-pre-bg: #1f2937;
          --tw-prose-th-borders: #4b5563;
          --tw-prose-td-borders: #374151;
        }

        /* Lexical Editor Styles */
        .editor-input {
            caret-color: rgb(5, 5, 5);
            position: relative;
            tab-size: 1;
            outline: 0;
            padding: 10px;
            user-select: text;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .dark .editor-input {
            caret-color: #eee;
        }
        .editor-placeholder {
            color: #999;
            overflow: hidden;
            position: absolute;
            text-overflow: ellipsis;
            top: 10px;
            left: 10px;
            font-size: 1rem;
            user-select: none;
            display: inline-block;
            pointer-events: none;
        }
        
        /* Custom Animations */
        @keyframes pop-in {
            0% { transform: scale(0.8); opacity: 0; }
            70% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
            animation: pop-in 0.3s ease-out forwards;
        }

        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            opacity: 0; /* Start hidden */
            animation: fade-in 0.5s ease-out forwards;
        }
        
        /* Slide Over Panel Animations */
        .slide-over-panel, .slide-over-overlay {
            transition-property: transform, opacity;
            transition-duration: 300ms;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
    </style>
    <script type="importmap">
    {
      "imports": {
        "file-saver": "https://aistudiocdn.com/file-saver@^2.0.5",
        "@lexical/react/": "https://aistudiocdn.com/@lexical/react@^0.35.0/",
        "docx": "https://aistudiocdn.com/docx@^9.5.1",
        "react/": "https://aistudiocdn.com/react@^19.1.1/",
        "react": "https://aistudiocdn.com/react@^19.1.1",
        "react-dom": "https://aistudiocdn.com/react-dom@^19.1.1",
        "react-dom/": "https://aistudiocdn.com/react-dom@^19.1.1/",
        "i18next": "https://aistudiocdn.com/i18next@^25.5.2",
        "@google/genai": "https://aistudiocdn.com/@google/genai@^1.17.0",
        "idb": "https://aistudiocdn.com/idb@^8.0.3",
        "react-i18next": "https://aistudiocdn.com/react-i18next@^15.7.3",
        "i18next-browser-languagedetector": "https://aistudiocdn.com/i18next-browser-languagedetector@^8.2.0",
        "turndown": "https://aistudiocdn.com/turndown@^7.2.1",
        "lexical": "https://aistudiocdn.com/lexical@^0.35.0",
        "@lexical/rich-text": "https://aistudiocdn.com/@lexical/rich-text@^0.35.0",
        "@lexical/list": "https://aistudiocdn.com/@lexical/list@^0.35.0",
        "@lexical/link": "https://aistudiocdn.com/@lexical/link@^0.35.0",
        "@lexical/utils": "https://aistudiocdn.com/@lexical/utils@^0.35.0",
        "@lexical/selection": "https://aistudiocdn.com/@lexical/selection@^0.35.0",
        "@lexical/html": "https://aistudiocdn.com/@lexical/html@^0.35.0"
      }
    }
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              accent: {
                  50:  '#eff6ff',
                  100: '#dbeafe',
                  200: '#bfdbfe',
                  300: '#93c5fd',
                  400: '#60a5fa',
                  500: '#3b82f6',
                  600: '#2563eb',
                  700: '#1d4ed8',
                  800: '#1e40af',
                  900: '#1e3a8a',
                  950: '#172554',
              },
            }
          }
        }
      }
    </script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
</body>
</html>
```

---

## `index.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nextProvider } from 'react-i18next';
import i18next from './i18n';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { ToastProvider } from './contexts/ToastContext';
import { ImporterProvider } from './contexts/ImporterContext';
import { ImageImporterProvider } from './contexts/ImageImporterContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <ToastProvider>
        <SettingsProvider>
          <ProjectsProvider>
            <ImporterProvider>
              <ImageImporterProvider>
                <App />
              </ImageImporterProvider>
            </ImporterProvider>
          </ProjectsProvider>
        </SettingsProvider>
      </ToastProvider>
    </I18nextProvider>
  </React.StrictMode>
);
```

---

## `App.tsx`

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { View } from './types';
import { useSettings } from './hooks/useSettingsContext';
import { getArticleHtml, getArticleMetadata } from './services/wikipediaService';
import { getArticleCache, saveArticleCache } from './services/dbService';

import Header from './components/Header';
import LibraryView from './components/LibraryView';
import ArchiveView from './components/ArchiveView';
import CompilerView from './components/CompilerView';
import ImporterView from './components/ImporterView';
import ImageImporterView from './components/ImageImporterView';
import SettingsView from './components/SettingsView';
import HelpView from './components/HelpView';
import BottomNavBar from './components/BottomNavBar';
import ToastContainer from './components/ToastContainer';
import CommandPalette from './components/CommandPalette';
import WelcomeModal from './components/WelcomeModal';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { settings } = useSettings();
  const [view, setView] = useState<View | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setView(settings.defaultView);
      const hasOnboarded = localStorage.getItem('wiki-compiler-onboarded');
      if (!hasOnboarded) {
        setIsWelcomeModalOpen(true);
      }
    }
  }, [settings]);

  const reloadApp = useCallback(() => {
    // This is a bit of a heavy-handed way to reload, but it ensures all contexts and DB states are refreshed.
    window.location.reload();
  }, []);

  const getArticleContent = useCallback(async (title: string): Promise<string> => {
    const cachedArticle = await getArticleCache(title);
    if (cachedArticle) {
      return cachedArticle.html;
    }
    const html = await getArticleHtml(title);
    const metadataArray = await getArticleMetadata([title]);
    await saveArticleCache({
      title,
      html,
      metadata: metadataArray.length > 0 ? metadataArray[0] : undefined,
    });
    return html;
  }, []);
  
  const commands = [
    { id: 'goto-library', label: 'Go to Library', action: () => setView(View.Library), icon: 'book' },
    { id: 'goto-archive', label: 'Go to Archive', action: () => setView(View.Archive), icon: 'archive-box' },
    { id: 'goto-compiler', label: 'Go to Compiler', action: () => setView(View.Compiler), icon: 'compiler' },
    { id: 'goto-importer', label: 'Go to Importer', action: () => setView(View.Importer), icon: 'upload' },
    { id: 'goto-image-importer', label: 'Go to Image Importer', action: () => setView(View.ImageImporter), icon: 'palette' },
    { id: 'goto-settings', label: 'Settings', action: () => setView(View.Settings), icon: 'settings' },
    { id: 'goto-help', label: 'Help', action: () => setView(View.Help), icon: 'help' },
  ];

  const renderView = () => {
    switch (view) {
      case View.Library:
        return <LibraryView getArticleContent={getArticleContent} />;
      case View.Archive:
        return <ArchiveView />;
      case View.Compiler:
        return <CompilerView getArticleContent={getArticleContent} />;
      case View.Importer:
        return <ImporterView getArticleContent={getArticleContent} />;
      case View.ImageImporter:
        return <ImageImporterView />;
      case View.Settings:
        return <SettingsView reloadApp={reloadApp} />;
      case View.Help:
        return <HelpView />;
      default:
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }
  };

  if (!view || !settings) {
    return <div className="w-screen h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900"><Spinner /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900/95 text-gray-900 dark:text-gray-100">
      <Header view={view} setView={setView} openCommandPalette={() => setIsCommandPaletteOpen(true)} />
      <main className="flex-grow overflow-auto p-4 sm:p-6 mb-16 sm:mb-0">
        {renderView()}
      </main>
      <BottomNavBar view={view} setView={setView} />
      <ToastContainer />
      <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen} commands={commands} />
      <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
    </div>
  );
};

export default App;
```

---

## `types.ts`

```typescript
// FIX: Removed import to break a circular dependency. The RightPaneView type is now defined in this file.
// import { RightPaneView } from './components/CompilerView';

export interface SearchResult {
  title: string;
  snippet: string;
  pageid: number;
  timestamp?: string;
}

export interface ArticleContent {
  title: string;
  html: string;
  metadata?: ArticleMetadata;
}

export interface ProjectArticle {
  title:string;
}

// FIX: Centralized RightPaneView type definition.
// Corrected: Removed 'markdown' as it's not implemented.
export type RightPaneView = 'settings' | 'article';

export interface Project {
  id: string;
  name: string;
  articles: ProjectArticle[];
  notes?: string;
  lastActiveView?: RightPaneView;
}

export enum View {
  Library = 'library',
  Archive = 'archive',
  Compiler = 'compiler',
  Importer = 'importer',
  ImageImporter = 'imageImporter',
  Settings = 'settings',
  Help = 'help'
}

export interface ArticleMetadata {
    pageid: number;
    revid: number;
    touched: string;
    title: string;
}

export interface AiInsightKeyConcept {
    concept: string;
    explanation: string;
}

export interface ArticleInsights {
    summary?: string;
    keyConcepts?: AiInsightKeyConcept[];
    researchQuestions?: string[];
    readingTimeMinutes: number;
}

export type AccentColor = 'blue' | 'purple' | 'green' | 'orange';

export interface CustomCitation {
  id: string;
  key: string; // e.g., "Smith2023"
  author: string;
  year: string;
  title: string;
  url: string;
}

export interface ProjectArticleContent {
  id: string; // composite key: `${projectId}-${title}`
  projectId: string;
  title: string;
  html: string;
}

export interface AppSettings {
  language: string;
  defaultView: View;
  library: {
    searchResultLimit: number;
    aiAssistant: {
      enabled: boolean;
      systemInstruction: string;
      focus: {
        summary: boolean;
        keyConcepts: boolean;
        researchQuestions: boolean;
      };
    };
  };
  citations: {
    customCitations: CustomCitation[];
    citationStyle: 'apa' | 'mla';
  };
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface ImportedImage {
  id: string; // uuid
  srcUrl: string;
  altText: string;
  caption: string;
  originalArticleTitle: string;
  tags: string[];
  category: string;
  notes: string;
}

// Types for Wikipedia API responses for better type safety
export interface WikipediaSearchItem {
    ns: number;
    title: string;
    pageid: number;
    size: number;
    wordcount: number;
    snippet: string;
    timestamp: string;
}

export interface WikipediaQueryResponse {
    batchcomplete: string;
    query: {
        search: WikipediaSearchItem[];
    };
}
```

---

## `i18n.ts`

```typescript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    resources: {
      en: {
        translation: {
          // Welcome Modal
          'Welcome to Wiki Compiler': 'Welcome to Wiki Compiler',
          'welcome_p1': 'A knowledge management tool designed to curate, customize, and compile knowledge from Wikipedia.',
          'welcome_library_title': 'The Library',
          'welcome_library_p': 'Search and browse for articles. Get instant AI insights and add sources to your compilation.',
          'welcome_compiler_title': 'The Compiler',
          'welcome_compiler_p': 'Structure, edit, and export your articles as professionally formatted documents.',
          'welcome_archive_title': 'The Archive',
          'welcome_archive_p': 'Every article you view is automatically saved offline, becoming your personal knowledge base.',
          'Get Started': 'Get Started',

          // Main Navigation
          'Library': 'Library',
          'Archive': 'Archive',
          'Compiler': 'Compiler',
          'Importer': 'Importer',
          'Image Importer': 'Image Importer',
          'Settings': 'Settings',
          'Help': 'Help',
          'More': 'More',

          // Header & Command Palette
          'Wiki Compiler': 'Wiki Compiler',
          'Search projects...': 'Search projects...',
          'Create New Project': 'Create New Project',
          'Open command palette': 'Open command palette',
          'More options': 'More options',
          'Go to Library': 'Go to Library',
          'Go to Archive': 'Go to Archive',
          'Go to Compiler': 'Go to Compiler',
          'Go to Importer': 'Go to Importer',
          'Type a command or search...': 'Type a command or search...',

          // Library & Archive View
          'Search Wikipedia...': 'Search Wikipedia...',
          'Sort by': 'Sort by',
          'Relevance': 'Relevance',
          'Date (Newest)': 'Date (Newest)',
          'Date (Oldest)': 'Date (Oldest)',
          'Title (A-Z)': 'Title (A-Z)',
          'Title (Z-A)': 'Title (Z-A)',
          'Search failed. Please check your connection.': 'Search failed. Please check your connection.',
          'No results found for "{{term}}"': 'No results found for "{{term}}"',
          'Add to Importer': 'Add to Importer',
          'Quick Add to Compilation': 'Quick Add to Compilation',
          'Search for an article to begin': 'Search for an article to begin',
          'or select one from the list.': 'or select one from the list.',
          'Analyzing...': 'Analyzing...',
          'Analyze with AI': 'Analyze with AI',
          'Add to Compilation': 'Add to Compilation',
          'Article added to Importer.': 'Article added to Importer.',
          'Article Archive': 'Article Archive',
          'Search Archive...': 'Search Archive...',
          'Your archive is empty.': 'Your archive is empty.',
          'Viewed articles will appear here.': 'Viewed articles will appear here.',
          'Select an article to read': 'Select an article to read',
          'Delete from Archive': 'Delete from Archive',
          'Remove Article from Archive Confirmation': 'Are you sure you want to remove the article "{{articleTitle}}" from the archive? This cannot be undone.',
          'From': 'From',
          'Refresh Content': 'Refresh Content',
          'Article "{{title}}" has been updated to the latest version.': 'Article "{{title}}" has been updated to the latest version.',
          'Clear Archive': 'Clear Archive',
          'Are you sure you want to delete all articles from your archive? This action cannot be undone.': 'Are you sure you want to delete all articles from your archive? This action cannot be undone.',
          'Delete All': 'Delete All',
          'Export': 'Export',
          
          // Importer View
          'Article Importer': 'Article Importer',
          'Add All to Compilation': 'Add All to Compilation',
          'Clear All': 'Clear All',
          'No articles staged for import.': 'No articles staged for import.',
          'Add articles from the Library view to get started.': 'Add articles from the Library view to get started.',
          'Preview article': 'Preview article',
          'Remove from importer': 'Remove from importer',
          'Add to Project': 'Add to Project',
          'Article "{{title}}" added to compilation.': 'Article "{{title}}" added to compilation.',
          'All articles added to compilation.': 'All articles added to compilation.',
          
          // Image Importer View
          'Image Library': 'Image Library',
          'Staging Area': 'Staging Area',
          'Imported': 'Imported',
          'Add Image': 'Add Image',
          'No images imported yet.': 'No images imported yet.',
          'Click "Add Image" to get started.': 'Click "Add Image" to get started.',
          'Import images from the staging area to build your library.': 'Import images from the staging area to build your library.',
          'Are you sure you want to delete this image?': 'Are you sure you want to delete this image?',
          'Edit Image': 'Edit Image',
          'Image URL': 'Image URL',
          'Caption': 'Caption',
          'No images staged for import.': 'No images staged for import.',
          'Images extracted from articles will appear here.': 'Images extracted from articles will appear here.',
          'Import Selected': 'Import Selected',
          'Discard Selected': 'Discard Selected',
          'Select All': 'Select All',

          // Compiler View
          'Project Notes': 'Project Notes',
          'Add your outline, scratchpad, or project notes here...': 'Add your outline, scratchpad, or project notes here...',
          'Compilation Articles': 'Compilation Articles',
          'Press Ctrl + Arrow Up or Down to reorder.': 'Press Ctrl + Arrow Up or Down to reorder.',
          'Remove Article from Compilation Confirmation': 'Are you sure you want to remove the article "{{articleTitle}}" from the compilation?',
          'Move article up': 'Move article {{articleTitle}} up',
          'Move article down': 'Move article {{articleTitle}} down',
          'Remove article': 'Remove article {{articleTitle}}',
          'Your compilation is empty.': 'Your compilation is empty.',
          'Go to the Library to add articles.': 'Go to the Library to add articles.',
          'Export & Settings': 'Export & Settings',
          'Start writing or edit the article content...': 'Start writing or edit the article content...',
          'Select an article to edit': 'Select an article to edit',
          'or manage project settings and export options.': 'or manage project settings and export options.',
          'Export Project': 'Export Project',
          'Export as a Microsoft Word document, best for professional reports.': 'Export as a Microsoft Word document, best for professional reports.',
          'Export as a plain text Markdown file, ideal for web or developers.': 'Export as a plain text Markdown file, ideal for web or developers.',
          'Export project data as a JSON file, useful for backups or integration.': 'Export project data as a JSON file, useful for backups or integration.',
          'Export as an OpenDocument Text file for use in LibreOffice, etc.': 'Export as an OpenDocument Text file for use in LibreOffice, etc.',

          // Help View
          'Help & Getting Started': 'Help & Getting Started',
          'help_library_title': 'The Library View',
          'help_library_content': 'This is your portal to Wikipedia. Search for articles, get instant AI-powered insights, and add sources to the Article Importer or directly to your active compilation. Use the sorting options to organize results by relevance, date, or title.',
          'help_compiler_title': 'The Compiler View',
          'help_compiler_content': 'This is your workshop. The left panel holds your project notes and the list of articles in your compilation, which you can reorder via drag-and-drop. The right panel allows you to edit article content with a robust rich-text editor (and its floating AI menu) or manage export options.',
          'help_archive_title': 'The Archive View',
          'help_archive_content': 'Every article you open is automatically saved in your private, offline Archive. This becomes your personal knowledge base, fully searchable and always available. You can add articles from the Archive back into any project compilation.',
          'help_importers_title': 'The Importers (Article & Image)',
          'help_importers_content': 'Articles and images you choose to import are first sent to a "Staging Area". This gives you a chance to review, edit details (for images), and consciously decide what to add to your permanent library or project, preventing clutter.',
          'help_command_palette_title': 'Command Palette',
          'help_command_palette_content': 'Press Ctrl+K (or Cmd+K on Mac) to open the Command Palette. It\'s the fastest way to navigate between views, create projects, and access other key functions without leaving the keyboard.',
          'help_settings_title': 'The Settings View',
          'help_settings_content': 'Customize the application\'s language, default view, AI assistant preferences, and citation styles. You can also manage your data by clearing the cache or backing up/restoring your entire workspace from the Storage tab.',
          'help_power_tips_title': 'Power Tips',
          'help_power_tips_content': 'Use the floating sparkles button in the Compiler to get AI assistance for your text.\nUse the keyboard to quickly reorder articles in the Compiler (Ctrl/Cmd + Arrow Up/Down).\nRegularly back up your entire workspace from the Settings > Storage tab to keep your work safe.',
          
          // Settings View
          'General': 'General',
          'Citations': 'Citations',
          'Storage': 'Storage',
          'About': 'About',
          'Language': 'Language',
          'Choose the application\'s display language.': 'Choose the application\'s display language.',
          'Default View on Startup': 'Default View on Startup',
          'Choose which view the application opens to on startup.': 'Choose which view the application opens to on startup.',
          'Library Settings': 'Library Settings',
          'Search Result Limit': 'Search Result Limit',
          'Set the maximum number of results to return for a Wikipedia search.': 'Set the maximum number of results to return for a Wikipedia search.',
          'AI Assistant': 'AI Assistant',
          'Enable AI-powered summaries, key concept extraction, and research questions for articles.': 'Enable AI-powered summaries, key concept extraction, and research questions for articles.',
          'Enable AI Research Assistant': 'Enable AI Research Assistant',
          'AI System Instruction': 'AI System Instruction',
          'Provide specific instructions to the AI to tailor its analysis style (e.g., "focus on economic impacts").': 'Provide specific instructions to the AI to tailor its analysis style (e.g., "focus on economic impacts").',
          'e.g., "Analyze from the perspective of a historian."': 'e.g., "Analyze from the perspective of a historian."',
          'AI Analysis Focus': 'AI Analysis Focus',
          'Choose which insights to generate. At least one must be selected.': 'Choose which insights to generate. At least one must be selected.',
          'Summary': 'Summary',
          'Key Concepts': 'Key Concepts',
          'Questions to Explore': 'Questions to Explore',
          'Default Bibliography Style': 'Default Bibliography Style',
          'Choose the citation format for generated bibliographies.': 'Choose the citation format for generated bibliographies.',
          'Custom Citations': 'Custom Citations',
          'Manage your custom sources for bibliographies. These can be inserted into articles in the Compiler view.': 'Manage your custom sources for bibliographies. These can be inserted into articles in the Compiler view.',
          'Citation Key': 'Citation Key',
          'Unique identifier (e.g., Smith2023).': 'Unique identifier (e.g., Smith2023).',
          'Author': 'Author',
          'Year': 'Year',
          'Title': 'Title',
          'URL': 'URL',
          'Add Citation': 'Add Citation',
          'Key must be unique.': 'Key must be unique.',
          'Data & Storage': 'Data & Storage',
          'Cache Usage': 'Cache Usage',
          '{{count}} articles cached, using': '{{count}} articles cached, using',
          'Clear Article Cache': 'Clear Article Cache',
          'Are you sure you want to clear the cache?': 'Are you sure you want to clear the cache?',
          'Cache cleared successfully!': 'Cache cleared successfully!',
          'Export All Data': 'Export All Data',
          'Save a backup of all your projects, cached articles, and settings to a JSON file.': 'Save a backup of all your projects, cached articles, and settings to a JSON file.',
          'Export...': 'Export...',
          'Export failed.': 'Export failed.',
          'Import Data': 'Import Data',
          'Restore your application from a backup file. WARNING: This will overwrite all current projects, articles, and settings.': 'Restore your application from a backup file. WARNING: This will overwrite all current projects, articles, and settings.',
          'Import...': 'Import...',
          'Importing data will overwrite all current projects and settings. Are you sure you want to continue?': 'Importing data will overwrite all current projects and settings. Are you sure you want to continue?',
          'Import successful! The app will now reload.': 'Import successful! The app will now reload.',
          'Import failed. Please check the file format.': 'Import failed. Please check the file format.',
          'About Wiki Compiler': 'About Wiki Compiler',
          'about_p1': 'Wiki Compiler is a premium knowledge management and research environment designed to curate, customize, and compile knowledge from Wikipedia.',
          'about_p2': 'Transform passive reading into an active, creative act of knowledge assembly. This application aims to empower students, researchers, and lifelong learners to build and share knowledge more effectively.',
          'about_ai_title': 'Created with Google AI Studio',
          'about_ai_p1': 'The AI features in this application are powered by Google\'s Gemini model.',
          'about_ai_p2': 'This application was developed using Google AI Studio, a web-based IDE that allows developers to quickly prototype and build generative AI applications.',
          'Version': 'Version',
          'Learn more about AI Studio': 'Learn more about AI Studio',

          // AI & Editor
          'AI Research Assistant': 'AI Research Assistant',
          'Thinking...': 'Thinking...',
          'Invalid or missing API Key for Gemini. Please check your configuration.': 'Invalid or missing API Key for Gemini. Please check your configuration.',
          'Est. Reading Time': 'Est. Reading Time',
          'min read': 'min read',
          'Quick Summary': 'Quick Summary',
          'Edit with AI': 'Edit with AI',
          'Editing...': 'Editing...',
          'Run Edit': 'Run Edit',
          'Your Instruction': 'Your Instruction',
          'e.g., "Make this paragraph more concise."': 'e.g., "Make this paragraph more concise."',
          'Tip: Press Ctrl+Enter to run.': 'Tip: Press Ctrl+Enter to run.',
          'Quick Actions': 'Quick Actions',
          'Improve Writing': 'Improve Writing',
          'Summarize': 'Summarize',
          'Fix Spelling & Grammar': 'Fix Spelling & Grammar',
          'Change Tone to Academic': 'Change Tone to Academic',
          'Bold': 'Bold',
          'Italic': 'Italic',

          // Generic
          'Cancel': 'Cancel',
          'Close': 'Close',
          'Delete': 'Delete',
          'Save': 'Save',
          'New Compilation': 'New Compilation',
          'You cannot delete the last project.': 'You cannot delete the last project.',
          'Delete Project Confirmation': 'Are you sure you want to delete this project? This action cannot be undone.',
        },
      },
      de: {
        translation: {
          // Welcome Modal
          'Welcome to Wiki Compiler': 'Willkommen bei Wiki Compiler',
          'welcome_p1': 'Ein Wissensmanagement-Tool, das entwickelt wurde, um Wissen aus Wikipedia zu kuratieren, anzupassen und zusammenzustellen.',
          'welcome_library_title': 'Die Bibliothek',
          'welcome_library_p': 'Durchsuchen und finden Sie Artikel. Gewinnen Sie sofortige KI-Einblicke und fügen Sie Quellen zu Ihrer Kompilation hinzu.',
          'welcome_compiler_title': 'Der Compiler',
          'welcome_compiler_p': 'Strukturieren, bearbeiten und exportieren Sie Ihre Artikel als professionell formatierte Dokumente.',
          'welcome_archive_title': 'Das Archiv',
          'welcome_archive_p': 'Jeder Artikel, den Sie ansehen, wird automatisch offline gespeichert und bildet Ihre persönliche Wissensdatenbank.',
          'Get Started': 'Loslegen',

          // Main Navigation
          'Library': 'Bibliothek',
          'Archive': 'Archiv',
          'Compiler': 'Compiler',
          'Importer': 'Importer',
          'Image Importer': 'Bild-Importer',
          'Settings': 'Einstellungen',
          'Help': 'Hilfe',
          'More': 'Mehr',

          // Header & Command Palette
          'Wiki Compiler': 'Wiki Compiler',
          'Search projects...': 'Projekte durchsuchen...',
          'Create New Project': 'Neues Projekt erstellen',
          'Open command palette': 'Befehlspalette öffnen',
          'More options': 'Weitere Optionen',
          'Go to Library': 'Gehe zur Bibliothek',
          'Go to Archive': 'Gehe zum Archiv',
          'Go to Compiler': 'Gehe zum Compiler',
          'Go to Importer': 'Gehe zum Importer',
          'Type a command or search...': 'Befehl eingeben oder suchen...',

          // Library & Archive View
          'Search Wikipedia...': 'Wikipedia durchsuchen...',
          'Sort by': 'Sortieren nach',
          'Relevance': 'Relevanz',
          'Date (Newest)': 'Datum (Neueste)',
          'Date (Oldest)': 'Datum (Älteste)',
          'Title (A-Z)': 'Titel (A-Z)',
          'Title (Z-A)': 'Titel (Z-A)',
          'Search failed. Please check your connection.': 'Suche fehlgeschlagen. Bitte prüfen Sie Ihre Verbindung.',
          'No results found for "{{term}}"': 'Keine Ergebnisse für "{{term}}" gefunden',
          'Add to Importer': 'Zum Importer hinzufügen',
          'Quick Add to Compilation': 'Schnell zur Kompilation hinzufügen',
          'Search for an article to begin': 'Suchen Sie nach einem Artikel, um zu beginnen',
          'or select one from the list.': 'oder wählen Sie einen aus der Liste aus.',
          'Analyzing...': 'Analysiere...',
          'Analyze with AI': 'Mit KI analysieren',
          'Add to Compilation': 'Zur Kompilation hinzufügen',
          'Article added to Importer.': 'Artikel zum Importer hinzugefügt.',
          'Article Archive': 'Artikelarchiv',
          'Search Archive...': 'Archiv durchsuchen...',
          'Your archive is empty.': 'Ihr Archiv ist leer.',
          'Viewed articles will appear here.': 'Gelesene Artikel werden hier angezeigt.',
          'Select an article to read': 'Wählen Sie einen Artikel zum Lesen aus',
          'Delete from Archive': 'Aus dem Archiv löschen',
          'Remove Article from Archive Confirmation': 'Sind Sie sicher, dass Sie den Artikel "{{articleTitle}}" aus dem Archiv entfernen möchten? Dies kann nicht rückgängig gemacht werden.',
          'From': 'Von',
          'Refresh Content': 'Inhalt aktualisieren',
          'Article "{{title}}" has been updated to the latest version.': 'Artikel "{{title}}" wurde auf die neueste Version aktualisiert.',
          'Clear Archive': 'Archiv leeren',
          'Are you sure you want to delete all articles from your archive? This action cannot be undone.': 'Möchten Sie wirklich alle Artikel aus Ihrem Archiv löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
          'Delete All': 'Alle löschen',
          'Export': 'Exportieren',
          
          // Importer View
          'Article Importer': 'Artikel-Importer',
          'Add All to Compilation': 'Alle zur Kompilation hinzufügen',
          'Clear All': 'Alle löschen',
          'No articles staged for import.': 'Keine Artikel für den Import vorgemerkt.',
          'Add articles from the Library view to get started.': 'Fügen Sie Artikel aus der Bibliotheksansicht hinzu, um zu beginnen.',
          'Preview article': 'Artikelvorschau',
          'Remove from importer': 'Aus dem Importer entfernen',
          'Add to Project': 'Zum Projekt hinzufügen',
          'Article "{{title}}" added to compilation.': 'Artikel "{{title}}" zur Kompilation hinzugefügt.',
          'All articles added to compilation.': 'Alle Artikel zur Kompilation hinzugefügt.',

          // Image Importer View
          'Image Library': 'Bilder-Bibliothek',
          'Staging Area': 'Staging-Bereich',
          'Imported': 'Importiert',
          'Add Image': 'Bild hinzufügen',
          'No images imported yet.': 'Noch keine Bilder importiert.',
          'Click "Add Image" to get started.': 'Klicken Sie auf "Bild hinzufügen", um zu beginnen.',
          'Import images from the staging area to build your library.': 'Importieren Sie Bilder aus dem Staging-Bereich, um Ihre Bibliothek aufzubauen.',
          'Are you sure you want to delete this image?': 'Sind Sie sicher, dass Sie dieses Bild löschen möchten?',
          'Edit Image': 'Bild bearbeiten',
          'Image URL': 'Bild-URL',
          'Caption': 'Bildunterschrift',
          'No images staged for import.': 'Keine Bilder für den Import vorgemerkt.',
          'Images extracted from articles will appear here.': 'Aus Artikeln extrahierte Bilder werden hier angezeigt.',
          'Import Selected': 'Auswahl importieren',
          'Discard Selected': 'Auswahl verwerfen',
          'Select All': 'Alle auswählen',

          // Compiler View
          'Project Notes': 'Projektnotizen',
          'Add your outline, scratchpad, or project notes here...': 'Fügen Sie hier Ihre Gliederung, Ihren Notizblock oder Projektnotizen hinzu...',
          'Compilation Articles': 'Kompilationsartikel',
          'Press Ctrl + Arrow Up or Down to reorder.': 'Drücken Sie Strg + Pfeil nach oben oder unten zum Neuanordnen.',
          'Remove Article from Compilation Confirmation': 'Möchten Sie den Artikel "{{articleTitle}}" wirklich aus der Kompilation entfernen?',
          'Move article up': 'Artikel "{{articleTitle}}" nach oben verschieben',
          'Move article down': 'Artikel "{{articleTitle}}" nach unten verschieben',
          'Remove article': 'Artikel "{{articleTitle}}" entfernen',
          'Your compilation is empty.': 'Ihre Kompilation ist leer.',
          'Go to the Library to add articles.': 'Gehen Sie zur Bibliothek, um Artikel hinzuzufügen.',
          'Export & Settings': 'Export & Einstellungen',
          'Start writing or edit the article content...': 'Beginnen Sie zu schreiben oder bearbeiten Sie den Artikelinhalt...',
          'Select an article to edit': 'Wählen Sie einen Artikel zum Bearbeiten aus',
          'or manage project settings and export options.': 'oder verwalten Sie Projekteinstellungen und Exportoptionen.',
          'Export Project': 'Projekt exportieren',
          'Export as a Microsoft Word document, best for professional reports.': 'Als Microsoft Word-Dokument exportieren, am besten für professionelle Berichte.',
          'Export as a plain text Markdown file, ideal for web or developers.': 'Als reine Text-Markdown-Datei exportieren, ideal für Web oder Entwickler.',
          'Export project data as a JSON file, useful for backups or integration.': 'Projektdaten als JSON-Datei exportieren, nützlich für Backups oder Integration.',
          'Export as an OpenDocument Text file for use in LibreOffice, etc.': 'Als OpenDocument Text-Datei für die Verwendung in LibreOffice usw. exportieren.',

          // Help View
          'Help & Getting Started': 'Hilfe & Erste Schritte',
          'help_library_title': 'Die Bibliotheksansicht',
          'help_library_content': 'Dies ist Ihr Portal zu Wikipedia. Suchen Sie nach Artikeln, erhalten Sie sofort KI-gestützte Einblicke und fügen Sie Quellen zum Artikel-Importer oder direkt zu Ihrer aktiven Kompilation hinzu. Verwenden Sie die Sortieroptionen, um Ergebnisse nach Relevanz, Datum oder Titel zu organisieren.',
          'help_compiler_title': 'Die Compiler-Ansicht',
          'help_compiler_content': 'Das ist Ihre Werkstatt. Das linke Panel enthält Ihre Projektnotizen und die Liste der Artikel in Ihrer Kompilation, die Sie per Drag-and-Drop neu anordnen können. Das rechte Panel ermöglicht es Ihnen, Artikelinhalte mit einem robusten Rich-Text-Editor (und seinem schwebenden KI-Menü) zu bearbeiten oder Exportoptionen zu verwalten.',
          'help_archive_title': 'Die Archivansicht',
          'help_archive_content': 'Jeder Artikel, den Sie öffnen, wird automatisch in Ihrem privaten, offline verfügbaren Archiv gespeichert. Dies wird zu Ihrer persönlichen Wissensdatenbank, vollständig durchsuchbar und immer verfügbar. Sie können Artikel aus dem Archiv wieder zu jeder Projektkompilation hinzufügen.',
          'help_importers_title': 'Die Importer (Artikel & Bild)',
          'help_importers_content': 'Artikel und Bilder, die Sie importieren, werden zuerst in einen "Staging-Bereich" gesendet. Dies gibt Ihnen die Möglichkeit, Details zu überprüfen, zu bearbeiten (bei Bildern) und bewusst zu entscheiden, was Sie Ihrer permanenten Bibliothek oder Ihrem Projekt hinzufügen, um Unordnung zu vermeiden.',
          'help_command_palette_title': 'Befehlspalette',
          'help_command_palette_content': 'Drücken Sie Strg+K (oder Cmd+K auf dem Mac), um die Befehlspalette zu öffnen. Dies ist der schnellste Weg, um zwischen Ansichten zu navigieren, Projekte zu erstellen und auf andere wichtige Funktionen zuzugreifen, ohne die Tastatur zu verlassen.',
          'help_settings_title': 'Die Einstellungsansicht',
          'help_settings_content': 'Passen Sie die Sprache der Anwendung, die Standardansicht, die Einstellungen des KI-Assistenten und die Zitationsstile an. Sie können auch Ihre Daten verwalten, indem Sie den Cache leeren oder Ihren gesamten Arbeitsbereich über die Registerkarte "Speicher" sichern/wiederherstellen.',
          'help_power_tips_title': 'Power-Tipps',
          'help_power_tips_content': 'Verwenden Sie die schwebende Funkel-Schaltfläche im Compiler, um KI-Unterstützung für Ihren Text zu erhalten.\nVerwenden Sie die Tastatur, um Artikel im Compiler schnell neu anzuordnen (Strg/Cmd + Pfeil nach oben/unten).\nSichern Sie Ihren gesamten Arbeitsbereich regelmäßig über Einstellungen > Speicher, um Ihre Arbeit zu schützen.',

          // Settings View
          'General': 'Allgemein',
          'Citations': 'Zitate',
          'Storage': 'Speicher',
          'About': 'Über',
          'Language': 'Sprache',
          'Choose the application\'s display language.': 'Wählen Sie die Anzeigesprache der Anwendung.',
          'Default View on Startup': 'Standardansicht beim Start',
          'Choose which view the application opens to on startup.': 'Wählen Sie aus, welche Ansicht die Anwendung beim Start öffnet.',
          'Library Settings': 'Bibliothekseinstellungen',
          'Search Result Limit': 'Limit für Suchergebnisse',
          'Set the maximum number of results to return for a Wikipedia search.': 'Legen Sie die maximale Anzahl der Ergebnisse fest, die für eine Wikipedia-Suche zurückgegeben werden.',
          'AI Assistant': 'KI-Assistent',
          'Enable AI-powered summaries, key concept extraction, and research questions for articles.': 'Aktivieren Sie KI-gestützte Zusammenfassungen, die Extraktion von Schlüsselkonzepten und Forschungsfragen für Artikel.',
          'Enable AI Research Assistant': 'KI-Forschungsassistenten aktivieren',
          'AI System Instruction': 'KI-Systemanweisung',
          'Provide specific instructions to the AI to tailor its analysis style (e.g., "focus on economic impacts").': 'Geben Sie der KI spezifische Anweisungen, um ihren Analysestil anzupassen (z. B. "Fokus auf wirtschaftliche Auswirkungen").',
          'e.g., "Analyze from the perspective of a historian."': 'z. B. "Analysiere aus der Perspektive eines Historikers."',
          'AI Analysis Focus': 'Fokus der KI-Analyse',
          'Choose which insights to generate. At least one must be selected.': 'Wählen Sie aus, welche Einblicke generiert werden sollen. Mindestens eine muss ausgewählt sein.',
          'Summary': 'Zusammenfassung',
          'Key Concepts': 'Schlüsselkonzepte',
          'Questions to Explore': 'Fragen zum Erforschen',
          'Default Bibliography Style': 'Standard-Bibliografiestil',
          'Choose the citation format for generated bibliographies.': 'Wählen Sie das Zitationsformat für generierte Bibliografien.',
          'Custom Citations': 'Benutzerdefinierte Zitate',
          'Manage your custom sources for bibliographies. These can be inserted into articles in the Compiler view.': 'Verwalten Sie Ihre benutzerdefinierten Quellen für Bibliografien. Diese können in der Compiler-Ansicht in Artikel eingefügt werden.',
          'Citation Key': 'Zitat-Schlüssel',
          'Unique identifier (e.g., Smith2023).': 'Eindeutiger Bezeichner (z. B. Schmidt2023).',
          'Author': 'Autor',
          'Year': 'Jahr',
          'Title': 'Titel',
          'URL': 'URL',
          'Add Citation': 'Zitat hinzufügen',
          'Key must be unique.': 'Schlüssel muss eindeutig sein.',
          'Data & Storage': 'Daten & Speicher',
          'Cache Usage': 'Cache-Nutzung',
          '{{count}} articles cached, using': '{{count}} Artikel zwischengespeichert, verbraucht',
          'Clear Article Cache': 'Artikel-Cache leeren',
          'Are you sure you want to clear the cache?': 'Sind Sie sicher, dass Sie den Cache leeren möchten?',
          'Cache cleared successfully!': 'Cache erfolgreich geleert!',
          'Export All Data': 'Alle Daten exportieren',
          'Save a backup of all your projects, cached articles, and settings to a JSON file.': 'Speichern Sie eine Sicherungskopie all Ihrer Projekte, zwischengespeicherten Artikel und Einstellungen in einer JSON-Datei.',
          'Export...': 'Exportieren...',
          'Export failed.': 'Export fehlgeschlagen.',
          'Import Data': 'Daten importieren',
          'Restore your application from a backup file. WARNING: This will overwrite all current projects, articles, and settings.': 'Stellen Sie Ihre Anwendung aus einer Sicherungsdatei wieder her. WARNUNG: Dies überschreibt alle aktuellen Projekte, Artikel und Einstellungen.',
          'Import...': 'Importieren...',
          'Importing data will overwrite all current projects and settings. Are you sure you want to continue?': 'Das Importieren von Daten überschreibt alle aktuellen Projekte und Einstellungen. Sind Sie sicher, dass Sie fortfahren möchten?',
          'Import successful! The app will now reload.': 'Import erfolgreich! Die App wird jetzt neu geladen.',
          'Import failed. Please check the file format.': 'Import fehlgeschlagen. Bitte überprüfen Sie das Dateiformat.',
          'About Wiki Compiler': 'Über Wiki Compiler',
          'about_p1': 'Wiki Compiler ist eine Premium-Wissensmanagement- und Forschungsumgebung, die entwickelt wurde, um Wissen aus Wikipedia zu kuratieren, anzupassen und zu kompilieren.',
          'about_p2': 'Verwandeln Sie passives Lesen in einen aktiven, kreativen Akt der Wissenszusammenstellung. Diese Anwendung soll Studenten, Forschern und lebenslang Lernenden ermöglichen, Wissen effektiver aufzubauen und zu teilen.',
          'about_ai_title': 'Erstellt mit Google AI Studio',
          'about_ai_p1': 'Die KI-Funktionen in dieser Anwendung werden vom Gemini-Modell von Google unterstützt.',
          'about_ai_p2': 'Diese Anwendung wurde mit Google AI Studio entwickelt, einer webbasierten IDE, die es Entwicklern ermöglicht, generative KI-Anwendungen schnell zu prototypisieren und zu erstellen.',
          'Version': 'Version',
          'Learn more about AI Studio': 'Erfahren Sie mehr über AI Studio',

          // AI & Editor
          'AI Research Assistant': 'KI-Forschungsassistent',
          'Thinking...': 'Denke...',
          'Invalid or missing API Key for Gemini. Please check your configuration.': 'Ungültiger oder fehlender API-Schlüssel für Gemini. Bitte überprüfen Sie Ihre Konfiguration.',
          'Est. Reading Time': 'Gesch. Lesezeit',
          'min read': 'Min. Lesezeit',
          'Quick Summary': 'Kurzzusammenfassung',
          'Edit with AI': 'Mit KI bearbeiten',
          'Editing...': 'Bearbeite...',
          'Run Edit': 'Bearbeitung ausführen',
          'Your Instruction': 'Ihre Anweisung',
          'e.g., "Make this paragraph more concise."': 'z.B. "Fasse diesen Absatz kürzer."',
          'Tip: Press Ctrl+Enter to run.': 'Tipp: Drücken Sie Strg+Enter zum Ausführen.',
          'Quick Actions': 'Schnellaktionen',
          'Improve Writing': 'Schreibstil verbessern',
          'Summarize': 'Zusammenfassen',
          'Fix Spelling & Grammar': 'Rechtschreibung & Grammatik korrigieren',
          'Change Tone to Academic': 'Ton zu akademisch ändern',
          'Bold': 'Fett',
          'Italic': 'Kursiv',
          
          // Generic
          'Cancel': 'Abbrechen',
          'Close': 'Schließen',
          'Delete': 'Löschen',
          'Save': 'Speichern',
          'New Compilation': 'Neue Kompilation',
          'You cannot delete the last project.': 'Sie können das letzte Projekt nicht löschen.',
          'Delete Project Confirmation': 'Möchten Sie dieses Projekt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        },
      },
    },
  });

export default i18next;
```