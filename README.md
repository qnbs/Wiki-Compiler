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