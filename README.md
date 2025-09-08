# Wiki Compiler

*A premium knowledge management and research environment to curate, customize, and compile knowledge from Wikipedia.*

Transform passive reading into an active, creative act of knowledge assembly. Wiki Compiler is your dedicated space to research topics, collect articles, gain AI-powered insights, and publish beautifully formatted documents for study, presentation, or distribution.

---

## Core Philosophy

In the age of information overload, Wiki Compiler offers a focused sanctuary for deep work. By combining a powerful Wikipedia client with a project-based compiler, it streamlines the entire workflow from research to publication. Our goal is to empower students, researchers, and lifelong learners to build and share knowledge more effectively.

---

## Key Features

### 🧠 Knowledge Curation & Management
*   **Project-Based Organization**: Group related articles into "Compilations" to structure your research projects.
*   **Project Notes**: Each compilation includes a dedicated notes panel, perfect for jotting down ideas, creating an outline, or keeping a research diary.
*   **Powerful Search**: Instantly search and browse Wikipedia articles with advanced sorting options.
*   **Offline Article Archive**: Every article you view is automatically cached locally, creating a personal, searchable knowledge base that works anytime, anywhere.
*   **Direct Content Editing**: Modify article text directly within the compiler to tailor content for your specific project. Changes are saved on a per-project basis.

### ✨ AI-Powered Research Assistant
*   **Instant Insights**: Leverage Google's Gemini API to get an intelligent breakdown of any article.
*   **AI Content Editor**: Directly edit article text with AI. Select text (or the whole article) and prompt the AI to summarize, rephrase, check for clarity, or perform custom edits.
*   **Focused Analysis**: Choose to generate a summary, key concepts, research questions, or any combination in the settings to fine-tune the AI output.
*   **Key Concepts**: Automatically identify and explain important terms, people, and places.
*   **Research Springboard**: Uncover potential research questions to guide your study and exploration.

### 📚 Professional Publishing & Export
*   **Advanced Citation Management**: Add, manage, and insert custom external sources (books, websites, etc.) as in-text citations within your articles.
*   **Customizable PDF Exports**: Create polished PDF documents from your compilations with extensive formatting controls.
    *   **Layout**: A4/Letter paper sizes, single or two-column layouts.
    *   **Typography**: Modern (sans-serif) & classic (serif) font pairings with adjustable base font size and line spacing.
    *   **Page Setup**: Fine-tune margins and add custom headers and footers (page numbers, titles, etc.).
*   **Automatic Bibliography**: Automatically generate a formatted bibliography in **APA** or **MLA** style, including both Wikipedia articles and your custom citations.
*   **Markdown Export**: Export your entire compilation as a clean, portable single Markdown file, complete with links back to the original source articles.

### 🎨 Personalized & Efficient Workflow
*   **Focused Dark Mode**: A beautiful dark mode for focused, late-night research sessions.
*   **Multilingual Support**: Switch between English and German for a localized experience.
*   **Accent Colors**: Personalize the UI with your preferred highlight color.
*   **Command Palette**: A keyboard-driven interface (**Ctrl/Cmd + K**) to instantly navigate views and execute commands.
*   **Data Portability**: Backup and restore your entire workspace (projects, articles, settings) with a simple JSON import/export.

---

## Tech Stack

This application is built with a modern, client-centric tech stack designed for performance, offline capability, and a rich user experience.

*   **Framework**: **React with TypeScript** for a robust, type-safe, and component-based UI.
*   **Styling**: **Tailwind CSS** (via CDN) for rapid, utility-first styling, enabling a consistent and modern design system.
*   **Client-Side Storage**: **IndexedDB** (using the `idb` library) provides a large, asynchronous, and persistent local database. This is crucial for the offline article archive, project storage, and user settings, offering significantly more capacity and performance than `localStorage`.
*   **AI Integration**: **Google Gemini API** (`@google/genai`) is the core of the AI Research Assistant, providing powerful generative capabilities for content summarization, concept extraction, and question generation.
*   **PDF Generation**: **`html2pdf.js`** runs on the client to convert the compiled HTML content into a downloadable PDF, allowing for complex layouts and customization without server-side processing.
*   **HTML to Markdown**: **`turndown`** is used to convert the rich HTML content from Wikipedia articles into clean, readable Markdown for export.
*   **Internationalization**: **`i18next`** and **`react-i18next`** are used to provide full localization support, making the application accessible to a global audience.

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

## Hauptfunktionen

### 🧠 Wissenskuratierung & -management
*   **Projektbasierte Organisation**: Gruppieren Sie zusammengehörige Artikel in "Kompilationen", um Ihre Forschungsprojekte zu strukturieren.
*   **Projektnotizen**: Jede Kompilation enthält ein eigenes Notizfeld, ideal zum Festhalten von Ideen, Erstellen einer Gliederung oder Führen eines Forschungstagebuchs.
*   **Leistungsstarke Suche**: Suchen und durchsuchen Sie Wikipedia-Artikel sofort mit erweiterten Sortieroptionen.
*   **Offline-Artikelarchiv**: Jeder Artikel, den Sie ansehen, wird automatisch lokal zwischengespeichert und schafft so eine persönliche, durchsuchbare Wissensdatenbank, die jederzeit und überall funktioniert.
*   **Direkte Inhaltsbearbeitung**: Ändern Sie den Artikeltext direkt im Compiler, um den Inhalt für Ihr spezifisches Projekt anzupassen. Änderungen werden pro Projekt gespeichert.

### ✨ KI-gestützter Forschungsassistent
*   **Sofortige Einblicke**: Nutzen Sie die Gemini-API von Google, um eine intelligente Aufschlüsselung jedes Artikels zu erhalten.
*   **KI-Inhaltseditor**: Bearbeiten Sie Artikeltexte direkt mit KI. Wählen Sie Text aus (oder den ganzen Artikel) und fordern Sie die KI auf, zusammenzufassen, umzuformulieren, auf Klarheit zu prüfen oder benutzerdefinierte Bearbeitungen durchzuführen.
*   **Gezielte Analyse**: Wählen Sie in den Einstellungen aus, ob Sie eine Zusammenfassung, Schlüsselkonzepte, Forschungsfragen oder eine beliebige Kombination davon generieren möchten, um die KI-Ausgabe zu optimieren.
*   **Schlüsselkonzepte**: Identifizieren und erklären Sie automatisch wichtige Begriffe, Personen und Orte.
*   **Forschungssprungbrett**: Entdecken Sie potenzielle Forschungsfragen, um Ihr Studium und Ihre Erkundung zu leiten.

### 📚 Professionelles Publizieren & Export
*   **Erweitertes Zitatmanagement**: Fügen Sie benutzerdefinierte externe Quellen (Bücher, Websites usw.) hinzu, verwalten Sie sie und fügen Sie sie als In-Text-Zitate in Ihre Artikel ein.
*   **Anpassbare PDF-Exporte**: Erstellen Sie ausgefeilte PDF-Dokumente aus Ihren Kompilationen mit umfangreichen Formatierungssteuerungen.
    *   **Layout**: Papierformate A4/Letter, ein- oder zweispaltige Layouts.
    *   **Typografie**: Moderne (Sans-Serif) & klassische (Serif) Schriftart-Paarungen mit anpassbarer Basisschriftgröße und Zeilenabstand.
    *   **Seiteneinrichtung**: Feinabstimmung der Ränder und Hinzufügen von benutzerdefinierten Kopf- und Fußzeilen (Seitenzahlen, Titel usw.).
*   **Automatische Bibliografie**: Generieren Sie automatisch eine formatierte Bibliografie im **APA**- oder **MLA**-Stil, die sowohl Wikipedia-Artikel als auch Ihre benutzerdefinierten Zitate enthält.
*   **Markdown-Export**: Exportieren Sie Ihre gesamte Kompilation als saubere, portable einzelne Markdown-Datei, komplett mit Links zu den ursprünglichen Quellartikeln.

### 🎨 Personalisierter & effizienter Workflow
*   **Fokussierter Dunkelmodus**: Ein schöner Dunkelmodus für konzentrierte, nächtliche Forschungssitzungen.
*   **Mehrsprachige Unterstützung**: Wechseln Sie zwischen Englisch und Deutsch für eine lokalisierte Erfahrung.
*   **Akzentfarben**: Personalisieren Sie die Benutzeroberfläche mit Ihrer bevorzugten Hervorhebungsfarbe.
*   **Befehlspalette**: Eine tastaturgesteuerte Oberfläche (**Ctrl/Cmd + K**), um sofort zwischen Ansichten zu navigieren und Befehle auszuführen.
*   **Datentransportierbarkeit**: Sichern und Wiederherstellen Sie Ihren gesamten Arbeitsbereich (Projekte, Artikel, Einstellungen) mit einem einfachen JSON-Import/Export.

---

## Technischer Stack

Diese Anwendung wurde mit einem modernen, client-zentrierten Technologie-Stack erstellt, der auf Leistung, Offline-Fähigkeit und eine reichhaltige Benutzererfahrung ausgelegt ist.

*   **Framework**: **React mit TypeScript** für eine robuste, typsichere und komponentenbasierte Benutzeroberfläche.
*   **Styling**: **Tailwind CSS** (über CDN) für schnelles, Utility-First-Styling, das ein konsistentes und modernes Designsystem ermöglicht.
*   **Client-seitiger Speicher**: **IndexedDB** (unter Verwendung der `idb`-Bibliothek) bietet eine große, asynchrone und persistente lokale Datenbank. Dies ist entscheidend für das Offline-Artikelarchiv, die Projektspeicherung und die Benutzereinstellungen und bietet deutlich mehr Kapazität und Leistung als `localStorage`.
*   **KI-Integration**: **Google Gemini API** (`@google/genai`) ist der Kern des KI-Forschungsassistenten und bietet leistungsstarke generative Fähigkeiten zur Inhaltszusammenfassung, Konzeptextraktion und Fragengenerierung.
*   **PDF-Generierung**: **`html2pdf.js`** läuft auf dem Client, um den kompilierten HTML-Inhalt in ein herunterladbares PDF zu konvertieren, was komplexe Layouts und Anpassungen ohne serverseitige Verarbeitung ermöglicht.
*   **HTML zu Markdown**: **`turndown`** wird verwendet, um den reichhaltigen HTML-Inhalt von Wikipedia-Artikeln für den Export in sauberes, lesbares Markdown zu konvertieren.
*   **Internationalisierung**: **`i18next`** und **`react-i18next`** werden verwendet, um vollständige Lokalisierungsunterstützung zu bieten und die Anwendung einem globalen Publikum zugänglich zu machen.

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